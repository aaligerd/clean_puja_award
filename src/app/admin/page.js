"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboardPage() {
  const router = useRouter();

  // Admin Profile & State
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Committee Data & Stats
  const [committees, setCommittees] = useState([]);
  const [stats, setStats] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWard, setSelectedWard] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedPhotoFilter, setSelectedPhotoFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("latest");

  // Selected Committee for Review Modal
  const [reviewCommittee, setReviewCommittee] = useState(null);
  const [reviewTab, setReviewTab] = useState("ALL"); // ALL, DURING, AFTER
  const [evaluationForm, setEvaluationForm] = useState({
    status: "REGISTERED",
    score: "",
    adminNotes: "",
  });
  const [isSavingEval, setIsSavingEval] = useState(false);
  const [evalMsg, setEvalMsg] = useState(null);

  // Lightbox large view state for admin
  const [lightboxImage, setLightboxImage] = useState(null);

  // System Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    registration_open: "true",
    during_upload_open: "true",
    after_upload_open: "true",
    during_upload_max_limit: "10",
    after_upload_max_limit: "10",
    announcement_banner_text: "",
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState(null);

  // Verify Admin Session & Load Initial Data
  const checkAdminAuth = async () => {
    try {
      const res = await fetch("/api/admin/auth/me");
      if (!res.ok) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      setAdmin(data.admin);
      loadCommittees();
    } catch {
      window.location.href = "/admin/login";
    } finally {
      setIsLoading(false);
    }
  };

  const loadCommittees = async () => {
    setIsFetching(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (selectedWard !== "ALL") params.append("ward", selectedWard);
      if (selectedStatus !== "ALL") params.append("status", selectedStatus);
      if (selectedPhotoFilter !== "ALL") params.append("photoFilter", selectedPhotoFilter);
      if (sortBy) params.append("sortBy", sortBy);

      const res = await fetch(`/api/admin/committees?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        throw new Error("Failed to load committees");
      }
      const data = await res.json();
      setCommittees(data.committees || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error("Error loading committees:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettingsForm({
            registration_open: data.settings.registration_open ?? "true",
            during_upload_open: data.settings.during_upload_open ?? "true",
            after_upload_open: data.settings.after_upload_open ?? "true",
            during_upload_max_limit: data.settings.during_upload_max_limit ?? "10",
            after_upload_max_limit: data.settings.after_upload_max_limit ?? "10",
            announcement_banner_text: data.settings.announcement_banner_text ?? "",
          });
        }
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  };

  useEffect(() => {
    checkAdminAuth();
  }, []);

  // Debounced/Triggered Reload when filters change
  useEffect(() => {
    if (admin) {
      const timer = setTimeout(() => {
        loadCommittees();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, selectedWard, selectedStatus, selectedPhotoFilter, sortBy]);

  // Keyboard shortcut (Esc to close modals)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (lightboxImage) setLightboxImage(null);
        else if (reviewCommittee) setReviewCommittee(null);
        else if (showSettingsModal) setShowSettingsModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage, reviewCommittee, showSettingsModal]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch {
      window.location.href = "/admin/login";
    }
  };

  // Open Review Modal for a specific committee
  const openReviewModal = (committee) => {
    setReviewCommittee(committee);
    setReviewTab("ALL");
    setEvaluationForm({
      status: committee.status || "REGISTERED",
      score: committee.score !== null ? committee.score.toString() : "",
      adminNotes: committee.adminNotes || "",
    });
    setEvalMsg(null);
  };

  // Save Committee Evaluation
  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    if (!reviewCommittee) return;
    setIsSavingEval(true);
    setEvalMsg(null);

    try {
      const res = await fetch(`/api/admin/committees/${reviewCommittee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evaluationForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setEvalMsg({ type: "error", text: data.message || "Failed to save evaluation." });
      } else {
        setEvalMsg({ type: "success", text: "Evaluation & status saved successfully!" });

        // Update local state
        setCommittees((prev) =>
          prev.map((c) =>
            c.id === reviewCommittee.id
              ? {
                  ...c,
                  status: evaluationForm.status,
                  score: evaluationForm.score === "" ? null : parseFloat(evaluationForm.score),
                  adminNotes: evaluationForm.adminNotes,
                }
              : c
          )
        );

        setReviewCommittee((prev) =>
          prev
            ? {
                ...prev,
                status: evaluationForm.status,
                score: evaluationForm.score === "" ? null : parseFloat(evaluationForm.score),
                adminNotes: evaluationForm.adminNotes,
              }
            : null
        );

        // Refresh global counts
        loadCommittees();
      }
    } catch {
      setEvalMsg({ type: "error", text: "Connection error with server." });
    } finally {
      setIsSavingEval(false);
    }
  };

  // Quick Status change from table
  const handleQuickStatusChange = async (committeeId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/committees/${committeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCommittees((prev) =>
          prev.map((c) => (c.id === committeeId ? { ...c, status: newStatus } : c))
        );
        loadCommittees();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Save System Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsMsg(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsForm }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSettingsMsg({ type: "error", text: data.message || "Failed to save settings." });
      } else {
        setSettingsMsg({ type: "success", text: "System settings saved successfully!" });
        setTimeout(() => {
          setShowSettingsModal(false);
          setSettingsMsg(null);
        }, 1200);
      }
    } catch {
      setSettingsMsg({ type: "error", text: "Unable to reach server." });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Host Direct Download
  const handleDownloadImage = (imageId, filename) => {
    if (!imageId) return;
    const link = document.createElement("a");
    link.href = `/api/images/${imageId}/download`;
    link.setAttribute("download", filename || "puja_image.jpg");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#240008]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-rose-200 text-sm font-semibold">Loading Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#1c0006] text-white">
      {/* 🌟 Header & Navigation */}
      <header className="bg-[#36000d] border-b border-amber-500/25 py-3.5 px-4 sm:px-8 sticky top-0 z-40 shadow-xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white/10 p-0.5 border border-amber-400/40">
              <Image
                src="https://images.assettype.com/eisamay/2026-09-14/9yn8yftt/es-logo.png"
                alt="Ei Samay Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain rounded-full"
                priority
              />
            </div>
            {/* <div className="relative h-7 w-28">
              <Image
                src="https://images.assettype.com/eisamay/2026-09-16/0196j8pk/text-logo.png"
                alt="Pujor Somoy"
                fill
                sizes="112px"
                className="object-contain object-left"
                priority
              />
            </div> */}
            <span className="hidden lg:inline-block text-lg bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-medium">
                ক্লিন পূজা অ্যাওয়ার্ড
              </span>
            <span className="hidden sm:inline-block text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* System Settings Button */}
            <button
              onClick={() => {
                loadSettings();
                setShowSettingsModal(true);
              }}
              className="text-xs bg-[#4a0011] hover:bg-[#5a0016] text-amber-300 px-3 py-1.5 rounded-lg border border-amber-400/30 transition-all font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span>⚙️ System Settings</span>
            </button>

            {/* CSV Export Button */}
            <a
              href="/api/admin/export"
              download
              className="text-xs btn-gold px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer text-slate-950"
            >
              <span>📥 Export CSV</span>
            </a>

            {/* Admin Info & Logout */}
            <div className="h-4 w-px bg-amber-500/30 mx-1 hidden sm:block" />

            <span className="text-xs text-rose-200/80 hidden md:inline font-medium">
              {admin?.name || admin?.email}
            </span>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-xs bg-red-900/60 hover:bg-red-800 text-rose-100 px-3 py-1.5 rounded-lg border border-red-500/30 transition-all font-semibold cursor-pointer"
            >
              {isLoggingOut ? "Signing out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      {/* 🌟 Main Dashboard Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 📊 High-Level Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Total Committees */}
          <div className="bg-[#2d000b] p-4 rounded-2xl border border-amber-500/25 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-300 text-xs">
              <span>Total Committees</span>
              <span>🏛️</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-white font-mono">
                {stats?.totalCommittees ?? 0}
              </span>
              <span className="text-[10px] text-rose-300/70 block mt-0.5">Registered Pujas</span>
            </div>
          </div>

          {/* Card 2: During Photos */}
          <div className="bg-[#2d000b] p-4 rounded-2xl border border-amber-500/25 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-300 text-xs">
              <span>During Photos</span>
              <span>📸</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-amber-300 font-mono">
                {stats?.duringPhotos ?? 0}
              </span>
              <span className="text-[10px] text-rose-300/70 block mt-0.5">During Puja</span>
            </div>
          </div>

          {/* Card 3: After Photos */}
          <div className="bg-[#2d000b] p-4 rounded-2xl border border-amber-500/25 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-300 text-xs">
              <span>After Photos</span>
              <span>🧹</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-emerald-300 font-mono">
                {stats?.afterPhotos ?? 0}
              </span>
              <span className="text-[10px] text-rose-300/70 block mt-0.5">Post-Puja Clean-up</span>
            </div>
          </div>

          {/* Card 4: Total Photos */}
          <div className="bg-[#2d000b] p-4 rounded-2xl border border-amber-500/25 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-rose-300 text-xs">
              <span>Total Photos</span>
              <span>🖼️</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-rose-200 font-mono">
                {stats?.totalPhotos ?? 0}
              </span>
              <span className="text-[10px] text-rose-300/70 block mt-0.5">AWS S3 Cloud</span>
            </div>
          </div>

          {/* Card 5: Shortlisted */}
          <div className="bg-[#2d000b] p-4 rounded-2xl border border-amber-500/25 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-cyan-300 text-xs">
              <span>Shortlisted</span>
              <span>⭐</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-cyan-300 font-mono">
                {stats?.shortlistedCommittees ?? 0}
              </span>
              <span className="text-[10px] text-rose-300/70 block mt-0.5">Selected Pujas</span>
            </div>
          </div>

          {/* Card 6: Winners */}
          <div className="bg-[#2d000b] p-4 rounded-2xl border border-amber-400/40 shadow-lg flex flex-col justify-between bg-gradient-to-br from-[#3b000f] to-[#4a0011]">
            <div className="flex items-center justify-between text-amber-400 text-xs font-bold">
              <span>Winners</span>
              <span>🏆</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-[#ffc72c] font-mono">
                {stats?.winnerCommittees ?? 0}
              </span>
              <span className="text-[10px] text-amber-300/80 block mt-0.5">Award Winners</span>
            </div>
          </div>
        </div>

        {/* 🔍 Search, Filters & Controls Bar */}
        <div className="chalchitra-border p-5 sm:p-6 space-y-4 bg-[#2b000a]/90">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Live Search Input */}
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-300 text-sm">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Committee Name, Puja Name, Area, Phone, or Email..."
                className="w-full bg-[#1c0006] border border-amber-500/30 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 placeholder:text-rose-300/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-rose-300 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Stats Indicator */}
            <div className="text-xs text-rose-200/80 font-medium shrink-0 flex items-center gap-2">
              <span>Showing: <strong className="text-amber-300 font-mono text-sm">{committees.length}</strong> Committees</span>
              {isFetching && (
                <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-amber-500/20 text-xs">
            {/* Status Filter */}
            <div>
              <label className="block text-rose-300 font-semibold mb-1">Status Filter:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-[#1c0006] border border-amber-500/30 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Statuses</option>
                <option value="REGISTERED">Active / Registered</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="WINNER">Winner</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Photo Filter */}
            <div>
              <label className="block text-rose-300 font-semibold mb-1">Photo Upload Status:</label>
              <select
                value={selectedPhotoFilter}
                onChange={(e) => setSelectedPhotoFilter(e.target.value)}
                className="w-full bg-[#1c0006] border border-amber-500/30 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Committees</option>
                <option value="HAS_PHOTOS">Has Uploaded Photos</option>
                <option value="HAS_BOTH">Has Both (During & After)</option>
                <option value="ONLY_DURING">During Puja Photos Only</option>
                <option value="ONLY_AFTER">After Puja Photos Only</option>
                <option value="NO_PHOTOS">No Photos Uploaded (0)</option>
              </select>
            </div>

            {/* Ward Filter */}
            <div>
              <label className="block text-rose-300 font-semibold mb-1">KMC Ward No:</label>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="w-full bg-[#1c0006] border border-amber-500/30 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Wards (1 - 144)</option>
                {Array.from({ length: 144 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Ward {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-rose-300 font-semibold mb-1">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#1c0006] border border-amber-500/30 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-amber-400"
              >
                <option value="latest">Latest Registration</option>
                <option value="oldest">Oldest Registration</option>
                <option value="name">Committee Name (A-Z)</option>
                <option value="ward">Ward Number (1-144)</option>
                <option value="score">Highest Score</option>
              </select>
            </div>
          </div>
        </div>

        {/* 📋 Committees Table / Grid View */}
        {committees.length === 0 ? (
          <div className="puja-card p-12 text-center">
            <span className="text-4xl block mb-3">🔍</span>
            <h3 className="text-lg font-bold text-white">No Committees Found</h3>
            <p className="text-xs text-rose-200/70 mt-1 max-w-sm mx-auto">
              Please adjust your search keywords or filter criteria and try again.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {committees.map((item) => (
              <div
                key={item.id}
                className="bg-[#28000a] rounded-2xl border border-amber-500/25 p-5 sm:p-6 hover:border-amber-400/60 transition-all shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left: Committee Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40">
                      Ward {item.wardNo}
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-rose-100 font-medium">
                      📍 {item.area}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`text-[11px] px-3 py-0.5 rounded-full font-bold border ${
                        item.status === "WINNER"
                          ? "bg-amber-400/20 text-amber-300 border-amber-400/60"
                          : item.status === "SHORTLISTED"
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/60"
                          : item.status === "REJECTED"
                          ? "bg-red-500/20 text-red-300 border-red-400/60"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-400/60"
                      }`}
                    >
                      {item.status === "WINNER" && "🏆 Winner"}
                      {item.status === "SHORTLISTED" && "⭐ Shortlisted"}
                      {item.status === "REGISTERED" && "✅ Active"}
                      {item.status === "REJECTED" && "✕ Rejected"}
                    </span>

                    {item.score !== null && (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold border border-purple-400/40">
                        Score: {item.score}/100
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white hover:text-amber-300 transition-colors">
                      {item.committeeName}
                    </h3>
                    <p className="text-amber-200/90 text-sm font-medium">{item.pujoName}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-rose-200/70 pt-1">
                    <span>📞 {item.contactNumber}</span>
                    <span>✉️ {item.email}</span>
                    <span>🏠 {item.address}</span>
                  </div>
                </div>

                {/* Center: Photo Thumbnails & Count */}
                <div className="flex items-center gap-4 border-y lg:border-y-0 lg:border-x border-amber-500/15 py-3 lg:py-0 lg:px-6">
                  {/* Photo Badges */}
                  <div className="space-y-1.5 text-xs shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-rose-200">During Puja:</span>
                      <strong className="text-amber-300 font-mono">{item.counts.duringCount}/10</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-rose-200">After Puja:</span>
                      <strong className="text-emerald-300 font-mono">{item.counts.afterCount}/10</strong>
                    </div>
                  </div>

                  {/* Visual Thumbnails (Up to 4 preview thumbnails) */}
                  <div className="flex items-center -space-x-2 overflow-hidden py-1">
                    {[...item.images.during, ...item.images.after].slice(0, 4).map((img, idx) => (
                      <div
                        key={img.id || idx}
                        onClick={() => setLightboxImage(img)}
                        className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-[#28000a] shadow cursor-pointer hover:z-10 hover:scale-110 transition-transform bg-black"
                      >
                        <img
                          src={img.displayUrl}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {item.counts.totalCount > 4 && (
                      <div className="w-12 h-12 rounded-lg bg-black/80 border-2 border-[#28000a] text-amber-300 font-mono text-xs flex items-center justify-center font-bold">
                        +{item.counts.totalCount - 4}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap lg:flex-col items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openReviewModal(item)}
                    className="btn-gold text-xs px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow cursor-pointer text-slate-950"
                  >
                    <span>🖼️ Review Photos</span>
                  </button>

                  <select
                    value={item.status}
                    onChange={(e) => handleQuickStatusChange(item.id, e.target.value)}
                    className="text-xs bg-[#1c0006] border border-amber-500/30 rounded-lg px-2.5 py-1.5 text-rose-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="REGISTERED">Active</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="WINNER">Winner</option>
                    <option value="REJECTED">Reject</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 🌟 COMMITTEE PHOTO REVIEW & EVALUATION MODAL */}
      {reviewCommittee && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-[#240008] border-2 border-amber-400/80 rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-amber-500/25 bg-[#36000d] flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40">
                    Ward No {reviewCommittee.wardNo} (KMC)
                  </span>
                  <span className="text-xs text-rose-200/80">📍 {reviewCommittee.area}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {reviewCommittee.committeeName}
                </h2>
                <p className="text-amber-200 text-sm font-medium">{reviewCommittee.pujoName}</p>
              </div>

              <button
                onClick={() => setReviewCommittee(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-lg border border-white/20 transition-all cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Split into Photo Gallery (Left) & Evaluation Form (Right) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left & Center: Photo Gallery (2 Cols) */}
              <div className="lg:col-span-2 space-y-5">
                {/* Photo Filter Tabs */}
                <div className="flex items-center gap-2 border-b border-amber-500/20 pb-3">
                  <button
                    onClick={() => setReviewTab("ALL")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      reviewTab === "ALL"
                        ? "bg-amber-400 text-slate-950 shadow"
                        : "bg-white/5 text-rose-200 hover:bg-white/10"
                    }`}
                  >
                    All Photos ({reviewCommittee.counts.totalCount})
                  </button>
                  <button
                    onClick={() => setReviewTab("DURING")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      reviewTab === "DURING"
                        ? "bg-amber-400 text-slate-950 shadow"
                        : "bg-white/5 text-rose-200 hover:bg-white/10"
                    }`}
                  >
                    📸 During Puja ({reviewCommittee.counts.duringCount})
                  </button>
                  <button
                    onClick={() => setReviewTab("AFTER")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      reviewTab === "AFTER"
                        ? "bg-amber-400 text-slate-950 shadow"
                        : "bg-white/5 text-rose-200 hover:bg-white/10"
                    }`}
                  >
                    🧹 After Clean-up ({reviewCommittee.counts.afterCount})
                  </button>
                </div>

                {/* Photos Grid */}
                {reviewCommittee.counts.totalCount === 0 ? (
                  <div className="py-16 text-center border-2 border-dashed border-amber-500/25 rounded-2xl bg-[#1c0006]">
                    <span className="text-4xl block mb-2">📸</span>
                    <p className="text-sm text-rose-200/70">
                      This Puja Committee has not uploaded any photos yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    {(reviewTab === "ALL"
                      ? [...reviewCommittee.images.during, ...reviewCommittee.images.after]
                      : reviewTab === "DURING"
                      ? reviewCommittee.images.during
                      : reviewCommittee.images.after
                    ).map((img) => (
                      <div
                        key={img.id}
                        onClick={() => setLightboxImage(img)}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-amber-400/30 bg-black shadow cursor-pointer hover:border-amber-400 transition-all"
                      >
                        <img
                          src={img.displayUrl}
                          alt={img.originalFilename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
                          <span
                            className={`text-[10px] self-start px-2 py-0.5 rounded font-bold ${
                              img.phase === "DURING"
                                ? "bg-amber-400 text-slate-950"
                                : "bg-emerald-400 text-slate-950"
                            }`}
                          >
                            {img.phase === "DURING" ? "During Puja" : "Post Clean-up"}
                          </span>

                          <div className="flex items-center justify-between text-[11px] text-white">
                            <span className="truncate">{img.originalFilename}</span>
                            <span className="font-mono text-amber-300">
                              {(img.sizeBytes / (1024 * 1024)).toFixed(1)}MB
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Committee Details & Jury Evaluation Form (1 Col) */}
              <div className="space-y-5 bg-[#1f0007] p-5 rounded-2xl border border-amber-500/20">
                <div>
                  <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-3">
                    Committee Information
                  </h4>
                  <div className="space-y-2 text-xs text-rose-100/90">
                    <p>
                      <strong className="text-rose-300">Address:</strong> {reviewCommittee.address}
                    </p>
                    <p>
                      <strong className="text-rose-300">Phone:</strong>{" "}
                      <span className="font-mono">{reviewCommittee.contactNumber}</span>
                    </p>
                    <p>
                      <strong className="text-rose-300">Email:</strong> {reviewCommittee.email}
                    </p>
                    <p>
                      <strong className="text-rose-300">Registered On:</strong>{" "}
                      {new Date(reviewCommittee.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="border-t border-amber-500/20 pt-4">
                  <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider mb-3">
                    Jury Evaluation & Ranking
                  </h4>

                  {evalMsg && (
                    <div
                      className={`p-3 rounded-xl mb-4 text-xs font-semibold ${
                        evalMsg.type === "success"
                          ? "bg-emerald-950/80 border border-emerald-400/50 text-emerald-200"
                          : "bg-red-950/80 border border-red-400/50 text-rose-200"
                      }`}
                    >
                      {evalMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleSaveEvaluation} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-rose-200 mb-1">
                        Select Status:
                      </label>
                      <select
                        value={evaluationForm.status}
                        onChange={(e) =>
                          setEvaluationForm({ ...evaluationForm, status: e.target.value })
                        }
                        className="w-full bg-[#140004] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="REGISTERED">Active / Registered</option>
                        <option value="SHORTLISTED">Shortlisted (Star Candidate)</option>
                        <option value="WINNER">Winner (Award Winner)</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-rose-200 mb-1">
                        Cleanliness Score (0 - 100):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={evaluationForm.score}
                        onChange={(e) =>
                          setEvaluationForm({ ...evaluationForm, score: e.target.value })
                        }
                        placeholder="e.g. 88.5"
                        className="w-full bg-[#140004] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-rose-200 mb-1">
                        Jury Notes & Remarks:
                      </label>
                      <textarea
                        rows={4}
                        value={evaluationForm.adminNotes}
                        onChange={(e) =>
                          setEvaluationForm({ ...evaluationForm, adminNotes: e.target.value })
                        }
                        placeholder="Add notes about pandal cleanliness, dustbin management, and post-visarjan road state..."
                        className="w-full bg-[#140004] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400 placeholder:text-rose-300/40"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingEval}
                      className="btn-gold w-full py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-slate-950"
                    >
                      {isSavingEval ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>💾 Save Evaluation</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 LIGHTBOX LARGE IMAGE VIEWER WITH DIRECT DOWNLOAD */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="flex items-center justify-between max-w-5xl mx-auto w-full pb-3 border-b border-amber-500/25">
            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold border ${
                  lightboxImage.phase === "DURING"
                    ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                    : "bg-emerald-400/20 text-emerald-300 border-emerald-400/40"
                }`}
              >
                {lightboxImage.phase === "DURING" ? "During Puja Photo" : "Post Clean-up Photo"}
              </span>
              <span className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md hidden sm:inline">
                {lightboxImage.originalFilename}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadImage(lightboxImage.id, lightboxImage.originalFilename)}
                className="btn-gold text-xs px-4 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow cursor-pointer text-slate-950"
              >
                <span>⬇️ Download Image</span>
              </button>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-lg border border-white/20 transition-all cursor-pointer"
                title="Close (Esc)"
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

          {/* Bottom Info Bar */}
          <div className="max-w-5xl mx-auto w-full pt-3 border-t border-amber-500/25 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-200/80">
            <div className="flex items-center gap-4">
              <span>📁 File: <strong className="text-white">{lightboxImage.originalFilename}</strong></span>
              <span>Size: <strong className="text-amber-300 font-mono">{(lightboxImage.sizeBytes / (1024 * 1024)).toFixed(2)} MB</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ⚙️ SYSTEM SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#240008] border-2 border-amber-400 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-amber-500/25">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <h3 className="text-lg font-bold text-white">System Configuration</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-rose-200 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {settingsMsg && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs font-semibold ${
                  settingsMsg.type === "success"
                    ? "bg-emerald-950/80 border border-emerald-400/50 text-emerald-200"
                    : "bg-red-950/80 border border-red-400/50 text-rose-200"
                }`}
              >
                {settingsMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              {/* Registration Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a0006] border border-amber-500/20">
                <div>
                  <span className="font-bold text-white block">New Registrations</span>
                  <span className="text-[11px] text-rose-200/60">Allow Puja Committee Sign-up</span>
                </div>
                <select
                  value={settingsForm.registration_open}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, registration_open: e.target.value })
                  }
                  className="bg-[#2d000b] border border-amber-500/40 rounded-lg px-2.5 py-1 text-white text-xs font-bold"
                >
                  <option value="true">Open</option>
                  <option value="false">Closed</option>
                </select>
              </div>

              {/* During Upload Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a0006] border border-amber-500/20">
                <div>
                  <span className="font-bold text-white block">During Puja Photo Uploads</span>
                  <span className="text-[11px] text-rose-200/60">During Puja Window</span>
                </div>
                <select
                  value={settingsForm.during_upload_open}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, during_upload_open: e.target.value })
                  }
                  className="bg-[#2d000b] border border-amber-500/40 rounded-lg px-2.5 py-1 text-white text-xs font-bold"
                >
                  <option value="true">Open</option>
                  <option value="false">Closed</option>
                </select>
              </div>

              {/* After Upload Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a0006] border border-amber-500/20">
                <div>
                  <span className="font-bold text-white block">After Puja Photo Uploads</span>
                  <span className="text-[11px] text-rose-200/60">Post Clean-up Window</span>
                </div>
                <select
                  value={settingsForm.after_upload_open}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, after_upload_open: e.target.value })
                  }
                  className="bg-[#2d000b] border border-amber-500/40 rounded-lg px-2.5 py-1 text-white text-xs font-bold"
                >
                  <option value="true">Open</option>
                  <option value="false">Closed</option>
                </select>
              </div>

              {/* Banner Text */}
              <div>
                <label className="block text-rose-200 font-semibold mb-1">
                  Top Announcement Banner Text:
                </label>
                <input
                  type="text"
                  value={settingsForm.announcement_banner_text}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, announcement_banner_text: e.target.value })
                  }
                  className="w-full bg-[#1a0006] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="btn-gold w-full py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer text-slate-950"
                >
                  {isSavingSettings ? "Saving..." : "💾 Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 Footer */}
      <footer className="bg-[#140004] border-t border-amber-500/20 py-4 px-4 text-center text-xs text-rose-200/60">
        © 2026 Clean Puja Award | Ei Samay Digital Team
      </footer>
    </div>
  );
}
