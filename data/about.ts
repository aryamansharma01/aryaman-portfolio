// Each string in `paragraphs` is one paragraph on the homepage. Any phrase listed
// in `links` is turned into a link wherever it appears in a paragraph.
export const about = {
  paragraphs: [
    "I'm a Master's student in Computational Data Science at Carnegie Mellon University, where I'm working on multi-agent systems and AI safety at the Li Lab.",
    "Before CMU, I spent close to three years as an ML engineer at Fast Retailing (UNIQLO's parent company) in Tokyo, first on demand forecasting across 4M+ SKUs and later on LLM systems like a fine-tuned translation pipeline and internal multi-agent tools.",
    "I got into ML during COVID in my second year at NSUT Delhi, and published my first paper by the end of that year. Since then I've worked on transit forecasting with Prof. Abhishek Dubey at Vanderbilt University, and on CausalTrace, a neurosymbolic agent for manufacturing, with Prof. Amit Sheth at AIISC.",
    "I'm a self-professed linguistics nerd: I currently speak Japanese, English, Hindi and French. I also enjoy reading about history, philosophy, and (lately) wildlife ecology.",
    " I'm currently writing about some of my coursework and projects at CMU, and occasionally about my personal experiences and thoughts.",
  ],
  links: {
    "Li Lab": "https://leililab.github.io/",
    "Fast Retailing": "https://www.fastretailing.com/eng/",
    "Abhishek Dubey": "https://abhishekdubey.bio/",
    "Amit Sheth": "https://amit.aiisc.ai/",
    "writing" : "https://aryaman01.vercel.app/blog",
  } as Record<string, string>,
};
