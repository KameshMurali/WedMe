import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { sectionLabels, sectionOrder } from "@/lib/constants";
import { env } from "@/lib/env";
import { templateRegistry } from "@/lib/template-registry";
import { extractYoutubeId, getYoutubeThumbnail } from "@/lib/youtube";
import { hashPassword } from "@/server/auth/password";
import { weddingSiteInclude } from "@/server/repositories/wedding-site";
import { buildPublishSnapshot } from "@/server/services/site-snapshot";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
});

async function main() {
  await prisma.analyticsEvent.deleteMany();
  await prisma.guestMessage.deleteMany();
  await prisma.guestUpload.deleteMany();
  await prisma.rSVPEventSelection.deleteMany();
  await prisma.rSVPResponse.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.inviteGroup.deleteMany();
  await prisma.embeddedVideo.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.dressCodeGuide.deleteMany();
  await prisma.travelGuideItem.deleteMany();
  await prisma.faqItem.deleteMany();
  await prisma.tidbit.deleteMany();
  await prisma.scheduleItem.deleteMany();
  await prisma.event.deleteMany();
  await prisma.storyMilestone.deleteMany();
  await prisma.sectionConfig.deleteMany();
  await prisma.publishSettings.deleteMany();
  await prisma.siteTheme.deleteMany();
  await prisma.weddingSite.deleteMany();
  await prisma.couple.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.templatePreset.deleteMany();
  await prisma.user.deleteMany();

  for (const template of templateRegistry) {
    await prisma.templatePreset.create({
      data: {
        key: template.key,
        name: template.name,
        description: template.description,
        mood: template.mood,
        previewGradient: template.previewGradient,
        supportedSections: template.supportedSections,
        themeDefaults: template.themeDefaults,
      },
    });
  }

  const templatePreset = await prisma.templatePreset.findUniqueOrThrow({
    where: { key: "classic-elegant" },
  });

  const passwordHash = await hashPassword("KamMon2027!");

  const user = await prisma.user.create({
    data: {
      email: "kammon@example.com",
      passwordHash,
      emailVerifiedAt: new Date(),
    },
  });

  const couple = await prisma.couple.create({
    data: {
      primaryUserId: user.id,
      partnerOneName: "Kamesh",
      partnerTwoName: "Monisha",
      brandName: "KamMonBeginnings",
      storyBlurb: "From quiet beginnings to a joyful celebration across family, music, and rituals.",
      weddingDate: new Date("2027-02-14T09:30:00.000Z"),
    },
  });

  const site = await prisma.weddingSite.create({
    data: {
      coupleId: couple.id,
      templatePresetId: templatePreset.id,
      slug: "kammonbeginnings",
      brandName: "KamMonBeginnings",
      headline: "Kamesh weds Monisha",
      subtitle:
        "Join us for a joyful wedding weekend filled with music, tradition, warmth, and the people we love most.",
      tagline: "A celebration of love, family, and new beginnings",
      weddingDate: new Date("2027-02-14T09:30:00.000Z"),
      heroImageUrl:
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=80",
      locationSummary: "Dubai, United Arab Emirates",
      seoTitle: "KamMonBeginnings | Kamesh & Monisha Wedding",
      seoDescription:
        "Celebrate Kamesh and Monisha’s wedding journey with event details, RSVP, gallery, memories, and guest guidance.",
      ogImageUrl:
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
      canonicalUrl: "https://www.ToNewBeginning.com/kammonbeginnings",
      theme: {
        create: {
          paletteKey: "champagne",
          headingFontKey: "display",
          bodyFontKey: "body",
          primaryColor: "#6e4f35",
          accentColor: "#b88c4a",
          backgroundColor: "#fdf8f3",
          surfaceColor: "#fffaf6",
          textColor: "#1f1115",
          mutedColor: "#5d4346",
          borderRadius: "2rem",
          buttonVariant: "solid",
          shadowStyle: "glow",
        },
      },
      publishSettings: {
        create: {
          status: "DRAFT",
          visibility: "PUBLIC",
          isRsvpOpen: true,
          isUploadsOpen: true,
          isMessagesOpen: true,
          lastDraftSavedAt: new Date(),
        },
      },
      sectionConfigs: {
        create: sectionOrder.map((type, index) => ({
          type,
          label: sectionLabels[type],
          position: index,
          enabled: true,
        })),
      },
    },
  });

  await prisma.storyMilestone.createMany({
    data: [
      {
        weddingSiteId: site.id,
        title: "How we met",
        shortLabel: "First hello",
        eventDateLabel: "2019",
        description:
          "What started as a thoughtful conversation quickly became our favourite part of every week. We found ease, humour, and home in each other.",
        imageUrl:
          "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 0,
      },
      {
        weddingSiteId: site.id,
        title: "Our first trip",
        shortLabel: "Adventure",
        eventDateLabel: "2021",
        description:
          "A spontaneous getaway turned into one of our favourite memories, full of long walks, coffee stops, and the feeling that this was becoming something real.",
        imageUrl:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 1,
      },
      {
        weddingSiteId: site.id,
        title: "The proposal",
        shortLabel: "The yes",
        eventDateLabel: "2025",
        description:
          "With family close in spirit and a setting that felt deeply us, one question turned into the easiest yes of our lives.",
        imageUrl:
          "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 2,
      },
      {
        weddingSiteId: site.id,
        title: "Engagement season",
        shortLabel: "Celebrating",
        eventDateLabel: "2026",
        description:
          "From intimate dinners to joyful gatherings, this season reminded us how held and loved we are by the people around us.",
        imageUrl:
          "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 3,
      },
      {
        weddingSiteId: site.id,
        title: "The wedding journey",
        shortLabel: "Forever begins",
        eventDateLabel: "2027",
        description:
          "We’re now counting down to a weekend of colour, family, music, and vows. Thank you for being part of this beginning.",
        imageUrl:
          "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 4,
      },
    ],
  });

  const eventDefinitions = [
    {
      title: "Mehendi",
      subtitle: "Henna, laughter, and an intimate evening",
      description:
        "An elegant opening celebration with live music, henna artists, and warm family energy to begin the wedding weekend.",
      startDateTime: new Date("2027-02-12T15:30:00.000Z"),
      endDateTime: new Date("2027-02-12T19:00:00.000Z"),
      dayLabel: "Friday",
      locationName: "Palm Garden Terrace",
      fullAddress: "Palm Garden Terrace, Jumeirah Beach Road, Dubai",
      googleMapsUrl: "https://maps.google.com/?q=Palm+Garden+Terrace+Dubai",
      dressCode: "Pastel festive wear",
      notes: "Traditional wear encouraged. Comfortable sandals recommended for lawn areas.",
      imageUrl:
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
      audience: "ALL_GUESTS" as const,
      contactName: "Asha",
      contactPhone: "+971 50 000 1111",
    },
    {
      title: "Haldi",
      subtitle: "Sunshine, turmeric, and close family moments",
      description:
        "A vibrant morning ceremony filled with colour, laughter, and heartfelt blessings shared in a close family setting.",
      startDateTime: new Date("2027-02-13T07:30:00.000Z"),
      endDateTime: new Date("2027-02-13T10:00:00.000Z"),
      dayLabel: "Saturday",
      locationName: "Azure Courtyard",
      fullAddress: "Azure Courtyard, Downtown Dubai",
      googleMapsUrl: "https://maps.google.com/?q=Azure+Courtyard+Dubai",
      dressCode: "Yellow, ivory, or floral festive wear",
      notes: "Bring a change of footwear if you plan to join the playful haldi moments.",
      imageUrl:
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
      audience: "FAMILY_ONLY" as const,
      contactName: "Ritika",
      contactPhone: "+971 50 000 2222",
    },
    {
      title: "Sangeet",
      subtitle: "Performances, dinner, and dance floor energy",
      description:
        "An evening of performances, speeches, and a joyful dance floor that stretches late into the night.",
      startDateTime: new Date("2027-02-13T17:30:00.000Z"),
      endDateTime: new Date("2027-02-13T22:30:00.000Z"),
      dayLabel: "Saturday",
      locationName: "The Grand Ballroom",
      fullAddress: "The Grand Ballroom, Business Bay, Dubai",
      googleMapsUrl: "https://maps.google.com/?q=The+Grand+Ballroom+Dubai",
      dressCode: "Jewel tones and evening glam",
      notes: "Guest performances begin at 7 PM sharp.",
      imageUrl:
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
      audience: "ALL_GUESTS" as const,
      contactName: "Nivetha",
      contactPhone: "+971 50 000 3333",
    },
    {
      title: "Wedding Ceremony",
      subtitle: "Sacred rituals and vows",
      description:
        "A morning ceremony rooted in tradition, followed by blessings, family portraits, and a celebratory lunch.",
      startDateTime: new Date("2027-02-14T09:30:00.000Z"),
      endDateTime: new Date("2027-02-14T13:30:00.000Z"),
      dayLabel: "Sunday",
      locationName: "Lotus Pavilion",
      fullAddress: "Lotus Pavilion, Al Barari, Dubai",
      googleMapsUrl: "https://maps.google.com/?q=Lotus+Pavilion+Dubai",
      dressCode: "Traditional wedding attire",
      notes: "Please be seated by 9:10 AM. Ceremony photography is permitted only from designated areas.",
      imageUrl:
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
      audience: "ALL_GUESTS" as const,
      contactName: "Karthik",
      contactPhone: "+971 50 000 4444",
    },
    {
      title: "Reception",
      subtitle: "Dinner, speeches, and a final celebration",
      description:
        "The closing celebration of the weekend, with dinner, speeches, and a relaxed evening to dance and celebrate together.",
      startDateTime: new Date("2027-02-14T18:30:00.000Z"),
      endDateTime: new Date("2027-02-14T23:00:00.000Z"),
      dayLabel: "Sunday",
      locationName: "Skyline Ballroom",
      fullAddress: "Skyline Ballroom, Dubai Marina",
      googleMapsUrl: "https://maps.google.com/?q=Skyline+Ballroom+Dubai",
      dressCode: "Black tie optional",
      notes: "Dinner seating opens at 7 PM. Valet service is available on arrival.",
      imageUrl:
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80",
      audience: "ALL_GUESTS" as const,
      contactName: "Asha",
      contactPhone: "+971 50 000 1111",
    },
  ];

  const createdEvents = [];
  for (const [index, event] of eventDefinitions.entries()) {
    createdEvents.push(
      await prisma.event.create({
        data: {
          weddingSiteId: site.id,
          ...event,
          rsvpRequired: true,
          sortOrder: index,
        },
      }),
    );
  }

  await prisma.scheduleItem.createMany({
    data: [
      {
        weddingSiteId: site.id,
        eventId: createdEvents[0].id,
        title: "Henna artists and welcome refreshments",
        category: "Arrival",
        description: "Light bites, welcome drinks, and time to settle in before the celebrations begin.",
        startDateTime: new Date("2027-02-12T15:30:00.000Z"),
        endDateTime: new Date("2027-02-12T16:30:00.000Z"),
        dayLabel: "Friday",
        locationName: "Palm Garden Terrace",
        sortOrder: 0,
      },
      {
        weddingSiteId: site.id,
        eventId: createdEvents[0].id,
        title: "Mehendi seating and live acoustic set",
        category: "Main event",
        description: "A relaxed flow of henna moments, family mingling, and live music through sunset.",
        startDateTime: new Date("2027-02-12T16:30:00.000Z"),
        endDateTime: new Date("2027-02-12T19:00:00.000Z"),
        dayLabel: "Friday",
        locationName: "Palm Garden Terrace",
        sortOrder: 1,
      },
      {
        weddingSiteId: site.id,
        eventId: createdEvents[1].id,
        title: "Haldi ritual",
        category: "Ceremony",
        description: "Immediate family and closest friends gather for blessings and haldi rituals.",
        startDateTime: new Date("2027-02-13T07:30:00.000Z"),
        endDateTime: new Date("2027-02-13T09:00:00.000Z"),
        dayLabel: "Saturday",
        locationName: "Azure Courtyard",
        sortOrder: 2,
      },
      {
        weddingSiteId: site.id,
        eventId: createdEvents[2].id,
        title: "Sangeet performances",
        category: "Performances",
        description: "Family and friends take the stage for choreographed performances and speeches.",
        startDateTime: new Date("2027-02-13T19:00:00.000Z"),
        endDateTime: new Date("2027-02-13T21:00:00.000Z"),
        dayLabel: "Saturday",
        locationName: "The Grand Ballroom",
        sortOrder: 3,
      },
      {
        weddingSiteId: site.id,
        eventId: createdEvents[3].id,
        title: "Wedding ceremony",
        category: "Main ceremony",
        description: "Guests are requested to arrive early for seating before the ceremony begins.",
        startDateTime: new Date("2027-02-14T09:30:00.000Z"),
        endDateTime: new Date("2027-02-14T11:30:00.000Z"),
        dayLabel: "Sunday",
        locationName: "Lotus Pavilion",
        sortOrder: 4,
      },
      {
        weddingSiteId: site.id,
        eventId: createdEvents[4].id,
        title: "Reception dinner and dancing",
        category: "Reception",
        description: "Dinner service, speeches, and an evening dance celebration.",
        startDateTime: new Date("2027-02-14T19:00:00.000Z"),
        endDateTime: new Date("2027-02-14T23:00:00.000Z"),
        dayLabel: "Sunday",
        locationName: "Skyline Ballroom",
        sortOrder: 5,
      },
    ],
  });

  await prisma.tidbit.createMany({
    data: [
      {
        weddingSiteId: site.id,
        title: "Before you come",
        body: "Dubai evenings can cool down quickly in February, so bring a light shawl or blazer for outdoor segments.",
        category: "Things to know",
        sortOrder: 0,
      },
      {
        weddingSiteId: site.id,
        title: "Couple favourites",
        body: "Coffee before anything, sunset walks, and a strong preference for dance floors that stay open late.",
        category: "Fun facts",
        sortOrder: 1,
      },
      {
        weddingSiteId: site.id,
        title: "Traditions explained",
        body: "We’ll include a few ceremony notes throughout the weekend so friends from different cultures can enjoy every ritual with context.",
        category: "Traditions explained",
        sortOrder: 2,
      },
    ],
  });

  await prisma.faqItem.createMany({
    data: [
      {
        weddingSiteId: site.id,
        question: "Can I attend only selected events?",
        answer: "Yes. Please RSVP only for the celebrations listed on your invitation or confirmed by your invite code.",
        category: "RSVP",
        sortOrder: 0,
      },
      {
        weddingSiteId: site.id,
        question: "Will there be parking at the venues?",
        answer: "Yes, each venue includes valet or guided parking. Detailed notes are listed in the guest experience section.",
        category: "Travel",
        sortOrder: 1,
      },
      {
        weddingSiteId: site.id,
        question: "Can I share photos after the wedding?",
        answer: "Absolutely. The guest memories page will stay open after the event weekend for uploads and video links.",
        category: "Memories",
        sortOrder: 2,
      },
    ],
  });

  await prisma.travelGuideItem.createMany({
    data: [
      {
        weddingSiteId: site.id,
        category: "AIRPORT",
        title: "Fly into DXB",
        description: "Dubai International Airport is the closest option. Most venues are 20 to 35 minutes away by car.",
        sortOrder: 0,
      },
      {
        weddingSiteId: site.id,
        category: "TRANSPORT",
        title: "Ride-share friendly weekend",
        description: "Uber and Careem are both reliable for venue transfers. We’ll also share family shuttle timings closer to the date.",
        sortOrder: 1,
      },
      {
        weddingSiteId: site.id,
        category: "HOTELS",
        title: "Nearby stays",
        description: "Recommended hotels include Address Downtown, Vida Creek Harbour, and Grosvenor House for convenience and comfort.",
        sortOrder: 2,
      },
      {
        weddingSiteId: site.id,
        category: "PARKING",
        title: "Valet and self-parking",
        description: "Reception and sangeet venues offer valet. Ceremony venue includes guided self-parking with attendants.",
        sortOrder: 3,
      },
      {
        weddingSiteId: site.id,
        category: "RECOMMENDATIONS",
        title: "A few local favourites",
        description: "If you’re extending your trip, we recommend an early morning old Dubai walk and a sunset dinner by the marina.",
        sortOrder: 4,
      },
      {
        weddingSiteId: site.id,
        category: "EMERGENCY",
        title: "Weekend emergency contact",
        description: "For urgent wedding-weekend questions, contact Asha at +971 50 000 1111.",
        sortOrder: 5,
      },
    ],
  });

  await prisma.dressCodeGuide.createMany({
    data: [
      {
        weddingSiteId: site.id,
        eventId: createdEvents[0].id,
        title: "Mehendi palette",
        guidance: "Pastels, florals, and easy festive silhouettes that move well for an outdoor evening.",
        palette: ["#E9C7B8", "#C8D9C0", "#F6E3B4"],
        inspirationImage:
          "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 0,
      },
      {
        weddingSiteId: site.id,
        eventId: createdEvents[3].id,
        title: "Ceremony styling",
        guidance: "Traditional wear is warmly encouraged. Rich silks, elegant jewellery, and classic palettes will fit beautifully.",
        palette: ["#8C2F39", "#E6C58A", "#F5EFE6"],
        inspirationImage:
          "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 1,
      },
      {
        weddingSiteId: site.id,
        eventId: createdEvents[4].id,
        title: "Reception elegance",
        guidance: "Black tie optional. Think tailored eveningwear, statement jewellery, and refined formal looks.",
        palette: ["#111827", "#D4AF37", "#F9FAFB"],
        inspirationImage:
          "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 2,
      },
    ],
  });

  await prisma.mediaAsset.createMany({
    data: [
      {
        weddingSiteId: site.id,
        category: "HERO",
        title: "Hero portrait",
        altText: "Kamesh and Monisha smiling together",
        caption: "The beginning of KamMonBeginnings",
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
        sortOrder: 0,
      },
      {
        weddingSiteId: site.id,
        category: "GALLERY",
        title: "Pre-wedding portrait",
        altText: "Couple portrait by the water",
        caption: "Quiet moments before the celebrations begin.",
        url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 1,
      },
      {
        weddingSiteId: site.id,
        category: "GALLERY",
        title: "Celebration detail",
        altText: "Wedding celebration details",
        caption: "Details that feel like us.",
        url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 2,
      },
      {
        weddingSiteId: site.id,
        category: "GALLERY",
        title: "Proposal memory",
        altText: "Proposal memory photo",
        caption: "The yes that changed everything.",
        url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 3,
      },
      {
        weddingSiteId: site.id,
        category: "GALLERY",
        title: "Editorial portrait",
        altText: "Elegant editorial couple portrait",
        caption: "A frame from our favourite season of life.",
        url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 4,
      },
      {
        weddingSiteId: site.id,
        category: "GALLERY",
        title: "Weekend teaser",
        altText: "Celebration teaser image",
        caption: "See you on the dance floor.",
        url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80",
        sortOrder: 5,
      },
    ],
  });

  const videos = [
    {
      title: "KamMonBeginnings invitation teaser",
      typeLabel: "Invitation teaser",
      youtubeUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    },
    {
      title: "Our pre-wedding film",
      typeLabel: "Pre-wedding film",
      youtubeUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    },
  ];

  await prisma.embeddedVideo.createMany({
    data: videos.map((video, index) => {
      const youtubeId = extractYoutubeId(video.youtubeUrl)!;
      return {
        weddingSiteId: site.id,
        title: video.title,
        typeLabel: video.typeLabel,
        youtubeUrl: video.youtubeUrl,
        youtubeId,
        thumbnailUrl: getYoutubeThumbnail(youtubeId),
        sortOrder: index,
      };
    }),
  });

  const familyInvite = await prisma.inviteGroup.create({
    data: {
      weddingSiteId: site.id,
      name: "Murali Family",
      code: "MURALI2027",
      directLinkToken: "murali-family-kammon",
      maxAttendees: 4,
      plusOneAllowed: true,
      responseDeadline: new Date("2027-01-20T00:00:00.000Z"),
      guests: {
        createMany: {
          data: [
            { fullName: "Kamesh Murali", email: "kamesh@example.com", phone: "+971500000001", tags: ["family"] },
            { fullName: "Anita Murali", email: "anita@example.com", phone: "+971500000002", tags: ["family"] },
          ],
        },
      },
    },
  });

  const friendsInvite = await prisma.inviteGroup.create({
    data: {
      weddingSiteId: site.id,
      name: "Monisha Friends",
      code: "MONIFAM",
      directLinkToken: "monisha-friends-kammon",
      maxAttendees: 2,
      plusOneAllowed: false,
      responseDeadline: new Date("2027-01-20T00:00:00.000Z"),
      guests: {
        createMany: {
          data: [{ fullName: "Priya Nair", email: "priya@example.com", phone: "+971500000003", tags: ["friends"] }],
        },
      },
    },
  });

  const rsvpOne = await prisma.rSVPResponse.create({
    data: {
      weddingSiteId: site.id,
      inviteGroupId: familyInvite.id,
      guestName: "Kamesh Murali",
      guestEmail: "kamesh@example.com",
      inviteCode: "MURALI2027",
      status: "ATTENDING",
      attendeeCount: 3,
      mealPreference: "Vegetarian",
      accommodationNeeds: "Need nearby hotel suggestions",
      noteToCouple: "Can’t wait to celebrate with you both.",
      confirmedAt: new Date("2027-01-10T12:00:00.000Z"),
    },
  });

  await prisma.rSVPEventSelection.createMany({
    data: [createdEvents[0], createdEvents[2], createdEvents[3], createdEvents[4]].map((event) => ({
      responseId: rsvpOne.id,
      eventId: event.id,
      status: "ATTENDING",
    })),
  });

  const rsvpTwo = await prisma.rSVPResponse.create({
    data: {
      weddingSiteId: site.id,
      inviteGroupId: friendsInvite.id,
      guestName: "Priya Nair",
      guestEmail: "priya@example.com",
      inviteCode: "MONIFAM",
      status: "MAYBE",
      attendeeCount: 1,
      travelNotes: "Waiting to confirm travel from Singapore.",
      confirmedAt: new Date("2027-01-12T09:00:00.000Z"),
    },
  });

  await prisma.rSVPEventSelection.createMany({
    data: [createdEvents[2], createdEvents[3], createdEvents[4]].map((event) => ({
      responseId: rsvpTwo.id,
      eventId: event.id,
      status: "MAYBE",
    })),
  });

  await prisma.guestUpload.createMany({
    data: [
      {
        weddingSiteId: site.id,
        eventId: createdEvents[2].id,
        type: "IMAGE",
        submitterName: "Priya Nair",
        caption: "Dance floor rehearsal joy",
        message: "Already obsessed with the sangeet energy.",
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        status: "APPROVED",
        createdAt: new Date("2027-02-15T10:00:00.000Z"),
      },
      {
        weddingSiteId: site.id,
        eventId: createdEvents[4].id,
        type: "LINK",
        submitterName: "Anita Murali",
        caption: "Reception speech clip",
        externalUrl: "https://example.com/reception-clip",
        status: "PENDING",
        createdAt: new Date("2027-02-15T11:00:00.000Z"),
      },
    ],
  });

  await prisma.guestMessage.createMany({
    data: [
      {
        weddingSiteId: site.id,
        authorName: "Priya Nair",
        message: "Wishing you both a marriage full of laughter, patience, and many more adventures together.",
        feedback: "The schedule page was super helpful.",
        visibility: "PUBLIC",
        status: "APPROVED",
      },
      {
        weddingSiteId: site.id,
        authorName: "Anita Murali",
        message: "So happy for you both. Please keep this private until after the weekend.",
        visibility: "PRIVATE",
        status: "PENDING",
      },
    ],
  });

  await prisma.analyticsEvent.createMany({
    data: Array.from({ length: 24 }).map((_, index) => ({
      weddingSiteId: site.id,
      type: "PAGE_VIEW",
      path: index % 2 === 0 ? "/kammonbeginnings" : "/kammonbeginnings/rsvp",
      occurredAt: new Date(Date.now() - index * 1000 * 60 * 60),
    })),
  });

  const fullSite = await prisma.weddingSite.findUniqueOrThrow({
    where: { id: site.id },
    include: weddingSiteInclude,
  });

  const snapshot = buildPublishSnapshot(fullSite);

  await prisma.publishSettings.update({
    where: { weddingSiteId: site.id },
    data: {
      status: "PUBLISHED",
      visibility: "PUBLIC",
      publishedSnapshot: snapshot,
      publishedAt: new Date(),
      lastDraftSavedAt: new Date(),
    },
  });

  console.info("Seeded KamMonBeginnings demo.");
  console.info("Login: kammon@example.com / KamMon2027!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
