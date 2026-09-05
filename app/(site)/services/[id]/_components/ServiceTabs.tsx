import {CheckCircle2} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

export interface ServiceTabsData {
    description: string;
    // Backend's SalonService only exposes a generic `info` string list —
    // there's no distinct preparation/aftercare model, so it's reused here
    // as "Inclusions" and the other two tabs fall back to static copy.
    info: string[];
}

const PREPARATION_FALLBACK = [
    "Arrive a few minutes early to settle in before your appointment.",
    "Let your stylist know about any preferences or sensitivities beforehand.",
];

const AFTERCARE_FALLBACK = [
    "Follow any product guidance provided by your stylist.",
    "Reach out to the salon if you have any concerns after your visit.",
];

export function ServiceTabs({description, info}: ServiceTabsData) {
    return (
        <Tabs defaultValue="overview">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-2
                 overflow-x-auto border-b border-border
                 bg-transparent p-0">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="inclusions">Inclusions</TabsTrigger>
                <TabsTrigger value="preparation">Preparation</TabsTrigger>
                <TabsTrigger value="aftercare">Aftercare</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6 text-sm leading-relaxed
                 text-on-surface-variant">
                {description || "No description available yet."}
            </TabsContent>
            <TabsContent value="inclusions" className="mt-6">
                <BulletList items={info.length > 0 ? info : ["No inclusions listed yet."]}/>
            </TabsContent>
            <TabsContent value="preparation" className="mt-6">
                <BulletList items={PREPARATION_FALLBACK}/>
            </TabsContent>
            <TabsContent value="aftercare" className="mt-6">
                <BulletList items={AFTERCARE_FALLBACK}/>
            </TabsContent>
        </Tabs>
    );
}

function BulletList({items}: { items: string[] }) {
    return (
        <ul className="space-y-2 text-sm text-on-surface-variant">
            {items.map((i) => (
                <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-champagne-gold"/>
                    <span>{i}</span>
                </li>
            ))}
        </ul>
    );
}