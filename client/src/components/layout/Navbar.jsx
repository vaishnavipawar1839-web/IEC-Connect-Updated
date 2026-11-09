import { Shield, Menu, X, LogOut, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const linkClass =
  "block py-2 px-3 text-[#7c73a0] hover:text-[#8b7cf6] transition-colors text-sm font-medium rounded-lg hover:bg-[#f0eeff]";

const activeLinkClass =
  "block py-2 px-3 text-[#8b7cf6] bg-[#ede9ff] font-semibold text-sm rounded-lg";

function navClass({ isActive }) {
  return isActive ? activeLinkClass : linkClass;
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user, logout, status } = useAuth();

  useEffect(() => {
    if (status !== "authenticated") return undefined;

    let active = true;
    const loadNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        if (active) {
          setNotifications(response.data.notifications || []);
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch {
        if (active) setNotifications([]);
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 60000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [status]);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    setNotifications([]);
    setUnreadCount(0);
    navigate("/login");
  };

  const openNotification = async (notification) => {
    if (!notification.readAt) {
      try {
        await api.patch(`/notifications/${notification._id}/read`);
        setUnreadCount((count) => Math.max(0, count - 1));
        setNotifications((items) => items.map((item) =>
          item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item
        ));
      } catch {
        return;
      }
    }
    setNotificationsOpen(false);
    if (notification.proposal?._id) navigate(`/proposals/${notification.proposal._id}`);
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setUnreadCount(0);
      setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
    } catch {
      // Keep the current unread state if the request fails.
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e5e1ff]">
      <div className="container mx-auto flex items-center py-3 px-5">

        {/* Brand */}
        <div className="flex items-center flex-1">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-br from-[#a78bfa] to-[#8b7cf6] p-2 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-[#3d3654] leading-tight">
                EthixPortal
              </h1>
              <p className="text-[10px] text-[#7c73a0] leading-tight tracking-wide uppercase">
                IEC Management
              </p>
            </div>
          </NavLink>
        </div>

        {/* Desktop Nav */}
        {status === "authenticated" && user?.role !== "admin" && (
          <nav className="hidden md:flex flex-1 justify-center">
            <ul className="flex items-center gap-1">
              <li>
                <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
              </li>
              <li>
                <NavLink to="/documents" className={navClass}>Documents</NavLink>
              </li>
            </ul>
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center justify-end flex-1 gap-3">
          {status === "authenticated" ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
                  aria-expanded={notificationsOpen}
                  onClick={() => setNotificationsOpen((value) => !value)}
                  className="relative rounded-lg border border-[#e5e1ff] p-2 text-[#625b78] hover:bg-[#f5f3ff]"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-600 px-1 text-[10px] font-bold leading-4 text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <section className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl" aria-label="Notifications">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
                      <button
                        type="button"
                        onClick={markAllRead}
                        disabled={!unreadCount}
                        className="text-xs font-medium text-sky-700 disabled:text-slate-400"
                      >
                        Mark all read
                      </button>
                    </div>
                    <ul className="max-h-[min(60vh,26rem)] overflow-y-auto divide-y divide-slate-100">
                      {notifications.length ? notifications.map((notification) => (
                        <li key={notification._id}>
                          <button
                            type="button"
                            onClick={() => openNotification(notification)}
                            className={`w-full px-4 py-3 text-left hover:bg-slate-50 ${notification.readAt ? "bg-white" : "bg-sky-50/60"}`}
                          >
                            <span className="block text-sm font-semibold text-slate-800">{notification.title}</span>
                            <span className="mt-1 block text-xs text-slate-600">{notification.message}</span>
                            <span className="mt-1 block text-[11px] text-slate-400">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                          </button>
                        </li>
                      )) : (
                        <li className="px-4 py-8 text-center text-sm text-slate-500">You’re all caught up.</li>
                      )}
                    </ul>
                  </section>
                )}
              </div>

              {/* User Info & Notifications */}
              <div className="hidden sm:flex items-center gap-4 border-r border-[#e5e1ff] pr-4 py-1">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-[#3d3654]">{user?.name}</span>
                  <span className="text-[10px] text-[#8b7cf6] uppercase font-bold tracking-wider">
                    {user?.role}
                  </span>
                </div>
                

              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[#e11d48] bg-[#fff1f2] hover:bg-[#ffe4e6] border border-[#ffe4e6] transition-all shadow-sm active:scale-95"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Logout</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2 rounded-xl text-[#7c73a0] hover:bg-[#f0eeff] transition-colors border border-[#e5e1ff]"
                onClick={() => setOpen(!open)}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          ) : (
            status !== "loading" && (
              <Link
                to="/login"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#8b7cf6] text-white text-sm font-bold shadow-md hover:shadow-lg hover:brightness-105 transition-all active:scale-95"
              >
                Login
              </Link>
            )
          )}
        </div>
      </div>


      {/* Mobile Menu */}
      {open && status === "authenticated" && (
        <div className="md:hidden bg-white border-t border-[#e5e1ff] px-4 pb-4">
          <ul className="flex flex-col gap-1 pt-2">
            {user?.role !== "admin" && (
              <>
                <li>
                  <NavLink onClick={() => setOpen(false)} to="/dashboard" className={navClass}>
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink onClick={() => setOpen(false)} to="/documents" className={navClass}>
                    Documents
                  </NavLink>
                </li>
              </>
            )}
            <li className={user?.role !== "admin" ? "border-t border-[#e5e1ff] mt-2 pt-2" : "pt-2"}>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-bold text-[#e11d48] py-2 px-3 rounded-lg hover:bg-[#fff1f2] w-full transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}