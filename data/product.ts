export type Freshness = "stable" | "before" | "today";
export type PrepWindow = "available" | "not-open" | "48h" | "day-before" | "today";
export type StageKind = "depart" | "travel" | "place" | "arrival" | "evening" | "prepare";

export type Place = {
  id: string;
  name: string;
  en?: string;
  lat: number;
  lng: number;
  day: number[];
  context: string;
  confirmationId?: string;
};

export type Stage = {
  id: string;
  kind: StageKind;
  title: string;
  meta?: string;
  placeId?: string;
  facts?: string[];
  taskIds?: string[];
  packLayer?: "day";
  optional?: boolean;
};

export type TripDay = {
  day: number;
  date: string;
  iso: string;
  route: string[];
  drive?: string;
  distance?: string;
  sleep: string;
  effort: "轻松" | "中等" | "偏累";
  hero: string;
  summary?: string;
  placeIds: string[];
  stages: Stage[];
};

export type Preparation = {
  id: string;
  title: string;
  freshness: Freshness;
  window: PrepWindow;
  day?: number;
  placeId?: string;
  priority: "critical" | "normal";
  openDaysBefore?: number;
  sourceLabel?: string;
};

export const tripStart = "2026-09-12T00:00:00+08:00";

export const places: Place[] = [
  { id: "urumqi", name: "乌鲁木齐", en: "URUMQI", lat: 43.8256, lng: 87.6168, day: [1, 2, 7], context: "抵达、集合与返程城市。" },
  { id: "s21", name: "S21 沙漠高速", en: "S21", lat: 45.28, lng: 87.95, day: [2], context: "长途路段。服务区与安全停车点以当天安排为准。" },
  { id: "klameli", name: "克拉美丽沙漠", lat: 46.18, lng: 88.2, day: [2], context: "沙漠地貌路段，停留位置服从团队与道路管理。" },
  { id: "altay", name: "阿勒泰", en: "ALTAY", lat: 47.8484, lng: 88.1336, day: [2, 3], context: "Day 02 住宿地，也是 Day 03 出发点。" },
  { id: "ahe", name: "阿禾公路", en: "AHE ROAD", lat: 48.13, lng: 87.73, day: [3], context: "Day 03 的景观路段；坐标仅表示路线中段，不代表固定停车点。", confirmationId: "ahe-road" },
  { id: "hemu", name: "禾木", en: "HEMU", lat: 48.579, lng: 87.438, day: [3, 4], context: "木屋住宿。进入前把今晚与明早要用的衣物、洗漱、充电和药品留在身边。", confirmationId: "hemu-activity" },
  { id: "kanas", name: "喀纳斯", en: "KANAS", lat: 48.702, lng: 87.045, day: [4, 5], context: "湖区与区间车换乘；具体顺序和排队当天确认。", confirmationId: "guanyutai" },
  { id: "baihaba", name: "白哈巴", en: "BAIHABA", lat: 48.68, lng: 86.78, day: [4, 5], context: "边境区域，身份证随身，只走开放路线。" },
  { id: "urho", name: "乌尔禾", en: "URHO", lat: 46.09, lng: 85.69, day: [5, 6], context: "Day 05 长途后的住宿地。" },
  { id: "devil", name: "世界魔鬼城", lat: 46.12, lng: 85.72, day: [6], context: "雅丹地貌。风、晒与限制区域是主要注意事项。" },
  { id: "poplar", name: "白杨河胡杨林", lat: 45.88, lng: 85.49, day: [6], context: "按已提供行程信息，观赏期约 9/10—10/4；实际安排当天确认。" },
];

export const preparations: Preparation[] = [
  { id: "museum", title: "新疆博物馆开放与预约", freshness: "before", window: "available", day: 1, placeId: "urumqi", priority: "normal", sourceLabel: "出发前查看官方预约渠道" },
  { id: "flight-48h", title: "检查往返交通状态", freshness: "before", window: "48h", priority: "normal", sourceLabel: "承运方官方渠道" },
  { id: "ahe-road", title: "阿禾公路开放状态", freshness: "today", window: "today", day: 3, placeId: "ahe", priority: "critical", sourceLabel: "司机、团队或当地官方通知" },
  { id: "day3-weather", title: "Day 03 天气与降温", freshness: "today", window: "today", day: 3, priority: "critical", sourceLabel: "实时天气" },
  { id: "hemu-activity", title: "禾木活动是否开放", freshness: "today", window: "today", day: 3, placeId: "hemu", priority: "normal", sourceLabel: "团队或景区当天通知" },
  { id: "guanyutai", title: "观鱼台预约与限流", freshness: "before", window: "available", day: 4, placeId: "kanas", priority: "critical", sourceLabel: "景区官方渠道" },
  { id: "kanas-shuttle", title: "喀纳斯区间车与游览顺序", freshness: "today", window: "today", day: 4, placeId: "kanas", priority: "normal", sourceLabel: "景区现场信息" },
  { id: "poplar-status", title: "胡杨林实际安排与开放", freshness: "today", window: "today", day: 6, placeId: "poplar", priority: "normal", sourceLabel: "团队当天安排" },
];

export const days: TripDay[] = [
  { day: 1, date: "09.12", iso: "2026-09-12", route: ["乌鲁木齐"], sleep: "乌鲁木齐", effort: "轻松", hero: "urumqi-city-01", summary: "抵达与自由活动。晚到时只处理吃饭、休息和第二天集合。", placeIds: ["urumqi"], stages: [
    { id: "d1-arrive", kind: "arrival", title: "抵达乌鲁木齐", facts: ["先确认住宿与第二天集合信息。", "晚到不需要临时增加景点。"] },
    { id: "d1-free", kind: "place", title: "自由活动", meta: "OPTIONAL", facts: ["博物馆需要预约并确认开放日期。", "红山公园和大巴扎按抵达时间、体力选择。"], taskIds: ["museum"], optional: true },
    { id: "d1-night", kind: "prepare", title: "睡前", facts: ["手机与充电宝充电。", "确认 Day 02 集合时间。"] },
  ]},
  { day: 2, date: "09.13", iso: "2026-09-13", route: ["乌鲁木齐", "S21", "克拉美丽沙漠", "阿勒泰"], drive: "约 8 小时", distance: "约 500 km", sleep: "阿勒泰", effort: "偏累", hero: "s21-highway-01", summary: "全天长途。服务区午餐和停车节奏以团队安排为准。", placeIds: ["urumqi", "s21", "klameli", "altay"], stages: [
    { id: "d2-before", kind: "depart", title: "出发前", facts: ["早餐、洗手间、水、零食、纸巾、充电宝。", "容易晕车时减少长时间低头。"], packLayer: "day" },
    { id: "d2-road", kind: "travel", title: "S21 与克拉美丽沙漠", meta: "约 8 小时车程", placeId: "s21", facts: ["只在允许停车的安全区域下车。", "将军山活动以当天天气和安排为准。"] },
    { id: "d2-night", kind: "prepare", title: "抵达阿勒泰后", facts: ["检查 Day 03 当天随身物品。", "保暖外层不要塞进第二天不便取用的大件行李。"] },
  ]},
  { day: 3, date: "09.14", iso: "2026-09-14", route: ["阿勒泰", "阿禾公路", "禾木"], drive: "约 5 小时", distance: "约 220 km", sleep: "禾木", effort: "中等", hero: "ahe-road-01", summary: "路线可能因道路或天气调整。", placeIds: ["altay", "ahe", "hemu"], stages: [
    { id: "d3-before", kind: "depart", title: "离开阿勒泰前", meta: "08:00 左右", facts: ["早餐、洗手间、水、充电。", "确认阿禾公路开放状态；关闭时可能改走国道。"], taskIds: ["ahe-road", "day3-weather"], packLayer: "day" },
    { id: "d3-ahe", kind: "travel", title: "阿禾公路", meta: "原野 → 森林 → 草原 → 山地", placeId: "ahe", facts: ["乌希里克原野、通巴原始森林、托勒海特草原位于沿途景观序列。", "约 5 小时车程，下车与停留点服从道路和团队安排。"] },
    { id: "d3-approach", kind: "prepare", title: "进入禾木前", meta: "重要", facts: ["大件行李可能暂时不方便拿取。", "提前拿出今晚与明早的衣物、洗漱用品、充电和常用药。"] },
    { id: "d3-arrive", kind: "arrival", title: "抵达禾木", placeId: "hemu", facts: ["先吃饭、入住、整理随身物品。", "旅拍、小鹿、民俗馆和篝火按实际开放与体力选择。"], taskIds: ["hemu-activity"] },
    { id: "d3-evening", kind: "evening", title: "晚上", facts: ["温度下降后把外层穿回。", "给设备充电，准备明早衣物。"] },
  ]},
  { day: 4, date: "09.15", iso: "2026-09-15", route: ["禾木", "喀纳斯", "白哈巴"], drive: "约 3 小时", distance: "约 100 km", sleep: "白哈巴", effort: "偏累", hero: "kanas-lake-01", summary: "喀纳斯游览与区间车顺序可能调整。", placeIds: ["hemu", "kanas", "baihaba"], stages: [
    { id: "d4-morning", kind: "place", title: "禾木晨间", placeId: "hemu", facts: ["禾木桥与白桦林按出发时间选择。"] },
    { id: "d4-kanas", kind: "place", title: "喀纳斯", placeId: "kanas", facts: ["湖边步行、游船、观鱼台不需要全部完成。", "游船自费；观鱼台约 1068 级台阶并可能限流。"], taskIds: ["guanyutai", "kanas-shuttle"] },
    { id: "d4-baihaba", kind: "arrival", title: "白哈巴", placeId: "baihaba", facts: ["身份证随身。", "遵守边境区域和景区开放路线管理。"] },
  ]},
  { day: 5, date: "09.16", iso: "2026-09-16", route: ["白哈巴", "喀纳斯三湾", "乌尔禾"], drive: "约 7 小时", distance: "约 400 km", sleep: "乌尔禾", effort: "偏累", hero: "fairy-bay-01", summary: "三湾顺序可能根据当天安排调整。", placeIds: ["baihaba", "kanas", "urho"], stages: [
    { id: "d5-bays", kind: "place", title: "神仙湾、月亮湾、卧龙湾", placeId: "kanas", facts: ["晨雾、区间车和体力会影响停留。", "时间不足时允许取舍。"] },
    { id: "d5-road", kind: "travel", title: "前往乌尔禾", meta: "约 7 小时车程", facts: ["离开景区前处理洗手间、水、零食与充电。"] },
  ]},
  { day: 6, date: "09.17", iso: "2026-09-17", route: ["乌尔禾", "魔鬼城", "白杨河胡杨林", "乌鲁木齐"], drive: "约 6.5 小时", distance: "约 500 km", sleep: "乌鲁木齐", effort: "偏累", hero: "devil-yardang-01", summary: "胡杨林是否进入当天行程，以实际安排为准。", placeIds: ["urho", "devil", "poplar", "urumqi"], stages: [
    { id: "d6-devil", kind: "place", title: "世界魔鬼城", placeId: "devil", facts: ["补水、防晒，帽子和围巾固定好。", "不要离开规定游览路线。"] },
    { id: "d6-poplar", kind: "place", title: "白杨河胡杨林", placeId: "poplar", facts: ["参考观赏期约 9/10—10/4。", "当天是否安排需要确认。"], taskIds: ["poplar-status"], optional: true },
    { id: "d6-return", kind: "travel", title: "返回乌鲁木齐", meta: "长车程", facts: ["返程前补水、洗手间与充电。"] },
  ]},
  { day: 7, date: "09.18", iso: "2026-09-18", route: ["乌鲁木齐", "返程"], sleep: "—", effort: "轻松", hero: "urumqi-window-01", summary: "返程与最终行李检查。", placeIds: ["urumqi"], stages: [
    { id: "d7-before", kind: "depart", title: "离开住宿前", facts: ["证件、充电线、药品和遗留物检查。", "为交通预留缓冲时间。"] },
  ]},
];

export const packLayers = {
  trip: [
    ["id", "身份证", "required"], ["warm", "厚保暖层", "required"], ["shell", "防风防雨外层", "required"], ["shoes", "走熟的防滑鞋", "required"],
    ["phone-cable", "手机充电线", "required"], ["power", "充电宝", "required"], ["meds", "常用药", "required"], ["lip", "润唇与保湿", "recommended"],
    ["sun", "防晒", "recommended"], ["camera", "相机与电池", "optional"], ["mosquito", "驱蚊", "recommended"], ["offline", "离线地图与内容", "recommended"],
  ],
  day: [
    ["day-id", "身份证", "required"], ["day-phone", "手机", "required"], ["day-power", "充电宝与充电线", "required"], ["day-water", "水", "required"],
    ["day-warm", "薄抓绒 / 针织中层 + 防风外层", "required"], ["day-tissue", "纸巾 / 湿巾", "recommended"], ["day-meds", "晕车药 / 肠胃药 / 个人常用药", "recommended"],
    ["day-camera", "相机 / 备用电池", "optional"], ["day-sun", "墨镜 / 防晒", "recommended"], ["day-snack", "少量方便吃的零食", "recommended"],
  ],
} as const;

export const styleReferences = [
  { media: "style-forest-01", formula: "防风外套 + 针织 + 宽松长下装", use: "早晚温度较低；中午脱掉外层后仍然完整。", comfort: "约 5 小时坐车，腰腹不要过紧。" },
  { media: "style-forest-03", formula: "短外层 + 轻薄长层 + 裙叠裤", use: "层次明显，但单层都轻，升温后可以逐层脱。", comfort: "鞋底防滑；湿草地优先雨靴或防滑靴。" },
  { media: "style-village-03", formula: "宽大外套 + 软针织 + 长围巾", use: "风起时把外层和围巾加回，围巾需要固定。", comfort: "保暖层进入禾木前就留在身边。" },
];

export const photoReferences = [
  { media: "photo-person-02" },
  { media: "ahe-forest-01", annotation: "隔玻璃" },
  { media: "photo-person-01", annotation: "环境保留" },
  { media: "hemu-window-01" },
  { media: "hemu-person-01", annotation: "人物靠边" },
  { media: "friend-photo-01" },
];
