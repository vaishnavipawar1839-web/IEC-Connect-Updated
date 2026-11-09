import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "sonner";
import { Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEPARTMENTS_WITH_SUB = [
  "Preclinical departments",
  "ParaClinical Departments",
  "Medicine and Allied Departments",
  "Surgery and allied departments",
  "Emergency Medicine"
];

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    designation: "",
    qualification: "",
    department: "",
    subDepartment: "",
    institution: "",
    contact: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ researchers: 0, proposals: 0, approvalRate: 0 });

  useEffect(() => {
    api.get("/users/stats")
      .then(res => setStats(res.data))
      .catch(err => console.error("Failed to fetch stats", err));
  }, []);

  const handleChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "department" &&
        !DEPARTMENTS_WITH_SUB.includes(value) && {
        subDepartment: "",
      }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const requiresSubDepartment = DEPARTMENTS_WITH_SUB.includes(form.department);
    if (requiresSubDepartment && !form.subDepartment) {
      toast.error("Please select a sub department");
      setLoading(false);
      return;
    }

    const id = toast.loading("Creating account…");
    try {
      await api.post("/users/register", { ...form, role: "researcher" });
      toast.success("Account created successfully", { id });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed", { id });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f0f4ff] via-[#f8f9fa] to-[#eef2ff] p-6">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#fce8f3] opacity-60 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#ede9ff] opacity-60 blur-3xl animate-pulse delay-700" />
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

        {/* ── LEFT  Branding ── */}
        <div className="text-center lg:text-left space-y-6 lg:pt-4">
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
              Join EthixPortal
            </h2>
            <p className="text-[#7c73a0] text-base leading-relaxed">
              Create your account to submit and manage research proposals securely.
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard value={stats.researchers} label="Researchers" color="lavender" />
            <StatCard value={stats.proposals} label="Proposals" color="mint" />
            <StatCard value={`${stats.approvalRate}%`} label="Approval Rate" color="rose" />
          </div>
        </div>

        {/* ── RIGHT  Form ── */}
        <div className="pastel-card p-7 space-y-5">
          <div>
            <h3 className="text-xl font-bold text-[#3d3654]">Create Account</h3>
            <p className="text-sm text-[#7c73a0] mt-1">Fill in your details to register</p>
            <p className="mt-2 text-xs text-[#7c73a0]">
              This form creates researcher accounts. Reviewer accounts are issued by an administrator.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <FormInput
              id="reg-name"
              label="Name of Researcher"
              value={form.name}
              onChange={(v) => handleChange("name", v)}
            />
            <FormInput
              id="reg-designation"
              label="Designation"
              value={form.designation}
              onChange={(v) => handleChange("designation", v)}
            />
            <FormInput
              id="reg-qualification"
              label="Qualification"
              value={form.qualification}
              onChange={(v) => handleChange("qualification", v)}
            />
            <FormSelect
              id="reg-department"
              label="Department"
              value={form.department}
              onChange={(v) => handleChange("department", v)}
              options={[
                "Preclinical departments",
                "ParaClinical Departments",
                "Medicine and Allied Departments",
                "Surgery and allied departments",
                "Emergency medicines",
                "Other"
              ]}
            />

            {DEPARTMENTS_WITH_SUB.includes(form.department) && (
              <FormSelect
                id="reg-subdepartment"
                label="Sub Department"
                value={form.subDepartment}
                onChange={(v) => handleChange("subDepartment", v)}
                options={getSubDepartments(form.department)}
              />
            )}

            <FormInput
              id="reg-institution"
              label="Institution"
              value={form.institution}
              onChange={(v) => handleChange("institution", v)}
            />
            <FormInput
              id="reg-contact"
              label="Contact"
              value={form.contact}
              onChange={(v) => handleChange("contact", v)}
            />
            <FormInput
              id="reg-email"
              label="Email ID"
              type="email"
              value={form.email}
              onChange={(v) => handleChange("email", v)}
            />
            <FormInput
              id="reg-password"
              label="Password"
              type="password"
              value={form.password}
              onChange={(v) => handleChange("password", v)}
            />

            <div className="md:col-span-2 space-y-3">
              <Button
                id="reg-submit"
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-[#a78bfa] to-[#8b7cf6] hover:from-[#9b72fb] hover:to-[#7c6de8] text-white font-semibold rounded-xl shadow-sm disabled:opacity-60 transition-all"
              >
                {loading ? "Creating account…" : "Register"}
              </Button>

              <p className="text-sm text-center text-[#7c73a0]">
                Already have an account?{" "}
                <Link to="/login" className="text-[#8b7cf6] hover:text-[#6d5ce8] font-medium transition-colors">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

/* ── Helpers ── */

function FormInput({ id, label, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-[#7c73a0] uppercase tracking-wider">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        required
        className="h-10 bg-[#f8f7ff] border-[#e5e1ff] text-[#3d3654] placeholder:text-[#bcb8d8] focus-visible:ring-[#c4b8ff] focus-visible:ring-2 focus-visible:border-[#a78bfa] rounded-xl text-sm"
      />
    </div>
  );
}

function FormSelect({ id, label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-[#7c73a0] uppercase tracking-wider">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className="h-10 bg-[#f8f7ff] border-[#e5e1ff] text-[#3d3654] focus:ring-[#c4b8ff] focus:ring-2 focus:border-[#a78bfa] rounded-xl text-sm"
        >
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent className="w-(--radix-select-trigger-width)">
          {options.map((opt) => (
            <SelectItem key={opt} value={opt} className="text-sm text-[#3d3654]">
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

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

function getSubDepartments(department) {
  const map = {
    "Preclinical departments": ["Physiology", "Anatomy", "Biochemistry"],
    "ParaClinical Departments": [
      "Pharmacology",
      "Pathology",
      "Microbiology",
      "Forensic Medicine and Toxicology",
    ],
    "Medicine and Allied Departments": [
      "General Medicine",
      "Paediatrics",
      "Community Medicine",
      "Respiratory Medicine",
      "Dermatology, Venereology and Leprosy",
      "Psychiatry",
    ],
    "Surgery and allied departments": [
      "General Surgery",
      "Obstetrics and Gynaecology",
      "Orthopedics",
      "Ophthalmology",
      "Oto-Rhino-Laryngology",
      "Radiodiagnosis",
      "Anesthesiology",
      "Dentistry"
    ],
  };
  return map[department] || [];
}