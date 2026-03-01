# scripts/

Optional pipeline or orchestration scripts (e.g. generate data, transform, publish to `public/`).

- Use this README to describe stages, inputs, outputs, and order of execution.
- Use generic paths (e.g. "input dir", "output dir") so another project can substitute its own.
- The app should depend only on the final output (e.g. files under `public/`), not on the presence of these scripts.

Example pattern: Stage 1 produces X → Stage 2 reads X and writes Y → Stage 3 writes to `public/`.
