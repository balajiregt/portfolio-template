# Engineering Portfolio Template

A free, MIT-licensed React/TypeScript portfolio with Stories, Map and List views, optional writing and recognition, and interactive technical architectures. All shipped profiles, projects and architecture presets are **fictional**.

No account, database, paid AI, analytics, secrets or automatic project scanning. Content is static and public after deployment. The template does not include any private automation or career agent.

## Start locally

Use Node 22.13+ and npm (also required by the pinned deployment CLI).

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

### Two-command preview

After creating your own repository with **Use this template**, clone it, open a terminal in its folder, and customise/review your public content. Then run:

```sh
npm ci
npm run deploy
```

The deployment command validates and builds the site, then downloads/runs pinned Netlify CLI 27.10.2 through npm. It stops if the build fails. Internet access and a Netlify account are required. On first use, follow the browser login and project setup prompts: choose **Create a new project/site** in your own team, not an unrelated existing portfolio. No shared token, global CLI installation or manual build/upload step is needed.

Netlify prints a hosted preview URL. **A preview is publicly accessible too**: review all content before running the command. Check the site and a direct `/architecture/...` URL. When ready to publish to the linked site's main address:

```sh
npm run deploy:prod
```

This rebuilds and publishes the current local content, including uncommitted edits. Later updates use the same command; already-installed dependencies do not require another `npm ci` unless the lockfile changes. Both commands use the linked Netlify project on subsequent runs. To change that target, run `npx netlify-cli@27.10.2 unlink` before deploying again. Clear any inherited `NETLIFY_SITE_ID` environment variable so it cannot override your selected site. Local `.netlify/` state is ignored by Git and must not be shared. Never commit login tokens.

### Automatic GitHub deployments (optional)

For deployment on every push, connect your own GitHub repository through Netlify's import flow. The CLI commands above do not set up continuous deployment. The included `netlify.toml` uses `npm run build`, publish directory `dist`, and Node 22. No environment variables or paid add-ons are required. Review your account's actual free-tier limits before deployment; hosting is usage-limited. The included `_redirects` supports direct `/architecture/...` URLs. Keep a previous successful deploy available for rollback.

See the [official Netlify deploy command reference](https://cli.netlify.com/commands/deploy/) for login, linking and deployment options.

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
