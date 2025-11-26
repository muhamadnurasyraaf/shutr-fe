"use client"
import { useState } from "react"
import { Check, User, Briefcase, CreditCard, Edit2 } from "lucide-react"
import { Header } from "@/app/components/Header"
interface ProfilePageProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    displayName?: string | null;
    phoneNumber?: string | null;
    creatorInfo?:string|null;
  }
}

export default function PhotographerProfile({user }: ProfilePageProps) {
  const [isOnboarding, setIsOnboarding] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("profileCompleted") !== "true"
    }
    return true
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [toast, setToast] = useState({ show: false, message: "" })

  const [completedSections, setCompletedSections] = useState(() => {
    if (typeof window !== "undefined" && localStorage.getItem("profileCompleted") === "true") {
      return {
        personal: true,
        professional: true,
        banking: true,
      }
    }
    return {
      personal: false,
      professional: false,
      banking: false,
    }
  })

  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user.name,
    displayName: user.displayName,
    email: user.email,
    phone: user.phoneNumber,
  })

  // Professional Information State
  const [professionalInfo, setProfessionalInfo] = useState({
    photographyType: "Sports",
    location: "Kuala Lumpur",
  })

  // Banking Information State
  const [bankingInfo, setBankingInfo] = useState({
    bankName: "Maybank",
    accountNumber: "1234567890",
    accountHolder: "John Doe",
  })

  const showToast = (message: string) => {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: "" }), 3000)
  }

  const handlePersonalChange = (field: string, value: string) => {
    const updated = { ...personalInfo, [field]: value }
    setPersonalInfo(updated)
    console.log("Personal Information Updated:", updated)
  }

  const handleProfessionalChange = (field: string, value: string) => {
    const updated = { ...professionalInfo, [field]: value }
    setProfessionalInfo(updated)
    console.log("Professional Information Updated:", updated)
  }

  const handleBankingChange = (field: string, value: string) => {
    const updated = { ...bankingInfo, [field]: value }
    setBankingInfo(updated)
    console.log("Banking Information Updated:", updated)
  }

  const handleNext = () => {
    if (currentStep === 0) {
      setCompletedSections((prev) => ({ ...prev, personal: true }))
      showToast("Personal section completed!")
    } else if (currentStep === 1) {
      setCompletedSections((prev) => ({ ...prev, professional: true }))
      showToast("Professional section completed!")
    }
    setCurrentStep((prev) => Math.min(prev + 1, 2))
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleCompleteProfile = () => {
    setCompletedSections({ personal: true, professional: true, banking: true })
    console.log("=== PROFILE COMPLETED ===")
    console.log("Personal Information:", personalInfo)
    console.log("Professional Information:", professionalInfo)
    console.log("Banking Information:", bankingInfo)

    localStorage.setItem("profileCompleted", "true")
    setIsOnboarding(false)
    showToast("Profile completed successfully!")
  }

  const handleSaveChanges = () => {
    console.log("=== PROFILE UPDATED ===")
    console.log("Personal Information:", personalInfo)
    console.log("Professional Information:", professionalInfo)
    console.log("Banking Information:", bankingInfo)
    showToast("Changes saved successfully!")
  }

  const handleJumpToSection = (index: number) => {
    if (!isOnboarding) {
      setCurrentStep(index)
    }
  }

  const progressPercentage = (Object.values(completedSections).filter(Boolean).length / 3) * 100

  const isStepValid = () => {
    if (currentStep === 0) {
      return (
        personalInfo.fullName &&
        personalInfo.displayName &&
        personalInfo.email &&
        personalInfo.phone
      )
    } else if (currentStep === 1) {
      return professionalInfo.photographyType && professionalInfo.location
    } else if (currentStep === 2) {
      return bankingInfo.bankName && bankingInfo.accountNumber && bankingInfo.accountHolder
    }
    return false
  }

  return (
    <>
      {/* Header at the very top */}
      <Header variant="solid" textVariant="dark"/>
      
      <div className="min-h-screen bg-slate-100">
        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed top-20 right-4 z-50 bg-cyan-400 text-black px-6 py-3 rounded-lg shadow-lg animate-slide-in">
            {toast.message}
          </div>
        )}

        {/* Main Content - Landscape layout with sidebar and content side by side */}
        <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
          <div className="flex gap-8 items-start">
            {/* Left Sidebar - Vertical Step Navigation */}
            <div className="w-64 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Profile Sections</h3>

              <div className="space-y-4">
                {["Personal", "Professional", "Banking"].map((step, index) => (
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
                        completedSections[index === 0 ? "personal" : index === 1 ? "professional" : "banking"]
                          ? "bg-green-500 text-white"
                          : index === currentStep
                            ? "bg-cyan-400 text-black"
                            : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {completedSections[index === 0 ? "personal" : index === 1 ? "professional" : "banking"] ? (
                        <Check className="w-5 h-5" />
                      ) : index === 0 ? (
                        <User className="w-5 h-5" />
                      ) : index === 1 ? (
                        <Briefcase className="w-5 h-5" />
                      ) : (
                        <CreditCard className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-left">
                      <div
                        className={`text-sm font-semibold ${index === currentStep ? "text-cyan-600" : "text-gray-700"}`}
                      >
                        {step}
                      </div>
                      <div className="text-xs text-gray-500">
                        {index === 0 ? "Basic info" : index === 1 ? "Your expertise" : "Payment setup"}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Progress Section */}
              {isOnboarding && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Overall Progress</span>
                    <span className="text-xs font-bold text-cyan-600">{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-6">
                {isOnboarding ? (
                  currentStep === 2 && (
                    <button
                      onClick={handleCompleteProfile}
                      disabled={!isStepValid()}
                      className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors
                        ${
                          isStepValid()
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      Complete Profile
                    </button>
                  )
                ) : (
                  <button
                    onClick={handleSaveChanges}
                    className="w-full bg-cyan-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-cyan-500 transition-colors"
                  >
                    Save Changes
                  </button>
                )}
              </div>
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
                          <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
                          <p className="text-sm text-gray-500">Tell us about yourself</p>
                        </div>
                      </div>
                      {!isOnboarding && <Edit2 className="w-5 h-5 text-gray-400" />}
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={personalInfo.fullName || ""}
                            onChange={(e) => handlePersonalChange("fullName", e.target.value)}
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
                            value={personalInfo.displayName || ""}
                            onChange={(e) => handlePersonalChange("displayName", e.target.value)}
                            placeholder="How others will see you"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={personalInfo.phone || ""}
                            onChange={(e) => handlePersonalChange("phone", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={personalInfo.email || ""}
                            onChange={(e) => handlePersonalChange("email", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {isOnboarding && (
                        <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
                          <button
                            onClick={handleNext}
                            disabled={!isStepValid()}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors
                              ${
                                isStepValid()
                                  ? "bg-cyan-400 text-black hover:bg-cyan-500"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                          >
                            Continue
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
                          <h2 className="text-lg font-semibold text-gray-800">Professional Information</h2>
                          <p className="text-sm text-gray-500">Share your expertise</p>
                        </div>
                      </div>
                      {!isOnboarding && <Edit2 className="w-5 h-5 text-gray-400" />}
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Photography Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            value={professionalInfo.photographyType}
                            onChange={(e) => handleProfessionalChange("photographyType", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          >
                            <option value="">Select your specialty</option>
                            <option value="Sports">Sports</option>
                            <option value="Events">Events</option>
                            <option value="Wedding">Wedding</option>
                            <option value="Portrait">Portrait</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City / Location <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={professionalInfo.location}
                            onChange={(e) => handleProfessionalChange("location", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {isOnboarding && (
                        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
                          <button
                            onClick={handlePrevious}
                            className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                          >
                            Previous
                          </button>
                          <button
                            onClick={handleNext}
                            disabled={!isStepValid()}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors
                              ${
                                isStepValid()
                                  ? "bg-cyan-400 text-black hover:bg-cyan-500"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                          >
                            Continue
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
                          <h2 className="text-lg font-semibold text-gray-800">Banking Information</h2>
                          <p className="text-sm text-gray-500">Secure payment details</p>
                        </div>
                      </div>
                      {!isOnboarding && <Edit2 className="w-5 h-5 text-gray-400" />}
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bank Name <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            value={bankingInfo.bankName}
                            onChange={(e) => handleBankingChange("bankName", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          >
                            <option value="">Select your bank</option>
                            <option value="Maybank">Maybank</option>
                            <option value="CIMB">CIMB Bank</option>
                            <option value="Public Bank">Public Bank</option>
                            <option value="RHB">RHB Bank</option>
                            <option value="Hong Leong">Hong Leong Bank</option>
                            <option value="AmBank">AmBank</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {`Account Holder's Name`} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={bankingInfo.accountHolder}
                            onChange={(e) => handleBankingChange("accountHolder", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Account Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={bankingInfo.accountNumber}
                            onChange={(e) => handleBankingChange("accountNumber", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {isOnboarding && (
                        <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
                          <button
                            onClick={handlePrevious}
                            className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                          >
                            Previous
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
  )
}