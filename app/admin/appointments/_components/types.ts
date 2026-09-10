export type ServiceType = "in_salon" | "home_service";
export type AppointmentStatus = "pending" | "upcoming" | "completed" | "cancelled";

export interface AdminAppointment {
  id: string;
  appointmentCode: string;
  userId: string;
  customer: string;
  customerAvatar: string;
  phone: string;
  email: string;
  address: string;
  serviceType: ServiceType;
  serviceId: string | null;
  serviceName: string;
  stylistId: string | null;
  stylistName: string;
  branchName: string;
  startsAt: string;
  durationMin: number;
  guests: number;
  notes: string;
  status: AppointmentStatus;
}

export const SERVICE_TYPE_TO_BACKEND: Record<ServiceType, string> = {
  in_salon: "IN_SALON",
  home_service: "HOME_SERVICE",
};
export const SERVICE_TYPE_FROM_BACKEND: Record<string, ServiceType> = {
  IN_SALON: "in_salon",
  HOME_SERVICE: "home_service",
};

export const STATUS_FROM_BACKEND: Record<string, AppointmentStatus> = {
  PENDING: "pending",
  UPCOMING: "upcoming",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};
