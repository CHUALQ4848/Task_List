//TaskCreationPage.tsx
//Function:
//This file contains the TaskCreationPage component, which provides an interface for users to create new tasks.
//It utilizes the TaskForm component to handle the task creation form and manages the submission process
//by interacting with the task API and updating the task list upon successful creation.

//Imported Components:
//useMutation, useQueryClient: React Query hooks for managing server state and mutations
//taskApi: API functions for task-related operations.
//CreateTaskPayload: Type definition for the task payload structure.
//TaskForm: The TaskForm component for handling task creation form.
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Container, Typography } from "@mui/material";
import { taskApi } from "../api/taskApi";
import { CreateTaskPayload } from "../types";
import TaskForm from "../components/TaskForm";

export default function TaskCreationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      navigate("/");
    },
  });

  const handleSubmit = (payload: CreateTaskPayload) => {
    createTaskMutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <Container maxWidth="md" className="py-8">
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Task
      </Typography>

      <TaskForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitButtonText="Create Task"
        isLoading={createTaskMutation.isPending}
        error={
          createTaskMutation.isError
            ? "Failed to create task. Please try again."
            : undefined
        }
      />
    </Container>
  );
}
