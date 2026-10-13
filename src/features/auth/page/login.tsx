import { BRAND_LOGO_URL, BRAND_NAME } from "../../../shared/constants";
import { LoginForm } from "../components/LoginForm";
import { MfaCodeForm } from "../components/MfaCodeForm";
import { useLogin } from "../hooks/useLogin";

export default function LoginPage() {
  const login = useLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <main className="w-full max-w-sm rounded-3xl bg-white/90 p-8 shadow-xl shadow-third/5">
        <div className="flex flex-col items-center gap-3 text-center">
          <img
            src={BRAND_LOGO_URL}
            alt={BRAND_NAME}
            className="h-24 w-24 rounded-full object-cover ring-2 ring-secondary/20"
          />
          <h1 className="text-xl font-semibold text-third">{BRAND_NAME}</h1>
          <p className="text-sm text-secondary">Inicia sesión para administrar tus codornices</p>
        </div>

        <div className="mt-8">
          {login.step === "credentials" ? (
            <LoginForm
              isLoading={login.isLoading}
              error={login.error}
              onSubmit={login.submitCredentials}
            />
          ) : (
            <MfaCodeForm
              isLoading={login.isLoading}
              error={login.error}
              onSubmit={login.verifyCode}
              onResend={login.resendCode}
              onReset={login.reset}
            />
          )}
        </div>
      </main>
    </div>
  );
}
