import { useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);

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

          {/* Lab name */}
          <p className="mt-4 text-3xl font-bold uppercase tracking-wide text-brand-blue leading-tight">
            {appBrand.labName}
          </p>

          {/* Tagline */}
          <p className="mt-1 text-sm text-slate-500">{appBrand.loginTagline}</p>

          {/* Address block */}
          <div className="mt-2 text-xs leading-[1.3] text-slate-400">
            <p>{appBrand.address}</p>
            <p>{appBrand.email} &middot; {appBrand.phone}</p>
            <p>{appBrand.website}</p>
          </div>
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">Welcome back</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit((values) => login.mutate(values))}>
          <Input
            label="Email"
            type="email"
            {...register("email")}
            error={formState.errors.email?.message}
          />

          {/* Password with show/hide toggle */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="min-h-11 w-full rounded-lg border border-brand-border bg-white px-3 py-2 pr-11 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                placeholder="Enter your password"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center justify-center w-11 text-slate-400 hover:text-brand-blue transition-colors"
              >
                {showPassword ? (
                  /* Eye-off icon */
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  /* Eye icon */
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {formState.errors.password?.message ? (
              <p className="text-xs text-brand-red">{formState.errors.password.message}</p>
            ) : null}
          </div>

          <Button type="submit" fullWidth disabled={login.isPending}>
            {login.isPending ? "Signing in..." : "Sign in"}
          </Button>
          {login.error ? (
            <p className="text-sm text-brand-red">{login.error.message}</p>
          ) : null}
        </form>
      </Card>
    </div>
  );
}
