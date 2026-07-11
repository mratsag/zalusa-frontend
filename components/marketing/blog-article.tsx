/* eslint-disable @next/next/no-img-element */
import { formatTrDate } from "@/lib/date";

// DB'den gelen blog yazısı için makale şablonu (blog-detay.php'nin dinamik karşılığı).
// İçerik .zalusa-rich-content ile stillenir (marketing.css). Statik 3 yazı kendi HTML'iyle render edilir.

export type DbBlogPost = {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  featuredImage: string;
  createdAt: string;
  seoTitle?: string;
  seoDescription?: string;
};

export function BlogArticle({ post }: { post: DbBlogPost }) {
  const dateStr = formatTrDate(post.createdAt, { day: "numeric", month: "long", year: "numeric" });

  return (
    <main className="bg-[#FAFAF8] pt-8 md:pt-10 pb-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-5 md:mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 md:gap-2.5 text-[13px] md:text-sm flex-nowrap">
            <li className="flex items-center shrink-0"><a href="/" className="text-slate-400 hover:text-[#0000BE] transition">Anasayfa</a></li>
            <li className="flex items-center text-slate-300 shrink-0">/</li>
            <li className="flex items-center shrink-0"><a href="/blog" className="text-slate-400 hover:text-[#0000BE] transition">Blog</a></li>
            {post.category && (
              <>
                <li className="flex items-center text-slate-300 shrink-0">/</li>
                <li className="flex items-center shrink-0"><a href={`/blog?category=${encodeURIComponent(post.category)}`} className="text-slate-400 hover:text-[#0000BE] transition">{post.category}</a></li>
              </>
            )}
            <li className="flex items-center text-slate-300 shrink-0">/</li>
            <li className="flex items-center min-w-0"><span className="text-slate-600 font-semibold truncate max-w-[200px] md:max-w-xs">{post.title}</span></li>
          </ol>
        </nav>

        <article>
          {/* Başlık + meta */}
          <header className="mb-6">
            {post.category && (
              <span className="inline-block px-2.5 py-1 rounded-md bg-[#EEF0FF] text-[#0000BE] text-xs font-semibold uppercase tracking-wider mb-4">{post.category}</span>
            )}
            <h1 className="text-3xl md:text-[42px] font-bold tracking-tight text-slate-900 leading-[1.12]">{post.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              {post.author && <span className="font-medium text-slate-700">{post.author}</span>}
              {post.author && dateStr && <span className="text-slate-300">·</span>}
              {dateStr && <time>{dateStr}</time>}
            </div>
          </header>

          {/* Öne çıkan görsel */}
          {post.featuredImage && (
            <img src={post.featuredImage} alt={post.title} className="w-full rounded-2xl border border-slate-200 object-cover mb-8" loading="eager" />
          )}

          {/* İçerik */}
          <div className="zalusa-rich-content prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        {/* Alt CTA */}
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 text-center zal-shadow-soft">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Yurt dışına gönderim mi yapacaksınız?</h2>
          <p className="mt-2 text-slate-600">Zalusa ile fiyatları karşılaştırın, tek panelden gönderin.</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a href="/yurtdisi-kargo-fiyat-hesaplama" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0000BE] hover:bg-blue-800 text-white font-semibold rounded-xl transition">Fiyat Hesapla</a>
            <a href="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl border border-slate-200 transition">Tüm Yazılar</a>
          </div>
        </div>
      </div>
    </main>
  );
}
