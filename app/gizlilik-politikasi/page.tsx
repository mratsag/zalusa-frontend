"use client";

import Link from "next/link";
import Image from "next/image";

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Gizlilik Politikası</h1>
          <p className="text-sm text-[#64748B] mb-8">Son güncelleme: 18 Nisan 2026</p>

          <div className="prose prose-slate max-w-none text-[15px] leading-relaxed text-[#334155] [&_h2]:text-[#0F172A] [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-[#0F172A] [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_p]:mb-4">
            <p>
              Zalusa Lojistik ve Teknoloji A.Ş. (&quot;Zalusa&quot;, &quot;biz&quot;, &quot;şirketimiz&quot;) olarak kişisel verilerinizin güvenliğine önem veriyoruz. 
              Bu Gizlilik Politikası, <strong>app.zalusa.com</strong> web sitesi, mobil uygulamalar ve WhatsApp Business dahil tüm dijital kanallarımız 
              üzerinden toplanan kişisel verilerin nasıl işlendiğini açıklamaktadır.
            </p>
            <p>
              Bu politika, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR) 
              kapsamında hazırlanmıştır.
            </p>

            <h2>1. Toplanan Kişisel Veriler</h2>
            <p>Hizmetlerimizi sunmak amacıyla aşağıdaki kişisel verileri toplayabiliriz:</p>
            <h3>1.1 Kimlik Bilgileri</h3>
            <ul>
              <li>Ad, soyad</li>
              <li>T.C. kimlik numarası (bireysel kullanıcılar için)</li>
              <li>Vergi numarası ve vergi dairesi (kurumsal kullanıcılar için)</li>
            </ul>
            <h3>1.2 İletişim Bilgileri</h3>
            <ul>
              <li>E-posta adresi</li>
              <li>Telefon numarası</li>
              <li>WhatsApp numarası</li>
              <li>Posta adresi</li>
            </ul>
            <h3>1.3 Kargo ve İşlem Bilgileri</h3>
            <ul>
              <li>Gönderi detayları (boyut, ağırlık, içerik)</li>
              <li>Gönderici ve alıcı adresleri</li>
              <li>Takip numaraları</li>
              <li>Gümrük beyanı bilgileri (HS kodu, proforma fatura)</li>
              <li>Ödeme bilgileri (kredi kartı bilgileri Iyzico tarafından işlenir, tarafımızca saklanmaz)</li>
            </ul>
            <h3>1.4 Teknik Veriler</h3>
            <ul>
              <li>IP adresi</li>
              <li>Tarayıcı türü ve sürümü</li>
              <li>Cihaz bilgileri</li>
              <li>Çerez verileri</li>
              <li>Oturum bilgileri</li>
            </ul>

            <h2>2. Kişisel Verilerin İşlenme Amaçları</h2>
            <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
            <ul>
              <li>Hesap oluşturma ve kimlik doğrulama</li>
              <li>Kargo gönderimlerinin oluşturulması, takibi ve yönetimi</li>
              <li>Fiyat teklifi ve maliyet hesaplama</li>
              <li>Gümrük işlemlerinin yürütülmesi</li>
              <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
              <li>Müşteri destek hizmetlerinin sunulması (canlı destek, WhatsApp, Telegram)</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Hizmet kalitesinin artırılması ve analiz</li>
              <li>Onayınız dahilinde pazarlama ve bilgilendirme iletişimleri</li>
            </ul>

            <h2>3. WhatsApp Business API Kullanımı</h2>
            <p>
              Zalusa, Meta (Facebook) WhatsApp Business API&apos;sini kullanarak müşterilerine kargo oluşturma ve takip hizmeti sunmaktadır. 
              WhatsApp üzerinden iletişim kurduğunuzda:
            </p>
            <ul>
              <li>Telefon numaranız ve WhatsApp profil bilgileriniz işlenir</li>
              <li>Mesaj içerikleriniz kargo işlemlerinizin yürütülmesi amacıyla kullanılır</li>
              <li>Gönderdiğiniz belgeler (fatura, gümrük belgeleri) güvenli sunucularda saklanır</li>
              <li>Mesajlaşma verileri Meta&apos;nın WhatsApp Business Platform politikalarına tabidir</li>
            </ul>
            <p>
              WhatsApp üzerinden toplanan veriler yalnızca kargo operasyonlarınızın yürütülmesi amacıyla kullanılır ve 
              üçüncü taraf pazarlama amaçlı paylaşılmaz.
            </p>

            <h2>4. Kişisel Verilerin Paylaşılması</h2>
            <p>Kişisel verileriniz aşağıdaki durumlarda üçüncü taraflarla paylaşılabilir:</p>
            <ul>
              <li><strong>Kargo firmaları:</strong> Gönderi işlemlerinin gerçekleştirilmesi için (DHL, FedEx, UPS, PTS, Asset vb.)</li>
              <li><strong>Ödeme hizmet sağlayıcısı:</strong> Ödeme işlemleri için Iyzico ile paylaşılır</li>
              <li><strong>Gümrük idareleri:</strong> Yasal zorunluluklar kapsamında</li>
              <li><strong>Hukuki zorunluluklar:</strong> Mahkeme kararı veya yasal düzenlemeler gereği yetkili kurumlara</li>
              <li><strong>Meta Platforms:</strong> WhatsApp Business API hizmet altyapısı kapsamında</li>
            </ul>
            <p>
              Kişisel verileriniz hiçbir koşulda reklam veya pazarlama amaçlı üçüncü taraflara satılmaz.
            </p>

            <h2>5. Verilerin Saklanması ve Güvenliği</h2>
            <p>Kişisel verileriniz:</p>
            <ul>
              <li>SSL/TLS şifreleme ile korunan sunucularda saklanır</li>
              <li>Erişim kontrolleri ve yetkilendirme mekanizmaları ile güvence altına alınır</li>
              <li>İşleme amacının gerektirdiği süre boyunca saklanır</li>
              <li>Yasal saklama süreleri sona erdikten sonra güvenli şekilde silinir veya anonim hale getirilir</li>
            </ul>

            <h2>6. Çerezler (Cookies)</h2>
            <p>Web sitemizde aşağıdaki çerez türleri kullanılmaktadır:</p>
            <ul>
              <li><strong>Zorunlu çerezler:</strong> Sitenin düzgün çalışması için gereklidir (oturum yönetimi)</li>
              <li><strong>Analitik çerezler:</strong> Site kullanım istatistiklerini toplar (anonim)</li>
              <li><strong>İşlevsel çerezler:</strong> Tercihlerinizi hatırlar (dil, tema vb.)</li>
            </ul>
            <p>Tarayıcı ayarlarınızdan çerezleri yönetebilir veya devre dışı bırakabilirsiniz.</p>

            <h2>7. Kullanıcı Hakları</h2>
            <p>KVKK ve GDPR kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul>
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenen verileriniz hakkında bilgi talep etme</li>
              <li>Verilerin işlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurtiçi veya yurtdışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenen verilerin düzeltilmesini isteme</li>
              <li>Verilerin silinmesini veya yok edilmesini isteme</li>
              <li>Verilerinizin taşınabilirliğini talep etme (GDPR)</li>
              <li>İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi durumunda aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
            </ul>
            <p>
              Bu haklarınızı kullanmak için <strong>iletisim@mail.zalusa.com</strong> adresine e-posta göndererek 
              veya destek talebi oluşturarak bizimle iletişime geçebilirsiniz.
            </p>

            <h2>8. Veri Silme Talebi</h2>
            <p>
              Hesabınızı ve tüm kişisel verilerinizi silmek istemeniz durumunda, <strong>iletisim@mail.zalusa.com</strong> adresine 
              &quot;Veri Silme Talebi&quot; konulu bir e-posta gönderebilirsiniz. Talebiniz en geç 30 gün içinde işleme alınacaktır.
            </p>
            <p>
              Yasal saklama yükümlülükleri kapsamındaki veriler (fatura bilgileri, gümrük kayıtları vb.) yasal sürelerin 
              sonuna kadar saklanmaya devam eder.
            </p>

            <h2>9. Çocukların Gizliliği</h2>
            <p>
              Hizmetlerimiz 18 yaşın altındaki bireylere yönelik değildir. 18 yaşından küçük bireylerin kişisel verilerini 
              bilerek toplamıyoruz. Böyle bir durumun tespit edilmesi halinde ilgili veriler derhal silinir.
            </p>

            <h2>10. Politika Değişiklikleri</h2>
            <p>
              Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli değişiklikler yapıldığında e-posta veya 
              web sitemiz üzerinden bilgilendirileceksiniz. Politikayı düzenli olarak kontrol etmenizi öneririz.
            </p>

            <h2>11. İletişim</h2>
            <p>Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:</p>
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
