// Catalog copy for the course detail hero -- like MODULES' title/description,
// this is hand-written course-catalog content (not per-user data), so it's
// fine to hardcode per module rather than derive it.

export interface ModuleHero {
  lead: string;
  highlight: string;
  note: string;
}

export const MODULE_HERO: Record<string, ModuleHero> = {
  "QT-M1": { lead: "Step into the", highlight: "Quantum World", note: "Smaller Qubits\nBigger Possibilities" },
  "QT-M2": { lead: "Master the art of", highlight: "Circuit Design", note: "Every Gate\nTells a Story" },
  "QT-M3": { lead: "Unlock the power of", highlight: "Quantum Algorithms", note: "Speedups\nBeyond Classical" },
  "QT-M4": { lead: "Bridge classical and quantum with", highlight: "Variational Methods", note: "Hybrid Power\nNear-Term Hardware" },
};

export interface ModuleInstructor {
  name: string;
  title: string;
}

export const MODULE_INSTRUCTOR: Record<string, ModuleInstructor> = {
  "QT-M1": { name: "Dr. Ananya Rao", title: "Quantum Computing Researcher" },
  "QT-M2": { name: "Dr. Rohan Mehta", title: "Quantum Software Engineer" },
  "QT-M3": { name: "Dr. Meera Iyer", title: "Quantum Algorithms Researcher" },
  "QT-M4": { name: "Dr. Kabir Nanda", title: "Quantum Research Scientist" },
};

export const MODULE_LONG_DESCRIPTION: Record<string, string> = {
  "QT-M1":
    "This course introduces the core concepts of quantum computing from scratch. You'll learn about qubits, quantum gates, circuits, and algorithms with hands-on examples using Qiskit. By the end, you'll be able to build and run real quantum circuits on cloud hardware.",
  "QT-M2":
    "This course dives into how quantum circuits are built and read. You'll combine gates into working circuits, recognize common gate patterns, and practice designing circuits for real problems using Qiskit.",
  "QT-M3":
    "This course walks through the landmark algorithms that first showed quantum computers could outperform classical ones -- from Deutsch-Jozsa to Shor's algorithm. You'll implement each one and see exactly where the speedup comes from.",
  "QT-M4":
    "This course covers QAOA and VQE, the hybrid quantum-classical algorithms designed for today's noisy intermediate-scale quantum hardware. You'll build variational circuits, tune them with a classical optimizer, and see how these methods tackle real optimization and chemistry problems.",
};

export const MODULE_AUDIENCE: Record<string, string[]> = {
  "QT-M1": [
    "Students and professionals curious about quantum computing.",
    "Developers who want to get hands-on with quantum circuits.",
    "Anyone interested in the future of computing and emerging technologies.",
  ],
  "QT-M2": [
    "Learners who've finished the fundamentals and want to go hands-on.",
    "Developers building circuits for real quantum hardware.",
    "Anyone who wants to read and design circuit diagrams fluently.",
  ],
  "QT-M3": [
    "Learners comfortable with circuits who want to see real algorithms.",
    "Anyone curious how quantum computers can outperform classical ones.",
    "Developers preparing for quantum algorithms coursework or research.",
  ],
  "QT-M4": [
    "Learners ready to tackle today's noisy quantum hardware.",
    "Anyone interested in QAOA, VQE, and hybrid algorithms.",
    "Developers building optimization or chemistry applications.",
  ],
};
