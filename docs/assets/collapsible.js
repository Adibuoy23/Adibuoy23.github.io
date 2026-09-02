/* Collapsible sections on the research page.
   Headings stay real h2/h3 elements so the sidebar table of contents
   (toc.integrate) still builds its tree from them — only the content that
   follows each heading is wrapped and folded.

   Nesting: h3 project bodies are wrapped first, then each h2 section wraps the
   h3 headings *and* their wrappers, so folding a section takes its projects
   with it. */
(function () {
  const SCOPE = /\/research\//;

  function bodyOf(h) {
    const next = h.nextElementSibling;
    return next && next.classList.contains("sec-body") ? next : null;
  }

  function setOpen(h, open) {
    const body = bodyOf(h);
    if (!body) return;
    body.hidden = !open;
    h.setAttribute("aria-expanded", open ? "true" : "false");
    h.classList.toggle("is-collapsed", !open);
  }

  function isOpen(h) {
    return h.getAttribute("aria-expanded") === "true";
  }

  /* Wrap the run of siblings after each heading of `tag`, stopping at any
     heading in `stops`. */
  function wrap(article, tag, stops) {
    Array.from(article.querySelectorAll(tag)).forEach(function (h) {
      if (h.dataset.collapsible) return;
      h.dataset.collapsible = "1";

      const body = document.createElement("div");
      body.className = "sec-body sec-body--" + tag;
      let n = h.nextElementSibling;
      while (n && stops.indexOf(n.tagName) === -1) {
        const next = n.nextElementSibling;
        body.appendChild(n);
        n = next;
      }
      if (!body.childElementCount) return;
      h.parentNode.insertBefore(body, n);

      h.classList.add("sec-toggle", "sec-toggle--" + tag);
      h.setAttribute("role", "button");
      h.setAttribute("tabindex", "0");
      setOpen(h, true);

      h.addEventListener("click", function (e) {
        if (e.target.closest("a")) return;   // leave the ¶ permalink alone
        setOpen(h, !isOpen(h));
      });
      h.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen(h, !isOpen(h));
        }
      });
    });
  }

  function init() {
    if (!SCOPE.test(window.location.pathname)) return;
    const article = document.querySelector(".md-content__inner .md-typeset") ||
                    document.querySelector(".md-typeset");
    if (!article) return;

    // Deepest level first, so sections can absorb the project wrappers.
    wrap(article, "h2", ["H1", "H2", "HR"]);
    wrap(article, "h1", ["H1", "H2", "HR"]);

    const toggles = Array.from(article.querySelectorAll(".sec-toggle"));
    if (!toggles.length) return;

    // A link to a nested heading must open every fold above it.
    function reveal(id) {
      const target = id && document.getElementById(id);
      if (!target) return;
      let node = target;
      while (node && node !== article) {
        if (node.classList && node.classList.contains("sec-body")) {
          const owner = node.previousElementSibling;
          if (owner && owner.classList.contains("sec-toggle")) setOpen(owner, true);
        }
        node = node.parentElement;
      }
      if (target.classList.contains("sec-toggle")) setOpen(target, true);
      target.scrollIntoView({ block: "start" });
    }
    function fromHash() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id) reveal(id);
    }
    window.addEventListener("hashchange", fromHash);
    fromHash();

    // Expand / collapse all.
    const sections = article.querySelectorAll("h2.sec-toggle");
    if (sections.length > 1 && !article.querySelector(".sec-controls")) {
      const bar = document.createElement("p");
      bar.className = "sec-controls";
      const mk = function (label, open) {
        const b = document.createElement("button");
        b.className = "sec-control";
        b.textContent = label;
        b.addEventListener("click", function () {
          toggles.forEach(function (h) { setOpen(h, open); });
        });
        return b;
      };
      bar.appendChild(mk("Expand all", true));
      bar.appendChild(mk("Collapse all", false));
      sections[0].parentNode.insertBefore(bar, sections[0]);
    }
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
