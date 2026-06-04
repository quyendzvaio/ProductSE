const buildBackendBaseUrl = () => {
  const configuredUrl =
    import.meta.env.VITE_BACKEND_BASE_URL?.trim() ||
    import.meta.env.VITE_CHATBOT_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl
      .replace(/\/api\/chat\/?$/, "")
      .replace(/\/$/, "");
  }

  const protocol = window.location.protocol;
  const hostname = window.location.hostname || "localhost";
  return `${protocol}//${hostname}:8000`;
};

export const fetchWarehouseSales = async () => {
  const response = await fetch(`${buildBackendBaseUrl()}/api/warehouse/sales`);

  if (!response.ok) {
    throw new Error(`Warehouse API error ${response.status}`);
  }

  return response.json();
};

export const fetchWarehousePredictions = async (limit = 10) => {
  const response = await fetch(`${buildBackendBaseUrl()}/api/warehouse/predictions?limit=${limit}`);

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.detail || `Prediction API error ${response.status}`);
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
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.detail || `Chat API error ${response.status}`);
  }

  return response.json();
};
