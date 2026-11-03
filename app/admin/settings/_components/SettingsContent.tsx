"use client";

import { useRole } from "@/lib/admin/role-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/app/admin/_components/PageHeader";
import { PersonalTab } from "@/app/admin/settings/_components/PersonalTab";
import { BookingTab } from "@/app/admin/settings/_components/BookingTab";
import { StoreTab } from "@/app/admin/settings/_components/StoreTab";
import { NotificationsTab } from "@/app/admin/settings/_components/NotificationsTab";
import { StaffTab } from "@/app/admin/settings/_components/StaffTab";
import { AuditTab } from "@/app/admin/settings/_components/AuditTab";

export function SettingsContent() {
  const { perms } = useRole();
  const showStore = perms.caps.manageStoreSettings;
  const showStaff = perms.caps.manageAccounts;
  const showAudit = perms.caps.viewAuditLog;

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account, store, and platform preferences." />

      <Tabs defaultValue="personal">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 overflow-x-auto rounded-full bg-admin-cream p-1">
          <TabsTrigger value="personal" className="rounded-full">Personal</TabsTrigger>
          {showStore ? <TabsTrigger value="booking" className="rounded-full">Booking</TabsTrigger> : null}
          {showStore ? <TabsTrigger value="store" className="rounded-full">Store</TabsTrigger> : null}
          <TabsTrigger value="notifications" className="rounded-full">Notifications</TabsTrigger>
          {showStaff ? <TabsTrigger value="staff" className="rounded-full">Staff & Roles</TabsTrigger> : null}
          {showAudit ? <TabsTrigger value="audit" className="rounded-full">Audit Log</TabsTrigger> : null}
        </TabsList>

        <TabsContent value="personal" className="mt-5"><PersonalTab /></TabsContent>
        {showStore ? <TabsContent value="booking" className="mt-5"><BookingTab /></TabsContent> : null}
        {showStore ? <TabsContent value="store" className="mt-5"><StoreTab /></TabsContent> : null}
        <TabsContent value="notifications" className="mt-5"><NotificationsTab /></TabsContent>
        {showStaff ? <TabsContent value="staff" className="mt-5"><StaffTab /></TabsContent> : null}
        {showAudit ? <TabsContent value="audit" className="mt-5"><AuditTab /></TabsContent> : null}
      </Tabs>
    </div>
  );
}
