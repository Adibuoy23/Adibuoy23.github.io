/* Keep looping figure videos playing.
   Two things stop them on their own:
   1. Material's instant navigation swaps in page content via XHR, and an
      `autoplay` attribute is only honoured when the element is parsed, not when
      it is inserted.
   2. Moving a <video> in the DOM (the collapsible-section script wraps content
      into a container) pauses it.
   So explicitly ask each one to play, and retry once the media is ready. */
(function () {
  function start(v) {
    if (!v.dataset.autoplayBound) {
      v.dataset.autoplayBound = "1";
      v.addEventListener("canplay", function () { v.play().catch(function () {}); });
      // If the browser blocks autoplay outright, let a click start it.
      v.addEventListener("click", function () {
        if (v.paused) v.play().catch(function () {});
      });
    }
    v.muted = true;              // required for autoplay in every current browser
    const p = v.play();
    if (p && p.catch) p.catch(function () {});
  }


  /* Figures marked [data-hover-play] stay on their poster frame until the reader
     hovers (or focuses, or taps). Keeps the page still by default and avoids
     downloading the clip until it is wanted. */
  function bindHover(v) {
    if (v.dataset.hoverBound) return;
    v.dataset.hoverBound = "1";
    v.muted = true;
    const fig = v.closest("figure") || v;

    /* The resting image is a still <img> layered over the video, not a seeked
       video frame: media is only seekable when the host serves HTTP Range
       requests, which is not guaranteed. Showing/hiding the overlay works
       everywhere. */
    function play() {
      if (v.preload === "none") v.preload = "auto";
      fig.classList.add("is-playing");
      const p = v.play();
      if (p && p.catch) p.catch(function () { fig.classList.remove("is-playing"); });
    }
    function stop() {
      v.pause();
      fig.classList.remove("is-playing");
    }

    fig.addEventListener("mouseenter", play);
    fig.addEventListener("mouseleave", stop);
    v.setAttribute("tabindex", "0");
    v.addEventListener("focus", play);
    v.addEventListener("blur", stop);
    fig.addEventListener("click", function () { v.paused ? play() : stop(); });
    v.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); v.paused ? play() : stop(); }
    });
  }

  function init() {
    document.querySelectorAll("video[autoplay]").forEach(start);
    document.querySelectorAll("video[data-hover-play]").forEach(bindHover);
    // The collapsible script relocates content just after load; re-assert then.
    setTimeout(function () {
      document.querySelectorAll("video[autoplay]").forEach(function (v) {
        if (v.paused) start(v);
      });
    }, 300);
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
