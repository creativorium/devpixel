import Link from "next/link";
import { localizedPath, type Locale } from "@/lib/i18n";
const copy = {
  en: [
    "Web design for local and expat-owned businesses in Bali.",
    "Whether you run a cafe in Canggu, a villa in Uluwatu, a spa in Ubud or a shop serving local customers, your website should make the next step clear. We design and develop websites around your services, audience and enquiry process, with a scope that fits your business.",
    "These concepts show different ways to present a Bali business to residents, international visitors and expat customers. Your own build can include Indonesian and English content, WhatsApp enquiries, menus, booking integrations or ecommerce, depending on what you need.",
    "Explore web design services",
    "Discuss your Bali business website",
  ],
  id: [
    "Jasa pembuatan website untuk bisnis lokal dan milik ekspatriat di Bali.",
    "Baik Anda mengelola kafe di Canggu, vila di Uluwatu, spa di Ubud, maupun toko untuk pelanggan lokal, website perlu memudahkan pengunjung mengambil langkah berikutnya. Kami merancang dan mengembangkan website sesuai layanan, audiens, dan kebutuhan bisnis Anda.",
    "Konsep ini menunjukkan cara memperkenalkan bisnis Bali kepada warga lokal, wisatawan, dan pelanggan ekspatriat. Website Anda dapat dilengkapi konten bahasa Indonesia dan Inggris, WhatsApp, menu, integrasi reservasi, atau ecommerce sesuai kebutuhan.",
    "Lihat layanan desain website",
    "Diskusikan website bisnis Anda di Bali",
  ],
  de: [
    "Webdesign für lokale und von Expats geführte Unternehmen auf Bali.",
    "Ob Café in Canggu, Villa in Uluwatu, Spa in Ubud oder Geschäft für lokale Kunden: Ihre Website sollte den nächsten Schritt einfach machen. Wir gestalten und entwickeln Websites passend zu Ihrem Angebot, Ihrer Zielgruppe und Ihrem Budgetrahmen.",
    "Die Konzepte zeigen verschiedene Wege, Einwohner, internationale Gäste und Expats anzusprechen. Je nach Bedarf sind indonesische und englische Inhalte, WhatsApp-Anfragen, Speisekarten, Buchungsintegrationen oder E-Commerce möglich.",
    "Webdesign entdecken",
    "Ihre Website für Bali besprechen",
  ],
  zh: [
    "为巴厘岛本地及外籍人士经营的企业设计网站。",
    "无论是苍古的咖啡馆、乌鲁瓦图的别墅、乌布的水疗中心，还是面向本地顾客的商店，网站都应让访客轻松找到下一步。我们根据您的服务、受众和业务需求设计与开发网站。",
    "这些概念展示了面向当地居民、国际游客和外籍客户的不同设计。实际网站可按需加入印尼语和英语内容、WhatsApp咨询、菜单、预订系统集成或电商功能。",
    "了解网站设计服务",
    "讨论您的巴厘岛企业网站",
  ],
  ja: [
    "バリの地元企業と海外出身オーナーのためのウェブデザイン。",
    "チャングーのカフェ、ウルワツのヴィラ、ウブドのスパ、地元向けのショップ。それぞれのサービスとお客様に合わせ、問い合わせまで分かりやすく案内するサイトを設計・開発します。",
    "地域住民、旅行者、海外からの移住者に向けたデザインをご覧ください。実際のサイトには、必要に応じてインドネシア語・英語のコンテンツ、WhatsApp、メニュー、予約連携、EC機能を組み込めます。",
    "ウェブデザインを見る",
    "バリのビジネスサイトを相談する",
  ],
};
export function ShowcaseLocalContext({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <section className="showcase-bottom">
      <h2>{c[0]}</h2>
      <p>{c[1]}</p>
      <p>{c[2]}</p>
      <p>
        <Link
          className="text-link"
          href={localizedPath("/services/web-design", locale)}
        >
          {c[3]} ↗
        </Link>
      </p>
      <Link className="button dark" href={localizedPath("/contact", locale)}>
        {c[4]} ↗
      </Link>
    </section>
  );
}
