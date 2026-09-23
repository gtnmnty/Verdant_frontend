export const PROFILE_ME_QUERY = `
    query ProfileMe {
        me {
            fullName
            email
            phone
            shippingAddress {
                line1
                line2
                city
                state
                postal
                country
            }
        }
    }
`;

export type ServiceType = "In Salon" | "Home";

export interface FormState {
    name: string;
    phone: string;
    email: string;
    service: string;
    serviceType: ServiceType;
    branch: string;
    address: string;
    suite: string;
    city: string;
    postal: string;
    region: string;
    date: string;
    time: string;
    notes: string;
}

export type Errors = Partial<Record<keyof FormState, string>>;

export const INITIAL: FormState = {
    name: "",
    phone: "",
    email: "",
    service: "",
    serviceType: "In Salon",
    branch: "",
    address: "",
    suite: "",
    city: "",
    postal: "",
    region: "",
    date: "",
    time: "",
    notes: "",
};