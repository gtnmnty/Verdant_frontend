"use client";

import {useState, type SubmitEvent, useEffect} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {
    FloatingDateInput,
    FloatingInput,
    FloatingSelect,
    FloatingTextarea,
} from "@/app/(site)/book/_components/FloatingField";
import {BookingSection} from "@/app/(site)/book/_components/BookingSection";
import { useBranches } from "@/hooks/useBranches";
import {TIME_SLOTS} from "@/app/(site)/book/_components/data";
import {Errors, FormState, INITIAL, PROFILE_ME_QUERY, ServiceType} from "@/app/(site)/book/_components/query";
import {gqlRequest} from "@/utils/graphqlClient";
import {useAuth} from "@/context/AuthContext";

const SERVICES_QUERY = `
    query BookableServices {
        services(pageSize: 100) {
            items { id name }
        }
    }
`;

const BOOK_APPOINTMENT_MUTATION = `
    mutation BookAppointment($input: CreateAppointmentInput!) {
        bookAppointment(input: $input) {
            id
            appointmentCode
            status
        }
    }
`;

// "02:00 PM" on "2026-11-05" -> an ISO instant, read in the customer's own time zone.
function toScheduledAt(date: string, time: string): string | null {
    const slot = /^(\d{2}):(\d{2}) (AM|PM)$/.exec(time);
    const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!slot || !day) return null;
    const hours = (Number(slot[1]) % 12) + (slot[3] === "PM" ? 12 : 0);
    const when = new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]), hours, Number(slot[2]));
    return Number.isNaN(when.getTime()) ? null : when.toISOString();
}

export function BookingForm() {
    const {branches, loading: branchesLoading} = useBranches();
    const {loading: authLoading} = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Deep-links ("Book This Service", Journal stories) pass a service name. The options are the salon's real,
    // bookable services (loaded below): a booking needs the service's id, so a name that isn't one of them
    // can't be booked and is simply not preselected.
    const requestedService = searchParams.get("service");
    const [catalog, setCatalog] = useState<{id: string; name: string}[]>([]);
    const [profileCountry, setProfileCountry] = useState("");
    const serviceOptions = catalog.map((c) => c.name);

    const [form, setForm] = useState<FormState>(() => ({
        ...INITIAL,
        service: requestedService ?? INITIAL.service,
    }));
    const [errors, setErrors] = useState<Errors>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        gqlRequest<{services: {items: {id: string; name: string}[]}}>(SERVICES_QUERY)
            .then((res) => {
                if (cancelled) return;
                setCatalog(res.services.items);
                // A deep-linked name that isn't bookable would sit selected but invalid: clear it.
                setForm((f) => res.services.items.some((i) => i.name === f.service) ? f : {...f, service: ""});
            })
            .catch(() => toast.error("Couldn't load our services. Please refresh the page."));
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        // Wait for AuthProvider's initial /auth/refresh check to resolve.
        // Firing this before that finishes means the request goes out with
        // no token yet, even though the user IS logged in — it just hasn't
        // been confirmed/restored into React state yet on a fresh page load.
        if (authLoading) return;
        let cancelled = false

        gqlRequest<{
            me: {
                fullName: string;
                email: string;
                phone: string | null;
                shippingAddress: {
                    line1: string;
                    line2: string | null;
                    city: string;
                    state: string;
                    postal: string;
                    country?: string;
                } | null;
            }
        }>(PROFILE_ME_QUERY)
            .then((res) => {
                if (cancelled || !res) return;
                setProfileCountry(res.me.shippingAddress?.country ?? "");

                setForm((f) => ({
                    ...f,
                    name: f.name || res.me.fullName,
                    email: f.email || res.me.email,
                    phone: f.phone || (res.me.phone ?? ""),

                    address: f.address || (res.me.shippingAddress?.line1 ?? ""),
                    suite: f.suite || (res.me.shippingAddress?.line2 ?? ""),
                    city: f.city || (res.me.shippingAddress?.city ?? ""),
                    postal: f.postal || (res.me.shippingAddress?.postal ?? ""),
                    region: f.region || (res.me.shippingAddress?.state ?? ""),
                }))
            })
            .catch(() => {

            })
        return () => { cancelled = true; };
    }, [authLoading])

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((f) => ({...f, [key]: value}));
        setErrors((e) => ({...e, [key]: undefined}));
    };

    const validate = () => {
        const e: Errors = {};
        if (!form.name.trim()) e.name = "Required";
        if (!/^\+?[\d\s()-]{7,}$/.test(form.phone)) e.phone = "Invalid phone";
        if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
        if (!form.service) e.service = "Select a service";
        if (form.serviceType === "In Salon" && !form.branch) e.branch = "Select a branch";
        if (form.serviceType === "Home") {
            if (!form.address.trim()) e.address = "Required";
            if (!form.city.trim()) e.city = "Required";
            if (!form.postal.trim()) e.postal = "Required";
            if (!form.region.trim()) e.region = "Required";
        }
        if (!form.date) e.date = "Required";
        if (!form.time) e.time = "Required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = async (ev: SubmitEvent) => {
        ev.preventDefault();
        if (!validate()) {
            toast.error("Please complete the highlighted fields.");
            return;
        }

        const service = catalog.find((c) => c.name === form.service);
        const scheduledAt = toScheduledAt(form.date, form.time);
        const branch = branches.find((b) => b.name === form.branch);
        if (!service || !scheduledAt) {
            toast.error("Please choose a service, a date and a time.");
            return;
        }

        const inSalon = form.serviceType === "In Salon";
        setLoading(true);
        try {
            // The booking is made for the signed-in account (name, phone and email above are for the concierge).
            await gqlRequest(BOOK_APPOINTMENT_MUTATION, {
                input: {
                    serviceId: service.id,
                    serviceType: inSalon ? "IN_SALON" : "HOME_SERVICE",
                    branchId: inSalon ? branch?.id : undefined,
                    homeAddress: inSalon ? undefined : {
                        line1: form.address.trim(),
                        line2: form.suite.trim() || undefined,
                        city: form.city.trim(),
                        state: form.region.trim(),
                        postal: form.postal.trim(),
                        country: profileCountry || undefined,
                    },
                    scheduledAt,
                    notes: form.notes.trim() || undefined,
                },
            });
            toast.success("Reservation received — our concierge will be in touch.");
            setForm(INITIAL);
            router.push("/appointments");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "We couldn't book your appointment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="mx-auto mt-12 max-w-3xl space-y-12 pb-16">
            {/* 01 Client */}
            <BookingSection number="01" title="The Client">
                <div className="grid gap-6 sm:grid-cols-2">
                    <FloatingInput
                        label="Full Name"
                        value={form.name}
                        onChange={(v) => set("name", v)}
                        error={errors.name}
                    />
                    <FloatingInput
                        label="Contact Number"
                        type="tel"
                        value={form.phone}
                        onChange={(v) => set("phone", v)}
                        error={errors.phone}
                    />
                    <div className="sm:col-span-2">
                        <FloatingInput
                            label="Email Address"
                            type="email"
                            value={form.email}
                            onChange={(v) => set("email", v)}
                            error={errors.email}
                        />
                    </div>
                </div>
            </BookingSection>

            {/* 02 Service */}
            <BookingSection number="02" title="The Service">
                <div className="grid gap-6 sm:grid-cols-2">
                    <FloatingSelect
                        label="Preferred Service"
                        value={form.service}
                        onChange={(v) => set("service", v)}
                        options={serviceOptions}
                        error={errors.service}
                    />
                    <FloatingSelect
                        label="Service Type"
                        value={form.serviceType}
                        onChange={(v) => set("serviceType", v as ServiceType)}
                        options={["In Salon", "Home"]}
                    />

                    {form.serviceType === "In Salon" ? (
                        <div className="sm:col-span-2">
                            <FloatingSelect
                                label="Preferred Branch"
                                value={form.branch}
                                onChange={(v) => set("branch", v)}
                                options={branchesLoading ? ["Loading…"] : branches.map(b => b.name)}
                                error={errors.branch}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="sm:col-span-2">
                                <FloatingInput
                                    label="Street Address"
                                    value={form.address}
                                    onChange={(v) => set("address", v)}
                                    error={errors.address}
                                />
                            </div>
                            <FloatingInput
                                label="Apartment / Suite (optional)"
                                value={form.suite}
                                onChange={(v) => set("suite", v)}
                            />
                            <FloatingInput
                                label="City"
                                value={form.city}
                                onChange={(v) => set("city", v)}
                                error={errors.city}
                            />
                            <FloatingInput
                                label="Postal Code"
                                value={form.postal}
                                onChange={(v) => set("postal", v)}
                                error={errors.postal}
                            />
                            <FloatingInput
                                label="State / Region"
                                value={form.region}
                                onChange={(v) => set("region", v)}
                                error={errors.region}
                            />
                        </>
                    )}
                </div>
            </BookingSection>

            {/* 03 Preference */}
            <BookingSection number="03" title="Preference">
                <div className="grid gap-6 sm:grid-cols-2">
                    <FloatingDateInput
                        label="Preferred Date"
                        value={form.date}
                        onChange={(v) => set("date", v)}
                        error={errors.date}
                    />
                    <FloatingSelect
                        label="Time of Day"
                        value={form.time}
                        onChange={(v) => set("time", v)}
                        options={TIME_SLOTS}
                        error={errors.time}
                    />
                </div>
            </BookingSection>

            {/* 04 Curation */}
            <BookingSection number="04" title="Curation">
                <FloatingTextarea
                    label="Personalization Notes"
                    value={form.notes}
                    onChange={(v) => set("notes", v)}
                    rows={5}
                />
            </BookingSection>

            <div className="flex flex-col items-center pt-4">
                <Button type="submit" disabled={loading} size="lg" className="px-10">
                    {loading ? "Submitting…" : "Confirm Reservation"}
                </Button>
                <p className="mt-4 text-center
                text-[10px] uppercase
                tracking-[0.2em]
                text-on-surface-variant">
                    A member of our concierge will contact you shortly to finalize details.
                </p>
            </div>
        </form>
    );
}