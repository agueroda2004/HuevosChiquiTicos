export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginStep = "credentials" | "verification";
