import {CheckCircle2} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {PRODUCT} from "@/app/(site)/collections/[id]/_components/data";

export function ProductTabs() {
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
                <p>{PRODUCT.description}</p>
                <ul className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {PRODUCT.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2">
                            <span className="text-champagne-gold">✦</span> {h}
                        </li>
                    ))}
                </ul>
            </TabsContent>
            <TabsContent value="ingredients" className="mt-6">
                <BulletList items={PRODUCT.ingredients}/>
            </TabsContent>
            <TabsContent value="usage" className="mt-6">
                <BulletList items={PRODUCT.usage}/>
            </TabsContent>
            <TabsContent value="care" className="mt-6">
                <BulletList items={PRODUCT.care}/>
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
