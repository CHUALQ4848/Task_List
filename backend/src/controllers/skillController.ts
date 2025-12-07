// skillController.ts
//Function:
//This file contains controller functions for managing skills, including fetching and listing skill data.

//Imported Modules:
//Request, Response: Express types for handling HTTP requests and responses.
//prisma: Prisma client instance for database ORM operations.
import { Request, Response } from "express";
import prisma from "../db/prisma";

//Get a skill by ID
export async function getSkill(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const skill = await prisma.skill.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            task: true,
          },
        },
      },
    });

    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    res.json(skill);
  } catch (error) {
    console.error("Error fetching skill:", error);
    res.status(500).json({ error: "Failed to fetch skill" });
  }
}
//Get all skills
export async function getAllSkills(req: Request, res: Response) {
  try {
    const skills = await prisma.skill.findMany({
      include: {
        tasks: {
          include: {
            task: true,
          },
        },
      },
    });

    res.json(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ error: "Failed to fetch skills" });
  }
}
