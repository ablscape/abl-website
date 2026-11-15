# ABL Landscape Architecture website: instructions for Claude

Read this whole file before changing anything.

## What this repository is

The website of ABL Landscape Architecture, a landscape architecture firm in Lexington, Virginia.

- The site is plain HTML and CSS. `build.js` generates it from the files in `content/`. Nothing needs installing.
- Netlify publishes the `main` branch to the live site, and builds a preview for every pull request.
- The person talking to you is usually a member of the firm, not a developer. Use plain language. Never ask them to run a command, edit a file, or use GitHub or Netlify. You do those things and report back in a sentence or two.

## Rules

1. **Never commit to `main`.** Work on a branch, open a pull request, give the person the preview link, and merge only when they tell you to publish.
2. **Never invent a fact.** Years, clients, collaborators, costs, awards, plant names, quotations and history come from the person or from a source they give you. If a fact is missing, ask for it or leave the field empty. The build marks empty fields "To come" in previews and leaves them off the live site.
3. **Use only photographs the person gives you for the site.** Never take images from the web. Ask who took each photograph when it was not the firm, and record the name in `credit`.
4. **Protect private clients.** Do not publish a residential client's name or street address unless the person confirms the client agreed. Never publish budgets, fees or anything taken from an email.
5. **Run `node build.js` before every commit.** Fix every problem it reports. Never commit a failing build.
6. **Leave the machinery alone.** Do not edit `dist/`, `preview/`, `netlify.toml`, `content/legacy-urls.json` or `static/assets/fonts/`. Edit `build.js`, `lib/`, `templates/`, `static/assets/css/` and `static/assets/js/` only when the person asks for a change to the design or structure of the site, and tell them the change affects every page.
7. **One request, one pull request.** Keep each change small enough to check in one look at the preview.
8. **Do not rewrite text you were not asked to change.**

## Where things are

| Path | What it holds |
|---|---|
| `content/projects/<slug>/project.json` | One project: its facts, its text, its photo list |
| `content/projects/<slug>/photos/` | That project's photographs, already resized |
| `content/site.json` | Firm name, address, phone, emails; the home page (photographs, the statement and the plan beside it, the row of drawings); the Work page introduction; the People page introduction; the Capabilities page (the opening and the plan behind it, the capabilities and the projects under each, what the firm does for private properties); the Process page (the opening and the plan behind it, the parts of the firm's process with their pictures and quotations); contact form choices |
| `content/people.json` | The people on the People page |
| `static/assets/img/people/` | Portraits named in `people.json` |
| `static/assets/css/site.css` | All styling. Colors and typefaces are set in the first block |
| `templates/`, `lib/`, `build.js` | The page layouts and the builder |
| `tools/prepare_photos.py` | Resizes photographs and strips location data |

## Commands

```
node build.js               # build into dist/ with drafts and gray preview notes
node build.js --production  # build exactly what the live site will show
node build.js --check       # list everything still unfinished
node build.js --portable    # build into preview/ so the pages open straight from a folder
node build.js --no-notes    # drafts included, notes left out: the pages as the design will look (add --portable for a folder)
python3 tools/prepare_photos.py content/projects/<slug> a.jpg b.jpg   # prepare photographs
```

## Adding a project

1. **Gather the facts.** You need: title, location, client, year completed, the firm's role, collaborators, type, photographs, and the story. Ask for whatever is missing in one message. A project can start as a draft with gaps.
2. **Choose the folder name.** Lowercase words joined by hyphens, taken from the title: `courthouse-square`.
3. **Prepare the photographs** in the order they should appear. The first one becomes the lead photograph unless the person chooses another.
   ```
   python3 tools/prepare_photos.py content/projects/courthouse-square first.jpg second.jpg
   ```
   If the tool says a file is under 2560 pixels wide, tell the person and ask whether a larger original exists. Use it anyway if not.
4. **Write `project.json`.** Copy this shape exactly.
   ```json
   {
     "title": "Courthouse Square",
     "location": "Lexington, Virginia",
     "client": "Main Street Lexington",
     "year": "2026",
     "type": "Civic",
     "role": "Landscape architect",
     "collaborators": ["Robert L. Faulkner & Son, Inc.", "Garrett Landscapes"],
     "status": "draft",
     "featured": true,
     "order": 1,
     "summary": "One sentence, under 220 characters, saying what the project is.",
     "reviewNote": "",
     "story": {
       "problem": ["What was wrong or needed, in the client's or community's terms."],
       "research": ["What the firm studied: the site, its history, its users."],
       "response": ["What was designed and built, and why."],
       "result": ["What changed. Dates, uses, facts."]
     },
     "cover": "01",
     "photos": [
       { "file": "01", "alt": "What the photograph shows", "caption": "", "credit": "" }
     ],
     "drawings": [],
     "legacyUrls": []
   }
   ```
   - `type` is one of `Campus`, `Civic`, `Preservation`, `Residential`.
   - `status` is `draft` until the person says the text and facts are final. Drafts appear in previews and never on the live site. Change it to `published` only when they say so. A published project must have a year and no `reviewNote`.
   - `featured` projects appear on the home page, two to a line, as on the Work page. Keep the featured set small and even in number: ask before featuring more than six. The Work page shows every project, two to a line, with buttons for All and for each type.
   - `order` sorts projects, lowest first.
   - Each part of `story` is a list of paragraphs. A part may be left out. If the person gives one block of text and no four-part story, put it in `"description": ["..."]` and leave `story` out.
   - `reviewNote` is a note to the firm about text that still needs checking. It shows in previews only.
   - `drawings` lists the firm's own plans and sketches for the project, prepared with the same tool into the same `photos/` folder and written the same way as photos (`file`, `alt`, `caption`). They appear large, as ink on the page, with no frame, between the opening and the story. Only drawings the firm made, or drawings made for the firm that it credits; put the credit in the caption ("Perspective by Peter Giraudeau."). A drawing on gray paper needs `"lift"` in its entry (255 divided by the brightness of its paper; `1.2` for the Oak Grove and Lime Kiln plans), or its paper shows as a gray rectangle. A drawing may also name the photograph of what was built from it, `"built": "03"`; the two then stand side by side, the drawing the wider, and the photograph leaves the rows below. Use it only when the photograph shows the very thing the drawing proposes, and never name the cover photograph. A computer rendering among the drawings carries `"rendering": true`: it is shown after the photographs, smaller and as a plain picture, because the firm wants photographs of built work to be more prominent than renderings and does not want a rendering shown large. If a rendering's edges fade to white, trim them before preparing it; the firm disliked that haze.
   - `cover` names the image shown in the lists of projects and at the head of the project page. It may be a photograph or a drawing. A project that is a plan or a study may have drawings and no photographs.
   - `legacyUrls` lists the page's address on the old site, such as `"vmi.html"`, so old links keep working.
5. **Write alt text for every photograph.** Say what is visible, in one plain sentence fragment under 200 characters: "Two tiers of limestone retaining walls planted with shrubs". No "photo of". No names of people. If you cannot tell what a photograph shows, ask.
6. **Build and check.** Run `node build.js`. Read its output. Open the built page in `dist/work/<slug>/index.html` and confirm the text and photographs are right.
7. **Open a pull request** and report back as described under "Publishing".

## Other common requests

- **Change text on a project.** Edit that project's `project.json`.
- **Add or replace photographs.** Run the prepare tool, add the entries to `photos`, write alt text. To remove a photograph, delete its entry and its files.
- **Add a plan or sketch.** Export it as a JPEG, run the prepare tool on it, and add the entry to `drawings` with alt text and a caption saying what drawing it is.
- **Put a drawing behind a heading.** The firm's hand drawings are the theme of the site: one lies beside the statement on the home page and one behind the heading of each other page. Set `backdrop` in `content/site.json` to a drawing that already exists: `"backdrop": { "project": "courthouse-square", "file": "05" }` for the home page, and `backdrop` under `work`, `studio` (the People page), `capabilities`, `process` or `contact` for the others. Leave it out to show the plain page. The build refuses a project or drawing that does not exist.
  - The drawing must read as ink on the page, with no visible edge and no gray or cream band. A drawing on white paper needs nothing: its paper takes the page's color. For one on gray paper add `"lift"`, 255 divided by the brightness of its paper (`1.2` for the Oak Grove and Lime Kiln plans). Do not use a drawing on cream or tan paper, which reads as yellow.
  - The firm prefers plans in ink and strong color that fill the frame from edge to edge, the kind behind Work and Contact, to pale pencil studies and eye-level sketches.
  - The drawing must suit the page. People shows a drawing with people in it until the firm sends a photograph of its staff. Do not name a drawing that is also the cover of a project on the Work page.
  - The drawing is shown whole, never enlarged to fill the block: on a wide screen it stands at the right, as tall as the block, with the text at the left; on a phone or a tablet the whole drawing follows the text across the page. The firm found a drawing stretched across the window blurry, because the files are small. The credit, the line beside the drawing, gives the name of the drawing's project and nothing else: the firm asked for the kind of drawing ("Plan of the entrance,") to be left out, there and under the plans in the home page's row. On a wide screen the credit stands at the right, at the foot of the drawing, where the firm asked for it, and on a phone beneath the drawing. `"focus": "45% 50%"` says where the subject sits for the rare window in which the drawing has to be trimmed.
  - A drawing behind a heading is shown a few degrees greener than it was drawn (`--plan-key` in the stylesheet), which corrects yellowish greens. Add `"asDrawn": true` for a drawing whose own colors are right. The same drawing always keeps its own colors on its project page.
  - Nothing on these pages moves. On a phone the heading and its text come first and the drawing follows. Do not add motion, video or effects: the site's restraint is deliberate.
- **Change the color of the page.** The page is white. The firm tried a pale gray-green page and asked three times for it whiter, so leave it white unless the person asks for a tone. The color is `--paper` in the first block of `static/assets/css/site.css`; give `--paper-rgb` on the next line the same color as three numbers. Every drawing takes the page's color as its own paper, so a toned page still shows no rectangle around a drawing. Never cream, tan or yellow. This changes every page.
- **The foot of the page** is a plain block in the green of the logo's "abl" (`--sage`), which the firm asked for in place of a darker green, with the name, the address and the links in white. That green is a middle tone, so the words are full white and in medium weight; do not lighten them. It carries no picture; do not add one.
- **How photographs are shown.** Projects are listed two to a line. On the Work page the list is wider than the page's text: it keeps a little space at the outer edges of the window and a narrow space between the two pictures, so that the pictures are as large as two to a line allows. Under "Selected work" on the home page the list stays inside the page's margins: the firm asked for the Work page's pictures larger and for these a little smaller. Do not show one project alone across the whole window: the firm tried it and found it "really bad" and "too zoomed in". Every photograph on a project page, the lead photograph included, keeps the page's margins and its own proportions; nothing is cropped or enlarged to fill a frame. On a project page no photograph runs across the whole window on a computer. The home page's photographs are the one exception: they span the whole width of the window, which the firm asked for, but in a low band (see "The home page"), because at two to one across the window the firm found them "way too big". On a phone the lead photograph of a project runs from edge to edge as well.
- **The header and the heading of a page.** The five links (Work, People, Capabilities, Process, Contact) stand at the left of the header and the logo at the right; the firm tried the logo at the left and asked for it back. The heading of a page is a low block: the title and at most a short opening at the left, the drawing at the right. On a wide screen the drawing runs up behind the header to the top of the window, where it is lightened and cleared around the logo so that the header reads over it. Do not make the heading taller, do not put a long paragraph in it, and do not put a band or a box behind the logo or the links at rest.
  - **The "abl" stays.** The "abl" of the logo never leaves the window: a mark fixed to the window draws it exactly where the logo's "abl" stands, at the logo's own size, and the header shows the logo's two words only, so the header scrolls away and the letters stay where they were. The firm likes that the mark carries on from the logo's own letters and asked that it not have to wait to appear. Keep the two in register: the mark takes its size and place from `--logo-w` and `--head-pad` in the first block of the stylesheet, and a change to the logo's size or the header's padding belongs there. When the visitor scrolls up, the links return where they stood. On a phone, and in any window narrower than 640 pixels, the logo stands above the links at the left, the mark stays at the top left, and the links return beneath it, where they stood; the five stand on one line down to a window 320 pixels wide, so do not lengthen a link's name or add a sixth without checking a phone.
  - **Nothing changes under the pointer.** A header that turned white under the pointer, after the Design Workshop site, was built at the firm's request and removed at its request the same day: "i like it more the way it was". Do not bring it back. Where the logo stands over a drawing, the drawing is faded around it; the firm asked for a little more of that fading, so do not reduce it.
- **The home page** opens with the photographs across the whole width of the window, from edge to edge, which the firm asked for ("this main thing should span the full horizontal"). On a computer they stand in a band lower than the photographs are (14 to 5, and never more than 58 percent of the window's height), because at two to one across the window the firm found them "way too big". The firm's statement (`statement` in `content/site.json`) follows, beside the plan named in `backdrop`; then a short account of the firm (the first paragraph of `studio.intro`, the People page's introduction), Selected work, and the row of plans. The firm tried the photographs inside the page's margins and wanted them from edge to edge; it tried the statement at the left with the photographs beside it and did not like it as the opening of the site; it tried the account of the firm beside the plan and wanted the statement there; and it found the account hidden at the foot of the page, with links to People and Process that repeated the header. Do not go back to any of the four.
- **Change the home page photographs.** Edit `hero` in `content/site.json`. Each entry names a project folder and a photo number. Four or five photographs at most. Choose ones that show the design clearly, and never one that is also the cover of a featured project: no photograph appears twice on a page. The files are two to one and the band on a computer is lower, so each photograph loses a part of its head and foot there, the more the wider the window: if that cuts into the subject, add `"focus": "50% 100%"` to its entry (across, then down: `100%` keeps the foot of the photograph, `0%` its head).
- **Change the row of plans on the home page.** Edit `drawings` in `content/site.json`. Each entry names a project folder and one of its drawings. Three reads best.
- **Change the Work page introduction.** `work.intro` in `content/site.json`. Clear `work.introNote` when the firm approves the text.
- **Change the People page.** People are in `content/people.json`. The introduction is in `content/site.json` under `studio`; the heading of the page carries the title alone, and the first paragraph of the introduction is set a size larger beneath it. A portrait goes in `static/assets/img/people/` at about 1200 pixels wide, 4:5 proportion, and its file name goes in that person's `photo`. Each person's portrait, name and address stand at the left, the biography and facts at the right.
- **Change the Capabilities page.** Capabilities closed the Process page until the firm asked for a page of its own, with its link before Process. Everything on it is in `content/site.json` under `capabilities`: `lead` (the opening, the firm's one sentence on what it does, set beside the plan named in `backdrop`); `items`, the capabilities in order, each with a `name`, a `text` (one sentence on what it includes; empty until the firm supplies it, and then left off the page) and `projects`, the folder names of the projects that show it, which the page lists by title under the capability and links; `private`, the sentence on what the firm does for private properties; and `"qualifications": true`, which repeats the People page's note and each person's registration, so that they are written once. Name a project under a capability only when that project's own page says the firm did that work (its `role`, its summary or its text), and ask the person when it does not. The build refuses a project that does not exist. One review note, `note`, covers the page; clear it when the firm approves the page.
- **Change the Process page.** Everything on it is in `content/site.json` under `process`: `lead` (the opening, set beside the plan named in `backdrop`), `intro` (a paragraph that follows, if any), and `sections` (the parts of the process, in order). Every part is set the same way, with its number and name at the left and its text at the right under a hairline. The firm found the page cumbersome when each part had a layout of its own, so do not give a part a different arrangement. Each part has a `title` and a `text` list of paragraphs, and may have a `quote` with `text` and `by`, `"diagram": true` for the Client, Site, Design team drawing, or a `figure` naming a project and one of its drawings or photographs. A quotation stands under the part's name, at the left, beside the text it belongs to (under the text the firm found it lonely); the diagram or a figure stands under the part's text, in the text's column. The page shows one drawing, at its head, and the Dialogue diagram: with a drawing under each part the firm found it overwhelming, so do not give a part a `figure` unless the person asks. A part waiting for a photograph has `"figure": { "toCome": "what it will show" }`, which holds its place in previews with notes and lists it as unfinished. Choose a hand drawing over a computer rendering wherever one fits, and never a picture that has nothing to do with the part. One review note, `introNote`, covers the page; clear it when the firm approves the text.
- **Change contact details or the form's project types.** `content/site.json` under `address`, `phone`, `emails` and `contact`.
- **Hide a project.** Set `status` to `draft`. Do not delete a project folder unless the person asks you to delete it.
- **See what is unfinished.** Run `node build.js --check` and read the list back in plain language.

## Writing for this site

The site should read as the firm writes: composed, exact and unhurried. The model is the introduction on the People page, which is the firm's own text. It does not want marketing language, and it does not want notes.

- Write for a professional reader: a university facilities director, a city manager, a trustee, an architect. They read closely.
- Write composed sentences. When a thought carries a condition or a reason, keep it in the same sentence, in a subordinate clause. Do not break one thought into a string of short declarative sentences, and do not write fragments.
- State what happened and why it mattered, in specifics: names, dates, dimensions, materials. One exact detail does more than three general ones.
- No slogans, superlatives, exclamation points or rhetorical questions, and no contrast formulas of the "not this, but that" kind.
- Use the precise word, including the technical one when it is the right one. Explain a term only where a general reader would be lost.
- Sentence case for headings. Refer to the firm as "ABL" or "the firm".
- Say "project", not "commission".
- When the person gives you their own wording, keep their wording. Fix only spelling and obvious slips, and say what you fixed.
- When you draft text yourself from notes, set a `reviewNote` saying so, and keep `status` at `draft` until the person approves it.

## Publishing

1. Create a branch named for the change, such as `add-courthouse-square`.
2. Commit with a short message in plain words: "Add Courthouse Square project".
3. Push the branch and open a pull request against `main`. Use `gh pr create --fill` when `gh` is available; otherwise use the session's own pull request button.
4. Netlify builds a preview of the pull request within a minute or two. Find its address with `gh pr checks` or in the pull request's Netlify comment. It looks like `https://deploy-preview-<number>--<site-name>.netlify.app`.
5. Tell the person, in this form:
   > Here is the preview: (link). Gray notes mark anything still to come; they never appear on the live site. Look at it on your phone and your computer. Tell me what to change, or say "publish".
6. When they say to publish, merge the pull request (`gh pr merge --squash --delete-branch`). If you cannot merge, give them the pull request link and ask them to press the green "Merge pull request" button. The live site updates a minute or two later. Confirm when it has.
7. If they ask to undo something already published, make a new pull request that reverses it. Do not rewrite history.

## When something goes wrong

- **The build lists problems.** Each line names the file and what to fix. Fix them all and build again.
- **The build says links lead nowhere.** A page points at a file that does not exist, usually a photograph that was renamed or not prepared. Fix the name or prepare the file.
- **The preview never appears.** Say so plainly, give the pull request link, and suggest the person ask Thomas. Do not change `netlify.toml` to try to fix it.
- **You are unsure whether a change is safe.** Ask before making it.
