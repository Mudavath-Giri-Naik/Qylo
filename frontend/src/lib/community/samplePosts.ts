// Illustrative community feed -- there's no discussions/posts backend yet
// (no forum tables in the schema), so this is sample content in the same
// spirit as the sample leaderboard, just enough to demo the intended UI.
export type PostCategory = "Questions" | "Showcase" | "Resources" | "Announcements";

export interface CommunityPost {
  id: string;
  author: string;
  category: PostCategory;
  title: string;
  body: string;
  tags: string[];
  comments: number;
  likes: number;
  relative: string;
  hoursAgo: number;
}

export const SAMPLE_POSTS: CommunityPost[] = [
  {
    id: "p1",
    author: "Arjun Mehta",
    category: "Questions",
    title: "How to implement Quantum Teleportation in Qiskit?",
    body: "I'm trying to build a teleportation circuit using Qiskit but the measurement results are not as expected. Can someone review my circuit?",
    tags: ["Qiskit", "Quantum Circuits", "Help"],
    comments: 12,
    likes: 28,
    relative: "2 hours ago",
    hoursAgo: 2,
  },
  {
    id: "p2",
    author: "Priya Sharma",
    category: "Questions",
    title: "Understanding the intuition behind Grover's Algorithm",
    body: "I get the mathematical steps, but I'm struggling with the intuition. Can someone explain with a simple example?",
    tags: ["Algorithms", "Theory", "Discussion"],
    comments: 18,
    likes: 45,
    relative: "4 hours ago",
    hoursAgo: 4,
  },
  {
    id: "p3",
    author: "Karthik Reddy",
    category: "Showcase",
    title: "My first quantum circuit! 🎉",
    body: "Just built a simple Bell state circuit and ran it on IBM Quantum. Excited to share the results!",
    tags: ["Showcase", "IBM Quantum", "Beginners"],
    comments: 24,
    likes: 92,
    relative: "6 hours ago",
    hoursAgo: 6,
  },
  {
    id: "p4",
    author: "Sneha Varma",
    category: "Questions",
    title: "Best resources to learn Quantum Error Correction?",
    body: "Looking for beginner-friendly resources (videos or notes) to understand error correction codes. Any recommendations?",
    tags: ["Resources", "Error Correction", "Learning"],
    comments: 15,
    likes: 37,
    relative: "1 day ago",
    hoursAgo: 24,
  },
  {
    id: "p5",
    author: "Rohan Das",
    category: "Questions",
    title: "Qiskit vs Cirq – Which one to choose?",
    body: "I'm planning to start working on quantum ML projects. Which framework is better for long term?",
    tags: ["Tools", "qiskit", "Cirq"],
    comments: 20,
    likes: 31,
    relative: "1 day ago",
    hoursAgo: 26,
  },
  {
    id: "p6",
    author: "Meghana Iyer",
    category: "Showcase",
    title: "Share your quantum projects!",
    body: "Let's use this thread to share our quantum computing projects. It can be anything - circuits, simulations or real hardware runs!",
    tags: ["Projects", "Showcase", "Community"],
    comments: 41,
    likes: 76,
    relative: "2 days ago",
    hoursAgo: 48,
  },
];

export const TRENDING_TOPICS = [
  { name: "Qiskit", posts: 124 },
  { name: "Quantum Algorithms", posts: 98 },
  { name: "IBM Quantum", posts: 76 },
  { name: "Error Correction", posts: 54 },
  { name: "Quantum Machine Learning", posts: 42 },
];
