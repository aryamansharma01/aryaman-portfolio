export interface Publication {
  id: string;
  title: string;
  venue: string;
  year: string;
  link?: string;
}

export const publications: Publication[] = [
  {
    id: "causaltrace",
    title: "CausalTrace: A Neurosymbolic Causal Analysis Agent for Smart Manufacturing",
    venue: "AAAI 2026: IAAI — Innovative Applications of AI Conference",
    year: "2026",
    link: "https://arxiv.org/abs/2510.12033",
  },
  {
    id: "equitable-transit",
    title: "Designing Equitable Transit Networks",
    venue: "ACM Conference on Equity and Access in Algorithms, Mechanisms, and Optimization (EAAMO)",
    year: "2023",
    link: "https://arxiv.org/abs/2212.12007",
  },
  {
    id: "covid-concern-levels",
    title: "Concern Levels During COVID-19: An AI-Based Approach for Social Media Analysis",
    venue: "Springer, Innovations in Information and Communication Technologies",
    year: "2022",
    link: "https://link.springer.com/chapter/10.1007/978-981-19-3796-5_7",
  },
  {
    id: "twitter-sentiment",
    title: "Twitter Sentiment Analysis During Unlock Period of COVID-19",
    venue: "IEEE, 2020 Sixth International Conference on Parallel, Distributed and Grid Computing (PDGC)",
    year: "2020",
    link: "https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=9315773",
  },
];
