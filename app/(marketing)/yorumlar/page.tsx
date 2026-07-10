import type { Metadata } from "next";

import { HTML } from "./content";
import { YorumlarInteractive } from "./yorumlar-interactive";

// PHP yorumlar.php portu — tüm yorumlar + filtre + geri bildirim formu.
// HTML server-side (dangerouslySetInnerHTML); interaktivite ayrı client component (DOM handler).
export const metadata: Metadata = {
  title: "Yorumlar - Zalusa",
  description:
    "Zalusa kullanıcı yorumları ve değerlendirmeleri. Genel ve ülke sayfalarındaki tüm değerlendirmeler burada listelenir.",
};

export default function YorumlarPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
      <YorumlarInteractive />
    </>
  );
}
