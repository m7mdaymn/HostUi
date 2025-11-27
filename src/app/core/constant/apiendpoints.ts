import { environment } from "../../../environment/environment";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${environment.apiUrl}/Auth/register`,
    LOGIN: `${environment.apiUrl}/Auth/login`,
  },
};