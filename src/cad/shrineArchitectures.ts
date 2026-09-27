/**
 * Shinto Shrine Architectural Styles and Parametric Profile Generator.
 * Supports standard styles:
 * - SHINDEN (寝殿造風・海上伽藍・両部鳥居): 嚴島神社等
 * - TAISHA (大社造・高床正方形・心御柱・神明鳥居): 出雲大社等
 * - SHINMEI (神明造・平入切妻・棟持柱・神明鳥居): 伊勢神宮・熱田神宮・明治神宮等
 * - INARI (流造・千本鳥居参道・明神鳥居): 伏見稲荷大社等
 * - GONGEN (権現造・H型複合社殿・唐破風・明神鳥居): 日光東照宮・北野天満宮等
 * - KASUGA / GENERAL (春日造 / 一般神社・流造)
 */

export type ShrineStyle = 'SHINDEN' | 'TAISHA' | 'SHINMEI' | 'INARI' | 'GONGEN' | 'GENERAL';
export type SiteTopology = 'OCEAN' | 'MOUNTAIN' | 'FOREST' | 'INARI_HILL';
export type ToriiType = 'RYOBU' | 'SHINMEI' | 'MYOJIN' | 'SENBON';

export interface ShrineProfile {
  name: string;
  kana: string;
  location: string;
  style: ShrineStyle;
  styleName: string;
  styleDescription: string;
  topology: SiteTopology;
  topologyName: string;
  toriiType: ToriiType;
  toriiName: string;
  hondenSpan: { xBays: number; yBays: number; bayMeter: number }; // 柱間グリッド設定
  features: string[];
}

export const PRESET_SHRINES: Record<string, ShrineProfile> = {
  itsukushima: {
    name: '嚴島神社',
    kana: 'いつくしまじんじゃ',
    location: '広島県廿日市市宮島町',
    style: 'SHINDEN',
    styleName: '寝殿造様式・海上舞台架構',
    styleDescription: '海上に浮かぶ平舞台・高舞台と東西回廊が連なる国宝建築群',
    topology: 'OCEAN',
    topologyName: '有浦湾 海中干潟・汀線',
    toriiType: 'RYOBU',
    toriiName: '木造四脚両部鳥居 (笠木24.2m / 総高16.6m)',
    hondenSpan: { xBays: 9, yBays: 4, bayMeter: 2.424 },
    features: ['海上平舞台・高舞台', '東回廊・西回廊', '大鳥居(沖合160m)', '能舞台'],
  },
  izumo: {
    name: '出雲大社',
    kana: 'いづもおおやしろ / いずもたいしゃ',
    location: '島根県出雲市大社町',
    style: 'TAISHA',
    styleName: '大社造 (日本最古の神社建築様式)',
    styleDescription: '正方形平面・中心に巨大な心御柱・妻入・男千木(外削ぎ)・勝男木3本',
    topology: 'MOUNTAIN',
    topologyName: '八雲山山麓・四重瑞垣・神域',
    toriiType: 'SHINMEI',
    toriiName: '宇迦橋大鳥居・勢溜の鳥居 (神明鳥居形式)',
    hondenSpan: { xBays: 2, yBays: 2, bayMeter: 5.45 }, // 正方形9本柱 (中心心御柱)
    features: ['国宝本殿(高さ約24m)', '中心心御柱(太さ約1m)', '八足門・楼門', '東西十九社'],
  },
  ise: {
    name: '伊勢神宮 (皇大神宮・内宮)',
    kana: 'いせじんぐう / こうたいじんぐう',
    location: '三重県伊勢市宇治館町',
    style: 'SHINMEI',
    styleName: '唯一神明造 (純粋直線美・切妻平入)',
    styleDescription: '素木檜造・平入切妻・屋根外側に独立する棟持柱・千木・勝男木10本',
    topology: 'FOREST',
    topologyName: '五十鈴川畔・神路山・深い杜',
    toriiType: 'SHINMEI',
    toriiName: '宇治橋大鳥居 (極太素木神明鳥居)',
    hondenSpan: { xBays: 3, yBays: 2, bayMeter: 3.6 },
    features: ['外側に自立する棟持柱2本', '四重御垣(板垣・外玉垣・内玉垣・瑞垣)', '五十鈴川御手洗場'],
  },
  fushimi: {
    name: '伏見稲荷大社',
    kana: 'ふしみいなりたいしゃ',
    location: '京都府京都市伏見区深草',
    style: 'INARI',
    styleName: '稲荷造 (流造の発展形・五間社)',
    styleDescription: '正面五間・優美な反りを持った向拝流造屋根・鮮烈な朱塗り架構',
    topology: 'INARI_HILL',
    topologyName: '稲荷山山麓・参道鳥居回廊',
    toriiType: 'SENBON',
    toriiName: '朱塗千本鳥居・大鳥居 (台輪鳥居・明神鳥居)',
    hondenSpan: { xBays: 5, yBays: 3, bayMeter: 2.7 },
    features: ['無数に連なる千本鳥居参道', '五間社流造本殿(重要文化財)', '楼門・外拝殿'],
  },
  nikko: {
    name: '日光東照宮',
    kana: 'にっこうとうしょうぐう',
    location: '栃木県日光市山内',
    style: 'GONGEN',
    styleName: '権現造 (本殿・拝殿を相の間で一体化)',
    styleDescription: '本殿と拝殿を一段低い石の間(相の間)で「エの字型」に連結する極彩色漆塗建築',
    topology: 'MOUNTAIN',
    topologyName: '日光山杉並木・山岳ひな壇敷地',
    toriiType: 'MYOJIN',
    toriiName: '石鳥居 (一の鳥居・重文明神鳥居)',
    hondenSpan: { xBays: 5, yBays: 3, bayMeter: 3.0 },
    features: ['陽明門(国宝)', '本殿・相の間・拝殿連結架構', '東西透塀', '唐門'],
  },
  meiji: {
    name: '明治神宮',
    kana: 'めいじじんぐう',
    location: '東京都渋谷区代々木神園町',
    style: 'SHINMEI',
    styleName: '流造・神明造折衷 (近代神社建築の最高峰)',
    styleDescription: '優美な檜皮葺屋根・銅板葺・広大な鎮守の杜に抱かれた回廊配備',
    topology: 'FOREST',
    topologyName: '代々木人工極相林・広大玉砂利参道',
    toriiType: 'MYOJIN',
    toriiName: '原木大鳥居 (日本最大級木造明神鳥居)',
    hondenSpan: { xBays: 3, yBays: 3, bayMeter: 3.3 },
    features: ['大鳥居(樹齢1500年台湾檜)', '南神門・外拝殿・内拝殿', '広大な杜の緑地帯'],
  },
};

/**
 * Analyzes arbitrary text input to synthesize a Shinto architecture profile.
 */
export function analyzeShrinePrompt(input: string): ShrineProfile {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ...PRESET_SHRINES.itsukushima };
  }
  const cleanInput = trimmed.replace(/[\s\u3000\(\)（）]/g, '').toLowerCase();

  // 1. Direct match with preset keys and names (bidirectional partial matching)
  for (const [key, profile] of Object.entries(PRESET_SHRINES)) {
    const cleanProfileName = profile.name.replace(/[\s\u3000\(\)（）]/g, '').toLowerCase();
    const cleanKana = profile.kana.replace(/[\s\u3000\/\(\)（）]/g, '').toLowerCase();

    if (
      cleanInput.includes(key) ||
      cleanInput.includes(cleanProfileName) ||
      cleanProfileName.includes(cleanInput) ||
      cleanKana.includes(cleanInput) ||
      cleanInput.includes(cleanKana)
    ) {
      return {
        ...profile,
        name: trimmed, // Keep the user's specific typed name (e.g. "出雲大社")
      };
    }
  }

  // 2. Keyword ontology analysis
  if (trimmed.includes('出雲') || trimmed.includes('大社')) {
    return {
      ...PRESET_SHRINES.izumo,
      name: trimmed,
      kana: 'すいそく・たいしゃぞう',
      features: ['大社造高床本殿', '巨大心御柱', '四重瑞垣', '神明鳥居'],
    };
  }

  if (trimmed.includes('伊勢') || trimmed.includes('神宮') || trimmed.includes('熱田')) {
    return {
      ...PRESET_SHRINES.ise,
      name: trimmed,
      kana: 'すいそく・しんめいぞう',
      features: ['唯一神明造本殿', '外独立棟持柱', '神明鳥居', '板垣・外玉垣'],
    };
  }

  if (trimmed.includes('稲荷') || trimmed.includes('いなり')) {
    return {
      ...PRESET_SHRINES.fushimi,
      name: trimmed,
      kana: 'すいそく・いなりぞう',
      features: ['千本鳥居参道列', '朱塗五間社流造', '明神鳥居', '楼門'],
    };
  }

  if (trimmed.includes('東照宮') || trimmed.includes('日光') || trimmed.includes('天満宮') || trimmed.includes('天神')) {
    return {
      ...PRESET_SHRINES.nikko,
      name: trimmed,
      kana: 'すいそく・ごんげんぞう',
      features: ['権現造H型連結社殿', '唐破風・千鳥破風', '明神鳥居', '透塀'],
    };
  }

  if (trimmed.includes('厳島') || trimmed.includes('嚴島') || trimmed.includes('海') || trimmed.includes('水') || trimmed.includes('宮島')) {
    return {
      ...PRESET_SHRINES.itsukushima,
      name: trimmed,
    };
  }

  // Default procedural shrine profile (Nagare-zukuri / General Shinto Style)
  return {
    name: trimmed || '日本神社',
    kana: 'にほんじんじゃ',
    location: '日本国内 鎮守の杜',
    style: 'GENERAL',
    styleName: '三間社流造 (日本で最も普及した端正な神社様式)',
    styleDescription: '前面の屋根が優美に長く反り伸びて向拝を包み込む伝統流造建築',
    topology: 'FOREST',
    topologyName: '鎮守の杜・杉木立・参道玉砂利',
    toriiType: 'MYOJIN',
    toriiName: '木造明神鳥居 (島木・笠木反り増し・額束)',
    hondenSpan: { xBays: 3, yBays: 2, bayMeter: 2.7 },
    features: ['三間社流造本殿', '幣殿・拝殿連鎖', '参道・明神鳥居', '手水舎・神池'],
  };
}
