import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/FormField';
import AuthBrandPanel from '../components/AuthBrandPanel';

const initialState = {
  fullName: '',
  nic: '',
  email: '',
  phone: '',
  district: '',
  password: '',
  confirmPassword: '',
  role: 'applicant',
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.nic.trim()) newErrors.nic = 'NIC number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = 'Enter a valid email address';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const { confirmPassword, ...payload } = formData;
      const user = await register(payload);
      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Unable to register. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AuthBrandPanel />

      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-[55%] lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="font-serif text-2xl font-medium text-slate-950">
            {formData.role === 'admin'
              ? 'Create your admin account'
              : 'Create your applicant account'}
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            {formData.role === 'admin'
              ? 'Register to manage and review welfare applications across districts.'
              : 'Register to submit your welfare application and get your eligibility score.'}
          </p>

          {serverError && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7" noValidate>
            {/* Role selector (Applicant / Admin only) */}
            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-200/60 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: 'applicant' }))
                  }
                  className={`rounded-md py-2 text-xs font-semibold transition ${
                    formData.role === 'applicant'
                      ? 'bg-teal-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Applicant
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: 'admin' }))
                  }
                  className={`rounded-md py-2 text-xs font-semibold transition ${
                    formData.role === 'admin'
                      ? 'bg-teal-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
            <FormField
              label="Full name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="As it appears on your NIC"
              error={errors.fullName}
              required
              autoComplete="name"
            />
            <FormField
              label="NIC number"
              name="nic"
              value={formData.nic}
              onChange={handleChange}
              placeholder="e.g. 200012345678"
              error={errors.nic}
              required
            />
            <FormField
              label="Email address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={errors.email}
              required
              autoComplete="email"
            />
            <FormField
              label="Phone number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="07X XXX XXXX"
              error={errors.phone}
              required
              autoComplete="tel"
            />
            <FormField
              label="District"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="e.g. Kandy"
            />
            <FormField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              error={errors.password}
              required
              autoComplete="new-password"
            />
            <FormField
              label="Confirm password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg bg-teal-900 py-2.75 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-teal-700 hover:text-teal-800"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
