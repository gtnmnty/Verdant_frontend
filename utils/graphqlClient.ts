import {apiRequest} from "@/utils/apiClient";

interface GraphQLError {
    message: string;
}

interface GraphQLResponse<T> {
    data?: T;
    errors?: GraphQLError[];
}

// Thin wrapper around apiRequest — reuses its token attach / 401-refresh-retry
// logic as-is, and just unwraps the GraphQL {data, errors} envelope on top.
export async function gqlRequest<T>(
    query: string,
    variables?: Record<string, unknown>,
): Promise<T> {
    const json = await apiRequest<GraphQLResponse<T>>("/graphql", {
        method: "POST",
        body: JSON.stringify({query, variables}),
    });

    if (json.errors && json.errors.length > 0) {
        throw new Error(json.errors[0].message);
    }

    return json.data as T;
}