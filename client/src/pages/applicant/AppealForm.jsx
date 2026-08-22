import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMyApplication, submitAppeal, uploadAppealDocument } from '../../api/applicationApi';

const GROUNDS_OPTIONS = [
  'Household income or expenditure recorded incorrectly',
  'Health circumstances not considered',
  'Housing situation not considered',
  'Applicant or family details incorrect',
  'Family assets recorded incorrectly',
  'Education status not considered',
  'Other',
];

const AppealForm = () => {
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [groundsForAppeal, setGroundsForAppeal] = useState(GROUNDS_OPTIONS[0]);
  const [appealText, setAppealText] = useState('');
  const [contactPreference, setContactPreference] = useState('Email');
  const [declaredTrue, setDeclaredTrue] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [textError, setTextError] = useState('');

  // Appeal Upload State
  const [appealDocs, setAppealDocs] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('Appeal Supporting Evidence');

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await getMyApplication();
        if (res.success && res.data) {
          setApplication(res.data);
          if (res.data.appeal?.documents) {
            setAppealDocs(res.data.appeal.documents);
          }
        }
      } catch (err) {
        console.error('Failed to fetch application for appeal:', err);
        setError(err.response?.data?.message || 'Failed to load application');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, []);

  // Calculate word count
  const wordCount = appealText.trim() ? appealText.trim().split(/\s+/).length : 0;
  const isOverWordLimit = wordCount > 200 || appealText.length > 1500;

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a document file to upload.');
      return;
    }

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('files', selectedFile);
      formData.append('documentType', docType);

      const res = await uploadAppealDocument(formData);
      if (res.success && res.data) {
        setAppealDocs(res.data);
        setSelectedFile(null);
        toast.success('Appeal document uploaded successfully!');
      }
    } catch (err) {
      console.error('Document upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTextError('');

    if (!appealText.trim()) {
      setTextError('Please provide an explanation for your appeal.');
      toast.error('Appeal explanation is required.');
      return;
    }

    if (isOverWordLimit) {
      setTextError('Appeal text exceeds maximum limit (200 words / 1500 characters).');
      toast.error('Please shorten your appeal text before submitting.');
      return;
    }

    if (!declaredTrue) {
      toast.error('You must accept the declaration to submit your appeal.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitAppeal(groundsForAppeal, appealText, contactPreference);
      if (res.success) {
        toast.success('Appeal submitted successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Appeal submission error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit appeal');
    } finally {
      setSubmitting(false);
    }
  };

  const getDocUrl = (fileUrl) => {
    if (!fileUrl) return '#';
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl;
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const serverOrigin = apiBase.replace(/\/api\/?$/, '');
    return `${serverOrigin}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-slate-400">Loading appeal portal...</div>;
  }

  if (error || !application) {
    return (
      <div className="space-y-4">
        <Link to="/dashboard" className="text-xs font-semibold text-teal-800 hover:underline">
          ← Back to Dashboard
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800">
          {error || 'No application record found.'}
        </div>
      </div>
    );
  }

  // Guard: If application status is Appealed (Awaiting review)
  if (application.status === 'Appealed') {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Link to="/dashboard" className="text-xs font-semibold text-teal-800 hover:underline">
          ← Back to Dashboard
        </Link>
        <div className="rounded-xl border border-purple-200 bg-purple-50/90 p-8 shadow-sm text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-800 font-bold text-2xl">
            ⚖️
          </div>
          <h1 className="font-serif text-2xl font-bold text-purple-950">
            Appeal Submitted & Awaiting Review
          </h1>
          <p className="text-sm text-purple-800 max-w-md mx-auto">
            Your appeal was submitted on{' '}
            <strong>
              {application.appeal?.submittedAt
                ? new Date(application.appeal.submittedAt).toLocaleDateString('en-LK', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'N/A'}
            </strong>{' '}
            and is currently being reviewed by the Welfare Appeals Committee.
          </p>

          <div className="rounded-lg border border-purple-200 bg-white p-4 text-left text-xs space-y-2 text-purple-900">
            <p>
              <strong>Grounds Specified:</strong> {application.appeal?.groundsForAppeal}
            </p>
            <p>
              <strong>Preferred Contact:</strong> {application.appeal?.contactPreference}
            </p>
            <div>
              <strong>Appeal Statement:</strong>
              <p className="mt-1 p-2 bg-purple-50/50 rounded border border-purple-100 text-slate-800 whitespace-pre-wrap">
                {application.appeal?.appealText}
              </p>
            </div>
          </div>

          <div>
            <Link
              to="/dashboard"
              className="inline-block rounded-lg bg-teal-900 px-6 py-2.5 text-xs font-semibold text-white hover:bg-teal-800"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Guard: If application status is NOT Rejected
  if (application.status !== 'Rejected') {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <Link to="/dashboard" className="text-xs font-semibold text-teal-800 hover:underline">
          ← Back to Dashboard
        </Link>
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-3">
          <h2 className="font-serif text-lg font-bold text-slate-900">Appeal Not Required</h2>
          <p className="text-xs text-slate-500">
            Appeals can only be submitted for applications that have been formally rejected. Your current application status is{' '}
            <span className="font-semibold text-teal-900">{application.status}</span>.
          </p>
        </div>
      </div>
    );
  }

  const pi = application.personalInfo || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <Link to="/dashboard" className="text-xs font-semibold text-teal-800 hover:underline mb-1 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          Welfare Eligibility Determination Appeal
        </h1>
        <p className="text-sm text-slate-500">
          If you believe your application was rejected based on incorrect data or unconsidered circumstances, submit a formal appeal below.
        </p>
      </div>

      {/* Applicant & Application Reference Header Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-slate-500 block">Applicant Name</span>
          <span className="font-semibold text-slate-900">{pi.fullName || 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-500 block">NIC Number</span>
          <span className="font-mono font-semibold text-slate-900">{pi.nicNumber || 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-500 block">District / GN Division</span>
          <span className="font-semibold text-slate-900">{pi.district || 'N/A'} ({pi.gnDivision || 'N/A'})</span>
        </div>
        <div>
          <span className="text-slate-500 block">Application Reference ID</span>
          <span className="font-mono font-semibold text-teal-900">{application._id}</span>
        </div>
      </div>

      {/* Original Rejection Reason Callout */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm space-y-2">
        <span className="text-xs font-semibold text-red-800 flex items-center space-x-1">
          <span>❌</span>
          <span>Original Rejection Determination Reason:</span>
        </span>
        <p className="text-xs text-red-900 whitespace-pre-wrap font-medium bg-white/90 p-3 rounded-lg border border-red-200">
          {application.reviewNotes || 'No specific rejection reason notes were provided.'}
        </p>
      </div>

      {/* Appeal Submission Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <h2 className="font-serif text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          Appeal Statement & Evidence
        </h2>

        {/* 1. Grounds for Appeal */}
        <div className="space-y-1.5">
          <label htmlFor="grounds-select" className="block text-xs font-semibold text-slate-800">
            Primary Grounds for Appeal <span className="text-red-500">*</span>
          </label>
          <select
            id="grounds-select"
            value={groundsForAppeal}
            onChange={(e) => setGroundsForAppeal(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:border-teal-800 focus:outline-none"
          >
            {GROUNDS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Appeal Text Explanation */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="appeal-text" className="block text-xs font-semibold text-slate-800">
              Detailed Explanation <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-[11px] font-semibold ${
                isOverWordLimit ? 'text-red-600' : 'text-slate-500'
              }`}
            >
              {wordCount} / 200 words ({appealText.length} / 1500 chars)
            </span>
          </div>
          <textarea
            id="appeal-text"
            rows={6}
            value={appealText}
            onChange={(e) => {
              setAppealText(e.target.value);
              if (textError) setTextError('');
            }}
            placeholder="Clearly describe why you are appealing this determination. Include relevant details such as medical conditions, emergency expenses, employment changes, or errors in declared data..."
            className={`w-full rounded-lg border p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none ${
              textError || isOverWordLimit ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-300 focus:border-teal-800'
            }`}
          />
          {textError && <p className="text-xs font-semibold text-red-600">{textError}</p>}
        </div>

        {/* 3. Contact Preference */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-800">
            Preferred Method of Contact for Appeal Updates
          </label>
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700">
            {['Email', 'Phone', 'SMS'].map((pref) => (
              <label key={pref} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="contactPreference"
                  value={pref}
                  checked={contactPreference === pref}
                  onChange={(e) => setContactPreference(e.target.value)}
                  className="accent-teal-900"
                />
                <span>{pref}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 4. Optional Appeal Evidence Document Upload */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
          <div>
            <h3 className="font-serif text-sm font-bold text-slate-900">
              Supporting Appeal Documents (Optional)
            </h3>
            <p className="text-[11px] text-slate-500">
              Upload medical reports, updated income slips, utility bills, or affidavits supporting your appeal.
            </p>
          </div>

          {/* List of uploaded appeal documents */}
          {appealDocs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {appealDocs.map((doc, idx) => (
                <div key={doc._id || idx} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 text-xs">
                  <div className="truncate pr-2">
                    <span className="font-semibold block text-slate-800 truncate">{doc.fileName}</span>
                    <span className="text-[10px] text-slate-500">{doc.documentType}</span>
                  </div>
                  <a
                    href={getDocUrl(doc.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-teal-800 hover:underline shrink-0"
                  >
                    View ↗
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Document Upload Input */}
          <div className="flex flex-col sm:flex-row items-end gap-3 pt-1">
            <div className="w-full sm:flex-1 space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Document Type / Label</label>
              <input
                type="text"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                placeholder="e.g. Medical Certificate, Wage Slip"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
              />
            </div>
            <div className="w-full sm:flex-1 space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Select File (PDF, PNG, JPG max 5MB)</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                className="w-full text-xs text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-teal-900 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white"
              />
            </div>
            <button
              type="button"
              onClick={handleFileUpload}
              disabled={uploadingDoc || !selectedFile}
              className="w-full sm:w-auto rounded-lg border border-teal-800 bg-white px-4 py-1.5 text-xs font-semibold text-teal-900 transition hover:bg-teal-50 disabled:opacity-40"
            >
              {uploadingDoc ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>

        {/* Declaration Checkbox */}
        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={declaredTrue}
              onChange={(e) => setDeclaredTrue(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-teal-900 rounded"
            />
            <span className="text-xs text-slate-700">
              I hereby declare that the information and explanation provided in this appeal are accurate, truthful, and complete to the best of my knowledge.
            </span>
          </label>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting || !declaredTrue || isOverWordLimit}
            className="rounded-lg bg-teal-900 px-8 py-3 text-sm font-semibold text-white shadow transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? 'Submitting Appeal...' : 'Submit Appeal to Committee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppealForm;
