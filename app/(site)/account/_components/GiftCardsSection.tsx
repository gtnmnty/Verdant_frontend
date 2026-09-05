"use client";

import {useState, type SubmitEvent} from "react";
import {toast} from "sonner";
import {Gift, Plus} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {EmptyBlock, PageIntro, SectionTitle} from "@/app/(site)/account/_components/shared";
import {
    INITIAL_GIFT_CARDS,
    INITIAL_TX,
    type GiftCard,
    type TxRow,
} from "@/app/(site)/account/_components/data";

export function GiftCardsSection() {
    const [cards, setCards] = useState<GiftCard[]>(INITIAL_GIFT_CARDS);
    const [tx, setTx] = useState<TxRow[]>(INITIAL_TX);
    const [redeemOpen, setRedeemOpen] = useState(false);
    const [purchaseOpen, setPurchaseOpen] = useState(false);
    const [redeemCode, setRedeemCode] = useState("");
    const [purchase, setPurchase] = useState({amount: "100", recipient: "", email: "", note: ""});

    const balance = cards.reduce((s, c) => s + c.balance, 0);

    const redeem = (e: SubmitEvent) => {
        e.preventDefault();
        if (!redeemCode.trim()) return;
        const newCard: GiftCard = {
            id: `g-${Date.now()}`,
            code: redeemCode.toUpperCase(),
            balance: 50,
            expires: "Dec 2027",
        };
        setCards((p) => [newCard, ...p]);
        setTx((p) => [
            {id: `t-${Date.now()}`, date: "Today", description: `Redeemed ${newCard.code}`, amount: 50},
            ...p,
        ]);
        setRedeemCode("");
        setRedeemOpen(false);
        toast.success("Gift card redeemed.");
    };

    const buy = (e: SubmitEvent) => {
        e.preventDefault();
        setTx((p) => [
            {
                id: `t-${Date.now()}`,
                date: "Today",
                description: `Purchased for ${purchase.recipient}`,
                amount: Number(purchase.amount),
            },
            ...p,
        ]);
        setPurchase({amount: "100", recipient: "", email: "", note: ""});
        setPurchaseOpen(false);
        toast.success("Gift card sent.");
    };

    return (
        <div className="space-y-10">
            <PageIntro title="Gift Cards" subtitle="Share the Verdant Luxe ritual with someone you love."/>

            <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
                <div className="rounded-2xl bg-primary p-7
                 text-primary-foreground">
                    <p className="text-[10px] font-semibold uppercase
                 tracking-[0.22em] text-champagne-gold">
                        Available Balance
                    </p>
                    <p className="mt-3 font-display
                 text-[clamp(2.5rem,6vw,4rem)] leading-none">
                        ${balance.toFixed(2)}
                    </p>
                    <p className="mt-3 text-sm text-primary-foreground/70">
                        Across {cards.length} active card{cards.length === 1 ? "" : "s"}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Button
                            onClick={() => setRedeemOpen(true)}
                            className="bg-champagne-gold text-primary
                                            hover:bg-champagne-gold/90"
                        >
                            Redeem Gift Card
                        </Button>
                        <Button
                            onClick={() => setPurchaseOpen(true)}
                            variant="outline"
                            className="border-primary-foreground/40 bg-transparent
                                            text-primary-foreground
                                            hover:bg-primary-foreground/10
                                            hover:text-primary-foreground"
                        >
                            Purchase New
                        </Button>
                    </div>
                </div>
                <div className="rounded-2xl border border-blush/50
                 bg-surface-lowest p-7">
                    <h3 className="font-display text-xl text-primary">A Considered Gesture</h3>
                    <p className="mt-3 text-sm leading-relaxed
                 text-on-surface-variant">
                        Beautifully presented, delivered instantly. Choose any amount from $50 to $1,000.
                    </p>
                    <button
                        onClick={() => setPurchaseOpen(true)}
                        className="mt-6 inline-flex items-center gap-2 text-xs
                                        font-semibold uppercase tracking-[0.18em]
                                        text-primary underline underline-offset-[6px]"
                    >
                        <Plus className="h-4 w-4"/> Send a Gift
                    </button>
                </div>
            </div>

            <div>
                <SectionTitle title="Active Gift Cards"/>
                {cards.length === 0 ? (
                    <EmptyBlock icon={Gift} title="No active cards" body="Redeem or purchase to begin."/>
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-2">
                        {cards.map((c) => (
                            <li key={c.id} className="rounded-2xl border border-blush/50
                 bg-surface-lowest p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <p className="font-display text-xl text-primary">${c.balance.toFixed(2)}</p>
                                    <Badge className="bg-blush/40 text-primary hover:bg-blush/40">Active</Badge>
                                </div>
                                <p className="mt-3 font-mono text-xs uppercase
                 tracking-[0.18em] text-on-surface-variant">
                                    {c.code}
                                </p>
                                <p className="mt-1 text-xs text-on-surface-variant">Expires {c.expires}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <SectionTitle title="Transaction History"/>
                <div className="overflow-hidden rounded-2xl border
                 border-blush/50">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-blush/10 text-[10px] uppercase
                 tracking-[0.18em] text-on-surface-variant">
                        <tr>
                            {["Date", "Description", "Amount"].map((h) => (
                                <th key={h} className="px-5 py-3">
                                    {h}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {tx.map((t) => (
                            <tr key={t.id} className="border-t border-blush/40">
                                <td className="px-5 py-4 text-on-surface-variant">{t.date}</td>
                                <td className="px-5 py-4">{t.description}</td>
                                <td
                                    className={`px-5 py-4 font-medium ${
                                        t.amount > 0 ? "text-emerald-700" : "text-on-surface"
                                    }`}
                                >
                                    {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={redeemOpen} onOpenChange={setRedeemOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Redeem Gift Card</DialogTitle>
                        <DialogDescription>Enter the code from your gift card.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={redeem} className="grid gap-4">
                        <div className="grid gap-1.5">
                            <Label>Code</Label>
                            <Input
                                value={redeemCode}
                                onChange={(e) => setRedeemCode(e.target.value)}
                                placeholder="VLX-XXXX-XXXX"
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setRedeemOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Redeem</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={purchaseOpen} onOpenChange={setPurchaseOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Purchase Gift Card</DialogTitle>
                        <DialogDescription>Delivered instantly via email.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={buy} className="grid gap-4">
                        <div className="grid gap-1.5">
                            <Label>Amount (USD)</Label>
                            <Select
                                value={purchase.amount}
                                onValueChange={(v) => setPurchase({...purchase, amount: v})}
                            >
                                <SelectTrigger>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    {["50", "100", "250", "500", "1000"].map((v) => (
                                        <SelectItem key={v} value={v}>
                                            ${v}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Recipient Name</Label>
                            <Input
                                required
                                value={purchase.recipient}
                                onChange={(e) => setPurchase({...purchase, recipient: e.target.value})}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Recipient Email</Label>
                            <Input
                                type="email"
                                required
                                value={purchase.email}
                                onChange={(e) => setPurchase({...purchase, email: e.target.value})}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Note (optional)</Label>
                            <Textarea
                                rows={3}
                                value={purchase.note}
                                onChange={(e) => setPurchase({...purchase, note: e.target.value})}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setPurchaseOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Send Gift</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
