// taskController.ts
//Function:
//This file contains controller functions for managing tasks, including creating, fetching, and updating task data with skill identification using an LLM (Gemini).
//Imported Modules:
//Request, Response: Express types for handling HTTP requests and responses.
//prisma: Prisma client instance for database ORM operations.
//identifySkills: Service function to identify skills using an LLM.
import { Request, Response } from "express";
import prisma from "../db/prisma";
import { identifySkills } from "../services/llmService";

interface CreateTaskBody {
  title: string;
  developerId?: string;
  skills?: string[];
  subtasks?: CreateTaskBody[];
}

async function processTaskWithSkills(
  taskData: CreateTaskBody,
  parentTaskId?: string
): Promise<any> {
  let skillIds: string[] = [];

  if (taskData.skills && taskData.skills.length > 0) {
    skillIds = await Promise.all(
      taskData.skills.map(async (skillName) => {
        const skill = await prisma.skill.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName },
        });
        return skill.id;
      })
    );
  } else {
    const identifiedSkills = await identifySkills(taskData.title);
    skillIds = await Promise.all(
      identifiedSkills.map(async (skillName) => {
        const skill = await prisma.skill.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName },
        });
        return skill.id;
      })
    );
  }

  const task = await prisma.task.create({
    data: {
      title: taskData.title,
      developerId: taskData.developerId,
      parentTaskId,
      skills: {
        create: skillIds.map((skillId) => ({
          skillId,
        })),
      },
    },
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
      developer: true,
    },
  });

  if (taskData.subtasks && taskData.subtasks.length > 0) {
    const subtasks = await Promise.all(
      taskData.subtasks.map((subtask) =>
        processTaskWithSkills(subtask, task.id)
      )
    );
    return { ...task, subtasks };
  }

  return task;
}

export async function createTask(req: Request, res: Response) {
  try {
    const taskData: CreateTaskBody = req.body;
    const task = await processTaskWithSkills(taskData);
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
}

// //Get a task by ID
// export async function getTaskById(id: string, res: Response) {
//   try {
//     // const { id } = req.params;
//     const task = await prisma.task.findUnique({
//       where: { id },
//       include: {
//         skills: {
//           include: {
//             skill: true,
//           },
//         },
//         developer: true,
//         subtasks: {
//           include: {
//             skills: {
//               include: {
//                 skill: true,
//               },
//             },
//             developer: true,
//           },
//         },
//       },
//     });

//     if (!task) {
//       return res.status(404).json({ error: "Task not found" });
//     }

//     res.json(task);
//   } catch (error) {
//     console.error("Error fetching task:", error);
//     res.status(500).json({ error: "Failed to fetch task" });
//   }
// }

export async function getTask(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        developer: true,
        subtasks: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
            developer: true,
            subtasks: {
              include: {
                skills: {
                  include: {
                    skill: true,
                  },
                },
                developer: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: "Failed to fetch task" });
  }
}

export async function getAllTasks(req: Request, res: Response) {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        parentTaskId: null,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        developer: true,
        subtasks: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
            developer: true,
            subtasks: {
              include: {
                skills: {
                  include: {
                    skill: true,
                  },
                },
                developer: true,
              },
            },
          },
        },
      },
    });

    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
}

async function canUpdateTaskStatus(
  taskId: string,
  newStatus: string
): Promise<boolean> {
  if (newStatus !== "Done") {
    return true;
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      subtasks: true,
    },
  });

  if (!task) {
    return false;
  }

  if (task.subtasks.length === 0) {
    return true;
  }

  const allSubtasksDone = task.subtasks.every(
    (subtask) => subtask.status === "Done"
  );
  return allSubtasksDone;
}

async function validateDeveloperSkills(
  developerId: string,
  taskId: string
): Promise<boolean> {
  const developer = await prisma.developer.findUnique({
    where: { id: developerId },
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
  });

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
  });

  if (!developer || !task) return false;
  // Extract skill names for comparison
  const developerSkillNames = developer.skills.map((ds: any) => ds.skill.name);
  const requiredSkillNames = task.skills.map((ts: any) => ts.skill.name);
  // Check if developer has all required skills
  return requiredSkillNames.every((skillName: string) =>
    developerSkillNames.includes(skillName)
  );
}

export async function updateTask(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, status, developerId } = req.body;

    if (status) {
      // Check if all subtasks are done before marking task as Done
      const canUpdate = await canUpdateTaskStatus(id, status);
      if (!canUpdate) {
        return res.status(400).json({
          error: "Cannot mark task as Done until all subtasks are Done",
        });
      }
    }

    if (developerId) {
      // Validate developer skills against task requirements
      const hasRequiredSkills = await validateDeveloperSkills(developerId, id);
      if (!hasRequiredSkills) {
        return res.status(400).json({
          error: "Developer does not have the required skills for this task",
        });
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(status && { status }),
        ...(developerId !== undefined && { developerId }),
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        developer: true,
        subtasks: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
            developer: true,
          },
        },
      },
    });

    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
}

//Delete a task
export async function deleteTask(req: Request, res: Response) {
  try {
    // console.log("Delete task request received");
    const { id } = req.params;
    // console.log("Task ID to delete:", id);
    const task = await prisma.task.findFirst({
      where: { id },
      select: {
        id: true,
        parentTaskId: true,
        developerId: true,
        status: true,
        title: true,
      },
    });
    //  console.log("Task to be deleted:", task);
    // Check if status is Done and prevent deletion
    if (task?.status === "Done") {
      console.log("Cannot delete a completed task:", id);
      return res
        .status(400)
        .json({ error: "A completed task cannot be deleted" });
    }
    // Check if the task has subtasks
    const subtasks = await prisma.task.findMany({
      where: { parentTaskId: id },
    });
    console.log("Subtasks found:", subtasks);
    if (subtasks.length > 0) {
      await prisma.task.deleteMany({ where: { parentTaskId: id } });
      console.log("Deleted subtasks of task:", id);
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
}

//Get tasks

//Update task and subtasks title and status
export async function updateTaskAndSubtasks(req: Request, res: Response) {
  // console.log("Update task and subtasks request received");
  // console.log("Request body:", req.body);
  try {
    const { id } = req.params;
    const { title, status, skills } = req.body;

    // Update main task title and status
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(status && { status }),
      },
    });

    // Update skills if provided
    if (skills && Array.isArray(skills)) {
      // Remove existing task skills
      await prisma.taskSkill.deleteMany({
        where: { taskId: id },
      });

      // Add new skills i
      if (skills.length > 0) {
        const skillIds = await Promise.all(
          skills.map(async (skillName: string) => {
            // Update or create a Skill
            const skill = await prisma.skill.upsert({
              where: { name: skillName },
              update: {}, // ... in case it already exists, update nothing
              create: { name: skillName }, // ... data to create a Skill
            });
            return skill.id;
          })
        );
        // Add new skills for task
        await prisma.taskSkill.createMany({
          data: skillIds.map((skillId) => ({
            taskId: id,
            skillId,
          })),
        });
      }
    }

    // Recursive function to update subtasks
    async function updateSubtasksRecursively(
      subtasks: any[],
      parentId: string
    ) {
      if (!subtasks || !Array.isArray(subtasks)) return;

      for (const subtask of subtasks) {
        if (subtask.id) {
          // Update existing subtask
          await prisma.task.update({
            where: { id: subtask.id },
            data: {
              ...(subtask.title && { title: subtask.title }),
              ...(subtask.status && { status: subtask.status }),
            },
          });

          // Update subtask skills if provided
          if (subtask.skills && Array.isArray(subtask.skills)) {
            // Remove existing subtask skills
            await prisma.taskSkill.deleteMany({
              where: { taskId: subtask.id },
            });

            // Add new skills for subtask
            if (subtask.skills.length > 0) {
              const skillIds = await Promise.all(
                subtask.skills.map(async (skillName: string) => {
                  const skill = await prisma.skill.upsert({
                    where: { name: skillName },
                    update: {},
                    create: { name: skillName },
                  });
                  return skill.id;
                })
              );

              await prisma.taskSkill.createMany({
                data: skillIds.map((skillId) => ({
                  taskId: subtask.id,
                  skillId,
                })),
              });
            }
          }

          // Recursively update nested subtasks
          if (subtask.subtasks && subtask.subtasks.length > 0) {
            await updateSubtasksRecursively(subtask.subtasks, subtask.id);
          }
        } else if (subtask.title) {
          // Create new subtask if no ID provided but has title
          const newSubtask = await processTaskWithSkills(
            {
              title: subtask.title,
              skills: subtask.skills,
              subtasks: subtask.subtasks,
            },
            parentId
          );
        }
      }
    }

    // Update all subtasks if provided
    if (req.body.subtasks && Array.isArray(req.body.subtasks)) {
      await updateSubtasksRecursively(req.body.subtasks, id);
    }

    // Fetch the updated task with all relationships
    const updatedTask = await prisma.task.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        developer: true,
        subtasks: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
            developer: true,
            subtasks: {
              include: {
                skills: {
                  include: {
                    skill: true,
                  },
                },
                developer: true,
              },
            },
          },
        },
      },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task and subtasks:", error);
    res.status(500).json({ error: "Failed to update task and subtasks" });
  }
}
