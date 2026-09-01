import type { TripDay } from "./product";

export type PackLevel = "required" | "recommended" | "optional";
export type DayVisual = {
  hero: string;
  secondary: string;
  outfit: string;
  outfitSecondary?: string;
  outfitAlt?: string;
  outfitPosition?: string;
  altitude: string;
  outfitCopy: string;
  outfitNote: string;
  outfitSecondaryCopy: string;
  reminders: readonly string[];
  dayBag: readonly (readonly [string, string, PackLevel])[];
};

const common = [
  ["id", "身份证", "required"],
  ["phone", "手机", "required"],
  ["power", "充电宝与充电线", "required"],
  ["water", "水", "required"],
] as const;

export const dayVisuals: Record<number, DayVisual> = {
  1: {
    hero: "/editorial/urumqi-nature-02.jpg",
    secondary: "/editorial/urumqi-nature-01.jpg",
    outfit: "https://cdn.hstatic.net/200000503583/file/di-le-giang-mac-gi-cardina-9.jpg_3af0788496e948048f4d4e30fd08109f.jpg",
    outfitAlt: "年轻女生山野旅行叠穿，橄榄色长外套、白色针织与宽松牛仔长裤，搭配红色小围巾",
    outfitPosition: "center center",
    altitude: "约 800 m",
    outfitCopy: "长外套 + 薄针织 + 宽松牛仔裤 + 小围巾",
    outfitNote: "抵达时间不确定，外层方便应对机场、室内和夜间温差。",
    outfitSecondaryCopy: "",
    reminders: ["确认住宿地址与入住时间", "确认 Day 02 集合时间与地点", "手机、充电宝与相机睡前充满"],
    dayBag: [
      ...common,
      ["booking", "住宿与集合信息截图", "required"],
      ["sun", "防晒 / 墨镜", "recommended"],
    ],
  },
  2: {
    hero: "/editorial/day02-hero.jpg",
    secondary: "/editorial/day02-secondary.jpg",
    outfit: "https://megapx-assets.dcard.tw/images/a2986f4a-a7bf-459c-9710-c8e2a0f0392c/1280.jpeg",
    outfitAlt: "年轻女生山间旅行穿搭，米白针织叠牛仔衬衫、浅色宽松工装裤和帽子",
    outfitPosition: "center center",
    altitude: "约 700—1,100 m",
    outfitCopy: "针织上衣 + 衬衫叠穿 + 宽松工装长裤",
    outfitNote: "约 8 小时坐车，下装不要勒腰；停车时再加防风层。",
    outfitSecondaryCopy: "",
    reminders: ["早餐后先处理洗手间并装满水", "晕车药提前服用，车上少低头", "停车只服从司机与道路安全安排"],
    dayBag: [
      ...common,
      ["snack", "少量零食", "recommended"],
      ["tissue", "纸巾 / 湿巾", "recommended"],
      ["motion", "晕车药", "recommended"],
      ["sun", "防晒 / 墨镜", "required"],
    ],
  },
  3: {
    hero: "/editorial/day03-hero.jpg",
    secondary: "/editorial/day03-secondary.jpg",
    outfit: "https://ak-d.tripcdn.com/images/1mi2z12000nqrf7pk03CA.webp?proc=source%2Ftrip",
    outfitAlt: "年轻女生草原旅行叠穿，橙色保暖外层、米色针织、酒红围巾和宽松橄榄长裤",
    outfitPosition: "center center",
    altitude: "禾木约 1,200 m",
    outfitCopy: "保暖外层 + 针织 + 长围巾 + 宽松长裤",
    outfitNote: "早上穿完整，中午热时脱外层；进入禾木前把外套留在身边。",
    outfitSecondaryCopy: "",
    reminders: ["出发前确认阿禾公路开放状态", "保暖外层、常用药与充电宝留在随身包", "进入禾木前拿出今晚和明早用品"],
    dayBag: [
      ...common,
      ["warm", "薄抓绒 / 针织中层 + 防风外层", "required"],
      ["tissue", "纸巾 / 湿巾", "recommended"],
      ["meds", "晕车药 / 肠胃药 / 个人常用药", "recommended"],
      ["camera", "相机 / 备用电池", "optional"],
      ["sun", "墨镜 / 防晒", "recommended"],
      ["snack", "少量方便吃的零食", "recommended"],
    ],
  },
  4: {
    hero: "/editorial/day04-hero.jpg",
    secondary: "/editorial/day04-secondary.jpg",
    outfit: "https://cds.chinadaily.com.cn/dams/capital/image/202110/13/61669f50e4b0f33f152b5287.jpg",
    outfitAlt: "年轻女生山野叠穿，白色粗针织外层叠牛仔夹克与白色长袖，下搭黑色长裤",
    outfitPosition: "center center",
    altitude: "约 1,300—2,000 m",
    outfitCopy: "粗针织 + 牛仔夹克 + 长袖 + 黑色长裤",
    outfitNote: "湖边和白哈巴风更明显；观鱼台台阶多，鞋底防滑优先。",
    outfitSecondaryCopy: "",
    reminders: ["身份证全程随身", "确认观鱼台预约、限流与区间车顺序", "湖边和白哈巴降温时及时加防风层"],
    dayBag: [
      ...common,
      ["warm", "薄抓绒 / 针织中层", "required"],
      ["shell", "防风外套 / 冲锋衣", "required"],
      ["booking", "观鱼台预约信息", "recommended"],
      ["tissue", "纸巾 / 湿巾", "recommended"],
    ],
  },
  5: {
    hero: "/editorial/day05-hero.jpg",
    secondary: "/editorial/day05-secondary.jpg",
    outfit: "https://ak-d.tripcdn.com/images/1mi62224x90pa8tgb765F.jpg?proc=source%2Ftrip",
    outfitAlt: "年轻女生秋季山谷穿搭，白色抓绒外套、米色帽子与焦糖色长下装",
    outfitPosition: "center center",
    altitude: "约 1,300 m",
    outfitCopy: "白色抓绒 + 毛线帽 + 长下装",
    outfitNote: "晨间可能更冷，离开景区后是约 7 小时车程。",
    outfitSecondaryCopy: "",
    reminders: ["晨间出门前补齐保暖层", "离开景区前处理洗手间、水和零食", "长车程前确认充电宝电量"],
    dayBag: [
      ...common,
      ["warm", "保暖中层 / 防风外层", "required"],
      ["snack", "少量零食", "recommended"],
      ["tissue", "纸巾 / 湿巾", "recommended"],
      ["motion", "晕车药", "recommended"],
    ],
  },
  6: {
    hero: "/editorial/day06-hero.jpg",
    secondary: "/editorial/day06-secondary.jpg",
    outfit: "https://res.klook.com/images/fl_lossy.progressive%2Cq_65/c_crop%2Cx_0%2Cy_708%2Ch_708%2Cw_1000/activities/g4og343olbwyuldvyice/FotografiSpektakulerXinjiang%7CWisataFotografiMusimGugurTerbaikXinjiangUtara8Hari%28GrupKecilEksklusif2-6Orang%C2%B7Kanas%C2%B7Hemu%C2%B7DanauSayram%29.jpg",
    outfitAlt: "北疆秋季旅行穿搭，蓝色图案针织、姜黄色长裙和贝雷帽，色彩与秋景形成层次",
    outfitPosition: "center center",
    altitude: "约 300—500 m",
    outfitCopy: "图案针织 + 长裙 + 贝雷帽",
    outfitNote: "魔鬼城风、晒和干燥明显；裙装当天务必叠打底并备防风外层。",
    outfitSecondaryCopy: "",
    reminders: ["确认胡杨林当天是否进入行程", "魔鬼城补防晒并固定帽子、围巾", "返程前补水、洗手间与充电"],
    dayBag: [
      ...common,
      ["sun", "防晒 / 墨镜 / 帽子", "required"],
      ["shell", "轻量防风外层", "recommended"],
      ["lip", "润唇膏", "recommended"],
      ["tissue", "纸巾 / 湿巾", "recommended"],
    ],
  },
  7: {
    hero: "/editorial/urumqi-nature-04.jpg",
    secondary: "/editorial/urumqi-nature-03.jpg",
    outfit: "https://cdn02.pinkoi.com/wp-content/uploads/sites/7/2023/11/11014759/image2.webp",
    outfitAlt: "年轻女生日常秋季叠穿，浅色针织背心、白色长袖衬衫和粉色毛线帽",
    outfitPosition: "center center",
    altitude: "约 800 m",
    outfitCopy: "针织背心 + 长袖衬衫 + 毛线帽",
    outfitNote: "返程以舒适为主，仍保留一层轻外套应对室内外温差。",
    outfitSecondaryCopy: "",
    reminders: ["核对返程交通时间并预留缓冲", "检查证件、充电线、药品与房间遗留物", "确认托运行李中没有充电宝"],
    dayBag: [
      ...common,
      ["ticket", "返程交通信息", "required"],
      ["meds", "个人常用药", "recommended"],
    ],
  },
};
export function visualFor(day: TripDay): DayVisual {
  return dayVisuals[day.day];
}
