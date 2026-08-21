import { useState } from "react";
import ErrorMessage from "../components/ErrorMessage";
import { useNavigate } from "react-router-dom";
import { uploadImageToCloudinary } from "../utils/imageUpload";
import { db } from "../utils/firebase";
import { doc, runTransaction, increment } from "firebase/firestore";
import MemoizedInputField from "../components/MemoizedInputField";
import MemoizedFileField from "../components/MemoizedFileField";

const STEPS = [
  { id: 1, label: "Personal", icon: "👤" },
  { id: 2, label: "Family", icon: "👨‍👩‍👧" },
  { id: 3, label: "Academic", icon: "🎓" },
  { id: 4, label: "Entrance", icon: "📝" },
  { id: 5, label: "Documents", icon: "📎" },
];

// ── Step Progress Bar ────────────────────────────────────────────────────────
const StepBar = ({ currentStep }) => (
  <div className="flex items-center justify-between mb-8 px-2">
    {STEPS.map((step, idx) => (
      <div key={step.id} className="flex items-center flex-1">
        <div className="flex flex-col items-center gap-1">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2
            ${currentStep > step.id
              ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-200'
              : currentStep === step.id
              ? 'bg-white border-green-600 text-green-700 shadow-md'
              : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
            {currentStep > step.id ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : step.id}
          </div>
          <span className={`text-[10px] font-semibold hidden sm:block whitespace-nowrap
            ${currentStep === step.id ? 'text-green-700' : currentStep > step.id ? 'text-green-600' : 'text-gray-400'}`}>
            {step.label}
          </span>
        </div>
        {idx < STEPS.length - 1 && (
          <div className={`flex-1 h-0.5 mx-2 mt-[-12px] sm:mt-[-20px] rounded-full transition-all duration-500
            ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
        )}
      </div>
    ))}
  </div>
);

// ── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, icon, children }) => (
  <section className="glass-card rounded-2xl shadow-lg overflow-hidden ring-2 ring-green-500/20 animate-fade-in-up">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white">
      <span className="text-2xl">{icon}</span>
      <h3 className="text-base font-bold text-gray-800">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </section>
);

// ── Navigation Buttons ───────────────────────────────────────────────────────
const NavButtons = ({ currentStep, totalSteps, onPrev, onNext, onSubmit, isSubmitting }) => (
  <div className={`flex mt-6 ${currentStep > 1 ? 'justify-between' : 'justify-end'}`}>
    {/* Previous — only from step 2 */}
    {currentStep > 1 && (
      <button type="button" onClick={onPrev}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-semibold px-4 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>
    )}

    {/* Next or Submit */}
    {currentStep < totalSteps ? (
      <button type="button" onClick={onNext}
        className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-green-900/20 hover:shadow-lg hover:-translate-y-0.5">
        Next
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    ) : (
      <button type="submit" disabled={isSubmitting}
        className={`inline-flex items-center gap-2 text-white text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-lg
          ${isSubmitting ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-green-700 hover:bg-green-800 shadow-green-900/30 hover:shadow-xl hover:-translate-y-0.5'}`}>
        {isSubmitting ? (
          <>
            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Submitting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Submit Application
          </>
        )}
      </button>
    )}
  </div>
);

// ── Main Form Component ──────────────────────────────────────────────────────
export default function ApplicationForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [entranceMarks, setEntranceMarks] = useState({
    paper1Figures: '', paper1Words: '',
    paper2Figures: '', paper2Words: '',
    totalFigures: '', totalWords: '',
  });
  const [formData, setFormData] = useState({
    candidateName: '', email: '', permanentAddress: '', communicationAddress: '',
    dateOfBirth: '', age: '', gender: '', nationality: '', place: '', religion: '',
    community: '', category: '', bloodGroup: '', aadhaarNumber: '', quota: '',
    preference1: '', preference2: '', preference3: '',
    fatherName: '', fatherOccupation: '', fatherMobile: '',
    motherName: '', motherOccupation: '', motherMobile: '',
    annualIncome: '', guardianName: '', guardianRelation: '', guardianMobileNumber: '',
    lastInstitution: '', boardOfStudy: '', grandTotal: '', totalPercentage: '',
    totalPCM: '', pcmPercentage: '', entranceRegisterNo: '', entranceRank: '',
    sslcBoard: '', sslcPercentage: '',
    photo: null, parentSignature: null, applicantSignature: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTakenEntrance, setHasTakenEntrance] = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateFile = (file) => {
    if (!file) return { valid: false, message: "File is required" };
    if (file.size > 153600) return { valid: false, message: "File size must be less than 150KB" };
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
    setFormData(prev => ({ ...prev, [name]: files[0] || null }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const addSubject = () => {
    const newId = subjects.length > 0 ? subjects[subjects.length - 1].id + 1 : 1;
    setSubjects([...subjects, { id: newId, name: "", markObtained: "", maxMark: "", grade: "" }]);
  };
  const removeSubject = (id) => setSubjects(subjects.filter(s => s.id !== id));
  const handleSubjectChange = (id, field, value) =>
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));

  const handleEntranceMarkChange = (field, value) => {
    setEntranceMarks(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // ── Per-step Validation ──────────────────────────────────────────────────
  const validateStep = (step) => {
    const newErrors = {};
    const req = (field, msg) => {
      if (!formData[field] || formData[field].toString().trim() === '') newErrors[field] = msg;
    };

    if (step === 1) {
      req('candidateName', 'Name is required');
      req('email', 'Email is required');
      if (formData.email && !validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
      req('permanentAddress', 'Permanent address is required');
      req('communicationAddress', 'Communication address is required');
      req('dateOfBirth', 'Date of birth is required');
      req('age', 'Age is required');
      if (formData.age && (Number(formData.age) < 13 || Number(formData.age) > 50)) newErrors.age = 'Age must be between 13 and 50';
      req('gender', 'Gender is required');
      req('nationality', 'Nationality is required');
      req('place', 'Place is required');
      req('religion', 'Religion is required');
      req('community', 'Community is required');
      req('category', 'Category is required');
      req('bloodGroup', 'Blood group is required');
      req('aadhaarNumber', 'Aadhaar number is required');
      req('quota', 'Admission quota is required');
      req('preference1', 'First preference is required');
      req('preference2', 'Second preference is required');
      req('preference3', 'Third preference is required');
    }

    if (step === 2) {
      req('fatherName', "Father's name is required");
      req('fatherOccupation', "Father's occupation is required");
      req('fatherMobile', "Father's mobile is required");
      req('motherName', "Mother's name is required");
      req('motherOccupation', "Mother's occupation is required");
      req('motherMobile', "Mother's mobile is required");
      req('annualIncome', 'Annual family income is required');
      req('guardianName', "Guardian's name is required");
      req('guardianRelation', "Guardian's relation is required");
      req('guardianMobileNumber', "Guardian's mobile is required");
    }

    if (step === 3) {
      req('lastInstitution', 'Last institution is required');
      req('boardOfStudy', 'Board of study is required');
      req('grandTotal', 'Grand Total is required');
      req('totalPercentage', 'Total Percentage is required');
      req('totalPCM', 'Total PCM is required');
      req('pcmPercentage', 'PCM Percentage is required');
      if (subjects.length === 0) {
        newErrors.subjects = 'Please add at least one subject.';
      } else if (subjects.some(s => !s.name || !s.markObtained || !s.maxMark || !s.grade)) {
        newErrors.subjects = 'All fields for every subject are required.';
      }
    }

    if (step === 4) {
      req('sslcBoard', 'SSLC board is required');
      req('sslcPercentage', 'SSLC percentage is required');
      if (formData.sslcPercentage && (Number(formData.sslcPercentage) < 0 || Number(formData.sslcPercentage) > 100)) {
        newErrors.sslcPercentage = 'Percentage must be between 0 and 100';
      }
      if (hasTakenEntrance) {
        req('entranceRegisterNo', 'Entrance register number is required');
        req('entranceRank', 'Entrance rank is required');
        const eReq = (field, msg) => {
          if (!entranceMarks[field] || entranceMarks[field].toString().trim() === '') newErrors[field] = msg;
        };
        eReq('paper1Figures', 'Paper 1 marks (figures) is required');
        eReq('paper1Words', 'Paper 1 marks (words) is required');
        eReq('paper2Figures', 'Paper 2 marks (figures) is required');
        eReq('paper2Words', 'Paper 2 marks (words) is required');
        eReq('totalFigures', 'Total marks (figures) is required');
        eReq('totalWords', 'Total marks (words) is required');
      }
    }

    if (step === 5) {
      ['photo', 'parentSignature', 'applicantSignature'].forEach(field => {
        if (!formData[field]) {
          newErrors[field] = `${field === 'photo' ? 'Passport size photo' : field === 'parentSignature' ? 'Parent signature' : 'Applicant signature'} is required`;
        } else {
          const v = validateFile(formData[field]);
          if (!v.valid) newErrors[field] = v.message;
        }
      });
    }

    return newErrors;
  };

  // ── Navigation Handlers ──────────────────────────────────────────────────
  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      // Scroll to first error field
      setTimeout(() => {
        const firstError = document.querySelector('.error-field');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    setErrors({});
    setCurrentStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setErrors({});
    setCurrentStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Final Submit (step 5) ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const stepErrors = validateStep(5);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      const [photoURL, parentSignatureURL, applicantSignatureURL] = await Promise.all([
        uploadImageToCloudinary(formData.photo),
        uploadImageToCloudinary(formData.parentSignature),
        uploadImageToCloudinary(formData.applicantSignature)
      ]);
      const finalFormData = { ...formData, photo: photoURL, parentSignature: parentSignatureURL, applicantSignature: applicantSignatureURL };
      const counterRef = doc(db, "counters", "applicationCounter");
      const newAppId = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        if (!counterDoc.exists()) throw "Counter document does not exist!";
        const newId = counterDoc.data().currentNumber + 1;
        const appIdString = newId.toString();
        transaction.set(doc(db, "applications", appIdString), {
          appId: appIdString,
          candidateName: formData.candidateName,
          submissionDate: new Date().toISOString(),
          formData: finalFormData,
          subjects,
          entranceMarks: hasTakenEntrance ? entranceMarks : null,
        });
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

  const inputClass = (field) =>
    `w-full border-2 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 bg-white transition-all duration-200 outline-none
     ${errors[field]
       ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100 error-field'
       : 'border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 hover:border-gray-300'}`;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-green-200/50 blur-md scale-110" />
            <img src="/mgm_logo.png" alt="MGM College Logo" className="relative h-20 w-20 object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-tight">
            MGM College of Engineering & Technology
          </h1>
          <p className="text-sm text-gray-500 mt-1">Pampakuda, Ernakulam — Kerala</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-green-800 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg shadow-green-900/20">
            <span>🎓</span> 2026 Batch — B.Tech Application Form
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="glass-card rounded-2xl px-6 pt-6 pb-4 mb-6 shadow-sm">
          <StepBar currentStep={currentStep} />
        </div>

        {/* Form — only the active step section is rendered */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── STEP 1: Personal Information ── */}
          {currentStep === 1 && (
            <SectionCard title="Personal Information" icon="👤">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MemoizedInputField label="Name of the Candidate" name="candidateName" required value={formData.candidateName} onChange={handleInputChange} error={errors.candidateName} />
                <MemoizedInputField label="Email Address" name="email" type="email" required value={formData.email} onChange={handleInputChange} error={errors.email} />

                <div className="md:col-span-2">
                  <label className="block mb-1.5 text-sm font-semibold text-gray-700">Permanent Address <span className="text-red-500">*</span></label>
                  <textarea name="permanentAddress" placeholder="Enter permanent address" value={formData.permanentAddress} onChange={handleInputChange} rows={3}
                    className={inputClass('permanentAddress')} />
                  <ErrorMessage error={errors.permanentAddress} />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1.5 text-sm font-semibold text-gray-700">Address For Communication <span className="text-red-500">*</span></label>
                  <textarea name="communicationAddress" placeholder="Enter communication address" value={formData.communicationAddress} onChange={handleInputChange} rows={3}
                    className={inputClass('communicationAddress')} />
                  <ErrorMessage error={errors.communicationAddress} />
                </div>

                <MemoizedInputField label="Date of Birth" name="dateOfBirth" type="date" required value={formData.dateOfBirth} onChange={handleInputChange} error={errors.dateOfBirth} />
                <MemoizedInputField label="Age" name="age" type="number" required value={formData.age} onChange={handleInputChange} error={errors.age} />

                <div>
                  <label className="block mb-1.5 text-sm font-semibold text-gray-700">Gender <span className="text-red-500">*</span></label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className={inputClass('gender')}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <ErrorMessage error={errors.gender} />
                </div>

                <MemoizedInputField label="Nationality" name="nationality" required value={formData.nationality} onChange={handleInputChange} error={errors.nationality} />
                <MemoizedInputField placeholder="Ex: Piravom" label="Place" name="place" required value={formData.place} onChange={handleInputChange} error={errors.place} />
                <MemoizedInputField placeholder="Ex: Hindu, Muslim, Christian" label="Religion" name="religion" required value={formData.religion} onChange={handleInputChange} error={errors.religion} />
                <MemoizedInputField label="Community" name="community" required value={formData.community} onChange={handleInputChange} error={errors.community} />
                <MemoizedInputField placeholder="Ex: General, OBC" label="Category" name="category" required value={formData.category} onChange={handleInputChange} error={errors.category} />
                <MemoizedInputField label="Blood Group" name="bloodGroup" required value={formData.bloodGroup} onChange={handleInputChange} error={errors.bloodGroup} />
                <MemoizedInputField placeholder="12 digit Aadhaar number" label="Aadhaar Number" name="aadhaarNumber" required value={formData.aadhaarNumber} onChange={handleInputChange} error={errors.aadhaarNumber} />
                <MemoizedInputField placeholder="Ex: Management, NRI, Merit" label="Admission Quota" name="quota" required value={formData.quota} onChange={handleInputChange} error={errors.quota} />

                <div className="md:col-span-2">
                  <label className="block mb-1.5 text-sm font-semibold text-gray-700">Order of Preference of Branches <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {['preference1', 'preference2', 'preference3'].map((field, i) => (
                      <div key={field}>
                        <input type="text" name={field}
                          placeholder={`${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : 'rd'} Preference`}
                          value={formData[field]} onChange={handleInputChange}
                          className={inputClass(field)} />
                        <ErrorMessage error={errors[field]} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <NavButtons currentStep={currentStep} totalSteps={5} onNext={handleNext} onPrev={handlePrev} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </SectionCard>
          )}

          {/* ── STEP 2: Family Information ── */}
          {currentStep === 2 && (
            <SectionCard title="Family Information" icon="👨‍👩‍👧">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MemoizedInputField label="Father's Name" name="fatherName" required value={formData.fatherName} onChange={handleInputChange} error={errors.fatherName} />
                <MemoizedInputField label="Father's Occupation" name="fatherOccupation" required value={formData.fatherOccupation} onChange={handleInputChange} error={errors.fatherOccupation} />
                <MemoizedInputField label="Father's Mobile" name="fatherMobile" required value={formData.fatherMobile} onChange={handleInputChange} error={errors.fatherMobile} />
                <MemoizedInputField label="Mother's Name" name="motherName" required value={formData.motherName} onChange={handleInputChange} error={errors.motherName} />
                <MemoizedInputField label="Mother's Occupation" name="motherOccupation" required value={formData.motherOccupation} onChange={handleInputChange} error={errors.motherOccupation} />
                <MemoizedInputField label="Mother's Mobile" name="motherMobile" required value={formData.motherMobile} onChange={handleInputChange} error={errors.motherMobile} />
                <MemoizedInputField label="Annual Family Income (₹)" name="annualIncome" type="number" required className="md:col-span-2" value={formData.annualIncome} onChange={handleInputChange} error={errors.annualIncome} />
                <MemoizedInputField label="Guardian's Name" name="guardianName" required value={formData.guardianName} onChange={handleInputChange} error={errors.guardianName} />
                <MemoizedInputField placeholder="Ex: Father, Mother, Uncle" label="Guardian's Relation" name="guardianRelation" required value={formData.guardianRelation} onChange={handleInputChange} error={errors.guardianRelation} />
                <MemoizedInputField label="Guardian's Mobile No." name="guardianMobileNumber" required value={formData.guardianMobileNumber} onChange={handleInputChange} error={errors.guardianMobileNumber} />
              </div>

              <NavButtons currentStep={currentStep} totalSteps={5} onNext={handleNext} onPrev={handlePrev} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </SectionCard>
          )}

          {/* ── STEP 3: Academic Information ── */}
          {currentStep === 3 && (
            <SectionCard title="Academic Information" icon="🎓">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <MemoizedInputField label="Institution Last Studied" name="lastInstitution" required value={formData.lastInstitution} onChange={handleInputChange} error={errors.lastInstitution} />
                <MemoizedInputField placeholder="Ex: HSE, VHSE" label="Board of Study" name="boardOfStudy" required value={formData.boardOfStudy} onChange={handleInputChange} error={errors.boardOfStudy} />
              </div>

              {/* Subjects Table */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-700">Subject-wise Marks <span className="text-red-500">*</span></h4>
                  <button type="button" onClick={addSubject}
                    className="inline-flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Subject
                  </button>
                </div>

                {subjects.length === 0 ? (
                  <div className={`rounded-xl border-2 border-dashed p-8 text-center ${errors.subjects ? 'border-red-300 bg-red-50 error-field' : 'border-gray-200 bg-gray-50'}`}>
                    <p className="text-sm text-gray-400 font-medium">No subjects added yet. Click "Add Subject" to begin.</p>
                  </div>
                ) : (
                  <div className={`rounded-xl border-2 overflow-hidden ${errors.subjects ? 'border-red-300 error-field' : 'border-gray-200'}`}>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-green-800 text-white text-xs font-semibold">
                            <th className="px-4 py-3 text-left">Subject</th>
                            <th className="px-4 py-3 text-left">Marks Obtained</th>
                            <th className="px-4 py-3 text-left">Max Marks</th>
                            <th className="px-4 py-3 text-left">Grade</th>
                            <th className="px-4 py-3 text-center w-12">Del</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {subjects.map((subj, idx) => (
                            <tr key={subj.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-green-50/30 transition-colors`}>
                              <td className="px-3 py-2"><input type="text" placeholder="Subject" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition" value={subj.name} onChange={e => handleSubjectChange(subj.id, "name", e.target.value)} /></td>
                              <td className="px-3 py-2"><input type="number" placeholder="e.g. 85" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition" value={subj.markObtained} onChange={e => handleSubjectChange(subj.id, "markObtained", e.target.value)} /></td>
                              <td className="px-3 py-2"><input type="number" placeholder="e.g. 100" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition" value={subj.maxMark} onChange={e => handleSubjectChange(subj.id, "maxMark", e.target.value)} /></td>
                              <td className="px-3 py-2"><input type="text" placeholder="A+" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition" value={subj.grade} onChange={e => handleSubjectChange(subj.id, "grade", e.target.value)} /></td>
                              <td className="px-3 py-2 text-center">
                                <button type="button" onClick={() => removeSubject(subj.id)} className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-600 font-bold text-lg flex items-center justify-center mx-auto transition-colors">×</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <ErrorMessage error={errors.subjects} />
              </div>

              {/* Totals */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-amber-800 mb-3">📊 Summary Totals</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MemoizedInputField label="Grand Total" name="grandTotal" type="number" required value={formData.grandTotal} onChange={handleInputChange} error={errors.grandTotal} />
                  <MemoizedInputField label="Total Percentage (%)" name="totalPercentage" placeholder="Ex: 95.4" required value={formData.totalPercentage} onChange={handleInputChange} error={errors.totalPercentage} />
                  <MemoizedInputField placeholder="Physics + Chemistry + Maths marks" label="Total PCM" name="totalPCM" type="number" required value={formData.totalPCM} onChange={handleInputChange} error={errors.totalPCM} />
                  <MemoizedInputField label="PCM Percentage (%)" name="pcmPercentage" placeholder="Ex: 98.2" required value={formData.pcmPercentage} onChange={handleInputChange} error={errors.pcmPercentage} />
                </div>
              </div>

              <NavButtons currentStep={currentStep} totalSteps={5} onNext={handleNext} onPrev={handlePrev} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </SectionCard>
          )}

          {/* ── STEP 4: Entrance & SSLC ── */}
          {currentStep === 4 && (
            <SectionCard title="Entrance Exam & SSLC Details" icon="📝">
              {/* Entrance toggle */}
              <div className="mb-5">
                <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all ${hasTakenEntrance ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-green-300'}`}>
                  <div className="relative flex-shrink-0">
                    <input type="checkbox" checked={hasTakenEntrance} onChange={e => setHasTakenEntrance(e.target.checked)} className="sr-only" />
                    <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${hasTakenEntrance ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${hasTakenEntrance ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Have you appeared for the Entrance Examination?</p>
                    <p className="text-xs text-gray-500 mt-0.5">{hasTakenEntrance ? 'Yes — fill in your entrance details below' : 'Toggle to add entrance exam details'}</p>
                  </div>
                </label>
              </div>

              {hasTakenEntrance && (
                <div className="space-y-5 mb-6 animate-fade-in-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MemoizedInputField label="Entrance Register No." name="entranceRegisterNo" required value={formData.entranceRegisterNo} onChange={handleInputChange} error={errors.entranceRegisterNo} />
                    <MemoizedInputField label="Rank" name="entranceRank" required value={formData.entranceRank} onChange={handleInputChange} error={errors.entranceRank} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Entrance Examination Marks <span className="text-red-500">*</span></h4>
                    <div className="rounded-xl border-2 border-gray-200 overflow-hidden">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-green-800 text-white text-xs font-semibold">
                            <th className="px-4 py-3 text-left" rowSpan={2}>Subject / Paper</th>
                            <th className="px-4 py-3 text-center" colSpan={2}>Marks Scored</th>
                          </tr>
                          <tr className="bg-green-700 text-white text-xs">
                            <th className="px-4 py-2 text-center">In Figures</th>
                            <th className="px-4 py-2 text-center">In Words</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {[
                            { label: 'Paper I (Physics & Chemistry)', fig: 'paper1Figures', word: 'paper1Words' },
                            { label: 'Paper II (Mathematics)', fig: 'paper2Figures', word: 'paper2Words' },
                            { label: 'Total Marks', fig: 'totalFigures', word: 'totalWords' },
                          ].map(row => (
                            <tr key={row.fig}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-700">{row.label}</td>
                              <td className="px-3 py-2">
                                <input type="text" placeholder="e.g. 85"
                                  className={`w-full border rounded-lg px-3 py-1.5 text-sm outline-none transition ${errors[row.fig] ? 'border-red-400 focus:ring-2 focus:ring-red-100 error-field' : 'border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100'}`}
                                  value={entranceMarks[row.fig]} onChange={e => handleEntranceMarkChange(row.fig, e.target.value)} />
                                <ErrorMessage error={errors[row.fig]} />
                              </td>
                              <td className="px-3 py-2">
                                <input type="text" placeholder="e.g. Eighty five"
                                  className={`w-full border rounded-lg px-3 py-1.5 text-sm outline-none transition ${errors[row.word] ? 'border-red-400 focus:ring-2 focus:ring-red-100 error-field' : 'border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100'}`}
                                  value={entranceMarks[row.word]} onChange={e => handleEntranceMarkChange(row.word, e.target.value)} />
                                <ErrorMessage error={errors[row.word]} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SSLC */}
              <div className={hasTakenEntrance ? 'pt-5 border-t border-gray-200' : ''}>
                <h4 className="text-sm font-bold text-gray-700 mb-3">🏫 SSLC Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MemoizedInputField label="SSLC Board" name="sslcBoard" required value={formData.sslcBoard} onChange={handleInputChange} error={errors.sslcBoard} />
                  <MemoizedInputField placeholder="Ex: 95" label="SSLC Percentage (%)" name="sslcPercentage" type="number" required value={formData.sslcPercentage} onChange={handleInputChange} error={errors.sslcPercentage} />
                </div>
              </div>

              <NavButtons currentStep={currentStep} totalSteps={5} onNext={handleNext} onPrev={handlePrev} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </SectionCard>
          )}

          {/* ── STEP 5: Documents & Consent ── */}
          {currentStep === 5 && (
            <SectionCard title="Documents & Consent" icon="📎">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <MemoizedFileField label="Passport Size Photo" name="photo" required onChange={handleFileChange} error={errors.photo} />
                <MemoizedFileField label="Parent Signature" name="parentSignature" required onChange={handleFileChange} error={errors.parentSignature} />
                <MemoizedFileField label="Applicant Signature" name="applicantSignature" required onChange={handleFileChange} error={errors.applicantSignature} />
              </div>
              <p className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Only JPEG, JPG, PNG files are allowed. Maximum file size: 150KB
              </p>

              {/* Declaration */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Declaration <span className="text-red-500">*</span>
                </h3>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="declaration" id="declaration" required
                    className="mt-0.5 h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500 flex-shrink-0" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    We, the applicant & parent / guardian do hereby declare that all the information furnished above are true and correct and we will obey the rules and regulations of the Institution, if admitted. Also we understand that the admission shall be, subject to satisfying the eligibility norms prescribed by the Statutory Authorities and the state Govt. from time to time.
                  </p>
                </label>
              </div>

              <NavButtons currentStep={currentStep} totalSteps={5} onNext={handleNext} onPrev={handlePrev} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </SectionCard>
          )}
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          MGM College of Engineering & Technology — 2026 Admission Process
        </p>
      </div>
    </div>
  );
}