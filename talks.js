/* Minimal client-side talks renderer (no build step). */
(function () {
  try {
    /** @type {Array<{
     *  id: string,
     *  date: string, // MM/YYYY
     *  text: string,
     *  type?: string
     * }>}
     */
    const talks = [
  {
    id: "talk-2025-12-16-fulbright",
    date: "16 Dec 2025",
    text: '"The Modern American Nuclear Landscape" U.S. Fulbright Program in North Macedonia, Goce Delcev University of Stip, 2025, Invited speaker',
  },
  {
    id: "talk-2025-07-09-mtv",
    date: "9 Jul 2025",
    text: '"Understanding Early Reactor Programs" Nuclear Engineering Summer School, University of Michigan, 2025, Invited speaker',
  },
  {
    id: "talk-2025-06-04-dpg-graphite",
    date: "4 Jun 2025",
    text: '"Myths of Nuclear Graphite" U.S.-German Binational Heraeus Seminar, German Physical Society, 2025, Invited speaker',
  },
  {
    id: "talk-2025-06-04-dpg-b8",
    date: "4 Jun 2025",
    text: '"Neutronics and Criticality of the B8 Pile" U.S.-German Binational Heraeus Seminar, German Physical Society, 2025, Invited speaker',
  },
  {
    id: "talk-2024-06-12-mtv",
    date: "12 Jun 2024",
    text: '"Understanding Early Reactor Programs" Nuclear Engineering Summer School, University of Michigan, 2024, Invited speaker',
  }
  ];

    const contentEl = document.getElementById("talk-content");
    const navEl = document.querySelector(".talk-nav");
    const modeEl = document.getElementById("talk-mode");
    if (!contentEl || !modeEl) {
      const missing = [!contentEl ? "#talk-content" : null, !modeEl ? "#talk-mode" : null]
        .filter(Boolean)
        .join(", ");
      if (contentEl) contentEl.textContent = `Talks failed to load (missing: ${missing}).`;
      return;
    }

    function escapeHtml(text) {
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

  function parseYear(date) {
    const m = /^\\s*\\d{2}\\/(\\d{4})\\s*$/.exec(String(date || ""));
    return m ? Number(m[1]) : 0;
  }

  function parseMonth(date) {
    const m = /^\\s*(\\d{2})\\/\\d{4}\\s*$/.exec(String(date || ""));
    return m ? Number(m[1]) : 0;
  }

  function normalizeType(type) {
    return String(type || "").trim();
  }

  function extractTitleAndDetails(text) {
    const raw = String(text || "").trim();
    const q = /^[“"]([^”"]+)[”"]\s*,?\s*(.*)$/.exec(raw);
    if (q) return { title: q[1].trim(), details: q[2].trim() };

    const firstComma = raw.indexOf(",");
    if (firstComma === -1) return { title: raw, details: "" };
    return { title: raw.slice(0, firstComma).trim(), details: raw.slice(firstComma + 1).trim() };
  }

  function inferType(text) {
    const t = String(text || "").toLowerCase();
    if (t.includes("keynote")) return "Keynote";
    if (t.includes("panel moderator") || t.includes("moderator")) return "Moderator";
    if (t.includes("panel")) return "Panel";
    if (t.includes("invited")) return "Invited";
    return "Talk";
  }

  function sortByDateDescThenText(a, b) {
    const ay = parseYear(a.date);
    const by = parseYear(b.date);
    if (ay !== by) return by - ay;
    const am = parseMonth(a.date);
    const bm = parseMonth(b.date);
    if (am !== bm) return bm - am;
    return a.text.localeCompare(b.text);
  }

  function sortByDateAscThenText(a, b) {
    const ay = parseYear(a.date);
    const by = parseYear(b.date);
    if (ay !== by) return ay - by;
    const am = parseMonth(a.date);
    const bm = parseMonth(b.date);
    if (am !== bm) return am - bm;
    return a.text.localeCompare(b.text);
  }

  function renderTalkItem(t) {
    const type = normalizeType(t.type) || inferType(t.text);
    const td = extractTitleAndDetails(t.text);
    const details = td.details ? `<div class="talk-details">${escapeHtml(td.details)}</div>` : "";
    return `
      <li id="${escapeHtml(t.id)}">
        <span class="talk-date">${escapeHtml(t.date)}</span>
        <span class="talk-text">
          <div class="talk-title">${escapeHtml(td.title)} <span class="chip">${escapeHtml(type)}</span></div>
          ${details}
        </span>
      </li>
    `;
  }

  function renderSelected() {
    if (navEl) navEl.innerHTML = "";
    const items = talks.slice().sort(sortByDateDescThenText);
    const selected = items.slice(0, 5); // default view = 5 most recent talks
    contentEl.innerHTML = `<ul class="talks">${selected.map(renderTalkItem).join("")}</ul>`;
  }

  function renderAll() {
    if (navEl) navEl.innerHTML = "";
    const items = talks.slice().sort(sortByDateDescThenText);
    contentEl.innerHTML = `<ul class="talks">${items.map(renderTalkItem).join("")}</ul>`;
  }

  function setMode(mode) {
    if (mode === "all") renderAll();
    else renderSelected();

    try {
      const url = new URL(window.location.href);
      url.searchParams.set("talks", mode);
      window.history.replaceState({}, "", url.toString());
    } catch {
      // ignore
    }
  }

  function initialMode() {
    try {
      const url = new URL(window.location.href);
      const mode = url.searchParams.get("talks");
      if (mode === "recent" || mode === "all") return mode;
    } catch {
      // ignore
    }
    return "recent";
  }

    modeEl.addEventListener("change", () => setMode(modeEl.value || "recent"));

    const mode0 = initialMode();
    modeEl.value = mode0;
    setMode(mode0);
  } catch (err) {
    const el = document.getElementById("talk-content");
    if (el) {
      el.textContent =
        "Talks failed to load. Open DevTools Console to see the error.";
    }
    // eslint-disable-next-line no-console
    console.error("Talks failed to load:", err);
  }
})();
