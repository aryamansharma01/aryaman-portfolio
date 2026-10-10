// Each string in `paragraphs` is one paragraph on the homepage. Any phrase listed
// in `links` is turned into a link wherever it appears in a paragraph.
export const about = {
  paragraphs: [
    "I'm a Master's student in Computational Data Science at Carnegie Mellon University, where I'm working on multi-agent systems and AI safety at the Li Lab.",
    "Before CMU, I spent close to three years as an ML engineer at Fast Retailing (UNIQLO's parent company) in Tokyo. I worked on demand forecasting across 4M+ SKUs and 40 business units, and later built LLM systems for the business: a fine-tuned translation pipeline, and multi-agent tools that let teams query reports and data in plain language.",
    "I got into ML during COVID in my second year at NSUT Delhi, learning from Stanford lectures, papers, and hackathons, and published my first paper by the end of that year. Since then I've worked on transit forecasting with Prof. Abhishek Dubey's group at Vanderbilt University, and on CausalTrace, a neurosymbolic agent for root-cause analysis in manufacturing, with Prof. Amit Sheth at AIISC.",
  ],
  links: {
    "Li Lab": "https://leililab.github.io/",
    "Fast Retailing": "https://www.fastretailing.com/eng/",
    "Abhishek Dubey": "https://abhishekdubey.bio/",
    "Amit Sheth": "https://amit.aiisc.ai/",
  } as Record<string, string>,
};
