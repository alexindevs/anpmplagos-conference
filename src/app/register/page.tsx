"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { RegType } from "@/stores/registration-store";
import { useRegistrationStore } from "@/stores/registration-store";
import { useCreateRegistration, getSubmitErrorMessage } from "@/hooks/use-registration-api";

const PLANS: { id: RegType; name: string; price: string; description: string; icon: string; benefits: string[] }[] = [
  {
    id: "member",
    name: "Member",
    price: "₦40,000",
    description: "Active ANPMP Lagos Members",
    icon: "medical_services",
    benefits: ["Full access to all days", "AGM Voting Rights", "Social Night Entry"],
  },
  {
    id: "non-member",
    name: "Non-Member",
    price: "₦55,000",
    description: "Other Medical Practitioners",
    icon: "person",
    benefits: ["Full access to all days", "Conference materials", "Social Night Entry"],
  },
  {
    id: "company",
    name: "Sponsor",
    price: "Plans from portal",
    description: "Organizations and companies (booths, sponsorship plans, masterclasses, panel sessions and more)",
    icon: "business",
    benefits: [
      "Company directory listing",
      "Logo on materials",
      "Booth selection after signup",
      "Sponsorship and paid plans",
    ],
  },
];

function getRegistrationPasswordError(password: string): string | null {
  if (password.length < 8) {
    return "Password must be longer than 8 characters.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include a lowercase letter.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include an uppercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include a number.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include a special character (for example !@#$%).";
  }
  return null;
}

export default function RegisterPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    step,
    regType,
    saved,
    email,
    password,
    title,
    fullName,
    phone,
    bio,
    hasSpouse,
    spouseName,
    spouseEmail,
    spousePhone,
    primarySpecialty,
    hospitalOrg,
    organizationAddress,
    zone,
    anpmpId,
    inMedicalField,
    occupation,
    companyName,
    tagline,
    companyDescription,
    boothPreference,
    selectedBoothId,
    website,
    contactEmail,
    primaryContactName,
    primaryContactPhone,
    profilePictures,
    isDragging,
    setStep,
    setRegType,
    setEmail,
    setPassword,
    setTitle,
    setFullName,
    setPhone,
    setBio,
    setHasSpouse,
    setSpouseName,
    setSpouseEmail,
    setSpousePhone,
    setPrimarySpecialty,
    setHospitalOrg,
    setOrganizationAddress,
    setZone,
    setAnpmpId,
    setInMedicalField,
    setOccupation,
    setCompanyName,
    setTagline,
    setCompanyDescription,
    setWebsite,
    setContactEmail,
    setPrimaryContactName,
    setPrimaryContactPhone,
    setProfilePictures,
    setIsDragging,
    setSaved,
  } = useRegistrationStore();

  const createMutation = useCreateRegistration();
  const isSubmitting = createMutation.isPending;
  const submitError = createMutation.error ? getSubmitErrorMessage(createMutation.error) : null;

  const passwordOkLength = password.length > 8;
  const passwordOkLower = /[a-z]/.test(password);
  const passwordOkUpper = /[A-Z]/.test(password);
  const passwordOkDigit = /[0-9]/.test(password);
  const passwordOkSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid =
    passwordOkLength && passwordOkLower && passwordOkUpper && passwordOkDigit && passwordOkSpecial;

  const handleSave = () => {
    const passwordError = getRegistrationPasswordError(password);
    if (passwordError) {
      alert(passwordError);
      return;
    }
    createMutation.mutate(
      {
        regType,
        email,
        password,
        title,
        fullName,
        phone,
        bio,
        hasSpouse,
        spouseName,
        spouseEmail,
        spousePhone,
        primarySpecialty,
        hospitalOrg,
        organizationAddress,
        zone,
        anpmpId,
        inMedicalField,
        occupation,
        companyName,
        tagline,
        companyDescription,
        boothPreference,
        selectedBoothId,
        website,
        contactEmail,
        primaryContactName,
        primaryContactPhone,
        profilePictures,
      },
      {
        onSuccess: () => setSaved(true),
        onError: () => {},
      }
    );
  };

  const stepLabels = ["Pick a plan", "Enter your information", "Review & save"];
  const progressPercent = (step / 3) * 100;

  if (saved) {
    return (
      <main className="flex flex-1 justify-center py-16 px-4">
        <div className="max-w-[600px] w-full text-center">
          <div className="mb-6 flex justify-center">
            <span className="material-symbols-outlined text-6xl text-green-600">check_circle</span>
          </div>
          <h1 className="text-3xl font-black text-[#181112] mb-4">Registration Saved</h1>
          <p className="text-gray-600 mb-8">
            {regType === "company"
              ? "Your company registration has been saved successfully. Log in to manage your company profile, select booths, and book masterclasses or panel sessions."
              : "Your registration has been saved. You can log in with your email and password to complete payment and view your ticket."}
          </p>
          <div className="flex flex-col gap-3">
            {regType === "company" ? (
              <Link
                href="/company/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors shadow-lg"
              >
                <span className="material-symbols-outlined">business</span>
                Access Company Portal
              </Link>
            ) : regType === "member" ? (
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors shadow-lg"
              >
                <span className="material-symbols-outlined">account_circle</span>
                Login Now
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white font-bold hover:bg-red-700 transition-colors shadow-lg"
              >
                <span className="material-symbols-outlined">person</span>
                Login Now
              </Link>
            )}
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-primary transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 justify-center py-10 px-4">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        {/* Progress Stepper */}
        <div className="flex flex-col gap-3 p-4 mb-6">
          <div className="flex gap-6 justify-between">
            <p className="text-[#181112] text-base font-semibold">
              Step {step} of 3
            </p>
            <p className="text-gray-600 text-sm font-normal">
              {Math.round(progressPercent)}% Complete
            </p>
          </div>
          <div className="rounded-full bg-gray-200 h-2 w-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-primary font-medium text-sm">{stepLabels[step - 1]}</p>
        </div>

        {/* Hero */}
        <div className="flex flex-wrap justify-between gap-3 p-4 border-l-4 border-primary bg-white shadow-sm rounded-r-lg mb-8">
          <div className="flex min-w-72 flex-col gap-2">
            <h1 className="text-[#181112] text-4xl font-black leading-tight tracking-tight">
              Conference Registration
            </h1>
            <p className="text-gray-600 text-base">
              Association of Nigerian Private Medical Practitioners — Annual Conference 2026
            </p>
          </div>
        </div>

        {/* Step 1: Plan selection */}
        {step === 1 && (
          <section className="mb-10">
            <h2 className="text-[#181112] text-[22px] font-bold leading-tight px-4 pb-4">
              1. Select Registration Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
              {PLANS.map((plan) => (
                <label
                  key={plan.id}
                  className={`relative flex flex-col p-6 cursor-pointer rounded-xl border-2 transition-all group ${
                    regType === plan.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                >
                  <input
                    className="sr-only"
                    name="reg-type"
                    type="radio"
                    checked={regType === plan.id}
                    onChange={() => setRegType(plan.id)}
                  />
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`material-symbols-outlined text-3xl ${
                        regType === plan.id ? "text-primary" : "text-gray-400 group-hover:text-primary"
                      }`}
                    >
                      {plan.icon}
                    </span>
                    <span className="text-secondary font-bold text-xl">{plan.price}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#181112]">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  <ul className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    {plan.benefits.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                  {/* ANPMP ID removed from the plan card; membership verification will be handled separately if needed */}
                </label>
              ))}
            </div>
            <div className="flex justify-end px-4 mt-8">
              <button
                type="button"
                onClick={() => regType && setStep(2)}
                disabled={!regType}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-white font-bold hover:bg-red-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Continue
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </section>
        )}

        {/* Step 2: Information entry */}
        {step === 2 && (
          <div className="space-y-8">
            {/* Account (email + password) - all types */}
            <section className="bg-white rounded-xl p-6 shadow-sm mx-4 border border-gray-100">
              <h2 className="text-charcoal text-[22px] font-bold leading-tight pb-6">
                Account (for signup)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <input
                    className={`rounded-lg border bg-white px-3 py-2 focus:ring-primary focus:border-primary ${
                      password.length > 0 && !isPasswordValid
                        ? "border-red-400"
                        : "border-gray-300"
                    }`}
                    placeholder="•••••••••"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={password.length > 0 && !isPasswordValid}
                  />
                  <ul className="text-xs text-gray-500 space-y-1 list-none p-0 m-0">
                    {[
                      { ok: passwordOkLength, text: "Longer than 8 characters" },
                      { ok: passwordOkLower, text: "One lowercase letter" },
                      { ok: passwordOkUpper, text: "One uppercase letter" },
                      { ok: passwordOkDigit, text: "One number" },
                      { ok: passwordOkSpecial, text: "One special character" },
                    ].map(({ ok, text }) => (
                      <li key={text} className="flex items-center gap-2">
                        <span
                          className={`material-symbols-outlined text-[16px] ${
                            ok ? "text-green-600" : "text-gray-300"
                          }`}
                        >
                          {ok ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

        {/* Member-like: Personal details */}
                {(regType === "member" || regType === "non-member") && (
              <>
                <section className="bg-white rounded-xl p-6 shadow-sm mx-4 border border-gray-100">
                  <h2 className="text-[#181112] text-[22px] font-bold leading-tight pb-6">
                    Personal Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {regType === "member" && (
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Title (optional)</label>
                        <input
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                          placeholder="e.g. Dr, Prof"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          autoComplete="honorific-prefix"
                        />
                        <p className="text-xs text-gray-500">Honorific or title (optional). Shown on your member profile.</p>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                        placeholder={regType === "member" ? "John Doe" : "Dr. John Doe"}
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Phone Number</label>
                      <input
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                        placeholder="+234 000 000 0000"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Tell us about yourself</label>
                      <textarea
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                        placeholder="Briefly describe your medical background and interests..."
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </div>
                    {regType === "member" && (
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                            type="checkbox"
                            checked={hasSpouse}
                            onChange={(e) => setHasSpouse(e.target.checked)}
                          />
                          <span className="text-sm font-medium text-gray-700">Do you have a spouse attending?</span>
                        </label>
                      </div>
                    )}
                  </div>
                </section>

                {/* Spouse details - only for members who have spouse */}
                {regType === "member" && hasSpouse && (
                  <section className="bg-white rounded-xl p-6 shadow-sm mx-4 border border-gray-100">
                    <h2 className="text-[#181112] text-[22px] font-bold leading-tight pb-6">
                      Spouse Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Spouse Name</label>
                        <input
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                          placeholder="Full Name"
                          type="text"
                          value={spouseName}
                          onChange={(e) => setSpouseName(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Spouse Email</label>
                        <input
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                          placeholder="email@example.com"
                          type="email"
                          value={spouseEmail}
                          onChange={(e) => setSpouseEmail(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Spouse Phone</label>
                        <input
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                          placeholder="+234..."
                          type="tel"
                          value={spousePhone}
                          onChange={(e) => setSpousePhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </section>
                )}

                {regType === "member" && (
                  <section className="bg-white rounded-xl p-6 shadow-sm mx-4 border border-gray-100">
                    <h2 className="text-[#181112] text-[22px] font-bold leading-tight pb-6">
                      Professional Information
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Organization</label>
                        <input
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                          placeholder="Hospital or organization name"
                          type="text"
                          value={hospitalOrg}
                          onChange={(e) => setHospitalOrg(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Specialty</label>
                        <select
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                          value={primarySpecialty}
                          onChange={(e) => setPrimarySpecialty(e.target.value)}
                          required
                        >
                          <option value="">Select...</option>
                          <option value="general">General Practice</option>
                          <option value="pediatrics">Pediatrics</option>
                          <option value="surgery">Surgery</option>
                          <option value="traditional">Traditional Medicine</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Organization address (required)</label>
                        <textarea
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 min-h-[88px] focus:ring-primary focus:border-primary"
                          placeholder="Street address and location of your organization"
                          value={organizationAddress}
                          onChange={(e) => setOrganizationAddress(e.target.value)}
                          required
                          maxLength={2000}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Zone (required)</label>
                        <input
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                          placeholder="Your ANPMP zone or chapter"
                          type="text"
                          value={zone}
                          onChange={(e) => setZone(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">ANPMP Membership ID</label>
                        <input
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                          placeholder="ID-123456"
                          type="text"
                          value={anpmpId}
                          onChange={(e) => setAnpmpId(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">Your ANPMP membership ID (e.g., ID-123456)</p>
                      </div>
                    </div>
                  </section>
                )}
                {regType === "non-member" && (
                  <section className="bg-white rounded-xl p-6 shadow-sm mx-4 border border-gray-100">
                    <h2 className="text-[#181112] text-[22px] font-bold leading-tight pb-6">
                      Professional Information
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Are you in the medical field?</label>
                        <div className="flex gap-6 mt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              className="text-primary focus:ring-primary"
                              name="inMedicalField"
                              type="radio"
                              checked={inMedicalField === true}
                              onChange={() => setInMedicalField(true)}
                            />
                            <span className="text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              className="text-primary focus:ring-primary"
                              name="inMedicalField"
                              type="radio"
                              checked={inMedicalField === false}
                              onChange={() => setInMedicalField(false)}
                            />
                            <span className="text-gray-700">No</span>
                          </label>
                        </div>
                      </div>
                      {inMedicalField === true && (
                        <>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Primary Specialty</label>
                            <select
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                              value={primarySpecialty}
                              onChange={(e) => setPrimarySpecialty(e.target.value)}
                            >
                              <option value="">Select...</option>
                              <option value="general">General Practice</option>
                              <option value="pediatrics">Pediatrics</option>
                              <option value="surgery">Surgery</option>
                              <option value="traditional">Traditional Medicine</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Hospital/Organization Name</label>
                            <input
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                              placeholder="Lagos State Teaching Hospital"
                              type="text"
                              value={hospitalOrg}
                              onChange={(e) => setHospitalOrg(e.target.value)}
                            />
                          </div>
                        </>
                      )}
                      {inMedicalField === false && (
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-gray-700">What do you do?</label>
                          <input
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                            placeholder="e.g. Healthcare Administrator, Medical Equipment Sales, Student..."
                            type="text"
                            value={occupation}
                            onChange={(e) => setOccupation(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* Company profile */}
            {regType === "company" && (
              <>
                <section className="bg-white rounded-xl p-6 shadow-sm mx-4 border border-gray-100">
                  <h2 className="text-[#181112] text-[22px] font-bold leading-tight pb-6">
                    Company Profile
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Company/Organization Name</label>
                      <input
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                        placeholder="MediCorp Solutions"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Tagline (Optional)</label>
                      <input
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                        placeholder="Leading the way in patient diagnostics..."
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Company description (required)</label>
                      <textarea
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 min-h-[100px] focus:ring-primary focus:border-primary"
                        placeholder="Briefly describe your organization, products, or services for the conference directory."
                        value={companyDescription}
                        onChange={(e) => setCompanyDescription(e.target.value)}
                        required
                        maxLength={2000}
                      />
                      <p className="text-xs text-gray-500">Shown on your public profile. Required for registration.</p>
                    </div>
                    {/* Exhibitor booths are selected after signup (no boothId submitted on create). */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Website</label>
                      <input
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                        placeholder="www.example.com"
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Contact Email</label>
                      <input
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                        placeholder="contact@company.com"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Primary Contact Name</label>
                      <input
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                        placeholder="Full Name"
                        type="text"
                        value={primaryContactName}
                        onChange={(e) => setPrimaryContactName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Primary Contact Phone</label>
                      <input
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:ring-primary focus:border-primary"
                        placeholder="+234..."
                        type="tel"
                        value={primaryContactPhone}
                        onChange={(e) => setPrimaryContactPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </section>
              </>
            )}

            <div className="flex items-center justify-between px-4 pb-8">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-lg border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  const passwordError = getRegistrationPasswordError(password);
                  if (passwordError) {
                    alert(passwordError);
                    return;
                  }
                  if (
                    regType === "company" &&
                    !companyDescription.trim()
                  ) {
                    alert("Please enter a company description before continuing.");
                    return;
                  }
                  if (regType === "member") {
                    if (!email.trim()) {
                      alert("Please enter your email address.");
                      return;
                    }
                    if (!fullName.trim()) {
                      alert("Please enter your full name.");
                      return;
                    }
                    if (!phone.trim()) {
                      alert("Please enter your phone number.");
                      return;
                    }
                    if (!hospitalOrg.trim()) {
                      alert("Please enter your organization.");
                      return;
                    }
                    if (!primarySpecialty.trim()) {
                      alert("Please select your specialty.");
                      return;
                    }
                    if (!organizationAddress.trim()) {
                      alert("Please enter your organization address.");
                      return;
                    }
                    if (!zone.trim()) {
                      alert("Please enter your zone.");
                      return;
                    }
                  }
                  setStep(3);
                }}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-white font-bold hover:bg-red-700 shadow-lg transition-all"
              >
                Continue to Review
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Save */}
        {step === 3 && (
          <section className="mx-4 mb-10">
            <h2 className="text-[#181112] text-[22px] font-bold leading-tight pb-6">
              Review & Save
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Summary - left */}
              <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Registration Type</p>
                <p className="text-lg font-bold text-[#181112] capitalize">{regType?.replace("-", " ")}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Account</p>
                <p className="text-[#181112]">{email || "—"}</p>
              </div>
              {(regType === "member" || regType === "non-member") && (
                <>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Personal Details</p>
                    {regType === "member" && title.trim() ? (
                      <p className="text-sm text-gray-600">Title: {title.trim()}</p>
                    ) : null}
                    <p className="text-[#181112]">{fullName || "—"}</p>
                    <p className="text-sm text-gray-600">{phone || "—"}</p>
                  </div>
                  {regType === "member" && hasSpouse && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Spouse</p>
                      <p className="text-[#181112]">{spouseName || "—"}</p>
                      <p className="text-sm text-gray-600">{spouseEmail || "—"}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Professional</p>
                    {regType === "member" ? (
                      <>
                        <p className="text-sm text-gray-600">{hospitalOrg || "—"}</p>
                        <p className="text-[#181112]">{primarySpecialty || "—"}</p>
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                          {organizationAddress.trim() || "—"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Zone: {zone.trim() || "—"}</p>
                      </>
                    ) : inMedicalField === true ? (
                      <>
                        <p className="text-[#181112]">{primarySpecialty || "—"}</p>
                        <p className="text-sm text-gray-600">{hospitalOrg || "—"}</p>
                      </>
                    ) : inMedicalField === false ? (
                      <p className="text-[#181112]">{occupation || "—"}</p>
                    ) : (
                      <p className="text-[#181112]">—</p>
                    )}
                  </div>
                </>
              )}
              {regType === "company" && (
                <>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Company</p>
                    <p className="text-lg font-bold text-[#181112]">{companyName || "—"}</p>
                    {tagline && <p className="text-sm text-gray-600">{tagline}</p>}
                    {companyDescription.trim() ? (
                      <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{companyDescription.trim()}</p>
                    ) : (
                      <p className="text-sm text-red-600 mt-2">Description is required.</p>
                    )}
                    <p className="text-sm text-gray-600 mt-2">{contactEmail || "—"}</p>
                    <p className="text-sm text-gray-600">{website || "—"}</p>
                    <p className="text-xs text-gray-500 mt-2">Booth and sponsorship plans are managed after signup.</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Primary Contact</p>
                    <p className="text-[#181112]">{primaryContactName || "—"}</p>
                    <p className="text-sm text-gray-600">{primaryContactPhone || "—"}</p>
                  </div>
                </>
              )}
              </div>

              {/* Profile picture upload - right */}
              <div className="lg:col-span-1">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
                    const max = regType === "company" ? 2 : 1;
                    setProfilePictures((prev) => [...prev, ...files].slice(0, max));
                  }}
                  className={`relative flex flex-col items-center justify-center min-h-[320px] w-full rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
                    isDragging ? "border-primary bg-primary/10" : "border-gray-300 bg-gray-50 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple={regType === "company"}
                    className="sr-only"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      const max = regType === "company" ? 2 : 1;
                      setProfilePictures((prev) => [...prev, ...files].slice(0, max));
                    }}
                  />
                  {profilePictures.length > 0 ? (
                    <div className="flex flex-wrap gap-2 p-4 justify-center">
                      {profilePictures.map((file, i) => (
                        <div key={i} className="relative group">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={
                              regType === "company"
                                ? i === 0
                                  ? "Logo"
                                  : "Header"
                                : "Avatar"
                            }
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setProfilePictures((p) => p.filter((_, idx) => idx !== i));
                            }}
                            className="absolute -top-1 -right-1 size-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove"
                          >
                            ×
                          </button>
                          {regType === "company" && (
                            <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-0.5 text-center rounded-b-lg">
                              {i === 0 ? "Logo" : "Header"}
                            </span>
                          )}
                        </div>
                      ))}
                      {regType === "company" && profilePictures.length < 2 && (
                        <div className="flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-primary/50 hover:text-primary">
                          <span className="material-symbols-outlined text-2xl">add</span>
                          <span className="text-xs">Add</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-5xl text-gray-400 mb-3">add_photo_alternate</span>
                      <p className="text-sm font-medium text-gray-600">
                        {regType === "company"
                          ? "Logo & header image"
                          : "Profile picture"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {regType === "company"
                          ? "Upload logo + header (2 images)"
                          : "Click or drag to upload"}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">JPG, PNG</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            {submitError && (
              <div className="mx-4 mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {submitError}
              </div>
            )}
            <div className="flex items-center justify-between px-4 pt-8 pb-20">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-lg border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-white font-bold hover:bg-red-700 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save Registration"}
                <span className="material-symbols-outlined">{isSubmitting ? "hourglass_empty" : "check"}</span>
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
