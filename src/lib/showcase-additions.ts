import type { Showcase, ShowcaseCategory } from "./showcase";
type Seed = Omit<Showcase, "layout" | "seo" | "design" | "features"> & {
  focus: string;
  features?: string[];
  design: string;
};
function concept(s: Seed): Showcase {
  const { focus, ...rest } = s;
  return {
    ...rest,
    layout:
      s.variant === 1 ? "split" : s.variant === 2 ? "editorial" : "immersive",
    features: s.features || [s.location, s.style, "Independent concept"],
    seo: `${focus} website design in ${s.location}`,
    design: s.design,
  };
}
const hotel: ShowcaseCategory = "Hospitality",
  food: ShowcaseCategory = "Cafe / Restaurant",
  shop: ShowcaseCategory = "Shops / Ecommerce",
  villa: ShowcaseCategory = "Villa",
  rental: ShowcaseCategory = "Rental",
  spa: ShowcaseCategory = "Spa / Wellness";
export const additionalShowcases: Showcase[] = [
  concept({
    slug: "solis-canggu-hotel",
    name: "SOLIS / SOCIAL STAY",
    category: hotel,
    location: "Canggu, Bali",
    variant: 1,
    style: "Sunny social hotel",
    palette: ["#fff7dd", "#b34226", "#ffd850"],
    serif: false,
    headline: "Check in. Tune out.",
    intro:
      "A little pool time. A very long breakfast. Your sunny base for a few good days in Canggu.",
    story:
      "Solis imagines a social hotel with room for both company and quiet. Start at the shared table, find a poolside seat, then make the day your own.",
    image: "pool",
    gallery: ["pool", "interior", "coast"],
    focus: "Boutique social hotel",
    items: [
      [
        "The easy double",
        "A bright room for two, with a workspace and garden outlook.",
        1250000,
      ],
      [
        "Poolside studio",
        "A ground-floor studio close to the shared pool.",
        1850000,
      ],
      [
        "Friends suite",
        "Two bedrooms and a shared sitting area for four.",
        2800000,
      ],
    ],
    features: ["Poolside days", "Breakfast conversations", "Your own corner"],
    design:
      "A Canggu hotel needs to show room types and shared facilities without making booking complicated. Solis puts date selection beside bright room cards, then uses a day-at-the-hotel itinerary to communicate the social atmosphere. A real property can connect its booking engine and supply verified room details.",
  }),
  concept({
    slug: "linea-sanur-residence",
    name: "LINEA",
    category: hotel,
    location: "Sanur, Bali",
    variant: 2,
    style: "Quiet long-stay residence",
    palette: ["#eef0ec", "#243c46", "#c4d1c9"],
    serif: false,
    headline: "Stay for a while.",
    intro:
      "Space to work, room to unpack. An apartment-hotel concept for a slower kind of stay in Sanur.",
    story:
      "Some trips need more than a suitcase stand. Linea centres daily life: a useful kitchen, a comfortable desk and a place that feels familiar by the second morning.",
    image: "interior",
    gallery: ["interior", "architecture", "coast"],
    focus: "Serviced apartment",
    items: [
      [
        "Studio residence",
        "One open-plan room with a kitchenette. Sleeps two.",
        1100000,
      ],
      [
        "One-bedroom apartment",
        "Separate living space and a private bedroom for two.",
        1650000,
      ],
      [
        "Family residence",
        "Two bedrooms and a shared kitchen for four.",
        2400000,
      ],
    ],
    features: ["Useful kitchens", "Space to work", "Longer stays"],
    design:
      "A serviced apartment website in Sanur should make long-stay layouts, occupancy and inclusions easy to compare. Linea uses a compact comparison table and a room selector. A production site could add weekly rates and booking rules after the operator confirms them.",
  }),
  concept({
    slug: "taman-sidemen-lodge",
    name: "Taman Field Lodge",
    category: hotel,
    location: "Sidemen, Bali",
    variant: 3,
    style: "Nature-led field journal",
    palette: ["#ece5cd", "#35452d", "#a2ad7f"],
    serif: true,
    headline: "Leave space for the landscape.",
    intro:
      "A small lodge concept among green horizons. Mornings outside, evenings with nowhere else to be.",
    story:
      "Taman is imagined as a field journal you can stay in. A shaded veranda, a path through the garden and a table facing the light make the simplest things feel like enough.",
    image: "retreat",
    gallery: ["retreat", "interior", "pool"],
    focus: "Nature lodge",
    items: [
      [
        "Garden lodge",
        "A timber-inspired hideaway with a veranda for two.",
        1450000,
      ],
      [
        "Valley suite",
        "A generous sitting area and leafy outlook for two.",
        2150000,
      ],
      ["Family pavilion", "Two connecting rooms for a group of four.", 2950000],
    ],
    features: ["Veranda mornings", "Garden paths", "Shared slow meals"],
    design:
      "A Sidemen lodge can lead with its setting while keeping room selection practical. Taman alternates large photographs with field-note descriptions and a compact stay enquiry. Real landscape photographs, access information and seasonal conditions would be supplied by the property.",
  }),
  concept({
    slug: "nocturne-seminyak-hotel",
    name: "NOCTURNE",
    category: hotel,
    location: "Seminyak, Bali",
    variant: 4,
    style: "After-hours design hotel",
    palette: ["#191c27", "#f3ede0", "#c0adf0"],
    serif: true,
    headline: "A different side of the island.",
    intro:
      "Late conversations, quiet rooms and a little city energy. A design-hotel concept for Seminyak.",
    story:
      "Nocturne imagines the balance between a lively evening and a genuinely quiet room. Sculptural spaces and an understated lounge set the mood before the doors close for the night.",
    image: "night-hotel",
    gallery: ["night-hotel", "interior", "pool"],
    focus: "Design hotel",
    items: [
      [
        "Atelier room",
        "A considered room for two with a generous reading corner.",
        1950000,
      ],
      [
        "Corner suite",
        "A separate sitting area and larger windows for two.",
        2750000,
      ],
      [
        "Penthouse concept",
        "A private lounge and terrace for a four-person stay.",
        4200000,
      ],
    ],
    features: ["Design-led spaces", "A quiet retreat", "Evenings at your pace"],
    design:
      "For a Seminyak design hotel, the site should sell atmosphere without hiding essential room information. Nocturne uses an asymmetric opening, a room explorer and clear nightly examples. Live rates and availability would come from the hotel's reservation system.",
  }),

  concept({
    slug: "daybreak-canggu-bakery",
    name: "daybreak!",
    category: food,
    location: "Canggu, Bali",
    variant: 1,
    style: "Playful neighbourhood bakery",
    palette: ["#fff0d7", "#8c3628", "#f9bc58"],
    serif: false,
    headline: "Good mornings, made daily.",
    intro:
      "Coffee in hand. Crumbs on the table. A bakery-cafe concept that starts the day on a brighter note.",
    story:
      "Daybreak is about the little daily ritual: a warm pastry, your usual coffee and a familiar corner to sit in. Come for breakfast or take something good with you.",
    image: "bakery",
    gallery: ["bakery", "coffee", "dining"],
    focus: "Bakery and cafe",
    items: [
      ["Morning bun", "A soft pastry with cinnamon and a citrus glaze.", 42000],
      [
        "Garden toast",
        "Toast with seasonal vegetables and a herby dressing.",
        78000,
      ],
      ["Flat white", "A double espresso with textured milk.", 38000],
    ],
    itemGroups: ["Bakery", "Breakfast", "Coffee"],
    features: ["Warm from the oven", "Coffee, always", "Slow breakfast club"],
    design:
      "A Canggu bakery site needs a readable breakfast menu and a clear path to a table request. Daybreak makes the menu browsable by category and pairs warm photography with playful type. Opening times and dietary details remain sample content until confirmed by a real cafe.",
  }),
  concept({
    slug: "meja-ubud-kitchen",
    name: "meja / seasonal table",
    category: food,
    location: "Ubud, Bali",
    variant: 2,
    style: "Seasonal kitchen editorial",
    palette: ["#f1eee0", "#4b5139", "#cfb881"],
    serif: true,
    headline: "A table worth slowing down for.",
    intro:
      "Vegetables at the centre, good company around the edges. An Ubud kitchen concept with a seasonal point of view.",
    story:
      "Meja imagines a small menu that changes with the conversation and the produce. Thoughtful plates, a generous lunch and a dining room that welcomes a longer afternoon.",
    image: "food",
    gallery: ["food", "dining", "coffee"],
    focus: "Seasonal restaurant",
    items: [
      [
        "Garden bowl",
        "A colourful mix of roasted vegetables, grains and dressing.",
        85000,
      ],
      ["Mushroom rice", "Rice, mushrooms and a fragrant herb broth.", 110000],
      ["Coconut finish", "Coconut pudding with seasonal fruit.", 60000],
    ],
    itemGroups: ["Lunch", "Mains", "Sweet"],
    features: ["Seasonal thinking", "A smaller menu", "Shared afternoons"],
    design:
      "Meja explores a menu-first website for an Ubud restaurant. The editorial layout prioritises dishes, prices and table selection, with space for a changing seasonal story. A real kitchen would provide ingredient, allergen and reservation information before launch.",
  }),
  concept({
    slug: "saltline-sanur-seafood",
    name: "SALTLINE",
    category: food,
    location: "Sanur, Bali",
    variant: 3,
    style: "Coastal seafood house",
    palette: ["#e7f0ef", "#164a59", "#f3c87c"],
    serif: false,
    headline: "At the edge of a good evening.",
    intro:
      "A coastal table, a shared plate and one more conversation. A relaxed seafood restaurant concept in Sanur.",
    story:
      "Saltline pairs the easy feeling of the shore with a concise kitchen menu. The imagined dining room is open, generous and made for a group to stay a little longer.",
    image: "coast",
    gallery: ["coast", "dining", "food"],
    focus: "Seafood restaurant",
    items: [
      [
        "Grilled fish plate",
        "A sample fish dish with citrus, herbs and rice.",
        165000,
      ],
      [
        "Coastal sharing plate",
        "Seafood, vegetables and dipping sauces for two.",
        295000,
      ],
      [
        "Lime cooler",
        "Lime, fresh herbs and sparkling water. Alcohol-free.",
        45000,
      ],
    ],
    itemGroups: ["From the grill", "To share", "Drinks"],
    features: ["Coastal tables", "Shared plates", "Easy evenings"],
    design:
      "A Sanur restaurant website should help groups see the menu and request the right table quickly. Saltline combines a coastal opening with menu sections and a group-size enquiry. A live business should verify seafood availability, dietary information and all prices.",
  }),
  concept({
    slug: "mori-seminyak-counter",
    name: "MORI / counter & bar",
    category: food,
    location: "Seminyak, Bali",
    variant: 4,
    style: "Minimal evening counter",
    palette: ["#212522", "#e8e4d6", "#c36b43"],
    serif: false,
    headline: "A few seats. A good night.",
    intro:
      "A quiet counter, a focused menu and the pleasure of watching things come together.",
    story:
      "Mori is a small counter-dining concept built around attention. Each part of the evening has room to breathe, from the first small plate to a final warm cup.",
    image: "dining",
    gallery: ["dining", "food", "coffee"],
    focus: "Counter dining restaurant",
    items: [
      [
        "Counter selection",
        "A sample sequence of small seasonal plates.",
        480000,
      ],
      [
        "Vegetable selection",
        "A vegetable-led set of sample counter dishes.",
        380000,
      ],
      [
        "Tea pairing",
        "Three sample teas selected for a slower evening.",
        120000,
      ],
    ],
    itemGroups: ["Counter menu", "Plant-led", "Pairings"],
    features: ["Small counter", "Focused kitchen", "Unhurried service"],
    design:
      "Mori demonstrates a reservation-led restaurant website for Seminyak. Large typographic menus and a concise seating request suit a small venue, while clear example prices set expectations. A production integration could connect the actual booking system and seating limits.",
  }),

  concept({
    slug: "tide-bali-surf-store",
    name: "TIDE SUPPLY",
    category: shop,
    location: "Canggu, Bali",
    variant: 1,
    style: "Sporting goods storefront",
    palette: ["#eef1e9", "#193d37", "#d7f05c"],
    serif: false,
    headline: "Made for the outside.",
    intro:
      "Everyday essentials for salt, sun and the walk home. A surf-lifestyle store concept from Canggu.",
    story:
      "Tide imagines a collection that moves easily between the beach and the everyday. Simple shapes, practical details and space for the things that come along for the ride.",
    image: "surf",
    gallery: ["surf", "coast", "boards"],
    focus: "Surf shop ecommerce",
    productKind: "surf",
    items: [
      ["Day bag", "A sample carryall for everyday beach essentials.", 320000],
      [
        "Field cap",
        "An adjustable sample cap with a simple woven label.",
        185000,
      ],
      ["Shore tee", "An easy-cut cotton tee concept.", 265000],
      [
        "Weekend tote",
        "A larger sample tote for a longer day outside.",
        380000,
      ],
      [
        "Trail cap",
        "A lightweight cap concept in a contrasting finish.",
        195000,
      ],
      ["After-surf tee", "A relaxed shirt concept for the way home.", 285000],
    ],
    itemGroups: ["Bags", "Caps", "Tees", "Bags", "Caps", "Tees"],
    options: ["Sand", "Forest"],
    design:
      "A Canggu surf shop can use collection filters, product variants and a clear cart to turn browsing into a purchase. Tide demonstrates familiar Shopify-style storefront patterns without processing real orders. A Shopify build could connect the merchant's actual products, payments and fulfilment.",
  }),
  concept({
    slug: "sari-bali-clothing",
    name: "SARI STUDIO",
    category: shop,
    location: "Bali, Indonesia",
    variant: 2,
    style: "Fashion label lookbook",
    palette: ["#f3e8e4", "#602c35", "#d5a795"],
    serif: true,
    headline: "Soft days. Strong shapes.",
    intro:
      "A wardrobe concept for warm weather and days without a strict plan. Easy pieces, considered together.",
    story:
      "Sari explores a small clothing collection through silhouette and texture. A few versatile pieces make room for personal style, with fit and sizing information close at hand.",
    image: "fashion",
    gallery: ["fashion", "interior", "textile"],
    focus: "Fashion ecommerce",
    productKind: "apparel",
    items: [
      [
        "The everyday shirt",
        "A relaxed shirt concept with a straight hem.",
        620000,
      ],
      ["The wrap layer", "A lightweight wrap concept for layering.", 380000],
      [
        "The easy trouser",
        "A wide-leg trouser concept with an elastic waist.",
        680000,
      ],
      [
        "The weekend shirt",
        "A longer-cut shirt with a sample button placket.",
        650000,
      ],
      [
        "The light scarf",
        "A versatile scarf concept with a soft drape.",
        290000,
      ],
      [
        "The day trouser",
        "A tapered trouser concept for an everyday fit.",
        590000,
      ],
    ],
    itemGroups: [
      "Shirts",
      "Layers",
      "Trousers",
      "Shirts",
      "Layers",
      "Trousers",
    ],
    options: ["S", "M", "L"],
    design:
      "A Bali fashion label needs strong collection imagery and useful size information. Sari combines a lookbook opening, collection navigation, size selection and a cart drawer. This is a Shopify-style shopping demonstration; a real store would add accurate fit guides, inventory and return policies.",
  }),
  concept({
    slug: "botan-bali-skincare",
    name: "BOTAN / daily care",
    category: shop,
    location: "Bali, Indonesia",
    variant: 3,
    style: "Botanical care boutique",
    palette: ["#eef0e4", "#3e4c38", "#d1b985"],
    serif: true,
    headline: "A little care, every day.",
    intro:
      "Simple routines, thoughtful objects. A skincare storefront concept that keeps the essentials easy to understand.",
    story:
      "Botan is a visual exploration of a smaller daily routine. Clear product information and considered packaging take priority over grand promises. Every product here is a fictional design example.",
    image: "beauty",
    gallery: ["beauty", "spa", "retreat"],
    focus: "Skincare ecommerce",
    productKind: "beauty",
    items: [
      ["Gentle wash", "A fictional daily cleanser product concept.", 185000],
      [
        "Daily lotion",
        "A sample moisturising lotion packaging concept.",
        225000,
      ],
      ["Botanical oil", "A sample body oil packaging concept.", 280000],
      ["Evening wash", "A fictional evening cleanser product concept.", 195000],
      ["Hand lotion", "A compact sample lotion for daily use.", 145000],
      ["Body oil", "A larger sample oil packaging concept.", 320000],
    ],
    itemGroups: [
      "Cleanse",
      "Moisturise",
      "Body",
      "Cleanse",
      "Moisturise",
      "Body",
    ],
    options: ["Standard", "Travel"],
    design:
      "A Bali care brand should give customers clear product details, sizes and purchase options. Botan demonstrates a Shopify-style store with collection filters and a product drawer. Real ingredient lists, regulatory claims, size-specific prices and safety information must come from the merchant; this demo makes no efficacy claims.",
  }),
  concept({
    slug: "ground-bali-coffee-store",
    name: "GROUND / coffee club",
    category: shop,
    location: "Bali, Indonesia",
    variant: 4,
    style: "Coffee roaster catalogue",
    palette: ["#f0e2ca", "#4c2921", "#dd6b3e"],
    serif: false,
    headline: "Your next good cup.",
    intro:
      "An approachable coffee shop concept for the morning ritual. Pick a bag, choose your grind, make it yours.",
    story:
      "Ground makes the path from browsing to brewing feel simple. A clear catalogue, easy grind choices and useful brewing notes leave more room to enjoy the cup.",
    image: "coffee",
    gallery: ["coffee", "bakery", "dining"],
    focus: "Coffee ecommerce",
    productKind: "coffee",
    items: [
      [
        "Morning blend",
        "A sample coffee concept with chocolate-led tasting notes.",
        145000,
      ],
      [
        "Slow Sunday",
        "A lighter sample roast with a fruit-led profile.",
        165000,
      ],
      ["After Hours", "A deeper sample roast for a fuller cup.", 155000],
      ["Everyday blend", "A balanced sample roast for daily brewing.", 135000],
      [
        "Weekend selection",
        "A sample single-origin style coffee concept.",
        185000,
      ],
      ["House espresso", "A sample espresso-focused blend concept.", 150000],
    ],
    itemGroups: [
      "Blends",
      "Selections",
      "Espresso",
      "Blends",
      "Selections",
      "Espresso",
    ],
    options: ["Whole bean", "Filter grind", "Espresso grind"],
    design:
      "A Bali coffee roaster's ecommerce site benefits from clear roast categories, grind selection and repeatable ordering. Ground uses a catalogue-led layout and familiar storefront controls. A real Shopify or WooCommerce build could connect product stock and fulfilment; subscriptions would be scoped separately.",
  }),

  concept({
    slug: "batu-pererenan-house",
    name: "BATU / HOUSE 01",
    category: villa,
    location: "Pererenan, Bali",
    variant: 1,
    style: "Architectural house index",
    palette: ["#e9e7e1", "#373d37", "#b8c3aa"],
    serif: false,
    headline: "The luxury of less.",
    intro:
      "Concrete lines, open air and space to live well. A private house concept with an architectural point of view.",
    story:
      "Batu presents one house as a collection of purposeful spaces. The shared living room opens to a courtyard, bedrooms offer quiet corners, and the plan makes group stays easy to understand.",
    image: "architecture",
    gallery: ["architecture", "interior", "villa"],
    focus: "Architectural villa",
    items: [
      [
        "Two-bedroom configuration",
        "Four guests with shared living and courtyard access.",
        3600000,
      ],
      [
        "Three-bedroom configuration",
        "Six guests, three private bedrooms and shared spaces.",
        4800000,
      ],
      ["The whole house", "Four bedrooms and space for eight guests.", 6200000],
    ],
    features: [
      "Courtyard living",
      "Four-bedroom concept",
      "Private shared spaces",
    ],
    design:
      "An architectural villa in Pererenan needs more than a beautiful cover photo. Batu uses a property index, room specifications and configuration selection to explain the stay. Verified floor plans, pool details and actual guest limits would replace the illustrative content.",
  }),
  concept({
    slug: "lumen-ubud-villa",
    name: "Lumen House",
    category: villa,
    location: "Ubud, Bali",
    variant: 2,
    style: "Warm family retreat",
    palette: ["#f6eadb", "#704b35", "#ddbd8a"],
    serif: true,
    headline: "The house for your people.",
    intro:
      "Long breakfasts, open doors and everyone around one table. An Ubud villa concept for time together.",
    story:
      "Lumen is imagined around shared moments. A useful kitchen, an open living room and separate bedrooms create a gentle balance between gathering and having a little space of your own.",
    image: "interior",
    gallery: ["interior", "villa", "retreat"],
    focus: "Family villa",
    items: [
      ["Small family stay", "Two bedrooms for up to four guests.", 3200000],
      ["Together stay", "Three bedrooms for up to six guests.", 4400000],
      ["Full family house", "Four bedrooms for up to eight guests.", 5600000],
    ],
    features: ["A shared table", "Room to unpack", "Private garden concept"],
    design:
      "An Ubud family villa site should make sleeping arrangements and shared spaces legible. Lumen leads with an inviting gallery and a stay planner. A real property should confirm child-safety provisions, accessibility and amenities rather than relying on illustrative descriptions.",
  }),
  concept({
    slug: "azul-amed-villa",
    name: "AZUL / east coast",
    category: villa,
    location: "Amed, Bali",
    variant: 3,
    style: "Mediterranean coastal escape",
    palette: ["#f2f4ee", "#235585", "#a9cfdf"],
    serif: true,
    headline: "Blue, as far as the day goes.",
    intro:
      "A coastal house concept on Bali's quieter eastern side. Open terraces, sea air and a slower schedule.",
    story:
      "Azul imagines a house that frames the horizon. The terrace becomes the meeting place, the living room stays open to the light, and the best plan is often to stay in.",
    image: "coast",
    gallery: ["coast", "villa", "interior"],
    focus: "Coastal villa",
    items: [
      [
        "Couple's escape",
        "A two-bedroom configuration for four guests.",
        3400000,
      ],
      [
        "Coastal gathering",
        "Three bedrooms with shared terrace living for six.",
        4600000,
      ],
      ["The full retreat", "Four bedrooms for a group of eight.", 6100000],
    ],
    features: ["Coastal outlook", "Open-air living", "A quieter itinerary"],
    design:
      "An Amed villa website can use a coastal visual story while keeping rates and group capacity easy to find. Azul places the house gallery alongside a stay configurator. A live site would need exact location, transport advice and photographs of the actual property.",
  }),
  concept({
    slug: "arca-uluwatu-estate",
    name: "ARCA / private estate",
    category: villa,
    location: "Uluwatu, Bali",
    variant: 4,
    style: "Private estate brochure",
    palette: ["#242823", "#e9e2cf", "#b7a77b"],
    serif: true,
    headline: "An address for a slower occasion.",
    intro:
      "A private estate concept for considered gatherings. Generous rooms, quiet gardens and space to host well.",
    story:
      "Arca approaches a villa as a setting for a shared occasion. The experience is deliberately calm: an introduction to the grounds, a clear room arrangement and a conversation about the stay.",
    image: "villa",
    gallery: ["villa", "architecture", "interior"],
    focus: "Luxury private villa",
    items: [
      ["Intimate stay", "Two-bedroom configuration for four guests.", 5400000],
      [
        "Gathering stay",
        "Three-bedroom configuration for six guests.",
        7200000,
      ],
      [
        "Estate stay",
        "Four bedrooms and shared spaces for eight guests.",
        9200000,
      ],
    ],
    features: [
      "Private grounds concept",
      "Space for gathering",
      "An unhurried stay",
    ],
    design:
      "An Uluwatu private estate site should support a considered enquiry rather than imply instant availability. Arca uses a brochure-like sequence and a group stay planner. Event permissions, staffing, minimum stays and booking terms would require confirmation from the real operator.",
  }),

  concept({
    slug: "north-bali-car-rental",
    name: "NORTH / MOTOR CLUB",
    category: rental,
    location: "Bali, Indonesia",
    variant: 1,
    style: "Car rental travel planner",
    palette: ["#edf0e9", "#243c42", "#b7cc8b"],
    serif: false,
    headline: "A little further, together.",
    intro:
      "A car rental concept for the next leg of the trip. Compare the space, plan the dates and make room for the journey.",
    story:
      "North makes vehicle choice practical. Passenger space and luggage matter as much as the route, so the rental flow begins with the kind of day you are planning.",
    image: "car",
    gallery: ["car", "coast", "retreat"],
    focus: "Car rental",
    items: [
      [
        "Compact city car",
        "A sample five-seat car with space for light luggage.",
        350000,
      ],
      [
        "Family crossover",
        "A larger sample five-seat vehicle with extra luggage room.",
        550000,
      ],
      [
        "Group people mover",
        "A sample seven-seat vehicle for a group trip.",
        750000,
      ],
    ],
    itemGroups: ["Compact", "Family", "Group"],
    features: ["Compare your space", "Plan the dates", "Confirm the details"],
    design:
      "A Bali car rental website needs clear vehicle comparisons and a date-based quote. North separates its travel-focused home page from the fleet planner, with sample daily rates and optional delivery. A real operator must confirm vehicle availability, insurance, licence and deposit terms.",
  }),
  concept({
    slug: "drift-uluwatu-board-rental",
    name: "DRIFT / board library",
    category: rental,
    location: "Uluwatu, Bali",
    variant: 2,
    style: "Surf equipment field guide",
    palette: ["#e7edf0", "#304e68", "#c1b4dc"],
    serif: false,
    headline: "Travel light. Choose well.",
    intro:
      "A surf equipment rental concept with room to compare. Find a board, choose the dates and ask the right questions.",
    story:
      "Drift treats the catalogue like a useful field guide. Clear shapes and equipment descriptions help start a conversation about suitability before anyone commits to a rental.",
    image: "boards",
    gallery: ["boards", "surf", "coast"],
    focus: "Surfboard rental",
    items: [
      [
        "Soft-top board",
        "A sample forgiving board shape; suitability must be confirmed.",
        120000,
      ],
      [
        "Everyday longboard",
        "A longer sample board shape for a different session.",
        170000,
      ],
      [
        "Travel shortboard",
        "A compact performance-oriented sample board.",
        200000,
      ],
    ],
    itemGroups: ["Soft-top", "Longboard", "Shortboard"],
    features: [
      "Compare board shapes",
      "Pack a little lighter",
      "Confirm your fit",
    ],
    design:
      "A surfboard rental site in Uluwatu should put equipment details before the enquiry. Drift uses a catalogue-inspired home and a separate date planner. Dimensions, condition and suitability would be confirmed by staff in a real rental service.",
  }),
  concept({
    slug: "pedal-sanur-bike-rental",
    name: "PEDAL / easy days",
    category: rental,
    location: "Sanur, Bali",
    variant: 3,
    style: "Friendly bicycle rental",
    palette: ["#fff1db", "#684329", "#efb861"],
    serif: false,
    headline: "Take the scenic way.",
    intro:
      "A bicycle rental concept for slower exploring in Sanur. A simple bike, a little daylight and a different pace.",
    story:
      "Pedal keeps the experience friendly and direct. Choose a bicycle type, plan when you need it and use the booking preview to see how a simple rental request could work.",
    image: "bicycle",
    gallery: ["bicycle", "coast", "retreat"],
    focus: "Bicycle rental",
    items: [
      ["City bicycle", "A sample upright bicycle for relaxed riding.", 80000],
      [
        "Hybrid bicycle",
        "A sample multi-purpose bicycle with a broader gear range.",
        120000,
      ],
      [
        "Electric bicycle",
        "A sample assisted bicycle; charging terms to be confirmed.",
        220000,
      ],
    ],
    itemGroups: ["City", "Hybrid", "Electric"],
    features: ["A slower pace", "Simple choices", "More time outside"],
    design:
      "A Sanur bicycle rental business needs a friendly catalogue and a clear pickup flow. Pedal combines an inviting home page with a bicycle selector and date estimate. The operator would provide sizing, maintenance, safety and rental requirements before launch.",
  }),
  concept({
    slug: "frame-canggu-camera-rental",
    name: "FRAME / equipment room",
    category: rental,
    location: "Canggu, Bali",
    variant: 4,
    style: "Camera equipment catalogue",
    palette: ["#202124", "#ecece6", "#b9c889"],
    serif: false,
    headline: "Make the next frame count.",
    intro:
      "A camera rental concept for a considered shoot. Find a kit, build a schedule and keep the equipment details in view.",
    story:
      "Frame imagines an equipment room made easy to browse. Creators can compare sample kits, see a daily estimate and prepare a request before the real rental team confirms the details.",
    image: "camera",
    gallery: ["camera", "coast", "interior"],
    focus: "Camera equipment rental",
    items: [
      [
        "Compact creator kit",
        "A sample compact camera and standard lens bundle.",
        350000,
      ],
      [
        "Full-frame kit",
        "A sample camera body and versatile lens combination.",
        650000,
      ],
      [
        "Cinema starter kit",
        "A sample video-focused kit with basic support accessories.",
        950000,
      ],
    ],
    itemGroups: ["Compact", "Photo", "Video"],
    features: [
      "Kit-based selection",
      "Clear daily estimates",
      "Plan the shoot",
    ],
    design:
      "A camera rental site in Canggu should make kit contents and booking dates easy to review. Frame uses a technical catalogue and a dedicated rental planner. A real operation needs verified inventory, condition checks, deposits and collection policies.",
  }),

  concept({
    slug: "aura-seminyak-day-spa",
    name: "AURA / day spa",
    category: spa,
    location: "Seminyak, Bali",
    variant: 1,
    style: "Soft contemporary day spa",
    palette: ["#f6e8e1", "#775049", "#d8bba5"],
    serif: true,
    headline: "A pause, just for you.",
    intro:
      "A day spa concept for a gentler afternoon. Choose a treatment and make a little room in your schedule.",
    story:
      "Aura imagines a welcoming day spa with an easy introduction to its rituals. A clear treatment menu and appointment preview keep the experience calm from the first visit.",
    image: "spa",
    gallery: ["spa", "beauty", "interior"],
    focus: "Day spa",
    items: [
      ["Body pause", "A sample full-body massage ritual.", 450000],
      [
        "Face ritual",
        "A sample facial treatment with a simple routine.",
        400000,
      ],
      [
        "Afternoon ritual",
        "A sample combined body and facial session.",
        780000,
      ],
    ],
    options: ["60", "45", "120"],
    features: [
      "A softer afternoon",
      "A considered welcome",
      "Time for yourself",
    ],
    design:
      "A Seminyak day spa website should clearly present treatment lengths and sample prices. Aura uses a soft split layout and a guided appointment selector. A real spa would connect staff schedules, confirm treatment suitability and provide actual service details.",
  }),
  concept({
    slug: "forma-canggu-wellness",
    name: "FORMA / movement & rest",
    category: spa,
    location: "Canggu, Bali",
    variant: 2,
    style: "Modern wellness studio",
    palette: ["#edf0e6", "#34483b", "#c7dc7f"],
    serif: false,
    headline: "Move a little. Rest a little.",
    intro:
      "A wellness studio concept with space for different rhythms. Explore a session and find a moment that fits.",
    story:
      "Forma balances a practical schedule with a welcoming atmosphere. The sample menu keeps session durations visible and gives visitors an uncomplicated path to an appointment preview.",
    image: "wellness",
    gallery: ["wellness", "spa", "retreat"],
    focus: "Wellness studio",
    items: [
      [
        "Gentle movement",
        "A sample guided movement session, adapted by real instructors.",
        250000,
      ],
      ["Rest session", "A sample quiet relaxation session.", 180000],
      [
        "Movement & pause",
        "A combined sample session with time to unwind.",
        380000,
      ],
    ],
    options: ["60", "45", "90"],
    features: ["Find your rhythm", "A clear schedule", "Space to reset"],
    design:
      "A wellness studio in Canggu needs a schedule visitors can understand quickly. Forma uses a timetable-like treatment layout and session selection. Actual instructor availability and participant requirements belong in a production booking integration, not in fictional demo claims.",
  }),
  concept({
    slug: "nami-sanur-bath-house",
    name: "NAMI / bath house",
    category: spa,
    location: "Sanur, Bali",
    variant: 3,
    style: "Japanese-inspired quiet bathing",
    palette: ["#e8ede8", "#385c60", "#b8d4cf"],
    serif: true,
    headline: "Let the noise drift away.",
    intro:
      "A quiet bath-house concept in Sanur. Unhurried rituals, simple choices and a softer end to the day.",
    story:
      "Nami borrows the calm of water for its visual language. An imagined sequence of private appointments gives each visitor time to arrive, settle in and leave without a rush.",
    image: "bath",
    gallery: ["bath", "spa", "retreat"],
    focus: "Bath house and spa",
    items: [
      ["Quiet soak", "A sample private bathing appointment.", 320000],
      ["Body ritual", "A sample body treatment with a quiet finish.", 480000],
      [
        "The long pause",
        "A combined sample bathing and body appointment.",
        720000,
      ],
    ],
    options: ["45", "60", "120"],
    features: [
      "Water & quiet",
      "Private appointment concept",
      "A slower finish",
    ],
    design:
      "A Sanur bath house site can present the sequence of a visit while keeping appointment selection simple. Nami uses a full-width visual opening and a ritual planner. A real venue must provide hygiene, suitability, accessibility and treatment information.",
  }),
  concept({
    slug: "terra-ubud-rituals",
    name: "TERRA / ritual house",
    category: spa,
    location: "Ubud, Bali",
    variant: 4,
    style: "Earth-toned private rituals",
    palette: ["#3e3029", "#eee0cd", "#c99b73"],
    serif: true,
    headline: "Return to a quieter rhythm.",
    intro:
      "An earthy treatment-house concept for Ubud. A few thoughtful rituals, a private room and time to settle.",
    story:
      "Terra uses warm materials and a small treatment list to invite a slower decision. Each sample ritual is presented with its length and price, so the next step stays clear.",
    image: "beauty",
    gallery: ["beauty", "retreat", "spa"],
    focus: "Private spa",
    items: [
      [
        "Grounding ritual",
        "A sample gentle body treatment appointment.",
        520000,
      ],
      [
        "Face & stillness",
        "A sample facial ritual in a quiet setting.",
        460000,
      ],
      [
        "The extended ritual",
        "A combined sample body and facial appointment.",
        890000,
      ],
    ],
    options: ["60", "45", "120"],
    features: [
      "Warm, quiet spaces",
      "A smaller ritual list",
      "Unhurried appointments",
    ],
    design:
      "For an Ubud private spa, a restrained site can communicate atmosphere and still support a useful enquiry. Terra combines an intimate visual layout with duration and appointment selection. Treatment descriptions and suitability advice would be supplied by the actual spa team.",
  }),
];
