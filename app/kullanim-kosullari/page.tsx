"use client";

import Link from "next/link";
import Image from "next/image";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo-ikon.png" alt="Zalusa" width={28} height={28} />
            <span className="text-lg font-bold text-[#0F172A]">Zalusa</span>
          </Link>
          <Link
            href="/auth"
            className="rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4338CA]"
          >
            Giriş Yap
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-[#E2E8F0] md:p-12">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Kullanım Koşulları</h1>
          <p className="text-sm text-[#64748B] mb-8">Son güncelleme: 18 Nisan 2026</p>

          <div className="prose prose-slate max-w-none text-[15px] leading-relaxed text-[#334155] [&_h2]:text-[#0F172A] [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-[#0F172A] [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_p]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1.5">
            <p>
              Bu Kullanım Koşulları (&quot;Koşullar&quot;), Zalusa Lojistik ve Teknoloji A.Ş. (&quot;Zalusa&quot;, &quot;biz&quot;, &quot;şirketimiz&quot;) tarafından 
              sunulan <strong>app.zalusa.com</strong> web sitesi, WhatsApp Business hizmeti, Telegram botu ve ilgili tüm dijital hizmetlerin 
              (&quot;Hizmetler&quot;) kullanımına ilişkin şartları ve koşulları belirler.
            </p>
            <p>
              Hizmetlerimizi kullanarak bu Koşulları kabul etmiş sayılırsınız. Bu Koşulları kabul etmiyorsanız, 
              lütfen Hizmetlerimizi kullanmayınız.
            </p>

            <h2>1. Hizmet Tanımı</h2>
            <p>Zalusa, aşağıdaki hizmetleri sunmaktadır:</p>
            <ul>
              <li>Uluslararası kargo gönderim hizmetleri için fiyat karşılaştırma ve sipariş oluşturma</li>
              <li>Kargo takip ve yönetimi</li>
              <li>Gümrük beyanı ve belge yönetimi</li>
              <li>WhatsApp ve Telegram üzerinden otomatik kargo oluşturma</li>
              <li>Kurye çağırma hizmeti</li>
              <li>Canlı destek ve müşteri hizmetleri</li>
            </ul>
            <p>
              Zalusa bir kargo taşıyıcısı değil, kargo aracı hizmet sağlayıcısıdır. Gönderileriniz, seçtiğiniz 
              kargo firması (DHL, FedEx, UPS, PTS, Asset vb.) tarafından taşınır.
            </p>

            <h2>2. Hesap Oluşturma ve Güvenlik</h2>
            <h3>2.1 Kayıt</h3>
            <ul>
              <li>Hizmetlerimizi kullanmak için bir hesap oluşturmanız gerekmektedir</li>
              <li>Kayıt sırasında doğru ve güncel bilgiler vermeniz zorunludur</li>
              <li>18 yaşından büyük olmanız gerekmektedir</li>
              <li>Her kullanıcı yalnızca bir hesap oluşturabilir</li>
            </ul>
            <h3>2.2 Hesap Güvenliği</h3>
            <ul>
              <li>Hesap şifrenizin gizliliğinden siz sorumlusunuz</li>
              <li>Hesabınızda gerçekleşen tüm işlemlerden siz sorumlusunuz</li>
              <li>Yetkisiz erişim şüphesi durumunda derhal bizimle iletişime geçmelisiniz</li>
            </ul>

            <h2>3. Kullanım Kuralları</h2>
            <p>Hizmetlerimizi kullanırken aşağıdaki kurallara uymanız gerekmektedir:</p>
            <ul>
              <li>Yasadışı, zararlı veya tehlikeli maddeler gönderemezsiniz</li>
              <li>Uluslararası ticaret yaptırımlarına ve ambargolara uymanız zorunludur</li>
              <li>Gümrük beyanlarında doğru ve eksiksiz bilgi vermelisiniz</li>
              <li>Sahte veya yanıltıcı bilgiler kullanarak gönderi oluşturamazsınız</li>
              <li>Hizmetlerimizi kötüye kullanamaz veya suistimal edemezsiniz</li>
              <li>Sistemlerimize yetkisiz erişim sağlamaya çalışamazsınız</li>
              <li>Diğer kullanıcıların hizmetlerini engelleyecek faaliyetlerde bulunamazsınız</li>
            </ul>

            <h2>4. WhatsApp ve Telegram Hizmetleri</h2>
            <p>WhatsApp ve Telegram botlarımız üzerinden kargo hizmeti kullanılırken:</p>
            <ul>
              <li>Mesajlarınız kargo işlemlerinizin yürütülmesi amacıyla işlenir</li>
              <li>Bot üzerinden PayLoadü verdiğiniz bilgilerin doğruluğundan siz sorumlusunuz</li>
              <li>Onayladığınız gönderiler bağlayıcıdır ve ücretlendirme geçerlidir</li>
              <li>WhatsApp hizmetimiz Meta&apos;nın WhatsApp Business Platform Politikalarına tabidir</li>
              <li>Botları spam veya kötü amaçlı kullanmanız durumunda hesabınız askıya alınabilir</li>
            </ul>

            <h2>5. Fiyatlandırma ve Ödeme</h2>
            <h3>5.1 Fiyatlar</h3>
            <ul>
              <li>Gösterilen fiyatlar anlık kur ve tarife bilgilerine dayalıdır</li>
              <li>Fiyatlar döviz kuru değişimlerine göre farklılık gösterebilir</li>
              <li>Hacimsel ağırlık hesaplaması, taşıyıcı firmanın standardına göre yapılır</li>
              <li>Ek gümrük vergileri, KDV veya benzeri ücretler fiyata dahil olmayabilir</li>
            </ul>
            <h3>5.2 Ödeme</h3>
            <ul>
              <li>Ödemeler Iyzico güvenli ödeme altyapısı üzerinden işlenir</li>
              <li>Kredi kartı bilgileriniz Zalusa tarafından saklanmaz</li>
              <li>Ödeme yapılmadan gönderiniz işleme alınmaz</li>
              <li>Onaylanan ödemeler için fatura düzenlenir</li>
            </ul>

            <h2>6. İptal ve İade</h2>
            <ul>
              <li>Kargo teslim alınmadan önce iptal talebinde bulunabilirsiniz</li>
              <li>İptal durumunda iade koşulları seçilen kargo firmasının politikasına tabidir</li>
              <li>Teslim alınan kargolar için iptal mümkün olmayabilir</li>
              <li>İade edilen tutarlar, ödeme yönteminize göre 1-14 iş günü içinde hesabınıza yansır</li>
            </ul>

            <h2>7. Sorumluluk Sınırlaması</h2>
            <ul>
              <li>Zalusa, kargo firmaları tarafından gerçekleştirilen taşıma sırasında oluşan hasar veya kayıplardan doğrudan sorumlu değildir</li>
              <li>Hasar/kayıp durumlarında taşıyıcı firmanın sigorta ve tazminat politikaları geçerlidir</li>
              <li>Gümrük süreçlerinden kaynaklanan gecikmeler Zalusa&apos;nın kontrolü dışındadır</li>
              <li>Yanlış veya eksik bilgi nedeniyle oluşan sorunlardan kullanıcı sorumludur</li>
              <li>Mücbir sebepler (doğal afet, savaş, pandemi vb.) nedeniyle oluşan aksaklıklardan sorumlu tutulamayız</li>
            </ul>

            <h2>8. Fikri Mülkiyet</h2>
            <p>
              Zalusa web sitesi, uygulama, logo, tasarım, içerik ve yazılımlar dahil tüm fikri mülkiyet hakları 
              Zalusa Lojistik ve Teknoloji A.Ş.&apos;ye aittir. Yazılı izin olmadan kopyalanamaz, çoğaltılamaz veya dağıtılamaz.
            </p>

            <h2>9. Hesap Askıya Alma ve Fesih</h2>
            <p>Aşağıdaki durumlarda hesabınızı askıya alma veya kapatma hakkımız saklıdır:</p>
            <ul>
              <li>Bu Koşulların ihlali</li>
              <li>Yasadışı faaliyetler</li>
              <li>Sahte bilgi kullanımı</li>
              <li>Sistemlerimize zarar verme girişimi</li>
              <li>Üçüncü tarafların haklarının ihlali</li>
            </ul>

            <h2>10. Uyuşmazlık Çözümü</h2>
            <p>
              Bu Koşullar Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlık durumunda İstanbul Mahkemeleri 
              ve İcra Müdürlükleri yetkilidir.
            </p>

            <h2>11. Değişiklikler</h2>
            <p>
              Bu Kullanım Koşulları zaman zaman güncellenebilir. Önemli değişiklikler yapıldığında e-posta veya 
              web sitemiz üzerinden bilgilendirileceksiniz. Hizmetlerimizi kullanmaya devam etmeniz, güncellenmiş 
              Koşulları kabul ettiğiniz anlamına gelir.
            </p>

            <h2>12. İletişim</h2>
            <p>Bu Koşullar hakkında sorularınız için bizimle iletişime geçebilirsiniz:</p>
            <ul>
              <li><strong>Şirket:</strong> Zalusa Lojistik ve Teknoloji A.Ş.</li>
              <li><strong>E-posta:</strong> iletisim@mail.zalusa.com</li>
              <li><strong>Telefon:</strong> 0850 333 0011</li>
              <li><strong>Web:</strong> app.zalusa.com</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-8">
        <div className="mx-auto max-w-4xl px-6 text-center text-sm text-[#94A3B8]">
          <p>© {new Date().getFullYear()} Zalusa. Tüm hakları saklıdır.</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link href="/gizlilik-politikasi" className="hover:text-[#4F46E5] transition-colors font-medium">Gizlilik Politikası</Link>
            <Link href="/kullanim-kosullari" className="hover:text-[#4F46E5] transition-colors font-medium">Kullanım Koşulları</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
