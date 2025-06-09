import type { RouteObject } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import Chat from "./pages/Chat";
import ConversationHistory from "./pages/ConversationHistory";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/conversations",
    element: (
      <ProtectedRoute>
        <ConversationHistory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/chat/:conversationId",
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    ),
  },
  {
    path: "/404",
    element: <NotFound />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
