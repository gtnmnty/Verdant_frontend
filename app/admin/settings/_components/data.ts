export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const AUDIT_MODULES = ["Products", "Services", "Orders", "Appointments", "Reviews"];

export interface AuditRow {
  id: string;
  user: string;
  role: string;
  action: string;
  module: string;
  timestamp: string;
}

export const AUDIT: AuditRow[] = Array.from({ length: 24 }, (_, i) => ({
  id: `au${i}`,
  user: ["Elena Vance", "Tomás Rivera", "Aiko Tanaka", "Sophie Laurent"][i % 4],
  role: ["Manager", "Admin", "Receptionist", "Stylist"][i % 4],
  action: ["Created", "Updated", "Deleted", "Approved"][i % 4],
  module: AUDIT_MODULES[i % 5],
  timestamp: new Date(Date.now() - i * 3_600_000).toISOString().slice(0, 16).replace("T", " "),
}));
