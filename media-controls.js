/* Minimal client-side media view toggles (no build step). */
(function () {
  function setMediaMode(mode, opts) {
    const normalizedMode = mode === "all" ? "all" : "selected";
    const selectedView = document.getElementById("media-recent");
    const allView = document.getElementById("media-all");
    if (!selectedView || !allView) return;

    const buttons = Array.from(document.querySelectorAll(".media-toggle"));
    for (const btn of buttons) {
      const isActive = btn.dataset.mode === normalizedMode;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    }

    if (normalizedMode === "all") {
      // Show both: thumbnails + full list.
      selectedView.hidden = false;
      allView.hidden = false;
      selectedView.removeAttribute("hidden");
      allView.removeAttribute("hidden");
      selectedView.style.display = "";
      allView.style.display = "";
    } else {
      // Selected: thumbnails only.
      allView.hidden = true;
      selectedView.hidden = false;
      allView.setAttribute("hidden", "");
      selectedView.removeAttribute("hidden");
      allView.style.display = "none";
      selectedView.style.display = "";
    }

    if (opts && opts.updateHash) {
      // Keep the URL stable without jumping the page; #media-all can scroll past thumbnails.
      const next = normalizedMode === "all" ? "#media" : "#media-recent";
      if (typeof history !== "undefined" && history.replaceState) {
        history.replaceState(null, "", next);
      } else {
        location.hash = next;
      }
    }
  }

  document.addEventListener("click", (e) => {
    const btn = e.target && e.target.closest ? e.target.closest(".media-toggle") : null;
    if (!btn) return;
    e.preventDefault();
    setMediaMode(btn.dataset.mode || "selected", { updateHash: true });
  });

  // Initial mode from hash.
  const initial =
    typeof location !== "undefined" && location.hash === "#media-all" ? "all" : "selected";
  setMediaMode(initial, { updateHash: false });
})();
