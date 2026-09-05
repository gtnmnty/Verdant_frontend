import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    STATUS_META,
    formatDateTime,
    type Appointment,
} from "@/app/(site)/appointments/_components/data";

export function RescheduleDialog({
     appointment,
     newDate,
     newTime,
     onDateChange,
     onTimeChange,
     onClose,
     onConfirm,
}: {
    appointment: Appointment | null;
    newDate: string;
    newTime: string;
    onDateChange: (v: string) => void;
    onTimeChange: (v: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={!!appointment} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reschedule Appointment</DialogTitle>
                    <DialogDescription>
                        Choose a new date and time for {appointment?.service}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                    <div>
                        <Label>New Date</Label>
                        <Input
                            type="date"
                            value={newDate}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="mt-1.5"
                        />
                    </div>
                    <div>
                        <Label>New Time</Label>
                        <Input
                            type="time"
                            value={newTime}
                            onChange={(e) => onTimeChange(e.target.value)}
                            className="mt-1.5"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Discard
                    </Button>
                    <Button onClick={onConfirm}>Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function CancelAlertDialog({
    appointment,
    onClose,
    onConfirm,
}: {
    appointment: Appointment | null;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <AlertDialog open={!!appointment} onOpenChange={(o) => !o && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. Your stylist will be notified.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep it</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        Cancel Appointment
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function DetailsDialog({
    appointment,
    onClose,
}: {
    appointment: Appointment | null;
    onClose: () => void;
}) {
    return (
        <Dialog open={!!appointment} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl text-primary">
                        {appointment?.service}
                    </DialogTitle>
                    <DialogDescription>Appointment #{appointment?.id}</DialogDescription>
                </DialogHeader>
                {appointment && (
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                        <Detail label="Stylist" value={appointment.stylist}/>
                        <Detail label="Branch" value={appointment.branch}/>
                        <Detail label="Date & Time" value={formatDateTime(appointment.date)}/>
                        <Detail label="Duration" value={`${appointment.durationMin} min`}/>
                        <Detail label="Price" value={`$${appointment.price.toFixed(2)}`}/>
                        <Detail label="Status" value={STATUS_META[appointment.status].label}/>
                    </dl>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Detail({label, value}: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-[10px] font-semibold
            uppercase tracking-[0.16em]
            text-on-surface-variant">
                {label}
            </dt>
            <dd className="mt-1 text-on-surface">{value}</dd>
        </div>
    );
}
