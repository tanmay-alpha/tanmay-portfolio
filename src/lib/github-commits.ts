export type GithubEventCommit = {
  sha?: unknown;
  url?: unknown;
  html_url?: unknown;
  distinct_url?: unknown;
  commit?: {
    message?: unknown;
    author?: { name?: unknown; email?: unknown; date?: unknown } | null;
  };
};

export type GithubPushPayload = {
  commits?: unknown;
};

export type Commit = {
  id: string;
  repo: string;
  message: string;
  url: string;
  sha7: string;
  timestamp: string;
  additions: number | null;
  deletions: number | null;
};

function isLikelyBotAuthor(name: string, email: string): boolean {
  const lowerName = name.toLowerCase();
  return (
    name.endsWith("[bot]") ||
    lowerName.includes("github-actions") ||
    (email.toLowerCase().endsWith("@users.noreply.github.com") &&
      lowerName.includes("bot"))
  );
}

export function mapPushEvent(evt: {
  created_at: string;
  repo: { name: string };
  payload: unknown;
}): Commit[] {
  if (!evt || typeof evt !== "object") return [];

  const payload = evt.payload as GithubPushPayload;
  if (!payload || !Array.isArray(payload.commits)) return [];

  const repo = evt.repo.name;
  return payload.commits
    .filter((candidate): candidate is GithubEventCommit => {
      return (
        !!candidate &&
        typeof candidate === "object" &&
        typeof (candidate as GithubEventCommit).sha === "string"
      );
    })
    .filter((candidate) => {
      const author = candidate.commit?.author;
      const name = typeof author?.name === "string" ? author.name : "";
      const email = typeof author?.email === "string" ? author.email : "";
      return !isLikelyBotAuthor(name, email);
    })
    .map<Commit>((candidate) => {
      const sha = candidate.sha as string;
      const message =
        typeof candidate.commit?.message === "string"
          ? candidate.commit.message.split("\n")[0] ?? ""
          : "";
      const timestamp =
        typeof candidate.commit?.author?.date === "string"
          ? candidate.commit.author.date
          : evt.created_at;
      const browserUrl =
        typeof candidate.html_url === "string"
          ? candidate.html_url
          : typeof candidate.distinct_url === "string"
            ? candidate.distinct_url
            : `https://github.com/${repo}/commit/${sha}`;

      return {
        id: sha,
        repo,
        message,
        url: browserUrl,
        sha7: sha.slice(0, 7),
        timestamp,
        additions: null,
        deletions: null,
      };
    });
}
