import type { Locale } from "../i18n";
export const visualCopy: Record<
  Locale,
  {
    shapes: Record<string, string>;
    night: string;
    day: string;
    desk: string;
    blocks: string;
  }
> = {
  en: {
    shapes: {
      dna: "THE CREATIVE DNA",
      core: "THE BUILDING BLOCK",
      frame: "THE OPEN FRAME",
      steps: "THE NEXT STEP",
      cross: "THE CONNECTION",
      diamond: "THE PIXEL PRISM",
    },
    night: "AFTER HOURS",
    day: "A LITTLE DAYLIGHT",
    desk: "A LITTLE SPACE FOR BIG IDEAS",
    blocks: "DESIGNED ONE BLOCK AT A TIME.",
  },
  de: {
    shapes: {
      dna: "DIE KREATIVE DNA",
      core: "DER BAUSTEIN",
      frame: "DER OFFENE RAHMEN",
      steps: "DER NÄCHSTE SCHRITT",
      cross: "DIE VERBINDUNG",
      diamond: "DAS PIXELPRISMA",
    },
    night: "NACH FEIERABEND",
    day: "EIN WENIG TAGESLICHT",
    desk: "EIN KLEINER PLATZ FÜR GROSSE IDEEN",
    blocks: "BLOCK FÜR BLOCK GESTALTET.",
  },
  zh: {
    shapes: {
      dna: "创意 DNA",
      core: "基础积木",
      frame: "开放框架",
      steps: "下一步",
      cross: "连接",
      diamond: "像素棱镜",
    },
    night: "夜间时光",
    day: "一点日光",
    desk: "小小空间，容纳大想法",
    blocks: "一块一块，用心构建。",
  },
  ja: {
    shapes: {
      dna: "創造の DNA",
      core: "はじまりのブロック",
      frame: "開かれたフレーム",
      steps: "次の一歩",
      cross: "つながり",
      diamond: "ピクセルプリズム",
    },
    night: "夜のひととき",
    day: "やわらかな日差し",
    desk: "大きなアイデアのための小さな空間",
    blocks: "ひとつずつ、丁寧に。",
  },
  id: {
    shapes: {
      dna: "DNA KREATIF",
      core: "BLOK PEMBANGUN",
      frame: "BINGKAI TERBUKA",
      steps: "LANGKAH BERIKUTNYA",
      cross: "KONEKSI",
      diamond: "PRISMA PIKSEL",
    },
    night: "SELEPAS JAM KERJA",
    day: "SEDIKIT CAHAYA PAGI",
    desk: "RUANG KECIL UNTUK IDE BESAR",
    blocks: "DIRANCANG SATU BLOK DEMI SATU.",
  },
};
