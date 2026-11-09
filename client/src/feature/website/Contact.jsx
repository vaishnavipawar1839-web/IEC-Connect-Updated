import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Loader2 } from "lucide-react";
import api from "../../api/axios";
import { toast } from "sonner";

const contacts = [
  {
    icon: <Mail className="h-5 w-5" />,
    label: "Email",
    value: "iec@dvpmcnashik.org",
    sub: "We respond within 2 working days",
    href: "mailto:iec@dvpmcnashik.org",
    color: "bg-[#ede9ff] text-[#8b7cf6]",
  },
  {
    icon: <Phone className="h-5 w-5" />,
    label: "Phone",
    value: "+91 253 230 XXXX",
    sub: "Mon–Fri, 9:00 AM – 4:00 PM",
    href: "tel:+912532300000",
    color: "bg-[#e0f7f1] text-[#059669]",
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    label: "Address",
    value: "IEC Office, Dr. VPMC",
    sub: "Adgaon, Nashik – 422 003, Maharashtra",
    href: null,
    color: "bg-[#fce8f3] text-[#db2777]",
  },
  {
    icon: <Clock className="h-5 w-5" />,
    label: "Office Hours",
    value: "Mon – Fri",
    sub: "9:00 AM – 4:00 PM (Lunch: 1–2 PM)",
    href: null,
    color: "bg-[#fff8e6] text-[#d97706]",
  },
];

const faqs = [
  {
    q: "How do I track my proposal status?",
    a: "Log in to EthixPortal. Your Dashboard shows real-time status for all submitted proposals including current stage, reviewer comments, and decisions.",
  },
  {
    q: "Can I submit a physical application?",
    a: "No. The IEC only accepts online submissions through EthixPortal. Physical submissions are not accepted.",
  },
  {
    q: "What happens if I need to amend an approved protocol?",
    a: "Protocol amendments must be submitted on EthixPortal before implementation. The IEC will review the amendment and issue an approval for the amendment.",
  },
  {
    q: "How long does the review process take?",
    a: "Exemption reviews take 7–10 working days. Expedited reviews take 14–21 days. Full committee reviews take 21–30 working days.",
  },
  {
    q: "Is the review fee refundable?",
    a: "No. Review fees are non-refundable once the submission is accepted and the review process begins.",
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/public/contact", {
        name: form.name,
        email: form.email,
        message: `[Subject: ${form.subject}] ${form.message}`
      });
      setSent(true);
      toast.success("Query submitted.");
    } catch {
      toast.error("Failed to submit query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#ede9ff] to-[#f8f7ff] py-16 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#e5e1ff] text-[#8b7cf6] text-xs font-semibold shadow-sm mb-5">
            <Mail className="h-3.5 w-3.5" /> Get in touch
          </div>
          <h1 className="text-4xl font-extrabold text-[#3d3654] mb-4">Contact Us</h1>
          <p className="text-[#7c73a0] text-lg leading-relaxed max-w-2xl mx-auto">
            Have a question about the submission process or your proposal? The IEC office is happy to help.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="max-w-5xl mx-auto px-5 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {contacts.map((c) => (
            <div key={c.label} className="bg-white rounded-2xl border border-[#e5e1ff] p-5 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${c.color}`}>
                {c.icon}
              </div>
              <p className="text-xs font-semibold text-[#a09ac0] uppercase tracking-wider mb-1">{c.label}</p>
              <p className="text-sm font-bold text-[#3d3654] mb-0.5">
                {c.href ? <a href={c.href} className="hover:text-[#8b7cf6] transition-colors">{c.value}</a> : c.value}
              </p>
              <p className="text-xs text-[#a09ac0]">{c.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-[#3d3654] mb-6">Send a Message</h2>
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-[#059669]" />
                <h3 className="text-lg font-bold text-[#3d3654]">Message Sent!</h3>
                <p className="text-[#7c73a0] text-sm">Your query has been submitted successfully.</p>
                <button
                  onClick={() => { setForm({ name: "", email: "", subject: "", message: "" }); setSent(false); }}
                  className="text-sm text-[#8b7cf6] underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#7c73a0] mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      disabled={loading}
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#e5e1ff] text-sm text-[#3d3654] focus:outline-none focus:ring-2 focus:ring-[#c4b8ff] bg-white disabled:opacity-50"
                      placeholder="Dr. Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#7c73a0] mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      disabled={loading}
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#e5e1ff] text-sm text-[#3d3654] focus:outline-none focus:ring-2 focus:ring-[#c4b8ff] bg-white disabled:opacity-50"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7c73a0] mb-1.5">Subject *</label>
                  <input
                    type="text"
                    disabled={loading}
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e5e1ff] text-sm text-[#3d3654] focus:outline-none focus:ring-2 focus:ring-[#c4b8ff] bg-white disabled:opacity-50"
                    placeholder="Question about fee payment..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7c73a0] mb-1.5">Message *</label>
                  <textarea
                    required
                    disabled={loading}
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#e5e1ff] text-sm text-[#3d3654] focus:outline-none focus:ring-2 focus:ring-[#c4b8ff] bg-white resize-y disabled:opacity-50"
                    placeholder="Describe your query in detail..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#8b7cf6] text-white font-bold text-sm shadow hover:shadow-md transition-all disabled:grayscale disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Send Message</>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-[#3d3654] mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <details key={i} className="group border border-[#e5e1ff] rounded-2xl bg-white open:shadow-sm transition-all">
                  <summary className="px-5 py-4 cursor-pointer text-sm font-semibold text-[#3d3654] flex items-center justify-between list-none select-none">
                    {f.q}
                    <span className="text-[#a09ac0] group-open:rotate-180 transition-transform duration-200 font-normal text-base">+</span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-[#7c73a0] leading-relaxed border-t border-[#f0eeff] pt-3">
                    {f.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
