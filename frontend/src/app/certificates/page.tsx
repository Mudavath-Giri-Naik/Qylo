import { Award } from "lucide-react";
import ComingSoon from "@/components/dashboard/ComingSoon";

export default function CertificatesPage() {
  return (
    <ComingSoon
      icon={Award}
      title="Certificates"
      description="Earn and download certificates as you complete modules and challenges."
    />
  );
}
