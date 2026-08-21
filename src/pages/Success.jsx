import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Tiny confetti particle component
const Particle = ({ style }) => (
  <div className="absolute rounded-full pointer-events-none animate-fade-in" style={style} />
);

export default function Success() {
  const location = useLocation();
  const appId = location.state?.appId;
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#16a34a', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];
    const newParticles = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 60}%`,
        width: `${Math.random() * 8 + 4}px`,
        height: `${Math.random() * 8 + 4}px`,
        background: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.6 + 0.2,
        transform: `rotate(${Math.random() * 360}deg)`,
        animationDelay: `${Math.random() * 0.5}s`,
      }
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
      </div>

      {/* Confetti particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map(p => <Particle key={p.id} style={p.style} />)}
      </div>

      {/* Card */}
      <div className="relative w-full max-w-lg animate-fade-in-up">
        {/* College header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <div className="absolute inset-0 rounded-full bg-green-200/50 blur-md scale-110" />
            <img src="/mgm_logo.png" alt="MGM Logo" className="relative h-16 w-16 object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-lg font-bold text-gray-700">MGM College of Engineering & Technology</h1>
          <p className="text-xs text-gray-400 mt-0.5">Pampakuda, Ernakulam — Kerala</p>
        </div>

        {/* Success card */}
        <div className="glass-card rounded-3xl shadow-2xl p-8 text-center border border-white/80">
          {/* Animated checkmark */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-20 h-20 bg-green-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl shadow-green-500/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
            Application Submitted!
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Your application has been received successfully. Please keep your application number safe.
          </p>

          {/* App ID badge */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl px-6 py-5 mb-6 inline-block w-full">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Application Number</p>
            <p className="text-4xl font-black text-green-700 font-mono tracking-widest">
              {appId || '—'}
            </p>
          </div>

          {/* Steps */}
          <div className="text-left space-y-3 mb-6">
            {[
              { step: '1', text: 'Save the application number shown above.' },
              { step: '2', text: 'You will be contacted by the college for further procedures.' },
              { step: '3', text: 'Bring all original documents during verification.' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{item.step}</div>
                <p className="text-sm text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>

          <Link to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 underline underline-offset-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Back to Application Form
          </Link>
        </div>
      </div>
    </div>
  );
}