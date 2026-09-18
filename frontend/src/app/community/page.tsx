import { Users } from "lucide-react";
import ComingSoon from "@/components/dashboard/ComingSoon";

export default function CommunityPage() {
  return (
    <ComingSoon
      icon={Users}
      title="Community"
      description="Discussions, study groups, and peer Q&A are on the way."
    />
  );
}
