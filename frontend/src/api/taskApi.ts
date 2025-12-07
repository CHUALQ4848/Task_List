import { api } from "./client";
import { Task, CreateTaskPayload } from "../types";

export const taskApi = {
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get("/tasks");
    return response.data;
  },

  getTask: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    const response = await api.post("/tasks/create", payload);
    return response.data;
  },

  updateTask: async (id: string, payload: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/update/${id}`, payload);
    return response.data;
  },

  updateTaskAndSubtasks: async (
    id: string,
    payload: {
      title?: string;
      status?: string;
      skills?: string[];
      subtasks?: Array<{
        id?: string;
        title?: string;
        status?: string;
        skills?: string[];
        subtasks?: any[];
      }>;
    }
  ): Promise<Task> => {
    const response = await api.put(
      `/tasks/update-with-subtasks/${id}`,
      payload
    );
    return response.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    const response = await api.delete(`/tasks/delete/${id}`);
    return response.data;
  },
};
