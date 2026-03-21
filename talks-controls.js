/* Minimal client-side talks view toggles (no build step). */
(function () {
  function buildTalksByType() {
    const source = document.querySelector("#talks-all .talks");
    const target = document.getElementById("talks-type");
    const nav = document.querySelector(".talks-nav");
    if (!source || !target) return;
    if (target.dataset.built === "true") return;

    const items = Array.from(source.querySelectorAll("li"));
    /** @type {Map<string, HTMLLIElement[]>} */
    const groups = new Map();

    for (const li of items) {
      const chip = li.querySelector(".talk-title .chip");
      let type = (chip ? chip.textContent : "Other")?.trim() || "Other";
      if (type === "Moderator") type = "Panel";
      if (!groups.has(type)) groups.set(type, []);
      groups.get(type).push(li);
    }

    const preferredOrder = ["Keynote", "Invited", "Panel", "Talk", "Other"];
    const types = Array.from(groups.keys()).sort((a, b) => {
      const ai = preferredOrder.indexOf(a);
      const bi = preferredOrder.indexOf(b);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      return a.localeCompare(b);
    });

    const slug = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const html = types
      .map((type) => {
        const id = `talk-type-${slug(type) || "other"}`;
        const lis = groups
          .get(type)
          .map((li) => li.outerHTML)
          .join("");
        return `<section class="talks-type-section" id="${id}"><h3 class="talks-type-heading">${type}</h3><ul class="talks">${lis}</ul></section>`;
      })
      .join("");

    target.innerHTML = html || '<p class="pub-empty">No talks to show.</p>';

    if (nav) {
      const filterTypes = ["Keynote", "Invited", "Panel", "Talk"].filter((t) => groups.has(t));
      const links = filterTypes
        .map((t) => `<a class="pub-nav-link" href="#talk-type-${slug(t)}">${t}</a>`)
        .join("");
      nav.innerHTML = `<div class="pub-nav-row"><span class="pub-nav-label">Type:</span>${links}</div>`;
    }

    target.dataset.built = "true";
  }

  function setTalksMode(mode) {
    const selectedView = document.getElementById("talks-recent");
    const typeView = document.getElementById("talks-type");
    const nav = document.querySelector(".talks-nav");
    if (!selectedView || !typeView) return;

    const buttons = Array.from(document.querySelectorAll(".talks-toggle"));
    for (const btn of buttons) {
      const isActive = btn.dataset.mode === mode;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    }

    if (mode === "type") {
      buildTalksByType();
      selectedView.hidden = true;
      typeView.hidden = false;
      if (nav) nav.hidden = false;
    } else {
      typeView.hidden = true;
      selectedView.hidden = false;
      if (nav) nav.hidden = true;
    }
  }

  document.addEventListener("click", (e) => {
    const btn = e.target && e.target.closest ? e.target.closest(".talks-toggle") : null;
    if (!btn) return;
    e.preventDefault();
    setTalksMode(btn.dataset.mode || "selected");
  });

  // Default mode.
  setTalksMode("selected");
})();
