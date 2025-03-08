import { useState } from "react";
import { supabase } from "../../lib/supabase";

// Available options for skills and causes
const SKILLS_OPTIONS = [
  "Teaching",
  "Mentoring",
  "Cooking",
  "Driving",
  "Programming",
  "Event Planning",
  "Photography",
  "Writing",
  "Public Speaking",
  "First Aid",
  "Construction",
  "Gardening",
  "Music",
];

const CAUSES_OPTIONS = [
  "Education",
  "Environment",
  "Animal Welfare",
  "Health",
  "Homelessness",
  "Hunger",
  "Disaster Relief",
  "Elderly Care",
  "Children & Youth",
  "Arts & Culture",
  "Human Rights",
];

const ProfileForm = ({ user, profile, setProfile }) => {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [skills, setSkills] = useState(profile?.skills || []);
  const [causes, setCauses] = useState(profile?.causes || []);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSkillToggle = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleCauseToggle = (cause) => {
    if (causes.includes(cause)) {
      setCauses(causes.filter((c) => c !== cause));
    } else {
      setCauses([...causes, cause]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage({ text: "", type: "" });

      // Update profile in Supabase
      const { error } = await supabase.from("profiles").upsert(
        {
          user_id: user.id,
          full_name: fullName,
          username,
          bio,
          skills,
          causes,
          updated_at: new Date(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        throw error;
      }

      // Also update user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          username,
        },
      });

      // Update local state
      setProfile({
        ...profile,
        full_name: fullName,
        username,
        bio,
        skills,
        causes,
      });

      setMessage({
        text: "Profile updated successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error updating profile:", error.message);
      setMessage({
        text: error.message || "Error updating profile",
        type: "error",
      });
    } finally {
      setLoading(false);

      // Clear success message after 3 seconds
      if (message.type === "success") {
        setTimeout(() => {
          setMessage({ text: "", type: "" });
        }, 3000);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 divide-y divide-gray-200"
    >
      <div className="space-y-6">
        {message.text && (
          <div
            className={`rounded-md p-4 ${
              message.type === "success" ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === "success" ? (
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
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
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    message.type === "success"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 sm:space-y-5">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Profile Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              This information will be displayed publicly so be careful what you
              share.
            </p>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              Email
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="text"
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-gray-100 cursor-not-allowed max-w-lg block w-full shadow-sm focus:ring-green-500 focus:border-green-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              />
              <p className="mt-1 text-sm text-gray-500">
                Your email cannot be changed.
              </p>
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:pt-5">
            <label
              htmlFor="full-name"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              Full name
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <input
                type="text"
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                className="max-w-lg block w-full shadow-sm focus:ring-green-500 focus:border-green-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              Username
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <div className="max-w-lg flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  handson.io/
                </span>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="flex-1 block w-full focus:ring-green-500 focus:border-green-500 min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
            >
              Bio
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="max-w-lg shadow-sm block w-full focus:ring-green-500 focus:border-green-500 sm:text-sm border border-gray-300 rounded-md"
                placeholder="Tell us about yourself and why you want to volunteer."
              />
              <p className="mt-2 text-sm text-gray-500">
                Brief description for your profile.
              </p>
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Skills
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <div className="max-w-lg space-y-4">
                <p className="text-sm text-gray-500">
                  Select the skills you can contribute as a volunteer.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SKILLS_OPTIONS.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        skills.includes(skill)
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {skill}
                      {skills.includes(skill) && (
                        <span className="ml-1.5 text-green-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
            <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Causes
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2">
              <div className="max-w-lg space-y-4">
                <p className="text-sm text-gray-500">
                  Select the causes you're passionate about.
                </p>
                <div className="flex flex-wrap gap-2">
                  {CAUSES_OPTIONS.map((cause) => (
                    <button
                      key={cause}
                      type="button"
                      onClick={() => handleCauseToggle(cause)}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        causes.includes(cause)
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {cause}
                      {causes.includes(cause) && (
                        <span className="ml-1.5 text-green-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;
