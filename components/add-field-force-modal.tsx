"use client";

import { useState } from "react";
import { X, User, Briefcase, MapPin, Building2, Shield, Calendar, Phone, Mail, FileText, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ModernDatePicker } from "@/components/modern-date-picker";

interface AddFieldForceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddFieldForceModal({ isOpen, onClose, onSuccess }: AddFieldForceModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  
  const [form, setForm] = useState({
    employeeCode: "",
    name: "",
    gender: "Male",
    dob: "",
    joinDate: "",
    phone: "",
    email: "",
    department: "Sales",
    designation: "Medical Representative",
    division: "Zivira",
    reportingManager: "",
    region: "Tamil Nadu",
    hq: "",
    patch: "",
    drivingLicense: "",
    status: "ACTIVE"
  });

  if (!isOpen) return null;

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.employeeCode.trim() || !form.hq.trim()) return;

    setSaving(true);
    setError("");
    try {
      // Map designation to backend roles
      const roleMapping: Record<string, string> = {
        "Medical Representative": "MR",
        "Area Sales Manager": "ABM",
        "Regional Sales Manager": "RBM",
        "Zonal Sales Manager": "ZBM",
        "Product Manager": "OTHER",
        "Finance Executive": "OTHER",
        "HR Executive": "OTHER"
      };

      await apiClient.createEmployee({
        name: form.name,
        employeeCode: form.employeeCode,
        designation: form.designation,
        division: form.division,
        reportingManager: form.reportingManager || undefined,
        territory: form.hq,
        role: (roleMapping[form.designation] ?? "OTHER") as any,
        drivingLicense: form.drivingLicense || undefined,
        status: form.status as "ACTIVE" | "INACTIVE"
      } as any);
      
      onSuccess?.();
      onClose();
      
      // Reset form
      setForm({
        ...form,
        employeeCode: "",
        name: "",
        hq: "",
        patch: "",
        reportingManager: "",
      });
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add field force member");
    } finally {
      setSaving(false);
    }
  }

  const InputWrapper = ({ icon: Icon, label, required, children }: any) => (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="font-label-sm text-label-sm text-text-secondary flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-text-muted" />
        {label} {required && <span className="text-status-error">*</span>}
      </label>
      <div className="relative group">
        {children}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-surface-card rounded-2xl shadow-2xl flex flex-col max-h-[90vh] border border-border-subtle overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-subtle bg-surface-canvas/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary-subtle flex items-center justify-center text-primary shadow-sm border border-primary/10">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline-sm text-text-primary">Add Field Force</h2>
              <p className="font-body-sm text-text-muted mt-0.5">Configure profile, territory, and organizational hierarchy</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-subtle text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-status-error-bg border border-status-error/20 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-status-error/10 flex items-center justify-center text-status-error shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">error</span>
            </div>
            <p className="font-body-sm text-status-error">{error}</p>
          </div>
        )}

        {/* Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col p-6 gap-8">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
              <span className="font-label-md text-label-md text-text-primary font-semibold">Basic Information</span>
              <span className="flex-1 h-px bg-gradient-to-r from-transparent to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <InputWrapper icon={FileText} label="Employee Code" required>
                <input 
                  required
                  value={form.employeeCode} 
                  onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} 
                  className="w-full h-[42px] px-3.5 rounded-xl border border-border-subtle bg-surface-canvas text-text-primary font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-text-muted/60"
                  placeholder="e.g. EMP-MR-0001" 
                />
              </InputWrapper>
              
              <InputWrapper icon={User} label="Full Name" required>
                <input 
                  required
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className="w-full h-[42px] px-3.5 rounded-xl border border-border-subtle bg-surface-canvas text-text-primary font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-text-muted/60"
                  placeholder="Rahul Sharma" 
                />
              </InputWrapper>
              
              <InputWrapper icon={User} label="Gender">
                <select className="input" 
                  value={form.gender} 
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full h-[42px] px-3.5 rounded-xl border border-border-subtle bg-surface-canvas text-text-primary font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow appearance-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
              </InputWrapper>
              
              <InputWrapper icon={Phone} label="Mobile Number" required>
                <input 
                  required
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  className="w-full h-[42px] px-3.5 rounded-xl border border-border-subtle bg-surface-canvas text-text-primary font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-text-muted/60"
                  placeholder="9876543210" 
                />
              </InputWrapper>
              
              <InputWrapper icon={Mail} label="Email ID" required>
                <input 
                  type="email"
                  required
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  className="w-full h-[42px] px-3.5 rounded-xl border border-border-subtle bg-surface-canvas text-text-primary font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-text-muted/60"
                  placeholder="rahul@example.com" 
                />
              </InputWrapper>
              
              <InputWrapper icon={Calendar} label="Date of Joining" required>
                <ModernDatePicker 
                  value={form.joinDate} 
                  onChange={(val) => setForm({ ...form, joinDate: val })} 
                  placeholder="dd-mm-yyyy"
                />
              </InputWrapper>
            </div>
          </div>

          {/* Section 2: Organization Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
              <span className="font-label-md text-label-md text-text-primary font-semibold">Organizational Setup</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <InputWrapper icon={Briefcase} label="Designation">
                <select className="input" 
                  value={form.designation} 
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="w-full h-[42px] px-3.5 rounded-xl border border-border-subtle bg-surface-canvas text-text-primary font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow appearance-none"
                >
                  <option value="Medical Representative">Medical Representative (MR)</option>
                  <option value="Area Sales Manager">Area Sales Manager (ASM)</option>
                  <option value="Regional Sales Manager">Regional Sales Manager (RSM)</option>
                  <option value="Zonal Sales Manager">Zonal Sales Manager (ZSM)</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Finance Executive">Finance Executive</option>
                  <option value="HR Executive">HR Executive</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
              </InputWrapper>

              <InputWrapper icon={Building2} label="Division">
                <select className="input" 
                  value={form.division} 
                  onChange={(e) => setForm({ ...form, division: e.target.value })}
                  className="w-full h-[42px] px-3.5 rounded-xl border border-border-subtle bg-surface-canvas text-text-primary font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow appearance-none"
                >
                  <option value="Astra">Astra</option>
                  <option value="Aura">Aura</option>
                  <option value="Zivira">Zivira</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
              </InputWrapper>

              <InputWrapper icon={User} label="Reporting Manager">
                <input 
                  value={form.reportingManager} 
                  onChange={(e) => setForm({ ...form, reportingManager: e.target.value })} 
                  className="w-full h-[42px] px-3.5 rounded-xl border border-border-subtle bg-surface-canvas text-text-primary font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-text-muted/60"
                  placeholder="Manager Name" 
                />
              </InputWrapper>
            </div>
          </div>

          {/* Section 3: Territory & Legal */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
              <span className="font-label-md text-label-md text-text-primary font-semibold">Territory & Compliance</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="lg:col-span-1">
                <InputWrapper icon={MapPin} label="Region" required>
                  <select className="input" 
                    required
                    value={form.region} 
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    className="w-full h-[42px] px-3.5 rounded-xl border border-border-subtle bg-surface-canvas text-text-primary font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow appearance-none"
                  >
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
                </InputWrapper>
              </div>

              <div className="lg:col-span-1">
                <InputWrapper icon={MapPin} label="Headquarters (HQ)" required>
                  <input 
                    required
                    value={form.hq} 
                    onChange={(e) => setForm({ ...form, hq: e.target.value })} 
                    className="w-full h-[42px] px-3.5 rounded-xl border border-border-subtle bg-surface-canvas text-text-primary font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-text-muted/60"
                    placeholder="Chennai Central" 
                  />
                </InputWrapper>
              </div>

              <div className="lg:col-span-1">
                <InputWrapper icon={MapPin} label="Patch" required>
                  <input 
                    required
                    value={form.patch} 
                    onChange={(e) => setForm({ ...form, patch: e.target.value })} 
                    className="w-full h-[42px] px-3.5 rounded-xl border border-border-subtle bg-surface-canvas text-text-primary font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-text-muted/60"
                    placeholder="T. Nagar" 
                  />
                </InputWrapper>
              </div>

              <div className="lg:col-span-1">
                <InputWrapper icon={Shield} label="Driving License">
                  <input 
                    value={form.drivingLicense} 
                    onChange={(e) => setForm({ ...form, drivingLicense: e.target.value })} 
                    className="w-full h-[42px] px-3.5 rounded-xl border border-border-subtle bg-surface-canvas text-text-primary font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-shadow placeholder:text-text-muted/60 uppercase"
                    placeholder="DL-MH-20-..." 
                  />
                </InputWrapper>
              </div>
            </div>
          </div>

          <div className="pt-2"></div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-subtle bg-surface-canvas/30 flex items-center justify-between rounded-b-2xl">
          <div className="flex items-center gap-3">
            <label className="font-label-sm text-text-secondary flex items-center gap-2 cursor-pointer">
              <span className="relative flex items-center">
                <input 
                  type="checkbox" 
                  className="peer sr-only"
                  checked={form.status === "ACTIVE"}
                  onChange={(e) => setForm({...form, status: e.target.checked ? "ACTIVE" : "INACTIVE"})}
                />
                <div className="w-9 h-5 bg-surface-subtle peer-checked:bg-status-success rounded-full transition-colors border border-border-subtle peer-checked:border-status-success"></div>
                <div className="absolute left-[3px] top-[3px] w-3.5 h-3.5 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm"></div>
              </span>
              <span>{form.status === "ACTIVE" ? "Profile Active" : "Profile Inactive"}</span>
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="h-[42px] px-5 rounded-xl bg-surface-subtle hover:bg-border-subtle text-text-primary font-label-md transition-colors"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={(e) => handleSave(e as any)}
              disabled={saving || !form.name.trim() || !form.employeeCode.trim() || !form.hq.trim()}
              className="h-[42px] px-6 rounded-xl bg-primary hover:bg-brand-primary-hover disabled:opacity-50 disabled:hover:bg-primary text-on-primary font-label-md flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Field Force
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
