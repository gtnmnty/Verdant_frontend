import {apiRequest} from "@/utils/apiClient";

interface GraphQLError {
    message: string;
    // Set by the backend's GlobalExceptionHandler for every handled error:
    // code: CONCURRENT_MODIFICATION, BUSINESS_RULE, INVALID_ARGUMENT, VALIDATION_ERROR, TOO_MANY_REQUESTS, ...
    extensions?: { code?: string; status?: number; classification?: string };
}

interface GraphQLResponse<T> {
    data?: T;
    errors?: GraphQLError[];
}

// An error from the backend that keeps its machine-readable code and HTTP-like status, so callers can react
// to a specific case (e.g. reload on CONCURRENT_MODIFICATION) instead of only showing the message.
// Still an Error, so existing `err instanceof Error ? err.message : ...` handling keeps working.
export class ApiError extends Error {
    readonly code?: string;
    readonly status?: number;

    constructor(message: string, code?: string, status?: number) {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.status = status;
    }
}

// Someone else saved the same record after this screen loaded it (409). Reload, then redo the change.
export function isConcurrentModification(err: unknown): boolean {
    return err instanceof ApiError && err.code === "CONCURRENT_MODIFICATION";
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
        throw new ApiError(first.message, first.extensions?.code, first.extensions?.status);
    }

    return json.data as T;
}
