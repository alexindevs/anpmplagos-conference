import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api";
import { authSessionQueryKey } from "@/hooks/use-auth-session";
import type { Booth } from "@/lib/api";
import type { RegType } from "@/stores/registration-store";

export const registrationKeys = {
  booths: ["companies", "booths", "available"] as const,
};

export function useAvailableBooths(enabled: boolean) {
  return useQuery({
    queryKey: registrationKeys.booths,
    queryFn: () => apiFetch<Booth[]>("/api/companies/booths/available"),
    enabled,
  });
}

interface CreateRegistrationPayload {
  regType: RegType | null;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  bio: string;
  hasSpouse: boolean;
  spouseName: string;
  spouseEmail: string;
  spousePhone: string;
  primarySpecialty: string;
  hospitalOrg: string;
  anpmpId: string;
  inMedicalField: boolean | null;
  occupation: string;
  companyName: string;
  tagline: string;
  companyDescription: string;
  boothPreference: string;
  selectedBoothId: string;
  website: string;
  contactEmail: string;
  primaryContactName: string;
  primaryContactPhone: string;
  representatives: { name: string; title: string; phone: string }[];
  profilePictures: File[];
}

interface RegistrationResponse {
  id: string;
  status: string;
  message: string;
}

/** Optional reps for company; if all rows empty, reuse primary contact as one rep when name/phone present. */
function normalizeCompanyRepresentatives(payload: CreateRegistrationPayload): {
  name: string;
  title: string;
  phone: string;
}[] {
  const filled = payload.representatives.filter((r) => r.name?.trim() || r.title?.trim() || r.phone?.trim());
  if (filled.length > 0) {
    return filled.map((r) => ({
      name: (r.name ?? "").trim(),
      title: (r.title ?? "").trim(),
      phone: (r.phone ?? "").trim(),
    }));
  }
  const name = (payload.primaryContactName ?? "").trim();
  const phone = (payload.primaryContactPhone ?? "").trim();
  if (name || phone) {
    return [{ name, title: "", phone }];
  }
  return [];
}

function appendCompanyRepresentativesToFormData(
  fd: FormData,
  representatives: { name: string; title: string; phone: string }[]
) {
  // NestJS / multipart: indexed fields parse to an array of objects (avoid JSON.stringify string).
  representatives.forEach((r, i) => {
    fd.append(`representatives[${i}][name]`, r.name);
    fd.append(`representatives[${i}][title]`, r.title);
    fd.append(`representatives[${i}][phone]`, r.phone);
  });
}

function buildRegistrationBody(payload: CreateRegistrationPayload): Record<string, unknown> {
  const apiRegType = payload.regType === "non-member" ? "attendee" : payload.regType;

  if (apiRegType === "member") {
    return {
      regType: "member",
      email: payload.email,
      password: payload.password,
      fullName: payload.fullName,
      phone: payload.phone,
      bio: payload.bio || undefined,
      anpmpId: payload.anpmpId || undefined,
      hasSpouse: payload.hasSpouse,
      spouseName: payload.hasSpouse ? payload.spouseName : undefined,
      spouseEmail: payload.hasSpouse ? payload.spouseEmail : undefined,
      spousePhone: payload.hasSpouse ? payload.spousePhone : undefined,
      primarySpecialty: payload.primarySpecialty,
      hospitalOrg: payload.hospitalOrg,
    };
  }

  if (apiRegType === "attendee") {
    return {
      regType: "attendee",
      email: payload.email,
      password: payload.password,
      fullName: payload.fullName,
      phone: payload.phone,
      bio: payload.bio || undefined,
      inMedicalField: payload.inMedicalField ?? false,
      primarySpecialty: payload.inMedicalField ? payload.primarySpecialty : undefined,
      hospitalOrg: payload.inMedicalField ? payload.hospitalOrg : undefined,
      occupation: !payload.inMedicalField ? payload.occupation : undefined,
    };
  }

  if (apiRegType === "company") {
    const representatives = normalizeCompanyRepresentatives(payload);
    return {
      regType: "company",
      email: payload.email,
      password: payload.password,
      companyName: payload.companyName,
      description: payload.companyDescription.trim(),
      tagline: payload.tagline || undefined,
      website: payload.website || undefined,
      contactEmail: payload.contactEmail,
      primaryContactName: payload.primaryContactName,
      primaryContactPhone: payload.primaryContactPhone,
      ...(representatives.length > 0 ? { representatives } : {}),
    };
  }

  throw new Error(`Unsupported registration type: ${String(apiRegType)}`);
}

export function useCreateRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateRegistrationPayload) => {
      if (payload.regType === "company" && !(payload.companyDescription ?? "").trim()) {
        throw new Error("Company description is required.");
      }
      const body = buildRegistrationBody(payload);
      const isWithImages = payload.regType === "company" && payload.profilePictures.length > 0;

      if (isWithImages) {
        const fd = new FormData();
        const representatives =
          "representatives" in body && Array.isArray(body.representatives)
            ? (body.representatives as { name: string; title: string; phone: string }[])
            : [];
        const { representatives: _omit, ...rest } = body as Record<string, unknown> & {
          representatives?: unknown;
        };

        Object.entries(rest).forEach(([key, value]) => {
          if (value === undefined || value === null || value === "") return;
          if (typeof value === "object") fd.append(key, JSON.stringify(value));
          else fd.append(key, String(value));
        });

        appendCompanyRepresentativesToFormData(fd, representatives);

        // Company: [0]=Logo, [1]=Header (banner)
        const [firstImage, secondImage] = payload.profilePictures;
        if (firstImage) fd.append("logo", firstImage);
        if (secondImage) fd.append("headerImage", secondImage);

        return apiFetch<RegistrationResponse>("/api/registrations", {
          method: "POST",
          body: fd,
        });
      }

      return apiFetch<RegistrationResponse>("/api/registrations", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.booths });
      queryClient.invalidateQueries({ queryKey: authSessionQueryKey });
    },
  });
}

export function getSubmitErrorMessage(err: unknown): string {
  if (err instanceof Error && !(err instanceof ApiError)) {
    return err.message;
  }
  if (err instanceof ApiError) {
    if (err.status === 409) return "This email is already registered.";
    if (err.status === 422) return "Invalid ANPMP ID. Please check and try again.";
    if (err.status === 400) return (err.body?.message as string) ?? "Please check your entries and try again.";
    return err.message || "Something went wrong. Please try again.";
  }
  return "Unable to connect. Please check your connection and try again.";
}
