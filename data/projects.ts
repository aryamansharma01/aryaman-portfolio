export interface Project {
  id: string;
  title: string;
  description: string;
  stack: string[];
  link?: string;
}

export const projects: Project[] = [
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
