import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import helpRequestService from "../../lib/helpRequestService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

/**
 * HelpRequestDetailPage Component
 *
 * Displays the details of a specific help request and allows users to offer help.
 */
export default function HelpRequestDetailPage() {
  // Get the help request ID from URL params
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [helpRequest, setHelpRequest] = useState(null);
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offeringHelp, setOfferingHelp] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Auth context
  const { user, refreshSession } = useAuth();

  // Fetch help request data on component mount
  useEffect(() => {
    const fetchHelpRequestData = async () => {
      try {
        setLoading(true);
        const data = await helpRequestService.getHelpRequest(id);
        setHelpRequest(data.helpRequest);

        // If the help request exists, fetch helpers and comments
        if (data.helpRequest) {
          const helpersData = await helpRequestService.getHelpers(id);
          setHelpers(helpersData.helpers || []);

          // Fetch real comments from the backend
          const commentsData = await helpRequestService.getComments(id);
          setComments(commentsData.comments || []);
        }
      } catch (error) {
        console.error("Error fetching help request:", error);
        setError("Failed to load help request details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchHelpRequestData();
  }, [id]);

  // Check if the current user is the creator of the help request
  const isCreator =
    user && helpRequest && user.user_id === helpRequest.creator_id;

  // Check if the current user has already offered help
  const hasOfferedHelp =
    user && helpers.some((helper) => helper.user_id === user.user_id);

  /**
   * Handle offering help
   */
  const handleOfferHelp = async () => {
    if (!user) {
      navigate(`/login?redirect=/help-requests/${id}`);
      return;
    }

    try {
      setOfferingHelp(true);
      setError(null);

      // Refresh the session to ensure we have a valid token
      const { error: refreshError } = await refreshSession();
      if (refreshError) {
        console.error("Session refresh failed:", refreshError);
        setError("Your session has expired. Please log in again.");
        navigate(`/login?redirect=/help-requests/${id}`);
        return;
      }

      // Offer help
      await helpRequestService.offerHelp(id);

      // Update helpers list
      const helpersData = await helpRequestService.getHelpers(id);
      setHelpers(helpersData.helpers || []);

      setSuccessMessage("You have successfully offered to help!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error offering help:", error);
      setError("Failed to offer help. Please try again.");
    } finally {
      setOfferingHelp(false);
    }
  };

  /**
   * Handle submitting a comment
   */
  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate(`/login?redirect=/help-requests/${id}`);
      return;
    }

    if (!comment.trim()) {
      return;
    }

    try {
      setSubmittingComment(true);
      setError(null);

      // Refresh the session to ensure we have a valid token
      const { error: refreshError } = await refreshSession();
      if (refreshError) {
        console.error("Session refresh failed:", refreshError);
        setError("Your session has expired. Please log in again.");
        navigate(`/login?redirect=/help-requests/${id}`);
        return;
      }

      // Send the comment to the backend
      await helpRequestService.addComment(id, comment);

      // Fetch updated comments
      const commentsData = await helpRequestService.getComments(id);
      setComments(commentsData.comments || []);

      // Clear the comment input
      setComment("");

      // Show success message
      setSuccessMessage("Comment added successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Urgency level badge component
  const UrgencyBadge = ({ level }) => {
    const badgeClasses = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          badgeClasses[level] || "bg-gray-100 text-gray-800"
        }`}
      >
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time ago for comments
  const timeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return `${interval} year${interval === 1 ? "" : "s"} ago`;
    }

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return `${interval} month${interval === 1 ? "" : "s"} ago`;
    }

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return `${interval} day${interval === 1 ? "" : "s"} ago`;
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return `${interval} hour${interval === 1 ? "" : "s"} ago`;
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `${interval} minute${interval === 1 ? "" : "s"} ago`;
    }

    return `${Math.floor(seconds)} second${seconds === 1 ? "" : "s"} ago`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
              <div className="mt-2">
                <Link
                  to="/help-requests"
                  className="text-sm font-medium text-red-800 hover:underline"
                >
                  Back to Help Requests
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!helpRequest) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Help request not found
              </h3>
              <div className="mt-2">
                <Link
                  to="/help-requests"
                  className="text-sm font-medium text-yellow-800 hover:underline"
                >
                  Back to Help Requests
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log(user);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {successMessage && (
        <div className="mb-4 bg-green-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <Link
          to="/help-requests"
          className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-500"
        >
          <svg
            className="-ml-1 mr-1 h-5 w-5 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Back to Help Requests
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {helpRequest.title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Posted on {formatDate(helpRequest.created_at)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <UrgencyBadge level={helpRequest.urgency} />
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              {helpRequest.status === "open"
                ? "Open"
                : helpRequest.status === "in_progress"
                ? "In Progress"
                : "Completed"}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {helpRequest.description}
              </dd>
            </div>
            {helpRequest.category && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {helpRequest.category}
                </dd>
              </div>
            )}
            {helpRequest.location && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {helpRequest.location}
                </dd>
              </div>
            )}
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">
                People who have offered help ({helpers.length})
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {helpers.length > 0 ? (
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {helpers.map((helper) => (
                      <li
                        key={helper.id}
                        className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
                      >
                        <div className="w-0 flex-1 flex items-center">
                          <svg
                            className="flex-shrink-0 h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="ml-2 flex-1 w-0 truncate">
                            {helper.profile?.username || "Anonymous"}
                          </span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className="font-medium text-green-600 hover:text-green-500">
                            {formatDate(helper.created_at)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No one has offered help yet.</p>
                )}
              </dd>
            </div>
          </dl>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          {isCreator ? (
            <div className="flex space-x-3">
              <Link
                to={`/help-requests/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Edit Request
              </Link>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={async () => {
                  if (
                    window.confirm(
                      "Are you sure you want to mark this help request as completed?"
                    )
                  ) {
                    try {
                      await helpRequestService.updateHelpRequest(id, {
                        ...helpRequest,
                        status: "completed",
                      });

                      // Update the help request in state
                      setHelpRequest({
                        ...helpRequest,
                        status: "completed",
                      });

                      setSuccessMessage("Help request marked as completed!");

                      // Clear success message after 3 seconds
                      setTimeout(() => {
                        setSuccessMessage(null);
                      }, 3000);
                    } catch (error) {
                      console.error("Error updating help request:", error);
                      setError("Failed to update help request status.");
                    }
                  }
                }}
              >
                Mark as Completed
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleOfferHelp}
              disabled={offeringHelp || hasOfferedHelp}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                hasOfferedHelp
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              }`}
            >
              {offeringHelp ? (
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
                  Processing...
                </>
              ) : hasOfferedHelp ? (
                "You've Offered Help"
              ) : (
                "Offer to Help"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-8 bg-white shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">
            Comments
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Coordinate with others or ask questions
          </p>
        </div>

        {user ? (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <form onSubmit={handleSubmitComment}>
              <div>
                <label htmlFor="comment" className="sr-only">
                  Comment
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows="3"
                  className="shadow-sm block w-full focus:ring-green-500 focus:border-green-500 sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !comment.trim()}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    submittingComment || !comment.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  }`}
                >
                  {submittingComment ? (
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
                      Posting...
                    </>
                  ) : (
                    "Post Comment"
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <p className="text-sm text-gray-500">
              <Link
                to={`/login?redirect=/help-requests/${id}`}
                className="text-green-600 hover:text-green-500"
              >
                Sign in
              </Link>{" "}
              to post a comment.
            </p>
          </div>
        )}

        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <li key={comment.id} className="px-4 py-4 sm:px-6">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">
                          {comment.profile?.username
                            ? comment.profile.username.charAt(0).toUpperCase()
                            : comment.user_id
                            ? comment.user_id.charAt(0).toUpperCase()
                            : "A"}
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {comment.profile?.username || "Anonymous"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {timeAgo(comment.created_at)}
                      </p>
                      <div className="mt-2 text-sm text-gray-700">
                        <p>{comment.content}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-5 sm:px-6 text-center text-sm text-gray-500">
                No comments yet. Be the first to comment!
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
