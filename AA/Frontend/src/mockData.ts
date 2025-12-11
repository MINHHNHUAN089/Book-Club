import { AuthorFollow, Book, Challenge, ClubGroup } from "./types";

export const mockBooks: Book[] = [
  {
    id: "bk-1",
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    coverUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
    progress: 65,
    rating: 5,
    review: "Timeless tips for modern software engineers.",
    clubGroupIds: ["club-1"],
    challengeIds: ["ch-1"]
  },
  {
    id: "bk-2",
    title: "Atomic Habits",
    author: "James Clear",
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794",
    progress: 40,
    rating: 4,
    review: "Practical framework for better routines.",
    clubGroupIds: ["club-2"],
    challengeIds: ["ch-2"]
  },
  {
    id: "bk-3",
    title: "Project Hail Mary",
    author: "Andy Weir",
    coverUrl: "https://images.unsplash.com/photo-1541961017774-2256f0f11925",
    progress: 10,
    rating: 0,
    clubGroupIds: ["club-1"]
  }
];

export const mockGroups: ClubGroup[] = [
  {
    id: "club-1",
    name: "Sci-Fi Fridays",
    members: 18,
    nextMeeting: "Next Fri @ 19:00",
    topic: "First-contact novels"
  },
  {
    id: "club-2",
    name: "Non-fiction Nuggets",
    members: 12,
    nextMeeting: "Sat @ 10:00",
    topic: "Habits & productivity"
  }
];

export const mockChallenges: Challenge[] = [
  {
    id: "ch-1",
    name: "12 books in 2025",
    target: "1 book / month",
    progress: 30,
    due: "Dec 31, 2025"
  },
  {
    id: "ch-2",
    name: "Finish 3 self-help titles",
    target: "3 books",
    progress: 60,
    due: "Jun 30, 2025"
  }
];

export const mockAuthors: AuthorFollow[] = [
  { id: "a-1", name: "Brandon Sanderson", genres: ["Fantasy"], latestBook: "Yumi and the Nightmare Painter" },
  { id: "a-2", name: "Cal Newport", genres: ["Productivity", "Deep Work"], latestBook: "Slow Productivity" },
  { id: "a-3", name: "Emily St. John Mandel", genres: ["Literary", "Sci-Fi"], latestBook: "Sea of Tranquility" }
];

