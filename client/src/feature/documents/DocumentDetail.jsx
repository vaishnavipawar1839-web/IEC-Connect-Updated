import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText, ArrowLeft, Download, MessageSquare, CreditCard, Upload, Eye, CheckCircle2 } from "lucide-react";

import {
  SectionAForm,
  SectionBForm,
  SectionCForm,
  SectionDForm,
  SectionEForm,
  SectionFForm,
} from "../proposals/forms/Forms";
import ResearchPaperView from "./ResearchPaperView";

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = useAuth();

  const [reviewForm, setReviewForm] = useState({
    text: "",
    decision: "revision_required"
  });

  const [uploadingProof, setUploadingProof] = useState(false);

  const methods = useForm({
    defaultValues: {},
  });

  const { reset } = methods;

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const res = await api.get(`/proposals/${id}`);
        const data = { ...res.data };
        
        // Ensure standard objects exist for react-hook-form
        if (!data.sectionA) data.sectionA = {};
        if (!data.sectionB) data.sectionB = {};
        if (!data.sectionC) data.sectionC = {};
        if (!data.sectionD) data.sectionD = {};
        if (!data.sectionE) data.sectionE = {};
        if (!data.sectionF) data.sectionF = {};
        if (!data.checklist) data.checklist = {};
        if (!data.checklistFiles) data.checklistFiles = {};
        
        // 1. Map Administrative details from various possible sources
        if (data.administrative) {
          data.sectionA.nameOfOrganization = data.administrative.organizationName || data.administrative.organization || data.sectionA.nameOfOrganization;
          data.sectionA.nameOfEthicsCommittee = data.administrative.ethicsCommitteeName || data.administrative.iecName || data.sectionA.nameOfEthicsCommittee;
          data.sectionA.nameOfPrincipalInvestigator = data.administrative.piName || data.administrative.principalInvestigator?.name || data.sectionA.nameOfPrincipalInvestigator;
          data.sectionA.titleOfTheStudy = data.administrative.studyTitle || data.sectionA.titleOfTheStudy;
          data.sectionA.dateOfSubmission = data.administrative.dateOfSubmission || data.sectionA.dateOfSubmission;
          data.sectionA.typeOfReviewRequested = data.administrative.reviewType || data.sectionA.typeOfReviewRequested;
          data.sectionA.typeOfResearch = data.administrative.researchType || data.sectionA.typeOfResearch;
          data.sectionA.durationOfStudy = data.administrative.studyDuration || (data.research?.studyDuration ? `${data.research.studyDuration} months` : data.sectionA.durationOfStudy);
        }

        // 2. Normalize Date for <input type="date">
        if (data.sectionA.dateOfSubmission) {
           data.sectionA.dateOfSubmission = String(data.sectionA.dateOfSubmission).includes("T") 
              ? data.sectionA.dateOfSubmission.split("T")[0] 
              : data.sectionA.dateOfSubmission;
        }

        // 3. Map Checklist Data (Critical Fix for blank radio buttons and enclosure numbers)
        // Source checklist data from root 'checklist' or nested 'sectionF.checklist'
        const mergedChecklist = {
          ...(data.sectionF?.checklist || {}),
          ...(data.checklist || {})
        };
        const mergedChecklistFiles = {
          ...(data.sectionF?.checklistFiles || {}),
          ...(data.checklistFiles || {})
        };
        
        data.checklist = mergedChecklist;
        data.checklistFiles = mergedChecklistFiles;

        // 4. Map Declaration Data
        const mergedDecl = {
          ...(data.sectionDecl || {}),
          ...(data.declaration || {})
        };
        data.sectionDecl = mergedDecl;

        setProposal(data);
        reset(data); // Populate RHF state with the cleaned/merged data
      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error("Failed to load proposal details");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProposal();
    }
  }, [id, navigate, reset]);

  const handleDownload = () => {
    window.open(
      `${import.meta.env.VITE_API_BASE_URL}/proposals/${id}/download`,
      "_blank"
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 hover:bg-green-100";
      case "revision_required": return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "rejected": return "bg-red-100 text-red-800 hover:bg-red-100";
      case "submitted": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "fees_pending": return "bg-pink-100 text-pink-800 hover:bg-pink-100";
      case "under_review": return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Payment Verified":
      case "Verified": return "border-green-500 text-green-600 bg-green-50";
      case "Paid": return "border-blue-500 text-blue-600 bg-blue-50";
      case "Under Verification": return "border-amber-500 text-amber-600 bg-amber-50";
      case "Rejected": return "border-red-500 text-red-600 bg-red-50";
      case "Not Required": return "border-sky-400 text-sky-600 bg-sky-50";
      default: return "border-slate-300 text-slate-500 bg-slate-50";
    }
  };

  const getAccountNumber = (category) => {
    if (category?.includes("Pharma") || category?.includes("Clinical") || category?.includes("Biomedical")) return "0458104000255486";
    if (category?.includes("PG Student") || category?.includes("Other Academic")) return "0458104000229821";
    return "N/A";
  };

  const handlePaymentProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingProof(true);
    try {
      await api.post(`/proposals/${id}/payment-proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Payment proof uploaded successfully. Admin will verify it shortly.");
      // Refresh proposal data
      const res = await api.get(`/proposals/${id}`);
      setProposal(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploadingProof(false);
    }
  };

  const openPaymentProof = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/proposals/${id}/payment-proof`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Could not load receipt");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, "_blank");
      if (win) setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to open payment receipt. Please try again.");
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewForm.text.trim()) {
      return toast.error("Please provide review comments");
    }

    setSubmittingReview(true);
    try {
      await api.post(`/proposals/${id}/review/comment`, reviewForm);
      toast.success("Review submitted successfully");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const isReviewerEligible = proposal &&
    user?.role === "reviewer" &&
    proposal.reviewers?.some(r => r._id === user?._id || r === user?._id) &&
    proposal.status === "under_review";

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Loading proposal details...
      </div>
    );
  }

  if (!proposal) return null;

  // Check if we should show the Research Paper (HTML) view
  // Show paper view for approved documents OR when specifically requested via /documents route
  const showPaperView = proposal.status === "approved" && !isReviewerEligible && user?.role !== "admin" && user?.role !== "scrutiny";

  if (showPaperView) {
    return (
      <div className="bg-slate-50 min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-6 mb-6">
          <Button
            variant="ghost"
            className="pl-0 text-slate-500 hover:text-slate-800"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
        <ResearchPaperView proposal={proposal} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button
            variant="ghost"
            className="mb-2 pl-0 -ml-2 text-slate-500 hover:text-slate-800"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">
            {isReviewerEligible ? "Review Proposal" : "Proposal Details"}
          </h1>
          <p className="text-lg text-slate-600 mt-1">{proposal.title}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <Badge className={getStatusColor(proposal.status)}>
              {proposal.status.replace("_", " ").toUpperCase()}
            </Badge>
            <span className="text-sm text-slate-400">|</span>
            <span className="text-sm text-slate-500">
              Submitted: {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : "N/A"}
            </span>
            <span className="text-sm text-slate-400">|</span>
            <span className="text-sm text-slate-500">ID: {proposal.protocolNumber || proposal._id}</span>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">

          {proposal.status === "approved" ? (
            <Button
              variant="default"
              onClick={() => {
                const btn = document.getElementById("document-pdf-download-btn");
                if (btn) btn.click();
                else toast.error("PDF generator not ready");
              }}
              className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-md"
            >
              <Download className="h-4 w-4" /> Download Research Paper (PDF)
            </Button>
          ) : (
            proposal.documents?.length > 0 && (
              <Button variant="outline" onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" /> Download Files
              </Button>
            )
          )}
        </div>
      </div>

      {/* Reviewer Comments Section - Visible if there are comments */}
      {proposal.comments && proposal.comments.length > 0 && (
        <Card className="border-l-4 border-l-blue-500 shadow-sm bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Reviewer Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-4">
                {proposal.comments.map((comment, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">
                          {comment.reviewer?.name || "Reviewer"}
                        </span>
                        <Badge variant="outline" className={
                          comment.decision === "approved" ? "border-green-500 text-green-600" :
                            comment.decision === "revision_required" ? "border-orange-500 text-orange-600" :
                              "border-red-500 text-red-600"
                        }>
                          {comment.decision.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 whitespace-pre-wrap text-sm">{comment.text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Fee & Payment Section */}
      <Card className="border-l-4 border-l-purple-500 shadow-sm bg-purple-50/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-purple-600" />
            Review Fee & Payment Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-slate-500 text-xs uppercase tracking-wider">Fee Category</Label>
              <p className="font-semibold text-slate-700">{proposal.feeCategory || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-500 text-xs uppercase tracking-wider">Base Fee</Label>
              <p className="font-semibold text-slate-700">₹{proposal.baseFee || 0}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-500 text-xs uppercase tracking-wider">GST (0%)</Label>
              <p className="font-semibold text-slate-700">₹{proposal.gstAmount || 0}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-slate-500 text-xs uppercase tracking-wider">Total Payable</Label>
              <p className="font-bold text-purple-700 text-lg">₹{proposal.totalPayable || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 flex-wrap">
            <div className="font-medium text-slate-600">Payment Status:</div>
            {(() => {
              // Prefer: root paymentStatus > sectionG.paymentStatus > "Pending"
              const status = (proposal.paymentStatus && proposal.paymentStatus !== "Pending")
                ? proposal.paymentStatus
                : (proposal.sectionG?.paymentStatus || proposal.paymentStatus || "Pending");
              return (
                <Badge variant="outline" className={getPaymentStatusColor(status)}>
                  {status.toUpperCase()}
                </Badge>
              );
            })()}
            {proposal.paymentStatus === "Rejected" && (
              <span className="text-sm text-red-600 font-bold">Reason: {proposal.rejectionReason}</span>
            )}
            {/* Show View Receipt button if manual receipt uploaded */}
            {proposal.sectionG?.receiptUrl && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs border-purple-300 text-purple-600 hover:bg-purple-50"
                onClick={() => {
                  const win = window.open("", "_blank");
                  win.document.write(`<iframe src="${proposal.sectionG.receiptUrl}" style="width:100%;height:100vh;border:none;"></iframe>`);
                }}
              >
                <Eye className="h-3 w-3" /> View Receipt
              </Button>
            )}
          </div>

          {proposal.totalPayable > 0 ? (
            <>
              {/* Bank Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  Bank Details for Transfer
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 text-xs">Account Name:</span>
                    <p className="font-medium">Dean, Dr. Vasantrao Pawar Medical College, Nashik</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">Bank Name:</span>
                    <p className="font-medium">IDBI Bank, M.G. Road, Nashik</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">IFS Code:</span>
                    <p className="font-medium">IBKL0000458</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">Account Number:</span>
                    <p className="font-bold text-blue-700 select-all">{getAccountNumber(proposal.feeCategory)}</p>
                  </div>
                </div>
              </div>

              {/* Researcher Upload Section */}
              {user?.role === "researcher" && (proposal.paymentStatus === "Payment Pending" || proposal.paymentStatus === "Rejected") && (
                <div className="space-y-3 pt-2">
                  <Label className="font-semibold block">Step 2: Upload Payment Proof (PDF/Image)</Label>
                  <p className="text-xs text-slate-500">After bank transfer, upload your receipt here for admin verification.</p>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      id="paymentProof"
                      className="hidden"
                      accept="application/pdf,image/*"
                      onChange={handlePaymentProofUpload}
                    />
                    <Button
                      onClick={() => document.getElementById('paymentProof').click()}
                      className="bg-purple-600 hover:bg-purple-700 gap-2 h-10 px-6 rounded-xl shadow-sm"
                      disabled={uploadingProof}
                    >
                      <Upload className="h-4 w-4" /> {uploadingProof ? "Uploading..." : "Upload Proof"}
                    </Button>
                  </div>
                </div>
              )}

              {/* View Proof Button */}
              {proposal.paymentProofUrl && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={openPaymentProof}
                    className="gap-2 border-slate-200 hover:bg-slate-50"
                  >
                    <Eye className="h-4 w-4 text-purple-600" /> View Uploaded Receipt
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 p-4 rounded-xl border border-green-200">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">No review fee applicable for this proposal.</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Read-Only Proposal Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-500" />
            Proposal Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            {/* Hidden PDF Generator for when admin/researcher clicks Download in form view */}
            {!showPaperView && proposal.status === "approved" && (
              <div className="hidden">
                <ResearchPaperView proposal={proposal} />
              </div>
            )}
            <Tabs defaultValue="sectionA" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-8 h-auto">
                <TabsTrigger value="sectionA">Basic Info</TabsTrigger>
                <TabsTrigger value="sectionB">Budget</TabsTrigger>
                <TabsTrigger value="sectionC">Overview</TabsTrigger>
                <TabsTrigger value="sectionD">Methodology</TabsTrigger>
                <TabsTrigger value="sectionE">Ethics</TabsTrigger>
                <TabsTrigger value="sectionF">Documents</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <div className="proposal-readonly-view">
                  <style>{`
                  .proposal-readonly-view input:not([type="radio"]):not([type="checkbox"]):not([type="file"]),
                  .proposal-readonly-view textarea,
                  .proposal-readonly-view select {
                    background-color: #f8fafc !important;
                    color: #334155 !important;
                    cursor: default !important;
                    border-color: #e2e8f0 !important;
                    pointer-events: none;
                  }
                  /* Hide file inputs in read-only mode */
                  .proposal-readonly-view input[type="file"] {
                    display: none !important;
                  }
                  /* Radio and checkboxes inputs: frozen but visible */
                  .proposal-readonly-view input[type="radio"],
                  .proposal-readonly-view input[type="checkbox"] {
                    cursor: default !important;
                    pointer-events: none;
                    opacity: 1 !important;
                  }
                  /* IMPORTANT: Shadcn Checkbox renders as button[role=checkbox] — keep visible & frozen */
                  .proposal-readonly-view button[role="checkbox"] {
                    pointer-events: none !important;
                    cursor: default !important;
                    opacity: 1 !important;
                    display: inline-flex !important;
                  }
                  /* Hide regular action buttons (Add Investigator, Remove, etc.) */
                  .proposal-readonly-view button:not(.view-pdf-btn):not([role="checkbox"]):not([role="tab"]):not([role="tablist"]) {
                    display: none !important;
                  }
                  /* View PDF should always be clickable */
                  .proposal-readonly-view button.view-pdf-btn {
                    pointer-events: auto !important;
                    cursor: pointer !important;
                    opacity: 1 !important;
                    display: inline-flex !important;
                  }
                `}</style>

                  <TabsContent value="sectionA">
                    <SectionAForm readOnly={true} />
                  </TabsContent>

                  <TabsContent value="sectionB">
                    <SectionBForm readOnly={true} />
                  </TabsContent>

                  <TabsContent value="sectionC">
                    <SectionCForm readOnly={true} />
                  </TabsContent>

                  <TabsContent value="sectionD">
                    <SectionDForm readOnly={true} />
                  </TabsContent>

                  <TabsContent value="sectionE">
                    <SectionEForm readOnly={true} />
                  </TabsContent>

                  <TabsContent value="sectionF">
                    <SectionFForm onFileUpload={() => { }} readOnly={true} />
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </FormProvider>
        </CardContent>
      </Card>

      {/* Review Submission Section for Reviewers */}
      {isReviewerEligible && (
        <Card className="border-t-4 border-t-amber-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-amber-900">
              <MessageSquare className="h-6 w-6 text-amber-600" />
              Complete Your Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold text-slate-700">Detailed Feedback for Research *</Label>
              <p className="text-sm text-slate-500">
                Please list any specific fields, data, or files that need correction or improvement.
                The researcher will see this feedback to revise their proposal.
              </p>
              <textarea
                className="w-full min-h-[150px] p-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                placeholder="Example: In section Research Details, the study duration seems unrealistic. Also, the Consent Form local language file is missing..."
                value={reviewForm.text}
                onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: "approved",
                  label: "Approve Proposal",
                  activeClass: "border-green-500 bg-green-50",
                  dotClass: "bg-green-500",
                  textClass: "text-green-700"
                },
                {
                  id: "revision_required",
                  label: "Request Revision",
                  activeClass: "border-orange-500 bg-orange-50",
                  dotClass: "bg-orange-500",
                  textClass: "text-orange-700"
                },
                {
                  id: "rejected",
                  label: "Reject Proposal",
                  activeClass: "border-red-500 bg-red-50",
                  dotClass: "bg-red-500",
                  textClass: "text-red-700"
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, decision: opt.id })}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group
                    ${reviewForm.decision === opt.id
                      ? opt.activeClass
                      : "border-slate-100 bg-white hover:border-slate-200"}`}
                >
                  <div className={`w-3 h-3 rounded-full ${reviewForm.decision === opt.id ? opt.dotClass : "bg-slate-200"}`} />
                  <span className={`font-semibold text-sm ${reviewForm.decision === opt.id ? opt.textClass : "text-slate-600"}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleReviewSubmit}
                disabled={submittingReview}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 h-auto text-lg rounded-xl shadow-md transition-all active:scale-95"
              >
                {submittingReview ? "Submitting..." : "Submit Decision"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}