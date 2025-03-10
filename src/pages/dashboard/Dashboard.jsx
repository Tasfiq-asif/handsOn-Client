import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import ProfileForm from "./ProfileForm";

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getUser();
    }
  }, [user]);

  const getUser = async () => {
    try {
      setLoading(true);
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
      setError("Error loading user data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Welcome to your Dashboard
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage your profile and see your volunteer activities
            </p>
          </div>
          <div className="border-t border-gray-200">
            {loading ? (
              <div className="px-4 py-5 sm:p-6">Loading...</div>
            ) : error ? (
              <div className="px-4 py-5 sm:p-6 text-red-500">{error}</div>
            ) : (
              <div className="px-4 py-5 sm:p-6">
                <ProfileForm
                  user={user}
                  profile={profile}
                  setProfile={setProfile}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
