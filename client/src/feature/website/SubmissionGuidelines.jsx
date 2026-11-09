import { Link } from "react-router-dom";
import { FileText, Clock, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";

const phases = [
  {
    phase: "Phase 1",
    title: "Pre-Submission Preparation",
    color: "border-[#a78bfa] bg-[#f5f3ff]",
    badge: "bg-[#ede9ff] text-[#8b7cf6]",
    items: [
      "Prepare a detailed research protocol as per IEC template.",
      "Obtain approvals from Head of Department and Principal of the Institution.",
      "Prepare Participant Information Sheet (PIS) in English and local language.",
      "Design Informed Consent Form (ICF) in English and local language.",
      "Arrange for CV of Principal Investigator and all Co-Investigators.",
      "Determine applicable fee category based on type of project.",
    ],
  }, 
  {
    phase: "Phase 2",
    title: "Online Submission",
    color: "border-[#6ee7b7] bg-[#f0fdf9]",
    badge: "bg-[#e0f7f1] text-[#059669]",
    items: [
      "Register on EthixPortal and log in as a researcher.",
      "Navigate to 'New Proposal' and complete all 6 sections of the form.",
      "Upload all required documents in Section F.",
      "Review your submission carefully before clicking 'Submit Proposal'.",
      "The system will calculate applicable fees automatically.",
      "You will receive a confirmation and unique Protocol ID.",
    ],
  },
  {
    phase: "Phase 3",
    title: "Fee Payment",
    color: "border-[#f9a8d4] bg-[#fdf5f9]",
    badge: "bg-[#fce8f3] text-[#db2777]",
    items: [
      "Transfer the applicable fee to the designated IDBI Bank account.",
      "Retain the bank transaction receipt / screenshot.",
      "Upload the payment receipt on EthixPortal under your proposal.",
      "Admin will verify the payment before forwarding to Scrutiny.",
      "Fee is non-refundable once the review process begins.",
    ],
  },
  {
    phase: "Phase 4",
    title: "Review Process",
    color: "border-[#fcd34d] bg-[#fffbeb]",
    badge: "bg-[#fff8e6] text-[#d97706]",
    items: [
      "Admin verifies submission and fee; forwards to Scrutiny Committee.",
      "Scrutiny Committee performs initial scientific and administrative check.",
      "Proposal assigned to qualified Reviewers for detailed evaluation.",
      "Reviewers may request revisions, approve, or recommend rejection.",
      "If revision is requested, researcher is notified to resubmit.",
      "Full Committee meeting may be required for full-review proposals.",
    ],
  },
  {
    phase: "Phase 5",
    title: "Approval & Post-Approval",
    color: "border-[#93c5fd] bg-[#eff6ff]",
    badge: "bg-[#e0f2fe] text-[#0369a1]",
    items: [
      "Approved proposals receive an IEC Approval Letter with unique ID.",
      "Download your approval letter from EthixPortal.",
      "Report any Protocol Amendments for IEC review before implementation.",
      "Submit Progress Reports as required (usually annually).",
      "Report Serious Adverse Events (SAE) immediately to the IEC.",
      "Submit Study Completion Report upon conclusion of study.",
    ],
  },
];

export default function SubmissionGuidelines() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#ede9ff] to-[#f8f7ff] py-16 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#e5e1ff] text-[#8b7cf6] text-xs font-semibold shadow-sm mb-5">
            <FileText className="h-3.5 w-3.5" /> Submission Process
          </div>
          <h1 className="text-4xl font-extrabold text-[#3d3654] mb-4">Submission Guidelines</h1>
          <p className="text-[#7c73a0] text-lg leading-relaxed max-w-2xl mx-auto">
            Follow this step-by-step guide to ensure your research proposal is complete, compliant, and processed efficiently.
          </p>
        </div>
      </section>

      {/* Important Notice */}
      <div className="max-w-5xl mx-auto px-5 pt-10">
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-[#fde68a] bg-[#fffbeb]">
          <AlertTriangle className="h-5 w-5 text-[#d97706] shrink-0 mt-0.5" />
          <p className="text-sm text-[#92400e]">
            <strong>Important:</strong> Incomplete submissions will be returned without review. Ensure all required documents are uploaded and the correct fee is paid before submitting. Review our{" "}
            <Link to="/documents-required" className="underline font-semibold hover:text-[#d97706]">Required Documents checklist</Link> before proceeding.
          </p>
        </div>
      </div>

      {/* Phase Steps */}
      <section className="max-w-5xl mx-auto px-5 py-12 space-y-6">
        {phases.map((p) => (
          <div key={p.phase} className={`rounded-2xl border-l-4 ${p.color} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${p.badge}`}>{p.phase}</span>
              <h2 className="text-lg font-bold text-[#3d3654]">{p.title}</h2>
            </div>
            <ul className="space-y-2">
              {p.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#7c73a0]">
                  <CheckCircle2 className="h-4 w-4 text-[#8b7cf6] shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Timeline */}
      <section className="bg-[#f8f7ff] py-14 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#3d3654] mb-4">Expected Timeline</h2>
          <p className="text-[#7c73a0] text-sm mb-8">Typical review durations — may vary based on protocol complexity.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { type: "Exemption Review", time: "7–10 working days", color: "text-[#059669]" },
              { type: "Expedited Review", time: "14–21 working days", color: "text-[#d97706]" },
              { type: "Full Committee Review", time: "21–30 working days", color: "text-[#8b7cf6]" },
            ].map((t) => (
              <div key={t.type} className="rounded-2xl bg-white border border-[#e5e1ff] p-5 text-center">
                <Clock className={`h-6 w-6 mx-auto mb-2 ${t.color}`} />
                <p className="text-xs font-semibold text-[#3d3654] mb-1">{t.type}</p>
                <p className={`text-base font-bold ${t.color}`}>{t.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-5 py-14 text-center">
        <h2 className="text-xl font-bold text-[#3d3654] mb-3">Ready to begin?</h2>
        <p className="text-[#7c73a0] text-sm mb-6">Log in to EthixPortal to start your submission.</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#8b7cf6] text-white font-bold text-sm shadow hover:shadow-md transition-all"
        >
          Go to Portal <ChevronRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
