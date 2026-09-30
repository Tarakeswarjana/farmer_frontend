"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LocationPicker } from "@/components/forms/location-picker";
import { authApi } from "@/lib/api/auth";
import { buyersApi } from "@/lib/api/buyers";
import { farmersApi } from "@/lib/api/farmers";
import { deliveriesApi } from "@/lib/api/deliveries";
import { usersApi } from "@/lib/api/users";
import { isApiError } from "@/lib/api/errors";
import { tokenStore } from "@/lib/auth/token-store";
import { dashboardPath } from "@/lib/auth/roles";
import { analytics } from "@/lib/monitoring/analytics";
import { loginSchema, passwordSchema, phoneSchema, verifyPhoneSchema } from "@/schemas/forms";
import type { BusinessType, SelfRegisterRole } from "@/types/api";
import { z } from "zod";

const roles: SelfRegisterRole[] = ["FARMER", "BUYER", "TRADER", "RETAILER", "RESTAURANT", "TRANSPORTER"];

function errorText(error: unknown) {
  return isApiError(error) ? error.message : "Something went wrong";
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

export function LoginScreen() {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const router = useRouter();
  const params = useSearchParams();
  const form = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });
  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (session) => {
      tokenStore.setSession(session);
      const user = await usersApi.me();
      tokenStore.setUser(user);
      toast.success(common("success"));
      router.replace(params.get("next") || dashboardPath(user.role));
    },
  });

  return (
    <form className="card space-y-4 p-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
      <h1 className="text-3xl font-bold">{t("loginTitle")}</h1>
      <p className="text-muted">{t("loginHint")}</p>
      {params.get("reason") === "session" ? <p role="alert" className="text-danger">{common("sessionExpired")}</p> : null}
      <label className="block font-semibold">
        {t("identifier")}
        <input className="mt-1 min-h-14 w-full rounded-2xl border border-line px-3" autoComplete="username" {...form.register("identifier")} />
        {form.formState.errors.identifier ? <span role="alert" className="text-sm text-danger">{form.formState.errors.identifier.message}</span> : null}
      </label>
      <label className="block font-semibold">
        {common("password")}
        <input type="password" className="mt-1 min-h-14 w-full rounded-2xl border border-line px-3" autoComplete="current-password" {...form.register("password")} />
        {form.formState.errors.password ? <span role="alert" className="text-sm text-danger">{form.formState.errors.password.message}</span> : null}
      </label>
      {mutation.isError ? <p role="alert" className="text-danger">{errorText(mutation.error)}</p> : null}
      <Button size="lg" className="w-full" type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? common("saving") : common("signIn")}
      </Button>
      <div className="flex justify-between text-sm font-semibold">
        <Link href="/auth/forgot-password">{t("forgot")}</Link>
        <Link href="/auth/register">{common("createAccount")}</Link>
      </div>
    </form>
  );
}

const businessType: Record<string, BusinessType> = {
  BUYER: "WHOLESALER",
  TRADER: "TRADER",
  RETAILER: "RETAILER",
  RESTAURANT: "RESTAURANT",
};

export function RegisterScreen() {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<SelfRegisterRole>("FARMER");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("North 24 Parganas");
  const [pincode, setPincode] = useState("743249");
  const [village, setVillage] = useState("");
  const [point, setPoint] = useState({ latitude: 22.933, longitude: 88.729 });
  const [code, setCode] = useState("");
  const [debugCode, setDebugCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [vehicle, setVehicle] = useState("WB00AB1234");

  const titles = [t("stepRole"), t("stepPhone"), t("stepProfile"), t("stepLocation"), t("stepVerify")];

  async function next() {
    setError("");
    try {
      if (step === 1) {
        phoneSchema.parse(normalizePhone(phone));
        passwordSchema.parse(password);
        if (name.trim().length < 2) throw new Error("Enter your name");
        setPending(true);
        const registered = await authApi.register({ name: name.trim(), phone: normalizePhone(phone), email: email || undefined, password, role });
        setDebugCode(registered.debugCode ?? "");
        analytics.track("USER_REGISTERED", { role });
      }
      if (step === 4) {
        verifyPhoneSchema.parse({ phone, code });
        setPending(true);
        await authApi.verifyPhone({ phone, code });
        const session = await authApi.login({ identifier: phone, password });
        tokenStore.setSession(session);
        const location = point;
        if (role === "FARMER") {
          await farmersApi.createProfile({
            farmerName: name,
            phone,
            address,
            district,
            pincode,
            village,
            state: "West Bengal",
            location,
          });
        } else if (role === "TRANSPORTER") {
          await deliveriesApi.createProfile({
            businessName: name,
            phone,
            vehicleTypes: ["MINI_TRUCK"],
            vehicles: [{ vehicleNumber: vehicle, vehicleType: "MINI_TRUCK", capacity: 1000, driverName: name, driverPhone: phone }],
            serviceAreas: [{ district, state: "West Bengal" }],
            location,
          });
        } else {
          await buyersApi.createProfile({
            businessName: name,
            businessType: businessType[role] ?? "WHOLESALER",
            ownerName: name,
            phone,
            address,
            district,
            pincode,
            state: "West Bengal",
            location,
          });
        }
        await usersApi.updateLocation({ ...location, address, district, state: "West Bengal", pincode, village });
        const user = await usersApi.me();
        tokenStore.setUser(user);
        setPassword("");
        toast.success(t("welcome"));
        router.replace(dashboardPath(user.role));
        return;
      }
      setStep((current) => current + 1);
    } catch (cause) {
      setError(cause instanceof z.ZodError ? cause.issues[0]?.message ?? common("required") : errorText(cause));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="card space-y-4 p-5">
      <p className="text-sm font-semibold text-brand-dark">{step + 1} / 5</p>
      <h1 className="text-3xl font-bold">{titles[step]}</h1>
      {step === 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {roles.map((item) => (
            <button key={item} type="button" className={`min-h-24 rounded-2xl border text-lg font-bold ${role === item ? "border-brand bg-brand-light" : "border-line bg-surface"}`} onClick={() => setRole(item)}>
              {t(item.toLowerCase() as "farmer")}
            </button>
          ))}
        </div>
      ) : null}
      {step === 1 ? (
        <div className="space-y-3">
          <input className="min-h-14 w-full rounded-2xl border border-line px-3" placeholder={common("name")} value={name} onChange={(event) => setName(event.target.value)} />
          <input className="min-h-14 w-full rounded-2xl border border-line px-3" placeholder={common("phone")} inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <input className="min-h-14 w-full rounded-2xl border border-line px-3" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <input type="password" className="min-h-14 w-full rounded-2xl border border-line px-3" placeholder={common("password")} value={password} onChange={(event) => setPassword(event.target.value)} aria-label={common("password")} />
          <p className="text-sm text-muted">{t("passwordHint")}</p>
        </div>
      ) : null}
      {step === 2 ? (
        <div className="space-y-3">
          <input className="min-h-14 w-full rounded-2xl border border-line px-3" placeholder={common("address")} value={address} onChange={(event) => setAddress(event.target.value)} />
          <input className="min-h-14 w-full rounded-2xl border border-line px-3" placeholder={common("district")} value={district} onChange={(event) => setDistrict(event.target.value)} />
          <input className="min-h-14 w-full rounded-2xl border border-line px-3" placeholder="PIN" value={pincode} onChange={(event) => setPincode(event.target.value)} />
          <input className="min-h-14 w-full rounded-2xl border border-line px-3" placeholder="Village" value={village} onChange={(event) => setVillage(event.target.value)} />
          {role === "TRANSPORTER" ? <input className="min-h-14 w-full rounded-2xl border border-line px-3" placeholder="Vehicle number" value={vehicle} onChange={(event) => setVehicle(event.target.value)} /> : null}
        </div>
      ) : null}
      {step === 3 ? <LocationPicker latitude={point.latitude} longitude={point.longitude} onChange={setPoint} /> : null}
      {step === 4 ? (
        <div className="space-y-3">
          <p className="text-muted">{t("verifyHint")}</p>
          {debugCode ? <p className="rounded-2xl bg-brand-light p-3 font-semibold">{t("debugCode", { code: debugCode })}</p> : null}
          <input className="min-h-14 w-full rounded-2xl border border-line px-3 text-center text-2xl tracking-widest" inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value)} aria-label={t("code")} />
        </div>
      ) : null}
      {error ? <p role="alert" className="text-danger">{error}</p> : null}
      <div className="flex gap-2">
        {step > 0 ? <Button variant="secondary" type="button" onClick={() => setStep((current) => current - 1)}>{common("back")}</Button> : null}
        <Button size="lg" className="flex-1" type="button" disabled={pending} onClick={() => void next()}>
          {pending ? common("saving") : step === 4 ? common("submit") : common("next")}
        </Button>
      </div>
      <Link href="/auth/login" className="block text-center font-semibold">{common("signIn")}</Link>
    </div>
  );
}

export function VerifyPhoneScreen() {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: () => authApi.verifyPhone({ phone, code }),
    onSuccess: () => setMessage(common("success")),
    onError: (cause) => setError(errorText(cause)),
  });
  return (
    <form className="card space-y-4 p-5" onSubmit={(event) => { event.preventDefault(); setError(""); mutation.mutate(); }}>
      <h1 className="text-3xl font-bold">{t("verifyTitle")}</h1>
      <p className="text-muted">{t("verifyHint")}</p>
      <input className="min-h-14 w-full rounded-2xl border border-line px-3" value={phone} onChange={(event) => setPhone(event.target.value)} aria-label={common("phone")} />
      <input className="min-h-14 w-full rounded-2xl border border-line px-3" value={code} onChange={(event) => setCode(event.target.value)} aria-label={t("code")} />
      {error ? <p role="alert" className="text-danger">{error}</p> : null}
      {message ? <p role="status" className="text-success">{message}</p> : null}
      <Button size="lg" className="w-full" disabled={mutation.isPending}>{mutation.isPending ? common("saving") : common("submit")}</Button>
    </form>
  );
}

export function ForgotPasswordScreen() {
  const t = useTranslations("auth");
  const [identifier, setIdentifier] = useState("");
  const [debugCode, setDebugCode] = useState("");
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: () => authApi.forgotPassword(identifier),
    onSuccess: (result) => setDebugCode(result.debugCode ?? result.message),
    onError: (cause) => setError(errorText(cause)),
  });
  return (
    <form className="card space-y-4 p-5" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
      <h1 className="text-3xl font-bold">{t("forgot")}</h1>
      <input className="min-h-14 w-full rounded-2xl border border-line px-3" value={identifier} onChange={(event) => setIdentifier(event.target.value)} aria-label={t("identifier")} />
      {debugCode ? <p className="rounded-2xl bg-brand-light p-3">{debugCode}</p> : null}
      {error ? <p role="alert" className="text-danger">{error}</p> : null}
      <Button size="lg" className="w-full" disabled={mutation.isPending}>{t("sendCode")}</Button>
      <Link href="/auth/reset-password" className="block font-semibold">{t("resetTitle")}</Link>
    </form>
  );
}

export function ResetPasswordScreen() {
  const t = useTranslations("auth");
  const common = useTranslations("common");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: () => authApi.resetPassword({ identifier, code, newPassword }),
    onSuccess: () => setDone(true),
    onError: (cause) => setError(errorText(cause)),
  });
  return (
    <form className="card space-y-4 p-5" onSubmit={(event) => { event.preventDefault(); mutation.mutate(); }}>
      <h1 className="text-3xl font-bold">{t("resetTitle")}</h1>
      <input className="min-h-14 w-full rounded-2xl border border-line px-3" value={identifier} onChange={(event) => setIdentifier(event.target.value)} aria-label={t("identifier")} />
      <input className="min-h-14 w-full rounded-2xl border border-line px-3" value={code} onChange={(event) => setCode(event.target.value)} aria-label={t("code")} />
      <input type="password" className="min-h-14 w-full rounded-2xl border border-line px-3" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} aria-label={t("newPassword")} />
      {done ? <p role="status">{common("success")}</p> : null}
      {error ? <p role="alert" className="text-danger">{error}</p> : null}
      <Button size="lg" className="w-full" disabled={mutation.isPending}>{common("save")}</Button>
      <Link href="/auth/login">{common("signIn")}</Link>
    </form>
  );
}
