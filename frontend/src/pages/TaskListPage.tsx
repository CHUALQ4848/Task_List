//TaskListPage.tsx
//Function:
//This file contains the TaskListPage component, which displays a list of tasks fetched from the API.
//It provides an interface for users to view existing tasks and navigate to the task creation page.

//Imported Components:
//useQuery: React Query hook for data fetching.
//taskApi: API functions for fetching tasks.
//TaskCard: Component to display individual task details.
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { taskApi } from "../api/taskApi";
import TaskCard from "../components/TaskCard";

export default function TaskListPage() {
  const navigate = useNavigate();

  const {
    data: tasks = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: taskApi.getTasks,
  });

  if (isLoading) {
    return (
      <Container className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="py-8">
        <Alert severity="error">Failed to load tasks. Please try again.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1">
          Task List
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/create")}
        >
          Create New Task
        </Button>
      </Box>
      <div className="ml-2 mb-4 text-sm text-gray-600">
        Card View -<span className="ml-2 font-bold text-gray-500">Grey:</span>{" "}
        Top-level Task
        <span className="ml-2 font-bold text-blue-500">Blue:</span> Subtask
        Level 1<span className="ml-2 font-bold text-purple-500">Purple:</span>{" "}
        Subtask Level 2
        <span className="ml-2 font-bold text-green-500">Green:</span> Subtask
        Level 3
      </div>
      {tasks.length === 0 ? (
        <Alert severity="info">No tasks yet. Create your first task!</Alert>
      ) : (
        <div>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </Container>
  );
}
