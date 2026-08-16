import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Droplet, Save } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import { useTranslation } from "react-i18next";

const MyProfile = () => {
  const { user, refresh } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        bloodGroup: user.bloodGroup || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pinCode: user.pinCode || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await authService.completeProfile(user.id, { ...profile, role: user.role });
      await refresh();
      alert(t('myProfile.profileUpdated', 'Profile updated successfully!'));
    } catch (err) {
      console.error(err);
      alert(t('myProfile.profileUpdateFailed', 'Failed to update profile'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#06402B]">{t('myProfile.dashboardTitle', 'My Profile')}</h1>
        <p className="text-gray-600 mt-2">{t('myProfile.viewAndUpdateInfo', 'View and update your personal & medical information')}</p>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-gray-500 mb-2 block">{t('myProfile.fullName', 'Full Name')}</label>
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
                <User className="text-gray-400" />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="bg-transparent flex-1 outline-none text-[#06402B]"
                  placeholder={t('myProfile.search', 'Search')}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-500 mb-2 block">{t('myProfile.emailAddress', 'Email Address')}</label>
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
                <Mail className="text-gray-400" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="bg-transparent flex-1 outline-none text-[#06402B]"
                  placeholder={t('myProfile.search', 'Search')}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-500 mb-2 block">{t('myProfile.phoneNumber', 'Phone Number')}</label>
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
                <Phone className="text-gray-400" />
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="bg-transparent flex-1 outline-none text-[#06402B]"
                  placeholder={t('myProfile.search', 'Search')}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-500 mb-2 block">{t('myProfile.dateOfBirth', 'Date of Birth')}</label>
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
                <Calendar className="text-gray-400" />
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  className="bg-transparent flex-1 outline-none text-[#06402B]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-gray-500 mb-2 block">{t('myProfile.gender', 'Gender')}</label>
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
                <User className="text-gray-400" />
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="bg-transparent flex-1 outline-none text-[#06402B]"
                >
                  <option value="">Select</option>
                  <option value="Male">{t('myProfile.male', 'Male')}</option>
                  <option value="Female">{t('myProfile.female', 'Female')}</option>
                  <option value="Other">{t('myProfile.other', 'Other')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-500 mb-2 block">{t('myProfile.bloodGroup', 'Blood Group')}</label>
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
                <Droplet className="text-gray-400" />
                <select
                  value={profile.bloodGroup}
                  onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                  className="bg-transparent flex-1 outline-none text-[#06402B]"
                >
                  <option value="">Select</option>
                  <option value="A+">{t('myProfile.aPlus', 'A+')}</option>
                  <option value="A-">{t('myProfile.aMinus', 'A-')}</option>
                  <option value="B+">{t('myProfile.bPlus', 'B+')}</option>
                  <option value="B-">{t('myProfile.bMinus', 'B-')}</option>
                  <option value="AB+">{t('myProfile.abPlus', 'AB+')}</option>
                  <option value="AB-">{t('myProfile.abMinus', 'AB-')}</option>
                  <option value="O+">{t('myProfile.oPlus', 'O+')}</option>
                  <option value="O-">{t('myProfile.oMinus', 'O-')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-500 mb-2 block">{t('myProfile.address', 'Address')}</label>
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
                <MapPin className="text-gray-400" />
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="bg-transparent flex-1 outline-none text-[#06402B]"
                  placeholder={t('myProfile.search', 'Search')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-500 mb-2 block">{t('myProfile.city', 'City')}</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="w-full bg-gray-50 px-4 py-3 rounded-xl outline-none text-[#06402B]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500 mb-2 block">{t('myProfile.pincode', 'Pincode')}</label>
                <input
                  type="text"
                  value={profile.pinCode}
                  onChange={(e) => setProfile({ ...profile, pinCode: e.target.value })}
                  className="w-full bg-gray-50 px-4 py-3 rounded-xl outline-none text-[#06402B]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-70"
          >
            <Save className="w-5 h-5" />
            {isSaving ? t('myProfile.saving', 'Saving...') : t('myProfile.saveChanges', 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;