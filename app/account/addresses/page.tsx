"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Plus, Check, Trash2, Edit } from "lucide-react";
import { useTheme } from "../../theme-provider";

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { theme } = useTheme();
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newZip, setNewZip] = useState("");
  const [newCountry, setNewCountry] = useState("India");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAddresses = localStorage.getItem("onlydenims_addresses");
      if (savedAddresses) {
        try {
          const parsed = JSON.parse(savedAddresses);
          if (parsed && parsed.length > 0) {
            setAddresses(parsed);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Fallback: Populate from logged-in Shopify Customer
      const shopifyCust = localStorage.getItem("shopifyCustomer");
      if (shopifyCust) {
        try {
          const cust = JSON.parse(shopifyCust);
          const list: Address[] = [];
          if (cust.defaultAddress) {
            list.push({
              id: "shopify_default",
              name: `${cust.firstName || "Customer"} (Default Shipping)`,
              street: cust.defaultAddress.address1 || cust.defaultAddress.address2 || "",
              city: cust.defaultAddress.city || "",
              state: cust.defaultAddress.province || "",
              zip: cust.defaultAddress.zip || "",
              country: cust.defaultAddress.country || "India",
              isDefault: true,
            });
          }
          if (Array.isArray(cust.addresses)) {
            cust.addresses.forEach((addr: any, idx: number) => {
              if (addr.address1 && !list.some(a => a.street === addr.address1)) {
                list.push({
                  id: `shopify_addr_${idx}`,
                  name: `${cust.firstName || "Customer"} (${addr.city || "Saved"})`,
                  street: addr.address1 || "",
                  city: addr.city || "",
                  state: addr.province || "",
                  zip: addr.zip || "",
                  country: addr.country || "India",
                  isDefault: list.length === 0,
                });
              }
            });
          }
          setAddresses(list);
        } catch (err) {
          console.error("Failed to parse Shopify addresses:", err);
        }
      }
    }
  }, []);

  const saveToLocal = (updatedList: Address[]) => {
    setAddresses(updatedList);
    if (typeof window !== "undefined") {
      localStorage.setItem("onlydenims_addresses", JSON.stringify(updatedList));
      window.dispatchEvent(new Event("storage"));
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddress: Address = {
      id: Math.random().toString(),
      name: newName,
      street: newStreet,
      city: newCity,
      state: newState,
      zip: newZip,
      country: newCountry,
      isDefault: addresses.length === 0,
    };

    const updated = [...addresses, newAddress];
    saveToLocal(updated);

    // Reset Form
    setIsAdding(false);
    setNewName("");
    setNewStreet("");
    setNewCity("");
    setNewState("");
    setNewZip("");
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    saveToLocal(updated);
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter((addr) => addr.id !== id);
    if (updated.length > 0 && !updated.some((addr) => addr.isDefault)) {
      updated[0].isDefault = true;
    }
    saveToLocal(updated);
  };

  const isLight = theme === "light";

  const inputClass = `w-full px-0 py-2 text-xs font-semibold bg-transparent border-b focus:outline-none rounded-none transition-colors duration-300 ${
    isLight 
      ? "border-neutral-200 text-black focus:border-[#1F4E79]" 
      : "border-neutral-800 text-white focus:border-[#3b82f6]"
  }`;

  const labelClass = "block text-[9px] tracking-[0.25em] font-black uppercase text-neutral-400 mb-1";

  return (
    <div className={`space-y-8 font-sans antialiased select-none transition-colors duration-300 ${
      isLight ? "bg-white text-black" : "bg-black text-white"
    }`}>
      
      {/* Title */}
      <div className={`flex justify-between items-center border-b pb-4 ${
        isLight ? "border-neutral-200" : "border-neutral-900"
      }`}>
        <div>
          <h2 className="font-serif text-xl font-bold uppercase">
            Saved Addresses
          </h2>
          <p className={`text-[10px] tracking-wider uppercase mt-1 ${
            isLight ? "text-neutral-500" : "text-neutral-450"
          }`}>
            Manage your delivery and billing coordinates.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className={`flex items-center gap-1.5 px-4 py-2 border text-[9px] font-black tracking-widest uppercase transition-colors rounded-xl cursor-pointer bg-transparent ${
              isLight 
                ? "border-neutral-200 text-black hover:border-black" 
                : "border-neutral-800 text-white hover:border-white"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Address
          </button>
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleAddAddress} className={`border p-6 rounded-2xl space-y-6 max-w-xl transition-colors ${
          isLight ? "border-neutral-200 bg-neutral-50" : "border-neutral-900 bg-neutral-950"
        }`}>
          <h3 className="text-xs font-black tracking-widest uppercase text-neutral-450">
            New Shipping Address
          </h3>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Address Label (e.g. Home, Office)</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={inputClass}
                placeholder="John Doe (Home)"
              />
            </div>

            <div>
              <label className={labelClass}>Street Address</label>
              <input
                type="text"
                required
                value={newStreet}
                onChange={(e) => setNewStreet(e.target.value)}
                className={inputClass}
                placeholder="12, Kojima Selvedge Lane, Lower Parel"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  required
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className={inputClass}
                  placeholder="Mumbai"
                />
              </div>

              <div>
                <label className={labelClass}>State</label>
                <input
                  type="text"
                  required
                  value={newState}
                  onChange={(e) => setNewState(e.target.value)}
                  className={inputClass}
                  placeholder="Maharashtra"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>ZIP / Postal Code</label>
                <input
                  type="text"
                  required
                  value={newZip}
                  onChange={(e) => setNewZip(e.target.value)}
                  className={inputClass}
                  placeholder="400013"
                />
              </div>

              <div>
                <label className={labelClass}>Country</label>
                <input
                  type="text"
                  required
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              className={`px-6 py-2.5 text-[9px] font-black tracking-widest uppercase transition-colors rounded-xl cursor-pointer border-0 ${
                isLight 
                  ? "bg-[#1F4E79] text-white hover:bg-black" 
                  : "bg-[#3b82f6] text-white hover:bg-white hover:text-black"
              }`}
            >
              Save Address
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className={`px-6 py-2.5 border text-[9px] font-black tracking-widest uppercase transition-colors rounded-xl cursor-pointer bg-transparent ${
                isLight 
                  ? "border-neutral-250 text-black hover:border-black" 
                  : "border-neutral-800 text-white hover:border-white"
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : addresses.length === 0 ? (
        <div className={`text-center py-12 border border-dashed rounded-2xl p-6 ${
          isLight ? "border-neutral-200 bg-neutral-50/50" : "border-neutral-900 bg-neutral-950/20"
        }`}>
          <MapPin className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
          <h4 className="text-xs font-black tracking-widest uppercase mb-1">No Saved Addresses</h4>
          <p className="text-[11px] text-neutral-400 mb-4 max-w-xs mx-auto">
            You don't have any saved shipping addresses yet. Click "Add Address" above to save one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`border p-6 rounded-2xl space-y-4 flex flex-col justify-between transition-all ${
                addr.isDefault 
                  ? (isLight ? "border-[#1F4E79] bg-[#1F4E79]/[0.02]" : "border-[#3b82f6] bg-[#3b82f6]/[0.02]") 
                  : (isLight ? "border-neutral-200 hover:border-neutral-300 bg-white" : "border-neutral-900 hover:border-neutral-800 bg-neutral-950")
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className={`font-bold uppercase tracking-wider text-[11px] ${
                    isLight ? "text-black" : "text-white"
                  }`}>
                    {addr.name}
                  </h4>
                  {addr.isDefault && (
                    <span className={`text-[8px] font-black tracking-widest uppercase text-white px-2 py-0.5 rounded ${
                      isLight ? "bg-[#1F4E79]" : "bg-[#3b82f6]"
                    }`}>
                      Default
                    </span>
                  )}
                </div>

                <div className={`text-xs space-y-0.5 leading-relaxed ${
                  isLight ? "text-neutral-600" : "text-neutral-400"
                }`}>
                  <p>{addr.street}</p>
                  <p>{addr.city}, {addr.state}</p>
                  <p>{addr.zip}</p>
                  <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-1">{addr.country}</p>
                </div>
              </div>

              <div className={`flex items-center gap-4 pt-4 border-t select-none ${
                isLight ? "border-neutral-100" : "border-neutral-900"
              }`}>
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className={`text-[9px] font-black tracking-widest hover:underline uppercase bg-transparent border-0 cursor-pointer p-0 ${
                      isLight ? "text-[#1F4E79]" : "text-[#3b82f6]"
                    }`}
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-[9px] font-black tracking-widest text-red-500 hover:underline uppercase bg-transparent border-0 cursor-pointer p-0 flex items-center gap-1.5 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
