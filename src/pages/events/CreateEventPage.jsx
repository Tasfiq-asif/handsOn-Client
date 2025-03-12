import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import eventService from "../../lib/eventService";

/**
 * CreateEventPage Component
 *
 * Allows users to create new volunteer events or community help posts.
 */
export default function CreateEventPage() {
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

  // State for form submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      navigate("/login?redirect=/events/create");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Refresh the session to ensure we have a valid token
      const { error: refreshError } = await refreshSession();
      if (refreshError) {
        console.error("Session refresh failed:", refreshError);
        setError("Your session has expired. Please log in again.");
        navigate("/login?redirect=/events/create");
        return;
      }

      // Log the user ID for debugging
      console.log("Attempting to create event as user:", user.id);

      // Prepare event data
      const eventData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        category: formData.category,
        isOngoing: formData.isOngoing,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
      };

      // Handle dates for non-ongoing events
      if (!formData.isOngoing) {
        if (formData.startDate) {
          // Combine date and time
          const startDateTime = formData.startTime
            ? `${formData.startDate}T${formData.startTime}:00`
            : `${formData.startDate}T00:00:00`;

          eventData.startDate = new Date(startDateTime).toISOString();

          // Add end date if provided
          if (formData.endDate) {
            const endDateTime = formData.endTime
              ? `${formData.endDate}T${formData.endTime}:00`
              : `${formData.endDate}T23:59:59`;

            eventData.endDate = new Date(endDateTime).toISOString();
          }
        }
      }

      console.log("Submitting event data:", eventData);

      // Create the event
      try {
        const response = await eventService.createEvent(eventData);
        console.log("Event created successfully:", response);

        // Navigate to the Dashboard with the explore tab active
        navigate(`/dashboard?tab=explore`);
      } catch (apiError) {
        console.error("API Error creating event:", apiError);
        const errorMsg =
          apiError.response?.data?.message ||
          apiError.response?.data?.error ||
          apiError.message ||
          "Failed to create event. Please try again.";

        setError(errorMsg);

        if (
          errorMsg.includes("token") ||
          errorMsg.includes("authorization") ||
          errorMsg.includes("auth")
        ) {
          // Auth related error - redirect to login
          alert("Your session has expired. Please log in again.");
          navigate("/login?redirect=/events/create");
        }
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setError(
        "An unexpected error occurred. Please try again or contact support."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Create a Volunteer Opportunity
        </h1>
        <p className="mt-2 text-gray-600">
          Share your event or request for help with the community
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
            placeholder="Address or 'Virtual'"
          />
        </div>

        {/* Date and Time (only for non-ongoing events) */}
        {!formData.isOngoing && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required={!formData.isOngoing}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate} // Ensure end date is after start date
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                If your event spans multiple days, enter the end date. For
                single-day events, leave this blank.
              </p>
            </div>
          </div>
        )}

        {/* Capacity */}
        <div>
          <label
            htmlFor="capacity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Capacity
          </label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            min="1"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Maximum number of volunteers (optional)"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave blank for unlimited capacity
          </p>
        </div>

        {/* Form actions */}
        <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
          <Link
            to="/events"
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
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
                Creating...
              </>
            ) : (
              "Create Opportunity"
            )}
          </button>
        </div>
      </form>

      {/* Help text */}
      <div className="mt-8 bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800">
          Tips for creating effective volunteer opportunities:
        </h3>
        <ul className="mt-2 text-sm text-blue-700 list-disc pl-5 space-y-1">
          <li>Be specific about what volunteers will be doing</li>
          <li>Clearly state any requirements (age, skills, etc.)</li>
          <li>
            Include information about parking, what to bring, or what to wear
          </li>
          <li>
            For ongoing help posts, mention the frequency and commitment level
          </li>
        </ul>
      </div>
    </div>
  );
}
