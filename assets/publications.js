/* Theme filtering for the publications page.
   Themes live in data-themes on each .pub; state is mirrored into ?theme= so a
   filtered view can be linked to directly. */
(function () {
  const LABELS = {
    perception: "Perception",
    attention: "Attention",
    memory: "Memory",
    "event-cognition": "Event cognition",
    narrative: "Narrative comprehension",
    psycholinguistics: "Psycholinguistics",
    "cognitive-aging": "Cognitive aging",
  };

  function init() {
    const filter = document.querySelector(".pub-filter");
    if (!filter) return;

    const chips = Array.from(filter.querySelectorAll(".pub-chip"));
    const pubs = Array.from(document.querySelectorAll(".pub"));
    const groups = Array.from(document.querySelectorAll(".pub-group"));
    const count = filter.querySelector(".pub-count");
    const empty = document.querySelector(".pub-empty");
    if (!pubs.length) return;

    // Tag each entry with its themes so readers can see them without filtering.
    pubs.forEach(function (pub) {
      if (pub.querySelector(".pub-tags")) return;
      const themes = (pub.dataset.themes || "").split(/\s+/).filter(Boolean);
      if (!themes.length) return;
      const tags = document.createElement("p");
      tags.className = "pub-tags";
      themes.forEach(function (t) {
        const tag = document.createElement("button");
        tag.className = "pub-tag";
        tag.dataset.theme = t;
        tag.textContent = LABELS[t] || t;
        tag.title = "Show only " + (LABELS[t] || t);
        tags.appendChild(tag);
      });
      pub.appendChild(tags);
    });

    function apply(theme, push) {
      const all = theme === "all";
      let shown = 0;

      pubs.forEach(function (pub) {
        const themes = (pub.dataset.themes || "").split(/\s+/);
        const match = all || themes.indexOf(theme) !== -1;
        pub.hidden = !match;
        if (match) shown++;
      });

      // Hide a section heading when nothing under it survives the filter.
      groups.forEach(function (group) {
        const visible = group.querySelectorAll(".pub:not([hidden])").length;
        group.hidden = visible === 0;
      });

      chips.forEach(function (chip) {
        chip.classList.toggle("is-active", chip.dataset.theme === theme);
      });
      document.querySelectorAll(".pub-tag").forEach(function (tag) {
        tag.classList.toggle("is-active", !all && tag.dataset.theme === theme);
      });

      if (empty) empty.hidden = shown !== 0;
      if (count) {
        count.textContent = all
          ? "Showing all " + pubs.length + " publications."
          : "Showing " + shown + " of " + pubs.length +
            " publications in " + (LABELS[theme] || theme) + ".";
      }

      if (push) {
        const url = new URL(window.location.href);
        if (all) url.searchParams.delete("theme");
        else url.searchParams.set("theme", theme);
        history.replaceState(null, "", url);
      }
    }

    filter.addEventListener("click", function (e) {
      const chip = e.target.closest(".pub-chip");
      if (chip) apply(chip.dataset.theme, true);
    });

    document.addEventListener("click", function (e) {
      const tag = e.target.closest(".pub-tag");
      if (!tag) return;
      // Clicking an active tag clears the filter.
      apply(tag.classList.contains("is-active") ? "all" : tag.dataset.theme, true);
      filter.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    const initial = new URL(window.location.href).searchParams.get("theme");
    apply(initial && LABELS[initial] ? initial : "all", false);
  }

  // Material's instant navigation swaps page content without a reload.
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
