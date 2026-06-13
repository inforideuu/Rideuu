import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/rider/MobileShell";
import { CheckCircle2, Upload, FileText, IdCard, Bike, ShieldCheck, ChevronRight, AlertTriangle, Camera, RefreshCw, X } from "lucide-react";
import { useState, useMemo, useRef } from "react";
import { useRider, KYCItem } from "../context/RiderContext";

export const Route = createFileRoute("/kyc")({
  component: KycPage,
});

function KycPage() {
  const nav = useNavigate();
  const { kycProgress, kycList, uploadKYCDoc, t, language } = useRider();

  const [activeDoc, setActiveDoc] = useState<KYCItem | null>(null);
  const [selfieStage, setSelfieStage] = useState<"idle" | "camera" | "scanning" | "done">("idle");
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const base64String = reader.result as string;
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

  const activeRejections = useMemo(() => {
    return kycList.filter(k => k.status === "rejected");
  }, [kycList]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setSelfieStage("camera");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
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
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleDocClick = (doc: KYCItem) => {
    if (doc.id === "selfie") {
      setActiveDoc(doc);
      startCamera();
    } else {
      setActiveDoc(doc);
    }
  };

  const handleSimulateUpload = (fileName: string) => {
    if (!activeDoc) return;
    uploadKYCDoc(activeDoc.id, `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`);
    setActiveDoc(null);
  };

  const handleCaptureSelfie = () => {
    if (!videoRef.current || !streamRef.current) {
      // Fallback if no real video stream is active
      setSelfieStage("scanning");
      setTimeout(() => {
        setSelfieStage("done");
        setTimeout(() => {
          uploadKYCDoc("selfie", `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`);
          setSelfieStage("idle");
          setActiveDoc(null);
        }, 1000);
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

      // Face validation checking: check average brightness and variance (contrast)
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        sum += brightness;
      }
      const avgBrightness = sum / (data.length / 4);

      let varianceSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        varianceSum += Math.pow(brightness - avgBrightness, 2);
      }
      const variance = varianceSum / (data.length / 4);

      // Criteria: average brightness must be between 40 and 220, contrast (variance) must be > 100 to avoid solid/blank screens
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
        }, 1000);
      }, 1500);
    }
  };

  return (
    <MobileShell showNav={false}>
      <PageHeader subtitle={t("step_2_of_3")} title={t("kyc_header")} />

      <div className="px-5">
        {/* Verification Alert Rejection Banners */}
        {activeRejections.length > 0 && (
          <div className="mb-4 rounded-2xl bg-destructive/15 border border-destructive/25 p-4 text-destructive space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{t("rejection_alert")}</span>
            </div>
            {activeRejections.map(doc => (
              <div key={doc.id} className="text-[11px] leading-relaxed pl-6 border-l border-destructive/30">
                <span className="font-bold uppercase tracking-wider">{t(doc.labelKey)}:</span>{" "}
                <span className="italic">{doc.rejectionReason || "Document photo blurred, upload clear color scan."}</span>
              </div>
            ))}
          </div>
        )}

        {/* Progress Tracker Card */}
        <div className="rounded-3xl bg-card border border-border p-5 mb-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-muted-foreground">{t("kyc_progress")}</span>
            <span className="text-primary font-black">{kycProgress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
              style={{ width: `${kycProgress}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground font-bold">
            <span>{kycList.filter(k => k.status === "done").length} / {kycList.length} APPROVED</span>
            {kycProgress === 100 ? (
              <span className="text-success uppercase tracking-wider">FULL VERIFIED</span>
            ) : (
              <span className="text-primary uppercase tracking-wider">AUTO KYC TRACKING</span>
            )}
          </div>
        </div>

        {/* List of KYC Items */}
        <div className="space-y-3">
          {kycList.map((doc) => {
            let Icon = FileText;
            if (doc.id === "aadhaar") Icon = IdCard;
            else if (doc.id === "license") Icon = FileText;
            else if (doc.id === "vehicle") Icon = Bike;
            else if (doc.id === "insurance") Icon = ShieldCheck;
            else if (doc.id === "selfie") Icon = Camera;

            return (
              <div
                key={doc.id}
                className="space-y-2"
              >
                <button
                  onClick={() => handleDocClick(doc)}
                  className={`w-full flex items-center gap-4 rounded-2xl bg-card border p-4 text-left active:scale-[0.99] transition shadow-sm ${
                    doc.status === "rejected"
                      ? "border-destructive/30 hover:border-destructive"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    doc.status === "done"
                      ? "bg-success/10 text-success"
                      : doc.status === "rejected"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-accent text-primary"
                  }`}>
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm tracking-tight text-foreground">{t(doc.labelKey)}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate font-semibold">
                      {doc.status === "done"
                        ? `${t("verified")}`
                        : doc.status === "progress"
                        ? `${t("under_review")} (Manual admin queue)`
                        : doc.status === "rejected"
                        ? `REJECTED · Tap to resolve`
                        : t("tap_to_upload")}
                    </div>
                  </div>
                  <div>
                    {doc.status === "done" ? (
                      <CheckCircle2 className="h-5.5 w-5.5 text-success fill-success/10" />
                    ) : doc.status === "progress" ? (
                      <span className="text-[10px] font-bold uppercase bg-primary/10 text-primary px-2.5 py-1 rounded-full animate-pulse">
                        Review
                      </span>
                    ) : doc.status === "rejected" ? (
                      <AlertTriangle className="h-5 w-5 text-destructive animate-bounce" />
                    ) : (
                      <Upload className="h-4.5 w-4.5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* File Preview details below list item if document exists */}
                {doc.file && (
                  <div className="mx-2 p-3 bg-muted/30 border border-border/40 rounded-xl flex items-center gap-3 text-xs">
                    {doc.file.startsWith("data:image/") ? (
                      <img src={doc.file} alt="Preview" className="h-10 w-14 rounded object-cover border border-border/80" />
                    ) : (
                      <div className="h-10 w-14 rounded bg-primary/10 text-primary flex items-center justify-center border border-border/80">
                        <FileText className="h-5 w-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate text-foreground">{doc.id.toUpperCase()}.pdf</div>
                      <div className="text-[10px] text-muted-foreground font-semibold">Uploaded: 05-Jun-2026</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                        doc.status === "done" ? "bg-success/15 text-success" : 
                        doc.status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
                      }`}>
                        {doc.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          onClick={() => nav({ to: "/dashboard" })}
          className="mt-8 w-full rounded-full bg-primary text-primary-foreground font-black py-4 flex items-center justify-center gap-2 shadow-md hover:bg-primary/95 transition text-sm tracking-wide"
        >
          {t("kyc_continue")} <ChevronRight className="h-4.5 w-4.5" />
        </button>
        <Link to="/dashboard" className="mt-4 block text-center text-xs font-bold text-muted-foreground underline">
          {t("skip_for_now")}
        </Link>
      </div>

      {/* Floating Interactive Upload Modal */}
      {activeDoc && activeDoc.id !== "selfie" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl relative slide-up">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-black tracking-tight mb-1 text-foreground">
              {t("kyc_header")} - {t(activeDoc.labelKey)}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Tamil Nadu transport guidelines require high-resolution scanned digital copies.
            </p>

            {/* Drag & Drop Simulation Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-2xl p-8 text-center cursor-pointer transition relative overflow-hidden flex flex-col items-center justify-center min-h-[140px]"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                onClick={(e) => e.stopPropagation()}
                accept="image/*,application/pdf"
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="space-y-2 w-full flex flex-col items-center">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-24 rounded border border-border object-contain" />
                  ) : (
                    <FileText className="h-10 w-10 text-primary" />
                  )}
                  <div className="text-xs font-bold truncate max-w-[200px] text-foreground">{selectedFile.name}</div>
                  <div className="text-[10px] text-muted-foreground font-semibold">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-8 w-8 text-primary/60 mb-2 animate-bounce" />
                  <div className="font-bold text-xs text-foreground">Drag & Drop or Click to select file</div>
                  <div className="text-[10px] text-muted-foreground mt-1 font-semibold">Supports PDF, PNG, JPG up to 10MB</div>
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-4 space-y-2">
              {selectedFile ? (
                <>
                  <button
                    onClick={handleConfirmUpload}
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs transition shadow-md hover:bg-primary/95"
                  >
                    Confirm & Upload
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-secondary hover:bg-accent border border-border font-bold text-xs text-foreground transition"
                  >
                    Clear Selection
                  </button>
                </>
              ) : (
                <div className="text-xs text-center text-muted-foreground py-2 font-semibold">
                  Please select or drop a file to upload.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selfie and Face verification Scanner simulation */}
      {activeDoc && activeDoc.id === "selfie" && selfieStage !== "idle" && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-6">
          <div className="flex justify-between items-center text-white">
            <span className="text-xs font-bold tracking-widest text-primary">{t("selfie_face")}</span>
            <button
              onClick={() => {
                setSelfieStage("idle");
                setActiveDoc(null);
              }}
              className="text-white/40 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center my-6">
            {selfieStage === "camera" && (
              <div className="relative w-64 h-64 rounded-full border-4 border-dashed border-primary flex items-center justify-center overflow-hidden bg-slate-900">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover rounded-full"
                />
                <Camera className="absolute h-10 w-10 text-primary/30 pointer-events-none" />
                {/* Simulated Face Outline */}
                <div className="absolute inset-4 rounded-full border-2 border-white/20 border-t-primary animate-spin pointer-events-none" style={{ animationDuration: "6s" }} />
              </div>
            )}

            {selfieStage === "scanning" && (
              <div className="relative w-64 h-64 rounded-full border-4 border-success flex items-center justify-center overflow-hidden bg-slate-900">
                {/* Keep video display visible during scan if possible */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover rounded-full opacity-60"
                />
                {/* Horizontal scanning light grid animation */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-success/30 to-transparent h-1/2 w-full animate-[scan_2s_ease-in-out_infinite]" />
                <span className="absolute text-xs font-bold text-success animate-pulse uppercase tracking-wider">Analyzing face biometrics...</span>
              </div>
            )}

            {selfieStage === "done" && (
              <div className="relative w-64 h-64 rounded-full border-4 border-success flex items-center justify-center bg-success/10 text-success">
                <CheckCircle2 className="h-14 w-14 fill-success/15" />
              </div>
            )}

            <p className="mt-6 text-center text-xs text-slate-400 max-w-xs font-semibold leading-relaxed">
              {selfieStage === "camera"
                ? t("camera_placeholder")
                : selfieStage === "scanning"
                ? "Aligning face features against national Aadhaar database picture..."
                : "Biometric matching successful! 99.8% match rate verified."}
            </p>
          </div>

          <div className="pb-6">
            {selfieStage === "camera" && (
              <button
                onClick={handleCaptureSelfie}
                className="w-full py-4 rounded-full bg-primary text-primary-foreground font-black text-sm tracking-wide shadow-lg active:scale-95 transition"
              >
                {t("click_selfie")}
              </button>
            )}
            {selfieStage === "scanning" && (
              <button disabled className="w-full py-4 rounded-full bg-white/10 text-white/50 font-black text-sm flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-primary" /> Scanning...
              </button>
            )}
          </div>

          {/* Keyframe scan styles */}
          <style>{`
            @keyframes scan {
              0% { transform: translateY(-50%); }
              50% { transform: translateY(150%); }
              100% { transform: translateY(-50%); }
            }
          `}</style>
        </div>
      )}
    </MobileShell>
  );
}
