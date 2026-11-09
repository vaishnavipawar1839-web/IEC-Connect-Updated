import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, FileText, Download, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "sonner";

const sections = [
  {
    title: "Administrative Documents",
    color: "border-[#a78bfa] bg-[#f5f3ff]",
    iconColor: "text-[#8b7cf6]",
    docs: [
      { name: "Cover Letter", required: true, note: "Addressed to the IEC Chairperson, signed by PI" },
      { name: "CV of Principal Investigator", required: true, note: "Current, signed, with date" },
      { name: "CV of all Co-Investigators", required: true, note: "Current, signed, with date" },
      { name: "EC Fee Payment Receipt", required: true, note: "For applicable study types only" },
      { name: "HOD Approval Letter", required: true, note: "Signed by Head of Department" },
      { name: "Principal Approval", required: true, note: "Signed by Principal of the Institution" },
      { name: "Other Administrative Documents", required: false, note: "Any other relevant approvals" },
    ],
  },
  {
    title: "Protocol Documents",
    color: "border-[#6ee7b7] bg-[#f0fdf9]",
    iconColor: "text-[#059669]",
    docs: [
      { name: "Detailed Research Protocol", required: true, note: "As per IEC standard template" },
      { name: "Participant Information Sheet (PIS) — English", required: true, note: "Clear, jargon-free language" },
      { name: "Participant Information Sheet (PIS) — Local Language", required: true, note: "Translated and back-translated version" },
      { name: "Informed Consent Form (ICF) — English", required: true, note: "Signed consent form template" },
      { name: "Informed Consent Form (ICF) — Local Language", required: true, note: "Translated version" },
      { name: "Investigators Brochure", required: false, note: "Required for drug/device/biological trials only" },
      { name: "All Other Proposal Documents", required: false, note: "Questionnaires, case record forms, etc." },
    ],
  },
  {
    title: "Clinical Trial Specific (if applicable)",
    color: "border-[#fcd34d] bg-[#fffbeb]",
    iconColor: "text-[#d97706]",
    docs: [
      { name: "Clinical Trial Agreement (CTA)", required: false, note: "For sponsored clinical trials" },
      { name: "Material Transfer Agreement (MTA)", required: false, note: "If biological samples are to be transferred" },
      { name: "Memorandum of Understanding (MOU)", required: false, note: "For multi-site studies" },
      { name: "Insurance Certificate", required: false, note: "Participant indemnity/insurance coverage" },
      { name: "Indemnity Policy", required: false, note: "Sponsor/CRO indemnity bond" },
      { name: "DCGI Approval", required: false, note: "For regulated clinical trials" },
      { name: "Regulatory Approvals", required: false, note: "Other statutory approvals" },
      { name: "GCP Training Certificates", required: false, note: "For all clinical trial team members" },
    ],
  },
];

const feeTable = [
  { category: "Pharma Sponsored Projects / Clinical Trials", fee: "₹95,000 + 18% GST", account: "0458104000255486" },
  { category: "Investigator Initiated Clinical Trials (IICT)", fee: "₹30,000 + 18% GST", account: "0458104000255486" },
  { category: "Biomedical Studies from Outside the Institute", fee: "₹10,000", account: "0458104000255486" },
  { category: "PG Student Thesis / Dissertation", fee: "₹5,000", account: "0458104000229821" },
  { category: "Other Academic (OA) — DNB, DM, Nursing, PhD", fee: "₹5,000", account: "0458104000229821" },
  { category: "UG / Faculty / PG Student Research (non-thesis)", fee: "NIL", account: "N/A" },
];

export default function RequiredDocuments() {
  const [adminDocs, setAdminDocs] = useState([]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get("/public/documents");
        setAdminDocs(res.data);
      } catch {
        toast.error("Failed to load official download templates.");
      }
    };
    fetchDocs();
  }, []);

  const downloadFile = (fileUrl, fileName) => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    a.click();
  };

  const getMatchedFile = (docName, sectionTitle) => {
    // Exact mapping logic for structured categories
    let category = "Administrative Documents";
    if (sectionTitle.includes("Protocol")) category = "Protocol Documents";
    if (sectionTitle.includes("Clinical")) category = "Clinical Trial Specific";

    return adminDocs.find(
      (ad) => 
        ad.category === category && 
        ad.subCategory?.toLowerCase().trim() === docName.toLowerCase().trim()
    );
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#ede9ff] to-[#f8f7ff] py-16 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#e5e1ff] text-[#8b7cf6] text-xs font-semibold shadow-sm mb-5">
            <FileText className="h-3.5 w-3.5" /> Document Checklist
          </div>
          <h1 className="text-4xl font-extrabold text-[#3d3654] mb-4">Required Documents</h1>
          <p className="text-[#7c73a0] text-lg leading-relaxed max-w-2xl mx-auto">
            Ensure all documents are prepared and uploaded before submission. Incomplete submissions will be returned without review.
          </p>
        </div>
      </section>

      {/* Document Checklist Sections */}
      <section className="max-w-5xl mx-auto px-5 py-8 space-y-8">
        <h2 className="text-lg font-bold text-[#3d3654] mb-4">Submission Checklist</h2>
        {sections.map((s) => (
          <div key={s.title} className={`rounded-2xl border-l-4 ${s.color} p-6 shadow-sm bg-white`}>
            <h3 className="text-base font-bold text-[#3d3654] mb-4">{s.title}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5e1ff]">
                    <th className="text-left py-2 pr-4 text-[#7c73a0] font-semibold text-xs uppercase tracking-wider">Document</th>
                    <th className="text-left py-2 pr-4 text-[#7c73a0] font-semibold text-xs uppercase tracking-wider w-24">Required</th>
                    <th className="text-left py-2 text-[#7c73a0] font-semibold text-xs uppercase tracking-wider">Notes</th>
                    <th className="text-right py-2 text-[#7c73a0] font-semibold text-xs uppercase tracking-wider w-32">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0eeff]">
                  {s.docs.map((d) => {
                    const matched = getMatchedFile(d.name, s.title);
                    return (
                    <tr key={d.name}>
                      <td className="py-3 pr-4 font-medium text-[#3d3654]">{d.name}</td>
                      <td className="py-3 pr-4">
                        {d.required ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#059669]">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#7c73a0]">
                            <XCircle className="h-3.5 w-3.5" /> Optional
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-[#7c73a0] text-xs">{d.note}</td>
                      <td className="py-3 text-right">
                        {matched ? (
                          <button
                            onClick={() => downloadFile(matched.fileUrl, matched.fileName)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f0eeff] text-[#6d5ce8] hover:bg-[#8b7cf6] hover:text-white rounded-lg transition-all text-[10px] font-bold border border-[#e5e1ff]"
                          >
                            <Download className="h-3 w-3" /> Download
                          </button>
                        ) : (
                          <span className="text-[10px] font-medium text-[#a09ac0] italic">Not Available</span>
                        )}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      {/* Fee Table */}
      <section className="bg-[#f8f7ff] py-14 px-5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#3d3654] mb-2 text-center">Review Fee Schedule</h2>
          <p className="text-[#7c73a0] text-sm mb-8 text-center">Transfer to the applicable IDBI Bank account and upload your receipt on the portal.</p>
          <div className="bg-white rounded-2xl border border-[#e5e1ff] overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-[#f8f7ff] border-b border-[#e5e1ff]">
                <tr>
                  <th className="text-left px-5 py-3 text-[#7c73a0] font-semibold text-xs uppercase tracking-wider">Project Category</th>
                  <th className="text-left px-5 py-3 text-[#7c73a0] font-semibold text-xs uppercase tracking-wider">Fee</th>
                  <th className="text-left px-5 py-3 text-[#7c73a0] font-semibold text-xs uppercase tracking-wider">Account Number (IDBI)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eeff]">
                {feeTable.map((row) => (
                  <tr key={row.category} className="hover:bg-[#f8f7ff] transition-colors">
                    <td className="px-5 py-3 text-[#3d3654] font-medium">{row.category}</td>
                    <td className={`px-5 py-3 font-bold ${row.fee === "NIL" ? "text-[#059669]" : "text-[#be185d]"}`}>{row.fee}</td>
                    <td className="px-5 py-3 text-[#7c73a0] font-mono text-xs">{row.account}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#a09ac0] mt-3 text-center">
            Bank: IDBI Bank, M.G. Road, Nashik — IFS Code: IBKL0000458 — Account Name: Dean, Dr. Vasantrao Pawar Medical College, Nashik
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-5 py-14 text-center">
        <h2 className="text-xl font-bold text-[#3d3654] mb-3">Documents ready?</h2>
        <p className="text-[#7c73a0] text-sm mb-6">Log in to EthixPortal and begin your submission.</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#8b7cf6] text-white font-bold text-sm shadow hover:shadow-md transition-all"
        >
          Submit Proposal →
        </Link>
      </section>
    </div>
  );
}
