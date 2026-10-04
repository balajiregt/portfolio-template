# Engineering Portfolio Template

A free, MIT-licensed React/TypeScript portfolio with Stories, Map and List views, optional writing and recognition, and interactive technical architectures. All shipped profiles, projects and architecture presets are **fictional**.

No account, database, paid AI, analytics, secrets or automatic project scanning. Content is static and public after deployment. The template does not include any private automation or career agent.

## Start locally

Use Node 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Edit `content/portfolio.json`, not React components. Validation and layout generation run before development and production builds. Content edits reload the development page; invalid content reports errors in the terminal/browser overlay.

```sh
npm run validate
npm test
npm run build
npm run preview
```

## Make it yours

1. Replace `profile`, including metadata, contact links, optional image and alternative text.
2. Replace `projects`. Set `settings.defaultProjectId`, or omit it to use the first project.
3. Edit section headings in `copy`. Leave unused `articles`, `experience`, `recognition` and `repositories` as empty arrays. They are hidden automatically.
4. Replace or remove `public/assets/sample-workbench.png`. It is an original illustrative bitmap, not a screenshot of a real product.
5. Add architecture JSON files only for projects that need them. See [architecture customisation](docs/ARCHITECTURE.md).
6. Remove sample claims and example.com links before publishing. Use accurate employment titles; distinguish personal concepts from professional work and verified implementation.

Project links accept HTTPS and mailto without embedded credentials. Images must be local `/assets/filename` files. Never put secrets, private financial records, employer-internal diagrams, resumes or source paths into this repository. Validation is a guardrail, **not a privacy audit**.

## Architecture presets

`content/architectures/` includes a web application, test automation platform, and scheduled AI-assisted workflow. JSON is the source of truth. ELK lays out diagrams at build time; React Flow supplies pan, zoom, inspection and keyboard navigation. Mermaid `architecture-beta` export is generated from the same model. Arbitrary Mermaid import is not supported.

## Netlify

After reviewing the sanitised repository, import it from GitHub in Netlify. The included `netlify.toml` uses `npm run build`, publish directory `dist`, and Node 22. No environment variables or paid add-ons are required. Review your account's actual free-tier limits before deployment; hosting is usage-limited. The included `_redirects` supports direct `/architecture/...` URLs. Test those URLs after deployment. Keep a previous successful deploy available for rollback.

Never upload `node_modules`, `.customization-proof`, test recordings or development output. Manual deploys should contain **only `dist`**. `dist` intentionally contains configured public content and third-party license notices.

## Use this template on GitHub

The project is ready for a separate repository, but no repository is created by these scripts. After review, publish this directory only. In that repository's Settings, enable **Template repository**. Other users can then choose **Use this template** and create an independent repository. Preserve `LICENSE` and dependency notices. See [release checklist](docs/RELEASE.md).

## Verification

```sh
npx playwright install chromium
npm run test:e2e
npm run test:customization
npm run notices
```

The browser tests check desktop/mobile layouts, navigation, optional sections, inspection, simulation and Mermaid parsing. The customization proof substitutes a fictional profile, adds a project and architecture, builds a minimal version with no architecture, and verifies that React source hashes are unchanged. Proof files are private local build artifacts under `.customization-proof`, ignored by Git. Tests start temporary loopback servers and require local browser execution.

Dependency licenses stay with their authors; `npm run notices` refreshes installed license texts and the inventory after dependency updates. See `THIRD_PARTY_NOTICES.md`.
