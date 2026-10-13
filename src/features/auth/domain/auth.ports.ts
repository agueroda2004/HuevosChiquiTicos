import type { LoginCredentials, LoginStep } from "./auth";

export interface LoginPort {
  step: LoginStep;
  isLoading: boolean;
  error: string | null;
  submitCredentials: (credentials: LoginCredentials) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
  reset: () => void;
}
