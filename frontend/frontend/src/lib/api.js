const buildBackendBaseUrl = () => {
  const configuredUrl =
    import.meta.env.VITE_BACKEND_BASE_URL?.trim() ||
    import.meta.env.VITE_CHATBOT_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl
      .replace(/\/api\/chat\/?$/, "")
      .replace(/\/$/, "");
  }

  // Production (Vercel): API chạy cùng domain với prefix /backend
  if (import.meta.env.PROD) {
    return "/backend";
  }

  // Development: local FastAPI server
  return "http://localhost:8000";
};

const parseError = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => null);
  return payload?.detail || fallbackMessage;
};

export const fetchWarehouseSales = async () => {
  const response = await fetch(`${buildBackendBaseUrl()}/api/warehouse/sales`);

  if (!response.ok) {
    throw new Error(
      await parseError(response, `Warehouse API error ${response.status}`),
    );
  }

  return response.json();
};

export const fetchWarehousePredictions = async (limit = 10) => {
  const response = await fetch(`${buildBackendBaseUrl()}/api/warehouse/predictions?limit=${limit}`);

  if (!response.ok) {
    throw new Error(
      await parseError(response, `Prediction API error ${response.status}`),
    );
  }

  return response.json();
};

export const postChatMessage = async ({ message, sessionId }) => {
  const response = await fetch(`${buildBackendBaseUrl()}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      session_id: sessionId ?? null,
    }),
  });

  if (!response.ok) {
    throw new Error(
      await parseError(response, `Chat API error ${response.status}`),
    );
  }

  return response.json();
};
