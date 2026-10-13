import { useState, type FormEvent } from "react";

import { loginSchema, type LoginFormValues } from "../validations/auth.validator";
import { PasswordInput } from "./PasswordInput";

type LoginFormProps = {
  isLoading: boolean;
  error: string | null;
  onSubmit: (values: LoginFormValues) => void;
};

type FieldErrors = Partial<Record<keyof LoginFormValues, string>>;

function collectFieldErrors(issues: { path: PropertyKey[]; message: string }[]): FieldErrors {
  return issues.reduce<FieldErrors>((accumulator, issue) => {
    const field = issue.path[0];
    if ((field === "email" || field === "password") && !accumulator[field]) {
      accumulator[field] = issue.message;
    }
    return accumulator;
  }, {});
}

export function LoginForm({ isLoading, error, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setFieldErrors(collectFieldErrors(result.error.issues));
      return;
    }

    setFieldErrors({});
    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-medium text-third">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@ejemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-secondary/30 bg-white px-4 py-3 text-sm text-third outline-none transition placeholder:text-secondary/60 focus:border-secondary focus:ring-2 focus:ring-secondary/30"
        />
        {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-medium text-third">
          Contraseña
        </label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-1 w-full rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-third disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
