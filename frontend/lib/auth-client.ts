import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/auth`, // backend URL
});

export const { useSession } = authClient;
