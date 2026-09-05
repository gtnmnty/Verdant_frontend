"use client";

import React, {useState, type SubmitEvent} from "react";
import {ArrowLeft, ArrowRight} from "lucide-react";
import {Button} from "@/components/ui/button";
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
import {DELIVERY_OPTION_LABELS, type DeliveryOption} from "@/app/(site)/cart/_components/data";
import type {ShippingDetails} from "@/app/(site)/checkout/_components/data";

interface ShippingStepProps {
    value: ShippingDetails;
    onChange: (patch: Partial<ShippingDetails>) => void;
    onContinue: () => void;
    onReturnToCart: () => void;
    wasPrefilled: boolean;
}

type FieldErrors = Partial<Record<keyof ShippingDetails, string>>;

const DELIVERY_OPTIONS = Object.keys(DELIVERY_OPTION_LABELS) as DeliveryOption[];

function validate(details: ShippingDetails): FieldErrors {
    const errors: FieldErrors = {};

    if (!details.firstName.trim()) errors.firstName = "Required";
    if (!details.lastName.trim()) errors.lastName = "Required";
    if (!/^\S+@\S+\.\S+$/.test(details.email)) errors.email = "Enter a valid email";
    if (details.phone.replace(/\D/g, "").length < 7) errors.phone = "Enter a valid phone number";
    if (!details.streetAddress.trim()) errors.streetAddress = "Required";
    if (!details.city.trim()) errors.city = "Required";
    if (!details.postalCode.trim()) errors.postalCode = "Required";
    if (!details.country.trim()) errors.country = "Select a country";

    return errors;
}

export function ShippingStep({
     value,
     onChange,
     onContinue,
     onReturnToCart,
     wasPrefilled,
}: ShippingStepProps) {
    const [errors, setErrors] = useState<FieldErrors>({});

    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        const nextErrors = validate(value);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length === 0) {
            onContinue();
        }
    }

    function field<K extends keyof ShippingDetails>(key: K) {
        return {
            value: value[key] as string,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({[key]: e.target.value} as Partial<ShippingDetails>),
            "aria-invalid": Boolean(errors[key]),
        };
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <h2 className="font-display text-2xl text-on-surface sm:text-3xl">
                Delivery Information
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant">
                Please provide your shipping details to calculate delivery costs.
                {wasPrefilled ? " We've filled in your saved details below." : ""}
            </p>

            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-5
                 sm:grid-cols-2">
                <FormField label="First Name" htmlFor="firstName" error={errors.firstName}>
                    <Input id="firstName" autoComplete="given-name" {...field("firstName")} />
                </FormField>
                <FormField label="Last Name" htmlFor="lastName" error={errors.lastName}>
                    <Input id="lastName" autoComplete="family-name" {...field("lastName")} />
                </FormField>

                <FormField
                    label="Email Address"
                    htmlFor="email"
                    error={errors.email}
                    className="sm:col-span-2"
                >
                    <Input id="email" type="email" autoComplete="email" {...field("email")} />
                </FormField>

                <FormField label="Phone" htmlFor="phone" error={errors.phone} className="sm:col-span-2">
                    <Input id="phone" type="tel" autoComplete="tel" {...field("phone")} />
                </FormField>

                <FormField
                    label="Street Address"
                    htmlFor="streetAddress"
                    error={errors.streetAddress}
                    className="sm:col-span-2"
                >
                    <Input
                        id="streetAddress"
                        autoComplete="street-address"
                        {...field("streetAddress")}
                    />
                </FormField>

                <FormField label="City" htmlFor="city" error={errors.city}>
                    <Input id="city" autoComplete="address-level2" {...field("city")} />
                </FormField>
                <FormField label="Postal Code" htmlFor="postalCode" error={errors.postalCode}>
                    <Input id="postalCode" autoComplete="postal-code" {...field("postalCode")} />
                </FormField>

                <FormField
                    label="Country / Region"
                    htmlFor="country"
                    error={errors.country}
                    className="sm:col-span-2"
                >
                    <Select
                        value={value.country}
                        onValueChange={(v) => onChange({country: v})}
                    >
                        <SelectTrigger id="country" aria-invalid={Boolean(errors.country)}>
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
                </FormField>

                <FormField
                    label="Delivery Option"
                    htmlFor="deliveryOption"
                    className="sm:col-span-2"
                >
                    <Select
                        value={value.deliveryOption}
                        onValueChange={(v) => onChange({deliveryOption: v as DeliveryOption})}
                    >
                        <SelectTrigger id="deliveryOption">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            {DELIVERY_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                    {DELIVERY_OPTION_LABELS[option]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>
            </div>

            <div className="mt-10 flex flex-wrap items-center
                 justify-between gap-4">
                <button
                    type="button"
                    onClick={onReturnToCart}
                    className="flex items-center gap-2 text-xs font-semibold
                                    uppercase tracking-[0.14em]
                                    text-on-surface-variant transition-colors
                                    hover:text-primary"
                >
                    <ArrowLeft className="h-3.5 w-3.5"/>
                    Return to Cart
                </button>

                <Button type="submit" size="lg" className="gap-2 uppercase tracking-[0.14em]">
                    Proceed to Payment
                    <ArrowRight className="h-4 w-4"/>
                </Button>
            </div>
        </form>
    );
}

function FormField({
   label,
   htmlFor,
   error,
   className = "",
   children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={className}>
            <Label
                htmlFor={htmlFor}
                className="text-[10px] font-semibold uppercase
                tracking-[0.18em] text-on-surface-variant"
            >
                {label}
            </Label>
            <div className="mt-2">{children}</div>
            {error ? <p className="mt-1.5 text-xs text-destructive">{error}</p> : null}
        </div>
    );
}
