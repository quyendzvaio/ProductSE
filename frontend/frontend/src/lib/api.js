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
  const isLocalDevelopment = hostname === "localhost" || hostname === "127.0.0.1";
  return isLocalDevelopment
    ? `${protocol}//${hostname}:8000`
    : `${window.location.origin}/backend`;
};

const parseError = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => null);
  return payload?.detail || fallbackMessage;
};

export const fetchProducts = async () => {
  const response = await fetch(`${buildBackendBaseUrl()}/api/products`);

  if (!response.ok) {
    throw new Error(
      await parseError(response, `Product API error ${response.status}`),
    );
  }

  return response.json();
};

export const fetchProductDetail = async (productCode) => {
  const response = await fetch(
    `${buildBackendBaseUrl()}/api/products/${encodeURIComponent(productCode)}`,
  );

  if (!response.ok) {
    throw new Error(
      await parseError(response, `Product detail API error ${response.status}`),
    );
  }

  return response.json();
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
