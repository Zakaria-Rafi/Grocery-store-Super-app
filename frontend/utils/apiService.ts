import { useAuth } from "#imports";
import { useRequestEvent } from "#app";

// Utility function to get the API URL based on the environment
export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    // Use window origin if available, force to localhost if in local environment
    const origin = window.location.origin.includes("localhost") ? "https://localhost" : window.location.origin;
    return `${origin}/api`;
  }

  // Get request event for server-side context
  const event = useRequestEvent();
  if (event) {
    const protocol = event.node.req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const host = event.node.req.headers.host?.split(":")[0];
    // Force to localhost if in local environment
    const finalHost = host?.includes("localhost") ? "localhost" : host;
    return `${protocol}://${finalHost}/api`;
  }

  throw new Error("Unable to determine request origin.");
}

// Base API configuration with authentication
export const $api = $fetch.create({
  async onRequest({ options }) {
    // Get runtime config and set base URL
    options.baseURL = getApiUrl();

    // Add auth token to headers if available
    const { token } = useAuth();
    if (token.value) {
      options.headers = {
        ...options.headers,
        Accept: "application/json",
        Authorization: `${token.value}`,
      };
    }
  },
});
