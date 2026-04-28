import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import {
  patientRegistrationSchema,
  type PatientRegistrationFormInput,
  type PatientRegistrationInput,
} from "@shared/index";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Skeleton } from "../../components/ui/Skeleton";
import { Textarea } from "../../components/ui/Textarea";
import { api } from "../../services/api";
import { queryKeys } from "../../services/queryKeys";

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, watch, setValue, formState } = useForm<
    PatientRegistrationFormInput,
    unknown,
    PatientRegistrationInput
  >({
    resolver: zodResolver(patientRegistrationSchema),
    defaultValues: {
      gender: "Female",
    },
  });

  const search = watch("phone");
  const patientSearch = useQuery({
    queryKey: queryKeys.patientsSearch(search ?? ""),
    queryFn: async () => {
      const response = await api.get("/patients/search", { params: { q: search } });
      return response.data;
    },
    enabled: Boolean(search && search.length >= 3),
  });

  const createPatient = useMutation({
    mutationFn: async (payload: PatientRegistrationInput) => {
      const response = await api.post("/patients", payload);
      return response.data;
    },
    onSuccess: (patient) => {
      navigate(`/reception/new-visit?patientId=${patient.id}`);
    },
  });

  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Patient registration</h3>
          <p className="text-sm text-slate-500">Search first, then create a fresh patient record only if none exists.</p>
        </div>
        {location.state && "notice" in location.state && typeof location.state.notice === "string" ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{location.state.notice}</div>
        ) : null}
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={handleSubmit((values) =>
            createPatient.mutate({
              ...values,
              allergies: values.allergies ?? [],
            }),
          )}
        >
          <Input label="Laboratory number" {...register("laboratoryNumber")} error={formState.errors.laboratoryNumber?.message} />
          <Input label="First name" {...register("firstName")} error={formState.errors.firstName?.message} />
          <Input label="Last name" {...register("lastName")} error={formState.errors.lastName?.message} />
          <Input label="Date of birth" type="date" {...register("dateOfBirth")} error={formState.errors.dateOfBirth?.message} />
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-slate-700">Gender</span>
            <select className="min-h-11 rounded-lg border border-brand-border bg-white px-3 py-2" {...register("gender")}>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <Input label="Phone" {...register("phone")} error={formState.errors.phone?.message} />
          <Input label="Email" {...register("email")} error={formState.errors.email?.message} />
          <Input label="Emergency contact" {...register("emergencyContact")} />
          <Input label="Emergency phone" {...register("emergencyPhone")} />
          <Input label="Insurance provider" {...register("insuranceProvider")} />
          <Input label="Policy number" {...register("policyNumber")} />
          <Input label="Referring doctor" {...register("referringDoctor")} />
          <Input label="Referring facility" {...register("referringFacility")} />
          <div className="md:col-span-2">
            <Textarea label="Address" {...register("address")} />
          </div>
          <div className="md:col-span-2">
            <Textarea label="Clinical history" {...register("clinicalHistory")} />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Allergies"
              placeholder="Comma separated"
              onChange={(event) =>
                setValue(
                  "allergies",
                  event.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                )
              }
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={createPatient.isPending}>
              {createPatient.isPending ? "Saving..." : "Save patient and open visit"}
            </Button>
          </div>
        </form>
      </Card>
      <Card className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Possible matches</h3>
          <p className="text-sm text-slate-500">Typing a phone number will query the live patient search.</p>
        </div>
        {patientSearch.isLoading ? <Skeleton className="h-28 w-full" /> : null}
        <div className="space-y-3">
          {(patientSearch.data ?? []).map((patient: { id: string; patientId: string; firstName: string; lastName: string; phone: string }) => (
            <button
              key={patient.id}
              className="w-full rounded-xl border border-brand-border bg-brand-surface p-4 text-left"
              onClick={() => navigate(`/reception/new-visit?patientId=${patient.id}`)}
              type="button"
            >
              <p className="font-semibold text-slate-900">
                {patient.firstName} {patient.lastName}
              </p>
              <p className="text-sm text-slate-600">
                Lab no: {patient.patientId} • {patient.phone}
              </p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
