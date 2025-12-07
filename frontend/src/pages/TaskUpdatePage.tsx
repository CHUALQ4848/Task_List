//TaskUpdatePage.tsx
//Function:
//This file contains the TaskUpdatePage component, which provides a page for updating a task.

//Imported Components:
//TaskForm: A form component for creating or updating tasks.
//Container: A Material-UI container component.
//Typography: A Material-UI typography component.

//Imported Hooks:
//useQuery: A TanStack React Query query hook.
//useParams: A React Router hook for accessing URL parameters.

import TaskForm from "../components/TaskForm";
import { Container, Typography } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "../api/taskApi";
import { useParams, useNavigate } from "react-router-dom";
import { CreateTaskPayload } from "../types";

export default function TaskUpdatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: task,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["task", id],
    queryFn: () => taskApi.getTask(id as string),
    enabled: !!id,
  });

  const updateTaskMutation = useMutation({
    mutationFn: (payload: CreateTaskPayload) => {
      // Transform CreateTaskPayload to match the updateTaskAndSubtasks API expectations
      const mapSubtasksWithIds = (
        payloadSubtasks: CreateTaskPayload[],
        originalSubtasks?: any[]
      ): any[] => {
        return payloadSubtasks.map((subtask, index) => {
          const originalSubtask = originalSubtasks?.[index];
          return {
            id: originalSubtask?.id, // Include existing ID if available
            title: subtask.title,
            skills: subtask.skills,
            subtasks: subtask.subtasks
              ? mapSubtasksWithIds(subtask.subtasks, originalSubtask?.subtasks)
              : undefined,
          };
        });
      };
      console.log("Updating task with payload:", payload);
      const updatePayload = {
        title: payload.title,
        skills: payload.skills,
        subtasks: payload.subtasks
          ? mapSubtasksWithIds(payload.subtasks, task?.subtasks)
          : undefined,
      };
      return taskApi.updateTaskAndSubtasks(id as string, updatePayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      navigate("/");
    },
  });

  const handleSubmit = (payload: CreateTaskPayload) => {
    updateTaskMutation.mutate(payload);
  };

  const handleCancel = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <Container className="flex justify-center items-center min-h-screen">
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (isError || !task) {
    return (
      <Container className="py-8">
        <Typography color="error">
          Failed to load task. Please try again.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className="py-8">
      <Typography variant="h4" component="h1" gutterBottom>
        Update Task
      </Typography>

      <TaskForm
        initialData={task}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitButtonText="Update Task"
        isLoading={updateTaskMutation.isPending}
        error={
          updateTaskMutation.isError
            ? "Failed to update task. Please try again."
            : undefined
        }
      />
    </Container>
  );
}
