const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildSongSearchIndex,
  parseSuggestedSongs,
  searchSongs,
} = require("../assets/js/core/archive-song-search.js");

const genres = [
  {
    id: 1,
    genre: "Southern rock",
    status: "listened",
    date_normalized: "2026-05-02",
    rating: "4",
    suggested_songs:
      "Lynyrd Skynyrd — Free Bird, Allman Brothers Band — Whipping Post, Marshall Tucker Band — Can't You See",
    songs_listened: [
      {
        title: "Free Bird",
        artist: "Lynyrd Skynyrd",
        role: "CANON",
        score: 5,
        recommendedBy: ["Andy"],
        url: "https://open.spotify.com/track/abc",
      },
      { title: "Jessica", artist: "The Allman Brothers Band", role: "LEVEL UP", isLevelUp: true, score: 4 },
    ],
    pending_songs: [{ title: "Midnight Rider", artist: "Gregg Allman" }],
    identity: {
      seminalTrack: { title: "Sweet Home Alabama", artist: "Lynyrd Skynyrd" },
      mediaTouchstones: [{ title: "Tuesday's Gone", artist: "Lynyrd Skynyrd" }],
    },
  },
  {
    id: 2,
    genre: "Crossover music",
    status: "unlistened",
    suggested_songs: "Ray Charles — Hit the Road Jack",
    songs_listened: [],
    pending_songs: [],
  },
];

test("parseSuggestedSongs keeps commas inside titles", () => {
  assert.deepEqual(
    parseSuggestedSongs(
      "John Denver — Take Me Home, Country Roads, Townes Van Zandt — Pancho and Lefty",
    ),
    [
      { artist: "John Denver", title: "Take Me Home, Country Roads" },
      { artist: "Townes Van Zandt", title: "Pancho and Lefty" },
    ],
  );
  assert.deepEqual(parseSuggestedSongs("Matchbox Twenty —3 A.M., Linkin Park — Numb"), [
    { artist: "Matchbox Twenty", title: "3 A.M." },
    { artist: "Linkin Park", title: "Numb" },
  ]);
  assert.deepEqual(parseSuggestedSongs(""), []);
});

test("index covers logged, alt take, pending, identity, and suggested songs", () => {
  const rows = buildSongSearchIndex(genres);
  const sourcesFor = (title) => rows.find((r) => r.title === title)?.sources;
  assert.deepEqual(sourcesFor("Free Bird"), ["canon", "suggested"]);
  assert.deepEqual(sourcesFor("Jessica"), ["alt"]);
  assert.deepEqual(sourcesFor("Midnight Rider"), ["pending"]);
  assert.deepEqual(sourcesFor("Sweet Home Alabama"), ["seminal"]);
  assert.deepEqual(sourcesFor("Tuesday's Gone"), ["media"]);
  assert.deepEqual(sourcesFor("Whipping Post"), ["suggested"]);
  assert.deepEqual(rows.find((r) => r.title === "Free Bird").recommendedBy, ["Andy"]);
});

test("search matches artist and title tokens in any order", () => {
  const rows = buildSongSearchIndex(genres);
  const { results } = searchSongs(rows, "allman whipping");
  assert.equal(results.length, 1);
  assert.equal(results[0].title, "Whipping Post");
  assert.equal(results[0].genreName, "Southern rock");

  const allman = searchSongs(rows, "Allman").results.map((r) => r.title);
  assert.deepEqual(allman.sort(), ["Jessica", "Midnight Rider", "Whipping Post"]);
});

test("search ranks exact title first and ignores punctuation and case", () => {
  const rows = buildSongSearchIndex(genres);
  const { results } = searchSongs(rows, "free bird");
  assert.equal(results[0].title, "Free Bird");
  assert.equal(searchSongs(rows, "TUESDAYS GONE").results[0].title, "Tuesday's Gone");
});

test("month and rating filters apply to the song's genre", () => {
  const rows = buildSongSearchIndex(genres);
  assert.equal(searchSongs(rows, "hit the road", { month: "2026-05" }).total, 0);
  assert.equal(searchSongs(rows, "free bird", { month: "2026-05", rating: "4" }).total, 1);
  assert.equal(searchSongs(rows, "free bird", { rating: "5" }).total, 0);
});

test("short queries return nothing", () => {
  const rows = buildSongSearchIndex(genres);
  assert.equal(searchSongs(rows, "a").total, 0);
});
