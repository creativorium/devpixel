import type { Locale } from "../i18n";
// The article order matches src/lib/posts.ts. Edit titles and section text here.
export type ArticleTranslation = {
  title: string;
  sections: [string, string][];
};
export const articles: Record<Exclude<Locale, "en">, ArticleTranslation[]> = {
  de: [
    {
      title:
        "Webentwicklung in Bali: ein praktischer Leitfaden für kleine Unternehmen",
      sections: [
        [
          "Beginnen Sie mit dem Ziel Ihrer Besucher",
          "Eine Villa, ein Kreativstudio und ein Bildungsanbieter brauchen unterschiedliche Websites. Legen Sie vor der Plattformwahl fest, was Besucher tun sollen: Verfügbarkeit anfragen, ein Gespräch buchen oder eine Leistung verstehen. Dieses Ziel bestimmt Inhalte und Integrationen. Für ein Gastgewerbe können Unterkunftsdetails, Lage, Kontakt und verständliche Buchungsbedingungen wichtiger sein als aufwendige Effekte.",
        ],
        [
          "Planen Sie zuerst für Mobilgeräte",
          "Prüfen Sie, ob Besucher Bilder ansehen, Bedingungen lesen und Kontakt aufnehmen können, ohne zoomen zu müssen. Komprimieren Sie Fotos, reservieren Sie Bildflächen und testen Sie Formulare über eine gewöhnliche Mobilverbindung. Übersetzungen sind sinnvoll, wenn sie einer echten Zielgruppe helfen. Beschreiben Sie Ihren Standort präzise und erfinden Sie keine Auslandsbüros.",
        ],
        [
          "Wählen Sie Technik nach der Pflege im Alltag",
          "Eine individuelle Entwicklung kann zu besonderen Funktionen passen; ein Redaktionssystem kann regelmäßige Inhaltsänderungen erleichtern. Klären Sie, wer Änderungen macht und welche Schulung nötig ist. Domain, Hosting, Quellcode und Analytics sollten nachvollziehbar zugeordnet sein. Vereinbaren Sie Zugänge, Sicherungen und eine dokumentierte Übergabe. Betrieb und Betreuung gehören zum Gesamtbudget.",
        ],
        [
          "Ein hilfreiches Briefing",
          "Bereiten Sie Geschäftsziel, Zielgruppe, gewünschte Seiten, vorhandene Markenmaterialien, zwei Referenzseiten, Integrationen und einen realistischen Termin vor. Unterscheiden Sie zwischen unverzichtbar und später. So werden Angebote vergleichbar. DevnPixel arbeitet mit Unternehmen, die Bali und internationale Kunden erreichen möchten; am Anfang steht das Ziel der Website.",
        ],
      ],
    },
    {
      title:
        "Bezahlbares Webdesign: Kosten durch einen klaren Umfang reduzieren",
      sections: [
        [
          "Betrachten Sie das gesamte Projekt",
          "Ein günstiger Aufbau wird teuer, wenn er neu erstellt werden muss oder Sie keinen Zugriff auf grundlegende Konten erhalten. Vergleichen Sie Gestaltung, Entwicklung, Inhalte, Integrationen, Tests und Übergabe. Eine einfache Unternehmenswebsite ist nicht mit einer mehrsprachigen Buchungsplattform vergleichbar. Trennen Sie einmalige Kosten von laufenden Abonnements; einen seriösen Einheitspreis gibt es nicht.",
        ],
        [
          "Wenige vollständige Seiten zuerst",
          "Für einen Dienstleister können Startseite, Leistungen, Über-uns-Seite und funktionierender Kontakt einen sinnvollen ersten Umfang bilden. Zeigen Sie Arbeitsbeispiele nur mit Erlaubnis und korrekten Angaben. Zusätzliche Animationen, Portale oder Sprachen können in einer zweiten Phase folgen. Wichtig ist, dass die wesentlichen Nutzerwege genügend Aufmerksamkeit erhalten.",
        ],
        [
          "Inhalte und Rückmeldungen vorbereiten",
          "Liefern Sie Logos, Leistungsbeschreibungen, freigegebene Fotos und Kontaktangaben möglichst früh. Fehlende Inhalte verursachen wiederholte Layoutänderungen. Vereinbaren Sie, wer Texte schreibt und freigibt. Bündeln Sie Rückmeldungen pro Meilenstein und klären Sie Anzahl und Umfang der Korrekturrunden sowie die Bewertung zusätzlicher Wünsche.",
        ],
        [
          "An den Grundlagen nicht sparen",
          "Lesbare mobile Ansichten, zugängliche Formularbeschriftungen, sichere Bereitstellung, Suchmetadaten und ein tatsächlicher Versandtest gehören in die Abnahme. Fragen Sie nach Fehlerbehebung und Betreuung nach dem Start. Bei DevnPixel beginnt bezahlbares Webdesign mit Prioritäten und Budgetrahmen. Ein kleiner, klar definierter Auftrag ist besser als ein unrealistisches Versprechen, alles zum niedrigsten Preis zu liefern.",
        ],
      ],
    },
    {
      title: "Freelancer oder kleine Webdesign-Agentur: die richtige Wahl",
      sections: [
        [
          "Verantwortung ist wichtiger als die Bezeichnung",
          "Ein Freelancer kann mit einem Designer zusammenarbeiten, während ein kleines Studio von einer Person geführt wird. Fragen Sie, wer Strategie, Texte, Gestaltung, Entwicklung, Tests und Betreuung übernimmt. Ein Spezialist passt oft zu einer klaren technischen Aufgabe; ein Studio kann mehrere Disziplinen verbinden. Keine Bezeichnung garantiert Qualität oder Verfügbarkeit.",
        ],
        [
          "Passende Arbeitsbeispiele prüfen",
          "Öffnen Sie Websites auf dem Handy und prüfen Sie, ob Angebot und Navigation verständlich sind. Fragen Sie nach dem tatsächlichen Beitrag und unterscheiden Sie Kundenprojekte von freien Konzepten. Ein Gespräch über eine konkrete Herausforderung zeigt oft mehr als eine große unbezahlte Probeaufgabe. Achten Sie auf nachvollziehbare Abläufe und gute Rückfragen.",
        ],
        [
          "Zusammenarbeit konkret vereinbaren",
          "Bestimmen Sie Ansprechpartner, Prüftermine, Reaktionszeiten und die Dokumentation von Änderungen. Bei Fernarbeit gehören Zeitzonen dazu. Klären Sie vor der Anzahlung Eigentum an Dateien, Lizenzen, Domain- und Hostingzugängen sowie den Ablauf bei einer Beendigung. Die Behebung eines Fehlers ist etwas anderes als eine neue Funktion.",
        ],
        [
          "Eine tragfähige Beziehung wählen",
          "Vergleichen Sie Ergebnisse, Abhängigkeiten und Wartung neben dem Preis. Ein Freelancer kann direkten Spezialistenzugang bieten; ein unabhängiges Studio kann einen breiteren Auftrag koordinieren. DevnPixel verbindet Webdesign, Entwicklung, Markenstrategie und Werbekreation. Erzählen Sie uns, welche Teile bereits vorhanden sind und wo Sie Unterstützung benötigen.",
        ],
      ],
    },
    {
      title:
        "Remote mit einem Webstudio arbeiten: Australien, USA und Singapur",
      sections: [
        [
          "Fortschritt sichtbar machen",
          "Eine Website braucht kein gemeinsames Büro, aber gemeinsame Klarheit. Legen Sie fest, wo Aufgaben, Vorschauen und Entscheidungen dokumentiert werden. Das Briefing sollte Zielgruppe, Geschäftsziel, Funktionen, Inhaltsverantwortung und Abhängigkeiten enthalten. Neue Ideen werden mit ihrer Auswirkung auf Zeit und Kosten festgehalten.",
        ],
        [
          "Gemeinsame Zeitfenster statt ständiger Verfügbarkeit",
          "Vereinbaren Sie eine Besprechungszeit mit eindeutig benannter Zeitzone. Australien und die USA haben mehrere Zeitzonen; Sommerzeit kann den Abstand verändern. Nutzen Sie asynchrone Updates für Rückmeldungen, die keinen Anruf brauchen. Ein Vorschaulink mit konkreten Fragen erleichtert Entscheidungen.",
        ],
        [
          "Für den tatsächlichen Markt gestalten",
          "Bestätigen Sie Schreibweisen, Währungen, Telefonnummern, Zielgebiete und Begriffe Ihrer Kunden. Preise und Verfügbarkeit müssen bei mehreren Märkten eindeutig sein. Vermeiden Sie austauschbare Ortsseiten, die nicht vorhandene Büros suggerieren. Rechtliche Texte, Steuern und regulierte Aussagen benötigen geeignete Prüfung für die betreffenden Märkte.",
        ],
        [
          "Eine brauchbare Übergabe definieren",
          "Klären Sie vor dem Start Eigentum an Konten, Bearbeitungsanleitung, Sicherungen und Support. Testen Sie eine echte Anfrage auf der veröffentlichten Website. Verwahren Sie Zugangsdaten sicher. DevnPixel begrüßt Remote-Projekte aus Bali, Australien, den USA und Singapur; Kommunikation und Erreichbarkeit werden passend zum Auftrag vereinbart.",
        ],
      ],
    },
    {
      title:
        "KI-Programmieragenten 2026: Was kleine Unternehmen wissen sollten",
      sections: [
        [
          "Die Meldung: längere Aufgaben und breitere Nutzung",
          "OpenAI beschrieb am 25. Juni 2026 längere Arbeitsabläufe mit Programmieragenten und deren Nutzung außerhalb der Entwicklung. Die Untersuchung betrifft die beobachteten Nutzer und internen Aktivitäten, nicht garantierte Ergebnisse für jedes Unternehmen. Für Websitebesitzer bleibt entscheidend, wer das Ergebnis überprüft: überzeugendes Aussehen allein macht ein Formular nicht zuverlässig.",
        ],
        [
          "Wo Agenten helfen können",
          "Klar abgegrenzte Aufgaben eignen sich als Einstieg: eine Komponente nach freigegebenem Design, Tests oder eine konkrete Fehlerkorrektur. Das sind Empfehlungen für einen Arbeitsablauf, keine Leistungsversprechen für ein Modell. Fragen Sie nach Versionsverwaltung, getrennten Vorschauen, wichtigen Tests und der Person, die Änderungen freigibt.",
        ],
        [
          "Daten und Veröffentlichungen kontrollieren",
          "Kundendaten und produktive Zugangsdaten gehören nicht unbedacht in ein KI-Werkzeug. Legen Sie fest, welche Daten und Aktionen zugelassen sind. Marketingseiten und Zahlungsfunktionen brauchen unterschiedliche Prüfungen. Auch Texte erfordern eine Kontrolle von Quellen, Daten und Aussagen. Viele austauschbare Artikel ersetzen keine hilfreichen Informationen.",
        ],
        [
          "Die fertige Website bewerten",
          "Prüfen Sie mobile Nutzung, Tastaturbedienung, Formularversand und Wartbarkeit. Googles Core-Web-Vitals-Leitfaden behandelt Ladeleistung, Reaktionsfähigkeit und visuelle Stabilität; ein perfekter Labortest garantiert keine Suchplatzierung. KI sollte einen bewusst gestalteten Prozess unterstützen. Ein klares Briefing, geprüfte Änderungen und menschliche Verantwortung bleiben unverzichtbar.",
        ],
      ],
    },
  ],
  zh: [
    {
      title: "巴厘岛网站开发：小型企业实用指南",
      sections: [
        [
          "先确定访客需要完成的行动",
          "别墅、创意工作室和教育机构需要不同的网站。在选择平台或视觉风格前，先明确访客应当咨询空房、预约沟通，还是了解服务。这将决定页面与功能。对住宿业务而言，房型信息、位置、联系渠道和清晰的预订条件，可能比复杂动画更重要。",
        ],
        [
          "认真考虑手机访客",
          "检查访客能否不放大页面就阅读条件、查看照片并联系您。压缩图片，预留显示尺寸，在普通移动网络上测试表单。聊天按钮不应遮住内容。如果确有多语言受众，再提供经过检查的翻译。准确说明所在地，不要为了海外市场虚构办公室。",
        ],
        [
          "根据维护需求选择技术",
          "定制网站适合特殊体验或集成；需要频繁更新内容的团队可能更适合内容管理系统。先确认谁负责编辑、更新频率及培训需求。域名、主机、源代码和统计账号的归属应当清晰，并约定访问权限、备份与交接资料。上线后的维护也是预算的一部分。",
        ],
        [
          "给开发者一份清晰简报",
          "准备业务目标、受众、所需页面、现有品牌素材、两个参考网站、功能集成和合理时间表。区分必须完成与后续再做的事项，便于比较方案。DevnPixel 服务面向巴厘岛及国际客户的企业，第一次讨论应从网站要实现的目标开始。",
        ],
      ],
    },
    {
      title: "经济实用的网站设计：通过明确范围控制成本",
      sections: [
        [
          "评估完整项目成本",
          "便宜的建站报价，如果带来重做、难以更新或缺少账号权限，最终可能更贵。比较设计、开发、内容、集成、测试与交接，而不只是首笔费用。简单介绍网站与多语言预订平台不能用同一价格衡量。区分一次性费用和持续订阅，不应相信适用于所有网站的统一报价。",
        ],
        [
          "先做好少量完整页面",
          "服务企业的首期可以包含首页、服务介绍、关于页面和可靠联系渠道。展示案例前应取得许可，并准确说明项目状态。复杂动画、后台系统或更多语言可以分期安排。这不是反对有创意的设计，而是确保关键用户流程获得足够投入。",
        ],
        [
          "提前准备内容与反馈",
          "尽早提供标志、服务说明、已获批准的图片和联系信息。内容缺失会引起反复修改。明确由谁起草、审核和上传文字。每个阶段统一收集反馈，约定修改轮次及额外需求的估价方式，减少相互冲突的意见造成返工。",
        ],
        [
          "保留必要的质量检查",
          "手机可读性、无障碍表单标签、安全部署、搜索元数据以及真正的邮件送达测试，都应纳入验收。询问上线后由谁修复缺陷。DevnPixel 从优先事项和预算范围开始讨论：明确的小项目，比承诺低价包办一切更可靠。",
        ],
      ],
    },
    {
      title: "自由职业者还是小型网站设计机构：如何选择",
      sections: [
        [
          "先看职责，而非称谓",
          "自由开发者可能与设计师合作，小型工作室也可能由一人统筹。请确认谁负责需求、文案、设计、开发、测试与支持。明确的技术任务可能适合专门人才；涉及品牌与内容的整体项目可能需要多学科协作。名称本身不能保证质量或时间安排。",
        ],
        [
          "检查与项目相关的证据",
          "用手机打开案例，看看导航与服务是否易懂。询问对方实际完成哪些部分，并区分客户项目和自主概念作品。两者都能展示能力，但证据性质不同。围绕具体挑战讨论处理方法，往往比要求大型免费试稿更有帮助。",
        ],
        [
          "把合作方式写清楚",
          "确定主要联系人、审核节点、回复预期和需求变更记录方式。远程合作时说明会议和截止日期的时区。支付定金前，确认文件、第三方许可、域名及主机权限，以及合作结束后的交接安排。修复原有缺陷与新增功能应区别对待。",
        ],
        [
          "选择能持续合作的伙伴",
          "同时比较交付、依赖条件、维护方案和费用。自由职业者可能提供直接的专长支持，小型工作室可能协调更广的需求。DevnPixel 结合网站设计、开发、品牌策略与广告创意。请告诉我们已有资源和需要协助的环节，而不是默认每个客户都需要完整套餐。",
        ],
      ],
    },
    {
      title: "澳大利亚、美国和新加坡企业如何与远程网站工作室合作",
      sections: [
        [
          "让进展清楚可见",
          "网站项目不要求所有人在同一办公室，却需要共同了解进度。开始前约定任务、预览和决策记录的位置。简报应包括受众、业务目标、功能、内容负责人和上线依赖。新想法应记录对时间与费用的影响，避免悄悄变成额外要求。",
        ],
        [
          "约定重叠时间，而非全天候在线",
          "明确会议窗口及具体时区。澳大利亚和美国都有多个时区，夏令时也会改变时间差。无需会议的问题可通过异步更新处理。带有几个具体审核问题的预览链接，比笼统地要求反馈更容易推动决策。",
        ],
        [
          "为客户所在市场设计",
          "确认拼写习惯、货币、电话号码格式、服务区域与客户用语。跨市场销售时应清楚说明价格与可用性。不要发布相似的城市页面暗示不存在的办公室。法律说明、税务和受监管宣传，需要相关市场的专业审核。",
        ],
        [
          "做好有用的交接",
          "上线前确认账号归属、编辑说明、备份和支持联系人。在正式网站提交真实咨询，并确认正确收件人收到。使用安全方式保管凭据。DevnPixel 欢迎巴厘岛、澳大利亚、美国和新加坡的远程项目，按约定范围和可用时间规划沟通，而非承诺当地办公室或全天候服务。",
        ],
      ],
    },
    {
      title: "2026 年 AI 编程智能体：小型企业网站负责人需要了解什么",
      sections: [
        [
          "新闻背景：任务更长，使用范围更广",
          "OpenAI 在 2026 年 6 月 25 日的研究更新中，描述了编程智能体执行更长任务、并被工程以外团队使用的趋势。这是对所研究用户及内部活动的观察，不保证每家企业都有同样结果。对网站负责人而言，更重要的是谁检查成果：页面看起来专业，并不代表表单可靠或信息正确。",
        ],
        [
          "智能体可以帮助哪些工作",
          "明确范围的任务是合理起点，例如根据已批准的设计编写组件、准备测试或修复具体错误。这是工作流程建议，不是对特定模型的性能承诺。询问开发者如何使用版本管理、独立预览、关键流程测试，以及由谁最终批准更改。",
        ],
        [
          "控制数据和发布权限",
          "不要随意将客户记录或生产凭据放入 AI 工具。团队应规定哪些工具可以接收哪些数据，哪些操作需要审核。营销页面与支付功能需要不同程度的权限和检查。内容同样需要核对日期、来源和事实；大量相似文章并不能替代有价值的信息。",
        ],
        [
          "衡量最终交付的网站",
          "无论采用什么工具，都要检查手机体验、键盘操作、咨询送达和可维护性。Google 的核心网页指标指南关注加载、响应与视觉稳定，但实验室满分不保证排名。我们的建议是用 AI 支持经过思考的开发流程，始终保留清晰简报、审核步骤及明确的人类负责人。",
        ],
      ],
    },
  ],
  ja: [
    {
      title: "バリのウェブ開発：小規模事業者のための実践ガイド",
      sections: [
        [
          "訪問者の行動から考える",
          "ヴィラ、制作スタジオ、教育サービスでは必要なサイトが異なります。技術や見た目の前に、空室確認、相談予約、サービス理解など、最も大切な行動を決めましょう。それがページと連携機能を決めます。宿泊事業なら、部屋、場所、問い合わせ方法、予約条件が華やかな演出より重要な場合があります。",
        ],
        [
          "スマートフォンを基準にする",
          "拡大せずに条件を読み、写真を見て、連絡できるか確認します。画像を圧縮し、表示領域を確保し、一般的なモバイル回線でフォームを試しましょう。翻訳は実際の利用者に役立つ言語から。海外市場に対応するために、存在しない現地オフィスを記載する必要はありません。",
        ],
        [
          "更新と保守に合う技術を選ぶ",
          "独自の体験や連携にはカスタム開発が向き、頻繁な更新には CMS が便利なこともあります。誰が、どのくらい更新するか、研修が必要かを確認します。ドメイン、ホスティング、コード、解析アカウントの所有権を明確にし、権限、バックアップ、引き継ぎ資料を合意しましょう。運用も予算に含めます。",
        ],
        [
          "開発者に渡す簡潔な要件書",
          "目的、顧客、必要ページ、ブランド素材、参考サイト二つ、連携、現実的な公開時期をまとめます。必須項目と後回しにできる項目を分ければ、提案を比較しやすくなります。DevnPixel はバリと国際市場に向けた事業を支援します。最初の相談では、サイトで達成したいことから伺います。",
        ],
      ],
    },
    {
      title: "手頃なウェブデザイン：範囲を明確にして費用を抑える",
      sections: [
        [
          "総費用で考える",
          "初期費用が安くても、作り直しや更新の難しさ、アカウントへの依存で高くつく場合があります。デザイン、開発、内容作成、連携、検証、引き継ぎを比較しましょう。紹介サイトと多言語予約システムに同じ価格は当てはまりません。一時費用と継続費用を分けて確認します。",
        ],
        [
          "少数の完成したページを優先する",
          "サービス事業なら、ホーム、サービス、紹介、使える問い合わせ導線が初期構成の候補です。制作例は許可と正確な情報を伴って公開します。高度な演出、管理画面、追加言語は次の段階でも構いません。大切なのは主要な顧客体験に十分な時間を使うことです。",
        ],
        [
          "内容とレビューを早めに準備する",
          "ロゴ、サービス説明、承認済み写真、連絡先を早めに渡します。内容不足はレイアウトのやり直しにつながります。執筆、承認、入力の担当を決め、節目ごとにフィードバックをまとめましょう。修正回数と追加依頼の見積もり方法も合意しておきます。",
        ],
        [
          "基本品質は削らない",
          "モバイルでの読みやすさ、フォームのラベル、安全な公開、検索メタデータ、実際の問い合わせ送信試験を確認します。公開後の不具合対応も質問しましょう。DevnPixel では優先事項と予算から範囲を考えます。すべてを最安値で約束するより、小さく明確な計画のほうが堅実です。",
        ],
      ],
    },
    {
      title: "フリーランスか小規模ウェブ制作会社か：選び方",
      sections: [
        [
          "肩書きより担当範囲",
          "フリーランスがデザイナーと組む場合も、小さなスタジオを一人で率いる場合もあります。企画、文章、デザイン、開発、試験、運用を誰が担当するか確認しましょう。特定の技術課題には専門家、複数領域をつなぐ案件にはスタジオが合うこともあります。名称だけで品質は決まりません。",
        ],
        [
          "案件に合う実績を見る",
          "スマートフォンで制作例を開き、内容と動線を確認します。本人が担当した部分と、実案件か自主制作かを質問しましょう。どちらも能力を示しますが、意味は異なります。大きな無償課題より、具体的な問題への対応を話すほうが判断材料になることもあります。",
        ],
        [
          "協働のルールを具体化する",
          "窓口、確認時期、返信の目安、変更の記録を決めます。リモートなら時区も明記します。着手金の前に、ファイル、外部ライセンス、ドメイン、サーバー権限、契約終了時の対応を確認しましょう。不具合修正と機能追加は別の作業です。",
        ],
        [
          "続けられる関係を選ぶ",
          "費用だけでなく、成果物、依存関係、保守を比較します。個人には直接専門家と話せる利点があり、スタジオは幅広い要件をまとめられることがあります。DevnPixel はデザイン、開発、ブランド戦略、広告制作をつなぎます。既にあるものと必要な支援をお聞かせください。",
        ],
      ],
    },
    {
      title: "オーストラリア・米国・シンガポールからリモートでサイトを制作する",
      sections: [
        [
          "進捗を見える形にする",
          "同じオフィスは必須ではありませんが、進行状況の共有は必要です。タスク、プレビュー、決定事項をどこに置くか決めます。要件書には顧客、目的、機能、内容担当、公開の依存事項を含めましょう。追加のアイデアは時間と費用への影響も記録します。",
        ],
        [
          "常時対応より合意した時間帯",
          "会議の時間には具体的なタイムゾーンを付けます。オーストラリアと米国には複数の時区があり、夏時間で差が変わります。通話が不要な確認は非同期で進めましょう。具体的な質問を添えたプレビューなら、漠然とした感想依頼より判断しやすくなります。",
        ],
        [
          "顧客の市場に合わせる",
          "表記、通貨、電話番号、対応地域、顧客が使う言葉を確認します。複数市場では料金や利用条件を明確にしましょう。存在しない拠点を示す似た地域ページを量産する必要はありません。法的表示、税務、規制対象の表現は、それぞれの市場に適切な専門確認が必要です。",
        ],
        [
          "使える引き継ぎを定義する",
          "公開前にアカウントの所有、編集方法、バックアップ、サポート先を確認し、実際の問い合わせが届くか試します。認証情報は安全に管理しましょう。DevnPixel はバリ、オーストラリア、米国、シンガポールの案件を歓迎し、合意した範囲と対応時間に合わせて連絡方法を計画します。",
        ],
      ],
    },
    {
      title:
        "2026 年の AI コーディングエージェント：小規模事業者が知っておきたいこと",
      sections: [
        [
          "ニュース：長い作業と幅広い利用",
          "OpenAI は 2026 年 6 月 25 日、コーディングエージェントによる長時間の作業と、開発部門以外での利用について研究結果を紹介しました。対象となった利用者や社内活動の観察であり、すべての企業への成果保証ではありません。サイト所有者にとっては、誰が品質を確認するかが重要です。",
        ],
        [
          "支援を受けやすい作業",
          "承認済みデザインからの部品作成、テストの準備、特定の不具合修正など、範囲が明確な仕事から始めるのが実践的です。これは手順の提案であってモデルの性能保証ではありません。バージョン管理、個別のプレビュー、重要な操作の試験、承認責任者について開発者に質問しましょう。",
        ],
        [
          "データと公開の判断を管理する",
          "顧客記録や本番の認証情報を不用意に AI ツールへ渡さないようにします。使えるデータと、承認が必要な操作を決めましょう。紹介ページと決済機能では必要な検証が異なります。文章も日付、出典、主張の確認が必要です。似た記事の量産は有益な情報の代わりになりません。",
        ],
        [
          "完成したサイトを評価する",
          "モバイル表示、キーボード操作、フォーム送信、保守性を確認します。Google の Core Web Vitals は読み込み、応答性、視覚的安定性を扱いますが、測定上の満点は検索順位を保証しません。明確な要件、レビューされた変更、人間の責任者を保ち、AI を意図ある開発手順の支援に使うことを勧めます。",
        ],
      ],
    },
  ],
  id: [
    {
      title: "Pengembangan web di Bali: panduan praktis untuk usaha kecil",
      sections: [
        [
          "Mulai dari tindakan yang dibutuhkan pengunjung",
          "Vila, studio kreatif, dan penyedia pendidikan membutuhkan website berbeda. Sebelum memilih platform, tentukan tindakan utama: menanyakan ketersediaan, memesan konsultasi, atau memahami layanan. Tujuan itu menentukan halaman serta integrasi. Untuk bisnis akomodasi, detail kamar, lokasi, kontak, dan ketentuan pemesanan sering lebih penting daripada efek visual yang rumit.",
        ],
        [
          "Rancang untuk pengunjung lewat ponsel",
          "Pastikan pengunjung dapat membaca ketentuan, melihat foto, dan menghubungi Anda tanpa memperbesar layar. Kompres gambar, tentukan dimensinya, dan uji formulir memakai koneksi seluler biasa. Tombol chat tidak boleh menutupi konten. Tambahkan bahasa yang benar-benar dibutuhkan audiens dan jelaskan lokasi secara akurat, tanpa mengaku memiliki kantor di luar negeri.",
        ],
        [
          "Pilih teknologi berdasarkan pengelolaan sehari-hari",
          "Pengembangan khusus cocok untuk pengalaman atau integrasi tertentu; CMS dapat memudahkan pembaruan rutin. Tentukan siapa yang mengubah konten, seberapa sering, dan pelatihan yang diperlukan. Kepemilikan domain, hosting, kode, dan akun analitik harus jelas. Sepakati akses, pencadangan, serta panduan serah terima. Biaya operasional tetap perlu diperhitungkan setelah peluncuran.",
        ],
        [
          "Siapkan brief yang berguna",
          "Tuliskan tujuan bisnis, audiens, halaman wajib, aset merek, dua referensi website, integrasi, dan target waktu realistis. Pisahkan kebutuhan utama dari fitur tahap berikutnya agar proposal mudah dibandingkan. DevnPixel bekerja dengan bisnis yang menyasar Bali serta pelanggan internasional. Percakapan pertama berfokus pada hasil yang ingin dicapai website.",
        ],
      ],
    },
    {
      title: "Desain web terjangkau: hemat lewat lingkup yang lebih jelas",
      sections: [
        [
          "Hitung keseluruhan proyek",
          "Pembuatan murah dapat menjadi mahal jika perlu diulang, sulit diperbarui, atau tidak memberikan akses akun. Bandingkan desain, pengembangan, konten, integrasi, pengujian, dan serah terima. Situs profil tidak sama dengan platform pemesanan multibahasa. Pisahkan biaya awal dari langganan rutin; tidak ada satu harga yang jujur untuk semua kebutuhan.",
        ],
        [
          "Dahulukan beberapa halaman yang lengkap",
          "Untuk bisnis jasa, tahap awal dapat berisi beranda, layanan, profil, dan kontak yang bekerja. Publikasikan karya dengan izin dan keterangan akurat. Animasi kompleks, dasbor, atau bahasa tambahan bisa menyusul. Tujuannya bukan menghilangkan kreativitas, melainkan memastikan perjalanan utama pelanggan mendapat perhatian yang cukup.",
        ],
        [
          "Persiapkan konten dan masukan",
          "Berikan logo, uraian layanan, foto yang disetujui, dan informasi kontak sejak awal. Konten yang belum siap memicu perubahan layout berulang. Tentukan penulis, pemberi persetujuan, dan pengunggah. Gabungkan masukan per tahap, lalu sepakati jumlah revisi dan cara menghitung permintaan tambahan.",
        ],
        [
          "Jangan mengurangi kualitas dasar",
          "Tampilan mobile yang terbaca, label formulir yang aksesibel, deployment aman, metadata pencarian, dan pengujian pengiriman pesan adalah bagian penerimaan pekerjaan. Tanyakan tanggung jawab perbaikan setelah peluncuran. Di DevnPixel, pembicaraan desain terjangkau dimulai dari prioritas serta anggaran. Proyek kecil yang jelas lebih sehat daripada janji mengerjakan semuanya dengan harga terendah.",
        ],
      ],
    },
    {
      title: "Freelancer atau agensi web kecil: bagaimana memilihnya",
      sections: [
        [
          "Lihat tanggung jawab, bukan sebutan",
          "Freelancer bisa bekerja sama dengan desainer, sementara studio kecil dapat dipimpin satu orang. Tanyakan siapa menangani strategi, teks, desain, pengembangan, pengujian, dan dukungan. Spesialis cocok untuk tugas teknis terarah; studio dapat menyatukan beberapa disiplin. Sebutan saja tidak menjamin kualitas maupun ketersediaan.",
        ],
        [
          "Periksa bukti yang relevan",
          "Buka contoh website di ponsel dan lihat apakah layanan serta navigasinya jelas. Tanyakan bagian yang benar-benar dikerjakan dan bedakan proyek klien dari konsep mandiri. Keduanya menunjukkan kemampuan, tetapi memiliki konteks berbeda. Diskusi masalah nyata sering lebih berguna daripada meminta pekerjaan percobaan gratis yang besar.",
        ],
        [
          "Buat kolaborasi lebih konkret",
          "Sepakati kontak utama, tahap peninjauan, ekspektasi balasan, dan pencatatan perubahan. Untuk kerja jarak jauh, cantumkan zona waktu. Sebelum membayar uang muka, perjelas kepemilikan file, lisensi pihak ketiga, akses domain dan hosting, serta serah terima saat hubungan berakhir. Memperbaiki bug berbeda dengan menambah fitur.",
        ],
        [
          "Pilih hubungan kerja yang berkelanjutan",
          "Bandingkan hasil, ketergantungan, dan rencana pemeliharaan bersama biaya. Freelancer dapat menawarkan keahlian langsung; studio independen dapat mengoordinasikan lingkup lebih luas. DevnPixel menggabungkan desain web, pengembangan, strategi merek, dan materi iklan. Ceritakan bagian yang sudah Anda punya dan yang masih membutuhkan bantuan.",
        ],
      ],
    },
    {
      title:
        "Bekerja dengan studio web jarak jauh dari Australia, AS, atau Singapura",
      sections: [
        [
          "Progres perlu terlihat",
          "Proyek website tidak mengharuskan satu kantor, tetapi membutuhkan pemahaman bersama. Tentukan tempat menyimpan tugas, preview, dan keputusan. Brief mencakup audiens, tujuan bisnis, fungsi, penanggung jawab konten, dan kebutuhan sebelum peluncuran. Ide tambahan harus dicatat bersama dampaknya terhadap jadwal dan biaya.",
        ],
        [
          "Sepakati waktu bersama, bukan selalu online",
          "Tentukan waktu rapat dengan zona waktu yang jelas. Australia dan AS mempunyai beberapa zona; daylight saving dapat mengubah selisih. Gunakan pembaruan asinkron untuk hal yang tidak memerlukan panggilan. Link preview dengan beberapa pertanyaan spesifik memudahkan keputusan dibanding permintaan masukan yang terlalu umum.",
        ],
        [
          "Sesuaikan dengan pasar pelanggan",
          "Konfirmasikan ejaan, mata uang, format nomor telepon, wilayah layanan, dan istilah yang digunakan audiens. Harga serta ketersediaan harus jelas untuk beberapa pasar. Jangan membuat halaman kota serupa yang mengesankan adanya kantor fiktif. Informasi hukum, pajak, dan klaim yang diatur memerlukan peninjauan yang sesuai pasar.",
        ],
        [
          "Tentukan serah terima yang berguna",
          "Sebelum tayang, pastikan kepemilikan akun, panduan editing, cadangan, serta kontak dukungan. Kirim pertanyaan nyata melalui situs produksi dan verifikasi penerimanya. Simpan kredensial dengan aman. DevnPixel menerima proyek dari Bali, Australia, AS, dan Singapura dengan komunikasi sesuai lingkup dan waktu yang disepakati, bukan janji kantor lokal atau layanan sepanjang hari.",
        ],
      ],
    },
    {
      title:
        "Agen coding AI pada 2026: hal yang perlu diketahui pemilik website usaha kecil",
      sections: [
        [
          "Beritanya: tugas lebih panjang dan penggunaan lebih luas",
          "Dalam pembaruan riset 25 Juni 2026, OpenAI menggambarkan penggunaan agen coding untuk pekerjaan yang lebih panjang dan di luar tim engineering. Temuan itu membahas pengguna serta aktivitas internal yang diteliti, bukan jaminan hasil bagi setiap bisnis. Bagi pemilik website, pertanyaan terpenting adalah siapa memeriksa hasilnya. Tampilan yang meyakinkan belum tentu berarti formulir berfungsi.",
        ],
        [
          "Bagian pekerjaan yang dapat dibantu",
          "Mulai dari tugas yang jelas: membuat komponen berdasarkan desain disetujui, menyiapkan tes, atau memperbaiki bug tertentu. Ini rekomendasi alur kerja, bukan klaim performa sebuah model. Tanyakan bagaimana pengembang memakai version control, preview terpisah, pengujian alur penting, dan penanggung jawab persetujuan.",
        ],
        [
          "Kendalikan data dan keputusan publikasi",
          "Jangan sembarangan memasukkan data pelanggan atau kredensial produksi ke alat AI. Tentukan data yang boleh dibagikan dan tindakan yang memerlukan review. Halaman pemasaran dan integrasi pembayaran memerlukan tingkat pemeriksaan berbeda. Konten juga harus diperiksa tanggal, sumber, serta klaimnya. Banyak artikel serupa tidak menggantikan informasi yang berguna.",
        ],
        [
          "Ukur website yang diserahkan",
          "Periksa penggunaan di ponsel, navigasi keyboard, pengiriman formulir, dan kemudahan pemeliharaan. Panduan Core Web Vitals Google membahas kecepatan muat, responsivitas, dan stabilitas visual; skor laboratorium sempurna tidak menjamin peringkat. Gunakan AI untuk mendukung proses terarah, dengan brief jelas, perubahan yang ditinjau, dan manusia yang bertanggung jawab atas hasil.",
        ],
      ],
    },
  ],
};
