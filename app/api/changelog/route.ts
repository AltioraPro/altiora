import { NextResponse } from "next/server";

interface GitHubPR {
  number: number;
  title: string;
  body: string | null;
  merged_at: string | null;
  labels: Array<{ name: string }>;
  user: { login: string };
  html_url: string;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
      name: string;
    };
  };
  html_url: string;
}

interface ChangelogEntry {
  type: "feature" | "improvement" | "fix";
  text: string;
  prNumber?: number;
  prUrl?: string;
}

interface Release {
  version: string;
  date: string;
  type: "major" | "minor" | "patch";
  title: string;
  changes: ChangelogEntry[];
}

const GITHUB_OWNER = "AltioraPro";
const GITHUB_REPO = "altiora";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function parseChangeType(
  labels: Array<{ name: string }>,
  title: string,
  body: string | null
): "feature" | "improvement" | "fix" {
  const labelNames = labels.map((l) => l.name.toLowerCase());
  const titleLower = title.toLowerCase();
  const bodyLower = (body || "").toLowerCase();

  // Check labels first (most reliable)
  if (
    labelNames.some((l) =>
      ["feature", "enhancement", "new", "feat"].some((k) => l.includes(k))
    )
  ) {
    return "feature";
  }

  if (
    labelNames.some((l) =>
      ["bug", "fix", "bugfix", "patch"].some((k) => l.includes(k))
    )
  ) {
    return "fix";
  }

  if (
    labelNames.some((l) =>
      ["improvement", "refactor", "perf", "performance"].some((k) =>
        l.includes(k)
      )
    )
  ) {
    return "improvement";
  }

  // Check title and body
  if (
    titleLower.includes("fix") ||
    titleLower.includes("bug") ||
    titleLower.includes("patch") ||
    bodyLower.includes("fix") ||
    bodyLower.includes("bug")
  ) {
    return "fix";
  }

  if (
    titleLower.includes("feat") ||
    titleLower.includes("add") ||
    titleLower.includes("new") ||
    titleLower.startsWith("feat:") ||
    bodyLower.includes("feat") ||
    bodyLower.includes("add")
  ) {
    return "feature";
  }

  // Default to improvement
  return "improvement";
}

function formatChangeText(title: string, body: string | null): string {
  // Clean up the title
  let text = title.trim();

  // Remove common prefixes
  text = text.replace(
    /^(feat|fix|chore|docs|style|refactor|perf|test|build|ci):\s*/i,
    ""
  );

  // Capitalize first letter
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  return text;
}

async function fetchAllPRs(headers: HeadersInit): Promise<GitHubPR[]> {
  const allPRs: GitHubPR[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls?state=closed&sort=updated&direction=desc&per_page=${perPage}&page=${page}`,
      { headers, next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      if (page === 1) {
        throw new Error(`Failed to fetch PRs: ${response.status}`);
      }
      break;
    }

    const prs: GitHubPR[] = await response.json();
    if (prs.length === 0) {
      break;
    }

    allPRs.push(...prs);
    page++;

    // Safety limit to avoid infinite loops
    if (page > 50) {
      break;
    }
  }

  return allPRs;
}

async function fetchAllCommits(headers: HeadersInit): Promise<GitHubCommit[]> {
  const allCommits: GitHubCommit[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?per_page=${perPage}&page=${page}`,
      { headers, next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      if (page === 1) {
        // If first page fails, return empty array (commits are optional)
        return [];
      }
      break;
    }

    const commits: GitHubCommit[] = await response.json();
    if (commits.length === 0) {
      break;
    }

    allCommits.push(...commits);
    page++;

    // Safety limit to avoid infinite loops
    if (page > 50) {
      break;
    }
  }

  return allCommits;
}

function getDateKey(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]!;
}

export async function GET() {
  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };

    if (GITHUB_TOKEN) {
      headers.Authorization = `token ${GITHUB_TOKEN}`;
    }

    // Fetch all merged PRs from the beginning
    const allPRs = await fetchAllPRs(headers);

    // Filter only merged PRs
    const mergedPRs = allPRs.filter((pr) => pr.merged_at !== null);

    // Fetch all commits from the beginning
    const allCommits = await fetchAllCommits(headers);

    // Transform PRs into changelog entries with date
    const prChanges: Array<ChangelogEntry & { date: string }> = mergedPRs.map(
      (pr) => ({
        type: parseChangeType(pr.labels, pr.title, pr.body),
        text: formatChangeText(pr.title, pr.body),
        prNumber: pr.number,
        prUrl: pr.html_url,
        date: pr.merged_at
          ? getDateKey(pr.merged_at)
          : getDateKey(new Date().toISOString()),
      })
    );

    // Get all PR commit SHAs to exclude them from direct commits
    // We'll fetch commits for each PR to get their SHAs
    const prCommitShas = new Set<string>();

    // For performance, we'll only check commits that might be in PRs
    // In practice, most commits in PRs will be included via the PR itself
    // So we'll just add direct commits that aren't obviously from PRs
    const directCommits: Array<ChangelogEntry & { date: string }> = allCommits
      .filter((commit) => {
        // Skip merge commits and commits that look like they're from PRs
        const message = commit.commit.message.toLowerCase();
        return (
          !message.includes("merge pull request") &&
          !message.includes("merge branch") &&
          !prCommitShas.has(commit.sha)
        );
      })
      .map((commit) => {
        const message = commit.commit.message.split("\n")[0] || "";
        return {
          type: parseChangeType([], message, null) as
            | "feature"
            | "improvement"
            | "fix",
          text: formatChangeText(message, null),
          date: getDateKey(commit.commit.author.date),
        };
      });

    const allChanges = [...prChanges, ...directCommits];

    // If no changes, return empty array
    if (allChanges.length === 0) {
      return NextResponse.json({
        releases: [],
      });
    }

    // Group changes by date
    const changesByDate = new Map<string, ChangelogEntry[]>();
    for (const change of allChanges) {
      const dateKey = change.date;
      if (!changesByDate.has(dateKey)) {
        changesByDate.set(dateKey, []);
      }
      const { date, ...changeWithoutDate } = change;
      changesByDate.get(dateKey)!.push(changeWithoutDate);
    }

    // Create releases grouped by date
    const releases: Release[] = Array.from(changesByDate.entries())
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([date, changes]) => {
        return {
          version: date.replace(/-/g, "."),
          date,
          type: changes.some((c) => c.type === "feature")
            ? "minor"
            : changes.some((c) => c.type === "fix")
              ? "patch"
              : "minor",
          title: `Updates for ${new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`,
          changes,
        };
      });

    return NextResponse.json({
      releases,
    });
  } catch (error) {
    console.error("Error fetching changelog from GitHub:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
