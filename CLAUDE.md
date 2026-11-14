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
| `content/site.json` | Firm name, address, phone, emails; the home page (statement, photographs, the plan behind the statement, the row of drawings); the Work page introduction; the People page introduction; the Process page (the opening and the plan behind it, the parts of the firm's process with their pictures and quotations, the ways to work with the firm); contact form choices |
| `content/people.json` | The people on the People page |
| `static/assets/img/people/` | Portraits named in `people.json` |
| `static/assets/css/site.css` | All styling. Colors and typefaces are set in the first block |
| `templates/`, `lib/`, `build.js` | The page layouts and the builder |
| `tools/prepare_photos.py` | Resizes photographs and strips location data |
| `tools/make_ground.py` | Makes the ground, the faint linework behind every page, from one of the firm's drawings |
| `static/assets/img/ground-wide.webp`, `ground-tall.webp` | The ground itself: one sheet for computers and tablets, one for phones |

## Commands

```
node build.js               # build into dist/ with drafts and gray preview notes
node build.js --production  # build exactly what the live site will show
node build.js --check       # list everything still unfinished
node build.js --portable    # build into preview/ so the pages open straight from a folder
node build.js --no-notes    # drafts included, notes left out: the pages as the design will look (add --portable for a folder)
python3 tools/prepare_photos.py content/projects/<slug> a.jpg b.jpg   # prepare photographs
python3 tools/make_ground.py content/projects/<slug>/photos/01-1280.jpg  # make the ground from a drawing
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
   - `featured` projects appear on the home page. Keep the featured set small: ask before featuring more than six. The Work page shows every project, with buttons for All and for each type.
   - `order` sorts projects, lowest first.
   - Each part of `story` is a list of paragraphs. A part may be left out. If the person gives one block of text and no four-part story, put it in `"description": ["..."]` and leave `story` out.
   - `reviewNote` is a note to the firm about text that still needs checking. It shows in previews only.
   - `drawings` lists the firm's own plans and sketches for the project, prepared with the same tool into the same `photos/` folder and written the same way as photos (`file`, `alt`, `caption`). They appear large on white between the opening and the story. Only drawings the firm made, or drawings made for the firm that it credits; put the credit in the caption ("Perspective by Peter Giraudeau.").
   - `cover` names the image shown in the collages and at the head of the project page. It may be a photograph or a drawing. A project that is a plan or a study may have drawings and no photographs.
   - `legacyUrls` lists the page's address on the old site, such as `"vmi.html"`, so old links keep working.
5. **Write alt text for every photograph.** Say what is visible, in one plain sentence fragment under 200 characters: "Two tiers of limestone retaining walls planted with shrubs". No "photo of". No names of people. If you cannot tell what a photograph shows, ask.
6. **Build and check.** Run `node build.js`. Read its output. Open the built page in `dist/work/<slug>/index.html` and confirm the text and photographs are right.
7. **Open a pull request** and report back as described under "Publishing".

## Other common requests

- **Change text on a project.** Edit that project's `project.json`.
- **Add or replace photographs.** Run the prepare tool, add the entries to `photos`, write alt text. To remove a photograph, delete its entry and its files.
- **Add a plan or sketch.** Export it as a JPEG, run the prepare tool on it, and add the entry to `drawings` with alt text and a caption saying what drawing it is.
- **Put a drawing behind a heading.** The firm's hand drawings are the theme of the site: one lies behind the statement on the home page and one behind the heading of each other page. Set `backdrop` in `content/site.json` to a drawing that already exists: `"backdrop": { "project": "courthouse-square", "file": "05" }` for the home page, and `backdrop` under `work`, `studio` (the People page), `process` or `contact` for the others. Leave it out to show plain white. The build refuses a project or drawing that does not exist.
  - The drawing must read as ink on the page's own white, with no visible edge and no gray or cream band. A drawing on white paper needs nothing. For one on gray paper add `"lift"`, 255 divided by the brightness of its paper (`1.2` for the Oak Grove and Lime Kiln plans). Do not use a drawing on cream or tan paper, which reads as yellow.
  - The drawing must suit the page. People shows a drawing with people in it until the firm sends a photograph of its staff. Do not name a drawing that is also the cover of a project on the Work page.
  - `"focus": "45% 50%"` says where the subject sits, across and down; `"focusPhone"` says it for phones. `"from": "38%"` starts the drawing that far from the left on a wide screen, so that its subject stands beside the text and not under it. `"caption"` replaces the word used in the credit.
  - A drawing behind a heading is shown a few degrees greener than it was drawn (`--plan-key` in the stylesheet), which corrects yellowish greens. Add `"asDrawn": true` for a drawing whose own colors are right. The same drawing always keeps its own colors on its project page.
  - Nothing on these pages moves, and the header stays on plain white. On a phone the heading and its text come first and the drawing follows. Do not add motion, video or effects: the site's restraint is deliberate.
- **Change the ground.** The linework of one of the firm's plans runs faintly behind every page, in the green of the logo: the sheet the site is drawn on. It is made from the Lime Kiln master plan study. To make it from another drawing, run `python3 tools/make_ground.py` on that drawing's 1280-pixel file, build, and look at a phone-size and a computer-size page before committing. This changes every page, so do it only when the person asks.
  - Choose a line drawing on white or gray paper with no lettering: lettering would show behind the text of every page. The four numbers the tool accepts say which part of the drawing's width each sheet uses; leave out any part with heavy, dark shapes.
  - The ground is faint through the body of a page, stronger in the space above each section heading and in the bare band at the foot of the page, and absent behind the header. Those strengths are the three numbers at the head of the ground's block in `static/assets/js/site.js` (`REST`, `JOINT`, `FOOT`; 1 is no ground, 0 is the ground at full strength).
  - Every line of text clears the ground around itself with a soft white halo (`--halo` in the stylesheet), as a label does on a plan. Do not put text in a box or on a band to protect it, and do not remove the halo.
  - A drawing shown on a project page has no frame: it lies on clear white, and the ground gives way around it. A drawing on gray paper needs `"lift"` in its entry in the project's `drawings` (`1.2` for the Oak Grove and Lime Kiln plans), or its paper shows as a gray rectangle.
- **Change the home page photographs.** Edit `hero` in `content/site.json`. Each entry names a project folder and a photo number. Four or five photographs at most. Choose ones that show the design clearly, and never one that is also the cover of a featured project: no photograph appears twice on a page.
- **Change the row of plans on the home page.** Edit `drawings` in `content/site.json`. Each entry names a project folder and one of its drawings. Three reads best.
- **Change the Work page introduction.** `work.intro` in `content/site.json`. Clear `work.introNote` when the firm approves the text.
- **Change the People page.** People are in `content/people.json`. The introduction is in `content/site.json` under `studio`. A portrait goes in `static/assets/img/people/` at about 1200 pixels wide, 4:5 proportion, and its file name goes in that person's `photo`. Each person's portrait, name and address stand at the left, the biography and facts at the right.
- **Change the Process page.** Everything on it is in `content/site.json` under `process`: `lead` (the opening, set over the plan named in `backdrop`), `intro` (the paragraph that follows), `sections` (the parts of the process, in order; each has a `title`, a `text` list of paragraphs, and may have a `figure` naming a project and one of its drawings or photographs, a `quote` with `text` and `by`, or `"diagram": true` for the Client, Site, Design team drawing. A part with a `figure` lies on its drawing the way a page heading does: no box and no frame, the text at the left on a wide screen with the drawing dissolving into the page around it, and on a phone the text first and the drawing after. Its `figure` takes the same settings as a `backdrop`: `caption`, `lift`, `focus`, `focusPhone`, `from`, `asDrawn`. A part waiting for a photograph has `"figure": { "toCome": "what it will show" }`, which holds its place in previews with notes and lists it as unfinished. The Dialogue drawing stands beside its text; two parts in a row with no picture share a row. Choose a hand drawing over a computer rendering wherever one fits, and never a picture that has nothing to do with the part) and `services` (`intro`, a list of paragraphs). One review note, `introNote`, covers the page; clear it when the firm approves the text.
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
