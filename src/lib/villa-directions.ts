export type VillaDirection =
  "cinema" | "architecture" | "warmth" | "coast" | "estate";

export const villaDirections: Record<
  string,
  {
    direction: VillaDirection;
    signature: string;
    note: string;
    chapters: [string, string, string];
    moments: [string, string, string];
    photos?: [string, string, string];
  }
> = {
  "sora-uluwatu-villa": {
    direction: "cinema",
    signature: "SORA",
    moments: ["Room to gather", "By the pool", "At your own pace"],
    photos: ["interior", "villa", "coast"],
    note: "A private horizon / Uluwatu",
    chapters: [
      "Wide-open living, with room for a shared meal and the conversations that follow it.",
      "An afternoon without an agenda. The pool terrace is imagined as the place where everyone finds their own pace.",
      "A slower afternoon, without a schedule. This coastal concept leaves room to read, wander, and take the day as it comes.",
    ],
  },
  "batu-pererenan-house": {
    direction: "architecture",
    signature: "HOUSE 01",
    moments: ["Form & function", "Room to live", "One private house"],
    note: "A study in space / Pererenan",
    chapters: [
      "Purposeful lines and open spaces. This architectural house concept makes a quiet statement through simplicity.",
      "A considered interior, where purposeful rooms and clean lines leave space for everyday living.",
      "One house, several ways to stay. Private corners and communal space form a simple whole.",
    ],
  },
  "lumen-ubud-villa": {
    direction: "warmth",
    signature: "Lumen",
    moments: ["A shared table", "Settle in", "A little room to wander"],
    note: "The art of being together / Ubud",
    chapters: [
      "Breakfast becomes lunch. The shared table is the starting point for this warm family house concept.",
      "Unpack, open the doors, and settle into a slower rhythm. A home imagined for time together.",
      "A little room to wander. Garden-inspired spaces give the day somewhere quiet to go.",
    ],
  },
  "azul-amed-villa": {
    direction: "coast",
    signature: "AZUL",
    moments: ["Sea air", "Open-air living", "Light, inside"],
    note: "Notes from the east coast / Amed",
    chapters: [
      "Let the horizon set the pace. This coastal concept begins with sea air and a wide-open outlook.",
      "An open terrace for the long part of the afternoon. Gather, read, or leave the schedule behind.",
      "Light through an open room. The house is imagined as a quiet frame for the day outside.",
    ],
  },
  "arca-uluwatu-estate": {
    direction: "estate",
    signature: "ARCA",
    moments: ["The grounds", "A considered arrival", "The quieter hours"],
    note: "An invitation to stay / Uluwatu",
    chapters: [
      "A place for a shared occasion. Generous outdoor spaces set the tone for this private estate concept.",
      "An arrival worth taking slowly. Architecture and quiet corners make room for a considered gathering.",
      "The end of the evening, at your own pace. Private rooms sit alongside the spaces for your people.",
    ],
  },
};
