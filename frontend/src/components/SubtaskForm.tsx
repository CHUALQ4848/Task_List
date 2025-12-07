//SubtaskForm.tsx
//Function:
//This file contains the SubtaskForm component, which displays a form for creating or updating subtasks.
//It supports nested subtasks up to three levels deep and allows users to add or remove subtasks dynamically.
//By handling the state changes and progating the data back to parent components and this is to ensure that the
//subtask data is correctly managed.

//Imported Components:
//CreateTaskPayload: Type definition for the task payload structure.
//BorderColor: Helper for determining border colors based on depth level.

import { useState, useEffect } from "react";
import { CreateTaskPayload } from "../types";
import { BorderColor } from "../helpers/helper";

type SubtaskData = CreateTaskPayload & { id?: string };

interface SubtaskFormProps {
  onRemove: () => void;
  onSetSubtasks?: (subtasks: SubtaskData[]) => void;
  depth: number;
  initialData?: SubtaskData;
}

export default function SubtaskForm({
  onRemove,
  onSetSubtasks,
  depth,
  initialData,
}: SubtaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [skills, setSkills] = useState(initialData?.skills?.join(", ") || "");
  const [subtasks, setSubtasks] = useState<SubtaskData[]>(
    initialData?.subtasks || []
  );
  const [showSubtasks, setShowSubtasks] = useState(
    (initialData?.subtasks?.length || 0) > 0
  );

  const addSubtask = () => {
    setSubtasks([...subtasks, { title: "", skills: [] }]);
    setShowSubtasks(true);
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleTitleChange = (title: string) => {
    setTitle(title);
  };

  const handleSkillsChange = (skills: string) => {
    setSkills(skills);
  };

  // Take the index to identify which subtask to update
  const handleSubTaskChange = (index: number, updatedSubtask: SubtaskData) => {
    setSubtasks((prevSubtasks) => {
      const newSubtasks = [...prevSubtasks];
      newSubtasks[index] = updatedSubtask;
      return newSubtasks;
    });
  };

  // Propagate changes back to parent component to make sure data is sycnced
  useEffect(() => {
    if (onSetSubtasks) {
      onSetSubtasks([getSubtaskData()]);
    }
  }, [title, skills, subtasks, onSetSubtasks]);

  const getSubtaskData = (): SubtaskData => {
    return {
      id: initialData?.id, // Preserve the existing ID
      title,
      skills: skills
        ? skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    };
  };

  return (
    <div
      className={`border-l-4 pl-4 mb-4 ${
        depth === 1
          ? BorderColor.blue
          : depth === 2
          ? BorderColor.green
          : BorderColor.purple
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Subtask title"
            value={title}
            onChange={(e) => {
              handleTitleChange(e.target.value);
            }}
            className="w-full px-3 py-2 border rounded-lg mb-2"
          />
          <input
            type="text"
            placeholder="Skills (comma-separated, optional)"
            value={skills}
            onChange={(e) => handleSkillsChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg mb-2"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Remove
        </button>
      </div>

      {depth < 3 && (
        <button
          type="button"
          onClick={addSubtask}
          className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 mb-2"
        >
          Add Nested Subtask
        </button>
      )}

      {showSubtasks && subtasks.length > 0 && (
        <div className="mt-2">
          {subtasks.map((subtask, index) => (
            <SubtaskForm
              key={index}
              onRemove={() => removeSubtask(index)}
              onSetSubtasks={(data) => handleSubTaskChange(index, data[0])}
              depth={depth + 1}
              initialData={subtask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
