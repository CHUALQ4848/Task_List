//developerRoutes.ts
//Function:
//This file defines the routes for developer-related operations, mapping HTTP requests to controller functions.

//Imported Modules:
//Router: Express Router for defining routes.
//Controller Functions: Functions from developerController to handle requests.
import { Router } from "express";
import {
  getDeveloper,
  getAllDevelopers,
  createDeveloper,
  updateDeveloper,
} from "../controllers/developerController";

const router = Router();

router.get("/", getAllDevelopers);
router.get("/:id", getDeveloper);
router.post("/", createDeveloper);
router.put("/:id", updateDeveloper);

export default router;
