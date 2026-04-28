const LOCAL_API_URL = "http://localhost:5001";
const PRODUCTION_API_URL = "https://mahendergarh-imitation-jewellers.onrender.com";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost" ? LOCAL_API_URL : PRODUCTION_API_URL);

// 🔥 Ensure no trailing slash issue
const BASE_URL = API_URL.replace(/\/+$/, "");

const request = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem("token");
    const isFormData = options.body instanceof FormData;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: options.method || "GET",
      headers: {
        ...(!isFormData && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {}),
      },
      body: options.body,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API ERROR:", error);
    throw error;
  }
};

export { BASE_URL as API_URL, request };
