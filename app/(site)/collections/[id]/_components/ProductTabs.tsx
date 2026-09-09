import {CheckCircle2} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

export interface ProductTabsData {
    description: string;
    // Backend's Product only exposes a generic `info` string list — there's
    // no distinct ingredients/usage/care model, so it's reused as
    // "Ingredients" here and the other two tabs fall back to static copy.
    info: string[];
}

const USAGE_FALLBACK = [
    "Follow the instructions on the packaging for best results.",
    "Patch test on a small area first if you have sensitive skin.",
];

const CARE_FALLBACK = [
    "Store in a cool, dry place away from direct sunlight.",
    "Reseal tightly after each use.",
];

export function ProductTabs({description, info}: ProductTabsData) {
    return (
        <Tabs defaultValue="details">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-2
                 overflow-x-auto border-b border-border
                 bg-transparent p-0">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="usage">How to Use</TabsTrigger>
                <TabsTrigger value="care">Care</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6 text-sm leading-relaxed
                 text-on-surface-variant">
                <p>{description || "No description available yet."}</p>
            </TabsContent>
            <TabsContent value="ingredients" className="mt-6">
                <BulletList items={info.length > 0 ? info : ["No ingredients listed yet."]}/>
            </TabsContent>
            <TabsContent value="usage" className="mt-6">
                <BulletList items={USAGE_FALLBACK}/>
            </TabsContent>
            <TabsContent value="care" className="mt-6">
                <BulletList items={CARE_FALLBACK}/>
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