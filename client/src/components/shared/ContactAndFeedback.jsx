import { useState, useEffect } from "react";
import { Star, Mail, Send, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "../../api/axios";

export default function ContactAndFeedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

    // Contact form state
    const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
    const [sendingContact, setSendingContact] = useState(false);

    // Feedback form state
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedbackForm, setFeedbackForm] = useState({ name: "", role: "", text: "" });
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const res = await api.get("/public/feedbacks");
            setFeedbacks(res.data);
        } catch (error) {
            console.error("Error fetching feedbacks", error);
        } finally {
            setLoadingFeedbacks(false);
        }
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        if (!contactForm.name || !contactForm.email || !contactForm.message) {
            return toast.error("Please fill all fields");
        }
        setSendingContact(true);
        try {
            await api.post("/public/contact", contactForm);
            toast.success("Message sent successfully!");
            setContactForm({ name: "", email: "", message: "" });
        } catch {
            toast.error("Failed to send message. Try again later.");
        } finally {
            setSendingContact(false);
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!feedbackForm.name || !feedbackForm.role || !feedbackForm.text) {
            return toast.error("Please fill all fields");
        }
        setSubmittingFeedback(true);
        try {
            await api.post("/public/feedbacks", feedbackForm);
            toast.success("Feedback submitted successfully!");
            setFeedbackForm({ name: "", role: "", text: "" });
            setShowFeedbackForm(false);
            fetchFeedbacks(); // Refresh list
        } catch {
            toast.error("Failed to submit feedback. Try again later.");
        } finally {
            setSubmittingFeedback(false);
        }
    };

    return (
        <div className="space-y-16 mt-16">
            {/* ── TESTIMONIALS & FEEDBACK ── */}
            <section>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-4">
                    <h2 className="text-lg font-bold text-[#3d3654]">What Users Say</h2>
                    <Button
                        variant="outline"
                        className="border-[#e5e1ff] text-[#6d5ce8] hover:bg-[#f0eeff] rounded-xl font-semibold h-9 px-3 text-xs"
                        onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                    >
                        <Plus className="h-3 w-3 mr-1.5" />
                        {showFeedbackForm ? "Cancel" : "Leave Feedback"}
                    </Button>
                </div>

                {showFeedbackForm && (
                    <div className="bg-[#f8f7ff] border border-[#e5e1ff] rounded-xl p-5 mb-6 max-w-2xl animate-in fade-in slide-in-from-top-2">
                        <h3 className="text-sm font-bold text-[#3d3654] mb-3">Submit Your Feedback</h3>
                        <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Input
                                    placeholder="Your Name"
                                    value={feedbackForm.name}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                                    className="bg-white border-[#e5e1ff] text-[#3d3654] rounded-xl"
                                />
                                <Input
                                    placeholder="Your Role (e.g. Researcher, Admin)"
                                    value={feedbackForm.role}
                                    onChange={(e) => setFeedbackForm({ ...feedbackForm, role: e.target.value })}
                                    className="bg-white border-[#e5e1ff] text-[#3d3654] rounded-xl"
                                />
                            </div>
                            <Textarea
                                placeholder="Share your experience..."
                                rows={3}
                                value={feedbackForm.text}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, text: e.target.value })}
                                className="bg-white border-[#e5e1ff] text-[#3d3654] rounded-xl resize-none"
                            />
                            <Button
                                type="submit"
                                disabled={submittingFeedback}
                                className="bg-gradient-to-r from-[#a78bfa] to-[#8b7cf6] text-white rounded-xl font-semibold hover:from-[#9b72fb] hover:to-[#7c6de8]"
                            >
                                {submittingFeedback ? "Submitting..." : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" /> Submit Feedback
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {loadingFeedbacks ? (
                        <p className="text-sm text-[#7c73a0]">Loading feedbacks...</p>
                    ) : feedbacks.length > 0 ? (
                        feedbacks.map((fb) => (
                            <FeedbackCard key={fb._id} name={fb.name} role={fb.role} text={fb.text} />
                        ))
                    ) : (
                        <p className="text-sm text-[#7c73a0]">No feedbacks yet. Be the first to leave one!</p>
                    )}
                </div>
            </section>

            {/* ── CONTACT ── */}
            <section className="bg-white border border-[#e5e1ff] rounded-2xl p-8 mb-8 shadow-sm">
                <h2 className="text-lg font-bold text-[#3d3654] mb-1">Contact Us</h2>
                <p className="text-sm text-[#7c73a0] mb-6">
                    Have questions or need support? Reach out to the IEC team.
                </p>

                <form onSubmit={handleContactSubmit} className="space-y-3 max-w-lg">
                    <Input
                        placeholder="Your Name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="bg-[#f8f7ff] border-[#e5e1ff] placeholder:text-[#bcb8d8] text-[#3d3654] rounded-xl focus-visible:ring-[#c4b8ff]"
                    />
                    <Input
                        type="email"
                        placeholder="Your Email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="bg-[#f8f7ff] border-[#e5e1ff] placeholder:text-[#bcb8d8] text-[#3d3654] rounded-xl focus-visible:ring-[#c4b8ff]"
                    />
                    <Textarea
                        placeholder="Your Message"
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="bg-[#f8f7ff] border-[#e5e1ff] placeholder:text-[#bcb8d8] text-[#3d3654] rounded-xl focus-visible:ring-[#c4b8ff] resize-none"
                    />
                    <Button
                        type="submit"
                        disabled={sendingContact}
                        className="bg-gradient-to-r from-[#a78bfa] to-[#8b7cf6] text-white rounded-xl font-semibold hover:from-[#9b72fb] hover:to-[#7c6de8]"
                    >
                        {sendingContact ? "Sending..." : (
                            <>
                                <Mail className="h-4 w-4 mr-2" /> Send Message
                            </>
                        )}
                    </Button>
                </form>
            </section>
        </div>
    );
}

function FeedbackCard({ name, role, text }) {
    return (
        <div className="pastel-card p-6 border border-[#e5e1ff] rounded-2xl bg-[#f8f7ff]">
            <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[#fcd34d] text-[#fcd34d]" />
                ))}
            </div>
            <p className="text-sm text-[#7c73a0] leading-relaxed mb-4">"{text}"</p>
            <div className="text-sm font-semibold text-[#3d3654]">{name}</div>
            <div className="text-xs text-[#a09ac0] mt-0.5">{role}</div>
        </div>
    );
}
