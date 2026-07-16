import type { AppAvatar, AppGender } from "../store/useAppStore";

/** Home day-card looped preview — male (Home page folder in Supabase). */
export const HOME_PAGE_PLACEHOLDER_VIDEO_MALE =
  "https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets/Home%20page/Placeholder%20text%20video.mp4";

/** Home day-card looped preview — female (same folder / same role as male). */
export const HOME_PAGE_PLACEHOLDER_VIDEO_FEMALE =
  "https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets/Home%20page/female%20placeholder.mp4";

/** @deprecated Use getHomePagePlaceholderVideo(avatar) */
export const HOME_PAGE_PLACEHOLDER_VIDEO = HOME_PAGE_PLACEHOLDER_VIDEO_MALE;

/**
 * Legacy fallback MP4 — do NOT use on session list previews.
 */
export const PLACEHOLDER_PREVIEW_VIDEO =
  "https://soyaeuffzytrjojifvdz.supabase.co/storage/v1/object/public/Oncosmart%20Videos%20and%20Assets/Male%20and%20Female%20png%20exports/Male%20photos/Placeholder%20Text%20Video-1.mp4";

/** Picks the home card placeholder video to match the selected avatar/gender. */
export function getHomePagePlaceholderVideo(
  avatar: AppAvatar | null,
  gender: AppGender | null = null,
): string {
  const isFemale = avatar === "female" || (!avatar && gender === "female");
  return isFemale
    ? HOME_PAGE_PLACEHOLDER_VIDEO_FEMALE
    : HOME_PAGE_PLACEHOLDER_VIDEO_MALE;
}
