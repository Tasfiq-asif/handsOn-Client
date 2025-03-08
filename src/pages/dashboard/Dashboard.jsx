import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import ProfileForm from "./ProfileForm";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  useEffect(() => {
    // Get the current user and their profile
    const getUser = async () => {
      try {
        setLoading(true);

        // Get current user
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          throw error || new Error("No user found");
        }

        setUser(user);

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
        }

        setProfile(
          profile || {
            user_id: user.id,
            full_name: user.user_metadata?.full_name || "",
            username: user.email?.split("@")[0] || "",
            bio: "",
            skills: [],
            causes: [],
          }
        );
      } catch (error) {
        console.error("Error loading user:", error.message);
        // Redirect to login if not authenticated
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Dashboard Header */}
          <div className="px-4 py-5 sm:px-6 bg-green-50">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Welcome, {profile?.full_name || "Volunteer"}!
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage your profile and track your volunteering impact.
            </p>
          </div>

          {/* Dashboard Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("profile")}
                className={`${
                  activeTab === "profile"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("activities")}
                className={`${
                  activeTab === "activities"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                My Activities
              </button>
              <button
                onClick={() => setActiveTab("teams")}
                className={`${
                  activeTab === "teams"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                My Teams
              </button>
              <button
                onClick={() => setActiveTab("impact")}
                className={`${
                  activeTab === "impact"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                Impact
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === "profile" && (
              <ProfileForm
                user={user}
                profile={profile}
                setProfile={setProfile}
              />
            )}

            {activeTab === "activities" && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">
                  My Activities
                </h3>
                <p className="mt-4 text-gray-500">
                  You haven't participated in any activities yet.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate("/events")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Browse Events
                  </button>
                </div>
              </div>
            )}

            {activeTab === "teams" && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">My Teams</h3>
                <p className="mt-4 text-gray-500">
                  You're not part of any teams yet.
                </p>
                <div className="mt-6">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Create a Team
                  </button>
                </div>
              </div>
            )}

            {activeTab === "impact" && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">My Impact</h3>
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Hours Volunteered
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                          0
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Events Attended
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                          0
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Impact Points
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                          0
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
