import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../utils/firebase';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { generateAndDownloadPdf } from '../pdfGenerator';
import toast from 'react-hot-toast';
import EditApplicationModal from './EditApplicationModal';
import PreviewModal from './PreviewModal';

// ─── Utility: derive year from submissionDate ────────────────────────────────
const getYear = (dateStr) => {
  try { return new Date(dateStr).getFullYear(); }
  catch { return 2025; }
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color }) => (
  <div className={`glass-card rounded-2xl p-5 border-l-4 ${color} flex items-center gap-4 shadow-sm`}>
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-2xl font-extrabold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
    </div>
  </div>
);

// ─── Delete Confirmation Modal ───────────────────────────────────────────────
const DeleteConfirmModal = ({ app, onConfirm, onCancel, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
    <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
      <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-base font-bold text-white">Delete Application</h2>
      </div>
      <div className="px-6 py-5">
        <p className="text-sm text-gray-600 leading-relaxed">
          Are you sure you want to permanently delete the application for
          <span className="font-bold text-gray-800"> {app?.candidateName}</span> (App #{app?.appId})?
        </p>
        <p className="text-xs text-red-500 mt-2 font-medium">⚠️ This action cannot be undone.</p>
      </div>
      <div className="flex gap-3 px-6 pb-5">
        <button onClick={onCancel} disabled={isDeleting}
          className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all disabled:opacity-50">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={isDeleting}
          className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-red-900/20 disabled:opacity-60 inline-flex items-center justify-center gap-2">
          {isDeleting ? (
            <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Deleting…</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>Yes, Delete</>
          )}
        </button>
      </div>
    </div>
  </div>
);

// ─── Year Accordion Section ──────────────────────────────────────────────────
const YearSection = ({ year, apps, defaultOpen = false, onEdit, onPreview, onDownload, onDelete }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return apps;
    const q = search.toLowerCase();
    return apps.filter(a =>
      a.candidateName?.toLowerCase().includes(q) ||
      a.appId?.toString().includes(q)
    );
  }, [apps, search]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-sm border border-gray-200/60">
      {/* Accordion header */}
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className={`w-full flex items-center gap-4 px-6 py-4 transition-all text-left
          ${isOpen ? 'bg-gradient-to-r from-green-800 to-green-700' : 'bg-white hover:bg-gray-50'}`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0
          ${isOpen ? 'bg-white/20 text-white' : 'bg-green-100 text-green-800'}`}>
          {year}
        </div>
        <div className="flex-1">
          <h3 className={`text-base font-bold ${isOpen ? 'text-white' : 'text-gray-800'}`}>
            {year} Batch Applications
          </h3>
          <p className={`text-xs mt-0.5 ${isOpen ? 'text-green-200' : 'text-gray-500'}`}>
            {apps.length} application{apps.length !== 1 ? 's' : ''} submitted
          </p>
        </div>
        <div className={`flex items-center gap-3`}>
          <span className={`text-xs font-bold px-3 py-1 rounded-full
            ${isOpen ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
            {apps.length}
          </span>
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : 'text-gray-400'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Accordion body */}
      {isOpen && (
        <div className="animate-fade-in-up">
          {/* Inner search for this year */}
          <div className="px-5 pt-4 pb-2">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or App ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200">
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">App ID</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Candidate Name</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Submitted On</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Quota</th>
                  <th className="px-5 py-3 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filtered.length > 0 ? filtered.map((app, idx) => (
                  <tr key={app.appId} className={`hover:bg-green-50/40 transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-100 text-green-800 text-xs font-bold font-mono">
                        #{app.appId}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {app.candidateName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{app.candidateName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.submissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      <span className="ml-1 text-xs text-gray-400">
                        {new Date(app.submissionDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {app.formData?.quota ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {app.formData.quota}
                        </span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit */}
                        <button
                          title="Edit application"
                          onClick={() => onEdit(app)}
                          className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center justify-center transition-all hover:-translate-y-0.5 hover:shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>

                        {/* Preview */}
                        <button
                          title="Preview application"
                          onClick={() => onPreview(app)}
                          className="w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 flex items-center justify-center transition-all hover:-translate-y-0.5 hover:shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Download */}
                        <button
                          title="Download PDF"
                          onClick={() => onDownload(app)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-700 hover:bg-green-800 text-white text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md shadow-green-900/20"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          PDF
                        </button>

                        {/* Delete */}
                        <button
                          title="Delete application"
                          onClick={() => onDelete(app)}
                          className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-all hover:-translate-y-0.5 hover:shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                      No applications match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
              Showing {filtered.length} of {apps.length} applications
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');

  // Modal state
  const [editApp, setEditApp] = useState(null);
  const [previewApp, setPreviewApp] = useState(null);
  const [deleteApp, setDeleteApp] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const q = query(collection(db, "applications"), orderBy("submissionDate", "asc"));
        const querySnapshot = await getDocs(q);
        setApplications(querySnapshot.docs.map(doc => doc.data()));
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  // Group apps by year
  const byYear = useMemo(() => {
    const filtered = globalSearch.trim()
      ? applications.filter(a =>
          a.candidateName?.toLowerCase().includes(globalSearch.toLowerCase()) ||
          a.appId?.toString().includes(globalSearch)
        )
      : applications;

    const map = {};
    filtered.forEach(app => {
      const yr = getYear(app.submissionDate);
      if (!map[yr]) map[yr] = [];
      map[yr].push(app);
    });
    return map;
  }, [applications, globalSearch]);

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a); // newest first
  const currentYear = new Date().getFullYear();

  // Handler: save edited app into local state
  const handleSaveEdit = (updatedApp) => {
    setApplications(prev => prev.map(a => a.appId === updatedApp.appId ? updatedApp : a));
    // If preview is open for same app, update it too
    if (previewApp?.appId === updatedApp.appId) setPreviewApp(updatedApp);
    setEditApp(null);
    toast.success('Application updated locally!');
  };

  // Handler: delete from Firestore + local state
  const handleDeleteConfirm = async () => {
    if (!deleteApp) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'applications', deleteApp.appId));
      setApplications(prev => prev.filter(a => a.appId !== deleteApp.appId));
      toast.success(`Application #${deleteApp.appId} deleted.`);
      setDeleteApp(null);
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete application. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = (app) => {
    if (!app) return;
    const formDataWithId = { ...app.formData, appId: app.appId };
    toast.promise(
      generateAndDownloadPdf(formDataWithId, app.subjects, app.entranceMarks, !!app.entranceMarks),
      {
        loading: 'Generating PDF…',
        success: <b>PDF Generated!</b>,
        error: <b>Could not generate PDF.</b>,
      }
    );
  };

  // Stats
  const totalCount = applications.length;
  const countByYear = (yr) => applications.filter(a => getYear(a.submissionDate) === yr).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-green-200/50 blur-md scale-110" />
            <img src="/mgm_logo.png" alt="MGM Logo" className="relative h-16 w-16 object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">MGM College of Engineering & Technology, Pampakuda</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-green-800 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live Application Portal
          </div>
        </div>

        {/* Stat Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="Total Applications" value={totalCount} icon="📋" color="border-green-500" />
            <StatCard label="2025 Batch" value={countByYear(2025)} icon="📅" color="border-amber-400" />
            <StatCard label="2026 Batch" value={countByYear(2026)} icon="🎓" color="border-blue-400" />
          </div>
        )}

        {/* Global search */}
        {!loading && !error && applications.length > 0 && (
          <div className="glass-card rounded-2xl px-5 py-4 mb-5 shadow-sm flex items-center gap-3">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search across all applications by name or App ID…"
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
            />
            {globalSearch && (
              <button onClick={() => setGlobalSearch('')} className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold">×</button>
            )}
          </div>
        )}

        {/* Loading / Error */}
        {loading && (
          <div className="glass-card rounded-2xl p-12 text-center shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin w-8 h-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <p className="text-sm text-gray-500 font-medium">Loading applications…</p>
            </div>
          </div>
        )}

        {error && (
          <div className="glass-card rounded-2xl p-8 text-center border border-red-200 bg-red-50 shadow-sm">
            <p className="text-sm text-red-600 font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* Year accordion sections */}
        {!loading && !error && (
          <div className="space-y-4">
            {years.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center shadow-sm">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm text-gray-500 font-medium">No applications found.</p>
              </div>
            ) : (
              years.map(year => (
                <YearSection
                  key={year}
                  year={year}
                  apps={byYear[year]}
                  defaultOpen={year === currentYear}
                  onEdit={setEditApp}
                  onPreview={setPreviewApp}
                  onDownload={handleDownload}
                  onDelete={setDeleteApp}
                />
              ))
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          MGM College Admin Portal · Data from Firebase Firestore
        </p>
      </div>

      {/* Edit Modal */}
      {editApp && (
        <EditApplicationModal
          app={editApp}
          onSave={handleSaveEdit}
          onClose={() => setEditApp(null)}
        />
      )}

      {/* Preview Modal */}
      {previewApp && (
        <PreviewModal
          app={previewApp}
          onClose={() => setPreviewApp(null)}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteApp && (
        <DeleteConfirmModal
          app={deleteApp}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteApp(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}