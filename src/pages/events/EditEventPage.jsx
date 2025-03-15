import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import eventService from "../../lib/eventService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * EditEventPage Component
 *
 * Allows users to edit their existing volunteer events or community help posts.
 */
export default function EditEventPage() {
  // Get the event ID from URL params
  const { id } = useParams();

  // State for form fields
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    isOngoing: false,
    capacity: "",
  });

  // State for form submission and loading
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks
  const { user, refreshSession } = useAuth();
  const navigate = useNavigate();

  // Categories for dropdown
  const categories = [
    "Education",
    "Environment",
    "Health",
    "Homelessness",
    "Hunger",
    "Animal Welfare",
    "Elderly Care",
    "Children & Youth",
    "Disaster Relief",
    "Arts & Culture",
    "Human Rights",
  ];

  // Load the event data and check authorization in a single useEffect
  useEffect(() => {
    if (isSubmitting) {
      return;
    }

    const fetchEventAndCheckAuth = async () => {
      try {
        setInitialLoading(true);

        // Fetch the event data
        const { event } = await eventService.getEvent(id);

        if (!event) {
          setError("Event not found");
          setInitialLoading(false);
          return;
        }

        // Store event data
        setEventData(event);

        // If we don't have user data yet, keep loading but don't set unauthorized
        if (!user) {
          console.log("Event loaded but waiting for user data");
          // Don't set initialLoading to false yet - we're still waiting for user
          return;
        }

        console.log("Performing authorization check with:");
        console.log("Current user:", user);
        console.log("Event creator ID:", event.creator_id);

        // Use user.user_id if available, otherwise fall back to user.id
        const userId = user?.user_id || user?.id;

        console.log("User ID:", userId);
        console.log("Is creator check:", userId === event.creator_id);

        // Now do the authorization check
        if (userId !== event.creator_id) {
          setUnauthorized(true);
        } else {
          // Format dates and set form data
          let startDate = "";
          let startTime = "";
          let endDate = "";
          let endTime = "";

          if (event.start_date) {
            const startDateTime = new Date(event.start_date);
            startDate = startDateTime.toISOString().split("T")[0];
            startTime = startDateTime.toTimeString().slice(0, 5);
          }

          if (event.end_date) {
            const endDateTime = new Date(event.end_date);
            endDate = endDateTime.toISOString().split("T")[0];
            endTime = endDateTime.toTimeString().slice(0, 5);
          }

          // Set form data
          setFormData({
            title: event.title || "",
            description: event.description || "",
            location: event.location || "",
            category: event.category || "",
            startDate,
            startTime,
            endDate,
            endTime,
            isOngoing: event.is_ongoing || false,
            capacity: event.capacity ? String(event.capacity) : "",
          });
        }

        // Mark auth check as complete
        setAuthCheckComplete(true);
        setInitialLoading(false);
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event details. Please try again.");
        setInitialLoading(false);
      }
    };

    fetchEventAndCheckAuth();
  }, [id, user, isSubmitting]);

  // Add a separate effect to handle when user data arrives after event data
  useEffect(() => {
    // Skip authorization check if we're in the process of submitting the form
    if (isSubmitting) {
      return;
    }

    // If we have event data but were waiting for user to arrive, perform auth check now
    if (user && eventData && !authCheckComplete) {
      console.log(
        "User data arrived after event data, performing auth check now"
      );

      // Use user.user_id if available, otherwise fall back to user.id
      const userId = user?.user_id || user?.id;

      console.log("User ID:", userId);
      console.log("Event creator ID:", eventData.creator_id);
      console.log("Is creator check:", userId === eventData.creator_id);

      if (userId !== eventData.creator_id) {
        setUnauthorized(true);
      } else {
        // Format dates for the form
        let startDate = "";
        let startTime = "";
        let endDate = "";
        let endTime = "";

        if (eventData.start_date) {
          const startDateTime = new Date(eventData.start_date);
          startDate = startDateTime.toISOString().split("T")[0];
          startTime = startDateTime.toTimeString().slice(0, 5);
        }

        if (eventData.end_date) {
          const endDateTime = new Date(eventData.end_date);
          endDate = endDateTime.toISOString().split("T")[0];
          endTime = endDateTime.toTimeString().slice(0, 5);
        }

        // Set form data
        setFormData({
          title: eventData.title || "",
          description: eventData.description || "",
          location: eventData.location || "",
          category: eventData.category || "",
          startDate,
          startTime,
          endDate,
          endTime,
          isOngoing: eventData.is_ongoing || false,
          capacity: eventData.capacity ? String(eventData.capacity) : "",
        });
      }

      setAuthCheckComplete(true);
      setInitialLoading(false);
    }
  }, [user, eventData, authCheckComplete, isSubmitting]);

  /**
   * Handles form input changes
   * @param {Object} e - Event object
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Handles form submission
   * @param {Object} e - Event object
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if user is logged in
    if (!user) {
      navigate(`/login?redirect=/events/${id}/edit`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsSubmitting(true);

      // Refresh the session to ensure we have a valid token
      const { error: refreshError } = await refreshSession();
      if (refreshError) {
        console.error("Session refresh failed:", refreshError);
        setError("Your session has expired. Please log in again.");
        navigate(`/login?redirect=/events/${id}/edit`);
        return;
      }

      // Prepare event data
      const eventData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        category: formData.category,
        is_ongoing: formData.isOngoing,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
      };

      // Handle dates for non-ongoing events
      if (!formData.isOngoing) {
        if (formData.startDate) {
          // Combine date and time
          const startDateTime = formData.startTime
            ? `${formData.startDate}T${formData.startTime}:00`
            : `${formData.startDate}T00:00:00`;

          eventData.start_date = new Date(startDateTime).toISOString();

          // Add end date if provided
          if (formData.endDate) {
            const endDateTime = formData.endTime
              ? `${formData.endDate}T${formData.endTime}:00`
              : `${formData.endDate}T23:59:59`;

            eventData.end_date = new Date(endDateTime).toISOString();
          }
        }
      }

      console.log("Updating event data:", eventData);
      console.log("Event ID:", id);
      console.log("User ID:", user?.user_id);

      // Update the event
      try {
        const response = await eventService.updateEvent(id, eventData);
        console.log("Event updated successfully:", response);

        // Check if the response contains the updated event data
        if (response && (response.data || response.event)) {
          const updatedEvent = response.data || response.event;
          console.log("Updated event details:", updatedEvent);
        }

        // Log navigation intent
        console.log("Navigating to Dashboard with explore tab active");

        // Navigate to the Dashboard with the explore tab active and indicate source
        navigate("/dashboard?tab=explore&from=edit");
      } catch (apiError) {
        console.error("API Error updating event:", apiError);
        console.error("Full error object:", JSON.stringify(apiError, null, 2));
        console.error("Response data:", apiError.response?.data);
        console.error("Response status:", apiError.response?.status);
        console.error("Response headers:", apiError.response?.headers);

        const errorMsg =
          apiError.response?.data?.message ||
          apiError.response?.data?.error ||
          apiError.message ||
          "Failed to update event. Please try again.";

        setError(errorMsg);

        if (
          errorMsg.includes("token") ||
          errorMsg.includes("authorization") ||
          errorMsg.includes("auth")
        ) {
          // Auth related error - redirect to login
          alert("Your session has expired. Please log in again.");
          navigate(`/login?redirect=/events/${id}/edit`);
        }
      }
    } catch (error) {
      console.error("Error updating event:", error);
      setError(
        "An unexpected error occurred. Please try again or contact support."
      );
      setIsSubmitting(false);
    } finally {
      setLoading(false);
    }
  };

  // Only stop showing the loading spinner when all conditions are met
  if (initialLoading || !authCheckComplete) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Show unauthorized message if user is not the creator
  if (unauthorized) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-lg font-medium text-red-800 mb-2">
            Unauthorized
          </h2>
          <p className="text-red-700">
            You are not authorized to edit this event.
          </p>
          <Link
            to={`/events/${id}`}
            className="mt-4 inline-block text-green-600 hover:underline"
          >
            Back to Event
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Edit Volunteer Opportunity
        </h1>
        <p className="mt-2 text-gray-600">
          Update your event or community help post
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white shadow-sm rounded-lg p-6"
      >
        {/* Opportunity Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opportunity Type
          </label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isOngoing"
                checked={formData.isOngoing}
                onChange={handleChange}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">
                This is an ongoing community help post (no specific end date)
              </span>
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {formData.isOngoing
              ? 'Community help posts are for ongoing needs like "Weekly tutoring" or "Monthly food drive volunteers"'
              : "Events have specific dates and times when volunteers are needed"}
          </p>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="e.g., Beach Cleanup Event or Need Tutors for After-School Program"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Provide details about the opportunity, what volunteers will do, and any requirements"
          />
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="e.g., City Park, 123 Main St, or Virtual"
          />
        </div>

        {/* Date and Time - Only show if not an ongoing opportunity */}
        {!formData.isOngoing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required={!formData.isOngoing}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="endTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>
        )}

        {/* Capacity */}
        <div>
          <label
            htmlFor="capacity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Capacity (optional)
          </label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Maximum number of volunteers needed"
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave blank for unlimited capacity
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-between pt-4">
          <Link
            to={`/events/${id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
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
                Updating...
              </>
            ) : (
              "Update Event"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
