import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { Shield, Eye, EyeOff, FlaskConical, BookOpen, Users, UserCog, ArrowLeft, CheckCircle2, Home } from "lucide-react";
import api from "../../api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ── Role definitions ─────────────────────────────────────── */
const ROLES = [
  {
    key: "researcher",
    label: "Researcher",
    sub: "Submit protocols & track approvals",
    icon: FlaskConical,
    gradient: "from-[#a78bfa] to-[#8b7cf6]",
    bg: "bg-[#ede9ff]",
    border: "border-[#c4b8ff]",
    text: "text-[#6d5ce8]",
    ring: "ring-[#a78bfa]",
  },
  {
    key: "reviewer",
    label: "Reviewer",
    sub: "Evaluate assigned proposals",
    icon: BookOpen,
    gradient: "from-[#34d399] to-[#059669]",
    bg: "bg-[#e0f7f1]",
    border: "border-[#6ee7b7]",
    text: "text-[#065f46]",
    ring: "ring-[#34d399]",
  },
  {
    key: "scrutiny",
    label: "SRC Member",
    sub: "Scrutiny committee decisions",
    icon: Users,
    gradient: "from-[#f9a8d4] to-[#db2777]",
    bg: "bg-[#fce8f3]",
    border: "border-[#f5bfde]",
    text: "text-[#9d174d]",
    ring: "ring-[#f9a8d4]",
  },
  {
    key: "admin",
    label: "Admin",
    sub: "Manage users, protocols & committees",
    icon: UserCog,
    gradient: "from-[#fbbf24] to-[#d97706]",
    bg: "bg-[#fff8e6]",
    border: "border-[#fde68a]",
    text: "text-[#92400e]",
    ring: "ring-[#fbbf24]",
  },
];

function StatCard({ value, label, color }) {
  const styles = {
    lavender: "bg-[#ede9ff] text-[#6d5ce8] border-[#d4ccff]",
    mint: "bg-[#e0f7f1] text-[#2d7a65] border-[#b2edd9]",
    rose: "bg-[#fce8f3] text-[#a0366e] border-[#f5bfde]",
  };
  return (
    <div className={`rounded-xl border p-3 text-center ${styles[color]}`}>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs mt-0.5 opacity-80">{label}</div>
    </div>
  );
}

/* ── Role Selection Screen ─────────────────────────────────── */
function RoleSelector({ onSelect }) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2.5 mb-5">
          <div className="bg-gradient-to-br from-[#a78bfa] to-[#8b7cf6] p-3 rounded-2xl shadow-lg">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div className="text-left">
            <p className="text-2xl font-extrabold text-[#3d3654] leading-tight">EthixPortal</p>
            <p className="text-xs text-[#7c73a0] tracking-wide uppercase font-semibold">IEC Management System</p>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-[#3d3654] mb-2">Who are you?</h1>
        <p className="text-[#7c73a0] text-sm">Select your role to continue to the login form.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ROLES.map((role) => {
          const Icon = role.icon;
          return (
            <button
              key={role.key}
              onClick={() => onSelect(role)}
              className={`group relative flex items-start gap-4 p-5 rounded-2xl border-2 text-left bg-white hover:ring-2 ${role.ring} hover:ring-offset-1 ${role.border} transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none`}
            >
              <div className={`shrink-0 p-3 rounded-xl bg-gradient-to-br ${role.gradient} shadow-sm group-hover:shadow-md transition-shadow`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-[#3d3654] mb-0.5">{role.label}</p>
                <p className="text-xs text-[#7c73a0] leading-snug">{role.sub}</p>
              </div>
              <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${role.gradient} flex items-center justify-center`}>
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-[#a09ac0] mt-8">
        Don't have an account?{" "}
        <Link to="/register" className="text-[#8b7cf6] font-semibold hover:underline">
          Register as Researcher
        </Link>
      </p>
    </div>
  );
}

/* ── Main Login Component ──────────────────────────────────── */
const Login = () => {
  const { login, status } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ researchers: 0, proposals: 0, approvalRate: 0 });

  useEffect(() => {
    if (status === "authenticated") navigate("/", { replace: true });
  }, [status, navigate]);

  useEffect(() => {
    api.get("/users/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Failed to fetch stats", err));
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
      setLoading(true);
      const toastId = toast.loading("Signing in…");
      try {
        await login({ ...form, role: selectedRole.key });
        // Successful login: redirect based on selected role
        toast.success("Signed in successfully", { id: toastId });
        // Navigate to appropriate dashboard (generic for now)
        navigate('/dashboard', { replace: true });
      } catch (err) {
        toast.error(err.response?.data?.message || "Invalid credentials", { id: toastId });
      } finally {
        setLoading(false);
      }
  };

  const handleChangeRole = () => {
    setSelectedRole(null);
    setForm({ email: "", password: "" });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f4ff] via-[#f8f9fa] to-[#eef2ff]">
        <p className="text-[#7c73a0]">Checking authentication…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f4ff] via-[#f8f9fa] to-[#eef2ff] p-4 py-12">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#ede9ff] opacity-60 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#fce8f3] opacity-60 blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[#e0f7f1] opacity-40 blur-3xl" />
      </div>
        {/* Home navigation icon */}
        <Link to="/" className="absolute top-4 left-4 text-[#7c73a0] hover:text-[#8b7cf6] transition-colors" title="Go Home">
          <Home className="h-6 w-6" />
        </Link>

      {/* ── Step 1: Role Selector ── */}
      {!selectedRole && <RoleSelector onSelect={setSelectedRole} />}

      {/* ── Step 2: Login Form ── */}
      {selectedRole && (
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* LEFT: Branding */}
          <div className="text-center lg:text-left space-y-6">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="bg-gradient-to-br from-[#a78bfa] to-[#8b7cf6] p-3 rounded-2xl shadow-md">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] via-[#f9a8d4] to-[#8b7cf6] drop-shadow-sm">
                  EthixPortal
                </h1>
                <p className="text-xs text-[#7c73a0] tracking-wide uppercase font-semibold mt-1">
                  Institutional Ethics Committee
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-[#3d3654] leading-snug mb-3">
                Digitizing Medical<br />Research Ethics
              </h2>
              <p className="text-[#7c73a0] text-base leading-relaxed">
                Secure, compliant, and efficient workflow management for IEC approvals in Indian medical colleges.
              </p>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
              {["ICMR Compliant", "Audit-Ready", "Secure Platform"].map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-[#ede9ff] text-[#6d5ce8] border border-[#d4ccff] font-medium">
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <StatCard value={stats.researchers} label="Researchers" color="lavender" />
              <StatCard value={stats.proposals} label="Proposals" color="mint" />
              <StatCard value={`${stats.approvalRate}%`} label="Approval Rate" color="rose" />
            </div>
          </div>

          {/* RIGHT: Form Card */}
          <div className="pastel-card p-8 space-y-6">

            {/* Role badge + Change Role */}
            <div className="flex items-center justify-between">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold ${selectedRole.bg} ${selectedRole.border} ${selectedRole.text}`}>
                {React.createElement(selectedRole.icon, { className: "h-4 w-4" })}
                {selectedRole.label}
              </div>
              <button
                type="button"
                onClick={handleChangeRole}
                className="flex items-center gap-1 text-xs text-[#7c73a0] hover:text-[#8b7cf6] transition-colors font-medium"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Change Role
              </button>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#3d3654]">Welcome Back</h3>
              <p className="text-sm text-[#7c73a0] mt-1">
                Sign in as <span className="font-semibold text-[#3d3654]">{selectedRole.label}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#7c73a0] uppercase tracking-wider">
                  Email Address
                </Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="h-11 bg-[#f8f7ff] border-[#e5e1ff] text-[#3d3654] placeholder:text-[#bcb8d8] focus-visible:ring-[#c4b8ff] focus-visible:ring-2 focus-visible:border-[#a78bfa] rounded-xl"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#7c73a0] uppercase tracking-wider">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="h-11 bg-[#f8f7ff] border-[#e5e1ff] text-[#3d3654] placeholder:text-[#bcb8d8] focus-visible:ring-[#c4b8ff] focus-visible:ring-2 focus-visible:border-[#a78bfa] rounded-xl pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09ac0] hover:text-[#8b7cf6] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                id="login-submit"
                type="submit"
                disabled={loading}
                className={`w-full h-11 bg-gradient-to-r ${selectedRole.gradient} text-white font-semibold rounded-xl shadow-sm disabled:opacity-60 transition-all hover:shadow-md hover:brightness-105`}
              >
                {loading ? "Signing in…" : `Sign In as ${selectedRole.label}`}
              </Button>

              <div className="flex justify-between text-sm">
                <Link to="/forgot-password" className="text-[#8b7cf6] hover:text-[#6d5ce8] transition-colors">
                  Forgot Password?
                </Link>
                {selectedRole.key === "researcher" && (
                  <Link to="/register" className="text-[#8b7cf6] hover:text-[#6d5ce8] transition-colors font-medium">
                    Create Account
                  </Link>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;