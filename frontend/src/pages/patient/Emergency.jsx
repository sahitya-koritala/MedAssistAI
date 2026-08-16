import { useState } from "react";
import { motion } from "motion/react";
import { Phone, MapPin, AlertTriangle, Heart, Droplets, Users, Navigation, Loader2, Bell, CheckCircle, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Emergency() {
  const [isAlertSent, setIsAlertSent] = useState(false);
  const [alertLocation, setAlertLocation] = useState(null);

  const emergencyContacts = [
    { id: 1, name: "National Emergency", number: "911", type: "ambulance" },
    { id: 2, name: "Ambulance Service", number: "108", type: "ambulance" },
    { id: 3, name: "Police Emergency", number: "100", type: "police" },
    { id: 4, name: "Fire Emergency", number: "101", type: "fire" },
  ];

  const nearbyEmergencyHospitals = [
    {
      id: 1,
      name: "MedAssist Emergency Center",
      address: "123 Emergency Lane, Medical District",
      distance: 1.2,
      phone: "+1 (555) 999-9999",
      emergencyAvailable: true,
      hasICU: true,
      hasTrauma: true
    },
    {
      id: 2,
      name: "City Trauma Center",
      address: "456 Critical Care Blvd, Downtown",
      distance: 2.8,
      phone: "+1 (555) 888-8888",
      emergencyAvailable: true,
      hasICU: true,
      hasTrauma: true
    },
    {
      id: 3,
      name: "Regional Emergency Hospital",
      address: "789 Urgent Care Road, Suburb",
      distance: 4.5,
      phone: "+1 (555) 777-7777",
      emergencyAvailable: true,
      hasICU: false,
      hasTrauma: true
    }
  ];

  const bloodBanks = [
    { id: 1, name: "MedAssist Blood Bank", address: "123 Health Ave", phone: "+1 (555) 111-1111", availableBlood: ["A+", "B+", "O+", "AB+"] },
    { id: 2, name: "City Blood Center", address: "456 Wellness Blvd", phone: "+1 (555) 222-2222", availableBlood: ["A-", "B-", "O-", "AB-"] },
    { id: 3, name: "Regional Blood Bank", address: "789 Recovery Rd", phone: "+1 (555) 333-3333", availableBlood: ["A+", "O+", "B+"] },
  ];

  const personalEmergencyContacts = [
    { id: 1, name: "Dr. Smith (Family Doctor)", phone: "+1 (555) 444-4444", relation: "Doctor" },
    { id: 2, name: "John Doe (Family Member)", phone: "+1 (555) 555-5555", relation: "Family" },
    { id: 3, name: "Jane Doe (Emergency Contact)", phone: "+1 (555) 666-6666", relation: "Emergency" },
  ];

  const { t } = useTranslation();

  const sendEmergencyAlert = async () => {
    setIsAlertSent(true);
    
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAlertLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setAlertLocation({ lat: 40.7128, lng: -74.0060 }); // Default location
        }
      );
    }

    // In production, this would send alerts to emergency contacts and services
    // For demo, we just show the alert sent state
  };

  const callNumber = (number) => {
    window.open(`tel:${number}`);
  };

  const getDirections = (address) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('emergencyAssistance.dashboardTitle', 'Emergency Assistance')}</h1>
          <p className="text-gray-600">{t('emergencyAssistance.description', 'Quick access to emergency services, ambulance contacts, and nearby emergency hospitals')}</p>
        </motion.div>

        {/* One-Click Emergency Alert */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-lg p-8 mb-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-7 h-7" />
                {t('emergencyAlert.title', 'Emergency Alert')}
              </h2>
              <p className="text-red-100 mb-4">
                {t('emergencyAlert.description', 'Send your location to emergency contacts and services with one click')}
              </p>
              {isAlertSent && alertLocation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/20 rounded-xl p-4 mt-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">{t('emergencyAlert.sentSuccessfully', 'Alert Sent Successfully!')}</span>
                  </div>
                  <p className="text-sm text-red-100">
                    {t('emergencyAlert.sentDescription', 'Your location has been shared with emergency contacts. Help is on the way.')}
                  </p>
                  <p className="text-xs text-red-200 mt-2">
                    {t('emergencyAlert.location', 'Location: {lat}, {lng}', { lat: alertLocation.lat.toFixed(4), lng: alertLocation.lng.toFixed(4) })}
                  </p>
                </motion.div>
              )}
            </div>
            <button
              onClick={sendEmergencyAlert}
              disabled={isAlertSent}
              className={`px-8 py-6 rounded-xl font-bold text-lg transition-all ${
                isAlertSent
                  ? "bg-white/30 cursor-not-allowed"
                  : "bg-white text-red-600 hover:bg-red-50 active:scale-95"
              }`}
            >
              {isAlertSent ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  {t('emergencyAlert.sent', 'Alert Sent')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Bell className="w-6 h-6" />
                  {t('emergencyAlert.send', 'SEND ALERT')}
                </div>
              )}
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emergency Contacts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-600" />
              {t('emergencyServices.title', 'Emergency Services')}
            </h2>
            <div className="space-y-3">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 bg-red-50 rounded-xl border border-red-200 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.number}</p>
                  </div>
                  <button
                    onClick={() => callNumber(contact.number)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    {t('emergencyServices.call', 'Call')}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Personal Emergency Contacts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              {t('personalContacts.title', 'Personal Contacts')}
            </h2>
            <div className="space-y-3">
              {personalEmergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.phone}</p>
                  </div>
                  <button
                    onClick={() => callNumber(contact.phone)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    {t('personalContacts.call', 'Call')}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}