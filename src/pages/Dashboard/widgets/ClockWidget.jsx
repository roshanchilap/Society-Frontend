export default function ClockWidget() {
  const h = new Date().getHours();
  const msg =
    h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="text-sm font-medium text-gray-700">
      {msg}
    </div>
  );
}
