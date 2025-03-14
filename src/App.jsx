import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/dashboard/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import EventsPage from "./pages/events/EventsPage";
import EventDetailPage from "./pages/events/EventDetailPage";
import CreateEventPage from "./pages/events/CreateEventPage";
import EditEventPage from "./pages/events/EditEventPage";
// Import Help Request pages
import HelpRequestsPage from "./pages/helpRequests/HelpRequestsPage";
import HelpRequestDetailPage from "./pages/helpRequests/HelpRequestDetailPage";
import CreateHelpRequestPage from "./pages/helpRequests/CreateHelpRequestPage";
import EditHelpRequestPage from "./pages/helpRequests/EditHelpRequestPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="pt-16">
            {" "}
            {/* Add padding top to account for fixed navbar */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/auth/google/callback"
                element={<GoogleAuthCallback />}
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              {/* Event Routes */}
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route
                path="/events/create"
                element={
                  <ProtectedRoute>
                    <CreateEventPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditEventPage />
                  </ProtectedRoute>
                }
              />

              {/* Help Request Routes */}
              <Route path="/help-requests" element={<HelpRequestsPage />} />
              <Route
                path="/help-requests/:id"
                element={<HelpRequestDetailPage />}
              />
              <Route
                path="/help-requests/create"
                element={
                  <ProtectedRoute>
                    <CreateHelpRequestPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/help-requests/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditHelpRequestPage />
                  </ProtectedRoute>
                }
              />
              {/* Add more routes as you develop the application */}
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Temporary Home component until you create a proper one
function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          HandsOn
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
          A community-driven social volunteering platform that connects
          individuals with meaningful social impact opportunities.
        </p>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-md shadow">
            <a
              href="/events"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Discover Events
            </a>
          </div>
          <div className="ml-3 inline-flex">
            <a
              href="/help-requests"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
            >
              Community Help
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
