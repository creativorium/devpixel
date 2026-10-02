import type { Locale } from "./i18n";
export const showcaseCopy: Record<
  Locale,
  {
    nav: string;
    title: string;
    intro: string;
    note: string;
    all: string;
    categories: string[];
    explore: string;
    contact: string;
    concept: string;
  }
> = {
  en: {
    nav: "Showcase",
    title: "Imagine your next website.",
    intro:
      "Thirty website concepts for local and expat-owned businesses in Bali. Explore five different directions for hotels, restaurants, shops, villas, rentals and spas, then find the right starting point for your business.",
    note: "Independent design concepts, not client projects. Fictional brands, illustrative photography and sample prices. Live demos are in English.",
    all: "All concepts",
    categories: [
      "Hospitality",
      "Cafe / Restaurant",
      "Shops / Ecommerce",
      "Villa",
      "Rental",
      "Spa / Wellness",
    ],
    explore: "Explore website",
    contact: "Discuss your website",
    concept: "Design concept",
  },
  de: {
    nav: "Showcase",
    title: "So könnte Ihre nächste Website aussehen.",
    intro:
      "Dreißig Website-Konzepte für Unternehmen in Bali: je fünf für Hotels, Cafés und Restaurants, Shops, Villen, Vermietungen und Spas. Erkunden Sie die Designs und sprechen Sie mit uns über Ihre Idee.",
    note: "Eigenständige Designkonzepte, keine Kundenprojekte. Fiktive Marken, illustrative Fotos und Beispielpreise. Die Demos sind auf Englisch.",
    all: "Alle Konzepte",
    categories: [
      "Hotellerie",
      "Café / Restaurant",
      "Shops / E-Commerce",
      "Villa",
      "Vermietung",
      "Spa / Wellness",
    ],
    explore: "Website erkunden",
    contact: "Website besprechen",
    concept: "Designkonzept",
  },
  id: {
    nav: "Showcase",
    title: "Bayangkan website berikutnya.",
    intro:
      "Tiga puluh konsep website untuk bisnis di Bali. Jelajahi lima pilihan desain untuk setiap kategori: hospitality, kafe dan restoran, toko, vila, rental, dan spa. Temukan arah yang cocok untuk bisnis Anda.",
    note: "Konsep desain mandiri, bukan proyek klien. Brand fiktif, foto ilustrasi, dan harga contoh. Demo tersedia dalam bahasa Inggris.",
    all: "Semua konsep",
    categories: [
      "Hospitality",
      "Kafe / Restoran",
      "Toko / Ecommerce",
      "Vila",
      "Rental",
      "Spa / Wellness",
    ],
    explore: "Jelajahi website",
    contact: "Diskusikan website Anda",
    concept: "Konsep desain",
  },
  zh: {
    nav: "设计展示",
    title: "想象您的下一个网站。",
    intro:
      "为巴厘岛企业打造的30个网站概念，涵盖酒店、咖啡馆与餐厅、商店、别墅、租赁及水疗六大类别，每类提供五种设计方向。探索适合您品牌的网站风格。",
    note: "独立设计概念，并非客户项目。品牌为虚构，照片仅作示意，价格为示例。演示网站使用英语。",
    all: "全部概念",
    categories: [
      "酒店",
      "咖啡馆 / 餐厅",
      "商店 / 电商",
      "别墅",
      "租赁",
      "水疗 / 健康",
    ],
    explore: "探索网站",
    contact: "讨论您的网站",
    concept: "设计概念",
  },
  ja: {
    nav: "ショーケース",
    title: "次のウェブサイトを思い描く。",
    intro:
      "バリのビジネスに向けた30のウェブサイト構想。ホテル、カフェ・レストラン、ショップ、ヴィラ、レンタル、スパの各分野に5つのデザインをご用意しました。ブランドに合う方向をご相談ください。",
    note: "自主制作のデザインコンセプトです。ブランドは架空、写真はイメージ、価格はサンプルです。デモは英語で表示されます。",
    all: "すべて",
    categories: [
      "ホテル",
      "カフェ / レストラン",
      "ショップ / EC",
      "ヴィラ",
      "レンタル",
      "スパ / ウェルネス",
    ],
    explore: "サイトを見る",
    contact: "サイトを相談する",
    concept: "デザインコンセプト",
  },
};
export const showcasePlatforms: Record<Locale, string> = {
  en: "Built around your business: Shopify, WordPress, a suitable CMS, or a custom website. These previews are custom-built design concepts; we’ll help choose the right platform for your project.",
  de: "Passend zu Ihrem Unternehmen: Shopify, WordPress, ein geeignetes CMS oder eine individuelle Website. Diese Vorschauen sind individuell entwickelte Designkonzepte. Gemeinsam wählen wir die passende Plattform.",
  id: "Sesuai kebutuhan bisnis Anda: Shopify, WordPress, CMS yang tepat, atau website custom. Preview ini adalah konsep desain yang dibuat khusus. Kami bantu memilih platform yang cocok untuk proyek Anda.",
  zh: "根据业务需求选择 Shopify、WordPress、合适的内容管理系统或定制网站。这些预览是定制设计概念；我们会协助您选择适合项目的平台。",
  ja: "Shopify、WordPress、適切なCMS、または独自開発。ビジネスに合わせて選べます。プレビューは独自に制作したデザイン構想です。プロジェクトに合うプラットフォームをご提案します。",
};
