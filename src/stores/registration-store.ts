import { create } from "zustand";

export type RegType = "member" | "non-member" | "company";

export interface Representative {
  name: string;
  title: string;
  phone: string;
}

interface RegistrationState {
  step: number;
  regType: RegType | null;
  saved: boolean;

  // Common
  email: string;
  password: string;

  // Member / Non-member
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

  // Company (sponsor / exhibitor unified)
  companyName: string;
  tagline: string;
  /** Short company/org description; sent as API field `description` (required for company). */
  companyDescription: string;
  boothPreference: string;
  selectedBoothId: string;
  website: string;
  contactEmail: string;
  primaryContactName: string;
  primaryContactPhone: string;
  representatives: Representative[];

  // UI / Media
  profilePictures: File[];
  isDragging: boolean;

  // Actions
  setStep: (step: number) => void;
  setRegType: (regType: RegType | null) => void;
  setSaved: (saved: boolean) => void;

  setEmail: (v: string) => void;
  setPassword: (v: string) => void;

  setFullName: (v: string) => void;
  setPhone: (v: string) => void;
  setBio: (v: string) => void;
  setHasSpouse: (v: boolean) => void;
  setSpouseName: (v: string) => void;
  setSpouseEmail: (v: string) => void;
  setSpousePhone: (v: string) => void;
  setPrimarySpecialty: (v: string) => void;
  setHospitalOrg: (v: string) => void;
  setAnpmpId: (v: string) => void;
  setInMedicalField: (v: boolean | null) => void;
  setOccupation: (v: string) => void;

  setCompanyName: (v: string) => void;
  setTagline: (v: string) => void;
  setCompanyDescription: (v: string) => void;
  setBoothPreference: (v: string) => void;
  setSelectedBoothId: (v: string) => void;
  setWebsite: (v: string) => void;
  setContactEmail: (v: string) => void;
  setPrimaryContactName: (v: string) => void;
  setPrimaryContactPhone: (v: string) => void;

  setRepresentatives: (r: Representative[] | ((prev: Representative[]) => Representative[])) => void;
  addRepresentative: () => void;
  removeRepresentative: (i: number) => void;
  updateRepresentative: (i: number, field: keyof Representative, val: string) => void;

  setProfilePictures: (p: File[] | ((prev: File[]) => File[])) => void;
  setIsDragging: (v: boolean) => void;

  reset: () => void;
}

const initialRepresentative: Representative = { name: "", title: "", phone: "" };

const initialState = {
  step: 1,
  regType: null as RegType | null,
  saved: false,
  email: "",
  password: "",
  fullName: "",
  phone: "",
  bio: "",
  hasSpouse: false,
  spouseName: "",
  spouseEmail: "",
  spousePhone: "",
  primarySpecialty: "",
  hospitalOrg: "",
  anpmpId: "",
  inMedicalField: null as boolean | null,
  occupation: "",
  companyName: "",
  tagline: "",
  companyDescription: "",
  boothPreference: "",
  selectedBoothId: "",
  website: "",
  contactEmail: "",
  primaryContactName: "",
  primaryContactPhone: "",
  representatives: [initialRepresentative],
  profilePictures: [] as File[],
  isDragging: false,
};

export const useRegistrationStore = create<RegistrationState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setRegType: (regType) => set({ regType }),
  setSaved: (saved) => set({ saved }),

  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),

  setFullName: (fullName) => set({ fullName }),
  setPhone: (phone) => set({ phone }),
  setBio: (bio) => set({ bio }),
  setHasSpouse: (hasSpouse) => set({ hasSpouse }),
  setSpouseName: (spouseName) => set({ spouseName }),
  setSpouseEmail: (spouseEmail) => set({ spouseEmail }),
  setSpousePhone: (spousePhone) => set({ spousePhone }),
  setPrimarySpecialty: (primarySpecialty) => set({ primarySpecialty }),
  setHospitalOrg: (hospitalOrg) => set({ hospitalOrg }),
  setAnpmpId: (anpmpId) => set({ anpmpId }),
  setInMedicalField: (inMedicalField) => set({ inMedicalField }),
  setOccupation: (occupation) => set({ occupation }),

  setCompanyName: (companyName) => set({ companyName }),
  setTagline: (tagline) => set({ tagline }),
  setCompanyDescription: (companyDescription) => set({ companyDescription }),
  setBoothPreference: (boothPreference) => set({ boothPreference }),
  setSelectedBoothId: (selectedBoothId) => set({ selectedBoothId }),
  setWebsite: (website) => set({ website }),
  setContactEmail: (contactEmail) => set({ contactEmail }),
  setPrimaryContactName: (primaryContactName) => set({ primaryContactName }),
  setPrimaryContactPhone: (primaryContactPhone) => set({ primaryContactPhone }),

  setRepresentatives: (r) =>
    set((s) => ({
      representatives: typeof r === "function" ? r(s.representatives) : r,
    })),
  addRepresentative: () =>
    set((s) => ({
      representatives: [...s.representatives, { ...initialRepresentative }],
    })),
  removeRepresentative: (i) =>
    set((s) => ({
      representatives: s.representatives.filter((_, idx) => idx !== i),
    })),
  updateRepresentative: (i, field, val) =>
    set((s) => ({
      representatives: s.representatives.map((item, idx) =>
        idx === i ? { ...item, [field]: val } : item
      ),
    })),

  setProfilePictures: (p) =>
    set((s) => ({
      profilePictures: typeof p === "function" ? p(s.profilePictures) : p,
    })),
  setIsDragging: (isDragging) => set({ isDragging }),

  reset: () => set(initialState),
}));
