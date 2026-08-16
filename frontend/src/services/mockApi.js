import { apiRequest } from "./api";

export const mockApi = {
  // Symptom/Disease Prediction (Now using real Gemini API)
  predictDisease: async (symptoms, additionalInfo) => {
    try {
      // Create prompt for Gemini
      const data = await apiRequest("/gemini/predict", {
        method: "POST",
        body: JSON.stringify({ symptoms, additionalInfo })
      });
      return data;
    } catch (error) {
      console.error("Prediction failed:", error);
      return { success: false, message: error.message };
    }
  },

  // Medical Image Analysis
  analyzeImage: async (imageFile, imageType) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockResults = {
      "xray": {
        prediction: "No acute abnormalities detected",
        confidence: 0.92,
        explanation: "The chest X-ray shows clear lung fields, normal heart size, and no evidence of pneumonia or fractures.",
        recommendations: ["Routine follow-up recommended"]
      },
      "mri": {
        prediction: "Mild degenerative changes",
        confidence: 0.88,
        explanation: "The MRI scan shows mild degenerative disc disease at L4-L5, no herniation or nerve impingement.",
        recommendations: ["Physical therapy", "Follow up with orthopedist"]
      },
      "ct": {
        prediction: "Normal study",
        confidence: 0.94,
        explanation: "CT scan of the chest/abdomen shows no pathological findings.",
        recommendations: ["Continue with current care plan"]
      },
      "skin": {
        prediction: "Benign lesion",
        confidence: 0.87,
        explanation: "Skin lesion appears to be a benign nevus (mole) with no atypical features.",
        recommendations: ["Monitor for changes", "Annual skin check"]
      }
    };
    return { success: true, ...mockResults[imageType] || mockResults.xray };
  },

  // Medical Report Analysis
  analyzeReport: async (file) => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return {
      success: true,
      summary: "Patient is a 35-year-old male with mild anemia and slightly elevated white blood cell count, likely due to a recent viral infection.",
      explanation: "Hemoglobin levels are slightly below normal (11.2 g/dL, normal 12-16), and WBC count is elevated at 12,500/μL (normal 4,500-11,000).",
      abnormalValues: [
        { test: "Hemoglobin", value: "11.2 g/dL", normal: "12.0-16.0 g/dL", status: "Low" },
        { test: "WBC Count", value: "12,500/μL", normal: "4,500-11,000/μL", status: "High" }
      ],
      recommendations: ["Increase iron-rich foods", "Stay hydrated", "Follow up with GP in 2 weeks"]
    };
  },

  // AI Health Recommendations
  getRecommendations: async (healthProfile) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      success: true,
      diet: ["Increase leafy greens", "Stay hydrated (2-3L water/day)", "Limit processed sugar"],
      exercise: ["30 min brisk walk daily", "Strength training twice weekly"],
      lifestyle: ["7-8 hours sleep per night", "Stress management (meditation)"],
      followUp: "Routine check-up in 6 months"
    };
  }
};
