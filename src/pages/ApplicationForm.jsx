import { useState } from "react";
import ErrorMessage from "../components/ErrorMessage";
import { useNavigate } from "react-router-dom";
import { uploadImageToCloudinary } from "../utils/imageUpload";
import { db } from "../utils/firebase";
import { doc, runTransaction, increment } from "firebase/firestore";
import MemoizedInputField from "../components/MemoizedInputField";
import MemoizedFileField from "../components/MemoizedFileField";

export default function ApplicationForm() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [entranceMarks, setEntranceMarks] = useState({
    paper1Figures: '', paper1Words: '',
    paper2Figures: '', paper2Words: '',
    totalFigures: '', totalWords: '',
  });
  const [formData, setFormData] = useState({
    candidateName: '', email: '', permanentAddress: '', communicationAddress: '', dateOfBirth: '', age: '', gender: '', nationality: '', place: '', religion: '', community: '', category: '', bloodGroup: '', aadhaarNumber: '', quota: '', preference1: '', preference2: '', preference3: '', fatherName: '', fatherOccupation: '', fatherMobile: '', motherName: '', motherOccupation: '', motherMobile: '', annualIncome: '', guardianName: '', guardianRelation: '', guardianMobileNumber: '', lastInstitution: '', boardOfStudy: '', grandTotal: '', totalPercentage: '', totalPCM: '', pcmPercentage: '', entranceRegisterNo: '', entranceRank: '', sslcBoard: '', sslcPercentage: '', photo: null, parentSignature: null, applicantSignature: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateAadhaar = (aadhaar) => /^\d{12}$/.test(aadhaar);
  const validateMobile = (mobile) => /^\d{10}$/.test(mobile);
  const validateFile = (file) => {
    if (!file) return { valid: false, message: "File is required" };
    if (file.size > 2097152) return { valid: false, message: "File size must be less than 150KB" };
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) return { valid: false, message: "Only image files are allowed" };
    return { valid: true };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files[0] }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
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
      candidateName: 'Name is required', email: 'Email is required', permanentAddress: 'Permanent address is required', communicationAddress: 'Communication address is required', dateOfBirth: 'Date of birth is required', age: 'Age is required', gender: 'Gender is required', nationality: 'Nationality is required', place: 'Place is required', religion: 'Religion is required', community: 'Community is required', category: 'Category is required', bloodGroup: 'Blood group is required', aadhaarNumber: 'Aadhaar number is required', quota: 'Admission quota is required', preference1: 'First preference is required', preference2: 'Second preference is required', preference3: 'Third preference is required', fatherName: "Father's name is required", fatherOccupation: "Father's occupation is required", fatherMobile: "Father's mobile is required", motherName: "Mother's name is required", motherOccupation: "Mother's occupation is required", motherMobile: "Mother's mobile is required", annualIncome: 'Annual family income is required', guardianName: "Guardian's name is required", guardianRelation: "Guardian's relation is required", guardianMobileNumber: "Guardian's mobile is required", lastInstitution: 'Last institution is required', boardOfStudy: 'Board of study is required', grandTotal: 'Grand Total is required', totalPercentage: 'Total Percentage is required', totalPCM: 'Total PCM is required', pcmPercentage: 'PCM Percentage is required', entranceRegisterNo: 'Entrance register number is required', entranceRank: 'Entrance rank is required', sslcBoard: 'SSLC board is required', sslcPercentage: 'SSLC percentage is required'
    };
    Object.keys(requiredFields).forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') newErrors[field] = requiredFields[field];
    });
    const requiredEntranceFields = {
      paper1Figures: 'Paper 1 marks (figures) is required', paper1Words: 'Paper 1 marks (words) is required', paper2Figures: 'Paper 2 marks (figures) is required', paper2Words: 'Paper 2 marks (words) is required', totalFigures: 'Total marks (figures) is required', totalWords: 'Total marks (words) is required',
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
    if (formData.age && (formData.age < 13 || formData.age > 50)) newErrors.age = 'Age must be between 13 and 50';
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
    // ... handleSubmit logic remains the same
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
      alert("Uploading images, please wait...");
      const [photoURL, parentSignatureURL, applicantSignatureURL] = await Promise.all([
        uploadImageToCloudinary(formData.photo),
        uploadImageToCloudinary(formData.parentSignature),
        uploadImageToCloudinary(formData.applicantSignature)
      ]);
      const finalFormData = { ...formData, photo: photoURL, parentSignature: parentSignatureURL, applicantSignature: applicantSignatureURL };

      const counterRef = doc(db, "counters", "applicationCounter");

      const newAppId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        if (!counterDoc.exists()) {
          throw "Counter document does not exist!";
        }
        const newId = counterDoc.data().currentNumber + 1;
        const appIdString = newId.toString();
        const newAppRef = doc(db, "applications", appIdString);
        const applicationData = {
          appId: appIdString,
          candidateName: formData.candidateName,
          submissionDate: new Date().toISOString(),
          formData: finalFormData,
          subjects: subjects,
          entranceMarks: entranceMarks,
        };
        transaction.set(newAppRef, applicationData);
        transaction.update(counterRef, { currentNumber: increment(1) });
        return appIdString;
      });

      navigate('/success', { state: { appId: newAppId } });

    } catch (error) {
      console.error("Submission failed:", error);
      alert("A critical error occurred during submission. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-yellow-200 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* ... Header ... */}
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
          <section className="bg-white shadow-lg rounded-xl border-gray-200 p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MemoizedInputField label="Name of the Candidate" name="candidateName" required value={formData.candidateName} onChange={handleInputChange} error={errors.candidateName} />
              <MemoizedInputField label="Email" name="email" type="email" required value={formData.email} onChange={handleInputChange} error={errors.email} />
              <div className="md:col-span-2">
                <label className="block mb-2 font-semibold text-gray-700">Permanent Address <span className="text-red-500">*</span></label>
                <textarea name="permanentAddress" placeholder="Enter permanent address" value={formData.permanentAddress} onChange={handleInputChange} className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent transition ${errors.permanentAddress ? 'border-red-500 focus:ring-red-500 error-field' : 'border-gray-300 focus:ring-blue-500'}`} rows={3} />
                <ErrorMessage error={errors.permanentAddress} />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2 font-semibold text-gray-700">Address For Communication <span className="text-red-500">*</span></label>
                <textarea name="communicationAddress" placeholder="Enter communication address" value={formData.communicationAddress} onChange={handleInputChange} className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent transition ${errors.communicationAddress ? 'border-red-500 focus:ring-red-500 error-field' : 'border-gray-300 focus:ring-blue-500'}`} rows={3} />
                <ErrorMessage error={errors.communicationAddress} />
              </div>
              <MemoizedInputField label="Date of Birth" name="dateOfBirth" type="date" required value={formData.dateOfBirth} onChange={handleInputChange} error={errors.dateOfBirth} />
              <MemoizedInputField label="Age" name="age" type="number" required value={formData.age} onChange={handleInputChange} error={errors.age} />
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Gender <span className="text-red-500">*</span></label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent transition ${errors.gender ? 'border-red-500 focus:ring-red-500 error-field' : 'border-gray-300 focus:ring-blue-500'}`}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <ErrorMessage error={errors.gender} />
              </div>
              <MemoizedInputField label="Nationality" name="nationality" required value={formData.nationality} onChange={handleInputChange} error={errors.nationality} />
              <MemoizedInputField placeholder='Enter your place. Ex: Piravom' label="Place" name="place" required value={formData.place} onChange={handleInputChange} error={errors.place} />
              <MemoizedInputField placeholder="Ex: Hindu, Muslim, Christian, ....." label="Religion" name="religion" required value={formData.religion} onChange={handleInputChange} error={errors.religion} />
              <MemoizedInputField label="Community" name="community" required value={formData.community} onChange={handleInputChange} error={errors.community} />
              <MemoizedInputField placeholder="Ex: General, OBC, ......." label="Category" name="category" required value={formData.category} onChange={handleInputChange} error={errors.category} />
              <MemoizedInputField label="Blood Group" name="bloodGroup" required value={formData.bloodGroup} onChange={handleInputChange} error={errors.bloodGroup} />
              <MemoizedInputField placeholder="12 digit Aadhaar number" label="Aadhaar Number" name="aadhaarNumber" required value={formData.aadhaarNumber} onChange={handleInputChange} error={errors.aadhaarNumber} />
              <MemoizedInputField placeholder="Ex: Management, NRI, Merit, ......." label="Admission Quota" name="quota" required value={formData.quota} onChange={handleInputChange} error={errors.quota} />
              <div className="md:col-span-2">
                <label className="block mb-2 font-semibold text-gray-700">Order of Preference of Branches <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input type="text" name="preference1" placeholder="1st Preference" value={formData.preference1} onChange={handleInputChange} className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent transition ${errors.preference1 ? 'border-red-500 focus:ring-red-500 error-field' : 'border-gray-300 focus:ring-blue-500'}`} />
                    <ErrorMessage error={errors.preference1} />
                  </div>
                  <div>
                    <input type="text" name="preference2" placeholder="2nd Preference" value={formData.preference2} onChange={handleInputChange} className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent transition ${errors.preference2 ? 'border-red-500 focus:ring-red-500 error-field' : 'border-gray-300 focus:ring-blue-500'}`} />
                    <ErrorMessage error={errors.preference2} />
                  </div>
                  <div>
                    <input type="text" name="preference3" placeholder="3rd Preference" value={formData.preference3} onChange={handleInputChange} className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:border-transparent transition ${errors.preference3 ? 'border-red-500 focus:ring-red-500 error-field' : 'border-gray-300 focus:ring-blue-500'}`} />
                    <ErrorMessage error={errors.preference3} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ... other form sections ... */}
          <section className="bg-white shadow-lg rounded-xl border-gray-200 p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">Family Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MemoizedInputField label="Father's Name" name="fatherName" required value={formData.fatherName} onChange={handleInputChange} error={errors.fatherName} />
              <MemoizedInputField label="Father's Occupation" name="fatherOccupation" required value={formData.fatherOccupation} onChange={handleInputChange} error={errors.fatherOccupation} />
              <MemoizedInputField label="Father's Mobile" name="fatherMobile" required value={formData.fatherMobile} onChange={handleInputChange} error={errors.fatherMobile} />
              <MemoizedInputField label="Mother's Name" name="motherName" required value={formData.motherName} onChange={handleInputChange} error={errors.motherName} />
              <MemoizedInputField label="Mother's Occupation" name="motherOccupation" required value={formData.motherOccupation} onChange={handleInputChange} error={errors.motherOccupation} />
              <MemoizedInputField label="Mother's Mobile" name="motherMobile" required value={formData.motherMobile} onChange={handleInputChange} error={errors.motherMobile} />
              <MemoizedInputField label="Annual Family Income" name="annualIncome" type="number" required className="md:col-span-2" value={formData.annualIncome} onChange={handleInputChange} error={errors.annualIncome} />
              <MemoizedInputField label="Guardian's Name" name="guardianName" required value={formData.guardianName} onChange={handleInputChange} error={errors.guardianName} />
              <MemoizedInputField placeholder="Ex: Father, Mother, ......" label="Guardian's Relation" name="guardianRelation" required value={formData.guardianRelation} onChange={handleInputChange} error={errors.guardianRelation} />
              <MemoizedInputField label="Guardian's Mobile No." name="guardianMobileNumber" required value={formData.guardianMobileNumber} onChange={handleInputChange} error={errors.guardianMobileNumber} />
            </div>
          </section>
          <section className="bg-white shadow-lg rounded-xl border-gray-200 p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <MemoizedInputField label="Institution Last Studied" name="lastInstitution" required value={formData.lastInstitution} onChange={handleInputChange} error={errors.lastInstitution} />
              <MemoizedInputField placeholder="Ex: HSE, VHSE, ......" label="Board of Study" name="boardOfStudy" required value={formData.boardOfStudy} onChange={handleInputChange} error={errors.boardOfStudy} />
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
                <MemoizedInputField label="Grand Total" name="grandTotal" type="number" required value={formData.grandTotal} onChange={handleInputChange} error={errors.grandTotal} />
                <MemoizedInputField label="Total Percentage" name="totalPercentage" placeholder="Ex: 95" required value={formData.totalPercentage} onChange={handleInputChange} error={errors.totalPercentage} />
                <MemoizedInputField placeholder="Marks of Physics+Chemistry+Maths" label="Total PCM" name="totalPCM" type="number" required value={formData.totalPCM} onChange={handleInputChange} error={errors.totalPCM} />
                <MemoizedInputField label="PCM Percentage" name="pcmPercentage" placeholder="Ex: 98" required value={formData.pcmPercentage} onChange={handleInputChange} error={errors.pcmPercentage} />
              </div>
            </div>
          </section>
          <section className="bg-white shadow-lg rounded-xl border-gray-200 p-6">
            <h3 className="text-xl font-bold text-green-800 mb-4">Entrance & SSLC Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <MemoizedInputField label="Entrance Register No" name="entranceRegisterNo" required value={formData.entranceRegisterNo} onChange={handleInputChange} error={errors.entranceRegisterNo} />
              <MemoizedInputField label="Rank" name="entranceRank" required value={formData.entranceRank} onChange={handleInputChange} error={errors.entranceRank} />
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
              <MemoizedInputField label="SSLC Board" name="sslcBoard" required value={formData.sslcBoard} onChange={handleInputChange} error={errors.sslcBoard} />
              <MemoizedInputField placeholder="Ex: 95" label="SSLC Percentage" name="sslcPercentage" type="number" required value={formData.sslcPercentage} onChange={handleInputChange} error={errors.sslcPercentage} />
            </div>
          </section>
          <section className="bg-white shadow-lg rounded-xl border-gray-200 p-6">
            <div>
              <h3 className="text-xl font-bold text-green-800 mb-4">Document Uploads & Consent</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MemoizedFileField label="Passport Size Photo" name="photo" required onChange={handleFileChange} error={errors.photo} />
                <MemoizedFileField label="Parent Signature" name="parentSignature" required onChange={handleFileChange} error={errors.parentSignature} />
                <MemoizedFileField label="Applicant Signature" name="applicantSignature" required onChange={handleFileChange} error={errors.applicantSignature} />
              </div>
              <p className="text-gray-500 text-sm mt-4">* Only image files (JPEG, JPG, PNG) are allowed. Maximum file size: 150KB</p>
            </div>
            <div className="">
              <h3 className="text-lg font-bold text-gray-600 mt-3">Declaration <span className="text-red-400">*</span></h3>
              <input type="checkbox" className="mr-2" name="declaration" id="declaration" required/>
              <label htmlFor="declaration">
                We, the applicant & parent / guardian do hereby declare that all the information furnished above are true and correct and we will obey the rules and regulations of the Institution, if admitted. Also we understand that the admission shall be, subject to satisfying the eligibility norms prescribed by the Statutory Authorities and the state Govt. from time to time.
              </label>
            </div>

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