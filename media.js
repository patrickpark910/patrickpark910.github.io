/* Minimal client-side media preview renderer (no build step). */
(function () {
  const mediaItems = [
    // Only the first 3 are shown as preview cards.
    {
      url: "https://engineering.uci.edu/news/2024/5/uci-led-team-selected-department-defense-multi-university-initiative-investigating",
      siteName: "UCI Engineering",
      title: "UCI-led team selected for Department of Defense multi-university initiative",
      description:
        "News release from the Samueli School of Engineering (UCI). Preview rendered locally to avoid external preview blocking.",
      image: "https://engineering.uci.edu/files/won_reduced.jpg",
    },
    {
      url: "https://youtu.be/GLsC6FM6viY",
      siteName: "YouTube",
      title: "YouTube video",
      description: "Watch on YouTube.",
      embed: "youtube",
    },
    {
      url: "https://youtu.be/7VOwF5kTlh4",
      siteName: "YouTube",
      title: "YouTube video",
      description: "Watch on YouTube.",
      embed: "youtube",
    },
    "https://engineering.uci.edu/news/2023/6/egerstedt-presents-2023-faculty-awards",
    "https://www.linkedin.com/posts/university-of-california-irvine_speakup4science-activity-7377008499609944064-d8aX/",
  ];

  const gridEl = document.getElementById("media-grid");
  const listEl = document.getElementById("media-list");
  if (!gridEl && !listEl) return;

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function domainFromUrl(url) {
    try {
      return new URL(url).hostname.replace(/^www\\./, "");
    } catch {
      return url;
    }
  }

  function faviconUrl(url) {
    const domain = domainFromUrl(url);
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  }

  function youtubeId(url) {
    const raw = String(url || "");
    const m1 = /^https?:\/\/youtu\.be\/([A-Za-z0-9_-]{6,})/.exec(raw);
    const m2 =
      /^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{6,})/.exec(raw) ||
      /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/.exec(raw);
    return (m1 && m1[1]) || (m2 && m2[1]) || "";
  }

  function youtubeThumb(url) {
    const id = youtubeId(url);
    if (!id) return "";
    return `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;
  }

  function youtubeEmbedUrl(url) {
    const id = youtubeId(url);
    if (!id) return "";
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`;
  }

  function renderFallbackCard(url) {
    const domain = domainFromUrl(url);
    return `
      <a class="media-card" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
        <div class="media-card-body">
          <div class="media-card-kicker">
            <img class="media-favicon" src="${escapeHtml(faviconUrl(url))}" alt="" aria-hidden="true" />
            <span>${escapeHtml(domain)}</span>
          </div>
          <div class="media-card-title">${escapeHtml(url)}</div>
        </div>
      </a>
    `;
  }

  function renderYoutubeEmbedCard(meta) {
    const url = meta.url;
    const domain = domainFromUrl(url);
    const embedUrl = youtubeEmbedUrl(url);
    const title = meta.title || "YouTube video";
    const description = meta.description || "";

    if (!embedUrl) return renderFallbackCard(url);

    const desc = description ? `<div class="media-card-desc">${escapeHtml(description)}</div>` : "";

    return `
      <div class="media-card" role="article">
        <div class="media-card-embed">
          <iframe
            src="${escapeHtml(embedUrl)}"
            title="${escapeHtml(title)}"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
        <div class="media-card-body">
          <div class="media-card-kicker">
            <img class="media-favicon" src="${escapeHtml(faviconUrl(url))}" alt="" aria-hidden="true" />
            <span>${escapeHtml(meta.siteName || domain)}</span>
          </div>
          <div class="media-card-title">${escapeHtml(title)}</div>
          ${desc}
          <div class="media-card-actions">
            <a class="media-card-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Open on YouTube</a>
          </div>
        </div>
      </div>
    `;
  }

  function renderCard(meta) {
    const url = meta.url;
    const domain = domainFromUrl(url);
    const title = meta.title || url;
    const description = meta.description || "";
    const image = meta.image || youtubeThumb(url) || "";

    if (meta.embed === "youtube") return renderYoutubeEmbedCard(meta);

    const img = image
      ? `<div class="media-card-image"><img src="${escapeHtml(image)}" alt="" loading="lazy" /></div>`
      : `<div class="media-card-image is-empty" aria-hidden="true"></div>`;

    const desc = description ? `<div class="media-card-desc">${escapeHtml(description)}</div>` : "";

    return `
      <a class="media-card" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
        ${img}
        <div class="media-card-body">
          <div class="media-card-kicker">
            <img class="media-favicon" src="${escapeHtml(faviconUrl(url))}" alt="" aria-hidden="true" />
            <span>${escapeHtml(meta.siteName || domain)}</span>
          </div>
          <div class="media-card-title">${escapeHtml(title)}</div>
          ${desc}
        </div>
      </a>
    `;
  }

  async function fetchOgMeta(url) {
    // Browsers block cross-origin HTML fetches for many sites (CORS).
    // Use a CORS-friendly text proxy. If it fails, we fall back gracefully.
    const proxyUrl = `https://r.jina.ai/http://${url.replace(/^https?:\\/\\//, "")}`;

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 4500);
    try {
      const res = await fetch(proxyUrl, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, "text/html");

      const pick = (sel) => doc.querySelector(sel)?.getAttribute("content")?.trim() || "";
      const title =
        pick('meta[property=\"og:title\"]') ||
        pick('meta[name=\"twitter:title\"]') ||
        (doc.querySelector("title")?.textContent || "").trim();
      const description =
        pick('meta[property=\"og:description\"]') ||
        pick('meta[name=\"description\"]') ||
        pick('meta[name=\"twitter:description\"]');
      const image = pick('meta[property=\"og:image\"]') || pick('meta[name=\"twitter:image\"]');
      const siteName = pick('meta[property=\"og:site_name\"]');

      let imageAbs = "";
      if (image) {
        try {
          imageAbs = new URL(image, url).toString();
        } catch {
          imageAbs = "";
        }
      }

      return {
        url,
        title: title || "",
        description: description || "",
        image: imageAbs,
        siteName: siteName || "",
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async function render() {
    const normalized = mediaItems
      .map((item) => (typeof item === "string" ? { url: item } : item))
      .filter((item) => item && item.url);
    const allLinks = normalized.map((i) => i.url);
    const links = allLinks.slice(0, 3);

    if (listEl && listEl.dataset.static !== "true") {
      listEl.innerHTML = allLinks
        .map((url) => {
          const domain = domainFromUrl(url);
          return `<li><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(domain)}</a><span class="media-url">${escapeHtml(url)}</span></li>`;
        })
        .join("");
    }

    if (gridEl && gridEl.dataset.static === "true") return;
    if (!gridEl) return;
    if (links.length === 0) {
      gridEl.innerHTML =
        '<p class=\"pub-empty\">Add up to 3 links in <code>media.js</code> to show previews here.</p>';
      return;
    }

    // Render immediate cards for the top 3 (manual meta first, then fallback cards).
    const top3 = normalized.slice(0, 3);
    gridEl.innerHTML = top3
      .map((m) => (m.title || m.description || m.image ? renderCard(m) : renderFallbackCard(m.url)))
      .join("");

    // Upgrade cards with OG metadata when possible.
    const metas = await Promise.all(
      links.map(async (url) => {
        // If manual meta exists for this URL, skip fetching.
        const manual = top3.find((m) => m.url === url);
        if (manual && (manual.title || manual.description || manual.image)) return manual;
        try {
          return await fetchOgMeta(url);
        } catch {
          return { url };
        }
      })
    );

    gridEl.innerHTML = metas
      .map((m) => (m.title || m.description || m.image ? renderCard(m) : renderFallbackCard(m.url)))
      .join("");
  }

  render();
})();
