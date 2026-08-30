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
    outfit: "/editorial/outfit-urumqi-autumn.jpg",
    outfitAlt: "乌鲁木齐秋色中的旅行侧背影，浅色外套搭配长裙与黑色贝雷帽",
    outfitPosition: "center 58%",
    altitude: "约 800 m",
    outfitCopy: "长袖 + 轻外套 + 走熟的鞋",
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
    outfit: "/media/style/s-21.webp",
    outfitSecondary: "/media/style/s-20.webp",
    altitude: "约 700—1,100 m",
    outfitCopy: "长袖衬衫 + 宽松长裤 + 防晒配件",
    outfitNote: "约 8 小时坐车，下装不要勒腰；停车时再加防风层。",
    outfitSecondaryCopy: "宽松长下装 + 防风外层；车内方便穿脱",
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
    outfit:
      "https://images.pexels.com/photos/31613705/pexels-photo-31613705.jpeg?auto=compress&cs=tinysrgb&w=1200",
    outfitSecondary: "https://images.pexels.com/photos/16236785/pexels-photo-16236785.jpeg?auto=compress&cs=tinysrgb&w=1200",
    altitude: "禾木约 1,200 m",
    outfitCopy: "防风外套 + 薄针织 + 宽松长下装",
    outfitNote: "早上穿完整，中午热时脱外层；进入禾木前把外套留在身边。",
    outfitSecondaryCopy: "轻层次；外层方便穿脱",
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
    outfit: "/editorial/outfit-baihaba-autumn.jpg",
    outfitAlt: "白哈巴金色山谷前的旅行背影，深色保暖外套与宽松浅色长裤",
    outfitPosition: "78% center",
    altitude: "约 1,300—2,000 m",
    outfitCopy: "防风外层 + 针织中层 + 舒服长下装",
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
    outfit: "/media/style/s-21.webp",
    outfitSecondary: "/media/style/s-20.webp",
    altitude: "约 1,300 m",
    outfitCopy: "针织中层 + 防风外层 + 好走的鞋",
    outfitNote: "晨间可能更冷，离开景区后是约 7 小时车程。",
    outfitSecondaryCopy: "柔软中层 + 防风轮廓；长车程不勒腿",
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
    outfit: "/media/style/s-13.webp",
    outfitSecondary: "/media/style/s-11.webp",
    altitude: "约 300—500 m",
    outfitCopy: "长袖 + 防风外层 + 宽松长裤",
    outfitNote: "魔鬼城风、晒和干燥明显；帽子与围巾要能固定。",
    outfitSecondaryCopy: "围巾固定好；用宽松廓形应对风和晒",
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
    outfit: "/media/style/s-21.webp",
    outfitSecondary: "/media/style/s-19.webp",
    altitude: "约 800 m",
    outfitCopy: "舒适长袖 + 轻外套 + 好走的鞋",
    outfitNote: "以长时间交通和室内外温差为准。",
    outfitSecondaryCopy: "轻外套 + 宽松下装；返程仍保留一层",
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
