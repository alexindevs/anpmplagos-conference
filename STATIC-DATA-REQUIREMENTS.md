# Static Data Requirements for ANPMP Conference Site

This document lists all information that must be provided by **your contractor** and/or **ANPMP** to properly fill in static content across the site.

---

## 1. Site-wide / Layout

| Item | Where used | Required from |
|------|------------|----------------|
| **Site title** | `layout.tsx` metadata | ANPMP |
| **Site description** | `layout.tsx` metadata | ANPMP |
| **Logo** | Header, Footer (`/anpmp-logo.jpg` in `public/`) | ANPMP – already in use; confirm it’s final or provide replacement |

---

## 2. Home Page (`/`)

### Event basics (ANPMP)
- **Event name** – e.g. “ANPMP Annual Conference”
- **Event subtitle/badge** – e.g. “Annual General Conference 2026”
- **Event date(s)** – e.g. “Sep 25, 2026” (also drives countdown in `CountdownTimer.tsx`: currently `2026-09-25`)
- **Event location** – e.g. “Lagos, Nigeria”
- **Conference theme** – full theme title (e.g. “Enhancing Healthcare Delivery in Nigeria: The Role of Private Medical Practitioners”)

### Hero carousel (Contractor / ANPMP)
- **Hero image URLs** (3 used in `HERO_IMAGES`) – high‑resolution, landscape; provide URLs or files. Currently: 1 Google URL + 2 Unsplash placeholders.

### Copy (ANPMP or Contractor)
- **Event Highlights** – short descriptions for: Networking, Keynote Speakers, Workshops (titles can stay; body copy can be adjusted).

### Schedule (ANPMP)
- **Day 1** – date label (e.g. “Sep 25”), title (e.g. “Arrival & Opening Ceremony”), short description.
- **Day 2** – same (e.g. “Sep 26”, “Technical Sessions & Workshops”, description).
- **Day 3** – same (e.g. “Sep 27”, “AGM & Gala Night”, description).

### Registration (ANPMP)
- **Tier names** – e.g. Student, Member, Non-Member, Corporate.
- **Tier descriptions** – e.g. “Medical Students & Interns”, “Active ANPMP Members”, etc.
- **Price per tier** – amounts and currency (e.g. ₦15,000, ₦40,000, ₦55,000, ₦150,000).
- **Benefits per tier** – list of bullet points for each tier (e.g. “Access to sessions”, “AGM Voting Rights”).
- **Which tier is “POPULAR”** (if any).
- **Registration/Select behaviour** – real link (e.g. external form) or “coming soon”; contractor implements.

### Venue (ANPMP)
- **Venue name** – e.g. “Eko Convention Centre”.
- **Full address** – e.g. “Plot 1415 Adetokunbo Ademola Street, Victoria Island, Lagos”.
- **Venue contact** – e.g. phone “+234 1 277 2700”.
- **“Get Directions” link** – e.g. Google Maps URL.
- **Map image or embed** – currently a static image URL; can be replaced with real map or embed.

---

## 3. About Page (`/about`)

### Copy (ANPMP)
- **Hero** – page title, short subtitle (e.g. “Advancing Private Healthcare in Nigeria…”).
- **Mission** – full mission statement.
- **Vision** – full vision statement.
- **History** – 3 (or more) paragraphs of ANPMP history; confirm founding year and any stats (e.g. 1978, 5000+ members, 36 states, 45+ conferences).

### Organizing Committee (ANPMP)
For each member:
- **Full name** (e.g. “Dr. Kayode Olatunji”).
- **Role** (e.g. Chairman, Secretary General, Treasurer, Public Relations).
- **Credentials** (e.g. “MBBS, FWACP”).
- **Photo** – URL or file; alt text (e.g. “Portrait of Dr. …”).

### Images (Contractor / ANPMP)
- **About hero background** – currently Unsplash; final image URL or asset.

---

## 4. Speakers Page (`/speakers`)

### Keynote / Plenary speakers (ANPMP)
For each:
- **Name**
- **Credentials** (e.g. MBBS, FWACP)
- **Role** (e.g. “Opening Keynote”, “Plenary Speaker”)
- **Topic/talk title**
- **Short bio**
- **Photo** (URL or file) + alt text

### Featured speakers / panelists (ANPMP)
For each:
- **Name**
- **Credentials**
- **Role** (e.g. Panel Moderator, Workshop Lead, Panelist)
- **Topic**
- **Photo** (URL or file) + alt text

### Copy (ANPMP)
- **Page title** – e.g. “Our Speakers”.
- **Intro paragraph** – short blurb under hero.

---

## 5. Exhibition Page (`/exhibition`)

### Gold sponsors (ANPMP + sponsors)
For each:
- **Company/organisation name**
- **Short description** (1–2 sentences)
- **Logo or banner image** (URL or file) + alt text
- **URL slug** for profile (e.g. `medicorp-solutions`) – used in `/exhibition/[slug]`

### Silver exhibitors (ANPMP + exhibitors)
For each:
- **Company/organisation name**
- **Short description**
- **URL slug** for profile

(Optional: icon or category per exhibitor for display.)

---

## 6. Exhibitor Profile Pages (`/exhibition/[slug]`)

For each exhibitor/sponsor that has a profile, ANPMP or the exhibitor must provide:

### Profile basics
- **Name**
- **Tagline** (one line)
- **Badge** – “Gold” or “Silver”
- **Banner image** (URL or file)
- **Logo image** (URL or file)

### About
- **About paragraphs** – 2–3 paragraphs for “About Us” on the profile.

### Contact / logistics
- **Booth** – e.g. “Booth #101, Hall A”
- **Website** – full URL or display text (e.g. “www.medicorpsolutions.com”)
- **Email** – contact email

### Products / services (optional per exhibitor)
For each product/service:
- **Name**
- **Short description**
- **Image** (URL or file) + alt text

### Booth representatives (optional)
For each rep:
- **Name**
- **Title**
- **Photo** (URL or file) + alt text

---

## 7. Footer (all pages)

### Contact (ANPMP)
- **Email** – e.g. info@anpmpconference.org
- **Phone** – e.g. +234 800 ANPMP 00
- **Location line** – e.g. “Lagos, Nigeria” (or full address if desired)

### Social (ANPMP)
- **Follow Us** – URLs for each channel (website, Twitter/X, Facebook, YouTube, etc.); contractor maps them to the correct icons.

### Sponsor strip (ANPMP)
- **Sponsor logos** – 4 placeholder blocks; provide logo images/URLs and optional links for “Our Sponsors & Partners”.

### Legal
- **Copyright** – e.g. “© 2026 Association of Nigerian Private Medical Practitioners. All rights reserved.” (year and name confirmed by ANPMP.)

---

## 8. Countdown

- **Target date/time** – currently `2026-09-25T00:00:00` in `CountdownTimer.tsx`. ANPMP to confirm exact date and whether time matters (e.g. start of first day).

---

## 9. Images – technical (Contractor)

- **Hosting** – all image URLs must be stable (same domain or approved CDN). If using a CMS or asset host, contractor will need the base URL and any auth/keys.
- **Next.js `images.domains` / `remotePatterns`** – currently `lh3.googleusercontent.com` and Unsplash are in use; any new image host must be added in `next.config.ts`.
- **Logo** – confirm format/size (e.g. high‑res PNG or JPG) and that `public/anpmp-logo.jpg` is the final asset or replace it.

---

## Summary checklist

- [ ] **ANPMP:** Event name, dates, location, theme, venue details, registration tiers & pricing, schedule per day.
- [ ] **ANPMP:** Mission, vision, history, stats (founding year, members, states, conferences).
- [ ] **ANPMP:** Organizing committee list with names, roles, credentials, photos.
- [ ] **ANPMP:** Keynote and featured speakers with names, roles, topics, bios, photos.
- [ ] **ANPMP:** Gold and Silver exhibitors/sponsors list; for each: name, description, slug, and (for profiles) full profile data + products + reps if applicable.
- [ ] **ANPMP:** Footer contact (email, phone, location), social links, sponsor logos, copyright text.
- [ ] **Contractor:** Hero carousel images, about hero image, any other placeholder images replaced with final URLs or assets.
- [ ] **Contractor:** Ensure all new image domains are allowed in `next.config.ts` and that countdown target date matches ANPMP.

Use this list to collect copy and assets from ANPMP and to track what the contractor needs to implement or replace.
