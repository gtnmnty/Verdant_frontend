"use client";

import {useState, type SubmitEvent} from "react";
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
import {BRANCHES, SERVICES, TIME_SLOTS} from "@/app/(site)/book/_components/data";

type ServiceType = "in-salon" | "home";

interface FormState {
    name: string;
    phone: string;
    email: string;
    service: string;
    serviceType: ServiceType;
    branch: string;
    address: string;
    suite: string;
    city: string;
    postal: string;
    region: string;
    date: string;
    time: string;
    notes: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const INITIAL: FormState = {
    name: "",
    phone: "",
    email: "",
    service: "",
    serviceType: "in-salon",
    branch: "",
    address: "",
    suite: "",
    city: "",
    postal: "",
    region: "",
    date: "",
    time: "",
    notes: "",
};

export function BookingForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Deep-links (e.g. "Book This Service" from a Journal story) can pass a
    // service name that isn't one of the salon's standard offerings — fold it
    // into the options list so it still shows up selected rather than blank.
    const requestedService = searchParams.get("service");
    const serviceOptions =
        requestedService && !SERVICES.includes(requestedService as (typeof SERVICES)[number])
            ? [requestedService, ...SERVICES]
            : SERVICES;

    const [form, setForm] = useState<FormState>(() => ({
        ...INITIAL,
        service: requestedService ?? INITIAL.service,
    }));
    const [errors, setErrors] = useState<Errors>({});
    const [loading, setLoading] = useState(false);

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
        if (form.serviceType === "in-salon" && !form.branch) e.branch = "Select a branch";
        if (form.serviceType === "home") {
            if (!form.address.trim()) e.address = "Required";
            if (!form.city.trim()) e.city = "Required";
            if (!form.postal.trim()) e.postal = "Required";
        }
        if (!form.date) e.date = "Required";
        if (!form.time) e.time = "Required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmit = (ev: SubmitEvent) => {
        ev.preventDefault();
        if (!validate()) {
            toast.error("Please complete the highlighted fields.");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("Reservation received — our concierge will be in touch.");
            setForm(INITIAL);
            router.push("/appointments");
        }, 900);
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
                        options={["in-salon", "home"]}
                    />

                    {form.serviceType === "in-salon" ? (
                        <div className="sm:col-span-2">
                            <FloatingSelect
                                label="Preferred Branch"
                                value={form.branch}
                                onChange={(v) => set("branch", v)}
                                options={BRANCHES}
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
