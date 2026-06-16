import { useState, useEffect } from 'react';
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react';
import api from '../api';

const Settings = () => {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await api.get('/auth/profile');
      setProfile({ name: res.data.name, email: res.data.email });
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await api.put('/auth/profile', profile);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error("Failed to update profile", error);
      alert(error.response?.data?.detail || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    
    try {
      setSavingPassword(true);
      await api.put('/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      alert('Password updated successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error("Failed to update password", error);
      alert(error.response?.data?.detail || "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account profile and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Settings */}
        <div className="card p-6 h-fit">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <User size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
          </div>
          
          {loadingProfile ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-slate-100 rounded-lg"></div>
              <div className="h-10 bg-slate-100 rounded-lg"></div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  required
                />
              </div>

              <div className="pt-2">
                <button type="submit" disabled={savingProfile} className="btn-primary w-full justify-center flex items-center gap-2">
                  <Save size={18} />
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Password Settings */}
        <div className="card p-6 h-fit">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Lock size={20} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
          </div>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
              <div className="relative">
                <input 
                  type={showCurrent ? "text" : "password"} 
                  className="input-field pr-10" 
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowCurrent(!showCurrent)}
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <input 
                  type={showNew ? "text" : "password"} 
                  className="input-field pr-10" 
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
              <input 
                type={showNew ? "text" : "password"} 
                className="input-field" 
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                required
                minLength={6}
              />
            </div>

            <div className="pt-2">
              <button type="submit" disabled={savingPassword} className="btn-primary w-full justify-center flex items-center gap-2">
                <Save size={18} />
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Settings;
