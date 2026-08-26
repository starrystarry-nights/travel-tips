import type { TripDay } from "./product";

export type PackLevel = "required" | "recommended" | "optional";
export type DayVisual = {
  hero: string; secondary: string; outfit: string; altitude: string;
  outfitCopy: string; outfitNote: string;
  dayBag: readonly [string, string, PackLevel][];
};

const common = [["id","身份证","required"],["phone","手机","required"],["power","充电宝与充电线","required"],["water","水","required"]] as const;

export const dayVisuals: Record<number, DayVisual> = {
  1:{hero:"urumqi-city-01",secondary:"urumqi-night-01",outfit:"style-city-01",altitude:"约 800 m",outfitCopy:"长袖 + 轻外套 + 走熟的鞋",outfitNote:"抵达时间不确定，外层方便应对机场、室内和夜间温差。",dayBag:[...common,["booking","住宿与集合信息截图","required"],["sun","防晒 / 墨镜","recommended"]]},
  2:{hero:"s21-highway-01",secondary:"s21-sunset-01",outfit:"style-desert-03",altitude:"约 700—1,100 m",outfitCopy:"长袖衬衫 + 宽松长裤 + 防晒配件",outfitNote:"约 8 小时坐车，下装不要勒腰；停车时再加防风层。",dayBag:[...common,["snack","少量零食","recommended"],["tissue","纸巾 / 湿巾","recommended"],["motion","晕车药","recommended"],["sun","防晒 / 墨镜","required"]]},
  3:{hero:"hemu-village-01",secondary:"ahe-road-01",outfit:"https://images.pexels.com/photos/31613705/pexels-photo-31613705.jpeg?auto=compress&cs=tinysrgb&w=1200",altitude:"禾木约 1,200 m",outfitCopy:"防风外套 + 薄针织 + 宽松长下装",outfitNote:"早上穿完整，中午热时脱外层；进入禾木前把外套留在身边。",dayBag:[...common,["warm","薄抓绒 / 针织中层 + 防风外层","required"],["tissue","纸巾 / 湿巾","recommended"],["meds","晕车药 / 肠胃药 / 个人常用药","recommended"],["camera","相机 / 备用电池","optional"],["sun","墨镜 / 防晒","recommended"],["snack","少量方便吃的零食","recommended"]]},
  4:{hero:"kanas-lake-01",secondary:"baihaba-village-01",outfit:"style-lake-04",altitude:"约 1,300—2,000 m",outfitCopy:"防风外层 + 针织中层 + 舒服长下装",outfitNote:"湖边和白哈巴风更明显；观鱼台台阶多，鞋底防滑优先。",dayBag:[...common,["warm","薄抓绒 / 针织中层","required"],["shell","防风外套 / 冲锋衣","required"],["booking","观鱼台预约信息","recommended"],["tissue","纸巾 / 湿巾","recommended"]]},
  5:{hero:"fairy-bay-01",secondary:"moon-bay-01",outfit:"style-lake-03",altitude:"约 1,300 m",outfitCopy:"针织中层 + 防风外层 + 好走的鞋",outfitNote:"晨间可能更冷，离开景区后是约 7 小时车程。",dayBag:[...common,["warm","保暖中层 / 防风外层","required"],["snack","少量零食","recommended"],["tissue","纸巾 / 湿巾","recommended"],["motion","晕车药","recommended"]]},
  6:{hero:"devil-yardang-01",secondary:"poplar-forest-01",outfit:"style-gobi-04",altitude:"约 300—500 m",outfitCopy:"长袖 + 防风外层 + 宽松长裤",outfitNote:"魔鬼城风、晒和干燥明显；帽子与围巾要能固定。",dayBag:[...common,["sun","防晒 / 墨镜 / 帽子","required"],["shell","轻量防风外层","recommended"],["lip","润唇膏","recommended"],["tissue","纸巾 / 湿巾","recommended"]]},
  7:{hero:"urumqi-window-01",secondary:"urumqi-city-01",outfit:"style-city-02",altitude:"约 800 m",outfitCopy:"舒适长袖 + 轻外套 + 好走的鞋",outfitNote:"以长时间交通和室内外温差为准。",dayBag:[...common,["ticket","返程交通信息","required"],["meds","个人常用药","recommended"]]},
};
export const visualFor = (day: TripDay) => dayVisuals[day.day];
