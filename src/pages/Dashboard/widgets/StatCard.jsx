export default function StatCard({ label, value, Icon, bg, iconBg, onClick }) {
  return (
    <div
      className={`p-4 sm:p-5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${bg}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-gray-600 text-xs sm:text-sm">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{value}</p>
        </div>

        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${iconBg}`}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
