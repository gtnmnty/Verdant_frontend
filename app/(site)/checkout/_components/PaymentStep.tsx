"use client";

import React, {useState, type SubmitEvent} from "react";
import {ArrowLeft, ArrowRight, Lock} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {COUNTRY_OPTIONS} from "@/app/(site)/checkout/_components/data";
import type {BillingAddress, PaymentSummary} from "@/app/(site)/checkout/_components/data";

interface PaymentStepProps {
    defaultCardholderName: string;
    onContinue: (summary: PaymentSummary) => void;
    onBack: () => void;
}

interface RawPaymentForm {
    cardholderName: string;
    cardNumber: string;
    expiry: string;
    cvc: string;
    billingSameAsShipping: boolean;
    billingAddress: BillingAddress;
}

type FieldErrors = Partial<Record<keyof RawPaymentForm, string>>;

function formatCardNumber(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 19);
    return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    if (digits.length < 3) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function detectBrand(digits: string): PaymentSummary["brand"] {
    if (digits.startsWith("4")) return "Visa";
    if (/^5[1-5]/.test(digits)) return "Mastercard";
    if (/^3[47]/.test(digits)) return "Amex";
    return "Card";
}

export function PaymentStep({
    defaultCardholderName,
    onContinue,
    onBack,
}: PaymentStepProps) {
    const [form, setForm] = useState<RawPaymentForm>({
        cardholderName: defaultCardholderName,
        cardNumber: "",
        expiry: "",
        cvc: "",
        billingSameAsShipping: true,
        billingAddress: {streetAddress: "", city: "", postalCode: "", country: ""},
    });
    const [errors, setErrors] = useState<FieldErrors>({});

    function validate(): FieldErrors {
        const digits = form.cardNumber.replace(/\D/g, "");
        const next: FieldErrors = {};

        if (!form.cardholderName.trim()) next.cardholderName = "Required";
        if (digits.length < 13 || digits.length > 19) next.cardNumber = "Enter a valid card number";
        if (!/^\d{2}\/\d{2}$/.test(form.expiry)) next.expiry = "MM/YY";
        if (!/^\d{3,4}$/.test(form.cvc)) next.cvc = "Invalid";

        if (!form.billingSameAsShipping) {
            if (!form.billingAddress.streetAddress.trim())
                next.billingAddress = "Complete the billing address";
            else if (!form.billingAddress.city.trim())
                next.billingAddress = "Complete the billing address";
            else if (!form.billingAddress.postalCode.trim())
                next.billingAddress = "Complete the billing address";
            else if (!form.billingAddress.country.trim())
                next.billingAddress = "Complete the billing address";
        }

        return next;
    }

    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        const digits = form.cardNumber.replace(/\D/g, "");
        // Only a masked, non-reversible summary leaves this component — the PAN,
        // expiry, and CVC are discarded here rather than lifted into page state.
        onContinue({
            cardholderName: form.cardholderName,
            brand: detectBrand(digits),
            last4: digits.slice(-4),
            billingSameAsShipping: form.billingSameAsShipping,
            billingAddress: form.billingSameAsShipping ? null : form.billingAddress,
        });
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <h2 className="font-display text-2xl text-on-surface sm:text-3xl">
                Payment Details
            </h2>
            <p className="mt-2 flex items-center gap-1.5 text-sm
                 text-on-surface-variant">
                <Lock className="h-3.5 w-3.5 text-champagne-gold"/>
                Payments are encrypted and processed securely via Stripe. Card
                details are never stored on our servers.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-5
                 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <FieldLabel htmlFor="cardholderName">Name on Card</FieldLabel>
                    <Input
                        id="cardholderName"
                        autoComplete="cc-name"
                        value={form.cardholderName}
                        onChange={(e) =>
                            setForm((prev) => ({...prev, cardholderName: e.target.value}))
                        }
                        aria-invalid={Boolean(errors.cardholderName)}
                    />
                    {errors.cardholderName ? (
                        <FieldError>{errors.cardholderName}</FieldError>
                    ) : null}
                </div>

                <div className="sm:col-span-2">
                    <FieldLabel htmlFor="cardNumber">Card Number</FieldLabel>
                    <Input
                        id="cardNumber"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="0000 0000 0000 0000"
                        value={form.cardNumber}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                cardNumber: formatCardNumber(e.target.value),
                            }))
                        }
                        aria-invalid={Boolean(errors.cardNumber)}
                    />
                    {errors.cardNumber ? <FieldError>{errors.cardNumber}</FieldError> : null}
                </div>

                <div>
                    <FieldLabel htmlFor="expiry">Expiry (MM/YY)</FieldLabel>
                    <Input
                        id="expiry"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="MM/YY"
                        value={form.expiry}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                expiry: formatExpiry(e.target.value),
                            }))
                        }
                        aria-invalid={Boolean(errors.expiry)}
                    />
                    {errors.expiry ? <FieldError>{errors.expiry}</FieldError> : null}
                </div>

                <div>
                    <FieldLabel htmlFor="cvc">Security Code</FieldLabel>
                    <Input
                        id="cvc"
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="CVC"
                        maxLength={4}
                        value={form.cvc}
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                cvc: e.target.value.replace(/\D/g, "").slice(0, 4),
                            }))
                        }
                        aria-invalid={Boolean(errors.cvc)}
                    />
                    {errors.cvc ? <FieldError>{errors.cvc}</FieldError> : null}
                </div>
            </div>

            <label className="mt-6 flex items-center gap-2.5">
                <Checkbox
                    checked={form.billingSameAsShipping}
                    onCheckedChange={(checked: boolean | "indeterminate") =>
                        setForm((prev) => ({
                            ...prev,
                            billingSameAsShipping: checked === true,
                        }))
                    }
                />
                <span className="text-sm text-on-surface">
          Billing address is the same as shipping
        </span>
            </label>

            {!form.billingSameAsShipping ? (
                <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5
                 rounded-lg bg-surface-low p-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <FieldLabel htmlFor="billingStreet">Billing Street Address</FieldLabel>
                        <Input
                            id="billingStreet"
                            value={form.billingAddress.streetAddress}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    billingAddress: {
                                        ...prev.billingAddress,
                                        streetAddress: e.target.value,
                                    },
                                }))
                            }
                        />
                    </div>
                    <div>
                        <FieldLabel htmlFor="billingCity">City</FieldLabel>
                        <Input
                            id="billingCity"
                            value={form.billingAddress.city}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    billingAddress: {...prev.billingAddress, city: e.target.value},
                                }))
                            }
                        />
                    </div>
                    <div>
                        <FieldLabel htmlFor="billingPostal">Postal Code</FieldLabel>
                        <Input
                            id="billingPostal"
                            value={form.billingAddress.postalCode}
                            onChange={(e) =>
                                setForm((prev) => ({
                                    ...prev,
                                    billingAddress: {
                                        ...prev.billingAddress,
                                        postalCode: e.target.value,
                                    },
                                }))
                            }
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <FieldLabel htmlFor="billingCountry">Country / Region</FieldLabel>
                        <Select
                            value={form.billingAddress.country}
                            onValueChange={(v) =>
                                setForm((prev) => ({
                                    ...prev,
                                    billingAddress: {...prev.billingAddress, country: v},
                                }))
                            }
                        >
                            <SelectTrigger id="billingCountry">
                                <SelectValue placeholder="Select country"/>
                            </SelectTrigger>
                            <SelectContent>
                                {COUNTRY_OPTIONS.map((country) => (
                                    <SelectItem key={country} value={country}>
                                        {country}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {errors.billingAddress ? (
                        <div className="sm:col-span-2">
                            <FieldError>{errors.billingAddress}</FieldError>
                        </div>
                    ) : null}
                </div>
            ) : null}

            <div className="mt-10 flex flex-wrap items-center
                 justify-between gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-2 text-xs font-semibold
                                    uppercase tracking-[0.14em]
                                    text-on-surface-variant transition-colors
                                    hover:text-primary"
                >
                    <ArrowLeft className="h-3.5 w-3.5"/>
                    Return to Shipping
                </button>

                <Button type="submit" size="lg" className="gap-2 uppercase tracking-[0.14em]">
                    Proceed to Review
                    <ArrowRight className="h-4 w-4"/>
                </Button>
            </div>
        </form>
    );
}

function FieldLabel({
    htmlFor,
    children,
}: {
    htmlFor: string;
    children: React.ReactNode;
}) {
    return (
        <Label
            htmlFor={htmlFor}
            className="text-[10px] font-semibold uppercase
                            tracking-[0.18em] text-on-surface-variant"
        >
            {children}
        </Label>
    );
}

function FieldError({children}: { children: React.ReactNode }) {
    return <p className="mt-1.5 text-xs text-destructive">{children}</p>;
}
