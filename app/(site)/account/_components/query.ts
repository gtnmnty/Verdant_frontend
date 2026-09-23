// Flow: GraphQL query to load authenticated user profile and saved address
export const PROFILE_ME_QUERY = `
    query ProfileMe {
        me {
            id
            fullName
            email
            phone
            avatarUrl
            createdAt
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

// Flow: GraphQL mutation to update personal info and shipping address
export const UPDATE_PROFILE_MUTATION = `
    mutation UpdateUserProfile($input: UpdateProfileInput!) {
        updateProfile(input: $input) {
            id
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

export interface ProfileData {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postal: string;
    country: string;
}

export interface UpcomingAppointment {
    id: string;
    serviceName: string;
    scheduledAt: string;
}

export const UPCOMING_APPOINTMENT_QUERY = `
    query ProfileUpcomingAppointment {
        myAppointments(status: UPCOMING, page: 1, pageSize: 1) {
            items {
                id
                serviceName
                scheduledAt
            }
        }
    }
`;

export const FIELD_KEYS = [
    ["fullName", "Full Name"],
    ["email", "Email"],
    ["phone", "Phone"],
    ["street", "Street"],
    ["city", "City"],
    ["state", "State / Province"],
    ["postal", "Postal Code"],
    ["country", "Country"],
] as const;