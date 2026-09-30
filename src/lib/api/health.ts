import axios from "axios";
import { apiOrigin } from "@/lib/api/client";

export interface HealthReport {
  status: string;
  database?: string;
  redis?: string;
  timestamp?: string;
}

export const healthApi = {
  async get(): Promise<HealthReport> {
    const response = await axios.get<HealthReport>(`${apiOrigin()}/health`, { timeout: 8000 });
    return response.data;
  },
};
