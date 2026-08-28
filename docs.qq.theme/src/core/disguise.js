// 腾讯文档官方原型对齐的伪装核心引擎
const DisguiseEngine = (function () {
  let isDisguiseEnabled = true;
  let customStyleElement = null;
  let domObserver = null;
  let renderPassQueued = false;
  let routeListenersAttached = false;
  let postImageInteractionsAttached = false;

  const POST_IMAGE_TOGGLE_WRAPPER = 'qqdocs-image-toggle';
  const POST_IMAGE_TOGGLE_HIDDEN = 'qqdocs-image-toggle--hidden';
  const POST_IMAGE_TOGGLE_SHOWN = 'qqdocs-image-toggle--shown';
  const POST_IMAGE_TOGGLE_OVERLAY = 'qqdocs-image-toggle-overlay';
  const POST_IMAGE_BOUND_ATTRIBUTE = 'data-qqdocs-image-toggle-bound';
  const POST_IMAGE_WRAPPER_ATTRIBUTE = 'data-qqdocs-image-toggle-wrapper';

  const POST_EMOJI_SELECTOR = [
    '.post-stream .cooked img.emoji',
    '.post-stream .cooked img.emoticon',
    '.post-stream .cooked img[data-emoji]',
    '.post-stream .cooked img[data-emoticon]',
    '.post-stream .cooked [data-emoji] > img',
    '.post-stream .cooked [data-emoticon] > img',
    '.post-stream .cooked [data-emoji-image]'
  ].join(', ');
  const POST_EMOJI_WRAPPER = 'qqdocs-emoji-wrapper';
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
    if (!isDisguiseEnabled || !isTopicDetailActive()) return;
    const toggle = findPostImageToggle(event.target);
    if (!toggle) return;

    // A lightbox is normally opened from a delegated click handler. Suppress
    // both clicks that precede dblclick so a deliberate double-click never
    // navigates away or opens the native lightbox first.
    event.preventDefault();
    event.stopPropagation();
  }

  function handlePostImageDoubleClick(event) {
    if (!isDisguiseEnabled || !isTopicDetailActive()) return;
    const toggle = findPostImageToggle(event.target);
    if (!toggle) return;

    event.preventDefault();
    event.stopPropagation();
    setPostImageToggleState(toggle, !toggle.classList.contains(POST_IMAGE_TOGGLE_SHOWN));
  }

  function handlePostImageKeydown(event) {
    if (!isDisguiseEnabled || !isTopicDetailActive()) return;
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
    const active = isDisguiseEnabled && isTopicDetailActive();
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

    // Discourse currently uses img.emoji; the data-* variants cover older
    // renderers and custom emoji markup without broadening this to ordinary
    // content images.
    if (image.matches('img.emoji, img.emoticon, img[data-emoji], img[data-emoticon], img[data-emoji-image]')) {
      return true;
    }

    return Boolean(image.closest('[data-emoji], [data-emoticon]'));
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

    wrapper.setAttribute('aria-label', labelText);
    wrapper.setAttribute('title', labelText);
    wrapper.dataset.qqdocsEmojiDescription = description;
    if (label) {
      label.textContent = labelText;
      label.setAttribute('aria-label', labelText);
    }
  }

  function createPostEmojiLabel(image) {
    if (!isPostEmoji(image) || image.hasAttribute(POST_EMOJI_BOUND_ATTRIBUTE)) return;

    const media = image.parentElement?.tagName === 'PICTURE' ? image.parentElement : image;
    const parent = media.parentNode;
    if (!parent || parent.closest(`.${POST_EMOJI_WRAPPER}`)) return;

    const wrapper = document.createElement('span');
    wrapper.className = POST_EMOJI_WRAPPER;
    wrapper.setAttribute(POST_EMOJI_WRAPPER_ATTRIBUTE, 'true');
    wrapper.setAttribute('role', 'img');
    wrapper.tabIndex = 0;

    const label = document.createElement('span');
    label.className = POST_EMOJI_LABEL;
    label.setAttribute('aria-hidden', 'true');

    parent.insertBefore(wrapper, media);
    wrapper.append(media, label);

    // Keep the original alt/title untouched. The wrapper provides one stable
    // accessible name while the child image remains the original DOM node.
    if (!image.hasAttribute('aria-hidden')) {
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
    const active = isDisguiseEnabled && isTopicDetailActive();
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
      if (!image || !isPostEmoji(image)) {
        unwrapPostEmojiLabel(wrapper);
        return;
      }
      updatePostEmojiLabel(wrapper, image);
    });
  }

  // 1. Favicon 伪装
  function applyFavicon() {
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = ICONS.favicon;
  }

  // 2. Title 动态劫持
  function hijackTitle() {
    const originalTitleDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'title') ||
      Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'title');

    function getFormattedTitle(rawTitle) {
      if (!isDisguiseEnabled) return rawTitle;
      if (!rawTitle) return '腾讯文档';

      let clean = rawTitle.replace(/\s*-\s*LINUX DO.*$/i, '').trim();
      clean = clean.replace(/^\(\d+\)\s*/, '');

      if (!clean || clean === 'LINUX DO' || clean.includes('新的理想型社区')) {
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
    if (!isDisguiseEnabled) return;
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
    if (!isDisguiseEnabled) return;
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
    if (!isDisguiseEnabled) return;

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

  // 6. 详情页腾讯文档编辑器外壳（全部为无交互的视觉装饰）
  function renderTopicDetail() {
    const postStream = document.querySelector('.post-stream');
    const oldToolbar = document.querySelector('.qqdocs-doc-toolbar');
    if (oldToolbar) oldToolbar.remove();

    if (!postStream || !isDisguiseEnabled) {
      document.querySelector('.qqdocs-editor-shell')?.remove();
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
    if (shell && (!shell.querySelector('.qqdocs-editor-divider') || !shell.querySelector('.qqdocs-topic-stats'))) {
      shell.remove();
      shell = null;
    }
    if (!shell) {
      shell = document.createElement('div');
      shell.className = 'qqdocs-editor-shell';
      shell.setAttribute('aria-hidden', 'true');
      shell.innerHTML = `
        <div class="qqdocs-editor-titlebar">
          <div class="qqdocs-editor-title-left">
            <span class="qqdocs-editor-home">${renderTdocsChromeIcon('home', 28)}</span>
            <span class="qqdocs-editor-plus">${renderTdocsChromeIcon('plus', 24)}</span>
            <span class="qqdocs-editor-divider"></span>
            <strong class="qqdocs-editor-title-text"></strong>
            <span class="qqdocs-topic-stats" role="group" aria-label="主题统计" aria-live="polite"></span>
            <span class="qqdocs-editor-readonly"><span>只能查看</span>${renderTdocsChromeIcon('arrow', 6)}</span>
            <span class="qqdocs-editor-star">${renderTdocsChromeIcon('star', 16)}</span>
            <span class="qqdocs-editor-folder">${renderTdocsChromeIcon('folder', 16)}</span>
          </div>
          <div class="qqdocs-editor-title-actions">
            <span class="qqdocs-editor-action">${renderTdocsChromeIcon('more', 24)}</span>
            <span class="qqdocs-editor-action">${renderTdocsChromeIcon('ai', 24)}</span>
            <span class="qqdocs-editor-action qqdocs-editor-presentation">${renderTdocsChromeIcon('presentation', 24)}</span>
            <span class="qqdocs-editor-collaborator">${renderTdocsChromeIcon('collaborator', 24)}</span>
            <span class="qqdocs-editor-share">分享</span>
            <span class="qqdocs-editor-account">${renderTdocsChromeIcon('collaborator', 24)}${renderTdocsChromeIcon('wechat', 14)}</span>
          </div>
        </div>
        <div class="qqdocs-editor-tabs">
          <span class="is-active">开始</span><span>插入</span><span>页面</span><span>引用</span>
          <span>审阅</span><span>视图</span><span>效率工具</span><span>公文助手</span><span>会员专享</span>
        </div>
        <div class="qqdocs-editor-ribbon">
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
    renderTopicStatistics(shell);
  }

  // 详情页样式必须有明确的页面作用域，避免列表页或弹窗被误伤。
  function syncTopicDetailScope() {
    if (!document.body) return;
    document.body.classList.toggle('qqdocs-topic-detail', Boolean(document.querySelector('.post-stream')));
  }

  function runRenderPass() {
    syncTopicDetailScope();
    renderHeader();
    renderSidebar();
    renderTopicList();
    renderTopicDetail();
    syncPostImageToggles();
    syncPostEmojiLabels();
    mountToggleBadge();
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

  // 7. 快捷切换悬浮徽标 (Alt + Q)
  function mountToggleBadge() {
    if (document.querySelector('.qqdocs-toggle-badge')) return;

    const badge = document.createElement('div');
    badge.className = 'qqdocs-toggle-badge';
    badge.title = '快捷键 Alt + Q 切换伪装模式';
    badge.innerHTML = `
      ${renderOfficialIcon('toolkit', 14)}
      <span class="qqdocs-badge-text">${isDisguiseEnabled ? '腾讯文档模式 (Alt+Q)' : '原版模式 (Alt+Q)'}</span>
    `;

    badge.addEventListener('click', toggleDisguise);
    document.body.appendChild(badge);

    window.addEventListener('keydown', function (e) {
      if (e.altKey && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault();
        toggleDisguise();
      }
    });
  }

  function toggleDisguise() {
    isDisguiseEnabled = !isDisguiseEnabled;
    const badgeText = document.querySelector('.qqdocs-badge-text');
    if (badgeText) {
      badgeText.textContent = isDisguiseEnabled ? '腾讯文档模式 (Alt+Q)' : '原版模式 (Alt+Q)';
    }

    if (customStyleElement) {
      customStyleElement.disabled = !isDisguiseEnabled;
    }

    const sidebar = document.querySelector('.desktop-layout-sidebar-pc');
    if (sidebar) sidebar.style.display = isDisguiseEnabled ? 'flex' : 'none';

    const tabs = document.querySelector('.desktop-home-page-tab-header-pc');
    if (tabs) tabs.style.display = isDisguiseEnabled ? 'flex' : 'none';

    const searchWrap = document.querySelector('.desktop-search-input-pc');
    if (searchWrap) searchWrap.style.display = isDisguiseEnabled ? 'flex' : 'none';

    const editorShell = document.querySelector('.qqdocs-editor-shell');
    if (editorShell) editorShell.style.display = isDisguiseEnabled ? '' : 'none';

    if (isDisguiseEnabled) {
      applyFavicon();
      document.title = document.title;
      renderTopicDetail();
      syncPostImageToggles();
      syncPostEmojiLabels();
    } else {
      document.title = 'LINUX DO';
      cleanupPostImageToggles();
      cleanupPostEmojiLabels();
      renderTopicDetail();
    }
  }

  function init(styleEl) {
    customStyleElement = styleEl;
    applyFavicon();
    hijackTitle();
    attachRouteListeners();
    runRenderPass();

    if (domObserver) domObserver.disconnect();
    domObserver = new MutationObserver(queueRenderPass);

    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  return {
    init: init,
    toggle: toggleDisguise
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DisguiseEngine };
}
