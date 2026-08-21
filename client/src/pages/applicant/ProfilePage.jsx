import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getCurrentUser, updateProfile, changePassword } from '../../api/authApi';
import FormField from '../../components/FormField';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Edit Form State
  const [profileForm, setProfileForm] = useState({ fullName: '', email: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await getCurrentUser();
        if (res.success && res.data) {
          const u = res.data;
          setUser(u);
          setProfileForm({
            fullName: u.fullName || '',
            email: u.email || '',
            phone: u.phone || '',
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateProfile(profileForm);
      if (res.success && res.data) {
        setUser(res.data);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.success) {
        toast.success('Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-slate-400">Loading user profile...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          Account Profile & Security
        </h1>
        <p className="text-sm text-slate-500">
          Manage your personal contact details and account security settings.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
          {user?.role === 'admin'
            ? 'Administrator Information'
            : user?.role === 'superadmin'
            ? 'Super Administrator Information'
            : 'Applicant Information'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Full Name</span>
            <span className="font-semibold text-slate-800 text-sm">{user?.fullName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">NIC Number (National ID)</span>
            <span className="font-semibold text-slate-800 text-sm">{user?.nic}</span>
          </div>
          <div>
            <span className="text-slate-500 block">District</span>
            <span className="font-semibold text-slate-800 text-sm">{user?.district || 'Not Specified'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Account Role</span>
            <span className="font-semibold text-teal-800 uppercase tracking-wider">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Edit Contact Details Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">
            Edit Contact Details
          </h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <FormField
              label="Full Name"
              name="fullName"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
              required
            />
            <FormField
              label="Email Address"
              type="email"
              name="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
            <FormField
              label="Mobile Phone Number"
              name="phone"
              value={profileForm.phone}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
              required
            />
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full rounded-lg bg-teal-900 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50"
            >
              {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-5">
            Change Password
          </h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <FormField
              label="Current Password"
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="Enter your current password"
              required
            />
            <FormField
              label="New Password"
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Minimum 6 characters"
              required
            />
            <FormField
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Re-enter new password"
              required
            />
            <button
              type="submit"
              disabled={changingPassword}
              className="w-full rounded-lg bg-slate-800 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:opacity-50"
            >
              {changingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
