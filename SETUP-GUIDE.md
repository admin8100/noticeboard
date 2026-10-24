# Window Noticeboard – Setup Guide

A free split-screen noticeboard for your TV:

- **Left half:** your announcement PDFs on the letterhead, one page at a time
- **Right half:** your ads (posters, pictures and videos) on a loop

You change what's on screen by uploading or deleting files on a website, from your phone or computer. The TV checks for changes every 5 minutes, so you never need to touch it.

**Cost:** free. You need the TV, Wi-Fi, a free GitHub account (it hosts the files) and a free browser app on the TV.

---

## Part 1 – Put the noticeboard online (one time, about 15 minutes)

1. Go to **github.com** and sign up for a free account. Pick a short username, for example `acmeshop`.
2. Click **+** (top right), then **New repository**.
   - Repository name: `noticeboard`
   - Choose **Public** (required for the free hosting)
   - Click **Create repository**
3. On the next page, click **uploading an existing file**.
4. Open this `noticeboard` folder on your computer, select **everything inside it** (both folders and all the files) and drag it all onto the GitHub page. Then click **Commit changes**.
5. Go to **Settings** → **Pages** (left menu).
   - Under *Branch*, choose **main**, leave the folder as **/(root)** and click **Save**.
6. Wait 1–2 minutes and refresh the page. GitHub will show your noticeboard's address, for example:

   **`https://acmeshop.github.io/noticeboard/`**

   Open it on your computer to check. At this stage each half just says "Nothing to show yet", which is expected.

> **Note:** a Public repository means anyone with the address could look at the files. That's fine for posters and notices that are shown in a window anyway, but don't upload anything private.

---

## Part 2 – Set up the TV (one time)

The TV needs a browser that can show a web page full-screen. Google TV doesn't come with Chrome, so install one of these from the TV's **Google Play Store**:

| App | Notes |
|---|---|
| **Fully Kiosk Browser** (recommended) | Made for signage. It can open your page automatically when the TV turns on and keep the screen awake. A few extra features need an optional one-time licence. |
| **TV Bro** | Simple and free. After a power cut you'll need to open it again with the remote. |

**Fully Kiosk Browser setup:**
1. Open the app and set the **Start URL** to your address from Part 1, for example `https://acmeshop.github.io/noticeboard/`
2. In its settings, turn on:
   - **Start on boot** (*Device Management → Launch on Boot*)
   - **Keep screen on**
   - **Autoplay videos**
3. Exit the settings, and the noticeboard fills the screen.

**TV settings** (on the Skyworth, in *Settings*):
- **Picture mode:** Vivid or Brightest. Turn **off** energy saving and auto-brightness, because a window gets a lot of daylight.
- **Screen saver / Ambient mode:** set to **Never** or **Off**.
- **Auto power off / sleep timer:** **Off**.
- **On/off timer** (if you want): for example on at 7:00 and off at 22:00.

---

## Part 3 – Changing what's on the screen

Everything happens on **github.com → your `noticeboard` repository**. The GitHub phone app works too.

**Add an announcement**
1. Open the **announcements** folder.
2. Click **Add file → Upload files**, drop in your PDF and click **Commit changes**.

**Add an ad**: do the same in the **ads** folder.

**Remove something**: click the file, then the **⋯** menu (or the bin icon) and choose **Delete file**, then **Commit changes**.

The TV picks up the change within about 5–7 minutes.

**Controlling the order:** files play in name order, so number them:
```
announcements/01-opening-hours.pdf
announcements/02-holiday-closure.pdf
ads/01-summer-sale.jpg
ads/02-promo-video.mp4
ads/03-new-menu.png
```

### Supported files

| Folder | File types |
|---|---|
| announcements | PDF (every page is shown in turn), JPG, PNG |
| ads | JPG, PNG, GIF, WEBP, MP4 videos (also PDFs if you have posters as PDF) |

### Getting the best-looking results

- **Shape:** each half of the screen is roughly **square** (960 × 1080 pixels).
  - Portrait posters (for example 1080 × 1350) and A4 letterhead PDFs fit well, with small bars at the sides.
  - Widescreen 16:9 videos will look small, with large bars above and below. If you make videos for this screen, make them **square or portrait (4:5)**.
- **Readable from the street:** use big text and short messages. If people need to read more than about three lines, the text is too small.
- **Video size:** GitHub's website accepts files up to **25 MB**. Export videos at 1080p with a moderate quality setting. Videos play **without sound** (TVs block sound on web pages, and passers-by can't hear it anyway).
- **Name files simply:** stick to letters, numbers and dashes.

---

## Part 4 – Optional settings

To change the timings or layout, open **config.js** in your repository and click the ✏️ pencil icon. Edit the values and click **Commit changes**. The TV picks the change up at its next daily refresh (4 am), or straight away if you restart the browser app.

| Setting | What it does | Default |
|---|---|---|
| `announcementSeconds` | Seconds per PDF page | 12 |
| `adSeconds` | Seconds per picture | 8 |
| `maxVideoSeconds` | Longest a video may play | 90 |
| `announcementsSize` | Share of the screen for announcements (%) | 50 |
| `announcementsPosition` | `"first"` = left, `"second"` = right | first |
| `layout` | `"stacked"` for top/bottom, if you mount the TV vertically | side-by-side |
| `dividerPixels` / `dividerColour` | The line between the halves | 6 / white |
| `checkForNewFilesMinutes` | How often the TV checks for new files | 5 |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| A half says "Nothing to show yet" | That folder has no PDFs, pictures or videos. Check the file was uploaded to the right folder. |
| A new file doesn't appear | Wait up to 7 minutes. GitHub takes 1–2 minutes to publish, then the TV checks every 5. |
| A file is skipped | Add `?debug` to the end of the address (for example `…/noticeboard/?debug`). A log at the bottom of the screen says why. Usually it's a damaged file or an unsupported type. |
| PDFs don't show but pictures do | The TV has no internet. The PDF viewer loads from the internet. |
| Picture looks washed out | Daylight on the screen. Use the brightest picture mode and keep direct sun off the glass. |
