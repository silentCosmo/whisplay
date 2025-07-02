// Precompiled tag matchers
/* const tagSets = [
  {
    tags: ["chill", "focus", "night"],
    match: new RegExp(
      "\\b(lofi|chill|relax|ambient|study|focus|downtempo|dreamy|mellow|background|vibes|smoke|zone|cloudy|float|lo-fi|meditate|hazy|zen|rain|cozy|soothe)\\b",
      "i"
    ),
  },
  {
    tags: ["party", "dance", "energetic"],
    match: new RegExp(
      "\\b(edm|club|dance|remix|beat|trance|festival|trap|party|dj|electro|house|techno|bounce|drop|dubstep|rave|bass|twerk|clubmix|booty|banger|pump)\\b",
      "i"
    ),
  },
  {
    tags: ["sad", "emotional", "moody"],
    match: new RegExp(
      "\\b(sad|sadness|cry|melancholy|emotional|lonely|broken|hurt|heart|alone|tears|sorrow|blue|depress|pain|aching|grief|goodbye|loss|empty|rainy)\\b",
      "i"
    ),
  },
  {
    tags: ["romantic", "love", "intimate"],
    match: new RegExp(
      "\\b(romantic|love|kiss|darling|sweetheart|honeymoon|affection|desire|tender|crush|lover|heartfelt|passion|valentine|slow dance|chemistry|date night|flirt|sensual)\\b",
      "i"
    ),
  },
  {
    tags: ["sleep", "calm", "soft"],
    match: new RegExp(
      "\\b(soft|sleep|soothing|slow|peace|calm|harmony|drift|quiet|lullaby|serene|breeze|light|tranquil|pillow|ambient|gentle|nap|zen)\\b",
      "i"
    ),
  },
  {
    tags: ["instrumental", "classical", "piano"],
    match: new RegExp(
      "\\b(instrumental|orchestra|piano|violin|cello|symphony|no lyrics|flute|concerto|harp|strings|score|solo piano|classical|chamber|sonata)\\b",
      "i"
    ),
  },
  {
    tags: ["rock", "guitar", "band"],
    match: new RegExp(
      "\\b(rock|guitar|band|metal|punk|drums|solo|alt rock|garage|grunge|indie rock|riff|heavy|mosh|emo|hardcore|thrash|headbang|live set)\\b",
      "i"
    ),
  },
  {
    tags: ["retro", "80s", "vintage"],
    match: new RegExp(
      "\\b(80s|synth|retro|vintage|nostalgia|cassette|boombox|disco|funk|classic pop|mixtape|roller|neon|analog|vcr|walkman|grainy|throwback|oldschool)\\b",
      "i"
    ),
  },
  {
    tags: ["indie", "folk", "acoustic"],
    match: new RegExp(
      "\\b(indie|folk|acoustic|singer-songwriter|campfire|raw|organic|strum|coffeehouse|bedroom pop|banjo|lo-fi acoustic|guitar solo|honest|earthy|rustic|stripped)\\b",
      "i"
    ),
  },
  {
    tags: ["motivational", "uplifting", "workout"],
    match: new RegExp(
      "\\b(motivation|power|hustle|run|lift|workout|grind|anthem|focus|beast mode|go hard|champion|goal|rise|push|no limits|training|energy boost|fight)\\b",
      "i"
    ),
  },
]; */

const tagSets = [
  {
    tags: ["chill", "focus", "night"],
    match: /lofi|chill|relax|ambient|study|focus|downtempo|dreamy|mellow|background|vibes|smoke|zone|cloudy|float|lo-fi|meditate|hazy|zen|rain|cozy|soothe/i,
  },
  {
    tags: ["party", "dance", "energetic"],
    match: /edm|club|dance|remix|beat|trance|festival|trap|party|dj|electro|house|techno|bounce|drop|dubstep|rave|bass|twerk|clubmix|booty|banger|pump/i,
  },
  {
    tags: ["sad", "emotional", "moody"],
    match: /sad|sadness|cry|melancholy|emotional|lonely|broken|hurt|heart|alone|tears|sorrow|blue|depress|pain|aching|grief|goodbye|loss|empty|rainy/i,
  },
  {
    tags: ["romantic", "love", "intimate"],
    match: /romantic|love|kiss|darling|sweetheart|honeymoon|affection|desire|tender|crush|lover|heartfelt|passion|valentine|slow dance|chemistry|date night|flirt|sensual/i,
  },
  {
    tags: ["sleep", "calm", "soft"],
    match: /soft|sleep|soothing|slow|peace|calm|harmony|drift|quiet|lullaby|serene|breeze|light|tranquil|pillow|ambient|gentle|nap|zen/i,
  },
  {
    tags: ["instrumental", "classical", "piano"],
    match: /instrumental|orchestra|piano|violin|cello|symphony|no lyrics|flute|concerto|harp|strings|score|solo piano|classical|chamber|sonata/i,
  },
  {
    tags: ["rock", "guitar", "band"],
    match: /rock|guitar|band|metal|punk|drums|solo|alt rock|garage|grunge|indie rock|riff|heavy|mosh|emo|hardcore|thrash|headbang|live set/i,
  },
  {
    tags: ["retro", "80s", "vintage"],
    match: /80s|synth|retro|vintage|nostalgia|cassette|boombox|disco|funk|classic pop|mixtape|roller|neon|analog|vcr|walkman|grainy|throwback|oldschool/i,
  },
  {
    tags: ["indie", "folk", "acoustic"],
    match: /indie|folk|acoustic|singer-songwriter|campfire|raw|organic|strum|coffeehouse|bedroom pop|banjo|lo-fi acoustic|guitar solo|honest|earthy|rustic|stripped/i,
  },
  {
    tags: ["motivational", "uplifting", "workout"],
    match: /motivation|power|hustle|run|lift|workout|grind|anthem|focus|beast mode|go hard|champion|goal|rise|push|no limits|training|energy boost|fight/i,
  },
];

export function autoTags(song) {
  const lower = (s) => (s || "").toLowerCase();

  const text = [
    song.title,
    song.artist,
    song.album,
    song.genre,
    song.year,
    song.lyrics_snippet,
    song.qualityText,
    song.coverFilename,
  ]
    .map(lower)
    .join(" ");

  const tags = new Set();

  for (const { tags: groupTags, match } of tagSets) {
    if (match.test(text)) {
      groupTags.forEach((tag) => tags.add(tag));
    }
  }

  // BPM-based classification
  const bpm = song.bpm;
  if (typeof bpm === "number" && bpm > 0) {
    if (bpm < 60) tags.add("sleep");
    else if (bpm < 90) tags.add("lofi");
    else if (bpm < 120) tags.add("groove");
    else if (bpm < 140) tags.add("pop");
    else if (bpm <= 180) tags.add("workout");
    else tags.add("hardcore");
  }

  // Add era tag based on year
  if (song.year && tags.size > 0) {
    const y = parseInt(song.year);
    if (y >= 2020) tags.add("fresh");
    else if (y >= 2010) tags.add("2010s");
    else if (y >= 2000) tags.add("2000s");
    else if (y >= 1990) tags.add("90s");
    else if (y >= 1980) tags.add("80s");
    else if (y > 1900) tags.add("classic");
  }

  // No "misc" if any tag exists
  if (tags.size === 0) tags.add("explore");

  return [...tags];
}
