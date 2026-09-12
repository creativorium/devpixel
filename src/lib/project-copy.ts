import type { Locale } from "./i18n";
export type ClientCopy = {
  label: string;
  category: string;
  intro: string;
  visit: string;
  scope: string;
  sections: [string, string][];
};
export const jwCopy: Record<Locale, ClientCopy> = {
  en: {
    label: "CLIENT PROJECT / ONGOING MONTHLY MAINTENANCE",
    category: "Web development",
    intro:
      "Website development with Vite, integration of the existing class and trading journal applications with payments, and ongoing monthly maintenance for JW Trading Academy.",
    visit: "Visit the website",
    scope: "A website, connected applications, and continued support.",
    sections: [
      [
        "Website development",
        "We developed the academy’s website with Vite to present its trading education offering and give visitors a clear path to explore its classes.",
      ],
      [
        "Payment integration",
        "We created the website’s payment integration to support purchases of the academy’s offering.",
      ],
      [
        "Class & journal app integration",
        "We integrated the existing class application and trading journal app with the website and payment flow. The applications themselves were not built by our studio.",
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
      "Website-Entwicklung mit Vite, Integration bestehender Kurs- und Trading-Journal-Anwendungen mit Zahlungen sowie monatliche Wartung für JW Trading Academy.",
    visit: "Website besuchen",
    scope: "Website, Anwendungen und laufende Betreuung.",
    sections: [
      [
        "Website-Entwicklung",
        "Wir entwickelten die Website der Akademie mit Vite, um ihr Bildungsangebot vorzustellen und Besuchern einen klaren Zugang zu den Kursen zu bieten.",
      ],
      [
        "Zahlungsintegration",
        "Wir entwickelten die Zahlungsintegration der Website für den Kauf der Angebote der Akademie.",
      ],
      [
        "Integration der Kurs- und Journal-App",
        "Wir integrierten die bestehenden Kurs- und Trading-Journal-Anwendungen mit der Website und dem Zahlungsablauf. Die Anwendungen selbst wurden nicht von unserem Studio entwickelt.",
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
      "使用 Vite 为 JW Trading Academy 开发网站，将现有课程及交易日志应用与支付流程集成，并提供每月维护。",
    visit: "访问网站",
    scope: "网站、配套应用与持续支持。",
    sections: [
      [
        "网站开发",
        "我们使用 Vite 开发了学院网站，展示其交易教育服务，让访客清晰了解课程。",
      ],
      ["支付集成", "我们开发了网站支付集成，支持购买学院提供的服务。"],
      [
        "课程与交易日志应用集成",
        "我们将现有课程应用和交易日志应用与网站及支付流程集成。应用本身并非由我们开发。",
      ],
      ["每月维护", "我们每月持续维护网站，支持上线后的日常运行。"],
    ],
  },
  ja: {
    label: "クライアント案件 / 毎月の継続保守",
    category: "ウェブ開発",
    intro:
      "JW Trading Academy のサイトを Vite で開発し、既存の講座・トレード記録アプリと決済の連携、毎月の保守を担当しています。",
    visit: "サイトを見る",
    scope: "ウェブサイト、関連アプリ、継続サポート。",
    sections: [
      [
        "ウェブサイト開発",
        "Vite を使い、アカデミーの教育サービスを紹介して講座を探しやすいサイトを開発しました。",
      ],
      [
        "決済連携",
        "アカデミーのサービス購入を支えるウェブサイトの決済連携を開発しました。",
      ],
      [
        "講座・記録アプリの連携",
        "既存の講座アプリとトレード記録アプリをサイトおよび決済フローと連携しました。アプリ自体は当スタジオの開発ではありません。",
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
      "Pengembangan website dengan Vite, integrasi aplikasi kelas dan jurnal trading yang sudah ada dengan pembayaran, serta pemeliharaan bulanan untuk JW Trading Academy.",
    visit: "Kunjungi website",
    scope: "Website, aplikasi pendukung, dan dukungan berkelanjutan.",
    sections: [
      [
        "Pengembangan website",
        "Kami mengembangkan website akademi dengan Vite untuk memperkenalkan layanan edukasi trading dan memudahkan pengunjung menjelajahi kelasnya.",
      ],
      [
        "Integrasi pembayaran",
        "Kami membangun integrasi pembayaran website untuk mendukung pembelian layanan akademi.",
      ],
      [
        "Integrasi aplikasi kelas dan jurnal",
        "Kami mengintegrasikan aplikasi kelas dan jurnal trading yang sudah ada dengan website dan alur pembayaran. Aplikasi tersebut tidak kami bangun sendiri.",
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
export const wonderlandCopy: Record<Locale, ClientCopy> = {
  en: {
    label: "CLIENT PROJECT / ONGOING MONTHLY MAINTENANCE",
    category: "Web development",
    intro:
      "Complete website development with Vite for Wonderland Bali, including Google Analytics 4 and Google Search Console integration, plus ongoing monthly maintenance.",
    visit: "Visit the website",
    scope: "A complete website, measurement, and continued support.",
    sections: [
      [
        "Complete website development",
        "We developed the complete Wonderland Bali website using Vite, bringing the site's pages and interface together into one web experience.",
      ],
      [
        "GA4 integration",
        "We integrated Google Analytics 4 to support measurement of website visits and interactions.",
      ],
      [
        "Search Console integration",
        "We connected the website to Google Search Console for visibility into indexing and search performance.",
      ],
      [
        "Monthly maintenance",
        "We provide ongoing monthly website maintenance to support its operation after launch.",
      ],
    ],
  },
  de: {
    label: "KUNDENPROJEKT / MONATLICHE WARTUNG",
    category: "Webentwicklung",
    intro:
      "Vollständige Website-Entwicklung mit Vite für Wonderland Bali, einschließlich Google Analytics 4, Google Search Console und laufender monatlicher Wartung.",
    visit: "Website besuchen",
    scope: "Eine vollständige Website, Messung und laufende Betreuung.",
    sections: [
      [
        "Vollständige Website-Entwicklung",
        "Wir entwickelten die gesamte Website von Wonderland Bali mit Vite und führten Seiten und Oberfläche zu einem gemeinsamen Webauftritt zusammen.",
      ],
      [
        "GA4-Integration",
        "Wir integrierten Google Analytics 4 zur Auswertung von Besuchen und Interaktionen.",
      ],
      [
        "Search-Console-Integration",
        "Wir verbanden die Website mit Google Search Console, um Indexierung und Suchleistung nachvollziehen zu können.",
      ],
      [
        "Monatliche Wartung",
        "Wir warten die Website jeden Monat und unterstützen ihren laufenden Betrieb nach dem Start.",
      ],
    ],
  },
  zh: {
    label: "客户项目 / 每月持续维护",
    category: "网站开发",
    intro:
      "使用 Vite 为 Wonderland Bali 完整开发网站，集成 Google Analytics 4 和 Google Search Console，并提供每月持续维护。",
    visit: "访问网站",
    scope: "完整网站、数据衡量与持续支持。",
    sections: [
      [
        "完整网站开发",
        "我们使用 Vite 开发了 Wonderland Bali 的整个网站，将各页面与界面整合为统一的网站体验。",
      ],
      ["GA4 集成", "我们集成了 Google Analytics 4，用于衡量网站访问与互动。"],
      [
        "Search Console 集成",
        "我们将网站连接到 Google Search Console，以了解索引情况和搜索表现。",
      ],
      ["每月维护", "我们每月持续维护网站，支持上线后的日常运行。"],
    ],
  },
  ja: {
    label: "クライアント案件 / 毎月の継続保守",
    category: "ウェブ開発",
    intro:
      "Wonderland Bali のサイト全体を Vite で開発し、Google Analytics 4 と Google Search Console の連携、毎月の保守を担当しています。",
    visit: "サイトを見る",
    scope: "サイト全体の開発、計測、継続サポート。",
    sections: [
      [
        "ウェブサイト全体の開発",
        "Vite を使って Wonderland Bali のサイト全体を開発し、ページとインターフェースを一つの体験にまとめました。",
      ],
      [
        "GA4 連携",
        "Google Analytics 4 を連携し、サイトの訪問や操作の計測を支援しました。",
      ],
      [
        "Search Console 連携",
        "Google Search Console に接続し、インデックス状況や検索パフォーマンスを確認できるようにしました。",
      ],
      [
        "毎月の保守",
        "公開後も毎月サイトを保守し、継続的な運用を支えています。",
      ],
    ],
  },
  id: {
    label: "PROYEK KLIEN / PEMELIHARAAN BULANAN",
    category: "Pengembangan web",
    intro:
      "Pengembangan website Wonderland Bali secara menyeluruh dengan Vite, integrasi Google Analytics 4 dan Google Search Console, serta pemeliharaan bulanan.",
    visit: "Kunjungi website",
    scope: "Website lengkap, pengukuran, dan dukungan berkelanjutan.",
    sections: [
      [
        "Pengembangan website menyeluruh",
        "Kami membangun seluruh website Wonderland Bali dengan Vite, menyatukan halaman dan antarmukanya dalam satu pengalaman web.",
      ],
      [
        "Integrasi GA4",
        "Kami mengintegrasikan Google Analytics 4 untuk mendukung pengukuran kunjungan dan interaksi website.",
      ],
      [
        "Integrasi Search Console",
        "Kami menghubungkan website ke Google Search Console untuk memantau pengindeksan dan performa pencarian.",
      ],
      [
        "Pemeliharaan bulanan",
        "Kami menyediakan pemeliharaan website setiap bulan untuk mendukung operasional setelah peluncuran.",
      ],
    ],
  },
};
export type ClientKind = "jw" | "wonderland";
export function isClientProject(kind: string): kind is ClientKind {
  return kind === "jw" || kind === "wonderland";
}
export function clientCopyFor(kind: ClientKind, locale: Locale) {
  return kind === "jw" ? jwCopy[locale] : wonderlandCopy[locale];
}
