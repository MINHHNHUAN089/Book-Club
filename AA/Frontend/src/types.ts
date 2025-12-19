export type ReadingStatus = "not_started" | "reading" | "finished";

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  fileUrl?: string;
  progress: number;
  rating?: number;
  review?: string;
  clubGroupIds?: string[];
  challengeIds?: string[];
  description?: string;
}

export interface ClubGroup {
  id: string;
  name: string;
  members: number;
  nextMeeting?: string;
  topic: string;
  currentBook?: string;
  coverUrl?: string;
}

export type ChallengeStatus = "active" | "completed" | "not_joined";

export interface Challenge {
  id: string;
  name: string;
  target: string;
  progress: number;
  due: string;
  status?: ChallengeStatus;
  coverUrl?: string;
  xpReward?: number;
  currentCount?: number;
  totalCount?: number;
  participants?: number;
  timeRemaining?: string;
  tags?: string[];
  badge?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export type AuthorActivityType = "new_book" | "discussion" | "award" | "upcoming" | "none";

export interface AuthorFollow {
  id: string;
  name: string;
  genres: string[];
  latestBook?: string;
  avatarUrl?: string;
  followers?: number;
  notificationEnabled?: boolean;
  activity?: AuthorActivityType;
  activityContent?: {
    title?: string;
    description?: string;
    time?: string;
    bookCover?: string;
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

