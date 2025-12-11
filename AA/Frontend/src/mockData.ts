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
    name: "Những người yêu sách viễn tưởng",
    members: 128,
    topic: "Sách viễn tưởng",
    currentBook: "Dune",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTSK5M1-EcVAW9NdcougcpMiRXkZi5hjFQuf5oL-5rH7uQjgRK8ZzTYIXyYX35OZCgIXE-0r5xfcllFAGeFmZmW8HVAUmawFlZH9YOvK2_FXUH0LHDEzOcy_e2Zt82m5bgclhvmDuVFtwFrFeYJD6X3EE9ecwulgix6H47o5g5TyJOe9CPfowLgq3ZXkKs7hWQmYdAKwljERCKzhkfQNRV6qlxlNwIsQRnRzasICQtCo_ZtDpsJ26Q4-jvayfsgO1SZAONwDpIgDWu"
  },
  {
    id: "club-2",
    name: "Câu lạc bộ kinh điển",
    members: 250,
    topic: "Văn học kinh điển",
    currentBook: "The Hobbit",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3TNrF8PhgQJM6zRvTNyRDP9Is5CEW-mL_k-Coi_mvqyh6X3jq7-AjbwIa78unJFv7fWZquWrm0nAMj1cjdsYb6sjRgxenykfmgOYEedHMOc5haO8lCCxrr97cTaLxmxYt-foRkibSugBMPazMy_WWfel1H1J9MonuhA2sgaFBneBMQXoBu_ofWNNpe1ERl84e2Vign-aF7JkXs0_72hfRzOJyBZdZ9quuCA07zoXwNymiC0gjpoZvtzQ9LIqEc-QiXzYtU810Nxgl"
  },
  {
    id: "club-3",
    name: "Thám tử và Bí ẩn",
    members: 89,
    topic: "Thể loại trinh thám",
    currentBook: "A Study in Scarlet",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3tYom8MPyzivLiS48J2WJnmCFuH77sxHtArjq11Nc_cCAhjqRWuLqYe3pJDqIuzvQtKHAVhzglLgC6AwAS1ltFq-Ryr8qTIHocluVzwAdugNyH_D2Ayzix2tdDF4r6rdzbta4BjOXZWD9BY0j6UIGMDKFWjAHbvXqWWbpaIrUJOCAD11x8ZzOZYkvk_nBSNDgK1zDRR82GwMTRfLzmTNyQeCviR6AgF2aRoBQAuTT8-7aKgVEObOcwpCKyjJd4m49S-xdDSgvCGEE"
  },
  {
    id: "club-4",
    name: "Sách phi hư cấu",
    members: 312,
    topic: "Non-fiction",
    currentBook: "Thinking, Fast and Slow",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcOZdNPOlgGYNAh9Nyo7dc6FVTDV_DMl0JKNXrBEKHqZDzQj4rlKcBZBY5awIw9A7z0vPY24oNW6DUbEz57jrlVGUW8uM5nXZM5UbSyyU--djRn8XgrthQ3-WO_OSZezhJ5mKPyLFxnpwXucdUdEda94JqqX-Ky6GBHsJdowg_Ghtzg8gr_7s_eJ8_IV2mZnuTdTN1kzU1EMfn3uJ-WhW1SwxaPr1PLI0vAzr_2DMCnXwX6rRW5ZLzPDYNhGBREMg6TRdAk70xxZD3"
  },
  {
    id: "club-5",
    name: "Phát triển bản thân",
    members: 540,
    topic: "Self-help",
    currentBook: "Atomic Habits",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIyKbCnIUbT-BVUZH8WaIIeDr_My_2GcXUQfVpcXFRtRqASPhMv8DL3H2WPa8BvCuDjVXxowW1TSPtGaC5mkDRnDBNVx4kPasKXk2WC1VS1z8UYuM6eQn1x1KYM_mrzssEXVs6hG8JZ9Tuyj0vaspUJyhrY8Ke2YUFPYx0mWGiGuS-CBgOPbxNFHbzA5n12nKsjp0uH3o3cOYugdcmEVI2QMnUlW1PCuhInQGIpA9w174BQg83-CyjsnQ4rg1n2XMrdN-ts0zmwLk5"
  },
  {
    id: "club-6",
    name: "Lãng mạn hiện đại",
    members: 76,
    topic: "Romance",
    currentBook: "The Love Hypothesis",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcbVk60UMAHTj5P4FOWyLBnBcvMYLdOEP7aVCPjhoSRgc4-nTfLbyB4b_KDdNZhd_PbXRh62rC9GlcgM-f-7zQyL_jKTjvNupPxTnv4OZmPKS2A7SzI7I2n_FZ2hj_fNPMFr8p8u1VY8Hck2S8aRdxHGtbaMDxaEfh4sHOUJLMEs1bXM6CFOpOzok_krdho2qfxQe78syj9yOlMEerUAiHMSQ094VEa7dXt68bCN_MTLOW0CtkRh6FQCUhDlTJowCiWBVIvpJcsyt1"
  },
  {
    id: "club-7",
    name: "Khoa học viễn tưởng Hard Sci-Fi",
    members: 198,
    topic: "Hard Sci-Fi",
    currentBook: "Project Hail Mary",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHba2ufFtO955db7er-9hcOZFpLYGige-XMszam2IlLaxAhpUnBJfiRayaJYA-F22U9nhGLj6iCdQsNd2gN4L-h4LtIoIwYlVV7g7_oeO7EELL77Lwn0RsqP3TVajqx6O9NMfanrElUjVlDeXBl98Wu8o6JRAIAagy9XEZTmhxABCgZK4ttaF5T-pc3P4h8SBreYT1K8fW9FS05pHAIHxuLDGtZm0ybnkX6tCGWfQ8HvPyVJs-ybwR5m7YDE4HzltHQiaGu8fGidbN"
  },
  {
    id: "club-8",
    name: "Tiểu thuyết lịch sử",
    members: 153,
    topic: "Historical Fiction",
    currentBook: "All the Light We Cannot See",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDY0SusQmyJnwV3SRMcNwMZ5BhC1yvvGkKrKaYNzeK_LXesPsgAQT9a0uwDhRT3tlQe1whfOpcqMGbf050FQ1DIXhhHjz-I-rV0Ha1xcNdDXlg2mRmcXWjEKyDmtN9_5ozHkN_0Io6iL6AZTMiyMuZAlRV6kctSi53_xnLkDR_j1TKtNzzcaXXsjIuQaCHK9FsLFSh7y9WZyAcDhMPQFirWJgKcYmN8uIs_-1vdqJlKUMYg5KwQ_nXSf76BmYff2zfuGaMw4PLQ7MBE"
  }
];

export const mockChallenges: Challenge[] = [
  {
    id: "ch-1",
    name: "Thử thách đọc 2024",
    target: "Mục tiêu 50 cuốn sách trong năm nay",
    progress: 48,
    due: "Dec 31, 2024",
    status: "active",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKWGMo2CRujUhItFIcT8qaQZBhZXRtRTkdcFvgYmdWvBPu15uGNEXIqOTekG20aXb98iuR2NbgXvmV8rligfp2EHticeGGhRGFJHL4-DpCCYCHe2mJ9hZpDEjys05lmlOCllK9kNPRdycz2Rt_DIO0z-oUbXcKqOGe_O1imVjqPf-QiluzdatAhXRN78YvKzmhIJzGzoF3_t-yhHoYWn5SIdbn0hHVssbJKL2vTxxP42IFj9Kro07ZUFl_1929TVIW9tZknWeDsIj_",
    xpReward: 1000,
    currentCount: 24,
    totalCount: 50,
    participants: 15400,
    timeRemaining: "Còn 8 tháng"
  },
  {
    id: "ch-2",
    name: "Khám phá Vũ trụ",
    target: "Đọc các tác phẩm Khoa học viễn tưởng",
    progress: 30,
    due: "15 days",
    status: "active",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfm5oZGS-ntJ0seN3Y_gVNgb3ZEP_UtUgl5hVA3Ypx7ObmUkef_U6c-ExZBgl2SFc-cbKCPAXl7ejav_NJSmkfoIDa-ZvETRwh4keirM2XvCRY4AEl_VztzGC4CFH87a7um_wL_nK-I50n1-yW_JzAbtNNxjU5yX0A8CTzsdlatyAG9rd-XlH6XneePB8yHqEFJAX7aQmRMxXUyoRltsedI5AFvXPnwc6KUgtkueLwcR8_y3PixPN_iZiKz6f_pYVZrQbS-mNMC3IG",
    xpReward: 300,
    currentCount: 3,
    totalCount: 10,
    participants: 2100,
    timeRemaining: "15 ngày"
  },
  {
    id: "ch-3",
    name: "Kinh điển Thế giới",
    target: "Những tác phẩm vượt thời gian",
    progress: 0,
    due: "Ongoing",
    status: "not_joined",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAy6rwHmQ7oC6EjbIeVrTSTJECwcYPJ_k56ZIS1uJu63Q3ZWkesdHgsW082Or4MzOu_8XH8Tj4Pm2w3uVJ2I9QZCVTIF8EUlSOhRABWNV4t944AHasaxDSV9iqEqz9rhalZUoUVevMbMWzwnY0qDdyF_4hby76x0DzVSsuyhEBmuQGnbjhk9dm_8qtVJMOwojoo26eKlkEDej3d6yGteLasqZwzwYm2Zd_MCQXd3ycawYZQOK0vgCL8t6xWL0a26TEJemVf_k25y63A",
    xpReward: 500,
    tags: ["Văn học", "Khó"],
    difficulty: "hard"
  },
  {
    id: "ch-4",
    name: "Tháng Trinh thám",
    target: "Bạn đã hoàn thành xuất sắc!",
    progress: 100,
    due: "Completed",
    status: "completed",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuArEbJVkuUMk4O5-flYu8ZwXsvI03qpONixGSvBIlA4YNsJtrYfXWfv9S27mb4ZK9F7YVP_HWCM7o9LsaH4FrpjcdjaXeidY9WJtnvUsr64Pu8m2mXzXFRgBoqfN791tqA_xxHF9vMzjNUzzRtwq8rY_caU3yGGs7LPcMA0XZmNmDKf8YSVKjYXGpBP_x0ujOoCzIp2JwX-6pNCxbPrYwysvqfruFhAJPrts91d1rdeloQlBd5u5VVV5A55Y0b700GVUwBYBtlYGtAF",
    xpReward: 250,
    currentCount: 4,
    totalCount: 4,
    badge: "Thám tử tài ba"
  },
  {
    id: "ch-5",
    name: "Phát triển bản thân",
    target: "Xây dựng thói quen tốt mỗi ngày",
    progress: 0,
    due: "Ongoing",
    status: "not_joined",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI1J4kwt1y1IiVZE9flS528Z7MMnrDmodjXEU-6hsat-_jeD67WkInXc_uJfNBffEpFKj0KsunB7R551o1CcXZmMwxTjSuhcV3rHp4UjnRosyFSf6XzNNONHkNQQWk9Jaa9IgHPGroiwWEWnqzdDiyL24mySsbeWlIRPwyWe-g5aJj8XSfmQfbXH9H-BeVYbQqVwNDA8dqiuVnoxTOnjHwltfomAYr3HpjRAdPSdIXqsfKDUMYQVKyL9Q5UT5LfBmojZllu490WkrT",
    xpReward: 150,
    tags: ["Kỹ năng", "Dễ"],
    difficulty: "easy"
  },
  {
    id: "ch-6",
    name: "Sách đoạt giải Nobel",
    target: "Đỉnh cao văn học nhân loại",
    progress: 0,
    due: "30 days",
    status: "active",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4MUmLz_b1mPIZ9WFSB4QEqgMjLVliz7FK0MNrts2RIDjcgWehq3gakfaPHT8es2AhR_Zvpr8azzrqIXgnvMOZtqkKp95VhKvb34dFclutA0obIuLB23z1RUIfB8eOqMWM8kvS2bDH-NlLD_ZMaPIrbSyDsdRnXoZnRI3I9VwjEFeYgtcsUqn91cku3pfyryvisQlY1dufdPjps2FjE6MHPvxnBWsNlm9o6bWgCRMAhDovnyWVqrxhuHL_eYdub1flmKkeM2K4T_-9",
    xpReward: 800,
    currentCount: 0,
    totalCount: 5,
    participants: 532,
    timeRemaining: "30 ngày"
  }
];

export const mockAuthors: AuthorFollow[] = [
  {
    id: "a-1",
    name: "Kazuo Ishiguro",
    genres: ["Literary Fiction"],
    latestBook: "Klara and the Sun",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC4MUmLz_b1mPIZ9WFSB4QEqgMjLVliz7FK0MNrts2RIDjcgWehq3gakfaPHT8es2AhR_Zvpr8azzrqIXgnvMOZtqkKp95VhKvb34dFclutA0obIuLB23z1RUIfB8eOqMWM8kvS2bDH-NlLD_ZMaPIrbSyDsdRnXoZnRI3I9VwjEFeYgtcsUqn91cku3pfyryvisQlY1dufdPjps2FjE6MHPvxnBWsNlm9o6bWgCRMAhDovnyWVqrxhuHL_eYdub1flmKkeM2K4T_-9",
    followers: 23500,
    notificationEnabled: true,
    activity: "new_book",
    activityContent: {
      title: "Klara and the Sun: Special Edition",
      description: "Phiên bản đặc biệt với lời bạt mới từ tác giả.",
      time: "2 ngày trước",
      bookCover: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKWGMo2CRujUhItFIcT8qaQZBhZXRtRTkdcFvgYmdWvBPu15uGNEXIqOTekG20aXb98iuR2NbgXvmV8rligfp2EHticeGGhRGFJHL4-DpCCYCHe2mJ9hZpDEjys05lmlOCllK9kNPRdycz2Rt_DIO0z-oUbXcKqOGe_O1imVjqPf-QiluzdatAhXRN78YvKzmhIJzGzoF3_t-yhHoYWn5SIdbn0hHVssbJKL2vTxxP42IFj9Kro07ZUFl_1929TVIW9tZknWeDsIj_"
    }
  },
  {
    id: "a-2",
    name: "Andy Weir",
    genres: ["Sci-Fi"],
    latestBook: "Project Hail Mary",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfm5oZGS-ntJ0seN3Y_gVNgb3ZEP_UtUgl5hVA3Ypx7ObmUkef_U6c-ExZBgl2SFc-cbKCPAXl7ejav_NJSmkfoIDa-ZvETRwh4keirM2XvCRY4AEl_VztzGC4CFH87a7um_wL_nK-I50n1-yW_JzAbtNNxjU5yX0A8CTzsdlatyAG9rd-XlH6XneePB8yHqEFJAX7aQmRMxXUyoRltsedI5AFvXPnwc6KUgtkueLwcR8_y3PixPN_iZiKz6f_pYVZrQbS-mNMC3IG",
    followers: 18200,
    notificationEnabled: false,
    activity: "discussion",
    activityContent: {
      title: "Thảo luận mới",
      description: '"Tôi vừa hoàn thành bản thảo cho dự án tiếp theo. Sẽ sớm có tin vui cho các bạn!"',
      time: "5 giờ trước",
      likes: 1200,
      comments: 342
    }
  },
  {
    id: "a-3",
    name: "James Clear",
    genres: ["Self-help", "Productivity"],
    latestBook: "Atomic Habits",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDI1J4kwt1y1IiVZE9flS528Z7MMnrDmodjXEU-6hsat-_jeD67WkInXc_uJfNBffEpFKj0KsunB7R551o1CcXZmMwxTjSuhcV3rHp4UjnRosyFSf6XzNNONHkNQQWk9Jaa9IgHPGroiwWEWnqzdDiyL24mySsbeWlIRPwyWe-g5aJj8XSfmQfbXH9H-BeVYbQqVwNDA8dqiuVnoxTOnjHwltfomAYr3HpjRAdPSdIXqsfKDUMYQVKyL9Q5UT5LfBmojZllu490WkrT",
    followers: 45100,
    notificationEnabled: true,
    activity: "upcoming",
    activityContent: {
      title: "Habit Journal 2025",
      description: "Dự kiến: 15/12/2024"
    }
  },
  {
    id: "a-4",
    name: "Frank Herbert",
    genres: ["Sci-Fi"],
    latestBook: "Dune",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAy6rwHmQ7oC6EjbIeVrTSTJECwcYPJ_k56ZIS1uJu63Q3ZWkesdHgsW082Or4MzOu_8XH8Tj4Pm2w3uVJ2I9QZCVTIF8EUlSOhRABWNV4t944AHasaxDSV9iqEqz9rhalZUoUVevMbMWzwnY0qDdyF_4hby76x0DzVSsuyhEBmuQGnbjhk9dm_8qtVJMOwojoo26eKlkEDej3d6yGteLasqZwzwYm2Zd_MCQXd3ycawYZQOK0vgCL8t6xWL0a26TEJemVf_k25y63A",
    followers: 31200,
    notificationEnabled: false,
    activity: "award",
    activityContent: {
      title: "Giải thưởng",
      description: '"Dune" được bình chọn là tiểu thuyết khoa học viễn tưởng hay nhất mọi thời đại bởi cộng đồng BookClub.',
      time: "1 tuần trước",
      likes: 5600,
      shares: 890
    }
  },
  {
    id: "a-5",
    name: "Madeline Miller",
    genres: ["Literary Fiction", "Historical Fiction"],
    latestBook: "The Song of Achilles",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuArEbJVkuUMk4O5-flYu8ZwXsvI03qpONixGSvBIlA4YNsJtrYfXWfv9S27mb4ZK9F7YVP_HWCM7o9LsaH4FrpjcdjaXeidY9WJtnvUsr64Pu8m2mXzXFRgBoqfN791tqA_xxHF9vMzjNUzzRtwq8rY_caU3yGGs7LPcMA0XZmNmDKf8YSVKjYXGpBP_x0ujOoCzIp2JwX-6pNCxbPrYwysvqfruFhAJPrts91d1rdeloQlBd5u5VVV5A55Y0b700GVUwBYBtlYGtAF",
    followers: 15800,
    notificationEnabled: true,
    activity: "none"
  }
];

