import { useState, lazy, Suspense } from "react";
import { LayoutDashboard, FileText, Megaphone, Search } from "lucide-react";
import AdminProposals from "./admin/AdminProposals";
import AdminDocuments from "./admin/AdminDocuments";
import AdminAnnouncements from "./admin/AdminAnnouncements";

const Documents = lazy(() => import("../documents/Documents"));

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { id: "manage_docs", label: "Manage Documents", icon: <FileText className="h-5 w-5" /> },
    { id: "docs_center", label: "Document Center", icon: <Search className="h-5 w-5" /> },
    { id: "announcements", label: "Manage Announcements", icon: <Megaphone className="h-5 w-5" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <AdminProposals />;
      case "manage_docs": return <AdminDocuments />;
      case "docs_center": return (
        <Suspense fallback={<div className="animate-pulse">Loading Document Center...</div>}>
          <Documents />
        </Suspense>
      );
      case "announcements": return <AdminAnnouncements />;
      default: return <AdminProposals />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-[var(--navbar-height,4rem)])] md:min-h-[calc(100vh-4rem)] bg-[#f8f7ff] border-t border-[#e5e1ff]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#e5e1ff] p-4 gap-2">
        <div className="mb-4 px-2">
          <h2 className="text-xs font-bold text-[#a09ac0] uppercase tracking-wider">Admin Control Panel</h2>
        </div>
        
        <div className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.id 
                  ? "bg-[#ede9ff] text-[#7c3aed]" 
                  : "text-[#7c73a0] hover:bg-[#f0eeff] hover:text-[#3d3654]"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto h-full pb-20">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Bar navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e1ff] flex items-center justify-around p-2 z-50">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-semibold ${
              activeTab === item.id 
                ? "text-[#7c3aed]" 
                : "text-[#a09ac0]"
            }`}
          >
            {item.icon}
          </button>
        ))}
      </div>
    </div>
  );
}