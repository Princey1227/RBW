"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "../../context/ToastContext";

export default function ContactPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const event = new CustomEvent("page_view_kp", {
      detail: {
        type: "other",
        data: {
          cart_id: ""
        }
      }
    });
    console.log("Fired KwikPass page_view_kp other event (Contact):", event.detail);
    window.dispatchEvent(event);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast({
        title: "Missing Information",
        message: "Please fill in all required fields (Name, Email, and Message).",
        type: "error",
      });
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast({
        title: "Message Sent!",
        message: "Thank you for reaching out. Our team will get back to you within 24 hours.",
        type: "success",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 600);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 25 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: "easeOut" }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#1C1917] pb-24 relative overflow-x-hidden">
      {/* Hero Section */}
      <section className="pt-[120px] md:pt-[130px] pb-12 border-b border-[#E8E3DA]">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <motion.div
            initial="initial"
            animate="animate"
            variants={{
              animate: { transition: { staggerChildren: 0.15 } }
            }}
          >
            <motion.p
              variants={fadeInUp}
              className="text-[#78716C] uppercase tracking-[0.5em] text-[11px] font-bold mb-4"
            >
              ONLY DENIMS
            </motion.p>

            <motion.h1
              variants={fadeInUp}
              className="font-serif font-normal leading-none text-[#1C1917] uppercase tracking-wide select-none"
              style={{ fontSize: "min(72px, 8vw)" }}
            >
              Contact Us
            </motion.h1>

            <motion.div
              variants={fadeInUp}
              className="w-24 h-[1px] bg-[#1C1917]/20 my-8 relative"
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#B9965A]" />
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className="max-w-xl text-[#57534E] text-sm md:text-base leading-relaxed font-sans font-medium"
            >
              Whether you&apos;re a brand, retailer, or customer, we&apos;d love to connect with you.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Section */}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* Left Column: Minimalist Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 space-y-10"
            >
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1C1917]" />
                <h2 className="text-xl md:text-2xl font-serif font-bold uppercase tracking-wider text-[#1C1917]">
                  Get In Touch
                </h2>
              </div>

              <div className="space-y-8 pl-1">
                {/* Email */}
                <div>
                  <p className="text-[#78716C] uppercase tracking-[0.25em] text-[10px] font-bold mb-1.5 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#B9965A]" />
                    <span>Email</span>
                  </p>
                  <a
                    href="mailto:onlydenims26@gmail.com"
                    className="text-lg md:text-xl font-medium text-[#1C1917] hover:text-[#B9965A] transition-colors"
                  >
                    onlydenims26@gmail.com
                  </a>
                </div>

                {/* Phone */}
                <div>
                  <p className="text-[#78716C] uppercase tracking-[0.25em] text-[10px] font-bold mb-1.5 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#B9965A]" />
                    <span>Phone</span>
                  </p>
                  <a
                    href="tel:+9196963XXXXX"
                    className="text-lg md:text-xl font-medium text-[#1C1917] hover:text-[#B9965A] transition-colors"
                  >
                    +91 96963 XXXXX
                  </a>
                </div>

                {/* Office */}
                <div>
                  <p className="text-[#78716C] uppercase tracking-[0.25em] text-[10px] font-bold mb-1.5 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#B9965A]" />
                    <span>Office Location</span>
                  </p>
                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-sans mt-1">
                    <strong className="text-[#1C1917] font-bold">Only Denims Apparels Pvt. Ltd.</strong>
                    <br />
                    Bonanza Industrial Estate, Ashok Chakravarti Road,
                    <br />
                    Ashok Nagar, Kandivali East, Mumbai – 400101
                    <br />
                    Maharashtra, India
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Clean Luxury Form Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-7 rounded-[22px] bg-[#FDFBF7] border border-[#E8E3DA] p-6 sm:p-9 shadow-md hover:shadow-xl transition-all duration-300 relative"
            >
              <div className="mb-7 pb-4 border-b border-[#E8E3DA]">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1C1917] uppercase tracking-wider">
                  Send A Message
                </h3>
                <p className="text-xs text-[#78716C] mt-1 font-sans">
                  Fill out the form below and our team will get back to you shortly.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#78716C] mb-1.5">
                      Full Name <span className="text-[#B9965A]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      required
                      className="w-full bg-white border border-[#E2DDD5] rounded-xl px-3.5 py-3 text-xs sm:text-sm text-[#1C1917] placeholder-[#A8A29E] outline-none focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#78716C] mb-1.5">
                      Email Address <span className="text-[#B9965A]">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                      className="w-full bg-white border border-[#E2DDD5] rounded-xl px-3.5 py-3 text-xs sm:text-sm text-[#1C1917] placeholder-[#A8A29E] outline-none focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#78716C] mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help?"
                    className="w-full bg-white border border-[#E2DDD5] rounded-xl px-3.5 py-3 text-xs sm:text-sm text-[#1C1917] placeholder-[#A8A29E] outline-none focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#78716C] mb-1.5">
                    Your Message <span className="text-[#B9965A]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your message here..."
                    required
                    className="w-full bg-white border border-[#E2DDD5] rounded-xl px-3.5 py-3 text-xs sm:text-sm text-[#1C1917] placeholder-[#A8A29E] outline-none focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1C1917] hover:bg-black text-white py-3.5 rounded-xl text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 mt-2"
                >
                  <span>{isSubmitting ? "SENDING MESSAGE..." : "SEND MESSAGE"}</span>
                  <Send className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 text-[#B9965A]" />
                </button>
              </form>
            </motion.div>

          </div>
        </div>
      </section>
    </main>
  );
}
