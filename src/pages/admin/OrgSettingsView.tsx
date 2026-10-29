import { useState, type FormEvent } from "react";
import {
  Building2,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Save,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useStore } from "../../lib/store";
import { DEFAULT_ORG_SETTINGS } from "../../lib/types";

const COOPERATIVE_TYPES = [
  "बचत तथा ऋण सहकारी संस्था (Savings & Credit Cooperative)",
  "बहुउद्देश्यीय सहकारी संस्था (Multipurpose Cooperative)",
  "कृषि सहकारी संस्था (Agriculture Cooperative)",
  "दुग्ध सहकारी संस्था (Dairy Cooperative)",
  "महिला विकास सहकारी संस्था (Women Development Cooperative)",
  "उपभोक्ता सहकारी संस्था (Consumer Cooperative)",
  "अन्य सहकारी संस्था (Other Cooperative)",
];

export default function OrgSettingsView() {
  const { state, updateOrgSettings } = useStore();
  const [form, setForm] = useState(state.orgSettings);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    updateOrgSettings(form);
    showToast("✓ Organization settings updated successfully!");
  };

  const handleReset = () => {
    setForm(DEFAULT_ORG_SETTINGS);
    updateOrgSettings(DEFAULT_ORG_SETTINGS);
    showToast("✓ Reset to neutral placeholder configuration.");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Cooperative Organization Settings
            </h2>
            <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[11px] font-bold text-teal-800">
              Configurable Branding
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Configure official cooperative name, registration number, PAN, address, and logo.
            These details dynamically appear on the header, printed KYC forms, and member SMS invites.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-500" /> Reset to Placeholder
        </button>
      </div>

      {/* Notice Banner */}
      <div className="rounded-2xl border border-teal-200/80 bg-teal-50/60 p-4 text-xs text-teal-950 flex items-start gap-3 shadow-sm">
        <ShieldAlert className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold text-teal-900">
            Nepal Cooperative Regulatory Compliance Notice
          </p>
          <p className="text-teal-800 leading-relaxed">
            As the final organization has not yet been confirmed, this demo uses neutral placeholder details.
            You can type your real cooperative name, registration number (दर्ता नं.) and PAN below to instantly preview an official live demo.
          </p>
        </div>
      </div>

      {toast && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-center text-xs font-bold text-emerald-800 animate-fade-in shadow-sm">
          {toast}
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Names & Identity */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="h-4 w-4 text-teal-700" /> 1. Cooperative Identity &amp; Legal Names
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Official Name in Nepali (देवनागरी) <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={form.nameNepali}
                onChange={(e) => setForm({ ...form, nameNepali: e.target.value })}
                placeholder="उदा: नेपाल बचत तथा ऋण सहकारी संस्था लि."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
              <p className="mt-1 text-[11px] text-slate-400">Official legal name registered with Department of Cooperatives.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Official Name in English <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={form.nameEnglish}
                onChange={(e) => setForm({ ...form, nameEnglish: e.target.value })}
                placeholder="e.g. Nepal Savings & Credit Cooperative Society Ltd."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
              <p className="mt-1 text-[11px] text-slate-400">English name used for member portals, SMS, and English certificates.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Short Name / SMS Sender Tag
              </label>
              <input
                type="text"
                value={form.shortName}
                onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                placeholder="e.g. Nepal Coop"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Cooperative Classification (प्रकार)
              </label>
              <select
                value={form.cooperativeType}
                onChange={(e) => setForm({ ...form, cooperativeType: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 cursor-pointer"
              >
                {COOPERATIVE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card 2: Legal Registration Numbers */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-700" /> 2. Registration &amp; Tax Information
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Registration Number (दर्ता नं.)
              </label>
              <input
                type="text"
                value={form.regNo}
                onChange={(e) => setForm({ ...form, regNo: e.target.value })}
                placeholder="उदा: दर्ता नं: २०७४/००१"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Permanent Account Number (स्थायी लेखा नं. / PAN)
              </label>
              <input
                type="text"
                value={form.panNo}
                onChange={(e) => setForm({ ...form, panNo: e.target.value })}
                placeholder="उदा: ३०००००००१"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Address & Contact */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="h-4 w-4 text-teal-700" /> 3. Registered Address &amp; Contact
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Registered Address in Nepali
              </label>
              <input
                type="text"
                value={form.addressNepali}
                onChange={(e) => setForm({ ...form, addressNepali: e.target.value })}
                placeholder="उदा: काठमाडौँ-१०, बागमती प्रदेश, नेपाल"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Registered Address in English
              </label>
              <input
                type="text"
                value={form.addressEnglish}
                onChange={(e) => setForm({ ...form, addressEnglish: e.target.value })}
                placeholder="e.g. Kathmandu-10, Bagmati Province, Nepal"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Official Phone Number
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+977-01-XXXXXXX"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="info@coop.org.np"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Logo & Demo Watermark */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="h-4 w-4 text-teal-700" /> 4. Emblem &amp; Sample Data Flag
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Official Logo / Vector Emblem
              </label>
              <div className="flex gap-3">
                {[
                  { id: "emblem", label: "Classic Coop Emblem" },
                  { id: "hands", label: "Cooperation Hands" },
                  { id: "scales", label: "Stability & Balance" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setForm({ ...form, logoPreset: item.id as any })}
                    className={`flex-1 rounded-2xl border p-3 text-center transition cursor-pointer text-xs font-bold ${
                      form.logoPreset === item.id
                        ? "border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-500/20"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer rounded-2xl border border-slate-200 p-3 bg-slate-50 hover:bg-slate-100/60 transition">
                <input
                  type="checkbox"
                  checked={form.isSample}
                  onChange={(e) => setForm({ ...form, isSample: e.target.checked })}
                  className="h-4 w-4 rounded accent-teal-600"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Display "[Sample / Unconfirmed Organization]" tag
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Keeps evaluators informed that these are placeholder details until real documents are supplied.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-extrabold px-6 py-3 text-sm shadow-md shadow-teal-700/20 transition cursor-pointer"
          >
            <Save className="h-4 w-4" /> Save Organization Settings
          </button>
        </div>
      </form>
    </div>
  );
}

