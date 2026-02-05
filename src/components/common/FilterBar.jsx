import { useState } from "react";

export default function FilterBar({ filters, onClear }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white shadow-sm rounded-xl p-3 sm:p-4 mb-6 border border-gray-200">
      {/* Mobile Accordion */}
      <div className="md:hidden">
        <button
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium"
          onClick={() => setOpen(!open)}
        >
          {open ? "Hide Filters" : "Show Filters"}
        </button>

        {open && (
          <div className="mt-3 space-y-3">
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
                    outline-none transition text-sm"
                  />
                )}

                {filter.type === "select" && (
                  <select
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-300 bg-white
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                    outline-none transition text-sm"
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

            {onClear && (
              <button
                onClick={onClear}
                className="w-full py-2 rounded-lg border border-gray-300 
                text-gray-600 font-medium hover:bg-gray-100 transition text-sm"
              >
                ✖ Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        {filters.map((filter, i) => (
          <div key={i} className="flex flex-col">
            <label className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
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
                outline-none transition text-sm sm:text-base"
              />
            )}

            {filter.type === "select" && (
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white
                focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                outline-none transition text-sm sm:text-base"
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

        {onClear && (
          <div className="flex items-end">
            <button
              onClick={onClear}
              className="w-full py-2 rounded-lg border border-gray-300 
              text-gray-600 font-medium hover:bg-gray-100 transition text-sm sm:text-base"
            >
              ✖ Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}