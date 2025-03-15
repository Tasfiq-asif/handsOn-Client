import { Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// Help Request Pages
import HelpRequestsPage from "../pages/helpRequests/HelpRequestsPage";
import HelpRequestDetailPage from "../pages/helpRequests/HelpRequestDetailPage";
import CreateHelpRequestPage from "../pages/helpRequests/CreateHelpRequestPage";
import EditHelpRequestPage from "../pages/helpRequests/EditHelpRequestPage";

const HelpRequestRoutes = [
  <Route
    key="help-requests"
    path="/help-requests"
    element={<HelpRequestsPage />}
  />,
  <Route
    key="help-request-detail"
    path="/help-requests/:id"
    element={<HelpRequestDetailPage />}
  />,
  <Route
    key="create-help-request"
    path="/help-requests/create"
    element={
      <ProtectedRoute>
        <CreateHelpRequestPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="edit-help-request"
    path="/help-requests/:id/edit"
    element={
      <ProtectedRoute>
        <EditHelpRequestPage />
      </ProtectedRoute>
    }
  />,
];

export default HelpRequestRoutes;
