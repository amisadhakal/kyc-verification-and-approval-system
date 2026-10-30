import { useI18n, type Language } from "../lib/i18n";

const OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ne", label: "नेपाली" },
];

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border border-white/25 bg-white/10 backdrop-blur-sm p-0.5 ${className}`}
      role="group"
      aria-label="Language / भाषा"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => setLang(o.value)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
            lang === o.value
              ? "bg-white text-[#145C45] shadow-sm"
              : "text-[#DDF3E7] hover:bg-white/10"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
