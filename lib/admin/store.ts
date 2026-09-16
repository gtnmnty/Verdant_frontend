"use client";

import {
    createContext,
    createElement,
    useContext,
    useState,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
} from "react";
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

interface AdminState {
    branches: Branch[]; setBranches: Dispatch<SetStateAction<Branch[]>>;
    stylists: Stylist[]; setStylists: Dispatch<SetStateAction<Stylist[]>>;
    products: Product[]; setProducts: Dispatch<SetStateAction<Product[]>>;
    services: Service[]; setServices: Dispatch<SetStateAction<Service[]>>;
    orders: Order[]; setOrders: Dispatch<SetStateAction<Order[]>>;
    accounts: Account[]; setAccounts: Dispatch<SetStateAction<Account[]>>;
    reviews: Review[]; setReviews: Dispatch<SetStateAction<Review[]>>;
    appointments: Appointment[]; setAppointments: Dispatch<SetStateAction<Appointment[]>>;
    pages: PageRecord[]; setPages: Dispatch<SetStateAction<PageRecord[]>>;
    uid: (prefix: string) => string;
}

const AdminContext = createContext<AdminState | null>(null);

// NOTE: this is still a client-only placeholder store — nothing here
// persists or talks to the backend. It only fixes state SHARING across
// /admin components (previously every useAdmin() call created its own
// isolated useState, so edits in one component were invisible to others).
// As each route gets wired up (like `branches`), it should stop reading
// from here and fetch/mutate real data directly via gqlRequest instead.
export function AdminProvider({ children }: { children: ReactNode }) {
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

    const value: AdminState = {
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

    return createElement(AdminContext.Provider, { value }, children);
}

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) {
        throw new Error("useAdmin must be used inside <AdminProvider>");
    }
    return ctx;
}
