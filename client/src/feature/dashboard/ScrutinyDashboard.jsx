import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ClipboardList,
    Clock,
    Eye,
    CheckCircle,
    XCircle,
    FileCheck,
} from "lucide-react";
import api from "../../api/axios";
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

export default function ScrutinyDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pendingProposals, setPendingProposals] = useState([]);
    const [stats, setStats] = useState({ pendingCount: 0, processedCount: 0, verifiedCount: 0 });
    const [confirmation, setConfirmation] = useState({ id: null, decision: null });

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get("/scrutiny/dashboard");
                setPendingProposals(res.data.pending);
                setStats(res.data.stats);
            } catch {
                toast.error("Failed to load scrutiny dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const processAction = async () => {
        const { id, decision } = confirmation;
        if (!id || !decision) return;
        try {
            await api.post(`/scrutiny/${id}/action`, { decision });
            toast.success(
                decision === "approve"
                    ? "SRC approved proposal; admin notified to appoint a reviewer"
                    : "Revision requested from researcher"
            );
            setPendingProposals((prev) => prev.filter((p) => p._id !== id));
            setStats((prev) => ({ ...prev, pendingCount: prev.pendingCount - 1 }));
        } catch {
            toast.error("Failed to process proposal");
        } finally {
            setConfirmation({ id: null, decision: null });
        }
    };

    if (loading) {
        return (
            <div className="p-6 text-[#7c73a0] animate-pulse">
                Loading scrutiny dashboard…
            </div>
        );
    }

    return (
        <div className="space-y-8">

            {/* Header */}
            <section>
                <h1 className="text-2xl font-bold text-[#3d3654]">Scrutiny Dashboard</h1>
                <p className="text-sm text-[#7c73a0] mt-1">
                    Review admin-verified proposals before forwarding to reviewers.
                </p>
            </section>

            {/* Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard title="Pending Scrutiny" value={stats.pendingCount} icon={<Clock />} color="amber" />
                <StatCard title="Scrutiny Verified" value={stats.verifiedCount} icon={<CheckCircle />} color="mint" />
                <StatCard title="Total Processed" value={stats.processedCount} icon={<ClipboardList />} color="lavender" />
            </section>

            {/* Pending Table */}
            <section>
                <h2 className="text-base font-bold text-[#3d3654] mb-4">Pending Verification</h2>

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
                            {pendingProposals.length === 0 ? (
                                <TableRow className="h-auto">
                                    <TableCell colSpan={4} className="px-4 py-8 text-center text-[#a09ac0] text-sm">
                                        No proposals pending scrutiny
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pendingProposals.map((p) => (
                                    <TableRow key={p._id} className="h-auto hover:bg-[#f8f7ff] transition-colors border-b border-[#f0eeff]">
                                        <TableCell className="px-4 py-3 text-sm font-medium text-[#3d3654] align-middle">
                                            {p.title}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-sm text-[#7c73a0] align-middle">
                                            {p.researcher?.shortCode || "N/A"}
                                        </TableCell>
                                        <TableCell className="px-4 py-3 align-middle">
                                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-[#f3e8ff] text-[#9333ea] border-[#e9d5ff]">
                                                {p.status.replace("_", " ")}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 align-middle">
                                            <div className="flex items-center gap-2">
                                                {/* View */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="View Proposal"
                                                    className="rounded-lg text-[#7c73a0] hover:bg-[#f0eeff] hover:text-[#8b7cf6]"
                                                    onClick={() => navigate(`/proposals/${p._id}`)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>

                                                {/* Verify */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Verify & Forward"
                                                    className="rounded-lg text-[#059669] hover:bg-[#e0f7f1] gap-1 text-xs font-semibold"
                                                    onClick={() => setConfirmation({ id: p._id, decision: "approve" })}
                                                >
                                                    <FileCheck className="h-4 w-4" />
                                                    Verify
                                                </Button>

                                                {/* Reject */}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Reject"
                                                    className="rounded-lg text-[#e11d48] hover:bg-[#fff1f2] text-xs font-semibold"
                                                    onClick={() => setConfirmation({ id: p._id, decision: "reject" })}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </section>

            {/* Confirmation Dialog */}
            <AlertDialog
                open={!!confirmation.id}
                onOpenChange={(open) => !open && setConfirmation({ id: null, decision: null })}
            >
                <AlertDialogContent className="border-[#e5e1ff] rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[#3d3654]">
                            {confirmation.decision === "approve" ? "Approve Proposal?" : "Reject Proposal?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[#7c73a0]">
                            {confirmation.decision === "approve"
                                ? "This will approve the proposal and forward it to reviewers. This action cannot be undone."
                                : "This will reject the proposal and return it to the researcher. This action cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-[#e5e1ff] text-[#7c73a0] hover:bg-[#f0eeff] rounded-xl">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={processAction}
                            className={`rounded-xl text-white font-semibold ${confirmation.decision === "reject"
                                ? "bg-[#e11d48] hover:bg-[#c0152f]"
                                : "bg-gradient-to-r from-[#a78bfa] to-[#8b7cf6] hover:from-[#9b72fb]"
                                }`}
                        >
                            {confirmation.decision === "approve" ? "Approve & Forward" : "Reject Proposal"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    const colorMap = {
        amber: { bg: "bg-[#fff8e6]", text: "text-[#d97706]" },
        mint: { bg: "bg-[#e0f7f1]", text: "text-[#059669]" },
        lavender: { bg: "bg-[#ede9ff]", text: "text-[#7c3aed]" },
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
