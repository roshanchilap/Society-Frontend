export default function FilterBar({ filters, onClear }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 mb-6 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {filters.map((filter, i) => (
          <div key={i} className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              {filter.label}
            </label>

            {filter.type === "text" && (
              <input
                type="text"
                placeholder={filter.placeholder}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300
                focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                outline-none transition"
              />
            )}

            {filter.type === "select" && (
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white
                focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                outline-none transition"
              >
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        {/* Clear Button */}
        {onClear && (
          <div className="flex items-end">
            <button
              onClick={onClear}
              className="w-full py-2 rounded-lg border border-gray-300 
              text-gray-700 hover:bg-gray-100 transition"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
