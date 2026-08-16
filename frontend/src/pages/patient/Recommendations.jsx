import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Apple, Dumbbell, Moon, Droplets, Calendar, Clock, Heart, Utensils, Coffee, Bed, Activity } from "lucide-react";
import { apiRequest } from "../../services/api";

export default function Recommendations() {
  const [healthData, setHealthData] = useState({
    age: "",
    weight: "",
    height: "",
    gender: "",
    activityLevel: "",
    healthConditions: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const generateRecommendations = async () => {
    if (!healthData.age || !healthData.weight || !healthData.height) return;

    setIsGenerating(true);
    try {
      const response = await apiRequest("/gemini/recommendations", {
        method: "POST",
        body: JSON.stringify({
          age: parseInt(healthData.age),
          weight: parseFloat(healthData.weight),
          height: parseFloat(healthData.height),
          gender: healthData.gender,
          activityLevel: healthData.activityLevel,
          healthConditions: healthData.healthConditions || ""
        })
      });

      if (response && response.bmi) {
        setRecommendations(response);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("AI recommendations call failed, using client-side fallback:", error);
      
      // Client-side fallback calculation in case the API completely fails
      const heightInMeters = healthData.height / 100;
      const bmi = (healthData.weight / (heightInMeters * heightInMeters)).toFixed(1);
      const bmiCategory = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
      
      let calories = Math.round(2000 + (healthData.weight * 10));
      let include = ["Whole foods", "Leafy greens", "Healthy proteins"];
      let avoid = ["Processed sugar", "Trans fats"];
      
      if (bmiCategory === "Underweight") {
        calories += 300;
        include.push("Nuts", "Healthy oils");
      } else if (bmiCategory === "Overweight" || bmiCategory === "Obese") {
        calories -= 300;
        include.push("Fiber-rich vegetables");
        avoid.push("Refined carbohydrates");
      }
      
      const fallback = {
        bmi: bmi,
        bmiCategory: bmiCategory,
        dietPlan: {
          calories: calories,
          meals: [
            { time: "Breakfast (7-8 AM)", foods: ["Oatmeal with fruits", "Greek yogurt"] },
            { time: "Mid-Morning Snack (10 AM)", foods: ["Fresh fruit", "Nuts"] },
            { time: "Lunch (12-1 PM)", foods: ["Grilled protein", "Brown rice", "Vegetables"] },
            { time: "Evening Snack (4 PM)", foods: ["Protein shake or fruit"] },
            { time: "Dinner (7-8 PM)", foods: ["Lean protein", "Quinoa", "Soup"] }
          ],
          foodsToInclude: include,
          foodsToAvoid: avoid
        },
        exercisePlan: {
          weeklySchedule: [
            { day: "Monday", type: "Cardio", duration: "30 mins", activity: "Light jogging or walking" },
            { day: "Tuesday", type: "Strength", duration: "30 mins", activity: "Bodyweight training" },
            { day: "Wednesday", type: "Cardio", duration: "30 mins", activity: "Cycling or swimming" },
            { day: "Thursday", type: "Rest", duration: "-", activity: "Light stretching" },
            { day: "Friday", type: "Strength", duration: "30 mins", activity: "Resistance training" },
            { day: "Saturday", type: "Cardio", duration: "30 mins", activity: "Brisk walking" },
            { day: "Sunday", type: "Rest", duration: "-", activity: "Rest" }
          ],
          dailySteps: bmiCategory === "Normal" ? 10000 : 8000,
          workoutTips: ["Warm up properly", "Stay hydrated", "Listen to your body"]
        },
        lifestyle: {
          waterIntake: `${Math.round(healthData.weight * 0.033)} liters daily`,
          sleep: "7-9 hours per night",
          stressManagement: ["Deep breathing", "Meditation"],
          habits: ["Eat at regular hours", "Stand up every hour"]
        },
        followUpReminder: {
          nextCheckup: "3 months",
          recommendedTests: ["Complete Blood Count", "Blood sugar check"],
          monitoring: ["Weight weekly", "Energy levels daily"]
        }
      };
      
      setRecommendations(fallback);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Recommendations</h1>
          <p className="text-gray-600">Personalized diet, exercise, and lifestyle recommendations based on your health data</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Health Data Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Your Health Data
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Age</label>
                <input
                  type="number"
                  value={healthData.age}
                  onChange={(e) => setHealthData({...healthData, age: e.target.value})}
                  placeholder="Years"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={healthData.weight}
                  onChange={(e) => setHealthData({...healthData, weight: e.target.value})}
                  placeholder="Kilograms"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={healthData.height}
                  onChange={(e) => setHealthData({...healthData, height: e.target.value})}
                  placeholder="Centimeters"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Gender</label>
                <select
                  value={healthData.gender}
                  onChange={(e) => setHealthData({...healthData, gender: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Activity Level</label>
                <select
                  value={healthData.activityLevel}
                  onChange={(e) => setHealthData({...healthData, activityLevel: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select</option>
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light Activity</option>
                  <option value="moderate">Moderate Activity</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Existing Health Conditions</label>
                <input
                  type="text"
                  value={healthData.healthConditions || ""}
                  onChange={(e) => setHealthData({...healthData, healthConditions: e.target.value})}
                  placeholder="e.g. Diabetes, Hypertension, Asthma"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={generateRecommendations}
                disabled={!healthData.age || !healthData.weight || !healthData.height || isGenerating}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Recommendations
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Recommendations Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            {!recommendations ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
                <Sparkles className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">AI-Powered Health Recommendations</p>
                <p className="text-sm">Enter your health data to get personalized diet, exercise, and lifestyle recommendations</p>
              </div>
            ) : (
              <>
                {/* BMI Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    BMI Overview
                  </h2>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-emerald-600">{recommendations.bmi}</p>
                      <p className="text-sm text-gray-600">BMI</p>
                    </div>
                    <div className="flex-1">
                      <div className={`px-4 py-2 rounded-xl text-center font-semibold ${
                        recommendations.bmiCategory === "Normal" ? "bg-green-100 text-green-700" :
                        recommendations.bmiCategory === "Underweight" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {recommendations.bmiCategory}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Diet Plan */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-sm p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-emerald-600" />
                    Diet Plan
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <p className="text-sm text-gray-600">Daily Calories</p>
                      <p className="text-2xl font-bold text-emerald-700">{recommendations.dietPlan.calories} kcal</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-gray-600">Daily Meals</p>
                      <p className="text-2xl font-bold text-blue-700">5 meals</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {recommendations.dietPlan.meals.map((meal, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-gray-900">{meal.time}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {meal.foods.map((food, i) => (
                            <span key={i} className="px-2 py-1 bg-white text-gray-700 rounded-lg text-xs border">
                              {food}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-xl">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Apple className="w-4 h-4 text-green-600" />
                        Foods to Include
                      </h3>
                      <ul className="space-y-1">
                        {recommendations.dietPlan.foodsToInclude.map((food, index) => (
                          <li key={index} className="text-sm text-gray-700">✓ {food}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-red-600" />
                        Foods to Avoid
                      </h3>
                      <ul className="space-y-1">
                        {recommendations.dietPlan.foodsToAvoid.map((food, index) => (
                          <li key={index} className="text-sm text-gray-700">✗ {food}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>

                {/* Exercise Plan */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-sm p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-emerald-600" />
                    Exercise Plan
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <p className="text-sm text-gray-600">Daily Steps Goal</p>
                      <p className="text-2xl font-bold text-purple-700">{recommendations.exercisePlan.dailySteps.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-xl">
                      <p className="text-sm text-gray-600">Weekly Workout Days</p>
                      <p className="text-2xl font-bold text-orange-700">5 days</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto mb-4">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">Day</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">Type</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">Duration</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-gray-900">Activity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recommendations.exercisePlan.weeklySchedule.map((schedule, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-2 px-3 text-sm text-gray-900 font-medium">{schedule.day}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                schedule.type === "Rest" ? "bg-gray-100 text-gray-700" :
                                schedule.type === "Cardio" ? "bg-blue-100 text-blue-700" :
                                "bg-purple-100 text-purple-700"
                              }`}>
                                {schedule.type}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-600">{schedule.duration}</td>
                            <td className="py-2 px-3 text-sm text-gray-700">{schedule.activity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Workout Tips</h3>
                    <ul className="space-y-1">
                      {recommendations.exercisePlan.workoutTips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-700">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>

                {/* Lifestyle */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-sm p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-emerald-600" />
                    Lifestyle Recommendations
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="p-4 bg-blue-50 rounded-xl text-center">
                      <Droplets className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-gray-600">Water Intake</p>
                      <p className="text-lg font-bold text-blue-700">{recommendations.lifestyle.waterIntake}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl text-center">
                      <Moon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm text-gray-600">Sleep</p>
                      <p className="text-lg font-bold text-purple-700">{recommendations.lifestyle.sleep}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl text-center">
                      <Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="text-sm text-gray-600">Activity</p>
                      <p className="text-lg font-bold text-green-700">Regular</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h3 className="font-semibold text-gray-900 mb-2">Stress Management</h3>
                      <ul className="space-y-1">
                        {recommendations.lifestyle.stressManagement.map((item, index) => (
                          <li key={index} className="text-sm text-gray-700">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h3 className="font-semibold text-gray-900 mb-2">Healthy Habits</h3>
                      <ul className="space-y-1">
                        {recommendations.lifestyle.habits.map((habit, index) => (
                          <li key={index} className="text-sm text-gray-700">• {habit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>

                {/* Follow-up */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl shadow-sm p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    Follow-up Reminder
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <p className="text-sm text-gray-600">Next Checkup</p>
                      <p className="text-lg font-bold text-emerald-700">{recommendations.followUpReminder.nextCheckup}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-gray-600">Recommended Tests</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {recommendations.followUpReminder.recommendedTests.map((test, index) => (
                          <span key={index} className="px-2 py-1 bg-white text-blue-700 rounded-lg text-xs border">
                            {test}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-yellow-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">Regular Monitoring</h3>
                    <div className="flex flex-wrap gap-2">
                      {recommendations.followUpReminder.monitoring.map((item, index) => (
                        <span key={index} className="px-3 py-1 bg-white text-yellow-700 rounded-lg text-sm border">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <button
                  onClick={() => {
                    setRecommendations(null);
                    setHealthData({ age: "", weight: "", height: "", gender: "", activityLevel: "" });
                  }}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Generate New Recommendations
                </button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
