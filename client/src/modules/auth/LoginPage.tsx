import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@shared/index";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

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
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-blue">Standalone Lab EMR</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Welcome back</h1>
        <div className="mt-1 space-y-1 text-sm text-slate-500">
          <p>Demo login: admin@labemr.test</p>
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
