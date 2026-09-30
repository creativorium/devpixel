export const showcaseCategories = [
  "Hospitality",
  "Cafe / Restaurant",
  "Shops / Ecommerce",
  "Villa",
  "Rental",
  "Spa / Wellness",
] as const;
export type ShowcaseCategory = (typeof showcaseCategories)[number];
export type Showcase = {
  slug: string;
  name: string;
  category: ShowcaseCategory;
  location: string;
  style: string;
  layout: "immersive" | "split" | "editorial";
  palette: [string, string, string];
  serif: boolean;
  headline: string;
  intro: string;
  story: string;
  image: string;
  items: [string, string, number][];
  features: string[];
  seo: string;
  design: string;
};
export const showcases: Showcase[] = [
  {
    slug: "rimba-ubud-retreat",
    name: "Rimba",
    category: "Hospitality",
    location: "Ubud, Bali",
    style: "Earthy sanctuary",
    layout: "immersive",
    palette: ["#f3f0e7", "#243b2e", "#c9d3a4"],
    serif: true,
    headline: "A little closer to nature.",
    intro:
      "Slow mornings. Open windows. Space to come back to yourself. A quieter kind of escape in Ubud.",
    story:
      "Leave a little room in your itinerary. For a long breakfast, a shaded terrace, a book you finally finish. Rimba imagines a small retreat where the rhythm of the day belongs to you.",
    image: "retreat",
    items: [
      [
        "Garden suite",
        "A sheltered terrace and a generous king bed. For two guests.",
        1800000,
      ],
      [
        "Canopy room",
        "An upstairs hideaway with leafy views. For two guests.",
        2200000,
      ],
      [
        "Pool pavilion",
        "An open living space beside a private plunge pool. For two guests.",
        3200000,
      ],
    ],
    features: ["Garden breakfasts", "Open-air spaces", "Room to slow down"],
    seo: "Boutique hotel website design in Ubud, Bali",
    design:
      "For an Ubud boutique hotel, a room page should explain occupancy, amenities and what is included before asking for dates. This concept pairs full-width photography with room comparisons and a simple stay enquiry. A real build could connect your booking engine and provide clear transfer and arrival information.",
  },
  {
    slug: "ember-seminyak-kitchen",
    name: "EMBER",
    category: "Cafe / Restaurant",
    location: "Seminyak, Bali",
    style: "After-dark dining",
    layout: "immersive",
    palette: ["#171b18", "#f8ead4", "#dda571"],
    serif: true,
    headline: "Good evenings start here.",
    intro:
      "Fire, a generous table, and the pleasure of taking your time. An intimate kitchen concept in Seminyak.",
    story:
      "Built around the warmth of a shared meal, Ember imagines a menu of charred vegetables, thoughtful plates and slow conversation. Pull up a chair and make an evening of it.",
    image: "dining",
    items: [
      [
        "Charred garden plate",
        "Seasonal vegetables, smoky dressing and toasted seeds.",
        95000,
      ],
      [
        "Fire-roasted catch",
        "A sample seafood main with citrus and herbs.",
        185000,
      ],
      [
        "Dark chocolate finish",
        "Chocolate, sea salt and a spoonful of cream.",
        75000,
      ],
    ],
    features: ["Fire-led plates", "An intimate setting", "Made for sharing"],
    seo: "Seminyak restaurant website design",
    design:
      "Restaurant websites in Seminyak should make menus easy to read on a phone and table enquiries easy to complete. Ember explores a dark, photography-led design with visible sample prices and a reservation preview. A live version would need verified opening hours, dietary information and a connection to the venue's reservation process.",
  },
  {
    slug: "nativ-bali-objects",
    name: "NATIV objects",
    category: "Shops / Ecommerce",
    location: "Bali, Indonesia",
    style: "Sculptural design store",
    layout: "editorial",
    palette: ["#f0ece6", "#3a342e", "#d5bba4"],
    serif: false,
    headline: "Everyday, considered.",
    intro:
      "Objects with a little more presence. A small collection for the places you call home.",
    story:
      "A bowl you reach for each morning. A vessel that needs no flowers. NATIV is a homeware shop concept that lets shape, texture and useful details do the talking.",
    image: "ceramics",
    items: [
      [
        "Everyday vessel",
        "A sculptural ceramic form in a warm sand finish.",
        420000,
      ],
      ["Low bowl", "A broad shallow bowl for fruit or a shared table.", 280000],
      ["Quiet cup", "A compact handleless cup with a tactile finish.", 180000],
    ],
    features: ["Considered forms", "Small collections", "Objects to live with"],
    seo: "Bali homeware ecommerce website design",
    design:
      "A Bali homeware store needs product information that supports a buying decision: dimensions, materials, care and delivery options. NATIV demonstrates a restrained catalogue and a working sample bag. A production ecommerce build would connect real inventory, payment processing and shipping rules, with product photography and maker claims supplied by the business.",
  },
  {
    slug: "sora-uluwatu-villa",
    name: "SORA",
    category: "Villa",
    location: "Uluwatu, Bali",
    style: "Cinematic coastal escape",
    layout: "immersive",
    palette: ["#f7f3e8", "#263f50", "#c4d5de"],
    serif: true,
    headline: "Stay a little above it all.",
    intro:
      "Blue horizons, wide-open afternoons and a place to gather. An imagined private villa escape in Uluwatu.",
    story:
      "A villa should make it easy to be together. Sora imagines generous shared spaces, private corners and a pool terrace that becomes the centre of the day.",
    image: "villa",
    items: [
      [
        "Two-bedroom stay",
        "A sample layout for four guests with shared living space.",
        3800000,
      ],
      [
        "Three-bedroom stay",
        "Room for six guests and a larger dining area.",
        5200000,
      ],
      ["Full house", "A four-bedroom concept for a group of eight.", 6800000],
    ],
    features: [
      "Room to gather",
      "Private outdoor living",
      "Long island afternoons",
    ],
    seo: "Uluwatu villa website design in Bali",
    design:
      "An Uluwatu villa website should pair atmosphere with clear bedroom layouts, guest capacity and booking conditions. Sora uses an immersive opening and a concise stay comparison to guide visitors to an enquiry. The location is a concept setting; a real property site should supply its exact map, access notes and verified photography.",
  },
  {
    slug: "coast-canggu-rental",
    name: "COAST / GO",
    category: "Rental",
    location: "Canggu, Bali",
    style: "Electric road-trip energy",
    layout: "split",
    palette: ["#e5fa83", "#19392b", "#a9c8b2"],
    serif: false,
    headline: "Your day. Your direction.",
    intro:
      "An easy-to-explore scooter rental concept for planning the practical side of an island day.",
    story:
      "Start with the right questions: which vehicle, which dates and what is included? Coast / Go puts those details up front, with a rental enquiry that leaves room to confirm the requirements before a booking.",
    image: "scooter",
    items: [
      [
        "City scooter",
        "A compact sample option for one or two riders. Requirements apply.",
        100000,
      ],
      [
        "Touring scooter",
        "A larger sample model with additional storage.",
        160000,
      ],
      [
        "Daily electric",
        "An electric model concept; charging arrangements to be confirmed.",
        190000,
      ],
    ],
    features: [
      "Compare the options",
      "Choose your dates",
      "Confirm before you ride",
    ],
    seo: "Bali scooter rental website design for Canggu",
    design:
      "A scooter rental website in Bali should explain vehicle specifications and the operator's requirements before accepting a booking. Coast / Go demonstrates a fleet selection and date enquiry. A production site would need accurate licence requirements, insurance terms, deposits and delivery coverage supplied and reviewed by the rental business.",
  },
];

showcases.push({
  slug: "sela-ubud-spa",
  name: "Sela Rituals",
  category: "Spa / Wellness",
  location: "Ubud, Bali",
  style: "A slower kind of ritual",
  layout: "split",
  palette: ["#eee7dc", "#4b493a", "#d1bb9f"],
  serif: true,
  headline: "Make room for stillness.",
  intro:
    "Unhurried treatments. Quiet spaces. A little time that belongs entirely to you.",
  story:
    "Sela is an imagined wellness house in Ubud, built around the simple pleasure of taking a pause. Explore a treatment, choose the time you need, and settle into a slower rhythm.",
  image: "spa",
  items: [
    [
      "Slow body ritual",
      "A gentle full-body massage concept, with time to arrive and unwind.",
      480000,
    ],
    [
      "Botanical facial",
      "A soothing facial ritual with a considered, simple routine.",
      420000,
    ],
    [
      "The complete pause",
      "A body and facial combination for an extended moment of quiet.",
      850000,
    ],
  ],
  features: ["Time to unwind", "Thoughtful rituals", "Your own pace"],
  seo: "Ubud spa and wellness website design in Bali",
  design:
    "A spa website in Ubud should help guests compare treatments, durations and prices before choosing an appointment. Sela pairs a calm editorial introduction with a treatment list and a guided appointment preview. A real business could connect therapist availability, secure deposits and consent forms, with treatment details supplied by qualified staff.",
});

const moodboards: Record<ShowcaseCategory, [string, string, string]> = {
  Hospitality: ["retreat", "pool", "interior"],
  "Cafe / Restaurant": ["dining", "food", "coffee"],
  "Shops / Ecommerce": ["ceramics", "interior", "textile"],
  Villa: ["villa", "architecture", "interior"],
  Rental: ["scooter", "coast", "boards"],
  "Spa / Wellness": ["spa", "retreat", "interior"],
};
export const showcaseMoodboard = (s: Showcase) =>
  moodboards[s.category].map((image, i) => ({
    image,
    style: ["The setting", "The details", "The atmosphere"][i],
    slug: image,
  }));
export function showcaseContact(slug: string) {
  return `/contact?service=web-design&showcase=${encodeURIComponent(slug)}`;
}
