/**
 * 平台假数据（Mock 数据中心）
 * 当前后端接口尚未就绪，所有页面数据均来自此处。
 * 后续后端就绪后，只需替换 api/ 目录下对应函数的实现即可。
 */

// ==================== 分类 ====================
export const categories = [
  { id: 'img', name: '图片服务', icon: 'Picture', desc: '图片压缩、格式转换、水印、OCR、证件照等图片处理能力', color: '#3a7afe', hot: true },
  { id: 'text', name: '文本能力', icon: 'EditPen', desc: '简繁转换、翻译、对联、藏头诗、智能分词、二维码生成', color: '#8b5cf6', hot: true },
  { id: 'life', name: '生活服务', icon: 'Sunny', desc: '天气、美图、头像、垃圾分类、笑话、歇后语、IP属地等', color: '#10b981', hot: true },
  { id: 'fun', name: '趣味娱乐', icon: 'MagicStick', desc: '心灵鸡汤、爱情日记、名人名言、新闻、随机诗词成语', color: '#f59e0b', hot: true },
  { id: 'data', name: '数据查询', icon: 'Search', desc: '企业工商、域名、商标、备案信息实时查询', color: '#ef4444', hot: true }
]

// ==================== 接口列表 ====================
// priceType: free=免费接口  vip=会员接口  pay=计次接口
export const apiList = [
  // ---------- 图片服务 ----------
  {
    id: 'img_compress',
    name: '图片压缩',
    category: 'img',
    icon: 'Compress',
    desc: '在线压缩图片体积，支持 JPG/PNG/WebP 格式，智能平衡画质与体积',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['图片', '压缩'],
    hot: true,
    applyType: 'apply',
    params: [
      { name: 'image', type: 'file', required: true, desc: '需要压缩的图片文件，支持 jpg/png/webp，最大 10MB' },
      { name: 'quality', type: 'int', required: false, desc: '压缩质量 1-100，默认 75' }
    ],
    requestUrl: 'https://api.example.com/img/compress',
    method: 'POST',
    successRate: '99.9%',
    avgTime: '320ms',
    totalCalls: 2864310
  },
  {
    id: 'img_format',
    name: '图片格式转换',
    category: 'img',
    icon: 'Switch',
    desc: '图片格式一键互转：JPG/PNG/WebP/BMP/GIF，无损转换保证画质',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['图片', '格式转换'],
    hot: false,
    applyType: 'apply',
    params: [
      { name: 'image', type: 'file', required: true, desc: '原图片文件' },
      { name: 'format', type: 'string', required: true, desc: '目标格式：jpg/png/webp/bmp' }
    ],
    requestUrl: 'https://api.example.com/img/format',
    method: 'POST',
    successRate: '99.8%',
    avgTime: '280ms',
    totalCalls: 1532094
  },
  {
    id: 'img_watermark',
    name: '图片水印',
    category: 'img',
    icon: 'Stamp',
    desc: '为图片添加文字/图片水印，支持平铺、位置、透明度、旋转等参数',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['图片', '水印'],
    hot: true,
    applyType: 'apply',
    params: [
      { name: 'image', type: 'file', required: true, desc: '原图片文件' },
      { name: 'text', type: 'string', required: false, desc: '水印文字内容' },
      { name: 'position', type: 'string', required: false, desc: '水印位置：lt/t/rt/l/c/r/lb/b/rb，默认 br' }
    ],
    requestUrl: 'https://api.example.com/img/watermark',
    method: 'POST',
    successRate: '99.9%',
    avgTime: '410ms',
    totalCalls: 986530
  },
  {
    id: 'img_crop',
    name: '图片裁剪',
    category: 'img',
    icon: 'Crop',
    desc: '按坐标或比例智能裁剪图片，支持居中裁剪、人脸识别裁剪',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['图片', '裁剪'],
    hot: false,
    applyType: 'apply',
    params: [
      { name: 'image', type: 'file', required: true, desc: '原图片文件' },
      { name: 'width', type: 'int', required: true, desc: '目标宽度（px）' },
      { name: 'height', type: 'int', required: true, desc: '目标高度（px）' }
    ],
    requestUrl: 'https://api.example.com/img/crop',
    method: 'POST',
    successRate: '99.8%',
    avgTime: '260ms',
    totalCalls: 712345
  },
  {
    id: 'img_webp',
    name: '无损压缩转WebP',
    category: 'img',
    icon: 'MagicStick',
    desc: '图片无损压缩并转换为 WebP 格式，体积平均减少 60%+，画质不变',
    priceType: 'vip',
    price: 0,
    freeTimes: 500,
    tags: ['图片', 'WebP', '无损压缩'],
    hot: true,
    applyType: 'apply',
    params: [
      { name: 'image', type: 'file', required: true, desc: '原图片文件，支持 png/jpg' },
      { name: 'lossless', type: 'bool', required: false, desc: '是否无损压缩，默认 true' }
    ],
    requestUrl: 'https://api.example.com/img/webp',
    method: 'POST',
    successRate: '99.9%',
    avgTime: '380ms',
    totalCalls: 458201
  },
  {
    id: 'img_idphoto',
    name: '证件照处理',
    category: 'img',
    icon: 'UserFilled',
    desc: '一键生成一寸/二寸证件照，自动换底色（白/蓝/红），智能美颜',
    priceType: 'pay',
    price: 0.02,
    freeTimes: 50,
    tags: ['证件照', 'AI', '换底色'],
    hot: true,
    applyType: 'apply',
    params: [
      { name: 'image', type: 'file', required: true, desc: '人像照片，正面免冠' },
      { name: 'size', type: 'string', required: false, desc: '证件照尺寸：1寸/2寸/小1寸，默认1寸' },
      { name: 'bgColor', type: 'string', required: false, desc: '底色：white/blue/red，默认 blue' }
    ],
    requestUrl: 'https://api.example.com/img/idphoto',
    method: 'POST',
    successRate: '98.5%',
    avgTime: '1.2s',
    totalCalls: 102344
  },
  {
    id: 'img_ocr',
    name: '图片OCR识别',
    category: 'img',
    icon: 'Document',
    desc: '识别图片中的文字，支持中/英/数字/符号，返回结构化文本',
    priceType: 'pay',
    price: 0.01,
    freeTimes: 100,
    tags: ['OCR', '文字识别', 'AI'],
    hot: true,
    applyType: 'apply',
    params: [
      { name: 'image', type: 'file', required: true, desc: '包含文字的图片' },
      { name: 'lang', type: 'string', required: false, desc: '语言：zh/en/auto，默认 auto' }
    ],
    requestUrl: 'https://api.example.com/img/ocr',
    method: 'POST',
    successRate: '97.8%',
    avgTime: '680ms',
    totalCalls: 523001
  },
  {
    id: 'img_pdf',
    name: 'PDF转换',
    category: 'img',
    icon: 'Files',
    desc: 'PDF 转 Word/图片/HTML，支持合并、拆分、压缩、加密等能力',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['PDF', '文件转换'],
    hot: false,
    applyType: 'apply',
    params: [
      { name: 'file', type: 'file', required: true, desc: 'PDF 文件' },
      { name: 'target', type: 'string', required: true, desc: '目标格式：word/image/html' }
    ],
    requestUrl: 'https://api.example.com/file/pdf',
    method: 'POST',
    successRate: '99.6%',
    avgTime: '2.1s',
    totalCalls: 234009
  },
  {
    id: 'img_office2pdf',
    name: 'Office转PDF',
    category: 'img',
    icon: 'DocumentCopy',
    desc: 'Word/Excel/PPT 一键转 PDF，保留原始排版，批量转换',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['Office', 'PDF', '文件转换'],
    hot: false,
    applyType: 'apply',
    params: [
      { name: 'file', type: 'file', required: true, desc: 'Word/Excel/PPT 文件' }
    ],
    requestUrl: 'https://api.example.com/file/office2pdf',
    method: 'POST',
    successRate: '99.5%',
    avgTime: '1.8s',
    totalCalls: 187633
  },

  // ---------- 文本能力 ----------
  {
    id: 'text_s2t',
    name: '简繁转换',
    category: 'text',
    icon: 'SwitchFilled',
    desc: '简体中文与繁体中文互转，支持台湾/香港用词习惯',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['简繁转换', '文本'],
    hot: false,
    applyType: 'apply',
    params: [
      { name: 'text', type: 'string', required: true, desc: '待转换的文本' },
      { name: 'to', type: 'string', required: false, desc: '转换方向：tc=简转繁 sc=繁转简，默认 tc' }
    ],
    requestUrl: 'https://api.example.com/text/convert',
    method: 'GET',
    successRate: '99.9%',
    avgTime: '80ms',
    totalCalls: 4532011
  },
  {
    id: 'text_translate',
    name: '文本翻译',
    category: 'text',
    icon: 'ChatDotRound',
    desc: '机器翻译，支持中、英、日、韩、法、德、俄等 20+ 语言互译',
    priceType: 'vip',
    price: 0,
    freeTimes: 200,
    tags: ['翻译', '多语言'],
    hot: true,
    applyType: 'apply',
    params: [
      { name: 'text', type: 'string', required: true, desc: '待翻译文本' },
      { name: 'from', type: 'string', required: false, desc: '源语言，默认 auto 自动识别' },
      { name: 'to', type: 'string', required: true, desc: '目标语言：en/ja/ko/fr/de/ru 等' }
    ],
    requestUrl: 'https://api.example.com/text/translate',
    method: 'GET',
    successRate: '99.7%',
    avgTime: '450ms',
    totalCalls: 1234056
  },
  {
    id: 'text_couplet',
    name: '智能对联生成',
    category: 'text',
    icon: 'Histogram',
    desc: '输入关键字生成押韵对联，支持五言/七言，春节必备',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['对联', 'AI', '生成'],
    hot: true,
    applyType: 'apply',
    params: [
      { name: 'keyword', type: 'string', required: true, desc: '对联主题关键字，如：新春' },
      { name: 'length', type: 'string', required: false, desc: '字数：5/7，默认 7' }
    ],
    requestUrl: 'https://api.example.com/text/couplet',
    method: 'GET',
    successRate: '99.2%',
    avgTime: '520ms',
    totalCalls: 890123
  },
  {
    id: 'text_acrostic',
    name: '藏头诗生成',
    category: 'text',
    icon: 'Edit',
    desc: '输入关键字生成藏头、藏尾、藏中等诗词，支持押韵',
    priceType: 'vip',
    price: 0,
    freeTimes: 300,
    tags: ['藏头诗', 'AI', '生成'],
    hot: true,
    applyType: 'apply',
    params: [
      { name: 'keyword', type: 'string', required: true, desc: '藏头关键字，最多 8 字' },
      { name: 'type', type: 'string', required: false, desc: '藏头/藏尾/藏中：head/tail/mid，默认 head' }
    ],
    requestUrl: 'https://api.example.com/text/acrostic',
    method: 'GET',
    successRate: '99.3%',
    avgTime: '800ms',
    totalCalls: 445670
  },
  {
    id: 'text_seg',
    name: 'AI智能分词',
    category: 'text',
    icon: 'Grid',
    desc: 'NLP 智能分词，快速把一段文本切分为词组，并标注词性',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['分词', 'NLP', 'AI'],
    hot: false,
    applyType: 'apply',
    params: [
      { name: 'text', type: 'string', required: true, desc: '待分词文本' }
    ],
    requestUrl: 'https://api.example.com/text/segment',
    method: 'GET',
    successRate: '99.8%',
    avgTime: '120ms',
    totalCalls: 2345678
  },
  {
    id: 'text_qrcode',
    name: '二维码生成',
    category: 'text',
    icon: 'FullScreen',
    desc: '根据内容生成二维码图片，支持自定义尺寸、颜色、Logo',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['二维码', '生成'],
    hot: true,
    applyType: 'apply',
    params: [
      { name: 'text', type: 'string', required: true, desc: '二维码内容（网址/文本）' },
      { name: 'size', type: 'int', required: false, desc: '尺寸 100-1000px，默认 300' }
    ],
    requestUrl: 'https://api.example.com/text/qrcode',
    method: 'GET',
    successRate: '99.9%',
    avgTime: '90ms',
    totalCalls: 3421987
  },

  // ---------- 生活服务 ----------
  {
    id: 'life_today',
    name: '历史上的今天',
    category: 'life',
    icon: 'Calendar',
    desc: '查询历史上的指定日期发生的大事，每天更新',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['历史', '日历'],
    hot: true,
    applyType: 'apply',
    params: [
      { name: 'date', type: 'string', required: false, desc: '日期，格式 MM-DD，默认今天' }
    ],
    requestUrl: 'https://api.example.com/life/today',
    method: 'GET',
    successRate: '99.9%',
    avgTime: '100ms',
    totalCalls: 3890123
  },
  {
    id: 'life_weather',
    name: '天气预报',
    category: 'life',
    icon: 'Cloudy',
    desc: '实时天气与未来 7 天预报，支持全国城市、经纬度查询',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['天气', '预报'],
    hot: true,
    applyType: 'apply',
    params: [
      { name: 'city', type: 'string', required: true, desc: '城市名，如：北京' }
    ],
    requestUrl: 'https://api.example.com/life/weather',
    method: 'GET',
    successRate: '99.8%',
    avgTime: '200ms',
    totalCalls: 5123900
  },
  {
    id: 'life_beauty',
    name: '每日美图',
    category: 'life',
    icon: 'Picture',
    desc: '随机返回两张精美壁纸，支持手机/桌面尺寸',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['美图', '壁纸'],
    hot: false,
    applyType: 'apply',
    params: [
      { name: 'type', type: 'string', required: false, desc: '类型：pc/mobile，默认 pc' }
    ],
    requestUrl: 'https://api.example.com/life/beauty',
    method: 'GET',
    successRate: '99.9%',
    avgTime: '150ms',
    totalCalls: 2234567
  },
  {
    id: 'life_avatar',
    name: '精选头像',
    category: 'life',
    icon: 'Avatar',
    desc: '随机返回五张精美头像，动漫/真人/插画风格可选',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['头像', '图片'],
    hot: false,
    applyType: 'apply',
    params: [
      { name: 'style', type: 'string', required: false, desc: '风格：anime/real/draw，默认 anime' }
    ],
    requestUrl: 'https://api.example.com/life/avatar',
    method: 'GET',
    successRate: '99.9%',
    avgTime: '160ms',
    totalCalls: 1876543
  },
  {
    id: 'life_garbage',
    name: '垃圾分类',
    category: 'life',
    icon: 'Delete',
    desc: '输入物品名称，查询属于可回收/有害/厨余/其他哪类垃圾',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['垃圾分类', '环保'],
    hot: false,
    applyType: 'apply',
    params: [
      { name: 'name', type: 'string', required: true, desc: '物品名称，如：香蕉皮' }
    ],
    requestUrl: 'https://api.example.com/life/garbage',
    method: 'GET',
    successRate: '99.7%',
    avgTime: '90ms',
    totalCalls: 987654
  },
  {
    id: 'life_joke',
    name: '笑话大全',
    category: 'life',
    icon: 'SemiSelect',
    desc: '随机返回一条幽默笑话，支持按类型筛选',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['笑话', '娱乐'],
    hot: false,
    applyType: 'apply',
    params: [
      { name: 'type', type: 'string', required: false, desc: '类型：cold/hot/couple，默认随机' }
    ],
    requestUrl: 'https://api.example.com/life/joke',
    method: 'GET',
    successRate: '99.9%',
    avgTime: '70ms',
    totalCalls: 3345678
  },
  {
    id: 'life_xiehouyu',
    name: '歇后语大全',
    category: 'life',
    icon: 'ChatLineSquare',
    desc: '随机歇后语，或根据关键字搜索歇后语',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['歇后语', '文化'],
    hot: false,
    applyType: 'apply',
    params: [
      { name: 'keyword', type: 'string', required: false, desc: '搜索关键字' }
    ],
    requestUrl: 'https://api.example.com/life/xiehouyu',
    method: 'GET',
    successRate: '99.9%',
    avgTime: '80ms',
    totalCalls: 1123456
  },
  {
    id: 'life_ip',
    name: 'IP属地查询',
    category: 'life',
    icon: 'Location',
    desc: '高精度 IP 归属地查询，支持 IPv4/IPv6，数据每月更新',
    priceType: 'vip',
    price: 0,
    freeTimes: 300,
    tags: ['IP', '定位'],
    hot: true,
    applyType: 'apply',
    params: [
      { name: 'ip', type: 'string', required: true, desc: 'IP 地址，支持 IPv4/IPv6' }
    ],
    requestUrl: 'https://api.example.com/life/ip',
    method: 'GET',
    successRate: '99.6%',
    avgTime: '110ms',
    totalCalls: 4567890
  },
  {
    id: 'life_phone',
    name: '手机号归属地',
    category: 'life',
    icon: 'Iphone',
    desc: '查询手机号归属地、运营商、号段信息',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['手机号', '归属地'],
    hot: false,
    applyType: 'apply',
    params: [
      { name: 'phone', type: 'string', required: true, desc: '11 位手机号码' }
    ],
    requestUrl: 'https://api.example.com/life/phone',
    method: 'GET',
    successRate: '99.8%',
    avgTime: '95ms',
    totalCalls: 2789012
  },

  // ---------- 趣味娱乐 ----------
  {
    id: 'fun_soup',
    name: '心灵鸡汤',
    category: 'fun',
    icon: 'Coffee',
    desc: '随机返回一条温暖治愈的心灵鸡汤语录',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['鸡汤', '语录'],
    hot: false,
    applyType: 'apply',
    params: [],
    requestUrl: 'https://api.example.com/fun/soup',
    method: 'GET',
    successRate: '99.9%',
    avgTime: '60ms',
    totalCalls: 2345098
  },
  {
    id: 'fun_love',
    name: '爱情日记',
    category: 'fun',
    icon: 'Cherry',
    desc: '随机返回一条甜蜜的爱情日记，适合表白、情书灵感',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['爱情', '日记'],
    hot: true,
    applyType: 'apply',
    params: [],
    requestUrl: 'https://api.example.com/fun/love',
    method: 'GET',
    successRate: '99.9%',
    avgTime: '65ms',
    totalCalls: 1567890
  },
  {
    id: 'fun_quote',
    name: '名人名言',
    category: 'fun',
    icon: 'Trophy',
    desc: '随机返回一条古今中外名人名言，附带作者信息',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['名言', '名人'],
    hot: false,
    applyType: 'apply',
    params: [],
    requestUrl: 'https://api.example.com/fun/quote',
    method: 'GET',
    successRate: '99.9%',
    avgTime: '60ms',
    totalCalls: 1890123
  },
  {
    id: 'fun_news',
    name: '新闻快讯',
    category: 'fun',
    icon: 'Bell',
    desc: '每日热点新闻速报，返回 15 条全球新闻速报与每日微语',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['新闻', '热点'],
    hot: true,
    applyType: 'apply',
    params: [],
    requestUrl: 'https://api.example.com/fun/news',
    method: 'GET',
    successRate: '99.8%',
    avgTime: '140ms',
    totalCalls: 3456789
  },
  {
    id: 'fun_poem',
    name: '随机诗词',
    category: 'fun',
    icon: 'Notebook',
    desc: '随机返回一篇古代诗词，包含作者、朝代、译文',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['诗词', '文化'],
    hot: false,
    applyType: 'apply',
    params: [
      { name: 'dynasty', type: 'string', required: false, desc: '朝代筛选：唐/宋/元/明/清' }
    ],
    requestUrl: 'https://api.example.com/fun/poem',
    method: 'GET',
    successRate: '99.9%',
    avgTime: '85ms',
    totalCalls: 2678901
  },
  {
    id: 'fun_idiom',
    name: '随机成语',
    category: 'fun',
    icon: 'Collection',
    desc: '随机返回一条成语，包含释义、出处、例句',
    priceType: 'free',
    price: 0,
    freeTimes: 1000,
    tags: ['成语', '文化'],
    hot: false,
    applyType: 'apply',
    params: [],
    requestUrl: 'https://api.example.com/fun/idiom',
    method: 'GET',
    successRate: '99.9%',
    avgTime: '70ms',
    totalCalls: 1456789
  },

  // ---------- 数据查询 ----------
  {
    id: 'data_company',
    name: '企业工商信息查询',
    category: 'data',
    icon: 'OfficeBuilding',
    desc: '根据企业名称或统一社会信用代码查询企业基本工商信息，支持模糊查询',
    priceType: 'pay',
    price: 0.01,
    freeTimes: 50,
    tags: ['工商', '企业'],
    hot: true,
    applyType: 'apply',
    params: [
      { name: 'keyword', type: 'string', required: true, desc: '企业名称或统一社会信用代码' },
      { name: 'page', type: 'int', required: false, desc: '页码，默认 1' }
    ],
    requestUrl: 'https://api.example.com/data/company',
    method: 'GET',
    successRate: '99.5%',
    avgTime: '350ms',
    totalCalls: 456701
  },
  {
    id: 'data_domain',
    name: '企业域名信息',
    category: 'data',
    icon: 'Link',
    desc: '查询企业备案域名信息，返回网站名称、域名、备案号等',
    priceType: 'pay',
    price: 0.2,
    freeTimes: 20,
    tags: ['域名', '企业'],
    hot: false,
    applyType: 'apply',
    params: [
      { name: 'keyword', type: 'string', required: true, desc: '企业名称' }
    ],
    requestUrl: 'https://api.example.com/data/domain',
    method: 'GET',
    successRate: '99.4%',
    avgTime: '400ms',
    totalCalls: 89012
  },
  {
    id: 'data_trademark',
    name: '商标查询',
    category: 'data',
    icon: 'Star',
    desc: '根据商标名称/注册号/申请人搜索商标信息，包含注册号、国际分类、专用权期限',
    priceType: 'pay',
    price: 0.2,
    freeTimes: 20,
    tags: ['商标', '知识产权'],
    hot: true,
    applyType: 'apply',
    params: [
      { name: 'keyword', type: 'string', required: true, desc: '商标名称/注册号/申请人' }
    ],
    requestUrl: 'https://api.example.com/data/trademark',
    method: 'GET',
    successRate: '99.3%',
    avgTime: '420ms',
    totalCalls: 67234
  },
  {
    id: 'data_contact',
    name: '企业联系方式',
    category: 'data',
    icon: 'Phone',
    desc: '工商公示企业联系方式，包括地址、电话、邮箱',
    priceType: 'pay',
    price: 0.1,
    freeTimes: 30,
    tags: ['企业', '联系方式'],
    hot: false,
    applyType: 'apply',
    params: [
      { name: 'keyword', type: 'string', required: true, desc: '企业名称' }
    ],
    requestUrl: 'https://api.example.com/data/contact',
    method: 'GET',
    successRate: '99.2%',
    avgTime: '380ms',
    totalCalls: 45321
  },
  {
    id: 'data_icp',
    name: 'ICP域名实时备案查询',
    category: 'data',
    icon: 'Checked',
    desc: '根据域名实时返回备案信息（与官网一致），适用于备案监控、备案接入系统',
    priceType: 'pay',
    price: 0.02,
    freeTimes: 100,
    tags: ['ICP', '备案'],
    hot: true,
    applyType: 'apply',
    params: [
      { name: 'domain', type: 'string', required: true, desc: '域名，如：example.com' }
    ],
    requestUrl: 'https://api.example.com/data/icp',
    method: 'GET',
    successRate: '99.6%',
    avgTime: '500ms',
    totalCalls: 123456
  },
  {
    id: 'data_app',
    name: 'APP备案查询',
    category: 'data',
    icon: 'Iphone',
    desc: '通过 APP 备案查询接口实时获取 APP 是否备案，企业必备查询接口',
    priceType: 'pay',
    price: 0.04,
    freeTimes: 50,
    tags: ['APP', '备案'],
    hot: false,
    applyType: 'apply',
    params: [
      { name: 'appName', type: 'string', required: true, desc: 'APP 名称' }
    ],
    requestUrl: 'https://api.example.com/data/app',
    method: 'GET',
    successRate: '99.5%',
    avgTime: '480ms',
    totalCalls: 34567
  },
  {
    id: 'data_mini',
    name: '小程序备案查询',
    category: 'data',
    icon: 'Platform',
    desc: '通过小程序备案查询接口实时获取小程序是否备案，覆盖微信、支付宝小程序',
    priceType: 'pay',
    price: 0.04,
    freeTimes: 50,
    tags: ['小程序', '备案'],
    hot: false,
    applyType: 'apply',
    params: [
      { name: 'appName', type: 'string', required: true, desc: '小程序名称' }
    ],
    requestUrl: 'https://api.example.com/data/mini',
    method: 'GET',
    successRate: '99.5%',
    avgTime: '470ms',
    totalCalls: 28901
  }
]

// ==================== 按分类获取接口 ====================
export function getApiListByCategory(categoryId) {
  return apiList.filter(item => item.category === categoryId)
}

export function getApiById(id) {
  return apiList.find(item => item.id === id) || null
}

export function searchApis(keyword) {
  const kw = (keyword || '').trim().toLowerCase()
  if (!kw) return apiList
  return apiList.filter(item =>
    item.name.toLowerCase().includes(kw) ||
    item.desc.toLowerCase().includes(kw) ||
    (item.tags || []).some(t => t.toLowerCase().includes(kw))
  )
}
