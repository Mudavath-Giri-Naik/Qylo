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
  "QT-M5": { lead: "Build the foundation with", highlight: "Quantum Math", note: "Vectors In\nIntuition Out" },
  "QT-M6": { lead: "Start coding with", highlight: "Qiskit", note: "From Python\nTo Qubits" },
  "QT-M7": { lead: "Send information through", highlight: "Entanglement", note: "Teleport a State\nNot a Particle" },
  "QT-M8": { lead: "Secure the future with", highlight: "Quantum Cryptography", note: "Physics-Backed\nSecrecy" },
  "QT-M9": { lead: "Find hidden periods with the", highlight: "Quantum Fourier Transform", note: "Phases Become\nAnswers" },
  "QT-M10": { lead: "Meet the machines behind", highlight: "Real Qubits", note: "Noise Is\nThe Frontier" },
  "QT-M11": { lead: "Make fragile qubits reliable with", highlight: "Error Correction", note: "Many Physical\nOne Logical" },
  "QT-M12": { lead: "Where quantum meets", highlight: "Machine Learning", note: "Circuits That\nLearn" },
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
  "QT-M5": { name: "Dr. Kavya Menon", title: "Mathematical Physicist" },
  "QT-M6": { name: "Arjun Varma", title: "Quantum Software Developer" },
  "QT-M7": { name: "Dr. Sneha Kulkarni", title: "Quantum Networks Researcher" },
  "QT-M8": { name: "Dr. Vikram Sethi", title: "Quantum Security Researcher" },
  "QT-M9": { name: "Dr. Meera Iyer", title: "Quantum Algorithms Researcher" },
  "QT-M10": { name: "Dr. Aditya Bose", title: "Quantum Hardware Engineer" },
  "QT-M11": { name: "Dr. Nisha Pillai", title: "Quantum Error Correction Researcher" },
  "QT-M12": { name: "Dr. Rahul Joshi", title: "Quantum Machine Learning Scientist" },
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
  "QT-M5":
    "This course covers exactly the mathematics quantum computing uses and nothing more: complex numbers, vectors and matrices, Dirac notation, and tensor products. Every idea is tied back to a qubit or a gate, so the math stays concrete and you can read any lesson on the platform with confidence.",
  "QT-M6":
    "This course turns circuit diagrams into working Python. You'll build circuits with Qiskit, run them on the Aer simulator, understand shots and measurement counts, and learn how transpilation maps your circuit onto a real device's native gates and connectivity.",
  "QT-M7":
    "This course shows how entanglement changes what's possible when moving information. You'll learn why quantum states can't be copied, how teleportation transfers a state using a Bell pair and two classical bits, and how superdense coding packs two bits into one qubit.",
  "QT-M8":
    "This course covers how quantum mechanics both threatens and protects secrecy. You'll work through the BB84 key distribution protocol, see how measurement exposes an eavesdropper, and understand why Shor's algorithm is driving the move to post-quantum cryptography.",
  "QT-M9":
    "This course unpacks the Quantum Fourier Transform and quantum phase estimation -- the subroutines doing the heavy lifting inside Shor's algorithm and many chemistry algorithms. You'll build the QFT circuit gate by gate and see how phases get turned into readable measurement results.",
  "QT-M10":
    "This course looks at quantum computers as physical machines. You'll learn what decoherence, T1 and T2 times, and gate fidelities mean, compare superconducting, trapped-ion, and photonic qubits, and practice error mitigation techniques that make noisy results more trustworthy.",
  "QT-M11":
    "This course explains how quantum error correction protects information without ever measuring it directly. You'll build bit-flip and phase-flip repetition codes, see how the Shor code combines them, and learn why surface codes are the leading path to fault-tolerant quantum computers.",
  "QT-M12":
    "This course explores quantum machine learning with a healthy dose of realism. You'll learn how classical data is encoded into qubits, how variational classifiers are trained, how quantum kernels work, and what current research says about where a genuine quantum advantage might come from.",
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
  "QT-M5": [
    "Learners who want the math behind quantum computing without a physics degree.",
    "Students brushing up on linear algebra for quantum courses.",
    "Anyone who found ket notation confusing and wants it to click.",
  ],
  "QT-M6": [
    "Learners ready to move from diagrams to code.",
    "Python developers getting started with quantum programming.",
    "Anyone preparing to run circuits on real quantum hardware.",
  ],
  "QT-M7": [
    "Learners comfortable with entanglement and Bell states.",
    "Anyone curious how quantum teleportation actually works.",
    "Students interested in quantum networks and the quantum internet.",
  ],
  "QT-M8": [
    "Learners interested in security and cryptography.",
    "Developers who want to understand the post-quantum transition.",
    "Anyone curious how physics can guarantee a secret key.",
  ],
  "QT-M9": [
    "Learners who've met Shor's algorithm and want to see inside it.",
    "Students preparing for quantum algorithms research.",
    "Anyone interested in quantum chemistry and simulation algorithms.",
  ],
  "QT-M10": [
    "Learners who want to know why real results differ from simulations.",
    "Developers preparing to run jobs on real quantum hardware.",
    "Anyone curious how today's quantum computers are physically built.",
  ],
  "QT-M11": [
    "Learners comfortable with circuits and measurement.",
    "Students interested in fault-tolerant quantum computing.",
    "Anyone wondering how quantum computers will scale beyond noise.",
  ],
  "QT-M12": [
    "Learners with some machine learning background.",
    "Data scientists curious about quantum approaches.",
    "Researchers exploring near-term quantum applications.",
  ],
};
