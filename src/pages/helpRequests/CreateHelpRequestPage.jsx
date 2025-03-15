import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import helpRequestService from "../../lib/helpRequestService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * CreateHelpRequestPage Component
 *
 * Allows users to create a new help request.
 */
export default function CreateHelpRequestPage() {
  // State for form fields
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    urgency: "medium", // Default to medium urgency
  });

  // State for form submission and loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      navigate("/login?redirect=/help-requests/create");
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
        navigate("/login?redirect=/help-requests/create");
        return;
      }

      // Prepare help request data
      const helpRequestData = {
        title: formData.title,
        description: formData.description,
        location: formData.location || null,
        category: formData.category || null,
        urgency: formData.urgency,
        status: "open", // Default status for new help requests
      };

      console.log("Creating help request with data:", helpRequestData);

      // Create the help request
      const response = await helpRequestService.createHelpRequest(
        helpRequestData
      );
      console.log("Help request created successfully:", response);

      // Navigate to the help requests page
      navigate("/help-requests");
    } catch (error) {
      console.error("Error creating help request:", error);
      setError(
        error.response?.data?.message ||
          "Failed to create help request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Request Community Help
        </h1>
        <p className="mt-2 text-gray-600">
          Describe what you need help with and the community will respond
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
          <button
            type="button"
            onClick={() => navigate("/help-requests")}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </button>
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
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
