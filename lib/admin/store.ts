"use client";

import {useState} from "react";
import type {
    Account,
    Appointment,
    Branch,
    Order,
    PageRecord,
    Product,
    Review,
    Service,
    Stylist,
} from "@/lib/admin/types";

// This file was imported everywhere via `@/lib/admin/store` but never
// existed in the repo, so the entire /admin section failed to build. This
// is a minimal stub that keeps every not-yet-connected admin page from
// crashing by returning empty, purely client-side state (nothing here
// persists or talks to the backend). As each admin route gets wired up
// (like `branches` now), it should stop reading from here entirely and
// fetch/mutate real data directly via gqlRequest, the same way
// BranchesContent/BranchFormDialog/BranchDetailContent now do.
export function useAdmin() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [stylists, setStylists] = useState<Stylist[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [pages, setPages] = useState<PageRecord[]>([]);

    const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

    return {
        branches, setBranches,
        stylists, setStylists,
        products, setProducts,
        services, setServices,
        orders, setOrders,
        accounts, setAccounts,
        reviews, setReviews,
        appointments, setAppointments,
        pages, setPages,
        uid,
    };
}
