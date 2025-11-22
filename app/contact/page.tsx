"use client"

import { useState } from "react"
import { Header } from "../components/Header"
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: "general",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    console.log("Form submitted:", formData)
    setSubmitted(true)
    
    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        inquiryType: "general",
      })
    }, 3000)
  }

  const isValid = formData.name && formData.email && formData.subject && formData.message

  return (
    <>
      <Header variant="solid" textVariant="dark" />
      
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
              <p className="text-lg md:text-xl text-cyan-100 max-w-2xl mx-auto">
                Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="max-w-7xl mx-auto px-4 -mt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
              <p className="text-sm text-gray-600">support@shutr.com</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
              <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Visit Us</h3>
              <p className="text-sm text-gray-600">San Francisco, CA</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Work Hours</h3>
              <p className="text-sm text-gray-600">Mon - Fri: 9AM - 6PM</p>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
              <p className="text-gray-600 mb-6">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>

              {submitted ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600">We'll get back to you as soon as possible.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inquiry Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => handleChange("inquiryType", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="photographer">Photographer Support</option>
                      <option value="customer">Customer Support</option>
                      <option value="technical">Technical Issue</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="john@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      placeholder="How can we help you?"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Tell us more about your inquiry..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!isValid}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                      isValid 
                        ? "bg-cyan-400 text-black hover:bg-cyan-500" 
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </div>
              )}
            </div>

            {/* FAQ & Additional Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">How do I find my photos?</h3>
                    <p className="text-sm text-gray-600">
                      Use our search feature by entering the event name or photographer profile. You can also browse recent events on the homepage.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">How long are photos available?</h3>
                    <p className="text-sm text-gray-600">
                      Photos remain available on our platform for at least 90 days after the event. Download your favorites to keep them forever!
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Can I become a photographer on Shutr?</h3>
                    <p className="text-sm text-gray-600">
                      Yes! Click "Join as Creator" to set up your photographer profile and start uploading event photos.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                    <p className="text-sm text-gray-600">
                      We accept all major credit cards, PayPal, and other secure payment methods for purchasing photos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg shadow-sm p-8 text-white">
                <h2 className="text-2xl font-bold mb-3">Need Immediate Help?</h2>
                <p className="mb-6 text-cyan-100">
                  Check out our Help Center for instant answers to common questions.
                </p>
                <button className="bg-white text-cyan-600 px-6 py-3 rounded-lg font-semibold hover:bg-cyan-50 transition-colors">
                  Visit Help Center
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Connect With Us</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Follow us on social media for updates, tips, and featured photographers.
                </p>
                <div className="flex gap-3">
                  <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Facebook
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Instagram
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Twitter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}