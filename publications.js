/* Minimal client-side publications renderer (no build step). */
(function () {
  const YEAR_BUCKET_CUTOFF = 2014; // 2014 and before

	  // Replace this list with your real publications.
	  /** @type {Array<{
	   *  id: string,
	   *  title: string,
	   *  authors: string,
	   *  year: number,
	   *  topics: string[],
	   *  thumb?: string,
	   *  video?: string,
	   *  videoAutoplay?: boolean,
	   *  selected?: boolean,
	   *  highlights?: string[],
	   *  venues?: Array<{
	   *    venue: string,
   *    venueUrl?: string,
   *    links?: Array<{ label: string, href: string }>
   *  }>,
   *  // Back-compat fields (optional)
   *  venue?: string,
   *  links?: { pdf?: string, doi?: string, code?: string, project?: string }
   * }>}
   */
  const publications = [
    {
      id: "resonance26",
      title: "Resonance absorption of fertile material in D-T fusion blankets",
      authors: "Emma Zoccoli, Greta Li, Patrick Park, Robert Goldston",
      year: 2026,
      topics: ["fusion non-proliferation"],
      selected: true,
      thumb: "assets/pubs/elwr-38north.jpg",
      venues: [
        {
          venue: "In preparation",
          links: [] , // [{},]
        },
      ],
    },
    {
      id: "grph25",
      title: "Myths of nuclear graphite in World War II, with original translations",
      authors: "Patrick Park, Sebastian Herzele, Timothy Koeth",
      year: 2025,
      topics: ["nuclear forensics"],
      selected: true,
      thumb: "assets/pubs/grph25-cp1.jpg",
      venues: [
        {
          venue: "European Physical Journal H, vol. 50, no. 11 (2025)",
          links: [
            {
              label: "Paper",
              href: "http://doi.org/10.1140/epjh/s13129-025-00098-7",
            },
            {
              label: "Journal highlight",
              href: "https://www.epj.org/epjh-news/2904-epjh-highlight-revisiting-the-failure-of-germanys-wartime-nuclear-program",
            },
          ],
        },
      ],
    },
    {
      id: "elwr24",
      title: "Estimating potential tritium and plutonium production in North Korea's Experimental Light Water Reactor",
      authors: "Patrick Park, Alexander Glaser",
      year: 2024,
      topics: ["nuclear forensics"],
      selected: true,
      thumb: "assets/pubs/elwr-38north.jpg",
      venues: [
        {
          venue: "Science & Global Security, vol. 32, no. 3 (2024)",
          links: [
            {
              label: "Paper",
              href: "https://doi.org/10.1080/08929882.2024.2444751",
            },
          ],
        },
      ],
    },
    /*
    {
      id: "suh2019control",
      title: "The Control of Colloidal Grain Boundaries through Evaporative Vertical Self-Assembly",
      authors: "Youngjoon Suh, Quang Pham, Bowen Shao, Yoonjin Won",
      year: 2019,
      topics: [],
      selected: false,
      thumb: "assets/publications/suh2019control_cover.pdf",
      venues: [
        {
          venue: "Small, 2019, 15(12): 1804523",
          links: [
            {
	              label: "Paper",
	              href: "https://onlinelibrary.wiley.com/doi/abs/10.1002/smll.201804523",
	            },
	            {
	              label: "Cover Art",
	              href: "assets/publications/suh2019control_cover.pdf",
	            },
	          ],
	        },
	      ],
	    },
      */
  ];

  const contentEl = document.getElementById("pub-content");
  const navEl = document.querySelector("#publications .pub-nav");
  const toggles = Array.from(document.querySelectorAll(".pub-toggle"));
  if (!contentEl || !navEl || toggles.length === 0) return;

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeTopic(topic) {
    return String(topic || "").trim();
  }

  function yearBucket(year) {
    return year <= YEAR_BUCKET_CUTOFF ? `${YEAR_BUCKET_CUTOFF} and before` : String(year);
  }

  function sortByYearDescThenTitle(a, b) {
    if (a.year !== b.year) return b.year - a.year;
    return a.title.localeCompare(b.title);
  }

  function renderLinks(links) {
    if (!links) return "";
    const items = [];
    if (links.project) items.push({ label: "project", href: links.project });
    if (links.pdf) items.push({ label: "pdf", href: links.pdf });
    if (links.doi) items.push({ label: "doi", href: links.doi });
    if (links.code) items.push({ label: "code", href: links.code });
    if (items.length === 0) return "";

    return `<span class="pub-links">${items
      .map(
        (i) =>
          `<a href="${escapeHtml(i.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(i.label)}</a>`
      )
      .join(" ")}</span>`;
  }

  function renderVenueLines(p) {
    if (p.venues && p.venues.length) {
      return p.venues
        .map((row) => {
          const venue = row.venueUrl
            ? `<a href="${escapeHtml(row.venueUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.venue)}</a>`
            : `<span class="pub-venue">${escapeHtml(row.venue)}</span>`;
          const links =
            row.links && row.links.length
              ? row.links
                  .map(
                    (l) =>
                      `<a href="${escapeHtml(l.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)}</a>`
                  )
                  .join(" / ")
              : "";

          return `<div class="pub-where">${venue}${links ? ` / ${links}` : ""}</div>`;
        })
        .join("");
    }

    // Back-compat: `venue` + `links`
    const venue = p.venue ? `<span class="pub-venue">${escapeHtml(p.venue)}</span>` : "";
    const links = renderLinks(p.links);
    if (!venue && !links) return "";
    return `<div class="pub-where">${venue}${links}</div>`;
  }

  function renderHighlights(p) {
    const hs = (p.highlights || []).map((h) => String(h || "").trim()).filter(Boolean);
    if (!hs.length) return "";
    return `<div class="pub-highlights">${hs.map((h) => `<div class="pub-highlight">${escapeHtml(h)}</div>`).join("")}</div>`;
  }

	  function autoThumbDataUri(p) {
    const title = String(p.title || "Publication").trim();
    const year = String(p.year || "").trim();
    const initials = title
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

    // Simple, self-contained SVG "title card" thumbnail.
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffe1f0"/>
      <stop offset="1" stop-color="#ffd1ea"/>
    </linearGradient>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="640" height="400" fill="url(#g)"/>
  <circle cx="520" cy="86" r="120" fill="#e0218a" opacity="0.12"/>
  <circle cx="120" cy="340" r="170" fill="#e0218a" opacity="0.08"/>
  <rect x="42" y="52" width="556" height="296" rx="22" fill="#ffffff" filter="url(#s)"/>
  <text x="72" y="120" font-family="Roboto, Arial, Helvetica, sans-serif" font-weight="800" font-size="32" fill="#0f172a">
    ${escapeHtml(title).slice(0, 56)}
  </text>
  <text x="72" y="160" font-family="Roboto, Arial, Helvetica, sans-serif" font-weight="700" font-size="18" fill="#475569">
    ${escapeHtml(year ? `(${year})` : "")}
  </text>
  <rect x="72" y="210" width="140" height="44" rx="14" fill="#e0218a" opacity="0.92"/>
  <text x="142" y="239" text-anchor="middle" font-family="Roboto, Arial, Helvetica, sans-serif" font-weight="800" font-size="18" fill="#ffffff">
    ${escapeHtml(initials || "PAPER")}
  </text>
</svg>`;

	    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
	  }

	  function youtubeId(url) {
	    const raw = String(url || "");
	    const m1 = /^https?:\/\/youtu\.be\/([A-Za-z0-9_-]{6,})/.exec(raw);
	    const m2 =
	      /^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{6,})/.exec(raw) ||
	      /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/.exec(raw);
	    return (m1 && m1[1]) || (m2 && m2[1]) || "";
	  }

		  function youtubeThumbUrl(url) {
		    const id = youtubeId(url);
		    if (!id) return "";
		    return `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
		  }

		  function canPlayVideoMime(mime) {
		    try {
		      const v = document.createElement("video");
		      const res = v.canPlayType(mime);
		      return res === "probably" || res === "maybe";
		    } catch {
		      return false;
		    }
		  }

		  function canPlayLocalVideo(url) {
		    const raw = String(url || "");
		    const ext = raw.split("?")[0].toLowerCase();
		    if (/\.(mp4)$/i.test(ext)) return canPlayVideoMime("video/mp4");
		    if (/\.(webm)$/i.test(ext)) return canPlayVideoMime("video/webm");
		    if (/\.(mov)$/i.test(ext)) return canPlayVideoMime("video/quicktime");
		    if (/\.(m4v)$/i.test(ext)) return canPlayVideoMime("video/x-m4v");
		    if (/\.(avi)$/i.test(ext)) return canPlayVideoMime("video/x-msvideo");
		    return false;
		  }

		  function youtubeEmbedUrl(url, opts) {
		    const id = youtubeId(url);
		    if (!id) return "";
		    const autoplay = opts && opts.autoplay ? "1" : "0";
		    const mute = opts && opts.autoplay ? "1" : "0";
		    const origin =
	      typeof location !== "undefined" && location && location.origin && location.origin !== "null"
	        ? `&origin=${encodeURIComponent(location.origin)}`
	        : "";
	    return `https://www.youtube.com/embed/${encodeURIComponent(
	      id
	    )}?rel=0&playsinline=1&autoplay=${autoplay}&mute=${mute}${origin}`;
	  }

		  function renderPubItem(p) {
		    const topics =
		      p.topics && p.topics.length
		        ? `<div class="pub-topics">${p.topics.map((t) => `<span class="chip">${escapeHtml(t)}</span>`).join("")}</div>`
		        : "";

		    // Thumbnail fallback chain:
		    // 1) `p.thumb` if provided, else `assets/publications/<id>.jpg`
		    // 2) `assets/publications/default.jpeg` (site-wide default)
		    // 3) auto-generated SVG card (always available)
		    const thumbCandidate = p.thumb ? String(p.thumb) : `assets/publications/${p.id}.jpg`;
		    const thumbIsPdf = /\.pdf(?:\?.*)?$/i.test(thumbCandidate);
		    const thumbDefault = "assets/publications/default.jpeg";
		    const thumbAlt1 =
		      !thumbIsPdf && /\.jpg$/i.test(thumbCandidate)
		        ? thumbCandidate.replace(/\.jpg$/i, ".png")
		        : !thumbIsPdf && /\.png$/i.test(thumbCandidate)
		          ? thumbCandidate.replace(/\.png$/i, ".jpg")
		          : "";
		    const thumbAlt2 =
		      !thumbIsPdf && /\.jpe?g$/i.test(thumbCandidate)
		        ? thumbCandidate.replace(/\.jpe?g$/i, ".png")
		        : !thumbIsPdf && /\.png$/i.test(thumbCandidate)
		          ? thumbCandidate.replace(/\.png$/i, ".jpeg")
		          : "";
		    const thumbSrc = escapeHtml(thumbCandidate);
		    const thumbImg = thumbIsPdf
		      ? `
		        <object class="pub-thumb-pdf" data="${thumbSrc}#page=1&view=FitH" type="application/pdf">
		          <img src="${escapeHtml(thumbDefault)}" alt="" loading="lazy" />
		        </object>
		      `
		      : `
		        <img
		          src="${thumbSrc}"
		          alt=""
		          loading="lazy"
		          onerror="if(!this.dataset.fallback && ${thumbAlt1 ? "true" : "false"}){this.dataset.fallback='alt1';this.src='${escapeHtml(thumbAlt1)}';}else if(this.dataset.fallback==='alt1' && ${thumbAlt2 ? "true" : "false"}){this.dataset.fallback='alt2';this.src='${escapeHtml(thumbAlt2)}';}else if(this.dataset.fallback!=='default'){this.dataset.fallback='default';this.src='${escapeHtml(
		            thumbDefault
		          )}';}else{this.onerror=null;this.src='${autoThumbDataUri(p)}';}"
		        />
		      `;

		    const isFile = typeof location !== "undefined" && location && location.protocol === "file:";
		    const videoUrl = p.video ? String(p.video) : "";
		    const isYouTubeVideo = Boolean(youtubeId(videoUrl));
		    const isLocalVideo = /\.(?:mp4|webm|mov|m4v|avi)(?:\?.*)?$/i.test(videoUrl);
		    const videoThumb = isYouTubeVideo ? youtubeThumbUrl(videoUrl) : "";
		    const embedUrl = !isFile && videoUrl && isYouTubeVideo
		      ? youtubeEmbedUrl(videoUrl, { autoplay: Boolean(p.videoAutoplay) })
		      : "";

		    if (videoUrl) {
		      if (isLocalVideo && !isYouTubeVideo) {
		        if (!canPlayLocalVideo(videoUrl)) {
		          return `
		            <article class="pub-item" id="${escapeHtml(p.id)}">
		              <div class="pub-thumb is-video-fallback">
		                <a class="pub-video-link" href="${escapeHtml(videoUrl)}" target="_blank" rel="noopener noreferrer">
		                  ${thumbImg}
		                  <span class="pub-video-play" aria-hidden="true"></span>
		                </a>
		              </div>
		              <div class="pub-main">
		                <div class="pub-title">${escapeHtml(p.title)}</div>
		                <div class="pub-authors">${escapeHtml(p.authors)}</div>
		                ${renderVenueLines(p)}
		                ${renderHighlights(p)}
		                ${topics}
		              </div>
		            </article>
		          `;
		        }

		        const autoplay = Boolean(p.videoAutoplay);
		        const muted = autoplay ? " muted" : "";
		        const loop = autoplay ? " loop" : "";
		        const autoplayAttr = autoplay ? " autoplay" : "";
		        const controls = autoplay ? "" : " controls";
		        return `
	          <article class="pub-item" id="${escapeHtml(p.id)}">
	            <div class="pub-thumb is-video is-video-file">
	              <video
	                src="${escapeHtml(videoUrl)}"
	                preload="metadata"
	                playsinline${muted}${loop}${autoplayAttr}${controls}
	              ></video>
	            </div>
	            <div class="pub-main">
	              <div class="pub-title">${escapeHtml(p.title)}</div>
	              <div class="pub-authors">${escapeHtml(p.authors)}</div>
	              ${renderVenueLines(p)}
	              ${renderHighlights(p)}
	              ${topics}
	            </div>
	          </article>
	        `;
	      }

	      // If opened from file://, YouTube embeds commonly fail. Fall back to a linked thumbnail.
	      if (isFile || !embedUrl) {
	        return `
	          <article class="pub-item" id="${escapeHtml(p.id)}">
	            <div class="pub-thumb is-video-fallback">
	              <a class="pub-video-link" href="${escapeHtml(videoUrl)}" target="_blank" rel="noopener noreferrer">
	                ${thumbImg}
	                <span class="pub-video-play" aria-hidden="true"></span>
	              </a>
	            </div>
	            <div class="pub-main">
	              <div class="pub-title">${escapeHtml(p.title)}</div>
	              <div class="pub-authors">${escapeHtml(p.authors)}</div>
	              ${renderVenueLines(p)}
	              ${renderHighlights(p)}
	              ${topics}
	            </div>
	          </article>
	        `;
	      }

	      // Autoplay: render the iframe directly.
	      if (p.videoAutoplay) {
	        return `
	          <article class="pub-item" id="${escapeHtml(p.id)}">
	            <div class="pub-thumb is-video">
	              <iframe
	                src="${escapeHtml(embedUrl)}"
	                title="${escapeHtml(p.title || "YouTube video")}"
	                loading="lazy"
	                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
	                allowfullscreen
	              ></iframe>
	            </div>
	            <div class="pub-main">
	              <div class="pub-title">${escapeHtml(p.title)}</div>
	              <div class="pub-authors">${escapeHtml(p.authors)}</div>
	              ${renderVenueLines(p)}
	              ${renderHighlights(p)}
	              ${topics}
	            </div>
	          </article>
	        `;
	      }

	      // Click-to-play: render a thumbnail button; load iframe only after user interaction.
	      const posterSrc = escapeHtml(p.thumb || videoThumb || thumbCandidate);
	      return `
	        <article class="pub-item" id="${escapeHtml(p.id)}">
	          <div
	            class="pub-thumb is-video is-video-placeholder"
	            data-embed="${escapeHtml(youtubeEmbedUrl(videoUrl, { autoplay: true }))}"
	            data-title="${escapeHtml(p.title || "YouTube video")}"
	          >
	            <button class="pub-video-btn" type="button" aria-label="Play video">
	              <img src="${posterSrc}" alt="" loading="lazy" />
	              <span class="pub-video-play" aria-hidden="true"></span>
	            </button>
	          </div>
	          <div class="pub-main">
	            <div class="pub-title">${escapeHtml(p.title)}</div>
	            <div class="pub-authors">${escapeHtml(p.authors)}</div>
	            ${renderVenueLines(p)}
	            ${renderHighlights(p)}
	            ${topics}
	          </div>
	        </article>
	      `;
	    }
	    const thumb = `
	      <div class="pub-thumb">
	        ${thumbImg}
	      </div>
	    `;

    return `
      <article class="pub-item" id="${escapeHtml(p.id)}">
        ${thumb}
        <div class="pub-main">
          <div class="pub-title">${escapeHtml(p.title)}</div>
          <div class="pub-authors">${escapeHtml(p.authors)}</div>
          ${renderVenueLines(p)}
          ${renderHighlights(p)}
          ${topics}
        </div>
      </article>
    `;
  }

  function renderYearNav(yearLabels) {
    const links = yearLabels
      .map((label) => {
        const slug = label === `${YEAR_BUCKET_CUTOFF} and before` ? `y-${YEAR_BUCKET_CUTOFF}-before` : `y-${label}`;
        return `<a class="pub-nav-link" href="#${escapeHtml(slug)}">${escapeHtml(label)}</a>`;
      })
      .join("");

    navEl.innerHTML = `<div class="pub-nav-row"><span class="pub-nav-label">Year:</span>${links}</div>`;
  }

  // Topic nav removed.

		  function renderSelected() {
	    const items = publications.filter((p) => p.selected).sort(sortByYearDescThenTitle);

	    if (items.length === 0) {
	      navEl.innerHTML = "";
	      contentEl.innerHTML = `<p class="pub-empty">No selected publications yet.</p>`;
	      return;
	    }

	    const grouped = new Map();
	    for (const p of items) {
	      const key = yearBucket(p.year);
	      if (!grouped.has(key)) grouped.set(key, []);
	      grouped.get(key).push(p);
	    }

	    const years = Array.from(grouped.keys()).sort((a, b) => {
	      if (a === `${YEAR_BUCKET_CUTOFF} and before`) return 1;
	      if (b === `${YEAR_BUCKET_CUTOFF} and before`) return -1;
	      return Number(b) - Number(a);
	    });
	    renderYearNav(years);

		    contentEl.innerHTML = years
		      .map((label) => {
	        const slug = label === `${YEAR_BUCKET_CUTOFF} and before` ? `y-${YEAR_BUCKET_CUTOFF}-before` : `y-${label}`;
	        const sectionItems = grouped.get(label) || [];
	        return `
	          <section class="pub-section" id="${escapeHtml(slug)}">
	            <h3 class="pub-year">${escapeHtml(label)}</h3>
	            ${sectionItems.map(renderPubItem).join("")}
	          </section>
	        `;
		      })
		      .join("");
		  }

	  function renderByDate() {
    const items = publications.slice().sort(sortByYearDescThenTitle);
    const grouped = new Map();
    for (const p of items) {
      const key = yearBucket(p.year);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(p);
    }

    const years = Array.from(grouped.keys()).sort((a, b) => {
      if (a === `${YEAR_BUCKET_CUTOFF} and before`) return 1;
      if (b === `${YEAR_BUCKET_CUTOFF} and before`) return -1;
      return Number(b) - Number(a);
    });
    renderYearNav(years);

	    contentEl.innerHTML = years
	      .map((label) => {
        const slug = label === `${YEAR_BUCKET_CUTOFF} and before` ? `y-${YEAR_BUCKET_CUTOFF}-before` : `y-${label}`;
        const sectionItems = grouped.get(label) || [];
        return `
          <section class="pub-section" id="${escapeHtml(slug)}">
            <h3 class="pub-year">${escapeHtml(label)}</h3>
            ${sectionItems.map(renderPubItem).join("")}
          </section>
        `;
	      })
	      .join("");
	  }

	  // Delegate click-to-play for video placeholders.
	  contentEl.addEventListener("click", (e) => {
	    const btn = e.target && e.target.closest ? e.target.closest(".pub-video-btn") : null;
	    if (!btn) return;
	    const wrapper = btn.closest(".pub-thumb.is-video-placeholder");
	    if (!wrapper) return;
	    const embed = wrapper.getAttribute("data-embed") || "";
	    const title = wrapper.getAttribute("data-title") || "YouTube video";
	    if (!embed) return;
	    wrapper.classList.remove("is-video-placeholder");
	    wrapper.innerHTML = `
	      <iframe
	        src="${escapeHtml(embed)}"
	        title="${escapeHtml(title)}"
	        loading="lazy"
	        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
	        allowfullscreen
	      ></iframe>
	    `;
	  });

  // Topic view removed.

  function setMode(mode) {
    for (const btn of toggles) {
      const active = btn.dataset.mode === mode;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    }

    if (mode === "date") renderByDate();
    else renderSelected();

    try {
      const url = new URL(window.location.href);
      url.searchParams.set("pub", mode);
      window.history.replaceState({}, "", url.toString());
    } catch {
      // ignore
    }
  }

  function initialMode() {
    try {
      const url = new URL(window.location.href);
      const mode = url.searchParams.get("pub");
      if (mode === "date" || mode === "selected") return mode;
    } catch {
      // ignore
    }
    return "selected";
  }

  for (const btn of toggles) {
    btn.addEventListener("click", () => setMode(btn.dataset.mode || "selected"));
  }

  setMode(initialMode());
})();
