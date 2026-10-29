import { Building2, Landmark, Scale, Users } from "lucide-react";
import type { OrgSettings } from "../lib/types";

export function CoopLogo({
  settings,
  className = "h-11 w-11",
  iconClassName = "h-6 w-6",
  showStatusDot = true,
}: {
  settings?: OrgSettings;
  className?: string;
  iconClassName?: string;
  showStatusDot?: boolean;
}) {
  const preset = settings?.logoPreset || "emblem";

  if (settings?.customLogoUrl) {
    return (
      <div className={`overflow-hidden rounded-2xl bg-white p-1 ring-1 ring-white/20 shadow-sm ${className}`}>
        <img
          src={settings.customLogoUrl}
          alt={settings.nameEnglish}
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-teal-800 text-white shadow-md ring-1 ring-white/20 shrink-0 ${className}`}
      title={settings?.nameEnglish || "Cooperative Society"}
    >
      {preset === "hands" ? (
        <Users className={iconClassName} />
      ) : preset === "scales" ? (
        <Scale className={iconClassName} />
      ) : (
        <Landmark className={iconClassName} />
      )}
      {showStatusDot && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-amber-400 ring-2 ring-teal-950" />
      )}
    </div>
  );
}

