// Mirrors the backend ItemCatalog enum (ItemCatalog.java). The API takes and returns the value, not the label.
export const PRODUCT_CATEGORIES = [
    {value: "SKIN_CARE", label: "Skin Care"},
    {value: "HAIR_CARE", label: "Hair Care"},
    {value: "MAKE_UP", label: "Make Up"},
] as const;

export const categoryLabel = (value: string) =>
    PRODUCT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
