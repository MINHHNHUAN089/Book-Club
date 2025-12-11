export type ReadingStatus = "not_started" | "reading" | "finished";

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  progress: number;
  rating?: number;
  review?: string;
  clubGroupIds?: string[];
  challengeIds?: string[];
}

export interface ClubGroup {
  id: string;
  name: string;
  members: number;
  nextMeeting?: string;
  topic: string;
}

export interface Challenge {
  id: string;
  name: string;
  target: string;
  progress: number;
  due: string;
}

export interface AuthorFollow {
  id: string;
  name: string;
  genres: string[];
  latestBook?: string;
}

