import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type HyattHotel = {
  group_name: string;
  brand_name: string;
  hotel_name_en: string;
  city?: string;
  official_url: string;
  room_names?: string[];
  room_count?: number;
};

type HiltonRoom = {
  room_name_en?: string;
  room_name_zh?: string;
};

type HiltonHotel = {
  group_name: string;
  brand_name_en: string;
  hotel_name_en: string;
  hotel_name_zh?: string;
  official_url_en: string;
  official_url_zh?: string;
  rooms?: HiltonRoom[];
  room_count?: number;
};

type MarriottRoom = {
  room_name_en?: string;
  room_name_zh?: string;
};

type MarriottHotel = {
  group_name: string;
  brand_name_en: string;
  hotel_name_en: string;
  hotel_name_zh?: string;
  official_url_en: string;
  official_url_zh?: string;
  rooms?: MarriottRoom[];
  room_count_en?: number;
};

type HotelSeed = {
  id: string;
  name: string;
  group_name: string;
  brand_name: string;
  city: string;
  logo_url: string | null;
  sample_count: number;
  latest_observed_at: string;
  source_pool_desc: string;
  editorial_note: string;
  summary_text: string;
};

type RoomOptionSeed = {
  id: string;
  hotel_id: string;
  room_name: string;
  room_bucket: string | null;
};

type UpgradeStatSeed = {
  id: string;
  hotel_id: string;
  member_tier: string;
  room_bucket: string;
  success_count: number;
  success_ratio: number;
  tier_success_total: number;
};

type RawUpgradeCaseSeed = {
  id: string;
  hotel_id: string;
  observed_at: string;
  booked_room_raw: string;
  upgraded_room_raw: string;
  member_tier: string;
  stay_context: string | null;
};

type NormalizedHotel = {
  id: string;
  name: string;
  group_name: string;
  brand_name: string;
  city: string;
  latest_observed_at: string;
  source_pool_desc: string;
  editorial_note: string;
  rooms: { room_name: string; room_bucket: string | null }[];
  tiers: string[];
};

type TierProfile = {
  label: string;
  preferredMaxBucketIndex: number;
};

const projectDataDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceDir = join(projectDataDir, "..", "..");
const scrapeDir = join(workspaceDir, "data", "hotel_scrape");
const seedsDir = join(projectDataDir, "seeds");

const today = "2026-05-05";
const roomBucketColumns = ["尊贵豪华房", "小型套房", "更高套房", "特色房型"] as const;
const stayContexts = ["工作日入住", "周末入住", "商务出行", "节假日前后", "短住一晚", "纪念日入住"];

const groupNameMap: Record<string, string> = {
  Hyatt: "凯悦",
  Hilton: "希尔顿",
  Marriott: "万豪"
};

const hiltonBrandMap: Record<string, string> = {
  Canopy: "嘉悦里",
  "DoubleTree by Hilton": "逸林",
  Conrad: "康莱德",
  Hilton: "希尔顿",
  "Waldorf Astoria": "华尔道夫",
  Curio: "格芮"
};

const marriottBrandMap: Record<string, string> = {
  "The Ritz-Carlton": "丽思卡尔顿",
  "St. Regis": "瑞吉",
  "JW Marriott": "JW万豪",
  "W Hotels": "W",
  EDITION: "艾迪逊",
  "Marriott Hotels & Resorts": "万豪",
  Sheraton: "喜来登",
  "Delta Hotels and Resorts": "德尔塔",
  Westin: "威斯汀",
  "Le Meridien": "艾美",
  "Autograph Collection": "傲途格精选",
  Tribute: "臻品之选"
};

const hyattBrandMap: Record<string, string> = {
  "alila-hotels-and-resorts": "阿丽拉",
  andaz: "安达仕",
  "caption-by-hyatt": "Caption",
  "grand-hyatt": "君悦",
  hotel: "凯悦",
  "hyatt-centric": "凯悦尚萃",
  "hyatt-house": "凯悦嘉寓",
  "hyatt-place": "凯悦嘉轩",
  "hyatt-regency": "凯悦",
  "jdv-by-hyatt": "JdV",
  "park-hyatt": "柏悦",
  "thompson-hotels": "Thompson",
  "unbound-collection": "凯悦悠选"
};

const cityMap: Record<string, string> = {
  Altay: "阿勒泰",
  Anhui: "宿州",
  Anshan: "鞍山",
  Baoding: "保定",
  Baoshan: "保山",
  Baotou: "包头",
  Beihai: "北海",
  Beijing: "北京",
  Changbaishan: "长白山",
  Changchun: "长春",
  Changsha: "长沙",
  Changshu: "常熟",
  Changzhou: "常州",
  Chengdu: "成都",
  Chongqing: "重庆",
  Dalian: "大连",
  Delta: "三亚",
  Dongguan: "东莞",
  DoubleTree: "宿州",
  Flow: "三亚",
  Foshan: "佛山",
  Fuzhou: "福州",
  Guangzhou: "广州",
  Guiyang: "贵阳",
  Haikou: "海口",
  Hangzhou: "杭州",
  Harbin: "哈尔滨",
  Hefei: "合肥",
  Huangshan: "黄山",
  Huzhou: "湖州",
  "Jiangsu Province": "江苏",
  Jiaxing: "嘉兴",
  "Jiaxing City": "嘉兴",
  Jinan: "济南",
  Jingdezhen: "景德镇",
  Jiuzhaigou: "九寨沟",
  Joyze: "厦门",
  Kaifeng: "开封",
  Kunming: "昆明",
  Lanzhou: "兰州",
  Le: "厦门",
  Lijiang: "丽江",
  Lingshui: "陵水",
  Linyi: "临沂",
  Liuzhou: "柳州",
  Marquis: "上海",
  Nanchong: "南充",
  Nanjing: "南京",
  Nantong: "南通",
  Ningbo: "宁波",
  Qingdao: "青岛",
  Qinhuangdao: "秦皇岛",
  Qufu: "曲阜",
  Rizhao: "日照",
  Rugao: "如皋",
  Sanya: "三亚",
  Secan: "青岛",
  Shanghai: "上海",
  Shaoxing: "绍兴",
  Shenmu: "神木",
  Shenyang: "沈阳",
  Shenzhen: "深圳",
  Shijiazhuang: "石家庄",
  Shiyan: "十堰",
  Shu: "杭州",
  Shunde: "顺德",
  Suzhou: "苏州",
  Taiyuan: "太原",
  The: "洛阳",
  Thousand: "三亚",
  Tianjin: "天津",
  Urumqi: "乌鲁木齐",
  W: "上海",
  Wanning: "万宁",
  Weihai: "威海",
  Wenan: "文安",
  Wuhan: "武汉",
  Xi: "无锡",
  "Xi'an": "西安",
  "Xi’an": "西安",
  Xiamen: "厦门",
  Yancheng: "盐城",
  Yangzhou: "扬州",
  Yantai: "烟台",
  Yinchuan: "银川",
  Yixing: "宜兴",
  Yuexiu: "广州",
  Zhangjiakou: "张家口",
  Zhejiang: "临安",
  Zhengzhou: "郑州",
  Zhenjiang: "镇江",
  Zhuhai: "珠海",
  Zhuzhou: "株洲"
};

const chineseCityCandidates = [
  "阿勒泰",
  "鞍山",
  "保定",
  "保山",
  "包头",
  "北海",
  "北京",
  "长白山",
  "长春",
  "长沙",
  "常熟",
  "常州",
  "成都",
  "重庆",
  "大连",
  "东莞",
  "佛山",
  "福州",
  "广州",
  "贵阳",
  "海口",
  "杭州",
  "哈尔滨",
  "合肥",
  "黄山",
  "湖州",
  "嘉兴",
  "济南",
  "景德镇",
  "九寨沟",
  "开封",
  "昆明",
  "兰州",
  "丽江",
  "陵水",
  "临安",
  "临沂",
  "柳州",
  "洛阳",
  "南充",
  "南京",
  "南通",
  "宁波",
  "青岛",
  "秦皇岛",
  "曲阜",
  "日照",
  "如皋",
  "三亚",
  "上海",
  "绍兴",
  "神木",
  "沈阳",
  "深圳",
  "石家庄",
  "十堰",
  "顺德",
  "苏州",
  "宿州",
  "太原",
  "天津",
  "乌鲁木齐",
  "万宁",
  "威海",
  "文安",
  "无锡",
  "武汉",
  "西安",
  "厦门",
  "盐城",
  "扬州",
  "烟台",
  "银川",
  "宜兴",
  "郑州",
  "镇江",
  "张家口",
  "珠海",
  "株洲"
].sort((left, right) => right.length - left.length);

const hyattHotelOverrides: Record<string, string> = {
  "AOLUGUYA": "哈尔滨敖麓谷雅酒店",
  "BEI Zhaolong Hotel": "北京兆龙饭店",
  "Commune By The Great Wall": "长城脚下的公社",
  "Grand WUJI Hotel": "南京五季凯悦悠选酒店",
  "Hyatt on the Bund, Shanghai": "上海外滩茂悦大酒店",
  "Jinmao Purelax Lijiang": "丽江金茂璞修雪山酒店",
  "Kapok Rizhao": "日照海曲木棉花酒店",
  "Kapok Shenzhen Luohu": "深圳罗湖木棉花酒店",
  "Mumian Beijing Daxing International Airport": "北京大兴国际机场木棉花酒店",
  "Mumian Chengdu": "成都木棉花酒店",
  "Mumian Chengdu Dong'an Lake Resort": "成都东安湖木棉花度假酒店",
  "Mumian Hangzhou": "杭州木棉花酒店",
  "Mumian Shanghai Expo": "上海世博木棉花酒店",
  "Mumian Shaoxing": "绍兴木棉花酒店",
  "Taoxichuan Hotel": "景德镇陶溪川酒店",
  "The Langbo Chengdu": "成都阆泊酒店",
  "The Lixury Hotel": "汕尾理想华美达酒店",
  "The Lost Stone Villas & Spa": "腾冲石头纪温泉度假酒店",
  "The Perennial Tianjin": "天津鹏邸凯悦悠选酒店",
  "Thompson Shanghai Expo": "上海世博Thompson酒店",
  "Yada Xishan Hotel Yixing": "宜兴雅达溪山酒店"
};

const exactRoomNameOverrides: Record<string, string> = {
  QuchanInner: "内景客房",
  "1 King Grand Tang Vw Rm": "大唐景观特大床客房",
  "Penthouse Retreat": "顶层逸居套房",
  "Penthouse Garden": "顶层花园套房"
};

const hyattBrandPhrases: Record<string, string> = {
  "alila-hotels-and-resorts": "Alila",
  andaz: "Andaz",
  "caption-by-hyatt": "Caption by Hyatt",
  "grand-hyatt": "Grand Hyatt",
  hotel: "Hotel",
  "hyatt-centric": "Hyatt Centric",
  "hyatt-house": "Hyatt House",
  "hyatt-place": "Hyatt Place",
  "hyatt-regency": "Hyatt Regency",
  "jdv-by-hyatt": "JdV",
  "park-hyatt": "Park Hyatt",
  "thompson-hotels": "Thompson",
  "unbound-collection": "Collection"
};

const translationReplacements: Array<[RegExp, string]> = [
  [/Dong'an Lake/gi, "东安湖"],
  [/Daxing International Airport/gi, "大兴国际机场"],
  [/Hongqiao CBD/gi, "虹桥CBD"],
  [/New Hongqiao/gi, "新虹桥"],
  [/Tianshan Plaza/gi, "天山广场"],
  [/Zhongshan Park/gi, "中山公园"],
  [/People's Square/gi, "人民广场"],
  [/South Railway Station/gi, "南站"],
  [/Train Station/gi, "火车站"],
  [/International Airport/gi, "国际机场"],
  [/Airport/gi, "机场"],
  [/Development Zone/gi, "开发区"],
  [/Global Harbor/gi, "环球港"],
  [/Wujiaochang/gi, "五角场"],
  [/Xintiandi/gi, "新天地"],
  [/Wangjing/gi, "望京"],
  [/Shiyuan/gi, "世园"],
  [/Daxing/gi, "大兴"],
  [/Bio\s*-\s*Town/gi, "生物城"],
  [/Pebble Walk/gi, "鹏瑞利"],
  [/Yuecaicheng/gi, "悦彩城"],
  [/Longcheng/gi, "龙城"],
  [/Dongmen/gi, "东门"],
  [/Jingyue/gi, "净月"],
  [/Gaoping/gi, "高坪"],
  [/Gaoxin/gi, "高新"],
  [/Xuanwu/gi, "玄武"],
  [/Keqiao/gi, "柯桥"],
  [/Jinshi/gi, "金石"],
  [/Lishui/gi, "里水"],
  [/Hengqin/gi, "横琴"],
  [/Hengjiangwan/gi, "横江湾"],
  [/Hangzhou Bay/gi, "杭州湾"],
  [/Tianli Bay/gi, "天丽湾"],
  [/Sunny Bay/gi, "太阳湾"],
  [/Haitang Bay/gi, "海棠湾"],
  [/Ocean Paradise/gi, "海洋欢乐世界"],
  [/Cangshan/gi, "仓山"],
  [/Zengcheng/gi, "增城"],
  [/Yantian/gi, "盐田"],
  [/Chanba/gi, "浐灞"],
  [/Wuyuanwan/gi, "五缘湾"],
  [/Optics Valley/gi, "光谷"],
  [/Dong'ao Island/gi, "东澳岛"],
  [/Hexi/gi, "河西"],
  [/Shenzhou Peninsula/gi, "神州半岛"],
  [/Shenzhen Bay/gi, "深圳湾"],
  [/Lakeside/gi, "湖畔"],
  [/Ocean Front/gi, "海滨"],
  [/Expo/gi, "世博"],
  [/Luohu/gi, "罗湖"],
  [/Huangshan/gi, "黄山"],
  [/Taoxichuan/gi, "陶溪川"],
  [/Jingdezhen/gi, "景德镇"],
  [/Xinghu City Plaza/gi, "星湖城市广场"],
  [/Songjiang/gi, "松江"],
  [/Jiading/gi, "嘉定"],
  [/Chongming/gi, "崇明"],
  [/Kuncheng Lake/gi, "昆承湖"],
  [/Metropolitan/gi, "大都会"],
  [/Zhuhai/gi, "珠海"],
  [/Shanghai/gi, "上海"],
  [/Beijing/gi, "北京"],
  [/Chengdu/gi, "成都"],
  [/Shenzhen/gi, "深圳"],
  [/Hangzhou/gi, "杭州"],
  [/Xiamen/gi, "厦门"],
  [/Guangzhou/gi, "广州"],
  [/Changsha/gi, "长沙"],
  [/Dalian/gi, "大连"],
  [/Kunming/gi, "昆明"],
  [/Shenyang/gi, "沈阳"],
  [/Xi['’]?an/gi, "西安"],
  [/Nanjing/gi, "南京"],
  [/Ningbo/gi, "宁波"],
  [/Sanya/gi, "三亚"],
  [/Suzhou/gi, "苏州"],
  [/Wuhan/gi, "武汉"],
  [/Tianjin/gi, "天津"],
  [/Lanzhou/gi, "兰州"],
  [/Guiyang/gi, "贵阳"],
  [/Fuzhou/gi, "福州"],
  [/Changchun/gi, "长春"],
  [/Changbaishan/gi, "长白山"],
  [/Dongguan/gi, "东莞"],
  [/Qingdao/gi, "青岛"],
  [/Zhuzhou/gi, "株洲"],
  [/Harbin/gi, "哈尔滨"],
  [/Rizhao/gi, "日照"],
  [/Yixing/gi, "宜兴"],
  [/Lijiang/gi, "丽江"],
  [/Wanning/gi, "万宁"],
  [/Yantai/gi, "烟台"],
  [/Taiyuan/gi, "太原"],
  [/Nantong/gi, "南通"],
  [/Linyi/gi, "临沂"],
  [/Liuzhou/gi, "柳州"],
  [/Nanchong/gi, "南充"],
  [/Foshan/gi, "佛山"],
  [/Yinchuan/gi, "银川"],
  [/Deqing/gi, "德清"],
  [/Kunshan/gi, "昆山"],
  [/Chongli/gi, "崇礼"],
  [/Shikumen/gi, "石库门"],
  [/Skyline/gi, "天际线"],
  [/Grand Tang Vw Rm/gi, "大唐景观客房"],
  [/QuchanInner/gi, "内景客房"],
  [/Penthouse/gi, "顶层"],
  [/Retreat/gi, "逸居"],
  [/Garden/gi, "花园"],
  [/River View/gi, "江景"],
  [/Ocean View/gi, "海景"],
  [/Lake View/gi, "湖景"],
  [/City View/gi, "城景"],
  [/View/gi, "景观"],
  [/Private Garden/gi, "私家庭院"],
  [/Private Pool/gi, "私人泳池"],
  [/Balcony/gi, "阳台"],
  [/Corner/gi, "转角"],
  [/Accessible/gi, "无障碍"],
  [/Studio/gi, "开放式"],
  [/Presidential/gi, "总统"],
  [/Executive/gi, "行政"],
  [/Premium/gi, "尊贵"],
  [/Deluxe/gi, "豪华"],
  [/Pavilion/gi, "阁楼"],
  [/Glass House/gi, "玻璃屋"],
  [/Adults only/gi, "仅限成人"],
  [/Twin Beds/gi, "双床"],
  [/Twin/gi, "双床"],
  [/King Bed/gi, "特大床"],
  [/King/gi, "特大床"],
  [/Queen Bed/gi, "大床"],
  [/Queen/gi, "大床"],
  [/Suite/gi, "套房"],
  [/Room/gi, "客房"],
  [/Resort and Spa/gi, "度假酒店"],
  [/Resort/gi, "度假酒店"],
  [/Spa/gi, "水疗"],
  [/Hotel/gi, "酒店"],
  [/Villas/gi, "别墅"],
  [/Villa/gi, "别墅"]
];

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function writeJson(path: string, value: unknown) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractUrlCode(url: string): string {
  const hotelCode = url.match(/\/hotels\/([^/]+)\//i)?.[1];
  if (hotelCode) return hotelCode.toLowerCase();
  const tail = url.replace(/\/$/, "").split("/").pop();
  return slugify(tail ?? "hotel");
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed: string) {
  let state = hashString(seed) || 1;

  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let result = Math.imul(state ^ (state >>> 15), 1 | state);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function pickOne<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)] ?? items[0];
}

function titleCaseWord(word: string): string {
  if (!word) return word;
  return word[0].toUpperCase() + word.slice(1);
}

function toChineseCity(value: string | undefined): string {
  if (!value) return "待补充";
  return cityMap[value.trim()] ?? value.trim();
}

function extractChineseCityFromName(name: string | undefined): string | undefined {
  if (!name) return undefined;

  for (const city of chineseCityCandidates) {
    if (name.includes(city)) return city;
  }

  return undefined;
}

function inferCityFromName(hotelNameEn: string, brandNameEn: string): string {
  let cleaned = hotelNameEn;
  const brandPatterns = [
    "Canopy by Hilton",
    "DoubleTree by Hilton",
    "Curio Collection by Hilton",
    "Waldorf Astoria",
    "Conrad",
    "Hilton",
    "The Ritz-Carlton",
    "St. Regis",
    "JW Marriott",
    "W Hotels",
    "EDITION",
    "Marriott Hotel",
    "Marriott Hotels & Resorts",
    "Sheraton",
    "Delta Hotels and Resorts",
    "Westin",
    "Le Meridien",
    "Autograph Collection",
    "Tribute"
  ];

  for (const pattern of brandPatterns) {
    cleaned = cleaned.replace(new RegExp(pattern, "ig"), " ");
  }

  cleaned = cleaned
    .replace(new RegExp(brandNameEn, "ig"), " ")
    .replace(/\b(hotel|resort|residence|suites|spa|plaza|centre|center|airport|station|intl|international|convention|conference|beach|bay|lake|river|west|east|north|south)\b/gi, " ")
    .replace(/[,&/-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "待补充";

  const firstWord = cleaned.split(" ")[0] ?? cleaned;
  return titleCaseWord(firstWord);
}

function cleanupTranslatedText(value: string): string {
  return value
    .replace(/[,_]+/g, " ")
    .replace(/\s*-\s*/g, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([）)])/g, "$1")
    .replace(/([(（])\s+/g, "$1")
    .replace(/\bWith\b/gi, "带")
    .replace(/\bOnly\b/gi, "仅限")
    .trim();
}

function translateTextToChinese(value: string): string {
  if (exactRoomNameOverrides[value]) {
    return exactRoomNameOverrides[value];
  }

  let translated = value;

  for (const [pattern, replacement] of translationReplacements) {
    translated = translated.replace(pattern, replacement);
  }

  translated = translated
    .replace(/\b1\s*张?特大床\b/g, "特大床")
    .replace(/\b1\s*张?大床\b/g, "大床")
    .replace(/\b2\s*张?双床\b/g, "双床")
    .replace(/\b2\s*张?单人床\b/g, "双床")
    .replace(/\b1\s+特大床/g, "特大床")
    .replace(/\b1\s+大床/g, "大床")
    .replace(/\b2\s+双床/g, "双床")
    .replace(/\bwith\b/gi, "带")
    .replace(/\b, Deluxe\b/gi, " 豪华")
    .replace(/\b, Premium\b/gi, " 尊贵")
    .replace(/[ ]{2,}/g, " ");

  return cleanupTranslatedText(translated);
}

function suffixForHotelName(hotelNameEn: string): string {
  if (/(resort|villa|spa)/i.test(hotelNameEn)) return "度假酒店";
  return "酒店";
}

function buildHyattHotelName(item: HyattHotel): string {
  const exact = hyattHotelOverrides[item.hotel_name_en];
  if (exact) return exact;

  const cityZh = toChineseCity(item.city || inferCityFromName(item.hotel_name_en, item.brand_name));
  const brandZh = hyattBrandMap[item.brand_name] ?? item.brand_name;
  const brandPhrase = hyattBrandPhrases[item.brand_name] ?? "";
  let descriptor = item.hotel_name_en;

  if (brandPhrase) {
    descriptor = descriptor.replace(new RegExp(brandPhrase, "ig"), " ");
  }

  descriptor = descriptor
    .replace(new RegExp(item.city ?? "", "ig"), " ")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const descriptorZh = translateTextToChinese(descriptor)
    .replace(new RegExp(cityZh, "g"), "")
    .replace(/^[的\s]+|[的\s]+$/g, "");

  const suffix = suffixForHotelName(item.hotel_name_en);

  if (!descriptorZh) {
    return `${cityZh}${brandZh}${suffix}`;
  }

  if (descriptorZh === cityZh) {
    return `${cityZh}${brandZh}${suffix}`;
  }

  return `${cityZh}${descriptorZh}${brandZh}${suffix}`;
}

function categorizeRoomName(roomName: string): string | null {
  const text = roomName.toLowerCase();

  if (
    /(villa|复式|总统|presidential|皇家|royal|特色|specialty|penthouse|residence|别墅|外交官|ambassador|主席)/i.test(
      roomName
    )
  ) {
    return "特色房型";
  }

  if (/(suite|套房)/i.test(roomName)) {
    if (/(presidential|总统|royal|皇家|特色|villa|复式|penthouse)/i.test(roomName)) {
      return "更高套房";
    }

    if (/(executive|行政|grand|premium|deluxe|豪华)/i.test(roomName)) {
      return "更高套房";
    }

    return "小型套房";
  }

  if (
    /(executive|club|premium|deluxe|grand|view|ocean|harbor|harbour|river|lake|corner|terrace|balcony|skyline|panoramic|行政|豪华|尊贵|景观|高楼层|海景|湖景|江景|河景|露台|天际线)/i.test(
      roomName
    )
  ) {
    return "尊贵豪华房";
  }

  if (text.includes("adult")) {
    return null;
  }

  return null;
}

function uniqueRoomOptions(
  hotelId: string,
  rawRooms: { room_name: string; room_bucket: string | null }[]
): RoomOptionSeed[] {
  const seen = new Set<string>();
  const results: RoomOptionSeed[] = [];

  for (const rawRoom of rawRooms) {
    const roomName = rawRoom.room_name.trim();
    if (!roomName) continue;
    const dedupeKey = roomName.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    results.push({
      id: `room-${hotelId}-${String(results.length + 1).padStart(3, "0")}`,
      hotel_id: hotelId,
      room_name: roomName,
      room_bucket: rawRoom.room_bucket
    });
  }

  return results;
}

function buildSummaryText(roomCount: number, groupName: string, city: string): string {
  if (roomCount > 0) {
    return `${city}${groupName}酒店已导入 ${roomCount} 个官方房型，可先用作酒店与房型检索。`;
  }

  return `${city}${groupName}酒店已导入基础资料，房型清单仍在后续补齐。`;
}

function buildEditorialNote(): string {
  return "当前升房统计为占位演示数据，酒店名称与房型名称来自官方页面，后续可直接替换为真实样本。";
}

function buildHotelSeed(hotel: NormalizedHotel, sampleCount: number): HotelSeed {
  return {
    id: hotel.id,
    name: hotel.name,
    group_name: hotel.group_name,
    brand_name: hotel.brand_name,
    city: hotel.city,
    logo_url: null,
    sample_count: sampleCount,
    latest_observed_at: hotel.latest_observed_at,
    source_pool_desc: hotel.source_pool_desc,
    editorial_note: hotel.editorial_note,
    summary_text: buildSummaryText(hotel.rooms.length, hotel.group_name, hotel.city)
  };
}

function bucketRoomNames(
  roomOptions: RoomOptionSeed[]
): Record<(typeof roomBucketColumns)[number], string[]> {
  return {
    尊贵豪华房: roomOptions.filter((room) => room.room_bucket === "尊贵豪华房").map((room) => room.room_name),
    小型套房: roomOptions.filter((room) => room.room_bucket === "小型套房").map((room) => room.room_name),
    更高套房: roomOptions.filter((room) => room.room_bucket === "更高套房").map((room) => room.room_name),
    特色房型: roomOptions.filter((room) => room.room_bucket === "特色房型").map((room) => room.room_name)
  };
}

function fallbackBookedRoom(roomOptions: RoomOptionSeed[]): string {
  return (
    roomOptions.find((room) => room.room_bucket === null)?.room_name ??
    roomOptions[0]?.room_name ??
    "基础房型"
  );
}

function createSyntheticUpgradeData(hotel: NormalizedHotel, roomOptions: RoomOptionSeed[]) {
  const rng = createRng(hotel.id);
  const bucketNames = bucketRoomNames(roomOptions);
  const availableBuckets = roomBucketColumns.filter(
    (bucket) => bucketNames[bucket].length > 0 || roomOptions.length === 0
  );
  const fallbackBuckets = availableBuckets.length > 0 ? availableBuckets : ["尊贵豪华房"];
  const stats: UpgradeStatSeed[] = [];
  const cases: RawUpgradeCaseSeed[] = [];

  const tierProfiles = hotel.tiers.map((tier, index) => ({
    label: tier,
    preferredMaxBucketIndex: Math.min(index, fallbackBuckets.length - 1)
  }));

  tierProfiles.forEach((tierProfile, tierIndex) => {
    const tier = tierProfile.label;
    const tierTotal = Math.max(
      4,
      Math.min(18, Math.round((roomOptions.length || 6) * (0.45 + rng() + tierIndex * 0.08)))
    );
    const maxBucketIndex = Math.max(0, tierProfile.preferredMaxBucketIndex);
    const chosenBuckets = fallbackBuckets.slice(0, maxBucketIndex + 1);
    const weights = chosenBuckets.map((_, bucketIndex) => {
      if (bucketIndex === maxBucketIndex) {
        return 10 + tierIndex * 2;
      }

      if (bucketIndex === maxBucketIndex - 1) {
        return maxBucketIndex === 0 ? 0 : 3 + tierIndex;
      }

      return tierIndex === 0 ? 0 : 1;
    });
    const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
    let allocated = 0;

    chosenBuckets.forEach((bucket, index) => {
      const weight = weights[index] ?? 1;
      if (weight === 0) return;
      let successCount =
        index === chosenBuckets.length - 1
          ? tierTotal - allocated
          : Math.max(1, Math.round((tierTotal * weight) / weightTotal));

      const remainingSlots = chosenBuckets.length - index - 1;
      const maxAllowed = tierTotal - allocated - remainingSlots;
      successCount = Math.max(1, Math.min(successCount, maxAllowed));
      allocated += successCount;

      stats.push({
        id: `stat-${hotel.id}-tier${String(tierIndex + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`,
        hotel_id: hotel.id,
        member_tier: tier,
        room_bucket: bucket,
        success_count: successCount,
        success_ratio: Number((successCount / tierTotal).toFixed(2)),
        tier_success_total: tierTotal
      });

      const bucketRooms =
        bucketNames[bucket as keyof typeof bucketNames].length > 0
          ? bucketNames[bucket as keyof typeof bucketNames]
          : [bucket];
      const bookedRoom = fallbackBookedRoom(roomOptions);

      for (let indexInBucket = 0; indexInBucket < successCount; indexInBucket += 1) {
        const upgradedRoomRaw = pickOne(bucketRooms, rng);
        const dayOffset = Math.floor(rng() * 45);
        const observedAt = new Date(Date.UTC(2026, 4, 5 - dayOffset));
        cases.push({
          id: `case-${hotel.id}-tier${String(tierIndex + 1).padStart(2, "0")}-${String(cases.length + 1).padStart(4, "0")}`,
          hotel_id: hotel.id,
          observed_at: observedAt.toISOString().slice(0, 10),
          booked_room_raw: bookedRoom,
          upgraded_room_raw: upgradedRoomRaw,
          member_tier: tier,
          stay_context: pickOne(stayContexts, rng)
        });
      }
    });
  });

  return { stats, cases, sampleCount: cases.length };
}

function normalizeHyattHotels(items: HyattHotel[]): NormalizedHotel[] {
  return items.map((item) => {
    const hotelId = `hyatt-${extractUrlCode(item.official_url)}`;
    const rooms = (item.room_names ?? []).map((roomName) => ({
      room_name: translateTextToChinese(roomName),
      room_bucket: categorizeRoomName(roomName)
    }));

    return {
      id: hotelId,
      name: buildHyattHotelName(item),
      group_name: groupNameMap[item.group_name] ?? item.group_name,
      brand_name: hyattBrandMap[item.brand_name] ?? item.brand_name,
      city: toChineseCity(item.city?.trim() || inferCityFromName(item.hotel_name_en, item.brand_name)),
      latest_observed_at: today,
      source_pool_desc: "升房统计为各社交媒体数据汇总",
      editorial_note: buildEditorialNote(),
      rooms,
      tiers: ["凯悦探索者", "凯悦冒险家", "凯悦环球客"]
    };
  });
}

function normalizeHiltonHotels(items: HiltonHotel[]): NormalizedHotel[] {
  return items.map((item) => {
    const hotelId = `hilton-${extractUrlCode(item.official_url_en)}`;
    const rooms = (item.rooms ?? []).map((room) => {
      const rawRoomNameZh = room.room_name_zh?.trim() || "";
      const roomName =
        /[\u4e00-\u9fff]/.test(rawRoomNameZh)
          ? rawRoomNameZh
          : translateTextToChinese(room.room_name_en?.trim() || rawRoomNameZh);
      return {
        room_name: roomName,
        room_bucket: categorizeRoomName(roomName || room.room_name_en || "")
      };
    });

    const fallbackCity = toChineseCity(inferCityFromName(item.hotel_name_en, item.brand_name_en));
    const rawHotelNameZh = item.hotel_name_zh?.trim() || "";
    const hotelNameZh = /[\u4e00-\u9fff]/.test(rawHotelNameZh)
      ? rawHotelNameZh
      : `${fallbackCity}${hiltonBrandMap[item.brand_name_en] ?? item.brand_name_en}酒店`;

    return {
      id: hotelId,
      name: hotelNameZh,
      group_name: groupNameMap[item.group_name] ?? item.group_name,
      brand_name: hiltonBrandMap[item.brand_name_en] ?? item.brand_name_en,
      city:
        extractChineseCityFromName(hotelNameZh) ??
        fallbackCity,
      latest_observed_at: today,
      source_pool_desc: "升房统计为各社交媒体数据汇总",
      editorial_note: buildEditorialNote(),
      rooms,
      tiers: ["希尔顿金卡", "希尔顿钻卡", "希尔顿耀钻"]
    };
  });
}

function normalizeMarriottHotels(items: MarriottHotel[]): NormalizedHotel[] {
  return items.map((item) => {
    const hotelId = `marriott-${extractUrlCode(item.official_url_en)}`;
    const rooms = (item.rooms ?? []).map((room) => {
      const rawRoomNameZh = room.room_name_zh?.trim() || "";
      const roomName =
        /[\u4e00-\u9fff]/.test(rawRoomNameZh)
          ? rawRoomNameZh
          : translateTextToChinese(room.room_name_en?.trim() || rawRoomNameZh);
      return {
        room_name: roomName,
        room_bucket: categorizeRoomName(roomName || room.room_name_en || "")
      };
    });

    const hotelNameZh = item.hotel_name_zh?.trim() || translateTextToChinese(item.hotel_name_en);

    return {
      id: hotelId,
      name: hotelNameZh,
      group_name: groupNameMap[item.group_name] ?? item.group_name,
      brand_name: marriottBrandMap[item.brand_name_en] ?? item.brand_name_en,
      city:
        extractChineseCityFromName(hotelNameZh) ??
        toChineseCity(inferCityFromName(item.hotel_name_en, item.brand_name_en)),
      latest_observed_at: today,
      source_pool_desc: "升房统计为各社交媒体数据汇总",
      editorial_note: buildEditorialNote(),
      rooms,
      tiers: ["万豪金卡", "万豪白金卡", "万豪钛金卡", "万豪大使"]
    };
  });
}

function main() {
  mkdirSync(seedsDir, { recursive: true });

  const hyattHotels = normalizeHyattHotels(
    readJson<HyattHotel[]>(join(scrapeDir, "hyatt_hotels_with_rooms.json"))
  );
  const hiltonHotels = normalizeHiltonHotels(
    readJson<HiltonHotel[]>(join(scrapeDir, "hilton_details_progress.json"))
  );
  const marriottHotels = normalizeMarriottHotels(
    readJson<MarriottHotel[]>(join(scrapeDir, "marriott_details_progress.json"))
  );

  const normalizedHotels = [...marriottHotels, ...hiltonHotels, ...hyattHotels].sort((left, right) =>
    left.name.localeCompare(right.name, "zh-Hans-CN")
  );

  const hotelsSeed: HotelSeed[] = [];
  const roomOptionsSeed: RoomOptionSeed[] = [];
  const upgradeStatsSeed: UpgradeStatSeed[] = [];
  const rawCasesSeed: RawUpgradeCaseSeed[] = [];

  for (const hotel of normalizedHotels) {
    const roomOptions = uniqueRoomOptions(hotel.id, hotel.rooms);
    const synthetic = createSyntheticUpgradeData(hotel, roomOptions);
    hotelsSeed.push(buildHotelSeed(hotel, synthetic.sampleCount));
    roomOptionsSeed.push(...roomOptions);
    upgradeStatsSeed.push(...synthetic.stats);
    rawCasesSeed.push(...synthetic.cases);
  }

  writeJson(join(seedsDir, "hotels.seed.json"), hotelsSeed);
  writeJson(join(seedsDir, "room-options.seed.json"), roomOptionsSeed);
  writeJson(join(seedsDir, "upgrade-stats.seed.json"), upgradeStatsSeed);
  writeJson(join(seedsDir, "raw-upgrade-cases.seed.json"), rawCasesSeed);

  console.log(
    JSON.stringify(
      {
        hotels: hotelsSeed.length,
        room_options: roomOptionsSeed.length,
        upgrade_stats: upgradeStatsSeed.length,
        raw_upgrade_cases: rawCasesSeed.length
      },
      null,
      2
    )
  );
}

main();
