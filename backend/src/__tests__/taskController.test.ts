/**
 * Unit Tests for Task Controller
 *
 * This file contains comprehensive tests for all task-related controller functions:
 * - createTask: Creates new tasks with skills (provided or identified by LLM)
 * - getTask: Retrieves a specific task by ID
 * - getAllTasks: Retrieves all root-level tasks with their subtasks
 * - updateTask: Updates task properties with validation
 * - deleteTask: Deletes tasks with business rule validation
 * - updateTaskAndSubtasks: Updates a task and its subtasks
 *
 * Test Coverage:
 * - Success scenarios for all functions
 * - Error handling and edge cases
 * - Business logic validation (e.g., completed tasks can't be deleted)
 * - Skill validation when assigning developers
 * - Subtask status validation when marking parent as done
 */

import { Request, Response } from "express";

// Create mock objects
const mockPrisma = {
  task: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  skill: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  developer: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockLLMService = {
  identifySkills: jest.fn(),
};

// Mock the external dependencies before importing the controller
jest.mock("../db/prisma", () => ({
  __esModule: true,
  default: mockPrisma,
}));

jest.mock("../services/llmService", () => mockLLMService);

import {
  createTask,
  getTask,
  getAllTasks,
  updateTask,
  deleteTask,
  updateTaskAndSubtasks,
} from "../controllers/taskController";

describe("Task Controller Unit Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup request and response mocks
    req = {};
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe("createTask", () => {
    it("should create a task successfully with provided skills", async () => {
      // Arrange
      const taskData = {
        title: "Test Task",
        developerId: "dev-123",
        skills: ["JavaScript", "React"],
      };
      req.body = taskData;

      const skillMocks = [
        { id: "skill-1", name: "JavaScript" },
        { id: "skill-2", name: "React" },
      ];

      const createdTask = {
        id: "task-123",
        title: "Test Task",
        developerId: "dev-123",
        skills: skillMocks.map((skill) => ({ skill })),
        developer: { id: "dev-123", name: "John Doe" },
      };

      mockPrisma.skill.upsert
        .mockResolvedValueOnce(skillMocks[0])
        .mockResolvedValueOnce(skillMocks[1]);
      mockPrisma.task.create.mockResolvedValueOnce(createdTask);

      // Act
      await createTask(req as Request, res as Response);

      // Assert
      expect(mockPrisma.skill.upsert).toHaveBeenCalledTimes(2);
      expect(mockPrisma.task.create).toHaveBeenCalledTimes(1);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(createdTask);
    });

    it("should create a task with LLM-identified skills when no skills provided", async () => {
      // Arrange
      const taskData = { title: "Build a React dashboard" };
      req.body = taskData;

      const identifiedSkills = ["JavaScript", "React", "CSS"];
      const skillMocks = identifiedSkills.map((name, index) => ({
        id: `skill-${index + 1}`,
        name,
      }));

      const createdTask = {
        id: "task-123",
        title: "Build a React dashboard",
        skills: skillMocks.map((skill) => ({ skill })),
      };

      mockLLMService.identifySkills.mockResolvedValueOnce(identifiedSkills);
      skillMocks.forEach((skill) => {
        mockPrisma.skill.upsert.mockResolvedValueOnce(skill);
      });
      mockPrisma.task.create.mockResolvedValueOnce(createdTask);

      // Act
      await createTask(req as Request, res as Response);

      // Assert
      expect(mockLLMService.identifySkills).toHaveBeenCalledWith(
        "Build a React dashboard"
      );
      expect(mockPrisma.skill.upsert).toHaveBeenCalledTimes(3);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(createdTask);
    });

    it("should handle database errors gracefully", async () => {
      // Arrange
      req.body = { title: "Test Task" };
      mockPrisma.task.create.mockRejectedValueOnce(
        new Error("Database connection failed")
      );

      // Act
      await createTask(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Failed to create task" });
    });
  });

  describe("getTask", () => {
    it("should retrieve a task successfully", async () => {
      // Arrange
      const taskId = "task-123";
      req.params = { id: taskId };

      const task = {
        id: taskId,
        title: "Test Task",
        status: "TODO",
        skills: [{ skill: { id: "skill-1", name: "JavaScript" } }],
        developer: { id: "dev-1", name: "John Doe" },
        subtasks: [],
      };

      mockPrisma.task.findUnique.mockResolvedValueOnce(task);

      // Act
      await getTask(req as Request, res as Response);

      // Assert
      expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
        include: expect.objectContaining({
          skills: expect.objectContaining({
            include: { skill: true },
          }),
          developer: true,
          subtasks: expect.any(Object),
        }),
      });
      expect(jsonMock).toHaveBeenCalledWith(task);
    });

    it("should return 404 when task not found", async () => {
      // Arrange
      req.params = { id: "nonexistent-task" };
      mockPrisma.task.findUnique.mockResolvedValueOnce(null);

      // Act
      await getTask(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Task not found" });
    });

    it("should handle database errors", async () => {
      // Arrange
      req.params = { id: "task-123" };
      mockPrisma.task.findUnique.mockRejectedValueOnce(
        new Error("Database error")
      );

      // Act
      await getTask(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Failed to fetch task" });
    });
  });

  describe("getAllTasks", () => {
    it("should retrieve all root tasks with subtasks", async () => {
      // Arrange
      const tasks = [
        {
          id: "task-1",
          title: "Main Task 1",
          parentTaskId: null,
          subtasks: [{ id: "subtask-1", title: "Subtask 1" }],
        },
        {
          id: "task-2",
          title: "Main Task 2",
          parentTaskId: null,
          subtasks: [],
        },
      ];

      mockPrisma.task.findMany.mockResolvedValueOnce(tasks);

      // Act
      await getAllTasks(req as Request, res as Response);

      // Assert
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { parentTaskId: null },
        include: expect.objectContaining({
          skills: expect.objectContaining({
            include: { skill: true },
          }),
          developer: true,
          subtasks: expect.any(Object),
        }),
      });
      expect(jsonMock).toHaveBeenCalledWith(tasks);
    });

    it("should handle database errors", async () => {
      // Arrange
      mockPrisma.task.findMany.mockRejectedValueOnce(
        new Error("Database error")
      );

      // Act
      await getAllTasks(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Failed to fetch tasks" });
    });
  });

  describe("updateTask", () => {
    it("should update a task successfully", async () => {
      // Arrange
      const taskId = "task-123";
      const updateData = { title: "Updated Task", status: "In Progress" };
      req.params = { id: taskId };
      req.body = updateData;

      const updatedTask = {
        id: taskId,
        title: "Updated Task",
        status: "In Progress",
      };

      mockPrisma.task.update.mockResolvedValueOnce(updatedTask);

      // Act
      await updateTask(req as Request, res as Response);

      // Assert
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: updateData,
        include: expect.any(Object),
      });
      expect(jsonMock).toHaveBeenCalledWith(updatedTask);
    });

    it("should prevent marking task as Done when subtasks are incomplete", async () => {
      // Arrange
      const taskId = "task-123";
      req.params = { id: taskId };
      req.body = { status: "Done" };

      const taskWithIncompleteSubtasks = {
        id: taskId,
        subtasks: [
          { id: "subtask-1", status: "TODO" },
          { id: "subtask-2", status: "In Progress" },
        ],
      };

      mockPrisma.task.findUnique.mockResolvedValueOnce(
        taskWithIncompleteSubtasks
      );

      // Act
      await updateTask(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Cannot mark task as Done until all subtasks are Done",
      });
      expect(mockPrisma.task.update).not.toHaveBeenCalled();
    });

    it("should validate developer skills when assigning", async () => {
      // Arrange
      const taskId = "task-123";
      const developerId = "dev-456";
      req.params = { id: taskId };
      req.body = { developerId };

      const developer = {
        id: developerId,
        skills: [{ skill: { name: "JavaScript" } }],
      };

      const task = {
        id: taskId,
        skills: [{ skill: { name: "Python" } }, { skill: { name: "Django" } }],
      };

      mockPrisma.developer.findUnique.mockResolvedValueOnce(developer);
      mockPrisma.task.findUnique.mockResolvedValueOnce(task);

      // Act
      await updateTask(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Developer does not have the required skills for this task",
      });
      expect(mockPrisma.task.update).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      // Arrange
      req.params = { id: "task-123" };
      req.body = { title: "Updated Task" };
      mockPrisma.task.update.mockRejectedValueOnce(new Error("Database error"));

      // Act
      await updateTask(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Failed to update task" });
    });
  });

  describe("deleteTask", () => {
    it("should delete a task without subtasks", async () => {
      // Arrange
      const taskId = "task-123";
      req.params = { id: taskId };

      const task = {
        id: taskId,
        status: "TODO",
        title: "Test Task",
      };

      mockPrisma.task.findFirst.mockResolvedValueOnce(task);
      mockPrisma.task.findMany.mockResolvedValueOnce([]); // No subtasks
      mockPrisma.task.delete.mockResolvedValueOnce(task);

      // Act
      await deleteTask(req as Request, res as Response);

      // Assert
      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Task deleted successfully",
      });
    });

    it("should prevent deletion of completed tasks", async () => {
      // Arrange
      const taskId = "task-123";
      req.params = { id: taskId };

      const completedTask = {
        id: taskId,
        status: "Done",
        title: "Completed Task",
      };

      mockPrisma.task.findFirst.mockResolvedValueOnce(completedTask);

      // Act
      await deleteTask(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "A completed task cannot be deleted",
      });
      expect(mockPrisma.task.delete).not.toHaveBeenCalled();
    });

    it("should delete task with all its subtasks", async () => {
      // Arrange
      const taskId = "task-123";
      req.params = { id: taskId };

      const task = { id: taskId, status: "TODO", title: "Test Task" };
      const subtasks = [
        { id: "subtask-1", parentTaskId: taskId },
        { id: "subtask-2", parentTaskId: taskId },
      ];

      mockPrisma.task.findFirst.mockResolvedValueOnce(task);
      mockPrisma.task.findMany.mockResolvedValueOnce(subtasks);
      mockPrisma.task.deleteMany.mockResolvedValueOnce({ count: 2 });
      mockPrisma.task.delete.mockResolvedValueOnce(task);

      // Act
      await deleteTask(req as Request, res as Response);

      // Assert
      expect(mockPrisma.task.deleteMany).toHaveBeenCalledWith({
        where: { parentTaskId: taskId },
      });
      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Task deleted successfully",
      });
    });

    it("should handle database errors", async () => {
      // Arrange
      req.params = { id: "task-123" };
      mockPrisma.task.findFirst.mockRejectedValueOnce(
        new Error("Database error")
      );

      // Act
      await deleteTask(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Failed to delete task" });
    });
  });

  describe("updateTaskAndSubtasks", () => {
    it("should update task and its subtasks", async () => {
      // Arrange
      const taskId = "task-123";
      req.params = { id: taskId };
      req.body = {
        title: "Updated Main Task",
        status: "In Progress",
        subtasks: [
          { id: "subtask-1", title: "Updated Subtask 1", status: "Done" },
          {
            id: "subtask-2",
            title: "Updated Subtask 2",
            status: "In Progress",
          },
        ],
      };

      const updatedTask = {
        id: taskId,
        title: "Updated Main Task",
        status: "In Progress",
      };

      mockPrisma.task.update
        .mockResolvedValueOnce(updatedTask) // Main task update
        .mockResolvedValueOnce({ id: "subtask-1" }) // First subtask update
        .mockResolvedValueOnce({ id: "subtask-2" }); // Second subtask update

      // Act
      await updateTaskAndSubtasks(req as Request, res as Response);

      // Assert
      expect(mockPrisma.task.update).toHaveBeenCalledTimes(3); // 1 main + 2 subtasks
      expect(jsonMock).toHaveBeenCalledWith(updatedTask);
    });

    it("should update only the main task when no subtasks provided", async () => {
      // Arrange
      const taskId = "task-123";
      req.params = { id: taskId };
      req.body = { title: "Updated Task", status: "In Progress" };

      const updatedTask = {
        id: taskId,
        title: "Updated Task",
        status: "In Progress",
      };

      mockPrisma.task.update.mockResolvedValueOnce(updatedTask);

      // Act
      await updateTaskAndSubtasks(req as Request, res as Response);

      // Assert
      expect(mockPrisma.task.update).toHaveBeenCalledTimes(1);
      expect(jsonMock).toHaveBeenCalledWith(updatedTask);
    });

    it("should handle database errors", async () => {
      // Arrange
      req.params = { id: "task-123" };
      req.body = { title: "Updated Task" };
      mockPrisma.task.update.mockRejectedValueOnce(new Error("Database error"));

      // Act
      await updateTaskAndSubtasks(req as Request, res as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Failed to update task and subtasks",
      });
    });
  });
});
