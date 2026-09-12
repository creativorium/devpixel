import type { Locale } from "../i18n";
export type LocalPageCopy = {
  homeTitle: [string, string];
  homeIntro: string;
  eyebrow: string;
  available: string;
  studioTitle: string;
  studioIntro: string;
  marketTitle: string;
  marketIntro: string;
  workTitle: string;
  conceptNote: string;
  servicesTitle: string;
  servicesIntro: string;
  contactTitle: string;
  contactIntro: string;
  blogTitle: string;
  blogIntro: string;
  serviceDescriptions: string[];
  serviceDetails: string[][];
  processTitle: string;
  process: string[];
  projectDescriptions: string[];
  aboutParagraphs: string[];
  scopeTitle: string;
  scope: string;
};
export const pageCopy: Record<Exclude<Locale, "en">, LocalPageCopy> = {
  de: {
    homeTitle: ["Große Ideen.", "Kleine Pixel."],
    homeIntro:
      "Wir machen aus mutigen Ideen durchdachte Marken und Websites. Mit Sorgfalt gestaltet, bis ins kleinste Detail.",
    eyebrow: "UNABHÄNGIGES DIGITALSTUDIO",
    available: "OFFEN FÜR ZUSAMMENARBEIT",
    studioTitle:
      "Gutes Design steckt im Detail. Großartige Erlebnisse verbinden alles miteinander.",
    studioIntro:
      "Wir verbinden Design und Entwicklung. Von der ersten Skizze bis zur letzten Codezeile zählt jedes Detail.",
    marketTitle: "Webdesign für Bali. Mit Wirkung darüber hinaus.",
    marketIntro:
      "Wir gestalten Websites und Marken für kleine Unternehmen mit Zielgruppen in Bali, Australien, den USA und Singapur. Die Zusammenarbeit erfolgt direkt und remote. Ein klarer Umfang, nützliche Inhalte und zuverlässige Kontaktwege bilden die Grundlage für ein bezahlbares Projekt.",
    workTitle: "Ideen werden sichtbar.",
    conceptNote: "KUNDENPROJEKTE & STUDIOKONZEPTE",
    servicesTitle: "Vom ersten Gedanken bis zum letzten Pixel.",
    servicesIntro:
      "Eine klare Identität. Eine durchdachte Website. Ein Erlebnis, das in Erinnerung bleibt. Wir unterstützen einen Teil Ihres Projekts oder verbinden das gesamte Bild.",
    contactTitle: "Ihre nächste große Idee.",
    contactIntro:
      "Eine neue Marke, eine bessere Website oder eine ungewöhnliche Idee? Erzählen Sie uns, was Sie brauchen, wen Sie erreichen möchten und wann es losgehen soll.",
    blogTitle: "Kleine Notizen. Nützliche Ideen.",
    blogIntro:
      "Praktische Gedanken zu Webdesign, Entwicklung, KI und unabhängiger Zusammenarbeit. Für kleine Unternehmen, die ihre nächste Website planen.",
    serviceDescriptions: [
      "Positionierung, Botschaften und visuelle Identität für eine klare, konsistente Marke.",
      "Durchdachte Websites und intuitive Nutzerwege, passend zu Ihrer Marke und Ihrem Publikum.",
      "Responsive Webentwicklung mit Fokus auf Leistung, Barrierefreiheit, technisches SEO und wartbaren Code.",
      "Kampagnenideen und digitale Werbemittel, abgestimmt auf Ihre Zielgruppe und Ihre Ziele.",
    ],
    serviceDetails: [
      [
        "Wir klären Zielgruppe, Angebot und Positionierung, bevor wir eine visuelle Richtung entwickeln.",
        "Zum möglichen Umfang gehören Markenbotschaften, Logo-Richtungen, Typografie, Farben und ein verständlicher Leitfaden für die Anwendung.",
      ],
      [
        "Wir strukturieren Inhalte und Nutzerwege so, dass Besucher Ihr Angebot verstehen und den nächsten Schritt finden.",
        "Wir entwickeln Layouts für Mobilgeräte und Desktop, stimmen wichtige Ansichten ab und bereiten die Übergabe an die Entwicklung vor.",
      ],
      [
        "Wir setzen das freigegebene Design als responsive Website um und wählen Technik nach Ihren Inhalten, Integrationen und Pflegeanforderungen.",
        "Wichtige Prüfungen umfassen Formulare, Tastaturbedienung, Ladeverhalten, Metadaten, Sitemap und sichere Bereitstellung. Zugangsdaten bleiben auf der Serverseite.",
      ],
      [
        "Wir verbinden ein klares Kommunikationsziel mit passenden visuellen Ideen und Werbeformaten.",
        "Mögliche Ergebnisse sind Kampagnenkonzepte, Social-Media-Motive und digitale Anzeigenvarianten. Mediabudget und Schaltung werden gesondert vereinbart.",
      ],
    ],
    processTitle: "Ein klarer Weg zum Ergebnis.",
    process: [
      "Verstehen: Ziele, Zielgruppe, Inhalte und Rahmenbedingungen klären.",
      "Gestalten: Struktur und visuelle Richtung gemeinsam abstimmen.",
      "Umsetzen: Entwickeln, prüfen und mit geordneten Rückmeldungen verbessern.",
      "Übergeben: Veröffentlichung, Zugänge und nächste Schritte dokumentieren.",
    ],
    projectDescriptions: [
      "Eine ruhige Identität für bewusstes Wohnen. Eine Konzeptstudie zu Form, Material und Freiraum.",
      "Eine eigenständige Perspektive auf die Natur. Ein redaktionelles Webkonzept rund um Entdeckung und Bewegung.",
      "Weniger Ablenkung, mehr Klarheit. Ein modulares Oberflächenkonzept, das komplexe Aufgaben verständlicher macht.",
    ],
    aboutParagraphs: [
      "Wir sind ein unabhängiges Kreativstudio an der Schnittstelle von Design und Technologie. Eine gute Zusammenarbeit beginnt für uns mit Verständnis und klaren Fragen.",
      "Kleine Teams profitieren von direkten Gesprächen und nachvollziehbaren Entscheidungen. Wir bringen Strategie, Gestaltung und Entwicklung zusammen und konzentrieren uns auf das, was Ihr Projekt wirklich braucht.",
      "Wir arbeiten remote mit Unternehmen, die Menschen in Bali und internationalen Märkten erreichen möchten. Unsere Angaben zu Zielmärkten bedeuten nicht, dass wir dort lokale Büros betreiben.",
    ],
    scopeTitle: "Ein Umfang, der zu Ihnen passt.",
    scope:
      "Leistungen, Zeitplan, Feedbackrunden und Budget werden vor Projektbeginn schriftlich festgelegt. Zusätzliche Wünsche besprechen wir transparent, statt stillschweigend den Umfang zu verändern.",
  },
  zh: {
    homeTitle: ["大胆想法。", "精细像素。"],
    homeIntro:
      "将大胆的想法转化为周到的品牌与网站体验。用心打磨细节，留下持久印象。",
    eyebrow: "独立数字创意工作室",
    available: "欢迎合作",
    studioTitle: "优秀设计源于细节。出色体验让一切紧密相连。",
    studioIntro:
      "我们连接设计与开发。从第一张草图到最后一行代码，每个细节都值得认真对待。",
    marketTitle: "为巴厘岛设计，连接更广阔的世界。",
    marketIntro:
      "我们为面向巴厘岛、澳大利亚、美国和新加坡市场的小型企业提供网站设计、开发与品牌服务。通过清晰的远程协作流程直接沟通，以合理范围、有用内容和可靠联系渠道控制项目成本。",
    workTitle: "让想法看得见。",
    conceptNote: "客户项目与工作室概念作品",
    servicesTitle: "从最初的想法，到最后一个像素。",
    servicesIntro:
      "清晰的品牌、周到的网站、值得探索的体验。我们可以参与其中一个环节，也可以协助连接整个项目。",
    contactTitle: "开启您的下一个好想法。",
    contactIntro:
      "新品牌、更好的网站，或一个特别的创意？请告诉我们您的需求、目标受众和期望时间。",
    blogTitle: "小小笔记，实用想法。",
    blogIntro:
      "分享网站设计、开发、人工智能与独立协作的实用思考，帮助小型企业规划下一步。",
    serviceDescriptions: [
      "通过品牌定位、信息表达与视觉形象，让企业的声音清晰一致。",
      "围绕品牌与受众设计网站、用户路径和适应不同屏幕的界面。",
      "注重性能、无障碍体验、技术 SEO 和代码可维护性的网站开发。",
      "围绕受众、传播信息与业务目标，制作广告概念和数字创意素材。",
    ],
    serviceDetails: [
      [
        "先理解受众、业务价值和品牌定位，再确定视觉方向。",
        "项目可包括品牌信息框架、标志方向、字体、颜色以及便于日常使用的品牌指南。",
      ],
      [
        "我们规划内容结构和用户路径，让访客理解您的服务，并轻松找到下一步。",
        "设计同时考虑手机和桌面使用场景，经过关键页面确认后，为开发提供清晰交付。",
      ],
      [
        "根据已确认的设计构建响应式网站，并结合内容更新、功能集成和维护需求选择技术。",
        "上线前检查表单、键盘操作、加载表现、页面元数据、站点地图与安全部署。敏感凭据保留在服务器端。",
      ],
      [
        "以明确的传播目标为基础，发展适合渠道和受众的视觉概念。",
        "交付可包括活动创意、社交媒体素材及数字广告版本。广告投放和媒体预算需另行约定。",
      ],
    ],
    processTitle: "清晰的项目流程。",
    process: [
      "理解：确认目标、受众、内容和限制条件。",
      "设计：一起确认结构与视觉方向。",
      "开发：制作、测试，并根据统一反馈改进。",
      "交付：完成上线，整理账号权限和后续维护说明。",
    ],
    projectDescriptions: [
      "围绕从容生活方式的安静品牌形象。探索形态、材质与留白的概念作品。",
      "以独立视角探索户外世界，围绕发现与运动打造编辑式网站概念。",
      "减少干扰，提升专注。通过模块化界面让复杂操作更加清晰的产品概念。",
    ],
    aboutParagraphs: [
      "我们是一家连接设计与技术的独立创意工作室。真正有用的合作，从理解需求和提出好问题开始。",
      "小团队需要直接沟通和清晰决策。我们结合品牌策略、设计与开发，把精力放在项目真正需要的事情上。",
      "我们通过远程方式服务面向巴厘岛及国际市场的企业。提及服务市场并不代表在当地设有办公室。",
    ],
    scopeTitle: "适合您的项目范围。",
    scope:
      "在项目开始前，以书面方式确认交付内容、时间、修改轮次和预算。对于新增需求，我们会先讨论影响，再调整工作范围。",
  },
  ja: {
    homeTitle: ["大きなアイデア。", "細やかなピクセル。"],
    homeIntro:
      "大胆なアイデアを、考え抜かれたブランドとウェブ体験へ。小さな細部が、長く残る印象をつくります。",
    eyebrow: "独立系デジタルスタジオ",
    available: "ご相談を受け付けています",
    studioTitle: "よいデザインは細部に宿る。優れた体験は、すべてをつなぐ。",
    studioIntro:
      "デザインと開発をつなぐスタジオです。最初のスケッチから最後のコードまで、一つひとつを大切にします。",
    marketTitle: "バリのためのウェブデザイン。その先の世界にも届くように。",
    marketIntro:
      "バリ、オーストラリア、米国、シンガポールの市場を目指す小規模事業者に、ウェブデザイン・開発・ブランディングを提供します。直接やり取りできるリモート制作で、必要な範囲と役立つ情報、確かな問い合わせ導線を整えます。",
    workTitle: "アイデアを、見える形に。",
    conceptNote: "クライアント案件とコンセプト制作",
    servicesTitle: "最初の発想から、最後のピクセルまで。",
    servicesIntro:
      "明確なブランド、考え抜かれたウェブサイト、心に残る体験。必要な一部分から、全体をつなぐ制作までご相談ください。",
    contactTitle: "次のアイデアを、一緒に。",
    contactIntro:
      "新しいブランド、よりよいウェブサイト、まだ形になっていない構想。必要なこと、届けたい相手、ご希望の時期をお聞かせください。",
    blogTitle: "小さなメモ。役立つアイデア。",
    blogIntro:
      "ウェブデザイン、開発、AI、独立した働き方について。次のウェブサイトを考える小規模事業者への実践的なノートです。",
    serviceDescriptions: [
      "ポジショニング、メッセージ、ビジュアルを整理し、一貫したブランドをつくります。",
      "ブランドと利用者を中心に、ウェブサイトの構造と使いやすい画面を設計します。",
      "速度、アクセシビリティ、技術的 SEO、保守性を考慮したウェブ開発。",
      "ターゲットと目的に沿ったキャンペーンの発想とデジタル広告素材。",
    ],
    serviceDetails: [
      [
        "対象となる顧客、提供価値、ブランドの立ち位置を整理してから、視覚的な方向性を検討します。",
        "メッセージ設計、ロゴの方向性、書体、配色、日々の運用に役立つガイドラインなどを対象にできます。",
      ],
      [
        "サービスの内容が伝わり、次の行動がわかるように、情報構造と利用者の動線を設計します。",
        "スマートフォンとデスクトップ双方のレイアウトを検討し、主要画面を確認したうえで開発へ引き継ぎます。",
      ],
      [
        "承認されたデザインをレスポンシブなサイトとして実装し、更新頻度や外部連携、保守の要件に合わせて技術を選びます。",
        "フォーム、キーボード操作、読み込み、メタデータ、サイトマップ、安全な公開を確認します。秘密情報はサーバー側で扱います。",
      ],
      [
        "伝えたい目的を明確にし、媒体や顧客に合ったビジュアルの方向性を考えます。",
        "キャンペーン案、SNS 用素材、デジタル広告の展開などに対応します。媒体費や広告運用は別途合意します。",
      ],
    ],
    processTitle: "見通しのよい制作プロセス。",
    process: [
      "理解する：目的、顧客、コンテンツ、制約を確認します。",
      "設計する：構造と見た目の方向性を合意します。",
      "実装する：制作・検証し、整理されたフィードバックで改善します。",
      "引き継ぐ：公開、アカウントの権限、今後の運用をまとめます。",
    ],
    projectDescriptions: [
      "穏やかな暮らしのための静かなアイデンティティ。形、素材、余白を探るコンセプトです。",
      "アウトドアを独自の視点で捉え、発見と動きを中心に構成した編集型ウェブコンセプト。",
      "雑音を減らし、集中しやすくする。複雑な作業をわかりやすくするモジュール型インターフェースの案です。",
    ],
    aboutParagraphs: [
      "私たちはデザインと技術の接点で活動する独立系クリエイティブスタジオです。理解を深める会話と的確な問いを大切にしています。",
      "小さなチームだからこそ、直接話し、判断の理由を共有できます。戦略、デザイン、開発をつなぎ、本当に必要なことに集中します。",
      "バリや国際市場に向けた事業をリモートで支援します。対応市場の記載は、各国にオフィスを持つことを意味しません。",
    ],
    scopeTitle: "必要な範囲を、明確に。",
    scope:
      "成果物、スケジュール、修正回数、予算は開始前に書面で合意します。追加のご希望は、影響を話し合ってから範囲を調整します。",
  },
  id: {
    homeTitle: ["Ide besar.", "Piksel kecil."],
    homeIntro:
      "Kami mengubah ide berani menjadi merek dan pengalaman web yang penuh pertimbangan. Detail kecil, kesan yang bertahan lama.",
    eyebrow: "STUDIO DIGITAL INDEPENDEN",
    available: "TERBUKA UNTUK KOLABORASI",
    studioTitle:
      "Desain yang baik ada pada detailnya. Pengalaman hebat menyatukan semuanya.",
    studioIntro:
      "Kami bekerja di persimpangan desain dan pengembangan. Dari sketsa pertama hingga baris kode terakhir, setiap detail punya peran.",
    marketTitle: "Desain web untuk Bali. Dibangun untuk menjangkau lebih jauh.",
    marketIntro:
      "Kami menyediakan desain web, pengembangan, dan branding bagi usaha kecil yang menyasar Bali, Australia, Amerika Serikat, dan Singapura. Bekerja langsung dengan studio independen melalui proses jarak jauh yang jelas. Lingkup terarah, konten berguna, dan jalur kontak yang andal membantu menjaga anggaran tetap realistis.",
    workTitle: "Ide yang menjadi nyata.",
    conceptNote: "PROYEK KLIEN & KONSEP STUDIO",
    servicesTitle: "Dari gagasan pertama hingga piksel terakhir.",
    servicesIntro:
      "Identitas yang jelas. Situs yang dipikirkan matang. Pengalaman yang layak dijelajahi. Libatkan kami untuk satu bagian atau untuk menyatukan keseluruhan proyek.",
    contactTitle: "Ide besar Anda berikutnya.",
    contactIntro:
      "Merek baru, website yang lebih baik, atau ide yang berbeda? Ceritakan kebutuhan, audiens, dan waktu yang Anda harapkan.",
    blogTitle: "Catatan kecil. Ide bermanfaat.",
    blogIntro:
      "Catatan praktis tentang desain web, pengembangan, AI, dan kolaborasi independen untuk usaha kecil yang merencanakan website berikutnya.",
    serviceDescriptions: [
      "Positioning, pesan, dan identitas visual agar bisnis memiliki suara yang jelas dan konsisten.",
      "Desain website, alur pengguna, dan antarmuka responsif yang berangkat dari merek serta audiens Anda.",
      "Pengembangan web responsif dengan perhatian pada performa, aksesibilitas, SEO teknis, dan kode yang mudah dirawat.",
      "Konsep kampanye dan materi iklan digital yang selaras dengan audiens, pesan, dan tujuan bisnis.",
    ],
    serviceDetails: [
      [
        "Kami memahami audiens, penawaran, dan posisi merek sebelum menentukan arah visual.",
        "Lingkup dapat mencakup susunan pesan, arah logo, tipografi, warna, serta panduan merek yang praktis digunakan sehari-hari.",
      ],
      [
        "Kami menyusun konten dan alur agar pengunjung memahami penawaran serta tahu langkah berikutnya.",
        "Layout dirancang untuk ponsel dan desktop, ditinjau pada halaman utama, lalu disiapkan untuk tahap pengembangan.",
      ],
      [
        "Kami membangun desain yang disetujui menjadi website responsif. Teknologi dipilih berdasarkan konten, integrasi, dan kebutuhan pengelolaan.",
        "Pemeriksaan mencakup formulir, navigasi keyboard, kecepatan muat, metadata, sitemap, serta deployment yang aman. Kredensial rahasia tetap berada di server.",
      ],
      [
        "Kami memulai dari tujuan komunikasi yang jelas lalu mengembangkan arah visual sesuai kanal dan target audiens.",
        "Hasil dapat berupa konsep kampanye, materi media sosial, dan variasi iklan digital. Biaya media dan pengelolaan iklan disepakati terpisah.",
      ],
    ],
    processTitle: "Proses yang jelas dari awal.",
    process: [
      "Pahami: sepakati tujuan, audiens, konten, dan batasan.",
      "Rancang: tinjau struktur serta arah visual bersama.",
      "Bangun: kembangkan, uji, dan perbaiki berdasarkan masukan terarah.",
      "Serahkan: dokumentasikan peluncuran, akses akun, dan langkah berikutnya.",
    ],
    projectDescriptions: [
      "Identitas yang tenang untuk cara hidup yang penuh pertimbangan. Studi konsep tentang bentuk, material, dan ruang kosong.",
      "Sudut pandang independen tentang alam terbuka. Konsep web editorial yang berpusat pada penemuan dan gerak.",
      "Lebih sedikit gangguan, lebih banyak fokus. Konsep antarmuka modular agar pekerjaan kompleks terasa lebih jelas.",
    ],
    aboutParagraphs: [
      "Kami adalah studio kreatif independen yang menghubungkan desain dan teknologi. Kolaborasi yang baik dimulai dari memahami kebutuhan dan mengajukan pertanyaan yang tepat.",
      "Tim kecil membutuhkan percakapan langsung dan keputusan yang mudah dipahami. Kami menyatukan strategi, desain, serta pengembangan dengan fokus pada kebutuhan nyata proyek.",
      "Kami bekerja jarak jauh dengan bisnis yang ingin menjangkau Bali dan pasar internasional. Penyebutan pasar layanan tidak berarti kami memiliki kantor lokal di setiap negara tersebut.",
    ],
    scopeTitle: "Lingkup yang sesuai kebutuhan.",
    scope:
      "Hasil pekerjaan, jadwal, putaran revisi, dan anggaran ditetapkan secara tertulis sebelum proyek dimulai. Permintaan tambahan dibahas secara terbuka sebelum mengubah lingkup pekerjaan.",
  },
};
