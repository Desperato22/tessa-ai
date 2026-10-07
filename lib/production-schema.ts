export type AssetKind = "character" | "location" | "prop";

export type ProductionAsset = {
  id: string;
  kind: AssetKind;
  name: string;
  summary: string;
  visualPrompt: string;
  continuityNotes: string;
  imageUrl?: string;
};

export type StoryboardShot = {
  id: string;
  title: string;
  progressStart: number;
  progressEnd: number;
  locationAssetId: string;
  characterAssetIds: string[];
  propAssetIds: string[];
  action: string;
  camera: string;
  lighting: string;
  dialogue: string;
  continuity: string;
};

export type ProductionPlan = {
  title: string;
  logline: string;
  genre: string;
  visualStyle: string;
  assets: ProductionAsset[];
  shots: StoryboardShot[];
};

const assetSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    kind: { type: "string", enum: ["character", "location", "prop"] },
    name: { type: "string" },
    summary: { type: "string" },
    visualPrompt: { type: "string" },
    continuityNotes: { type: "string" },
  },
  required: ["id", "kind", "name", "summary", "visualPrompt", "continuityNotes"],
} as const;

const shotSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    progressStart: { type: "number" },
    progressEnd: { type: "number" },
    locationAssetId: { type: "string" },
    characterAssetIds: { type: "array", items: { type: "string" } },
    propAssetIds: { type: "array", items: { type: "string" } },
    action: { type: "string" },
    camera: { type: "string" },
    lighting: { type: "string" },
    dialogue: { type: "string" },
    continuity: { type: "string" },
  },
  required: [
    "id",
    "title",
    "progressStart",
    "progressEnd",
    "locationAssetId",
    "characterAssetIds",
    "propAssetIds",
    "action",
    "camera",
    "lighting",
    "dialogue",
    "continuity",
  ],
} as const;

export const productionPlanSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    logline: { type: "string" },
    genre: { type: "string" },
    visualStyle: { type: "string" },
    assets: { type: "array", items: assetSchema },
    shots: { type: "array", items: shotSchema },
  },
  required: ["title", "logline", "genre", "visualStyle", "assets", "shots"],
} as const;

export const demoPlan: ProductionPlan = {
  title: "The Delayed Reflection",
  logline: "A night analyst discovers that the office surveillance feed is one second ahead of reality.",
  genre: "Tech thriller",
  visualStyle: "Restrained cinematic realism, deep teal shadows, cold monitor light, hard cuts",
  assets: [
    {
      id: "character-analyst",
      kind: "character",
      name: "The Analyst",
      summary: "A sleep-deprived government analyst in his early thirties, controlled and observant.",
      visualPrompt: "Character reference sheet, male government analyst, early 30s, dark rolled-sleeve shirt, tired eyes, restrained expression, front side and three-quarter views, neutral studio background, cinematic realism",
      continuityNotes: "Keep the same dark shirt, watch on left wrist, short black hair and faint under-eye shadows.",
    },
    {
      id: "location-analysis-office",
      kind: "location",
      name: "Night Analysis Office",
      summary: "A dark open-plan government office with one active monitor and a ceiling security camera.",
      visualPrompt: "Location reference sheet, dark government analysis office at night, single cyan monitor glow, glass partition, dormant workstations, ceiling dome camera, wide and reverse angles, cinematic realism",
      continuityNotes: "Desk faces the glass partition; dome camera stays upper-left relative to the analyst.",
    },
    {
      id: "prop-monitor",
      kind: "prop",
      name: "Surveillance Monitor",
      summary: "A plain office monitor displaying a grainy 3x3 CCTV grid and white timestamp.",
      visualPrompt: "Prop design sheet, black office monitor with grainy 3x3 CCTV interface, small advancing white timestamp, cyan cast, front and three-quarter views",
      continuityNotes: "No brand marks; timestamp remains in the lower-right corner of the feed.",
    },
  ],
  shots: [
    {
      id: "shot-01",
      title: "The scan",
      progressStart: 0,
      progressEnd: 18,
      locationAssetId: "location-analysis-office",
      characterAssetIds: ["character-analyst"],
      propAssetIds: ["prop-monitor"],
      action: "His eyes scan the CCTV grid and stop abruptly.",
      camera: "Centered close-up, hard cut to a tight monitor insert.",
      lighting: "Cold cyan monitor key; corridor rim behind him.",
      dialogue: "",
      continuity: "Monitor remains directly below his eyeline.",
    },
    {
      id: "shot-02",
      title: "The test",
      progressStart: 18,
      progressEnd: 62,
      locationAssetId: "location-analysis-office",
      characterAssetIds: ["character-analyst"],
      propAssetIds: ["prop-monitor"],
      action: "He raises his right hand while the feed mirrors the motion exactly one second early.",
      camera: "Wide through glass, then enlarged CCTV insert and slow push-in.",
      lighting: "Same cyan key with deep teal negative fill.",
      dialogue: "",
      continuity: "Right hand only; body remains seated and square to the desk.",
    },
    {
      id: "shot-03",
      title: "It sees him",
      progressStart: 62,
      progressEnd: 100,
      locationAssetId: "location-analysis-office",
      characterAssetIds: ["character-analyst"],
      propAssetIds: ["prop-monitor"],
      action: "The on-screen analyst turns toward the ceiling camera before the real analyst does.",
      camera: "CCTV insert, extreme close-up on the real eyes, final tilt toward the dome camera.",
      lighting: "Monitor flicker fades into near-black.",
      dialogue: "",
      continuity: "End on the exact camera established in the location sheet.",
    },
  ],
};
