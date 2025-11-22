"use client"

import { useState } from "react"
import { Header } from "../components/Header"
import { Search, ChevronDown, ChevronUp, HelpCircle, Book, CreditCard, Camera, Users, Shield, Mail } from "lucide-react"

export default function HelpFAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All")

  const categories = [
    { name: "All", icon: Book },
    { name: "Getting Started", icon: HelpCircle },
    { name: "For Users", icon: Users },
    { name: "For Photographers", icon: Camera },
    { name: "Payments", icon: CreditCard },
    { name: "Privacy & Security", icon: Shield },
  ]

  const faqs = [
    {
      category: "Getting Started",
      question: "How do I create an account?",
      answer: "Click the 'Sign Up' button in the top right corner. You can sign up using your Google account or create an account with your email address. Fill in your details and you're ready to start finding your photos!"
    },
    {
      category: "Getting Started",
      question: "How do I search for my event photos?",
      answer: "Use the search bar on the homepage to enter your event name or browse through our 'Recent Events' section. You can also filter by date, location, or photographer to narrow down your search."
    },
    {
      category: "For Users",
      question: "How do I find photos of myself at an event?",
      answer: "Navigate to the event page and use the search filters. You can upload a reference photo of yourself, search by bib number (for races), or browse through all photos from your event. Our facial recognition can help identify photos you appear in."
    },
    {
      category: "For Users",
      question: "Can I download photos for free?",
      answer: "You can preview all photos for free in low resolution. To download high-resolution photos, you'll need to purchase them. Prices are set by individual photographers and vary by event."
    },
    {
      category: "For Users",
      question: "How long are photos available after an event?",
      answer: "Photos remain available on our platform for at least 90 days after the event date. We recommend downloading your favorites as soon as possible. Some photographers may keep photos available longer."
    },
    {
      category: "For Users",
      question: "Can I share photos on social media?",
      answer: "Yes! You can share watermarked preview versions directly to social media. If you purchase a photo, you'll receive a high-resolution version without watermarks that you can share freely."
    },
    {
      category: "For Photographers",
      question: "How do I become a photographer on Shutr?",
      answer: "Click 'Join as Creator' in the header and complete your photographer profile. You'll need to provide your personal information, professional details, and banking information for payments. Once verified, you can start uploading event photos."
    },
    {
      category: "For Photographers",
      question: "How do I upload event photos?",
      answer: "After logging in to your photographer account, go to 'My Events' and create a new event. You can then bulk upload photos using our uploader tool. We support JPG and RAW formats up to 50MB per photo."
    },
    {
      category: "For Photographers",
      question: "How much can I earn from my photos?",
      answer: "You set your own prices! Shutr takes a 20% commission on all sales. Most photographers price individual photos between $5-$25, with package deals for multiple photos. You'll receive payouts monthly via bank transfer."
    },
    {
      category: "For Photographers",
      question: "Can I remove my photos from an event?",
      answer: "Yes, you have full control over your uploaded photos. You can remove individual photos or entire events from your photographer dashboard at any time."
    },
    {
      category: "Payments",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, PayPal, and Apple Pay. All payments are processed securely through our payment partner."
    },
    {
      category: "Payments",
      question: "Is my payment information secure?",
      answer: "Absolutely! We use industry-standard encryption and never store your full credit card details. All payments are processed through PCI-DSS compliant payment processors."
    },
    {
      category: "Payments",
      question: "Can I get a refund?",
      answer: "Due to the digital nature of photos, we generally don't offer refunds once a download is completed. However, if there's a technical issue with your download or the wrong photo was delivered, contact our support team within 48 hours."
    },
    {
      category: "Payments",
      question: "Do you offer bulk discounts?",
      answer: "Many photographers offer package deals for multiple photos from the same event. Check the event page for available packages. Some photographers also offer subscription plans for regular clients."
    },
    {
      category: "Privacy & Security",
      question: "How is my personal information protected?",
      answer: "We take privacy seriously. Your personal information is encrypted and stored securely. We never share your data with third parties without your consent. Read our Privacy Policy for complete details."
    },
    {
      category: "Privacy & Security",
      question: "Can I request to have my photos removed?",
      answer: "If you appear in a photo and want it removed, contact our support team with details about the event and photo. We'll work with the photographer to address your request in accordance with applicable privacy laws."
    },
    {
      category: "Privacy & Security",
      question: "How do I delete my account?",
      answer: "Go to Settings > Account Settings > Delete Account. This will permanently remove your profile and purchase history. Note that photos you've already purchased will no longer be accessible after deletion."
    },
    {
      category: "Privacy & Security",
      question: "Do you use facial recognition?",
      answer: "We offer optional facial recognition to help you find photos of yourself more easily. This feature is opt-in and you can disable it anytime in your privacy settings. Facial data is encrypted and never shared."
    },
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <>
      <Header variant="solid" textVariant="dark" />
      
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
              <p className="text-lg md:text-xl text-cyan-100 max-w-2xl mx-auto">
                Find answers to common questions and get the help you need
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:ring-2 focus:ring-cyan-300 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="max-w-7xl mx-auto px-4 -mt-8 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition-all ${
                    selectedCategory === category.name
                      ? "border-cyan-400 ring-2 ring-cyan-100"
                      : "border-gray-200"
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-3 ${
                    selectedCategory === category.name ? "text-cyan-600" : "text-gray-400"
                  }`} />
                  <h3 className="text-sm font-semibold text-gray-900">{category.name}</h3>
                </button>
              )
            })}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedCategory === "All" ? "Frequently Asked Questions" : selectedCategory}
            </h2>
            <p className="text-gray-600">
              {filteredFAQs.length} {filteredFAQs.length === 1 ? "question" : "questions"} found
            </p>
          </div>

          {filteredFAQs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or browse different categories
              </p>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("All")
                }}
                className="px-6 py-2 bg-cyan-400 text-black rounded-lg font-semibold hover:bg-cyan-500 transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3 text-left flex-1">
                      <HelpCircle className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                        {selectedCategory === "All" && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-50 text-cyan-700 text-xs rounded-full">
                            {faq.category}
                          </span>
                        )}
                      </div>
                    </div>
                    {openFAQ === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openFAQ === index && (
                    <div className="px-6 pb-4 pt-2 border-t border-gray-100">
                      <p className="text-gray-600 leading-relaxed ml-8">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Still Need Help Section */}
        <section className="bg-white border-t border-gray-200 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Still need help?</h2>
              <p className="text-gray-600">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-sm p-8 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Contact Support</h3>
                <p className="text-cyan-100 mb-6">
                  Send us a message and we'll respond within 24 hours.
                </p>
                <button className="bg-white text-cyan-600 px-6 py-3 rounded-lg font-semibold hover:bg-cyan-50 transition-colors">
                  Contact Us
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-8">
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
                  <Book className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">User Guides</h3>
                <p className="text-gray-600 mb-6">
                  Detailed guides and tutorials for getting the most out of Shutr.
                </p>
                <button className="bg-cyan-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-cyan-500 transition-colors">
                  View Guides
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Topics */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="#" className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-cyan-400 transition-all group">
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-cyan-600">
                Getting Started Guide
              </h3>
              <p className="text-sm text-gray-600">
                Learn the basics of using Shutr to find and download your event photos
              </p>
            </a>
            
            <a href="#" className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-cyan-400 transition-all group">
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-cyan-600">
                Photographer Setup
              </h3>
              <p className="text-sm text-gray-600">
                Complete guide to setting up your photographer profile and uploading photos
              </p>
            </a>
            
            <a href="#" className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-cyan-400 transition-all group">
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-cyan-600">
                Payment & Pricing
              </h3>
              <p className="text-sm text-gray-600">
                Information about purchasing photos, pricing, and payment methods
              </p>
            </a>
            
            <a href="#" className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-cyan-400 transition-all group">
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-cyan-600">
                Privacy & Data
              </h3>
              <p className="text-sm text-gray-600">
                Learn how we protect your data and manage your privacy settings
              </p>
            </a>
          </div>
        </section>
      </div>
    </>
  )
}