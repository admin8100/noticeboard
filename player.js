// Noticeboard player: plays the files in announcements/ on one half of
// the screen and the files in ads/ on the other, in filename order.
(function () {
  "use strict";

  var cfg = window.SIGNAGE_CONFIG || {};
  var IMAGE = /\.(jpe?g|png|gif|webp|svg)$/i;
  var VIDEO = /\.(mp4|webm|m4v|mov)$/i;
  var PDF = /\.pdf$/i;
  var debugBox = document.getElementById("debug");
  var showDebug = /[?&]debug/.test(location.search);

  function log(msg) {
    console.log("[noticeboard] " + msg);
    if (showDebug) {
      debugBox.style.display = "block";
      debugBox.textContent = (new Date().toLocaleTimeString() + "  " + msg + "\n" + debugBox.textContent).slice(0, 4000);
    }
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function withTimeout(promise, ms, what) {
    return Promise.race([promise, sleep(ms).then(function () { throw new Error(what + " timed out"); })]);
  }

  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }

  // ---------- Layout ----------
  function applyLayout() {
    var screen = document.getElementById("screen");
    var a = document.getElementById("announcements");
    var b = document.getElementById("ads");
    var d = document.getElementById("divider");
    var stacked = cfg.layout === "stacked";
    var size = Math.max(10, Math.min(90, Number(cfg.announcementsSize) || 50));
    var div = Number(cfg.dividerPixels) || 0;

    screen.className = stacked ? "stacked" : "";
    if (cfg.announcementsPosition === "second") {
      screen.insertBefore(b, a);
      screen.insertBefore(d, a);
    }
    var dim = stacked ? "height" : "width";
    var other = stacked ? "width" : "height";
    a.style[dim] = "calc(" + size + "% - " + div / 2 + "px)";
    b.style[dim] = "calc(" + (100 - size) + "% - " + div / 2 + "px)";
    a.style[other] = b.style[other] = "100%";
    d.style[dim] = div + "px";
    d.style[other] = "100%";
    d.style.background = cfg.dividerColour || "#fff";
    a.style.background = cfg.announcementsBackground || "#111";
    b.style.background = cfg.adsBackground || "#000";
  }

  // ---------- Finding the files ----------
  function githubSource() {
    var gh = cfg.github || {};
    if (gh.owner && gh.repo) return gh;
    var m = location.hostname.match(/^([^.]+)\.github\.io$/i);
    if (!m) return null;
    var firstDir = location.pathname.split("/")[1];
    var isPage = /\.html?$/i.test(firstDir || "");
    return { owner: m[1], repo: firstDir && !isPage ? firstDir : m[1] + ".github.io", branch: gh.branch };
  }

  function byName(a, b) { return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }); }

  function playable(name) { return IMAGE.test(name) || VIDEO.test(name) || PDF.test(name); }

  function listFolder(folder) {
    var useGithub = cfg.source === "github" || (cfg.source !== "list" && githubSource());
    if (useGithub) {
      var gh = githubSource();
      var url = "https://api.github.com/repos/" + gh.owner + "/" + gh.repo + "/contents/" + folder +
        (gh.branch ? "?ref=" + encodeURIComponent(gh.branch) : "");
      return fetch(url, { cache: "no-store" }).then(function (r) {
        if (r.status === 404) return [];
        if (!r.ok) throw new Error("GitHub said " + r.status);
        return r.json();
      }).then(function (items) {
        return items.filter(function (i) { return i.type === "file" && playable(i.name); })
          .map(function (i) { return i.name; }).sort(byName)
          .map(function (n) { return folder + "/" + encodeURIComponent(n); });
      });
    }
    return fetch("content.json?t=" + Date.now(), { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("content.json not found");
      return r.json();
    }).then(function (data) {
      return (data[folder] || []).filter(playable).map(function (n) {
        return /^(https?:)?\/\//.test(n) || n.indexOf("/") >= 0 ? n : folder + "/" + encodeURIComponent(n);
      });
    });
  }

  // ---------- A pane that plays a list of files forever ----------
  function Pane(el, folder, seconds) {
    this.el = el;
    this.folder = folder;
    this.seconds = seconds;
    this.files = null;      // null = not loaded yet
    this.current = null;    // currently visible layer
    this.message = null;
  }

  Pane.prototype.refresh = function () {
    var self = this;
    return listFolder(this.folder).then(function (files) {
      if (JSON.stringify(files) !== JSON.stringify(self.files)) log(self.folder + ": " + files.length + " file(s)");
      self.files = files;
    }).catch(function (e) {
      log(self.folder + ": could not list files (" + e.message + ") - keeping previous list");
      if (self.files === null) self.files = [];
    });
  };

  Pane.prototype.say = function (text) {
    if (!this.message) {
      this.message = document.createElement("div");
      this.message.className = "message";
      this.el.appendChild(this.message);
    }
    this.message.textContent = text;
  };

  Pane.prototype.clearMessage = function () {
    if (this.message) { this.message.remove(); this.message = null; }
  };

  // Swap in a new layer with a cross-fade; the old one stays until the new one is ready.
  Pane.prototype.show = function (layer) {
    var old = this.current;
    this.el.appendChild(layer);
    void layer.offsetWidth;
    layer.classList.add("show");
    this.current = layer;
    this.clearMessage();
    if (old) {
      old.classList.remove("show");
      setTimeout(function () {
        var v = old.querySelector("video");
        if (v) { v.pause(); v.removeAttribute("src"); v.load(); }
        old.remove();
      }, 1000);
    }
  };

  Pane.prototype.showImage = function (url) {
    var self = this;
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = resolve.bind(null, img);
      img.onerror = function () { reject(new Error("could not load image")); };
      img.src = url;
    }).then(function (img) {
      var layer = document.createElement("div");
      layer.className = "layer";
      layer.appendChild(img);
      self.show(layer);
      return sleep(self.seconds * 1000);
    });
  };

  Pane.prototype.showVideo = function (url) {
    var self = this;
    var v = document.createElement("video");
    v.muted = !cfg.videoSound;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("muted", "");
    v.preload = "auto";
    // Load it in an invisible layer (some TV browsers won't load detached videos).
    var layer = document.createElement("div");
    layer.className = "layer";
    layer.appendChild(v);
    self.el.appendChild(layer);
    var ready = new Promise(function (resolve, reject) {
      v.oncanplay = v.onloadeddata = resolve;
      v.onerror = function () { reject(new Error("could not load video")); };
    });
    v.src = url;
    return withTimeout(ready, 20000, "video").catch(function (e) {
      layer.remove();
      throw e;
    }).then(function () {
      self.show(layer);
      var maxMs = (Number(cfg.maxVideoSeconds) || 90) * 1000;
      var finished = new Promise(function (resolve) {
        v.onended = resolve;
        v.onerror = resolve;
      });
      var p = v.play();
      if (p && p.catch) {
        p.catch(function () {
          // Sound blocked by the browser - retry muted.
          v.muted = true;
          return v.play();
        }).catch(function () { log("video would not play: " + url); });
      }
      return Promise.race([finished, sleep(maxMs)]);
    });
  };

  Pane.prototype.showPdf = function (url) {
    var self = this;
    if (!window.pdfjsLib) return Promise.reject(new Error("PDF library did not load (no internet?)"));
    var task = pdfjsLib.getDocument(url);
    return withTimeout(task.promise, 30000, "PDF").then(function (doc) {
      var pageNo = 1;
      function next() {
        if (pageNo > doc.numPages) { doc.destroy(); return; }
        return self.renderPdfPage(doc, pageNo++).then(function () {
          return sleep(self.seconds * 1000);
        }).then(next);
      }
      return next();
    });
  };

  Pane.prototype.renderPdfPage = function (doc, n) {
    var self = this;
    return doc.getPage(n).then(function (page) {
      var margin = 0.96; // leave a small border around the page
      var w = self.el.clientWidth * margin, h = self.el.clientHeight * margin;
      var base = page.getViewport({ scale: 1 });
      var fit = Math.min(w / base.width, h / base.height);
      var ratio = Math.min(window.devicePixelRatio || 1, 2);
      var vp = page.getViewport({ scale: fit * ratio });
      var canvas = document.createElement("canvas");
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      canvas.style.width = Math.floor(vp.width / ratio) + "px";
      canvas.style.height = Math.floor(vp.height / ratio) + "px";
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
        var layer = document.createElement("div");
        layer.className = "layer";
        layer.appendChild(canvas);
        self.show(layer);
      });
    });
  };

  Pane.prototype.play = function (url) {
    if (PDF.test(url)) return this.showPdf(url);
    if (VIDEO.test(url)) return this.showVideo(url);
    return this.showImage(url);
  };

  Pane.prototype.run = async function () {
    var self = this;
    while (true) {
      if (self.files === null) await self.refresh();
      var files = self.files.slice();
      if (!files.length) {
        if (!self.current) self.say("Nothing to show yet - add files to the \"" + self.folder + "\" folder.");
        await sleep(15000);
        await self.refresh();
        continue;
      }
      var played = 0;
      for (var i = 0; i < files.length; i++) {
        // Skip files deleted since this round started
        if (self.files.indexOf(files[i]) < 0) continue;
        try {
          await self.play(files[i]);
          played++;
        } catch (e) {
          log(self.folder + ": skipped " + decodeURIComponent(files[i]) + " (" + e.message + ")");
        }
      }
      if (!played) {
        if (!self.current) self.say("Could not show any files in \"" + self.folder + "\". Check the file types.");
        await sleep(10000);
      }
    }
  };

  // ---------- Keep the screen awake ----------
  function keepAwake() {
    if (!("wakeLock" in navigator)) return;
    function grab() { navigator.wakeLock.request("screen").catch(function () {}); }
    grab();
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") grab();
    });
  }

  function scheduleDailyReload() {
    if (cfg.dailyReloadHour === null || cfg.dailyReloadHour === undefined) return;
    var now = new Date();
    var at = new Date(now);
    at.setHours(cfg.dailyReloadHour, 0, 0, 0);
    if (at <= now) at.setDate(at.getDate() + 1);
    setTimeout(function () { location.reload(); }, at - now);
  }

  // ---------- Start ----------
  applyLayout();
  keepAwake();
  scheduleDailyReload();

  var panes = [
    new Pane(document.getElementById("announcements"), "announcements", Number(cfg.announcementSeconds) || 12),
    new Pane(document.getElementById("ads"), "ads", Number(cfg.adSeconds) || 8)
  ];
  var minutes = Math.max(1, Number(cfg.checkForNewFilesMinutes) || 5);
  setInterval(function () { panes.forEach(function (p) { p.refresh(); }); }, minutes * 60000);
  panes.forEach(function (p) { p.run(); });

  // Re-fit PDFs if the screen size changes (e.g. TV browser zoom).
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { location.reload(); }, 1500);
  });

  window.__noticeboard = { panes: panes, config: cfg };
})();
