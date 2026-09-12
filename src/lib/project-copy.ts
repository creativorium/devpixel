import type { Locale } from "./i18n";
export const jwCopy: Record<
  Locale,
  {
    label: string;
    category: string;
    intro: string;
    visit: string;
    scope: string;
    sections: [string, string][];
  }
> = {
  en: {
    label: "CLIENT PROJECT / ONGOING MONTHLY MAINTENANCE",
    category: "Web development",
    intro:
      "Website development, payment integration, a class application and trading journal app for JW Trading Academy, with ongoing monthly website maintenance.",
    visit: "Visit the website",
    scope: "A website, connected applications, and continued support.",
    sections: [
      [
        "Website development",
        "We developed the academy’s website to present its trading education offering and give visitors a clear path to explore its classes.",
      ],
      [
        "Payment integration",
        "We created the website’s payment integration to support purchases of the academy’s offering.",
      ],
      [
        "Class application & journal app",
        "Our development scope included the class application and a trading journal app, supporting the academy’s learning experience beyond its public website.",
      ],
      [
        "Monthly maintenance",
        "We continue to maintain the website each month, supporting its ongoing operation after launch.",
      ],
    ],
  },
  de: {
    label: "KUNDENPROJEKT / MONATLICHE WARTUNG",
    category: "Webentwicklung",
    intro:
      "Website-Entwicklung, Zahlungsintegration, Kursanwendung und Trading-Journal-App für JW Trading Academy, ergänzt durch laufende monatliche Website-Wartung.",
    visit: "Website besuchen",
    scope: "Website, Anwendungen und laufende Betreuung.",
    sections: [
      [
        "Website-Entwicklung",
        "Wir entwickelten die Website der Akademie, um ihr Bildungsangebot vorzustellen und Besuchern einen klaren Zugang zu den Kursen zu bieten.",
      ],
      [
        "Zahlungsintegration",
        "Wir entwickelten die Zahlungsintegration der Website für den Kauf der Angebote der Akademie.",
      ],
      [
        "Kursanwendung und Journal-App",
        "Unser Entwicklungsumfang umfasste die Kursanwendung und eine Trading-Journal-App für das Lernerlebnis über die öffentliche Website hinaus.",
      ],
      [
        "Monatliche Wartung",
        "Wir betreuen die Website weiterhin monatlich und unterstützen ihren laufenden Betrieb.",
      ],
    ],
  },
  zh: {
    label: "客户项目 / 每月持续维护",
    category: "网站开发",
    intro:
      "为 JW Trading Academy 开发网站、支付集成、课程应用和交易日志应用，并提供持续的每月网站维护。",
    visit: "访问网站",
    scope: "网站、配套应用与持续支持。",
    sections: [
      [
        "网站开发",
        "我们开发了学院网站，展示其交易教育服务，让访客清晰了解课程。",
      ],
      ["支付集成", "我们开发了网站支付集成，支持购买学院提供的服务。"],
      [
        "课程与交易日志应用",
        "开发范围包括课程应用和交易日志应用，为公开网站之外的学习体验提供支持。",
      ],
      ["每月维护", "我们每月持续维护网站，支持上线后的日常运行。"],
    ],
  },
  ja: {
    label: "クライアント案件 / 毎月の継続保守",
    category: "ウェブ開発",
    intro:
      "JW Trading Academy のウェブサイト、決済連携、講座アプリ、トレード記録アプリを開発し、毎月のサイト保守も担当しています。",
    visit: "サイトを見る",
    scope: "ウェブサイト、関連アプリ、継続サポート。",
    sections: [
      [
        "ウェブサイト開発",
        "アカデミーの教育サービスを紹介し、訪問者が講座を探しやすいウェブサイトを開発しました。",
      ],
      [
        "決済連携",
        "アカデミーのサービス購入を支えるウェブサイトの決済連携を開発しました。",
      ],
      [
        "講座アプリと記録アプリ",
        "開発範囲には講座アプリとトレード記録アプリが含まれ、公開サイトの先にある学習体験を支えています。",
      ],
      [
        "毎月の保守",
        "公開後も毎月サイトの保守を続け、日々の運用をサポートしています。",
      ],
    ],
  },
  id: {
    label: "PROYEK KLIEN / PEMELIHARAAN BULANAN",
    category: "Pengembangan web",
    intro:
      "Pengembangan website, integrasi pembayaran, aplikasi kelas, dan aplikasi jurnal trading untuk JW Trading Academy, dengan pemeliharaan website setiap bulan.",
    visit: "Kunjungi website",
    scope: "Website, aplikasi pendukung, dan dukungan berkelanjutan.",
    sections: [
      [
        "Pengembangan website",
        "Kami mengembangkan website akademi untuk memperkenalkan layanan edukasi trading dan memudahkan pengunjung menjelajahi kelasnya.",
      ],
      [
        "Integrasi pembayaran",
        "Kami membangun integrasi pembayaran website untuk mendukung pembelian layanan akademi.",
      ],
      [
        "Aplikasi kelas dan jurnal",
        "Lingkup pengembangan mencakup aplikasi kelas dan jurnal trading yang mendukung pengalaman belajar di luar website publik.",
      ],
      [
        "Pemeliharaan bulanan",
        "Kami terus memelihara website setiap bulan untuk mendukung operasionalnya setelah peluncuran.",
      ],
    ],
  },
};
export function conceptIndex(kind: string) {
  return ["form", "grid", "mono"].indexOf(kind);
}
