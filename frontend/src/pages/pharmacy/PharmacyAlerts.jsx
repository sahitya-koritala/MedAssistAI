
import { useState, useEffect } from "react";
import { AlertCircle, Pill, TrendingUp } from "lucide-react";
import { hospitalDataService } from "../../services/hospitalDataService";

export default function PharmacyAlerts() {
  const [medications, setMedications] = useState(hospitalDataService.getMedications());
  
  const lowStockMeds = medications.filter(m => m.quantity <= 10);
  const expiringSoonMeds = medications.filter(m => {
    if (!m.expiryDate) return false;
    const expiry = new Date(m.expiryDate);
    const now = new Date();
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >0;
  });
  const outOfStockMeds = medications.filter(m => !m.available || m.quantity === 0);

  return (
    <div className="min-h-[80vh] bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Low Stock Alerts</h1>
          <p className="text-gray-500">Automatically shows medicines below threshold, expiry alerts, and more</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Low Stock</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-700">{lowStockMeds.length}</p>
            <p className="text-sm text-gray-600">Medicines with less than 10 units</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Pill className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Expiring Soon</h3>
            </div>
            <p className="text-3xl font-bold text-red-700">{expiringSoonMeds.length}</p>
            <p className="text-sm text-gray-600">Medicines expiring in 30 days</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Out of Stock</h3>
            </div>
            <p className="text-3xl font-bold text-gray-700">{outOfStockMeds.length}</p>
            <p className="text-sm text-gray-600">Medicines completely out of stock</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lowStockMeds.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Low Stock Medicines</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {lowStockMeds.map(m => (
                  <div key={m.id} className="p-6 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{m.name}</p>
                      <p className="text-sm text-gray-500">Only {m.quantity} left</p>
                    </div>
                    <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl font-semibold text-sm hover:bg-yellow-200 transition-colors">
                      Restock Suggestion
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expiringSoonMeds.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Expiring Soon</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {expiringSoonMeds.map(m => (
                  <div key={m.id} className="p-6 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{m.name}</p>
                      <p className="text-sm text-gray-500">Expires on {m.expiryDate}</p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      Expiring Soon
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
