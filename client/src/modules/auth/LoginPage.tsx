import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@shared/index";
import { useAuth } from "../../hooks/useAuth";
import { BrandLogo } from "../../components/brand/BrandLogo";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { appBrand } from "../../utils/branding";

export function LoginPage() {
  const { login } = useAuth();
  const { register, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-surface p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex flex-col items-center text-center">
          <BrandLogo src={appBrand.logoPath} alt={appBrand.labName} size="lg" />

          {/* Lab name — larger, prominent */}
          <p className="mt-4 text-3xl font-bold uppercase tracking-wide text-brand-blue leading-tight">
            {appBrand.labName}
          </p>

          {/* Tagline — one comfortable step below the name */}
          <p className="mt-1 text-sm text-slate-500">{appBrand.loginTagline}</p>

          {/* Address block — tighter line spacing, all on one compact block */}
          <div className="mt-2 text-xs leading-[1.3] text-slate-400">
            <p>{appBrand.address}</p>
            <p>{appBrand.email} &middot; {appBrand.phone}</p>
            <p>{appBrand.website}</p>
          </div>
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">Welcome back</h1>
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
