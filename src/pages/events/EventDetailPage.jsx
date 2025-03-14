import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import eventService from "../../lib/eventService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * EventDetailPage Component
 *
 * Displays detailed information about a specific event or community help post
 * and allows users to register for it.
 */
export default function EventDetailPage() {
  // State management
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Hooks
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch event data when component mounts
  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  /**
   * Fetches detailed information about the event
   */
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const { event: eventData } = await eventService.getEvent(id);

      if (!eventData) {
        throw new Error("Event not found");
      }

      console.log("Event data from API:", eventData);
      console.log("Event creator_id from API:", eventData.creator_id);

      setEvent(eventData);

      // Check if user is already registered
      if (user) {
        const isUserRegistered = eventData.participants?.some(
          (p) => p.user_id === user.id && p.status === "registered"
        );
        setRegistered(isUserRegistered);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      setError(error.message || "Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles event registration
   */
  const handleRegister = async () => {
    if (!user) {
      navigate(`/login?redirect=/events/${id}`);
      return;
    }

    try {
      setIsRegistering(true);
      await eventService.registerForEvent(id);
      setRegistered(true);
      // Refresh event details to get updated participants list
      fetchEventDetails();
    } catch (error) {
      console.error("Registration error:", error);
      setError("Failed to register for this event. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  /**
   * Handles cancellation of registration
   */
  const handleCancel = async () => {
    try {
      setIsRegistering(true);
      await eventService.cancelRegistration(id);
      setRegistered(false);
      // Refresh event details to get updated participants list
      fetchEventDetails();
    } catch (error) {
      console.error("Cancel registration error:", error);
      setError("Failed to cancel registration. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  /**
   * Handles event deletion
   */
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await eventService.deleteEvent(id);

      // Navigate to dashboard with success message
      navigate("/dashboard?tab=explore&deleted=true");
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete this event. Please try again.");
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * Handles event editing
   */
  const handleEdit = () => {
    navigate(`/events/${id}/edit`);
  };

  /**
   * Formats a date string for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString) => {
    if (!dateString) return "Flexible";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  /**
   * Formats a time string for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted time string
   */
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error message if fetch failed
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <Link
            to="/events"
            className="mt-4 inline-block text-green-600 hover:underline"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  // Show event details
  if (!event) return null;

  // Determine if this is an event or community help post
  const isHelpPost = event.is_ongoing;

  // Add detailed logging to understand the data structure

  // In Supabase:
  // - The events table has creator_id which is a UUID referencing auth.users.id
  // - The user object from AuthContext might have user.user_id or user.id
  // Try user.user_id first as requested
  const userId = user?.user_id || user?.id;
  const isCreator = Boolean(
    userId && event.creator_id && userId === event.creator_id
  );

  console.log("Using user ID for comparison:", userId);
  console.log("Is creator check result:", isCreator);
  console.log(
    "Direct comparison:",
    userId,
    "===",
    event.creator_id,
    "=",
    userId === event.creator_id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb navigation */}
      <nav className="mb-4">
        <ol className="flex text-sm text-gray-500">
          <li>
            <Link to="/" className="hover:text-gray-700">
              Home
            </Link>
            <span className="mx-2">/</span>
          </li>
          <li>
            <Link to="/events" className="hover:text-gray-700">
              Events
            </Link>
            <span className="mx-2">/</span>
          </li>
          <li className="text-gray-700 font-medium truncate">{event.title}</li>
        </ol>
      </nav>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{event.title}"? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  "Delete Event"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Event header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              {/* Event type badge */}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isHelpPost
                    ? "bg-purple-100 text-purple-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {isHelpPost ? "Community Help" : "Event"}
              </span>

              {/* Category badge if available */}
              {event.category && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {event.category}
                </span>
              )}

              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                {event.title}
              </h1>

              {/* Creator info */}
              <p className="mt-1 text-sm text-gray-500">
                Created by {event.creator_name || "Anonymous"}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3">
              {/* Show edit/delete buttons if user is the creator */}
              {isCreator && (
                <>
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md bg-white text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Event details */}
        <div className="p-6">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-4">
                  About this opportunity
                </h2>
                <p className="whitespace-pre-line">{event.description}</p>
              </div>

              {/* Participants section */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Participants</h2>
                {event.participants && event.participants.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.participants
                      .filter((p) => p.status === "registered")
                      .map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center space-x-2"
                        >
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                            {participant.users?.profiles?.full_name?.charAt(
                              0
                            ) || "?"}
                          </div>
                          <span className="text-sm">
                            {participant.users?.profiles?.full_name ||
                              "Anonymous"}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No participants yet. Be the first to join!
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="mt-8 lg:mt-0">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                {/* Date and time */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    When
                  </h3>
                  <div className="mt-2 flex items-start">
                    <svg
                      className="h-5 w-5 text-gray-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      {isHelpPost ? (
                        <p className="text-gray-900">Ongoing opportunity</p>
                      ) : (
                        <>
                          <p className="text-gray-900">
                            {formatDate(event.start_date)}
                          </p>
                          {event.start_date && (
                            <p className="text-gray-500">
                              {formatTime(event.start_date)}
                              {event.end_date &&
                                ` - ${formatTime(event.end_date)}`}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Where
                  </h3>
                  <div className="mt-2 flex items-start">
                    <svg
                      className="h-5 w-5 text-gray-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-gray-900">
                      {event.location || "Virtual"}
                    </p>
                  </div>
                </div>

                {/* Capacity if available */}
                {event.capacity && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Capacity
                    </h3>
                    <p className="mt-2 text-gray-900">
                      {event.participants?.filter(
                        (p) => p.status === "registered"
                      ).length || 0}{" "}
                      / {event.capacity} spots filled
                    </p>
                  </div>
                )}

                {/* Registration button */}
                <div className="mt-8">
                  {registered ? (
                    <button
                      onClick={handleCancel}
                      disabled={isRegistering}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {isRegistering ? "Processing..." : "Cancel Registration"}
                    </button>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={isRegistering}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {isRegistering ? "Processing..." : "Join Now"}
                    </button>
                  )}

                  {!user && (
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      You'll need to log in to register for this event.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
