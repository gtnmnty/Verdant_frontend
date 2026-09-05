import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import type {OrderItem} from "@/app/(site)/orders/_components/data";

export function ReviewDialog({
     item,
     rating,
     onRatingChange,
     text,
     onTextChange,
     onClose,
     onSubmit,
}: {
    item: OrderItem | null;
    rating: number;
    onRatingChange: (n: number) => void;
    text: string;
    onTextChange: (v: string) => void;
    onClose: () => void;
    onSubmit: () => void;
}) {
    return (
        <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                    <DialogDescription>{item?.name}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Rating</Label>
                        <div className="mt-2 flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => onRatingChange(s)}
                                    aria-label={`${s} stars`}
                                    className={`text-2xl transition-colors ${
                                        s <= rating ? "text-champagne-gold" : "text-on-surface-variant/40"
                                    }`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label>Your thoughts</Label>
                        <Textarea
                            value={text}
                            onChange={(e) => onTextChange(e.target.value)}
                            rows={4}
                            placeholder="Share your experience…"
                            className="mt-2"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit}>Submit</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
