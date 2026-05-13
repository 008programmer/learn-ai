import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSelector() {
  const { i18n } = useTranslation();

  function handleChange(code: string) {
    void i18n.changeLanguage(code);
    localStorage.setItem("language", code);
    // Update HTML lang and dir attributes
    document.documentElement.lang = code;
    const lang = LANGUAGES.find((l) => l.code === code);
    document.documentElement.dir = lang?.dir ?? "ltr";
  }

  return (
    <Select value={i18n.language} onValueChange={handleChange}>
      <SelectTrigger className="w-[140px] h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-72 overflow-y-auto">
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} className="text-xs">
            <span className="font-medium">{lang.nativeName}</span>
            {lang.nativeName !== lang.name && (
              <span className="text-muted-foreground ml-1">({lang.name})</span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
