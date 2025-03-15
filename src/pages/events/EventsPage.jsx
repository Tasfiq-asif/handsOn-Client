import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import eventService from "../../lib/eventService";
import EventCard from "../../components/events/EventCard";
import EventFilter from "../../components/events/EventFilter";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * EventsPage Component
 *
 * Displays a list of all volunteer events and community help posts
 * with filtering capabilities.
 */
export default function EventsPage() {
  // State management
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const { user } = useAuth();

  // Fetch events when component mounts or filters change
  useEffect(() => {
    fetchEvents(filters);
  }, [filters]);

  /**
   * Fetches events from the API based on filter parameters
   * @param {Object} filterParams - Filter criteria for events
   */
  const fetchEvents = async (filterParams) => {
    try {
      setLoading(true);
      const { events: fetchedEvents } = await eventService.getEvents(
        filterParams
      );
      setEvents(fetchedEvents);
      setError(null);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates filters when user changes filter criteria
   * @param {Object} newFilters - New filter criteria
   */
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  /**
   * Updates local state when a user registers for or cancels an event
   * @param {string} eventId - ID of the event
   * @param {boolean} isRegistered - Whether user registered or canceled
   */
  const handleRegistrationChange = (eventId, isRegistered) => {
    // Update the local state to reflect registration changes
    setEvents(
      events.map((event) => {
        if (event.id === eventId) {
          // If the user is registering, add them to participants
          if (isRegistered) {
            const newParticipant = {
              user_id: user.id,
              status: "registered",
            };
            return {
              ...event,
              participants: [...(event.participants || []), newParticipant],
            };
          }
          // If the user is canceling, update their status
          else {
            return {
              ...event,
              participants: event.participants?.map((p) =>
                p.user_id === user.id ? { ...p, status: "canceled" } : p
              ),
            };
          }
        }
        return event;
      })
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navigation breadcrumbs */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link to="/" className="text-green-600 hover:text-green-700">
              <svg
                className="h-5 w-5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Home</span>
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-4 text-sm font-medium text-gray-500">
                Events
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Quick navigation links */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Link
          to="/"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
        >
          <svg
            className="mr-1.5 h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
          Home
        </Link>

        {user && (
          <Link
            to="/dashboard"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
          >
            <svg
              className="mr-1.5 h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </Link>
        )}

        <Link
          to="/help-requests"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
        >
          <svg
            className="mr-1.5 h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          Help Requests
        </Link>
      </div>

      {/* Page header with title and create button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Volunteer Opportunities
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Find events and community help requests to make a difference
          </p>
        </div>

        {/* Only show create button if user is logged in */}
        {user && (
          <Link
            to="/events/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Create Opportunity
          </Link>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Sidebar with filters */}
        <div className="col-span-1">
          <EventFilter onFilterChange={handleFilterChange} />
        </div>

        {/* Main content area with events */}
        <div className="col-span-3 mt-6 lg:mt-0">
          {/* Show loading spinner while fetching data */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            /* Show error message if fetch failed */
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => fetchEvents(filters)}
                className="mt-2 text-sm text-red-700 underline"
              >
                Try again
              </button>
            </div>
          ) : events.length === 0 ? (
            /* Show message if no events match filters */
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No opportunities found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or create a new opportunity.
              </p>
              {user && (
                <Link
                  to="/events/create"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  Create New Opportunity
                </Link>
              )}
            </div>
          ) : (
            /* Display grid of event cards */
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRegistrationChange={handleRegistrationChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
