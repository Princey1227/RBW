"use client";

import React, { useState, useEffect } from "react";
import { User, Check, Save, MapPin } from "lucide-react";
import { useTheme } from "../../theme-provider";
import axios from "axios";

interface CustomerInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  birthday?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
}

export default function ProfileSettingsPage() {
  const { theme } = useTheme();

  const [customer, setCustomer] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "male",
    birthday: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    zip: "",
    country: "India",
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state from localStorage on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shopifyCustomer");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const fName = parsed.firstName || parsed.first_name || "";
          const lName = parsed.lastName || parsed.last_name || "";
          const defaultAddr = parsed.defaultAddress || parsed.default_address || {};
          setCustomer({
            firstName: fName === "KwikPass" ? "" : fName,
            lastName: lName === "Member" ? "" : lName,
            email: parsed.email || "",
            phone: parsed.phone || "",
            gender: parsed.gender || "male",
            birthday: parsed.birthday || "",
            address1: parsed.address1 || defaultAddr.address1 || "",
            address2: parsed.address2 || defaultAddr.address2 || "",
            city: parsed.city || defaultAddr.city || "",
            province: parsed.province || defaultAddr.province || "",
            zip: parsed.zip || defaultAddr.zip || "",
            country: parsed.country || defaultAddr.country || "India",
          });
        } catch (e) {
          console.error("Failed to parse customer details:", e);
        }
      }
    }
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const currentData = typeof window !== "undefined" ? localStorage.getItem("shopifyCustomer") : null;
      const existing = currentData ? JSON.parse(currentData) : {};
      const customerId = existing.id || "";

      const res = await axios.post("/api/shopify/customer/update", {
        id: customerId,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        address1: customer.address1,
        address2: customer.address2,
        city: customer.city,
        province: customer.province,
        zip: customer.zip,
        country: customer.country,
      });

      if (res.data?.success && res.data.customer) {
        const merged = {
          ...existing,
          ...res.data.customer,
        };
        localStorage.setItem("shopifyCustomer", JSON.stringify(merged));
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("customer-update"));
        setIsSaved(true);
      } else {
        alert(res.data?.error || "Failed to update profile.");
      }
    } catch (err: any) {
      console.error("Profile save error:", err);
      const errMsg = err.response?.data?.error || err.message || "Failed to update profile.";
      alert(`Error updating profile: ${errMsg}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const isLight = theme === "light";

  const inputClass = `w-full px-0 py-2.5 text-xs font-semibold bg-transparent border-b focus:outline-none rounded-none transition-colors duration-300 ${
    isLight 
      ? "border-neutral-300 text-black focus:border-[#C9A063] placeholder:text-neutral-500" 
      : "border-neutral-700 text-white focus:border-[#C9A063] placeholder:text-neutral-500"
  }`;

  const labelClass = `block text-xs font-bold mb-1.5 ${
    isLight ? "text-neutral-700" : "text-neutral-400"
  }`;
  const selectOptionClass = isLight ? "bg-white text-black font-semibold" : "bg-neutral-950 text-white font-semibold";

  return (
    <div className={`space-y-8 font-sans antialiased select-none transition-colors duration-300 ${
      isLight ? "bg-white text-black" : "bg-black text-white"
    }`}>
      
      {/* Title Header */}
      <div className={`border-b pb-4 ${isLight ? "border-neutral-200" : "border-neutral-800"}`}>
        <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-wide">
          Profile Settings
        </h2>
        <p className={`text-xs font-medium mt-1 ${
          isLight ? "text-neutral-700" : "text-neutral-400"
        }`}>
          Update your personal information and default shipping address.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-8">
        
        {/* Card 1: Personal Details */}
        <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 transition-colors ${
          isLight 
            ? "bg-[#F5F5F3] border-neutral-300 text-black" 
            : "bg-neutral-900/80 border-neutral-800 text-white"
        }`}>
          <div className={`flex items-center gap-2 border-b pb-4 ${
            isLight ? "border-neutral-300" : "border-neutral-800"
          }`}>
            <User className="w-4 h-4 text-[#C9A063]" />
            <h3 className="text-xs font-bold tracking-wide">Personal Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                required
                value={customer.firstName || ""}
                onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                className={inputClass}
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                required
                value={customer.lastName || ""}
                onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                className={inputClass}
                placeholder="Enter your last name"
              />
            </div>

            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                required
                value={customer.email || ""}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                className={inputClass}
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                type="text"
                required
                value={customer.phone || ""}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className={inputClass}
                placeholder="+91 Mobile number"
              />
            </div>

            <div>
              <label className={labelClass}>Gender</label>
              <select
                value={customer.gender || "male"}
                onChange={(e) => setCustomer({ ...customer, gender: e.target.value })}
                className={inputClass}
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='${isLight ? 'black' : 'white'}' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0 center",
                }}
              >
                <option value="male" className={selectOptionClass}>Male</option>
                <option value="female" className={selectOptionClass}>Female</option>
                <option value="other" className={selectOptionClass}>Other</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                value={customer.birthday || ""}
                onChange={(e) => setCustomer({ ...customer, birthday: e.target.value })}
                className={inputClass}
                style={{ colorScheme: isLight ? "light" : "dark" }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Default Shipping Address */}
        <div className={`p-6 sm:p-8 rounded-2xl border space-y-6 transition-colors ${
          isLight 
            ? "bg-[#F5F5F3] border-neutral-300 text-black" 
            : "bg-neutral-900/80 border-neutral-800 text-white"
        }`}>
          <div className={`flex items-center gap-2 border-b pb-4 ${
            isLight ? "border-neutral-300" : "border-neutral-800"
          }`}>
            <MapPin className="w-4 h-4 text-[#C9A063]" />
            <h3 className="text-xs font-bold tracking-wide">Default Delivery Address</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className={labelClass}>Address Line 1</label>
              <input
                type="text"
                placeholder="Flat / Building / House No."
                value={customer.address1 || ""}
                onChange={(e) => setCustomer({ ...customer, address1: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Address Line 2 (Optional)</label>
              <input
                type="text"
                placeholder="Street / Area / Landmark"
                value={customer.address2 || ""}
                onChange={(e) => setCustomer({ ...customer, address2: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>City</label>
              <input
                type="text"
                placeholder="City"
                value={customer.city || ""}
                onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>State</label>
              <input
                type="text"
                placeholder="State"
                value={customer.province || ""}
                onChange={(e) => setCustomer({ ...customer, province: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Pincode</label>
              <input
                type="text"
                placeholder="6-digit Pincode"
                value={customer.zip || ""}
                onChange={(e) => setCustomer({ ...customer, zip: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Country</label>
              <input
                type="text"
                placeholder="India"
                value={customer.country || "India"}
                onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-8 py-3.5 font-bold tracking-wide text-xs transition-all rounded-xl flex items-center justify-center gap-2 cursor-pointer border-0 shadow-md ${
              isLight ? "bg-black text-white hover:bg-neutral-800" : "bg-white text-black hover:bg-neutral-200"
            }`}
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border border-t-transparent border-current animate-spin" />
            ) : isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Profile Saved
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Profile
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
