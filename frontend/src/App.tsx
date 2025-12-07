import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TaskListPage from "./pages/TaskListPage";
import TaskCreationPage from "./pages/TaskCreationPage";
import TaskUpdatePage from "./pages/TaskUpdatePage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TaskListPage />} />
          <Route path="/create" element={<TaskCreationPage />} />
          <Route path="/update/:id" element={<TaskUpdatePage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
