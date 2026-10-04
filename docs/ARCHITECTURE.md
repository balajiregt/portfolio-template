# Architecture as content

Create one JSON file per project under `content/architectures/`. Copy a fictional preset and edit its values. No coordinates or React changes are needed.

## Model

- `id`: unique architecture ID used in `/architecture/<id>`.
- `projectId`: existing ID in `content/portfolio.json`; one architecture per project.
- `title`, `category`, `evidence`: display text, matching project category, and honest scope/evidence.
- `variants`: one or more views, each with a unique ID, title, status, note, groups, nodes and edges.
- `groups`: logical boundaries with `id`, `title`, optional `subtitle`, and an icon.
- `nodes`: `id`, `title`, `subtitle`, `detail`, `group`, `icon`, and optional `kind` (`component`, `ai`, `human`, `storage`).
- `edges`: `from`, `to`, `label`, optional `optional` and `bidirectional` booleans.
- `simulation`: optional `{ "label": "Worker available", "componentIds": ["worker"] }` on a variant.

Supported icons: server, cloud, browser, database, storage, folder, file, code, user, bot, shield, check, laptop, clock, message, globe. Labels should be brief. Put explanations in `detail`, not the diagram title. IDs use lowercase letters, digits and hyphens, starting with a letter. `root`, `canvas-extent` and the `edge-` prefix are reserved.

## Truthful status

`status` must be `conceptual`, `proposed`, or `implemented-snapshot`. An implemented snapshot requires `asOf` in YYYY-MM-DD form. A date is a statement from the content author, not automatic verification. Keep evidence accurate. Logical boundaries do not imply network isolation or security certification.

The optional availability switch only changes visual highlighting. It never contacts a service, schedules work, or controls real infrastructure. Connections involving an unavailable component are highlighted, but downstream failures are not inferred.

## Defaults and optional behavior

`settings.defaultArchitectureId` selects `/architecture`'s default. Without it the first filename-sorted definition is used. Project architecture links are shown only where a definition exists. Delete all architecture JSONs and remove the default ID to omit architecture entirely. Unknown direct URLs show a not-found state. The mobile default is a readable component list; diagram mode remains available.

## Export

Expand the Mermaid source disclosure and copy its contents into a Mermaid editor supporting `architecture-beta`. Export preserves logical groups, components and connection direction. Connection labels and optional flags are retained in comments because that syntax has different capabilities. Mermaid uses its own layout, not ELK coordinates. Punctuation is normalised in exported labels; the full original details remain in JSON and the readable UI.

## Validation

`npm run validate` checks schema, duplicate IDs, references, missing edge endpoints, missing groups, unsafe URL schemes, reserved IDs, icons and dated snapshots. Build also checks image files and computes layouts. Error messages identify the affected path or architecture/variant. Do not edit `src/generated/data.json`; it is regenerated and ignored by Git.

Large models will require zoom and the component list. Prefer focused variants rather than putting an entire enterprise into one diagram. Review mobile and desktop screenshots after changing labels or structure.
