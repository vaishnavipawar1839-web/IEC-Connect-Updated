import { Link } from "react-router-dom";
import { ChevronRight, FileText, Users, Clock, Shield, CheckCircle2, ArrowRight, Megaphone } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../api/axios";

const stats = [
  { label: "Active Protocols", value: "120+", color: "bg-[#ede9ff] text-[#8b7cf6]" },
  { label: "Approved Studies", value: "850+", color: "bg-[#e0f7f1] text-[#059669]" },
  { label: "Registered Researchers", value: "300+", color: "bg-[#fce8f3] text-[#db2777]" },
  { label: "Avg. Review Time", value: "21 Days", color: "bg-[#fff8e6] text-[#d97706]" },
];

const steps = [
  { num: "01", title: "Register", desc: "Create your researcher account on the portal." },
  { num: "02", title: "Prepare Documents", desc: "Gather all required protocol, consent, and investigator documents." },
  { num: "03", title: "Submit Proposal", desc: "Fill the multi-section submission form and upload your files." },
  { num: "04", title: "Pay Review Fee", desc: "Transfer the applicable fee and upload your payment receipt." },
  { num: "05", title: "Await Review", desc: "The IEC Scrutiny & Reviewer committee evaluates your proposal." },
  { num: "06", title: "Get Approval", desc: "Receive your approval letter and proceed with the study." },
];

export default function WebsiteHome() {
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get("/public/announcements");
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.announcements || []);
        setRecentAnnouncements(data.slice(0, 3)); // Get top 3
      } catch {
        console.error("Failed to fetch announcements");
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#ede9ff] via-[#f8f7ff] to-[#fce8f3] py-24 px-5">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#e5e1ff] text-[#8b7cf6] text-xs font-semibold shadow-sm mb-6">
            <Shield className="h-3.5 w-3.5" /> Institutional Ethics Committee — Dr. VPMC Nashik
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#3d3654] leading-tight mb-6">
            Ethical Research,<br />
            <span className="bg-gradient-to-r from-[#a78bfa] to-[#8b7cf6] bg-clip-text text-transparent">
              Simplified.
            </span>
          </h1>
          <p className="text-lg text-[#7c73a0] max-w-2xl mx-auto mb-10 leading-relaxed">
            EthixPortal is the official proposal management system of the Institutional Ethics Committee of Dr. Vasantrao Pawar Medical College, Hospital &amp; Research Centre, Nashik.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#a78bfa] to-[#8b7cf6] text-white font-bold shadow-lg hover:shadow-xl hover:from-[#9b72fb] transition-all text-sm"
            >
              Submit a Proposal <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              to="/guidelines"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white border border-[#e5e1ff] text-[#7c73a0] font-semibold shadow-sm hover:bg-[#f5f3ff] transition-all text-sm"
            >
              Submission Guidelines <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        {/* decorative blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#c4b8ff]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#f9a8d4]/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ── Recent Announcements Widget ── */}
      {Array.isArray(recentAnnouncements) && recentAnnouncements.length > 0 && (
        <section className="max-w-5xl mx-auto px-5 -mt-6 relative z-20 mb-10">
          <div className="bg-gradient-to-r from-[#a78bfa] to-[#8b7cf6] text-white rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 font-bold shrink-0 bg-white/20 px-3 py-1.5 rounded-lg text-sm">
              <Megaphone className="h-4 w-4" /> Latest Updates
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="animate-[marquee_20s_linear_infinite] whitespace-nowrap text-sm font-medium">
                {recentAnnouncements.map((ann) => (
                  <span key={ann._id} className="mx-4 inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#fde68a]"></span>
                    {ann.title}
                  </span>
                ))}
              </div>
            </div>
            <Link to="/announcements" className="shrink-0 text-xs font-bold bg-white text-[#8b7cf6] px-3 py-1.5 rounded-lg hover:bg-[#f0eeff] transition">
              View All
            </Link>
          </div>
        </section>
      )}

      {/* ── Stats ── */}
      <section className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 px-5 relative z-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#e5e1ff] shadow-sm p-5 text-center">
            <p className={`text-3xl font-extrabold mb-1 ${s.color.split(" ")[1]}`}>{s.value}</p>
            <p className="text-xs text-[#7c73a0] font-medium">{s.label}</p>
          </div>
        ))}
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-5xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#3d3654] mb-3">How It Works</h2>
          <p className="text-[#7c73a0]">A transparent, step-by-step review process for all research proposals.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((s) => (
            <div key={s.num} className="bg-white rounded-2xl border border-[#e5e1ff] p-6 hover:shadow-md transition-shadow">
              <span className="text-4xl font-extrabold text-[#ede9ff] leading-none block mb-3">{s.num}</span>
              <h3 className="text-base font-bold text-[#3d3654] mb-1">{s.title}</h3>
              <p className="text-sm text-[#7c73a0] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick Links ── */}
      <section className="bg-gradient-to-r from-[#ede9ff] to-[#fce8f3] py-16 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#3d3654] mb-8">Explore the Portal</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: "/about", icon: <Users className="h-6 w-6" />, label: "About IEC" },
              { to: "/guidelines", icon: <FileText className="h-6 w-6" />, label: "Submission Guidelines" },
              { to: "/documents-required", icon: <CheckCircle2 className="h-6 w-6" />, label: "Required Documents" },
              { to: "/announcements", icon: <Clock className="h-6 w-6" />, label: "Announcements" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center gap-3 bg-white rounded-2xl border border-[#e5e1ff] p-6 hover:shadow-md hover:-translate-y-0.5 transition-all text-[#7c73a0] hover:text-[#8b7cf6]"
              >
                <div className="p-3 rounded-xl bg-[#ede9ff] text-[#8b7cf6]">{item.icon}</div>
                <span className="text-sm font-semibold text-[#3d3654]">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-5xl mx-auto px-5 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-[#8b7cf6] to-[#a78bfa] p-10 text-center shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Submit Your Research?</h2>
          <p className="text-[#ede9ff] mb-7 text-sm">
            Create your researcher account and start the ethical clearance process today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#8b7cf6] font-bold text-sm hover:bg-[#f5f3ff] transition-colors shadow"
            >
              Create Account <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 text-white font-semibold text-sm hover:bg-white/30 transition-colors border border-white/30"
            >
              Already have an account? Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
