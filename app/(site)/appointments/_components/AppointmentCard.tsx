import Image from "next/image";
import {Calendar, ChevronRight, MapPin} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
    STATUS_META,
    formatDateTime,
    type Appointment,
} from "@/app/(site)/appointments/_components/data";

export function AppointmentCard({
    appointment: a,
    onReschedule,
    onCancel,
    onBookAgain,
    onViewDetails,
}: {
    appointment: Appointment;
    onReschedule: () => void;
    onCancel: () => void;
    onBookAgain: () => void;
    onViewDetails: () => void;
}) {
    return (
        <article
            className={`rounded-2xl border border-blush/50 p-5 sm:p-6 ${
                a.status === "pending" ? "bg-blush/10" : "bg-surface-lowest"
            }`}
        >
            <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-blush/30">
                    <Image
                        src={a.image}
                        alt={a.service}
                        fill
                        sizes="180px"
                        className="object-cover"
                    />
                </div>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <span
                            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${STATUS_META[a.status].chip}`}
                        >
                          {STATUS_META[a.status].label}
                        </span>
                            <span className="text-xs text-on-surface-variant">#{a.id}</span>
                            <span className="ml-auto font-display text-2xl text-primary">
                          ${a.price.toFixed(2)}
                        </span>
                    </div>

                    <h3 className="mt-3 font-display text-[clamp(1.25rem,2vw,1.6rem)] leading-tight text-primary">
                        {a.service}
                    </h3>
                    <p className="mt-1 text-sm text-on-surface-variant">
                        with <span className="text-primary">{a.stylist}</span>
                    </p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                        Duration: {a.durationMin} min
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                                Date &amp; Time
                            </p>
                            <p className="mt-1 flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-soft-rose"/>
                                {formatDateTime(a.date)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                                Location
                            </p>
                            <p className="mt-1 flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-soft-rose"/>
                                {a.branch}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-blush/40 pt-4">
                        {(a.status === "upcoming" || a.status === "pending") && (
                            <>
                                <Button onClick={onReschedule}>
                                    {a.status === "pending" ? "Modify Request" : "Reschedule"}
                                </Button>
                                <Button
                                    onClick={onCancel}
                                    variant="outline"
                                    className="border-primary text-primary
                                    hover:bg-primary
                                    hover:text-primary-foreground"
                                >
                                    {a.status === "pending" ? "Withdraw" : "Cancel Appointment"}
                                </Button>
                            </>
                        )}
                        {(a.status === "completed" || a.status === "cancelled") && (
                            <Button onClick={onBookAgain}>Book Again</Button>
                        )}
                        <button
                            onClick={onViewDetails}
                            className="ml-auto inline-flex items-center
                            gap-1 text-sm font-semibold text-primary
                            hover:underline"
                        >
                            View Details <ChevronRight className="h-4 w-4"/>
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}
