import { api } from "./client";
import { Skill } from "../types";

export const skillApi = {
  getSkills: async (): Promise<Skill[]> => {
    const response = await api.get("/skills");
    return response.data;
  },

  getSkill: async (id: string): Promise<Skill> => {
    const response = await api.get(`/skills/${id}`);
    return response.data;
  },
};
