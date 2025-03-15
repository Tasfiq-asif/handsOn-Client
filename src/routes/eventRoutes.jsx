import { Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

// Event Pages
import EventsPage from "../pages/events/EventsPage";
import EventDetailPage from "../pages/events/EventDetailPage";
import CreateEventPage from "../pages/events/CreateEventPage";
import EditEventPage from "../pages/events/EditEventPage";

const EventRoutes = [
  <Route key="events" path="/events" element={<EventsPage />} />,
  <Route key="event-detail" path="/events/:id" element={<EventDetailPage />} />,
  <Route
    key="create-event"
    path="/events/create"
    element={
      <ProtectedRoute>
        <CreateEventPage />
      </ProtectedRoute>
    }
  />,
  <Route
    key="edit-event"
    path="/events/:id/edit"
    element={
      <ProtectedRoute>
        <EditEventPage />
      </ProtectedRoute>
    }
  />,
];

export default EventRoutes;
