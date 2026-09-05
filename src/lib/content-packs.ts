// Starter content packs — the ritual structure of a wedding, kept deliberately
// separate from the visual templates in template-registry.ts.
//
// Why separate: a South Indian Muslim and a North Indian Muslim wedding share
// their ceremony structure (Nikah, Walima) while looking nothing alike, and two
// Hindu weddings can share a palette while running entirely different rituals.
// Folding region × religion into the template list would have produced a dozen
// near-identical designs. Packs and templates compose instead, so six of each
// covers the whole matrix.
//
// A pack can't know the couple's venue or dates, so events are defined as
// offsets from the wedding date with placeholder venues the couple then edits.

export type PackEvent = {
  title: string;
  subtitle: string;
  description: string;
  dayLabel: string;
  // Days relative to the wedding date. Negative = before, 0 = the day itself.
  offsetDays: number;
  startHour: number; // 24h local
  durationHours: number;
  dressCode: string;
};

export type ContentPack = {
  key: string;
  name: string;
  description: string;
  // Which cultural tradition this covers, shown under the name in the picker.
  tradition: string;
  events: PackEvent[];
};

// Placeholder venue. fullAddress has a 10-character minimum in
// eventInputSchema, so this has to clear that while still reading as a prompt
// to fill it in.
export const PACK_PLACEHOLDER_VENUE = "Venue to be confirmed";
export const PACK_PLACEHOLDER_ADDRESS = "Address to be confirmed";

export const contentPacks: ContentPack[] = [
  {
    key: "hindu-south",
    name: "South Indian Hindu",
    tradition: "Tamil, Telugu, Kannada & Malayalam traditions",
    description:
      "Engagement through Muhurtham and reception, following the early-morning ceremony timings most South Indian families keep.",
    events: [
      {
        title: "Nischayathartham",
        subtitle: "Engagement",
        description:
          "Both families meet to formally announce the wedding, exchange gifts and read the lagna patrika setting out the ceremony details.",
        dayLabel: "Engagement",
        offsetDays: -3,
        startHour: 10,
        durationHours: 3,
        dressCode: "Traditional festive",
      },
      {
        title: "Mehendi & Haldi",
        subtitle: "Turmeric and henna",
        description:
          "Henna is applied for the bride and close family, followed by the haldi blessing where turmeric paste is offered for good fortune.",
        dayLabel: "Two days before",
        offsetDays: -2,
        startHour: 16,
        durationHours: 4,
        dressCode: "Bright informal (expect turmeric stains)",
      },
      {
        title: "Sangeet",
        subtitle: "Music and dance",
        description:
          "An evening of family performances, music and dinner as both sides celebrate together before the ceremony day.",
        dayLabel: "The evening before",
        offsetDays: -1,
        startHour: 19,
        durationHours: 4,
        dressCode: "Indian festive",
      },
      {
        title: "Muhurtham",
        subtitle: "The wedding ceremony",
        description:
          "The wedding ceremony held during the auspicious muhurtham window, including the mangalsutra and saptapadi rituals. Please be seated well before the start.",
        dayLabel: "Wedding day",
        offsetDays: 0,
        startHour: 7,
        durationHours: 4,
        dressCode: "Traditional formal",
      },
      {
        title: "Reception",
        subtitle: "Dinner celebration",
        description:
          "An evening reception with dinner, photographs and blessings for the couple as they greet every guest.",
        dayLabel: "Wedding evening",
        offsetDays: 0,
        startHour: 19,
        durationHours: 4,
        dressCode: "Formal Indian or western",
      },
    ],
  },
  {
    key: "hindu-north",
    name: "North Indian Hindu",
    tradition: "Punjabi, Rajasthani & wider North Indian traditions",
    description:
      "Roka through Baraat, Phere and reception, following the evening ceremony timings typical of a North Indian shaadi.",
    events: [
      {
        title: "Roka & Tilak",
        subtitle: "The first commitment",
        description:
          "The families formally agree to the match, apply tilak and exchange sweets and gifts to mark the engagement.",
        dayLabel: "Engagement",
        offsetDays: -3,
        startHour: 11,
        durationHours: 3,
        dressCode: "Indian semi-formal",
      },
      {
        title: "Mehendi",
        subtitle: "Henna afternoon",
        description:
          "Intricate henna is applied for the bride and guests over an afternoon of music, snacks and conversation.",
        dayLabel: "Two days before",
        offsetDays: -2,
        startHour: 15,
        durationHours: 4,
        dressCode: "Bright and comfortable",
      },
      {
        title: "Haldi",
        subtitle: "Turmeric blessing",
        description:
          "Turmeric paste is applied by family members for blessings and glow before the wedding day. Wear something you don't mind staining.",
        dayLabel: "The day before",
        offsetDays: -1,
        startHour: 10,
        durationHours: 3,
        dressCode: "Yellow, informal",
      },
      {
        title: "Sangeet",
        subtitle: "Music night",
        description:
          "Choreographed family performances, dhol, dancing and dinner as both families celebrate the night before the wedding.",
        dayLabel: "The evening before",
        offsetDays: -1,
        startHour: 19,
        durationHours: 5,
        dressCode: "Indian festive",
      },
      {
        title: "Baraat & Phere",
        subtitle: "Procession and ceremony",
        description:
          "The groom's procession arrives with music and dancing, followed by the jaimala and the seven phere around the sacred fire.",
        dayLabel: "Wedding day",
        offsetDays: 0,
        startHour: 17,
        durationHours: 5,
        dressCode: "Traditional formal",
      },
      {
        title: "Reception",
        subtitle: "Dinner and blessings",
        description:
          "Dinner, speeches and photographs as the couple is welcomed and blessed by both families and their guests.",
        dayLabel: "Wedding night",
        offsetDays: 0,
        startHour: 21,
        durationHours: 4,
        dressCode: "Formal",
      },
    ],
  },
  {
    key: "nikah-walima",
    name: "Nikah & Walima",
    tradition: "Muslim ceremony structure",
    description:
      "Mangni through Nikah and Walima. Works for South Indian, North Indian and Arabic families alike, since the ceremony structure is shared.",
    events: [
      {
        title: "Mangni",
        subtitle: "Engagement",
        description:
          "The families meet to formalise the engagement, exchange rings and gifts, and share a meal together.",
        dayLabel: "Engagement",
        offsetDays: -3,
        startHour: 18,
        durationHours: 3,
        dressCode: "Modest semi-formal",
      },
      {
        title: "Mehendi",
        subtitle: "Henna evening",
        description:
          "An evening of henna, music and food with the bride's family and friends before the Nikah.",
        dayLabel: "Two days before",
        offsetDays: -2,
        startHour: 17,
        durationHours: 4,
        dressCode: "Festive, modest",
      },
      {
        title: "Nikah",
        subtitle: "The marriage contract",
        description:
          "The marriage contract is read and signed before witnesses, with the mahr agreed and duas offered for the couple.",
        dayLabel: "Nikah day",
        offsetDays: 0,
        startHour: 16,
        durationHours: 3,
        dressCode: "Modest formal",
      },
      {
        title: "Walima",
        subtitle: "The wedding banquet",
        description:
          "The reception hosted by the groom's family, celebrating the marriage with a banquet for family, friends and community.",
        dayLabel: "Walima",
        offsetDays: 1,
        startHour: 19,
        durationHours: 4,
        dressCode: "Formal, modest",
      },
    ],
  },
  {
    key: "christian",
    name: "Christian Wedding",
    tradition: "Church ceremony and reception",
    description:
      "Rehearsal, nuptial ceremony and reception, suited to Catholic, Orthodox and Protestant weddings in India and abroad.",
    events: [
      {
        title: "Rehearsal & Family Dinner",
        subtitle: "The evening before",
        description:
          "The wedding party walks through the order of service at the church, followed by dinner with close family and friends.",
        dayLabel: "The evening before",
        offsetDays: -1,
        startHour: 18,
        durationHours: 4,
        dressCode: "Smart casual",
      },
      {
        title: "Wedding Ceremony",
        subtitle: "The nuptial service",
        description:
          "The marriage service with the exchange of vows and rings, readings and blessing. Please be seated fifteen minutes before the service begins.",
        dayLabel: "Wedding day",
        offsetDays: 0,
        startHour: 11,
        durationHours: 2,
        dressCode: "Formal (shoulders covered in church)",
      },
      {
        title: "Reception",
        subtitle: "Lunch and celebration",
        description:
          "Drinks, a meal, speeches and dancing as the couple celebrates with everyone who came to witness the marriage.",
        dayLabel: "Wedding afternoon",
        offsetDays: 0,
        startHour: 14,
        durationHours: 6,
        dressCode: "Formal",
      },
    ],
  },
  {
    key: "chinese",
    name: "Chinese Wedding",
    tradition: "Tea ceremony and banquet",
    description:
      "Betrothal gifts, the door games and tea ceremony, and an evening banquet across the traditional running order.",
    events: [
      {
        title: "Guo Da Li",
        subtitle: "Betrothal gifts",
        description:
          "The groom's family presents betrothal gifts to the bride's family, and the wedding date is confirmed between both households.",
        dayLabel: "Betrothal",
        offsetDays: -7,
        startHour: 10,
        durationHours: 3,
        dressCode: "Semi-formal",
      },
      {
        title: "Door Games & Tea Ceremony",
        subtitle: "Wedding morning",
        description:
          "The groom collects the bride after the door games, then the couple serves tea to elders from both families to receive their blessings.",
        dayLabel: "Wedding morning",
        offsetDays: 0,
        startHour: 8,
        durationHours: 4,
        dressCode: "Traditional red (avoid white and black)",
      },
      {
        title: "Wedding Banquet",
        subtitle: "Evening celebration",
        description:
          "A multi-course banquet with toasts, speeches and the couple's outfit changes as they greet every table.",
        dayLabel: "Wedding evening",
        offsetDays: 0,
        startHour: 18,
        durationHours: 5,
        dressCode: "Formal (red and gold welcome)",
      },
    ],
  },
  {
    key: "western",
    name: "Western Wedding",
    tradition: "European & American structure",
    description:
      "A single-day ceremony and reception with a rehearsal dinner: the standard European and American running order.",
    events: [
      {
        title: "Rehearsal Dinner",
        subtitle: "The evening before",
        description:
          "The wedding party rehearses the ceremony and then gathers for dinner with close family and out-of-town guests.",
        dayLabel: "The evening before",
        offsetDays: -1,
        startHour: 18,
        durationHours: 4,
        dressCode: "Smart casual",
      },
      {
        title: "Ceremony",
        subtitle: "Vows and rings",
        description:
          "The marriage ceremony with vows, rings and readings, followed by photographs with family and friends.",
        dayLabel: "Wedding day",
        offsetDays: 0,
        startHour: 15,
        durationHours: 2,
        dressCode: "Formal",
      },
      {
        title: "Reception",
        subtitle: "Dinner and dancing",
        description:
          "A drinks reception, dinner, speeches and dancing into the evening to celebrate the newly married couple.",
        dayLabel: "Wedding evening",
        offsetDays: 0,
        startHour: 18,
        durationHours: 6,
        dressCode: "Black tie optional",
      },
    ],
  },
];

export function findContentPack(key: string) {
  return contentPacks.find((pack) => pack.key === key) ?? null;
}

// Turns a pack's relative offsets into concrete start/end timestamps anchored on
// the couple's wedding date. Returns rows shaped for the Event model; the venue
// fields are placeholders the couple replaces.
export function materialisePackEvents(pack: ContentPack, weddingDate: Date) {
  return pack.events.map((event, index) => {
    const start = new Date(weddingDate);
    start.setDate(start.getDate() + event.offsetDays);
    start.setHours(event.startHour, 0, 0, 0);

    const end = new Date(start);
    end.setHours(end.getHours() + event.durationHours);

    return {
      title: event.title,
      subtitle: event.subtitle,
      description: event.description,
      startDateTime: start,
      endDateTime: end,
      dayLabel: event.dayLabel,
      locationName: PACK_PLACEHOLDER_VENUE,
      fullAddress: PACK_PLACEHOLDER_ADDRESS,
      dressCode: event.dressCode,
      rsvpRequired: true,
      audience: "ALL_GUESTS" as const,
      sortOrder: index,
    };
  });
}
