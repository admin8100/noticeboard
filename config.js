// =============================================================
//  NOTICEBOARD SETTINGS - the only file you normally need to edit
// =============================================================
window.SIGNAGE_CONFIG = {

  // ---- Layout ------------------------------------------------
  // "side-by-side" = left/right halves (TV mounted landscape)
  // "stacked"      = top/bottom halves (TV mounted portrait)
  layout: "side-by-side",

  // Which half shows announcements: "first" (left / top) or "second"
  announcementsPosition: "first",

  // How much of the screen the announcements get, in percent (50 = half)
  announcementsSize: 50,

  // Thin line between the two halves (set to 0 for none)
  dividerPixels: 6,
  dividerColour: "#ffffff",

  // Background colour behind each half
  announcementsBackground: "#1b1b1b",
  adsBackground: "#000000",

  // ---- Timing ------------------------------------------------
  // Seconds each PDF page / image stays on screen
  announcementSeconds: 12,
  adSeconds: 8,

  // Videos play to the end, but are cut off after this many seconds
  maxVideoSeconds: 90,

  // Play video sound? (Most TVs block sound until someone presses
  // a button, so leave this false for a shop window.)
  videoSound: false,

  // How often to check for new / removed files (minutes)
  checkForNewFilesMinutes: 5,

  // Reload the whole page once a day at this hour (24h clock), keeps
  // the TV browser fresh. Set to null to disable.
  dailyReloadHour: 4,

  // ---- Where the files come from -------------------------------
  // On GitHub Pages this is detected automatically - leave it as "auto".
  // Anywhere else, the player reads the file lists from content.json.
  source: "auto",

  // Only needed if auto-detection fails (e.g. you use a custom domain):
  github: { owner: "", repo: "", branch: "" }
};
