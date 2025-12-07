//taskRoutes.ts
//Function:
//This file defines the routes for task-related operations, mapping HTTP requests to controller functions.

//Imported Modules:
//Router: Express Router for defining routes.
//Controller Functions: Functions from taskController to handle requests.
import { Router } from "express";
import {
  createTask,
  getTask,
  getAllTasks,
  updateTask,
  updateTaskAndSubtasks,
  deleteTask,
} from "../controllers/taskController";

const router = Router();

router.post("/create", createTask);
router.get("/", getAllTasks);
router.get("/:id", getTask);
router.put("/update/:id", updateTask);
router.put("/update-with-subtasks/:id", updateTaskAndSubtasks);
router.delete("/delete/:id", deleteTask);
export default router;
