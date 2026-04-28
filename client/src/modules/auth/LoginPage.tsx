import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@shared/index";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { appBrand } from "../../utils/branding";

export function LoginPage() {
  const { login } = useAuth();
  const { register, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "reception@labemr.test",
      password: "Password123!",
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-surface p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,rgba(15,47,88,0.08),rgba(15,94,168,0.16))] shadow-[0_16px_32px_rgba(15,47,88,0.1)]">
            <img src={appBrand.logoPath} alt={appBrand.labName} className="h-12 w-12 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-blue">{appBrand.labName}</p>
            <p className="mt-1 text-sm text-slate-500">{appBrand.loginTagline}</p>
          </div>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Welcome back</h1>
        <div className="mt-1 space-y-1 text-sm text-slate-500">
          <p>Supervisor demo: supervisor@labemr.test</p>
          <p>Scientist demo: scientist@labemr.test</p>
          <p>Password: Password123!</p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit((values) => login.mutate(values))}>
          <Input label="Email" {...register("email")} error={formState.errors.email?.message} />
          <Input label="Password" type="password" {...register("password")} error={formState.errors.password?.message} />
          <Button type="submit" fullWidth disabled={login.isPending}>
            {login.isPending ? "Signing in..." : "Sign in"}
          </Button>
          {login.error ? <p className="text-sm text-brand-red">{login.error.message}</p> : null}
        </form>
      </Card>
    </div>
  );
}
