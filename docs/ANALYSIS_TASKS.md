I have several pieces of infomration:
a) https://www.citriniresearch.com/p/2028gic
this is a theoretical doom's day prediction but done but pretty smart people.
Keep in mind that it is though experiment but done by pretty smart people. Another point that if that change happens in 10-15 years it turns from doom's day to some kind of evolution process.

b) https://www.microsoft.com/en-us/research/wp-content/uploads/2025/12/New-Future-Of-Work-Report-2025.pdf
This is Mircosoft report about impact of the AI on professions.

I need analysis of these sources and from that analysis I need to extract two thigs:
1. Model of traits and skills that exist in people. That model will be super relevant to the interview stage of the project as interview will be assessing these traits in the person using the applicatin. So list of aptitudes, skills/traits and other work related things together with good description of what it is, how it is usually measured and observed.

2. Ranking of what skills/traits extracted on step 1 are becoming redundant and what are becoming more important in the age of AI. That model will be super relevant when making analysis and helping people with recommendations - trying to match their existing skills or aptitudes to new professions

## Output format

Deliverables must be **one or more JSON file(s)** for use by the **API** (bft-api):

- **Deliverable 1 (trait/skill model)** → JSON consumed by the API to **generate interview questions** and drive the assessment (e.g. in `bft-api/conf/`). Include fields such as: trait/skill id, name, description, how it is measured/observed, and any fields needed for question generation.
- **Deliverable 2 (AI relevance ranking)** → JSON consumed by the API to **perform recommendations** (e.g. which traits/skills are redundant vs more important in the AI age; weights or rankings for matching users to career clusters, skill stacks, and resilient paths).

Output must be machine-readable JSON for the API, not only a prose report.
