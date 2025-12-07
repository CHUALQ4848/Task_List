// developerController.ts
//Function:
//This file contains controller functions for managing developers, including fetching, creating, and updating developer data.

//Imported Modules:
//Request, Response: Express types for handling HTTP requests and responses.
//prisma: Prisma client instance for database ORM operations.
import { Request, Response } from "express";
import prisma from "../db/prisma";

//Get a developer by ID
export async function getDeveloper(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const developer = await prisma.developer.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!developer) {
      return res.status(404).json({ error: "Developer not found" });
    }

    res.json(developer);
  } catch (error) {
    console.error("Error fetching developer:", error);
    res.status(500).json({ error: "Failed to fetch developer" });
  }
}

export async function getAllDevelopers(req: Request, res: Response) {
  try {
    const developers = await prisma.developer.findMany({
      include: {
        tasks: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    res.json(developers);
  } catch (error) {
    console.error("Error fetching developers:", error);
    res.status(500).json({ error: "Failed to fetch developers" });
  }
}

export async function createDeveloper(req: Request, res: Response) {
  try {
    const { name, email, skills } = req.body;

    const developer = await prisma.developer.create({
      data: {
        name,
        email,
        skills: skills
          ? {
              create: skills.map((skillName: string) => ({
                skill: {
                  connectOrCreate: {
                    where: { name: skillName },
                    create: { name: skillName },
                  },
                },
              })),
            }
          : undefined,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        tasks: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(developer);
  } catch (error) {
    console.error("Error creating developer:", error);
    res.status(500).json({ error: "Failed to create developer" });
  }
}

export async function updateDeveloper(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, email, skills } = req.body;

    if (skills) {
      await prisma.developerSkill.deleteMany({
        where: { developerId: id },
      });
    }

    const developer = await prisma.developer.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(skills && {
          skills: {
            create: skills.map((skillName: string) => ({
              skill: {
                connectOrCreate: {
                  where: { name: skillName },
                  create: { name: skillName },
                },
              },
            })),
          },
        }),
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        tasks: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });

    res.json(developer);
  } catch (error) {
    console.error("Error updating developer:", error);
    res.status(500).json({ error: "Failed to update developer" });
  }
}
