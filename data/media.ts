export type MediaCategory =
  | "landscape"
  | "fashion"
  | "people"
  | "road"
  | "detail"
  | "food"
  | "texture"
  | "photo-reference"
  | "utility";

export type MediaAsset = {
  id: string;
  src: string;
  alt: string;
  location: string;
  category: MediaCategory;
  orientation: "landscape" | "portrait" | "square";
  usage: string[];
  priority: boolean;
  credit: string;
  width: number;
  height: number;
};

const credit = "AI-generated editorial placeholder";

function asset(
  id: string,
  src: string,
  alt: string,
  location: string,
  category: MediaCategory,
  usage: string[],
  priority = false,
  assetCredit = credit,
): MediaAsset {
  return { id, src, alt, location, category, orientation: "square", usage, priority, credit: assetCredit, width: 418, height: 418 };
}

export const media: MediaAsset[] = [
  asset("urumqi-city-01", "/media/urumqi/u-00-new.jpg", "年轻女生穿着秋日外套走过城市坡道的旅行抓拍", "urumqi", "people", ["home-hero", "day01-hero"], true, "Photo by furkanfdemir via Pexels"),
  asset("urumqi-night-01", "/media/urumqi/u-01.webp", "乌鲁木齐夜晚灯光与城市倒影", "urumqi", "landscape", ["day01-gallery"]),
  asset("urumqi-architecture-01", "/media/urumqi/u-02.webp", "乌鲁木齐现代建筑切面", "urumqi", "landscape", ["day01-gallery"]),
  asset("urumqi-market-01", "/media/urumqi/u-03.webp", "乌鲁木齐市场织物与干果细节", "urumqi", "detail", ["day01-gallery"]),
  asset("urumqi-food-01", "/media/urumqi/u-04.webp", "新疆拌面近景", "urumqi", "food", ["day01-gallery"]),
  asset("urumqi-detail-01", "/media/urumqi/u-05.webp", "手里拿着新疆烤馕夹肉", "urumqi", "food", ["day01-gallery"]),
  asset("urumqi-street-01", "/media/urumqi/u-06.webp", "乌鲁木齐城市街拍", "urumqi", "people", ["day01-gallery"]),
  asset("urumqi-window-01", "/media/urumqi/u-07.webp", "红山与乌鲁木齐城市天际线", "urumqi", "landscape", ["day07-hero"]),
  asset("urumqi-museum-01", "/media/urumqi/u-08.webp", "新疆博物馆建筑外观", "urumqi", "landscape", ["place-urumqi"]),

  asset("s21-highway-01", "/media/s21/highway.webp", "S21 沙漠高速穿过开阔荒原", "s21", "road", ["day02-hero"]),
  asset("s21-desert-01", "/media/s21/dunes.webp", "克拉美丽沙漠沙丘与阴影", "s21", "landscape", ["day02-gallery"]),
  asset("s21-sky-01", "/media/s21/sky.webp", "S21 公路上方辽阔天空", "s21", "landscape", ["day02-gallery"]),
  asset("s21-window-01", "/media/s21/window.webp", "车窗倒影里的沙漠公路", "s21", "road", ["day02-gallery"]),
  asset("s21-sunset-01", "/media/s21/sunset.webp", "沙漠公路停车点的日落", "s21", "road", ["day02-gallery"]),
  asset("s21-service-01", "/media/s21/service.webp", "S21 公路服务区的风、围巾与天空", "s21", "detail", ["place-s21"]),

  asset("ahe-road-01", "/media/ahe/curve.webp", "阿禾景观公路穿过金色草原", "ahe", "road", ["day03-gallery"]),
  asset("ahe-grassland-01", "/media/ahe/mountain.webp", "阿禾公路转入山地森林", "ahe", "road", ["day03-gallery"]),
  asset("ahe-river-01", "/media/ahe/river.webp", "阿禾公路沿河与秋季山林", "ahe", "landscape", ["day03-gallery"]),
  asset("ahe-forest-01", "/media/ahe/window.webp", "车窗外掠过的金色白桦林", "ahe", "road", ["day03-gallery"]),
  asset("ahe-grassland-02", "/media/ahe/grassland.webp", "阿禾公路穿过开阔秋季草原", "ahe", "road", ["place-ahe"]),
  asset("ahe-car-river-01", "/media/ahe/car-river.webp", "从车窗看阿禾公路旁的山间河流", "ahe", "road", ["place-ahe"]),

  asset("hemu-village-01", "/media/hemu/h-00.webp", "禾木村与山谷里的金色森林", "hemu", "landscape", ["day03-hero"]),
  asset("hemu-cabin-01", "/media/hemu/h-01.webp", "禾木秋季木屋", "hemu", "landscape", ["day03-gallery"]),
  asset("hemu-bridge-01", "/media/hemu/h-02.webp", "禾木桥与河流", "hemu", "landscape", ["day03-gallery"]),
  asset("hemu-birch-01", "/media/hemu/h-03.webp", "禾木金色白桦林", "hemu", "landscape", ["day03-gallery"]),
  asset("hemu-morning-01", "/media/hemu/h-04.webp", "薄雾中的禾木清晨", "hemu", "landscape", ["place-hemu"]),
  asset("hemu-walk-01", "/media/hemu/h-05.webp", "禾木木屋之间的村落小路", "hemu", "road", ["day03-gallery"]),
  asset("hemu-detail-01", "/media/hemu/h-06.webp", "禾木白桦秋叶细节", "hemu", "detail", ["day03-gallery"]),
  asset("hemu-person-01", "/media/hemu/h-07.webp", "人在禾木山谷里慢慢走", "hemu", "people", ["photo-guide"]),
  asset("hemu-night-01", "/media/hemu/h-08.webp", "禾木夜晚木屋窗光", "hemu", "landscape", ["place-hemu"]),
  asset("hemu-window-01", "/media/hemu/h-09.webp", "禾木木屋窗与秋叶细节", "hemu", "detail", ["place-hemu"]),

  ...Array.from({ length: 9 }, (_, index) => asset(
    ["kanas-lake-01", "kanas-forest-01", "kanas-mountain-01", "kanas-mist-01", "kanas-trail-01", "kanas-viewpoint-01", "kanas-water-01", "kanas-person-01", "kanas-detail-01"][index],
    `/media/kanas/k-${String(index).padStart(2, "0")}.webp`,
    ["喀纳斯湖与秋季群山", "喀纳斯秋季森林步道", "喀纳斯山水层次", "雾气覆盖喀纳斯湖面", "喀纳斯湖边步道", "喀纳斯高处观景视野", "喀纳斯水面秋色倒影", "人在喀纳斯开阔风景中", "喀纳斯湖水与秋叶细节"][index],
    "kanas", index === 7 ? "people" : index === 8 ? "detail" : "landscape", [index === 0 ? "day04-hero" : "day04-gallery"], index === 0,
  )),
  asset("kanas-shore-01", "/media/kanas/k-09.webp", "旅行者站在喀纳斯湖岸看秋季森林", "kanas", "people", ["place-kanas"]),

  ...Array.from({ length: 6 }, (_, index) => asset(
    ["baihaba-village-01", "baihaba-cabin-01", "baihaba-slope-01", "baihaba-road-01", "baihaba-morning-01", "baihaba-sunset-01"][index],
    `/media/baihaba/b-${String(index).padStart(2, "0")}.webp`,
    ["白哈巴村落秋景", "白哈巴木屋细节", "白哈巴草地与山坡", "白哈巴山间村路", "白哈巴清晨", "白哈巴日落与行人"][index],
    "baihaba", index === 5 ? "people" : index === 3 ? "road" : "landscape", ["place-baihaba"],
  )),
  asset("baihaba-mountain-01", "/media/baihaba/b-06.webp", "白哈巴秋季山坡层次", "baihaba", "landscape", ["place-baihaba"]),
  asset("baihaba-grassland-01", "/media/baihaba/b-07.webp", "白哈巴开阔草地与白桦", "baihaba", "landscape", ["place-baihaba"]),
  asset("baihaba-cabin-detail-01", "/media/baihaba/b-08.webp", "白哈巴木屋门廊细节", "baihaba", "detail", ["place-baihaba"]),
  asset("baihaba-dusk-01", "/media/baihaba/b-09.webp", "蓝调时刻的白哈巴村路", "baihaba", "road", ["place-baihaba"]),
  ...Array.from({ length: 3 }, (_, index) => asset(
    ["lonely-tree-wide-01", "lonely-tree-vertical-01", "lonely-tree-person-01"][index],
    `/media/lonely-tree/l-${String(index).padStart(2, "0")}.webp`,
    ["白哈巴山坡上孤独的树远景", "孤独的树与大面积天空", "人物与孤独的树保持距离"][index],
    "lonely-tree", index === 2 ? "photo-reference" : "landscape", [index === 0 ? "lonely-tree-hero" : "lonely-tree-guide"], index === 0,
  )),
  asset("lonely-tree-friends-01", "/media/lonely-tree/l-03.webp", "两位朋友远远走向白哈巴孤独的树", "lonely-tree", "photo-reference", ["lonely-tree-guide"]),

  ...Array.from({ length: 9 }, (_, index) => asset(
    ["fairy-bay-01", "fairy-bay-02", "fairy-bay-03", "moon-bay-01", "moon-bay-02", "moon-bay-03", "wolong-bay-01", "wolong-bay-02", "wolong-bay-03"][index],
    `/media/three-bays/t-${String(index).padStart(2, "0")}.webp`,
    ["晨雾中的神仙湾", "神仙湾雾气与森林", "神仙湾安静的河面", "月亮湾经典曲线", "月亮湾秋季层次", "月亮湾河谷视野", "卧龙湾宽阔河流", "卧龙湾森林与水面", "卧龙湾开阔秋景"][index],
    index < 3 ? "fairy-bay" : index < 6 ? "moon-bay" : "wolong-bay", "landscape", [index === 0 ? "day05-hero" : "three-bays-guide"], index === 0,
  )),

  ...Array.from({ length: 6 }, (_, index) => asset(
    ["devil-yardang-01", "devil-wide-01", "devil-shadow-01", "devil-texture-01", "devil-road-01", "devil-person-01"][index],
    `/media/devil-city/d-${String(index).padStart(2, "0")}.webp`,
    ["乌尔禾魔鬼城雅丹地貌", "魔鬼城开阔荒凉景观", "雅丹地貌强烈阴影", "魔鬼城岩石纹理", "魔鬼城规定游览路线", "人在巨大雅丹地貌中"][index],
    "devil-city", index === 2 ? "photo-reference" : index === 3 ? "texture" : index === 4 ? "road" : index === 5 ? "people" : "landscape", [index === 0 ? "day06-hero" : "day06-gallery"], index === 0,
  )),
  asset("devil-wind-01", "/media/devil-city/d-06.webp", "魔鬼城风中移动的衣料与人物", "devil-city", "photo-reference", ["photo-guide"]),
  asset("devil-scale-01", "/media/devil-city/d-07.webp", "小人物与巨大雅丹岩壁的比例", "devil-city", "photo-reference", ["place-devil-city"]),
  ...Array.from({ length: 3 }, (_, index) => asset(
    ["poplar-forest-01", "poplar-path-01", "poplar-detail-01"][index],
    `/media/poplar/p-${String(index).padStart(2, "0")}.webp`,
    ["白杨河胡杨林秋色", "胡杨林里的步道", "胡杨叶片与树皮细节"][index],
    "poplar", index === 2 ? "detail" : "landscape", ["day06-gallery"],
  )),
  asset("poplar-path-02", "/media/poplar/p-03.webp", "金色胡杨林里的窄步道与树干", "poplar", "landscape", ["place-poplar"]),

  ...Array.from({ length: 10 }, (_, index) => asset(
    ["style-city-01", "style-city-02", "style-desert-01", "style-desert-02", "style-forest-01", "style-forest-02", "style-lake-01", "style-lake-02", "style-village-01", "style-gobi-01"][index],
    `/media/style/s-${String(index).padStart(2, "0")}.webp`,
    ["城市旅行利落黑色外套穿搭", "城市夜晚银色配饰穿搭", "沙漠公路白色与牛仔穿搭", "沙漠强轮廓红色点缀穿搭", "金色森林炭灰针织穿搭", "金色森林奶油白长外套穿搭", "湖边灰色长层次穿搭", "湖边防风层与柔软廓形", "木屋村落酒红与炭灰穿搭", "戈壁黑白强轮廓穿搭"][index],
    "style", "fashion", ["style-lookbook"],
  )),
  asset("style-gobi-02", "/media/style/s-10.webp", "戈壁洗水牛仔与锈红色穿搭", "style", "fashion", ["style-lookbook"]),
  asset("style-gobi-03", "/media/style/s-11.webp", "戈壁风中围巾与长外套穿搭", "style", "fashion", ["style-lookbook"]),
  asset("style-desert-03", "/media/style/s-12.webp", "沙漠白衬衫与黑色阔腿裤穿搭", "style", "fashion", ["style-desert"]),
  asset("style-desert-04", "/media/style/s-13.webp", "沙漠牛仔与酒红围巾穿搭", "style", "fashion", ["style-desert"]),
  asset("style-forest-03", "/media/style/s-14.webp", "白桦林炭灰针织与奶油长裙穿搭", "style", "fashion", ["style-forest"]),
  asset("style-forest-04", "/media/style/s-15.webp", "金色森林黑色外套与牛仔穿搭", "style", "fashion", ["style-forest"]),
  asset("style-lake-03", "/media/style/s-16.webp", "湖边奶油长外套与灰色层次穿搭", "style", "fashion", ["style-lake"]),
  asset("style-lake-04", "/media/style/s-17.webp", "湖边技术外套与柔软长裙穿搭", "style", "fashion", ["style-lake"]),
  asset("style-village-02", "/media/style/s-18.webp", "木屋村落奶油针织与炭灰长裤穿搭", "style", "fashion", ["style-village"]),
  asset("style-village-03", "/media/style/s-19.webp", "木屋村落酒红外套与牛仔穿搭", "style", "fashion", ["style-village"]),
  asset("style-gobi-04", "/media/style/s-20.webp", "戈壁黑白廓形与风中围巾穿搭", "style", "fashion", ["style-gobi"]),
  asset("style-village-04", "/media/style/s-21.webp", "木屋村落奶油外套与炭灰层次穿搭", "style", "fashion", ["style-village"]),
  asset("friend-photo-01", "/media/photo/friend-01.webp", "两位朋友在秋季公路边一起走", "friend-trip", "people", ["friend-trip-hero"]),
  asset("friend-photo-02", "/media/photo/friend-02.webp", "朋友在旅行中轮换为彼此拍照", "friend-trip", "people", ["friend-trip-guide"]),
  asset("photo-person-01", "/media/photo/person-01.webp", "人物在巨大山景中只占很小比例", "photo-guide", "photo-reference", ["photo-guide"]),
  asset("photo-person-02", "/media/photo/person-02.webp", "人物在金色森林前慢慢走", "photo-guide", "photo-reference", ["photo-guide"]),
  asset("photo-detail-01", "/media/photo/detail-01.webp", "靴子踩过秋季落叶", "photo-guide", "detail", ["photo-guide"]),
  asset("photo-detail-02", "/media/photo/detail-02.webp", "手持相机查看旅行照片", "photo-guide", "detail", ["photo-guide"]),
];

export const mediaById = new Map(media.map((item) => [item.id, item]));

export function getMedia(id: string) {
  const item = mediaById.get(id);
  if (!item) throw new Error(`Missing media: ${id}`);
  return item;
}

export function validateMediaLibrary() {
  if (process.env.NODE_ENV === "production") return;
  const sources = new Map<string, string[]>();
  for (const item of media) {
    if (!item.alt || !item.location || !item.category) console.warn("Incomplete media metadata", item.id);
    sources.set(item.src, [...(sources.get(item.src) ?? []), item.id]);
  }
  for (const [src, ids] of sources) {
    if (ids.length > 1) console.warn(`Duplicate media src: ${src}`, ids);
  }
}
