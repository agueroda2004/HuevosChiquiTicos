import { useState, type FormEvent } from "react";

import { verificationSchema } from "../validations/auth.validator";

type MfaCodeFormProps = {
  isLoading: boolean;
  error: string | null;
  onSubmit: (code: string) => void;
  onResend: () => void;
  onReset: () => void;
};

export function MfaCodeForm({ isLoading, error, onSubmit, onResend, onReset }: MfaCodeFormProps) {
  const [code, setCode] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = verificationSchema.safeParse({ code });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Ingresa el código de 6 dígitos.");
      return;
    }

    setFieldError(null);
    onSubmit(result.data.code);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <p className="text-center text-xs text-secondary">
        Enviamos un código de verificación a tu correo. Ingrésalo para continuar.
      </p>

      <input
        id="code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="000000"
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
        className="w-full rounded-xl border border-secondary/30 bg-white px-4 py-3 text-center text-lg tracking-[0.5em] text-third outline-none transition placeholder:text-secondary/40 focus:border-secondary focus:ring-2 focus:ring-secondary/30"
      />
      {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-third disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Verificando..." : "Verificar"}
      </button>

      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onResend}
          disabled={isLoading}
          className="font-medium text-secondary transition hover:text-third disabled:opacity-60"
        >
          Reenviar código
        </button>
        <button
          type="button"
          onClick={onReset}
          className="font-medium text-secondary transition hover:text-third"
        >
          Volver a empezar
        </button>
      </div>
    </form>
  );
}
