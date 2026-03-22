/* Minimal client-side talks renderer (no build step). */
(function () {
  try {
    const talks = [
      {
        id: "talk-2025-12-16-fulbright",
        date: "16 Dec 2025",
        title: "The Modern American Nuclear Landscape",
        details: "U.S. Fulbright Program in North Macedonia, Goce Delcev University of Stip (Remote)",
        type: "Invited"
      },
      {
        id: "talk-2025-07-09-mtv",
        date: "09 Jul 2025",
        title: "Understanding Early Reactor Programs",
        details: "Nuclear Engineering Summer School, University of Michigan, Ann Arbor (Remote)",
        type: "Invited"
      },
      {
        id: "talk-2025-06-04-dpg-graphite",
        date: "04 Jun 2025",
        title: "Myths of Nuclear Graphite",
        details: "U.S.-German Binational Heraeus Seminar, German Physical Society (Phyzikzentrum Bad Honnef, Germany)",
        type: "Invited"
      },
      {
        id: "talk-2025-06-04-dpg-b8",
        date: "04 Jun 2025",
        title: "Neutronics and Criticality of the B8 Pile",
        details: "U.S.-German Binational Heraeus Seminar, German Physical Society (Phyzikzentrum Bad Honnef, Germany)",
        type: "Invited"
      },
      {
        id: "talk-2024-06-12-mtv",
        date: "12 Jun 2024",
        title: "Understanding Early Reactor Programs",
        details: "Nuclear Engineering Summer School, University of Michigan, Ann Arbor (Remote)",
        type: "Invited"
      },
      {
        id: "talk-2025-08-27-inmm",
        date: "27 Aug 2025",
        title: "Resonance Absorption Effects in D-T Fusion Blankets",
        details: "66th Annual Meeting of the Institute of Nuclear Materials Management (Washington, DC)",
        type: "Conference"
      },
      {
        id: "talk-2025-06-06-nnsa-florida",
        date: "06 Jun 2025",
        title: "Nuclear and Imagery Analysis of North Korea's Experimental Light Water Reactor",
        details: "DOE NNSA University Program Review, University of Florida, Gainesville",
        type: "Conference"
      },
      {
        id: "talk-2025-02-27-mtv",
        date: "27 Feb 2025",
        title: "Nuclear and Imagery Analysis of North Korea's Experimental Light Water Reactor",
        details: "DOE NNSA Consortium for Monitoring Technology and Verification, University of Michigan, Ann Arbor",
        type: "Conference"
      },
      {
        id: "talk-2024-10-15-sgs",
        date: "15 Oct 2024",
        title: "Nuclear and Imagery Analysis of North Korea's Experimental Light Water Reactor",
        details: "School on Science and Global Security, Princeton University",
        type: "Conference"
      },
      {
        id: "talk-2024-08-06-inmm",
        date: "06 Aug 2024",
        title: "Nuclear Forensics of the B8: Heisenberg's Last Reactor",
        details: "65th Annual Meeting of the Institute of Nuclear Materials Management (Portland, OR)",
        type: "Conference"
      },
      {
        id: "talk-2024-06-06-nnsa-texas",
        date: "06 Jun 2024",
        title: "Understanding Early Reactor Programs: Nuclear Archaeology of Heisenberg's B8 Pile",
        details: "DOE NNSA University Program Review, Texas A&M University, College Station",
        type: "Conference"
      },
      {
        id: "talk-2024-03-25-mtv",
        date: "25 Mar 2024",
        title: "Nuclear Archaeology of Heisenberg's B8 Pile --- *Best Talk",
        details: "DOE NNSA Consortium for Monitoring Technology and Verification, University of Michigan, Ann Arbor",
        type: "Conference"
      },
      {
        id: "talk-2024-10-15-sgs-1945",
        date: "15 Oct 2024",
        title: "Nuclear Forensics and Analysis of the 1945 B8 Reactor",
        details: "School on Science and Global Security, Princeton University",
        type: "Conference"
      },
      {
        id: "talk-2022-10-13-notr",
        date: "13 Oct 2022",
        title: "New Neutronics Analysis of Heisenberg's B8 Reactor with the Total German Uranium Inventory",
        details: "Nat'l Org. of Test, Research, and Training Reactors Annual Meeting, Pennsylvania State University",
        type: "Conference"
      },
      {
        id: "talk-2022-10-13-notr-pube",
        date: "13 Oct 2022",
        title: "Flux Characterization and Validation of a 9 Ci PuBe Neutron Source, with A. Oliveri",
        details: "Nat'l Org. of Test, Research, and Training Reactors Annual Meeting, Pennsylvania State University",
        type: "Conference"
      },
      {
        id: "talk-2021-10-20-notr",
        date: "20 Oct 2021",
        title: "Nuclear Analysis of Reed Core 49 with Python-Scripted Templating of MCNP Code",
        details: "Nat'l Org. of Test, Research, and Training Reactors Annual Meeting, Virtual (COVID)",
        type: "Conference"
      },
      {
        id: "talk-2021-04-10-ans",
        date: "10 Apr 2021",
        title: "Preliminary Python-Automated Neutronics Analysis for the Reed Research Reactor",
        details: "Annual Student Conference, American Nuclear Society, Virtual (COVID)",
        type: "Conference"
      },
      {
        id: "talk-2021-03-06-ans-oregon",
        date: "06 Mar 2021",
        title: "Uses of Python Automation of MCNP Calculations at TRIGA Reactors",
        details: "10th Annual Oregon Chapter Conference, American Nuclear Society, Virtual (COVID)",
        type: "Conference"
      },
      {
        id: "talk-2020-09-28-notr",
        date: "28 Sep 2020",
        title: "MCNP Learning Opportunities from a Liberal Arts College",
        details: "Nat'l Org. of Test, Research, and Training Reactors Annual Meeting, Virtual (COVID)",
        type: "Conference"
      },
      {
        id: "talk-2020-02-07-reed",
        date: "07 Feb 2020",
        title: "Post-Fukushima Nuclear Safety and Research Practices in South Korea",
        details: "Board of Trustees Winter Assembly, Reed College",
        type: "Conference"
      },
      {
        id: "talk-2019-09-11-reed",
        date: "11 Sep 2019",
        title: "Design and Integration of an Automated Sample Changer for a TRIGA Reactor",
        details: "Research Seminar, Department of Physics, Reed College",
        type: "Conference"
      }
    ];

    /* ── DOM references (match the actual HTML) ── */
    const recentList = document.querySelector("#talks-recent ul");
    const allList = document.querySelector("#talks-all ul");
    const recentView = document.getElementById("talks-recent");
    const allView = document.getElementById("talks-all");
    const navEl = document.querySelector(".talks-nav");
    const toggleBtns = document.querySelectorAll(".talks-toggle");

    if (!recentList || !allList) {
      console.error("Talks: missing #talks-recent or #talks-all <ul>.");
      return;
    }

    /* ── Helpers ── */
    function escapeHtml(text) {
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function parseDateForSort(dateStr) {
      return new Date(dateStr);
    }

    function renderItem(t) {
      var type = t.type || "Talk";
      var chipHtml = ' <span class="chip">' + escapeHtml(type) + "</span>";
      var detailsHtml = t.details
        ? '<div class="talk-details">' + escapeHtml(t.details) + "</div>"
        : "";
      return '<li id="' + escapeHtml(t.id) + '" data-talk-type="' + escapeHtml(type) + '">'
        + '<span class="talk-date">' + escapeHtml(t.date) + "</span>"
        + '<span class="talk-text">'
        + '<div class="talk-title">' + escapeHtml(t.title) + chipHtml + "</div>"
        + detailsHtml
        + "</span></li>";
    }

    /* ── Sort (newest first) ── */
    var sorted = talks.slice().sort(
      function (a, b) { return parseDateForSort(b.date) - parseDateForSort(a.date); }
    );

    /* ── Populate: recent (top 3) ── */
    var RECENT_COUNT = 3;
    recentList.innerHTML = sorted.slice(0, RECENT_COUNT).map(renderItem).join("");

    /* ── Populate: all (grouped by type) ── */
    var types = ["Invited", "Conference"]; // display order
    var grouped = {};
    sorted.forEach(function (t) {
      var key = t.type || "Talk";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(t);
    });

    var allHtml = "";
    types.forEach(function (type) {
      if (!grouped[type] || grouped[type].length === 0) return;
      allHtml += '<li class="talk-type-heading" data-talk-type="' + escapeHtml(type) + '"><h3>' + escapeHtml(type) + "</h3></li>";
      allHtml += grouped[type].map(renderItem).join("");
    });
    allList.innerHTML = allHtml;

    /* ── Type-filter nav (shown in "all" mode) ── */
    if (navEl) {
      navEl.innerHTML = types
        .filter(function (type) { return grouped[type] && grouped[type].length > 0; })
        .map(function (type) {
          return '<button class="pub-toggle talk-type-filter is-active" type="button" aria-pressed="true" data-type="'
            + escapeHtml(type) + '">' + escapeHtml(type)
            + " (" + grouped[type].length + ")</button>";
        })
        .join(" ");

      var filterBtns = navEl.querySelectorAll(".talk-type-filter");
      filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          var wasActive = btn.classList.contains("is-active");
          btn.classList.toggle("is-active");
          btn.setAttribute("aria-pressed", String(!wasActive));
          var activeTypes = [];
          navEl.querySelectorAll(".talk-type-filter.is-active").forEach(function (b) {
            activeTypes.push(b.getAttribute("data-type"));
          });
          allList.querySelectorAll("li").forEach(function (li) {
            var liType = li.getAttribute("data-talk-type");
            li.style.display = activeTypes.indexOf(liType) === -1 ? "none" : "";
          });
        });
      });
    }

    /* ── Toggle buttons ── */
    function setMode(mode) {
      if (mode === "type") {
        recentView.hidden = true;
        allView.hidden = false;
        if (navEl) navEl.hidden = false;
      } else {
        recentView.hidden = false;
        allView.hidden = true;
        if (navEl) navEl.hidden = true;
      }

      toggleBtns.forEach(function (btn) {
        var isActive = btn.dataset.mode === mode;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });
    }

    toggleBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setMode(btn.dataset.mode);
      });
    });

    /* ── Initial state ── */
    setMode("selected");

  } catch (err) {
    console.error("Talks failed to load:", err);
  }
})();