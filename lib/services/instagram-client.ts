/**
 * Instagram Graph API client — server-only.
 *
 * Handles all HTTP calls to the Instagram/Meta Graph API.
 * Never exposes tokens. Returns typed data or null on failure.
 */

const API_BASE = "https://graph.instagram.com/v21.0";

// ─── Types ───

export interface IgProfile {
  id: string;
  username: string;
  mediaCount: number;
  followersCount: number;
  followsCount: number;
}

export interface IgMediaItem {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  caption?: string;
  permalink?: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
}

export interface IgMediaInsights {
  reach?: number;
  impressions?: number;
  saved?: number;
}

export interface IgAccountInsights {
  reach?: number;
  impressions?: number;
  profileViews?: number;
}

// ─── Helpers ───

async function graphGet<T>(path: string, token: string): Promise<T | null> {
  const separator = path.includes("?") ? "&" : "?";
  const url = `${API_BASE}${path}${separator}access_token=${token}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      console.error(`[ig-client] GET ${path} failed:`, text);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(`[ig-client] GET ${path} error:`, err);
    return null;
  }
}

// ─── Profile ───

export async function fetchProfile(token: string): Promise<IgProfile | null> {
  const data = await graphGet<{
    user_id?: string;
    id: string;
    username: string;
    media_count?: number;
    followers_count?: number;
    follows_count?: number;
  }>("/me?fields=user_id,username,media_count,followers_count,follows_count", token);

  if (!data) return null;

  return {
    id: data.user_id ?? data.id,
    username: data.username,
    mediaCount: data.media_count ?? 0,
    followersCount: data.followers_count ?? 0,
    followsCount: data.follows_count ?? 0,
  };
}

// ─── Recent Media (last 25) ───

export async function fetchRecentMedia(token: string): Promise<IgMediaItem[]> {
  const data = await graphGet<{
    data: IgMediaItem[];
  }>("/me/media?fields=id,media_type,caption,permalink,timestamp,like_count,comments_count&limit=25", token);

  return data?.data ?? [];
}

// ─── Media Insights (per media) ───

export async function fetchMediaInsights(
  mediaId: string,
  token: string
): Promise<IgMediaInsights> {
  const data = await graphGet<{
    data: Array<{ name: string; values: Array<{ value: number }> }>;
  }>(`/${mediaId}/insights?metric=reach,impressions,saved`, token);

  const result: IgMediaInsights = {};
  if (data?.data) {
    for (const metric of data.data) {
      const val = metric.values?.[0]?.value;
      if (metric.name === "reach") result.reach = val;
      if (metric.name === "impressions") result.impressions = val;
      if (metric.name === "saved") result.saved = val;
    }
  }
  return result;
}

// ─── Account Insights (28 days) ───

export async function fetchAccountInsights(
  igUserId: string,
  token: string
): Promise<IgAccountInsights> {
  const data = await graphGet<{
    data: Array<{
      name: string;
      total_value?: { value: number };
      values?: Array<{ value: number }>;
    }>;
  }>(
    `/${igUserId}/insights?metric=reach,impressions,profile_views&period=day&metric_type=total_value&since=${daysAgo(28)}&until=${todayTimestamp()}`,
    token
  );

  const result: IgAccountInsights = {};
  if (data?.data) {
    for (const metric of data.data) {
      const val = metric.total_value?.value;
      if (metric.name === "reach") result.reach = val;
      if (metric.name === "impressions") result.impressions = val;
      if (metric.name === "profile_views") result.profileViews = val;
    }
  }
  return result;
}

// ─── Date helpers ───

function daysAgo(n: number): number {
  return Math.floor((Date.now() - n * 86400000) / 1000);
}

function todayTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}
