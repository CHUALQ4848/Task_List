//TaskForm.tsx
//Function:
//This file contains form component which is reusable for creating and updating tasks.
//It manages the state for task title, skills, and subtasks, and handles form submission.
//The component also integrates the SubtaskForm component to manage nested subtasks.

//Imported Components:
//CreateTaskPayload: Type definition for the task payload structure.
//SubtaskFormComponent: The SubtaskForm component for handling subtasks.
import { useState } from "react";
import { Button, TextField, Typography, Box, Alert } from "@mui/material";
import { CreateTaskPayload, Task } from "../types";
import SubtaskFormComponent from "./SubtaskForm";

interface TaskFormProps {
  initialData?: Task;
  onSubmit: (payload: CreateTaskPayload) => void;
  onCancel?: () => void;
  submitButtonText?: string;
  isLoading?: boolean;
  error?: string;
}

export default function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  submitButtonText = "Save Task",
  isLoading = false,
  error,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [skills, setSkills] = useState(
    initialData?.skills?.map((ts) => ts.skill.name).join(", ") || ""
  );
  //Init subtasks state with preserved ids for editing and add nesting control for nested subtasks if there is
  const [subtasks, setSubtasks] = useState<
    (CreateTaskPayload & { id?: string })[]
  >(
    initialData?.subtasks?.map((subtask) => ({
      id: subtask.id, // Preserve the existing subtask ID
      title: subtask.title,
      skills: subtask.skills?.map((ts) => ts.skill.name),
      subtasks: subtask.subtasks?.map((nestedSubtask) => ({
        id: nestedSubtask.id, // Preserve nested subtask ID
        title: nestedSubtask.title,
        skills: nestedSubtask.skills?.map((ts) => ts.skill.name),
        subtasks: undefined, // Limit nesting for simplicity
      })),
    })) || []
  );

  const addSubtask = () => {
    setSubtasks([...subtasks, { title: "", subtasks: [] }]);
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubTaskChange = (
    index: number,
    updatedSubtask: CreateTaskPayload & { id?: string }
  ) => {
    setSubtasks((prev) =>
      prev.map((item, i) => (i === index ? updatedSubtask : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateTaskPayload = {
      title,
      skills: skills
        ? skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Box className="space-y-4">
        <TextField
          fullWidth
          label="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <TextField
          fullWidth
          label="Skills (comma-separated, optional)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          helperText="Leave empty to auto-detect using AI"
        />

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="h6">Subtasks</Typography>
            <Button type="button" variant="outlined" onClick={addSubtask}>
              Add Subtask
            </Button>
          </div>

          {subtasks.map((subtask, index) => (
            <SubtaskFormComponent
              key={index}
              onRemove={() => removeSubtask(index)}
              onSetSubtasks={(data) => handleSubTaskChange(index, data[0])}
              depth={1}
              initialData={subtask}
            />
          ))}
        </div>

        <Box className="flex gap-4 mt-6">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : submitButtonText}
          </Button>
          {onCancel && (
            <Button type="button" variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </Box>
      </Box>
    </form>
  );
}
