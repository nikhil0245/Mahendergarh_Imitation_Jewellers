const BASE_URL = "";

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
