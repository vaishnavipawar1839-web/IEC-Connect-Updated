import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  Eye,
  FileSearch,
  AlertCircle,
} from "lucide-react";
import api from "../../api/axios";
import { toast } from "sonner";

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

export default function ReviewerDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [assignedProposals, setAssignedProposals] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard/reviewer");
        setStats(res.data.stats);
        setAssignedProposals(res.data.assignedProposals);
      } catch {
        toast.error("Failed to load reviewer dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-[#7c73a0] animate-pulse">
        Loading reviewer dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <section>
        <h1 className="text-2xl font-bold text-[#3d3654]">Reviewer Dashboard</h1>
        <p className="text-sm text-[#7c73a0] mt-1">
          You have{" "}
          <span className="font-semibold text-[#3d3654]">{stats.pending}</span>{" "}
          proposals awaiting review.
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Assigned Proposals" value={stats.totalAssigned} icon={<ClipboardList />} color="lavender" />
        <StatCard title="Pending Reviews" value={stats.pending} icon={<Clock />} color="amber" />
        <StatCard title="Completed Reviews" value={stats.completed} icon={<CheckCircle />} color="mint" />
      </section>

      {/* Needs Attention */}
      {assignedProposals.some((p) => p.status === "under_review") && (
        <Alert className="border-[#fde68a] bg-[#fff8e6] rounded-xl">
          <AlertCircle className="h-4 w-4 text-[#d97706]" />
          <AlertTitle className="text-[#92400e] font-semibold">Pending Reviews</AlertTitle>
          <AlertDescription>
            <ul className="space-y-1 mt-2 text-sm">
              {assignedProposals
                .filter((p) => p.status === "under_review")
                .map((p) => (
                  <li key={p._id} className="flex items-center justify-between">
                    <span className="text-[#3d3654]">{p.title}</span>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-[#8b7cf6] hover:text-[#6d5ce8]"
                      onClick={() => navigate(`/documents/${p._id}`)}
                    >
                      Review →
                    </Button>
                  </li>
                ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Assigned Proposals Table */}
      <section>
        <h2 className="text-base font-bold text-[#3d3654] mb-4">Assigned Proposals</h2>

        <div className="pastel-card overflow-hidden">
          <Table>
            <TableHeader className="bg-[#f8f7ff]">
              <TableRow className="h-auto border-b border-[#e5e1ff]">
                <TableHead className="px-4 py-3 text-xs font-semibold text-[#7c73a0] uppercase tracking-wider w-1/4">Study Title</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-[#7c73a0] uppercase tracking-wider w-1/4">Researcher ID</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-[#7c73a0] uppercase tracking-wider w-1/4">Status</TableHead>
                <TableHead className="px-4 py-3 text-xs font-semibold text-[#7c73a0] uppercase tracking-wider w-1/4">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {assignedProposals.length === 0 ? (
                <TableRow className="h-auto">
                  <TableCell colSpan={4} className="px-4 py-8 text-center text-[#a09ac0] text-sm">
                    No proposals assigned yet
                  </TableCell>
                </TableRow>
              ) : (
                assignedProposals.map((p) => (
                  <TableRow key={p._id} className="h-auto hover:bg-[#f8f7ff] transition-colors border-b border-[#f0eeff]">
                    <TableCell className="px-4 py-3 text-sm font-medium text-[#3d3654] align-middle">
                      {p.administrative?.studyTitle || p.title}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-[#7c73a0] align-middle">
                      {p.researcher?.shortCode || "N/A"}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-middle">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge(p.status)}`}>
                        {p.status.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View Proposal"
                          className="rounded-lg text-[#7c73a0] hover:bg-[#f0eeff] hover:text-[#8b7cf6]"
                          onClick={() => navigate(`/proposals/${p._id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {p.status === "under_review" && !p.myReviewSubmitted && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Review Proposal"
                            className="rounded-lg text-[#8b7cf6] hover:bg-[#ede9ff]"
                            onClick={() => navigate(`/proposals/${p._id}`)}
                          >
                            <FileSearch className="h-4 w-4" />
                          </Button>
                        )}
                        {(p.status !== "under_review" || p.myReviewSubmitted) && (
                          <span className="text-[10px] uppercase font-bold text-[#a09ac0] tracking-wider">
                            {p.status === "admin_decision_pending"
                              ? "Awaiting Admin Decision"
                              : p.status === "under_review" && p.myReviewSubmitted
                                ? "Recommendation Submitted"
                                : p.status === "revision_required"
                                  ? "Awaiting Revision"
                                  : "Completed"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorMap = {
    lavender: { bg: "bg-[#ede9ff]", text: "text-[#7c3aed]" },
    amber: { bg: "bg-[#fff8e6]", text: "text-[#d97706]" },
    mint: { bg: "bg-[#e0f7f1]", text: "text-[#059669]" },
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
    under_review: "bg-[#fff8e6] text-[#a16207] border-[#fde68a]",
    admin_decision_pending: "bg-[#fff8e6] text-[#a16207] border-[#fde68a]",
    approved: "bg-[#e0f7f1] text-[#2d7a65] border-[#b2edd9]",
    rejected: "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]",
  }[status] || "bg-[#f0eeff] text-[#6d5ce8] border-[#d4ccff]";
}