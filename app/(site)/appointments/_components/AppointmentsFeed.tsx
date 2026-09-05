"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {ChevronRight, History, Search} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {gqlRequest} from "@/utils/graphqlClient";
import {AppointmentCard} from "@/app/(site)/appointments/_components/AppointmentCard";
import {
    AppointmentsSidebar,
    type FilterKey,
    type SortKey,
} from "@/app/(site)/appointments/_components/AppointmentsSidebar";
import {
    CancelAlertDialog,
    DetailsDialog,
    RescheduleDialog,
} from "@/app/(site)/appointments/_components/AppointmentDialogs";
import type {Appointment} from "@/app/(site)/appointments/_components/data";

const PER_PAGE = 4;
const FALLBACK_IMAGE = "https://picsum.photos/seed/appointment/400/400";

interface BackendAppointment {
    id: string;
    serviceName: string;
    priceSnapshot: number;
    stylist: {name: string} | null;
    branch: string | null;
    scheduledAt: string;
    durationMinutes: number;
    status: "PENDING" | "UPCOMING" | "COMPLETED" | "CANCELLED";
    service: {primaryImage: {url: string} | null} | null;
}

interface AppointmentPage {
    items: BackendAppointment[];
    totalPages: number;
}

interface StatusCounts {
    all: number;
    pending: number;
    upcoming: number;
    completed: number;
    cancelled: number;
}

const STATUS_TO_BACKEND: Record<FilterKey, string> = {
    all: "ALL",
    pending: "PENDING",
    upcoming: "UPCOMING",
    completed: "COMPLETED",
    cancelled: "CANCELLED",
};

const SORT_TO_BACKEND: Record<SortKey, string> = {
    "date-asc": "DATE_SOONEST",
    "date-desc": "DATE_LATEST",
    "price-asc": "PRICE_LOW_TO_HIGH",
    "price-desc": "PRICE_HIGH_TO_LOW",
};

const MY_APPOINTMENTS_QUERY = `
    query MyAppointments(
        $status: AppointmentClientFilter, 
        $timeframe: AppointmentTimeframe, 
        $search: String, 
        $sort: AppointmentClientSort, 
        $page: Int, 
        $pageSize: Int
    ) {
        myAppointments(
            status: $status, 
            timeframe: $timeframe, 
            search: $search, 
            sort: $sort, 
            page: $page, 
            pageSize: $pageSize
        ) {
            items {
                id
                serviceName
                priceSnapshot
                stylist { name }
                branch
                scheduledAt
                durationMinutes
                status
                service { primaryImage { url } }
            }
            totalPages
        }
    }
`;

const STATUS_COUNTS_QUERY = `
    query AppointmentStatusCounts {
        appointmentStatusCounts { 
            all 
            pending 
            upcoming 
            completed 
            cancelled 
        }
    }
`;

const CANCEL_APPOINTMENT_MUTATION = `
    mutation CancelAppointment($id: ID!) {
        cancelAppointment(id: $id) { id status }
    }
`;

const RESCHEDULE_APPOINTMENT_MUTATION = `
    mutation RescheduleAppointment($id: ID!, $newScheduledAt: DateTime!) {
        rescheduleAppointment(
        id: $id, 
        newScheduledAt: $newScheduledAt) { id status scheduledAt }
    }
`;

function toAppointment(a: BackendAppointment): Appointment {
    return {
        id: a.id,
        service: a.serviceName,
        stylist: a.stylist?.name ?? "Unassigned",
        branch: a.branch ?? "—",
        date: a.scheduledAt,
        durationMin: a.durationMinutes,
        price: a.priceSnapshot,
        status: a.status.toLowerCase() as Appointment["status"],
        image: a.service?.primaryImage?.url ?? FALLBACK_IMAGE,
    };
}

export function AppointmentsFeed() {
    const router = useRouter();
    const [items, setItems] = useState<Appointment[]>([]);
    const [counts, setCounts] = useState<StatusCounts>({
        all: 0, pending: 0, upcoming: 0, completed: 0, cancelled: 0,
    });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterKey>("all");
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState<SortKey>("date-asc");
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const [showHistory, setShowHistory] = useState(false);

    const [reschedule, setReschedule] = useState<Appointment | null>(null);
    const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
    const [details, setDetails] = useState<Appointment | null>(null);
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");

    useEffect(() => {
        gqlRequest<{ appointmentStatusCounts: StatusCounts }>(STATUS_COUNTS_QUERY)
            .then((res) => setCounts(res.appointmentStatusCounts))
            .catch(() => {});
    }, [items]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        gqlRequest<{ myAppointments: AppointmentPage }>(MY_APPOINTMENTS_QUERY, {
            status: STATUS_TO_BACKEND[filter],
            timeframe: showHistory ? "ARCHIVED" : "RECENT",
            search: query.trim() || undefined,
            sort: SORT_TO_BACKEND[sort],
            page,
            pageSize: PER_PAGE,
        })
            .then((res) => {
                if (cancelled) return;
                setItems(res.myAppointments.items.map(toAppointment));
                setPageCount(Math.max(1, res.myAppointments.totalPages));
            })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Failed to load appointments.");
            })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [filter, query, sort, page, showHistory]);

    const confirmCancel = () => {
        if (!cancelTarget) return;
        const target = cancelTarget;
        setCancelTarget(null);

        gqlRequest(CANCEL_APPOINTMENT_MUTATION, {id: target.id})
            .then(() => {
                setItems((arr) => arr.map(
                    (i) => (i.id === target.id ? {...i, status: "cancelled"} : i)));
                toast.success("Appointment cancelled.");
            })
            .catch((err) => {
                toast.error(err instanceof Error ? err.message : "Failed to cancel appointment.");
            });
    };

    const confirmReschedule = () => {
        if (!reschedule || !newDate || !newTime) {
            toast.error("Please choose a date and time.");
            return;
        }
        const target = reschedule;
        const newScheduledAt = new Date(`${newDate}T${newTime}`).toISOString();

        gqlRequest(RESCHEDULE_APPOINTMENT_MUTATION, {id: target.id, newScheduledAt})
            .then(() => {
                setItems((arr) =>
                    arr.map((i) => (
                        i.id === target.id ? {...i, date: newScheduledAt, status: "upcoming"} : i
                    )),
                );
                toast.success("Appointment rescheduled.");
                setReschedule(null);
                setNewDate("");
                setNewTime("");
            })
            .catch((err) => {
                toast.error(err instanceof Error ? err.message : "Failed to reschedule appointment.");
            });
    };

    // Re-booking builds a fresh request rather than duplicating the record —
    // send the person to /book with the service pre-selected.
    const bookAgain = (a: Appointment) => {
        router.push(`/book?service=${encodeURIComponent(a.service)}`);
    };

    return (
        <div className="mx-auto w-[min(90vw,1400px)]">
            {/* Header */}
            <section className="flex flex-col gap-6 pb-8
            md:flex-row md:items-end md:justify-between">
                <div className="min-w-0">
                    <h1 className="font-display
                    text-[clamp(2rem,5vw,3.5rem)]
                    leading-tight tracking-tight
                    text-primary">
                        My Appointments
                    </h1>
                    <p className="mt-3 max-w-xl text-sm text-on-surface-variant">
                        Review and manage your visits. Personalized beauty, tailored to
                        your schedule.
                    </p>
                </div>
                <div className="relative w-full max-w-sm">
                    <Search
                        className="pointer-events-none absolute
                        left-3 top-1/2 h-4 w-4 -translate-y-1/2
                        text-on-surface-variant"/>
                    <Input
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search appointments…"
                        className="border-blush/60 bg-surface-lowest pl-10"
                    />
                </div>
            </section>

            <div className="grid gap-8 pb-16 lg:grid-cols-[260px_1fr]">
                <AppointmentsSidebar
                    filter={filter}
                    onFilterChange={(f) => {
                        setFilter(f);
                        setPage(1);
                    }}
                    counts={counts}
                    sort={sort}
                    onSortChange={setSort}
                />

                <section className="space-y-5">
                    {loading ? (
                        <p className="py-16 text-center text-sm text-on-surface-variant">Loading appointments…</p>
                    ) : items.length === 0 ? (
                        <div
                            className="rounded-2xl border border-dashed border-blush/60 bg-surface-lowest p-12 text-center">
                            <p className="font-display text-2xl text-primary">No appointments</p>
                            <p className="mt-2 text-sm text-on-surface-variant">
                                Try adjusting filters or book a new session.
                            </p>
                            <Button asChild className="mt-5">
                                <Link href="/book">Book Now</Link>
                            </Button>
                        </div>
                    ) : (
                        items.map((a) => (
                            <AppointmentCard
                                key={a.id}
                                appointment={a}
                                onReschedule={() => setReschedule(a)}
                                onCancel={() => setCancelTarget(a)}
                                onBookAgain={() => bookAgain(a)}
                                onViewDetails={() => setDetails(a)}
                            />
                        ))
                    )}

                    {pageCount > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            {Array.from({length: pageCount}).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`h-9 w-9 rounded-full text-sm ${
                                        page === i + 1
                                            ? "bg-primary text-primary-foreground"
                                            : "border border-blush/60 text-primary hover:bg-blush/40"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}

                    {!showHistory && (
                        <div className="rounded-2xl border border-dashed border-blush/60 p-10 text-center">
                            <History className="mx-auto h-6 w-6 text-soft-rose"/>
                            <p className="mt-3 font-display text-2xl text-primary">
                                Looking for past visits?
                            </p>
                            <p className="mt-1 text-sm text-on-surface-variant">
                                Completed and cancelled appointments are archived for your
                                records.
                            </p>
                            <Button
                                onClick={() => { setShowHistory(true); setPage(1); }}
                                variant="ghost"
                                className="mt-4 text-primary"
                            >
                                View History <ChevronRight className="ml-1 h-4 w-4"/>
                            </Button>
                        </div>
                    )}
                </section>
            </div>

            <RescheduleDialog
                appointment={reschedule}
                newDate={newDate}
                newTime={newTime}
                onDateChange={setNewDate}
                onTimeChange={setNewTime}
                onClose={() => setReschedule(null)}
                onConfirm={confirmReschedule}
            />
            <CancelAlertDialog
                appointment={cancelTarget}
                onClose={() => setCancelTarget(null)}
                onConfirm={confirmCancel}
            />
            <DetailsDialog appointment={details} onClose={() => setDetails(null)}/>
        </div>
    );
}