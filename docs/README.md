# docs/

Project documentation for the **Built for Tomorrow** UI and product.

## Key documents

- **[PROJECT_DESCRIPTION.md](PROJECT_DESCRIPTION.md)** – Product vision, problem, what the platform does (identify aptitudes, assess AI resilience, generate strategic guidance), target audience, differentiation, and output structure (strength profile, career clusters, skill roadmap, scenario planning, backup path).
- **[ANALYSIS_TASKS.md](ANALYSIS_TASKS.md)** – Analysis task: sources (Citrini 2028 GIC, Microsoft New Future of Work Report 2025), deliverables (trait/skill model, AI relevance ranking), and **output format**: deliverables must be JSON files for use by the API to generate interview questions and perform recommendations.

## Interview flow (product + API)

The program (a) identifies **aptitudes** and **traits** (intrinsic), (b) identifies **values** and **interests** (driving force), (c) advises on **skills** to develop or already present, and (d) recommends profession or study direction. The assessment model data (aptitudes, traits, values, skills, AI relevance ranking) lives in **bft-api** at `src/data/`. The UI drives the conversational interview and consumes API sessions, assessments, and reports.

See [ARCHITECTURE_TEMPLATE.md](../ARCHITECTURE_TEMPLATE.md) in the project root for the full architecture and infrastructure template (directory layout, testing, styling, build, deploy, Cursor rules).
