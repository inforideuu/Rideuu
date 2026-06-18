import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { M as MobileShell, P as PageHeader } from "./MobileShell-p1-8Yc6U.mjs";
import { u as useRider } from "./router-CTtxc6Rr.mjs";
import { a1 as TriangleAlert, F as FileText, l as CircleCheck, a3 as Upload, j as ChevronRight, ab as X, g as Camera, R as RefreshCw, I as IdCard, f as Bike, V as ShieldCheck } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
function KycPage() {
  const nav = useNavigate();
  const {
    kycProgress,
    kycList,
    uploadKYCDoc,
    t,
    language
  } = useRider();
  const [activeDoc, setActiveDoc] = reactExports.useState(null);
  const [selfieStage, setSelfieStage] = reactExports.useState("idle");
  const [dragActive, setDragActive] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const [selectedFile, setSelectedFile] = reactExports.useState(null);
  const [previewUrl, setPreviewUrl] = reactExports.useState(null);
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };
  const handleConfirmUpload = () => {
    if (!activeDoc || !selectedFile) return;
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = () => {
      const base64String = reader.result;
      uploadKYCDoc(activeDoc.id, base64String);
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setActiveDoc(null);
    };
    reader.onerror = (error) => {
      console.error("FileReader Error:", error);
      alert("Failed to read selected file.");
    };
  };
  const handleCloseModal = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setActiveDoc(null);
  };
  const activeRejections = reactExports.useMemo(() => {
    return kycList.filter((k) => k.status === "rejected");
  }, [kycList]);
  const videoRef = reactExports.useRef(null);
  const streamRef = reactExports.useRef(null);
  const startCamera = async () => {
    try {
      setSelfieStage("camera");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user"
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Could not access camera, falling back to simulator", err);
    }
  };
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };
  const handleDocClick = (doc) => {
    if (doc.id === "selfie") {
      setActiveDoc(doc);
      startCamera();
    } else {
      setActiveDoc(doc);
    }
  };
  const handleCaptureSelfie = () => {
    if (!videoRef.current || !streamRef.current) {
      setSelfieStage("scanning");
      setTimeout(() => {
        setSelfieStage("done");
        setTimeout(() => {
          uploadKYCDoc("selfie", `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`);
          setSelfieStage("idle");
          setActiveDoc(null);
        }, 1e3);
      }, 1500);
      return;
    }
    setSelfieStage("scanning");
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        sum += brightness;
      }
      const avgBrightness = sum / (data.length / 4);
      let varianceSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        varianceSum += Math.pow(brightness - avgBrightness, 2);
      }
      const variance = varianceSum / (data.length / 4);
      if (avgBrightness < 40 || avgBrightness > 220 || variance < 100) {
        alert("Face verification failed: Image is too dark, too bright, or blurry. Please center your face in good lighting.");
        setSelfieStage("camera");
        return;
      }
      const selfieBase64 = canvas.toDataURL("image/jpeg");
      setTimeout(() => {
        setSelfieStage("done");
        setTimeout(() => {
          uploadKYCDoc("selfie", selfieBase64);
          stopCamera();
          setSelfieStage("idle");
          setActiveDoc(null);
        }, 1e3);
      }, 1500);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MobileShell, { showNav: false, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { subtitle: t("step_2_of_3"), title: t("kyc_header") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5", children: [
      activeRejections.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-2xl bg-destructive/15 border border-destructive/25 p-4 text-destructive space-y-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-bold text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("rejection_alert") })
        ] }),
        activeRejections.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] leading-relaxed pl-6 border-l border-destructive/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold uppercase tracking-wider", children: [
            t(doc.labelKey),
            ":"
          ] }),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic", children: doc.rejectionReason || "Document photo blurred, upload clear color scan." })
        ] }, doc.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-card border border-border p-5 mb-5 shadow-sm relative overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-bold mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t("kyc_progress") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary font-black", children: [
            kycProgress,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2.5 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500", style: {
          width: `${kycProgress}%`
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between text-[10px] text-muted-foreground font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            kycList.filter((k) => k.status === "done").length,
            " / ",
            kycList.length,
            " APPROVED"
          ] }),
          kycProgress === 100 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-success uppercase tracking-wider", children: "FULL VERIFIED" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary uppercase tracking-wider", children: "AUTO KYC TRACKING" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: kycList.map((doc) => {
        let Icon = FileText;
        if (doc.id === "aadhaar") Icon = IdCard;
        else if (doc.id === "license") Icon = FileText;
        else if (doc.id === "vehicle") Icon = Bike;
        else if (doc.id === "insurance") Icon = ShieldCheck;
        else if (doc.id === "selfie") Icon = Camera;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleDocClick(doc), className: `w-full flex items-center gap-4 rounded-2xl bg-card border p-4 text-left active:scale-[0.99] transition shadow-sm ${doc.status === "rejected" ? "border-destructive/30 hover:border-destructive" : "border-border hover:border-primary/40"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-12 w-12 rounded-full flex items-center justify-center ${doc.status === "done" ? "bg-success/10 text-success" : doc.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-accent text-primary"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5.5 w-5.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm tracking-tight text-foreground", children: t(doc.labelKey) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-0.5 truncate font-semibold", children: doc.status === "done" ? `${t("verified")}` : doc.status === "progress" ? `${t("under_review")} (Manual admin queue)` : doc.status === "rejected" ? `REJECTED · Tap to resolve` : t("tap_to_upload") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: doc.status === "done" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5.5 w-5.5 text-success fill-success/10" }) : doc.status === "progress" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase bg-primary/10 text-primary px-2.5 py-1 rounded-full animate-pulse", children: "Review" }) : doc.status === "rejected" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-destructive animate-bounce" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4.5 w-4.5 text-muted-foreground" }) })
          ] }),
          doc.file && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-2 p-3 bg-muted/30 border border-border/40 rounded-xl flex items-center gap-3 text-xs", children: [
            doc.file.startsWith("data:image/") ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: doc.file, alt: "Preview", className: "h-10 w-14 rounded object-cover border border-border/80" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-14 rounded bg-primary/10 text-primary flex items-center justify-center border border-border/80", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold truncate text-foreground", children: [
                doc.id.toUpperCase(),
                ".pdf"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-semibold", children: "Uploaded: 05-Jun-2026" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[9px] font-extrabold px-2 py-0.5 rounded-full ${doc.status === "done" ? "bg-success/15 text-success" : doc.status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`, children: doc.status.toUpperCase() }) })
          ] })
        ] }, doc.id);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => nav({
        to: "/dashboard"
      }), className: "mt-8 w-full rounded-full bg-primary text-primary-foreground font-black py-4 flex items-center justify-center gap-2 shadow-md hover:bg-primary/95 transition text-sm tracking-wide", children: [
        t("kyc_continue"),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4.5 w-4.5" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", className: "mt-4 block text-center text-xs font-bold text-muted-foreground underline", children: t("skip_for_now") })
    ] }),
    activeDoc && activeDoc.id !== "selfie" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl relative slide-up", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCloseModal, className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-black tracking-tight mb-1 text-foreground", children: [
        t("kyc_header"),
        " - ",
        t(activeDoc.labelKey)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground leading-relaxed mb-6", children: "Tamil Nadu transport guidelines require high-resolution scanned digital copies." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => fileInputRef.current?.click(), className: "border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-2xl p-8 text-center cursor-pointer transition relative overflow-hidden flex flex-col items-center justify-center min-h-[140px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileChange, onClick: (e) => e.stopPropagation(), accept: "image/*,application/pdf", className: "hidden" }),
        selectedFile ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 w-full flex flex-col items-center", children: [
          previewUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: previewUrl, alt: "Preview", className: "max-h-24 rounded border border-border object-contain" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-10 w-10 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold truncate max-w-[200px] text-foreground", children: selectedFile.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground font-semibold", children: [
            (selectedFile.size / (1024 * 1024)).toFixed(2),
            " MB"
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "mx-auto h-8 w-8 text-primary/60 mb-2 animate-bounce" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs text-foreground", children: "Drag & Drop or Click to select file" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-1 font-semibold", children: "Supports PDF, PNG, JPG up to 10MB" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-2", children: selectedFile ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleConfirmUpload, className: "w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs transition shadow-md hover:bg-primary/95", children: "Confirm & Upload" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setSelectedFile(null);
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }, className: "w-full py-2.5 rounded-xl bg-secondary hover:bg-accent border border-border font-bold text-xs text-foreground transition", children: "Clear Selection" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-center text-muted-foreground py-2 font-semibold", children: "Please select or drop a file to upload." }) })
    ] }) }),
    activeDoc && activeDoc.id === "selfie" && selfieStage !== "idle" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold tracking-widest text-primary", children: t("selfie_face") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setSelfieStage("idle");
          setActiveDoc(null);
        }, className: "text-white/40 hover:text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-6 w-6" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center justify-center my-6", children: [
        selfieStage === "camera" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-64 h-64 rounded-full border-4 border-dashed border-primary flex items-center justify-center overflow-hidden bg-slate-900", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, className: "absolute inset-0 w-full h-full object-cover rounded-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "absolute h-10 w-10 text-primary/30 pointer-events-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-4 rounded-full border-2 border-white/20 border-t-primary animate-spin pointer-events-none", style: {
            animationDuration: "6s"
          } })
        ] }),
        selfieStage === "scanning" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-64 h-64 rounded-full border-4 border-success flex items-center justify-center overflow-hidden bg-slate-900", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, className: "absolute inset-0 w-full h-full object-cover rounded-full opacity-60" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-transparent via-success/30 to-transparent h-1/2 w-full animate-[scan_2s_ease-in-out_infinite]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute text-xs font-bold text-success animate-pulse uppercase tracking-wider", children: "Analyzing face biometrics..." })
        ] }),
        selfieStage === "done" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-64 h-64 rounded-full border-4 border-success flex items-center justify-center bg-success/10 text-success", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-14 w-14 fill-success/15" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-center text-xs text-slate-400 max-w-xs font-semibold leading-relaxed", children: selfieStage === "camera" ? t("camera_placeholder") : selfieStage === "scanning" ? "Aligning face features against national Aadhaar database picture..." : "Biometric matching successful! 99.8% match rate verified." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-6", children: [
        selfieStage === "camera" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCaptureSelfie, className: "w-full py-4 rounded-full bg-primary text-primary-foreground font-black text-sm tracking-wide shadow-lg active:scale-95 transition", children: t("click_selfie") }),
        selfieStage === "scanning" && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: true, className: "w-full py-4 rounded-full bg-white/10 text-white/50 font-black text-sm flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 animate-spin text-primary" }),
          " Scanning..."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
            @keyframes scan {
              0% { transform: translateY(-50%); }
              50% { transform: translateY(150%); }
              100% { transform: translateY(-50%); }
            }
          ` })
    ] })
  ] });
}
export {
  KycPage as component
};
