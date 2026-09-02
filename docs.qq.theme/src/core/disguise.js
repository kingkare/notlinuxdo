// 腾讯文档官方原型对齐的伪装核心引擎
const DisguiseEngine = (function () {
  let domObserver = null;
  let renderPassQueued = false;
  let routeListenersAttached = false;
  let postImageInteractionsAttached = false;

  const PAGE_SCOPE_CLASSES = [
    'qqdocs-page-secondary',
    'qqdocs-page-home',
    'qqdocs-page-list',
    'qqdocs-page-search',
    'qqdocs-page-topic',
    'qqdocs-page-categories',
    'qqdocs-page-tags',
    'qqdocs-page-badges',
    'qqdocs-page-users',
    'qqdocs-page-groups',
    'qqdocs-page-group',
    'qqdocs-page-user',
    'qqdocs-page-preferences',
    'qqdocs-page-bookmarks',
    'qqdocs-page-notifications',
    'qqdocs-page-messages',
    'qqdocs-page-about',
    'qqdocs-page-static',
    'qqdocs-page-auth',
    'qqdocs-page-review',
    'qqdocs-page-chat',
    'qqdocs-page-error',
    'qqdocs-page-generic'
  ];

  const POST_IMAGE_TOGGLE_WRAPPER = 'qqdocs-image-toggle';
  const POST_IMAGE_TOGGLE_HIDDEN = 'qqdocs-image-toggle--hidden';
  const POST_IMAGE_TOGGLE_SHOWN = 'qqdocs-image-toggle--shown';
  const POST_IMAGE_TOGGLE_OVERLAY = 'qqdocs-image-toggle-overlay';
  const POST_IMAGE_BOUND_ATTRIBUTE = 'data-qqdocs-image-toggle-bound';
  const POST_IMAGE_WRAPPER_ATTRIBUTE = 'data-qqdocs-image-toggle-wrapper';

  const POST_BODY_EMOJI_SELECTOR = [
    '.post-stream .cooked img.emoji',
    '.post-stream .cooked img.emoticon',
    '.post-stream .cooked img[data-emoji]',
    '.post-stream .cooked img[data-emoticon]',
    '.post-stream .cooked [data-emoji] > img',
    '.post-stream .cooked [data-emoticon] > img',
    '.post-stream .cooked [data-emoji-image]',
    '.post-stream .cooked [data-emoji-image] > img'
  ].join(', ');
  // Post metadata can contain the same emoji renderers as the cooked body,
  // but it is a separate, deliberately narrow scope. Metadata also contains
  // identity/avatar markup, so only the known emoji markers below qualify.
  const POST_META_EMOJI_SELECTOR = [
    '.post-stream .topic-meta-data img.emoji',
    '.post-stream .topic-meta-data img.emoticon',
    '.post-stream .topic-meta-data img[data-emoji]',
    '.post-stream .topic-meta-data img[data-emoticon]',
    '.post-stream .topic-meta-data [data-emoji] > img',
    '.post-stream .topic-meta-data [data-emoticon] > img',
    '.post-stream .topic-meta-data img[data-emoji-image]',
    '.post-stream .topic-meta-data [data-emoji-image] > img'
  ].join(', ');
  // Reaction summaries live in the post action bar rather than .cooked. Keep
  // this scope anchored to Discourse's reaction-list container so SVG action
  // icons, counters, avatars, and other controls are never treated as emoji.
  const POST_REACTION_EMOJI_SELECTOR = [
    '.post-stream nav.post-controls.collapsed .discourse-reactions-list-emoji img.emoji',
    '.post-stream nav.post-controls.collapsed .discourse-reactions-list-emoji img.emoticon',
    '.post-stream nav.post-controls.collapsed .discourse-reactions-list-emoji img[data-emoji]',
    '.post-stream nav.post-controls.collapsed .discourse-reactions-list-emoji img[data-emoticon]',
    '.post-stream nav.post-controls.collapsed .discourse-reactions-list-emoji [data-emoji] > img',
    '.post-stream nav.post-controls.collapsed .discourse-reactions-list-emoji [data-emoticon] > img',
    '.post-stream nav.post-controls.collapsed .discourse-reactions-list-emoji [data-emoji-image]',
    '.post-stream nav.post-controls.collapsed .discourse-reactions-list-emoji [data-emoji-image] > img',
    '.post-stream nav.post-controls .discourse-reactions-list-emoji img.emoji',
    '.post-stream nav.post-controls .discourse-reactions-list-emoji img.emoticon',
    '.post-stream nav.post-controls .discourse-reactions-list-emoji img[data-emoji]',
    '.post-stream nav.post-controls .discourse-reactions-list-emoji img[data-emoticon]',
    '.post-stream nav.post-controls .discourse-reactions-list-emoji [data-emoji] > img',
    '.post-stream nav.post-controls .discourse-reactions-list-emoji [data-emoticon] > img',
    '.post-stream nav.post-controls .discourse-reactions-list-emoji [data-emoji-image]',
    '.post-stream nav.post-controls .discourse-reactions-list-emoji [data-emoji-image] > img'
  ].join(', ');
  const POST_BOOST_EMOJI_SELECTOR = [
    '.post-stream button.discourse-boosts__cooked img.emoji',
    '.post-stream button.discourse-boosts__cooked img.emoticon',
    '.post-stream button.discourse-boosts__cooked img[data-emoji]',
    '.post-stream button.discourse-boosts__cooked img[data-emoticon]',
    '.post-stream button.discourse-boosts__cooked [data-emoji] > img',
    '.post-stream button.discourse-boosts__cooked [data-emoticon] > img',
    '.post-stream button.discourse-boosts__cooked [data-emoji-image] > img'
  ].join(', ');
  const POST_EMOJI_SELECTOR = `${POST_BODY_EMOJI_SELECTOR}, ${POST_META_EMOJI_SELECTOR}, ${POST_REACTION_EMOJI_SELECTOR}, ${POST_BOOST_EMOJI_SELECTOR}`;
  const POST_EMOJI_WRAPPER = 'qqdocs-emoji-wrapper';
  const POST_REACTION_EMOJI_WRAPPER = 'qqdocs-emoji-wrapper--reaction';
  const POST_EMOJI_LABEL = 'qqdocs-emoji-label';
  const POST_EMOJI_BOUND_ATTRIBUTE = 'data-qqdocs-emoji-bound';
  const POST_EMOJI_WRAPPER_ATTRIBUTE = 'data-qqdocs-emoji-wrapper';
  const POST_EMOJI_ARIA_HIDDEN_ADDED_ATTRIBUTE = 'data-qqdocs-emoji-aria-hidden-added';

  // The map intentionally contains common Discourse/Unicode aliases only. A
  // site-specific shortcode remains readable through the shortcode fallback.
  const COMMON_EMOJI_DESCRIPTIONS = Object.freeze({
    // Faces and emotions
    grinning: '咧嘴笑',
    grinning_face: '咧嘴笑',
    grin: '露齿笑',
    smile: '微笑',
    smiling_face: '微笑',
    blush: '害羞',
    smiling_face_with_smiling_eyes: '害羞',
    innocent: '天真',
    smiling_face_with_halo: '天真',
    slight_smile: '淡淡微笑',
    slightly_smiling_face: '淡淡微笑',
    upside_down_face: '颠倒脸',
    rofl: '大笑',
    rolling_on_the_floor_laughing: '大笑',
    joy: '喜极而泣',
    face_with_tears_of_joy: '喜极而泣',
    laugh: '笑',
    laughing: '大笑',
    grinning_face_with_smiling_eyes: '大笑',
    satisfied: '满意',
    beaming_face_with_smiling_eyes: '满意',
    sweat_smile: '汗笑',
    grinning_face_with_sweat: '汗笑',
    wink: '眨眼',
    winking_face: '眨眼',
    yum: '好吃',
    face_savoring_food: '好吃',
    stuck_out_tongue: '吐舌',
    face_with_tongue: '吐舌',
    stuck_out_tongue_winking_eye: '眨眼吐舌',
    winking_face_with_tongue: '眨眼吐舌',
    stuck_out_tongue_closed_eyes: '闭眼吐舌',
    squinting_face_with_tongue: '闭眼吐舌',
    money_mouth_face: '财迷',
    hugs: '拥抱',
    hugging: '拥抱',
    smiling_face_with_open_hands: '拥抱',
    hugging_face: '拥抱',
    kissing_heart: '飞吻',
    face_blowing_a_kiss: '飞吻',
    kissing: '亲吻',
    kissing_face: '亲吻',
    kissing_smiling_eyes: '微笑亲吻',
    kissing_face_with_smiling_eyes: '微笑亲吻',
    kissing_closed_eyes: '闭眼亲吻',
    kissing_face_with_closed_eyes: '闭眼亲吻',
    heart_eyes: '花痴',
    smiling_face_with_heart_eyes: '花痴',
    star_struck: '星星眼',
    zany_face: '滑稽',
    crazy_face: '疯狂',
    woozy_face: '迷糊',
    sweat: '冷汗',
    downcast_face_with_sweat: '冷汗',
    thinking: '思考',
    thinking_face: '思考',
    neutral_face: '面无表情',
    expressionless: '无表情',
    unamused: '不满',
    pensive: '沉思',
    confused: '困惑',
    relieved: '如释重负',
    relieved_face: '如释重负',
    relaxed: '放松',
    smirk: '得意',
    smirking_face: '得意',
    no_mouth: '无语',
    face_without_mouth: '无语',
    zipper_mouth_face: '闭嘴',
    shushing_face: '嘘',
    lying_face: '说谎',
    rolling_eyes: '翻白眼',
    face_with_rolling_eyes: '翻白眼',
    grimacing: '龇牙',
    grimacing_face: '龇牙',
    frowning: '皱眉',
    frowning_face: '皱眉',
    worried: '担心',
    worried_face: '担心',
    angry: '生气',
    angry_face: '生气',
    rage: '暴怒',
    enraged_face: '暴怒',
    disappointed: '失望',
    disappointed_face: '失望',
    cry: '哭泣',
    crying_face: '哭泣',
    sob: '痛哭',
    loudly_crying_face: '痛哭',
    fearful: '害怕',
    fearful_face: '害怕',
    scared: '害怕',
    scream: '尖叫',
    face_screaming_in_fear: '尖叫',
    astonished: '惊讶',
    astonished_face: '惊讶',
    flushed: '脸红',
    weary: '疲惫',
    weary_face: '疲惫',
    tired_face: '疲倦',
    sleepy: '困倦',
    sleepy_face: '困倦',
    sleeping: '睡觉',
    sleeping_face: '睡觉',
    drooling_face: '流口水',
    dizzy_face: '晕眩',
    nauseated_face: '恶心',
    vomiting_face: '呕吐',
    face_vomiting: '呕吐',
    sneezing_face: '打喷嚏',
    mask: '生病',
    face_with_medical_mask: '生病',
    thermometer_face: '发烧',
    face_with_thermometer: '发烧',
    exploding_head: '爆炸头',
    cowboy_hat_face: '牛仔帽',
    clown_face: '小丑',
    imp: '小恶魔',
    smiling_imp: '恶魔',
    smiling_face_with_horns: '恶魔',
    angry_face_with_horns: '小恶魔',
    skull: '骷髅',
    skull_and_crossbones: '骷髅头',
    ghost: '幽灵',
    alien: '外星人',
    robot: '机器人',
    poop: '便便',
    hankey: '便便',
    shit: '便便',
    // Hands, gestures, and body parts
    wave: '挥手',
    raised_back_of_hand: '举手背',
    raised_hand: '举手',
    hand: '举手',
    raised_hand_with_fingers_splayed: '举手',
    open_hands: '张开双手',
    palms_up_together: '双手向上',
    point_up: '指向上方',
    index_pointing_up: '指向上方',
    point_up_2: '指向上方',
    backhand_index_pointing_up: '指向上方',
    point_down: '指向下方',
    backhand_index_pointing_down: '指向下方',
    point_left: '指向左方',
    backhand_index_pointing_left: '指向左方',
    point_right: '指向右方',
    backhand_index_pointing_right: '指向右方',
    thumbsup: '点赞',
    '+1': '点赞',
    thumbs_up: '点赞',
    thumbsdown: '点踩',
    '-1': '点踩',
    thumbs_down: '点踩',
    ok_hand: '好的手势',
    pinched_fingers: '捏指',
    pinching_hand: '捏合',
    v: '胜利手势',
    victory_hand: '胜利手势',
    crossed_fingers: '祈求好运',
    fingers_crossed: '祈求好运',
    love_you_gesture: '我爱你手势',
    metal: '摇滚手势',
    sign_of_the_horns: '摇滚手势',
    call_me_hand: '打电话手势',
    handshake: '握手',
    clap: '鼓掌',
    clapping_hands: '鼓掌',
    pray: '祈祷',
    folded_hands: '祈祷',
    muscle: '肌肉',
    flexed_biceps: '展示肌肉',
    fist: '拳头',
    punch: '出拳',
    facepunch: '出拳',
    oncoming_fist: '出拳',
    raised_fist: '举拳',
    left_facing_fist: '左拳',
    right_facing_fist: '右拳',
    writing_hand: '写字',
    nail_care: '美甲',
    ear: '耳朵',
    eyes: '双眼',
    eye: '眼睛',
    lips: '嘴唇',
    tongue: '舌头',
    nose: '鼻子',
    brain: '大脑',
    // Hearts, symbols, and celebration
    heart: '红心',
    red_heart: '红心',
    orange_heart: '橙心',
    yellow_heart: '黄心',
    green_heart: '绿心',
    blue_heart: '蓝心',
    purple_heart: '紫心',
    black_heart: '黑心',
    white_heart: '白心',
    brown_heart: '棕心',
    broken_heart: '心碎',
    sparkling_heart: '闪耀的心',
    growing_heart: '成长的心',
    heartpulse: '心跳',
    heartbeat: '心跳',
    beating_heart: '心跳',
    revolving_hearts: '旋转的心',
    two_hearts: '两颗心',
    couple_with_heart: '情侣心',
    gift_heart: '爱心礼物',
    cupid: '丘比特',
    fire: '火焰',
    sparkles: '闪光',
    star: '星星',
    star2: '发光星星',
    glowing_star: '发光星星',
    dizzy: '头晕',
    boom: '爆炸',
    collision: '碰撞',
    anger: '怒气',
    sweat_drops: '汗滴',
    sweat_droplets: '汗滴',
    dash: '飞奔',
    dashing_away: '飞奔',
    100: '满分',
    hundred_points: '满分',
    exclamation: '感叹号',
    red_exclamation_mark: '感叹号',
    question: '问号',
    red_question_mark: '问号',
    grey_exclamation: '灰色感叹号',
    white_exclamation_mark: '灰色感叹号',
    grey_question: '灰色问号',
    white_question_mark: '灰色问号',
    warning: '警告',
    white_check_mark: '白色对勾',
    check_mark_button: '白色对勾',
    heavy_check_mark: '粗体对勾',
    check_mark: '粗体对勾',
    x: '叉号',
    cross_mark: '叉号',
    heavy_multiplication_x: '粗体叉号',
    bangbang: '双感叹号',
    interrobang: '问叹号',
    tada: '庆祝',
    party_popper: '庆祝',
    confetti_ball: '彩纸球',
    balloon: '气球',
    gift: '礼物',
    birthday: '生日',
    trophy: '奖杯',
    medal_sports: '奖牌',
    sports_medal: '奖牌',
    crown: '王冠',
    gem: '宝石',
    gem_stone: '宝石',
    rainbow: '彩虹',
    // Food, drink, and everyday objects
    apple: '苹果',
    green_apple: '青苹果',
    pear: '梨',
    tangerine: '橘子',
    orange: '橘子',
    lemon: '柠檬',
    banana: '香蕉',
    watermelon: '西瓜',
    grapes: '葡萄',
    strawberry: '草莓',
    peach: '桃子',
    cherries: '樱桃',
    pineapple: '菠萝',
    tomato: '番茄',
    corn: '玉米',
    ear_of_corn: '玉米',
    mushroom: '蘑菇',
    pizza: '披萨',
    hamburger: '汉堡',
    fries: '薯条',
    french_fries: '薯条',
    hotdog: '热狗',
    ramen: '拉面',
    steaming_bowl: '拉面',
    rice: '米饭',
    cooked_rice: '米饭',
    curry: '咖喱饭',
    curry_rice: '咖喱饭',
    sushi: '寿司',
    cake: '蛋糕',
    shortcake: '蛋糕',
    birthday_cake: '生日蛋糕',
    cookie: '饼干',
    chocolate_bar: '巧克力',
    candy: '糖果',
    lollipop: '棒棒糖',
    icecream: '冰淇淋',
    ice_cream: '冰淇淋',
    coffee: '咖啡',
    tea: '茶',
    teacup_without_handle: '茶',
    beer: '啤酒',
    beers: '碰杯',
    clinking_beer_mugs: '碰杯',
    cocktail: '鸡尾酒',
    tropical_drink: '鸡尾酒',
    wine_glass: '红酒',
    champagne: '香槟',
    bottle_with_popping_cork: '香槟',
    fork_and_knife: '刀叉',
    plate_with_cutlery: '餐盘',
    bulb: '灯泡',
    light_bulb: '灯泡',
    flashlight: '手电筒',
    book: '书',
    books: '书籍',
    memo: '备忘录',
    pencil2: '铅笔',
    pencil: '铅笔',
    pen: '钢笔',
    notebook: '笔记本',
    bookmark: '书签',
    pushpin: '图钉',
    paperclip: '回形针',
    scissors: '剪刀',
    lock: '锁',
    unlock: '开锁',
    key: '钥匙',
    hammer: '锤子',
    wrench: '扳手',
    gear: '齿轮',
    link: '链接',
    package: '包裹',
    moneybag: '钱袋',
    money_bag: '钱袋',
    dollar: '美元',
    dollar_banknote: '美元',
    yen: '日元',
    yen_banknote: '日元',
    euro: '欧元',
    euro_banknote: '欧元',
    pound: '英镑',
    pound_banknote: '英镑',
    chart_with_upwards_trend: '上涨趋势',
    chart_increasing: '上涨趋势',
    calendar: '日历',
    computer: '电脑',
    laptop: '电脑',
    keyboard: '键盘',
    printer: '打印机',
    iphone: '手机',
    mobile_phone: '手机',
    calling: '电话',
    telephone_receiver: '电话',
    // Animals and nature
    dog: '狗',
    dog_face: '狗',
    cat: '猫',
    cat_face: '猫',
    mouse: '老鼠',
    mouse_face: '老鼠',
    hamster: '仓鼠',
    rabbit: '兔子',
    rabbit_face: '兔子',
    fox_face: '狐狸',
    fox: '狐狸',
    bear: '熊',
    panda_face: '熊猫',
    panda: '熊猫',
    koala: '考拉',
    tiger: '老虎',
    tiger_face: '老虎',
    lion: '狮子',
    cow: '奶牛',
    cow_face: '奶牛',
    pig: '猪',
    pig_face: '猪',
    frog: '青蛙',
    monkey_face: '猴子',
    monkey: '猴子',
    see_no_evil: '捂眼猴',
    hear_no_evil: '捂耳猴',
    speak_no_evil: '捂嘴猴',
    chicken: '小鸡',
    penguin: '企鹅',
    bird: '鸟',
    baby_chick: '小鸡宝宝',
    unicorn: '独角兽',
    bee: '蜜蜂',
    honeybee: '蜜蜂',
    bug: '虫子',
    butterfly: '蝴蝶',
    snail: '蜗牛',
    turtle: '乌龟',
    octopus: '章鱼',
    fish: '鱼',
    whale: '鲸鱼',
    dolphin: '海豚',
    shark: '鲨鱼',
    sun_with_face: '太阳脸',
    sun: '太阳',
    crescent_moon: '弯月',
    full_moon: '满月',
    cloud: '云',
    umbrella: '雨伞',
    snowflake: '雪花',
    zap: '闪电',
    high_voltage: '闪电',
    // Places and transport
    rocket: '火箭',
    airplane: '飞机',
    car: '汽车',
    automobile: '汽车',
    taxi: '出租车',
    bus: '公交车',
    train: '火车',
    locomotive: '火车',
    bicycle: '自行车',
    ship: '轮船',
    anchor: '锚',
    house: '房子',
    office: '办公楼',
    office_building: '办公楼',
    hospital: '医院',
    school: '学校',
    tent: '帐篷',
    church: '教堂',
    fountain: '喷泉',
    map: '地图',
    world_map: '地图',
    globe_with_meridians: '地球',
    globe_showing_europe_africa: '地球',
    // Activities and clothing
    soccer: '足球',
    soccer_ball: '足球',
    basketball: '篮球',
    football: '橄榄球',
    american_football: '橄榄球',
    baseball: '棒球',
    tennis: '网球',
    medal_military: '军功章',
    military_medal: '军功章',
    performing_arts: '表演艺术',
    art: '艺术',
    artist_palette: '艺术',
    microphone: '麦克风',
    guitar: '吉他',
    headphones: '耳机',
    t_shirt: 'T恤',
    jeans: '牛仔裤',
    shoe: '鞋子',
    running_shoe: '鞋子',
    watch: '手表',
    eyeglasses: '眼镜',
    sunglasses: '墨镜',
    umbrella_on_ground: '收起的雨伞'
  });

  const POST_IMAGE_EXCLUDED_ANCESTORS = [
    '.avatar',
    '.avatar-flair',
    '.emoji',
    '.emoticon',
    '.user-badge',
    '.badge',
    '.badge-card',
    '.badge-icon',
    '.post-avatar',
    '.topic-avatar',
    '.user-card',
    '.post-controls',
    '.topic-map',
    '[data-emoji]',
    '[data-user-card]'
  ];

  const POST_IMAGE_EXCLUDED_CLASS_PATTERN = /(?:^|[\s_-])(avatar|emoji|emoticon|badge|icon|reaction|retort|flair)(?:$|[\s_-])/i;

  // These containers/classes are identity or control UI that may coexist in
  // .topic-meta-data. They must never be converted merely because a nested
  // image happens to carry an emoji-like attribute.
  const POST_META_EMOJI_EXCLUDED_ANCESTORS = [
    '.avatar',
    '.avatar-flair',
    '.user-badge',
    '.badge',
    '.badge-card',
    '.badge-icon',
    '.post-avatar',
    '.topic-avatar',
    '.user-card',
    '.post-controls',
    '.topic-map',
    '[data-user-card]'
  ];

  function isTopicDetailActive() {
    return Boolean(document.querySelector('.post-stream'));
  }

  function isPostImageExcluded(image) {
    if (!image || image.tagName !== 'IMG') return true;

    const cooked = image.closest('.cooked');
    if (!cooked || !cooked.closest('.post-stream')) return true;
    if (image.closest(POST_IMAGE_EXCLUDED_ANCESTORS.join(', '))) return true;

    const className = typeof image.className === 'string' ? image.className : '';
    if (POST_IMAGE_EXCLUDED_CLASS_PATTERN.test(className)) return true;

    const alt = normalizeStatText(image.getAttribute('alt')).toLowerCase();
    const title = normalizeStatText(image.getAttribute('title')).toLowerCase();
    if (/^:[\w+.-]+:$/.test(alt) || /emoji|emoticon|avatar|badge|icon|头像|表情|徽章|图标/.test(`${alt} ${title}`)) return true;

    const src = normalizeStatText(image.currentSrc || image.getAttribute('src') || image.getAttribute('data-src')).toLowerCase();

    // Tiny transparent pixels are tracking/layout helpers, not post content.
    const width = Number(image.getAttribute('width') || image.width || 0);
    const height = Number(image.getAttribute('height') || image.height || 0);
    if (width > 0 && height > 0 && width <= 16 && height <= 16 && /(?:pixel|spacer|blank|transparent|tracking)/.test(`${src} ${alt} ${title}`)) {
      return true;
    }

    return false;
  }

  function getPostImageFromToggle(toggle) {
    if (!toggle) return null;
    const media = Array.from(toggle.children).find((child) => child.tagName === 'IMG' || child.tagName === 'PICTURE');
    return media?.tagName === 'IMG' ? media : media?.querySelector('img');
  }

  function setPostImageToggleState(toggle, isVisible) {
    if (!toggle) return;
    const overlay = toggle.querySelector(`.${POST_IMAGE_TOGGLE_OVERLAY}`);
    const image = getPostImageFromToggle(toggle);
    const alt = normalizeStatText(image?.getAttribute('alt'));
    const imageDescription = alt ? `图片：${alt}，` : '图片，';
    const label = `${imageDescription}${isVisible ? '双击隐藏图片' : '双击显示图片'}`;

    toggle.classList.toggle(POST_IMAGE_TOGGLE_HIDDEN, !isVisible);
    toggle.classList.toggle(POST_IMAGE_TOGGLE_SHOWN, isVisible);
    toggle.dataset.qqdocsImageVisible = String(isVisible);

    if (overlay) {
      overlay.hidden = isVisible;
      overlay.textContent = isVisible ? '双击隐藏图片' : '双击显示图片';
      overlay.setAttribute('aria-label', label);
      overlay.setAttribute('title', label);
    }
  }

  function findPostImageToggle(eventTarget) {
    if (!(eventTarget instanceof Element)) return null;
    const toggle = eventTarget.closest(`.${POST_IMAGE_TOGGLE_WRAPPER}`);
    if (!toggle || !toggle.closest('.cooked') || !toggle.closest('.post-stream')) return null;
    return toggle;
  }

  function handlePostImageClick(event) {
    if (!isTopicDetailActive()) return;
    const toggle = findPostImageToggle(event.target);
    if (!toggle) return;

    // A lightbox is normally opened from a delegated click handler. Suppress
    // both clicks that precede dblclick so a deliberate double-click never
    // navigates away or opens the native lightbox first.
    event.preventDefault();
    event.stopPropagation();
  }

  function handlePostImageDoubleClick(event) {
    if (!isTopicDetailActive()) return;
    const toggle = findPostImageToggle(event.target);
    if (!toggle) return;

    event.preventDefault();
    event.stopPropagation();
    setPostImageToggleState(toggle, !toggle.classList.contains(POST_IMAGE_TOGGLE_SHOWN));
  }

  function handlePostImageKeydown(event) {
    if (!isTopicDetailActive()) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    // The surrounding lightbox anchor can remain in the tab order. Treat a
    // keyboard activation anywhere on the target as the same toggle action so
    // Enter/Space cannot accidentally navigate while the image is concealed.
    const toggle = event.target instanceof Element ? findPostImageToggle(event.target) : null;
    if (!toggle) return;

    event.preventDefault();
    event.stopPropagation();
    if (!event.repeat) setPostImageToggleState(toggle, !toggle.classList.contains(POST_IMAGE_TOGGLE_SHOWN));
  }

  function attachPostImageInteractions() {
    if (postImageInteractionsAttached) return;
    postImageInteractionsAttached = true;
    document.addEventListener('click', handlePostImageClick, true);
    document.addEventListener('dblclick', handlePostImageDoubleClick, true);
    document.addEventListener('keydown', handlePostImageKeydown, true);
  }

  function createPostImageToggle(image) {
    if (isPostImageExcluded(image) || image.hasAttribute(POST_IMAGE_BOUND_ATTRIBUTE)) return;

    // Keep <picture>'s source/img relationship valid by wrapping the whole
    // picture element. For ordinary images only the image node is wrapped.
    const media = image.parentElement?.tagName === 'PICTURE' ? image.parentElement : image;
    const parent = media.parentNode;
    if (!parent || parent.closest(`.${POST_IMAGE_TOGGLE_WRAPPER}`)) return;

    const toggle = document.createElement('span');
    toggle.className = `${POST_IMAGE_TOGGLE_WRAPPER} ${POST_IMAGE_TOGGLE_HIDDEN}`;
    toggle.setAttribute(POST_IMAGE_WRAPPER_ATTRIBUTE, 'true');
    toggle.setAttribute('role', 'group');

    const overlay = document.createElement('span');
    overlay.className = POST_IMAGE_TOGGLE_OVERLAY;
    overlay.setAttribute('role', 'button');
    overlay.tabIndex = 0;
    overlay.setAttribute('aria-label', '双击显示图片');
    overlay.setAttribute('title', '双击显示图片');

    parent.insertBefore(toggle, media);
    toggle.append(media, overlay);
    image.setAttribute(POST_IMAGE_BOUND_ATTRIBUTE, 'true');
    setPostImageToggleState(toggle, false);
  }

  function unwrapPostImageToggle(toggle) {
    if (!toggle || !toggle.hasAttribute(POST_IMAGE_WRAPPER_ATTRIBUTE)) return;
    const media = Array.from(toggle.children).find((child) => child.tagName === 'IMG' || child.tagName === 'PICTURE');
    const image = media?.tagName === 'IMG' ? media : media?.querySelector('img');

    if (media && toggle.parentNode) toggle.parentNode.insertBefore(media, toggle);
    if (image) image.removeAttribute(POST_IMAGE_BOUND_ATTRIBUTE);
    toggle.remove();
  }

  function cleanupPostImageToggles() {
    document.querySelectorAll(`.${POST_IMAGE_TOGGLE_WRAPPER}[${POST_IMAGE_WRAPPER_ATTRIBUTE}]`).forEach(unwrapPostImageToggle);
    document.body?.classList.remove('qqdocs-image-toggle-enabled');
  }

  function syncPostImageToggles() {
    const active = isTopicDetailActive();
    if (!active) {
      cleanupPostImageToggles();
      return;
    }

    attachPostImageInteractions();
    document.body?.classList.add('qqdocs-image-toggle-enabled');

    document.querySelectorAll('.post-stream .cooked img').forEach((image) => {
      if (image.hasAttribute(POST_IMAGE_BOUND_ATTRIBUTE) && !image.closest(`.${POST_IMAGE_TOGGLE_WRAPPER}`)) {
        image.removeAttribute(POST_IMAGE_BOUND_ATTRIBUTE);
      }
      createPostImageToggle(image);
    });

    document.querySelectorAll(`.${POST_IMAGE_TOGGLE_WRAPPER}[${POST_IMAGE_WRAPPER_ATTRIBUTE}]`).forEach((toggle) => {
      const image = getPostImageFromToggle(toggle);
      if (!image || isPostImageExcluded(image)) {
        unwrapPostImageToggle(toggle);
        return;
      }
      if (!toggle.classList.contains(POST_IMAGE_TOGGLE_HIDDEN) && !toggle.classList.contains(POST_IMAGE_TOGGLE_SHOWN)) {
        setPostImageToggleState(toggle, false);
      }
    });
  }

  function isPostEmoji(image) {
    if (!image || image.tagName !== 'IMG') return false;

    const cooked = image.closest('.cooked');
    if (!cooked || !cooked.closest('.post-stream')) return false;
    // Metadata has its own selector and validator below. Keeping it out of
    // this body-only predicate makes the .topic-meta-data boundary explicit.
    if (image.closest('.topic-meta-data')) return false;

    // Discourse currently uses img.emoji; the data-* variants cover older
    // renderers and custom emoji markup without broadening this to ordinary
    // content images.
    if (image.matches('img.emoji, img.emoticon, img[data-emoji], img[data-emoticon], img[data-emoji-image]')) {
      return true;
    }

    return Boolean(image.closest('[data-emoji], [data-emoticon], [data-emoji-image]'));
  }

  function isPostMetaEmoji(image) {
    if (!image || image.tagName !== 'IMG') return false;

    const metadata = image.closest('.post-stream .topic-meta-data');
    if (!metadata) return false;

    // Keep avatar, badge, user-card, and control images out even if a site
    // decorates them with a generic emoji/data-* class or attribute.
    if (image.closest(POST_META_EMOJI_EXCLUDED_ANCESTORS.join(', '))) return false;

    const className = typeof image.className === 'string' ? image.className : '';
    if (/(?:^|[\s_-])(avatar|badge|icon|reaction|retort|flair)(?:$|[\s_-])/i.test(className)) {
      return false;
    }

    return image.matches(
      'img.emoji, img.emoticon, img[data-emoji], img[data-emoticon], img[data-emoji-image]'
    ) || Boolean(image.closest('[data-emoji], [data-emoticon], [data-emoji-image]'));
  }

  function isPostReactionEmoji(image) {
    if (!image || image.tagName !== 'IMG') return false;

    const reactionList = image.closest(
      '.post-stream nav.post-controls .discourse-reactions-list-emoji'
    );
    if (!reactionList) return false;

    // Keep the operation-bar scope just as narrow as the query selector:
    // ordinary images or SVG-backed action controls must not be wrapped.
    return image.matches(
      'img.emoji, img.emoticon, img[data-emoji], img[data-emoticon], img[data-emoji-image]'
    ) || Boolean(image.closest('[data-emoji], [data-emoticon], [data-emoji-image]'));
  }

  function isPostBoostEmoji(image) {
    if (!image || image.tagName !== 'IMG') return false;
    if (!image.closest('.post-stream button.discourse-boosts__cooked')) return false;

    return image.matches(
      'img.emoji, img.emoticon, img[data-emoji], img[data-emoticon], img[data-emoji-image]'
    ) || Boolean(image.closest('[data-emoji], [data-emoticon], [data-emoji-image]'));
  }

  function isTopicEmoji(image) {
    return isPostEmoji(image) || isPostMetaEmoji(image) || isPostReactionEmoji(image) || isPostBoostEmoji(image);
  }

  function normalizeEmojiAttribute(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function extractEmojiShortcode(value) {
    const normalized = normalizeEmojiAttribute(value);
    if (!normalized || /^(?:emoji|emoticon|表情|表情包)$/i.test(normalized)) return '';

    const colonMatch = normalized.match(/:([A-Za-z0-9][A-Za-z0-9_+.-]*):/);
    if (colonMatch) return colonMatch[1];

    // Some older Discourse renderers put the shortcode in title/data-name
    // without colons. Keep this deliberately narrow to avoid using alt text
    // such as a sentence as a shortcode.
    const bareMatch = normalized.match(/^([A-Za-z0-9][A-Za-z0-9_+.-]*)$/);
    return bareMatch ? bareMatch[1] : '';
  }

  function extractReasonableEmojiName(value) {
    const normalized = normalizeEmojiAttribute(value);
    if (!normalized || /^(?:emoji|emoticon|表情|表情包)$/i.test(normalized)) return '';
    if (/^:[^:\s]+:$/.test(normalized)) return '';

    // A few renderers expose a localized accessible name instead of a
    // shortcode. Accept short human-readable names, but never use a raw
    // Unicode glyph or a long sentence as the label.
    if (/^[\u3400-\u9fff\u3040-\u30ffA-Za-z0-9][\u3400-\u9fff\u3040-\u30ffA-Za-z0-9 _+.-]{0,39}$/.test(normalized)) {
      return normalized;
    }
    return '';
  }

  function getEmojiDescription(image) {
    const metadataValues = [
      image?.getAttribute('alt'),
      image?.getAttribute('title'),
      image?.getAttribute('data-emoji'),
      image?.getAttribute('data-emoji-name'),
      image?.getAttribute('data-emoji-shortcode'),
      image?.getAttribute('data-name'),
      image?.getAttribute('aria-label')
    ];

    // alt is the canonical Discourse source; title and data-* values are
    // fallbacks for custom/older emoji renderers.
    for (const value of metadataValues) {
      const shortcode = extractEmojiShortcode(value);
      if (shortcode) return COMMON_EMOJI_DESCRIPTIONS[shortcode.toLowerCase()] || shortcode;
    }

    for (const value of metadataValues) {
      const localizedName = extractReasonableEmojiName(value);
      if (localizedName) return localizedName;
    }

    // If attributes are missing, the emoji asset filename is normally its
    // shortcode (e.g. /emoji/twitter/rofl.png). This is still scoped to an
    // already identified emoji image, so ordinary content assets are ignored.
    const source = normalizeEmojiAttribute(
      image?.getAttribute('data-src') || image?.getAttribute('src') || image?.currentSrc
    );
    const filenameMatch = source.match(/\/([^/?#]+?)(?:\.[a-z0-9]+)?(?:[?#].*)?$/i);
    const filename = filenameMatch ? filenameMatch[1] : '';
    const shortcode = extractEmojiShortcode(filename);
    if (shortcode) return COMMON_EMOJI_DESCRIPTIONS[shortcode.toLowerCase()] || shortcode;

    return '表情';
  }

  function getPostEmojiMedia(wrapper) {
    if (!wrapper) return null;
    return Array.from(wrapper.children).find((child) => child.tagName === 'IMG' || child.tagName === 'PICTURE') || null;
  }

  function getPostEmojiImage(wrapper) {
    const media = getPostEmojiMedia(wrapper);
    if (!media) return null;
    return media.tagName === 'IMG' ? media : media.querySelector('img');
  }

  function updatePostEmojiLabel(wrapper, image) {
    if (!wrapper || !image) return;
    const description = getEmojiDescription(image);
    const labelText = `[emoji:${description}]`;
    const label = wrapper.querySelector(`.${POST_EMOJI_LABEL}`);
    const isReactionWrapper = wrapper.classList.contains(POST_REACTION_EMOJI_WRAPPER);

    if (isReactionWrapper) {
      // The wrapper is purely visual inside an existing reaction button. It
      // must not create a nested accessible name/focus target; the button's
      // original aria-label remains the sole accessible name and action.
      if (wrapper.getAttribute('aria-hidden') !== 'true') wrapper.setAttribute('aria-hidden', 'true');
      wrapper.removeAttribute('aria-label');
      wrapper.removeAttribute('role');
      wrapper.removeAttribute('tabindex');
      wrapper.removeAttribute('title');
    } else {
      if (wrapper.getAttribute('aria-label') !== labelText) wrapper.setAttribute('aria-label', labelText);
      if (wrapper.getAttribute('title') !== labelText) wrapper.setAttribute('title', labelText);
    }
    if (wrapper.dataset.qqdocsEmojiDescription !== description) {
      wrapper.dataset.qqdocsEmojiDescription = description;
    }
    if (label) {
      if (label.textContent !== labelText) label.textContent = labelText;
      if (label.getAttribute('aria-label') !== labelText) label.setAttribute('aria-label', labelText);
    }
  }

  function createPostEmojiLabel(image) {
    const isReactionEmoji = isPostReactionEmoji(image);
    const isBoostEmoji = isPostBoostEmoji(image);
    const isButtonEmoji = isReactionEmoji || isBoostEmoji;
    const isMetaEmoji = isPostMetaEmoji(image);
    if ((!isPostEmoji(image) && !isMetaEmoji && !isButtonEmoji) || image.hasAttribute(POST_EMOJI_BOUND_ATTRIBUTE)) return;

    const media = image.parentElement?.tagName === 'PICTURE' ? image.parentElement : image;
    const parent = media.parentNode;
    if (!parent || parent.closest(`.${POST_EMOJI_WRAPPER}`)) return;

    const wrapper = document.createElement('span');
    wrapper.className = POST_EMOJI_WRAPPER;
    wrapper.setAttribute(POST_EMOJI_WRAPPER_ATTRIBUTE, 'true');
    if (isButtonEmoji) {
      wrapper.classList.add(POST_REACTION_EMOJI_WRAPPER);
      wrapper.setAttribute('aria-hidden', 'true');
      // Do not set role or tabindex here. This span sits inside a native
      // reaction/boost button and must never become a nested focusable control.
    } else {
      wrapper.setAttribute('role', 'img');
      wrapper.tabIndex = 0;
    }

    const label = document.createElement('span');
    label.className = POST_EMOJI_LABEL;
    label.setAttribute('aria-hidden', 'true');

    parent.insertBefore(wrapper, media);
    wrapper.append(media, label);

    // Keep the original alt/title untouched. The body wrapper provides one
    // stable accessible name while the child image remains the original DOM
    // node. Reaction wrappers are already aria-hidden as a whole, so do not
    // alter the image's own accessibility attributes inside a button.
    if (!isButtonEmoji && !image.hasAttribute('aria-hidden')) {
      image.setAttribute('aria-hidden', 'true');
      image.setAttribute(POST_EMOJI_ARIA_HIDDEN_ADDED_ATTRIBUTE, 'true');
    }
    image.setAttribute(POST_EMOJI_BOUND_ATTRIBUTE, 'true');
    updatePostEmojiLabel(wrapper, image);
  }

  function unwrapPostEmojiLabel(wrapper) {
    if (!wrapper || !wrapper.hasAttribute(POST_EMOJI_WRAPPER_ATTRIBUTE)) return;
    const media = getPostEmojiMedia(wrapper);
    const image = getPostEmojiImage(wrapper);

    if (media && wrapper.parentNode) wrapper.parentNode.insertBefore(media, wrapper);
    if (image) {
      image.removeAttribute(POST_EMOJI_BOUND_ATTRIBUTE);
      if (image.getAttribute(POST_EMOJI_ARIA_HIDDEN_ADDED_ATTRIBUTE) === 'true') {
        image.removeAttribute('aria-hidden');
        image.removeAttribute(POST_EMOJI_ARIA_HIDDEN_ADDED_ATTRIBUTE);
      }
    }
    wrapper.remove();
  }

  function cleanupPostEmojiLabels() {
    document.querySelectorAll(`.${POST_EMOJI_WRAPPER}[${POST_EMOJI_WRAPPER_ATTRIBUTE}]`).forEach(unwrapPostEmojiLabel);
    document.body?.classList.remove('qqdocs-emoji-label-enabled');
  }

  function syncPostEmojiLabels() {
    const active = isTopicDetailActive();
    if (!active) {
      cleanupPostEmojiLabels();
      return;
    }

    document.body?.classList.add('qqdocs-emoji-label-enabled');

    document.querySelectorAll(POST_EMOJI_SELECTOR).forEach((image) => {
      if (image.hasAttribute(POST_EMOJI_BOUND_ATTRIBUTE) && !image.closest(`.${POST_EMOJI_WRAPPER}`)) {
        image.removeAttribute(POST_EMOJI_BOUND_ATTRIBUTE);
        if (image.getAttribute(POST_EMOJI_ARIA_HIDDEN_ADDED_ATTRIBUTE) === 'true') {
          image.removeAttribute('aria-hidden');
          image.removeAttribute(POST_EMOJI_ARIA_HIDDEN_ADDED_ATTRIBUTE);
        }
      }
      createPostEmojiLabel(image);
    });

    document.querySelectorAll(`.${POST_EMOJI_WRAPPER}[${POST_EMOJI_WRAPPER_ATTRIBUTE}]`).forEach((wrapper) => {
      const image = getPostEmojiImage(wrapper);
      if (!image || !isTopicEmoji(image)) {
        unwrapPostEmojiLabel(wrapper);
        return;
      }

      const shouldBeReactionWrapper = isPostReactionEmoji(image) || isPostBoostEmoji(image);
      const isReactionWrapper = wrapper.classList.contains(POST_REACTION_EMOJI_WRAPPER);
      if (shouldBeReactionWrapper !== isReactionWrapper) {
        unwrapPostEmojiLabel(wrapper);
        createPostEmojiLabel(image);
        return;
      }

      updatePostEmojiLabel(wrapper, image);
    });
  }

  // 1. Favicon 伪装
  function applyFavicon() {
    const head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;

    let links = Array.from(head.querySelectorAll("link[rel~='icon'], link[rel='shortcut icon']"));
    if (!links.length) {
      const link = document.createElement('link');
      link.rel = 'icon';
      head.appendChild(link);
      links = [link];
    }

    links.forEach((link) => {
      link.type = 'image/x-icon';
      link.href = ICONS.favicon;
    });
  }

  // 2. Title 动态劫持
  function hijackTitle() {
    const originalTitleDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'title') ||
      Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'title');

    function getFormattedTitle(rawTitle) {
      if (!rawTitle) return '腾讯文档';

      let clean = rawTitle.replace(/\s*-\s*LINUX DO.*$/i, '').trim();
      clean = clean.replace(/(?:\s*-\s*腾讯文档)+\s*$/g, '').trim();
      clean = clean.replace(/^\(\d+\)\s*/, '');

      if (!clean || clean === '腾讯文档' || clean === 'LINUX DO' || clean.includes('新的理想型社区')) {
        return '腾讯文档';
      }
      return `${clean} - 腾讯文档`;
    }

    try {
      Object.defineProperty(document, 'title', {
        get: function () {
          return originalTitleDesc ? originalTitleDesc.get.call(this) : '腾讯文档';
        },
        set: function (newTitle) {
          const transformed = getFormattedTitle(newTitle);
          if (originalTitleDesc) {
            originalTitleDesc.set.call(this, transformed);
          } else {
            document.getElementsByTagName('title')[0].textContent = transformed;
          }
        },
        configurable: true
      });
    } catch (e) {
      console.warn('[Docs QQ] Title hijack failed:', e);
    }

    document.title = document.title;
  }

  // 3. 顶部 Header (100% 官方 DOM 结构还原)
  function renderHeader() {
    const headerTitle = document.querySelector('.d-header .title');
    if (headerTitle && !headerTitle.querySelector('.desktop-top-bar-left')) {
      const brand = document.createElement('div');
      brand.className = 'desktop-top-bar-left';
      brand.innerHTML = `
        <a title="腾讯文档" href="/" class="desktop-logo-pc">
          ${ICONS.officialLogoSvg}
        </a>
      `;
      headerTitle.innerHTML = '';
      headerTitle.appendChild(brand);

    }

    /*
     * Discourse 新版会用 .home-logo-wrapper-outlet 单独包住 .title。
     * 搜索框若跟着插入这个 244px 的插槽，就会落到 Logo 下方并产生重叠。
     * 无论是首次创建还是站点热更新后，都把它校正为 .contents 的直接子节点。
     */
    const headerContents = headerTitle && headerTitle.closest('.d-header .contents');
    const logoSlot = headerTitle && (headerTitle.closest('.home-logo-wrapper-outlet') || headerTitle);
    let searchInput = document.querySelector('.desktop-search-input-pc');

    if (!searchInput && headerContents) {
      searchInput = document.createElement('div');
      searchInput.className = 'dui-input desktop-search-input desktop-search-input-pc';
      searchInput.innerHTML = `
        ${renderOfficialIcon('search', 14)}
        <input class="dui-input-input" type="search" placeholder="搜索文档、模板、文库、工具 (Ctrl+F)">
      `;
      searchInput.querySelector('input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          window.location.href = `/search?q=${encodeURIComponent(e.target.value)}`;
        }
      });
    }

    if (searchInput && headerContents && logoSlot && logoSlot.parentNode === headerContents) {
      if (searchInput.parentNode !== headerContents || searchInput.previousElementSibling !== logoSlot) {
        headerContents.insertBefore(searchInput, logoSlot.nextSibling);
      }
    }

    const headerIcons = document.querySelector('.d-header-icons');
    if (headerIcons && !document.querySelector('.desktop-top-bar-right')) {
      const rightWrap = document.createElement('li');
      rightWrap.className = 'desktop-top-bar-right';
      rightWrap.innerHTML = `
        <div class="desktop-vip-center">
          <button class="desktop-top-bar-button desktop-vip-center-button" type="button">
            ${renderOfficialIcon('vip', 16)}
            <span>会员中心</span>
          </button>
        </div>
        <button class="desktop-top-bar-button" type="button">
          ${renderOfficialIcon('manageDevice', 16)}
          <span>· 2</span>
        </button>
        <button class="desktop-top-bar-button" type="button">
          ${renderOfficialIcon('template', 16)}
          <span>模板</span>
        </button>
        <button class="desktop-top-bar-button" type="button">
          ${renderOfficialIcon('toolkit', 16)}
        </button>
        <button class="desktop-top-bar-button" type="button">
          ${renderOfficialIcon('aiTop', 16)}
        </button>
        <button class="desktop-top-bar-button desktop-notification-panel-button" type="button">
          ${renderOfficialIcon('notification', 16)}
          <span class="desktop-notification-badge">18</span>
        </button>
      `;
      headerIcons.insertBefore(rightWrap, headerIcons.firstChild);
    }
  }

  // 4. 左侧 Sidebar (Fixed 定位挂载至 body)
  function renderSidebar() {
    if (!document.querySelector('.desktop-layout-sidebar-pc')) {
      const sidebar = document.createElement('aside');
      sidebar.className = 'desktop-layout-sidebar-pc';
      sidebar.innerHTML = `
        <button class="dui-button desktop-create-button-pc" onclick="location.href='/new-topic'">
          ${renderOfficialIcon('create', 16)}
          <span>新建</span>
        </button>
        <button class="desktop-upload-button-pc">
          ${renderOfficialIcon('upload', 16)}
          <span>上传</span>
        </button>

        <nav class="desktop-sidebar-nav-list">
          <a class="desktop-node-link-router desktop-link-active" href="/">
            ${renderOfficialIcon('home', 20)}
            <span>首页</span>
          </a>
          <a class="desktop-node-link-router" href="/latest">
            ${renderOfficialIcon('cloud', 20)}
            <span>云盘</span>
          </a>
          <a class="desktop-node-link-router" href="/top">
            ${renderOfficialIcon('aiSidebar', 20)}
            <span>AI 助手</span>
          </a>
          <a class="desktop-node-link-router" href="/categories">
            ${renderOfficialIcon('space', 20)}
            <span>空间</span>
          </a>
          <a class="desktop-node-link-router" href="/my/activity">
            ${renderOfficialIcon('trash', 20)}
            <span>回收站</span>
          </a>
        </nav>

        <div class="desktop-enterprise-edition-entry">
          <div class="desktop-promo-card">
            <div class="desktop-promo-header">
              ${renderOfficialIcon('enterprise', 18)}
              <div class="desktop-promo-title">企业版 · 团队协作更高效</div>
            </div>
            <div class="desktop-promo-subtitle">权限管控 · 离职归还 · 操作审计</div>
            <div class="desktop-promo-button">免费体验</div>
          </div>
        </div>

        <div class="desktop-storage-panel">
          <span>已使用 4.99 MB / 1.0 GB</span>
          <a href="javascript:void(0);">查看 &gt;</a>
        </div>
      `;
      document.body.appendChild(sidebar);
    }
  }

  // 5. 列表页表头与数据行 (内联矢量 SVG 图标)
  function renderTopicList() {
    // 清理残余可能干扰布局的节点
    document.querySelectorAll('.welcome-banner, .global-notice, .list-controls, .top-notices, .alert, .community-rule, #site-text-logo').forEach(el => el.style.display = 'none');

    const isTopicDetailPage = document.querySelector('.post-stream, #topic-title');
    const tabsHeader = document.querySelector('.desktop-home-page-tab-header-pc');

    // 如果在详情页，隐藏列表页 Tab
    if (isTopicDetailPage) {
      if (tabsHeader) tabsHeader.style.display = 'none';
      return;
    } else {
      if (tabsHeader) tabsHeader.style.display = 'flex';
    }

    const container = document.querySelector('.list-container, .topic-list-container, #main-container');
    const topicList = document.querySelector('.topic-list');
    if (container && !document.querySelector('.desktop-home-page-tab-header-pc')) {
      const tabs = document.createElement('header');
      tabs.className = 'desktop-home-page-tab-header-pc';
      tabs.innerHTML = `
        <div class="desktop-tab-group">
          <a class="desktop-tab-link desktop-link-active" href="/">最近</a>
          <a class="desktop-tab-link" href="/categories">空间</a>
          <a class="desktop-tab-link" href="/my/activity">收藏</a>
        </div>
        <aside class="desktop-page-header-extra-pc">
          <button type="button" class="desktop-header-action-btn">
            ${renderOfficialIcon('showRecent', 16)}
            <span>显示</span>
          </button>
          <button type="button" class="desktop-header-action-btn">
            ${renderOfficialIcon('filter', 16)}
            <span>筛选</span>
            ${renderOfficialIcon('arrowDown', 12)}
          </button>
        </aside>
      `;
      if (topicList) {
        topicList.parentNode.insertBefore(tabs, topicList);
      } else {
        container.insertBefore(tabs, container.firstChild);
      }
    }

    // 重构 Discourse 原生 5 列表头
    const thead = document.querySelector('.topic-list thead');
    if (thead && !thead.hasAttribute('data-qqdocs-styled')) {
      thead.setAttribute('data-qqdocs-styled', 'true');
      thead.innerHTML = `
        <tr>
          <th class="default" style="width: 50%;">名称</th>
          <th class="posters" style="width: 13%;">所有者</th>
          <th class="posts" style="width: 12%;">位置</th>
          <th class="views" style="width: 13%;">最近查看 ▾</th>
          <th class="activity" style="width: 12%; text-align: right;">文档大小</th>
        </tr>
      `;
    }

    const topicRows = document.querySelectorAll('.topic-list-item:not([data-qqdocs-styled="true"])');
    topicRows.forEach((row, idx) => {
      row.setAttribute('data-qqdocs-styled', 'true');

      // 提取分类名
      const catBadge = row.querySelector('.badge-category__name');
      const catName = catBadge ? catBadge.textContent.trim() : (idx % 2 === 0 ? '-' : 'AI文档助手');

      // 清理旧的图标节点
      const oldIcons = row.querySelectorAll('.sc-file-icon-container, .qqdocs-row-icon-wrap');
      oldIcons.forEach(el => el.remove());

      // 1. 标题列 (注入单选圆圈与高清内联 SVG 图标)
      const titleLink = row.querySelector('.main-link .title, .main-link .raw-link');
      if (titleLink) {
        let iconType = 'sheet';
        if (idx % 4 === 1) iconType = 'doc';
        else if (idx % 4 === 2) iconType = 'slide';

        const iconContainer = document.createElement('span');
        iconContainer.className = 'qqdocs-row-icon-wrap';
        iconContainer.innerHTML = `
          ${renderOfficialFileIcon(iconType, 24)}
        `;

        titleLink.parentNode.insertBefore(iconContainer, titleLink);

        if (!titleLink.querySelector('svg') && (row.classList.contains('visited') || idx % 4 === 0)) {
          const star = document.createElement('span');
          star.style.marginLeft = '6px';
          star.innerHTML = renderOfficialIcon('star', 16);
          titleLink.appendChild(star);
        }
      }

      // 2. 所有者列 (提取作者用户名)
      const posterCol = row.querySelector('.posters');
      if (posterCol) {
        const firstUser = posterCol.querySelector('a');
        const username = firstUser ? (firstUser.getAttribute('data-user-card') || firstUser.title || '李媛婷') : '李媛婷';
        posterCol.innerHTML = `<span style="color: var(--text-strong); font-size: 12px; font-weight: 400; line-height: 16px;">${username}</span>`;
      }

      // 3. 位置列 (原 posts 列重塑为位置)
      const postsCol = row.querySelector('.posts');
      if (postsCol) {
        postsCol.innerHTML = `<span style="color: var(--text-strong); font-size: 12px; font-weight: 400; line-height: 16px;">${catName}</span>`;
      }

      // 4. 最近查看列 (原 views 列重塑为时间)
      const viewsCol = row.querySelector('.views');
      if (viewsCol) {
        const times = ['16:11', '15:55', '昨天 16:45', '08-21 12:05', '08-19 16:12', '08-17 09:12', '08-10 09:39', '08-06 14:09'];
        viewsCol.innerHTML = `<span style="color: var(--text-strong); font-size: 12px; font-weight: 400; line-height: 16px;">${times[idx % times.length]}</span>`;
      }

      // 5. 文档大小列 (原 activity 列重塑为仿真大小)
      const actCol = row.querySelector('.activity');
      if (actCol) {
        const sizes = ['928.59 KB', '117.26 KB', '343.27 KB', '621.74 KB', '495.62 KB', '551.69 KB', '95.69 MB', '3.91 MB'];
        actCol.innerHTML = `<span style="color: var(--text-strong); font-size: 12px; font-weight: 400; line-height: 16px;">${sizes[idx % sizes.length]}</span>`;
      }
    });
  }

  function renderSearchResults() {
    const searchContainer = document.querySelector('.search-container');
    document.body?.classList.toggle('qqdocs-search-page', Boolean(searchContainer));
    if (!searchContainer) return;

    const entries = searchContainer.querySelector('.search-results .fps-result-entries');
    if (!entries) return;

    let header = searchContainer.querySelector('.qqdocs-search-list-header');
    if (!header) {
      header = document.createElement('div');
      header.className = 'qqdocs-search-list-header';
      header.setAttribute('aria-hidden', 'true');
      header.innerHTML = '<span>名称</span><span>所有者</span><span>位置</span><span>最近查看 ▾</span><span>匹配内容</span>';
    }
    if (header.nextElementSibling !== entries) entries.parentNode.insertBefore(header, entries);

    entries.querySelectorAll('.fps-result:not([data-qqdocs-search-styled="true"])').forEach((result) => {
      result.setAttribute('data-qqdocs-search-styled', 'true');

      const topic = result.querySelector('.fps-topic');
      const topicId = Number(topic?.getAttribute('data-topic-id')) || 0;
      const iconTypes = ['sheet', 'doc', 'slide'];
      const iconType = iconTypes[Math.abs(topicId) % iconTypes.length];

      if (!result.querySelector('.qqdocs-search-row-icon')) {
        const icon = document.createElement('span');
        icon.className = 'qqdocs-search-row-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = renderOfficialFileIcon(iconType, 24);
        result.insertBefore(icon, result.firstChild);
      }

      const authorLink = result.querySelector('.author a[data-user-card], .author a');
      if (authorLink && !authorLink.querySelector('.qqdocs-search-owner')) {
        const username = authorLink.getAttribute('data-user-card') ||
          authorLink.querySelector('img.avatar')?.getAttribute('title') ||
          '—';
        const owner = document.createElement('span');
        owner.className = 'qqdocs-search-owner';
        owner.textContent = username;
        authorLink.appendChild(owner);
      }
    });
  }

  const TOPIC_STAT_DEFINITIONS = {
    views: {
      label: '浏览量',
      markers: ['view', 'views', 'visit', 'visits', '浏览', '访问']
    },
    likes: {
      label: '赞',
      markers: ['like', 'likes', 'liked', 'heart', '赞']
    },
    users: {
      label: '用户',
      markers: ['user', 'users', 'participant', 'participants', 'poster', 'member', '用户', '参与者', '成员']
    }
  };

  function normalizeStatText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function getNodeMetadata(node) {
    if (!node) return '';
    const className = typeof node.className === 'string' ? node.className : '';
    return normalizeStatText([
      className,
      node.getAttribute?.('data-stat'),
      node.getAttribute?.('data-type'),
      node.getAttribute?.('data-topic-stat'),
      node.getAttribute?.('aria-label'),
      node.getAttribute?.('title')
    ].filter(Boolean).join(' ')).toLowerCase();
  }

  function getTopicStatKey(node) {
    const metadata = getNodeMetadata(node);
    const text = normalizeStatText(node?.textContent).toLowerCase();
    const source = `${metadata} ${text}`;
    const keys = Object.keys(TOPIC_STAT_DEFINITIONS);
    let bestKey = null;
    let bestScore = 0;

    keys.forEach((key) => {
      const definition = TOPIC_STAT_DEFINITIONS[key];
      let score = 0;
      definition.markers.forEach((marker) => {
        if (metadata.includes(marker)) score += marker.length > 2 ? 8 : 6;
        else if (text.includes(marker)) score += marker.length > 2 ? 3 : 2;
      });
      if (score > bestScore) {
        bestKey = key;
        bestScore = score;
      }
    });

    // Avoid treating generic words in an unrelated node as a statistic.
    return bestScore > 0 && source ? bestKey : null;
  }

  function firstTopicStatText(node, selectors) {
    for (const selector of selectors) {
      const child = node?.querySelector(selector);
      const text = normalizeStatText(child?.textContent || child?.getAttribute?.('data-value'));
      if (text) return text;
    }
    return '';
  }

  function extractNumericText(text) {
    const normalized = normalizeStatText(text);
    const match = normalized.match(/[+-]?(?:\d[\d,.]*)(?:\s*[万亿kKmMbB])?/);
    return match ? normalizeStatText(match[0]) : '';
  }

  function removeStatValueFromLabel(label, value) {
    const normalizedLabel = normalizeStatText(label);
    const normalizedValue = normalizeStatText(value);
    if (!normalizedLabel || !normalizedValue) return normalizedLabel;
    const escapedValue = normalizedValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return normalizeStatText(normalizedLabel
      .replace(new RegExp(escapedValue, 'g'), '')
      .replace(/^[\s:：|·-]+|[\s:：|·-]+$/g, ''));
  }

  function getTopicStatCandidates(topicMap) {
    const selectors = [
      '.topic-map__stats-item',
      '[class*="topic-map__stats-item"]',
      '.topic-map__stat',
      '[class*="topic-map__stat-"]',
      '[data-topic-stat]',
      '[data-stat]',
      '.topic-map__stats > *'
    ];
    const seen = new Set();
    const candidates = [];

    selectors.forEach((selector) => {
      topicMap.querySelectorAll(selector).forEach((node) => {
        if (!seen.has(node)) {
          seen.add(node);
          candidates.push(node);
        }
      });
    });

    return candidates;
  }

  function extractUserCount(topicMap) {
    const countSelectors = [
      '[data-users-count]',
      '[data-user-count]',
      '[data-count]',
      '.topic-map__users-count',
      '.topic-map__user-count',
      '[class*="users-count"]',
      '[class*="user-count"]'
    ];
    for (const selector of countSelectors) {
      const countNode = topicMap.querySelector(selector);
      if (!countNode) continue;
      const attributeCount = countNode.getAttribute?.('data-users-count') ||
        countNode.getAttribute?.('data-user-count') || countNode.getAttribute?.('data-count');
      const countText = normalizeStatText(attributeCount || countNode.textContent);
      if (countText) return extractNumericText(countText) || countText;
    }

    const userSelectors = [
      '.topic-map__user',
      '.topic-map__user-link',
      '.topic-map__users-list [data-user-card]',
      '.topic-map__users-list .poster',
      '.topic-map__users [data-user-card]',
      '.topic-map__users .poster'
    ];
    const users = new Set();
    userSelectors.forEach((selector) => {
      topicMap.querySelectorAll(selector).forEach((node) => {
        const identity = node.getAttribute?.('data-user-card') || node.getAttribute?.('href') || node.textContent;
        if (normalizeStatText(identity)) users.add(normalizeStatText(identity));
      });
    });
    return users.size ? String(users.size) : '';
  }

  function extractTopicStat(node, key) {
    const definition = TOPIC_STAT_DEFINITIONS[key];
    const value = firstTopicStatText(node, [
      '.topic-map__value',
      '.number',
      '.value',
      '[class*="__value"]',
      '[class*="-value"]',
      '[class*="number"]',
      '[data-value]',
      '[data-stat-value]',
      '[data-count]'
    ]) || extractNumericText(node.textContent);
    const nestedLabel = firstTopicStatText(node, [
      '.topic-map__label',
      '.label',
      'dt',
      'small',
      '[class*="__label"]',
      '[class*="-label"]'
    ]);
    const attributeLabel = removeStatValueFromLabel(node.getAttribute?.('aria-label') || node.getAttribute?.('title'), value);
    const textLabel = removeStatValueFromLabel(node.textContent, value);
    const label = nestedLabel || attributeLabel || textLabel || definition.label;
    const statValue = key === 'users' && !value ? extractUserCount(node) : value;

    if (!statValue) return null;
    return { key, label, value: normalizeStatText(statValue) };
  }

  function readTopicMapStats() {
    const maps = Array.from(document.querySelectorAll('.topic-map'));
    maps.sort((first, second) => {
      const firstIsBottom = first.classList.contains('--bottom') ? 1 : 0;
      const secondIsBottom = second.classList.contains('--bottom') ? 1 : 0;
      return secondIsBottom - firstIsBottom;
    });

    const stats = new Map();
    maps.forEach((topicMap) => {
      const candidates = getTopicStatCandidates(topicMap);
      candidates.forEach((candidate) => {
        const key = getTopicStatKey(candidate);
        if (!key || stats.has(key)) return;
        const stat = extractTopicStat(candidate, key);
        if (stat) stats.set(key, stat);
      });

      if (!stats.has('users')) {
        const usersSection = topicMap.querySelector('.topic-map__users, .topic-map__users-list');
        const userCount = usersSection ? extractUserCount(usersSection) : '';
        if (userCount) {
          stats.set('users', {
            key: 'users',
            label: firstTopicStatText(topicMap, ['.topic-map__users .topic-map__label', '.topic-map__users .label']) || TOPIC_STAT_DEFINITIONS.users.label,
            value: userCount
          });
        }
      }
    });

    return ['views', 'likes', 'users'].map((key) => stats.get(key)).filter(Boolean);
  }

  function renderTopicStatistics(shell) {
    const statsContainer = shell?.querySelector('.qqdocs-topic-stats');
    if (!statsContainer) return;

    const stats = readTopicMapStats();
    const signature = stats.map((stat) => `${stat.key}\u0000${stat.value}\u0000${stat.label}`).join('\u0001');
    const hasStats = stats.length > 0;
    if (statsContainer.dataset.qqdocsStatsSignature === signature && statsContainer.hidden === !hasStats) return;

    const fragment = document.createDocumentFragment();
    stats.forEach((stat) => {
      const item = document.createElement('span');
      item.className = `qqdocs-topic-stat qqdocs-topic-stat--${stat.key}`;
      item.setAttribute('data-stat-key', stat.key);

      const value = document.createElement('strong');
      value.className = 'qqdocs-topic-stat-value';
      value.textContent = stat.value;

      const label = document.createElement('span');
      label.className = 'qqdocs-topic-stat-label';
      label.textContent = stat.label;

      item.append(value, label);
      fragment.appendChild(item);
    });

    statsContainer.replaceChildren(fragment);
    statsContainer.dataset.qqdocsStatsSignature = signature;
    statsContainer.hidden = !hasStats;
    statsContainer.setAttribute('aria-hidden', String(!hasStats));
  }

  // 6. 详情页腾讯文档编辑器外壳
  function renderTopicDetail() {
    const postStream = document.querySelector('.post-stream');
    const oldToolbar = document.querySelector('.qqdocs-doc-toolbar');
    if (oldToolbar) oldToolbar.remove();

    if (!postStream) {
      // Ember 路由跳转（如大纲跳到未加载楼层）会短暂移除 .post-stream 并重建，
      // 此时仍在 /t/ 帖子路由内，必须保留伪装外壳与大纲，否则闪退成原生界面。
      if (!/^\/t\//.test(window.location.pathname)) {
        document.querySelector('.qqdocs-editor-shell')?.remove();
        removeTopicOutline();
      }
      return;
    }

    const rawTitle = document.querySelector('#topic-title h1, #topic-title [data-topic-title]')?.textContent || '在线文档';
    const topicTitle = normalizeStatText(rawTitle) || '在线文档';

    // Remove the outline shell left by pre-update userscript versions.
    document.querySelectorAll('[class*="outline"]').forEach((node) => {
      const className = typeof node.className === 'string' ? node.className : '';
      if (className.indexOf('qqdocs-') !== -1 && className.toLowerCase().indexOf('outline') !== -1) node.remove();
    });

    let shell = document.querySelector('.qqdocs-editor-shell');
    // Rebuild a shell injected by an older userscript version during hot update.
    if (shell && (
      !shell.querySelector('.qqdocs-editor-divider') ||
      !shell.querySelector('.qqdocs-topic-stats') ||
      !shell.querySelector('button.qqdocs-editor-home')
    )) {
      shell.remove();
      shell = null;
    }
    if (!shell) {
      shell = document.createElement('div');
      shell.className = 'qqdocs-editor-shell';
      shell.innerHTML = `
        <div class="qqdocs-editor-titlebar">
          <div class="qqdocs-editor-title-left">
            <button class="qqdocs-editor-home" type="button" aria-label="返回上一页" title="返回上一页">${renderTdocsChromeIcon('home', 28)}</button>
            <span class="qqdocs-editor-plus" aria-hidden="true">${renderTdocsChromeIcon('plus', 24)}</span>
            <span class="qqdocs-editor-divider" aria-hidden="true"></span>
            <strong class="qqdocs-editor-title-text"></strong>
            <span class="qqdocs-topic-stats" role="group" aria-label="主题统计" aria-live="polite"></span>
            <span class="qqdocs-editor-readonly"><span>只能查看</span>${renderTdocsChromeIcon('arrow', 6)}</span>
            <span class="qqdocs-editor-star">${renderTdocsChromeIcon('star', 16)}</span>
            <span class="qqdocs-editor-folder">${renderTdocsChromeIcon('folder', 16)}</span>
          </div>
          <div class="qqdocs-editor-title-actions" aria-hidden="true">
            <span class="qqdocs-editor-action">${renderTdocsChromeIcon('more', 24)}</span>
            <span class="qqdocs-editor-action">${renderTdocsChromeIcon('ai', 24)}</span>
            <span class="qqdocs-editor-action qqdocs-editor-presentation">${renderTdocsChromeIcon('presentation', 24)}</span>
            <span class="qqdocs-editor-collaborator">${renderTdocsChromeIcon('collaborator', 24)}</span>
            <span class="qqdocs-editor-share">分享</span>
            <span class="qqdocs-editor-account">${renderTdocsChromeIcon('collaborator', 24)}${renderTdocsChromeIcon('wechat', 14)}</span>
          </div>
        </div>
        <div class="qqdocs-editor-tabs" aria-hidden="true">
          <span class="is-active">开始</span><span>插入</span><span>页面</span><span>引用</span>
          <span>审阅</span><span>视图</span><span>效率工具</span><span>公文助手</span><span>会员专享</span>
        </div>
        <div class="qqdocs-editor-ribbon" aria-hidden="true">
          <div class="qqdocs-ribbon-group qqdocs-ribbon-history">
            <span>${renderTdocsChromeIcon('undo', 24)}</span><span>${renderTdocsChromeIcon('redo', 24)}</span>
            <span>${renderTdocsChromeIcon('format', 24)}</span><span>${renderTdocsChromeIcon('clear', 24)}</span>
          </div>
          <div class="qqdocs-ribbon-group qqdocs-ribbon-insert-group">
            <span class="qqdocs-ribbon-labeled">${renderTdocsChromeIcon('insert', 24)}<small>插入</small></span>
          </div>
          <div class="qqdocs-ribbon-group qqdocs-ribbon-font">
            <span class="qqdocs-ribbon-select">微软雅黑${renderTdocsChromeIcon('arrow', 6)}</span>
            <span class="qqdocs-ribbon-size">11${renderTdocsChromeIcon('arrow', 6)}</span>
            <span>${renderTdocsChromeIcon('fontPlus', 24)}</span><span>${renderTdocsChromeIcon('fontMinus', 24)}</span>
            <span>${renderTdocsChromeIcon('pinyin', 24)}</span><span>${renderTdocsChromeIcon('style', 24)}</span>
            <span>${renderTdocsChromeIcon('bold', 24)}</span><span>${renderTdocsChromeIcon('italic', 24)}</span><span>${renderTdocsChromeIcon('underline', 24)}</span>
            <span>${renderTdocsChromeIcon('strike', 24)}</span><span>${renderTdocsChromeIcon('superscript', 24)}</span><span>${renderTdocsChromeIcon('fontPlus', 20)}</span>
          </div>
          <div class="qqdocs-ribbon-group qqdocs-ribbon-paragraph">
            <span>${renderTdocsChromeIcon('list', 24)}</span><span>${renderTdocsChromeIcon('numbered', 24)}</span><span>${renderTdocsChromeIcon('todo', 24)}</span>
            <span>${renderTdocsChromeIcon('outdent', 24)}</span><span>${renderTdocsChromeIcon('indent', 24)}</span><span>${renderTdocsChromeIcon('spacing', 24)}</span>
            <span>${renderTdocsChromeIcon('alignLeft', 20)}</span><span>${renderTdocsChromeIcon('alignCenter', 20)}</span><span>${renderTdocsChromeIcon('alignRight', 20)}</span>
            <span>${renderTdocsChromeIcon('justify', 20)}</span><span>${renderTdocsChromeIcon('distribute', 20)}</span><span>${renderTdocsChromeIcon('quote', 24)}</span>
            <span>${renderTdocsChromeIcon('block', 24)}</span><span>${renderTdocsChromeIcon('paragraph', 24)}</span>
          </div>
          <div class="qqdocs-ribbon-group qqdocs-ribbon-styles">
            <span class="is-selected">正文</span><span>标题 1</span><span>标题 2</span><span>标题 3</span><span>标题 4</span><span>标题 5</span>
          </div>
          <div class="qqdocs-ribbon-group qqdocs-ribbon-tools">
            <span>${renderTdocsChromeIcon('beautify', 24)}生成图片</span><span>${renderTdocsChromeIcon('image', 24)}PDF转换</span>
            <span>${renderTdocsChromeIcon('plugin', 24)}插件</span><span>${renderTdocsChromeIcon('print', 24)}打印</span>
          </div>
          <div class="qqdocs-ribbon-search">${renderTdocsChromeIcon('search', 24)}${renderTdocsChromeIcon('arrow', 6)}</div>
        </div>
      `;
      document.body.appendChild(shell);
    }

    const shellTitle = shell.querySelector('.qqdocs-editor-title-text');
    if (shellTitle && shellTitle.textContent !== topicTitle) shellTitle.textContent = topicTitle;

    const homeButton = shell.querySelector('button.qqdocs-editor-home');
    if (homeButton && homeButton.dataset.qqdocsHistoryBackBound !== 'true') {
      homeButton.dataset.qqdocsHistoryBackBound = 'true';
      homeButton.addEventListener('click', () => window.history.back());
    }
    renderTopicStatistics(shell);
    renderTopicOutline();
  }

  // 6.1 详情页左侧大纲面板（复刻腾讯文档"大纲"导航）
  const TOPIC_OUTLINE_HIDDEN_KEY = 'qqdocs.toc.hidden';
  const TOPIC_OUTLINE_COLLAPSED_KEY = 'qqdocs.toc.collapsed';
  let topicOutlinePostObserver = null;
  const topicOutlineObservedPosts = new WeakSet();
  const topicOutlineVisibleRatios = new Map();

  function removeTopicOutline() {
    document.querySelector('.qqdocs-toc-panel')?.remove();
    document.querySelector('.qqdocs-toc-fab')?.remove();
    if (topicOutlinePostObserver) {
      topicOutlinePostObserver.disconnect();
      topicOutlinePostObserver = null;
    }
    topicOutlineObservedPosts.clear?.();
    topicOutlineVisibleRatios.clear();
  }

  // Tampermonkey 沙箱中 window.Discourse 等页面全局只能经 unsafeWindow 访问。
  function getPageWindow() {
    try {
      if (typeof unsafeWindow !== 'undefined' && unsafeWindow !== window) return unsafeWindow;
    } catch (e) { /* 无 unsafeWindow 授权时退回 window */ }
    return window;
  }

  function getTopicControllerModel() {
    try {
      const pageWindow = getPageWindow();
      const container = pageWindow.Discourse && pageWindow.Discourse.__container__;
      return container?.lookup?.('controller:topic')?.model || null;
    } catch (e) {
      return null;
    }
  }

  function buildOutlineSummary(cooked, maxChars) {
    if (!cooked) return '';
    const scratch = document.createElement('div');
    scratch.innerHTML = String(cooked);
    const text = normalizeStatText(scratch.textContent || '');
    return text.length > maxChars ? `${text.slice(0, maxChars)}…` : text;
  }

  // Ember 数据不可达时的兜底：直接从已渲染的楼层 DOM 提取条目，
  // 跟随虚拟滚动逐步补全（楼层总数未知，只列当前已渲染楼层）。
  function collectOutlineEntriesFromDom() {
    const posts = document.querySelectorAll('.post-stream .topic-post[data-post-number]');
    if (!posts.length) return null;
    const entries = Array.from(posts).map((post) => {
      const number = Number(post.getAttribute('data-post-number'));
      const author = normalizeStatText(post.querySelector('.names .first a, .names a')?.textContent || '');
      return {
        number,
        loaded: true,
        author,
        summary: buildOutlineSummary(post.querySelector('.cooked')?.innerHTML, 36),
        replyTo: 0
      };
    });
    return { title: document.querySelector('#topic-title h1')?.textContent?.trim() || '', entries };
  }

  function collectOutlineEntries() {
    const model = getTopicControllerModel();
    const postStream = model?.postStream;
    const stream = postStream?.stream; // Discourse 内部存的是 post id 数组，按楼层顺序排列
    const loadedPosts = postStream?.posts;
    if (!Array.isArray(stream) || !stream.length) return collectOutlineEntriesFromDom();

    const loadedById = new Map();
    if (Array.isArray(loadedPosts)) {
      loadedPosts.forEach((post) => {
        const id = Number(post?.id);
        if (Number.isFinite(id) && !loadedById.has(id)) loadedById.set(id, post);
      });
    }

    const entries = stream.map((rawId, index) => {
      const post = loadedById.get(Number(rawId)) || null;
      // 已加载楼层用真实 post_number；未加载的用顺序号近似，加载后自动修正。
      const number = Number(post?.post_number) || index + 1;
      const author = normalizeStatText(post?.name || post?.username || '');
      return {
        number,
        loaded: Boolean(post),
        author,
        summary: post ? buildOutlineSummary(post.cooked, 36) : '',
        replyTo: Number.isFinite(Number(post?.reply_to_post_number)) ? Number(post.reply_to_post_number) : 0
      };
    });

    return { title: document.querySelector('#topic-title h1')?.textContent?.trim() || '', entries };
  }

  function renderOutlineHeadlineMarkup(entry) {
    const row = document.createElement('div');
    row.className = 'qqdocs-toc-headline' + (entry.loaded ? ' is-loaded' : '');
    row.dataset.postNumber = String(entry.number);
    row.setAttribute('role', 'button');
    row.setAttribute('aria-label', `跳转到第 ${entry.number} 楼`);

    const triangle = document.createElement('div');
    triangle.className = 'qqdocs-toc-headline-triangle';
    triangle.setAttribute('aria-hidden', 'true');
    triangle.style.display = 'none';
    row.appendChild(triangle);

    const text = document.createElement('div');
    text.className = 'qqdocs-toc-headline-text is-floor';
    text.style.paddingLeft = '16px';

    const inner = document.createElement('span');
    inner.className = 'qqdocs-toc-headline-inner-text';
    if (entry.loaded) {
      inner.textContent = `#${entry.number} ${entry.author}${entry.summary ? ` ${entry.summary}` : ''}`.trim();
      row.title = inner.textContent;
    } else {
      inner.textContent = `#${entry.number} 加载中…`;
    }
    text.appendChild(inner);
    row.appendChild(text);
    return row;
  }

  function renderOutlineTitleMarkup(title) {
    const row = document.createElement('div');
    row.className = 'qqdocs-toc-headline is-loaded is-title-row';
    row.dataset.postNumber = '1';
    row.setAttribute('role', 'button');
    row.setAttribute('aria-label', '回到顶部');

    const triangle = document.createElement('div');
    triangle.className = 'qqdocs-toc-headline-triangle';
    triangle.setAttribute('aria-hidden', 'true');
    triangle.style.display = 'none';
    row.appendChild(triangle);

    const text = document.createElement('div');
    text.className = 'qqdocs-toc-headline-text is-title';
    const inner = document.createElement('span');
    inner.className = 'qqdocs-toc-headline-inner-text';
    inner.textContent = title || '在线文档';
    row.title = inner.textContent;
    text.appendChild(inner);
    row.appendChild(text);
    return row;
  }

  function syncTopicOutlineList(panel, data) {
    const list = panel.querySelector('.qqdocs-toc-headlines');
    if (!list) return;

    const signature = `${data.title}\u0002${data.entries
      .map((entry) => `${entry.number}:${entry.loaded ? `${entry.author}\u0000${entry.summary}` : ''}`)
      .join('\u0001')}`;
    if (panel.dataset.qqdocsOutlineSignature === signature) return;
    panel.dataset.qqdocsOutlineSignature = signature;

    const fragment = document.createDocumentFragment();
    fragment.appendChild(renderOutlineTitleMarkup(data.title));
    data.entries.forEach((entry) => fragment.appendChild(renderOutlineHeadlineMarkup(entry)));
    list.replaceChildren(fragment);
    applyTopicOutlineActiveState();
  }

  function applyTopicOutlineActiveState() {
    const list = document.querySelector('.qqdocs-toc-panel .qqdocs-toc-headlines');
    if (!list) return;

    let bestNumber = 0;
    let bestRatio = 0;
    topicOutlineVisibleRatios.forEach((ratio, number) => {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestNumber = number;
      }
    });

    list.querySelectorAll('.qqdocs-toc-headline.is-active').forEach((row) => row.classList.remove('is-active'));
    if (!bestNumber) return;

    const activeRow = list.querySelector(`.qqdocs-toc-headline[data-post-number="${bestNumber}"]`);
    if (!activeRow) return;
    activeRow.classList.add('is-active');
    if (activeRow.scrollIntoView) activeRow.scrollIntoView({ block: 'nearest' });
  }

  function ensureTopicOutlineObserver() {
    if (!topicOutlinePostObserver) {
      topicOutlinePostObserver = new IntersectionObserver((records) => {
        records.forEach((record) => {
          const number = Number(record.target?.getAttribute('data-post-number'));
          if (!Number.isFinite(number)) return;
          if (record.isIntersecting && record.intersectionRatio > 0.08) {
            topicOutlineVisibleRatios.set(number, record.intersectionRatio);
          } else {
            topicOutlineVisibleRatios.delete(number);
          }
        });
        applyTopicOutlineActiveState();
      }, { threshold: [0, 0.08, 0.25, 0.5, 0.75, 1] });
    }

    document.querySelectorAll('.post-stream .topic-post[data-post-number]').forEach((post) => {
      if (topicOutlineObservedPosts.has(post)) return;
      topicOutlineObservedPosts.add(post);
      topicOutlinePostObserver.observe(post);
    });
  }

  // 从当前地址提取帖子路由基座（/t/<slug>/<topicId>），用于构造楼层锚点。
  function getTopicRouteBase() {
    const match = window.location.pathname.match(/^\/t\/[^/]+\/\d+/);
    return match ? match[0] : null;
  }

  // 走 Discourse 的 SPA 路由跳转到指定楼层，与原生点击楼层锚点链接
  // （转圈加载→滚动到位，不整页刷新）的行为完全一致。
  function routeToPostNumber(number) {
    const base = getTopicRouteBase();
    if (!base) return false;
    const url = `${base}/${number}`;
    try {
      const pageWindow = getPageWindow();
      const container = pageWindow.Discourse && pageWindow.Discourse.__container__;
      const urlService = container?.lookup?.('service:url');
      if (typeof urlService?.routeTo === 'function') {
        urlService.routeTo(url);
        return true;
      }
      const amdRequire = pageWindow.require;
      if (typeof amdRequire === 'function') {
        const urlModule = amdRequire('discourse/lib/url');
        const routeTo = urlModule?.default?.routeTo || urlModule?.routeTo;
        if (typeof routeTo === 'function') {
          routeTo.call(urlModule?.default || urlModule, url);
          return true;
        }
      }
    } catch (e) { /* 继续走旧兜底 */ }
    return false;
  }

  function jumpToOutlinePost(number) {
    if (!Number.isFinite(number) || number <= 0) return;
    // 滚动容器上的 scroll-margin 不可靠（smooth 会被 Discourse 的滚动管理打断），
    // 这里手动计算目标位置，避开顶部编辑器外壳的 150px。
    const target = document.querySelector(`.post-stream .topic-post[data-post-number="${number}"]`)
      || document.getElementById(`post_${number}`);
    if (target) {
      const editorTop = parseInt(getComputedStyle(document.body).getPropertyValue('--qqdocs-editor-top'), 10) || 150;
      const top = target.getBoundingClientRect().top + window.scrollY - editorTop - 12;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      return;
    }
    // 未加载楼层：SPA 路由加载（原生锚点行为），失败再退回 Ember action。
    if (routeToPostNumber(number)) return;
    try {
      const pageWindow = getPageWindow();
      const container = pageWindow.Discourse && pageWindow.Discourse.__container__;
      container?.lookup?.('controller:topic')?.send?.('jumpToPost', number);
    } catch (e) {
      /* 未加载楼层跳转失败时静默忽略 */
    }
  }

  function bindTopicOutlineEvents(panel, fab) {
    const collapsedAtBind = panel.dataset.qqdocsOutlineBound === 'true';
    if (collapsedAtBind) return;
    panel.dataset.qqdocsOutlineBound = 'true';

    const applyVisibility = () => {
      const hidden = panel.classList.contains('is-hidden');
      fab.classList.toggle('is-hidden', !hidden);
      try {
        window.localStorage.setItem(TOPIC_OUTLINE_HIDDEN_KEY, hidden ? '1' : '0');
      } catch (e) { /* 隐私模式等场景忽略 */ }
    };
    const applyCollapsed = () => {
      const collapsed = panel.classList.contains('is-collapsed');
      panel.querySelector('.qqdocs-toc-collapse')?.setAttribute('aria-expanded', String(!collapsed));
      try {
        window.localStorage.setItem(TOPIC_OUTLINE_COLLAPSED_KEY, collapsed ? '1' : '0');
      } catch (e) { /* 忽略 */ }
    };

    panel.addEventListener('click', (event) => {
      const close = event.target.closest?.('.qqdocs-toc-close');
      if (close) {
        panel.classList.add('is-hidden');
        applyVisibility();
        return;
      }
      const collapse = event.target.closest?.('.qqdocs-toc-collapse');
      if (collapse) {
        panel.classList.toggle('is-collapsed');
        applyCollapsed();
        return;
      }
      const row = event.target.closest?.('.qqdocs-toc-headline');
      if (row) {
        // 未加载楼层走异步路由加载，先给该行一个转圈反馈。
        if (!row.classList.contains('is-loaded')) {
          row.classList.add('is-jumping');
          window.setTimeout(() => row.classList.remove('is-jumping'), 3500);
        }
        jumpToOutlinePost(Number(row.dataset.postNumber));
      }
    });

    fab.addEventListener('click', () => {
      panel.classList.remove('is-hidden');
      applyVisibility();
    });

    try {
      if (window.localStorage.getItem(TOPIC_OUTLINE_HIDDEN_KEY) === '1') panel.classList.add('is-hidden');
      if (window.localStorage.getItem(TOPIC_OUTLINE_COLLAPSED_KEY) === '1') panel.classList.add('is-collapsed');
    } catch (e) { /* 忽略 */ }
    applyVisibility();
    applyCollapsed();
  }

  function renderTopicOutline() {
    const postStream = document.querySelector('.post-stream');
    if (!postStream) {
      removeTopicOutline();
      return;
    }

    const data = collectOutlineEntries();
    if (!data || !data.entries.length) {
      removeTopicOutline();
      return;
    }

    let panel = document.querySelector('.qqdocs-toc-panel');
    let fab = document.querySelector('.qqdocs-toc-fab');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'qqdocs-toc-panel';
      panel.innerHTML = `
        <div class="qqdocs-toc-header">
          <div class="qqdocs-toc-title">大纲</div>
          <div class="qqdocs-toc-button-common">
            <div class="qqdocs-toc-btn qqdocs-toc-collapse" role="button" aria-label="折叠大纲" title="折叠/展开"></div>
            <div class="qqdocs-toc-btn qqdocs-toc-close" role="button" aria-label="关闭大纲" title="关闭"></div>
          </div>
        </div>
        <div class="qqdocs-toc-body">
          <div class="qqdocs-toc-headlines"></div>
        </div>
      `;
      document.body.appendChild(panel);
    }
    if (!fab) {
      fab = document.createElement('div');
      fab.className = 'qqdocs-toc-fab';
      fab.setAttribute('role', 'button');
      fab.setAttribute('aria-label', '展开大纲');
      fab.title = '大纲';
      document.body.appendChild(fab);
    }

    bindTopicOutlineEvents(panel, fab);
    syncTopicOutlineList(panel, data);
    ensureTopicOutlineObserver();
  }


  // 详情页样式必须有明确的页面作用域，避免列表页或弹窗被误伤。
  // 路由内模型重载期间 .post-stream 会短暂消失，此时按 /t/ 路径保持作用域。
  function isTopicRoute() {
    return /^\/t\//.test(window.location.pathname);
  }

  function syncTopicDetailScope() {
    if (!document.body) return;
    const inTopic = Boolean(document.querySelector('.post-stream')) || isTopicRoute();
    document.body.classList.toggle('qqdocs-topic-detail', inTopic);
  }

  function classifyCurrentPage() {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';

    if (document.querySelector('.post-stream') || isTopicRoute()) return 'topic';
    if (path === '/search' || path.startsWith('/search/')) return 'search';
    if (path === '/') return 'home';
    if (path === '/categories') return 'categories';
    if (path === '/tags') return 'tags';
    if (path === '/badges' || path.startsWith('/badges/')) return 'badges';
    if (path === '/u') return 'users';
    if (path === '/g') return 'groups';
    if (path.startsWith('/g/')) return 'group';
    if (/^\/u\/[^/]+\/preferences(?:\/|$)/.test(path)) return 'preferences';
    if (/^\/u\/[^/]+\/activity\/bookmarks(?:\/|$)/.test(path) || path === '/bookmarks') return 'bookmarks';
    if (/^\/u\/[^/]+\/notifications(?:\/|$)/.test(path) || path === '/notifications') return 'notifications';
    if (/^\/u\/[^/]+\/messages(?:\/|$)/.test(path) || path === '/my/messages') return 'messages';
    if (path.startsWith('/u/')) return 'user';
    if (path === '/about') return 'about';
    if (/^\/(?:guidelines|faq|tos|privacy)$/.test(path)) return 'static';
    if (/^\/(?:login|signup|password-reset|session)/.test(path)) return 'auth';
    if (path.startsWith('/review')) return 'review';
    if (path.startsWith('/chat')) return 'chat';
    if (path === '/404' || document.body?.classList.contains('error-page') || document.querySelector('.page-not-found')) return 'error';
    if (document.querySelector('.topic-list, .topic-list-container')) return 'list';
    return 'generic';
  }

  function syncWorkspaceNavigation(pageKind) {
    const path = window.location.pathname;
    const sidebar = document.querySelector('.desktop-layout-sidebar-pc');
    if (sidebar) {
      const links = Array.from(sidebar.querySelectorAll('.desktop-node-link-router'));
      links.forEach((link) => link.classList.remove('desktop-link-active'));

      let activeHref = '/';
      if (pageKind === 'categories' || pageKind === 'tags' || pageKind === 'groups' || pageKind === 'group' || pageKind === 'users') {
        activeHref = '/categories';
      } else if (pageKind === 'list' || path.startsWith('/c/') || path.startsWith('/tag/')) {
        activeHref = '/latest';
      } else if (path.startsWith('/top')) {
        activeHref = '/top';
      } else if (['user', 'preferences', 'bookmarks', 'notifications', 'messages'].includes(pageKind)) {
        activeHref = '/my/activity';
      }
      sidebar.querySelector(`.desktop-node-link-router[href="${activeHref}"]`)?.classList.add('desktop-link-active');
    }

    const tabs = document.querySelector('.desktop-home-page-tab-header-pc');
    if (tabs) {
      const links = Array.from(tabs.querySelectorAll('.desktop-tab-link'));
      links.forEach((link) => link.classList.remove('desktop-link-active'));
      let activeHref = '/';
      if (['categories', 'tags', 'groups', 'group', 'users'].includes(pageKind)) activeHref = '/categories';
      else if (['user', 'bookmarks', 'notifications', 'messages', 'preferences'].includes(pageKind)) activeHref = '/my/activity';
      tabs.querySelector(`.desktop-tab-link[href="${activeHref}"]`)?.classList.add('desktop-link-active');
    }
  }

  function replaceText(selector, text) {
    const element = document.querySelector(selector);
    if (element && element.textContent !== text) element.textContent = text;
  }

  function renderSecondaryPageLabels(pageKind) {
    const path = window.location.pathname;
    if (pageKind === 'categories') {
      replaceText('.category-list-header th.category', '空间名称');
      replaceText('.category-list-header th.topics', '近期动态');
      document.title = '团队空间';
    } else if (pageKind === 'tags') {
      replaceText('.tags-index .tags-controls h2', '模板标签');
      document.title = '模板标签';
    } else if (pageKind === 'badges') {
      replaceText('.badges h1, .badges h2', '模板中心');
      document.title = '模板中心';
    } else if (pageKind === 'groups') {
      replaceText('.groups-index > h1', '团队空间');
      document.title = '团队空间';
    } else if (pageKind === 'users') {
      replaceText('.users-directory > h1', '协作者');
      document.title = '协作者';
    } else if (pageKind === 'about') {
      replaceText('.about__header h1', '团队空间');
      replaceText('.about__header .short-description', '成员、权限与协作概览');
      replaceText('.about__left-side > h2', '空间说明');
      replaceText('.about__admins > h2', '空间管理员');
      replaceText('.about__moderators > h2', '协作管理员');
      document.title = '团队空间概览';
    } else if (pageKind === 'static') {
      const titleByPath = {
        '/guidelines': '共享空间规范',
        '/faq': '帮助中心',
        '/tos': '服务条款',
        '/privacy': '隐私设置'
      };
      document.title = titleByPath[path] || '帮助中心';
    } else if (pageKind === 'preferences') {
      document.title = '帐户设置';
    } else if (pageKind === 'bookmarks') {
      document.title = '收藏文档';
    } else if (pageKind === 'notifications') {
      document.title = '消息通知';
    } else if (pageKind === 'messages') {
      document.title = '协作消息';
    } else if (pageKind === 'error') {
      replaceText('.page-not-found .title', '文档暂时无法打开');
      replaceText('.page-not-found-search h2', '搜索其他文档');
      document.title = '文档未找到';
    }
  }

  function syncPageScope() {
    if (!document.body) return;
    const pageKind = classifyCurrentPage();
    document.body.classList.add('qqdocs-page');
    PAGE_SCOPE_CLASSES.forEach((className) => document.body.classList.remove(className));
    document.body.classList.add(`qqdocs-page-${pageKind}`);
    document.body.classList.toggle('qqdocs-page-secondary', !['home', 'list', 'search', 'topic'].includes(pageKind));
    document.body.dataset.qqdocsPage = pageKind;
    syncWorkspaceNavigation(pageKind);
    renderSecondaryPageLabels(pageKind);
  }

  function runRenderPass() {
    applyFavicon();
    syncPageScope();
    syncTopicDetailScope();
    renderHeader();
    renderSidebar();
    renderTopicList();
    renderSearchResults();
    renderTopicDetail();
    syncWorkspaceNavigation(classifyCurrentPage());
    syncPostImageToggles();
    syncPostEmojiLabels();
  }

  function queueRenderPass() {
    if (renderPassQueued) return;
    renderPassQueued = true;
    const flush = () => {
      renderPassQueued = false;
      runRenderPass();
    };
    if (typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(flush);
    else window.setTimeout(flush, 0);
  }

  function attachRouteListeners() {
    if (routeListenersAttached) return;
    routeListenersAttached = true;
    window.addEventListener('popstate', queueRenderPass);
    window.addEventListener('hashchange', queueRenderPass);
  }

  function handleDomMutations(records) {
    // Child-list and text mutations cover Discourse's normal re-rendering and
    // virtualized post/reaction replacement. Attribute observation fills the
    // remaining case where the same emoji image or its data-* marker wrapper
    // gets a new shortcode/source. Our own wrapper mutations may enqueue one
    // coalesced pass, but all sync operations remain idempotent.
    const shouldRender = records.some((record) => {
      if (record.type !== 'attributes') return true;

      const target = record.target;
      if (!target || target.nodeType !== 1) return false;
      return Boolean(target.closest('.post-stream .cooked, .post-stream .topic-meta-data, .post-stream nav.post-controls .discourse-reactions-list-emoji, .post-stream button.discourse-boosts__cooked'));
    });

    if (shouldRender) queueRenderPass();
  }

  function init() {
    applyFavicon();
    hijackTitle();
    attachRouteListeners();
    runRenderPass();

    if (domObserver) domObserver.disconnect();
    domObserver = new MutationObserver(handleDomMutations);

    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [
        'alt',
        'title',
        'src',
        'data-src',
        'data-emoji',
        'data-emoji-name',
        'data-emoji-shortcode',
        'data-name',
        'aria-label',
        'class'
      ]
    });
  }

  return { init: init };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DisguiseEngine };
}
