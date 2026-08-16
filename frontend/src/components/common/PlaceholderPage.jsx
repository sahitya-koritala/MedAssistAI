import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export default function PlaceholderPage({ title, description, icon: Icon = Sparkles }) {
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-emerald-50 rounded-3xl flex items-center justify-center">
            <Icon className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {description || "This module is currently under development and will be available soon."}
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Coming Soon
          </div>
        </motion.div>
      </div>
    </div>
  );
}
