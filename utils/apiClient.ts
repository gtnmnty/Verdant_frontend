const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

type TokenGetter = () => string | null;
type TokenSetter = (token: string | null) => void;

let getToken: TokenGetter = () => null;
let setToken: TokenSetter = () => {};

export function configureApiClient(getter: TokenGetter, setter: TokenSetter) {
  getToken = getter;
  setToken = setter;
}

// Calls the /auth/refresh endpoint in the backend
// to get a new token in case the current one has expired
// or user refresh the pages
async function refreshAccessToken(): Promise<string | null> {
  try{
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include"
    });

    if(!response) return null;
    const data = await response.json();
    return data.accessToken ?? null;
  } catch {
    return null;
  }
}

//
//
//
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T>{
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (token) { headers["Authorization"] = `Bearer ${token}`; }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  })

  if (response.status === 401) {
    const newToken = await refreshAccessToken();

    if (newToken){
      headers["Authorization"] = `Bearer ${newToken}`;
      const retry = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        credentials: "include",
      })

      if(!retry.ok) throw new Error(await retry.text()); {
        return retry.json();
      }
    }

    setToken(null);
    window.location.href = "/auth";
    throw new Error("Session expired");
  }
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}