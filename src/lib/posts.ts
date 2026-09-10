export type Post = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  service: string;
  sections: { title: string; paragraphs: string[] }[];
  sources?: { title: string; url: string }[];
};
export const posts: Post[] = [
  {
    slug: "web-development-bali-small-business-guide",
    title: "Web development in Bali: a practical guide for small businesses",
    description:
      "Plan a Bali business website around mobile visitors, clear enquiries, useful content, and reliable ownership—not just a polished homepage.",
    category: "Web development",
    date: "2026-09-10",
    service: "development",
    sections: [
      {
        title: "Start with the action your visitor needs",
        paragraphs: [
          "A villa, creative studio, and trading educator need very different websites. Before choosing a platform or visual style, write down the most important action a visitor should take: ask about availability, book a consultation, or understand a service. That decision determines the pages and integrations you need.",
          "For a hospitality business in Bali, a useful first version might contain accommodation details, location information, an enquiry route, and clear booking conditions. For a service business, start with the problem you solve, who you help, and a straightforward way to begin a conversation. A beautiful page that leaves those questions unanswered creates extra work for both sides.",
        ],
      },
      {
        title: "Design for visitors who are already on their phones",
        paragraphs: [
          "Treat mobile as a real planning constraint. Check whether a visitor can read pricing conditions, inspect photos, and contact the right person without zooming. Compress photographs, give images defined dimensions, and test forms on an ordinary phone connection. A messaging button should make the next step obvious without covering the page.",
          "If customers come from different countries, write clear English first and add professionally checked translations where they serve a genuine audience. Keep location details precise. Serving customers in Australia does not require pretending the business has an Australian office.",
        ],
      },
      {
        title: "Choose technology around editing and maintenance",
        paragraphs: [
          "A custom website can suit a distinctive experience or integration. A content management system can be more useful when a team needs to change room details, publish updates, or manage a large catalogue frequently. Ask who will make those changes, how often, and what training they will need before deciding.",
          "Agree who owns the domain, hosting account, source code, and analytics property. Request access under your own business account, a backup process, and a handover document. Hosting and support are ongoing responsibilities, so include them in your budget rather than considering launch the final cost.",
        ],
      },
      {
        title: "A brief you can send to a developer",
        paragraphs: [
          "Prepare your business goal, audience, required pages, existing brand assets, two reference websites, any integrations, and a realistic launch window. Mark each item as essential or later. This makes proposals easier to compare and keeps a small-business website focused. DevnPixel works with businesses targeting Bali and international customers; the first conversation is about what the website needs to achieve.",
        ],
      },
    ],
  },
  {
    slug: "affordable-web-design-without-cutting-corners",
    title: "Affordable web design: spend less by choosing a better scope",
    description:
      "A small-business guide to affordable web design: compare deliverables, control revisions, and budget for content, hosting, and maintenance.",
    category: "Small business",
    date: "2026-09-10",
    service: "web-design",
    sections: [
      {
        title: "Affordable should describe the whole project",
        paragraphs: [
          "An inexpensive build can become expensive if it needs rewriting, is difficult to update, or leaves the owner dependent on someone else for basic access. Compare the total work required to launch and run the website, rather than the headline design fee alone.",
          "There is no honest universal price for a small-business website. A brochure site with prepared copy is different from a booking platform with payments, several languages, and custom data. Ask for an itemised scope showing design, development, content work, integrations, testing, and handover. Separate one-off costs from recurring subscriptions.",
        ],
      },
      {
        title: "Prioritise a small set of complete pages",
        paragraphs: [
          "For a service business, a focused launch could include a homepage, a useful services section, an about page, and a working contact route. Add proof of work only when you have permission and accurate information. A concise site with complete copy is often more useful than a large navigation full of unfinished pages.",
          "Put optional features in a second phase. Examples include advanced animation, custom dashboards, and multilingual publishing. This is not a rule against ambitious design: it is a way to make sure the essential customer journey receives enough attention before the budget is exhausted.",
        ],
      },
      {
        title: "Prepare content before detailed design",
        paragraphs: [
          "Supply your logo files, service descriptions, approved photographs, contact information, and frequently asked questions early. Missing content causes layout changes and repeat reviews. If writing is part of the project, specify who drafts, approves, and uploads it.",
          "Consolidate feedback into one review per milestone. Conflicting comments from several people can consume a small budget quickly. Agree the number of revision rounds and how additional requests are estimated. The same principle applies whether you hire a freelancer, an independent studio, or a larger agency.",
        ],
      },
      {
        title: "Keep the essentials in the quote",
        paragraphs: [
          "Do not cut readable mobile layouts, accessible form labels, secure deployment, basic search metadata, or an actual delivery test of the contact form. These are useful acceptance checks, not decorative extras. Ask for a launch checklist and confirm who fixes defects after launch.",
          "At DevnPixel, an affordable web design conversation starts with priorities and scope. Share your budget range and the outcome you need; we can discuss what belongs in the first release. A smaller, well-defined project is a stronger starting point than an unrealistically cheap promise to do everything.",
        ],
      },
    ],
  },
  {
    slug: "freelancer-or-small-web-design-agency",
    title: "Freelancer or small web design agency: how to choose",
    description:
      "Compare a freelance web developer and an independent agency by ownership, communication, design depth, and support—not team size alone.",
    category: "Freelancing",
    date: "2026-09-10",
    service: "web-design",
    sections: [
      {
        title: "Look at responsibilities before job titles",
        paragraphs: [
          "The distinction between a freelancer and a small agency is not always clear. An independent developer may work with a designer, while a small studio may have one person leading the entire project. What matters is who is responsible for each part and whether the proposed arrangement fits your needs.",
          "Ask who handles discovery, copy, design, development, testing, and support. A strong specialist can be an excellent choice for a defined technical task. A studio can help connect several disciplines when the brand, content, and website all need attention. Neither label automatically guarantees quality or availability.",
        ],
      },
      {
        title: "Evaluate evidence relevant to your project",
        paragraphs: [
          "Look beyond attractive screenshots. Open websites on a phone, follow their navigation, and check whether you understand what the business offers. Ask which parts the candidate actually created and whether an example is a live client project or a self-initiated concept. Both can show ability, but they are different kinds of evidence.",
          "A short discussion about a relevant challenge is often more useful than asking for a large unpaid design exercise. For example: how would the developer handle availability enquiries, a slow photo gallery, or a client editing their own content? Listen for a clear process and sensible questions.",
        ],
      },
      {
        title: "Make collaboration concrete",
        paragraphs: [
          "Agree a main contact, feedback milestones, response expectations, and the way changes will be recorded. For remote work, specify the time zone for meetings and deadlines. Written decisions are especially helpful when a founder is travelling or several stakeholders review asynchronously.",
          "Clarify ownership and ongoing access before paying a deposit. The agreement should cover source files, third-party licences, domain and hosting access, and what happens if the relationship ends. Support also needs a definition: fixing an existing defect is different from adding a new feature.",
        ],
      },
      {
        title: "Choose the working relationship you can sustain",
        paragraphs: [
          "A freelancer may offer direct specialist access. An independent studio may coordinate a broader brief while keeping communication personal. Compare the proposed deliverables, dependencies, and maintenance plan alongside cost. Choose the person or team whose process you understand, not simply the largest portfolio or lowest estimate.",
          "DevnPixel is an independent creative studio combining web design, development, brand strategy, and advertising creative. Tell us which pieces you already have and which need help. That gives us a better basis for a proposal than assuming every client needs a full agency package.",
        ],
      },
    ],
  },
  {
    slug: "remote-web-design-australia-us-singapore",
    title:
      "Working with a remote web studio in Australia, the US, or Singapore",
    description:
      "A practical remote website workflow for businesses in Australia, the United States, and Singapore: briefs, time zones, reviews, and handover.",
    category: "Working together",
    date: "2026-09-10",
    service: "development",
    sections: [
      {
        title: "Remote delivery needs a visible process",
        paragraphs: [
          "A website project does not require everyone to work in the same office, but it does require a shared picture of progress. If your business is in Australia, the United States, or Singapore and your web studio works remotely, agree where tasks, previews, and decisions will live before the build begins.",
          "Start with a brief describing the audience, business objective, required functionality, content owner, and launch dependencies. Keep a single approved scope. When an idea changes, record the effect on budget and timing instead of allowing it to quietly become an unplanned requirement.",
        ],
      },
      {
        title: "Agree overlap rather than promising constant availability",
        paragraphs: [
          "Choose a practical meeting window and label it with a named time zone. Australia and the US span several zones, and daylight saving can change the difference during a project. Put review deadlines in a shared calendar so a date does not mean different things to different people.",
          "Use asynchronous updates for work that does not need a call. A preview link with three specific review questions is easier to respond to than an open-ended request for feedback. Reserve meetings for decisions that benefit from conversation, such as approving the information structure or resolving conflicting priorities.",
        ],
      },
      {
        title: "Design for the customer's market",
        paragraphs: [
          "A remote team still needs to understand local expectations. Confirm spelling, currency, phone-number format, service areas, and the language your customers use. An Australian audience may expect different terminology from a US audience. If the site sells across markets, make pricing and availability unambiguous.",
          "Avoid publishing near-identical city pages that imply offices you do not have. Describe remote service honestly and provide useful information for each actual audience. Legal notices, tax treatment, and regulated claims should be checked by someone qualified for the markets where the business operates.",
        ],
      },
      {
        title: "Define a useful handover",
        paragraphs: [
          "Before launch, confirm account ownership, editing instructions, backups, and the support contact. Test a real enquiry through the production site and verify that the right person receives it. Keep credentials in an appropriate password manager rather than a project chat.",
          "DevnPixel welcomes remote web design and development enquiries from Bali, Australia, the US, and Singapore. We plan communication around the agreed scope and availability, without implying local offices or around-the-clock support. Bring your audience, required pages, and target launch window to the first discussion.",
        ],
      },
    ],
  },
  {
    slug: "ai-coding-agents-web-development-2026",
    title:
      "AI coding agents in 2026: what small-business website owners should know",
    description:
      "A September 2026 perspective on AI coding agents: what recent research says, where they help web development, and why human review still matters.",
    category: "AI notes",
    date: "2026-09-10",
    service: "development",
    sections: [
      {
        title: "The news: longer tasks, broader use",
        paragraphs: [
          "In a June 25, 2026 research update, OpenAI described a shift toward longer-running work with coding agents and adoption beyond engineering teams. Its report is evidence about the users and internal activity it studied, not a promise that every business will obtain the same results. The source is linked below so you can examine the context.",
          "For a small-business website owner, the useful question is less about whether a tool can produce code and more about who verifies the result. A generated page may look convincing while still having an unreliable form, inaccessible controls, or incorrect business information. Faster production does not remove the need for acceptance criteria.",
        ],
      },
      {
        title: "Where agents can help a website project",
        paragraphs: [
          "Well-defined tasks are a practical starting point: drafting a component from an approved design, identifying repeated code, preparing test cases, or proposing a fix for a specific bug. The developer should supply constraints and check the output against them. This is a workflow recommendation, not a performance claim about a particular model.",
          "Ask a prospective developer how they review generated changes. Useful answers describe version control, isolated previews, tests of important journeys, and a person accountable for approval. A claim that the whole website was made by AI does not tell you whether it works for your customers.",
        ],
      },
      {
        title: "Keep private data and publishing decisions under control",
        paragraphs: [
          "Do not treat a coding assistant as a place to paste customer records or production credentials. Teams should decide which tools may receive project data and which actions require review. A public marketing page and a live payment integration deserve different levels of access and verification.",
          "The same review principle applies to content. AI can help organise an outline, but someone needs to check dates, sources, claims, and whether an article adds anything useful. Publishing many interchangeable pages for search terms can leave visitors with less useful information, even if the publishing process is fast.",
        ],
      },
      {
        title: "Measure the delivered website",
        paragraphs: [
          "Evaluate the final result with the same questions you would ask of any web developer: does it load well on mobile, can people navigate with a keyboard, does the form deliver, and can the business maintain it? Google's Core Web Vitals guidance identifies loading, responsiveness, and visual stability as important aspects of page experience; a perfect lab score alone is not a guarantee of search rankings.",
          "Our recommendation is to use AI to support a deliberate development process. Keep a clear brief, reviewed changes, and a human owner for the outcome. Tools will continue to change; responsibility for the website should remain clear.",
        ],
      },
    ],
    sources: [
      {
        title: "OpenAI: How agents are transforming work (25 June 2026)",
        url: "https://openai.com/index/how-agents-are-transforming-work/",
      },
      {
        title: "Google Search Central: Core Web Vitals",
        url: "https://developers.google.com/search/docs/appearance/core-web-vitals",
      },
    ],
  },
];
