import { useState, memo } from "react";
import { generateAndDownloadPdf } from "./pdfGenerator";

const FILE_SIZE = 2 * 1024 * 1024; // 2MB
const SUPPORTED_FORMATS = ["image/jpeg", "image/jpg", "image/png"];

const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return <p className="text-red-500 text-sm mt-1">{error}</p>;
};

const InputField = memo(({
  label,
  name,
  type = "text",
  required = false,
  placeholder = "",
  value,
  onChange,
  error,
  className = ""
}) => {
  const hasError = !!error;

  return (
    <div className={className}>
      <label htmlFor={name} className="block mb-2 font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent transition ${hasError ? 'border-red-500 focus:ring-red-500 error-field' : 'border-gray-300 focus:ring-blue-500'
          }`}
      />
      <ErrorMessage error={error} />
    </div>
  );
});

const FileField = memo(({ label, name, required = false, onChange, error }) => {
  const hasError = !!error;

  return (
    <div>
      <label htmlFor={name} className="block mb-2 font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type="file"
        accept="image/*"
        onChange={(e) => onChange(name, e.target.files[0])}
        className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent transition ${hasError ? 'border-red-500 focus:ring-red-500 error-field' : 'border-gray-300 focus:ring-blue-500'
          }`}
      />
      <ErrorMessage error={error} />
    </div>
  );
});


export default function App() {
  const [subjects, setSubjects] = useState([]);
  // UPDATED: State for entrance marks
  const [entranceMarks, setEntranceMarks] = useState({
    paper1Figures: '', paper1Words: '',
    paper2Figures: '', paper2Words: '',
    totalFigures: '', totalWords: '', // REPLACED Paper 3 with Total
  });

  const [formData, setFormData] = useState({
    candidateName: '',
    email: '',
    permanentAddress: '',
    communicationAddress: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    nationality: '',
    religion: '',
    community: '',
    category: '',
    bloodGroup: '',
    aadhaarNumber: '',
    quota: '',
    preference1: '',
    preference2: '',
    preference3: '',
    fatherName: '',
    fatherOccupation: '',
    fatherMobile: '',
    motherName: '',
    motherOccupation: '',
    motherMobile: '',
    annualIncome: '',
    guardianName: '',
    guardianRelation: '',
    guardianMobileNumber: '',
    lastInstitution: '',
    boardOfStudy: '',
    grandTotal: '',
    totalPercentage: '',
    totalPCM: '',
    pcmPercentage: '',
    entranceRegisterNo: '',
    entranceRank: '',
    sslcBoard: '',
    sslcPercentage: '',
    photo: null,
    parentSignature: null,
    applicantSignature: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateAadhaar = (aadhaar) => /^\d{12}$/.test(aadhaar);
  const validateMobile = (mobile) => /^\d{10}$/.test(mobile);
  const validateFile = (file) => {
    if (!file) return { valid: false, message: "File is required" };
    if (file.size > FILE_SIZE) return { valid: false, message: "File size must be less than 2MB" };
    if (!SUPPORTED_FORMATS.includes(file.type)) return { valid: false, message: "Only image files are allowed" };
    return { valid: true };
  };
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };
  const handleFileChange = (field, file) => {
    setFormData(prev => ({ ...prev, [field]: file }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };
  const addSubject = () => {
    const newId = subjects.length > 0 ? subjects[subjects.length - 1].id + 1 : 1;
    setSubjects([...subjects, { id: newId, name: "", markObtained: "", maxMark: "", grade: "" }]);
  };
  const removeSubject = (id) => setSubjects(subjects.filter(subj => subj.id !== id));
  const handleSubjectChange = (id, field, value) => {
    setSubjects(subjects.map(subj => subj.id === id ? { ...subj, [field]: value } : subj));
  };
  const handleEntranceMarkChange = (field, value) => {
    setEntranceMarks(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    const requiredFields = {
      candidateName: 'Name is required', email: 'Email is required', permanentAddress: 'Permanent address is required', communicationAddress: 'Communication address is required', dateOfBirth: 'Date of birth is required', age: 'Age is required', gender: 'Gender is required', nationality: 'Nationality is required', religion: 'Religion is required', community: 'Community is required', category: 'Category is required', bloodGroup: 'Blood group is required', aadhaarNumber: 'Aadhaar number is required', quota: 'Admission quota is required', preference1: 'First preference is required', preference2: 'Second preference is required', preference3: 'Third preference is required', fatherName: "Father's name is required", fatherOccupation: "Father's occupation is required", fatherMobile: "Father's mobile is required", motherName: "Mother's name is required", motherOccupation: "Mother's occupation is required", motherMobile: "Mother's mobile is required", annualIncome: 'Annual family income is required', guardianName: "Guardian's name is required", guardianRelation: "Guardian's relation is required", guardianMobileNumber: "Guardian's mobile is required", lastInstitution: 'Last institution is required', boardOfStudy: 'Board of study is required', grandTotal: 'Grand Total is required', totalPercentage: 'Total Percentage is required', totalPCM: 'Total PCM is required', pcmPercentage: 'PCM Percentage is required', entranceRegisterNo: 'Entrance register number is required', entranceRank: 'Entrance rank is required', sslcBoard: 'SSLC board is required', sslcPercentage: 'SSLC percentage is required'
    };
    Object.keys(requiredFields).forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') newErrors[field] = requiredFields[field];
    });

    // UPDATED: Validation for entrance marks
    const requiredEntranceFields = {
      paper1Figures: 'Paper 1 marks (figures) is required',
      paper1Words: 'Paper 1 marks (words) is required',
      paper2Figures: 'Paper 2 marks (figures) is required',
      paper2Words: 'Paper 2 marks (words) is required',
      totalFigures: 'Total marks (figures) is required',
      totalWords: 'Total marks (words) is required',
    };
    Object.keys(requiredEntranceFields).forEach(field => {
      if (!entranceMarks[field] || entranceMarks[field].toString().trim() === '') newErrors[field] = requiredEntranceFields[field];
    });

    if (subjects.length === 0) {
      newErrors.subjects = 'Please add at least one subject.';
    } else {
      if (subjects.some(s => !s.name || !s.markObtained || !s.maxMark || !s.grade)) {
        newErrors.subjects = 'All fields for every subject are required.';
      }
    }

    if (formData.email && !validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (formData.aadhaarNumber && !validateAadhaar(formData.aadhaarNumber)) newErrors.aadhaarNumber = 'Aadhaar number must be 12 digits';
    if (formData.fatherMobile && !validateMobile(formData.fatherMobile)) newErrors.fatherMobile = 'Mobile number must be 10 digits';
    if (formData.motherMobile && !validateMobile(formData.motherMobile)) newErrors.motherMobile = 'Mobile number must be 10 digits';
    if (formData.guardianMobileNumber && !validateMobile(formData.guardianMobileNumber)) newErrors.guardianMobileNumber = 'Mobile number must be 10 digits';
    if (formData.age && (formData.age < 16 || formData.age > 25)) newErrors.age = 'Age must be between 16 and 25';
    if (formData.sslcPercentage && (formData.sslcPercentage < 0 || formData.sslcPercentage > 100)) newErrors.sslcPercentage = 'Percentage must be between 0 and 100';

    ['photo', 'parentSignature', 'applicantSignature'].forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field === 'photo' ? 'Passport size photo' : field === 'parentSignature' ? 'Parent signature' : 'Applicant signature'} is required`;
      } else {
        const validation = validateFile(formData[field]);
        if (!validation.valid) newErrors[field] = validation.message;
      }
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = document.querySelector('.error-field');
      if (firstErrorField) firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      await generateAndDownloadPdf(formData, subjects, entranceMarks);
      alert('Application PDF downloaded successfully!');
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("There was an error generating the PDF. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-white to-yellow-200 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* ... Header and other form sections ... */}
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/mgm_logo.png" alt="MGM College Logo" className="h-24 w-24 mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold text-green-800">
            MGM College of Engineering and Technology, Pampakuda
          </h1>
          <h2 className="text-lg md:text-xl text-yellow-600 mt-2 font-semibold">
            2025 Batch Application Form
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ... Personal, Family, Academic Info ... */}
          <section className="bg-white shadow-lg rounded-xl border p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Name of the Candidate" name="candidateName" required placeholder="Enter full name" value={formData.candidateName} onChange={(value) => handleInputChange('candidateName', value)} error={errors.candidateName} />
              <InputField label="Email" name="email" type="email" required placeholder="example@email.com" value={formData.email} onChange={(value) => handleInputChange('email', value)} error={errors.email} />
              <div className="md:col-span-2">
                <label className="block mb-2 font-semibold text-gray-700">Permanent Address <span className="text-red-500">*</span></label>
                <textarea name="permanentAddress" placeholder="Enter permanent address" value={formData.permanentAddress} onChange={(e) => handleInputChange('permanentAddress', e.target.value)} className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent transition ${errors.permanentAddress ? 'border-red-500 focus:ring-red-500 error-field' : 'border-gray-300 focus:ring-blue-500'}`} rows={3} />
                <ErrorMessage error={errors.permanentAddress} />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2 font-semibold text-gray-700">Address For Communication <span className="text-red-500">*</span></label>
                <textarea name="communicationAddress" placeholder="Enter communication address" value={formData.communicationAddress} onChange={(e) => handleInputChange('communicationAddress', e.target.value)} className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent transition ${errors.communicationAddress ? 'border-red-500 focus:ring-red-500 error-field' : 'border-gray-300 focus:ring-blue-500'}`} rows={3} />
                <ErrorMessage error={errors.communicationAddress} />
              </div>
              <InputField label="Date of Birth" name="dateOfBirth" type="date" required value={formData.dateOfBirth} onChange={(value) => handleInputChange('dateOfBirth', value)} error={errors.dateOfBirth} />
              <InputField label="Age" name="age" type="number" required value={formData.age} onChange={(value) => handleInputChange('age', value)} error={errors.age} />
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Gender <span className="text-red-500">*</span></label>
                <select name="gender" value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)} className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent transition ${errors.gender ? 'border-red-500 focus:ring-red-500 error-field' : 'border-gray-300 focus:ring-blue-500'}`}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <ErrorMessage error={errors.gender} />
              </div>
              <InputField label="Nationality" name="nationality" required value={formData.nationality} onChange={(value) => handleInputChange('nationality', value)} error={errors.nationality} />
              <InputField label="Religion" name="religion" required value={formData.religion} onChange={(value) => handleInputChange('religion', value)} error={errors.religion} />
              <InputField label="Community" name="community" required value={formData.community} onChange={(value) => handleInputChange('community', value)} error={errors.community} />
              <InputField label="Category" name="category" required placeholder="Ex: General, OBC, SC, ST" value={formData.category} onChange={(value) => handleInputChange('category', value)} error={errors.category} />
              <InputField label="Blood Group" name="bloodGroup" required value={formData.bloodGroup} onChange={(value) => handleInputChange('bloodGroup', value)} error={errors.bloodGroup} />
              <InputField label="Aadhaar Number" name="aadhaarNumber" required placeholder="12-digit Aadhaar number" value={formData.aadhaarNumber} onChange={(value) => handleInputChange('aadhaarNumber', value)} error={errors.aadhaarNumber} />
              <InputField label="Admission Quota" name="quota" required placeholder="Ex: Management, Merit, NRI" value={formData.quota} onChange={(value) => handleInputChange('quota', value)} error={errors.quota} />
              <div className="md:col-span-2">
                <label className="block mb-2 font-semibold text-gray-700">Order of Preference of Branches <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input type="text" name="preference1" placeholder="1st Preference" value={formData.preference1} onChange={(e) => handleInputChange('preference1', e.target.value)} className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent transition ${errors.preference1 ? 'border-red-500 focus:ring-red-500 error-field' : 'border-gray-300 focus:ring-blue-500'}`} />
                    <ErrorMessage error={errors.preference1} />
                  </div>
                  <div>
                    <input type="text" name="preference2" placeholder="2nd Preference" value={formData.preference2} onChange={(e) => handleInputChange('preference2', e.target.value)} className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent transition ${errors.preference2 ? 'border-red-500 focus:ring-red-500 error-field' : 'border-gray-300 focus:ring-blue-500'}`} />
                    <ErrorMessage error={errors.preference2} />
                  </div>
                  <div>
                    <input type="text" name="preference3" placeholder="3rd Preference" value={formData.preference3} onChange={(e) => handleInputChange('preference3', e.target.value)} className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent transition ${errors.preference3 ? 'border-red-500 focus:ring-red-500 error-field' : 'border-gray-300 focus:ring-blue-500'}`} />
                    <ErrorMessage error={errors.preference3} />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="bg-white shadow-lg rounded-xl border p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">Family Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Father's Name" name="fatherName" required value={formData.fatherName} onChange={(value) => handleInputChange('fatherName', value)} error={errors.fatherName} />
              <InputField label="Father's Occupation" name="fatherOccupation" required value={formData.fatherOccupation} onChange={(value) => handleInputChange('fatherOccupation', value)} error={errors.fatherOccupation} />
              <InputField label="Father's Mobile" name="fatherMobile" required placeholder="10-digit mobile number" value={formData.fatherMobile} onChange={(value) => handleInputChange('fatherMobile', value)} error={errors.fatherMobile} />
              <InputField label="Mother's Name" name="motherName" required value={formData.motherName} onChange={(value) => handleInputChange('motherName', value)} error={errors.motherName} />
              <InputField label="Mother's Occupation" name="motherOccupation" required value={formData.motherOccupation} onChange={(value) => handleInputChange('motherOccupation', value)} error={errors.motherOccupation} />
              <InputField label="Mother's Mobile" name="motherMobile" required placeholder="10-digit mobile number" value={formData.motherMobile} onChange={(value) => handleInputChange('motherMobile', value)} error={errors.motherMobile} />
              <InputField label="Annual Family Income" name="annualIncome" type="number" required className="md:col-span-2" value={formData.annualIncome} onChange={(value) => handleInputChange('annualIncome', value)} error={errors.annualIncome} />
              <InputField label="Guardian's Name" name="guardianName" required value={formData.guardianName} onChange={(value) => handleInputChange('guardianName', value)} error={errors.guardianName} />
              <InputField label="Guardian's Relation" name="guardianRelation" required placeholder="Ex: Father, Mother" value={formData.guardianRelation} onChange={(value) => handleInputChange('guardianRelation', value)} error={errors.guardianRelation} />
              <InputField label="Guardian's Mobile No." name="guardianMobileNumber" required value={formData.guardianMobileNumber} onChange={(value) => handleInputChange('guardianMobileNumber', value)} error={errors.guardianMobileNumber} />
            </div>
          </section>
          <section className="bg-white shadow-lg rounded-xl border p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <InputField label="Institution Last Studied" name="lastInstitution" required value={formData.lastInstitution} onChange={(value) => handleInputChange('lastInstitution', value)} error={errors.lastInstitution} />
              <InputField label="Board of Study" name="boardOfStudy" required placeholder="Ex: HSE" value={formData.boardOfStudy} onChange={(value) => handleInputChange('boardOfStudy', value)} error={errors.boardOfStudy} />
            </div>
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Subject-wise Marks <span className="text-red-500">*</span></h4>
              <div className="overflow-x-auto">
                <table className={`min-w-full table-auto border rounded-lg ${errors.subjects ? 'border-red-500 error-field' : 'border-gray-300'}`}>
                  <thead className="bg-green-800 text-white">
                    <tr>
                      <th className="px-4 py-2 text-left">Subject</th><th className="px-4 py-2 text-left">Mark Obtained</th><th className="px-4 py-2 text-left">Max Marks</th><th className="px-4 py-2 text-left">Grade</th><th className="px-4 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subj) => (
                      <tr key={subj.id} className="border-b border-gray-200">
                        <td className="px-4 py-2"><input type="text" placeholder="Subject" className="w-full border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500" value={subj.name} onChange={(e) => handleSubjectChange(subj.id, "name", e.target.value)} /></td>
                        <td className="px-4 py-2"><input type="number" placeholder="Marks" className="w-full border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500" value={subj.markObtained} onChange={(e) => handleSubjectChange(subj.id, "markObtained", e.target.value)} /></td>
                        <td className="px-4 py-2"><input type="number" placeholder="Max" className="w-full border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500" value={subj.maxMark} onChange={(e) => handleSubjectChange(subj.id, "maxMark", e.target.value)} /></td>
                        <td className="px-4 py-2"><input type="text" placeholder="Grade" className="w-full border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500" value={subj.grade} onChange={(e) => handleSubjectChange(subj.id, "grade", e.target.value)} /></td>
                        <td className="px-4 py-2 text-center"><button type="button" onClick={() => removeSubject(subj.id)} className="text-red-500 hover:text-red-700 font-bold text-lg">×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ErrorMessage error={errors.subjects} />
              <button type="button" onClick={addSubject} className="mt-4 bg-green-800 hover:bg-green-900 text-white px-6 py-2 rounded-lg shadow transition">+ Add Subject</button>
            </div>
            <div className="pt-4 mt-6 border-t">
              <h4 className="font-semibold text-gray-700 mb-3">Enter Totals</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Grand Total" name="grandTotal" type="number" required value={formData.grandTotal} onChange={(value) => handleInputChange('grandTotal', value)} error={errors.grandTotal} />
                <InputField label="Total Percentage" name="totalPercentage" placeholder="e.g. 95%" required value={formData.totalPercentage} onChange={(value) => handleInputChange('totalPercentage', value)} error={errors.totalPercentage} />
                <InputField label="Total PCM" name="totalPCM" type="number" required value={formData.totalPCM} onChange={(value) => handleInputChange('totalPCM', value)} error={errors.totalPCM} />
                <InputField label="PCM Percentage" name="pcmPercentage" placeholder="e.g. 98%" required value={formData.pcmPercentage} onChange={(value) => handleInputChange('pcmPercentage', value)} error={errors.pcmPercentage} />
              </div>
            </div>
          </section>

          <section className="bg-white shadow-lg rounded-xl border p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">Entrance & SSLC Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <InputField label="Entrance Register No" name="entranceRegisterNo" required value={formData.entranceRegisterNo} onChange={(value) => handleInputChange('entranceRegisterNo', value)} error={errors.entranceRegisterNo} />
              <InputField label="Rank" name="entranceRank" required value={formData.entranceRank} onChange={(value) => handleInputChange('entranceRank', value)} error={errors.entranceRank} />
            </div>
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Entrance Examination Marks <span className="text-red-500">*</span></h4>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border border-gray-300 rounded-lg">
                  <thead className="bg-green-800 text-white">
                    <tr>
                      <th rowSpan={2} className="px-4 py-2 border-r border-gray-300">Subject / Paper</th>
                      <th colSpan={2} className="px-4 py-2 text-center">Marks Scored</th>
                    </tr>
                    <tr className="bg-green-700">
                      <th className="px-4 py-2">In Figures</th>
                      <th className="px-4 py-2">In Words</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-2 font-medium">Paper I (Physics & Chemistry)</td>
                      <td className="px-4 py-2">
                        <input type="text" placeholder="Marks" className={`w-full border rounded px-2 py-1 focus:ring-2 focus:border-transparent ${errors.paper1Figures ? 'border-red-500 error-field' : 'border-gray-300'}`} value={entranceMarks.paper1Figures} onChange={(e) => handleEntranceMarkChange('paper1Figures', e.target.value)} />
                        <ErrorMessage error={errors.paper1Figures} />
                      </td>
                      <td className="px-4 py-2">
                        <input type="text" placeholder="In words" className={`w-full border rounded px-2 py-1 focus:ring-2 focus:border-transparent ${errors.paper1Words ? 'border-red-500 error-field' : 'border-gray-300'}`} value={entranceMarks.paper1Words} onChange={(e) => handleEntranceMarkChange('paper1Words', e.target.value)} />
                        <ErrorMessage error={errors.paper1Words} />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-2 font-medium">Paper II (Mathematics)</td>
                      <td className="px-4 py-2">
                        <input type="text" placeholder="Marks" className={`w-full border rounded px-2 py-1 focus:ring-2 focus:border-transparent ${errors.paper2Figures ? 'border-red-500 error-field' : 'border-gray-300'}`} value={entranceMarks.paper2Figures} onChange={(e) => handleEntranceMarkChange('paper2Figures', e.target.value)} />
                        <ErrorMessage error={errors.paper2Figures} />
                      </td>
                      <td className="px-4 py-2">
                        <input type="text" placeholder="In words" className={`w-full border rounded px-2 py-1 focus:ring-2 focus:border-transparent ${errors.paper2Words ? 'border-red-500 error-field' : 'border-gray-300'}`} value={entranceMarks.paper2Words} onChange={(e) => handleEntranceMarkChange('paper2Words', e.target.value)} />
                        <ErrorMessage error={errors.paper2Words} />
                      </td>
                    </tr>
                    {/* UPDATED: Paper 3 removed, Total Marks added */}
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-2 font-medium">Total Marks</td>
                      <td className="px-4 py-2">
                        <input type="text" placeholder="Total in figures" className={`w-full border rounded px-2 py-1 focus:ring-2 focus:border-transparent ${errors.totalFigures ? 'border-red-500 error-field' : 'border-gray-300'}`} value={entranceMarks.totalFigures} onChange={(e) => handleEntranceMarkChange('totalFigures', e.target.value)} />
                        <ErrorMessage error={errors.totalFigures} />
                      </td>
                      <td className="px-4 py-2">
                        <input type="text" placeholder="Total in words" className={`w-full border rounded px-2 py-1 focus:ring-2 focus:border-transparent ${errors.totalWords ? 'border-red-500 error-field' : 'border-gray-300'}`} value={entranceMarks.totalWords} onChange={(e) => handleEntranceMarkChange('totalWords', e.target.value)} />
                        <ErrorMessage error={errors.totalWords} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="SSLC Board" name="sslcBoard" required value={formData.sslcBoard} onChange={(value) => handleInputChange('sslcBoard', value)} error={errors.sslcBoard} />
              <InputField label="SSLC Percentage" name="sslcPercentage" type="number" required placeholder="Enter percentage" value={formData.sslcPercentage} onChange={(value) => handleInputChange('sslcPercentage', value)} error={errors.sslcPercentage} />
            </div>
          </section>
          <section className="bg-white shadow-lg rounded-xl border p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">Document Uploads</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FileField label="Passport Size Photo" name="photo" required onChange={handleFileChange} error={errors.photo} />
              <FileField label="Parent Signature" name="parentSignature" required onChange={handleFileChange} error={errors.parentSignature} />
              <FileField label="Applicant Signature" name="applicantSignature" required onChange={handleFileChange} error={errors.applicantSignature} />
            </div>
            <p className="text-gray-500 text-sm mt-4">* Only image files (JPEG, JPG, PNG) are allowed. Maximum file size: 2MB</p>
          </section>

          <div className="flex justify-center pt-6">
            <button type="submit" disabled={isSubmitting} className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-800 hover:bg-green-900 hover:shadow-lg transform hover:-translate-y-0.5'}`}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}