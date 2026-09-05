"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {ChevronLeft} from "lucide-react";
import {toast} from "sonner";
import {gqlRequest} from "@/utils/graphqlClient";
import {ServiceGallery} from "@/app/(site)/services/[id]/_components/ServiceGallery";
import {ServiceInfo, type ServiceInfoData} from "@/app/(site)/services/[id]/_components/ServiceInfo";
import {ServiceTabs} from "@/app/(site)/services/[id]/_components/ServiceTabs";
import {StylistsSection, type StylistData} from "@/app/(site)/services/[id]/_components/StylistsSection";
import {BookingForm} from "@/app/(site)/services/[id]/_components/BookingForm";
import {ServiceReviewsSection} from "@/app/(site)/services/[id]/_components/ServiceReviewsSection";
import {
    RecommendedProductsSection,
    RelatedServicesSection,
} from "@/app/(site)/services/[id]/_components/RelatedAndProducts";
import {ServiceFaqSection} from "@/app/(site)/services/[id]/_components/ServiceFaqSection";

const CATEGORY_LABELS: Record<string, string> = {
    SKIN_CARE: "Skin Care",
    HAIR_CARE: "Hair Care",
    MAKE_UP: "Make Up",
};

interface BackendService {
    id: string;
    name: string;
    subName: string;
    catalog: string;
    price: number;
    durationInMinutes: number;
    description: string | null;
    tags: string[];
    info: string[];
    reviewCount: number;
    averageRating: number;
    images: {url: string}[];
    primaryImage: {url: string} | null;
    stylists: {
        id: string;
        name: string;
        bio: string | null;
        avatarUrl: string | null;
        branch: {name: string} | null;
    }[];
    isFavorited: boolean;
}

const SERVICE_QUERY = `
    query ServiceDetail($id: ID!) {
        service(id: $id) {
            id
            name
            subName
            catalog
            price
            durationInMinutes
            description
            tags
            info
            reviewCount
            averageRating
            images { url }
            primaryImage { url }
            stylists {
                id
                name
                bio
                avatarUrl
                branch { name }
            }
            isFavorited
        }
    }
`;

const ME_QUERY = `
    query Me {
        me { id }
    }
`;

export function ServiceDetailContent({id}: { id: string }) {
    const [qty, setQty] = useState(1);
    const [service, setService] = useState<BackendService | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        gqlRequest<{ service: BackendService | null }>(SERVICE_QUERY, {id})
            .then((res) => {
                if (cancelled) return;
                setService(res.service);
            })
            .catch((err) => {
                if (!cancelled) toast.error(err instanceof Error ? err.message : "Failed to load service.");
            })
            .finally(() => { if (!cancelled) setLoading(false); });

        // Best-effort — used to attribute bookAppointment to the signed-in
        // user. If it fails (e.g. not logged in), booking is disabled.
        gqlRequest<{ me: {id: string} }>(ME_QUERY)
            .then((res) => { if (!cancelled) setUserId(res.me.id); })
            .catch(() => { if (!cancelled) setUserId(null); });

        return () => { cancelled = true; };
    }, [id]);

    if (loading) {
        return <p className="py-24 text-center text-sm text-on-surface-variant">Loading service…</p>;
    }

    if (!service) {
        return (
            <div className="py-24 text-center">
                <p className="font-display text-2xl text-primary">Service not found</p>
                <Link href="/services" className="mt-3 inline-block text-sm text-primary underline">
                    Back to Services
                </Link>
            </div>
        );
    }

    const serviceInfoData: ServiceInfoData = {
        id: service.id,
        name: service.name,
        subName: service.subName,
        categoryLabel: CATEGORY_LABELS[service.catalog] ?? service.catalog,
        price: service.price,
        durationInMinutes: service.durationInMinutes,
        averageRating: service.averageRating,
        reviewCount: service.reviewCount,
        tags: service.tags,
        isFavorited: service.isFavorited,
    };

    const stylists: StylistData[] = service.stylists.map((s) => ({
        id: s.id,
        name: s.name,
        bio: s.bio,
        avatarUrl: s.avatarUrl,
        branchName: s.branch?.name ?? null,
    }));

    const galleryImages = service.images.length > 0
        ? service.images.map((i) => i.url)
        : service.primaryImage
            ? [service.primaryImage.url]
            : [];

    return (
        <div className="pb-20">
            <div className="mb-6 flex items-center justify-between gap-4">
                <Link
                    href="/services"
                    className="inline-flex items-center gap-2 rounded-full
                          border border-border px-3 py-2 text-[10px]
                          font-semibold uppercase tracking-[0.18em]
                          text-primary transition-colors
                          hover:bg-blush/40"
                >
                    <ChevronLeft className="h-3.5 w-3.5"/> Back to Services
                </Link>
                <span className="hidden text-[10px] font-semibold uppercase
                 tracking-[0.22em] text-on-surface-variant
                 sm:block">
          Service Detail · #{id}
        </span>
            </div>

            <section className="grid grid-cols-1 gap-[clamp(20px,3vw,40px)]
                 lg:grid-cols-[1.1fr_1fr]">
                <ServiceGallery images={galleryImages} name={service.name}/>
                <ServiceInfo service={serviceInfoData} qty={qty} onQtyChange={setQty}/>
            </section>

            <section className="mt-[clamp(40px,6vw,80px)]">
                <ServiceTabs description={service.description ?? ""} info={service.info}/>
            </section>

            <StylistsSection stylists={stylists}/>
            <BookingForm
                serviceId={service.id}
                serviceName={service.name}
                price={service.price}
                userId={userId}
                stylists={stylists}
                qty={qty}
            />
            <ServiceReviewsSection serviceId={service.id}/>
            <RelatedServicesSection excludeServiceId={service.id} category={service.catalog}/>
            <RecommendedProductsSection/>
            <ServiceFaqSection/>
        </div>
    );
}