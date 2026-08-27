import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMyApplication, uploadPlanEvidence, deletePlanEvidence } from '../../api/applicationApi';

const PlanEvidenceUpload = () => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Month 1');
  const [uploading, setUploading] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchApplication = async () => {
    try {
      const res = await getMyApplication();
      if (res.success && res.data) {
        setApplication(res.data);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
      setError(err.response?.data?.message || 'Failed to fetch application');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchApplication();
      setLoading(false);
    };
    init();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-400 animate-pulse">Loading evidence upload portal...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-sm">
          <p className="font-semibold text-red-800">Error Loading Portal</p>
          <p className="text-xs text-red-700 mt-1">{error || 'No application record found.'}</p>
          <Link to="/dashboard" className="mt-4 inline-block rounded-lg bg-teal-900 px-4 py-2 text-xs font-semibold text-white">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const lp = application.lifestylePlan;
  if (!lp || lp.status !== 'ML Assessed') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center max-w-sm">
          <p className="text-2xl mb-2">🔒</p>
          <p className="font-semibold text-amber-900">Access Denied</p>
          <p className="text-xs text-amber-700 mt-1">
            Evidence uploading is only available once your lifestyle plan has been assessed.
          </p>
          <Link to="/dashboard" className="mt-4 inline-block rounded-lg bg-teal-900 px-4 py-2 text-xs font-semibold text-white">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const duration = lp.mlPrediction?.estimatedDurationMonths || 0;
  const periods = Array.from({ length: duration }, (_, i) => `Month ${i + 1}`);

  // Group documents by period
  const documents = lp.supportingDocuments || [];
  const activeDocs = documents.filter((doc) => doc.periodLabel === activeTab);

  // Find period review
  const reviews = lp.periodReviews || [];
  const activeReview = reviews.find((r) => r.periodLabel === activeTab);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    if (!documentType.trim()) {
      toast.error('Please enter a document type');
      return;
    }

    setUploading(true);
    try {
      const res = await uploadPlanEvidence(selectedFile, activeTab, documentType.trim());
      if (res.success) {
        toast.success('Document uploaded successfully!');
        setDocumentType('');
        setSelectedFile(null);
        // Clear file input field
        const fileInput = document.getElementById('evidence-file-input');
        if (fileInput) fileInput.value = '';
        await fetchApplication();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload evidence');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await deletePlanEvidence(docId);
      if (res.success) {
        toast.success('Document deleted successfully');
        await fetchApplication();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete document');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link to="/dashboard" className="text-xs text-teal-300 hover:text-white mb-2 inline-block">
              &larr; Back to Dashboard
            </Link>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">Progress Evidence Portal</h1>
            <p className="mt-1 text-sm text-teal-100">
              Upload supporting evidence documents for each month of your {duration}-month program.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10 text-xs flex-shrink-0 text-center sm:text-left">
            <span className="block text-teal-300 font-semibold uppercase">Prediction Success</span>
            <span className="text-3xl font-bold font-serif">{lp.mlPrediction?.successProbability}%</span>
          </div>
        </div>

        {/* Tab Interface */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Vertical Period Select List */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm md:col-span-1 space-y-1 max-h-[450px] overflow-y-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-2">Program Timeline</span>
            {periods.map((period) => {
              const count = documents.filter((d) => d.periodLabel === period).length;
              const isReviewed = reviews.some((r) => r.periodLabel === period && r.status === 'Reviewed');
              return (
                <button
                  key={period}
                  onClick={() => setActiveTab(period)}
                  className={`w-full text-left rounded-lg px-3 py-2 text-xs font-semibold transition flex items-center justify-between ${
                    activeTab === period
                      ? 'bg-teal-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{period}</span>
                  <div className="flex items-center space-x-1">
                    {count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${activeTab === period ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {count}
                      </span>
                    )}
                    {isReviewed && (
                      <span className="text-[10px]" title="Reviewed by Admin">✔️</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Period Content Area */}
          <div className="md:col-span-3 space-y-6">
            {/* Review Status Callout */}
            {activeReview && activeReview.status === 'Reviewed' && (
              <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900 flex items-center space-x-1">
                    <span>🛡️</span>
                    <span>Admin Period Review Summary</span>
                  </span>
                  <span className="rounded-full bg-teal-100 border border-teal-300 px-2 py-0.5 text-[10px] font-semibold text-teal-800">
                    Reviewed
                  </span>
                </div>
                {activeReview.reviewNotes ? (
                  <p className="text-xs text-teal-850 font-medium bg-white/70 rounded-lg p-3 border border-teal-100">
                    {activeReview.reviewNotes}
                  </p>
                ) : (
                  <p className="text-xs text-teal-700 italic">No specific review notes were added.</p>
                )}
                {activeReview.reviewedAt && (
                  <span className="text-[9px] text-teal-600 block">
                    Reviewed on {formatDate(activeReview.reviewedAt)}
                  </span>
                )}
              </div>
            )}

            {/* List of uploaded documents for active tab */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="font-serif text-base font-bold text-slate-900">{activeTab} Documents</h2>
              {activeDocs.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                  No evidence documents uploaded yet for {activeTab}.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeDocs.map((doc) => (
                    <div key={doc._id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs">
                      <div>
                        <span className="font-semibold text-slate-800 block truncate max-w-[250px]">{doc.fileName}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wide">{doc.documentType} • {formatDate(doc.uploadedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-teal-800 hover:text-teal-900"
                        >
                          View File
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(doc._id)}
                          className="text-red-600 hover:text-red-700 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Area for active tab */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="font-serif text-base font-bold text-slate-900">Upload Evidence</h2>
              <form onSubmit={handleUpload} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="doc-type-input" className="text-xs font-semibold text-slate-600 block mb-1">
                      Evidence Type/Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="doc-type-input"
                      type="text"
                      required
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      placeholder="e.g. Training Certificate, GN Statement"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700"
                    />
                  </div>
                  <div>
                    <label htmlFor="evidence-file-input" className="text-xs font-semibold text-slate-600 block mb-1">
                      Select File (PDF, PNG, JPG, JPEG, max 5MB) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="evidence-file-input"
                      type="file"
                      required
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="w-full text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-900 hover:file:bg-teal-100 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="rounded-lg bg-teal-900 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition shadow-sm disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Submit Evidence File'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanEvidenceUpload;