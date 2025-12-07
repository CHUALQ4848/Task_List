import { api } from "./client";
import { Developer } from "../types";

export const developerApi = {
  getDevelopers: async (): Promise<Developer[]> => {
    const response = await api.get("/developers");
    return response.data;
  },

  getDeveloper: async (id: string): Promise<Developer> => {
    const response = await api.get(`/developers/${id}`);
    return response.data;
  },

  createDeveloper: async (data: {
    name: string;
    email: string;
    skills?: string[];
  }): Promise<Developer> => {
    const response = await api.post("/developers", data);
    return response.data;
  },

  updateDeveloper: async (
    id: string,
    data: {
      name?: string;
      email?: string;
      skills?: string[];
    }
  ): Promise<Developer> => {
    const response = await api.put(`/developers/${id}`, data);
    return response.data;
  },
};
