"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  User,
  Briefcase,
  CreditCard,
  Edit2,
  ScrollText,
  Loader2,
  X,
} from "lucide-react";
import { Header } from "@/app/components/Header";
import { useProfileCompletion } from "@/app/contexts/ProfileCompletionContext";

interface ProfilePageProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    displayName?: string | null;
    phoneNumber?: string | null;
    handle?: string | null;
    termsAcceptedAt?: string | null;
    commissionRate?: number | null;
    creatorInfo?: {
      photographyType?: string | null;
      location?: string | null;
    } | null;
    bankingInfo?: {
      bankName?: string | null;
      accountNumber?: string | null;
      holderName?: string | null;
    } | null;
  };
}

// Platform commission shown in the terms step. Keep in sync with the backend
// PlatformCommissionRate constant (0.05 = 5%).
const COMMISSION_PCT = 5;
const TERMS_VERSION = "2026-08-31";
const SECTION_KEYS = [
  "personal",
  "professional",
  "banking",
  "terms",
] as const;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function PhotographerProfile({ user }: ProfilePageProps) {
  const router = useRouter();
  const {
    completedSections,
    setCompletedSections,
    isProfileComplete,
    isLoading: isContextLoading,
  } = useProfileCompletion();

  // Determine onboarding state from context (API data)
  const [isOnboarding, setIsOnboarding] = useState(true);

  // Sync onboarding state with context once loaded
  useEffect(() => {
    if (!isContextLoading) {
      setIsOnboarding(!isProfileComplete);
    }
  }, [isContextLoading, isProfileComplete]);

  const [currentStep, setCurrentStep] = useState(0);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user.name || "",
    displayName: user.displayName || "",
    email: user.email || "",
    phone: user.phoneNumber || "",
    handle: user.handle || "",
  });

  // Live handle availability (checked against the backend as the user types).
  const [handleCheck, setHandleCheck] = useState<{
    status: "idle" | "checking" | "available" | "taken" | "invalid";
    reason?: string;
  }>({ status: user.handle ? "available" : "idle" });

  // Terms & commission acceptance.
  const [termsAccepted, setTermsAccepted] = useState<boolean>(
    !!user.termsAcceptedAt,
  );

  // Professional Information State
  const [professionalInfo, setProfessionalInfo] = useState({
    photographyType: user.creatorInfo?.photographyType || "",
    location: user.creatorInfo?.location || "",
  });

  // Banking Information State
  const [bankingInfo, setBankingInfo] = useState({
    bankName: user.bankingInfo?.bankName || "",
    accountNumber: user.bankingInfo?.accountNumber || "",
    accountHolder: user.bankingInfo?.holderName || "",
  });

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  const handlePersonalChange = (field: string, value: string) => {
    const updated = { ...personalInfo, [field]: value };
    setPersonalInfo(updated);
  };

  // Normalize a handle to the backend's rules: lowercase, no leading '@',
  // only [a-z0-9_].
  const normalizeHandle = (v: string) =>
    v
      .toLowerCase()
      .replace(/^@+/, "")
      .replace(/[^a-z0-9_]/g, "");

  const handleHandleChange = (value: string) => {
    const handle = normalizeHandle(value);
    setPersonalInfo((prev) => ({ ...prev, handle }));
    if (handle.length < 3) {
      setHandleCheck({
        status: handle.length === 0 ? "idle" : "invalid",
        reason: handle.length === 0 ? undefined : "At least 3 characters",
      });
    } else {
      setHandleCheck({ status: "checking" });
    }
  };

  // Debounced availability check against the backend.
  useEffect(() => {
    const handle = personalInfo.handle;
    if (handle.length < 3) return;
    // Unchanged from the saved value → it's theirs, treat as available.
    if (user.handle && handle === user.handle) {
      setHandleCheck({ status: "available" });
      return;
    }
    const t = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ handle });
        if (user.id) params.set("userId", user.id);
        const res = await fetch(
          `${API_BASE_URL}/creator/handle-available?${params.toString()}`,
        );
        const data = await res.json();
        if (data.available) {
          setHandleCheck({ status: "available" });
        } else {
          setHandleCheck({
            status: /taken/i.test(data.reason || "") ? "taken" : "invalid",
            reason: data.reason,
          });
        }
      } catch {
        setHandleCheck({ status: "idle" });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [personalInfo.handle, user.handle, user.id]);

  const handleProfessionalChange = (field: string, value: string) => {
    const updated = { ...professionalInfo, [field]: value };
    setProfessionalInfo(updated);
  };

  const handleBankingChange = (field: string, value: string) => {
    const updated = { ...bankingInfo, [field]: value };
    setBankingInfo(updated);
  };

  const savePersonalInfo = async () => {
    if (!user.id) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/creator/personal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: personalInfo.fullName,
          displayName: personalInfo.displayName,
          phoneNumber: personalInfo.phone,
          handle: personalInfo.handle,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Failed to save personal info");
      }
      return true;
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to save personal info",
        "error",
      );
      console.error("Error saving personal info:", error);
      return false;
    }
  };

  const saveTerms = async () => {
    if (!user.id) return false;
    try {
      const response = await fetch(`${API_BASE_URL}/creator/accept-terms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          version: TERMS_VERSION,
          accept: true,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Failed to accept terms");
      }
      return true;
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to accept terms",
        "error",
      );
      console.error("Error accepting terms:", error);
      return false;
    }
  };

  const saveProfessionalInfo = async () => {
    if (!user.id) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/creator/professional`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          photographyType: professionalInfo.photographyType,
          location: professionalInfo.location,
        }),
      });

      if (!response.ok) throw new Error("Failed to save professional info");
      return true;
    } catch (error) {
      console.error("Error saving professional info:", error);
      return false;
    }
  };

  const saveBankingInfo = async () => {
    if (!user.id) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/creator/banking`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          bankName: bankingInfo.bankName,
          accountNumber: bankingInfo.accountNumber,
          holderName: bankingInfo.accountHolder,
        }),
      });

      if (!response.ok) throw new Error("Failed to save banking info");
      return true;
    } catch (error) {
      console.error("Error saving banking info:", error);
      return false;
    }
  };

  const handleNext = async () => {
    setIsLoading(true);

    try {
      if (currentStep === 0) {
        const success = await savePersonalInfo();
        if (success) {
          setCompletedSections({ ...completedSections, personal: true });
          showToast("Personal section saved!");
          setCurrentStep(1);
        } else {
          showToast("Failed to save personal info", "error");
        }
      } else if (currentStep === 1) {
        const success = await saveProfessionalInfo();
        if (success) {
          setCompletedSections({ ...completedSections, professional: true });
          showToast("Professional section saved!");
          setCurrentStep(2);
        } else {
          showToast("Failed to save professional info", "error");
        }
      } else if (currentStep === 2) {
        const success = await saveBankingInfo();
        if (success) {
          setCompletedSections({ ...completedSections, banking: true });
          showToast("Banking section saved!");
          setCurrentStep(3);
        } else {
          showToast("Failed to save banking info", "error");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleCompleteProfile = async () => {
    setIsLoading(true);

    try {
      const success = await saveTerms();
      if (success) {
        setCompletedSections({
          personal: true,
          professional: true,
          banking: true,
          terms: true,
        });
        setIsOnboarding(false);
        // Store success message in sessionStorage for the contents page to display
        sessionStorage.setItem(
          "profileCompleteMessage",
          "Registration successful! Welcome to the platform.",
        );
        // Redirect creators straight to their content manager
        router.push("/creator/contents");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);

    try {
      let success = true;

      if (currentStep === 0) {
        success = await savePersonalInfo();
      } else if (currentStep === 1) {
        success = await saveProfessionalInfo();
      } else if (currentStep === 2) {
        success = await saveBankingInfo();
      }

      if (success) {
        showToast("Changes saved successfully!");
      } else {
        showToast("Failed to save changes", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJumpToSection = (index: number) => {
    if (!isOnboarding) {
      setCurrentStep(index);
    }
  };

  const progressPercentage =
    (Object.values(completedSections).filter(Boolean).length / 4) * 100;

  const isStepValid = () => {
    if (currentStep === 0) {
      return (
        personalInfo.fullName &&
        personalInfo.displayName &&
        personalInfo.phone &&
        personalInfo.handle.length >= 3 &&
        handleCheck.status === "available"
      );
    } else if (currentStep === 1) {
      return professionalInfo.photographyType && professionalInfo.location;
    } else if (currentStep === 2) {
      return (
        bankingInfo.bankName &&
        bankingInfo.accountNumber &&
        bankingInfo.accountHolder
      );
    } else if (currentStep === 3) {
      return termsAccepted;
    }
    return false;
  };

  return (
    <>
      {/* Header at the very top */}
      <Header variant="solid" textVariant="dark" />

      <div className="min-h-screen bg-slate-100">
        {/* Toast Notification */}
        {toast.show && (
          <div
            className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-slide-in ${
              toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-cyan-400 text-black"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Main Content - Landscape layout with sidebar and content side by side */}
        <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
          <div className="flex gap-8 items-start">
            {/* Left Sidebar - Vertical Step Navigation */}
            <div className="w-64 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                Profile Sections
              </h3>

              <div className="space-y-4">
                {["Personal", "Professional", "Banking", "Terms"].map((step, index) => (
                  <button
                    key={step}
                    onClick={() => handleJumpToSection(index)}
                    disabled={isOnboarding}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all
                      ${index === currentStep ? "bg-cyan-50 border-2 border-cyan-400" : "border-2 border-transparent hover:bg-gray-50"}
                      ${!isOnboarding ? "cursor-pointer" : index === currentStep ? "" : "cursor-not-allowed opacity-50"}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0
                      ${
                        completedSections[SECTION_KEYS[index]]
                          ? "bg-green-500 text-white"
                          : index === currentStep
                            ? "bg-cyan-400 text-black"
                            : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {completedSections[SECTION_KEYS[index]] ? (
                        <Check className="w-5 h-5" />
                      ) : index === 0 ? (
                        <User className="w-5 h-5" />
                      ) : index === 1 ? (
                        <Briefcase className="w-5 h-5" />
                      ) : index === 2 ? (
                        <CreditCard className="w-5 h-5" />
                      ) : (
                        <ScrollText className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-left">
                      <div
                        className={`text-sm font-semibold ${index === currentStep ? "text-cyan-600" : "text-gray-700"}`}
                      >
                        {step}
                      </div>
                      <div className="text-xs text-gray-500">
                        {index === 0
                          ? "Basic info"
                          : index === 1
                            ? "Your expertise"
                            : index === 2
                              ? "Payment setup"
                              : "Commission & terms"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Progress Section */}
              {isOnboarding && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">
                      Overall Progress
                    </span>
                    <span className="text-xs font-bold text-cyan-600">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button — during onboarding, each step's advance action
                  (Continue / Complete Profile) lives in its own form footer so it
                  stays where the eye expects it. Here we only surface "Save Changes"
                  when editing an already-complete profile. */}
              {!isOnboarding && (
                <div className="mt-6">
                  <button
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                      isLoading
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-cyan-400 text-black hover:bg-cyan-500"
                    }`}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>

            {/* Right Content Area - Form sections display here */}
            <div className="flex-1">
              <div className="space-y-6">
                {/* Personal Information Section */}
                {currentStep === 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${completedSections.personal ? "bg-green-500" : "bg-cyan-400"}`}
                        >
                          {completedSections.personal ? (
                            <Check className="w-5 h-5 text-white" />
                          ) : (
                            <User className="w-5 h-5 text-black" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800">
                            Personal Information
                          </h2>
                          <p className="text-sm text-gray-500">
                            Tell us about yourself
                          </p>
                        </div>
                      </div>
                      {!isOnboarding && (
                        <Edit2 className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={personalInfo.fullName}
                            onChange={(e) =>
                              handlePersonalChange("fullName", e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Display Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={personalInfo.displayName}
                            onChange={(e) =>
                              handlePersonalChange(
                                "displayName",
                                e.target.value,
                              )
                            }
                            placeholder="How others will see you"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Public Handle <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 select-none">
                              @
                            </span>
                            <input
                              type="text"
                              required
                              value={personalInfo.handle}
                              onChange={(e) => handleHandleChange(e.target.value)}
                              placeholder="your_handle"
                              className={`w-full pl-8 pr-10 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                                handleCheck.status === "taken" ||
                                handleCheck.status === "invalid"
                                  ? "border-red-400 focus:ring-red-300"
                                  : handleCheck.status === "available"
                                    ? "border-green-400 focus:ring-green-300"
                                    : "border-gray-300 focus:ring-cyan-400"
                              }`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2">
                              {handleCheck.status === "checking" && (
                                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                              )}
                              {handleCheck.status === "available" && (
                                <Check className="w-4 h-4 text-green-500" />
                              )}
                              {(handleCheck.status === "taken" ||
                                handleCheck.status === "invalid") && (
                                <X className="w-4 h-4 text-red-500" />
                              )}
                            </span>
                          </div>
                          <p
                            className={`text-xs mt-1 ${
                              handleCheck.status === "taken" ||
                              handleCheck.status === "invalid"
                                ? "text-red-500"
                                : handleCheck.status === "available"
                                  ? "text-green-600"
                                  : "text-gray-400"
                            }`}
                          >
                            {handleCheck.status === "available"
                              ? "Handle is available"
                              : handleCheck.status === "taken"
                                ? "Handle already taken"
                                : handleCheck.status === "invalid"
                                  ? handleCheck.reason ||
                                    "Invalid handle"
                                  : "Your unique profile URL — lowercase letters, numbers, underscores"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={personalInfo.phone}
                            onChange={(e) =>
                              handlePersonalChange("phone", e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={personalInfo.email}
                            disabled
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Email is managed by your Google account
                          </p>
                        </div>
                      </div>

                      {isOnboarding && (
                        <div className="flex justify-end pt-6 mt-8 border-t border-gray-200">
                          <button
                            onClick={handleNext}
                            disabled={!isStepValid() || isLoading}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors
                              ${
                                isStepValid() && !isLoading
                                  ? "bg-cyan-400 text-black hover:bg-cyan-500"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                          >
                            {isLoading ? "Saving..." : "Continue"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Professional Information Section */}
                {currentStep === 1 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${completedSections.professional ? "bg-green-500" : "bg-cyan-400"}`}
                        >
                          {completedSections.professional ? (
                            <Check className="w-5 h-5 text-white" />
                          ) : (
                            <Briefcase className="w-5 h-5 text-black" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800">
                            Professional Information
                          </h2>
                          <p className="text-sm text-gray-500">
                            Share your expertise
                          </p>
                        </div>
                      </div>
                      {!isOnboarding && (
                        <Edit2 className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Photography Type{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            value={professionalInfo.photographyType}
                            onChange={(e) =>
                              handleProfessionalChange(
                                "photographyType",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          >
                            <option value="">Select your specialty</option>
                            <option value="Marathon">Marathon</option>
                            <option value="Wildlife">Wildlife</option>
                            <option value="Motorsports">Motorsports</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            value={professionalInfo.location}
                            onChange={(e) =>
                              handleProfessionalChange(
                                "location",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          >
                            <option value="">Select your state</option>
                            <option value="Johor">Johor</option>
                            <option value="Kedah">Kedah</option>
                            <option value="Kelantan">Kelantan</option>
                            <option value="Melaka">Melaka</option>
                            <option value="Negeri Sembilan">
                              Negeri Sembilan
                            </option>
                            <option value="Pahang">Pahang</option>
                            <option value="Penang">Penang</option>
                            <option value="Perak">Perak</option>
                            <option value="Perlis">Perlis</option>
                            <option value="Sabah">Sabah</option>
                            <option value="Sarawak">Sarawak</option>
                            <option value="Selangor">Selangor</option>
                            <option value="Terengganu">Terengganu</option>
                            <option value="Kuala Lumpur">Kuala Lumpur</option>
                            <option value="Putrajaya">Putrajaya</option>
                            <option value="Labuan">Labuan</option>
                          </select>
                        </div>
                      </div>

                      {isOnboarding && (
                        <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-200">
                          <button
                            onClick={handlePrevious}
                            className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                          >
                            Previous
                          </button>
                          <button
                            onClick={handleNext}
                            disabled={!isStepValid() || isLoading}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors
                              ${
                                isStepValid() && !isLoading
                                  ? "bg-cyan-400 text-black hover:bg-cyan-500"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                          >
                            {isLoading ? "Saving..." : "Continue"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Banking Information Section */}
                {currentStep === 2 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${completedSections.banking ? "bg-green-500" : "bg-cyan-400"}`}
                        >
                          {completedSections.banking ? (
                            <Check className="w-5 h-5 text-white" />
                          ) : (
                            <CreditCard className="w-5 h-5 text-black" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800">
                            Banking Information
                          </h2>
                          <p className="text-sm text-gray-500">
                            Secure payment details
                          </p>
                        </div>
                      </div>
                      {!isOnboarding && (
                        <Edit2 className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bank Name <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            value={bankingInfo.bankName}
                            onChange={(e) =>
                              handleBankingChange("bankName", e.target.value)
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          >
                            <option value="">Select your bank</option>
                            <optgroup label="Major Banks">
                              <option value="Maybank">Maybank</option>
                              <option value="CIMB">CIMB Bank</option>
                              <option value="Public Bank">Public Bank</option>
                              <option value="RHB">RHB Bank</option>
                              <option value="Hong Leong">
                                Hong Leong Bank
                              </option>
                              <option value="AmBank">AmBank</option>
                              <option value="Bank Islam">Bank Islam</option>
                              <option value="Bank Rakyat">Bank Rakyat</option>
                              <option value="Affin Bank">Affin Bank</option>
                              <option value="Alliance Bank">
                                Alliance Bank
                              </option>
                              <option value="OCBC">OCBC Bank</option>
                              <option value="HSBC">HSBC Bank</option>
                              <option value="Standard Chartered">
                                Standard Chartered
                              </option>
                              <option value="UOB">UOB Bank</option>
                              <option value="Citibank">Citibank</option>
                              <option value="Bank Muamalat">
                                Bank Muamalat
                              </option>
                              <option value="BSN">
                                BSN (Bank Simpanan Nasional)
                              </option>
                              <option value="Agro Bank">Agro Bank</option>
                            </optgroup>
                            <optgroup label="Digital Banks">
                              <option value="GXBank">GXBank</option>
                              <option value="Boost Bank">Boost Bank</option>
                              <option value="AEON Bank">AEON Bank</option>
                              <option value="RYT Bank">
                                RYT Bank (YTL Digital Bank)
                              </option>
                              <option value="KAF Digital">
                                KAF Digital Bank
                              </option>
                            </optgroup>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {`Account Holder's Name`}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={bankingInfo.accountHolder}
                            onChange={(e) =>
                              handleBankingChange(
                                "accountHolder",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Number{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={bankingInfo.accountNumber}
                            onChange={(e) =>
                              handleBankingChange(
                                "accountNumber",
                                e.target.value,
                              )
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {isOnboarding && (
                        <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-200">
                          <button
                            onClick={handlePrevious}
                            className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                          >
                            Previous
                          </button>
                          <button
                            onClick={handleNext}
                            disabled={!isStepValid() || isLoading}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors
                              ${
                                isStepValid() && !isLoading
                                  ? "bg-cyan-400 text-black hover:bg-cyan-500"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                          >
                            {isLoading ? "Saving..." : "Continue"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Terms & Commission Section */}
                {currentStep === 3 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${completedSections.terms ? "bg-green-500" : "bg-cyan-400"}`}
                        >
                          {completedSections.terms ? (
                            <Check className="w-5 h-5 text-white" />
                          ) : (
                            <ScrollText className="w-5 h-5 text-black" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800">
                            Terms &amp; Commission
                          </h2>
                          <p className="text-sm text-gray-500">
                            Review the platform agreement
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-8">
                      {/* Commission highlight */}
                      <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 mb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-cyan-700">
                            {COMMISSION_PCT}%
                          </span>
                          <span className="text-sm text-cyan-800">
                            platform commission per sale
                          </span>
                        </div>
                        <p className="text-sm text-cyan-900/80 mt-1">
                          You keep {100 - COMMISSION_PCT}% of every photo you
                          sell. Shutr collects buyer payments and remits your
                          earnings to your registered bank account.
                        </p>
                      </div>

                      {/* Terms body */}
                      <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 p-4 text-sm text-gray-600 space-y-3">
                        <p>
                          <strong>1. Commission &amp; Payouts.</strong> Shutr
                          retains a {COMMISSION_PCT}% commission on each
                          completed sale. Net earnings are paid out to the
                          banking details on your profile.
                        </p>
                        <p>
                          <strong>2. Content Ownership &amp; Licence.</strong>{" "}
                          You retain copyright to your photos and grant Shutr a
                          licence to host, watermark-preview, display, and sell
                          them on the platform.
                        </p>
                        <p>
                          <strong>3. Content Standards.</strong> You will only
                          upload images you own or have the rights to sell, and
                          nothing unlawful, infringing, or inappropriate.
                        </p>
                        <p>
                          <strong>4. Subject Consent.</strong> You are
                          responsible for obtaining any consent required from
                          people appearing in your photos.
                        </p>
                        <p>
                          <strong>5. Pricing.</strong> You set your prices; Shutr
                          may apply reasonable minimum or maximum bounds.
                        </p>
                        <p>
                          <strong>6. Refunds &amp; Chargebacks.</strong> Buyer
                          refunds and chargebacks may be deducted from your
                          balance where applicable.
                        </p>
                        <p>
                          <strong>7. Account &amp; Termination.</strong> Either
                          party may terminate; Shutr may suspend accounts that
                          violate these terms.
                        </p>
                        <p>
                          <strong>8. Tax.</strong> You are responsible for taxes
                          on your earnings.
                        </p>
                      </div>

                      <label className="flex items-start gap-3 mt-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-1 w-4 h-4 accent-cyan-500"
                        />
                        <span className="text-sm text-gray-700">
                          I have read and agree to the Terms of Service and the{" "}
                          {COMMISSION_PCT}% platform commission.
                        </span>
                      </label>

                      {isOnboarding && (
                        <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-200">
                          <button
                            onClick={handlePrevious}
                            className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                          >
                            Previous
                          </button>
                          <button
                            onClick={handleCompleteProfile}
                            disabled={!isStepValid() || isLoading}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors
                              ${
                                isStepValid() && !isLoading
                                  ? "bg-green-500 text-white hover:bg-green-600"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                          >
                            {isLoading
                              ? "Submitting..."
                              : "Complete Registration"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
