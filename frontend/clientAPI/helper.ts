export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Important for sending cookies
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "An error occurred");
    }

    return res.json();
  } catch (error) {
    // toast.error("Failed to complete request. Check your internet connection.");
    console.log("error : ", error);
    throw error;
  }
};
export const post = async <T>(url: string, body: any): Promise<T> => {
  return fetchWithAuth(url, {
    method: "POST",
    body: JSON.stringify(body),
  });
};
