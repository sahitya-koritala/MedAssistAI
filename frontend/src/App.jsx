import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TranslationProvider } from "./context/TranslationContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <Router>
      <TranslationProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </TranslationProvider>
    </Router>
  );
}
