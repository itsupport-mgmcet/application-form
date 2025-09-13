import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        // Same background gradient as your other pages
        <div className="min-h-screen bg-gradient-to-br from-green-800 via-white to-yellow-200 py-8 flex items-center justify-center px-4">
            <div className="w-full max-w-lg">
                {/* White container card */}
                <div className="bg-white shadow-xl rounded-xl p-8 md:p-12 text-center flex flex-col items-center">

                    <img src="/mgm_logo.png" alt="MGM College Logo" className="h-20 w-20 mb-6" />

                    <h1 className="text-8xl md:text-9xl font-bold text-green-800">
                        404
                    </h1>

                    <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-gray-700">
                        Page Not Found
                    </h2>

                    <p className="mt-4 text-gray-500">
                        Sorry, the page you are looking for does not exist or has been moved.
                    </p>

                    <Link
                        to="/"
                        className="mt-8 px-6 py-3 bg-green-800 text-white font-semibold rounded-lg shadow-md hover:bg-green-900 transition-colors"
                    >
                        Go Back to Home
                    </Link>

                </div>
            </div>
        </div>
    );
}