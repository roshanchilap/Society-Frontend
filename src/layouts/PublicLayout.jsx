export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded shadow p-6">
        {children}
      </div>
    </div>
  );
}
