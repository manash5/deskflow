export type Admin = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

export type PublicAdmin = Omit<Admin, "passwordHash">;
