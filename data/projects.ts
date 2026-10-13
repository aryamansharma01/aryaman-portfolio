export interface Project {
  id: string;
  title: string;
  description: string;
  stack: string[];
  link?: string;
}

export const projects: Project[] = [
  {
    id: "minigpt",
    title: "MiniGPT",
    description:
      "A compact decoder-only GPT written from scratch in PyTorch, trained at the character level on Tiny Shakespeare. Built on the minGPT architecture with modern upgrades: rotary position embeddings, grouped-query attention, RMSNorm with QK-Norm, and a SwiGLU feed-forward network. I wrote up the build and the training results on the blog.",
    stack: ["Python", "PyTorch", "einops"],
    link: "https://github.com/aryamansharma01/minigpt",
  },
  {
    id: "smartpilot",
    title: "SmartPilot",
    description:
      "An agent-based copilot for manufacturing, built with the team at AIISC. Three compact neurosymbolic agents work over multimodal plant data: PredictX predicts anomalies from sensor time series and images, ForeSight forecasts production demand, and InfoGuide answers operator questions over manuals and sensor data. I worked on ForeSight and InfoGuide.",
    stack: ["Python", "Streamlit", "Jupyter"],
    link: "https://github.com/ChathurangiShyalika/SmartPilot",
  },
  {
    id: "nayancom",
    title: "NayanCom",
    description:
      "A patient monitoring and communication assistant for people with motion and speech disabilities, built as a three-person Internet of Things course project. Patients issue commands by blinking, detected from a webcam using the eye aspect ratio, while an Arduino heart-rate sensor streams vitals over Bluetooth. A React dashboard alerts the caretaker to commands, vitals, and emergencies.",
    stack: ["Python", "OpenCV", "dlib", "Arduino", "React", "Node.js"],
    link: "https://github.com/aryamansharma01/NayanCom",
  },
];
