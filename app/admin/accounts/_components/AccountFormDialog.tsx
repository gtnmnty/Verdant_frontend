"use client";

import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {ImageUploader} from "@/app/admin/_components/ImageUploader";
import {gqlRequest} from "@/utils/graphqlClient";
import {
    ROLE_TO_BACKEND,
    STATUS_TO_BACKEND,
    type AdminAccount,
} from "@/app/admin/accounts/_components/types";

export const EMPTY_ACCOUNT: AdminAccount = {
    id: "",
    name: "",
    email: "",
    phone: "",
    avatar: "",
    role: "stylist",
    status: "active",
    address: {line1: "", line2: "", city: "", state: "", postal: "", country: ""},
    createdAt: new Date().toISOString().slice(0, 10),
};

const CREATE_ACCOUNT_MUTATION = `
    mutation CreateAccount($input: CreateAccountInput!) {
        createAccount(input: $input) { id }
    }
`;

const UPDATE_ACCOUNT_MUTATION = `
    mutation UpdateAccount($id: ID!, $input: UpdateAccountInput!) {
        updateAccount(id: $id, input: $input) { id }
    }
`;

export function AccountFormDialog({
    open,
    onOpenChange,
    editing,
    onEditingChange,
    onSaved,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editing: AdminAccount | null;
    onEditingChange: (a: AdminAccount) => void;
    onSaved: () => void;
}) {
    const save = () => {
        if (!editing) return;
        if (!editing.name.trim() || !editing.email.includes("@")) {
            toast.error("Valid name & email required");
            return;
        }

        const address = editing.address.line1
            ? {
                line1: editing.address.line1,
                line2: editing.address.line2 || undefined,
                city: editing.address.city,
                state: editing.address.state,
                postal: editing.address.postal,
                country: editing.address.country || undefined,
            }
            : undefined;

        const request = editing.id
            ? gqlRequest(UPDATE_ACCOUNT_MUTATION, {
                id: editing.id,
                input: {
                    fullName: editing.name,
                    email: editing.email,
                    phone: editing.phone || undefined,
                    address,
                    role: ROLE_TO_BACKEND[editing.role],
                    status: STATUS_TO_BACKEND[editing.status],
                },
            })
            : gqlRequest(CREATE_ACCOUNT_MUTATION, {
                input: {
                    fullName: editing.name,
                    email: editing.email,
                    phone: editing.phone || undefined,
                    address,
                    role: ROLE_TO_BACKEND[editing.role],
                    status: STATUS_TO_BACKEND[editing.status],
                },
            });

        request
            .then(() => {
                toast.success("Saved");
                onOpenChange(false);
                onSaved();
            })
            .catch((err) =>
                toast.error(err instanceof Error ? err.message : "Failed to save account."));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl">
                        {editing?.id ? "Edit" : "New"} account
                    </DialogTitle>
                </DialogHeader>

                {editing ? (
                    <div className="grid gap-4 py-2 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Label>Avatar</Label>
                            <ImageUploader
                                images={editing.avatar ? [editing.avatar] : []}
                                onChange={(next) => onEditingChange({...editing, avatar: next[0] ?? ""})}
                                max={1}
                            />
                        </div>
                        <div>
                            <Label>Name</Label>
                            <Input
                                value={editing.name}
                                onChange={(e) => onEditingChange({...editing, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input
                                value={editing.email}
                                onChange={(e) => onEditingChange({...editing, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label>Phone number</Label>
                            <Input
                                value={editing.phone}
                                onChange={(e) => onEditingChange({...editing, phone: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Select
                                value={editing.role}
                                onValueChange={(v: string) => onEditingChange({...editing, role: v})}
                            >
                                <SelectTrigger>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="owner">Owner</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="stylist">Stylist</SelectItem>
                                    <SelectItem value="receptionist">Receptionist</SelectItem>
                                    <SelectItem value="customer">Customer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="sm:col-span-2">
                            <Label>Address (optional)</Label>
                            <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
                                <Input
                                    placeholder="Street address"
                                    value={editing.address.line1}
                                    onChange={(e) =>
                                        onEditingChange({
                                            ...editing,
                                            address: {...editing.address, line1: e.target.value}
                                        })
                                    }
                                />
                                <Input
                                    placeholder="Apt / Suite (optional)"
                                    value={editing.address.line2}
                                    onChange={(e) =>
                                        onEditingChange({
                                            ...editing,
                                            address: {...editing.address, line2: e.target.value}
                                        })
                                    }
                                />
                                <Input
                                    placeholder="City"
                                    value={editing.address.city}
                                    onChange={(e) =>
                                        onEditingChange({
                                            ...editing,
                                            address: {...editing.address, city: e.target.value}
                                        })
                                    }
                                />
                                <Input
                                    placeholder="State / Region"
                                    value={editing.address.state}
                                    onChange={(e) =>
                                        onEditingChange({
                                            ...editing,
                                            address: {...editing.address, state: e.target.value}
                                        })
                                    }
                                />
                                <Input
                                    placeholder="Postal code"
                                    value={editing.address.postal}
                                    onChange={(e) =>
                                        onEditingChange({
                                            ...editing,
                                            address: {...editing.address, postal: e.target.value}
                                        })
                                    }
                                />
                                <Input
                                    placeholder="Country"
                                    value={editing.address.country}
                                    onChange={(e) =>
                                        onEditingChange({
                                            ...editing,
                                            address: {...editing.address, country: e.target.value}
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Status</Label>
                            <Select
                                value={editing.status}
                                onValueChange={(v: string) => onEditingChange({...editing, status: v})}
                            >
                                <SelectTrigger>
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unverified">Unverified</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                    <SelectItem value="banned">Banned</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : null}

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button className="bg-admin-sidebar text-white" onClick={save}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
