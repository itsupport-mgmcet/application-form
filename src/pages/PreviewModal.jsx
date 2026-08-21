import { generateAndDownloadPdf } from '../pdfGenerator';
import toast from 'react-hot-toast';

const Row = ({ label, value }) => (
  <tr className="border-b border-gray-100">
    <td className="py-2 px-3 text-xs font-semibold text-gray-500 bg-gray-50/60 w-2/5">{label}</td>
    <td className="py-2 px-3 text-xs text-gray-800">{value || <span className="text-gray-300">—</span>}</td>
  </tr>
);

const SectionHeader = ({ children }) => (
  <tr>
    <td colSpan={2} className="py-2 px-3 bg-green-800 text-white text-xs font-bold">{children}</td>
  </tr>
);

export default function PreviewModal({ app, onClose }) {
  if (!app) return null;
  const f = app.formData || {};
  const subjects = app.subjects || [];
  const em = app.entranceMarks;

  const handleDownload = () => {
    const formDataWithId = { ...f, appId: app.appId };
    toast.promise(
      generateAndDownloadPdf(formDataWithId, subjects, em, !!em),
      {
        loading: 'Generating PDF…',
        success: <b>PDF Generated Successfully!</b>,
        error: <b>Could not generate PDF.</b>,
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center modal-backdrop" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col" style={{ maxHeight: '92vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-green-800 to-green-700 rounded-t-2xl">
          <div>
            <h2 className="text-base font-bold text-white">Application Preview</h2>
            <p className="text-xs text-green-200 mt-0.5">App #{app.appId} · {app.candidateName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl font-bold transition-colors">×</button>
        </div>

        {/* Scrollable preview body */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          {/* College Header */}
          <div className="text-center mb-5 pb-4 border-b-2 border-green-800">
            <img src="/mgm_logo.png" alt="Logo" className="h-14 w-14 mx-auto mb-2 object-contain" />
            <h3 className="text-sm font-extrabold text-green-900">MGM COLLEGE OF ENGINEERING & TECHNOLOGY</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Pampakuda P.O, Ernakulam-686667, Kerala</p>
            <p className="text-[10px] text-gray-500">Approved by AICTE · Affiliated to APJ Abdul Kalam Technological University</p>
            <div className="mt-2 inline-block bg-green-800 text-white text-[10px] font-bold px-3 py-1 rounded">
              APPLICATION FOR B.TECH ADMISSION 2025–2026
            </div>
            <p className="text-[10px] text-gray-600 mt-1.5 font-medium">Application No: <span className="text-green-800 font-bold">{app.appId}</span></p>
          </div>

          {/* Data table */}
          <table className="w-full border border-gray-200 rounded-xl overflow-hidden text-xs mb-4">
            <tbody>
              <SectionHeader>Personal Information</SectionHeader>
              <Row label="Candidate Name" value={f.candidateName?.toUpperCase()} />
              <Row label="Email" value={f.email} />
              <Row label="Date of Birth" value={f.dateOfBirth} />
              <Row label="Age" value={f.age} />
              <Row label="Gender" value={f.gender} />
              <Row label="Nationality" value={f.nationality} />
              <Row label="Place" value={f.place} />
              <Row label="Religion" value={f.religion} />
              <Row label="Community" value={f.community} />
              <Row label="Category" value={f.category} />
              <Row label="Blood Group" value={f.bloodGroup} />
              <Row label="Aadhaar Number" value={f.aadhaarNumber} />
              <Row label="Permanent Address" value={f.permanentAddress} />
              <Row label="Communication Address" value={f.communicationAddress} />
              <Row label="Admission Quota" value={f.quota} />
              <Row label="Branch Preferences"
                value={[f.preference1, f.preference2, f.preference3].filter(Boolean).map((p, i) => `${i+1}. ${p}`).join(' | ')} />

              <SectionHeader>Family Information</SectionHeader>
              <Row label="Father's Name" value={f.fatherName} />
              <Row label="Father's Occupation" value={f.fatherOccupation} />
              <Row label="Father's Mobile" value={f.fatherMobile} />
              <Row label="Mother's Name" value={f.motherName} />
              <Row label="Mother's Occupation" value={f.motherOccupation} />
              <Row label="Mother's Mobile" value={f.motherMobile} />
              <Row label="Annual Family Income" value={f.annualIncome ? `₹${f.annualIncome}` : ''} />
              <Row label="Guardian's Name" value={f.guardianName} />
              <Row label="Guardian's Relation" value={f.guardianRelation} />
              <Row label="Guardian's Mobile" value={f.guardianMobileNumber} />

              <SectionHeader>Academic Information</SectionHeader>
              <Row label="Institution Last Studied" value={f.lastInstitution} />
              <Row label="Board of Study" value={f.boardOfStudy} />
              <Row label="Grand Total" value={f.grandTotal} />
              <Row label="Total Percentage" value={f.totalPercentage ? `${f.totalPercentage}%` : ''} />
              <Row label="Total PCM" value={f.totalPCM} />
              <Row label="PCM Percentage" value={f.pcmPercentage ? `${f.pcmPercentage}%` : ''} />
            </tbody>
          </table>

          {/* Subjects table */}
          {subjects.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-gray-700 mb-2">Subject-wise Marks</h4>
              <table className="w-full border border-gray-200 rounded-xl overflow-hidden text-xs">
                <thead>
                  <tr className="bg-green-800 text-white">
                    <th className="px-3 py-2 text-left">Subject</th>
                    <th className="px-3 py-2 text-center">Obtained</th>
                    <th className="px-3 py-2 text-center">Max</th>
                    <th className="px-3 py-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subjects.map((s, idx) => (
                    <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-1.5">{s.name}</td>
                      <td className="px-3 py-1.5 text-center">{s.markObtained}</td>
                      <td className="px-3 py-1.5 text-center">{s.maxMark}</td>
                      <td className="px-3 py-1.5 text-center font-semibold text-green-700">{s.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Entrance marks */}
          {em && (
            <div className="mb-4">
              <table className="w-full border border-gray-200 rounded-xl overflow-hidden text-xs">
                <tbody>
                  <SectionHeader>Entrance Examination Details</SectionHeader>
                  <Row label="Register No." value={f.entranceRegisterNo} />
                  <Row label="Rank" value={f.entranceRank} />
                  <Row label="Paper I (Phy & Chem) — Figures" value={em.paper1Figures} />
                  <Row label="Paper I (Phy & Chem) — Words" value={em.paper1Words} />
                  <Row label="Paper II (Maths) — Figures" value={em.paper2Figures} />
                  <Row label="Paper II (Maths) — Words" value={em.paper2Words} />
                  <Row label="Total Marks — Figures" value={em.totalFigures} />
                  <Row label="Total Marks — Words" value={em.totalWords} />
                </tbody>
              </table>
            </div>
          )}

          {/* SSLC */}
          <table className="w-full border border-gray-200 rounded-xl overflow-hidden text-xs mb-4">
            <tbody>
              <SectionHeader>SSLC Details</SectionHeader>
              <Row label="SSLC Board" value={f.sslcBoard} />
              <Row label="SSLC Percentage" value={f.sslcPercentage ? `${f.sslcPercentage}%` : ''} />
            </tbody>
          </table>

          {/* Signatures */}
          {(f.photo || f.parentSignature || f.applicantSignature) && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-gray-700 mb-2">Uploaded Documents</h4>
              <div className="grid grid-cols-3 gap-3">
                {f.photo && (
                  <div className="text-center">
                    <img src={f.photo} alt="Photo" className="h-20 w-full object-contain border border-gray-200 rounded-lg mb-1" />
                    <p className="text-[10px] text-gray-500">Passport Photo</p>
                  </div>
                )}
                {f.parentSignature && (
                  <div className="text-center">
                    <img src={f.parentSignature} alt="Parent Sig" className="h-20 w-full object-contain border border-gray-200 rounded-lg mb-1" />
                    <p className="text-[10px] text-gray-500">Parent Signature</p>
                  </div>
                )}
                {f.applicantSignature && (
                  <div className="text-center">
                    <img src={f.applicantSignature} alt="Applicant Sig" className="h-20 w-full object-contain border border-gray-200 rounded-lg mb-1" />
                    <p className="text-[10px] text-gray-500">Applicant Signature</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-[10px] text-gray-400 text-center mt-2">
            Submitted on: {new Date(app.submissionDate).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <p className="text-xs text-gray-500">This preview matches what will be in the PDF.</p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all">
              Close
            </button>
            <button onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-green-700 hover:bg-green-800 rounded-xl transition-all shadow-md shadow-green-900/20 hover:shadow-lg hover:-translate-y-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
