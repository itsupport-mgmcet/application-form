import { Link, useLocation } from 'react-router-dom';

export default function Success() {
  const location = useLocation();
  const appId = location.state?.appId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-yellow-200 py-8 flex flex-col">
      <div className="max-w-6xl w-full mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/mgm_logo.png" alt="MGM College Logo" className="h-24 w-24 mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold text-green-800">
            MGM College of Engineering and Technology, Pampakuda
          </h1>
          <h2 className="text-lg md:text-xl text-yellow-600 mt-2 font-semibold">
            2025 Batch Application Form
          </h2>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <section className="bg-white shadow-xl rounded-xl border-gray-200 p-8 md:p-12 text-center flex flex-col items-center w-full max-w-lg">

          <i className="fa-solid fa-circle-check text-green-500 fa-5x mb-6"></i>

          <h2 className="text-3xl font-bold text-gray-800">Application Submitted Successfully!</h2>
          <p className="text-lg text-gray-600 mt-4">
            Your application has been received.
          </p>
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <p className="text-md text-gray-700">Your Application Number is:</p>
            <p className="text-2xl font-mono font-bold text-green-800 tracking-wider mt-1">{appId || 'Check your records'}</p>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Please save this number for future reference.
          </p>

        </section>
      </div>
    </div>
  )
}