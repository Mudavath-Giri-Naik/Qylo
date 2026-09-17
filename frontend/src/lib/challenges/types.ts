import type { CircuitJson } from "@/lib/circuit/types";

export interface QuizGradingRule {
  type: "quiz";
  options: string[];
  correct_index: number;
}

export interface CircuitGradingRule {
  type: "circuit";
  num_qubits: number;
  expected_counts: Record<string, number>;
  tolerance: number;
}

export type GradingRule = QuizGradingRule | CircuitGradingRule;

export interface Challenge {
  id: string;
  module_code: string;
  difficulty: string;
  prompt: string;
  starter_data: CircuitJson | null;
  grading_rule: GradingRule;
  created_at: string;
}
