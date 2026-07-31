# Sathish Creative — job portfolio

A one-page portfolio built for job applications. Same broadsheet craft as the ADBLOOD site,
restructured around what a hiring manager actually scans: role, scope, dates, and a way to
reach you.

```
index.html        The whole page
css/style.css     Everything
js/main.js        Scroll reveal, live date, résumé link guard
images/           Three work thumbnails + favicon
```

About 700 KB, no build step. Host it anywhere static — Netlify, Vercel, GitHub Pages, or the
same Hostinger account under a subdomain.

---

## Fix these before you send it anywhere

### 1. Two links need your confirmation

**The reels link is a guess.** You asked for a URL showing your creative reels but didn't
send one — it currently points at `instagram.com/adblood.in/reels/`, the reels tab of your
handle. That works, but if you meant a specific reel or a different collection, swap the
`href` on the second `sc-cta` link in `index.html`.

**The Canva link is labelled "Open the portfolio".** `canva.link/3vi1588ajjmmsaf` is a deck,
not a website, so the button says portfolio rather than work site. Canva share links expire
or change permission — check it opens for someone not signed into your account before you
send this anywhere.

### 2. Add your résumé

Save it as `resume-sathish-kumar.pdf` next to `index.html`. Until you do, both download links
delete themselves on page load — a dead résumé link on a job portfolio is worse than none.
Drop the file in and they reappear automatically. Nothing else to change.

### 3. Set the domain

`index.html` has `https://sathishcreative.com/` in three places — canonical, `og:url`, and
the structured data. Change them to wherever this actually lives.

---

## One thing to be ready for

The ADBLOOD founder row is out, so the timeline now ends at Afynd, 2026. Anyone reading this
in late 2026 or beyond will see a gap and ask what you've been doing since. Have the answer
ready — independent client work is a good answer, it just isn't on the page any more.

---

## What changed from the ADBLOOD site

- **Leads with what you care about.** The good-at section opens with social media marketing
  and carries a "creative director" marker, so the ambition is stated rather than implied.
- **Organised by role, not by service.** The ledger is now Role / What I owned / Where /
  When — the four things a hiring manager reads before deciding whether to keep going.
- **A "what I'm looking for" line** in the lead. Most portfolios make the reader guess.
- **At a glance panel** — experience, location, focus, brands run, team size — plus the
  résumé button, all above the fold on desktop.
- **A skills rail** where the client logos used to be. It's also what CV keyword filters
  look for.
- **The work thumbnails open a real viewer.** Click or tap any of the three: the full image
  loads uncropped, then wheel, pinch, the +/− buttons or the `+`/`-` keys zoom up to 8x, and
  you drag to move around. Those screenshots are dense dashboards — fitting them on screen
  was never going to be enough to actually read them. Escape, the ×, or a click outside
  closes it.
- **Check my work is a redirect**, as you asked. Three thumbnails and two buttons out to
  adblood.in and Instagram — enough to prove you make things, not enough to compete with
  the real portfolio.
- **`Person` structured data** instead of `ProfessionalService`, since this is you rather
  than a studio.
- Dropped the lightbox, the enquiry dock, and the ADBLOOD masthead, straplines and
  classified-ad services.
