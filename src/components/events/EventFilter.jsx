import { useState } from "react";

export default function EventFilter({ onFilterChange }) {
  const [filters, setFilters] = useState({
    type: "all",
    category: "",
    location: "",
    startDate: "",
  });

  // Categories hardcoded for now, can be moved to a database query
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

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      type: "all",
      category: "",
      location: "",
      startDate: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Filter Opportunities
        </h2>
        <p className="text-sm text-gray-500">
          Find the perfect volunteer opportunity for you
        </p>
      </div>

      <div className="space-y-4">
        {/* Type filter */}
        <div className="grid grid-cols-3 gap-2">
          <button
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              filters.type === "all"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => handleFilterChange("type", "all")}
          >
            All Types
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              filters.type === "event"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => handleFilterChange("type", "event")}
          >
            Events
          </button>
          <button
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              filters.type === "help"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => handleFilterChange("type", "help")}
          >
            Help Posts
          </button>
        </div>

        {/* Category filter */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Location filter */}
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
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            placeholder="City, state, or zip"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
          />
        </div>

        {/* Date filter */}
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
          />
        </div>

        {/* Reset button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}
