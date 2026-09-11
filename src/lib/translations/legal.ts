import type { Locale } from "../i18n";
// Condensed native editions of the English notices. Review alongside the English source.
export const legal: Record<
  Exclude<Locale, "en">,
  { privacy: [string, string][]; terms: [string, string][] }
> = {
  de: {
    privacy: [
      [
        "Verantwortung und Kontakt",
        "Diese Hinweise beschreiben, wie DevnPixel Daten über devnpixel.com und Projektanfragen verarbeitet. Fragen richten Sie an code@devnpixel.com.",
      ],
      [
        "Daten und Zwecke",
        "Wir erhalten Ihren Namen, Ihre E-Mail-Adresse und freiwillig mitgeteilte Projektdetails. Hosting- und E-Mail-Anbieter verarbeiten technische Daten wie IP-Adressen, Anfragen und Zustellprotokolle. Wir nutzen diese Angaben zur Beantwortung, Angebotserstellung, Projektverwaltung und zum Schutz der Website. Senden Sie keine Passwörter oder sensiblen Daten. Je nach anwendbarem Recht beruhen Verarbeitungen auf vorvertraglichen Maßnahmen, Verträgen, berechtigten Interessen oder gesetzlichen Pflichten. Wir verkaufen keine personenbezogenen Daten und melden Sie durch eine Anfrage nicht für Werbung an.",
      ],
      [
        "Dienstleister",
        "Vercel hostet die Website, Resend versendet Formularnachrichten und Google Workspace betreibt unser Postfach. Anbieter können Daten in anderen Ländern unter ihren vertraglichen und gesetzlichen Schutzmaßnahmen verarbeiten. WhatsApp unterliegt eigenen Datenschutzregeln. Gesetzlich erforderliche Offenlegungen bleiben möglich.",
      ],
      [
        "Cookies und Browserspeicher",
        "Designpräferenz und Rechnungsentwürfe werden lokal im Browser gespeichert. Rechnungsinhalte werden vom Tool nicht an uns übermittelt. Sie kontrollieren Ausdrucke und Exporte. Google Analytics wird erst nach Ihrer Zustimmung geladen und verarbeitet Seitenaufrufe, Verweise sowie Geräte- und Browserinformationen auf Googles Infrastruktur. Anfrage- und Rechnungsinhalte werden nicht absichtlich an Analytics gesendet. Hosting-Protokolle bestehen unabhängig davon. über die Cookie-Einstellungen unten links können Sie ablehnen oder eine Zustimmung widerrufen. Ein Widerruf deaktiviert Analytics, entfernt zugängliche Analytics-Cookies dieser Website und lädt die Seite neu; bereits erhobene Daten werden dadurch nicht rückwirkend gelöscht. Ihre Auswahl bleibt bis zu 180 Tage im lokalen Speicher. Die Cookies _ga und _ga_RELL4WL624 können bis zu zwei Jahre bestehen. Werbespeicherung und Werbepersonalisierung sind deaktiviert. Browserdaten können Sie selbst löschen.",
      ],
      [
        "Aufbewahrung und Sicherheit",
        "Wir bewahren Korrespondenz so lange auf, wie es für Anfragen, Projekte, Streitfälle oder gesetzliche Aufbewahrungspflichten erforderlich ist. Lokale Entwürfe bleiben bis zur Änderung oder Löschung erhalten. Zugriffskontrollen und verschlüsselte Verbindungen schützen Daten, garantieren jedoch keine absolute Sicherheit.",
      ],
      [
        "Ihre Rechte",
        "Je nach anwendbarem Recht können Sie Auskunft, Berichtigung, Löschung, eine Datenkopie, Einschränkung oder Widerspruch sowie den Widerruf einer Einwilligung verlangen. Schreiben Sie uns; eine Identitätsprüfung kann erforderlich sein. Sie können sich an die zuständige Datenschutzbehörde wenden. Änderungen veröffentlichen wir hier mit aktualisiertem Datum.",
      ],
    ],
    terms: [
      [
        "Nutzung",
        "DevnPixel betreibt diese Website als unabhängiges Kreativstudio. Sie dürfen Arbeiten ansehen und legitime Projektanfragen senden. Missbrauch, rechtswidrige Inhalte, Identitätstäuschung, Störungen und unbefugter Zugriff sind untersagt. Zum Schutz der Website können wir den Zugang angemessen beschränken.",
      ],
      [
        "Projektvereinbarungen",
        "Eine Anfrage bucht kein Projekt und verpflichtet uns nicht zur Leistung. Umfang, Honorar, Zahlungen, Fristen, Korrekturen, Kündigung, Vertraulichkeit und Nutzungsrechte werden separat schriftlich vereinbart. Bei Widersprüchen hat der unterzeichnete Projektvertrag Vorrang.",
      ],
      [
        "Urheberrechte",
        "Design, Marke, Texte und Bilder gehören DevnPixel oder den jeweiligen Rechteinhabern. Die Nutzung der Website erteilt keine Lizenz zur Vervielfältigung oder kommerziellen Nutzung. Als Konzepte bezeichnete Arbeiten sind Studien und keine abgeschlossenen Kundenaufträge. Für übermittelte Materialien benötigen Sie die erforderlichen Rechte.",
      ],
      [
        "Tools und externe Dienste",
        "Prüfen Sie Berechnungen, Geschäftsdaten und geltende Anforderungen vor der Verwendung erzeugter Dokumente und sichern Sie Ihre Daten. Die Tools bieten keine Steuer-, Rechts- oder Buchhaltungsberatung. Externe Dienste wie WhatsApp haben eigene Bedingungen.",
      ],
      [
        "Verfügbarkeit und Haftung",
        "Inhalte können sich ändern und Unterbrechungen auftreten. Beispiele garantieren keine wirtschaftlichen Ergebnisse. Soweit rechtlich zulässig, garantieren wir keinen unterbrechungs- oder fehlerfreien Betrieb. Nicht ausschließbare Haftung und Verbraucherrechte bleiben unberührt.",
      ],
      [
        "Datenschutz und Änderungen",
        "Unsere Datenschutzhinweise erläutern den Umgang mit Daten. Neue Website-Bedingungen ändern bestehende unterzeichnete Projektverträge nicht automatisch. Bei Fragen schreiben Sie an code@devnpixel.com. Zwingendes Recht bleibt anwendbar.",
      ],
    ],
  },
  zh: {
    privacy: [
      [
        "范围与联系",
        "本声明说明 DevnPixel 如何通过 devnpixel.com 及项目咨询处理个人信息。隐私问题请联系 code@devnpixel.com。",
      ],
      [
        "信息与用途",
        "我们接收姓名、邮箱和您提供的项目资料。托管和邮件服务商处理 IP 地址、请求和发送日志。信息用于回复咨询、准备提案、管理项目及防止滥用。请勿发送密码或敏感资料。适用时，处理依据包括订约前措施、合同履行、合理利益及法定义务。我们不出售个人信息，也不会因咨询而订阅营销邮件。",
      ],
      [
        "服务商",
        "Vercel 托管网站，Resend 发送表单邮件，Google Workspace 管理邮箱。服务商可能根据其合同及法律保障在其他国家处理信息。WhatsApp 适用自己的隐私条款；法律要求时可能披露信息。",
      ],
      [
        "Cookie 与浏览器存储",
        "主题偏好和发票草稿保存在浏览器本地。工具不会向我们提交发票内容；打印和导出由您控制。Google Analytics 仅在同意后加载，在 Google 基础设施处理页面访问、来源和设备信息。我们不会故意向其发送咨询或发票内容。托管运行日志独立存在。左下角 Cookie 设置可拒绝或撤回许可；撤回会停用分析、删除可访问的本网站分析 Cookie 并重新加载，但不会撤销已收集信息。选择在本地保存最多 180 天。_ga 和 _ga_RELL4WL624 Cookie 可保存最多两年。广告存储与广告个性化已关闭。您可清除浏览器网站数据以删除本地草稿和偏好。",
      ],
      [
        "保存与安全",
        "往来信息仅保留至处理咨询、项目、争议或法定记录义务所需期限。本地草稿保留至覆盖或删除。我们采用访问控制和加密连接，但无法保证绝对安全。",
      ],
      [
        "您的权利",
        "根据适用法律，您可能有权访问、更正、删除、获取信息副本、限制或反对处理及撤回同意。请通过邮箱提出请求，可能需要身份核实。您可向相关数据保护机构投诉。更新将附日期发布。",
      ],
    ],
    terms: [
      [
        "网站使用",
        "DevnPixel 是独立创意工作室。可浏览作品并发送真实项目咨询。禁止滥用表单、违法内容、冒充、干扰或未经授权访问。为保护网站和用户，可合理限制访问。",
      ],
      [
        "项目协议",
        "咨询不等于预订，也不产生服务义务。范围、费用、付款、时间、修改、取消、保密及成果权属须另行书面约定。冲突时已签署项目协议优先。",
      ],
      [
        "创意与权属",
        "设计、品牌、文字和作品属于 DevnPixel 或相应权利人。浏览不授予复制或商业使用许可。概念作品不代表已完成客户项目。您须有权分享提交的资料。",
      ],
      [
        "工具与外部服务",
        "使用生成文件前，请核对计算、业务资料及适用要求，并自行备份。工具不提供会计、税务或法律建议。WhatsApp 等外部服务适用各自条款。",
      ],
      [
        "可用性与责任",
        "内容可变更，服务可能中断，案例不保证商业结果。在法律允许范围内，不保证始终无中断或无错误。依法不得排除的责任和消费者权利不受影响。",
      ],
      [
        "隐私与更新",
        "隐私政策说明数据处理。条款更新不自动改变已签署项目协议。请联系 code@devnpixel.com 处理问题。强制性法律和权利仍然适用。",
      ],
    ],
  },
  ja: {
    privacy: [
      [
        "対象と連絡先",
        "DevnPixel が devnpixel.com と制作相談で取り扱う個人情報について説明します。ご質問は code@devnpixel.com へご連絡ください。",
      ],
      [
        "情報と目的",
        "氏名、メール、任意の制作情報を受け取ります。ホスティング・メール事業者は IP アドレス、リクエスト、配信ログを処理します。回答、提案、顧客対応、運営、不正防止に使用します。パスワードや機微な情報は送らないでください。適用される場合、契約前の対応、契約履行、正当な利益、法的義務を根拠とします。情報の販売や問い合わせによる広告メールへの自動登録はしません。",
      ],
      [
        "委託先",
        "Vercel がホスティング、Resend がフォーム配信、Google Workspace がメールボックスを提供します。各社の契約上・法律上の保護措置により他国で処理される場合があります。WhatsApp には独自の条件が適用されます。法律上必要な開示を行うことがあります。",
      ],
      [
        "Cookie とブラウザー保存",
        "テーマと請求書下書きはブラウザーに保存されます。請求書内容はツールから当方へ送信されず、印刷と出力はご自身で管理します。Google Analytics は同意後のみ読み込み、閲覧ページ、参照元、端末情報を Google の基盤で処理します。相談や請求書内容は意図的に送りません。ホスティングログは別に処理されます。左下の Cookie 設定で拒否・撤回できます。撤回すると解析停止、削除可能な当サイトの解析 Cookie の削除、再読み込みを行いますが、収集済み情報は取り消されません。選択は最長180日保存します。_ga と _ga_RELL4WL624 は最長2年です。広告保存と広告パーソナライズは無効です。サイトのブラウザーデータを消すと設定や下書きを削除できます。",
      ],
      [
        "保存と安全性",
        "相談、制作、紛争、法的記録保存に必要な期間だけ連絡記録を保持します。下書きは上書き・削除まで残ります。アクセス制御と暗号化を利用しますが絶対の安全性は保証できません。",
      ],
      [
        "権利と選択",
        "適用法により閲覧、訂正、削除、コピー取得、処理制限、異議申立て、同意撤回などの権利がある場合があります。メールでご請求ください。本人確認をお願いする場合があります。関連監督機関への申立ても可能です。変更は更新日とともに掲載します。",
      ],
    ],
    terms: [
      [
        "利用",
        "DevnPixel は独立した制作スタジオです。作品閲覧と正当な制作相談に利用できます。悪用、違法投稿、なりすまし、妨害、不正アクセスを禁止します。保護のため合理的にアクセスを制限する場合があります。",
      ],
      [
        "制作契約",
        "問い合わせだけでは予約やサービス義務は成立しません。範囲、料金、支払、納期、修正、解約、秘密保持、権利は別途書面で定めます。矛盾する場合、署名済み制作契約が優先します。",
      ],
      [
        "知的財産",
        "デザイン、ブランド、文章、作品は DevnPixel または権利者に帰属します。閲覧は複製・商用利用の許可ではありません。コンセプト作品は顧客案件の完了実績ではありません。資料の利用許可はご自身で確保してください。",
      ],
      [
        "ツールと外部サービス",
        "生成文書を使う前に計算、事業情報、適用要件を確認し、バックアップしてください。ツールは会計・税務・法律上の助言を提供しません。WhatsApp などは独自の条件が適用されます。",
      ],
      [
        "可用性と責任",
        "内容の変更や中断があり得ます。例は商業的成果を保証しません。法律で許される範囲で無停止・無誤りを保証しません。排除できない責任や消費者の権利は制限しません。",
      ],
      [
        "プライバシーと変更",
        "情報処理はプライバシーポリシーをご覧ください。更新で署名済み契約が自動的に変わることはありません。code@devnpixel.com へご相談ください。強行法規と権利は引き続き適用されます。",
      ],
    ],
  },
  id: {
    privacy: [
      [
        "Cakupan dan kontak",
        "Pemberitahuan ini menjelaskan pengelolaan informasi pribadi melalui devnpixel.com dan pertanyaan proyek. Hubungi code@devnpixel.com untuk pertanyaan privasi.",
      ],
      [
        "Informasi dan tujuan",
        "Kami menerima nama, email, dan detail proyek yang Anda berikan. Penyedia hosting dan email memproses data teknis seperti alamat IP, permintaan, serta log pengiriman. Kami menggunakannya untuk membalas, menyusun proposal, mengelola proyek, menjalankan situs, dan mencegah penyalahgunaan. Jangan kirim kata sandi atau data sensitif. Jika berlaku, dasar pemrosesan mencakup langkah prakontrak, pelaksanaan kontrak, kepentingan yang sah, dan kewajiban hukum. Kami tidak menjual data pribadi atau otomatis mendaftarkan pengirim formulir ke pemasaran.",
      ],
      [
        "Penyedia layanan",
        "Vercel menyediakan hosting, Resend mengirim email formulir, dan Google Workspace mengelola kotak surat. Data dapat diproses di negara lain sesuai perlindungan kontrak dan hukum penyedia. WhatsApp memiliki kebijakan tersendiri. Pengungkapan yang diwajibkan hukum tetap dapat dilakukan.",
      ],
      [
        "Cookie dan penyimpanan browser",
        "Preferensi tema dan draf invoice disimpan di browser. Alat invoice tidak mengirim isi invoice kepada kami; ekspor dan cetakan Anda kelola sendiri. Google Analytics dimuat hanya setelah izin dan memproses halaman yang dilihat, sumber kunjungan, serta informasi perangkat dan browser di infrastruktur Google. Kami tidak sengaja mengirim isi pertanyaan atau invoice ke Analytics. Log operasional hosting diproses terpisah. Tolak atau cabut izin melalui pengaturan cookie di kiri bawah. Pencabutan menghentikan analitik, menghapus cookie Analytics situs yang dapat diakses, dan memuat ulang halaman, tetapi tidak membatalkan data yang sudah dikumpulkan. Pilihan disimpan lokal hingga 180 hari. Cookie _ga dan _ga_RELL4WL624 dapat bertahan hingga dua tahun. Penyimpanan iklan dan personalisasi iklan dinonaktifkan. Hapus data situs di browser untuk membersihkan preferensi dan draf.",
      ],
      [
        "Penyimpanan dan keamanan",
        "Korespondensi disimpan selama diperlukan untuk pertanyaan, proyek, sengketa, atau kewajiban pencatatan. Draf lokal bertahan sampai diganti atau dihapus. Kami menggunakan kontrol akses dan koneksi terenkripsi, tetapi tidak ada sistem daring yang menjamin keamanan mutlak.",
      ],
      [
        "Hak Anda",
        "Sesuai hukum yang berlaku, Anda mungkin berhak mengakses, memperbaiki, menghapus, memperoleh salinan, membatasi atau menolak pemrosesan, serta mencabut persetujuan. Kirim permintaan melalui email; verifikasi identitas mungkin diperlukan. Anda juga dapat menghubungi otoritas perlindungan data terkait. Perubahan diterbitkan dengan tanggal baru.",
      ],
    ],
    terms: [
      [
        "Penggunaan situs",
        "DevnPixel adalah studio kreatif independen. Anda dapat melihat karya dan mengirim pertanyaan proyek yang sah. Dilarang menyalahgunakan formulir, mengirim konten melanggar hukum, menyamar, mengganggu situs, atau mengakses tanpa izin. Akses dapat dibatasi secara wajar untuk melindungi situs dan pengguna.",
      ],
      [
        "Kesepakatan proyek",
        "Pertanyaan tidak memesan proyek atau menimbulkan kewajiban layanan. Ruang lingkup, biaya, pembayaran, jadwal, revisi, pembatalan, kerahasiaan, dan kepemilikan hasil disepakati tertulis secara terpisah. Kontrak proyek yang ditandatangani berlaku lebih dahulu jika terjadi pertentangan.",
      ],
      [
        "Hak atas karya",
        "Desain, merek, teks, dan karya milik DevnPixel atau pemegang hak masing-masing. Mengunjungi situs tidak memberikan izin reproduksi atau penggunaan komersial. Karya berlabel konsep adalah eksplorasi, bukan klaim proyek klien selesai. Anda bertanggung jawab memiliki izin atas materi yang dikirim.",
      ],
      [
        "Alat dan layanan eksternal",
        "Periksa perhitungan, data usaha, dan ketentuan yang berlaku sebelum memakai dokumen hasil alat, serta simpan cadangan. Alat tidak memberikan nasihat akuntansi, pajak, atau hukum. Layanan seperti WhatsApp memiliki ketentuan sendiri.",
      ],
      [
        "Ketersediaan dan tanggung jawab",
        "Konten dapat berubah dan gangguan dapat terjadi. Contoh tidak menjamin hasil komersial. Sejauh diperbolehkan hukum, kami tidak menjamin operasi selalu bebas gangguan atau kesalahan. Tanggung jawab serta hak konsumen yang tidak dapat dikecualikan tetap berlaku.",
      ],
      [
        "Privasi dan perubahan",
        "Kebijakan privasi menjelaskan pengelolaan data. Pembaruan ketentuan situs tidak otomatis mengubah kontrak proyek yang sudah ditandatangani. Sampaikan masalah ke code@devnpixel.com. Hukum wajib dan hak yang berlaku tetap dihormati.",
      ],
    ],
  },
};
