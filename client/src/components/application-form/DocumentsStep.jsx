import { useState } from 'react';
import { toast } from 'react-toastify';
import { uploadDocument, deleteDocument } from '../../api/applicationApi';

const DOCUMENT_TYPES = [
  { type: 'NIC Copy', required: true, description: 'Copy of National Identity Card (Front & Back)' },
  { type: 'Income Certificate', required: true, description: 'Official income certificate issued by Grama Niladhari' },
  { type: 'Electricity Bill', required: true, description: 'Recent utility bill showing residential address' },
  { type: 'Grama Niladhari Certificate', required: true, description: 'Residency certificate issued by GN' },
  { type: 'Water Bill', required: false, description: 'Recent NWSDB water utility bill (if available)' },
  { type: 'Bank Statement', required: false, description: 'Bank passbook copy or statement for direct credit' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

const DocumentsStep = ({ applicationId, documents = [], onChange }) => {
  const [uploadingType, setUploadingType] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const findUploadedDoc = (docType) => {
    return (documents || []).find((d) => d.documentType === docType);
  };

  const handleFileSelect = async (docType, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only PDF, JPG, JPEG, and PNG files are allowed.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds the 5MB limit.');
      e.target.value = '';
      return;
    }

    if (!applicationId) {
      toast.error('Draft application ID missing. Please save draft in previous steps first.');
      return;
    }

    setUploadingType(docType);
    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('documentType', docType);

      const res = await uploadDocument(applicationId, formData);
      if (res.success && res.data) {
        onChange(res.data);
        toast.success(`${docType} uploaded successfully`);
      }
    } catch (err) {
      console.error('Document upload error:', err);
      toast.error(err.response?.data?.message || `Failed to upload ${docType}`);
    } finally {
      setUploadingType(null);
      e.target.value = '';
    }
  };

  const handleDelete = async (docSubId, docType) => {
    if (!applicationId) return;

    setDeletingId(docSubId);
    try {
      const res = await deleteDocument(applicationId, docSubId);
      if (res.success && res.data) {
        onChange(res.data);
        toast.success(`${docType} removed`);
      }
    } catch (err) {
      console.error('Document deletion error:', err);
      toast.error(err.response?.data?.message || `Failed to remove ${docType}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-xl font-medium text-slate-900">
          Document Uploads
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Upload clear scanned copies or photos of required verification documents (PDF, JPG, PNG up to 5MB).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {DOCUMENT_TYPES.map((docDef) => {
          const uploadedDoc = findUploadedDoc(docDef.type);
          const isUploading = uploadingType === docDef.type;
          const isDeleting = uploadedDoc && deletingId === uploadedDoc._id;

          return (
            <div
              key={docDef.type}
              className={`flex flex-col justify-between rounded-xl border p-5 transition ${
                uploadedDoc
                  ? 'border-teal-200 bg-teal-50/40'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">
                    {docDef.type}
                    {docDef.required && <span className="ml-1 text-amber-600">*</span>}
                  </h4>
                  {uploadedDoc ? (
                    <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                      ✓ Uploaded
                    </span>
                  ) : docDef.required ? (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                      Required
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                      Optional
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-slate-500">{docDef.description}</p>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                {uploadedDoc ? (
                  <div className="flex items-center justify-between rounded-lg border border-teal-200 bg-white p-3">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-800 font-bold text-xs">
                        {uploadedDoc.fileName.split('.').pop()?.toUpperCase() || 'FILE'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <a
                          href={uploadedDoc.fileUrl ? `http://localhost:5000${uploadedDoc.fileUrl}` : '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate text-xs font-medium text-teal-900 hover:underline block"
                          title={uploadedDoc.fileName}
                        >
                          {uploadedDoc.fileName}
                        </a>
                        <span className="text-[10px] text-slate-400">
                          {new Date(uploadedDoc.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(uploadedDoc._id, docDef.type)}
                      disabled={isDeleting}
                      className="ml-3 shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition disabled:opacity-50"
                    >
                      {isDeleting ? 'Removing...' : 'Remove'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-700 transition hover:border-teal-600 hover:bg-teal-50/50">
                      {isUploading ? (
                        <div className="flex items-center space-x-2 text-teal-800">
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                          </svg>
                          <span>Uploading file...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Select PDF or Image file</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileSelect(docDef.type, e)}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentsStep;
