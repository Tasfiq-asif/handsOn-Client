import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import AuthRoutes from "./authRoutes";
import EventRoutes from "./eventRoutes";
import HelpRequestRoutes from "./helpRequestRoutes";

// Pages
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ResetPassword from "../pages/ResetPassword";
import GoogleAuthCallback from "../pages/GoogleAuthCallback";
import Dashboard from "../pages/dashboard/Dashboard";

// Event Pages
import EventsPage from "../pages/events/EventsPage";
import EventDetailPage from "../pages/events/EventDetailPage";
import CreateEventPage from "../pages/events/CreateEventPage";
import EditEventPage from "../pages/events/EditEventPage";

// Help Request Pages
import HelpRequestsPage from "../pages/helpRequests/HelpRequestsPage";
import HelpRequestDetailPage from "../pages/helpRequests/HelpRequestDetailPage";
import CreateHelpRequestPage from "../pages/helpRequests/CreateHelpRequestPage";
import EditHelpRequestPage from "../pages/helpRequests/EditHelpRequestPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Home Route */}
      <Route path="/" element={<Home />} />

      {/* Auth Routes */}
      {AuthRoutes}

      {/* Event Routes */}
      {EventRoutes}

      {/* Help Request Routes */}
      {HelpRequestRoutes}

      {/* Add more route groups as needed */}
    </Routes>
  );
};

export default AppRoutes;
