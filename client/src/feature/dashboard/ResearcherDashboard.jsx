import { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Edit,
  Eye,
  MessageSquare,
  Undo2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function ResearcherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentProposals, setRecentProposals] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard/researcher");
        setStats(res.data.stats);
        setRecentProposals(res.data.recentProposals);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleWithdraw = async (proposalId) => {
    if (!window.confirm("Are you sure you want to withdraw this proposal? This action cannot be undone.")) return;
    try {
      await api.post(`/proposals/${proposalId}/withdraw`);
      toast.success("Proposal withdrawn successfully");
      const res = await api.get("/dashboard/researcher");
      setStats(res.data.stats);
      setRecentProposals(res.data.recentProposals);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Withdrawal failed");
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-[#7c73a0] animate-pulse">
        Loading your dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#3d3654]">Researcher Dashboard</h1>
          <p className="text-sm text-[#7c73a0] mt-1">
            Welcome{user?.name ? `, ${user.name}` : ""}. Track your IEC submissions and review progress.
          </p>
        </div>
        <Button
          onClick={() => navigate("/proposals/new")}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#a78bfa] to-[#8b7cf6] hover:from-[#9b72fb] hover:to-[#7c6de8] text-white rounded-xl shadow-sm font-semibold"
        >
          <PlusCircle className="h-4 w-4" />
          Create New Proposal
        </Button>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatCard title="Total Proposals" value={stats.total} icon={<FileText />} color="lavender" />
        <StatCard title="Under Review" value={stats.underReview} icon={<Clock />} color="amber" />
        <StatCard title="Awaiting Admin Decision" value={stats.awaitingDecision} icon={<Clock />} color="amber" />
        <StatCard title="Approved" value={stats.approved} icon={<CheckCircle />} color="mint" />
        <StatCard title="Action Required" value={stats.actionRequired} icon={<AlertCircle />} color="red" />
      </section>

      {/* Needs Action: revision required */}
      {recentProposals.some((p) => p.status === "revision_required") && (
        <Alert className="border-[#fde68a] bg-[#fff8e6] rounded-xl">
          <AlertCircle className="h-4 w-4 text-[#d97706]" />
          <AlertTitle className="text-[#92400e] font-semibold">Revision Requested</AlertTitle>
          <AlertDescription>
            <ul className="space-y-2 mt-2">
              {recentProposals
                .filter((p) => p.status === "revision_required")
                .map((p) => (
                  <li
                    key={p._id}
                    className="flex items-center justify-between bg-white/70 border border-[#fde68a] rounded-lg px-4 py-2"
                  >
                    <span className="text-sm text-[#3d3654]">{p.administrative?.studyTitle || p.title}</span>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-[#8b7cf6] hover:text-[#6d5ce8]"
                      onClick={() => navigate(`/proposals/${p._id}`)}
                    >
                      View &amp; Respond
                    </Button>
                  </li>
                ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Needs Action: returned for correction */}
      {recentProposals.some((p) => p.status === "returned") && (
        <Alert className="border-[#fde68a] bg-[#fff8e6] rounded-xl">
          <AlertCircle className="h-4 w-4 text-[#d97706]" />
          <AlertTitle className="text-[#92400e] font-semibold">Returned for Correction</AlertTitle>
          <AlertDescription>
            <p className="text-sm text-[#a16207] mb-2">
              Admin has returned the following proposals for correction. Please click "Edit" to make changes and resubmit.
            </p>
            <ul className="space-y-2 mt-2">
              {recentProposals
                .filter((p) => p.status === "returned")
                .map((p) => (
                  <li
                    key={p._id}
                    className="flex flex-col bg-white/70 border border-[#fde68a] rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#3d3654] font-bold">{p.administrative?.studyTitle || p.title}</span>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-[#8b7cf6] hover:text-[#6d5ce8] font-bold"
                        onClick={() => navigate(`/proposals/${p._id}/edit`)}
                      >
                        Edit &amp; Resubmit
                      </Button>
                    </div>
                    {p.returnReason && (
                      <div className="text-xs text-[#92400e] bg-[#fffbeb] p-2 rounded border border-[#fde68a] italic">
                        Reason: {p.returnReason}
                      </div>
                    )}
                  </li>
                ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Needs Action: fees pending or rejected */}
      {recentProposals.some((p) => ["Pending", "Payment Pending", "Rejected", ""].includes(p.paymentStatus || "") && p.status === "fees_pending") && (
        <Alert className="border-[#fecdd3] bg-[#fff1f2] rounded-xl">
          <AlertCircle className="h-4 w-4 text-[#e11d48]" />
          <AlertTitle className="text-[#9f1239] font-semibold">Review Fee Payment Required</AlertTitle>
          <AlertDescription>
            <p className="text-sm text-[#be123c] mb-2">
              Please pay the required fees and upload the payment proof to proceed with your submission.
            </p>
            <ul className="space-y-2">
              {recentProposals
                .filter((p) => ["Pending", "Payment Pending", "Rejected", ""].includes(p.paymentStatus || "") && p.status === "fees_pending")
                .map((p) => (
                  <li
                    key={p._id}
                    className="flex items-center justify-between bg-white/70 border border-[#fecdd3] rounded-lg px-4 py-2"
                  >
                    <div>
                      <span className="text-sm text-[#3d3654] font-medium">{p.administrative?.studyTitle || p.title}</span>
                      {p.totalPayable > 0 && (
                        <span className="ml-2 text-xs text-[#be123c] font-bold">Fee: ₹{p.totalPayable}</span>
                      )}
                      {p.paymentStatus === "Rejected" && (
                        <div className="text-[10px] text-red-600 font-bold mt-1">
                          Payment Rejected: {p.rejectionReason}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-[#8b7cf6] hover:text-[#6d5ce8]"
                      onClick={() => navigate(`/proposals/${p._id}/edit`)}
                    >
                      View & Upload Proof
                    </Button>
                  </li>
                ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Proposals Table */}
      <section>
        <h2 className="text-base font-bold text-[#3d3654] mb-4">Recent Proposals</h2>

        <div className="pastel-card overflow-hidden">
          <Table>
            <TableHeader className="bg-[#f8f7ff]">
              <TableRow className="h-auto border-b border-[#e5e1ff]">
                <TableHead className="px-4 py-3 text-xs font-semibold text-[#7c73a0] uppercase tracking-wider w-1/4">Study Title</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-[#7c73a0] uppercase tracking-wider w-1/4">Submitted</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-[#7c73a0] uppercase tracking-wider w-1/4">Status</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-[#7c73a0] uppercase tracking-wider w-1/4">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {recentProposals.length === 0 ? (
                <TableRow className="h-auto">
                  <TableCell colSpan={4} className="px-4 py-8 text-center text-[#a09ac0] text-sm">
                    No proposals submitted yet
                  </TableCell>
                </TableRow>
              ) : (
                recentProposals.map((p) => (
                  <TableRow key={p._id} className="h-auto hover:bg-[#f8f7ff] transition-colors border-b border-[#f0eeff]">
                    <TableCell className="px-4 py-3 text-sm text-[#3d3654] font-medium align-middle">
                      {p.administrative?.studyTitle || p.title}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-[#7c73a0] whitespace-nowrap align-middle">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-middle">
                      {p.status === "fees_pending" && p.paymentStatus && !["Pending", "Payment Pending", "Rejected", ""].includes(p.paymentStatus) ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          p.paymentStatus === "Payment Verified" || p.paymentStatus === "Verified"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : p.paymentStatus === "Under Verification"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {p.paymentStatus === "Under Verification"
                            ? "Payment Under Review"
                            : p.paymentStatus === "Paid"
                            ? "Payment Submitted"
                            : p.paymentStatus === "Payment Verified" || p.paymentStatus === "Verified"
                            ? "Payment Verified"
                            : p.paymentStatus}
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge(p.status)}`}>
                          {p.status.replace("_", " ")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        {/* View Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          title={p.status === "revision_required" ? "Review Feedback" : "View Proposal"}
                          className={`rounded-lg ${p.status === "revision_required" ? "text-[#d97706] bg-[#fff8e6] hover:bg-[#fde68a]/40" : "text-[#7c73a0] hover:bg-[#f0eeff] hover:text-[#8b7cf6]"}`}
                          onClick={() => navigate(`/proposals/${p._id}`)}
                        >
                          {p.status === "revision_required" ? (
                            <MessageSquare className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>

                        {/* Edit Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={!["draft", "revision_required", "returned", "fees_pending", "withdrawn"].includes(p.status)}
                          className={`rounded-lg ${!["draft", "revision_required", "returned", "fees_pending", "withdrawn"].includes(p.status) ? "opacity-40 pointer-events-none text-[#bcb8d8]" : "text-[#8b7cf6] hover:bg-[#ede9ff]"}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/proposals/${p._id}/edit`);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Withdraw Button */}
                        {!["draft", "withdrawn", "approved", "rejected"].includes(p.status) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Withdraw Proposal"
                            className="rounded-lg text-red-500 hover:bg-red-50"
                            onClick={() => handleWithdraw(p._id)}
                          >
                            <Undo2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section >
    </div >
  );
}

/* ── Stat Card ── */
function StatCard({ title, value, icon, color }) {
  const colorMap = {
    lavender: { bg: "bg-[#ede9ff]", text: "text-[#7c3aed]", val: "text-[#3d3654]" },
    amber: { bg: "bg-[#fff8e6]", text: "text-[#d97706]", val: "text-[#3d3654]" },
    mint: { bg: "bg-[#e0f7f1]", text: "text-[#059669]", val: "text-[#3d3654]" },
    red: { bg: "bg-[#fff1f2]", text: "text-[#e11d48]", val: "text-[#3d3654]" },
  };
  const c = colorMap[color];
  return (
    <div className="pastel-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}>
          {icon}
        </div>
        <span className={`text-2xl font-bold ${c.val}`}>{value}</span>
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
    admin_decision_pending: "bg-[#fff8e6] text-[#a16207] border-[#fde68a]",
    under_review: "bg-[#fff8e6] text-[#a16207] border-[#fde68a]",
    approved: "bg-[#e0f7f1] text-[#2d7a65] border-[#b2edd9]",
    revision_required: "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]",
    returned: "bg-[#fff8e6] text-[#d97706] border-[#fde68a]",
    withdrawn: "bg-gray-100 text-gray-500 border-gray-200",
    rejected: "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]",
  }[status] || "bg-[#f0eeff] text-[#6d5ce8] border-[#d4ccff]";
}