export type InformationType = "stable" | "check-before-trip" | "check-today";

export type InfoBlock = {
  title: string;
  summary: string;
  details: string[];
  informationType?: InformationType;
  sourceLabel?: string;
  sourceUrl?: string;
  lastVerified?: string;
};

export type TripDay = {
  day: number;
  date: string;
  title: string;
  english: string;
  route: string[];
  distance?: string;
  drive?: string;
  intensity: "轻松" | "适中" | "较累";
  mood: string[];
  heroMedia: string;
  gallery: string[];
  styleMedia: string[];
  overview: string;
  priorities: string[];
  quickCarry: string[];
  confirm: string[];
  style: InfoBlock;
  play: InfoBlock[];
  photo: InfoBlock;
  comfort: InfoBlock[];
  food: InfoBlock;
  toilet: InfoBlock;
  safety: InfoBlock;
  badWeather: InfoBlock;
  skip: InfoBlock;
};

export const tripDays: TripDay[] = [
  {
    day: 1, date: "9月12日", title: "乌鲁木齐", english: "URUMQI", route: ["抵达乌鲁木齐", "自由活动"], intensity: "轻松", mood: ["CITY", "NIGHT", "FIRST LOOK"], heroMedia: "urumqi-city-01", gallery: ["urumqi-street-01", "urumqi-night-01", "urumqi-architecture-01", "urumqi-market-01", "urumqi-food-01", "urumqi-detail-01"], styleMedia: ["style-city-01", "style-city-02"], overview: "第一天不用证明自己玩得多。根据抵达时间，只选一件真正想做的事，再好好吃顿饭。", priorities: ["先入住、补水、整理随身物品", "按抵达时间选择一个去处", "给第二天长途车程留睡眠"], quickCarry: ["身份证", "手机", "充电宝", "润唇膏"], confirm: ["博物馆开放日与预约", "接机与酒店入住时间"],
    style: { title: "穿搭灵感", summary: "城市感、干净、稍微利落。", details: ["黑、灰、银色为主，酒红只做一个小重点。", "结构感外套、直线条裤装或长裙都适合城市与夜景。", "银色首饰在夜间灯光里比复杂印花更有效。"] },
    play: [
      { title: "早到", summary: "博物馆优先，晚上再去吃饭。", details: ["新疆维吾尔自治区博物馆适合用 2—3 小时建立对新疆历史和地域的整体认识。", "参观后不要再塞太多景点，留时间回酒店休息。"], informationType: "check-before-trip", sourceLabel: "开放与预约出发前确认" },
      { title: "下午到", summary: "入住后选大巴扎或红山公园，不必两个都去。", details: ["想感受夜晚与食物，选国际大巴扎。", "想散步、看城市视野，且体力还可以，选红山公园。"] },
      { title: "晚上到", summary: "吃饭、散步、回酒店。", details: ["大巴扎适合第一次到新疆晚上走走、吃东西和看夜景。", "如果不喜欢商业化景区，不用停留太久，更不需要硬买纪念品。"] }
    ],
    photo: { title: "怎么拍", summary: "别只拍大巴扎正门。", details: ["拍街道细节、建筑切面、食物、手、走路和玻璃倒影。", "夜间让人物走动，连拍比站定摆姿势更自然。", "光线太杂时，靠近一面干净的墙或只拍局部。"] },
    comfort: [{ title: "抵达日节奏", summary: "落地后先解决身体需求。", details: ["先喝水、吃东西、洗澡和整理第二天随身包。", "第一晚早一点睡，比多打卡一个点更重要。"] }],
    food: { title: "吃饭", summary: "第一顿选离酒店近、能坐下来慢慢吃的地方。", details: ["刚落地不要为了网红店跨城排队。", "如果去大巴扎，可把它作为尝鲜场景，不必一次点太多。"] },
    toilet: { title: "洗手间", summary: "离开机场、车站或酒店前先去。", details: ["第二天是长途日，今晚顺便准备纸巾和湿巾。"] },
    safety: { title: "安全", summary: "夜间仍按普通城市旅行原则行动。", details: ["保管好手机和证件。", "不去未开放区域，不因拍照妨碍通行。"] },
    badWeather: { title: "天气不好", summary: "把重心放在室内、吃饭和休息。", details: ["博物馆若开放可优先；否则不必冒雨赶公园。"], informationType: "check-today" },
    skip: { title: "可以放弃", summary: "飞行后很累，红山公园可以不去。", details: ["第一天真正不能牺牲的是睡眠。"] }
  },
  {
    day: 2, date: "9月13日", title: "S21 沙漠公路", english: "ROAD DAY", route: ["乌鲁木齐", "S21", "克拉美丽沙漠", "阿勒泰"], distance: "约 500 KM", drive: "约 8 H", intensity: "较累", mood: ["ROAD", "WIND", "DESERT"], heroMedia: "s21-highway-01", gallery: ["s21-desert-01", "s21-sky-01", "s21-window-01", "s21-sunset-01"], styleMedia: ["style-desert-01", "style-desert-02"], overview: "今天的主要内容就是在路上。别把 8 小时车程假装成轻松的一天，先把身体照顾好，再看地貌怎样一路变化。", priorities: ["上车前吃早餐、去洗手间", "水和充电宝放身边，不放大件行李", "只在允许停车的安全区域拍照"], quickCarry: ["水", "零食", "耳机", "纸巾", "湿巾", "垃圾袋", "充电宝"], confirm: ["沿线路况", "将军山活动是否举行"],
    style: { title: "穿搭灵感", summary: "让人物从沙色背景里跳出来。", details: ["推荐白、黑、denim、红、银。", "宽松长裤、干净上衣、结构感外套和墨镜适合公路比例。", "避免从头到脚卡其色，容易和背景融成一片。"] },
    play: [{ title: "公路怎么玩", summary: "别只睡过去，也不用一直举着手机。", details: ["看城市如何变成荒野，注意沙丘、天空、道路透视、车窗反光、服务区和日落。", "把其中一段路留给音乐，另一段什么也不做。"] }],
    photo: { title: "怎么拍", summary: "公路大，人物小。", details: ["人物只占画面 10—20%，把道路和天空留下来。", "拍车窗倒影、风吹头发、走向远处和日落剪影。", "两个人轮流抓拍，不要让一个人整天负责摄影。"] },
    comfort: [{ title: "容易晕车", summary: "少低头，尽量看远处。", details: ["根据个人情况提前做好晕车准备。", "不要空腹，也不要一次吃太油腻。"] }, { title: "车上更舒服", summary: "常用物品必须触手可及。", details: ["薄外套、耳机、湿巾和充电线放小包。", "每次停车活动一下腿和肩颈。"] }],
    food: { title: "吃饭", summary: "不要默认随时能吃到想吃的东西。", details: ["早餐吃稳，准备少量方便携带的熟悉食物。", "零食只负责兜底，不替代正常吃饭。"] },
    toilet: { title: "洗手间", summary: "看到条件合适的就先去。", details: ["不要总想着下一站再说。"] },
    safety: { title: "安全", summary: "不要站机动车道拍公路照。", details: ["只在允许停车、安全且不影响交通的位置下车。", "不要为了空无一人的画面进入危险区域。"] },
    badWeather: { title: "天气不好", summary: "减少下车拍照，保护身体和设备。", details: ["沙尘、强风或降雨时听从司机安排。", "将军山夕阳活动若取消，不影响当天核心体验。"], informationType: "check-today" },
    skip: { title: "可以放弃", summary: "天气不合适时，日落活动可以放弃。", details: ["不要用安全和睡眠换一个不确定的画面。"] }
  },
  {
    day: 3, date: "9月14日", title: "阿禾公路与禾木", english: "HEMU", route: ["阿勒泰", "阿禾景观公路", "禾木"], distance: "约 220 KM", drive: "约 5 H", intensity: "适中", mood: ["GOLD", "FOREST", "CABIN"], heroMedia: "hemu-village-01", gallery: ["ahe-road-01", "ahe-grassland-01", "ahe-forest-01", "ahe-river-01", "hemu-cabin-01", "hemu-bridge-01", "hemu-birch-01", "hemu-morning-01", "hemu-walk-01", "hemu-detail-01"], styleMedia: ["style-forest-01", "style-forest-02", "style-village-01"], overview: "今天的重点不是赶到禾木，而是看道路怎样从草原进入森林。抵达后先安顿，再把脚步慢下来。", priorities: ["沿途看地貌变化，不只等终点", "到禾木先入住、确认集合与洗手间", "厚外套放 overnight bag，跟人不跟大箱"], quickCarry: ["厚外套", "充电宝", "水", "纸巾", "overnight bag"], confirm: ["阿禾公路开放状态", "禾木区间车与住宿接驳", "第二天集合时间"],
    style: { title: "穿搭灵感", summary: "背景已经很暖，人物需要冷色和明暗差。", details: ["推荐炭灰、奶油白、酒红、黑和 denim。", "宽松针织、长裙或阔腿牛仔、长外套和靴子都适合走路与风。", "避免全身黄色或驼色，容易融进金色森林。", "Plan B：增加防风层，不必换成完整户外制服。"] },
    play: [{ title: "阿禾公路", summary: "注意转弯、河流、草原和森林的变化。", details: ["不要只等一个所谓最佳停车点。", "能否停车、停多久以现场安全和司机安排为准。"], informationType: "check-today" }, { title: "抵达后两小时", summary: "先入住，再出去走。", details: ["放东西、确认第二天集合、去洗手间、整理随身包。", "不要一下车就拉着行李赶所有景点。"] }, { title: "禾木怎么玩", summary: "走路、观察、找光，再拍照。", details: ["优先禾木桥、白桦林、木屋和村落小路。", "傍晚留一点没有计划的时间，看到好光再停。"] }, { title: "夜晚", summary: "山区降温明显。", details: ["厚外套必须随身可取。", "回住处前确认手机电量和第二天起床时间。"] }],
    photo: { title: "怎么拍", summary: "让动作替代摆姿势。", details: ["走路、背影、窗边、靴子踩过落叶、衣摆被风吹起。", "人不要每张都占 70%，多拍 10%、20%、40% 三种比例。", "正午光硬时拍手、衣服、木屋细节和影子。"] },
    comfort: [{ title: "overnight bag", summary: "把今晚和明早真正要用的东西单独装。", details: ["厚外套、洗漱、充电线、第二天内搭、药品和证件。", "大件行李不方便取时也不影响。"] }, { title: "先慢下来", summary: "禾木不是越赶越好看。", details: ["给入住和交通留 buffer。", "排队多时守住一次散步和一次好好吃饭。"] }],
    food: { title: "吃饭", summary: "入住后先确认附近几点停止供餐。", details: ["山区选择可能有限，别把晚饭拖到很晚。", "随身留一点能快速补充能量的食物。"] },
    toilet: { title: "洗手间", summary: "下车、入住、出门散步前各确认一次。", details: ["村落散步路线不要假设随处都有洗手间。"] },
    safety: { title: "安全", summary: "只走开放道路和步道。", details: ["夜间光线弱，注意路面和车辆。", "不进入私人院落，不翻越围挡取景。"] },
    badWeather: { title: "天气 Plan B", summary: "CHANGE THE ROAD, NOT THE MOOD.", details: ["阿禾公路可能因天气或道路状况调整，改走国道仍按正常行程体验。", "雨冷时减少长距离拍摄，把重点换成木屋、窗、细节和短散步。"], informationType: "check-today" },
    skip: { title: "可以放弃", summary: "抵达太晚时，远距离追光可以放弃。", details: ["先熟悉住处周边，第二天清晨还有机会。"] }
  },
  {
    day: 4, date: "9月15日", title: "喀纳斯与白哈巴", english: "KANAS · BAIHABA", route: ["禾木", "喀纳斯", "白哈巴"], intensity: "较累", mood: ["MIST", "LAKE", "QUIET"], heroMedia: "kanas-lake-01", gallery: ["kanas-forest-01", "kanas-mountain-01", "kanas-water-01", "kanas-trail-01", "kanas-viewpoint-01", "kanas-person-01", "baihaba-village-01", "baihaba-cabin-01", "baihaba-slope-01"], styleMedia: ["style-lake-01", "style-lake-02"], overview: "今天不要试图完成喀纳斯所有项目。先根据体力、排队和天气，在湖边、游船、观鱼台之间做选择，再把节奏留给白哈巴。", priorities: ["喀纳斯只选最适合自己的玩法", "给区间车、排队和转场留 buffer", "白哈巴身份证随身，只走开放路线"], quickCarry: ["身份证", "厚外套", "水", "润唇膏", "充电宝"], confirm: ["游船开放与价格", "观鱼台预约或限流", "区间车等待", "白哈巴动态管控"],
    style: { title: "穿搭灵感", summary: "好看和防风必须同时成立。", details: ["奶油白、灰、深红、moss、黑最适合湖泊和雾。", "针织、长外套、长裙或长裤、靴子，再加一层防风。", "技术外套可以搭配柔软或修长廓形，不必穿成整套户外制服。"] },
    play: [{ title: "湖边徒步", summary: "适合喜欢慢慢走、又不想把时间都用来排队的人。", details: ["沿湖观察颜色、倒影和林线。", "累了就及时回程，不用为了里程证明体验。"] }, { title: "游船", summary: "适合想看湖面视角的人。", details: ["是否开放、票价和等待时间当天确认。", "如果排队过长，湖边散步完全可以替代。"], informationType: "check-today" }, { title: "观鱼台", summary: "视野好，但有台阶、需要体力，也可能限流。", details: ["已经累、时间紧或排队很久时，可以放弃。", "把时间留给湖边并不算错过喀纳斯。"], informationType: "check-today" }, { title: "白哈巴", summary: "去看村落与山坡之间的空间，不只追一个机位。", details: ["木屋、草地、坡道、日落和人在村落里的尺度都值得。", "先确认吃饭和洗手间，再慢慢走。"] }],
    photo: { title: "怎么拍", summary: "雾、倒影和人在景里的比例。", details: ["湖边拍 10—20% 的小人物，保留水面和山。", "白哈巴拍走路、背影、坡度和木屋之间的层次。", "排队环境里少拍正面大头，多拍手、衣服和局部。"] },
    comfort: [{ title: "冷", summary: "傍晚不要把厚衣服留在车上或大箱里。", details: ["风一起来体感会迅速下降。", "润唇膏、水和充电宝保持随手可取。"] }, { title: "交通", summary: "今天转场多，时间不要排到分钟。", details: ["区间车等待和临时调度都需要 buffer。"] }],
    food: { title: "吃饭", summary: "白哈巴到达后先确认餐饮时间。", details: ["不要等拍完日落才发现没有合适的正餐。", "随身零食只用于转场兜底。"] },
    toilet: { title: "洗手间", summary: "喀纳斯转场前和到白哈巴后主动确认。", details: ["看到条件合适的先去，不赌下一站。"] },
    safety: { title: "安全", summary: "白哈巴属于边境区域。", details: ["身份证随身，遵守景区及边境管理要求。", "只走开放路线，不翻越围栏，不为机位进入限制区域。"], informationType: "check-today" },
    badWeather: { title: "天气不好", summary: "缩短拍摄，选择一种喀纳斯体验。", details: ["大风或降雨时优先湖边短走和安全转场。", "临时关闭项目不等于今天失败。"], informationType: "check-today" },
    skip: { title: "可以放弃", summary: "观鱼台不是必去。", details: ["体力、时间或排队不合适就放弃，把时间留给湖边和白哈巴。"] }
  },
  {
    day: 5, date: "9月16日", title: "喀纳斯三湾", english: "THREE BAYS", route: ["白哈巴", "神仙湾", "月亮湾", "卧龙湾", "乌尔禾"], distance: "约 400 KM", drive: "约 7 H", intensity: "较累", mood: ["MIST", "RIVER", "ROAD"], heroMedia: "fairy-bay-01", gallery: ["fairy-bay-02", "fairy-bay-03", "moon-bay-01", "moon-bay-02", "moon-bay-03", "wolong-bay-01", "wolong-bay-02", "wolong-bay-03"], styleMedia: ["style-lake-01", "style-forest-01"], overview: "三湾各有重点，但今天后半程还有长途车。晨雾、体力和时间会改变取舍，不必把三个湾变成任务清单。", priorities: ["有晨雾时优先神仙湾氛围", "月亮湾看曲线与层次", "14:00 后上车前完成洗手间、补水和充电"], quickCarry: ["水", "零食", "厚外套", "充电宝", "纸巾"], confirm: ["晨雾与能见度", "区间车与步道开放", "出发集合时间"],
    style: { title: "穿搭灵感", summary: "灰、黑、深红比全身秋色更有层次。", details: ["长外套和会被风带动的下摆适合河流曲线。", "鞋底要适合步道和台阶。", "有雾时减少复杂图案，让轮廓清楚。"] },
    play: [{ title: "神仙湾", summary: "关键词是晨雾、安静和氛围。", details: ["有雾时值得优先停留；晴朗且时间很紧时可以缩短。", "体力消耗取决于实际步行安排，先听现场路线。"] }, { title: "月亮湾", summary: "经典价值在河流曲线与前后景层次。", details: ["先看完整曲线，再决定人物站在哪里。", "不要只拍同一个观景台标准照。"] }, { title: "卧龙湾", summary: "更宽阔，河流和森林的关系更明显。", details: ["适合慢一点看景观整体。", "若车程压力已经很大，可缩短停留但别复制月亮湾拍法。"] }],
    photo: { title: "怎么拍", summary: "三个湾不要拍成同一张照片。", details: ["神仙湾拍雾和安静背影。", "月亮湾拍曲线与前景。", "卧龙湾拍宽阔河谷与森林层次。"] },
    comfort: [{ title: "后半程长途", summary: "上车前一次性解决身体需求。", details: ["去洗手间、装水、拿零食、充好手机。", "厚外套和充电宝不要放大件行李。"] }],
    food: { title: "吃饭", summary: "早点确认午餐和上车时间。", details: ["不要把正餐拖到长途车已经出发以后。"] },
    toilet: { title: "洗手间", summary: "离开景区前务必去。", details: ["后续约 7 小时车程，不要赌沿途下一站。"] },
    safety: { title: "安全", summary: "观景台和步道只走开放区域。", details: ["雾天路面湿滑时放慢速度。", "不要翻越护栏追求无遮挡画面。"] },
    badWeather: { title: "天气不好", summary: "能见度低时减少湾区数量。", details: ["优先交通顺畅和安全的停留点。", "雾很大未必适合看曲线，但可能适合神仙湾氛围。"], informationType: "check-today" },
    skip: { title: "时间有限怎么取舍", summary: "有雾优先神仙湾；想看经典曲线优先月亮湾。", details: ["卧龙湾可根据体力和发车时间决定停留长度。"] }
  },
  {
    day: 6, date: "9月17日", title: "魔鬼城与胡杨林", english: "DEVIL CITY", route: ["乌尔禾", "魔鬼城", "白杨河胡杨林", "乌鲁木齐"], distance: "约 500 KM", drive: "约 6.5 H", intensity: "较累", mood: ["HARD", "DRY", "WIND"], heroMedia: "devil-yardang-01", gallery: ["devil-shadow-01", "devil-texture-01", "devil-road-01", "devil-person-01", "poplar-forest-01", "poplar-path-01", "poplar-detail-01"], styleMedia: ["style-gobi-01"], overview: "画面从森林和雾突然变成硬、干、强光与风。今天仍是长途日，魔鬼城拍摄要简洁，胡杨林是否进入实际行程以现场为准。", priorities: ["防晒、补水、固定帽子和围巾", "只在规定路线与安全区域活动", "给返乌鲁木齐车程保留体力"], quickCarry: ["水", "防晒", "墨镜", "充电宝", "围巾", "纸巾"], confirm: ["魔鬼城风力与开放", "白杨河胡杨林是否实际安排", "返程抵达时间"],
    style: { title: "穿搭灵感", summary: "强轮廓、黑白关系和能被风带动的材质。", details: ["推荐黑、白、denim、rust，银色配饰少量出现。", "墨镜、靴子、利落外套比复杂层叠更有效。", "帽子和围巾必须能固定，别让造型变成安全负担。"] },
    play: [{ title: "魔鬼城怎么玩", summary: "观察形状、影子、尺度、风和空地。", details: ["别站在每一块石头前重复合影。", "随着光线移动，雅丹表面的阴影和纹理会变化。"] }, { title: "胡杨林", summary: "只有实际行程安排时再进入期待。", details: ["可把它当作颜色与纹理的补充，不当作确定承诺。"], informationType: "check-today" }],
    photo: { title: "怎么拍", summary: "人物小、机位低、影子长。", details: ["尝试低机位、剪影、侧脸、纹理、风吹衣料和大面积留白。", "正午不适合一直拍正脸，转向影子和材质。"] },
    comfort: [{ title: "风与晒", summary: "体感会比照片看起来更辛苦。", details: ["频繁小口补水，及时补防晒。", "固定随身物，别让帽子和围巾被吹走。"] }, { title: "车程", summary: "魔鬼城之后仍有约 6.5 小时总车程安排。", details: ["活动时别把全部体力用完。"] }],
    food: { title: "吃饭", summary: "上车前确认正餐与补给。", details: ["长途段留少量便携食物和水。"] },
    toilet: { title: "洗手间", summary: "离开景区与每次条件合适的停车点都主动判断。", details: ["不要一直等下一站。"] },
    safety: { title: "安全", summary: "不要为了无人照片离开规定路线。", details: ["不进入限制区域。", "风大时留意帽子、围巾、手机和相机。"] },
    badWeather: { title: "天气不好", summary: "强风或沙尘时缩短户外停留。", details: ["听从景区和司机安排，保护眼睛与设备。"], informationType: "check-today" },
    skip: { title: "可以放弃", summary: "胡杨林若未实际安排，直接放下期待。", details: ["它是可选加分项，不是今天成败。"] }
  },
  {
    day: 7, date: "9月18日", title: "乌鲁木齐返程", english: "HOME", route: ["乌鲁木齐", "返程"], intensity: "轻松", mood: ["WINDOW", "LAST FRAME", "HOME"], heroMedia: "urumqi-window-01", gallery: [], styleMedia: ["style-city-01"], overview: "最后一天不要塞满。确认航班与接送，吃一顿安稳的早餐，再拍一张旅程结束前的普通照片。", priorities: ["核对证件、航班和接送", "检查房间与充电设备", "出发前留一张合照"], quickCarry: ["身份证", "票务信息", "手机", "充电线"], confirm: ["航班状态", "接送时间", "行李额度"],
    style: { title: "穿搭灵感", summary: "舒服、利落、适合移动。", details: ["穿已经在旅途中证明舒服的那一套。", "保暖层仍然放在随手位置。"] },
    play: [{ title: "最后一段", summary: "吃早餐、收行李、看窗外。", details: ["不用为了填满一天再增加远距离景点。"] }],
    photo: { title: "怎么拍", summary: "记录结束前的普通瞬间。", details: ["行李、窗、票、早餐、凌乱的床和疲惫的脸。", "离开前拍一张合照。"] },
    comfort: [{ title: "返程", summary: "给交通和安检留足时间。", details: ["别把最后一小时用来补打卡。"] }],
    food: { title: "吃饭", summary: "优先吃得到、来得及的早餐。", details: ["随身留一点返程途中可吃的东西。"] },
    toilet: { title: "洗手间", summary: "离开酒店前解决。", details: ["随后按机场或车站节奏安排。"] },
    safety: { title: "安全", summary: "检查证件、房间和行李。", details: ["充电器、药品和证件最后单独确认。"] },
    badWeather: { title: "天气不好", summary: "不影响返程优先级。", details: ["提前出发，关注交通和航班状态。"], informationType: "check-today" },
    skip: { title: "可以放弃", summary: "所有临时增加的景点。", details: ["准时、安全、轻松返程更重要。"] }
  }
];
