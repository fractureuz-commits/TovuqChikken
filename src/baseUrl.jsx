import { getApiBaseUrl } from "./utils/serverConfig";

const dynamicBaseUrl = {
  toString: () => getApiBaseUrl(),
  valueOf: () => getApiBaseUrl(),
  [Symbol.toPrimitive]: () => getApiBaseUrl(),
};

export const BaseUrl = dynamicBaseUrl;
export const BaseUrl1C = dynamicBaseUrl;
export const getBaseUrl = getApiBaseUrl;

export const buildBaseUrl = (path = "") => {
  const cleanPath = String(path).startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${cleanPath}`;
};

export const narxlar = {
  val: true,
  som: true,
  perech: true,
};
