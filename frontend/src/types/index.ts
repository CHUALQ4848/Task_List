//Index.ts
//Function:
//This file contains TypeScript interfaces defining the data structures for Skills, Developers, and Tasks used in the application.

export interface Skill {
  id: string;
  name: string;
}

export interface DeveloperSkill {
  id: string;
  developerId: string;
  skillId: string;
  skill: Skill;
}

export interface Developer {
  id: string;
  name: string;
  email: string;
  skills?: DeveloperSkill[];
}

export interface TaskSkill {
  id: string;
  taskId: string;
  skillId: string;
  skill: Skill;
}

export interface Task {
  id: string;
  title: string;
  status: string;
  developerId?: string | null;
  developer?: Developer | null;
  parentTaskId?: string | null;
  skills: TaskSkill[];
  subtasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  developerId?: string;
  skills?: string[];
  subtasks?: CreateTaskPayload[];
}
