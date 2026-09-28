/**
 * Mock 响应生成器：根据接口 ID 模拟后端返回数据
 * 用于 API 详情页「在线调试」功能，模拟真实接口返回结构。
 */

// 通用成功包装
function ok(data, msg = 'success') {
  return {
    code: 200,
    msg,
    data
  }
}

// 假随机
function randomOf(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ==================== 各接口 mock 数据 ====================
const mocks = {
  // 图片服务
  img_compress(params) {
    return ok({
      size_before: '2.4MB',
      size_after: '486KB',
      ratio: '79.8%',
      width: 1920,
      height: 1080,
      format: 'jpg',
      url: 'https://picsum.photos/seed/compress/800/450'
    })
  },
  img_format(params) {
    return ok({
      origin_format: 'png',
      target_format: params.format || 'webp',
      width: 1280,
      height: 720,
      url: 'https://picsum.photos/seed/format/800/450'
    })
  },
  img_watermark(params) {
    return ok({
      url: 'https://picsum.photos/seed/watermark/800/450',
      position: params.position || 'br',
      text: params.text || '示例水印',
      opacity: 0.6
    })
  },
  img_crop(params) {
    return ok({
      url: 'https://picsum.photos/seed/crop/800/450',
      width: params.width || 800,
      height: params.height || 450,
      mode: 'center'
    })
  },
  img_webp(params) {
    return ok({
      size_before: '3.1MB',
      size_after: '892KB',
      ratio: '71.2%',
      format: 'webp',
      lossless: true,
      url: 'https://picsum.photos/seed/webp/800/450'
    })
  },
  img_idphoto(params) {
    return ok({
      url: 'https://picsum.photos/seed/idphoto/413/531',
      size: params.size || '一寸',
      bgColor: params.bgColor || 'blue',
      width: 295,
      height: 413
    })
  },
  img_ocr(params) {
    return ok({
      text: '三域聚合开放平台，免费提供稳定可靠的接口服务。\n欢迎开发者接入，文档完善，示例丰富。',
      language: 'zh',
      confidence: 0.98,
      words_count: 32
    })
  },
  img_pdf(params) {
    return ok({
      task_id: 'pdf_' + Date.now(),
      pages: 12,
      target: params.target || 'word',
      url: 'https://example.com/files/convert_' + Date.now() + '.docx'
    })
  },
  img_office2pdf(params) {
    return ok({
      task_id: 'office_' + Date.now(),
      pages: 8,
      url: 'https://example.com/files/convert_' + Date.now() + '.pdf'
    })
  },

  // 文本能力
  text_s2t(params) {
    const text = params.text || '欢迎大家使用三域聚合开放平台'
    const to = params.to || 'tc'
    const result = to === 'tc'
      ? text.replace(/欢迎/g, '歡迎').replace(/开放/g, '開放').replace(/平台/g, '平臺').replace(/大家/g, '大家')
      : text
    return ok({
      text: result,
      from: to === 'tc' ? '简体' : '繁体',
      to: to === 'tc' ? '繁体' : '简体'
    })
  },
  text_translate(params) {
    const text = params.text || 'Hello World'
    const dict = {
      en: '你好，世界',
      ja: 'こんにちは、世界',
      ko: '안녕하세요, 세계',
      fr: 'Bonjour le monde',
      de: 'Hallo Welt',
      ru: 'Привет, мир'
    }
    return ok({
      text: dict[params.to] || '你好，世界',
      from: params.from || 'auto',
      to: params.to || 'zh'
    })
  },
  text_couplet(params) {
    const keyword = params.keyword || '新春'
    const len = params.length || '7'
    return ok({
      keyword,
      upper: len === '7' ? `${keyword}佳节万象更新` : `${keyword}万象更新`,
      lower: len === '7' ? `盛世宏图百业兴隆` : `宏图百业兴`,
      horizontal: '福满人间',
      rhyme: 'ing'
    })
  },
  text_acrostic(params) {
    const keyword = params.keyword || '平安喜乐'
    return ok({
      keyword,
      type: params.type || 'head',
      poem: [
        `${keyword[0] || '平'}安岁月福绵长`,
        `${keyword[1] || '安'}康如意满庭芳`,
        `${keyword[2] || '喜'}气盈门春常在`,
        `${keyword[3] || '乐'}观向上谱华章`
      ]
    })
  },
  text_seg(params) {
    const text = params.text || '三域聚合开放平台提供智能分词服务'
    return ok({
      words: [
        { word: 'API', pos: 'n' },
        { word: '开放', pos: 'v' },
        { word: '平台', pos: 'n' },
        { word: '提供', pos: 'v' },
        { word: '智能', pos: 'a' },
        { word: '分词', pos: 'n' },
        { word: '服务', pos: 'n' }
      ]
    })
  },
  text_qrcode(params) {
    return ok({
      url: 'https://api.qrserver.com/v1/create-qr-code/?size=' + (params.size || 300) + 'x' + (params.size || 300) + '&data=' + encodeURIComponent(params.text || 'https://www.example.com'),
      size: params.size || 300,
      format: 'png'
    })
  },

  // 生活服务
  life_today() {
    const events = [
      { year: '1949', month: 10, day: 1, title: '中华人民共和国成立', desc: '开国大典在北京天安门广场举行' },
      { year: '2008', month: 8, day: 8, title: '北京奥运会开幕', desc: '第29届夏季奥林匹克运动会在北京开幕' },
      { year: '1997', month: 7, day: 1, title: '香港回归祖国', desc: '中国对香港恢复行使主权' },
      { year: '1964', month: 10, day: 16, title: '中国第一颗原子弹爆炸成功', desc: '中国自行研制的第一颗原子弹在新疆罗布泊爆炸成功' }
    ]
    return ok({ list: events.slice(0, 3) })
  },
  life_weather(params) {
    const city = params.city || '北京'
    const weathers = ['晴', '多云', '小雨', '阴', '晴转多云']
    return ok({
      city,
      today: {
        date: '2026-08-24',
        weather: randomOf(weathers),
        temp: '26°C',
        temp_range: '21°C ~ 31°C',
        humidity: '58%',
        wind: '东南风 3级',
        air_quality: '良'
      },
      forecast: [
        { date: '2026-08-25', weather: '多云', temp: '22°C ~ 30°C' },
        { date: '2026-08-26', weather: '小雨', temp: '21°C ~ 27°C' },
        { date: '2026-08-27', weather: '晴', temp: '23°C ~ 32°C' },
        { date: '2026-08-28', weather: '晴', temp: '24°C ~ 33°C' },
        { date: '2026-08-29', weather: '阴', temp: '22°C ~ 29°C' }
      ]
    })
  },
  life_beauty() {
    return ok({
      list: [
        { url: 'https://picsum.photos/seed/beauty1/1920/1080', title: '山间晨雾', width: 1920, height: 1080 },
        { url: 'https://picsum.photos/seed/beauty2/1920/1080', title: '城市夜景', width: 1920, height: 1080 }
      ]
    })
  },
  life_avatar() {
    return ok({
      list: [
        'https://picsum.photos/seed/avatar1/200/200',
        'https://picsum.photos/seed/avatar2/200/200',
        'https://picsum.photos/seed/avatar3/200/200',
        'https://picsum.photos/seed/avatar4/200/200',
        'https://picsum.photos/seed/avatar5/200/200'
      ]
    })
  },
  life_garbage(params) {
    const name = params.name || '香蕉皮'
    const types = ['厨余垃圾', '可回收物', '有害垃圾', '其他垃圾']
    const colors = { '厨余垃圾': 'green', '可回收物': 'blue', '有害垃圾': 'red', '其他垃圾': 'gray' }
    const t = randomOf(types)
    return ok({
      name,
      type: t,
      color: colors[t],
      tip: '请将' + name + '投入' + t + '垃圾桶'
    })
  },
  life_joke() {
    const jokes = [
      '程序员最讨厌的两件事：1. 写注释；2. 别人不写注释。',
      '为什么程序员分不清万圣节和圣诞节？因为 Oct 31 == Dec 25。',
      '产品经理对程序员说：这个需求很简单，怎么实现我不管。',
      '小明的代码没有 bug，只有 feature。',
      '如果你给猴子一台电脑，它会敲出莎士比亚吗？不会，它会先敲出 Stack Overflow。'
    ]
    return ok({ content: randomOf(jokes) })
  },
  life_xiehouyu(params) {
    const items = [
      { riddle: '孔夫子搬家', answer: '尽是输（书）' },
      { riddle: '外甥打灯笼', answer: '照旧（舅）' },
      { riddle: '小葱拌豆腐', answer: '一清二白' },
      { riddle: '哑巴吃黄连', answer: '有苦说不出' },
      { riddle: '骑驴看唱本', answer: '走着瞧' }
    ]
    return ok(params.keyword ? items.filter(i => i.riddle.includes(params.keyword)) : { item: randomOf(items) })
  },
  life_ip(params) {
    const ip = params.ip || '114.114.114.114'
    return ok({
      ip,
      country: '中国',
      province: '江苏省',
      city: '南京市',
      isp: '电信',
      lat: '32.06',
      lng: '118.79'
    })
  },
  life_phone(params) {
    const phone = params.phone || '13800138000'
    return ok({
      phone,
      province: '广东',
      city: '深圳',
      isp: '中国移动',
      area_code: '0755',
      post_code: '518000'
    })
  },

  // 趣味娱乐
  fun_soup() {
    const soups = [
      '生活明朗，万物可爱，人间值得，未来可期。',
      '星光不问赶路人，时光不负有心人。',
      '你若盛开，蝴蝶自来；你若精彩，天自安排。',
      '不要着急，最好的总会在最不经意的时候出现。',
      '愿你眼里有光，心中有爱，目光所至皆是星辰大海。'
    ]
    return ok({ content: randomOf(soups) })
  },
  fun_love() {
    const loves = [
      '今天路过花店，看到一束满天星，突然想起你笑起来的样子，比花还好看。',
      '世界那么大，能遇见你，已经是我这辈子最大的运气。',
      '想和你一起看四季轮转，把每一个平凡的日子过成诗。',
      '遇见你之后，我的生活多了一道光，连空气都是甜的。',
      '你是我写进日记里的秘密，也是我藏进心里的欢喜。'
    ]
    return ok({ content: randomOf(loves) })
  },
  fun_quote() {
    const quotes = [
      { content: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
      { content: '先天下之忧而忧，后天下之乐而乐。', author: '范仲淹' },
      { content: '天行健，君子以自强不息。', author: '《周易》' },
      { content: '读书破万卷，下笔如有神。', author: '杜甫' },
      { content: '人固有一死，或重于泰山，或轻于鸿毛。', author: '司马迁' }
    ]
    return ok(randomOf(quotes))
  },
  fun_news() {
    const news = [
      '【科技】国产大模型再突破，多模态能力全面升级',
      '【财经】央行开展逆回购操作，维护银行体系流动性合理充裕',
      '【体育】国家队备战国际赛事，集训名单公布',
      '【民生】多地出台新政策，进一步优化营商环境',
      '【文化】数字文创产业快速发展，市场规模持续扩大'
    ]
    return ok({ date: '2026-08-24', list: news.map((title, i) => ({ id: i + 1, title })) })
  },
  fun_poem(params) {
    const poems = [
      { title: '静夜思', author: '李白', dynasty: '唐', content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。' },
      { title: '春晓', author: '孟浩然', dynasty: '唐', content: '春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。' },
      { title: '水调歌头', author: '苏轼', dynasty: '宋', content: '明月几时有？把酒问青天。\n不知天上宫阙，今夕是何年。' },
      { title: '登鹳雀楼', author: '王之涣', dynasty: '唐', content: '白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。' }
    ]
    return ok(randomOf(poems))
  },
  fun_idiom() {
    const idioms = [
      { word: '画龙点睛', pinyin: 'huà lóng diǎn jīng', meaning: '比喻写文章或讲话时，在关键处用几句话点明实质，使内容生动有力。', source: '唐·张彦远《历代名画记》', example: '这篇文章的结尾画龙点睛，让整篇立意升华。' },
      { word: '卧薪尝胆', pinyin: 'wò xīn cháng dǎn', meaning: '形容人刻苦自励，发愤图强。', source: '《史记·越王勾践世家》', example: '他卧薪尝胆多年，终于东山再起。' },
      { word: '破釜沉舟', pinyin: 'pò fǔ chén zhōu', meaning: '比喻下决心不顾一切地干到底。', source: '《史记·项羽本纪》', example: '这次创业他抱着破釜沉舟的决心。' },
      { word: '持之以恒', pinyin: 'chí zhī yǐ héng', meaning: '长久地坚持下去。', source: '清·曾国藩《家训喻纪泽》', example: '学习贵在持之以恒，不能半途而废。' }
    ]
    return ok(randomOf(idioms))
  },

  // 数据查询
  data_company(params) {
    return ok({
      name: params.keyword || '深圳某某科技有限公司',
      credit_code: '91440300MA5XXXXXX0',
      legal_person: '张三',
      registered_capital: '1000万人民币',
      establish_date: '2020-06-18',
      status: '存续',
      address: '深圳市南山区科技园',
      scope: '计算机软硬件的技术开发、技术服务；信息咨询；经营电子商务等',
      industry: '软件和信息技术服务业',
      type: '有限责任公司'
    })
  },
  data_domain() {
    return ok({
      list: [
        { website: '官网', domain: 'example.com', record_no: '粤ICP备2020123456号-1' },
        { website: '商城', domain: 'shop.example.com', record_no: '粤ICP备2020123456号-2' }
      ]
    })
  },
  data_trademark() {
    return ok({
      list: [
        { name: '某某科技', reg_no: '12345678', class_no: '第9类', status: '已注册', valid_period: '2021-01-01 至 2031-01-01', applicant: '某某科技有限公司' }
      ]
    })
  },
  data_contact() {
    return ok({
      address: '广东省深圳市南山区科技园南区',
      phone: '0755-88888888',
      email: 'contact@example.com'
    })
  },
  data_icp(params) {
    return ok({
      domain: params.domain || 'example.com',
      record_no: '粤ICP备2020123456号-1',
      company: '某某科技有限公司',
      site_name: '某某官网',
      nature: '企业',
      audit_date: '2024-03-15'
    })
  },
  data_app() {
    return ok({
      app_name: '某某APP',
      record_no: '粤ICP备2020123456号-7A',
      company: '某某科技有限公司',
      audit_date: '2024-05-20',
      status: '已备案'
    })
  },
  data_mini() {
    return ok({
      app_name: '某某小程序',
      record_no: '粤ICP备2020123456号-3X',
      company: '某某科技有限公司',
      audit_date: '2024-06-01',
      status: '已备案'
    })
  }
}

/**
 * 模拟调用接口，返回假数据
 * @param {string} apiId 接口ID
 * @param {object} params 调用参数
 * @returns {Promise} 模拟响应
 */
export function mockCallApi(apiId, params = {}) {
  const handler = mocks[apiId]
  return new Promise((resolve) => {
    setTimeout(() => {
      if (handler) {
        resolve(handler(params))
      } else {
        resolve(ok({ message: '该接口暂无示例数据' }, 'success'))
      }
    }, 300 + Math.random() * 500)
  })
}
