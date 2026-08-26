export type StyleStory = {
  id: string;
  title: string;
  english: string;
  background: string;
  palette: string[];
  media: string[];
  why: string;
  silhouette: string[];
  texture: string[];
  shoes: string;
  accessories: string;
  weather: string;
  photo: string;
  avoid: string;
};

export const styleStories: StyleStory[] = [
  { id: "desert", title: "沙漠公路", english: "DESERT", background: "沙色地貌、蓝天、强光", palette: ["白", "黑", "DENIM", "红", "银"], media: ["style-desert-01", "style-desert-02", "style-desert-03", "style-desert-04"], why: "背景大面积偏黄、偏浅，人物需要干净的黑白关系或一个明确红色重点。", silhouette: ["宽松长裤", "干净上衣", "结构感外套"], texture: ["牛仔", "棉", "少量金属"], shoes: "能走路的封闭鞋；鞋底先于造型。", accessories: "墨镜、可固定的围巾、银色小配饰。", weather: "风大时加防风外层，围巾必须固定。", photo: "白色在沙色里显干净，红色适合人物占比很小时做视觉锚点。", avoid: "从头到脚卡其色，容易和地貌融成一片。" },
  { id: "forest", title: "金色森林", english: "FOREST", background: "黄色、棕色、绿色已经很饱和", palette: ["炭灰", "奶油白", "酒红", "黑", "DENIM"], media: ["style-forest-01", "style-forest-02", "style-forest-03", "style-forest-04"], why: "让衣服和秋色形成冷暖、明暗差，人物才不会消失在背景里。", silhouette: ["宽松针织", "长裙或阔腿牛仔", "长外套"], texture: ["软针织", "粗呢", "洗水牛仔"], shoes: "靴子或防滑鞋，适合落叶和湿路。", accessories: "围巾可以呼应酒红，但不需要整身同色。", weather: "冷雨时加一层防风，不必换成完整户外制服。", photo: "走路、衣摆、背影比正面站定更适合森林纵深。", avoid: "全身黄色、驼色或芥末色，会和金色背景黏在一起。" },
  { id: "lake", title: "湖泊与雾", english: "LAKE", background: "蓝绿色湖面、灰雾、深色山体", palette: ["奶油白", "灰", "深红", "MOSS", "黑"], media: ["style-lake-01", "style-lake-02", "style-lake-03", "style-lake-04"], why: "低饱和颜色延续雾感，奶油白和深红能让人物轮廓被看见。", silhouette: ["长层次", "柔软内搭", "防风外层"], texture: ["针织", "哑光防风面料", "羊毛感"], shoes: "防滑、能走台阶和湖边步道。", accessories: "小面积深红围巾或包，避免过多户外配件。", weather: "技术外套 × 柔软廓形，是冷雨天最好用的组合。", photo: "人物占画面 10—20%，留下湖面、倒影和雾。", avoid: "复杂大印花；在雾里会让画面显乱。" },
  { id: "village", title: "木屋村落", english: "VILLAGE", background: "木头、草地、山坡与金色白桦", palette: ["CREAM", "炭灰", "酒红", "深棕"], media: ["style-village-01", "style-village-02", "style-village-03", "style-village-04"], why: "木屋本身纹理很多，穿搭用大色块会更现代。", silhouette: ["长外套", "软针织", "长裙或直筒裤"], texture: ["羊毛感", "皮革小面积", "棉质"], shoes: "好走的靴子，别为细跟鞋牺牲村路体验。", accessories: "围巾或小包只选一个视觉重点。", weather: "傍晚厚外套跟人，不留在大箱。", photo: "利用木屋之间的路、坡度和窗，不要只贴墙站。", avoid: "过度民族风堆叠；背景已经足够丰富。" },
  { id: "gobi", title: "戈壁与雅丹", english: "GOBI", background: "硬质岩体、强影、风与大面积空地", palette: ["黑", "白", "DENIM", "RUST", "银"], media: ["style-gobi-01", "style-gobi-02", "style-gobi-03", "style-gobi-04"], why: "强对比轮廓能回应雅丹的硬朗形状。", silhouette: ["利落外套", "直线长裤", "能被风带动的下摆"], texture: ["洗水牛仔", "皮革感", "哑光棉"], shoes: "封闭、稳、耐灰尘。", accessories: "墨镜和能固定的围巾；帽子不稳就不戴。", weather: "强风时减少松散配件，晒时优先遮挡和补水。", photo: "低机位、影子和小人物比站在每块石头前合影更有效。", avoid: "为造型携带会被风吹走、妨碍行动的物品。" },
];
