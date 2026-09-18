import { Cpu } from "lucide-react";
import ComingSoon from "@/components/dashboard/ComingSoon";

export default function HardwareAccessPage() {
  return (
    <ComingSoon
      icon={Cpu}
      title="Hardware Access"
      description="Run your circuits on real IBM Quantum hardware, run history, and success rates will land here."
    />
  );
}
