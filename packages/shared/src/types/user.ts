export type User = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

export type UserProfile = Pick<User, "id" | "email" | "fullName" | "avatarUrl">;
