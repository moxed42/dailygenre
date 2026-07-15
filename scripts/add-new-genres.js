const fs = require("fs");
const path = require("path");

const filePath = path.join(process.cwd(), "genres_data.json");

const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

if (!Array.isArray(data)) {
  throw new Error("genres_data.json must be a top-level JSON array.");
}

const nestedIndex = data.findIndex((item) => Array.isArray(item));
if (nestedIndex !== -1) {
  throw new Error(
    `genres_data.json contains a nested array at top-level index ${nestedIndex}. Flatten/fix that before appending.`
  );
}

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const existingNames = new Set(data.map((g) => normalize(g.genre)));
const maxId = Math.max(...data.map((g) => Number(g.id)).filter(Number.isFinite));

const today = "";

const makeGenre = ({
  id,
  genre,
  subcategory,
  subsubcategory = "",
  subsubsubcategory = "",
  category_path,
  summary,
  key_artists,
  suggested_songs,
  vibe,
}) => ({
  id,
  genre,
  subcategory,
  subsubcategory,
  subsubsubcategory,
  category_path,
  status: "unlistened",
  date_raw: "",
  date_normalized: "",
  parse_notes: "",
  rating: "",
  favorite_song: "",
  favorite_song_url: "",
  monthly_contender: false,
  notes: "",
  summary,
  key_artists,
  suggested_songs,
  vibe,
  songs_listened: [],
  rank_order: null,
  pending_songs: [],
});

const additions = [
  makeGenre({
    id: maxId + 1,
    genre: "Tropical pop",
    subcategory: "Pop",
    category_path: "Pop",
    summary:
      "Tropical pop is a breezy pop style built around island-coded rhythms, warm synths, light percussion, and relaxed melodic hooks. It borrows from dancehall, reggae, soca, calypso, and tropical house without usually committing fully to any one of those traditions, turning them into a smooth mainstream pop atmosphere associated with summer, beaches, and easy motion.",
    key_artists:
      "Justin Bieber, Kygo, Major Lazer, OMI, Luis Fonsi, Jason Derulo (major mainstream examples)",
    suggested_songs:
      "OMI — Cheerleader (Felix Jaehn Remix), Justin Bieber — Sorry, Major Lazer — Lean On, Kygo — Firestone",
    vibe: "Pop music wearing sunglasses and pretending it has nowhere to be.",
  }),
  makeGenre({
    id: maxId + 2,
    genre: "Narrative folk",
    subcategory: "Folk",
    category_path: "Folk",
    summary:
      "Narrative folk centers storytelling above all else — songs built around characters, events, moral lessons, historical memory, or personal testimony. It overlaps with ballad traditions, protest folk, talking blues, and singer-songwriter music, but its defining feature is the sense that the song exists to carry a story from one person to another.",
    key_artists:
      "Woody Guthrie, Bob Dylan, Joan Baez, Gordon Lightfoot, Stan Rogers, Tom Paxton, Richard Thompson",
    suggested_songs:
      "Gordon Lightfoot — The Wreck of the Edmund Fitzgerald, Bob Dylan — The Lonesome Death of Hattie Carroll, Stan Rogers — Barrett's Privateers, Woody Guthrie — Tom Joad",
    vibe: "A story that chose a melody so people would remember it.",
  }),
  makeGenre({
    id: maxId + 3,
    genre: "Bawdy vocal music",
    subcategory: "Vocal",
    category_path: "Vocal",
    summary:
      "Bawdy vocal music is comic, risqué, and often openly sexual song tradition built around innuendo, double entendre, drinking culture, and social transgression. It appears across folk songs, music hall, cabaret, blues, sea songs, rugby songs, and novelty records, usually relying on vocal delivery and audience recognition as much as melody.",
    key_artists:
      "Lucille Bogan, Bo Carter, Oscar Brand, Rusty Warren, Sophie Tucker, traditional pub and music hall singers",
    suggested_songs:
      "Lucille Bogan — Shave 'Em Dry, Bo Carter — Banana in Your Fruit Basket, Oscar Brand — The Chandler's Wife, Rusty Warren — Knockers Up",
    vibe: "A dirty joke that survived because everyone could sing along.",
  }),
  makeGenre({
    id: maxId + 4,
    genre: "Novelty folk",
    subcategory: "Folk",
    category_path: "Folk",
    summary:
      "Novelty folk uses folk instrumentation, acoustic storytelling, or traditional-song structures for comic, absurd, satirical, or deliberately odd material. It overlaps with comedy music, novelty records, filk, talking blues, and outsider folk, but keeps enough folk DNA — strummed chords, singalong structure, topical lyrics, or oral-tradition feel — to remain connected to folk rather than pure comedy.",
    key_artists:
      "Tom Lehrer, The Smothers Brothers, Loudon Wainwright III, Shel Silverstein, Christine Lavin, The Chad Mitchell Trio",
    suggested_songs:
      "Tom Lehrer — The Elements, The Smothers Brothers — Chocolate, Loudon Wainwright III — Dead Skunk, Shel Silverstein — The Unicorn",
    vibe: "Folk music with a punchline and a straight face.",
  }),
];

const actuallyAdded = [];

for (const genre of additions) {
  const key = normalize(genre.genre);
  if (existingNames.has(key)) {
    console.log(`Skipping duplicate genre: ${genre.genre}`);
    continue;
  }
  data.push(genre);
  existingNames.add(key);
  actuallyAdded.push(genre.genre);
}

data.sort((a, b) => Number(a.id) - Number(b.id));

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");

console.log(`Added ${actuallyAdded.length} genres:`);
for (const name of actuallyAdded) console.log(`- ${name}`);
console.log(`New max id: ${Math.max(...data.map((g) => Number(g.id)).filter(Number.isFinite))}`);
console.log(`Total rows: ${data.length}`);
