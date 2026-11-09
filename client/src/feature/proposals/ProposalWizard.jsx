// src/pages/ProposalWizard.jsx
import { useEffect, useState, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { proposalSchema } from "@/schemas/proposalSchema";
import { calculateFee } from "./proposal.utils";
import {
    SectionAForm,
    SectionBForm,
    SectionCForm,
    SectionDForm,
    SectionEForm,
    SectionFForm,
    SectionGForm,
} from "./forms/Forms";
import api from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    MessageSquare,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Check,
    Loader2,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ─── Steps ────────────────────────────────────────────────────────────────────
const steps = [
    {
        id: "A",
        title: "Basic Information & Funding",
        shortTitle: "Section A",
        subtitle: "Administrative Details · Funding Details & Budget",
        component: SectionAForm,
    },
    {
        id: "B",
        title: "Research Overview & Methodology",
        shortTitle: "Section B",
        subtitle: "Overview of Research · Methodology",
        component: SectionBForm,
    },
    {
        id: "C",
        title: "Participants, Risks & Consent",
        shortTitle: "Section C",
        subtitle: "Recruitment · Benefits & Risks · Informed Consent · Payment · Storage",
        component: SectionCForm,
    },
    {
        id: "D",
        title: "Publication & IPR",
        shortTitle: "Section D",
        subtitle: "Publication · Benefit Sharing · IPR Issues",
        component: SectionDForm,
    },
    {
        id: "E",
        title: "Declaration",
        shortTitle: "Section E",
        subtitle: "Declaration by Investigators",
        component: SectionEForm,
    },
    {
        id: "F",
        title: "Checklist",
        shortTitle: "Checklist",
        subtitle: "Document Submission Checklist",
        component: SectionFForm,
    },
    {
        id: "G",
        title: "Fees & Payment",
        shortTitle: "Section G",
        subtitle: "Fees Calculation · Payment Workflow",
        component: SectionGForm,
    },
];

// ─── Default form values ───────────────────────────────────────────────────────
const DEFAULT_VALUES = {
    sectionA: {
        typeOfResearch: [],
        typeOfReviewRequested: "",
        titleOfTheStudy: "",
        durationOfStudy: "",
        investigators: [],
    },
    sectionB: { fundingSource: [] },
    sectionC: { typeOfStudy: [] },
    sectionD: {
        externalLabInvolved: "",
        scientificQualityAssessment: [],
    },
    sectionE: {
        participantTypes: [],
        recruitmentMethods: [],
        vulnerablePersonsInvolved: "",
        vulnerableGroupTypes: [],
        reimbursement: "",
        reimbursementType: [],
        incentives: "",
        incentivesType: [],
        piRecruitmentFees: "",
        piRecruitmentFeesType: [],
    },
    sectionBR: {
        hasRisks: "",
        riskLevel: "",
        adverseEventsExpected: "",
        reportingProceduresDescribed: "",
    },
    sectionIC: {
        waiverOfConsent: "",
        consentTypes: [],
        consentForChildren: [],
        consentObtainedBy: [],
        pisLanguages: [],
        icfElements: [],
    },
    sectionSC: {
        studyInvolvesData: "",
        identifyingInfoType: [],
        futureSamplesUse: "",
    },
    sectionPub: {},
    sectionDecl: {},
    checklist: {},
    checklistFiles: {},
    sectionG: {
        paymentStatus: "Pending",
        paymentMethod: "None",
        isVerified: false
    }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalizes a 401/403 axios error into a user-friendly message.
 * Returns null for all other error types so callers can decide what to show.
 */
function getAuthErrorMessage(error) {
    const status = error?.response?.status;
    if (status === 401) return "Your session has expired. Please log in again.";
    if (status === 403) return "You do not have permission to perform this action.";
    return null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProposalWizard() {
    const { id: urlProposalId } = useParams();
    const navigate = useNavigate();

    const [proposalId, setProposalId] = useState(urlProposalId || null);
    const [proposalData, setProposalData] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);

    // Fine-grained loading states so the UI gives clear feedback
    const [isLoadingProposal, setIsLoadingProposal] = useState(!!urlProposalId);
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const methods = useForm({
        resolver: zodResolver(proposalSchema),
        defaultValues: DEFAULT_VALUES,
    });

    const { handleSubmit, setValue, getValues, reset, clearErrors } = methods;

    // ── Load existing proposal ────────────────────────────────────────────────
    useEffect(() => {
        if (!urlProposalId) return;

        setIsLoadingProposal(true);
        api
            .get(`/proposals/${urlProposalId}`)
            .then((res) => {
                const data = res.data;
                // Normalize ISO date strings for <input type="date">
                if (data.administrative?.dateOfSubmission) {
                    data.administrative.dateOfSubmission =
                        data.administrative.dateOfSubmission.split("T")[0];
                }
                setProposalData(data);
                reset(data);
                setProposalId(data._id);
            })
            .catch((err) => {
                const authMsg = getAuthErrorMessage(err);
                if (authMsg) {
                    // The axios interceptor will redirect; just show a toast
                    toast.error(authMsg);
                } else {
                    toast.error("Failed to load proposal. Please try again.");
                }
            })
            .finally(() => setIsLoadingProposal(false));
    }, [urlProposalId, reset]);

    // ── Ensure a proposal document exists in the backend ─────────────────────
    /**
     * Returns an existing proposalId OR creates a new draft and returns its id.
     * Throws on validation failure or network/auth error so callers can abort.
     */
    const ensureProposalId = useCallback(
        async (shouldRedirectUrl = false) => {
            if (proposalId) return proposalId;

            const currentData = getValues();
            const title = currentData.sectionA?.titleOfTheStudy?.trim();
            if (!title) {
                const msg = "Study Title is required before saving";
                toast.error(msg, {
                    description: "Please enter the 'Title of the Study' in Section A first."
                });
                setCurrentStep(0); 
                setTimeout(() => {
                    const el = document.querySelector('[name="sectionA.titleOfTheStudy"]');
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.focus();
                    }
                }, 100);
                throw new Error(msg);
            }

            const res = await api.post("/proposals/draft", {
                ...currentData,
                status: "draft",
                administrative: {
                    ...currentData.administrative,
                    studyTitle: title,
                },
            });

            const newId = res.data._id;
            setProposalId(newId);

            if (shouldRedirectUrl) {
                navigate(`/proposals/${newId}/edit`, { replace: true });
            }

            return newId;
        },
        [proposalId, getValues, navigate, setCurrentStep]
    );

    // ── Razorpay Integration ──────────────────────────────────────────────────
    useEffect(() => {
        const handleRazorpayTrigger = async () => {
            try {
                // IMPORTANT: Do NOT redirect during order creation as it unmounts the wizard
                const realId = await ensureProposalId(false); 
                const orderResponse = await api.post(`/proposals/${realId}/create-order`);
                const orderData = orderResponse.data;

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                    amount: orderData.amount,
                    currency: "INR",
                    name: "IEC Connect",
                    description: "Ethical Review Fee",
                    order_id: orderData.id,
                    handler: async (response) => {
                        try {
                            const verifyRes = await api.post(`/proposals/${realId}/verify-payment`, {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            });
                            
                            if (verifyRes.data.proposal) {
                                // Sync the new proposal data
                                reset(verifyRes.data.proposal);
                                setProposalData(verifyRes.data.proposal);
                                setProposalId(verifyRes.data.proposal._id);
                                
                                toast.success("Payment Successful!", {
                                    description: "Your payment has been verified automatically and your status is updated."
                                });

                                // If this was a "new" proposal (/proposals/new), switch to the "edit" URL (/proposals/ID/Edit)
                                // so that page refreshes don't lose the draft ID.
                                if (!urlProposalId) {
                                    navigate(`/proposals/${verifyRes.data.proposal._id}/edit`, { replace: true });
                                }
                            }
                        } catch {
                            toast.error("Payment Verification Failed", {
                                description: "Something went wrong. Please contact support."
                            });
                        }
                    },
                    prefill: {
                        name: getValues("sectionA.nameOfPrincipalInvestigator") || "",
                        email: "", // User email could be added here
                    },
                    theme: { color: "#2563eb" },
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            } catch (err) {
                console.error("Razorpay error:", err);
                toast.error("Failed to initiate payment. Please try again.");
            }
        };

        window.addEventListener('triggerRazorpay', handleRazorpayTrigger);
        return () => window.removeEventListener('triggerRazorpay', handleRazorpayTrigger);
    }, [ensureProposalId, getValues, reset, navigate, urlProposalId]);


    // ── Save / update draft ───────────────────────────────────────────────────
    /**
     * Returns true on success, false on any failure.
     * Never throws — safe to call from navigation handlers.
     */
    const saveOrUpdateDraft = useCallback(
        async (shouldRedirectUrl = false) => {
            const title = getValues("sectionA.titleOfTheStudy")?.trim();
            if (!title) {
                toast.error("Study Title is required before saving", {
                    description: "Please complete the title field in Section A."
                });
                setCurrentStep(0);
                setTimeout(() => {
                    const el = document.querySelector('[name="sectionA.titleOfTheStudy"]');
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.focus();
                    }
                }, 100);
                return false;
            }

            setIsSaving(true);
            try {
                const data = getValues();
                const id = await ensureProposalId(shouldRedirectUrl);

                await api.put(`/proposals/${id}`, {
                    ...data,
                    administrative: {
                        ...data.administrative,
                        studyTitle: title,
                    },
                });

                toast.success(
                    shouldRedirectUrl
                        ? "Draft saved — returning to dashboard"
                        : "Draft saved"
                );
                return true;
            } catch (err) {
                const authMsg = getAuthErrorMessage(err);
                if (authMsg) {
                    toast.error(authMsg);
                    // The axios interceptor handles redirect; we just bail out
                } else if (err.message !== "Study Title is required before saving") {
                    toast.error("Failed to save draft. Please try again.");
                    console.error("Draft save error:", err);
                }
                return false;
            } finally {
                setIsSaving(false);
            }
        },
        [getValues, ensureProposalId, setCurrentStep]
    );

    // ── File upload ───────────────────────────────────────────────────────────
    const handleFileUpload = useCallback(
        async (e, fieldPath) => {
            const file = e.target.files?.[0];

            if (!file) return;

            if (file.type !== "application/pdf") {
                toast.error("Only PDF files are allowed");
                // Reset the input so the user can try again
                e.target.value = "";
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size must be under 10 MB");
                e.target.value = "";
                return;
            }

            setIsUploading(true);
            try {
                const realId = await ensureProposalId();

                const formData = new FormData();
                formData.append("file", file);
                formData.append("field", fieldPath);

                const res = await api.post(
                    `/proposals/${realId}/upload`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                setValue(fieldPath, res.data.fileUrl, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                if (clearErrors) clearErrors(fieldPath);
                if (fieldPath === "sectionG.receiptUrl") {
                    // Sync with Section F checklist item 6
                    setValue("checklistFiles.item_6", res.data.fileUrl, { shouldValidate: true, shouldDirty: true });
                    setValue("checklist.yn_6", "Yes", { shouldDirty: true });
                    
                    setValue("sectionG.paymentStatus", "Paid", { shouldDirty: true });
                    setValue("sectionG.paymentMethod", "Manual", { shouldDirty: true });
                    setValue("sectionG.transactionId", "MANUAL_" + Date.now().toString().slice(-6), { shouldDirty: true });
                    setValue("sectionG.isVerified", false, { shouldDirty: true });
                }
                toast.success("File uploaded successfully");
            } catch (err) {
                const authMsg = getAuthErrorMessage(err);
                if (authMsg) {
                    toast.error(authMsg);
                } else if (err.response?.status === 413) {
                    toast.error("File too large — the server rejected it");
                } else if (err.message !== "Study Title is required before saving") {
                    toast.error("Upload failed. Please try again.");
                    console.error("Upload error:", err);
                }
                // Reset input so the user can retry
                e.target.value = "";
            } finally {
                setIsUploading(false);
            }
        },
        [ensureProposalId, setValue, clearErrors]
    );

    // ── Derived state — MUST be declared before any useCallback that references
    //    these values, otherwise they are in the Temporal Dead Zone (TDZ) when
    //    the callbacks close over them during the first render, causing:
    //    "ReferenceError: Cannot access 'isEditable' before initialization"
    // ─────────────────────────────────────────────────────────────────────────
    const isRevision = proposalData?.status === "revision_required";
    const isReturned = proposalData?.status === "returned";
    const isEditable =
        !proposalData?.status ||
        ["draft", "returned", "revision_required", "fees_pending", "withdrawn"].includes(proposalData.status);

    const StepComponent = steps[currentStep].component;
    const isBusy = isSaving || isSubmitting || isUploading;

    // ── Step navigation ───────────────────────────────────────────────────────
    const nextStep = useCallback(async () => {
        if (isEditable) {
            const saved = await saveOrUpdateDraft(false);
            if (saved) setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
        } else {
            setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
        }
    }, [isEditable, saveOrUpdateDraft]);

    const prevStep = useCallback(() => {
        setCurrentStep((s) => Math.max(s - 1, 0));
    }, []);

    // ── Final submission ──────────────────────────────────────────────────────
    const handleFinalSubmit = useCallback(() => {
        handleSubmit(
            async () => {
                try {
                    const realId = await ensureProposalId();
                    const allData = getValues();

                    // ── Workflow Control: Fees & Payment ──
                    const researchTypes = allData.sectionA?.typeOfResearch || [];
                    const feeAmount = calculateFee(researchTypes);
                    
                    if (feeAmount > 0) {
                        const allData = getValues();
                        const paymentStatus = allData.sectionG?.paymentStatus;
                        const receiptUrl = allData.sectionG?.receiptUrl;
                        const isVerified = allData.sectionG?.isVerified;
                        const paymentMethod = allData.sectionG?.paymentMethod;

                        const isPaidOrVerified = paymentStatus === "Verified" || paymentStatus === "Paid" || isVerified || !!receiptUrl;

                        if (!isPaidOrVerified) {
                            toast.error("Submission Blocked", {
                                description: "For research types requiring fees, payment must be completed (Razorpay) or a receipt must be uploaded (Manual) before final submission."
                            });
                            setCurrentStep(steps.length - 1); // Move to Section G
                            return;
                        }

                        // Only require receiptUrl if it's NOT a Razorpay payment
                        if (paymentMethod !== "Razorpay" && !receiptUrl) {
                            toast.error("Receipt Required", {
                                description: "Please upload the payment receipt in Section G for manual payments."
                            });
                            setCurrentStep(steps.length - 1);
                            return;
                        }
                    }

                    setIsSubmitting(true);
                    
                    // ⚠️ CRITICAL: Save ALL current form data to DB before submitting
                    await api.put(`/proposals/${realId}`, {
                        ...allData,
                        administrative: {
                            ...allData.administrative,
                            studyTitle: allData.sectionA?.titleOfTheStudy?.trim(),
                        },
                    });

                    // Now change the status to submitted
                    await api.post(`/proposals/${realId}/submit`);
                    toast.success("Proposal submitted successfully!");
                    navigate("/dashboard");
                } catch (err) {
                    const authMsg = getAuthErrorMessage(err);
                    if (authMsg) {
                        toast.error(authMsg);
                    } else if (err.message !== "Study Title is required before saving") {
                        toast.error("Submission failed — please try again.");
                        console.error("Submit error:", err);
                    }
                } finally {
                    setIsSubmitting(false);
                }
            },
            (validationErrors) => {
                toast.error("Please fix the highlighted errors before submitting", {
                    description: "Check the red messages in the form",
                });
                const firstKey = Object.keys(validationErrors)[0];
                if (firstKey) {
                    const el = document.querySelector(`[name^="${firstKey}"]`);
                    if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                        el.focus();
                    }
                }
            }
        )();
    }, [handleSubmit, ensureProposalId, getValues, navigate]);

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (isLoadingProposal) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
                <div className="h-8 w-64 bg-slate-200 rounded-lg" />
                <div className="h-4 w-48 bg-slate-100 rounded" />
                <div className="pastel-card h-24 rounded-2xl bg-slate-100" />
                <div className="pastel-card h-96 rounded-2xl bg-slate-100" />
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* ── Page title ── */}
            <div>
                <h1 className="text-2xl font-bold text-[#3d3654]">
                    {proposalId ? "Edit Proposal" : "New Proposal Submission"}
                </h1>
                <p className="text-sm text-[#7c73a0] mt-1">
                    Step {currentStep + 1} of {steps.length} — {steps[currentStep].title}
                </p>
                <p className="text-xs text-[#a09ac0] mt-0.5">
                    {steps[currentStep].subtitle}
                </p>
            </div>

            {/* ── 6-step progress bar ── */}
            <div className="pastel-card px-6 py-5 space-y-4">
                <div className="flex items-center w-full">
                    {steps.map((step, i) => {
                        const isCompleted = i < currentStep;
                        const isActive = i === currentStep;
                        const isLast = i === steps.length - 1;

                        return (
                            <div key={step.id} className="flex items-center flex-1 min-w-0">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(i)}
                                    disabled={isBusy}
                                    className="flex flex-col items-center gap-1.5 group shrink-0 disabled:pointer-events-none"
                                >
                                    <div
                                        className={`
                                            w-10 h-10 rounded-full flex items-center justify-center
                                            text-sm font-bold transition-all duration-300
                                            ${isCompleted
                                                ? "bg-gradient-to-br from-[#a78bfa] to-[#8b7cf6] text-white shadow-md shadow-[#c4b8ff]/40"
                                                : isActive
                                                    ? "bg-gradient-to-br from-[#a78bfa] to-[#8b7cf6] text-white shadow-lg shadow-[#c4b8ff]/50 ring-4 ring-[#ede9ff]"
                                                    : "bg-[#f8f7ff] border-2 border-[#e5e1ff] text-[#a09ac0] group-hover:border-[#c4b8ff] group-hover:text-[#8b7cf6]"
                                            }
                                        `}
                                    >
                                        {isCompleted
                                            ? <Check className="h-4 w-4" strokeWidth={3} />
                                            : <span>{step.id}</span>
                                        }
                                    </div>
                                    <span
                                        className={`
                                            text-[10px] font-semibold leading-tight text-center whitespace-nowrap
                                            transition-colors duration-200
                                            ${isActive
                                                ? "text-[#8b7cf6]"
                                                : isCompleted
                                                    ? "text-[#7c3aed]"
                                                    : "text-[#a09ac0] group-hover:text-[#7c73a0]"
                                            }
                                        `}
                                    >
                                        {step.shortTitle}
                                    </span>
                                </button>

                                {!isLast && (
                                    <div className="flex-1 mx-2 mt-[-18px]">
                                        <div className="h-[2px] w-full rounded-full bg-[#e5e1ff] overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#a78bfa] to-[#8b7cf6] rounded-full transition-all duration-500"
                                                style={{ width: isCompleted ? "100%" : "0%" }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Progress strip */}
                <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 h-1.5 bg-[#f0eeff] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#c4b8ff] via-[#a78bfa] to-[#8b7cf6] rounded-full transition-all duration-500"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-bold text-[#8b7cf6] shrink-0">
                        {Math.round(((currentStep + 1) / steps.length) * 100)}%
                    </span>
                </div>
            </div>

            {/* ── Revision / Returned Banner ── */}
            {(isRevision || isReturned) && (
                <div
                    className={`${isRevision
                        ? "bg-[#fff8e6] border-[#fde68a]"
                        : "bg-[#fef2f2] border-[#fecdd3]"
                        } border rounded-2xl p-5 space-y-3`}
                >
                    <div className="flex items-center gap-2">
                        <AlertCircle
                            className={`h-5 w-5 ${isRevision ? "text-[#d97706]" : "text-[#dc2626]"}`}
                        />
                        <span className="font-bold text-sm text-[#92400e]">
                            {isRevision ? "Revision Required" : "Returned for Correction"}
                        </span>
                    </div>
                    <p className="text-sm text-[#7c73a0] leading-relaxed">
                        {isRevision
                            ? "The reviewer has requested changes. Please review the feedback below and update the necessary fields before resubmitting."
                            : "The administrator has returned this proposal for correction. Please see the reason below and update your proposal."
                        }
                    </p>
                    <div className="bg-white border border-slate-100 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <MessageSquare
                                className={`h-4 w-4 mt-0.5 shrink-0 ${isRevision ? "text-[#d97706]" : "text-[#dc2626]"}`}
                            />
                            <div>
                                <p className="text-[#3d3654] text-sm italic leading-relaxed">
                                    &ldquo;{isRevision
                                        ? (proposalData.comments?.[proposalData.comments.length - 1]?.text ||
                                            "No specific comments provided.")
                                        : (proposalData.returnReason || "No specific reason provided.")
                                    }&rdquo;
                                </p>
                                <span className="text-[10px] text-[#a09ac0] mt-2 block">
                                    — {isRevision
                                        ? `Feedback from ${proposalData.comments?.[proposalData.comments.length - 1]?.reviewer?.name || "Reviewer"}`
                                        : "Admin Note"
                                    }
                                    {isRevision &&
                                        proposalData.comments?.[proposalData.comments.length - 1]?.createdAt &&
                                        ` on ${new Date(
                                            proposalData.comments[proposalData.comments.length - 1].createdAt
                                        ).toLocaleDateString()}`
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Form Content ── */}
            <div className="pastel-card p-6">
                <FormProvider {...methods}>
                    <StepComponent
                        step={currentStep + 1}
                        onFileUpload={handleFileUpload}
                        readOnly={!isEditable}
                        hideFeeDocs={isRevision || isReturned}
                    />
                </FormProvider>
            </div>

            {/* ── Navigation Buttons ── */}
            <div className="flex items-center justify-between gap-3">
                <Button
                    onClick={prevStep}
                    disabled={currentStep === 0 || isBusy}
                    variant="outline"
                    className="flex items-center gap-1.5 border-[#e5e1ff] text-[#7c73a0] hover:bg-[#f0eeff] hover:text-[#8b7cf6] hover:border-[#c4b8ff] rounded-xl disabled:opacity-40"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>

                <div className="flex items-center gap-2">
                    {/* Save Draft button */}
                    {isEditable && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    disabled={isBusy}
                                    className="border-[#e5e1ff] text-[#7c73a0] hover:bg-[#f0eeff] hover:text-[#8b7cf6] hover:border-[#c4b8ff] rounded-xl disabled:opacity-60"
                                >
                                    {isSaving
                                        ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</>
                                        : "Save Draft"
                                    }
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border-[#e5e1ff] rounded-2xl">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-[#3d3654]">
                                        Save Draft &amp; Exit?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-[#7c73a0]">
                                        This will save your current progress as a draft and return you to
                                        the dashboard. You can continue editing later from &ldquo;My
                                        Proposals&rdquo;.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="border-[#e5e1ff] text-[#7c73a0] hover:bg-[#f0eeff] rounded-xl">
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={async () => {
                                            const ok = await saveOrUpdateDraft(true);
                                            if (ok) navigate("/dashboard");
                                        }}
                                        className="bg-gradient-to-r from-[#a78bfa] to-[#8b7cf6] text-white rounded-xl hover:from-[#9b72fb]"
                                    >
                                        Confirm &amp; Exit
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    {/* Next / Submit */}
                    {currentStep === steps.length - 1 ? (
                        <Button
                            onClick={handleFinalSubmit}
                            disabled={isBusy}
                            className={`flex items-center gap-1.5 px-6 text-white font-semibold rounded-xl shadow-sm disabled:opacity-60
                                ${(isRevision || isReturned)
                                    ? "bg-[#d97706] hover:bg-[#b45309]"
                                    : "bg-gradient-to-r from-[#6ee7b7] to-[#059669] hover:from-[#4dd9a4] hover:to-[#047857]"
                                }`}
                        >
                            {isSubmitting
                                ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Submitting…</>
                                : <>{(isRevision || isReturned) ? "Resubmit Proposal" : "Submit Proposal"}<Check className="h-4 w-4 ml-1" /></>
                            }
                        </Button>
                    ) : (
                        <Button
                            onClick={nextStep}
                            disabled={isBusy}
                            className="flex items-center gap-1.5 px-6 bg-gradient-to-r from-[#a78bfa] to-[#8b7cf6] hover:from-[#9b72fb] hover:to-[#7c6de8] text-white font-semibold rounded-xl shadow-sm disabled:opacity-60"
                        >
                            {isSaving
                                ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Saving…</>
                                : <>Next<ChevronRight className="h-4 w-4" /></>
                            }
                        </Button>
                    )}
                </div>
            </div>

            {currentStep === steps.length - 1 && (
                <p className="text-center text-xs text-[#a09ac0]">
                    Please review all information carefully before final submission.
                </p>
            )}
        </div>
    );
}