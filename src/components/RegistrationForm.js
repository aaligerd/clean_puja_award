"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    pujoName: "",
    committeeName: "",
    zone: "",
    area: "",
    wardNo: "",
    address: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Client-side Validation
  const validate = () => {
    const errs = {};
    const noSpecialCharRegex = /^[a-zA-Z0-9\u0980-\u09FF\s]+$/;
    const nameOnlyRegex = /^[a-zA-Z\u0980-\u09FF\s]+$/;

    if (!formData.pujoName.trim()) {
      errs.pujoName = "পূজার নাম আবশ্যক।";
    } else if (formData.pujoName.trim().length > 150) {
      errs.pujoName = "পূজার নাম সর্বোচ্চ ১৫০ অক্ষরের মধ্যে হতে হবে।";
    } else if (!noSpecialCharRegex.test(formData.pujoName.trim())) {
      errs.pujoName = "পূজার নামে কোনো স্পেশাল ক্যারেক্টার ব্যবহার করা যাবে না।";
    }

    if (!formData.committeeName.trim()) {
      errs.committeeName = "পূজা কমিটির নাম আবশ্যক।";
    } else if (formData.committeeName.trim().length > 150) {
      errs.committeeName = "কমিটির নাম সর্বোচ্চ ১৫০ অক্ষরের মধ্যে হতে হবে।";
    } else if (!noSpecialCharRegex.test(formData.committeeName.trim())) {
      errs.committeeName = "কমিটির নামে কোনো স্পেশাল ক্যারেক্টার ব্যবহার করা যাবে না।";
    }

    const validZones = ["North Kolkata", "Central Kolkata", "South Kolkata"];
    if (!formData.zone || !validZones.includes(formData.zone)) {
      errs.zone = "সঠিক জোন নির্বাচন করুন (North, Central, বা South Kolkata)।";
    }

    if (!formData.area.trim()) {
      errs.area = "এলাকা বা লোকালিটির নাম আবশ্যক।";
    } else if (formData.area.trim().length > 150) {
      errs.area = "এলাকার নাম সর্বোচ্চ ১৫০ অক্ষরের মধ্যে হতে হবে।";
    } else if (!noSpecialCharRegex.test(formData.area.trim())) {
      errs.area = "এলাকার নামে কোনো স্পেশাল ক্যারেক্টার ব্যবহার করা যাবে না।";
    }

    const ward = parseInt(formData.wardNo, 10);
    if (!formData.wardNo || isNaN(ward) || ward < 1 || ward > 144) {
      errs.wardNo = "১ থেকে ১৪৪ এর মধ্যে কলকাতা পুরসভা ওয়ার্ড নম্বর নির্বাচন করুন।";
    }

    if (!formData.address.trim()) {
      errs.address = "প্যান্ডেলের সম্পূর্ণ ঠিকানা আবশ্যক।";
    } else if (formData.address.trim().length > 300) {
      errs.address = "ঠিকানা সর্বোচ্চ ৩০০ অক্ষরের মধ্যে হতে হবে।";
    }

    if (!formData.contactPerson.trim()) {
      errs.contactPerson = "কমিটির দায়িত্বপ্রাপ্ত ব্যক্তির নাম আবশ্যক।";
    } else if (formData.contactPerson.trim().length > 150) {
      errs.contactPerson = "দায়িত্বপ্রাপ্ত ব্যক্তির নাম সর্বোচ্চ ১৫০ অক্ষরের মধ্যে হতে হবে।";
    } else if (!nameOnlyRegex.test(formData.contactPerson.trim())) {
      errs.contactPerson = "দায়িত্বপ্রাপ্ত ব্যক্তির নামে কোনো স্পেশাল ক্যারেক্টার ব্যবহার করা যাবে না।";
    }

    const cleanedPhone = formData.contactNumber.trim().replace(/[\s-]/g, "");
    if (!cleanedPhone) {
      errs.contactNumber = "১০ সংখ্যার ভারতীয় মোবাইল নম্বর আবশ্যক।";
    } else if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      errs.contactNumber = "সঠিক ১০ সংখ্যার ভারতীয় মোবাইল নম্বর দিন (উদাঃ 9830012345)।";
    }

    const cleanedEmail = formData.email.trim();
    if (!cleanedEmail) {
      errs.email = "ইমেইল ঠিকানা আবশ্যক।";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {
      errs.email = "সঠিক ইমেইল ঠিকানা প্রদান করুন (উদাঃ committee@gmail.com)।";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Disallow special characters for pujoName, committeeName, area, contactPerson, contactNumber
    // Only address and email id can accept special characters
    if (name === "pujoName" || name === "committeeName" || name === "area") {
      sanitizedValue = value.replace(/[^a-zA-Z0-9\u0980-\u09FF\s]/g, "");
    } else if (name === "contactPerson") {
      sanitizedValue = value.replace(/[^a-zA-Z\u0980-\u09FF\s]/g, "");
    } else if (name === "contactNumber") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (serverMessage) setServerMessage(null);
  };

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setServerMessage(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        }
        setServerMessage({
          type: "error",
          text: data.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।",
        });
      } else {
        setIsSuccess(true);
        setCredentials(data.data);
        setServerMessage({
          type: "success",
          text: data.message,
        });
      }
    } catch (error) {
      console.error("Form submit error:", error);
      setServerMessage({
        type: "error",
        text: "সার্ভারের সাথে সংযোগ করা সম্ভব হয়নি। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="register" className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full mb-16">
      <div className="puja-card p-6 sm:p-10 relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
            Registration<span className="text-[#ffc72c]"> Form</span>
          </h2>
        </div>

        {/* Server Response Feedback Message */}
        {serverMessage && !isSuccess && (
          <div className="p-4 rounded-xl mb-6 text-sm flex items-start gap-3 border bg-red-950/80 border-red-400/50 text-rose-200">
            <span className="text-lg">⚠️</span>
            <div className="flex-1 font-medium">{serverMessage.text}</div>
          </div>
        )}

        {/* Success State / Visible Login Credentials Card */}
        {isSuccess && credentials ? (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-400 rounded-full flex items-center justify-center text-emerald-300 text-3xl mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                ✓
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                অভিনন্দন! রেজিস্ট্রেশন সম্পন্ন হয়েছে
              </h3>
              <p className="text-amber-200 text-base mt-1">
                <strong>{credentials.committeeName}</strong> ({credentials.pujoName})
              </p>
            </div>

            {/* Glowing Credentials Box */}
            <div className="chalchitra-border p-6 sm:p-8 bg-gradient-to-b from-[#4a0011] to-[#2e0009] border-2 border-amber-400 shadow-2xl relative">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-500/30">
                <span className="text-xs uppercase tracking-wider font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  আপনার পোর্টাল লগইন তথ্য
                </span>
                <span className="text-xs text-rose-200/70 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  সংরক্ষণ করুন
                </span>
              </div>

              <div className="space-y-4">
                {/* Email Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-[#200006]/90 border border-amber-500/25">
                  <div>
                    <span className="text-xs font-semibold text-rose-300 block mb-0.5">
                      লগইন ইমেইল ঠিকানা:
                    </span>
                    <span className="font-mono text-base sm:text-lg font-bold text-white select-all">
                      {credentials.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(credentials.email, "email")}
                    className="self-start sm:self-auto text-xs px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-400/40 transition-all font-semibold flex items-center gap-1.5 active:scale-95"
                  >
                    {copiedField === "email" ? (
                      <>
                        <span className="text-emerald-400">✓</span>
                        <span className="text-emerald-300">কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <span>📋</span>
                        <span>ইমেইল কপি করুন</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Password Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-[#200006]/90 border border-amber-400/40 shadow-inner">
                  <div>
                    <span className="text-xs font-semibold text-amber-300 block mb-0.5">
                      সিস্টেম-জেনারেটেড পাসওয়ার্ড:
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-extrabold text-[#ffc72c] tracking-wider select-all">
                      {credentials.password}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(credentials.password, "password")}
                    className="self-start sm:self-auto text-xs px-3.5 py-1.5 rounded-lg btn-gold transition-all font-bold flex items-center gap-1.5 active:scale-95 shadow-md text-slate-950"
                  >
                    {copiedField === "password" ? (
                      <>
                        <span className="text-emerald-900">✓</span>
                        <span className="text-emerald-950">কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <span>📋</span>
                        <span>পাসওয়ার্ড কপি করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Security Guidance Note */}
              <div className="mt-5 p-3.5 rounded-lg bg-amber-500/10 border border-amber-400/25 text-xs sm:text-sm text-rose-100 flex items-start gap-2.5">
                <span className="text-base leading-none">ℹ️</span>
                <p>
                  <strong>গুরুত্বপূর্ণ:</strong> পাসওয়ার্ডটি কোথাও নোট করে রাখুন। প্রথমবার পোর্টালে লগইন করার পর আপনি নিজের পছন্দমতো নতুন পাসওয়ার্ড পরিবর্তন করে নিতে পারবেন।
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/login"
                className="btn-gold w-full sm:w-auto px-8 py-3.5 rounded-full font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 shadow-xl text-slate-950"
              >
                <span>Committee Login</span>
                <span className="text-xl leading-none">→</span>
              </Link>
              {/* <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setCredentials(null);
                  setServerMessage(null);
                  setFormData({
                    pujoName: "",
                    committeeName: "",
                    zone: "",
                    area: "",
                    wardNo: "",
                    address: "",
                    contactPerson: "",
                    contactNumber: "",
                    email: "",
                  });
                }}
                className="w-full sm:w-auto puja-card px-6 py-3 rounded-full text-rose-200 hover:text-white font-medium text-sm transition-all cursor-pointer"
              >
                অন্য কোনো কমিটি নথিভুক্ত করুন
              </button> */}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Row 1: Name of Puja & Name of Committee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-rose-100 mb-1.5">
                  Name of Puja <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  name="pujoName"
                  value={formData.pujoName}
                  onChange={handleChange}
                  placeholder="e.g. Bagbazar Sarbojanin"
                  maxLength={150}
                  className={`w-full bg-[#3b000f]/80 border rounded-lg px-4 py-2.5 text-white placeholder-rose-300/40 focus:outline-none transition-colors ${
                    errors.pujoName
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-amber-500/30 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  }`}
                />
                {errors.pujoName && (
                  <p className="text-rose-300 text-xs mt-1">{errors.pujoName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-rose-100 mb-1.5">
                  Name of Committee <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  name="committeeName"
                  value={formData.committeeName}
                  onChange={handleChange}
                  placeholder="e.g. Bagbazar Sarbojanin Durgotsav Committee"
                  maxLength={150}
                  className={`w-full bg-[#3b000f]/80 border rounded-lg px-4 py-2.5 text-white placeholder-rose-300/40 focus:outline-none transition-colors ${
                    errors.committeeName
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-amber-500/30 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  }`}
                />
                {errors.committeeName && (
                  <p className="text-rose-300 text-xs mt-1">{errors.committeeName}</p>
                )}
              </div>
            </div>

            {/* Row 2: Zone of Puja & KMC Ward No */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-rose-100 mb-1.5">
                  Zone of the Puja <span className="text-amber-400">*</span>
                </label>
                <select
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  className={`w-full bg-[#3b000f]/80 border rounded-lg px-4 py-2.5 text-white focus:outline-none transition-colors ${
                    errors.zone
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-amber-500/30 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  }`}
                >
                  <option value="" disabled className="bg-[#4a0011] text-rose-200">
                    Select Kolkata Zone
                  </option>
                  <option value="North Kolkata" className="bg-[#4a0011] text-white">
                    North Kolkata (উত্তর কলকাতা)
                  </option>
                  <option value="Central Kolkata" className="bg-[#4a0011] text-white">
                    Central Kolkata (মধ্য কলকাতা)
                  </option>
                  <option value="South Kolkata" className="bg-[#4a0011] text-white">
                    South Kolkata (দক্ষিণ কলকাতা)
                  </option>
                </select>
                {errors.zone && (
                  <p className="text-rose-300 text-xs mt-1">{errors.zone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-rose-100 mb-1.5">
                  KMC Ward No <span className="text-amber-400">*</span>
                </label>
                <select
                  name="wardNo"
                  value={formData.wardNo}
                  onChange={handleChange}
                  className={`w-full bg-[#3b000f]/80 border rounded-lg px-4 py-2.5 text-white focus:outline-none transition-colors ${
                    errors.wardNo
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-amber-500/30 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  }`}
                >
                  <option value="" disabled className="bg-[#4a0011] text-rose-200">
                    Ward No (1-144)
                  </option>
                  {Array.from({ length: 144 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w} className="bg-[#4a0011] text-white">
                      Ward {w}
                    </option>
                  ))}
                </select>
                {errors.wardNo && (
                  <p className="text-rose-300 text-xs mt-1">{errors.wardNo}</p>
                )}
              </div>
            </div>

            {/* Row 3: Area/Locality & Contact Person Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-rose-100 mb-1.5">
                  Area / Locality <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g. Shyambazar, Gariahat, Park Circus"
                  maxLength={150}
                  className={`w-full bg-[#3b000f]/80 border rounded-lg px-4 py-2.5 text-white placeholder-rose-300/40 focus:outline-none transition-colors ${
                    errors.area
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-amber-500/30 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  }`}
                />
                {errors.area && (
                  <p className="text-rose-300 text-xs mt-1">{errors.area}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-rose-100 mb-1.5">
                  Contact Person Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="e.g. Subir Mukherjee (Secretary)"
                  maxLength={150}
                  className={`w-full bg-[#3b000f]/80 border rounded-lg px-4 py-2.5 text-white placeholder-rose-300/40 focus:outline-none transition-colors ${
                    errors.contactPerson
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-amber-500/30 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  }`}
                />
                {errors.contactPerson && (
                  <p className="text-rose-300 text-xs mt-1">{errors.contactPerson}</p>
                )}
              </div>
            </div>

            {/* Row 4: Address and Location of Pandal */}
            <div>
              <label className="block text-sm font-semibold text-rose-100 mb-1.5">
                Address and Location of Pandal <span className="text-amber-400">*</span>
              </label>
              <textarea
                rows={2}
                name="address"
                value={formData.address}
                onChange={handleChange}
                maxLength={300}
                placeholder="Full address of the puja pandal with landmark..."
                className={`w-full bg-[#3b000f]/80 border rounded-lg px-4 py-2.5 text-white placeholder-rose-300/40 focus:outline-none transition-colors ${
                  errors.address
                    ? "border-red-500 ring-1 ring-red-500"
                    : "border-amber-500/30 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                }`}
              />
              {errors.address && (
                <p className="text-rose-300 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            {/* Row 5: Contact Number & Email ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-rose-100 mb-1.5">
                  Contact Number <span className="text-amber-400">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="10-digit mobile (e.g. 9830012345)"
                  className={`w-full bg-[#3b000f]/80 border rounded-lg px-4 py-2.5 text-white placeholder-rose-300/40 focus:outline-none transition-colors ${
                    errors.contactNumber
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-amber-500/30 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  }`}
                />
                {errors.contactNumber && (
                  <p className="text-rose-300 text-xs mt-1">{errors.contactNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-rose-100 mb-1.5">
                  Email ID <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. committee@gmail.com"
                  className={`w-full bg-[#3b000f]/80 border rounded-lg px-4 py-2.5 text-white placeholder-rose-300/40 focus:outline-none transition-colors ${
                    errors.email
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-amber-500/30 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  }`}
                />
                {errors.email && (
                  <p className="text-rose-300 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Instant Password Generation Note */}
            {/* <div className="p-3 bg-[#2d000b]/60 border border-amber-500/20 rounded-lg text-xs text-rose-200/70">
              ℹ️ ফর্মটি জমা দেওয়ার সাথে সাথে আপনার স্ক্রিনে ও ইমেইলে একটি সুরক্ষিত লগইন পাসওয়ার্ড দেওয়া হবে।
            </div> */}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-gold w-full py-3.5 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-slate-950"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-red-950" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Please Wait...</span>
                  </>
                ) : (
                  <>
                    <span>Submit</span>
                    <span className="text-xl leading-none">→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
