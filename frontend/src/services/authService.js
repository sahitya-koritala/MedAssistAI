import { apiRequest } from "./api";
import { Role } from "../types";
import { hospitalDataService } from "./hospitalDataService";

export const authService = {
  // ======================================================
  // LOGIN OR REGISTER WITH IDENTIFIER + ROLE
  // ======================================================

  login: async (credentials) => {
    try {
      // First try to login
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials)
      });
      
      // Save session
      localStorage.setItem("medico_session", JSON.stringify(data.user));
      localStorage.setItem("medico_token", data.token);
      
      // Restore user's language preference
      if (data.user.language) {
        import('../i18n').then(m => m.default.changeLanguage(data.user.language));
      }
      
      return { user: data.user };
    } catch (error) {
      throw error;
    }
  },

  // ======================================================
  // COMPLETE PROFILE
  // ======================================================

  completeProfile: async (userId, profileData) => {
    try {
      const data = await apiRequest("/users/profile", {
        method: "PUT",
        body: JSON.stringify(profileData)
      });
      
      localStorage.setItem("medico_session", JSON.stringify(data.user));

      // For mock compatibility, add to hospitalDataService if patient
      if (data.user.role === Role.PATIENT) {
        const existingPatient = hospitalDataService.getPatientById(data.user.id);
        if (!existingPatient) {
          hospitalDataService.addPatient(data.user);
          hospitalDataService.addNotification({
            title: "Welcome to MedAssist AI!",
            message: `Hello ${data.user.name}! Your profile has been created successfully.`,
            type: "info",
            targetRoles: [Role.PATIENT],
            targetUserId: data.user.id
          });
        }
      }

      return { user: data.user };
    } catch (error) {
      throw error;
    }
  },

  // ======================================================
  // LOGOUT
  // ======================================================

  logout: async () => {
    localStorage.removeItem("medico_session");
    localStorage.removeItem("medico_token");
    return { message: "Logged out" };
  },

  // ======================================================
  // GET CURRENT USER
  // ======================================================

  getMe: async () => {
    try {
      const data = await apiRequest("/auth/me", {
        method: "GET"
      });
      localStorage.setItem("medico_session", JSON.stringify(data.user));
      
      if (data.user.language) {
        import('../i18n').then(m => m.default.changeLanguage(data.user.language));
      }
      
      return { user: data.user };
    } catch (error) {
      localStorage.removeItem("medico_session");
      localStorage.removeItem("medico_token");
      throw new Error("Unauthorized");
    }
  },
  
  // ======================================================
  // SET LANGUAGE
  // ======================================================
  
  setLanguage: async (language) => {
    try {
      await apiRequest("/users/language", {
        method: "PUT",
        body: JSON.stringify({ language })
      });
      return true;
    } catch (error) {
      console.error("Failed to save language preference", error);
      return false;
    }
  }
};
