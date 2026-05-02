const PRODUCTION_API_URL =
  "https://mahendergarh-imitation-jewellers.onrender.com";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

const getBaseUrl = () => {
  if (typeof window === "undefined") {
    return "";
  }

  if (LOCAL_HOSTNAMES.has(window.location.hostname)) {
    return "";
  }

  return (import.meta.env.VITE_API_URL || PRODUCTION_API_URL).replace(
    /\/+$/,
    "",
  );
};

const BASE_URL = getBaseUrl();

const request = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem("token");
    const isFormData = options.body instanceof FormData;

    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const response = await fetch(`${BASE_URL}${path}`, {
      method: options.method || "GET",
      headers: {
        ...(!isFormData && { "Content-Type": "application/json" }),
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {}),
      },
      body: options.body,
    });

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new Error(
        isJson
          ? data.message || "Something went wrong"
          : `API returned ${response.status} ${response.statusText} instead of JSON`,
      );
    }

    if (!isJson) {
      throw new Error("API returned a non-JSON response");
    }

    return data;
  } catch (error) {
    console.error("API ERROR:", error);
    throw error;
  }
};

export { BASE_URL as API_URL, request };
