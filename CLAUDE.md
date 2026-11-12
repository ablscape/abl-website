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
| `content/site.json` | Firm name, address, phone, emails, home-page statement and photographs, the People page introduction, the Process page (what is distinctive about the firm, the Dialogue text, the steps of a project, the services), contact form choices |
| `content/people.json` | The people on the People page |
| `static/assets/img/people/` | Portraits named in `people.json` |
| `static/assets/css/site.css` | All styling. Colors and typefaces are set in the first block |
| `templates/`, `lib/`, `build.js` | The page layouts and the builder |
| `tools/prepare_photos.py` | Resizes photographs and strips location data |

## Commands

```
node build.js               # build into dist/ with drafts and yellow preview notes
node build.js --production  # build exactly what the live site will show
node build.js --check       # list everything still unfinished
node build.js --portable    # build into preview/ so the pages open straight from a folder
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
   - `featured` projects appear on the home page and in the Featured view. Keep the featured set small: ask before featuring more than six.
   - `order` sorts projects, lowest first.
   - Each part of `story` is a list of paragraphs. A part may be left out. If the person gives one block of text and no four-part story, put it in `"description": ["..."]` and leave `story` out.
   - `reviewNote` is a note to the firm about text that still needs checking. It shows in previews only.
   - `drawings` lists the firm's own plans and sketches for the project, prepared with the same tool into the same `photos/` folder and written the same way as photos (`file`, `alt`, `caption`). They appear on a sheet of yellow trace below the story. Only drawings the firm made.
   - `legacyUrls` lists the page's address on the old site, such as `"vmi.html"`, so old links keep working.
5. **Write alt text for every photograph.** Say what is visible, in one plain sentence fragment under 200 characters: "Two tiers of limestone retaining walls planted with shrubs". No "photo of". No names of people. If you cannot tell what a photograph shows, ask.
6. **Build and check.** Run `node build.js`. Read its output. Open the built page in `dist/work/<slug>/index.html` and confirm the text and photographs are right.
7. **Open a pull request** and report back as described under "Publishing".

## Other common requests

- **Change text on a project.** Edit that project's `project.json`.
- **Add or replace photographs.** Run the prepare tool, add the entries to `photos`, write alt text. To remove a photograph, delete its entry and its files.
- **Add a plan or sketch.** Export it as a JPEG, run the prepare tool on it, and add the entry to `drawings` with alt text and a caption saying what drawing it is.
- **Change the home page photographs.** Edit `hero` in `content/site.json`. Each entry names a project folder and a photo number. Four or five photographs at most. Choose ones that show the design clearly.
- **Change the People page.** People are in `content/people.json`. The introduction is in `content/site.json` under `studio`. A portrait goes in `static/assets/img/people/` at about 1200 pixels wide, 4:5 proportion, and its file name goes in that person's `photo`.
- **Change the Process page.** Everything on it is in `content/site.json` under `process`: `intro` (what is distinctive about the firm), `dialogue` (the Client, Site, Design team text), `steps` (the steps of a project, in order) and `services` (the ways to work with the firm). Each part has a review note field; clear it when the firm approves the text.
- **Change contact details or the form's project types.** `content/site.json` under `address`, `phone`, `emails` and `contact`.
- **Hide a project.** Set `status` to `draft`. Do not delete a project folder unless the person asks you to delete it.
- **See what is unfinished.** Run `node build.js --check` and read the list back in plain language.

## Writing for this site

The firm wants its site to sound like the firm: experienced, local, direct. It does not want marketing language.

- Plain sentences. Sentence case. No slogans, no exclamation points, no superlatives.
- State what happened: the problem, what the firm learned, what it designed, what resulted. Let facts carry the weight.
- Write for a reader who is not a designer: a facilities director, a city manager, a homeowner. Define a technical term or avoid it.
- Refer to the firm as "ABL" in project text.
- When the person gives you their own wording, keep their wording. Fix only spelling and obvious slips, and say what you fixed.
- When you draft text yourself from notes, set a `reviewNote` saying so, and keep `status` at `draft` until the person approves it.

## Publishing

1. Create a branch named for the change, such as `add-courthouse-square`.
2. Commit with a short message in plain words: "Add Courthouse Square project".
3. Push the branch and open a pull request against `main`. Use `gh pr create --fill` when `gh` is available; otherwise use the session's own pull request button.
4. Netlify builds a preview of the pull request within a minute or two. Find its address with `gh pr checks` or in the pull request's Netlify comment. It looks like `https://deploy-preview-<number>--<site-name>.netlify.app`.
5. Tell the person, in this form:
   > Here is the preview: (link). Yellow notes mark anything still to come; they never appear on the live site. Look at it on your phone and your computer. Tell me what to change, or say "publish".
6. When they say to publish, merge the pull request (`gh pr merge --squash --delete-branch`). If you cannot merge, give them the pull request link and ask them to press the green "Merge pull request" button. The live site updates a minute or two later. Confirm when it has.
7. If they ask to undo something already published, make a new pull request that reverses it. Do not rewrite history.

## When something goes wrong

- **The build lists problems.** Each line names the file and what to fix. Fix them all and build again.
- **The build says links lead nowhere.** A page points at a file that does not exist, usually a photograph that was renamed or not prepared. Fix the name or prepare the file.
- **The preview never appears.** Say so plainly, give the pull request link, and suggest the person ask Thomas. Do not change `netlify.toml` to try to fix it.
- **You are unsure whether a change is safe.** Ask before making it.
