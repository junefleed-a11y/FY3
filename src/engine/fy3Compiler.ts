import { FY3ScriptData, FY3Rule, FY3Action, GameScene } from '../types/engine';

// ==========================================
// FY3 SMART AUTO-CORRECTOR DICTIONARY
// ==========================================
export const FY3_TYPOS_DICTIONARY: Record<string, string> = {
  // Key press typos (ضغط)
  'ضعط': 'ضغط',
  'ضغطه': 'ضغط',
  'اضغط': 'ضغط',
  'ظغط': 'ضغط',
  'يضغط': 'ضغط',
  'تضغط': 'ضغط',
  'ضغظ': 'ضغط',
  'دعط': 'ضغط',

  // Condition "if" typos (اذا)
  'أذا': 'اذا',
  'إزا': 'اذا',
  'ازا': 'اذا',
  'اذه': 'اذا',
  'ادا': 'اذا',
  'إذا': 'اذا',
  'لو': 'اذا',

  // Collision "touch / collide" typos (لمس / اصطدم)
  'لمش': 'لمس',
  'لامس': 'لمس',
  'يلمس': 'لمس',
  'تلامس': 'لمس',
  'لمسه': 'لمس',
  'مس': 'لمس',
  'اصتدم': 'اصطدم',
  'صدم': 'اصطدم',
  'يصطدم': 'اصطدم',
  'تصادم': 'اصطدم',

  // Player / Entity typos (لاعب / كائن)
  'لاعيب': 'لاعب',
  'لاعل': 'لاعب',
  'الاعب': 'لاعب',
  'لاعبة': 'لاعب',
  'لعيب': 'لاعب',
  'كائنن': 'كائن',
  'كاائن': 'كائن',

  // Death / Kill typos (موت)
  'يموت': 'موت',
  'تدمر': 'موت',
  'اموت': 'موت',
  'موت_لاعب': 'موت لاعب',
  'تدمير': 'موت',
  'قتل': 'موت',

  // Scene typos (مشهد / مرحلة)
  'مشهذ': 'مشهد',
  'مسحد': 'مشهد',
  'مشاهد': 'مشهد',
  'مشهدد': 'مشهد',
  'تغير_مشهد': 'تغير مشهد',
  'انتقال_مشهد': 'انتقل الى مشهد',

  // Movement typos (تحرك)
  'تحركك': 'تحرك',
  'امشي': 'تحرك',
  'حرك': 'تحرك',
  'يمشي': 'تحرك',
  'اتحرك': 'تحرك',

  // Jump typos (قفز)
  'قفزه': 'قفز',
  'نط': 'قفز',
  'ينط': 'قفز',
  'يقفز': 'قفز',
  'قفزة': 'قفز',

  // Camera typos (كاميرا)
  'كامره': 'كاميرا',
  'كاميره': 'كاميرا',
  'كيمرا': 'كاميرا',
  'الكمرة': 'كاميرا',

  // Variables and Score typos (متغير / نقاط / سرعة)
  'سرعه': 'سرعة',
  'سرعتي': 'سرعة',
  'نقاطه': 'نقاط',
  'نقطه': 'نقاط',
  'سكور': 'نقاط',
  'متغيرر': 'متغير',
  'متغبر': 'متغير',
  'المتغير': 'متغير',

  // Arrow keys & Space
  'سهم_يمن': 'سهم_يمين',
  'سهم_ييمين': 'سهم_يمين',
  'يمين': 'سهم_يمين',
  'سهم_يسر': 'سهم_يسار',
  'سهم_يساار': 'سهم_يسار',
  'يسار': 'سهم_يسار',
  'سهم_فوق': 'سهم_فوق',
  'فوق': 'سهم_فوق',
  'اعلى': 'سهم_فوق',
  'سهم_تحت': 'سهم_تحت',
  'تحت': 'سهم_تحت',
  'اسفل': 'سهم_تحت',
  'مسافه': 'مسافة',
  'سبيس': 'مسافة',

  // English typos
  'iff': 'if',
  'fi': 'if',
  'toch': 'touch',
  'tuoch': 'touch',
  'tuch': 'touch',
  'pres': 'press',
  'presss': 'press',
  'moev': 'move',
  'mve': 'move',
  'jmp': 'jump',
  'scne': 'scene',
  'secne': 'scene',
  'varible': 'variable',
  'variabel': 'variable',
  'plyer': 'player',
  'palye': 'player',
};

// ==========================================
// 100+ FY3 COMMANDS ENCYCLOPEDIA & CATALOG
// ==========================================
export interface FY3CommandInfo {
  id: string;
  category: 'camera' | 'movement' | 'entity' | 'input' | 'scenes' | 'audio' | 'animation' | 'variables';
  categoryAr: string;
  categoryEn: string;
  syntaxAr: string;
  syntaxEn: string;
  descAr: string;
  descEn: string;
  exampleAr: string;
  exampleEn: string;
}

export const FY3_COMMANDS_CATALOG: FY3CommandInfo[] = [
  // --- CAMERA COMMANDS (1-12) ---
  {
    id: 'cam_follow',
    category: 'camera',
    categoryAr: 'الكاميرا الذكية',
    categoryEn: 'Smart Camera',
    syntaxAr: 'كاميرا تتبع [كائن]  /  تابع كاميرا',
    syntaxEn: 'camera follow [entity]',
    descAr: 'تجعل الكاميرا تلاحق الكائن في العالم اللانهائي بسلاسة.',
    descEn: 'Smoothly tracks the target entity across the infinite world.',
    exampleAr: 'عند البدء = تابع كاميرا',
    exampleEn: 'on start = camera follow player'
  },
  {
    id: 'cam_stop',
    category: 'camera',
    categoryAr: 'الكاميرا الذكية',
    categoryEn: 'Smart Camera',
    syntaxAr: 'وقف كاميرا  /  تحرير كاميرا',
    syntaxEn: 'stop camera',
    descAr: 'إلغاء متابعة الكائن وتثبيت الكاميرا في مكانها الحالي.',
    descEn: 'Detaches camera from target entity.',
    exampleAr: 'اذا بطل لمس عرش = وقف كاميرا',
    exampleEn: 'if hero touch throne = stop camera'
  },
  {
    id: 'cam_shake',
    category: 'camera',
    categoryAr: 'الكاميرا الذكية',
    categoryEn: 'Smart Camera',
    syntaxAr: 'اهتزاز كاميرا  /  هز شاشة',
    syntaxEn: 'shake camera',
    descAr: 'إحداث اهتزاز سينمائي للشاشة عند التعرض لضرر أو انفجار.',
    descEn: 'Triggers a cinematic camera shake on impact.',
    exampleAr: 'اذا سيارة اصطدم مع صخرة = اهتزاز كاميرا',
    exampleEn: 'if car collide rock = shake camera'
  },
  {
    id: 'cam_zoom_in',
    category: 'camera',
    categoryAr: 'الكاميرا الذكية',
    categoryEn: 'Smart Camera',
    syntaxAr: 'تقريب كاميرا [نسبة]',
    syntaxEn: 'zoom in camera [factor]',
    descAr: 'تقريب منظور الكاميرا للتركيز على الحركة.',
    descEn: 'Zooms camera in for close-up action.',
    exampleAr: 'اذا لاعب ضغط z = تقريب كاميرا 1.5',
    exampleEn: 'if player press z = zoom in camera 1.5'
  },
  {
    id: 'cam_zoom_out',
    category: 'camera',
    categoryAr: 'الكاميرا الذكية',
    categoryEn: 'Smart Camera',
    syntaxAr: 'تبعيد كاميرا [نسبة]',
    syntaxEn: 'zoom out camera [factor]',
    descAr: 'تبعيد منظور الكاميرا لرؤية مساحة أوسع من العالم.',
    descEn: 'Zooms camera out for wide view.',
    exampleAr: 'اذا لاعب ضغط x = تبعيد كاميرا 0.7',
    exampleEn: 'if player press x = zoom out camera 0.7'
  },
  {
    id: 'cam_reset',
    category: 'camera',
    categoryAr: 'الكاميرا الذكية',
    categoryEn: 'Smart Camera',
    syntaxAr: 'اعادة ضبط كاميرا',
    syntaxEn: 'reset camera',
    descAr: 'إعادة التقريب والموضع للوضع الافتراضي (1.0).',
    descEn: 'Resets camera zoom and position to default.',
    exampleAr: 'اذا لاعب ضغط r = اعادة ضبط كاميرا',
    exampleEn: 'if player press r = reset camera'
  },
  {
    id: 'cam_move_x',
    category: 'camera',
    categoryAr: 'الكاميرا الذكية',
    categoryEn: 'Smart Camera',
    syntaxAr: 'تحريك كاميرا [سرعة] x',
    syntaxEn: 'move camera [speed] x',
    descAr: 'تحريك الكاميرا أفقياً بشكل يدوي بدون ربطها بكائن.',
    descEn: 'Manually moves camera along X axis.',
    exampleAr: 'في كل لحظة = تحريك كاميرا 50 x',
    exampleEn: 'on update = move camera 50 x'
  },
  {
    id: 'cam_move_y',
    category: 'camera',
    categoryAr: 'الكاميرا الذكية',
    categoryEn: 'Smart Camera',
    syntaxAr: 'تحريك كاميرا [سرعة] y',
    syntaxEn: 'move camera [speed] y',
    descAr: 'تحريك الكاميرا عمودياً.',
    descEn: 'Manually moves camera along Y axis.',
    exampleAr: 'في كل لحظة = تحريك كاميرا -30 y',
    exampleEn: 'on update = move camera -30 y'
  },
  {
    id: 'cam_set_pos',
    category: 'camera',
    categoryAr: 'الكاميرا الذكية',
    categoryEn: 'Smart Camera',
    syntaxAr: 'موضع كاميرا [x] [y]',
    syntaxEn: 'camera position [x] [y]',
    descAr: 'نقل الكاميرا فوراً لإحداثيات محددة في العالم.',
    descEn: 'Teleports camera to specified world coordinates.',
    exampleAr: 'عند البدء = موضع كاميرا 0 0',
    exampleEn: 'on start = camera position 0 0'
  },

  // --- MOVEMENT & PHYSICS (13-35) ---
  {
    id: 'mov_move_x',
    category: 'movement',
    categoryAr: 'الحركة والفيزياء',
    categoryEn: 'Movement & Physics',
    syntaxAr: 'تحرك [سرعة] x',
    syntaxEn: 'move [speed] x',
    descAr: 'تحريك الكائن أفقياً (موجب لليمين، سالب لليسار).',
    descEn: 'Moves entity horizontally (positive = right, negative = left).',
    exampleAr: 'اذا بطل ضغط سهم_يمين = تحرك 150 x',
    exampleEn: 'if hero press ArrowRight = move 150 x'
  },
  {
    id: 'mov_move_y',
    category: 'movement',
    categoryAr: 'الحركة والفيزياء',
    categoryEn: 'Movement & Physics',
    syntaxAr: 'تحرك [سرعة] y',
    syntaxEn: 'move [speed] y',
    descAr: 'تحريك الكائن عمودياً (موجب للأسفل، سالب للأعلى).',
    descEn: 'Moves entity vertically.',
    exampleAr: 'اذا طائرة ضغط سهم_فوق = تحرك -120 y',
    exampleEn: 'if plane press ArrowUp = move -120 y'
  },
  {
    id: 'mov_jump',
    category: 'movement',
    categoryAr: 'الحركة والفيزياء',
    categoryEn: 'Movement & Physics',
    syntaxAr: 'قفز [قوة]  /  نط [قوة]',
    syntaxEn: 'jump [power]',
    descAr: 'إعطاء دفعة للأعلى للقفز ضد الجاذبية.',
    descEn: 'Launches entity upward against gravity.',
    exampleAr: 'اذا ارنب ضغط مسافة = قفز 250',
    exampleEn: 'if rabbit press Space = jump 250'
  },
  {
    id: 'mov_stop',
    category: 'movement',
    categoryAr: 'الحركة والفيزياء',
    categoryEn: 'Movement & Physics',
    syntaxAr: 'توقف  /  وقف حركة',
    syntaxEn: 'stop movement',
    descAr: 'تصفير سرعة الكائن وإيقافه فوراً في مكانه.',
    descEn: 'Instantly stops entity velocity.',
    exampleAr: 'اذا سيارة لمس حاجز = توقف',
    exampleEn: 'if car touch wall = stop movement'
  },
  {
    id: 'mov_rotate',
    category: 'movement',
    categoryAr: 'الحركة والفيزياء',
    categoryEn: 'Movement & Physics',
    syntaxAr: 'دوران [زاوية]',
    syntaxEn: 'rotate [angle]',
    descAr: 'تدوير الكائن بعدد محدد من الدرجات.',
    descEn: 'Rotates entity by degrees.',
    exampleAr: 'اذا نجمة ضغط r = دوران 45',
    exampleEn: 'if star press r = rotate 45'
  },
  {
    id: 'mov_continuous_spin',
    category: 'movement',
    categoryAr: 'الحركة والفيزياء',
    categoryEn: 'Movement & Physics',
    syntaxAr: 'دوران مستمر [سرعة]',
    syntaxEn: 'continuous spin [speed]',
    descAr: 'جعل الكائن يدور باستمرار في كل إطار.',
    descEn: 'Makes entity spin continuously on each frame.',
    exampleAr: 'في كل لحظة = دوران مستمر 5',
    exampleEn: 'on update = continuous spin 5'
  },
  {
    id: 'mov_flip',
    category: 'movement',
    categoryAr: 'الحركة والفيزياء',
    categoryEn: 'Movement & Physics',
    syntaxAr: 'عكس اتجاه  /  استدارة',
    syntaxEn: 'reverse direction',
    descAr: 'عكس مسار الحركة والسرعة في الاتجاه المعاكس.',
    descEn: 'Inverts current velocity.',
    exampleAr: 'اذا كرة لمس جدار = عكس اتجاه',
    exampleEn: 'if ball touch wall = reverse direction'
  },
  {
    id: 'mov_gravity',
    category: 'movement',
    categoryAr: 'الحركة والفيزياء',
    categoryEn: 'Movement & Physics',
    syntaxAr: 'جاذبية = [قيمة]  /  تغيير جاذبية [قيمة]',
    syntaxEn: 'gravity = [value]',
    descAr: 'تعديل قيمة الجاذبية المؤثرة على هذا الكائن.',
    descEn: 'Sets gravity force for entity.',
    exampleAr: 'عند البدء = جاذبية = 12',
    exampleEn: 'on start = gravity = 12'
  },
  {
    id: 'mov_follow_target',
    category: 'movement',
    categoryAr: 'الحركة والفيزياء',
    categoryEn: 'Movement & Physics',
    syntaxAr: 'تحرك نحو [كائن]  /  اتبع [كائن]',
    syntaxEn: 'move toward [entity]',
    descAr: 'مطاردة كائن آخر بذكاء (مفيد للوحوش والأعداء).',
    descEn: 'Smartly pursues target entity (AI enemy homing).',
    exampleAr: 'في كل لحظة = تحرك نحو لاعب',
    exampleEn: 'on update = move toward player'
  },
  {
    id: 'mov_random_pos',
    category: 'movement',
    categoryAr: 'الحركة والفيزياء',
    categoryEn: 'Movement & Physics',
    syntaxAr: 'موضع عشوائي',
    syntaxEn: 'random position',
    descAr: 'نقل الكائن إلى إحداثيات عشوائية على الشاشة.',
    descEn: 'Teleports entity to a random screen coordinate.',
    exampleAr: 'اذا لاعب لمس عملة = موضع عشوائي',
    exampleEn: 'if player touch coin = random position'
  },
  {
    id: 'mov_dash',
    category: 'movement',
    categoryAr: 'الحركة والفيزياء',
    categoryEn: 'Movement & Physics',
    syntaxAr: 'اندفاع سريع [سرعة]  /  داش [سرعة]',
    syntaxEn: 'dash [speed]',
    descAr: 'إعطاء دفعة سريعة ومفاجئة للأمام.',
    descEn: 'Applies sudden forward speed burst.',
    exampleAr: 'اذا بطل ضغط shift = اندفاع سريع 300',
    exampleEn: 'if hero press shift = dash 300'
  },

  // --- ENTITIES & ATTRIBUTES (36-60) ---
  {
    id: 'ent_kill_self',
    category: 'entity',
    categoryAr: 'الكائنات والمظهر',
    categoryEn: 'Entities & Appearance',
    syntaxAr: 'موت  /  تدمير',
    syntaxEn: 'destroy  /  kill',
    descAr: 'تدمير الكائن الحالي وإخفاؤه من اللعبة.',
    descEn: 'Destroys this entity and removes it.',
    exampleAr: 'اذا شوك لمس لاعب = موت',
    exampleEn: 'if spike touch player = destroy'
  },
  {
    id: 'ent_kill_target',
    category: 'entity',
    categoryAr: 'الكائنات والمظهر',
    categoryEn: 'Entities & Appearance',
    syntaxAr: 'موت [كائن]  /  تدمير [كائن]',
    syntaxEn: 'kill [entity]  /  destroy [entity]',
    descAr: 'تدمير كائن محدد بالاسم عند حدوث شرط (مثال: موت لاعب).',
    descEn: 'Destroys the specified entity name on event.',
    exampleAr: 'اذا سيارة لمس برميل = موت برميل',
    exampleEn: 'if car touch barrel = kill barrel'
  },
  {
    id: 'ent_hide',
    category: 'entity',
    categoryAr: 'الكائنات والمظهر',
    categoryEn: 'Entities & Appearance',
    syntaxAr: 'اخفاء  /  اخفاء [كائن]',
    syntaxEn: 'hide [entity]',
    descAr: 'إخفاء الكائن وجعله غير مرئي دون حذفه.',
    descEn: 'Makes entity invisible without deleting.',
    exampleAr: 'اذا كنز لمس لاعب = اخفاء',
    exampleEn: 'if chest touch player = hide'
  },
  {
    id: 'ent_show',
    category: 'entity',
    categoryAr: 'الكائنات والمظهر',
    categoryEn: 'Entities & Appearance',
    syntaxAr: 'اظهار  /  اظهار [كائن]',
    syntaxEn: 'show [entity]',
    descAr: 'إعادة إظهار الكائن المخفي على الشاشة.',
    descEn: 'Makes hidden entity visible.',
    exampleAr: 'اذا لاعب ضغط space = اظهار بوابة',
    exampleEn: 'if player press space = show portal'
  },
  {
    id: 'ent_color',
    category: 'entity',
    categoryAr: 'الكائنات والمظهر',
    categoryEn: 'Entities & Appearance',
    syntaxAr: 'تغيير لون [لون]',
    syntaxEn: 'change color [color]',
    descAr: 'تلوين الكائن فورياً (أحمر، أزرق، أخضر، أصفر، أبيض، أسود).',
    descEn: 'Changes entity fill color dynamically.',
    exampleAr: 'اذا مكعب لمس نار = تغيير لون احمر',
    exampleEn: 'if box touch fire = change color red'
  },
  {
    id: 'ent_scale_up',
    category: 'entity',
    categoryAr: 'الكائنات والمظهر',
    categoryEn: 'Entities & Appearance',
    syntaxAr: 'تكبير [نسبة]',
    syntaxEn: 'scale up [factor]',
    descAr: 'مضاعفة أبعاد وحجم الكائن.',
    descEn: 'Multiplies entity dimensions by scale factor.',
    exampleAr: 'اذا لاعب لمس فطر = تكبير 1.5',
    exampleEn: 'if player touch mushroom = scale up 1.5'
  },
  {
    id: 'ent_scale_down',
    category: 'entity',
    categoryAr: 'الكائنات والمظهر',
    categoryEn: 'Entities & Appearance',
    syntaxAr: 'تصغير [نسبة]',
    syntaxEn: 'scale down [factor]',
    descAr: 'تقليص أبعاد وحجم الكائن.',
    descEn: 'Reduces entity size.',
    exampleAr: 'اذا لاعب لمس سم = تصغير 0.8',
    exampleEn: 'if player touch poison = scale down 0.8'
  },
  {
    id: 'ent_opacity',
    category: 'entity',
    categoryAr: 'الكائنات والمظهر',
    categoryEn: 'Entities & Appearance',
    syntaxAr: 'شفافية [قيمة]',
    syntaxEn: 'opacity [value]',
    descAr: 'ضبط شفافية الكائن بين 0 (مخفي) إلى 1 (واضح تماماً).',
    descEn: 'Sets entity alpha opacity (0 to 1).',
    exampleAr: 'اذا شبح لمس ضوء = شفافية 0.3',
    exampleEn: 'if ghost touch light = opacity 0.3'
  },
  {
    id: 'ent_flash',
    category: 'entity',
    categoryAr: 'الكائنات والمظهر',
    categoryEn: 'Entities & Appearance',
    syntaxAr: 'وميض  /  فلاش',
    syntaxEn: 'flash entity',
    descAr: 'جعل الكائن يومض للإشارة إلى الضرر أو الحماية المؤقتة.',
    descEn: 'Toggles rapid flash for damage indicator.',
    exampleAr: 'اذا لاعب اصطدم مع شوك = وميض',
    exampleEn: 'if player collide spike = flash'
  },
  {
    id: 'ent_toggle_collision',
    category: 'entity',
    categoryAr: 'الكائنات والمظهر',
    categoryEn: 'Entities & Appearance',
    syntaxAr: 'تفعيل تصادم  /  تعطيل تصادم',
    syntaxEn: 'enable collision  /  disable collision',
    descAr: 'التحكم في فيزياء وتصادم الكائن مع باقي العناصر.',
    descEn: 'Enables or disables physical collision bounds.',
    exampleAr: 'اذا لاعب ضغط g = تعطيل تصادم',
    exampleEn: 'if player press g = disable collision'
  },

  // --- SCENES & TRANSITIONS (61-75) ---
  {
    id: 'scn_change',
    category: 'scenes',
    categoryAr: 'المشاهد والمراحل',
    categoryEn: 'Scenes & Stages',
    syntaxAr: 'تغير مشهد [اسم]  /  انتقل الى مشهد [اسم]',
    syntaxEn: 'change scene [name]',
    descAr: 'الانتقال المباشر إلى مشهد أو مرحلة أخرى بالاسم أو الرقم.',
    descEn: 'Instantly transitions to specified scene.',
    exampleAr: 'اذا بطل لمس بوابة = تغير مشهد 2',
    exampleEn: 'if hero touch portal = change scene 2'
  },
  {
    id: 'scn_reload',
    category: 'scenes',
    categoryAr: 'المشاهد والمراحل',
    categoryEn: 'Scenes & Stages',
    syntaxAr: 'اعادة مشهد  /  اعادة تشغيل مرحلة',
    syntaxEn: 'reload scene',
    descAr: 'إعادة تحميل المشهد الحالي من البداية عند الخسارة.',
    descEn: 'Restarts current active scene.',
    exampleAr: 'اذا لاعب لمس حمم = اعادة مشهد',
    exampleEn: 'if player touch lava = reload scene'
  },
  {
    id: 'scn_next',
    category: 'scenes',
    categoryAr: 'المشاهد والمراحل',
    categoryEn: 'Scenes & Stages',
    syntaxAr: 'المشهد التالي',
    syntaxEn: 'next scene',
    descAr: 'الانتقال التلقائي للمرحلة التالية في قائمة المشاهد.',
    descEn: 'Transitions to the next scene in hierarchy.',
    exampleAr: 'اذا لاعب لمس علم = المشهد التالي',
    exampleEn: 'if player touch flag = next scene'
  },

  // --- AUDIO & SFX (76-88) ---
  {
    id: 'snd_jump',
    category: 'audio',
    categoryAr: 'الأصوات والمؤثرات',
    categoryEn: 'Audio & SFX',
    syntaxAr: 'شغل صوت قفز',
    syntaxEn: 'play sound jump',
    descAr: 'تشغيل نغمة صوت قفزة كرتونية فورية.',
    descEn: 'Plays retro jump audio effect.',
    exampleAr: 'اذا لاعب ضغط مسافة = شغل صوت قفز',
    exampleEn: 'if player press Space = play sound jump'
  },
  {
    id: 'snd_laser',
    category: 'audio',
    categoryAr: 'الأصوات والمؤثرات',
    categoryEn: 'Audio & SFX',
    syntaxAr: 'شغل صوت ليزر',
    syntaxEn: 'play sound laser',
    descAr: 'تشغيل صوت طلقة ليزر أو مقذوف.',
    descEn: 'Plays laser beam shoot sound.',
    exampleAr: 'اذا مركبة ضغط مسافة = شغل صوت ليزر',
    exampleEn: 'if ship press Space = play sound laser'
  },
  {
    id: 'snd_hit',
    category: 'audio',
    categoryAr: 'الأصوات والمؤثرات',
    categoryEn: 'Audio & SFX',
    syntaxAr: 'شغل صوت ضربة',
    syntaxEn: 'play sound hit',
    descAr: 'تشغيل صوت اصطدام أو تلقي ضرر.',
    descEn: 'Plays punch/impact sound.',
    exampleAr: 'اذا سيارة لمس جدار = شغل صوت ضربة',
    exampleEn: 'if car touch wall = play sound hit'
  },
  {
    id: 'snd_coin',
    category: 'audio',
    categoryAr: 'الأصوات والمؤثرات',
    categoryEn: 'Audio & SFX',
    syntaxAr: 'شغل صوت عملة',
    syntaxEn: 'play sound coin',
    descAr: 'تشغيل رنين جمع ذهب أو نجمة.',
    descEn: 'Plays sparkling coin pickup chime.',
    exampleAr: 'اذا لاعب لمس نجمة = شغل صوت عملة',
    exampleEn: 'if player touch star = play sound coin'
  },
  {
    id: 'snd_explosion',
    category: 'audio',
    categoryAr: 'الأصوات والمؤثرات',
    categoryEn: 'Audio & SFX',
    syntaxAr: 'شغل صوت انفجار',
    syntaxEn: 'play sound explosion',
    descAr: 'تشغيل دوي انفجار قوي وتدمير.',
    descEn: 'Plays booming explosion effect.',
    exampleAr: 'اذا صاروخ لمس وحش = شغل صوت انفجار',
    exampleEn: 'if missile touch monster = play sound explosion'
  },
  {
    id: 'snd_win',
    category: 'audio',
    categoryAr: 'الأصوات والمؤثرات',
    categoryEn: 'Audio & SFX',
    syntaxAr: 'شغل صوت فوز',
    syntaxEn: 'play sound win',
    descAr: 'تشغيل لحن الانتصار وإنهاء المرحلة.',
    descEn: 'Plays joyful victory fanfare.',
    exampleAr: 'اذا لاعب لمس كأس = شغل صوت فوز',
    exampleEn: 'if player touch trophy = play sound win'
  },
  {
    id: 'snd_lose',
    category: 'audio',
    categoryAr: 'الأصوات والمؤثرات',
    categoryEn: 'Audio & SFX',
    syntaxAr: 'شغل صوت خسارة',
    syntaxEn: 'play sound lose',
    descAr: 'تشغيل نغمة الخسارة وانتهاء المحاولة.',
    descEn: 'Plays defeat sound effect.',
    exampleAr: 'اذا لاعب لمس وحش = شغل صوت خسارة',
    exampleEn: 'if player touch monster = play sound lose'
  },

  // --- ANIMATION (89-94) ---
  {
    id: 'anim_play',
    category: 'animation',
    categoryAr: 'استوديو الأنميشن',
    categoryEn: 'Sprite Animation',
    syntaxAr: 'شغل انميشن [اسم]',
    syntaxEn: 'play animation [name]',
    descAr: 'تشغيل حركة مرسومة من استوديو الأنميشن (ركض، قفز، ضرب، وقوف).',
    descEn: 'Plays designated frame animation.',
    exampleAr: 'اذا لاعب ضغط سهم_يمين = شغل انميشن ركض',
    exampleEn: 'if player press ArrowRight = play animation run'
  },
  {
    id: 'anim_stop',
    category: 'animation',
    categoryAr: 'استوديو الأنميشن',
    categoryEn: 'Sprite Animation',
    syntaxAr: 'ايقاف انميشن',
    syntaxEn: 'stop animation',
    descAr: 'إيقاف حركة الأنميشن وتثبيت الإطار الحالي.',
    descEn: 'Freezes animation playback.',
    exampleAr: 'اذا لاعب لمس ثلج = ايقاف انميشن',
    exampleEn: 'if player touch ice = stop animation'
  },

  // --- VARIABLES, SCORE & HUD (95-105) ---
  {
    id: 'var_declare',
    category: 'variables',
    categoryAr: 'المتغيرات والنقاط',
    categoryEn: 'Variables & Score',
    syntaxAr: 'متغير [اسم] = [قيمة]',
    syntaxEn: 'variable [name] = [value]',
    descAr: 'إنشاء متغير جديد لحفظ رقم أو نص واستخدامه في شروط اللعبة.',
    descEn: 'Initializes a new variable state.',
    exampleAr: 'متغير نقاط = 0',
    exampleEn: 'variable score = 0'
  },
  {
    id: 'var_add_score',
    category: 'variables',
    categoryAr: 'المتغيرات والنقاط',
    categoryEn: 'Variables & Score',
    syntaxAr: 'اضف [رقم] نقاط',
    syntaxEn: 'add [number] score',
    descAr: 'زيادة نقاط اللعبة وعرضها على الشاشة.',
    descEn: 'Increments game score counter.',
    exampleAr: 'اذا لاعب لمس جوهرة = اضف 50 نقاط',
    exampleEn: 'if player touch gem = add 50 score'
  },
  {
    id: 'var_sub_score',
    category: 'variables',
    categoryAr: 'المتغيرات والنقاط',
    categoryEn: 'Variables & Score',
    syntaxAr: 'اطرح [رقم] نقاط',
    syntaxEn: 'subtract [number] score',
    descAr: 'خصم نقاط عند ارتكاب خطأ أو التعرض لفخ.',
    descEn: 'Decrements game score counter.',
    exampleAr: 'اذا لاعب لمس فخ = اطرح 10 نقاط',
    exampleEn: 'if player touch trap = subtract 10 score'
  },
  {
    id: 'var_reset_score',
    category: 'variables',
    categoryAr: 'المتغيرات والنقاط',
    categoryEn: 'Variables & Score',
    syntaxAr: 'تصفير نقاط',
    syntaxEn: 'reset score',
    descAr: 'إعادة عداد النقاط إلى الصفر.',
    descEn: 'Resets score counter to zero.',
    exampleAr: 'عند البدء = تصفير نقاط',
    exampleEn: 'on start = reset score'
  },
  {
    id: 'var_draw_text',
    category: 'variables',
    categoryAr: 'المتغيرات والنقاط',
    categoryEn: 'Variables & Score',
    syntaxAr: 'كتابة نص [نص]  /  رسم رسالة [نص]',
    syntaxEn: 'draw text [text]',
    descAr: 'رسم نص مخصص على شاشة اللعبة.',
    descEn: 'Draws custom text overlay.',
    exampleAr: 'في كل لحظة = كتابة نص مرحباً بك في عالم FY3',
    exampleEn: 'on update = draw text Welcome to FY3'
  },
  {
    id: 'var_win_msg',
    category: 'variables',
    categoryAr: 'المتغيرات والنقاط',
    categoryEn: 'Variables & Score',
    syntaxAr: 'رسالة فوز',
    syntaxEn: 'win message',
    descAr: 'عرض شاشة مبروك الفوز الاحتفالية.',
    descEn: 'Shows victory celebration banner.',
    exampleAr: 'اذا بطل لمس عرش = رسالة فوز',
    exampleEn: 'if hero touch throne = win message'
  },
  {
    id: 'var_lose_msg',
    category: 'variables',
    categoryAr: 'المتغيرات والنقاط',
    categoryEn: 'Variables & Score',
    syntaxAr: 'رسالة خسارة',
    syntaxEn: 'lose message',
    descAr: 'عرض رسالة انتهاء المحاولة (Game Over).',
    descEn: 'Shows game over screen.',
    exampleAr: 'اذا بطل لمس حفرة = رسالة خسارة',
    exampleEn: 'if hero touch pit = lose message'
  }
];

export interface DetectedTypo {
  original: string;
  replacement: string;
  lineIndex: number;
  wordIndex: number;
}

export function findTyposInFY3Text(text: string): DetectedTypo[] {
  if (!text) return [];
  const lines = text.split('\n');
  const detected: DetectedTypo[] = [];

  lines.forEach((line, lineIndex) => {
    const codePart = line.split('//')[0];
    const words = codePart.trim().split(/[\s=]+/);
    words.forEach((rawWord, wordIndex) => {
      const cleanWord = rawWord.trim().replace(/[^\w\u0600-\u06FF_]/g, '');
      if (cleanWord && FY3_TYPOS_DICTIONARY[cleanWord]) {
        detected.push({
          original: cleanWord,
          replacement: FY3_TYPOS_DICTIONARY[cleanWord],
          lineIndex,
          wordIndex
        });
      }
    });
  });

  return detected;
}

export function fixTypoInText(text: string, typo: string, replacement: string, lineIndex?: number): string {
  if (lineIndex !== undefined) {
    const lines = text.split('\n');
    if (lines[lineIndex] !== undefined) {
      const regex = new RegExp(`(^|\\s)${escapeRegExp(typo)}(\\s|$|(?=[=\\+\\-\\*/]))`, 'g');
      lines[lineIndex] = lines[lineIndex].replace(regex, `$1${replacement}$2`);
      return lines.join('\n');
    }
  }

  const globalRegex = new RegExp(`(^|\\s)${escapeRegExp(typo)}(\\s|$|(?=[=\\+\\-\\*/]))`, 'g');
  return text.replace(globalRegex, `$1${replacement}$2`);
}

export function fixAllTyposInText(text: string): string {
  let result = text;
  for (const [typo, replacement] of Object.entries(FY3_TYPOS_DICTIONARY)) {
    const regex = new RegExp(`(^|\\s)${escapeRegExp(typo)}(\\s|$|(?=[=\\+\\-\\*/]))`, 'g');
    result = result.replace(regex, `$1${replacement}$2`);
  }
  return result;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ==========================================
// PARSED LINE INTERFACE & PARSER
// ==========================================

export interface ParsedFY3Line {
  lineNumber: number;
  raw: string;
  type: 'variable' | 'rule' | 'comment' | 'empty' | 'invalid';
  explanationAr: string;
  explanationEn: string;
  valid: boolean;
  jsCode?: string;
  subjectName?: string;
  targetName?: string;
  actionSummary?: string;
}

export function mapKeyName(rawKey: string): string {
  const k = rawKey.trim().toLowerCase();
  switch (k) {
    case 'سهم_يمين':
    case 'يمين':
    case 'arrowright':
    case 'right':
      return 'ArrowRight';
    case 'سهم_يسار':
    case 'يسار':
    case 'arrowleft':
    case 'left':
      return 'ArrowLeft';
    case 'سهم_فوق':
    case 'فوق':
    case 'اعلى':
    case 'arrowup':
    case 'up':
      return 'ArrowUp';
    case 'سهم_تحت':
    case 'تحت':
    case 'اسفل':
    case 'arrowdown':
    case 'down':
      return 'ArrowDown';
    case 'مسافة':
    case 'سبيس':
    case 'space':
      return 'Space';
    case 'انتر':
    case 'enter':
      return 'Enter';
    case 'shift':
    case 'شفت':
      return 'Shift';
    case 'd':
    case 'ي':
      return 'KeyD';
    case 'a':
    case 'ش':
      return 'KeyA';
    case 'w':
    case 'ص':
      return 'KeyW';
    case 's':
    case 'س':
      return 'KeyS';
    default:
      if (rawKey.length === 1) {
        return `Key${rawKey.toUpperCase()}`;
      }
      return rawKey;
  }
}

/**
 * Parses handwritten FY3 text line by line.
 * Marks ANY invalid/unrecognized line as valid: false so UI can color it RED.
 */
export function parseFY3Text(text: string): ParsedFY3Line[] {
  if (!text) return [];
  const lines = text.split('\n');
  const parsedLines: ParsedFY3Line[] = [];

  lines.forEach((rawLine, index) => {
    const lineNum = index + 1;
    const trimmed = rawLine.trim();

    if (!trimmed) {
      parsedLines.push({
        lineNumber: lineNum,
        raw: rawLine,
        type: 'empty',
        explanationAr: '',
        explanationEn: '',
        valid: true
      });
      return;
    }

    if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
      parsedLines.push({
        lineNumber: lineNum,
        raw: rawLine,
        type: 'comment',
        explanationAr: 'تعليق توضيحي (لا يؤثر على اللعبة)',
        explanationEn: 'Comment line',
        valid: true
      });
      return;
    }

    // 1. Variable declaration
    // Example: متغير نقاط = 0  OR  variable score = 0
    const varMatch = trimmed.match(/^(متغير|variable|var)\s+([\w\u0600-\u06FF_]+)\s*=\s*(.+)$/i);
    if (varMatch) {
      const varName = varMatch[2];
      const rawVal = varMatch[3].trim();
      parsedLines.push({
        lineNumber: lineNum,
        raw: rawLine,
        type: 'variable',
        explanationAr: `تعريف متغير باسم "${varName}" بقيمة أولية: ${rawVal}`,
        explanationEn: `Declare variable "${varName}" initialized to: ${rawVal}`,
        valid: true,
        jsCode: `this.variables[${JSON.stringify(varName)}] = ${isNaN(Number(rawVal)) ? JSON.stringify(rawVal) : Number(rawVal)};`
      });
      return;
    }

    // 2. Rules with '='
    if (trimmed.includes('=')) {
      const parts = trimmed.split('=');
      const conditionPart = parts[0].trim();
      const actionPart = parts.slice(1).join('=').trim();

      if (!conditionPart || !actionPart) {
        parsedLines.push({
          lineNumber: lineNum,
          raw: rawLine,
          type: 'invalid',
          explanationAr: 'السطر غير مكتمل. يجب كتابة الشرط ثم علامة = ثم الإجراء (مثال: اذا سيارة لمس برميل = موت)',
          explanationEn: 'Incomplete statement. Expected: condition = action',
          valid: false
        });
        return;
      }

      // Check collision
      // Matches: اذا [اسم كائن 1] لمس [اسم كائن 2]  OR  اذا [اسم كائن] اصطدم مع [اسم كائن]
      const touchMatch = conditionPart.match(/^(اذا|if)\s+([\w\u0600-\u06FF_\s]+?)\s*(لمس|اصطدم\s*مع|اصطدم|تلامس\s*مع|تلامس|touch|touches|collide)\s+([\w\u0600-\u06FF_]+)/i);
      
      // Check key press
      // Matches: اذا [اسم كائن] ضغط [مفتاح]
      const pressMatch = conditionPart.match(/^(اذا|if)\s+([\w\u0600-\u06FF_\s]+?)?\s*(ضغط|press|presses|keydown)\s+([\w\u0600-\u06FF_]+)/i);

      // Check click / touch
      const clickMatch = conditionPart.match(/^(اذا|if)\s+([\w\u0600-\u06FF_\s]+?)?\s*(نقر|انقر|click|clicks)/i);

      // Check start
      const startMatch = conditionPart.match(/^(عند\s+البدء|بدء|on\s+start|start)/i);

      // Check update
      const updateMatch = conditionPart.match(/^(في\s+كل\s+لحظة|تحديث|on\s+update|update)/i);

      let explAr = '';
      let explEn = '';
      let subjectName = '';
      let targetName = '';

      if (touchMatch) {
        subjectName = touchMatch[2].trim() || 'كائن';
        targetName = touchMatch[4].trim() || 'أي كائن';
        explAr = `عند تصادم (${subjectName}) مع (${targetName}) ➔ `;
        explEn = `When (${subjectName}) touches (${targetName}) ➔ `;
      } else if (pressMatch) {
        subjectName = (pressMatch[2] || 'اللاعب').trim();
        targetName = pressMatch[4].trim();
        explAr = `عندما يضغط (${subjectName}) زر [${targetName}] ➔ `;
        explEn = `When (${subjectName}) presses [${targetName}] ➔ `;
      } else if (clickMatch) {
        explAr = 'عند النقر على الكائن بالفأرة أو اللمس ➔ ';
        explEn = 'When clicked with mouse or touch ➔ ';
      } else if (startMatch) {
        explAr = 'عند بدء تشغيل اللعبة مباشرة ➔ ';
        explEn = 'On game start ➔ ';
      } else if (updateMatch) {
        explAr = 'في كل لحظة حركة (تحديث مستمر) ➔ ';
        explEn = 'On every frame update ➔ ';
      } else {
        // Unknown condition syntax -> MARK RED!
        parsedLines.push({
          lineNumber: lineNum,
          raw: rawLine,
          type: 'invalid',
          explanationAr: `شرط غير مفهوم: "${conditionPart}". اكتب مثلاً: اذا سيارة لمس برميل = ... أو اذا لاعب ضغط سهم_يمين = ...`,
          explanationEn: `Unrecognized condition: "${conditionPart}".`,
          valid: false
        });
        return;
      }

      // Action validation and explanation across 100+ commands
      let actionValid = false;
      let actionExplAr = '';
      let actionExplEn = '';

      // A) Scene Transitions: تغير مشهد [اسم] / انتقل الى مشهد [اسم]
      if (/^(تغير\s+مشهد|تغير\s+المشهد|تغيير\s+مشهد|تغيير\s+المشهد|انتقل\s+الى\s+مشهد|انتقل\s+الى|انتقل|change\s+scene|load\s+scene|switch\s+scene)(\s+.+)?/i.test(actionPart)) {
        const m = actionPart.match(/^(تغير\s+مشهد|تغير\s+المشهد|تغيير\s+مشهد|تغيير\s+المشهد|انتقل\s+الى\s+مشهد|انتقل\s+الى|انتقل|change\s+scene|load\s+scene|switch\s+scene)(\s+(.+))?/i);
        const sName = (m?.[3] || '2').trim();
        actionExplAr = `تغيير المشهد والانتقال إلى [${sName}]`;
        actionExplEn = `Change scene to [${sName}]`;
        actionValid = true;
      }
      // B) Reload Scene
      else if (/^(اعادة\s+مشهد|اعادة\s+تشغيل\s+مرحلة|اعادة\s+المشهد|reload\s+scene|restart\s+scene)/i.test(actionPart)) {
        actionExplAr = 'إعادة تشغيل المشهد الحالي من البداية';
        actionExplEn = 'Reload current active scene';
        actionValid = true;
      }
      // C) Next Scene
      else if (/^(المشهد\s+التالي|المرحلة\s+التالية|next\s+scene)/i.test(actionPart)) {
        actionExplAr = 'الانتقال التلقائي إلى المشهد التالي';
        actionExplEn = 'Transition to next scene';
        actionValid = true;
      }
      // D) Death / Kill
      else if (/^(موت|تدمير|قتل|kill|destroy)(\s+[\w\u0600-\u06FF_]+)?/i.test(actionPart)) {
        const m = actionPart.match(/^(موت|تدمير|قتل|kill|destroy)(\s+([\w\u0600-\u06FF_]+))?/i);
        const killWho = m?.[3]?.trim();
        if (killWho) {
          actionExplAr = `موت وتدمير كائن (${killWho})`;
          actionExplEn = `Kill and destroy entity (${killWho})`;
        } else {
          actionExplAr = 'موت وتدمير هذا الكائن';
          actionExplEn = 'Destroy this entity';
        }
        actionValid = true;
      }
      // E) Camera Commands
      else if (/^(تابع\s+كاميرا|كاميرا\s+تتبع|camera\s+follow)(\s+[\w\u0600-\u06FF_]+)?/i.test(actionPart)) {
        actionExplAr = 'جعل الكاميرا تتبع الكائن في العالم اللانهائي';
        actionExplEn = 'Smart camera follows entity';
        actionValid = true;
      } else if (/^(وقف\s+كاميرا|تحرير\s+كاميرا|stop\s+camera)/i.test(actionPart)) {
        actionExplAr = 'إيقاف متابعة الكاميرا للكائن';
        actionExplEn = 'Detaches camera follow';
        actionValid = true;
      } else if (/^(اهتزاز\s+كاميرا|هز\s+شاشة|هز\s+كاميرا|shake\s+camera)/i.test(actionPart)) {
        actionExplAr = 'إحداث اهتزاز سينمائي للشاشة';
        actionExplEn = 'Shake camera effect';
        actionValid = true;
      } else if (/^(تقريب\s+كاميرا|زووم\s+ان|zoom\s+in\s+camera)(\s+[\d\.]+)?/i.test(actionPart)) {
        actionExplAr = 'تقريب منظور الكاميرا للتركيز';
        actionExplEn = 'Zoom camera in';
        actionValid = true;
      } else if (/^(تبعيد\s+كاميرا|زووم\s+اوت|zoom\s+out\s+camera)(\s+[\d\.]+)?/i.test(actionPart)) {
        actionExplAr = 'تبعيد منظور الكاميرا لكشف مساحة واسعة';
        actionExplEn = 'Zoom camera out';
        actionValid = true;
      } else if (/^(اعادة\s+ضبط\s+كاميرا|reset\s+camera)/i.test(actionPart)) {
        actionExplAr = 'إعادة ضبط أبعاد الكاميرا للافتراضي';
        actionExplEn = 'Reset camera';
        actionValid = true;
      }
      // F) Movement: تحرك <speed> x / y
      else if (/^(تحرك|move)\s*(-?\d+)\s*(x|y|س|ص)?/i.test(actionPart)) {
        const m = actionPart.match(/^(تحرك|move)\s*(-?\d+)\s*(x|y|س|ص)?/i);
        const speed = m?.[2] || '100';
        const axis = (m?.[3]?.toLowerCase() === 'y' || m?.[3] === 'ص') ? 'Y (عمودياً)' : 'X (أفقياً)';
        actionExplAr = `تحريك الكائن بسرعة ${speed} على محور ${axis}`;
        actionExplEn = `Move entity with speed ${speed} on ${axis}`;
        actionValid = true;
      }
      // G) Jump: قفز / نط <power>
      else if (/^(قفز|نط|jump)\s*(-?\d+)?/i.test(actionPart)) {
        const m = actionPart.match(/^(قفز|نط|jump)\s*(-?\d+)?/i);
        const power = m?.[2] || '200';
        actionExplAr = `قفز للأعلى بقوة ${power}`;
        actionExplEn = `Jump upward with power ${power}`;
        actionValid = true;
      }
      // H) Stop: توقف / وقف حركة
      else if (/^(توقف|وقف\s+حركة|stop\s+movement|stop)/i.test(actionPart)) {
        actionExplAr = 'إيقاف حركة الكائن فوراً في مكانه';
        actionExplEn = 'Stop entity movement instantly';
        actionValid = true;
      }
      // I) Rotate: دوران <angle>
      else if (/^(دوران|لف|rotate)\s*(-?\d+)?/i.test(actionPart)) {
        const m = actionPart.match(/^(دوران|لف|rotate)\s*(-?\d+)?/i);
        const angle = m?.[2] || '90';
        actionExplAr = `تدوير الكائن بزاوية ${angle} درجة`;
        actionExplEn = `Rotate entity by ${angle} degrees`;
        actionValid = true;
      }
      // J) Reverse: عكس اتجاه / استدارة
      else if (/^(عكس\s+اتجاه|استدارة|reverse\s+direction)/i.test(actionPart)) {
        actionExplAr = 'عكس اتجاه وسرعة الكائن في المسار المقابل';
        actionExplEn = 'Reverse velocity direction';
        actionValid = true;
      }
      // K) Gravity: جاذبية = <val> / تغيير جاذبية <val>
      else if (/^(جاذبية\s*=\s*|تغيير\s+جاذبية\s+|gravity\s*=\s*)(-?\d+)/i.test(actionPart)) {
        const m = actionPart.match(/(-?\d+)/);
        actionExplAr = `ضبط جاذبية الكائن إلى ${m?.[1]}`;
        actionExplEn = `Set entity gravity to ${m?.[1]}`;
        actionValid = true;
      }
      // L) Random Position: موضع عشوائي
      else if (/^(موضع\s+عشوائي|مكان\s+عشوائي|random\s+position)/i.test(actionPart)) {
        actionExplAr = 'نقل الكائن فورياً لموضع عشوائي على الشاشة';
        actionExplEn = 'Teleport to random screen position';
        actionValid = true;
      }
      // M) Follow Target: تحرك نحو <كائن> / اتبع <كائن>
      else if (/^(تحرك\s+نحو|اتبع|لاحق|move\s+toward|follow)\s+([\w\u0600-\u06FF_]+)/i.test(actionPart)) {
        const m = actionPart.match(/^(تحرك\s+نحو|اتبع|لاحق|move\s+toward|follow)\s+([\w\u0600-\u06FF_]+)/i);
        actionExplAr = `مطاردة الكائن الذكية نحو (${m?.[2]})`;
        actionExplEn = `Pursue target entity (${m?.[2]})`;
        actionValid = true;
      }
      // N) Visibility: اخفاء / اظهار
      else if (/^(اخفاء|اختفاء|hide)/i.test(actionPart)) {
        actionExplAr = 'إخفاء الكائن وجعله غير مرئي';
        actionExplEn = 'Hide entity';
        actionValid = true;
      } else if (/^(اظهار|ظهور|show)/i.test(actionPart)) {
        actionExplAr = 'إظهار الكائن على الشاشة';
        actionExplEn = 'Show entity';
        actionValid = true;
      }
      // O) Scale: تكبير / تصغير
      else if (/^(تكبير|scale\s+up)\s*([\d\.]+)?/i.test(actionPart)) {
        const m = actionPart.match(/^(تكبير|scale\s+up)\s*([\d\.]+)?/i);
        actionExplAr = `تكبير حجم الكائن بمقدار ${m?.[2] || '1.5'}`;
        actionExplEn = `Scale up entity by ${m?.[2] || '1.5'}`;
        actionValid = true;
      } else if (/^(تصغير|scale\s+down)\s*([\d\.]+)?/i.test(actionPart)) {
        const m = actionPart.match(/^(تصغير|scale\s+down)\s*([\d\.]+)?/i);
        actionExplAr = `تصغير حجم الكائن بمقدار ${m?.[2] || '0.8'}`;
        actionExplEn = `Scale down entity by ${m?.[2] || '0.8'}`;
        actionValid = true;
      }
      // P) Color: تغيير لون <لون>
      else if (/^(تغيير\s+لون|لون\s*=\s*|change\s+color)\s+(.+)/i.test(actionPart)) {
        const m = actionPart.match(/^(تغيير\s+لون|لون\s*=\s*|change\s+color)\s+(.+)/i);
        actionExplAr = `تغيير لون الكائن إلى (${m?.[2]})`;
        actionExplEn = `Change entity color to (${m?.[2]})`;
        actionValid = true;
      }
      // Q) Audio: شغل صوت <نوع>
      else if (/^(شغل\s+صوت|play\s+sound)\s+(.+)/i.test(actionPart)) {
        const m = actionPart.match(/^(شغل\s+صوت|play\s+sound)\s+(.+)/i);
        actionExplAr = `تشغيل المؤثر الصوتي [${m?.[2]}]`;
        actionExplEn = `Play sound effect [${m?.[2]}]`;
        actionValid = true;
      }
      // R) Animation: شغل انميشن <اسم>
      else if (/^(شغل\s+انميشن|شغل\s+حركة|play\s+animation)\s+(.+)/i.test(actionPart)) {
        const m = actionPart.match(/^(شغل\s+انميشن|شغل\s+حركة|play\s+animation)\s+(.+)/i);
        actionExplAr = `تشغيل مقطع الأنميشن [${m?.[2]}]`;
        actionExplEn = `Play animation track [${m?.[2]}]`;
        actionValid = true;
      } else if (/^(ايقاف\s+انميشن|stop\s+animation)/i.test(actionPart)) {
        actionExplAr = 'إيقاف تشغيل الأنميشن';
        actionExplEn = 'Stop animation playback';
        actionValid = true;
      }
      // S) Score: اضف / اطرح نقاط
      else if (/^(اضف|add)\s*(\d+)\s*(نقاط|نقطة|score)?/i.test(actionPart)) {
        const m = actionPart.match(/^(اضف|add)\s*(\d+)/i);
        actionExplAr = `إضافة ${m?.[2] || '10'} نقطة للنتيجة`;
        actionExplEn = `Add ${m?.[2] || '10'} points to score`;
        actionValid = true;
      } else if (/^(اطرح|خصم|subtract)\s*(\d+)\s*(نقاط|نقطة|score)?/i.test(actionPart)) {
        const m = actionPart.match(/(\d+)/);
        actionExplAr = `خصم ${m?.[1] || '10'} نقطة من النتيجة`;
        actionExplEn = `Subtract ${m?.[1] || '10'} points from score`;
        actionValid = true;
      } else if (/^(تصفير\s+نقاط|reset\s+score)/i.test(actionPart)) {
        actionExplAr = 'إعادة ضبط النتيجة للصفر';
        actionExplEn = 'Reset score to zero';
        actionValid = true;
      }
      // T) Messages & Text
      else if (/^(كتابة\s+نص|رسم\s+رسالة|draw\s+text)\s+(.+)/i.test(actionPart)) {
        const m = actionPart.match(/^(كتابة\s+نص|رسم\s+رسالة|draw\s+text)\s+(.+)/i);
        actionExplAr = `عرض النص على الشاشة: "${m?.[2]}"`;
        actionExplEn = `Display text overlay: "${m?.[2]}"`;
        actionValid = true;
      } else if (/^(رسالة\s+فوز|win\s+message)/i.test(actionPart)) {
        actionExplAr = 'عرض رسالة وشاشة الفوز الاحتفالية';
        actionExplEn = 'Display win celebration message';
        actionValid = true;
      } else if (/^(رسالة\s+خسارة|lose\s+message)/i.test(actionPart)) {
        actionExplAr = 'عرض رسالة الخسارة وانتهاء المحاولة';
        actionExplEn = 'Display game over message';
        actionValid = true;
      } else if (/^(وميض|فلاش|flash)/i.test(actionPart)) {
        actionExplAr = 'جعل الكائن يومض بشكل سينمائي';
        actionExplEn = 'Trigger flash damage visual';
        actionValid = true;
      }

      if (!actionValid) {
        // Unrecognized action -> MARK RED!
        parsedLines.push({
          lineNumber: lineNum,
          raw: rawLine,
          type: 'invalid',
          explanationAr: `إجراء غير مفهوم: "${actionPart}". اكتب مثلاً: تغير مشهد 2 أو موت أو تحرك 100 x أو شغل صوت قفز`,
          explanationEn: `Unrecognized action: "${actionPart}".`,
          valid: false
        });
        return;
      }

      parsedLines.push({
        lineNumber: lineNum,
        raw: rawLine,
        type: 'rule',
        explanationAr: explAr + actionExplAr,
        explanationEn: explEn + actionExplEn,
        subjectName,
        targetName,
        actionSummary: actionExplAr,
        valid: true
      });
      return;
    }

    // Line does not match any valid FY3 syntax -> MARK RED!
    parsedLines.push({
      lineNumber: lineNum,
      raw: rawLine,
      type: 'invalid',
      explanationAr: 'صياغة غير واضحة. اكتب مثلاً: اذا سيارة لمس برميل = موت أو متغير نقاط = 0',
      explanationEn: 'Unrecognized syntax. Example: if car touch barrel = destroy',
      valid: false
    });
  });

  return parsedLines;
}

/**
 * Compiles handwritten FY3 text into a clean, robust JavaScript script
 * Supporting all 100+ commands and dynamic object names!
 */
export function compileFY3TextToJS(
  text: string, 
  currentObjectName: string = 'Active Entity',
  scenes: GameScene[] = []
): string {
  if (!text || !text.trim()) {
    return `// FY3 Script for ${currentObjectName}\nfunction onStart(game) {}\nfunction onUpdate(dt, game) {}\nfunction onCollision(other, game) {}`;
  }

  const lines = text.split('\n');

  const onStartStatements: string[] = [];
  const onUpdateStatements: string[] = [];
  const onCollisionStatements: string[] = [];

  onStartStatements.push('  if (!this.variables) { this.variables = {}; }');

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) return;

    // 1. Variable: متغير نقاط = 0
    const varMatch = trimmed.match(/^(متغير|variable|var)\s+([\w\u0600-\u06FF_]+)\s*=\s*(.+)$/i);
    if (varMatch) {
      const varName = varMatch[2];
      const valStr = varMatch[3].trim();
      const finalVal = isNaN(Number(valStr)) ? JSON.stringify(valStr.replace(/^["']|["']$/g, '')) : Number(valStr);
      onStartStatements.push(`  this.variables[${JSON.stringify(varName)}] = ${finalVal};`);
      return;
    }

    // 2. Rules with '='
    if (trimmed.includes('=')) {
      const parts = trimmed.split('=');
      const condition = parts[0].trim();
      const action = parts.slice(1).join('=').trim();

      // Action JS builder for 100+ commands
      function buildActionCode(isCollisionContext: boolean, colliderTarget?: string): string {
        // A) Scene Transitions: تغير مشهد [اسم] / انتقل الى مشهد [اسم]
        if (/^(تغير\s+مشهد|تغير\s+المشهد|تغيير\s+مشهد|تغيير\s+المشهد|انتقل\s+الى\s+مشهد|انتقل\s+الى|انتقل|change\s+scene|load\s+scene|switch\s+scene)/i.test(action)) {
          const m = action.match(/^(تغير\s+مشهد|تغير\s+المشهد|تغيير\s+مشهد|تغيير\s+المشهد|انتقل\s+الى\s+مشهد|انتقل\s+الى|انتقل|change\s+scene|load\s+scene|switch\s+scene)(\s+(.+))?/i);
          const sName = (m?.[3] || '2').trim();
          return `if (typeof game.loadScene === 'function') { game.loadScene(${JSON.stringify(sName)}); }`;
        }

        // B) Reload scene
        if (/^(اعادة\s+مشهد|اعادة\s+المشهد|reload\s+scene|restart\s+scene)/i.test(action)) {
          return `if (typeof game.loadScene === 'function') { game.loadScene(game.activeSceneId || ''); }`;
        }

        // C) Next scene
        if (/^(المشهد\s+التالي|next\s+scene)/i.test(action)) {
          return `if (typeof game.loadNextScene === 'function') { game.loadNextScene(); } else if (typeof game.loadScene === 'function') { game.loadScene('2'); }`;
        }

        // D) Kill / Death (Dynamic target or self)
        if (/^(موت|تدمير|قتل|kill|destroy)/i.test(action)) {
          const m = action.match(/^(موت|تدمير|قتل|kill|destroy)(\s+([\w\u0600-\u06FF_]+))?/i);
          const killTarget = m?.[3]?.trim();

          if (killTarget) {
            return `if (other && (other.name === ${JSON.stringify(killTarget)} || other.name.includes(${JSON.stringify(killTarget)}) || other.tag === ${JSON.stringify(killTarget)})) {
        other.visible = false;
        if (typeof other.destroy === 'function') other.destroy();
      } else {
        const o = game.findObject(${JSON.stringify(killTarget)});
        if (o) { o.visible = false; if (typeof o.destroy === 'function') o.destroy(); }
      }`;
          }

          if (isCollisionContext) {
            return `this.visible = false;
      if (typeof this.destroy === 'function') this.destroy();`;
          } else {
            return `this.visible = false;
      if (typeof this.destroy === 'function') this.destroy();`;
          }
        }

        // E) Camera Follow & Shake & Zoom
        if (/^(تابع\s+كاميرا|كاميرا\s+تتبع|camera\s+follow)/i.test(action)) {
          return `if (game.camera) { game.camera.follow(this); }`;
        }
        if (/^(وقف\s+كاميرا|تحرير\s+كاميرا|stop\s+camera)/i.test(action)) {
          return `if (game.camera) { game.camera.target = null; }`;
        }
        if (/^(اهتزاز\s+كاميرا|هز\s+شاشة|هز\s+كاميرا|shake\s+camera)/i.test(action)) {
          return `if (game.camera && typeof game.camera.shake === 'function') { game.camera.shake(12, 0.35); }`;
        }
        if (/^(تقريب\s+كاميرا|زووم\s+ان|zoom\s+in\s+camera)/i.test(action)) {
          const m = action.match(/([\d\.]+)/);
          const factor = m ? Number(m[1]) : 1.5;
          return `if (game.camera) { game.camera.zoom = ${factor}; }`;
        }
        if (/^(تبعيد\s+كاميرا|زووم\s+اوت|zoom\s+out\s+camera)/i.test(action)) {
          const m = action.match(/([\d\.]+)/);
          const factor = m ? Number(m[1]) : 0.8;
          return `if (game.camera) { game.camera.zoom = ${factor}; }`;
        }
        if (/^(اعادة\s+ضبط\s+كاميرا|reset\s+camera)/i.test(action)) {
          return `if (game.camera) { game.camera.zoom = 1; game.camera.x = 0; game.camera.y = 0; }`;
        }

        // F) Movement: تحرك <speed> x / y
        const moveMatch = action.match(/^(تحرك|move)\s*(-?\d+)\s*(x|y|س|ص)?/i);
        if (moveMatch) {
          const speed = Number(moveMatch[2]) || 100;
          const axis = (moveMatch[3]?.toLowerCase() === 'y' || moveMatch[3] === 'ص') ? 'y' : 'x';
          return `this.${axis} += (${speed}) * (typeof dt === 'number' ? dt : 0.016);`;
        }

        // G) Jump: قفز / نط <power>
        const jumpMatch = action.match(/^(قفز|نط|jump)\s*(-?\d+)?/i);
        if (jumpMatch) {
          const power = Math.abs(Number(jumpMatch[2]) || 200);
          return `this.vy = -${power};`;
        }

        // H) Stop movement: توقف
        if (/^(توقف|وقف\s+حركة|stop)/i.test(action)) {
          return `this.vx = 0; this.vy = 0;`;
        }

        // I) Rotate: دوران <angle>
        const rotMatch = action.match(/^(دوران|لف|rotate)\s*(-?\d+)?/i);
        if (rotMatch) {
          const angle = Number(rotMatch[2]) || 90;
          return `this.rotation = ((this.rotation || 0) + ${angle}) % 360;`;
        }

        // J) Continuous spin: دوران مستمر <speed>
        const spinMatch = action.match(/^(دوران\s+مستمر|continuous\s+spin)\s*(-?\d+)?/i);
        if (spinMatch) {
          const speed = Number(spinMatch[2]) || 5;
          return `this.rotation = ((this.rotation || 0) + ${speed} * (typeof dt === 'number' ? dt : 0.016) * 60) % 360;`;
        }

        // K) Reverse direction: عكس اتجاه
        if (/^(عكس\s+اتجاه|استدارة|reverse\s+direction)/i.test(action)) {
          return `this.vx = -this.vx; this.vy = -this.vy;`;
        }

        // L) Gravity
        const gravMatch = action.match(/^(جاذبية\s*=\s*|تغيير\s+جاذبية\s+|gravity\s*=\s*)(-?\d+)/i);
        if (gravMatch) {
          const g = Number(gravMatch[2]);
          return `this.gravity = ${g};`;
        }

        // M) Follow target: تحرك نحو <target>
        const followMatch = action.match(/^(تحرك\s+نحو|اتبع|لاحق|move\s+toward|follow)\s+([\w\u0600-\u06FF_]+)/i);
        if (followMatch) {
          const tName = followMatch[2].trim();
          return `const target = game.findObject(${JSON.stringify(tName)});
      if (target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 8) {
          this.x += (dx / dist) * 120 * (typeof dt === 'number' ? dt : 0.016);
          this.y += (dy / dist) * 120 * (typeof dt === 'number' ? dt : 0.016);
        }
      }`;
        }

        // N) Random position: موضع عشوائي
        if (/^(موضع\s+عشوائي|random\s+position)/i.test(action)) {
          return `this.x = 50 + Math.random() * Math.max(100, game.width - this.width - 100);
      this.y = 50 + Math.random() * Math.max(100, game.height - this.height - 100);`;
        }

        // O) Dash: اندفاع سريع <speed>
        const dashMatch = action.match(/^(اندفاع\s+سريع|داش|dash)\s*(\d+)?/i);
        if (dashMatch) {
          const dashSpeed = Number(dashMatch[2]) || 300;
          return `this.x += (${dashSpeed}) * (typeof dt === 'number' ? dt : 0.016);`;
        }

        // P) Visibility: اخفاء / اظهار
        if (/^(اخفاء|اختفاء|hide)/i.test(action)) {
          return 'this.visible = false;';
        }
        if (/^(اظهار|ظهور|show)/i.test(action)) {
          return 'this.visible = true;';
        }

        // Q) Scale: تكبير / تصغير
        const scaleUpMatch = action.match(/^(تكبير|scale\s+up)\s*([\d\.]+)?/i);
        if (scaleUpMatch) {
          const factor = Number(scaleUpMatch[2]) || 1.5;
          return `this.width *= ${factor}; this.height *= ${factor};`;
        }
        const scaleDownMatch = action.match(/^(تصغير|scale\s+down)\s*([\d\.]+)?/i);
        if (scaleDownMatch) {
          const factor = Number(scaleDownMatch[2]) || 0.8;
          return `this.width = Math.max(10, this.width * ${factor}); this.height = Math.max(10, this.height * ${factor});`;
        }

        // R) Color: تغيير لون <color>
        const colorMatch = action.match(/^(تغيير\s+لون|لون\s*=\s*|change\s+color)\s+(.+)/i);
        if (colorMatch) {
          const rawCol = colorMatch[2].trim().toLowerCase();
          let cHex = '#ffffff';
          if (rawCol.includes('احمر') || rawCol.includes('red')) cHex = '#ef4444';
          else if (rawCol.includes('ازرق') || rawCol.includes('blue')) cHex = '#3b82f6';
          else if (rawCol.includes('اخضر') || rawCol.includes('green')) cHex = '#22c55e';
          else if (rawCol.includes('اصفر') || rawCol.includes('yellow')) cHex = '#eab308';
          else if (rawCol.includes('اسود') || rawCol.includes('black')) cHex = '#000000';
          else if (rawCol.includes('ابيض') || rawCol.includes('white')) cHex = '#ffffff';
          else if (rawCol.includes('برتقالي') || rawCol.includes('orange')) cHex = '#f97316';
          else if (rawCol.includes('بنفسجي') || rawCol.includes('purple')) cHex = '#a855f7';
          else cHex = rawCol;
          return `this.color = ${JSON.stringify(cHex)};`;
        }

        // S) Score: اضف / اطرح نقاط
        const addScoreMatch = action.match(/^(اضف|add)\s*(\d+)/i);
        if (addScoreMatch) {
          const amt = Number(addScoreMatch[2]) || 10;
          return `game.score = (game.score || 0) + ${amt};
      if (other && other !== this) { other.visible = false; if (typeof other.destroy === 'function') other.destroy(); }`;
        }
        const subScoreMatch = action.match(/^(اطرح|خصم|subtract)\s*(\d+)/i);
        if (subScoreMatch) {
          const amt = Number(subScoreMatch[1]) || 10;
          return `game.score = Math.max(0, (game.score || 0) - ${amt});`;
        }
        if (/^(تصفير\s+نقاط|reset\s+score)/i.test(action)) {
          return `game.score = 0;`;
        }

        // T) Sound: شغل صوت <نوع>
        const soundMatch = action.match(/^(شغل\s+صوت|play\s+sound)\s+(.+)/i);
        if (soundMatch) {
          const s = soundMatch[2].trim();
          let sType = 'jump';
          if (s.includes('ليزر') || s.includes('laser')) sType = 'laser';
          else if (s.includes('ضربة') || s.includes('hit')) sType = 'hit';
          else if (s.includes('عملة') || s.includes('نجمة') || s.includes('coin')) sType = 'coin';
          else if (s.includes('انفجار') || s.includes('explosion')) sType = 'explosion';
          else if (s.includes('فوز') || s.includes('win')) sType = 'win';
          else if (s.includes('خسارة') || s.includes('lose')) sType = 'lose';
          return `if (typeof game.playSound === 'function') { game.playSound(${JSON.stringify(sType)}); }`;
        }

        // U) Animation: شغل انميشن <اسم>
        const animMatch = action.match(/^(شغل\s+انميشن|play\s+animation)\s+(.+)/i);
        if (animMatch) {
          const a = animMatch[2].trim();
          return `if (typeof this.playAnimation === 'function') { this.playAnimation(${JSON.stringify(a)}); }`;
        }
        if (/^(ايقاف\s+انميشن|stop\s+animation)/i.test(action)) {
          return `if (typeof this.stopAnimation === 'function') { this.stopAnimation(); }`;
        }

        // V) Text & Messages
        const textMatch = action.match(/^(كتابة\s+نص|رسم\s+رسالة|draw\s+text)\s+(.+)/i);
        if (textMatch) {
          const msg = textMatch[2].trim();
          return `if (typeof game.drawText === 'function') { game.drawText(${JSON.stringify(msg)}, 20, 40, { color: '#ffffff', size: 18 }); }`;
        }
        if (/^(رسالة\s+فوز|win\s+message)/i.test(action)) {
          return `if (typeof game.drawText === 'function') { game.drawText('مبروك! لقد فزت! 🎉', (game.width / 2) - 80, game.height / 2, { color: '#22c55e', size: 24 }); }`;
        }
        if (/^(رسالة\s+خسارة|lose\s+message)/i.test(action)) {
          return `if (typeof game.drawText === 'function') { game.drawText('انتهت المحاولة! حاول مجدداً 💀', (game.width / 2) - 110, game.height / 2, { color: '#ef4444', size: 24 }); }`;
        }

        // W) Flash damage
        if (/^(وميض|فلاش|flash)/i.test(action)) {
          return `this.opacity = (Math.floor(Date.now() / 120) % 2 === 0) ? 0.2 : 1;`;
        }

        return `// Custom Action: ${action}`;
      }

      // Check Condition:
      // 1. Collision (Dynamic Names: اذا [كائن1] لمس [كائن2] = ...)
      const touchMatch = condition.match(/^(اذا|if)\s+([\w\u0600-\u06FF_\s]+?)\s*(لمس|اصطدم\s*مع|اصطدم|تلامس\s*مع|تلامس|touch|touches|collide)\s+([\w\u0600-\u06FF_]+)/i);
      if (touchMatch) {
        const target = touchMatch[4].trim();
        const actionCode = buildActionCode(true, target);
        if (target && target !== 'كائن' && target !== 'any') {
          onCollisionStatements.push(`  if (other && (other.name === ${JSON.stringify(target)} || other.name.includes(${JSON.stringify(target)}) || other.tag === ${JSON.stringify(target)})) {
    ${actionCode}
  }`);
        } else {
          onCollisionStatements.push(`  if (other) {
    ${actionCode}
  }`);
        }
        return;
      }

      // 2. Key Press (Dynamic Subject: اذا [كائن] ضغط [مفتاح])
      const pressMatch = condition.match(/^(اذا|if)\s+([\w\u0600-\u06FF_\s]+?)?\s*(ضغط|press|presses|keydown)\s+([\w\u0600-\u06FF_]+)/i);
      if (pressMatch) {
        const rawKey = pressMatch[4].trim();
        const mappedKey = mapKeyName(rawKey);
        const actionCode = buildActionCode(false);
        onUpdateStatements.push(`  if (game.input && game.input.isKeyDown(${JSON.stringify(mappedKey)})) {
    ${actionCode}
  }`);
        return;
      }

      // 3. Mouse Click: اذا [فاعل] نقر
      if (/^(اذا|if)\s+([\w\u0600-\u06FF_\s]+?)?\s*(نقر|انقر|click|clicks)/i.test(condition)) {
        const actionCode = buildActionCode(false);
        onUpdateStatements.push(`  if (game.input && game.input.mouse && game.input.mouse.clicked) {
    const mx = game.input.mouse.worldX;
    const my = game.input.mouse.worldY;
    if (mx >= this.x && mx <= this.x + this.width && my >= this.y && my <= this.y + this.height) {
      ${actionCode}
    }
  }`);
        return;
      }

      // 4. On Start: عند البدء = ...
      if (/^(عند\s+البدء|بدء|on\s+start|start)/i.test(condition)) {
        const actionCode = buildActionCode(false);
        onStartStatements.push(`  ${actionCode}`);
        return;
      }

      // 5. On Update: في كل لحظة = ...
      if (/^(في\s+كل\s+لحظة|تحديث|on\s+update|update)/i.test(condition)) {
        const actionCode = buildActionCode(false);
        onUpdateStatements.push(`  ${actionCode}`);
        return;
      }
    }
  });

  return `// === FY3 Script Compiled Code ===
// Entity: ${currentObjectName}
function onStart(game) {
${onStartStatements.join('\n\n')}
}

function onUpdate(dt, game) {
${onUpdateStatements.join('\n\n')}
}

function onCollision(other, game) {
${onCollisionStatements.join('\n\n')}
}`;
}

// ==========================================
// BACKWARDS COMPATIBILITY FOR STRUCTURED FY3
// ==========================================
export function compileFY3ToJS(scriptData?: FY3ScriptData, currentObjectName?: string): string {
  if (!scriptData) return '';
  if (scriptData.rawText) {
    return compileFY3TextToJS(scriptData.rawText, currentObjectName);
  }
  if (!scriptData.rules?.length && !scriptData.variables?.length) {
    return '';
  }

  const { variables = [], rules = [] } = scriptData;

  const initVarLines = variables.map(v => {
    const val = typeof v.value === 'string' ? JSON.stringify(v.value) : v.value;
    return `  this.variables[${JSON.stringify(v.name)}] = ${val};`;
  }).join('\n');

  const startRules = rules.filter(r => r.enabled !== false && r.trigger === 'on_start');
  const updateRules = rules.filter(r => r.enabled !== false && r.trigger === 'on_update');
  const keyRules = rules.filter(r => r.enabled !== false && r.trigger === 'on_key_down');
  const clickRules = rules.filter(r => r.enabled !== false && r.trigger === 'on_click');
  const collisionRules = rules.filter(r => r.enabled !== false && r.trigger === 'on_collision');

  function compileAction(action: FY3Action): string {
    const p = action.params || {};
    const targetObjRef = p.targetObjectName 
      ? `(game.findObject(${JSON.stringify(p.targetObjectName)}) || this)` 
      : 'this';

    switch (action.type) {
      case 'move_x':
        return `${targetObjRef}.x += (${Number(p.speed || 100)}) * (typeof dt === 'number' ? dt : 0.016);`;
      case 'move_y':
        return `${targetObjRef}.y += (${Number(p.speed || 100)}) * (typeof dt === 'number' ? dt : 0.016);`;
      case 'set_pos':
        return `${targetObjRef}.x = ${Number(p.x || 0)}; ${targetObjRef}.y = ${Number(p.y || 0)};`;
      case 'change_scene':
        return `if (typeof game.loadScene === 'function') { game.loadScene(${JSON.stringify(p.sceneName || '')}); }`;
      case 'play_sound':
        return `game.playSound(${JSON.stringify(p.soundType || 'jump')});`;
      case 'play_animation':
        return `if (typeof ${targetObjRef}.playAnimation === 'function') { ${targetObjRef}.playAnimation(${JSON.stringify(p.animName || '')}); }`;
      case 'set_variable': {
        const val = typeof p.value === 'string' ? JSON.stringify(p.value) : p.value;
        return `this.variables[${JSON.stringify(p.varName || 'score')}] = ${val};`;
      }
      case 'change_variable':
        return `this.variables[${JSON.stringify(p.varName || 'score')}] = (Number(this.variables[${JSON.stringify(p.varName || 'score')}]) || 0) + (${Number(p.delta || 1)});`;
      case 'camera_follow':
        return `game.camera.follow(${targetObjRef});`;
      case 'add_score':
        return `game.score = (game.score || 0) + (${Number(p.amount || 10)});`;
      case 'change_visibility':
        return `${targetObjRef}.visible = ${p.visible === false ? 'false' : 'true'};`;
      default:
        return `// Unknown action ${action.type}`;
    }
  }

  function wrapCondition(rule: FY3Rule, actionStatements: string): string {
    if (!rule.condition || !rule.condition.varName) {
      return actionStatements;
    }
    const { varName, operator = '==', value } = rule.condition;
    const compVal = typeof value === 'string' ? JSON.stringify(value) : value;
    return `if (this.variables[${JSON.stringify(varName)}] ${operator} ${compVal}) {\n    ${actionStatements.split('\n').join('\n    ')}\n  }`;
  }

  const onStartLines: string[] = [];
  if (initVarLines) onStartLines.push(initVarLines);
  startRules.forEach(rule => {
    const actCode = rule.actions.map(compileAction).join('\n  ');
    onStartLines.push(wrapCondition(rule, actCode));
  });

  const onUpdateLines: string[] = [];
  updateRules.forEach(rule => {
    const actCode = rule.actions.map(compileAction).join('\n  ');
    onUpdateLines.push(wrapCondition(rule, actCode));
  });

  keyRules.forEach(rule => {
    const code = rule.keyCode || 'ArrowRight';
    const actCode = rule.actions.map(compileAction).join('\n    ');
    const condCode = wrapCondition(rule, actCode);
    onUpdateLines.push(`if (game.input.isKeyDown(${JSON.stringify(code)})) {\n    ${condCode.split('\n').join('\n    ')}\n  }`);
  });

  clickRules.forEach(rule => {
    const targetRef = rule.targetObjectId ? `game.findObject(${JSON.stringify(rule.targetObjectId)})` : 'this';
    const actCode = rule.actions.map(compileAction).join('\n      ');
    const condCode = wrapCondition(rule, actCode);
    onUpdateLines.push(`if (game.input.mouse.clicked) {
    const tObj = ${targetRef};
    if (tObj && game.input.mouse.worldX >= tObj.x && game.input.mouse.worldX <= tObj.x + tObj.width &&
        game.input.mouse.worldY >= tObj.y && game.input.mouse.worldY <= tObj.y + tObj.height) {
      ${condCode.split('\n').join('\n      ')}
    }
  }`);
  });

  const onCollisionLines: string[] = [];
  collisionRules.forEach(rule => {
    const targetCollider = rule.collideWithObjectId;
    const actCode = rule.actions.map(compileAction).join('\n    ');
    const condCode = wrapCondition(rule, actCode);
    if (targetCollider && targetCollider !== '*') {
      onCollisionLines.push(`if (other && (other.name === ${JSON.stringify(targetCollider)} || other.tag === ${JSON.stringify(targetCollider)})) {\n    ${condCode.split('\n').join('\n    ')}\n  }`);
    } else {
      onCollisionLines.push(condCode);
    }
  });

  return `// === FY3 Visual Script Compiled Code ===
// Entity: ${currentObjectName || 'Active Entity'}
function onStart(game) {
${onStartLines.join('\n\n')}
}

function onUpdate(dt, game) {
${onUpdateLines.join('\n\n')}
}

function onCollision(other, game) {
${onCollisionLines.join('\n\n')}
}`;
}
