import {apiRequest} from "@/utils/apiClient";
import {ApiError} from "@/utils/apiError";

// Re-exported so existing imports from this module keep working.
export {ApiError, isConcurrentModification} from "@/utils/apiError";

interface GraphQLError {
    message: string;
    // Set by the backend's GlobalExceptionHandler for every handled error:
    // code: CONCURRENT_MODIFICATION, BUSINESS_RULE, INVALID_ARGUMENT, VALIDATION_ERROR, TOO_MANY_REQUESTS, ...
    extensions?: { code?: string; status?: number; retryAfter?: number; classification?: string };
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
        const first = json.errors[0];
        throw new ApiError(first.message, first.extensions?.code, first.extensions?.status,
            first.extensions?.retryAfter);
    }

    return json.data as T;
}
