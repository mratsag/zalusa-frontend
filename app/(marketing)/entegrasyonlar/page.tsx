import type { Metadata } from "next";

import { EntegrasyonlarContent } from "./entegrasyonlar-client";

// PHP entegrasyonlar.php portu. İçerik + gömülü <style> ham HTML; sticky-nav
// scroll-spy client component'te (IntersectionObserver).
export const metadata: Metadata = {
  title: "Entegrasyonlar: Pazaryeri, E-ticaret ve Muhasebe Çözümleri",
  description:
    "Zalusa entegrasyonları ile pazaryeri, e-ticaret altyapısı ve muhasebe süreçlerinizi tek panelde yönetin.",
};

export default function EntegrasyonlarPage() {
  return <EntegrasyonlarContent />;
}
