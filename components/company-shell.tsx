"use client";
import clsx from "clsx";
import { Search, X, ChevronRight, AlertCircle, Info, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { companyNav } from "@/lib/company-data";
import { clearToken } from "@/lib/api-client";

const searchPages = [
  { title: "Dashboard Home", category: "Platform", href: "/admin/home" },
  { title: "Masters List", category: "Platform", href: "/admin/masters" },
  { title: "Activities", category: "Platform", href: "/admin/activities" },
  { title: "Activity Reports", category: "Platform", href: "/admin/activity-reports" },
  { title: "MIS Reports", category: "Platform", href: "/admin/mis-reports" },
  { title: "Settings Options", category: "Platform", href: "/admin/options" },
  { title: "Doctor Celebrations", category: "Platform", href: "/admin/doctor-celebrations" },
  { title: "Sub Division Master", category: "Subdivision", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/subdivision/entry" },
  { title: "View - Productwise", category: "Subdivision", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/subdivision/view-productwise" },
  { title: "View - Field Forcewise", category: "Subdivision", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/subdivision/view-field-forcewise" },
  { title: "Product Category Master", category: "Products", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/product/category" },
  { title: "Product Group Master", category: "Products", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/product/group" },
  { title: "Product Brand Master", category: "Products", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/product/brand" },
  { title: "Product Detail Master", category: "Products", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/product/product-detail" },
  { title: "Doctor Category Master", category: "Doctors", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/doctor/category" },
  { title: "Doctor Speciality Master", category: "Doctors", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/doctor/speciality" },
  { title: "Doctor Qualification Master", category: "Doctors", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/doctor/qualification" },
  { title: "Input Master", category: "Inputs", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/input" },
  { title: "Stockist Details", category: "Stockists", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/stockist-details/add-edit-deactivate" },
  { title: "Super Stockist Mapping", category: "Stockists", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/stockist-details/super-stockist-create-map" },
  { title: "Expense Master", category: "Expenses", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/expense" },
  { title: "Statewise Holiday Fixation", category: "Holidays", href: "/admin/workspace/division-dashboard/division-navigation-tabs/division-master/statewise-holiday-fixation" }
];

export function CompanyShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isHolidayFixation = pathname.includes("statewise-holiday-fixation") || pathname.includes("statewise%20holiday%20fixation") || pathname.includes("statewise holiday fixation");
  
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; type: string; time: string }>>([]);
  
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ "Platform": false, "Reports & Field": false, "Analytics": false });
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("zivira.admin.theme");
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
    const savedSidebar = window.localStorage.getItem("zivira.admin.sidebar");
    if (savedSidebar === "closed") setSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.localStorage.setItem("zivira.admin.theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("zivira.admin.sidebar", sidebarOpen ? "open" : "closed");
  }, [sidebarOpen]);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "https://zivira-labs-backend-1.onrender.com/api";
  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      const token = window.localStorage.getItem("zivira.company.token");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      try {
        const [noticesRes, activityRes] = await Promise.all([
          fetch(`${apiBase}/company/notices`, { headers }),
          fetch(`${apiBase}/company/activity`, { headers })
        ]);

        const liveAlerts: any[] = [];
        if (noticesRes.ok) {
          const payload = await noticesRes.json();
          liveAlerts.push(
            ...(payload.data || []).map((notice: any) => ({
              id: `notice-${notice.id}`,
              title: `Notice: ${notice.title}`,
              message: notice.message,
              type: notice.priority === "URGENT" ? "urgent" : "notice",
              time: new Date(notice.createdAt).toLocaleString()
            }))
          );
        }
        if (activityRes.ok) {
          const payload = await activityRes.json();
          const entries = payload.data || [];
          liveAlerts.push(
            ...entries.map((entry: any) => ({
              id: `activity-${entry.id}`,
              title: entry.title,
              message: entry.message,
              type: entry.type,
              time: new Date(entry.time).toLocaleString()
            }))
          );
        }
        if (!cancelled) setNotifications(liveAlerts);
      } catch (e) {}
    }

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 20000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [apiBase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  function signOut() {
    clearToken();
    router.push("/admin/login");
  }

  const filteredPages = searchQuery
    ? searchPages.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchPages.slice(0, 6);

  return (
    <div className="bg-surface-canvas font-body-md text-on-surface min-h-screen">
      {/* ── Search Modal ── */}
      {searchOpen && (
        <div
          onClick={() => setSearchOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-start justify-center pt-[10vh]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-surface-card border border-border-subtle rounded-xl shadow-2xl overflow-hidden animate-dropdownFadeIn"
          >
            <div className="flex items-center border-b border-border-subtle px-4 py-1">
              <span className="material-symbols-outlined text-text-muted mr-3">search</span>
              <input
                ref={searchInputRef}
                placeholder="Search command pages or modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none py-4 text-text-primary text-[16px] outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="bg-transparent border-none text-text-muted cursor-pointer p-2"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-2 max-h-[380px] overflow-y-auto">
              <p className="m-2 mt-2 mb-1 text-[11px] font-bold uppercase text-text-muted tracking-wider">
                {searchQuery ? "Matching Results" : "Recent Modules"}
              </p>
              {filteredPages.map((page) => (
                <div
                  key={page.href}
                  onClick={() => {
                    router.push(page.href);
                    setSearchOpen(false);
                  }}
                  className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors hover:bg-surface-subtle group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-primary text-white uppercase">
                      {page.category}
                    </span>
                    <strong className="text-text-primary text-[14px]">{page.title}</strong>
                  </div>
                  <ChevronRight size={16} className="text-text-muted group-hover:text-text-primary" />
                </div>
              ))}
              {filteredPages.length === 0 && (
                <p className="text-center p-6 text-text-muted text-[14px]">
                  No pages matching "{searchQuery}"
                </p>
              )}
            </div>
            <div className="bg-surface-subtle p-3 border-t border-border-subtle flex justify-between items-center text-[11px] text-text-muted">
              <span>Search inside Zivira Labs workspace</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className={clsx(
        "fixed left-0 top-0 h-screen bg-surface-card z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-border-subtle transition-all duration-300",
        sidebarOpen ? "w-sidebar-width" : "w-sidebar-collapsed-width"
      )}>
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Sidebar Header */}
          <div className="h-header-height px-4 flex items-center justify-between border-b border-border-subtle flex-shrink-0">
            <div className={clsx("flex items-center min-w-0 transition-all", sidebarOpen ? "gap-2.5" : "gap-0")}>
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary font-headline-md font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                Z
              </div>
              {sidebarOpen && (
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-sm text-[15px] text-text-primary font-bold tracking-tight truncate leading-tight">ZiviraLabs</span>
                  <span className="font-label-sm text-[10px] text-text-muted uppercase tracking-wider leading-none mt-0.5">PHARMA COMMAND</span>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-surface-subtle text-text-muted hover:text-text-primary flex items-center justify-center transition-colors"
                type="button"
                aria-label="Collapse sidebar"
              >
                <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_left</span>
              </button>
            )}
          </div>


          {/* Navigation Scroll Area */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
            {/* Home Item (Outside of Groups) */}
            <div className="mb-2">
              <Link 
                href="/admin/home"
                className={clsx(
                  sidebarOpen ? "flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors" : "w-10 h-10 flex items-center justify-center rounded-lg transition-colors mx-auto",
                  pathname === "/admin/home" ? "bg-brand-primary-subtle text-primary font-label-md shadow-sm" : "text-[13px] text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
                )}
                title={!sidebarOpen ? "Home" : undefined}
              >
                {sidebarOpen ? (
                  <div className="flex items-center gap-2.5">
                    <span className={clsx("material-symbols-outlined text-[18px]", pathname === "/admin/home" ? "text-primary" : "text-text-muted")}>dashboard</span>
                    <span className={clsx("font-bold text-[14px]")}>Home</span>
                  </div>
                ) : (
                  <span className={clsx("material-symbols-outlined text-[20px]", pathname === "/admin/home" ? "text-primary" : "text-text-muted")}>dashboard</span>
                )}
              </Link>
            </div>

            {companyNav.map((group, groupIdx) => {
              const isExpanded = expandedGroups[group.title];
              return (
                <div key={group.title} className={clsx(sidebarOpen ? "space-y-1" : "space-y-2 mt-4")}>
                  {sidebarOpen && (
                    <button 
                      onClick={() => setExpandedGroups(prev => ({ ...prev, [group.title]: !prev[group.title] }))}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-left text-text-secondary hover:text-text-primary transition-colors group" 
                      type="button"
                    >
                      <span className="font-label-sm text-[12px] uppercase tracking-wider font-bold text-text-secondary group-hover:text-text-primary">{group.title}</span>
                      <span className="material-symbols-outlined text-[18px] text-text-secondary group-hover:text-text-primary transition-transform" style={{ transform: isExpanded ? "rotate(180deg)" : "none" }}>expand_more</span>
                    </button>
                  )}
                  {(!sidebarOpen || isExpanded) && (
                    <div className={clsx(sidebarOpen ? "space-y-0.5 pl-1.5" : "space-y-2 flex flex-col items-center")}>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        
                        if (!sidebarOpen) {
                          return (
                            <Link key={item.href} href={item.href} title={item.title} className={clsx(
                              "w-10 h-10 flex items-center justify-center rounded-lg transition-colors",
                              active ? "bg-brand-primary-subtle text-primary shadow-sm" : "text-text-muted hover:bg-surface-subtle hover:text-text-primary"
                            )}>
                              <Icon size={20} />
                            </Link>
                          );
                        }

                        return (
                          <Link 
                            key={item.href} 
                            href={item.href}
                            className={clsx(
                              "flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors",
                              active ? "bg-brand-primary-subtle text-primary font-label-md shadow-sm" : "text-[13px] text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon size={18} className={clsx(active ? "text-primary" : "text-text-muted")} />
                              <span className={clsx(active ? "font-bold" : "")}>{item.title}</span>
                            </div>
                            {active && <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Bottom Footer */}
          {sidebarOpen && (
            <div className="mt-2 p-3 border-t border-border-subtle flex flex-col gap-3">
              {/* Theme Settings */}
              <div>
                <span className="font-label-sm text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2 block">Theme</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setTheme('light')}
                    className={clsx(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border",
                      theme === 'light' ? "bg-surface-subtle border-border-strong text-text-primary" : "bg-transparent border-border-subtle text-text-muted hover:bg-surface-subtle"
                    )}
                  >
                    <span className="material-symbols-outlined text-[16px]">light_mode</span> Light
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={clsx(
                      "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[12px] font-semibold transition-colors border",
                      theme === 'dark' ? "bg-surface-subtle border-border-strong text-text-primary" : "bg-transparent border-border-subtle text-text-muted hover:bg-surface-subtle"
                    )}
                  >
                    <span className="material-symbols-outlined text-[16px]">dark_mode</span> Dark
                  </button>
                </div>
              </div>

              {/* User Profile + Logout Combined */}
              <div className="flex items-center justify-between group pt-3 border-t border-border-subtle">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#A33900] text-white font-bold text-[13px] flex items-center justify-center flex-shrink-0">AZ</div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] text-text-primary truncate font-bold leading-tight">Admin Zivira</span>
                    <span className="text-[11px] text-text-muted truncate leading-tight mt-0.5">HQ Operations</span>
                  </div>
                </div>
                <button 
                  onClick={signOut}
                  className="w-7 h-7 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors" 
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <div className="p-2 flex flex-col items-center gap-3 border-t border-border-subtle">
              <button 
                onClick={signOut}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-text-muted hover:bg-status-danger-bg hover:text-status-danger transition-colors" 
                title="Logout"
              >
                <span className="material-symbols-outlined text-[20px] rotate-180">logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className={clsx("transition-all duration-300", sidebarOpen ? "pl-sidebar-width" : "pl-sidebar-collapsed-width")}>
        <header className={clsx(
          "fixed top-0 right-0 h-header-height bg-surface-card/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 transition-all duration-300",
          sidebarOpen ? "left-sidebar-width" : "left-sidebar-collapsed-width"
        )}>
          <div className="h-header-height w-full px-container-padding-desktop flex items-center justify-between gap-grid-gutter">
            <div className="flex items-center gap-card-padding-standard flex-1 max-w-xl">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle transition-colors"
                  title="Expand sidebar"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_right</span>
                </button>
              )}
              <div className="relative w-full max-w-md hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[19px]">search</span>
                <input 
                  onClick={() => setSearchOpen(true)}
                  readOnly
                  className="w-full h-[38px] pl-10 pr-4 rounded-lg bg-surface-canvas text-text-primary placeholder:text-text-muted font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer" 
                  placeholder="Search doctors, MR territories..." 
                />
              </div>
            </div>
            
            <div className="flex items-center gap-card-padding-compact flex-shrink-0">
              <button 
                onClick={() => setNotificationsOpen(o => !o)}
                className="relative w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-subtle hover:text-on-surface transition-colors" 
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary"></span>}
              </button>
              
              {notificationsOpen && (
                <div
                  ref={notifRef}
                  className="absolute right-4 top-14 w-80 bg-surface-card border border-border-subtle rounded-xl shadow-xl p-4 animate-dropdownFadeIn"
                >
                  <div className="flex items-center justify-between mb-3 border-b border-border-subtle pb-2">
                    <h4 className="m-0 text-[15px] text-text-primary font-bold">Notifications</h4>
                    <button onClick={() => setNotificationsOpen(false)} className="bg-transparent border-none text-text-muted cursor-pointer">
                      <X size={15} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="flex gap-2.5 p-2.5 rounded-lg bg-surface-canvas border border-border-subtle"
                      >
                        <span className="mt-0.5">
                          {notif.type === "urgent" || notif.type === "warning" ? (
                            <AlertCircle size={16} className="text-status-warning" />
                          ) : notif.type === "success" ? (
                            <Info size={16} className="text-status-success" />
                          ) : (
                            <MessageSquare size={16} className="text-primary" />
                          )}
                        </span>
                        <div className="flex-1">
                          <strong className="block text-[13px] text-text-primary font-bold">{notif.title}</strong>
                          <p className="m-0 mt-0.5 text-[12px] text-text-secondary leading-snug">{notif.message}</p>
                          <span className="block mt-1 text-[10px] text-text-muted">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-center py-4 text-text-muted text-[13px]">No alerts today</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3 pl-2 border-l border-border-subtle">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="font-label-md text-label-md text-text-primary leading-tight">Admin Zivira</span>
                  <span className="font-body-sm text-body-sm text-text-muted leading-tight">Corporate HQ</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="w-full pt-[96px] pb-container-padding-mobile sm:pb-container-padding-desktop min-h-screen bg-surface-canvas px-container-padding-mobile sm:px-container-padding-desktop">
          {children}
        </main>
      </div>
    </div>
  );
}
