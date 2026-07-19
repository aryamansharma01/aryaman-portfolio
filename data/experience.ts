export interface ExperienceEntry {
  id: string;
  role: string;
  org: string;
  location: string;
  start: string;
  end: string;
  highlights: string[];
}

export const experience: ExperienceEntry[] = [
  {
    id: "fast-retailing",
    role: "Machine Learning Engineer",
    org: "Fast Retailing (UNIQLO)",
    location: "Tokyo, Japan",
    start: "2023-09-01",
    end: "2026-07-31",
    highlights: [
      "Developed and deployed demand forecasting pipelines serving 4M+ SKUs across 40 business units, engineering temporal/categorical features that drove a $170M+ (¥26B) annual reduction in stockouts.",
      "Built a JP-to-EN copy translation engine by fine-tuning frontier LLMs (via Azure OpenAI), designing custom guardrail pipelines and optimizing token throughput — reducing translation costs by $130K+ (¥20M) annually.",
      "Architected a multi-agent supply chain management system using the OpenAI Agent SDK, engineering custom tool-calling schemas and parallel retrieval pipelines over 600MB+ relational databases, reducing decision cycle from 3 weeks to 2 days.",
      "Developed CockpitAI, a multi-agent report navigation system using 3 parallel analysis agents, dual RAG search, and GPT-5 vision-based manual Q&A, optimizing multi-modal RAG search latency by 60% across corporate documents.",
    ],
  },
  {
    id: "usc",
    role: "Research Associate (Collaborator)",
    org: "University of South Carolina",
    location: "Remote",
    start: "2025-03-01",
    end: "2025-12-31",
    highlights: [
      "Co-developed CausalTrace (accepted AAAI 2026 IAAI), a neurosymbolic causal analysis agent within the SmartPilot industrial CoPilot, achieving MAP@3: 94%, PR@2: 97%, MRR: 0.92, and ROUGE-1: 0.91 agreement with domain experts.",
      "Built Foresight, a time-series demand forecasting module for hourly yeast production achieving a 35% MSE improvement over an LSTM baseline, and InfoGuide, an LLM-based conversational agent for operator Q&A over causal graphs.",
      "Designed an evaluation framework based on the C3AN principles, scoring 4.59/5 across robustness, intelligence, and trustworthiness dimensions.",
    ],
  },
  {
    id: "vanderbilt",
    role: "Summer Research Intern",
    org: "Vanderbilt University",
    location: "Nashville, TN",
    start: "2022-06-01",
    end: "2022-08-31",
    highlights: [
      "Achieved 96% accuracy in stop-level transit occupancy prediction using Transformer and LSTM architectures, optimizing resource allocation for paratransit systems (NSF-funded, Prof. Abhishek Dubey).",
    ],
  },
];
