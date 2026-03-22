/* Minimal client-side media preview renderer (no build step). */
(function () {
  const mediaItems = [
    // Only the first 3 are shown as preview cards.
    {
      url: "https://youtu.be/0vFNLbHs3Dk?si=GcrQ9k53t7kcbebh",
      siteName: "YouTube",
      title: "Understanding Early Reactor Programs",
      description: "UMichigan, Nuclear Engineering Summer School 2025",
      embed: "youtube",
      date: "09 Jul 2025",
    },
    {
      url: "https://www.epj.org/epjh-news/2904-epjh-highlight-revisiting-the-failure-of-germanys-wartime-nuclear-program",
      siteName: "European Physical Journal",
      title: "Article Highlight: Revisiting Germany’s wartime nuclear program",
      description: "Analysis suggests that the failure of Germany's nuclear program during World War II was strongly tied to the lack of petroleum coke with which to make high-purity graphite: a material which the more successful American program had in abundance.",
      image: "https://web.archive.org/web/20250706030051im_/https://www.epj.org/images/stories/news/2025/Walther_Bothe_1950s.jpg",
      date: "01 May 2024",
    },
    {
      url: "https://www.reed.edu/reed-magazine/articles/2021/goldwater-park-physics.html",
      siteName: "Reed College",
      title: "Physics Junior Receives Goldwater Scholarship",
      description: "Congratulations to Patrick Park ’22 for being named a Goldwater Scholar for demonstrating exceptional promise, intellectual intensity, and a commitment to research in the field of nuclear physics.",
      image: "https://www.reed.edu/reed-magazine/assets/images/2021/Patrick-Park-22.jpg",
      date: "29 Apr 2021",
    },

  ];

  const gridEl = document.getElementById("media-grid");
  const listEl = document.getElementById("media-list");
  if (!gridEl && !listEl) return;

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function domainFromUrl(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
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

  /* Format a date string (YYYY-MM-DD) as MM/YYYY for the list view. */
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length >= 2) return parts[1] + "/" + parts[0];
    return dateStr;
  }

  /* Render a single list item in the talks style: date | title + link. */
  function renderListItem(item) {
    const domain = domainFromUrl(item.url);
    const title = item.title || domain;
    const date = formatDate(item.date);

    return `<li>
      <span class="talk-date">${escapeHtml(date)}</span>
      <span class="talk-text">
        <div class="talk-title">${escapeHtml(title)}</div>
        <div class="talk-details">
          <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(domain)}</a>
        </div>
      </span>
    </li>`;
  }

  function render() {
    const normalized = mediaItems
      .map((item) => (typeof item === "string" ? { url: item } : item))
      .filter((item) => item && item.url);

    // Populate the "Show all" list in talks style (date + title + link).
    if (listEl && listEl.dataset.static !== "true") {
      listEl.innerHTML = normalized.map(renderListItem).join("");
    }

    // Populate the top-3 preview card grid.
    if (gridEl && gridEl.dataset.static === "true") return;
    if (!gridEl) return;

    const top3 = normalized.slice(0, 3);
    if (top3.length === 0) {
      gridEl.innerHTML =
        '<p class="pub-empty">Add links in <code>media.js</code> to show previews here.</p>';
      return;
    }

    gridEl.innerHTML = top3
      .map((m) => (m.title || m.description || m.image ? renderCard(m) : renderFallbackCard(m.url)))
      .join("");
  }

  render();
})();