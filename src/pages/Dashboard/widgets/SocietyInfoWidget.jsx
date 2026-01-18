import { Building2 } from "lucide-react";

export default function SocietyInfoWidget() {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-700">
        <Building2 size={18} /> Society Info
      </h3>

      <div className="space-y-2 text-sm">
        <p>
          <strong>Office:</strong> A-Block, Ground Floor
        </p>
        <p>
          <strong>Email:</strong> societyoffice@example.com
        </p>
        <p>
          <strong>Phone:</strong> +91 98765 43210
        </p>
        <p>
          <strong>Office Hours:</strong> 10 AM – 6 PM
        </p>
      </div>
    </div>
  );
}
