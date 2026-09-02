# adibuoy23.github.io

Personal academic site for Aditya Upadhyayula, built with
[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) and deployed to GitHub
Pages by the workflow in `.github/workflows/deploy.yml`.

**Push to `master` and the site rebuilds and deploys itself.** There is nothing to run by
hand.

---

## Working on the site locally

You only need this to preview changes before pushing.

```bash
python3 -m venv .venv                  # first time only
./.venv/bin/pip install -r requirements.txt
./.venv/bin/mkdocs serve
```

Open <http://127.0.0.1:8000>. The preview reloads as you save. Stop it with `Ctrl-C`.

Before pushing, check the build is clean:

```bash
./.venv/bin/mkdocs build --strict
```

`--strict` turns broken internal links and bad references into errors. The deploy workflow
uses it too, so if this passes locally the deploy will not fail on links.

---

## Where everything lives

```
mkdocs.yml                     site config: nav, theme, palette, fonts
docs/
├── index.md                   home page
├── publications.md            publication list + theme filter
├── cv.md                      CV page
├── blog/index.md              blog placeholder
├── resources/index.md         dissertation + experiment demos
├── research/
│   ├── index.md               research overview (three cards)
│   ├── perceived/             theme: How is information perceived?
│   │   ├── index.md           theme page (grid of project cards)
│   │   └── <project>.md       one file per project
│   ├── remembered/            theme: How is information remembered?
│   └── organized/             theme: How is information organized?
└── assets/
    ├── images/                figures, portrait, logo
    ├── files/                 CV and paper PDFs
    ├── extra.css              all custom styling
    ├── publications.js        theme filtering on the publications page
    ├── collapsible.js         collapsible sections on research pages
    └── video.js               autoplay + hover-to-play video handling
```

---

## Adding a new project to a research theme

Three steps: write the page, add a card, add it to the nav.

### 1. Write the project page

Create `docs/research/<theme>/<slug>.md`, where `<theme>` is `perceived`, `remembered` or
`organized`, and `<slug>` is short and hyphenated (it becomes the URL).

```markdown
# Does X explain Y?

A short paragraph — two or three sentences. Lead with the finding, not the setup. Bold
**the one claim** you want a skimming reader to take away.

![Alt text describing the figure](../../assets/images/fig-example.png)

*Author, Author & Author (2026), Journal Name.*
[:material-file-document: Paper](https://doi.org/...) ·
[:material-database: Data & code](https://osf.io/...)

---

[:octicons-arrow-left-24: Back to How is information perceived?](index.md)
```

Path rules, which trip people up:

- **In Markdown** (`![...](...)`, `[...](...)`), paths are relative to *the file*. From a
  project page that is `../../assets/images/…`.
- **In raw HTML** (`<img src>`, `<video src>`), MkDocs does *not* rewrite paths — they are
  relative to the *page URL*, so you need one more `../`. From
  `/research/perceived/<slug>/` that is `../../../assets/images/…`.

If an image silently fails to appear, this is almost always why.

### 2. Add a card on the theme page

Open `docs/research/<theme>/index.md` and copy an existing `<a class="proj-card">` block:

```html
  <a class="proj-card" href="<slug>/">
    <span class="proj-card__thumb"><img src="../../assets/images/fig-example.png" alt="" loading="lazy"></span>
    <span class="proj-card__text">
      <span class="proj-card__title">Does X explain Y?</span>
      <span class="proj-card__desc">One or two sentences, about 260 characters. This is what expands on hover.</span>
      <span class="proj-card__more">Read more →</span>
    </span>
  </a>
```

Every card needs a thumbnail. If the project has no figure yet, make a plain tile so the
grid stays even:

```bash
magick -size 800x450 gradient:'#f4f7fb-#e6ecf5' \
  -fill '#2f4a6d' -font /System/Library/Fonts/Supplemental/Arial.ttf \
  -pointsize 46 -gravity center -annotate +0-26 "Short title" \
  -pointsize 34 -fill '#61708a' -gravity center -annotate +0+32 "subtitle" \
  -bordercolor '#dbe4f0' -border 1 docs/assets/images/thumb-example.png
```

### 3. Add it to the nav

In `mkdocs.yml`, under the right theme:

```yaml
  - Research:
      - research/index.md
      - How is information perceived?:
          - research/perceived/index.md      # must stay first — it is the section page
          - Does X explain Y?: research/perceived/<slug>.md
```

The theme's `index.md` **must be the first child**, or the section title stops being
clickable and appears twice in the sidebar.

---

## Adding a new research theme

Rarely needed, but: create `docs/research/<newtheme>/index.md`, add a card for it in
`docs/research/index.md`, and add a nav section in `mkdocs.yml` with `index.md` first.

---

## Adding a publication

Edit `docs/publications.md`. Each entry is a `div` whose `data-themes` drives the filter
buttons:

```html
<div class="pub" data-themes="perception attention" markdown="1">
**Author, A.**, & Author, B. (2026). Title of the paper. *Journal*, 12, 34–56.
[:material-file-document: Paper](https://doi.org/...) ·
[:material-database: Data & code](https://osf.io/...)
</div>
```

Put it in the right section — *Peer-reviewed*, *Under review and in revision*, or
*In preparation*.

Valid themes (space-separated, use as many as apply):

`perception` · `attention` · `memory` · `event-cognition` · `narrative` ·
`psycholinguistics` · `cognitive-aging`

**To add a new theme** you must change three places or the filter breaks:

1. A button in `docs/publications.md`:
   `<button class="pub-chip" data-theme="my-theme">My theme</button>`
2. A label in `docs/assets/publications.js`, in the `LABELS` map at the top.
3. A colour in `docs/assets/extra.css`, next to the other
   `.pub-chip[data-theme="…"]` rules. Check contrast is at least 4.5:1 against white.

Filtered views are linkable: `/publications/?theme=memory`.

---

## Adding figures and videos

Put files in `docs/assets/images/`. Guidelines that keep the site looking consistent:

- **Resolution.** Aim for at least **2× the display width**. Figures render at 680px, so
  1600px wide is the working default. Extract from the source PDF rather than screenshotting:

  ```bash
  ./.venv/bin/python -c "
  import pymupdf
  d = pymupdf.open('paper.pdf')
  pix = d[4].get_pixmap(matrix=pymupdf.Matrix(8,8), clip=pymupdf.Rect(70,60,540,380))
  pix.save('out.png')"
  ```

- **Video, not GIF.** A GIF of a screen recording is roughly 100× the size of the same clip
  as MP4/WebM, and looks worse. Convert:

  ```bash
  ffmpeg -i in.gif -movflags +faststart -pix_fmt yuv420p -vf "scale=1080:-2" \
    -c:v libx264 -crf 24 -preset slow -an out.mp4
  ffmpeg -i in.gif -c:v libvpx-vp9 -crf 34 -b:v 0 -an -vf "scale=1080:-2" out.webm
  ```

  Then use a `<video autoplay loop muted playsinline>` with both sources, or
  `data-hover-play` for hover-to-play. See
  `docs/research/perceived/how-do-we-experience-the-perception-of-now.md` for a working
  example, and remember the raw-HTML path rule above.

---

## Adding an experiment demo or resource

Edit `docs/resources/index.md`. Demos are hosted from separate repos under
`adibuoy23.github.io/<repo>/`, so link them absolutely.

If a demo breaks with 404s on its stimuli, the cause is almost always that the stimulus
folder was never committed to that repo. Check with:

```bash
gh api "repos/Adibuoy23/<repo>/git/trees/main?recursive=1" \
  --jq '[.tree[]|select(.path|test("\\.mp4$"))]|length'
```

Do not publish copyrighted film clips. The demos are deliberately limited to
lab-recorded stimuli, and the entries using footage from *1917* are commented out in each
repo's `input.js`.

---

## Deploying

```bash
git add -A
git commit -m "Describe the change"
git push
```

Then watch it: <https://github.com/Adibuoy23/Adibuoy23.github.io/actions>. A deploy takes
one to two minutes. If the build fails it is nearly always a broken link caught by
`--strict`; run the build locally to see the same error.

The workflow builds from `master` and publishes to GitHub Pages. There is no `gh-deploy`
step to run — pushing is the whole process.
