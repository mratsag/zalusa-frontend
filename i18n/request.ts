import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

// Sunucu tarafı istek yapılandırması: aktif dili çözer ve mesaj kataloğunu yükler.
// Desteklenmeyen bir dil gelirse varsayılana (tr) düşer.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
