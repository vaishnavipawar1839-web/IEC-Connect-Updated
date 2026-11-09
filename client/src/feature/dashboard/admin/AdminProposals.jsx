import { useEffect, useState } from "react";
import {
  Layers,
  Users,
  CheckCircle,
  Clock,
  Eye,
  IndianRupee,
  BadgeCheck,
  AlertTriangle,
  XCircle,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { assignProposalReviewers } from "../../../api/trackingApi";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

async function openPaymentProof(proposalId) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/proposals/${proposalId}/payment-proof`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) throw new Error("Could not load receipt");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const win = window.open(blobUrl, "_blank");
    // Revoke after the tab has had a chance to load
    if (win) setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (err) {
    console.error(err);
    alert("Failed to open payment receipt. Please try again.");
  }
}

export default function AdminProposals() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [reviewers, setReviewers] = useState([]);

  // Dialog state
  const [verifyId, setVerifyId] = useState(null);
  const [paymentDialog, setPaymentDialog] = useState({ id: null, action: null, proposal: null });
  const [adminActionDialog, setAdminActionDialog] = useState({ id: null, action: null, title: "" });
  const [assignmentDialog, setAssignmentDialog] = useState({ id: null, title: "" });
  const [selectedReviewerIds, setSelectedReviewerIds] = useState([]);
  const [createReviewerOpen, setCreateReviewerOpen] = useState(false);
  const [creatingReviewer, setCreatingReviewer] = useState(false);
  const [reviewerForm, setReviewerForm] = useState({
    name: "",
    designation: "",
    qualification: "",
    department: "",
    institution: "",
    contact: "",
    email: "",
    password: "",
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminReason, setAdminReason] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, proposalsRes, reviewersRes] = await Promise.all([
          api.get("/dashboard/admin"),
          api.get("/admin/proposals"),
          api.get("/admin/reviewers"),
        ]);
        setStats(statsRes.data);
        setProposals(proposalsRes.data);
        setReviewers(reviewersRes.data);
      } catch {
        toast.error("Failed to load admin dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── Verify proposal (forward to scrutiny) ── */
  const handleVerify = async (proposalId) => {
    try {
      await api.post(`/admin/proposals/${proposalId}/verify`);
      toast.success("Proposal verified and forwarded to Scrutiny");
      setProposals((prev) => prev.filter((p) => p._id !== proposalId));
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to verify proposal";
      toast.error(msg);
    } finally {
      setVerifyId(null);
    }
  };

  const handleAssignReviewers = async () => {
    const { id } = assignmentDialog;
    if (!id || !selectedReviewerIds.length) {
      return toast.error("Select at least one reviewer");
    }
    try {
      await assignProposalReviewers(id, selectedReviewerIds);
      toast.success("Reviewers assigned and notified");
      const response = await api.get("/admin/proposals");
      setProposals(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign reviewers");
    } finally {
      setAssignmentDialog({ id: null, title: "" });
      setSelectedReviewerIds([]);
    }
  };

  const handleCreateReviewer = async (event) => {
    event.preventDefault();
    setCreatingReviewer(true);
    try {
      const response = await api.post("/admin/reviewers", reviewerForm);
      setReviewers((current) => [...current, response.data.reviewer]);
      setReviewerForm({
        name: "",
        designation: "",
        qualification: "",
        department: "",
        institution: "",
        contact: "",
        email: "",
        password: "",
      });
      setCreateReviewerOpen(false);
      toast.success("Reviewer account created. They can now sign in as Reviewer.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create reviewer account");
    } finally {
      setCreatingReviewer(false);
    }
  };

  /* ── Verify Payment ── */
  const handleVerifyPayment = async () => {
    const { id } = paymentDialog;
    if (!id) return;
    try {
      await api.post(`/admin/proposals/${id}/verify-payment`);
      toast.success("Payment marked as verified.");
      // Refresh proposals list
      const res = await api.get("/admin/proposals");
      setProposals(res.data);
    } catch {
      toast.error("Failed to verify payment");
    } finally {
      setPaymentDialog({ id: null, action: null, proposal: null });
    }
  };

  /* ── Reject Payment ── */
  const handleRejectPayment = async () => {
    const { id } = paymentDialog;
    if (!id || !rejectionReason.trim()) {
      return toast.error("Please provide a rejection reason");
    }
    try {
      await api.post(`/admin/proposals/${id}/reject-payment`, { reason: rejectionReason });
      toast.success("Payment rejected and researcher notified.");
      // Refresh proposals list
      const res = await api.get("/admin/proposals");
      setProposals(res.data);
    } catch {
      toast.error("Failed to reject payment");
    } finally {
      setPaymentDialog({ id: null, action: null, proposal: null });
      setRejectionReason("");
    }
  };

  /* ── Admin Return/Reject Proposal ── */
  const handleAdminAction = async () => {
    const { id, action } = adminActionDialog;
    if (!id || !adminReason.trim()) {
      return toast.error("Please provide a reason");
    }
    try {
      const endpoint = action === "return" ? "return" : "reject";
      await api.post(`/admin/proposals/${id}/${endpoint}`, { reason: adminReason });
      toast.success(action === "return" ? "Proposal returned for correction." : "Proposal rejected.");
      setProposals((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setAdminActionDialog({ id: null, action: null, title: "" });
      setAdminReason("");
    }
  };
  /* ── Render Table Helper ── */
  const renderProposalTable = (data, type) => {
    return (
      <div className="pastel-card overflow-hidden">
        <Table>
          <TableHeader className="bg-[#f8f7ff]">
            <TableRow className="h-auto border-b border-[#e5e1ff]">
              <TableHead className="px-4 py-3 text-xs font-semibold text-[#7c73a0] uppercase tracking-wider">Study Title</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold text-[#7c73a0] uppercase tracking-wider">
                {type === "withdrawn" ? "Withdrawn On" : "Submitted On"}
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold text-[#7c73a0] uppercase tracking-wider">Status</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold text-[#7c73a0] uppercase tracking-wider">Review Fee</TableHead>
              <TableHead className="px-4 py-3 text-xs font-semibold text-[#7c73a0] uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-8 text-center text-[#a09ac0] text-sm">
                  {type === "active" ? "No proposals awaiting action" : type === "withdrawn" ? "No withdrawn proposals" : "Archive is empty"}
                </TableCell>
              </TableRow>
            ) : (
              data.map((p) => {
                const isPaid = p.paymentStatus === "Payment Verified";
                const isFree = p.totalPayable === 0;

                return (
                  <TableRow key={p._id} className="h-auto hover:bg-[#f8f7ff] transition-colors border-b border-[#f0eeff]">
                    {/* Title */}
                    <TableCell className="px-4 py-3 text-sm font-medium text-[#3d3654] align-middle max-w-[200px]">
                      <div className="truncate">{p.administrative?.studyTitle || p.title}</div>
                      {type === "withdrawn" && p.withdrawnBy && (
                        <div className="text-[10px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Withdrawn by {p.withdrawnBy.name || "Researcher"}
                        </div>
                      )}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="px-4 py-3 text-sm text-[#7c73a0] align-middle whitespace-nowrap">
                      {new Date(type === "withdrawn" ? p.withdrawnAt : p.createdAt).toLocaleDateString()}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="px-4 py-3 align-middle">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge(p.status)}`}>
                        {p.status.replace(/_/g, " ")}
                      </span>
                    </TableCell>

                    {/* Fee Column */}
                    <TableCell className="px-4 py-3 align-middle">
                      {p.totalPayable > 0 ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-[#be185d]">₹{p.totalPayable}</span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit ${p.paymentStatus === "Payment Verified"
                            ? "bg-[#e0f7f1] text-[#2d7a65] border border-[#b2edd9]"
                            : p.paymentStatus === "Under Verification"
                              ? "bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]"
                              : "bg-[#fff1f2] text-[#be123c] border border-[#fecdd3]"
                            }`}>
                            {p.paymentStatus || "Payment Pending"}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e0f7f1] text-[#2d7a65] border border-[#b2edd9]">
                          <CheckCircle className="h-3 w-3" /> NIL (Free)
                        </span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Always show View */}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View Proposal"
                          className="rounded-lg text-[#7c73a0] hover:bg-[#f0eeff] hover:text-[#8b7cf6] h-8 w-8"
                          onClick={() => navigate(`/proposals/${p._id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Archive specific view proof */}
                        {p.paymentProofUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Payment Proof"
                            className="rounded-lg text-[#0369a1] hover:bg-[#e0f2fe] h-8 w-8"
                            onClick={() => openPaymentProof(p._id)}
                          >
                            <IndianRupee className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Active Actions */}
                        {type === "active" && (
                          <>
                            {p.totalPayable > 0 && p.paymentStatus !== "Payment Verified" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-lg text-[#059669] hover:bg-[#e0f7f1] text-[10px] font-bold h-8 px-2"
                                onClick={() => setPaymentDialog({ id: p._id, action: "verify", proposal: p })}
                              >
                                {p.paymentStatus === "Under Verification" ? "Confirm Payment" : "Verify Payment"}
                              </Button>
                            )}

                            {p.status === "submitted" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!isFree && !isPaid}
                                title={isFree || isPaid ? "Approve and forward to SRC" : "Payment pending"}
                                className={`rounded-lg text-[10px] font-bold h-8 px-2 ${(isFree || isPaid) ? "text-[#8b7cf6] hover:bg-[#ede9ff]" : "text-[#bcb8d8] opacity-50 cursor-not-allowed"}`}
                                onClick={() => (isFree || isPaid) && setVerifyId(p._id)}
                              >
                                Approve to SRC
                              </Button>
                            )}

                            {p.status === "scrutiny_verified" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-lg text-[10px] font-bold h-8 px-2 text-sky-700 hover:bg-sky-50"
                                onClick={() => {
                                  setAssignmentDialog({ id: p._id, title: p.administrative?.studyTitle || p.title });
                                  setSelectedReviewerIds([]);
                                }}
                              >
                                Appoint Reviewer
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-lg text-[#d97706] hover:bg-[#fff8e6] text-[10px] font-bold h-8 px-2"
                              onClick={() => setAdminActionDialog({ id: p._id, action: "return", title: "Return for Correction" })}
                            >
                              Return
                            </Button>

                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-[#7c73a0] animate-pulse">
        Loading admin dashboard…
      </div>
    );
  }

  const activeProposals = proposals.filter(p => !["withdrawn", "rejected", "approved"].includes(p.status));
  const withdrawnProposals = proposals.filter(p => p.status === "withdrawn");
  const archiveProposals = proposals.filter(p => ["rejected", "approved"].includes(p.status));

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3d3654]">Admin Dashboard</h1>
          <p className="text-sm text-[#7c73a0] mt-1">
            Monitor life cycle of proposals, review fees, and manage workflow transitions.
          </p>
        </div>
        <Button onClick={() => setCreateReviewerOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" /> Create Reviewer Account
        </Button>
      </section>

      {/* ── Stats ── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard title="Total Proposals" value={stats.proposals.total} icon={<Layers />} color="lavender" />
        <StatCard title="Approved" value={stats.proposals.approved} icon={<CheckCircle />} color="mint" />
        <StatCard title="Under Review" value={stats.proposals.underReview} icon={<Clock />} color="amber" />
        <StatCard title="Final Decision Needed" value={stats.proposals.awaitingDecision} icon={<BadgeCheck />} color="amber" />
        <StatCard title="Total Users" value={stats.users.total} icon={<Users />} color="rose" />
      </section>

      {/* ── Proposals List with Tabs ── */}
      <section className="space-y-4">
        <Tabs defaultValue="active" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <h2 className="text-base font-bold text-[#3d3654]">Manage Proposals</h2>
              <p className="text-xs text-[#7c73a0]">Track and process research applications</p>
            </div>
            <TabsList className="bg-[#f0eeff] w-full sm:w-auto overflow-x-auto justify-start sm:justify-center">
              <TabsTrigger value="active" className="data-[state=active]:bg-[#8b7cf6] data-[state=active]:text-white min-w-[100px]">
                Active ({activeProposals.length})
              </TabsTrigger>
              <TabsTrigger value="withdrawn" className="data-[state=active]:bg-[#8b7cf6] data-[state=active]:text-white min-w-[100px]">
                Withdrawn ({withdrawnProposals.length})
              </TabsTrigger>
              <TabsTrigger value="archive" className="data-[state=active]:bg-[#8b7cf6] data-[state=active]:text-white min-w-[100px]">
                Archive ({archiveProposals.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active" className="mt-4">
            {renderProposalTable(activeProposals, "active")}
          </TabsContent>

          <TabsContent value="withdrawn" className="mt-4">
            {renderProposalTable(withdrawnProposals, "withdrawn")}
          </TabsContent>

          <TabsContent value="archive" className="mt-4">
            {renderProposalTable(archiveProposals, "archive")}
          </TabsContent>
        </Tabs>
      </section>

      <section className="pastel-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <IndianRupee className="h-4 w-4 text-[#8b7cf6]" />
          <h2 className="text-sm font-bold text-[#3d3654]">IEC Review Fee Schedule</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {FEE_REFERENCE.map((r) => (
            <div key={r.category} className={`rounded-xl px-3 py-2 border text-xs flex items-center justify-between gap-2 ${r.free ? "bg-[#e0f7f1] border-[#b2edd9]" : "bg-[#fce8f3] border-[#f5bfdd]"}`}>
              <span className={`font-medium leading-snug ${r.free ? "text-[#2d7a65]" : "text-[#7c3d6e]"}`}>{r.category}</span>
              <span className={`shrink-0 font-bold ${r.free ? "text-[#059669]" : "text-[#be185d]"}`}>{r.fee}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Verify Confirmation Dialog ── */}
      <AlertDialog open={!!verifyId} onOpenChange={(open) => !open && setVerifyId(null)}>
        <AlertDialogContent className="border-[#e5e1ff] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#3d3654]">Verify & Forward to Scrutiny?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#7c73a0]">
              This will verify the proposal and forward it to the Scrutiny Committee for detailed review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#e5e1ff] text-[#7c73a0] hover:bg-[#f0eeff] rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleVerify(verifyId)}
              className="bg-gradient-to-r from-[#a78bfa] to-[#8b7cf6] text-white rounded-xl hover:from-[#9b72fb]"
            >
              Verify &amp; Forward
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Payment Verification Confirmation Dialog ── */}
      <AlertDialog
        open={!!paymentDialog.id}
        onOpenChange={(open) => !open && setPaymentDialog({ id: null, action: null, proposal: null })}
      >
        <AlertDialogContent className="border-[#e5e1ff] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#3d3654]">
              {paymentDialog.action === "verify" ? "Confirm Payment Receipt?" : "Reject Payment Proof?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#7c73a0]">
              {paymentDialog.action === "verify" ? (
                <div className="space-y-4">
                  <p>This confirms that the researcher has paid the review fee of <span className="font-bold text-[#be185d]">₹{paymentDialog.proposal?.totalPayable}</span>.</p>
                  <div className="bg-[#f8f7ff] p-4 rounded-xl border border-[#e5e1ff] space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#a09ac0]">Payment Method:</span>
                      <span className="font-bold text-[#3d3654]">{paymentDialog.proposal?.paymentMethod || "Manual"}</span>
                    </div>
                    {paymentDialog.proposal?.transactionId && (
                      <div className="flex justify-between text-xs">
                        <span className="text-[#a09ac0]">Transaction ID:</span>
                        <span className="font-bold text-[#3d3654]">{paymentDialog.proposal?.transactionId}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs">After verification, the researcher will be able to perform the final submission.</p>
                </div>
              ) : (
                <>
                  Enter the reason for rejecting this payment proof. The researcher will be notified to re-upload correctly.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {paymentDialog.action === "reject" && (
            <textarea
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="e.g. Transaction ID not visible, Incorrect amount, Image blurry"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          )}

          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#e5e1ff] text-[#7c73a0] hover:bg-[#f0eeff] rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={paymentDialog.action === "verify" ? handleVerifyPayment : handleRejectPayment}
              className={`rounded-xl text-white font-semibold ${paymentDialog.action === "verify"
                ? "bg-gradient-to-r from-[#6ee7b7] to-[#059669] hover:from-[#4dd9a4]"
                : "bg-[#be185d] hover:bg-[#9d174d]"
                }`}
            >
              {paymentDialog.action === "verify" ? "Verify Payment" : "Reject Payment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Admin Action Dialog (Return/Reject) ── */}
      <AlertDialog
        open={!!adminActionDialog.id}
        onOpenChange={(open) => !open && setAdminActionDialog({ id: null, action: null, title: "" })}
      >
        <AlertDialogContent className="border-[#e5e1ff] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#3d3654]">{adminActionDialog.title}?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#7c73a0]">
              {adminActionDialog.action === "return"
                ? "Provide the reason for returning this proposal for correction. The researcher will be able to edit and resubmit."
                : "Provide the reason for rejecting this proposal. This action is permanent and the proposal will be locked."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>

          <textarea
            className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8b7cf6] outline-none"
            placeholder="Enter reason here..."
            rows={4}
            value={adminReason}
            onChange={(e) => setAdminReason(e.target.value)}
          />

          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#e5e1ff] text-[#7c73a0] hover:bg-[#f0eeff] rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAdminAction}
              className={`rounded-xl text-white font-semibold ${adminActionDialog.action === "return"
                ? "bg-[#d97706] hover:bg-[#b45309]"
                : "bg-[#be185d] hover:bg-[#9d174d]"
                }`}
            >
              {adminActionDialog.action === "return" ? "Return Proposal" : "Reject Proposal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!assignmentDialog.id}
        onOpenChange={(open) => {
          if (!open) {
            setAssignmentDialog({ id: null, title: "" });
            setSelectedReviewerIds([]);
          }
        }}
      >
        <AlertDialogContent className="border-slate-200 rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Appoint proposal reviewers</AlertDialogTitle>
            <AlertDialogDescription>
              Select one or more reviewers for {assignmentDialog.title || "this proposal"}. Each reviewer will receive an email and in-app notification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border border-slate-200 p-3">
            {reviewers.map((reviewer) => (
              <label key={reviewer._id} className="flex items-center gap-3 rounded px-2 py-2 text-sm hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={selectedReviewerIds.includes(reviewer._id)}
                  onChange={(event) => setSelectedReviewerIds((current) => event.target.checked
                    ? [...current, reviewer._id]
                    : current.filter((reviewerId) => reviewerId !== reviewer._id))}
                />
                <span className="font-medium text-slate-800">{reviewer.name}</span>
                <span className="ml-auto text-xs text-slate-500">{reviewer.shortCode || reviewer.email}</span>
              </label>
            ))}
            {!reviewers.length && <p className="text-sm text-slate-500">No reviewers are registered.</p>}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={handleAssignReviewers} disabled={!selectedReviewerIds.length}>
              Assign Reviewers
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={createReviewerOpen} onOpenChange={setCreateReviewerOpen}>
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto border-slate-200 rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Create reviewer account</AlertDialogTitle>
            <AlertDialogDescription>
              Reviewer accounts are provisioned by an admin. Give the reviewer their initial password securely.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleCreateReviewer} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["name", "Full name", "text"],
              ["designation", "Designation", "text"],
              ["qualification", "Qualification", "text"],
              ["department", "Department", "text"],
              ["institution", "Institution", "text"],
              ["contact", "Contact", "tel"],
              ["email", "Email", "email"],
              ["password", "Initial password (10+ characters)", "password"],
            ].map(([field, label, type]) => (
              <label key={field} className="space-y-1 text-xs font-medium text-slate-600">
                <span>{label}</span>
                <input
                  type={type}
                  required={field !== "contact"}
                  minLength={field === "password" ? 10 : undefined}
                  autoComplete={field === "password" ? "new-password" : undefined}
                  value={reviewerForm[field]}
                  onChange={(event) => setReviewerForm((current) => ({ ...current, [field]: event.target.value }))}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-900"
                />
              </label>
            ))}
            <div className="flex justify-end gap-2 sm:col-span-2">
              <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
              <Button type="submit" disabled={creatingReviewer}>
                {creatingReviewer ? "Creating..." : "Create Reviewer"}
              </Button>
            </div>
          </form>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`
  .select-all {
    user-select: all;
  }
`}</style>
    </div>
  );
}

/* ── Fee Reference Table (for the info card) ── */
const FEE_REFERENCE = [
  { category: "Research from Other Institute", fee: "₹10,000", free: false },
  { category: "PG Student Dissertation Research", fee: "₹5,000", free: false },
  { category: "Other Academic (DNB, DM, etc)", fee: "₹5,000", free: false },
  { category: "PG Student Non-Dissertation", fee: "NIL", free: true },
  { category: "UG / Faculty Research", fee: "NIL", free: true },
  { category: "Clinical Trials (Pharma)", fee: "₹95,000 + GST", free: false },
];

/* ── Stat Card ── */
function StatCard({ title, value, icon, color }) {
  const colorMap = {
    lavender: { bg: "bg-[#ede9ff]", text: "text-[#7c3aed]" },
    mint: { bg: "bg-[#e0f7f1]", text: "text-[#059669]" },
    amber: { bg: "bg-[#fff8e6]", text: "text-[#d97706]" },
    rose: { bg: "bg-[#fce8f3]", text: "text-[#db2777]" },
  };
  const c = colorMap[color];
  return (
    <div className="pastel-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}>
          {icon}
        </div>
        <span className="text-2xl font-bold text-[#3d3654]">{value}</span>
      </div>
      <p className="text-sm text-[#7c73a0]">{title}</p>
    </div>
  );
}

function statusBadge(status) {
  return {
    submitted: "bg-[#f0eeff] text-[#6d5ce8] border-[#d4ccff]",
    fees_pending: "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]",
    admin_verified: "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]",
    scrutiny_verified: "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]",
    under_review: "bg-[#fff8e6] text-[#a16207] border-[#fde68a]",
    admin_decision_pending: "bg-[#fff8e6] text-[#a16207] border-[#fde68a]",
    approved: "bg-[#e0f7f1] text-[#2d7a65] border-[#b2edd9]",
    withdrawn: "bg-gray-100 text-gray-500 border-gray-200",
    rejected: "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]",
  }[status] || "bg-[#f0eeff] text-[#6d5ce8] border-[#d4ccff]";
}