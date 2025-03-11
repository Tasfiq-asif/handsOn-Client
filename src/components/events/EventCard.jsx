import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import eventService from "../../lib/eventService";

export default function EventCard({ event, onRegistrationChange = () => {} }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registered, setRegistered] = useState(
    event.participants?.some((p) => p.status === "registered")
  );
  const { user } = useAuth();

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "Flexible";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleRegister = async () => {
    if (!user) {
      window.location.href = "/login?redirect=/events";
      return;
    }

    try {
      setIsRegistering(true);
      await eventService.registerForEvent(event.id);
      setRegistered(true);
      onRegistrationChange(event.id, true);
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsRegistering(true);
      await eventService.cancelRegistration(event.id);
      setRegistered(false);
      onRegistrationChange(event.id, false);
    } catch (error) {
      console.error("Cancel registration error:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  // Determine if this is an event or community help post
  const isHelpPost = event.is_ongoing;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Badge to differentiate event types */}
        <div className="flex justify-between items-start mb-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isHelpPost
                ? "bg-purple-100 text-purple-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {isHelpPost ? "Community Help" : "Event"}
          </span>

          {/* Category badge */}
          {event.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {event.category}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          <Link to={`/events/${event.id}`} className="hover:underline">
            {event.title}
          </Link>
        </h3>

        <div className="text-sm text-gray-500 mb-2">
          <div className="flex items-center mb-1">
            <svg
              className="h-4 w-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            {isHelpPost ? "Ongoing" : formatDate(event.start_date)}
            {event.end_date &&
              !isHelpPost &&
              ` - ${formatDate(event.end_date)}`}
          </div>

          <div className="flex items-center">
            <svg
              className="h-4 w-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            {event.location || "Virtual"}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-gray-500">
            {event.creator?.profiles?.full_name && (
              <span>By {event.creator.profiles.full_name}</span>
            )}
          </div>

          {registered ? (
            <button
              onClick={handleCancel}
              disabled={isRegistering}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isRegistering ? "Processing..." : "Cancel Registration"}
            </button>
          ) : (
            <button
              onClick={handleRegister}
              disabled={isRegistering}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isRegistering ? "Processing..." : "Join Now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
