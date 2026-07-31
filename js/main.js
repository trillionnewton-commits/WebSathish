/* ADBLOOD — shared page behaviour. No dependencies, no build step. */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add("is-visible");
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Masthead issue date ----------
     Prints today's date in the topline, like a real paper.
     Want a fixed date instead? Delete the data-issue-date attribute in index.html
     and the hardcoded text stays put. */
  function initIssueDate() {
    var slot = document.querySelector("[data-issue-date]");
    if (!slot) return;
    try {
      var d = new Date();
      slot.textContent = d.toLocaleDateString("en-GB", { weekday: "long" }) + ", " +
        d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    } catch (e) { /* keep whatever is already in the markup */ }
  }

  /* ---------- Résumé links ----------
     Drop resume-sathish-kumar.pdf next to index.html and these light up.
     Until then they remove themselves — a dead "download résumé" link on a
     job portfolio is worse than no link at all. */
  function initResume() {
    var links = document.querySelectorAll('a[href$=".pdf"][download]');
    if (!links.length) return;

    fetch(links[0].getAttribute("href"), { method: "HEAD" })
      .then(function (res) {
        if (!res.ok) throw new Error("missing");
      })
      .catch(function () {
        links.forEach(function (a) { a.remove(); });
      });
  }

  /* ---------- Full-size image viewer ----------
     The work thumbnails are dense screenshots — dashboards and reel grids.
     Fitting them on screen isn't enough to read them, so this does real zoom:
     wheel or pinch to scale, drag to pan, click the image to toggle. */
  function initViewer() {
    var viewer = document.getElementById("sc-viewer");
    var stage = document.getElementById("sc-stage");
    var img = document.getElementById("sc-viewer-img");
    var cap = document.getElementById("sc-viewer-cap");
    var plates = document.querySelectorAll(".sc-plate");
    if (!viewer || !stage || !img || !plates.length) return;

    var MIN = 1, MAX = 8;
    var scale = 1, tx = 0, ty = 0;
    var lastFocus = null, moved = false;
    var pointers = new Map();
    var pinchFrom = 0, pinchScale = 1;

    function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

    /* Don't let a zoomed image be dragged off into empty space. */
    function apply() {
      var limX = Math.max(0, (img.offsetWidth * scale - stage.clientWidth) / 2);
      var limY = Math.max(0, (img.offsetHeight * scale - stage.clientHeight) / 2);
      tx = clamp(tx, -limX, limX);
      ty = clamp(ty, -limY, limY);
      img.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scale + ")";
      stage.classList.toggle("is-zoomed", scale > 1.01);
    }

    /* Zoom toward a point so the pixel under the cursor stays put. */
    function zoomAt(clientX, clientY, factor) {
      var next = clamp(scale * factor, MIN, MAX);
      if (next === scale) return;
      var box = stage.getBoundingClientRect();
      var px = clientX - (box.left + box.width / 2);
      var py = clientY - (box.top + box.height / 2);
      tx = px - (next / scale) * (px - tx);
      ty = py - (next / scale) * (py - ty);
      scale = next;
      apply();
    }

    function reset() { scale = 1; tx = 0; ty = 0; apply(); }

    function open(src, alt, caption) {
      lastFocus = document.activeElement;
      img.src = src;
      img.alt = alt || "";
      cap.textContent = caption || "";
      reset();
      viewer.classList.add("is-open");
      document.body.style.overflow = "hidden";
      viewer.querySelector(".sc-vclose").focus();
    }

    function close() {
      viewer.classList.remove("is-open");
      document.body.style.overflow = "";
      img.removeAttribute("src");
      if (lastFocus) lastFocus.focus();
    }

    plates.forEach(function (plate) {
      plate.addEventListener("click", function () {
        var source = plate.querySelector("img");
        open(plate.dataset.full || source.src, source.alt, plate.dataset.cap);
      });
    });

    viewer.querySelectorAll("[data-zoom]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var box = stage.getBoundingClientRect();
        var cx = box.left + box.width / 2, cy = box.top + box.height / 2;
        var what = btn.dataset.zoom;
        if (what === "in") zoomAt(cx, cy, 1.5);
        else if (what === "out") zoomAt(cx, cy, 1 / 1.5);
        else if (what === "reset") reset();
        else close();
      });
    });

    stage.addEventListener("wheel", function (e) {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.18 : 1 / 1.18);
    }, { passive: false });

    function spread() {
      var pts = Array.from(pointers.values());
      return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    }
    function midpoint() {
      var pts = Array.from(pointers.values());
      return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
    }

    /* Pointer capture retargets the follow-up click to the stage, which would
       make every click on the image read as a click on the backdrop. So record
       where the press started, and only capture once we're actually dragging. */
    var downTarget = null;

    stage.addEventListener("pointerdown", function (e) {
      downTarget = e.target;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved = false;
      if (pointers.size === 2) {
        pinchFrom = spread();
        pinchScale = scale;
        pointers.forEach(function (_v, id) {
          try { stage.setPointerCapture(id); } catch (err) { /* pointer already gone */ }
        });
      }
    });

    stage.addEventListener("pointermove", function (e) {
      if (!pointers.has(e.pointerId)) return;
      var prev = pointers.get(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 2 && pinchFrom > 0) {
        var m = midpoint();
        zoomAt(m.x, m.y, (spread() / pinchFrom) * pinchScale / scale);
        moved = true;
      } else if (pointers.size === 1 && scale > 1.01) {
        if (!moved) { try { stage.setPointerCapture(e.pointerId); } catch (err) {} }
        tx += e.clientX - prev.x;
        ty += e.clientY - prev.y;
        moved = true;
        stage.classList.add("is-panning");
        apply();
      }
    });

    function release(e) {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchFrom = 0;
      stage.classList.remove("is-panning");
    }
    stage.addEventListener("pointerup", release);
    stage.addEventListener("pointercancel", release);

    stage.addEventListener("click", function (e) {
      if (moved) return;
      if (downTarget === img) {
        if (scale > 1.01) reset(); else zoomAt(e.clientX, e.clientY, 2.6);
      } else {
        close();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (!viewer.classList.contains("is-open")) return;
      var box = stage.getBoundingClientRect();
      var cx = box.left + box.width / 2, cy = box.top + box.height / 2;
      if (e.key === "Escape") close();
      else if (e.key === "+" || e.key === "=") zoomAt(cx, cy, 1.5);
      else if (e.key === "-") zoomAt(cx, cy, 1 / 1.5);
      else if (e.key === "0") reset();
    });

    window.addEventListener("resize", apply);
  }

  function boot() {
    initReveal();
    initIssueDate();
    initResume();
    initViewer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
