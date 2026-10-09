"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BrandFooterBanner from "@/components/BrandFooterBanner";

export default function CommitteeDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Upload state (Active ONLY during file upload)
  const [uploadTask, setUploadTask] = useState(null);

  // Lightbox large view state
  const [lightboxImage, setLightboxImage] = useState(null);

  const [deletingId, setDeletingId] = useState(null);
  const fileInputRefDuring = useRef(null);
  const fileInputRefAfter = useRef(null);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState(null);

  // Load committee data
  const loadData = async () => {
    try {
      const res = await fetch("/api/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const json = await res.json();
      setData(json);
      if (json.committee?.mustChangePassword) {
        setShowPasswordModal(true);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Keyboard shortcut for closing modals (Escape key)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (lightboxImage) setLightboxImage(null);
        if (showPasswordModal && !data?.committee?.mustChangePassword) {
          setShowPasswordModal(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage, showPasswordModal, data]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
      router.push("/login");
    }
  };

  // Download image directly to host device
  const handleDownloadImage = (imageId, filename) => {
    if (!imageId) return;
    const link = document.createElement("a");
    link.href = `/api/images/${imageId}/download`;
    link.setAttribute("download", filename || "puja_image.jpg");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upload handler with real-time XHR progress tracking
  const handleFileUpload = (e, phase) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input
    e.target.value = "";

    // Generate local preview thumbnail
    const previewUrl = URL.createObjectURL(file);

    // Initial task state - modal opens immediately
    setUploadTask({
      phase,
      fileName: file.name,
      fileSize: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      previewUrl,
      progressPercent: 5,
      stage: 1,
      stageLabel: "ফাইল ও রেজোলিউশন যাচাই করা হচ্ছে...",
      status: "uploading",
      errorText: null,
    });

    // Validate size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadTask((prev) => ({
        ...prev,
        status: "error",
        errorText: "ছবির সাইজ ১০ MB এর কম হতে হবে।",
      }));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("phase", phase);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/images/upload", true);

    // Real-time network stream upload progress event
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 90);
        setUploadTask((prev) => ({
          ...prev,
          progressPercent: Math.max(prev?.progressPercent || 5, percent),
          stage: 2,
          stageLabel: `Uploading (${percent}%)...`,
        }));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.success) {
            setUploadTask((prev) => ({
              ...prev,
              progressPercent: 100,
              stage: 3,
              stageLabel: "✅ Uploaded successfully",
              status: "success",
            }));

            // Auto dismiss modal after completion and reload images
            setTimeout(() => {
              setUploadTask(null);
              loadData();
            }, 1200);
          } else {
            throw new Error(res.message || "আপলোড ব্যর্থ হয়েছে।");
          }
        } catch (err) {
          setUploadTask((prev) => ({
            ...prev,
            status: "error",
            errorText: err.message || "সার্ভার রেসপন্স প্রক্রিয়াকরণে ব্যর্থ হয়েছে।",
          }));
        }
      } else {
        try {
          const res = JSON.parse(xhr.responseText);
          setUploadTask((prev) => ({
            ...prev,
            status: "error",
            errorText: res.message || "ছবি আপলোড করতে ব্যর্থ হয়েছে।",
          }));
        } catch {
          setUploadTask((prev) => ({
            ...prev,
            status: "error",
            errorText: "সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।",
          }));
        }
      }
    };

    xhr.onerror = () => {
      setUploadTask((prev) => ({
        ...prev,
        status: "error",
        errorText: "ইন্টারনেট সংযোগ বিচ্ছিন্ন হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।",
      }));
    };

    xhr.send(formData);
  };

  // Delete image handler
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে আপনি এই ছবিটি মুছে ফেলতে চান?")) {
      return;
    }

    setDeletingId(imageId);
    try {
      const res = await fetch(`/api/images/${imageId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.message || "ছবি মুছে ফেলতে সমস্যা হয়েছে।");
      } else {
        if (lightboxImage?.id === imageId) {
          setLightboxImage(null);
        }
        loadData();
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("ছবি মুছে ফেলতে সমস্যা হয়েছে।");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMsg(null);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });

      const json = await res.json();
      if (!res.ok) {
        setPasswordMsg({ type: "error", text: json.message || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।" });
      } else {
        setPasswordMsg({ type: "success", text: json.message });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordMsg(null);
          loadData();
        }, 1500);
      }
    } catch {
      setPasswordMsg({ type: "error", text: "সার্ভারের সাথে সংযোগ করা যায়নি।" });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-rose-200 text-sm font-semibold">Dashboard loading...</p>
        </div>
      </div>
    );
  }

  const { committee, counts, settings, images } = data || {};

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRefDuring}
        onChange={(e) => handleFileUpload(e, "DURING")}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRefAfter}
        onChange={(e) => handleFileUpload(e, "AFTER")}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Top Navbar */}
      <header className="bg-[#4a0011] border-b border-amber-500/25 py-3.5 px-4 sm:px-8 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white border border-amber-400/40 shadow flex items-center justify-center">
              <Image
                src="/brand-icon.png"
                alt="এই সময় লোগো"
                width={54}
                height={54}
                className="w-full h-full object-cover scale-135"
                priority
              />
            </div>
            {/* <div className="relative h-7 w-28">
              <Image
                src="https://images.assettype.com/eisamay/2026-09-16/0196j8pk/text-logo.png"
                alt="পূজোর সময়"
                fill
                sizes="112px"
                className="object-contain object-left"
                priority
              />
            </div> */}
            <span className="hidden lg:inline-block text-lg bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-medium">
                ক্লিন পূজা অ্যাওয়ার্ড
              </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="text-xs text-rose-200 hover:text-amber-300 px-3 py-1.5 rounded-full border border-amber-400/30 hover:bg-white/5 transition-all"
            >
              Change Password
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-xs bg-red-900/60 hover:bg-red-800 text-rose-100 px-3 py-1.5 rounded-full border border-red-500/30 transition-all font-semibold"
            >
              {isLoggingOut ? "Logout..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Force Password Change Warning Banner */}
        {committee?.mustChangePassword && (
          <div className="bg-amber-500/20 border-2 border-amber-400/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-pulse">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="text-base font-bold text-amber-300">Security alert: First time login</h4>
                <p className="text-xs sm:text-sm text-rose-100/90">
                  Set a new password
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="btn-gold text-xs sm:text-sm px-5 py-2 rounded-full shrink-0 font-bold"
            >
              New Password →
            </button>
          </div>
        )}

        {/* 🌟 REAL-TIME VISUAL UPLOAD TRACKER (VISIBLE ONLY DURING UPLOAD) */}
        {uploadTask && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="puja-card p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-amber-400 relative overflow-hidden">
              {/* Header */}
              <div className="text-center mb-5">
                <span className="text-xs px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 inline-block mb-2">
                  {uploadTask.phase === "DURING" ? "Pictures during puja" : "Pictures after puja"}
                </span>
                <h3 className="text-xl font-bold text-white">
                  {uploadTask.status === "error"
                    ? "Error while uploading"
                    : uploadTask.status === "success"
                    ? "Upload Complete"
                    : "Uploading..."}
                </h3>
              </div>

              {/* Thumbnail & File Details */}
              <div className="flex items-center gap-4 p-3.5 rounded-xl bg-[#2b000a]/80 border border-amber-500/30 mb-5">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-amber-400/50 bg-black/60 shadow">
                  <img
                    src={uploadTask.previewUrl}
                    alt="Uploading preview"
                    className="w-full h-full object-cover"
                  />
                  {uploadTask.status === "uploading" && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {uploadTask.status === "success" && (
                    <div className="absolute inset-0 bg-emerald-950/80 flex items-center justify-center text-emerald-400 font-black text-xl">
                      ✓
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{uploadTask.fileName}</p>
                  <p className="text-xs text-rose-200/70 font-mono mt-0.5">{uploadTask.fileSize}</p>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-extrabold text-lg ${
                      uploadTask.status === "error"
                        ? "text-red-400"
                        : uploadTask.status === "success"
                        ? "text-emerald-300"
                        : "text-[#ffc72c]"
                    }`}
                  >
                    {uploadTask.status === "error" ? "✕" : `${uploadTask.progressPercent}%`}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-amber-500/30 p-0.5 mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    uploadTask.status === "error"
                      ? "bg-red-500"
                      : uploadTask.status === "success"
                      ? "bg-gradient-to-r from-emerald-400 to-teal-300"
                      : "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300"
                  }`}
                  style={{ width: `${uploadTask.progressPercent}%` }}
                />
              </div>

              {/* Status Text / Error Box */}
              {uploadTask.status === "error" ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-red-950/90 border border-red-400/60 text-rose-200 text-xs">
                    ⚠️ {uploadTask.errorText}
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadTask(null)}
                    className="w-full py-2.5 rounded-xl border border-rose-400/40 text-rose-200 hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
                  >
                    বাতিল করে পুনরায় চেষ্টা করুন
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs text-amber-200 font-medium">
                    {uploadTask.stageLabel}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🔍 LARGE IMAGE VIEWER / LIGHTBOX MODAL */}
        {lightboxImage && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Top Bar */}
            <div className="flex items-center justify-between max-w-5xl mx-auto w-full pb-3 border-b border-amber-500/25">
              <div className="flex items-center gap-3">
                <span className="text-xs px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40">
                  {lightboxImage.phase === "DURING" ? "Pictures during puja" : "Pictures after puja"}
                </span>
                <span className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md hidden sm:inline">
                  {lightboxImage.originalFilename}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadImage(lightboxImage.id, lightboxImage.originalFilename)}
                  className="btn-gold text-xs px-4 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>⬇️ Download</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-lg border border-white/20 transition-all cursor-pointer"
                  title="বন্ধ করুন (Esc)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Center High-Res Image View */}
            <div className="flex-1 flex items-center justify-center p-2 sm:p-4 min-h-0 overflow-hidden">
              <img
                src={lightboxImage.displayUrl}
                alt={lightboxImage.originalFilename}
                className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border-2 border-amber-500/30"
              />
            </div>

            {/* Bottom Info & Action Bar */}
            <div className="max-w-5xl mx-auto w-full pt-3 border-t border-amber-500/25 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-200/80">
              <div className="flex items-center gap-4">
                <span>📁 ফাইল: <strong className="text-white">{lightboxImage.originalFilename}</strong></span>
                <span>সাইজ: <strong className="text-amber-300 font-mono">{(lightboxImage.sizeBytes / (1024 * 1024)).toFixed(2)} MB</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleDeleteImage(lightboxImage.id)}
                  disabled={deletingId === lightboxImage.id}
                  className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-rose-200 hover:text-white border border-red-500/30 font-semibold transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>🗑️ ছবি মুছে ফেলুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-all cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Committee Profile Overview Card */}
        <div className="chalchitra-border p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-amber-500/20">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-400/30 px-3 py-0.5 rounded-full text-amber-300 text-xs font-semibold">
                  <span>Ward No: {committee?.wardNo} (KMC)</span>
                </span>
                {committee?.zone && (
                  <span className="inline-flex items-center bg-cyan-500/15 border border-cyan-400/30 px-3 py-0.5 rounded-full text-cyan-300 text-xs font-semibold">
                    <span>Zone: {committee.zone}</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {committee?.committeeName}
              </h1>
              <p className="text-amber-200 text-base font-medium mt-0.5">
                {committee?.pujoName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-200/70">Status:</span>
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-400/50 text-emerald-300">
                {committee?.status === "REGISTERED" && "ACTIVE"}
                {committee?.status === "SHORTLISTED" && "SHORTLISTED"}
                {committee?.status === "WINNER" && "WINNER"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
            <div className="bg-[#2a0009]/70 p-3.5 rounded-xl border border-amber-500/20">
              <span className="text-xs text-rose-300 block mb-1">Zone & Area:</span>
              <span className="font-semibold text-white">{committee?.zone ? `${committee.zone} - ${committee?.area}` : committee?.area}</span>
            </div>
            <div className="bg-[#2a0009]/70 p-3.5 rounded-xl border border-amber-500/20">
              <span className="text-xs text-rose-300 block mb-1">Contact Person:</span>
              <span className="font-semibold text-white truncate block">{committee?.contactPerson || "N/A"}</span>
              <span className="text-xs text-amber-300/90 font-mono mt-0.5 block">{committee?.contactNumber}</span>
            </div>
            <div className="bg-[#2a0009]/70 p-3.5 rounded-xl border border-amber-500/20">
              <span className="text-xs text-rose-300 block mb-1">Email ID:</span>
              <span className="font-semibold text-white truncate block">{committee?.email}</span>
            </div>
            <div className="bg-[#2a0009]/70 p-3.5 rounded-xl border border-amber-500/20">
              <span className="text-xs text-rose-300 block mb-1">Address:</span>
              <span className="font-semibold text-white text-xs line-clamp-2">{committee?.address}</span>
            </div>
          </div>
        </div>

        {/* 2 Upload Sections (During vs After) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phase 1: Puja চলাকালীন (Before/During Puja) */}
          <div className="puja-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <h3 className="text-xl font-bold text-white">Pictures during puja</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/15 border border-amber-400/40 text-amber-300">
                  {counts?.duringCount} / {counts?.duringMax}
                </span>
              </div>

              <p className="text-rose-100/80 text-xs sm:text-sm mb-4 leading-relaxed">
                Max: 10 Images
              </p>

              {/* Status Badge */}
              <div className="mb-4">
                {settings?.duringOpen ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Upload window is now open
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-rose-300 bg-red-950/60 px-2.5 py-1 rounded-md border border-red-400/30">
                    Upload window is now closed
                  </span>
                )}
              </div>

              {/* Photos Grid or Empty State */}
              {images?.during?.length === 0 ? (
                <div className="py-10 border-2 border-dashed border-amber-500/25 rounded-xl text-center bg-[#2b000a]/50">
                  <span className="text-3xl block mb-2">📸</span>
                  <p className="text-xs text-rose-200/60">এখনও কোনো ছবি আপলোড করা হয়নি</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {images.during.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => setLightboxImage(img)}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-amber-400/30 bg-black/60 shadow-md cursor-pointer hover:border-amber-400 transition-all"
                    >
                      <img
                        src={img.displayUrl}
                        alt={img.originalFilename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] bg-amber-400/30 text-amber-200 px-1.5 py-0.5 rounded font-bold">
                            🔍 বড় করে দেখুন
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(img.id);
                            }}
                            disabled={deletingId === img.id}
                            className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg text-xs cursor-pointer active:scale-90 transition-transform"
                            title="ছবি মুছে ফেলুন"
                          >
                            {deletingId === img.id ? "..." : "🗑️"}
                          </button>
                        </div>
                        <span className="text-[10px] text-rose-100 font-mono truncate">
                          {(img.sizeBytes / (1024 * 1024)).toFixed(1)}MB
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-amber-500/15">
              <button
                type="button"
                onClick={() => fileInputRefDuring.current?.click()}
                disabled={
                  !settings?.duringOpen ||
                  counts?.duringCount >= counts?.duringMax ||
                  uploadTask !== null
                }
                className="btn-gold w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Upload Image</span>
              </button>
            </div>
          </div>

          {/* Phase 2: Puja পরবর্তী (After Puja) */}
          <div className="puja-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <h3 className="text-xl font-bold text-white">Pictures after puja</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/15 border border-emerald-400/40 text-emerald-300">
                  {counts?.afterCount} / {counts?.afterMax} 
                </span>
              </div>
              <p className="text-rose-100/80 text-xs sm:text-sm mb-4 leading-relaxed">
                Max: 10 Images
              </p>

              {/* <p className="text-rose-100/80 text-xs sm:text-sm mb-4 leading-relaxed">
                বিসর্জনের পর প্যান্ডেল এলাকা পরিষ্কার ও আবর্জনামুক্ত করার প্রমাণস্বরূপ ছবি আপলোড করুন। (সর্বোচ্চ ১০টি ছবি)
              </p> */}

              {/* Status Badge */}
              <div className="mb-4">
                {settings?.afterOpen ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Upload window is now open
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-400/30">
                    Upload window is now closed
                  </span>
                )}
              </div>

              {/* Photos Grid or Empty State */}
              {images?.after?.length === 0 ? (
                <div className="py-10 border-2 border-dashed border-emerald-500/25 rounded-xl text-center bg-[#2b000a]/50">
                  <span className="text-3xl block mb-2">🧹</span>
                  <p className="text-xs text-rose-200/60">এখনও কোনো ছবি আপলোড করা হয়নি</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {images.after.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => setLightboxImage(img)}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-emerald-400/30 bg-black/60 shadow-md cursor-pointer hover:border-emerald-400 transition-all"
                    >
                      <img
                        src={img.displayUrl}
                        alt={img.originalFilename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] bg-emerald-400/30 text-emerald-200 px-1.5 py-0.5 rounded font-bold">
                            🔍 বড় করে দেখুন
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(img.id);
                            }}
                            disabled={deletingId === img.id}
                            className="self-end bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg text-xs cursor-pointer active:scale-90 transition-transform"
                            title="ছবি মুছে ফেলুন"
                          >
                            {deletingId === img.id ? "..." : "🗑️"}
                          </button>
                        </div>
                        <span className="text-[10px] text-rose-100 font-mono truncate">
                          {(img.sizeBytes / (1024 * 1024)).toFixed(1)}MB
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-amber-500/15">
              <button
                type="button"
                onClick={() => fileInputRefAfter.current?.click()}
                disabled={
                  !settings?.afterOpen ||
                  counts?.afterCount >= counts?.afterMax ||
                  uploadTask !== null
                }
                className="btn-gold w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Upload Image</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="puja-card p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="text-center mb-6">
              <span className="text-3xl block mb-2">🔐</span>
              <h3 className="text-xl font-bold text-white">Change Password</h3>
              {/* <p className="text-xs text-rose-200/80 mt-1">
                আপনার বর্তমান পাসওয়ার্ড দিন এবং নতুন পাসওয়ার্ড সেট করুন
              </p> */}
            </div>

            {passwordMsg && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs font-semibold ${
                  passwordMsg.type === "success"
                    ? "bg-emerald-950/80 border border-emerald-400/50 text-emerald-200"
                    : "bg-red-950/80 border border-red-400/50 text-rose-200"
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-rose-100 mb-1">
                  Current Password <span className="text-amber-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full bg-[#3b000f]/80 border border-amber-500/30 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-100 mb-1">
                  New Password(min 6 characters) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full bg-[#3b000f]/80 border border-amber-500/30 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-100 mb-1">
                  Confirm Password <span className="text-amber-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full bg-[#3b000f]/80 border border-amber-500/30 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                {!committee?.mustChangePassword && (
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-rose-400/30 text-rose-200 text-xs font-semibold hover:bg-white/5"
                  >Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-gold flex-1 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {passwordLoading ? "Saving password..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brand Section before footer */}
      <BrandFooterBanner />

      {/* Footer */}
      <footer className="bg-[#38000c] border-t border-amber-500/20 py-4 px-4 text-center text-xs text-rose-200/60">
        © ২০২৬ ক্লিন পূজা অ্যাওয়ার্ড | সর্বস্বত্ব সংরক্ষিত
      </footer>
    </div>
  );
}
