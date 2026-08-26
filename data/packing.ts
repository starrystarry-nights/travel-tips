export type PackingItem = { id: string; label: string; note?: string; essential?: boolean };
export type PackingGroup = { id: string; title: string; english: string; items: PackingItem[] };

export const packingGroups: PackingGroup[] = [
  { id: "id", title: "证件", english: "ID", items: [{ id: "id-card", label: "身份证", essential: true }, { id: "booking", label: "票务与预约截图", essential: true }, { id: "insurance", label: "保险与紧急联系人" }] },
  { id: "electronics", title: "电子设备", english: "POWER", items: [{ id: "phone", label: "手机", essential: true }, { id: "charger", label: "充电器与线", essential: true }, { id: "bank", label: "充电宝", note: "一直随身，不放大件行李", essential: true }, { id: "earphones", label: "耳机" }, { id: "offline", label: "离线地图 / 音乐 / 票务" }] },
  { id: "photo", title: "拍照", english: "PHOTO", items: [{ id: "camera", label: "相机" }, { id: "camera-battery", label: "相机电池与充电" }, { id: "memory", label: "存储卡" }, { id: "cloth", label: "镜头布" }] },
  { id: "warm", title: "保暖", english: "WARM", items: [{ id: "base", label: "贴身长袖" }, { id: "knit", label: "软针织中层" }, { id: "shell", label: "防风 / 防雨外层", essential: true }, { id: "scarf", label: "能固定的围巾" }, { id: "warm-socks", label: "保暖袜" }] },
  { id: "sun", title: "防晒 / 保湿", english: "SKIN", items: [{ id: "sunscreen", label: "防晒", essential: true }, { id: "lip", label: "润唇膏", essential: true }, { id: "cream", label: "面霜 / 保湿" }, { id: "hand", label: "护手霜" }, { id: "glasses", label: "墨镜" }] },
  { id: "care", title: "洗护", english: "CARE", items: [{ id: "tooth", label: "牙刷牙膏" }, { id: "cleanser", label: "洁面与卸妆" }, { id: "shampoo", label: "旅行装洗护" }, { id: "towel", label: "小毛巾" }] },
  { id: "medicine", title: "药品 / 常用用品", english: "CARE KIT", items: [{ id: "daily-med", label: "个人常用药", essential: true }, { id: "motion", label: "晕车准备" }, { id: "pain", label: "止痛 / 肠胃常用药" }, { id: "bandage", label: "创可贴" }, { id: "mask", label: "口罩" }] },
  { id: "road", title: "长途坐车", english: "ROAD DAY", items: [{ id: "water", label: "水", essential: true }, { id: "snack", label: "少量熟悉的零食" }, { id: "tissue", label: "纸巾" }, { id: "wet", label: "湿巾" }, { id: "trash", label: "小垃圾袋" }, { id: "neck", label: "颈枕 / 眼罩（需要就带）" }] },
  { id: "shoes", title: "鞋", english: "SHOES", items: [{ id: "walking-shoes", label: "走熟的步行鞋", essential: true }, { id: "rain-boots", label: "雨靴 / 防水靴" }, { id: "slippers", label: "轻便拖鞋" }] },
  { id: "clothes", title: "衣物", english: "LAYERS", items: [{ id: "tops", label: "可重复叠穿的上装" }, { id: "wide-pants", label: "宽松长裤" }, { id: "long-skirt", label: "长裙 / 可叠穿裙" }, { id: "sheer", label: "薄透长层" }, { id: "outer", label: "宽大外套" }, { id: "underwear", label: "内衣与袜子" }, { id: "sleep", label: "睡衣" }, { id: "laundry", label: "脏衣袋" }] },
  { id: "daybag", title: "随身包", english: "ON YOU", items: [{ id: "day-id", label: "身份证" }, { id: "day-phone", label: "手机" }, { id: "day-bank", label: "充电宝" }, { id: "day-water", label: "水" }, { id: "day-lip", label: "润唇膏" }, { id: "day-layer", label: "保暖 / 防风层" }] },
];

export const packingCharacters = [
  { word: "BIG", text: "一件大外套，换三种比例。" }, { word: "SOFT", text: "针织、蕾丝、薄长层负责柔软。" }, { word: "WEIRD", text: "只带一两件不太正常的东西。" }, { word: "MOVING", text: "会被风带动的下摆。" }, { word: "FUNCTIONAL", text: "shell、雨靴、好走的鞋。" }, { word: "WARM", text: "真正保暖的中层。" }, { word: "BASIC", text: "可以重复穿的底层。" },
];
