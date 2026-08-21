import { useState, useEffect, useCallback } from 'react';
import ErrorMessage from '../components/ErrorMessage';

const InputField = ({ label, name, type = 'text', value, onChange, placeholder = '', required = false, error, className = '' }) => (
  <div className={className}>
    {label && (
      <label className="block mb-1 text-xs font-semibold text-gray-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input type={type} name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder}
      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition-all
        ${error ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 hover:border-gray-300'}`}
    />
    <ErrorMessage error={error} />
  </div>
);

const TextareaField = ({ label, name, value, onChange, rows = 2, required = false, error }) => (
  <div>
    <label className="block mb-1 text-xs font-semibold text-gray-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea name={name} value={value ?? ''} onChange={onChange} rows={rows}
      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition-all resize-none
        ${error ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 hover:border-gray-300'}`}
    />
    <ErrorMessage error={error} />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required = false, error }) => (
  <div>
    <label className="block mb-1 text-xs font-semibold text-gray-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select name={name} value={value ?? ''} onChange={onChange}
      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition-all bg-white
        ${error ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 hover:border-gray-300'}`}
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    <ErrorMessage error={error} />
  </div>
);

const SectionTitle = ({ children, icon }) => (
  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
    <span className="text-base">{icon}</span>
    <h4 className="text-sm font-bold text-gray-700">{children}</h4>
  </div>
);

export default function EditApplicationModal({ app, onSave, onClose }) {
  const [formData, setFormData] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [entranceMarks, setEntranceMarks] = useState({});
  const [hasTakenEntrance, setHasTakenEntrance] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (app) {
      setFormData({ ...app.formData });
      setSubjects(app.subjects ? [...app.subjects] : []);
      setEntranceMarks(app.entranceMarks ? { ...app.entranceMarks } : {
        paper1Figures: '', paper1Words: '', paper2Figures: '', paper2Words: '', totalFigures: '', totalWords: '',
      });
      setHasTakenEntrance(!!app.entranceMarks);
    }
  }, [app]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleEntranceChange = useCallback((e) => {
    const { name, value } = e.target;
    setEntranceMarks(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubjectChange = (id, field, value) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addSubject = () => {
    const newId = subjects.length > 0 ? subjects[subjects.length - 1].id + 1 : 1;
    setSubjects(prev => [...prev, { id: newId, name: '', markObtained: '', maxMark: '', grade: '' }]);
  };

  const removeSubject = (id) => setSubjects(prev => prev.filter(s => s.id !== id));

  const handleSave = () => {
    const updatedApp = {
      ...app,
      formData: { ...formData },
      subjects: [...subjects],
      entranceMarks: hasTakenEntrance ? { ...entranceMarks } : null,
    };
    onSave(updatedApp);
  };

  const TABS = [
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧' },
    { id: 'academic', label: 'Academic', icon: '🎓' },
    { id: 'entrance', label: 'Entrance', icon: '📝' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center modal-backdrop" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-content bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col" style={{ maxHeight: '92vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-green-800 to-green-700 rounded-t-2xl">
          <div>
            <h2 className="text-base font-bold text-white">Edit Application</h2>
            <p className="text-xs text-green-200 mt-0.5">App #{app?.appId} · {app?.candidateName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl font-bold transition-colors">×</button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-100 flex-shrink-0 bg-gray-50 px-4 pt-2 gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-t-lg whitespace-nowrap transition-all
                ${activeTab === tab.id ? 'bg-white border border-b-0 border-gray-200 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">

          {/* Personal Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-4 animate-fade-in">
              <SectionTitle icon="👤">Personal Information</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label="Full Name" name="candidateName" value={formData.candidateName} onChange={handleChange} required />
                <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                <TextareaField label="Permanent Address" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} />
                <TextareaField label="Communication Address" name="communicationAddress" value={formData.communicationAddress} onChange={handleChange} />
                <InputField label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                <InputField label="Age" name="age" type="number" value={formData.age} onChange={handleChange} />
                <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleChange}
                  options={[{value:'',label:'Select Gender'},{value:'Male',label:'Male'},{value:'Female',label:'Female'},{value:'Other',label:'Other'}]} />
                <InputField label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} />
                <InputField label="Place" name="place" value={formData.place} onChange={handleChange} />
                <InputField label="Religion" name="religion" value={formData.religion} onChange={handleChange} />
                <InputField label="Community" name="community" value={formData.community} onChange={handleChange} />
                <InputField label="Category" name="category" value={formData.category} onChange={handleChange} />
                <InputField label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} />
                <InputField label="Aadhaar Number" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} />
                <InputField label="Admission Quota" name="quota" value={formData.quota} onChange={handleChange} />
                <InputField label="1st Branch Preference" name="preference1" value={formData.preference1} onChange={handleChange} />
                <InputField label="2nd Branch Preference" name="preference2" value={formData.preference2} onChange={handleChange} />
                <InputField label="3rd Branch Preference" name="preference3" value={formData.preference3} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* Family Tab */}
          {activeTab === 'family' && (
            <div className="space-y-4 animate-fade-in">
              <SectionTitle icon="👨‍👩‍👧">Family Information</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} />
                <InputField label="Father's Occupation" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} />
                <InputField label="Father's Mobile" name="fatherMobile" value={formData.fatherMobile} onChange={handleChange} />
                <InputField label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} />
                <InputField label="Mother's Occupation" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} />
                <InputField label="Mother's Mobile" name="motherMobile" value={formData.motherMobile} onChange={handleChange} />
                <InputField label="Annual Family Income (₹)" name="annualIncome" type="number" value={formData.annualIncome} onChange={handleChange} className="sm:col-span-2" />
                <InputField label="Guardian's Name" name="guardianName" value={formData.guardianName} onChange={handleChange} />
                <InputField label="Guardian's Relation" name="guardianRelation" value={formData.guardianRelation} onChange={handleChange} />
                <InputField label="Guardian's Mobile" name="guardianMobileNumber" value={formData.guardianMobileNumber} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* Academic Tab */}
          {activeTab === 'academic' && (
            <div className="space-y-4 animate-fade-in">
              <SectionTitle icon="🎓">Academic Information</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label="Last Institution" name="lastInstitution" value={formData.lastInstitution} onChange={handleChange} />
                <InputField label="Board of Study" name="boardOfStudy" value={formData.boardOfStudy} onChange={handleChange} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-bold text-gray-600">Subject-wise Marks</h5>
                  <button type="button" onClick={addSubject}
                    className="text-xs bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors">
                    + Add Subject
                  </button>
                </div>
                {subjects.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">No subjects. Click "+ Add Subject".</p>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="min-w-full text-xs">
                      <thead className="bg-green-800 text-white">
                        <tr>
                          <th className="px-3 py-2 text-left">Subject</th>
                          <th className="px-3 py-2 text-left">Obtained</th>
                          <th className="px-3 py-2 text-left">Max</th>
                          <th className="px-3 py-2 text-left">Grade</th>
                          <th className="px-3 py-2" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {subjects.map(s => (
                          <tr key={s.id} className="bg-white hover:bg-green-50/30 transition-colors">
                            <td className="px-2 py-1.5"><input className="w-full border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-green-400" value={s.name} onChange={e => handleSubjectChange(s.id, 'name', e.target.value)} /></td>
                            <td className="px-2 py-1.5"><input className="w-full border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-green-400" value={s.markObtained} onChange={e => handleSubjectChange(s.id, 'markObtained', e.target.value)} /></td>
                            <td className="px-2 py-1.5"><input className="w-full border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-green-400" value={s.maxMark} onChange={e => handleSubjectChange(s.id, 'maxMark', e.target.value)} /></td>
                            <td className="px-2 py-1.5"><input className="w-full border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-green-400" value={s.grade} onChange={e => handleSubjectChange(s.id, 'grade', e.target.value)} /></td>
                            <td className="px-2 py-1.5 text-center"><button type="button" onClick={() => removeSubject(s.id)} className="w-5 h-5 rounded-full bg-red-100 hover:bg-red-200 text-red-600 font-bold text-sm flex items-center justify-center transition-colors">×</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <h5 className="text-xs font-bold text-amber-800 mb-2">Summary Totals</h5>
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="Grand Total" name="grandTotal" type="number" value={formData.grandTotal} onChange={handleChange} />
                  <InputField label="Total %" name="totalPercentage" value={formData.totalPercentage} onChange={handleChange} />
                  <InputField label="Total PCM" name="totalPCM" type="number" value={formData.totalPCM} onChange={handleChange} />
                  <InputField label="PCM %" name="pcmPercentage" value={formData.pcmPercentage} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {/* Entrance Tab */}
          {activeTab === 'entrance' && (
            <div className="space-y-4 animate-fade-in">
              <SectionTitle icon="📝">Entrance & SSLC</SectionTitle>

              <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all ${hasTakenEntrance ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="relative">
                  <input type="checkbox" checked={hasTakenEntrance} onChange={e => setHasTakenEntrance(e.target.checked)} className="sr-only" />
                  <div className={`w-9 h-5 rounded-full transition-colors ${hasTakenEntrance ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${hasTakenEntrance ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <span className="text-xs font-semibold text-gray-700">Has appeared for Entrance Examination</span>
              </label>

              {hasTakenEntrance && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Register No." name="entranceRegisterNo" value={formData.entranceRegisterNo} onChange={handleChange} />
                    <InputField label="Rank" name="entranceRank" value={formData.entranceRank} onChange={handleChange} />
                  </div>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="min-w-full text-xs">
                      <thead className="bg-green-800 text-white">
                        <tr>
                          <th className="px-3 py-2 text-left">Paper</th>
                          <th className="px-3 py-2 text-left">In Figures</th>
                          <th className="px-3 py-2 text-left">In Words</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {[
                          { label: 'Paper I (Phy & Chem)', fig: 'paper1Figures', word: 'paper1Words' },
                          { label: 'Paper II (Maths)', fig: 'paper2Figures', word: 'paper2Words' },
                          { label: 'Total', fig: 'totalFigures', word: 'totalWords' },
                        ].map(row => (
                          <tr key={row.fig}>
                            <td className="px-3 py-2 font-medium text-gray-700">{row.label}</td>
                            <td className="px-2 py-1.5"><input className="w-full border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-green-400" name={row.fig} value={entranceMarks[row.fig] ?? ''} onChange={handleEntranceChange} /></td>
                            <td className="px-2 py-1.5"><input className="w-full border border-gray-200 rounded px-2 py-1 text-xs outline-none focus:border-green-400" name={row.word} value={entranceMarks[row.word] ?? ''} onChange={handleEntranceChange} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div>
                <h5 className="text-xs font-bold text-gray-600 mb-2">SSLC Details</h5>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="SSLC Board" name="sslcBoard" value={formData.sslcBoard} onChange={handleChange} />
                  <InputField label="SSLC %" name="sslcPercentage" type="number" value={formData.sslcPercentage} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
          <p className="text-xs text-gray-500">Changes are saved locally and used when downloading PDF.</p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:text-gray-800 transition-all">
              Cancel
            </button>
            <button onClick={handleSave}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-green-700 hover:bg-green-800 rounded-xl transition-all shadow-md shadow-green-900/20 hover:shadow-lg hover:-translate-y-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
