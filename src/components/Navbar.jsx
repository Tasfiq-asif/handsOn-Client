import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold">
              HandsOn
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/events"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Events
              </Link>
              <Link
                to="/help-requests"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Help Requests
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-white px-3 py-2"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-300 hover:text-white px-3 py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-gray-300 hover:text-white px-3 py-2"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
