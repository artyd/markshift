/**
 * Site-wide constants. The GitHub and production URLs are placeholders until
 * the repo is created and Vercel assigns a domain; they are updated in a
 * follow-up commit after deploy.
 */
export const SITE = {
  name: "MarkShift",
  tagline: "Універсальний конвертер файлів у Markdown",
  githubUrl: "https://github.com/artyd/markshift",
  /** Vercel production alias. */
  url: "https://markshift-chi.vercel.app",
} as const;

export const GITHUB_ISSUES_URL = `${SITE.githubUrl}/issues`;
