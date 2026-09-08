export const services = [
  {
    slug: "brand-strategy",
    name: "Brand strategy",
    headline: "Know what you stand for.",
    intro:
      "A clear point of view makes every design decision easier. We help you define who you are, who you serve, and why people should choose you.",
    description:
      "Brand positioning, messaging, and visual identity that give your business a clear, consistent voice.",
    shape: "cross",
    deliverables: [
      [
        "Positioning & audience",
        "A focused review of your audience, competitors, and offer, turned into a practical positioning statement.",
      ],
      [
        "Messaging & voice",
        "A message hierarchy, value proposition, and tone-of-voice examples your team can use across touchpoints.",
      ],
      [
        "Visual identity",
        "Logo directions, typography, a colour system, and art direction that express the strategy.",
      ],
      [
        "Brand guidelines",
        "An organised identity toolkit with usage rules and examples for consistent day-to-day application.",
      ],
    ],
    steps: [
      [
        "Discover",
        "We work through your ambitions, audience, and existing brand to find a useful starting point.",
      ],
      [
        "Define",
        "We align on the positioning and creative direction before developing the identity.",
      ],
      [
        "Equip",
        "We refine the chosen direction and hand over the assets and guidance your team needs.",
      ],
    ],
    faqs: [
      [
        "Can you work with our existing identity?",
        "Yes. We can clarify your positioning, refine an existing visual system, or build a new identity. The scope follows what your business actually needs.",
      ],
      [
        "Is this just a logo project?",
        "The logo is one part of the system. We connect the identity to your audience, messaging, and the places people encounter your brand.",
      ],
    ],
  },
  {
    slug: "web-design",
    name: "Web design",
    headline: "A website with a point of view.",
    intro:
      "Your website should make people understand you, trust you, and know what to do next. We bring structure, clarity, and a distinctive visual language to every screen.",
    description:
      "Thoughtful website design, user journeys, and responsive interfaces shaped around your brand and your visitors.",
    shape: "frame",
    deliverables: [
      [
        "Structure & user journeys",
        "A sitemap and page priorities built around your content and the actions visitors need to take.",
      ],
      [
        "Wireframes & content direction",
        "Early layouts that establish the hierarchy, flow, and content requirements before visual details.",
      ],
      [
        "Responsive interface design",
        "A considered set of desktop and mobile layouts, with reusable components and clear interaction states.",
      ],
      [
        "Prototype & handoff",
        "A clickable prototype for key journeys, plus organised design files and implementation notes.",
      ],
    ],
    steps: [
      [
        "Map",
        "We identify your audiences, review the content, and agree on the pages and journeys that matter.",
      ],
      [
        "Design",
        "We explore a visual direction and develop it into a consistent set of responsive layouts.",
      ],
      [
        "Refine",
        "We review the experience together, test key interactions, and prepare the design for development.",
      ],
    ],
    faqs: [
      [
        "Can you redesign an existing website?",
        "Yes. We begin by identifying what works, what creates friction, and what should change. Useful content and familiar patterns can stay.",
      ],
      [
        "Does web design include the build?",
        "Design can be commissioned on its own or paired with development. We agree on the deliverables upfront so you know exactly what is included.",
      ],
    ],
  },
  {
    slug: "development",
    name: "Development",
    headline: "Built to work. Made to last.",
    intro:
      "We turn designs into responsive websites that feel good to use and are straightforward to maintain. The craft continues long after the first screen looks right.",
    description:
      "Responsive website development with attention to performance, accessibility, technical SEO, and maintainable code.",
    shape: "steps",
    deliverables: [
      [
        "Frontend development",
        "Responsive, reusable components that translate the design faithfully across screen sizes.",
      ],
      [
        "Content & integrations",
        "A content structure and any agreed CMS, form, or third-party connections your workflow requires.",
      ],
      [
        "Performance & technical SEO",
        "Asset optimisation, semantic markup, metadata, sitemap configuration, and checks on the important pages.",
      ],
      [
        "Testing & launch",
        "Browser and device checks, deployment setup, and handover notes so you can confidently manage the site.",
      ],
    ],
    steps: [
      [
        "Plan",
        "We agree on the content model, integrations, hosting, and technical approach before implementation.",
      ],
      [
        "Build",
        "We develop in reviewable stages and test the core user journeys as the site takes shape.",
      ],
      [
        "Launch",
        "We complete the agreed checks, connect the production environment, and hand over the project.",
      ],
    ],
    faqs: [
      [
        "Can you build from an existing design?",
        "Yes. Share the design files and requirements so we can assess responsiveness, interactions, and any missing states before building.",
      ],
      [
        "Can we update the content ourselves?",
        "Yes, when a CMS is part of the agreed scope. We help choose an editing approach that fits how often your content changes and who maintains it.",
      ],
    ],
  },
  {
    slug: "advertising",
    name: "Advertising",
    headline: "Give your message a little momentum.",
    intro:
      "A strong campaign starts with something worth saying. We turn your brand story into focused advertising creative that reaches the right people and gives them a reason to act.",
    description:
      "Campaign concepts, advertising design, and digital ad creative shaped around your audience, message, and goals.",
    shape: "core",
    deliverables: [
      [
        "Campaign direction",
        "A focused creative concept, audience priorities, and a clear message for your product launch, promotion, or brand campaign.",
      ],
      [
        "Ad creative & copy",
        "A consistent set of visual directions, headlines, and calls to action for paid social, display, and other agreed placements.",
      ],
      [
        "Platform-ready assets",
        "Static graphics, short motion pieces, and format variations tailored to the channels and placements in your campaign.",
      ],
      [
        "Landing pages & iteration",
        "A connected landing-page direction and creative variations you can test, with refinements guided by the results you share.",
      ],
    ],
    steps: [
      [
        "Focus",
        "We agree on the audience, offer, campaign goal, and channels before exploring creative directions.",
      ],
      [
        "Create",
        "We develop the concept, write the core messages, and produce a cohesive set of advertising assets.",
      ],
      [
        "Refine",
        "We prepare the approved formats and iterate on the creative using feedback and available campaign insights.",
      ],
    ],
    faqs: [
      [
        "Do you handle media buying or ad spend?",
        "Our core service is strategy and creative production. Media buying, campaign management, and ad spend are discussed separately and included only when agreed in the project scope.",
      ],
      [
        "Can you work with our existing brand or marketing team?",
        "Yes. We can create within your existing guidelines, collaborate with your marketing partner, or help establish a new campaign direction. We align on responsibilities before production.",
      ],
    ],
  },
] as const;
