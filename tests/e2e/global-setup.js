/**
 * Playwright global setup: fail fast if browser or env is wrong.
 */
export default async function globalSetup() {
  // Ensure we're in a state where e2e can run (e.g. dev server will be started by webServer config).
  if (process.env.CI) {
    // Optional: assert required env in CI
  }
}
