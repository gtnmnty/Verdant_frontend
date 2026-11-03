import {describe, expect, it, vi, beforeEach} from "vitest";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {JournalAdminContent} from "@/app/admin/journal/_components/JournalAdminContent";
import {ROLE_PERMS, navKeyFromPath, roleFromBackend} from "@/lib/admin/roles";
import type {AdminJournalStory} from "@/app/admin/journal/_components/types";

const gqlRequest = vi.fn();
const apiRequest = vi.fn();
vi.mock("@/utils/graphqlClient", () => ({gqlRequest: (...a: unknown[]) => gqlRequest(...a)}));
vi.mock("@/utils/apiClient", () => ({apiRequest: (...a: unknown[]) => apiRequest(...a)}));
vi.mock("sonner", () => ({toast: {success: vi.fn(), error: vi.fn()}}));

const img = {url: "https://res.cloudinary.com/x/a.jpg", width: 900, height: 1200};

function story(over: Partial<AdminJournalStory> = {}): AdminJournalStory {
    return {
        id: "s1",
        clientName: "Sophia M.",
        quote: "Saved my hair.",
        category: "COLOR",
        service: "Botanical Gloss",
        stylist: "Elena Rose",
        status: "DRAFT",
        resultImage: img,
        serviceImageUrl: null,
        products: [],
        publishedAt: null,
        createdAt: null,
        ...over,
    };
}

let stories: AdminJournalStory[];

beforeEach(() => {
    gqlRequest.mockReset();
    apiRequest.mockReset();
    stories = [story()];
    gqlRequest.mockImplementation(async (query: string, vars?: Record<string, unknown>) => {
        if (query.includes("adminJournalStories")) {
            return {adminJournalStories: {items: stories, totalPages: 1}};
        }
        if (query.includes("adminProducts")) {
            return {adminProducts: {items: [{id: "p1", name: "Argan Serum", images: [{url: "https://x/p.jpg", isPrimary: true}]}]}};
        }
        if (query.includes("adminStylists")) {
            return {adminStylists: {items: [{id: "st1", name: "Marcus Chen", avatarUrl: null}]}};
        }
        if (query.includes("adminServices")) {
            return {adminServices: {items: [{id: "sv1", name: "Curl Ritual", images: [{url: "https://x/s.jpg", isPrimary: true}]}]}};
        }
        if (query.includes("setJournalStoryStatus")) {
            stories = stories.map((s) => (s.id === vars?.id ? {...s, status: vars.status as never} : s));
            return {setJournalStoryStatus: {id: vars?.id, status: vars?.status}};
        }
        if (query.includes("deleteJournalStory")) {
            stories = stories.filter((s) => s.id !== vars?.id);
            return {deleteJournalStory: true};
        }
        throw new Error(`unexpected query: ${query}`);
    });
});

// DataTable renders both a desktop table and mobile cards (CSS toggles which shows), so scope to the table.
async function findTable() {
    return within(await screen.findByRole("table"));
}

async function findRow() {
    const table = await findTable();
    return within(await table.findByRole("row", {name: /Sophia/}));
}

async function openRowAction(user: ReturnType<typeof userEvent.setup>, label: string) {
    const row = await findRow();
    await user.click(row.getAllByRole("button").at(-1)!);
    await user.click(await screen.findByRole("menuitem", {name: label}));
}

// The Journal admin page is gated purely by the role's nav permission, so each role that may reach it
// runs the same CRUD suite; the roles that may not are asserted separately below.
describe.each(["admin", "manager"] as const)("Journal CRUD as %s", (role) => {
    it("has access to the journal section", () => {
        expect(ROLE_PERMS[role].nav.journal).toBe("full");
        expect(navKeyFromPath("/admin/journal")).toBe("journal");
        expect(roleFromBackend(role.toUpperCase())).toBe(role);
    });

    it("lists existing testimonials (read)", async () => {
        render(<JournalAdminContent/>);
        const row = await findRow();
        expect(row.getByText("Sophia M.")).toBeInTheDocument();
        expect(row.getByText("Botanical Gloss")).toBeInTheDocument();
        expect(row.getByText("Draft")).toBeInTheDocument();
    });

    it("adds a testimonial (create) via the multipart endpoint", async () => {
        const user = userEvent.setup();
        apiRequest.mockResolvedValue({id: "new"});
        render(<JournalAdminContent/>);
        await findTable();

        await user.click(screen.getByRole("button", {name: /add testimonial/i}));
        const dialog = await screen.findByRole("dialog");

        // Required fields missing -> nothing is sent.
        await user.click(within(dialog).getByRole("button", {name: "Save"}));
        expect(apiRequest).not.toHaveBeenCalled();

        // Each missing field gets an inline error (no toast popup).
        expect(within(dialog).getByText("Client name is required.")).toBeInTheDocument();
        expect(within(dialog).getByText("Select a service.")).toBeInTheDocument();
        expect(within(dialog).getByText("A result image is required.")).toBeInTheDocument();

        await user.type(within(dialog).getByLabelText("Client name"), "Amara K.");
        await user.type(within(dialog).getByLabelText("Quote"), "Curls finally behave.");
        await user.click(within(dialog).getByRole("combobox", {name: "Search stylist"}));
        await user.click(await within(dialog).findByRole("option", {name: /Marcus Chen/}));
        // Service/product is chosen from a combined search + select box.
        await user.click(within(dialog).getByRole("combobox", {name: "Search service"}));
        await user.click(await within(dialog).findByRole("option", {name: /Curl Ritual/}));
        const file = new File(["x"], "result.jpg", {type: "image/jpeg"});
        const fileInput = dialog.querySelector('input[type="file"]') as HTMLInputElement;
        await user.upload(fileInput, file);
        await within(dialog).findByAltText("Image 1"); // the file is read asynchronously
        await user.click(within(dialog).getByRole("button", {name: "Save"}));

        await waitFor(() => expect(apiRequest).toHaveBeenCalledTimes(1));
        const [path, opts] = apiRequest.mock.calls[0];
        expect(path).toBe("/api/journal");
        expect(opts.method).toBe("POST");
        const form = opts.body as FormData;
        expect(form.get("clientName")).toBe("Amara K.");
        expect(form.get("quote")).toBe("Curls finally behave.");
        expect(form.get("service")).toBe("Curl Ritual");
        expect(form.get("stylist")).toBe("Marcus Chen");
        expect(form.get("productIds")).toBe("");
        expect(form.get("status")).toBe("DRAFT");
        expect(form.get("resultImage")).toBeInstanceOf(File);
    });

    it("features a product: links it and uses its name", async () => {
        const user = userEvent.setup();
        apiRequest.mockResolvedValue({id: "new"});
        render(<JournalAdminContent/>);
        await findTable();
        await user.click(screen.getByRole("button", {name: /add testimonial/i}));
        const dialog = await screen.findByRole("dialog");

        await user.type(within(dialog).getByLabelText("Client name"), "Amara K.");
        await user.type(within(dialog).getByLabelText("Quote"), "Love it.");
        await user.click(within(dialog).getByRole("radio", {name: "product"}));
        // Products have no stylist, so the field isn't asked for.
        expect(within(dialog).queryByRole("combobox", {name: "Search stylist"})).not.toBeInTheDocument();
        await user.click(within(dialog).getByRole("combobox", {name: "Search product"}));
        await user.click(await within(dialog).findByRole("option", {name: /Argan Serum/}));
        // The primary image of the chosen item is previewed instead of a separate upload field.
        expect(within(dialog).getByText(/primary image is shown/i)).toBeInTheDocument();
        await user.upload(dialog.querySelector('input[type="file"]') as HTMLInputElement,
            new File(["x"], "r.jpg", {type: "image/jpeg"}));
        await within(dialog).findByAltText("Image 1");
        await user.click(within(dialog).getByRole("button", {name: "Save"}));

        await waitFor(() => expect(apiRequest).toHaveBeenCalledTimes(1));
        const form = apiRequest.mock.calls[0][1].body as FormData;
        expect(form.get("productIds")).toBe("p1");
        expect(form.get("service")).toBe("Argan Serum");
        expect(form.get("stylist")).toBe("");
    });

    it("shows a save failure inline instead of a popup", async () => {
        const user = userEvent.setup();
        apiRequest.mockRejectedValue(new Error("Image too large"));
        render(<JournalAdminContent/>);
        await openRowAction(user, "Edit");
        const dialog = await screen.findByRole("dialog");
        await user.click(within(dialog).getByRole("button", {name: "Save"}));
        expect(await within(dialog).findByText("Image too large")).toBeInTheDocument();
    });

    it("edits a testimonial (update) via PUT", async () => {
        const user = userEvent.setup();
        apiRequest.mockResolvedValue({id: "s1"});
        render(<JournalAdminContent/>);
        await openRowAction(user, "Edit");

        const dialog = await screen.findByRole("dialog");
        const name = within(dialog).getByLabelText("Client name");
        await user.clear(name);
        await user.type(name, "Sophia Marie");
        await user.click(within(dialog).getByRole("button", {name: "Save"}));

        await waitFor(() => expect(apiRequest).toHaveBeenCalledTimes(1));
        const [path, opts] = apiRequest.mock.calls[0];
        expect(path).toBe("/api/journal/s1");
        expect(opts.method).toBe("PUT");
        expect((opts.body as FormData).get("clientName")).toBe("Sophia Marie");
        // The unchanged (already uploaded) image is not re-sent.
        expect((opts.body as FormData).get("resultImage")).toBeNull();
    });

    it("publishes then unpublishes a testimonial", async () => {
        const user = userEvent.setup();
        render(<JournalAdminContent/>);
        await openRowAction(user, "Publish");
        await waitFor(() =>
            expect(gqlRequest).toHaveBeenCalledWith(
                expect.stringContaining("setJournalStoryStatus"), {id: "s1", status: "PUBLISHED"}));
        expect((await findRow()).getByText("Published")).toBeInTheDocument();

        await openRowAction(user, "Unpublish");
        await waitFor(() =>
            expect(gqlRequest).toHaveBeenCalledWith(
                expect.stringContaining("setJournalStoryStatus"), {id: "s1", status: "DRAFT"}));
    });

    it("removes a testimonial (delete) after confirming", async () => {
        const user = userEvent.setup();
        render(<JournalAdminContent/>);
        await openRowAction(user, "Delete");

        await user.click(await screen.findByRole("button", {name: "Delete"}));
        await waitFor(() =>
            expect(gqlRequest).toHaveBeenCalledWith(
                expect.stringContaining("deleteJournalStory"), {id: "s1"}));
        await waitFor(() => expect(screen.queryByRole("table")).not.toBeInTheDocument());
    });
});

describe("Journal access control", () => {
    it("owner can reach the journal section", () => {
        expect(ROLE_PERMS.owner.nav.journal).toBe("full");
    });

    it.each(["receptionist", "stylist"] as const)("%s cannot see the journal section", (role) => {
        expect(ROLE_PERMS[role].nav.journal).toBe("hidden");
    });
});
