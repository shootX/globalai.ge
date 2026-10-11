import ka from "../../../messages/ka.json";
import en from "../../../messages/en.json";
import ru from "../../../messages/ru.json";

export type AdminOpsLocale = "ka" | "en" | "ru";

const COPY = { ka: ka.adminOps, en: en.adminOps, ru: ru.adminOps };

export function adminOps(locale: AdminOpsLocale = "ka") {
  return COPY[locale];
}

export const ACTION_LABEL: Record<AdminOpsLocale, Record<string, string>> = {
  ka: {
    created: "შეიქმნა",
    updated: "განახლდა",
    deleted: "წაიშალა",
    uploaded: "აიტვირთა",
    settings_changed: "პარამეტრები",
    login: "შესვლა",
    token_created: "ტოკენი შეიქმნა",
    token_revoked: "ტოკენი გაუქმდა",
  },
  en: {
    created: "Created",
    updated: "Updated",
    deleted: "Deleted",
    uploaded: "Uploaded",
    settings_changed: "Settings",
    login: "Login",
    token_created: "Token created",
    token_revoked: "Token revoked",
  },
  ru: {
    created: "Создано",
    updated: "Обновлено",
    deleted: "Удалено",
    uploaded: "Загружено",
    settings_changed: "Настройки",
    login: "Вход",
    token_created: "Токен создан",
    token_revoked: "Токен отозван",
  },
};
