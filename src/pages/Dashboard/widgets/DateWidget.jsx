import { useEffect, useState } from "react";

export default function DateWidget() {
  const [date, setDate] = useState("");

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const formatted = d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      setDate(formatted);
    };

    update();
    const timer = setInterval(update, 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  return <>{date}</>;
}
