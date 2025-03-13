import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProfileForm from "./ProfileForm";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EventCard from "../../components/events/EventCard";
import EventFilter from "../../components/events/EventFilter";
import eventService from "../../lib/eventService";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [stats, setStats] = useState({
    hoursVolunteered: 0,
    eventsAttended: 0,
    pointsEarned: 0,
  });
  const [teams, setTeams] = useState([]);
  const [filters, setFilters] = useState({
    type: "all",
    category: "",
    location: "",
    startDate: "",
  });
  const [allEvents, setAllEvents] = useState([]);
  const [allEventsLoading, setAllEventsLoading] = useState(false);
  const [allEventsError, setAllEventsError] = useState(null);
  const { user } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventDetailLoading, setEventDetailLoading] = useState(false);
  const [eventDetail, setEventDetail] = useState(null);
  const [eventDetailError, setEventDetailError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Check for tab query parameter and success message
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    const fromAction = params.get("from");

    console.log("URL parameters:", { tabParam, fromAction });
    console.log("Current location:", location.search);

    if (
      tabParam &&
      ["overview", "profile", "events", "explore", "impact", "teams"].includes(
        tabParam
      )
    ) {
      console.log("Setting active tab to:", tabParam);
      setActiveTab(tabParam);

      // If coming from event edit/create and tab is explore, clear any selected event
      if (tabParam === "explore") {
        console.log("Explore tab active, clearing selected event");
        setSelectedEventId(null);
        setEventDetail(null);

        // Refresh events list when coming from edit or create
        if (fromAction === "edit" || fromAction === "create") {
          console.log("Refreshing events list after edit/create");
          fetchAllEvents(filters);
        }

        // Set success message if coming from create or edit
        if (fromAction === "create") {
          console.log("Setting success message for create action");
          setSuccessMessage(
            "Event created successfully! It's now visible in the explore tab."
          );
          // Clear the message after 5 seconds
          setTimeout(() => setSuccessMessage(null), 5000);
        } else if (fromAction === "edit") {
          console.log("Setting success message for edit action");
          setSuccessMessage("Event updated successfully!");
          // Clear the message after 5 seconds
          setTimeout(() => setSuccessMessage(null), 5000);
        }
      }
    }
  }, [location, filters]);

  useEffect(() => {
    if (activeTab === "explore") {
      // Reset event selection when switching to explore tab
      setSelectedEventId(null);
      setEventDetail(null);

      // Fetch all events with current filters
      fetchAllEvents(filters);
    }
  }, [activeTab, filters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        getProfile(),
        getRegisteredEvents(),
        calculateStats(),
      ]);
    } catch (error) {
      setError("Error loading dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setProfile(data || null);
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  };

  const getRegisteredEvents = async () => {
    try {
      const now = new Date();

      try {
        const response = await eventService.getUserEvents();
        if (response && response.success) {
          // Filter events into upcoming and past
          const upcoming = [];
          const past = [];

          response.events.forEach((reg) => {
            const event = reg.event;
            const eventDate = new Date(event.start_date);

            if (eventDate > now) {
              upcoming.push(event);
            } else {
              past.push(event);
            }
          });

          setUpcomingEvents(upcoming);
          setPastEvents(past);

          // Update stats based on events
          calculateStats(upcoming, past);
        }
      } catch (error) {
        console.log("Events feature may not be fully implemented yet:", error);
        // Set empty arrays as fallback
        setUpcomingEvents([]);
        setPastEvents([]);
      }
    } catch (error) {
      console.error("Error fetching registered events:", error);
      throw error;
    }
  };

  const calculateStats = (past = pastEvents) => {
    try {
      // Calculate stats based on user's events
      const totalEvents = past.length;
      const hoursVolunteered = past.length * 2; // Placeholder: Assume 2 hours per event
      const pointsEarned = hoursVolunteered * 5; // 5 points per hour as per requirements

      setStats({
        hoursVolunteered,
        eventsAttended: totalEvents,
        pointsEarned,
      });

      // In the future, this would fetch real stats from the backend
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);

    if (activeTab === "explore") {
      fetchAllEvents(newFilters);
    } else {
      console.log("Applied filters:", newFilters);
    }
  };

  const handleRegistrationChange = (eventId, isRegistered) => {
    // Update UI when registration status changes
    if (isRegistered) {
      // Move event from non-registered to upcoming
      const event = [...upcomingEvents, ...pastEvents].find(
        (e) => e.id === eventId
      );
      if (event) {
        const eventDate = new Date(event.start_date);
        const now = new Date();

        if (eventDate > now) {
          setUpcomingEvents((prev) => [...prev, event]);
        } else {
          setPastEvents((prev) => [...prev, event]);
        }
      }
    } else {
      // Remove from registered events
      setUpcomingEvents((prev) => prev.filter((e) => e.id !== eventId));
      setPastEvents((prev) => prev.filter((e) => e.id !== eventId));
    }

    // Recalculate stats
    calculateStats();
  };

  // Placeholder for future implementation
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Placeholder for future implementation of team management
  useEffect(() => {
    // This will be replaced with actual team data fetching when the feature is implemented
    setTeams([]);
  }, []);

  const fetchAllEvents = async (filterParams) => {
    try {
      setAllEventsLoading(true);
      const { events: fetchedEvents } = await eventService.getEvents(
        filterParams
      );
      setAllEvents(fetchedEvents);
      setAllEventsError(null);
    } catch (error) {
      console.error("Error fetching events:", error);
      setAllEventsError("Failed to load events. Please try again later.");
    } finally {
      setAllEventsLoading(false);
    }
  };

  const fetchEventDetails = async (eventId) => {
    try {
      setEventDetailLoading(true);
      const { event: eventData } = await eventService.getEvent(eventId);

      if (!eventData) {
        throw new Error("Event not found");
      }

      console.log("Event detail data:", eventData);
      // Log the creator_id and user.id for debugging
      console.log("Event creator_id:", eventData.creator_id);
      console.log("Current user.id:", user?.id);
      console.log("Is creator check:", user?.id === eventData.creator_id);

      setEventDetail(eventData);
      setEventDetailError(null);
    } catch (error) {
      console.error("Error fetching event details:", error);
      setEventDetailError(error.message || "Failed to load event details");
    } finally {
      setEventDetailLoading(false);
    }
  };

  const handleEventSelect = (eventId) => {
    setSelectedEventId(eventId);
    fetchEventDetails(eventId);
    // No need to change the active tab, as we'll show event details in the current tab
  };

  const handleBackToEvents = () => {
    setSelectedEventId(null);
    setEventDetail(null);
  };

  const handleEventDetailRegistrationChange = async (eventId, isRegistered) => {
    try {
      if (isRegistered) {
        await eventService.registerForEvent(eventId);
      } else {
        await eventService.cancelRegistration(eventId);
      }

      // Refresh event details
      fetchEventDetails(eventId);

      // Also update the events lists
      handleRegistrationChange(eventId, isRegistered);
    } catch (error) {
      console.error("Registration change error:", error);
    }
  };

  // Add handleDeleteEvent function
  const handleDeleteEvent = async (eventId) => {
    try {
      setDeleteLoading(true);
      await eventService.deleteEvent(eventId);

      // Remove the event from all state variables
      setAllEvents(allEvents.filter((event) => event.id !== eventId));
      setUpcomingEvents(upcomingEvents.filter((event) => event.id !== eventId));
      setPastEvents(pastEvents.filter((event) => event.id !== eventId));

      // Go back to the events list
      setSelectedEventId(null);
      setEventDetail(null);
      setShowDeleteConfirm(false);

      // Show success message
      setSuccessMessage("Event deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 5000);

      // Force a refresh of the events list to ensure deleted event doesn't reappear
      fetchAllEvents(filters);
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Failed to delete event. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Update handleEditEvent function to use React Router
  const handleEditEvent = (eventId) => {
    // Navigate to the edit page using React Router
    navigate(`/events/${eventId}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Stats Cards */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your Impact</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.hoursVolunteered}
            </p>
            <p className="text-sm text-gray-500">Hours Volunteered</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.eventsAttended}
            </p>
            <p className="text-sm text-gray-500">Events Attended</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {stats.pointsEarned}
            </p>
            <p className="text-sm text-gray-500">Points Earned</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{teams.length}</p>
            <p className="text-sm text-gray-500">Teams Joined</p>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
          <button
            onClick={() => {
              setActiveTab("explore");
              setSelectedEventId(null);
            }}
            className="text-sm text-green-600 hover:text-green-800"
          >
            View All
          </button>
        </div>
        {upcomingEvents.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming events</p>
        ) : (
          <ul className="space-y-3">
            {upcomingEvents.slice(0, 3).map((event) => (
              <li key={event.id} className="border-b pb-2">
                <button
                  onClick={() => {
                    setActiveTab("events");
                    handleEventSelect(event.id);
                  }}
                  className="hover:text-green-600 text-left w-full"
                >
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(event.start_date)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="space-y-3">
          <Link
            to="/events/create"
            className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
          >
            Create Event
          </Link>
          <button
            onClick={() => setActiveTab("explore")}
            className="block w-full text-center border border-green-600 text-green-600 hover:bg-green-50 font-medium py-2 px-4 rounded"
          >
            Find Volunteer Opportunities
          </button>
          {/* Teams feature - to be implemented later */}
          <button
            disabled
            className="block w-full text-center bg-gray-200 text-gray-500 font-medium py-2 px-4 rounded cursor-not-allowed"
          >
            Create Team (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <ProfileForm user={user} profile={profile} setProfile={setProfile} />
    </div>
  );

  const renderEvents = () => {
    if (selectedEventId && eventDetail) {
      return renderEventDetail();
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <EventFilter onFilterChange={handleFilterChange} filters={filters} />
        </div>

        {/* Events Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Upcoming Events */}
          <div>
            <h3 className="text-xl font-medium text-gray-900 mb-4">
              Your Upcoming Events
            </h3>
            {upcomingEvents.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500 mb-4">
                  You have no upcoming events
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventSelect(event.id)}
                    className="cursor-pointer"
                  >
                    <EventCard
                      event={event}
                      onRegistrationChange={handleRegistrationChange}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Events */}
          <div>
            <h3 className="text-xl font-medium text-gray-900 mb-4">
              Past Events
            </h3>
            {pastEvents.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500">No past events found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventSelect(event.id)}
                    className="cursor-pointer"
                  >
                    <EventCard
                      event={event}
                      onRegistrationChange={handleRegistrationChange}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEventDetail = () => {
    if (eventDetailLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      );
    }

    if (eventDetailError) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-red-50 p-4 rounded-md">
            <h2 className="text-lg font-medium text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{eventDetailError}</p>
            <button
              onClick={handleBackToEvents}
              className="mt-4 inline-block text-green-600 hover:underline"
            >
              Back to Events
            </button>
          </div>
        </div>
      );
    }

    if (!eventDetail) return null;

    // Determine if this is an event or community help post
    const isHelpPost = eventDetail.is_ongoing;
    const isRegistered = eventDetail.participants?.some(
      (p) => p.user_id === user?.id && p.status === "registered"
    );

    // Log creator info for debugging
    console.log("Event creator ID:", eventDetail.creator_id);
    console.log("Current user ID:", user?.id);
    console.log("Is creator:", user?.id === eventDetail.creator_id);

    return (
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        <button
          onClick={handleBackToEvents}
          className="mb-4 flex items-center text-green-600 hover:text-green-800"
        >
          <svg
            className="h-5 w-5 mr-1"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Events
        </button>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{eventDetail.title}"? This
                action cannot be undone.
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
                  onClick={() => handleDeleteEvent(eventDetail.id)}
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
                {eventDetail.category && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {eventDetail.category}
                  </span>
                )}

                <h1 className="mt-2 text-3xl font-bold text-gray-900">
                  {eventDetail.title}
                </h1>

                {/* Creator info */}
                <p className="mt-1 text-sm text-gray-500">
                  Created by{" "}
                  {eventDetail.creator_name ||
                    eventDetail.creator?.profiles?.full_name ||
                    "Anonymous"}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3">
                {/* Show edit/delete buttons if user is the creator */}
                {user && user.id === eventDetail.creator_id && (
                  <>
                    <button
                      onClick={() => handleEditEvent(eventDetail.id)}
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
                  <p className="whitespace-pre-line">
                    {eventDetail.description}
                  </p>
                </div>

                {/* Participants section */}
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Participants</h2>
                  {eventDetail.participants &&
                  eventDetail.participants.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {eventDetail.participants
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
                              {formatDate(eventDetail.start_date)}
                            </p>
                            {eventDetail.start_date && (
                              <p className="text-gray-500">
                                {formatTime(eventDetail.start_date)}
                                {eventDetail.end_date &&
                                  ` - ${formatTime(eventDetail.end_date)}`}
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
                        {eventDetail.location || "Virtual"}
                      </p>
                    </div>
                  </div>

                  {/* Capacity if available */}
                  {eventDetail.capacity && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Capacity
                      </h3>
                      <p className="mt-2 text-gray-900">
                        {eventDetail.participants?.filter(
                          (p) => p.status === "registered"
                        ).length || 0}{" "}
                        / {eventDetail.capacity} spots filled
                      </p>
                    </div>
                  )}

                  {/* Registration button */}
                  <div className="mt-8">
                    {isRegistered ? (
                      <button
                        onClick={() =>
                          handleEventDetailRegistrationChange(
                            eventDetail.id,
                            false
                          )
                        }
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Cancel Registration
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleEventDetailRegistrationChange(
                            eventDetail.id,
                            true
                          )
                        }
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Join Now
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
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderExploreEvents = () => {
    if (selectedEventId && eventDetail) {
      return renderEventDetail();
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Volunteer Opportunities
            </h2>
            <p className="mt-1 text-gray-600">
              Find events and community help requests to make a difference
            </p>
          </div>

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="col-span-1">
            <EventFilter
              onFilterChange={handleFilterChange}
              filters={filters}
            />
          </div>

          <div className="col-span-3">
            {allEventsLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : allEventsError ? (
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-700">{allEventsError}</p>
                <button
                  onClick={() => fetchAllEvents(filters)}
                  className="mt-2 text-sm text-red-700 underline"
                >
                  Try again
                </button>
              </div>
            ) : allEvents.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No opportunities found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters or create a new opportunity.
                </p>
                <Link
                  to="/events/create"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  Create New Opportunity
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                {allEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventSelect(event.id)}
                    className="cursor-pointer"
                  >
                    <EventCard
                      event={event}
                      onRegistrationChange={handleRegistrationChange}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderImpact = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Impact Tracking
        </h3>
        <p className="text-gray-500 mb-4">
          Track your volunteering hours and impact on the community
        </p>
        <div className="flex justify-center items-center space-x-12 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {stats.hoursVolunteered}
            </div>
            <div className="text-sm text-gray-500">Hours Volunteered</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {stats.eventsAttended}
            </div>
            <div className="text-sm text-gray-500">Events Attended</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {stats.pointsEarned}
            </div>
            <div className="text-sm text-gray-500">Impact Points</div>
          </div>
        </div>

        {/* Impact Progress */}
        <div className="max-w-md mx-auto mb-8">
          <h4 className="text-md font-medium text-gray-800 mb-2">
            Next Achievement
          </h4>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full"
              style={{
                width: `${Math.min((stats.hoursVolunteered / 20) * 100, 100)}%`,
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {stats.hoursVolunteered < 20
              ? `${
                  20 - stats.hoursVolunteered
                } more hours until you earn your first certificate!`
              : "Congratulations! You've earned your volunteer certificate."}
          </p>
        </div>

        <p className="text-gray-600 italic">
          Impact tracking feature will be fully enabled soon!
        </p>
      </div>
    </div>
  );

  const renderTeams = () => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Teams</h3>
        <p className="text-gray-500 mb-8">
          Join or create teams to collaborate on volunteer initiatives
        </p>
        <button
          disabled
          className="bg-gray-200 text-gray-600 font-medium py-2 px-4 rounded cursor-not-allowed"
        >
          Team feature coming soon!
        </button>
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "profile":
        return renderProfile();
      case "events":
        return renderEvents();
      case "impact":
        return renderImpact();
      case "teams":
        return renderTeams();
      case "explore":
        return renderExploreEvents();
      default:
        return renderOverview();
    }
  };

  console.log(eventDetail);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {profile?.full_name || user?.email}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded text-red-700">{error}</div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 p-4 rounded text-green-700 flex justify-between items-center">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-500 hover:text-green-700"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav
            className="-mb-px flex space-x-8 overflow-x-auto"
            aria-label="Tabs"
          >
            {[
              { name: "Overview", value: "overview" },
              { name: "Profile", value: "profile" },
              { name: "My Events", value: "events" },
              { name: "Explore Events", value: "explore" },
              { name: "Impact", value: "impact" },
              { name: "Teams", value: "teams" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`${
                  activeTab === tab.value
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default Dashboard;
