# Create your portfolio with your own AI assistant

Use your preferred coding assistant or chat to turn approved resume/project context into the template's JSON. The template does not call an AI API, upload resumes, or require a paid AI plan. Your chosen assistant may have its own charges, data retention and training policies: review those before sharing anything.

## 1. Create your copy and prepare safe context

Choose **Use this template** on GitHub, create your own repository, clone it, and open its folder. Install Node 22.13+ and run `npm ci` once.

Prepare a sanitised resume or paste selected text. Remove your home address, phone number unless intentionally public, date of birth, identification numbers, private compensation, references and confidential employer/client details. Add only project notes, READMEs, screenshots and links you have permission to share. Keep original resumes and private notes outside the repository, `content/` and `public/`. Ignoring a file in Git does not prevent an AI provider from receiving it.

PDF reading depends on your assistant. If it cannot read a PDF, paste text and check dates, columns and bullet ordering yourself. Do not present this workflow as automatic or guaranteed resume parsing.

## 2. Generate portfolio content

Copy [the portfolio prompt](prompts/CREATE-PORTFOLIO.md) into your assistant and supply your approved context.

**Coding agent:** open this repository and ask it to read the prompt and the exact files named in it. Let it ask factual questions before editing. Review its proposed changes; it should not publish, push or deploy anything.

**Regular chat:** attach or paste these files with the prompt:

- `src/schema.mjs` (the authoritative schema and cross-reference checks)
- `content/portfolio.json` (your current content or the fictional sample)
- `docs/ARCHITECTURE.md`
- Existing `content/architectures/*.json` only if you are retaining or updating their project references

If a chat cannot access repository links, attach the actual file contents. Once required questions are answered, request the complete `portfolio.json`, not a partial snippet. Put that JSON in `content/portfolio.json`, with no Markdown fences or comments. Review every factual claim.

On a fresh template, explicitly confirm removal of the three fictional sample projects and their corresponding architecture JSON files. Clear `settings.defaultArchitectureId` until a real definition exists. Do not remove your own pre-existing work. Omit optional portrait fields unless you provide an approved asset; don't retain the sample contact address or invented links. Empty optional lists are valid.

## 3. Add architecture only where useful

Use [the architecture prompt](prompts/CREATE-ARCHITECTURE.md) for one project at a time. Give the assistant its actual project ID, source documentation, component responsibilities, known connections and implementation status.

For regular chats, also attach `src/schema.mjs`, your updated `content/portfolio.json`, `docs/ARCHITECTURE.md`, and one matching fictional preset from `content/architectures/` (web, tests or workflow). Label the preset as a syntax example, not evidence of your own system.

Answer questions about uncertain components. Put the returned definition at `content/architectures/<architecture-id>.json`. The JSON `projectId` must match an existing project, and `category` must match that project. Add `settings.defaultArchitectureId` only after that definition exists. No architecture is also a valid choice.

The assistant should explain which claims came from which approved sources outside the public JSON. Private filenames, source documents and unresolved notes do not belong in the published files. Do not label an architecture implemented merely because it validates or renders.

## 4. Validate, repair and preview

```sh
npm run validate
npm run build
npm run dev
```

Open the local URL printed by Vite. Check your name, official titles, dates, links, project ownership, mobile layout and diagrams. Click components and inspect connections and variants. Build checks local image files in addition to validation. Do not edit `src/generated/data.json`.

If validation fails, give your assistant the error and relevant JSON, then say:

```text
Fix this JSON to satisfy src/schema.mjs without weakening validation or inventing facts.
Preserve confirmed content. Explain each change. Ask me about factual gaps.
Do not deploy, push, or modify React components.
```

An assistant without terminal access must say that validation was not run. Run the commands yourself. Passing checks establishes structural compatibility, not truth, privacy clearance or security assurance.

## 5. Publish only after review

```sh
npm run deploy
```

This publishes a publicly accessible preview, not a private review environment. Follow Netlify's login/setup prompts and create your own project. Review the hosted preview and direct architecture URLs, then intentionally publish the main URL:

```sh
npm run deploy:prod
```

See the [Netlify instructions](../README.md#netlify) for target selection and limits. The prompts never authorise deployment on your behalf.

## 6. Update later

Provide the current JSON plus new approved notes; ask for a narrow update that preserves existing IDs and unrelated content. Review, validate, preview and deploy again. No need to reimport the entire resume.

## Before publishing

- Remove fictional identity, sample claims, placeholder URLs and unneeded sample architectures.
- Verify official roles, employment dates, contribution scope and any metrics.
- Distinguish personal work from professional experience and implemented systems from proposals.
- Verify publication-credit links yourself; a publication mention is not necessarily an endorsement.
- Review everything in `content/` and `public/`, including collapsed sections and all architecture variants.
- Confirm assets are permitted, links work, no sensitive source material is included, and the selected Netlify site belongs to you.

The prompts are guidance, not a guarantee of an AI assistant's output. Human review remains essential.
