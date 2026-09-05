"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/app/admin/_components/PageHeader";
import { PersonalTab } from "@/app/admin/settings/_components/PersonalTab";
import { BookingTab } from "@/app/admin/settings/_components/BookingTab";
import { StoreTab } from "@/app/admin/settings/_components/StoreTab";
import { NotificationsTab } from "@/app/admin/settings/_components/NotificationsTab";
import { StaffTab } from "@/app/admin/settings/_components/StaffTab";
import { AuditTab } from "@/app/admin/settings/_components/AuditTab";

export function SettingsContent() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage your account, store, and platform preferences." />

      <Tabs defaultValue="personal">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 overflow-x-auto rounded-full bg-admin-cream p-1">
          <TabsTrigger value="personal" className="rounded-full">Personal</TabsTrigger>
          <TabsTrigger value="booking" className="rounded-full">Booking</TabsTrigger>
          <TabsTrigger value="store" className="rounded-full">Store</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-full">Notifications</TabsTrigger>
          <TabsTrigger value="staff" className="rounded-full">Staff & Roles</TabsTrigger>
          <TabsTrigger value="audit" className="rounded-full">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-5"><PersonalTab /></TabsContent>
        <TabsContent value="booking" className="mt-5"><BookingTab /></TabsContent>
        <TabsContent value="store" className="mt-5"><StoreTab /></TabsContent>
        <TabsContent value="notifications" className="mt-5"><NotificationsTab /></TabsContent>
        <TabsContent value="staff" className="mt-5"><StaffTab /></TabsContent>
        <TabsContent value="audit" className="mt-5"><AuditTab /></TabsContent>
      </Tabs>
    </div>
  );
}
