//skillRoutes.ts
//Function:
//This file defines the routes for skill-related operations, mapping HTTP requests to controller functions.

//Imported Modules:
//Router: Express Router for defining routes.
//Controller Functions: Functions from skillController to handle requests.
import { Router } from "express";
import { getSkill, getAllSkills } from "../controllers/skillController";

const router = Router();

router.get("/", getAllSkills);
router.get("/:id", getSkill);

export default router;
