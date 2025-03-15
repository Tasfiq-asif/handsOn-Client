import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import helpRequestService from "../../lib/helpRequestService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * EditHelpRequestPage Component
 *
 * Allows users to edit their existing help requests.
 */
export default function EditHelpRequestPage() {
  // Get the help request ID from URL params
  const { id } = useParams();

  // State for form fields
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    urgency: "medium",
  });

  // State for form submission and loading
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [helpRequestData, setHelpRequestData] = useState(null);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks
  const { user, refreshSession } = useAuth();
  const navigate = useNavigate();

  // Categories for dropdown (same as events for consistency)
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

  // Urgency levels
  const urgencyLevels = [
    { value: "low", label: "Low - Can wait" },
    { value: "medium", label: "Medium - Needed soon" },
    { value: "high", label: "High - Urgent need" },
    { value: "urgent", label: "Urgent - Critical need" },
  ];

  // Load the help request data and check authorization
  useEffect(() => {
    if (isSubmitting) {
      return;
    }

    const fetchHelpRequestAndCheckAuth = async () => {
      try {
        setInitialLoading(true);

        // Fetch the help request data
        const data = await helpRequestService.getHelpRequest(id);
        const helpRequest = data.helpRequest;

        if (!helpRequest) {
          setError("Help request not found");
          setInitialLoading(false);
          return;
        }

        // Store help request data
        setHelpRequestData(helpRequest);

        // If we don't have user data yet, keep loading but don't set unauthorized
        if (!user) {
          console.log("Help request loaded but waiting for user data");
          // Don't set initialLoading to false yet - we're still waiting for user
          return;
        }

        console.log("Performing authorization check with:");
        console.log("Current user:", user);
        console.log("Help request creator ID:", helpRequest.creator_id);

        // Use user.user_id if available, otherwise fall back to user.id
        const userId = user?.user_id || user?.id;

        console.log("User ID:", userId);
        console.log("Is creator check:", userId === helpRequest.creator_id);

        // Now do the authorization check
        if (userId !== helpRequest.creator_id) {
          setUnauthorized(true);
        } else {
          // Set form data
          setFormData({
            title: helpRequest.title || "",
            description: helpRequest.description || "",
            location: helpRequest.location || "",
            category: helpRequest.category || "",
            urgency: helpRequest.urgency || "medium",
          });
        }

        // Mark auth check as complete
        setAuthCheckComplete(true);
        setInitialLoading(false);
      } catch (error) {
        console.error("Error fetching help request:", error);
        setError("Failed to load help request details. Please try again.");
        setInitialLoading(false);
      }
    };

    fetchHelpRequestAndCheckAuth();
  }, [id, user, isSubmitting]);

  // Add a separate effect to handle when user data arrives after help request data
  useEffect(() => {
    // Skip authorization check if we're in the process of submitting the form
    if (isSubmitting) {
      return;
    }

    // If we have help request data but were waiting for user to arrive, perform auth check now
    if (user && helpRequestData && !authCheckComplete) {
      console.log(
        "User data arrived after help request data, performing auth check now"
      );

      // Use user.user_id if available, otherwise fall back to user.id
      const userId = user?.user_id || user?.id;

      console.log("User ID:", userId);
      console.log("Help request creator ID:", helpRequestData.creator_id);
      console.log("Is creator check:", userId === helpRequestData.creator_id);

      if (userId !== helpRequestData.creator_id) {
        setUnauthorized(true);
      } else {
        // Set form data
        setFormData({
          title: helpRequestData.title || "",
          description: helpRequestData.description || "",
          location: helpRequestData.location || "",
          category: helpRequestData.category || "",
          urgency: helpRequestData.urgency || "medium",
        });
      }

      setAuthCheckComplete(true);
      setInitialLoading(false);
    }
  }, [user, helpRequestData, authCheckComplete, isSubmitting]);

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
      navigate(`/login?redirect=/help-requests/${id}/edit`);
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
        navigate(`/login?redirect=/help-requests/${id}/edit`);
        return;
      }

      // Prepare help request data
      const helpRequestUpdateData = {
        title: formData.title,
        description: formData.description,
        location: formData.location || null,
        category: formData.category || null,
        urgency: formData.urgency,
      };

      console.log("Updating help request with data:", helpRequestUpdateData);
      console.log("Help request ID:", id);

      // Update the help request
      const response = await helpRequestService.updateHelpRequest(
        id,
        helpRequestUpdateData
      );
      console.log("Help request updated successfully:", response);

      // Navigate to the help request detail page
      navigate(`/help-requests/${id}`);
    } catch (error) {
      console.error("Error updating help request:", error);
      setError(
        error.response?.data?.message ||
          "Failed to update help request. Please try again."
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
            You are not authorized to edit this help request.
          </p>
          <Link
            to={`/help-requests/${id}`}
            className="mt-4 inline-block text-green-600 hover:underline"
          >
            Back to Help Request
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Help Request</h1>
        <p className="mt-2 text-gray-600">Update your community help request</p>
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
            placeholder="e.g., Need volunteers to distribute winter clothes"
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
            placeholder="Provide details about what help you need, when you need it, and any requirements"
          />
        </div>

        {/* Urgency Level */}
        <div>
          <label
            htmlFor="urgency"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Urgency Level *
          </label>
          <select
            id="urgency"
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
          >
            {urgencyLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Select the urgency level to help prioritize volunteer responses
          </p>
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

        {/* Submit Button */}
        <div className="flex justify-between pt-4">
          <Link
            to={`/help-requests/${id}`}
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
              "Update Request"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
