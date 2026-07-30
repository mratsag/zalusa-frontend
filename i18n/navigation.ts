import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

// Dil-farkındalıklı navigasyon yardımcıları. Dil seçici ve iç linkler bunları kullanır;
// böylece /en içindeyken linkler otomatik /en önekli üretilir.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
