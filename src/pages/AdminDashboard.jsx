import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { generateAndDownloadPdf } from '../pdfGenerator';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const q = query(collection(db, "applications"), orderBy("submissionDate", "asc"));
        const querySnapshot = await getDocs(q);
        const appsList = querySnapshot.docs.map(doc => doc.data());
        setApplications(appsList);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleDownload = async (appData) => {
    if (!appData) return;

    const formDataWithId = {
      ...appData.formData,
      appId: appData.appId
    };

    toast.promise(
      generateAndDownloadPdf(
        formDataWithId,
        appData.subjects,
        appData.entranceMarks
      ),
      {
        loading: 'Generating PDF...',
        success: <b>PDF Generated Successfully!</b>,
        error: <b>Could not generate PDF.</b>,
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-yellow-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/mgm_logo.png" alt="MGM College Logo" className="h-24 w-24 mb-4" />
          <h1 className="text-3xl font-bold text-green-800">
            Administrator Dashboard
          </h1>
          <h2 className="text-xl text-yellow-600 mt-2 font-semibold">
            Submitted Applications
          </h2>
        </div>

        <div className="bg-white shadow-xl rounded-xl border-gray-200 p-6">
          {loading && <p className="text-center text-gray-500">Loading applications...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">App ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Candidate Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Submission Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.length > 0 ? (
                    applications.map((app) => (
                      <tr key={app.appId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.appId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{app.candidateName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.submissionDate).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDownload(app)}
                            className="px-4 py-2 rounded-md font-semibold text-white transition-all bg-green-800 hover:bg-green-900"
                          >
                            Download PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No applications found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}