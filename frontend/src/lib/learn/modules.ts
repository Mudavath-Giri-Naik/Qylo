export type LessonLanguage = "en" | "hi" | "te";

export const SUPPORTED_LANGUAGES: { code: LessonLanguage; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "te", label: "తెలుగు" },
];

export interface ModuleMeta {
  code: string;
  title: Partial<Record<LessonLanguage, string>>;
  description: Partial<Record<LessonLanguage, string>>;
}

export const MODULES: ModuleMeta[] = [
  {
    code: "QT-M1",
    title: {
      en: "Quantum Computing Fundamentals",
      hi: "क्वांटम कंप्यूटिंग की बुनियादी बातें",
      te: "క్వాంటం కంప్యూటింగ్ ప్రాథమికాంశాలు",
    },
    description: {
      en: "Qubits, superposition, entanglement, and the basic gates everything else is built from.",
      hi: "क्विट, सुपरपोज़िशन, एंटैंगलमेंट, और वे मूल गेट जिनसे बाकी सब कुछ बनता है।",
      te: "క్విట్‌లు, సూపర్‌పొజిషన్, ఎంటాంగిల్‌మెంట్, మరియు మిగతావన్నీ నిర్మించబడే ప్రాథమిక గేట్‌లు.",
    },
  },
  {
    code: "QT-M2",
    title: {
      en: "Circuit Design",
      hi: "सर्किट डिज़ाइन",
      te: "సర్క్యూట్ డిజైన్",
    },
    description: {
      en: "How to read and build circuit diagrams, and the gate combinations you'll see everywhere.",
      hi: "सर्किट डायग्राम कैसे पढ़ें और बनाएँ, और वे गेट संयोजन जो हर जगह दिखेंगे।",
      te: "సర్క్యూట్ డయాగ్రామ్‌లను ఎలా చదవాలి, నిర్మించాలి, మరియు ప్రతిచోటా కనిపించే గేట్ కలయికలు.",
    },
  },
  {
    code: "QT-M3",
    title: {
      en: "Standard Quantum Algorithms",
    },
    description: {
      en: "Deutsch-Jozsa through Shor's algorithm — the landmark algorithms that show quantum speedups.",
    },
  },
  {
    code: "QT-M4",
    title: {
      en: "Variational Algorithms",
    },
    description: {
      en: "QAOA and VQE — hybrid quantum-classical algorithms built for today's NISQ hardware.",
    },
  },
];

export function moduleTitle(mod: ModuleMeta, lang: LessonLanguage): string {
  return mod.title[lang] ?? mod.title.en ?? mod.code;
}

export function moduleDescription(mod: ModuleMeta, lang: LessonLanguage): string {
  return mod.description[lang] ?? mod.description.en ?? "";
}

export function isLessonLanguage(value: string | undefined): value is LessonLanguage {
  return value === "en" || value === "hi" || value === "te";
}
