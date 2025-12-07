//TaskCard.tsx
//Function:
//This file contains the TaskCard component, which displays a task and allows the user to update it.
//It supports updating the task's status and assignee, and includes options to edit or delete the task.

//Imported Components:
//Task: Type definition for the task structure.
//useMutate, useQuery, useQueryClient: React Query hooks for data fetching and mutations.
//BorderColor: Helper for determining border colors based on depth level.
//STATUS_OPTIONS: Predefined status options for tasks.
//DialogModal: A modal component for displaying confirmation dialogs.

import { Task } from "../types";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PencilIcon from "@mui/icons-material/Edit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { taskApi } from "../api/taskApi";
import { developerApi } from "../api/developerApi";
import { BorderColor, STATUS_OPTIONS } from "../helpers/helper";
import DialogModal from "./DialogModal";
interface TaskCardProps {
  task: Task;
  depth?: number;
}

export default function TaskCard({ task, depth = 0 }: TaskCardProps) {
  const queryClient = useQueryClient();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const navigate = useNavigate();

  // To fetch initial developers list for assignee selection
  const { data: developers = [] } = useQuery({
    queryKey: ["developers"], // Unique key for the query
    queryFn: developerApi.getDevelopers, // API call function to fetch developers
  });

  // handle data mutations
  const updateTaskMutation = useMutation({
    mutationFn: (
      { id, payload }: { id: string; payload: Partial<Task> } //function to api call
    ) => taskApi.updateTask(id, payload),
    onSuccess: () => {
      // callback on success
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleStatusChange = (newStatus: string) => {
    updateTaskMutation.mutate({
      id: task.id,
      payload: { status: newStatus },
    });
  };

  const handleDeveloperChange = (developerId: string) => {
    // trigger the mutation to update the task's developer
    updateTaskMutation.mutate({
      id: task.id,
      payload: { developerId: developerId || null },
    });
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteTaskMutation.mutate(task.id);
    setDeleteConfirmOpen(false);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  const indentClass = depth > 0 ? `ml-${depth * 8}` : "";
  const borderColor =
    depth === 0
      ? BorderColor.grey
      : depth === 1
      ? BorderColor.blue
      : depth === 2
      ? BorderColor.purple
      : BorderColor.green;

  return (
    <div className={`${indentClass} mb-4`}>
      <Card className={`border-l-4 ${borderColor}`}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {task.title}
          </Typography>

          <Box className="flex flex-wrap gap-2 mb-3">
            {task.skills.map((taskSkill) => (
              <Chip
                key={taskSkill.id}
                label={taskSkill.skill.name}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>

          <Box className="flex gap-4 items-center">
            <FormControl size="small" className="w-40">
              <InputLabel>Status</InputLabel>
              <Select
                value={task.status}
                label="Status"
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" className="w-48">
              <InputLabel>Assignee</InputLabel>
              <Select
                value={task.developerId || ""}
                label="Assignee"
                onChange={(e) => handleDeveloperChange(e.target.value)}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {developers.map((dev) => (
                  <MenuItem key={dev.id} value={dev.id}>
                    {dev.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {task.developer && (
              <Typography variant="body2" color="text.secondary">
                Assigned to: {task.developer.name}
              </Typography>
            )}

            <div className="flex ml-auto items-center">
              {depth === 0 && (
                <Tooltip title="Edit Task">
                  <PencilIcon
                    className="cursor-pointer text-blue-600 hover:text-blue-800 mr-4"
                    onClick={() => navigate("/update/" + task.id)}
                    // onClick={() => {
                    //   // Navigate to update page
                    //   window.location.href = `/update/${task.id}`;
                    // }}
                  />
                </Tooltip>
              )}
              <Tooltip title="Delete Task (Please note: Deleting a task will also delete all its subtasks)">
                <DeleteIcon
                  className="cursor-pointer text-red-600 hover:text-red-800"
                  onClick={handleDeleteClick}
                />
              </Tooltip>
            </div>
          </Box>
          {deleteTaskMutation.isError && (
            <Typography variant="body2" color="error" className="mt-2">
              {(deleteTaskMutation.error as any)?.response?.data?.error ||
                "Delete failed"}
            </Typography>
          )}

          {updateTaskMutation.isError && (
            <Typography variant="body2" color="error" className="mt-2">
              {(updateTaskMutation.error as any)?.response?.data?.error ||
                "Update failed"}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DialogModal
        open={deleteConfirmOpen}
        title="Delete Task"
        content={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        additionalContent={
          task.subtasks && task.subtasks.length > 0 ? (
            <span className="block mt-2 text-red-600 font-medium">
              Warning: This will also delete {task.subtasks.length} subtask(s).
            </span>
          ) : undefined
        }
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-2 pl-4 border-l border-gray-300">
          {task.subtasks.map((subtask) => (
            <TaskCard key={subtask.id} task={subtask} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
