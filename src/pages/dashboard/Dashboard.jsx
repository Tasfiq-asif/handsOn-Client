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
    const deleted = params.get("deleted");

    console.log("URL parameters:", { tabParam, fromAction, deleted });
    console.log("Current location:", location.search);

    if (
      tabParam &&
      ["overview", "profile", "events", "explore", "impact", "teams"].includes(
        tabParam
      )
    ) {
      console.log("Setting active tab to:", tabParam);
      setActiveTab(tabParam);

      // If coming from event edit/create and tab is explore, refresh events list
      if (tabParam === "explore") {
        // Refresh events list when coming from edit or create
        if (
          fromAction === "edit" ||
          fromAction === "create" ||
          deleted === "true"
        ) {
          console.log("Refreshing events list after edit/create/delete");
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
        } else if (deleted === "true") {
          console.log("Setting success message for delete action");
          setSuccessMessage("Event deleted successfully!");
          // Clear the message after 5 seconds
          setTimeout(() => setSuccessMessage(null), 5000);

          // Remove the deleted parameter from the URL to prevent showing the message again on refresh
          const newParams = new URLSearchParams(location.search);
          newParams.delete("deleted");
          navigate(
            {
              pathname: location.pathname,
              search: newParams.toString(),
            },
            { replace: true }
          );
        }
      }
    }
  }, [location, filters, navigate]);

  useEffect(() => {
    if (activeTab === "explore") {
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

  const handleEventSelect = (eventId) => {
    // Navigate to the event detail page instead of showing details in the dashboard
    navigate(`/events/${eventId}`);
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

  const renderExploreEvents = () => {
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
