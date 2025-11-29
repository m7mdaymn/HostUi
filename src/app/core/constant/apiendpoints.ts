import { environment } from "../../../environment/environment";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${environment.apiUrl}/Auth/register`,
    LOGIN: `${environment.apiUrl}/Auth/login`,
  },

  DASHBOARD: {
    STATS: `${environment.apiUrl}/Dashboard/stats`,
  },

  USERS: {
      LIST: `${environment.apiUrl}/Users`,
      SINGLE: (id: string | number) => `${environment.apiUrl}/Users/${id}`,
      CREATE: `${environment.apiUrl}/Users`,
      UPDATE: (id: string | number) => `${environment.apiUrl}/Users/${id}`,
      DELETE: (id: string | number) => `${environment.apiUrl}/Users/${id}`,
    },

  VPS: {
    LIST: `${environment.apiUrl}/VPS`,
    SINGLE: (id: string) => `${environment.apiUrl}/VPS/${id}`,
    CREATE: `${environment.apiUrl}/VPS`,
    UPDATE: (id: string) => `${environment.apiUrl}/VPS/${id}`,
    DELETE: (id: string) => `${environment.apiUrl}/VPS/${id}`,
    PRODUCTS_LIST: `${environment.apiUrl}/Products/vps`,
    PRODUCTS_CREATE: `${environment.apiUrl}/Products/vps`,
    PRODUCTS_UPDATE: (id: string) => `${environment.apiUrl}/Products/vps/${id}`,
    PRODUCTS_DELETE: (id: string) => `${environment.apiUrl}/Products/vps/${id}`,
    ORDER_WHATSAPP: (id: string) => `${environment.apiUrl}/Products/order/vps/${id}`,
  },

  DEDICATED: {
    LIST: `${environment.apiUrl}/DedicatedServers`,
    SINGLE: (id: string) => `${environment.apiUrl}/DedicatedServers/${id}`,
    CREATE: `${environment.apiUrl}/DedicatedServers`,
    UPDATE: (id: string) => `${environment.apiUrl}/DedicatedServers/${id}`,
    DELETE: (id: string) => `${environment.apiUrl}/DedicatedServers/${id}`,
    PRODUCTS_LIST: `${environment.apiUrl}/Products/dedicated`,
    ORDER_WHATSAPP: (id: string) => `${environment.apiUrl}/Products/order/dedicated/${id}`,
  },

  PACKAGES: {
    LIST: `${environment.apiUrl}/Packages`,
    SINGLE: (id: string) => `${environment.apiUrl}/Packages/${id}`,
    CREATE: `${environment.apiUrl}/Packages`,
    UPDATE: (id: string) => `${environment.apiUrl}/Packages/${id}`,
    DELETE: (id: string) => `${environment.apiUrl}/Packages/${id}`,
  },

  PACKAGE_ITEMS: {
    LIST: `${environment.apiUrl}/PackageItems`,
    CREATE: `${environment.apiUrl}/PackageItems`,
    UPDATE: (id: string) => `${environment.apiUrl}/PackageItems/${id}`,
    DELETE: (id: string) => `${environment.apiUrl}/PackageItems/${id}`,
  },

  PROMOS: {
    LIST: `${environment.apiUrl}/Promos`,
    CREATE: `${environment.apiUrl}/Promos`,
    UPDATE: (id: string) => `${environment.apiUrl}/Promos/${id}`,
    DELETE: (id: string) => `${environment.apiUrl}/Promos/${id}`,
  },
};
