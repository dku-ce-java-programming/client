import { useRoutes } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { routes } from "./routes";

function App() {
  const element = useRoutes(routes);

  return (
    <AuthProvider>
      {element}
      <Toaster />
    </AuthProvider>
  );
}

export default App;
