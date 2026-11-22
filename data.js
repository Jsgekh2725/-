/* RoGUI Studio — data.js : تعريف الكلاسات والخصائص والقوالب */
'use strict';

const TOPBAR_H = 58;
let __uid = Date.now() % 100000;
const uid = () => 'n' + (++__uid).toString(36) + Math.random().toString(36).slice(2, 5);

/* ---------- الخطوط ---------- */
const FONT_MAP = {
  Gotham: ['Montserrat', 400], GothamMedium: ['Montserrat', 500], GothamBold: ['Montserrat', 700], GothamBlack: ['Montserrat', 900],
  BuilderSans: ['Inter', 400], BuilderSansMedium: ['Inter', 500], BuilderSansBold: ['Inter', 700], BuilderSansExtraBold: ['Inter', 800],
  SourceSans: ['"Source Sans 3"', 400], SourceSansLight: ['"Source Sans 3"', 300], SourceSansSemibold: ['"Source Sans 3"', 600],
  SourceSansBold: ['"Source Sans 3"', 700], SourceSansItalic: ['"Source Sans 3"', 400, 'italic'],
  Arial: ['Arial', 400], ArialBold: ['Arial', 700], Arimo: ['Arimo', 400], ArimoBold: ['Arimo', 700],
  Roboto: ['Roboto', 400], RobotoMono: ['"Roboto Mono"', 400], Ubuntu: ['Ubuntu', 400], Oswald: ['Oswald', 400],
  Nunito: ['Nunito', 400], Merriweather: ['Merriweather', 400], FredokaOne: ['Fredoka', 600], LuckiestGuy: ['"Luckiest Guy"', 400],
  Bangers: ['Bangers', 400], Creepster: ['Creepster', 400], DenkOne: ['"Denk One"', 400], IndieFlower: ['"Indie Flower"', 400],
  PermanentMarker: ['"Permanent Marker"', 400], SpecialElite: ['"Special Elite"', 400], TitilliumWeb: ['"Titillium Web"', 400],
  AmaticSC: ['"Amatic SC"', 700], Michroma: ['Michroma', 400], PatrickHand: ['"Patrick Hand"', 400], Kalam: ['Kalam', 400],
  JosefinSans: ['"Josefin Sans"', 400], Jura: ['Jura', 400], Sarpanch: ['Sarpanch', 400], Fondamento: ['Fondamento', 400],
  GrenzeGotisch: ['"Grenze Gotisch"', 400], Cartoon: ['"Comic Neue"', 700], Code: ['"Roboto Mono"', 400], Highway: ['Oswald', 300],
  SciFi: ['Orbitron', 500], Arcade: ['"Press Start 2P"', 400], Fantasy: ['Cinzel', 700], Antique: ['Cinzel', 400],
  Garamond: ['"EB Garamond"', 400], Bodoni: ['"Bodoni Moda"', 400]
};
const FONT_LIST = Object.keys(FONT_MAP);

/* ---------- الـ Enums ---------- */
const EASING = ['Linear', 'Sine', 'Quad', 'Cubic', 'Quart', 'Quint', 'Exponential', 'Circular', 'Back', 'Bounce', 'Elastic'];
const EASEDIR = ['In', 'Out', 'InOut'];
const ENUM_TYPE = { // اسم الـ Enum في روبلوكس
  AutomaticSize: 'AutomaticSize', AutomaticCanvasSize: 'AutomaticSize', TextXAlignment: 'TextXAlignment', TextYAlignment: 'TextYAlignment',
  ScaleType: 'ScaleType', ScrollingDirection: 'ScrollingDirection', ApplyStrokeMode: 'ApplyStrokeMode', LineJoinMode: 'LineJoinMode',
  FillDirection: 'FillDirection', HorizontalAlignment: 'HorizontalAlignment', VerticalAlignment: 'VerticalAlignment', SortOrder: 'SortOrder',
  HorizontalFlex: 'UIFlexAlignment', VerticalFlex: 'UIFlexAlignment', StartCorner: 'StartCorner', AspectType: 'AspectType',
  DominantAxis: 'DominantAxis', EasingStyle: 'EasingStyle', EasingDirection: 'EasingDirection', ZIndexBehavior: 'ZIndexBehavior',
  FlexMode: 'UIFlexMode', VerticalScrollBarPosition: 'VerticalScrollBarPosition'
};

/* ---------- أيقونات SVG ---------- */
const SVG = (p) => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICONS = {
  ScreenGui: SVG('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
  Frame: SVG('<rect x="4" y="5" width="16" height="14" rx="2"/>'),
  ScrollingFrame: SVG('<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M16 7v6"/>'),
  CanvasGroup: SVG('<rect x="3" y="7" width="12" height="12" rx="2"/><rect x="9" y="3" width="12" height="12" rx="2" opacity=".6"/>'),
  TextLabel: SVG('<path d="M5 6h14M12 6v13M9 19h6"/>'),
  TextButton: SVG('<rect x="3" y="7" width="18" height="10" rx="5"/><path d="M8 12h8"/>'),
  TextBox: SVG('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 9v6M7 9h2M7 15h2"/>'),
  ImageLabel: SVG('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/>'),
  ImageButton: SVG('<rect x="3" y="4" width="18" height="16" rx="5"/><circle cx="9" cy="10" r="2"/><path d="M20 16l-4-4-8 7"/>'),
  UICorner: SVG('<path d="M4 20V12a8 8 0 0 1 8-8h8"/>'),
  UIStroke: SVG('<rect x="3" y="3" width="18" height="18" rx="3"/><rect x="7" y="7" width="10" height="10" rx="1"/>'),
  UIGradient: SVG('<defs><linearGradient id="ig" x1="0" x2="1"><stop offset="0" stop-color="currentColor"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><rect x="3" y="5" width="18" height="14" rx="2" fill="url(#ig)"/>'),
  UIPadding: SVG('<rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7.5" y="7.5" width="9" height="9" stroke-dasharray="2 2"/>'),
  UIListLayout: SVG('<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>'),
  UIGridLayout: SVG('<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>'),
  UIPageLayout: SVG('<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M3 8v8M21 8v8"/>'),
  UIAspectRatioConstraint: SVG('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 14l10-4"/>'),
  UIScale: SVG('<path d="M4 14v6h6M20 10V4h-6M4 20l7-7M20 4l-7 7"/>'),
  UISizeConstraint: SVG('<path d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4"/>'),
  UITextSizeConstraint: SVG('<path d="M3 7h9M7.5 7v11M14 11h7M17.5 11v7"/>'),
  UIFlexItem: SVG('<path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/>'),
  template: SVG('<path d="M12 3l2.6 5.6L20 9.3l-4 4 1 5.7-5-2.8-5 2.8 1-5.7-4-4 5.4-.7z"/>'),
  mine: SVG('<path d="M5 4h14v17l-7-4-7 4z"/>')
};

/* ---------- الكلاسات ---------- */
const CLASSES = {
  ScreenGui: { kind: 'root', ar: 'الشاشة (ScreenGui)' },
  Frame: { kind: 'gui', ar: 'إطار', desc: 'حاوية أساسية تجمع العناصر' },
  ScrollingFrame: { kind: 'gui', ar: 'إطار تمرير', desc: 'قائمة يمكن تمريرها', scroll: true },
  CanvasGroup: { kind: 'gui', ar: 'مجموعة كانفاس', desc: 'تتحكم بشفافية ولون مجموعة كاملة', group: true },
  TextLabel: { kind: 'gui', ar: 'نص', desc: 'عرض نص بأي خط', text: true },
  TextButton: { kind: 'gui', ar: 'زر نصي', desc: 'زر قابل للضغط', text: true, button: true },
  TextBox: { kind: 'gui', ar: 'مربع كتابة', desc: 'إدخال نص من اللاعب', text: true, box: true },
  ImageLabel: { kind: 'gui', ar: 'صورة', desc: 'صورة من التولبوكس بالـ ID', image: true },
  ImageButton: { kind: 'gui', ar: 'زر صورة', desc: 'صورة قابلة للضغط', image: true, button: true },
  UICorner: { kind: 'mod', ar: 'زوايا دائرية', desc: 'تدوير زوايا العنصر' },
  UIStroke: { kind: 'mod', ar: 'حدود (Stroke)', desc: 'إطار خارجي أو حدود للنص' },
  UIGradient: { kind: 'mod', ar: 'تدرج لوني', desc: 'تدرج ألوان وشفافية' },
  UIPadding: { kind: 'mod', ar: 'هوامش داخلية', desc: 'مسافة داخلية للأبناء' },
  UIListLayout: { kind: 'mod', ar: 'ترتيب قائمة', desc: 'يرتب الأبناء عمودياً/أفقياً', layout: true },
  UIGridLayout: { kind: 'mod', ar: 'ترتيب شبكة', desc: 'يرتب الأبناء كشبكة خلايا', layout: true },
  UIPageLayout: { kind: 'mod', ar: 'صفحات', desc: 'كل ابن صفحة مع انتقال', layout: true },
  UIAspectRatioConstraint: { kind: 'mod', ar: 'تثبيت النسبة', desc: 'يحافظ على نسبة العرض/الطول' },
  UIScale: { kind: 'mod', ar: 'مقياس', desc: 'تكبير/تصغير العنصر وأبنائه' },
  UISizeConstraint: { kind: 'mod', ar: 'حدود الحجم', desc: 'أقل وأكبر حجم مسموح' },
  UITextSizeConstraint: { kind: 'mod', ar: 'حدود حجم الخط', desc: 'أقل وأكبر حجم للنص المتمدد' },
  UIFlexItem: { kind: 'mod', ar: 'عنصر مرن', desc: 'تمدد داخل UIListLayout' }
};
const GUI_CLASSES = Object.keys(CLASSES).filter(k => CLASSES[k].kind === 'gui');
const MOD_CLASSES = Object.keys(CLASSES).filter(k => CLASSES[k].kind === 'mod');
const isGui = n => CLASSES[n.cls] && CLASSES[n.cls].kind === 'gui';
const isMod = n => CLASSES[n.cls] && CLASSES[n.cls].kind === 'mod';

/* ---------- الخصائص ---------- */
const GROUPS = {
  root: 'إعدادات الشاشة', data: 'البيانات', layout: 'الموقع والحجم', look: 'المظهر', text: 'النص',
  box: 'مربع الكتابة', image: 'الصورة', scroll: 'التمرير', cgroup: 'المجموعة', mod: 'الخصائص', editor: 'المحرر فقط'
};
const P = (k, type, group, def, o = {}) => Object.assign({ k, type, group, def }, o);
const PROP_AR = {
  Visible: 'مرئي', ZIndex: 'ترتيب الطبقة', LayoutOrder: 'ترتيب في القائمة', AnchorPoint: 'نقطة الارتكاز', Position: 'الموقع', Size: 'الحجم',
  Rotation: 'الدوران', AutomaticSize: 'حجم تلقائي', BackgroundColor3: 'لون الخلفية', BackgroundTransparency: 'شفافية الخلفية',
  BorderSizePixel: 'سمك الحدود القديمة', BorderColor3: 'لون الحدود القديمة', ClipsDescendants: 'قص الأبناء', Text: 'النص', RichText: 'نص منسق',
  Font: 'الخط', TextSize: 'حجم الخط', TextScaled: 'تمدد النص', TextWrapped: 'التفاف النص', TextColor3: 'لون النص', TextTransparency: 'شفافية النص',
  TextStrokeColor3: 'لون حد النص', TextStrokeTransparency: 'شفافية حد النص', TextXAlignment: 'محاذاة أفقية', TextYAlignment: 'محاذاة عمودية',
  LineHeight: 'ارتفاع السطر', AutoButtonColor: 'تغميق تلقائي', PlaceholderText: 'نص توضيحي', PlaceholderColor3: 'لون النص التوضيحي',
  ClearTextOnFocus: 'مسح عند التركيز', MultiLine: 'عدة أسطر', TextEditable: 'قابل للكتابة', Image: 'الصورة (ID)', ImageColor3: 'تلوين الصورة',
  ImageTransparency: 'شفافية الصورة', ScaleType: 'طريقة العرض', TileSize: 'حجم التكرار', SliceCenter: 'مركز التقطيع', CanvasSize: 'حجم المحتوى',
  AutomaticCanvasSize: 'محتوى تلقائي', ScrollBarThickness: 'سمك شريط التمرير', ScrollBarImageColor3: 'لون شريط التمرير',
  ScrollBarImageTransparency: 'شفافية الشريط', ScrollingDirection: 'اتجاه التمرير', ScrollingEnabled: 'تفعيل التمرير',
  GroupTransparency: 'شفافية المجموعة', GroupColor3: 'لون المجموعة', ResetOnSpawn: 'إعادة عند الموت', IgnoreGuiInset: 'تجاهل الشريط العلوي',
  ZIndexBehavior: 'سلوك الطبقات', DisplayOrder: 'أولوية العرض', Enabled: 'مفعل', CornerRadius: 'نصف قطر الزاوية', Color: 'اللون',
  Thickness: 'السمك', Transparency: 'الشفافية', ApplyStrokeMode: 'نوع الحد', LineJoinMode: 'شكل الزوايا', Offset: 'الإزاحة',
  PaddingTop: 'هامش أعلى', PaddingBottom: 'هامش أسفل', PaddingLeft: 'هامش يسار', PaddingRight: 'هامش يمين', FillDirection: 'الاتجاه',
  Padding: 'المسافة', HorizontalAlignment: 'محاذاة أفقية', VerticalAlignment: 'محاذاة عمودية', SortOrder: 'الترتيب حسب', Wraps: 'التفاف',
  HorizontalFlex: 'مرونة أفقية', VerticalFlex: 'مرونة عمودية', CellSize: 'حجم الخلية', CellPadding: 'المسافة بين الخلايا',
  FillDirectionMaxCells: 'أقصى خلايا بالصف', StartCorner: 'زاوية البداية', Animated: 'متحرك', Circular: 'دائري', EasingStyle: 'نمط الحركة',
  EasingDirection: 'اتجاه الحركة', TweenTime: 'مدة الانتقال', ScrollWheelInputEnabled: 'عجلة الماوس', TouchInputEnabled: 'اللمس',
  GamepadInputEnabled: 'يد التحكم', AspectRatio: 'النسبة', AspectType: 'نوع النسبة', DominantAxis: 'المحور المسيطر', Scale: 'المقياس',
  MinSize: 'أقل حجم', MaxSize: 'أكبر حجم', MinTextSize: 'أقل خط', MaxTextSize: 'أكبر خط', FlexMode: 'وضع المرونة', GrowRatio: 'نسبة التمدد',
  ShrinkRatio: 'نسبة الانكماش', _preview: 'رابط معاينة (اختياري)'
};
const U2 = (xs, xo, ys, yo) => ({ xs, xo, ys, yo });
const V2 = (x, y) => ({ x, y });
const UD = (s, o) => ({ s, o });
const UI_TRANSP = { min: 0, max: 1, step: 0.05, slider: true };

const GUI_BASE = [
  P('Visible', 'bool', 'data', true, { rd: true }),
  P('ZIndex', 'number', 'data', 1, { rd: 1, step: 1 }),
  P('LayoutOrder', 'number', 'data', 0, { rd: 0, step: 1 }),
  P('AnchorPoint', 'vec2', 'layout', V2(0, 0), { rd: V2(0, 0), step: 0.5, anchor: true }),
  P('Position', 'udim2', 'layout', U2(0, 0, 0, 0)),
  P('Size', 'udim2', 'layout', U2(0, 100, 0, 100)),
  P('Rotation', 'number', 'layout', 0, { rd: 0, step: 1 }),
  P('AutomaticSize', 'enum', 'layout', 'None', { opts: ['None', 'X', 'Y', 'XY'], rd: 'None' }),
  P('BackgroundColor3', 'color', 'look', '#ffffff'),
  P('BackgroundTransparency', 'number', 'look', 0, Object.assign({ rd: 0 }, UI_TRANSP)),
  P('BorderSizePixel', 'number', 'look', 0, { step: 1, min: 0 }),
  P('BorderColor3', 'color', 'look', '#1b2a35', { rd: '#1b2a35' }),
  P('ClipsDescendants', 'bool', 'look', false)
];
const TEXT_PROPS = [
  P('Text', 'text', 'text', 'Label'),
  P('RichText', 'bool', 'text', false, { rd: false }),
  P('Font', 'font', 'text', 'GothamBold'),
  P('TextSize', 'number', 'text', 20, { step: 1, min: 1, max: 100 }),
  P('TextScaled', 'bool', 'text', false, { rd: false }),
  P('TextWrapped', 'bool', 'text', false, { rd: false }),
  P('TextColor3', 'color', 'text', '#ffffff'),
  P('TextTransparency', 'number', 'text', 0, Object.assign({ rd: 0 }, UI_TRANSP)),
  P('TextStrokeColor3', 'color', 'text', '#000000', { rd: '#000000' }),
  P('TextStrokeTransparency', 'number', 'text', 1, Object.assign({ rd: 1 }, UI_TRANSP)),
  P('TextXAlignment', 'enum', 'text', 'Center', { opts: ['Left', 'Center', 'Right'], rd: 'Center' }),
  P('TextYAlignment', 'enum', 'text', 'Center', { opts: ['Top', 'Center', 'Bottom'], rd: 'Center' }),
  P('LineHeight', 'number', 'text', 1, { rd: 1, step: 0.1, min: 0.5, max: 3 })
];
const IMAGE_PROPS = [
  P('Image', 'image', 'image', ''),
  P('_preview', 'string', 'editor', '', { hint: 'رابط صورة للمعاينة في الموقع فقط إذا ما ظهرت الصورة تلقائياً' }),
  P('ImageColor3', 'color', 'image', '#ffffff', { rd: '#ffffff' }),
  P('ImageTransparency', 'number', 'image', 0, Object.assign({ rd: 0 }, UI_TRANSP)),
  P('ScaleType', 'enum', 'image', 'Stretch', { opts: ['Stretch', 'Fit', 'Crop', 'Tile', 'Slice'], rd: 'Stretch' }),
  P('TileSize', 'udim2', 'image', U2(1, 0, 1, 0), { rd: U2(1, 0, 1, 0), when: p => p.ScaleType === 'Tile' }),
  P('SliceCenter', 'rect', 'image', { x0: 0, y0: 0, x1: 0, y1: 0 }, { rd: { x0: 0, y0: 0, x1: 0, y1: 0 }, when: p => p.ScaleType === 'Slice' })
];
const SCHEMA = {
  ScreenGui: [
    P('Enabled', 'bool', 'root', true, { rd: true }),
    P('ResetOnSpawn', 'bool', 'root', false),
    P('IgnoreGuiInset', 'bool', 'root', false, { rd: false }),
    P('ZIndexBehavior', 'enum', 'root', 'Sibling', { opts: ['Sibling', 'Global'] }),
    P('DisplayOrder', 'number', 'root', 0, { rd: 0, step: 1 })
  ],
  Frame: [...GUI_BASE],
  CanvasGroup: [...GUI_BASE,
    P('GroupTransparency', 'number', 'cgroup', 0, Object.assign({ rd: 0 }, UI_TRANSP)),
    P('GroupColor3', 'color', 'cgroup', '#ffffff', { rd: '#ffffff' })],
  ScrollingFrame: [...GUI_BASE,
    P('CanvasSize', 'udim2', 'scroll', U2(0, 0, 2, 0)),
    P('AutomaticCanvasSize', 'enum', 'scroll', 'None', { opts: ['None', 'X', 'Y', 'XY'], rd: 'None' }),
    P('ScrollingDirection', 'enum', 'scroll', 'XY', { opts: ['XY', 'X', 'Y'], rd: 'XY' }),
    P('ScrollBarThickness', 'number', 'scroll', 6, { step: 1, min: 0 }),
    P('ScrollBarImageColor3', 'color', 'scroll', '#ffffff'),
    P('ScrollBarImageTransparency', 'number', 'scroll', 0, Object.assign({ rd: 0 }, UI_TRANSP)),
    P('ScrollingEnabled', 'bool', 'scroll', true, { rd: true })],
  TextLabel: [...GUI_BASE, ...TEXT_PROPS],
  TextButton: [...GUI_BASE, ...TEXT_PROPS, P('AutoButtonColor', 'bool', 'data', false)],
  TextBox: [...GUI_BASE, ...TEXT_PROPS,
    P('PlaceholderText', 'string', 'box', 'اكتب هنا...'),
    P('PlaceholderColor3', 'color', 'box', '#9a9cab'),
    P('ClearTextOnFocus', 'bool', 'box', false),
    P('MultiLine', 'bool', 'box', false, { rd: false }),
    P('TextEditable', 'bool', 'box', true, { rd: true })],
  ImageLabel: [...GUI_BASE, ...IMAGE_PROPS],
  ImageButton: [...GUI_BASE, ...IMAGE_PROPS, P('AutoButtonColor', 'bool', 'data', false)],
  UICorner: [P('CornerRadius', 'udim', 'mod', UD(0, 8))],
  UIStroke: [
    P('Enabled', 'bool', 'mod', true, { rd: true }),
    P('Color', 'color', 'mod', '#000000'),
    P('Thickness', 'number', 'mod', 2, { step: 0.5, min: 0 }),
    P('Transparency', 'number', 'mod', 0, Object.assign({ rd: 0 }, UI_TRANSP)),
    P('ApplyStrokeMode', 'enum', 'mod', 'Border', { opts: ['Contextual', 'Border'] }),
    P('LineJoinMode', 'enum', 'mod', 'Round', { opts: ['Round', 'Bevel', 'Miter'], rd: 'Round' })],
  UIGradient: [
    P('Enabled', 'bool', 'mod', true, { rd: true }),
    P('Color', 'colorseq', 'mod', [{ t: 0, c: '#ffffff' }, { t: 1, c: '#7f5cff' }]),
    P('Transparency', 'numseq', 'mod', [{ t: 0, v: 0 }, { t: 1, v: 0 }]),
    P('Rotation', 'number', 'mod', 0, { rd: 0, step: 5, min: -360, max: 360 }),
    P('Offset', 'vec2', 'mod', V2(0, 0), { rd: V2(0, 0), step: 0.05 })],
  UIPadding: ['PaddingTop', 'PaddingBottom', 'PaddingLeft', 'PaddingRight'].map(k => P(k, 'udim', 'mod', UD(0, 8))),
  UIListLayout: [
    P('FillDirection', 'enum', 'mod', 'Vertical', { opts: ['Vertical', 'Horizontal'] }),
    P('Padding', 'udim', 'mod', UD(0, 8)),
    P('HorizontalAlignment', 'enum', 'mod', 'Center', { opts: ['Left', 'Center', 'Right'] }),
    P('VerticalAlignment', 'enum', 'mod', 'Top', { opts: ['Top', 'Center', 'Bottom'] }),
    P('SortOrder', 'enum', 'mod', 'LayoutOrder', { opts: ['LayoutOrder', 'Name'] }),
    P('HorizontalFlex', 'enum', 'mod', 'None', { opts: ['None', 'Fill', 'SpaceAround', 'SpaceBetween', 'SpaceEvenly'], rd: 'None' }),
    P('VerticalFlex', 'enum', 'mod', 'None', { opts: ['None', 'Fill', 'SpaceAround', 'SpaceBetween', 'SpaceEvenly'], rd: 'None' }),
    P('Wraps', 'bool', 'mod', false, { rd: false })],
  UIGridLayout: [
    P('CellSize', 'udim2', 'mod', U2(0, 100, 0, 100)),
    P('CellPadding', 'udim2', 'mod', U2(0, 8, 0, 8)),
    P('FillDirection', 'enum', 'mod', 'Horizontal', { opts: ['Horizontal', 'Vertical'] }),
    P('FillDirectionMaxCells', 'number', 'mod', 0, { rd: 0, step: 1, min: 0 }),
    P('HorizontalAlignment', 'enum', 'mod', 'Center', { opts: ['Left', 'Center', 'Right'] }),
    P('VerticalAlignment', 'enum', 'mod', 'Top', { opts: ['Top', 'Center', 'Bottom'] }),
    P('SortOrder', 'enum', 'mod', 'LayoutOrder', { opts: ['LayoutOrder', 'Name'] }),
    P('StartCorner', 'enum', 'mod', 'TopLeft', { opts: ['TopLeft', 'TopRight', 'BottomLeft', 'BottomRight'], rd: 'TopLeft' })],
  UIPageLayout: [
    P('Animated', 'bool', 'mod', true, { rd: true }),
    P('Circular', 'bool', 'mod', false, { rd: false }),
    P('EasingStyle', 'enum', 'mod', 'Quad', { opts: EASING }),
    P('EasingDirection', 'enum', 'mod', 'Out', { opts: EASEDIR }),
    P('TweenTime', 'number', 'mod', 0.5, { step: 0.05, min: 0 }),
    P('Padding', 'udim', 'mod', UD(0, 0)),
    P('FillDirection', 'enum', 'mod', 'Horizontal', { opts: ['Horizontal', 'Vertical'] }),
    P('SortOrder', 'enum', 'mod', 'LayoutOrder', { opts: ['LayoutOrder', 'Name'] }),
    P('ScrollWheelInputEnabled', 'bool', 'mod', true, { rd: true }),
    P('TouchInputEnabled', 'bool', 'mod', true, { rd: true }),
    P('GamepadInputEnabled', 'bool', 'mod', true, { rd: true })],
  UIAspectRatioConstraint: [
    P('AspectRatio', 'number', 'mod', 1, { step: 0.05, min: 0.01 }),
    P('AspectType', 'enum', 'mod', 'FitWithinMaxSize', { opts: ['FitWithinMaxSize', 'ScaleWithParentSize'] }),
    P('DominantAxis', 'enum', 'mod', 'Width', { opts: ['Width', 'Height'] })],
  UIScale: [P('Scale', 'number', 'mod', 1, { step: 0.05, min: 0 })],
  UISizeConstraint: [
    P('MinSize', 'vec2', 'mod', V2(0, 0), { step: 1 }),
    P('MaxSize', 'vec2', 'mod', V2(100000, 100000), { step: 1, hint: '100000 = بلا حد (math.huge)' })],
  UITextSizeConstraint: [
    P('MinTextSize', 'number', 'mod', 1, { step: 1, min: 1, max: 100 }),
    P('MaxTextSize', 'number', 'mod', 100, { step: 1, min: 1, max: 100 })],
  UIFlexItem: [
    P('FlexMode', 'enum', 'mod', 'Fill', { opts: ['None', 'Grow', 'Shrink', 'Fill', 'Custom'] }),
    P('GrowRatio', 'number', 'mod', 1, { step: 0.1, min: 0 }),
    P('ShrinkRatio', 'number', 'mod', 1, { step: 0.1, min: 0 })]
};

/* ---------- إعدادات الأنميشن ---------- */
const FX_TYPES = ['none', 'ripple', 'confetti', 'fireworks', 'explosion', 'shockwave', 'sparkles', 'stars', 'hearts', 'bubbles', 'smoke', 'fire', 'spiral', 'pixels', 'snow', 'leaves', 'music', 'coins', 'money', 'diamonds', 'lightning', 'balloons', 'emoji', 'image', 'ring', 'text'];
const FX_AR = ['بدون', 'تموج (Ripple)', 'طراطيع / قصاصات 🎊', 'ألعاب نارية 🎆', 'انفجار 💥', 'موجة صدمية ◎', 'لمعة ✦', 'نجوم ★', 'قلوب ❤', 'فقاعات ○', 'دخان 🌫', 'نار 🔥', 'دوامة 🌀', 'بكسلات ▪', 'ثلج ❄', 'أوراق 🍃', 'نوتات موسيقية ♪', 'عملات 🪙', 'فلوس 💵', 'ألماس 💎', 'برق ⚡', 'بالونات 🎈', 'إيموجي مخصص 😀', 'صورة مخصصة (ID)', 'حلقة متوسعة ◯', 'نص طائر +1'];
const MOTIONS = ['none', 'shake', 'headShake', 'bounce', 'pulse', 'heartbeat', 'pop', 'slam', 'spin', 'jelly', 'rubber', 'tada', 'wobble', 'swing', 'flash'];
const MOTIONS_AR = ['بدون', 'اهتزاز', 'هز الرأس', 'ارتداد', 'نبضة', 'نبضة قلب', 'فرقعة', 'ضربة', 'لفة كاملة', 'جيلي', 'مطاط', 'تادا 🎉', 'تمايل', 'أرجحة', 'وميض'];
const ENTERS = ['none', 'fade', 'pop', 'bounceIn', 'elasticIn', 'zoom', 'slideTop', 'slideBottom', 'slideLeft', 'slideRight', 'riseUp', 'fadeDown', 'rollIn', 'swingIn', 'spinIn', 'drop', 'expandX', 'expandY', 'typewriter', 'countUp'];
const ENTERS_AR = ['بدون', 'تلاشي ظهور', 'انبثاق', 'ارتداد للداخل', 'مطاطي', 'تقريب', 'انزلاق من فوق', 'انزلاق من تحت', 'انزلاق من اليسار', 'انزلاق من اليمين', 'صعود ناعم', 'نزول ناعم', 'تدحرج', 'تأرجح للداخل', 'دوران للداخل', 'سقوط مع ارتداد', 'تمدد أفقي', 'تمدد عمودي', 'آلة كاتبة (للنص)', 'عدّاد أرقام (للنص)'];
const EXITS = ['auto', 'fade', 'shrink', 'slideTop', 'slideBottom', 'slideLeft', 'slideRight', 'spinOut', 'drop', 'none'];
const EXITS_AR = ['تلقائي (تصغير + تلاشي)', 'تلاشي', 'انكماش', 'انزلاق لفوق', 'انزلاق لتحت', 'انزلاق لليسار', 'انزلاق لليمين', 'دوران للخارج', 'سقوط', 'بدون (اختفاء فوري)'];
const IDLES = ['none', 'float', 'bounce', 'orbit', 'wave', 'pulse', 'breath', 'heartbeat', 'spin', 'swing', 'shake', 'flicker', 'rainbow', 'rainbowText', 'colorPulse', 'gradientSpin', 'gradientFlow', 'glow', 'strokeRainbow', 'shine'];
const IDLES_AR = ['بدون', 'طفو', 'نطنطة', 'مدار دائري', 'موجة', 'نبض', 'تنفس', 'نبضة قلب', 'دوران مستمر', 'تأرجح', 'ارتعاش', 'وميض متقطع', 'خلفية قوس قزح', 'نص قوس قزح', 'نبض لوني', 'دوران التدرج', 'تدفق التدرج', 'توهج الحدود', 'حدود قوس قزح', 'لمعة متكررة ✨'];
const ACTIONS = ['none', 'toggle', 'open', 'close', 'tab', 'closeParent', 'closeSelf', 'toggleSwitch', 'pageNext', 'pagePrev', 'pageJump', 'setText', 'notify', 'remote'];
const ACTIONS_AR = ['بدون', 'إظهار/إخفاء عنصر', 'فتح عنصر', 'إغلاق عنصر', 'تبويب (فتح عنصر وإغلاق إخوانه)', 'إغلاق الأب', 'إغلاق نفسه', 'مفتاح تشغيل (Toggle) — يحرك ابن اسمه Knob', 'الصفحة التالية (UIPageLayout)', 'الصفحة السابقة (UIPageLayout)', 'القفز إلى صفحة', 'تغيير نص عنصر', 'إشعار روبلوكس', 'إرسال RemoteEvent'];
const TARGET_ACTIONS = ['toggle', 'open', 'close', 'tab', 'pageNext', 'pagePrev', 'pageJump', 'setText'];

const A = (k, type, group, def, o = {}) => Object.assign({ k, type, group, def }, o);
const ANIM_GROUPS = {
  tw: 'إعدادات الحركة العامة', hover: 'عند مرور الماوس (Hover)', press: 'أثناء الضغط', click: 'عند النقر',
  enter: 'الظهور والإخفاء', idle: 'حركة مستمرة (Idle)', action: 'إجراء عند النقر', extra: 'إضافات'
};
const ANIM = [
  A('tweenTime', 'number', 'tw', 0.18, { label: 'المدة (ثانية)', step: 0.02, min: 0 }),
  A('easeStyle', 'enum', 'tw', 'Quad', { label: 'نمط الحركة', opts: EASING }),
  A('easeDir', 'enum', 'tw', 'Out', { label: 'الاتجاه', opts: EASEDIR }),

  A('hoverOn', 'bool', 'hover', false, { label: 'تفعيل' }),
  A('hoverScale', 'number', 'hover', 1.06, { label: 'التكبير', step: 0.01, when: a => a.hoverOn }),
  A('hoverLift', 'number', 'hover', 0, { label: 'رفع (بكسل)', step: 1, when: a => a.hoverOn }),
  A('hoverRotate', 'number', 'hover', 0, { label: 'دوران (درجة)', step: 1, when: a => a.hoverOn }),
  A('hoverBrightOn', 'bool', 'hover', false, { label: 'تفتيح اللون تلقائياً', when: a => a.hoverOn }),
  A('hoverColorOn', 'bool', 'hover', false, { label: 'تغيير لون الخلفية', when: a => a.hoverOn }),
  A('hoverColor', 'color', 'hover', '#8b7bff', { label: 'لون الخلفية', when: a => a.hoverOn && a.hoverColorOn }),
  A('hoverTextOn', 'bool', 'hover', false, { label: 'تغيير لون النص', when: a => a.hoverOn }),
  A('hoverTextColor', 'color', 'hover', '#ffe066', { label: 'لون النص', when: a => a.hoverOn && a.hoverTextOn }),
  A('hoverTranspOn', 'bool', 'hover', false, { label: 'تغيير الشفافية', when: a => a.hoverOn }),
  A('hoverTransp', 'number', 'hover', 0.2, Object.assign({ label: 'شفافية الخلفية', when: a => a.hoverOn && a.hoverTranspOn }, UI_TRANSP)),
  A('hoverStrokeOn', 'bool', 'hover', false, { label: 'توهج الحدود (UIStroke)', when: a => a.hoverOn }),
  A('hoverStrokeColor', 'color', 'hover', '#ffffff', { label: 'لون التوهج', when: a => a.hoverOn && a.hoverStrokeOn }),
  A('hoverStrokeThick', 'number', 'hover', 3, { label: 'سمك التوهج', step: 0.5, when: a => a.hoverOn && a.hoverStrokeOn }),
  A('hoverShine', 'bool', 'hover', false, { label: 'لمعة عابرة ✨' }),
  A('hoverWiggle', 'bool', 'hover', false, { label: 'هزة خفيفة عند الدخول' }),
  A('hoverSound', 'sound', 'hover', '', { label: 'صوت المرور (ID)' }),

  A('pressOn', 'bool', 'press', false, { label: 'تفعيل' }),
  A('pressScale', 'number', 'press', 0.92, { label: 'التصغير', step: 0.01, when: a => a.pressOn }),
  A('pressSink', 'number', 'press', 0, { label: 'غوص للأسفل (بكسل) — تأثير 3D', step: 1, when: a => a.pressOn }),
  A('pressColorOn', 'bool', 'press', false, { label: 'تغيير اللون', when: a => a.pressOn }),
  A('pressColor', 'color', 'press', '#4b3fb5', { label: 'اللون أثناء الضغط', when: a => a.pressOn && a.pressColorOn }),
  A('pressSound', 'sound', 'press', '', { label: 'صوت الضغط (ID)' }),

  A('clickFx', 'enum', 'click', 'none', { label: 'التأثير', opts: FX_TYPES, labels: FX_AR }),
  A('fxCount', 'number', 'click', 24, { label: 'العدد', step: 1, min: 1, max: 150, when: a => !['none', 'ripple', 'ring', 'text', 'shockwave'].includes(a.clickFx) }),
  A('fxColors', 'colors', 'click', ['#ff5d8f', '#ffd166', '#06d6a0', '#4cc9f0', '#9b5de5'], { label: 'الألوان', when: a => a.clickFx !== 'none' && a.clickFx !== 'image' }),
  A('fxEmoji', 'string', 'click', '🎉 ✨ 💎 ⭐', { label: 'الإيموجي (افصل بمسافة)', when: a => a.clickFx === 'emoji' }),
  A('fxImage', 'image', 'click', '', { label: 'صورة الجزيئات (ID)', when: a => a.clickFx === 'image' }),
  A('fxText', 'string', 'click', '+1', { label: 'النص الطائر', when: a => a.clickFx === 'text' }),
  A('fxSize', 'number', 'click', 12, { label: 'حجم الجزيء', step: 1, min: 2, when: a => a.clickFx !== 'none' }),
  A('fxSpread', 'number', 'click', 320, { label: 'قوة الانتشار', step: 10, min: 0, when: a => a.clickFx !== 'none' && a.clickFx !== 'ripple' }),
  A('fxGravity', 'number', 'click', 700, { label: 'الجاذبية', step: 10, when: a => ['confetti', 'fireworks', 'explosion', 'pixels', 'stars', 'emoji', 'image', 'coins', 'money', 'diamonds'].includes(a.clickFx) }),
  A('fxLife', 'number', 'click', 1.1, { label: 'مدة البقاء (ث)', step: 0.1, min: 0.1, when: a => a.clickFx !== 'none' }),
  A('fxOrigin', 'enum', 'click', 'mouse', { label: 'مصدر التأثير', opts: ['mouse', 'center'], labels: ['مكان الضغط', 'منتصف العنصر'], when: a => a.clickFx !== 'none' }),
  A('clickMotion', 'enum', 'click', 'none', { label: 'حركة العنصر', opts: MOTIONS, labels: MOTIONS_AR }),
  A('clickSound', 'sound', 'click', '', { label: 'صوت النقر (ID)' }),
  A('clickCooldown', 'number', 'click', 0, { label: 'تهدئة بين النقرات (ث)', step: 0.05, min: 0 }),

  A('enterType', 'enum', 'enter', 'none', { label: 'أنميشن الظهور', opts: ENTERS, labels: ENTERS_AR }),
  A('enterTime', 'number', 'enter', 0.5, { label: 'مدة الظهور', step: 0.05, min: 0, when: a => a.enterType !== 'none' }),
  A('enterDelay', 'number', 'enter', 0, { label: 'تأخير البداية', step: 0.05, min: 0, when: a => a.enterType !== 'none' }),
  A('enterStyle', 'enum', 'enter', 'Back', { label: 'نمط الحركة', opts: EASING, when: a => !['none', 'typewriter', 'countUp', 'bounceIn', 'elasticIn'].includes(a.enterType) }),
  A('enterDir', 'enum', 'enter', 'Out', { label: 'الاتجاه', opts: EASEDIR, when: a => !['none', 'typewriter', 'countUp', 'bounceIn', 'elasticIn'].includes(a.enterType) }),
  A('exitType', 'enum', 'enter', 'auto', { label: 'أنميشن الإخفاء (عند الإغلاق)', opts: EXITS, labels: EXITS_AR }),
  A('exitTime', 'number', 'enter', 0.25, { label: 'مدة الإخفاء', step: 0.05, min: 0, when: a => a.exitType !== 'none' }),

  A('idleType', 'enum', 'idle', 'none', { label: 'النوع', opts: IDLES, labels: IDLES_AR }),
  A('idleSpeed', 'number', 'idle', 1, { label: 'السرعة', step: 0.1, min: 0, when: a => a.idleType !== 'none' }),
  A('idleAmount', 'number', 'idle', 1, { label: 'القوة', step: 0.1, min: 0, when: a => a.idleType !== 'none' }),
  A('idleColor', 'color', 'idle', '#ffd166', { label: 'اللون الثاني', when: a => a.idleType === 'colorPulse' }),

  A('actionType', 'enum', 'action', 'none', { label: 'الإجراء', opts: ACTIONS, labels: ACTIONS_AR }),
  A('actionTarget', 'target', 'action', '', { label: 'اسم العنصر المستهدف', when: a => TARGET_ACTIONS.includes(a.actionType) }),
  A('actionText', 'string', 'action', 'Clicks: {count}', { label: 'النص ({count} = عدد النقرات)', when: a => a.actionType === 'setText' || a.actionType === 'notify' }),
  A('remoteName', 'string', 'action', 'GuiEvent', { label: 'اسم RemoteEvent في ReplicatedStorage', when: a => a.actionType === 'remote' }),
  A('activeOn', 'bool', 'action', false, { label: 'تلوين الزر النشط', when: a => a.actionType === 'tab' }),
  A('activeColor', 'color', 'action', '#6c5ce7', { label: 'لون الزر النشط', when: a => a.actionType === 'tab' && a.activeOn }),
  A('activeDefault', 'bool', 'action', false, { label: 'نشط من البداية', when: a => a.actionType === 'tab' && a.activeOn }),
  A('switchOnColor', 'color', 'action', '#06d6a0', { label: 'لون التشغيل', when: a => a.actionType === 'toggleSwitch' }),
  A('switchOffColor', 'color', 'action', '#4a4d68', { label: 'لون الإيقاف', when: a => a.actionType === 'toggleSwitch' }),

  A('tooltip', 'string', 'extra', '', { label: 'تلميح عند المرور (Tooltip)' }),
  A('hotkey', 'string', 'extra', '', { label: 'اختصار لوحة مفاتيح (مثال: E أو M أو Tab)' }),
  A('draggable', 'bool', 'extra', false, { label: 'قابل للسحب داخل اللعبة' })
];
const ANIM_DEF = Object.fromEntries(ANIM.map(a => [a.k, a.def]));
const animOf = n => Object.assign({}, ANIM_DEF, n.anim || {});
const hasAnim = n => n.anim && Object.keys(n.anim).some(k => k in ANIM_DEF && JSON.stringify(n.anim[k]) !== JSON.stringify(ANIM_DEF[k]));

const ANIM_PRESETS = [
  { n: '✨ زر ناعم', a: { hoverOn: true, hoverScale: 1.06, pressOn: true, pressScale: 0.93 } },
  { n: '💧 تموج', a: { hoverOn: true, hoverScale: 1.04, pressOn: true, pressScale: 0.95, clickFx: 'ripple', fxColors: ['#ffffff'] } },
  { n: '🎊 احتفال', a: { pressOn: true, pressScale: 0.9, clickFx: 'confetti', fxCount: 40, clickMotion: 'bounce' } },
  { n: '💥 انفجار', a: { pressOn: true, clickFx: 'explosion', fxCount: 30, fxColors: ['#ff4800', '#ff9e00', '#ffd000', '#ffffff'], clickMotion: 'slam' } },
  { n: '◎ موجة', a: { hoverOn: true, clickFx: 'shockwave', fxColors: ['#00e5ff'], fxSize: 14 } },
  { n: '❤ قلوب', a: { clickFx: 'hearts', fxCount: 10, fxColors: ['#ff4d6d', '#ff8fa3', '#ffb3c1'], fxSize: 18, clickMotion: 'heartbeat' } },
  { n: '🎆 ألعاب نارية', a: { clickFx: 'fireworks', fxCount: 36, fxSpread: 380 } },
  { n: '🪙 عملات', a: { clickFx: 'coins', fxCount: 14, fxSize: 16, clickMotion: 'pop' } },
  { n: '🔥 نار', a: { clickFx: 'fire', fxCount: 26, fxColors: ['#ff4800', '#ff9e00', '#ffd000'] } },
  { n: '🌀 دوامة', a: { clickFx: 'spiral', fxCount: 30, fxColors: ['#7f5cff', '#00c6ff', '#ffffff'] } },
  { n: '🎵 موسيقى', a: { clickFx: 'music', fxCount: 8, fxColors: ['#ffffff', '#b388ff'], fxSize: 16 } },
  { n: '🔆 توهج', a: { hoverOn: true, hoverScale: 1.03, hoverStrokeOn: true, hoverStrokeColor: '#00e5ff', hoverStrokeThick: 3 } },
  { n: '🌟 لمعة', a: { hoverOn: true, hoverScale: 1.04, hoverShine: true } },
  { n: '🧱 زر 3D', a: { pressOn: true, pressScale: 1, pressSink: 5 } },
  { n: '⬆ رفع', a: { hoverOn: true, hoverScale: 1.02, hoverLift: 6 } },
  { n: '☀ تفتيح', a: { hoverOn: true, hoverScale: 1.03, hoverBrightOn: true, pressOn: true } },
  { n: '🫧 طفو', a: { idleType: 'float' } },
  { n: '💓 نبض', a: { idleType: 'heartbeat' } },
  { n: '🌈 قوس قزح', a: { idleType: 'rainbow' } },
  { n: '✨ لمعة متكررة', a: { idleType: 'shine' } },
  { n: '🪟 ظهور منبثق', a: { enterType: 'pop', enterTime: 0.45, exitType: 'shrink' } },
  { n: '🏀 ارتداد', a: { enterType: 'bounceIn', enterTime: 0.7 } },
  { n: '⬇ سقوط', a: { enterType: 'drop', enterTime: 0.7, enterStyle: 'Bounce' } },
  { n: '🎞 صعود ناعم', a: { enterType: 'riseUp', enterTime: 0.4, enterStyle: 'Quad', exitType: 'fade' } },
  { n: '⌨ آلة كاتبة', a: { enterType: 'typewriter', enterTime: 1.2 } },
  { n: '🔢 عدّاد', a: { enterType: 'countUp', enterTime: 1.2 } },
  { n: '🧹 مسح الكل', a: null }
];

/* ---------- إنشاء العناصر ---------- */
const clone = o => JSON.parse(JSON.stringify(o));
function defaultProps(cls) {
  const o = {};
  (SCHEMA[cls] || []).forEach(p => { o[p.k] = clone(p.def); });
  return o;
}
function mk(cls, name, props = {}, children = [], anim = null) {
  const n = { id: uid(), cls, name: name || cls, props: Object.assign(defaultProps(cls), clone(props)), children, open: true };
  if (CLASSES[cls].kind === 'gui') n.anim = anim ? clone(anim) : {};
  return n;
}
const corner = (o = 10) => mk('UICorner', 'UICorner', { CornerRadius: UD(0, o) });
const stroke = (c = '#ffffff', t = 1.5, tr = 0.7, mode = 'Border') => mk('UIStroke', 'UIStroke', { Color: c, Thickness: t, Transparency: tr, ApplyStrokeMode: mode });
const grad = (a, b, r = 90) => mk('UIGradient', 'UIGradient', { Color: [{ t: 0, c: a }, { t: 1, c: b }], Rotation: r });
const pad = (v = 10) => mk('UIPadding', 'UIPadding', { PaddingTop: UD(0, v), PaddingBottom: UD(0, v), PaddingLeft: UD(0, v), PaddingRight: UD(0, v) });
const lbl = (name, text, props = {}, ch = [], anim = null) => mk('TextLabel', name, Object.assign({ Text: text, BackgroundTransparency: 1, Size: U2(1, 0, 1, 0), TextColor3: '#ffffff' }, props), ch, anim);

const NEW_PRESETS = {
  Frame: () => mk('Frame', 'Frame', { Size: U2(0, 260, 0, 180), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundColor3: '#1f2133' }, [corner(14)]),
  ScrollingFrame: () => mk('ScrollingFrame', 'ScrollingFrame', { Size: U2(0, 280, 0, 300), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundColor3: '#1a1c2b', ClipsDescendants: true, ScrollBarImageColor3: '#8b7bff' }, [corner(12)]),
  CanvasGroup: () => mk('CanvasGroup', 'CanvasGroup', { Size: U2(0, 260, 0, 180), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundColor3: '#26283d' }, [corner(14)]),
  TextLabel: () => mk('TextLabel', 'TextLabel', { Size: U2(0, 220, 0, 50), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundTransparency: 1, Text: 'Hello Roblox!', TextSize: 26 }),
  TextButton: () => mk('TextButton', 'TextButton', { Size: U2(0, 200, 0, 56), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundColor3: '#6c5ce7', Text: 'Button', TextSize: 22 }, [corner(12)], { hoverOn: true, pressOn: true }),
  TextBox: () => mk('TextBox', 'TextBox', { Size: U2(0, 260, 0, 48), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundColor3: '#14151f', Text: '', TextSize: 18, Font: 'GothamMedium', TextXAlignment: 'Left' }, [corner(10), stroke('#8b7bff', 1.5, 0.4), mk('UIPadding', 'UIPadding', { PaddingLeft: UD(0, 14), PaddingRight: UD(0, 14), PaddingTop: UD(0, 0), PaddingBottom: UD(0, 0) })]),
  ImageLabel: () => mk('ImageLabel', 'ImageLabel', { Size: U2(0, 120, 0, 120), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundTransparency: 1, ScaleType: 'Fit' }),
  ImageButton: () => mk('ImageButton', 'ImageButton', { Size: U2(0, 90, 0, 90), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundColor3: '#2b2d42', ScaleType: 'Fit' }, [corner(16)], { hoverOn: true, pressOn: true })
};
function newNode(cls) {
  if (NEW_PRESETS[cls]) return NEW_PRESETS[cls]();
  return mk(cls, cls);
}
function newRoot() {
  return { id: uid(), cls: 'ScreenGui', name: 'MyGui', props: Object.assign(defaultProps('ScreenGui'), { ResetOnSpawn: false }), children: [], open: true };
}

/* ---------- القوالب الجاهزة ---------- */
const btnLabel = (t, size = 24, font = 'GothamBlack') => lbl('Label', t, { TextSize: size, Font: font });
const TEMPLATES = [
  {
    n: 'زر تدرج حديث', d: 'زر بتدرج وحدود وتموج', f: () => mk('TextButton', 'PlayButton',
      { Size: U2(0, 230, 0, 64), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundColor3: '#ffffff', Text: '' },
      [corner(16), grad('#7f5cff', '#00c6ff', 20), stroke('#ffffff', 2, 0.55), btnLabel('PLAY')],
      { hoverOn: true, hoverScale: 1.07, pressOn: true, pressScale: 0.93, clickFx: 'ripple', fxColors: ['#ffffff'], hoverStrokeOn: true, hoverStrokeThick: 3.5 })
  },
  {
    n: 'زر احتفال', d: 'طراطيع وارتداد عند الضغط', f: () => mk('TextButton', 'CelebrateButton',
      { Size: U2(0, 210, 0, 60), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundColor3: '#ffffff', Text: '' },
      [corner(30), grad('#ff5d8f', '#ffb347', 0), stroke('#ffffff', 2, 0.5), btnLabel('🎉 CLAIM')],
      { hoverOn: true, hoverScale: 1.05, pressOn: true, pressScale: 0.9, clickFx: 'confetti', fxCount: 45, clickMotion: 'bounce', idleType: 'heartbeat' })
  },
  {
    n: 'نافذة متجر', d: 'نافذة بعنوان وزر إغلاق وشبكة منتجات', f: () => {
      const card = (i, name, price, color) => mk('Frame', 'Item' + i, { BackgroundColor3: '#26283d', LayoutOrder: i },
        [corner(12), stroke(color, 1.5, 0.5),
        mk('ImageLabel', 'Icon', { Size: U2(0.6, 0, 0.45, 0), Position: U2(0.5, 0, 0.08, 0), AnchorPoint: V2(0.5, 0), BackgroundTransparency: 1, ScaleType: 'Fit' }),
        lbl('ItemName', name, { Size: U2(1, -12, 0, 22), Position: U2(0.5, 0, 0.58, 0), AnchorPoint: V2(0.5, 0), TextSize: 16, Font: 'GothamBold' }),
        mk('TextButton', 'BuyButton', { Size: U2(1, -20, 0, 30), Position: U2(0.5, 0, 1, -10), AnchorPoint: V2(0.5, 1), BackgroundColor3: color, Text: '💰 ' + price, TextSize: 15 }, [corner(8)],
          { hoverOn: true, hoverScale: 1.06, pressOn: true, clickFx: 'coins', fxCount: 10, fxSize: 14 })],
        { hoverOn: true, hoverScale: 1.04, hoverLift: 4 });
      return mk('Frame', 'ShopFrame', { Size: U2(0, 560, 0, 400), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundColor3: '#181926' }, [
        corner(18), stroke('#8b7bff', 2, 0.4),
        mk('Frame', 'TopBar', { Size: U2(1, 0, 0, 56), BackgroundColor3: '#ffffff' }, [corner(18), grad('#6c5ce7', '#a66cff', 0),
        lbl('Title', '🛒 SHOP', { Size: U2(1, -70, 1, 0), Position: U2(0, 20, 0, 0), TextXAlignment: 'Left', TextSize: 26, Font: 'GothamBlack' }),
        mk('TextButton', 'CloseButton', { Size: U2(0, 38, 0, 38), Position: U2(1, -12, 0.5, 0), AnchorPoint: V2(1, 0.5), BackgroundColor3: '#ff4d6d', Text: 'X', TextSize: 20, Font: 'GothamBlack' }, [corner(10)],
          { hoverOn: true, hoverRotate: 90, hoverScale: 1.1, pressOn: true, actionType: 'closeParent' })]),
        mk('ScrollingFrame', 'Items', { Size: U2(1, -30, 1, -80), Position: U2(0, 15, 0, 68), BackgroundTransparency: 1, ClipsDescendants: true, CanvasSize: U2(0, 0, 0, 0), AutomaticCanvasSize: 'Y', ScrollBarImageColor3: '#8b7bff', ScrollBarThickness: 5 }, [
          mk('UIGridLayout', 'UIGridLayout', { CellSize: U2(0, 120, 0, 150), CellPadding: U2(0, 12, 0, 12) }),
          card(1, 'Sword', '100', '#ff9f1c'), card(2, 'Shield', '250', '#2ec4b6'), card(3, 'Potion', '50', '#e71d36'), card(4, 'Crown', '999', '#ffd60a'),
          card(5, 'Pet', '400', '#9b5de5'), card(6, 'Wings', '750', '#4cc9f0')])
      ], { enterType: 'pop', enterTime: 0.45 });
      // ملاحظة: زر الإغلاق داخل TopBar لذلك "إغلاق الأب" يغلق TopBar — نغيره لاستهداف النافذة
    }
  },
  {
    n: 'إشعار منبثق', d: 'إشعار ينزلق مع أيقونة', f: () => mk('Frame', 'Notification', { Size: U2(0, 320, 0, 74), Position: U2(1, -20, 0, 20), AnchorPoint: V2(1, 0), BackgroundColor3: '#1d1f30' }, [
      corner(14), stroke('#06d6a0', 1.5, 0.3),
      mk('Frame', 'Accent', { Size: U2(0, 6, 1, -20), Position: U2(0, 10, 0.5, 0), AnchorPoint: V2(0, 0.5), BackgroundColor3: '#06d6a0' }, [corner(3)]),
      lbl('Icon', '✅', { Size: U2(0, 40, 0, 40), Position: U2(0, 26, 0.5, 0), AnchorPoint: V2(0, 0.5), TextSize: 28 }),
      lbl('Title', 'تم بنجاح!', { Size: U2(1, -90, 0, 24), Position: U2(0, 76, 0, 12), TextXAlignment: 'Left', TextSize: 18 }),
      lbl('Body', 'Item purchased successfully', { Size: U2(1, -90, 0, 20), Position: U2(0, 76, 0, 38), TextXAlignment: 'Left', TextSize: 14, Font: 'GothamMedium', TextColor3: '#b8bbd1' })
    ], { enterType: 'slideRight', enterTime: 0.5, hoverOn: true, hoverScale: 1.03 })
  },
  {
    n: 'شريط الصحة', d: 'شريط صحة بتدرج ونص', f: () => mk('Frame', 'HealthBar', { Size: U2(0, 300, 0, 34), Position: U2(0, 24, 1, -24), AnchorPoint: V2(0, 1), BackgroundColor3: '#14151f' }, [
      corner(17), stroke('#000000', 2, 0.3),
      mk('Frame', 'Fill', { Size: U2(0.72, 0, 1, 0), BackgroundColor3: '#ffffff' }, [corner(17), grad('#ff4d6d', '#ff9e00', 0)]),
      lbl('Amount', '❤ 72 / 100', { TextSize: 17, Font: 'GothamBlack', TextStrokeTransparency: 0.5, ZIndex: 2 })
    ])
  },
  {
    n: 'شاشة تحميل', d: 'خلفية كاملة مع دائرة تدور وشريط', f: () => mk('Frame', 'LoadingScreen', { Size: U2(1, 0, 1, 0), BackgroundColor3: '#0d0e17' }, [
      grad('#0d0e17', '#2a1b5e', 45),
      mk('ImageLabel', 'Spinner', { Size: U2(0, 90, 0, 90), Position: U2(0.5, 0, 0.42, 0), AnchorPoint: V2(0.5, 0.5), BackgroundTransparency: 1 }, [], { idleType: 'spin', idleSpeed: 3 }),
      lbl('Title', 'LOADING', { Size: U2(0, 400, 0, 50), Position: U2(0.5, 0, 0.56, 0), AnchorPoint: V2(0.5, 0.5), TextSize: 36, Font: 'GothamBlack' }, [], { idleType: 'breath' }),
      mk('Frame', 'Bar', { Size: U2(0, 360, 0, 12), Position: U2(0.5, 0, 0.64, 0), AnchorPoint: V2(0.5, 0.5), BackgroundColor3: '#1f2133' }, [corner(6),
      mk('Frame', 'Fill', { Size: U2(0.45, 0, 1, 0), BackgroundColor3: '#ffffff' }, [corner(6), grad('#7f5cff', '#00c6ff', 0)])])
    ], { enterType: 'fade' })
  },
  {
    n: 'القائمة الرئيسية', d: 'عنوان و3 أزرار مرتبة تلقائياً', f: () => {
      const b = (i, t, c1, c2) => mk('TextButton', t.replace(/\W/g, '') + 'Button', { Size: U2(0, 260, 0, 58), BackgroundColor3: '#ffffff', Text: '', LayoutOrder: i }, [corner(14), grad(c1, c2, 0), stroke('#ffffff', 2, 0.6), btnLabel(t, 22)],
        { hoverOn: true, hoverScale: 1.06, pressOn: true, clickFx: 'sparkles', fxCount: 16, enterType: 'pop', enterDelay: +(0.12 * i).toFixed(2), enterTime: 0.45 });
      return mk('Frame', 'MainMenu', { Size: U2(0, 340, 0, 380), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundTransparency: 1 }, [
        mk('UIListLayout', 'UIListLayout', { Padding: UD(0, 16), HorizontalAlignment: 'Center', VerticalAlignment: 'Center' }),
        lbl('GameTitle', 'MY GAME', { Size: U2(1, 0, 0, 80), TextSize: 54, Font: 'LuckiestGuy', LayoutOrder: 0, TextStrokeTransparency: 0 }, [], { idleType: 'breath' }),
        b(1, 'PLAY', '#06d6a0', '#1b9aaa'), b(2, 'SHOP', '#ffb703', '#fb8500'), b(3, 'SETTINGS', '#8b7bff', '#5a4bd1')
      ]);
    }
  },
  {
    n: 'لوحة إعدادات', d: 'إعدادات مع مفاتيح تشغيل', f: () => {
      const row = (i, t, on) => mk('Frame', 'Row' + i, { Size: U2(1, 0, 0, 52), BackgroundColor3: '#232538', LayoutOrder: i }, [corner(10),
      lbl('Label', t, { Size: U2(1, -90, 1, 0), Position: U2(0, 16, 0, 0), TextXAlignment: 'Left', TextSize: 17, Font: 'GothamMedium' }),
      mk('TextButton', 'Toggle', { Size: U2(0, 56, 0, 28), Position: U2(1, -14, 0.5, 0), AnchorPoint: V2(1, 0.5), BackgroundColor3: on ? '#06d6a0' : '#4a4d68', Text: '' }, [corner(14),
      mk('Frame', 'Knob', { Size: U2(0, 22, 0, 22), Position: on ? U2(1, -3, 0.5, 0) : U2(0, 3, 0.5, 0), AnchorPoint: on ? V2(1, 0.5) : V2(0, 0.5), BackgroundColor3: '#ffffff' }, [corner(11)])],
        { pressOn: true, pressScale: 0.9, actionType: 'toggleSwitch' })]);
      return mk('Frame', 'Settings', { Size: U2(0, 400, 0, 330), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundColor3: '#171826' }, [
        corner(16), stroke('#ffffff', 1, 0.85), pad(18),
        mk('UIListLayout', 'UIListLayout', { Padding: UD(0, 10), HorizontalAlignment: 'Center' }),
        lbl('Title', '⚙ SETTINGS', { Size: U2(1, 0, 0, 40), TextSize: 26, Font: 'GothamBlack', LayoutOrder: 0 }),
        row(1, '🎵 Music', true), row(2, '🔊 Sound Effects', true), row(3, '🌙 Low Graphics', false), row(4, '📳 Shake Camera', false)
      ], { enterType: 'zoom', enterTime: 0.4 });
    }
  },
  {
    n: 'عداد العملات', d: 'عداد عملات في الزاوية', f: () => mk('Frame', 'Coins', { Size: U2(0, 180, 0, 50), Position: U2(1, -20, 0, 20), AnchorPoint: V2(1, 0), BackgroundColor3: '#1d1f30' }, [
      corner(25), stroke('#ffd60a', 2, 0.3),
      lbl('Icon', '🪙', { Size: U2(0, 40, 0, 40), Position: U2(0, 6, 0.5, 0), AnchorPoint: V2(0, 0.5), TextSize: 28 }, [], { idleType: 'swing' }),
      lbl('Amount', '12,450', { Size: U2(1, -100, 1, 0), Position: U2(0, 50, 0, 0), TextXAlignment: 'Left', TextSize: 22, Font: 'GothamBlack', TextColor3: '#ffd60a' }),
      mk('TextButton', 'Add', { Size: U2(0, 36, 0, 36), Position: U2(1, -7, 0.5, 0), AnchorPoint: V2(1, 0.5), BackgroundColor3: '#06d6a0', Text: '+', TextSize: 26, Font: 'GothamBlack' }, [corner(18)],
        { hoverOn: true, hoverScale: 1.12, pressOn: true, clickFx: 'coins', fxCount: 12 })
    ])
  },
  {
    n: 'حقل إدخال أنيق', d: 'TextBox مع عنوان وحدود متوهجة', f: () => mk('Frame', 'InputField', { Size: U2(0, 320, 0, 84), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundTransparency: 1 }, [
      lbl('Caption', 'USERNAME', { Size: U2(1, 0, 0, 22), TextXAlignment: 'Left', TextSize: 14, TextColor3: '#9a9cab' }),
      mk('TextBox', 'Box', { Size: U2(1, 0, 0, 50), Position: U2(0, 0, 0, 30), BackgroundColor3: '#14151f', Text: '', TextSize: 18, Font: 'GothamMedium', TextXAlignment: 'Left', PlaceholderText: 'Type your name...' },
        [corner(12), stroke('#8b7bff', 1.5, 0.5), mk('UIPadding', 'UIPadding', { PaddingLeft: UD(0, 14), PaddingRight: UD(0, 14), PaddingTop: UD(0, 0), PaddingBottom: UD(0, 0) })],
        { hoverOn: true, hoverScale: 1.0, hoverStrokeOn: true, hoverStrokeColor: '#00e5ff', hoverStrokeThick: 2.5 })
    ])
  },
  {
    n: 'بطاقة ملف شخصي', d: 'صورة دائرية واسم ومستوى', f: () => mk('Frame', 'ProfileCard', { Size: U2(0, 300, 0, 110), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundColor3: '#ffffff' }, [
      corner(18), grad('#232538', '#3a2d7a', 30), stroke('#ffffff', 1, 0.8),
      mk('ImageLabel', 'Avatar', { Size: U2(0, 80, 0, 80), Position: U2(0, 15, 0.5, 0), AnchorPoint: V2(0, 0.5), BackgroundColor3: '#4a4d68', ScaleType: 'Crop' }, [mk('UICorner', 'UICorner', { CornerRadius: UD(1, 0) }), stroke('#ffd60a', 3, 0)]),
      lbl('PlayerName', 'Player123', { Size: U2(1, -120, 0, 30), Position: U2(0, 110, 0, 22), TextXAlignment: 'Left', TextSize: 22, Font: 'GothamBlack' }),
      lbl('Level', '⭐ Level 42', { Size: U2(1, -120, 0, 22), Position: U2(0, 110, 0, 56), TextXAlignment: 'Left', TextSize: 16, Font: 'GothamMedium', TextColor3: '#ffd60a' })
    ], { hoverOn: true, hoverScale: 1.03, hoverLift: 4, enterType: 'pop' })
  },
  {
    n: 'زر إغلاق X', d: 'زر دائري يدور عند المرور', f: () => mk('TextButton', 'CloseButton', { Size: U2(0, 44, 0, 44), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundColor3: '#ff4d6d', Text: '✕', TextSize: 22, Font: 'GothamBlack' },
      [mk('UICorner', 'UICorner', { CornerRadius: UD(1, 0) }), stroke('#ffffff', 2, 0.6)],
      { hoverOn: true, hoverRotate: 90, hoverScale: 1.12, pressOn: true, pressScale: 0.85, actionType: 'closeParent' })
  },
  {
    n: 'زر قلب ❤', d: 'زر لايك يطلع قلوب', f: () => mk('TextButton', 'LikeButton', { Size: U2(0, 70, 0, 70), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundColor3: '#2b1d2e', Text: '❤', TextSize: 34, TextColor3: '#ff4d6d' },
      [mk('UICorner', 'UICorner', { CornerRadius: UD(1, 0) }), stroke('#ff4d6d', 2, 0.3)],
      { hoverOn: true, hoverScale: 1.1, pressOn: true, pressScale: 0.85, clickFx: 'hearts', fxCount: 12, fxColors: ['#ff4d6d', '#ff8fa3', '#ffb3c1'], fxSize: 18, clickMotion: 'jelly' })
  },
  {
    n: 'تبويبات (Tabs)', d: 'شريط تبويبات أفقي', f: () => {
      const tab = (i, t, act) => mk('TextButton', 'Tab' + i, { Size: U2(0, 110, 1, -12), BackgroundColor3: act ? '#6c5ce7' : '#26283d', Text: t, TextSize: 16, LayoutOrder: i }, [corner(10)],
        { hoverOn: true, hoverScale: 1.05, pressOn: true, clickFx: 'ripple', fxColors: ['#ffffff'] });
      return mk('Frame', 'Tabs', { Size: U2(0, 380, 0, 56), Position: U2(0.5, 0, 0, 90), AnchorPoint: V2(0.5, 0), BackgroundColor3: '#171826' }, [
        corner(14), mk('UIListLayout', 'UIListLayout', { FillDirection: 'Horizontal', Padding: UD(0, 8), HorizontalAlignment: 'Center', VerticalAlignment: 'Center' }),
        tab(1, '🏠 Home', true), tab(2, '🎒 Items', false), tab(3, '🏆 Ranks', false)]);
    }
  }
];
// إصلاح: زر الإغلاق في نافذة المتجر يستهدف النافذة بالاسم
(function () {
  const f = TEMPLATES[2].f;
  TEMPLATES[2].f = () => {
    const n = f();
    const walk = x => { if (x.name === 'CloseButton') { x.anim.actionType = 'close'; x.anim.actionTarget = 'ShopFrame'; } (x.children || []).forEach(walk); };
    walk(n); return n;
  };
})();

/* ---------- قوالب إضافية ---------- */
const TPL_CATS = { all: 'الكل', buttons: '🔘 أزرار', windows: '🪟 نوافذ', hud: '📊 HUD', screens: '🎬 شاشات', interactive: '🕹 تفاعلي' };
['buttons', 'buttons', 'windows', 'hud', 'hud', 'screens', 'screens', 'windows', 'hud', 'interactive', 'windows', 'buttons', 'buttons', 'interactive'].forEach((c, i) => { if (TEMPLATES[i]) TEMPLATES[i].c = c; });
const gbtn = (name, text, c1, c2, size = U2(0, 200, 0, 56), anim = {}, extra = {}) => mk('TextButton', name, Object.assign({ Size: size, BackgroundColor3: '#ffffff', Text: '' }, extra),
  [corner(12), grad(c1, c2, 0), stroke('#ffffff', 2, 0.6), btnLabel(text, 20)], Object.assign({ hoverOn: true, hoverScale: 1.05, pressOn: true, pressScale: 0.93 }, anim));
const C = (x, y, ax = 0.5, ay = 0.5) => ({ Position: U2(x, 0, y, 0), AnchorPoint: V2(ax, ay) });
TEMPLATES.push(
  {
    n: 'زر نيون', d: 'حدود متوهجة وموجة عند الضغط', c: 'buttons', f: () => mk('TextButton', 'NeonButton', Object.assign({ Size: U2(0, 220, 0, 60), BackgroundColor3: '#0b0c14', BackgroundTransparency: 0.2, Text: 'NEON', TextColor3: '#00e5ff', TextSize: 26, Font: 'SciFi' }, C(0.5, 0.5)),
      [corner(12), stroke('#00e5ff', 2, 0), mk('UIStroke', 'TextGlow', { Color: '#00e5ff', Thickness: 1, Transparency: 0.5, ApplyStrokeMode: 'Contextual' })],
      { idleType: 'glow', hoverOn: true, hoverScale: 1.05, hoverTextOn: true, hoverTextColor: '#ffffff', pressOn: true, clickFx: 'shockwave', fxColors: ['#00e5ff'], fxSize: 14 })
  },
  {
    n: 'زر ثلاثي الأبعاد', d: 'ينضغط للأسفل مثل زر حقيقي', c: 'buttons', f: () => mk('Frame', 'Button3D', Object.assign({ Size: U2(0, 220, 0, 66), BackgroundTransparency: 1 }, C(0.5, 0.5)), [
      mk('Frame', 'Base', { Size: U2(1, 0, 1, -6), Position: U2(0, 0, 0, 6), BackgroundColor3: '#1b7a52' }, [corner(14)]),
      mk('TextButton', 'Top', { Size: U2(1, 0, 1, -6), BackgroundColor3: '#06d6a0', Text: 'START', TextSize: 26, Font: 'GothamBlack', TextStrokeTransparency: 0.6 }, [corner(14)],
        { pressOn: true, pressScale: 1, pressSink: 6, hoverOn: true, hoverScale: 1, hoverBrightOn: true, tweenTime: 0.08, clickFx: 'pixels', fxCount: 18, fxColors: ['#06d6a0', '#ffffff', '#1b7a52'] })])
  },
  {
    n: 'زر أيقونة + تلميح', d: 'زر دائري مع Tooltip', c: 'buttons', f: () => mk('TextButton', 'SettingsIcon', Object.assign({ Size: U2(0, 64, 0, 64), BackgroundColor3: '#26283d', Text: '⚙', TextSize: 32 }, C(0.5, 0.5)),
      [mk('UICorner', 'UICorner', { CornerRadius: UD(1, 0) }), stroke('#8b7bff', 2, 0.3)],
      { hoverOn: true, hoverScale: 1.12, hoverRotate: 45, hoverWiggle: true, pressOn: true, pressScale: 0.88, tooltip: 'الإعدادات', clickFx: 'ring', fxColors: ['#8b7bff'] })
  },
  {
    n: 'زر لمعة ذهبي', d: 'لمعة متكررة تمر على الزر', c: 'buttons', f: () => gbtn('GoldButton', '👑 VIP', '#ffd60a', '#ff9f1c', U2(0, 220, 0, 62), { idleType: 'shine', hoverShine: true, clickFx: 'diamonds', fxCount: 12 }, C(0.5, 0.5))
  },
  {
    n: 'نافذة تأكيد', d: 'سؤال مع نعم / لا', c: 'windows', f: () => mk('Frame', 'ConfirmDialog', Object.assign({ Size: U2(0, 380, 0, 210), BackgroundColor3: '#171826' }, C(0.5, 0.5)), [
      corner(18), stroke('#ffffff', 1, 0.85),
      lbl('Icon', '⚠', { Size: U2(0, 50, 0, 50), Position: U2(0.5, 0, 0, 14), AnchorPoint: V2(0.5, 0), TextSize: 40 }, [], { idleType: 'swing' }),
      lbl('Title', 'Are you sure?', { Size: U2(1, -40, 0, 30), Position: U2(0.5, 0, 0, 70), AnchorPoint: V2(0.5, 0), TextSize: 22, Font: 'GothamBlack' }),
      lbl('Message', 'This action cannot be undone.', { Size: U2(1, -40, 0, 22), Position: U2(0.5, 0, 0, 102), AnchorPoint: V2(0.5, 0), TextSize: 15, Font: 'GothamMedium', TextColor3: '#9a9cab' }),
      gbtn('YesButton', 'YES', '#06d6a0', '#1b9aaa', U2(0.5, -30, 0, 48), { actionType: 'close', actionTarget: 'ConfirmDialog', clickFx: 'confetti' }, { Position: U2(0, 20, 1, -18), AnchorPoint: V2(0, 1) }),
      gbtn('NoButton', 'NO', '#ff4d6d', '#c9184a', U2(0.5, -30, 0, 48), { actionType: 'close', actionTarget: 'ConfirmDialog' }, { Position: U2(1, -20, 1, -18), AnchorPoint: V2(1, 1) })
    ], { enterType: 'bounceIn', enterTime: 0.6, exitType: 'shrink' })
  },
  {
    n: 'المكافأة اليومية', d: '7 أيام وزر استلام', c: 'windows', f: () => {
      const day = i => mk('Frame', 'Day' + i, { BackgroundColor3: i === 7 ? '#ffffff' : '#26283d', LayoutOrder: i }, [corner(12), ...(i === 7 ? [grad('#ffd60a', '#ff9f1c', 45)] : []), stroke(i === 7 ? '#ffffff' : '#8b7bff', 1.5, 0.5),
      lbl('Day', 'Day ' + i, { Size: U2(1, 0, 0, 20), Position: U2(0, 0, 0, 6), TextSize: 13 }),
      lbl('Icon', i === 7 ? '🎁' : '🪙', { Size: U2(1, 0, 0, 34), Position: U2(0, 0, 0.5, 0), AnchorPoint: V2(0, 0.5), TextSize: 28 }),
      lbl('Amount', i === 7 ? 'MEGA' : (i * 50) + '', { Size: U2(1, 0, 0, 18), Position: U2(0, 0, 1, -6), AnchorPoint: V2(0, 1), TextSize: 13, TextColor3: '#ffd60a' })],
        i === 7 ? { idleType: 'heartbeat' } : { hoverOn: true, hoverScale: 1.06 });
      return mk('Frame', 'DailyReward', Object.assign({ Size: U2(0, 520, 0, 330), BackgroundColor3: '#171826' }, C(0.5, 0.5)), [
        corner(18), stroke('#ffd60a', 2, 0.4),
        lbl('Title', '🎁 DAILY REWARDS', { Size: U2(1, 0, 0, 50), Position: U2(0, 0, 0, 10), TextSize: 28, Font: 'GothamBlack' }),
        mk('Frame', 'Days', { Size: U2(1, -40, 0, 190), Position: U2(0, 20, 0, 64), BackgroundTransparency: 1 }, [
          mk('UIGridLayout', 'UIGridLayout', { CellSize: U2(0, 108, 0, 88), CellPadding: U2(0, 10, 0, 10) }),
          ...[1, 2, 3, 4, 5, 6, 7].map(day)]),
        gbtn('ClaimButton', 'CLAIM', '#ffd60a', '#ff9f1c', U2(0, 200, 0, 50), { clickFx: 'coins', fxCount: 20, clickMotion: 'tada', idleType: 'shine' }, { Position: U2(0.5, 0, 1, -16), AnchorPoint: V2(0.5, 1) })
      ], { enterType: 'pop', enterTime: 0.5 });
    }
  },
  {
    n: 'لوحة المتصدرين', d: 'قائمة ترتيب بميداليات', c: 'windows', f: () => {
      const names = ['Builderman', 'NoobMaster', 'ProGamer', 'StarKid', 'Ninja_X', 'CoolCat', 'Speedy'];
      const medal = ['🥇', '🥈', '🥉'];
      const row = (i) => mk('Frame', 'Rank' + (i + 1), { Size: U2(1, -8, 0, 44), BackgroundColor3: i < 3 ? ['#3a3010', '#2c2f38', '#3a2414'][i] : '#232538', LayoutOrder: i }, [corner(10),
      lbl('Rank', medal[i] || '#' + (i + 1), { Size: U2(0, 44, 1, 0), Position: U2(0, 6, 0, 0), TextSize: i < 3 ? 24 : 16 }),
      lbl('Name', names[i], { Size: U2(1, -170, 1, 0), Position: U2(0, 56, 0, 0), TextXAlignment: 'Left', TextSize: 16, Font: 'GothamMedium' }),
      lbl('Score', ((7 - i) * 1337).toLocaleString('en'), { Size: U2(0, 100, 1, 0), Position: U2(1, -12, 0, 0), AnchorPoint: V2(1, 0), TextXAlignment: 'Right', TextSize: 16, TextColor3: '#ffd60a' })],
        { enterType: 'riseUp', enterDelay: +(0.06 * i).toFixed(2), enterTime: 0.35, enterStyle: 'Quad' });
      return mk('Frame', 'Leaderboard', Object.assign({ Size: U2(0, 380, 0, 440), BackgroundColor3: '#171826' }, C(0.5, 0.5)), [
        corner(18), stroke('#8b7bff', 2, 0.4),
        lbl('Title', '🏆 LEADERBOARD', { Size: U2(1, 0, 0, 50), Position: U2(0, 0, 0, 8), TextSize: 26, Font: 'GothamBlack' }),
        mk('ScrollingFrame', 'List', { Size: U2(1, -24, 1, -76), Position: U2(0, 12, 0, 64), BackgroundTransparency: 1, ClipsDescendants: true, CanvasSize: U2(0, 0, 0, 0), AutomaticCanvasSize: 'Y', ScrollBarThickness: 4, ScrollBarImageColor3: '#8b7bff' }, [
          mk('UIListLayout', 'UIListLayout', { Padding: UD(0, 6) }), ...names.map((_, i) => row(i))])
      ]);
    }
  },
  {
    n: 'بطاقة Gamepass', d: 'بطاقة شراء بلمعة', c: 'windows', f: () => mk('Frame', 'GamepassCard', Object.assign({ Size: U2(0, 240, 0, 300), BackgroundColor3: '#ffffff' }, C(0.5, 0.5)), [
      corner(20), grad('#2b1d5c', '#120f24', 90), stroke('#ffd60a', 2, 0.2),
      lbl('Badge', 'BEST', { Size: U2(0, 64, 0, 24), Position: U2(1, -12, 0, 12), AnchorPoint: V2(1, 0), BackgroundTransparency: 0, BackgroundColor3: '#ff4d6d', TextSize: 13, Font: 'GothamBlack' }, [corner(12)], { idleType: 'pulse' }),
      lbl('Icon', '⚡', { Size: U2(0, 90, 0, 90), Position: U2(0.5, 0, 0, 40), AnchorPoint: V2(0.5, 0), TextSize: 70 }, [], { idleType: 'float' }),
      lbl('Name', '2X SPEED', { Size: U2(1, 0, 0, 30), Position: U2(0, 0, 0, 140), TextSize: 24, Font: 'GothamBlack' }),
      lbl('Desc', 'Run twice as fast forever!', { Size: U2(1, -20, 0, 20), Position: U2(0, 10, 0, 172), TextSize: 13, Font: 'GothamMedium', TextColor3: '#b8bbd1' }),
      gbtn('BuyButton', '⏣ 199', '#06d6a0', '#1b9aaa', U2(1, -40, 0, 50), { clickFx: 'sparkles', fxCount: 20, fxColors: ['#ffd60a', '#ffffff'], idleType: 'shine' }, { Position: U2(0.5, 0, 1, -18), AnchorPoint: V2(0.5, 1) })
    ], { hoverOn: true, hoverScale: 1.03, hoverLift: 6, enterType: 'riseUp', enterStyle: 'Back' })
  },
  {
    n: 'شريط الأدوات Hotbar', d: '6 خانات أسفل الشاشة', c: 'hud', f: () => {
      const items = ['⚔', '🛡', '🏹', '🧪', '🍖', '🔦'];
      return mk('Frame', 'Hotbar', { Size: U2(0, 440, 0, 76), Position: U2(0.5, 0, 1, -16), AnchorPoint: V2(0.5, 1), BackgroundColor3: '#0d0e17', BackgroundTransparency: 0.35 }, [
        corner(16), pad(8), mk('UIListLayout', 'UIListLayout', { FillDirection: 'Horizontal', Padding: UD(0, 8), HorizontalAlignment: 'Center', VerticalAlignment: 'Center' }),
        ...items.map((e, i) => mk('TextButton', 'Slot' + (i + 1), { Size: U2(0, 60, 0, 60), BackgroundColor3: i === 0 ? '#3b2f7a' : '#1d1f30', Text: e, TextSize: 30, LayoutOrder: i }, [corner(12), stroke(i === 0 ? '#ffd60a' : '#ffffff', 2, i === 0 ? 0 : 0.8),
        lbl('Key', String(i + 1), { Size: U2(0, 16, 0, 16), Position: U2(0, 4, 0, 2), TextSize: 12, TextXAlignment: 'Left', TextColor3: '#b8bbd1' })],
          { hoverOn: true, hoverScale: 1.1, hoverStrokeOn: true, hoverStrokeColor: '#ffd60a', hoverStrokeThick: 2, pressOn: true, hotkey: ['One', 'Two', 'Three', 'Four', 'Five', 'Six'][i], clickMotion: 'pop' }))
      ]);
    }
  },
  {
    n: 'شريط المستوى XP', d: 'دائرة مستوى + شريط خبرة', c: 'hud', f: () => mk('Frame', 'XPBar', { Size: U2(0, 380, 0, 54), Position: U2(0.5, 0, 0, 14), AnchorPoint: V2(0.5, 0), BackgroundTransparency: 1 }, [
      mk('Frame', 'Track', { Size: U2(1, -40, 0, 20), Position: U2(0, 40, 0.5, 0), AnchorPoint: V2(0, 0.5), BackgroundColor3: '#14151f' }, [corner(10), stroke('#000000', 2, 0.4),
      mk('Frame', 'Fill', { Size: U2(0.62, 0, 1, 0), BackgroundColor3: '#ffffff' }, [corner(10), grad('#7f5cff', '#00c6ff', 0)], { idleType: 'gradientFlow' }),
      lbl('XP', '620 / 1000 XP', { TextSize: 13, Font: 'GothamBlack', TextStrokeTransparency: 0.4, ZIndex: 2 })]),
      mk('Frame', 'Level', { Size: U2(0, 54, 0, 54), BackgroundColor3: '#ffffff' }, [mk('UICorner', 'UICorner', { CornerRadius: UD(1, 0) }), grad('#ffd60a', '#ff9f1c', 45), stroke('#ffffff', 3, 0),
      lbl('Num', '12', { TextSize: 24, Font: 'GothamBlack', TextStrokeTransparency: 0.5 })], { idleType: 'breath' })
    ])
  },
  {
    n: 'مؤقت', d: 'عداد وقت بنبض', c: 'hud', f: () => mk('Frame', 'Timer', { Size: U2(0, 160, 0, 54), Position: U2(0.5, 0, 0, 80), AnchorPoint: V2(0.5, 0), BackgroundColor3: '#1d1f30' }, [
      corner(27), stroke('#ff4d6d', 2, 0.3),
      lbl('Icon', '⏱', { Size: U2(0, 40, 0, 40), Position: U2(0, 8, 0.5, 0), AnchorPoint: V2(0, 0.5), TextSize: 26 }, [], { idleType: 'swing' }),
      lbl('Time', '02:30', { Size: U2(1, -56, 1, 0), Position: U2(0, 50, 0, 0), TextSize: 28, Font: 'GothamBlack', TextXAlignment: 'Left' })
    ], { idleType: 'heartbeat', idleSpeed: 0.8 })
  },
  {
    n: 'متتبع المهام', d: 'لوحة Quests جانبية', c: 'hud', f: () => {
      const q = (i, t, done) => lbl('Quest' + i, (done ? '✅ ' : '⬜ ') + t, { Size: U2(1, 0, 0, 26), TextXAlignment: 'Left', TextSize: 15, Font: 'GothamMedium', TextColor3: done ? '#7dffb0' : '#ffffff', LayoutOrder: i }, [], { enterType: 'slideRight', enterDelay: 0.1 * i, enterTime: 0.4, enterStyle: 'Quad' });
      return mk('Frame', 'Quests', { Size: U2(0, 260, 0, 150), Position: U2(1, -16, 0.35, 0), AnchorPoint: V2(1, 0), BackgroundColor3: '#0d0e17', BackgroundTransparency: 0.3 }, [
        corner(14), pad(12), mk('UIListLayout', 'UIListLayout', { Padding: UD(0, 6), HorizontalAlignment: 'Left' }),
        lbl('Title', '📜 QUESTS', { Size: U2(1, 0, 0, 26), TextXAlignment: 'Left', TextSize: 18, Font: 'GothamBlack', TextColor3: '#ffd60a', LayoutOrder: 0 }),
        q(1, 'Collect 10 coins', true), q(2, 'Defeat the boss', false), q(3, 'Find the secret door', false)]);
    }
  },
  {
    n: 'قائمة جانبية', d: 'أزرار أيقونات عمودية مع تلميحات', c: 'hud', f: () => {
      const it = [['🏠', 'Home', '#6c5ce7'], ['🛒', 'Shop', '#ff9f1c'], ['🎒', 'Inventory', '#06d6a0'], ['🏆', 'Ranks', '#ffd60a'], ['⚙', 'Settings', '#8d90ab']];
      return mk('Frame', 'SideMenu', { Size: U2(0, 76, 0, 360), Position: U2(0, 16, 0.5, 0), AnchorPoint: V2(0, 0.5), BackgroundColor3: '#0d0e17', BackgroundTransparency: 0.3 }, [
        corner(20), mk('UIListLayout', 'UIListLayout', { Padding: UD(0, 10), HorizontalAlignment: 'Center', VerticalAlignment: 'Center' }),
        ...it.map(([e, t, c], i) => mk('TextButton', t + 'Button', { Size: U2(0, 56, 0, 56), BackgroundColor3: '#1d1f30', Text: e, TextSize: 28, LayoutOrder: i }, [corner(16), stroke(c, 2, 0.4)],
          { hoverOn: true, hoverScale: 1.12, hoverColorOn: true, hoverColor: c, pressOn: true, tooltip: t, clickMotion: 'pop', enterType: 'pop', enterDelay: +(0.07 * i).toFixed(2) }))
      ]);
    }
  },
  {
    n: 'إعلان علوي', d: 'شريط بتدرج متحرك', c: 'hud', f: () => mk('Frame', 'Banner', { Size: U2(0, 460, 0, 44), Position: U2(0.5, 0, 0, 14), AnchorPoint: V2(0.5, 0), BackgroundColor3: '#ffffff' }, [
      corner(22), mk('UIGradient', 'UIGradient', { Color: [{ t: 0, c: '#ff5d8f' }, { t: 0.5, c: '#7f5cff' }, { t: 1, c: '#ff5d8f' }] }),
      lbl('Text', '🎉 DOUBLE XP WEEKEND! 🎉', { TextSize: 18, Font: 'GothamBlack', TextStrokeTransparency: 0.6 }, [], { idleType: 'breath' })
    ], { idleType: 'gradientFlow', enterType: 'fadeDown' })
  },
  {
    n: 'نافذة مكافأة', d: '+100 تظهر وتطفو', c: 'hud', f: () => mk('Frame', 'RewardPopup', Object.assign({ Size: U2(0, 260, 0, 120), BackgroundColor3: '#ffffff' }, C(0.5, 0.4)), [
      corner(20), grad('#ffd60a', '#ff9f1c', 45), stroke('#ffffff', 3, 0),
      lbl('Amount', '+100', { Size: U2(1, 0, 0, 60), Position: U2(0, 0, 0, 14), TextSize: 54, Font: 'LuckiestGuy', TextStrokeTransparency: 0 }, [], { enterType: 'countUp', enterTime: 1, enterDelay: 0.3 }),
      lbl('Label', '💰 COINS', { Size: U2(1, 0, 0, 30), Position: U2(0, 0, 0, 76), TextSize: 22, Font: 'GothamBlack', TextColor3: '#5a3a00' })
    ], { enterType: 'elasticIn', enterTime: 0.9, idleType: 'float', exitType: 'slideTop' })
  },
  {
    n: 'شاشة الفوز', d: 'نجوم وعداد جوائز', c: 'screens', f: () => {
      const star = (i) => lbl('Star' + i, '⭐', { Size: U2(0, i === 2 ? 90 : 70, 0, i === 2 ? 90 : 70), Position: U2(0.5, (i - 2) * 95, 0, i === 2 ? 70 : 90), AnchorPoint: V2(0.5, 0), TextSize: i === 2 ? 76 : 58 }, [],
        { enterType: 'bounceIn', enterDelay: +(0.4 + 0.25 * (i - 1)).toFixed(2), enterTime: 0.6, idleType: 'pulse' });
      return mk('Frame', 'VictoryScreen', { Size: U2(1, 0, 1, 0), BackgroundColor3: '#000000', BackgroundTransparency: 0.35 }, [
        mk('Frame', 'Panel', Object.assign({ Size: U2(0, 440, 0, 400), BackgroundColor3: '#171826' }, C(0.5, 0.5)), [
          corner(24), stroke('#ffd60a', 3, 0.2),
          lbl('Title', 'VICTORY!', { Size: U2(1, 0, 0, 70), Position: U2(0, 0, 0, 0), TextSize: 58, Font: 'LuckiestGuy', TextColor3: '#ffd60a', TextStrokeTransparency: 0 }, [], { enterType: 'drop', enterTime: 0.7, enterStyle: 'Bounce' }),
          star(1), star(2), star(3),
          lbl('Reward', '2500', { Size: U2(1, 0, 0, 50), Position: U2(0, 0, 0, 190), TextSize: 44, Font: 'GothamBlack' }, [], { enterType: 'countUp', enterDelay: 1.1, enterTime: 1.2 }),
          lbl('RewardLabel', '💰 COINS EARNED', { Size: U2(1, 0, 0, 24), Position: U2(0, 0, 0, 240), TextSize: 16, TextColor3: '#b8bbd1' }),
          gbtn('ContinueButton', 'CONTINUE', '#06d6a0', '#1b9aaa', U2(0, 240, 0, 56), { clickFx: 'confetti', fxCount: 60, actionType: 'close', actionTarget: 'VictoryScreen', idleType: 'shine' }, { Position: U2(0.5, 0, 1, -24), AnchorPoint: V2(0.5, 1) })
        ], { enterType: 'pop', enterTime: 0.5 })
      ], { enterType: 'fade', enterTime: 0.4, exitType: 'fade' });
    }
  },
  {
    n: 'شاشة الخسارة', d: 'Game Over مع إعادة', c: 'screens', f: () => mk('Frame', 'GameOver', { Size: U2(1, 0, 1, 0), BackgroundColor3: '#3a0010', BackgroundTransparency: 0.25 }, [
      lbl('Title', 'GAME OVER', Object.assign({ Size: U2(0, 600, 0, 100), TextSize: 80, Font: 'Creepster', TextColor3: '#ff4d6d', TextStrokeTransparency: 0 }, C(0.5, 0.4)), [], { enterType: 'zoom', enterTime: 0.6, idleType: 'shake', idleAmount: 0.6 }),
      lbl('Sub', 'You were defeated...', Object.assign({ Size: U2(0, 400, 0, 30), TextSize: 20, Font: 'GothamMedium', TextColor3: '#ffb3c1' }, C(0.5, 0.52)), [], { enterType: 'typewriter', enterDelay: 0.6, enterTime: 1 }),
      gbtn('RetryButton', '↻ RETRY', '#ff4d6d', '#c9184a', U2(0, 220, 0, 56), { clickMotion: 'rubber', actionType: 'close', actionTarget: 'GameOver', enterType: 'riseUp', enterDelay: 1.4 }, C(0.5, 0.65))
    ], { enterType: 'fade', enterTime: 0.6 })
  },
  {
    n: 'حوار NPC', d: 'صندوق كلام مع اختيارات', c: 'screens', f: () => mk('Frame', 'Dialog', { Size: U2(0, 640, 0, 170), Position: U2(0.5, 0, 1, -20), AnchorPoint: V2(0.5, 1), BackgroundColor3: '#14151f', BackgroundTransparency: 0.1 }, [
      corner(18), stroke('#ffffff', 1.5, 0.7),
      mk('ImageLabel', 'Avatar', { Size: U2(0, 110, 0, 110), Position: U2(0, 20, 0.5, 0), AnchorPoint: V2(0, 0.5), BackgroundColor3: '#26283d', ScaleType: 'Crop' }, [corner(14), stroke('#ffd60a', 2, 0)]),
      lbl('Name', '🧙 Old Wizard', { Size: U2(1, -160, 0, 26), Position: U2(0, 146, 0, 16), TextXAlignment: 'Left', TextSize: 18, Font: 'GothamBlack', TextColor3: '#ffd60a' }),
      lbl('Text', 'Greetings, traveler! The dragon awaits beyond the mountains. Will you help us?', { Size: U2(1, -166, 0, 60), Position: U2(0, 146, 0, 44), TextXAlignment: 'Left', TextYAlignment: 'Top', TextWrapped: true, TextSize: 16, Font: 'GothamMedium' }, [], { enterType: 'typewriter', enterTime: 2, enterDelay: 0.3 }),
      gbtn('AcceptButton', '✔ Accept', '#06d6a0', '#1b9aaa', U2(0, 130, 0, 38), { actionType: 'close', actionTarget: 'Dialog', clickFx: 'stars', fxCount: 12 }, { Position: U2(1, -160, 1, -14), AnchorPoint: V2(1, 1) }),
      gbtn('DeclineButton', '✖ Later', '#4a4d68', '#2b2d42', U2(0, 130, 0, 38), { actionType: 'close', actionTarget: 'Dialog' }, { Position: U2(1, -16, 1, -14), AnchorPoint: V2(1, 1) })
    ], { enterType: 'riseUp', enterTime: 0.45, enterStyle: 'Back', exitType: 'slideBottom' })
  },
  {
    n: 'إدخال كود', d: 'Redeem code مع رسالة', c: 'interactive', f: () => mk('Frame', 'CodesFrame', Object.assign({ Size: U2(0, 360, 0, 230), BackgroundColor3: '#171826' }, C(0.5, 0.5)), [
      corner(18), stroke('#8b7bff', 2, 0.4),
      lbl('Title', '🎟 CODES', { Size: U2(1, 0, 0, 44), Position: U2(0, 0, 0, 12), TextSize: 26, Font: 'GothamBlack' }),
      mk('TextBox', 'CodeBox', { Size: U2(1, -40, 0, 48), Position: U2(0.5, 0, 0, 66), AnchorPoint: V2(0.5, 0), BackgroundColor3: '#0d0e17', Text: '', PlaceholderText: 'Enter code...', TextSize: 18, Font: 'GothamMedium' }, [corner(12), stroke('#8b7bff', 1.5, 0.5)],
        { hoverOn: true, hoverScale: 1, hoverStrokeOn: true, hoverStrokeColor: '#00e5ff', hoverStrokeThick: 2.5 }),
      gbtn('RedeemButton', 'REDEEM', '#7f5cff', '#00c6ff', U2(1, -40, 0, 48), { actionType: 'setText', actionTarget: 'Status', actionText: '✅ Code redeemed! (x{count})', clickFx: 'sparkles' }, { Position: U2(0.5, 0, 0, 126), AnchorPoint: V2(0.5, 0) }),
      lbl('Status', '', { Size: U2(1, -40, 0, 24), Position: U2(0.5, 0, 1, -16), AnchorPoint: V2(0.5, 1), TextSize: 15, Font: 'GothamMedium', TextColor3: '#7dffb0' })
    ], { enterType: 'pop' })
  },
  {
    n: 'مفتاح تشغيل', d: 'Toggle يتحرك ويتلون فعلياً', c: 'interactive', f: () => mk('Frame', 'ToggleRow', Object.assign({ Size: U2(0, 300, 0, 60), BackgroundColor3: '#1d1f30' }, C(0.5, 0.5)), [
      corner(14),
      lbl('Label', '🎵 Music', { Size: U2(1, -100, 1, 0), Position: U2(0, 18, 0, 0), TextXAlignment: 'Left', TextSize: 18, Font: 'GothamBold' }),
      mk('TextButton', 'Switch', { Size: U2(0, 64, 0, 32), Position: U2(1, -16, 0.5, 0), AnchorPoint: V2(1, 0.5), BackgroundColor3: '#4a4d68', Text: '' }, [mk('UICorner', 'UICorner', { CornerRadius: UD(1, 0) }),
      mk('Frame', 'Knob', { Size: U2(0, 26, 0, 26), Position: U2(0, 3, 0.5, 0), AnchorPoint: V2(0, 0.5), BackgroundColor3: '#ffffff' }, [mk('UICorner', 'UICorner', { CornerRadius: UD(1, 0) })])],
        { actionType: 'toggleSwitch', pressOn: true, pressScale: 0.94 })
    ])
  },
  {
    n: 'تبويبات تعمل', d: 'أزرار تبدّل بين الصفحات', c: 'interactive', f: () => {
      const tab = (i, t) => mk('TextButton', 'Tab' + i, { Size: U2(0, 120, 1, 0), BackgroundColor3: '#26283d', Text: t, TextSize: 16, LayoutOrder: i }, [corner(10)],
        { actionType: 'tab', actionTarget: 'Page' + i, activeOn: true, activeColor: '#6c5ce7', activeDefault: i === 1, hoverOn: true, hoverScale: 1.04, pressOn: true });
      const page = (i, e, t, vis) => mk('Frame', 'Page' + i, { Size: U2(1, 0, 1, 0), BackgroundTransparency: 1, Visible: vis }, [
        lbl('Icon', e, Object.assign({ Size: U2(0, 80, 0, 80), TextSize: 64 }, C(0.5, 0.4)), [], { idleType: 'float' }),
        lbl('Text', t, Object.assign({ Size: U2(1, 0, 0, 30), TextSize: 22, Font: 'GothamBlack' }, C(0.5, 0.75)))], { enterType: 'riseUp', enterTime: 0.3, enterStyle: 'Quad', exitType: 'none' });
      return mk('Frame', 'TabbedWindow', Object.assign({ Size: U2(0, 420, 0, 320), BackgroundColor3: '#171826' }, C(0.5, 0.5)), [
        corner(18), stroke('#ffffff', 1, 0.85),
        mk('Frame', 'TabBar', { Size: U2(1, -24, 0, 44), Position: U2(0, 12, 0, 12), BackgroundTransparency: 1 }, [
          mk('UIListLayout', 'UIListLayout', { FillDirection: 'Horizontal', Padding: UD(0, 8), HorizontalAlignment: 'Center' }),
          tab(1, '🏠 Home'), tab(2, '🎒 Items'), tab(3, '🏆 Ranks')]),
        mk('Frame', 'Pages', { Size: U2(1, -24, 1, -80), Position: U2(0, 12, 0, 68), BackgroundColor3: '#1d1f30' }, [corner(14),
        page(1, '🏠', 'Welcome Home!', true), page(2, '🎒', 'Your Items', false), page(3, '🏆', 'Top Players', false)])
      ]);
    }
  },
  {
    n: 'صفحات بأسهم', d: 'UIPageLayout مع تالي/سابق', c: 'interactive', f: () => {
      const page = (i, e, c) => mk('Frame', 'Page' + i, { Size: U2(1, 0, 1, 0), BackgroundColor3: c, LayoutOrder: i }, [corner(14), lbl('Icon', e, { TextSize: 80 }, [], { idleType: 'breath' })]);
      return mk('Frame', 'Carousel', Object.assign({ Size: U2(0, 420, 0, 280), BackgroundColor3: '#171826' }, C(0.5, 0.5)), [
        corner(18),
        mk('Frame', 'Pages', { Size: U2(1, -120, 1, -40), Position: U2(0.5, 0, 0.5, 0), AnchorPoint: V2(0.5, 0.5), BackgroundTransparency: 1, ClipsDescendants: true }, [
          mk('UIPageLayout', 'UIPageLayout', { Circular: true, EasingStyle: 'Back', TweenTime: 0.45, Padding: UD(0, 12) }),
          page(1, '🐉', '#3a2d7a'), page(2, '🦄', '#1b5e5a'), page(3, '🦊', '#7a3a1b')]),
        mk('TextButton', 'Prev', { Size: U2(0, 44, 0, 44), Position: U2(0, 12, 0.5, 0), AnchorPoint: V2(0, 0.5), BackgroundColor3: '#26283d', Text: '◀', TextSize: 20 }, [mk('UICorner', 'UICorner', { CornerRadius: UD(1, 0) })],
          { actionType: 'pagePrev', actionTarget: 'Pages', hoverOn: true, hoverScale: 1.1, pressOn: true, hotkey: 'Left' }),
        mk('TextButton', 'Next', { Size: U2(0, 44, 0, 44), Position: U2(1, -12, 0.5, 0), AnchorPoint: V2(1, 0.5), BackgroundColor3: '#26283d', Text: '▶', TextSize: 20 }, [mk('UICorner', 'UICorner', { CornerRadius: UD(1, 0) })],
          { actionType: 'pageNext', actionTarget: 'Pages', hoverOn: true, hoverScale: 1.1, pressOn: true, hotkey: 'Right' })
      ]);
    }
  },
  {
    n: 'عداد النقرات', d: 'كل نقرة تزيد العداد +1', c: 'interactive', f: () => mk('Frame', 'Clicker', Object.assign({ Size: U2(0, 300, 0, 300), BackgroundTransparency: 1 }, C(0.5, 0.5)), [
      lbl('Counter', 'Clicks: 0', { Size: U2(1, 0, 0, 40), TextSize: 30, Font: 'GothamBlack', TextStrokeTransparency: 0.4 }),
      mk('TextButton', 'BigButton', { Size: U2(0, 200, 0, 200), Position: U2(0.5, 0, 0, 70), AnchorPoint: V2(0.5, 0), BackgroundColor3: '#ffffff', Text: '🍪', TextSize: 110 }, [mk('UICorner', 'UICorner', { CornerRadius: UD(1, 0) }), grad('#ffb347', '#ff7b00', 45), stroke('#ffffff', 4, 0.4)],
        { actionType: 'setText', actionTarget: 'Counter', actionText: 'Clicks: {count}', clickFx: 'text', fxText: '+1', fxColors: ['#ffd60a', '#ffffff'], clickMotion: 'jelly', hoverOn: true, hoverScale: 1.05, hotkey: 'Space', idleType: 'breath' })
    ])
  },
  {
    n: 'زر قائمة منسدلة', d: 'زر يفتح ويغلق قائمة', c: 'interactive', f: () => mk('Frame', 'Dropdown', Object.assign({ Size: U2(0, 220, 0, 230), BackgroundTransparency: 1 }, C(0.5, 0.4, 0.5, 0)), [
      mk('TextButton', 'Header', { Size: U2(1, 0, 0, 46), BackgroundColor3: '#26283d', Text: '☰  Menu  ▾', TextSize: 17 }, [corner(10), stroke('#8b7bff', 1.5, 0.5)],
        { actionType: 'toggle', actionTarget: 'Options', hoverOn: true, hoverBrightOn: true, hoverScale: 1.02, pressOn: true }),
      mk('Frame', 'Options', { Size: U2(1, 0, 0, 170), Position: U2(0, 0, 0, 54), BackgroundColor3: '#1d1f30', Visible: false }, [corner(10), pad(8),
      mk('UIListLayout', 'UIListLayout', { Padding: UD(0, 6) }),
      ...['🎮 Play', '🛒 Shop', '⚙ Settings'].map((t, i) => mk('TextButton', 'Option' + (i + 1), { Size: U2(1, 0, 0, 44), BackgroundColor3: '#26283d', Text: t, TextSize: 16, TextXAlignment: 'Left', LayoutOrder: i },
        [corner(8), mk('UIPadding', 'UIPadding', { PaddingLeft: UD(0, 12), PaddingRight: UD(0, 0), PaddingTop: UD(0, 0), PaddingBottom: UD(0, 0) })],
        { hoverOn: true, hoverScale: 1, hoverColorOn: true, hoverColor: '#6c5ce7', clickFx: 'ripple', fxColors: ['#ffffff'] }))],
        { enterType: 'fadeDown', enterTime: 0.25, enterStyle: 'Quad', exitType: 'fade', exitTime: 0.15 })
    ])
  }
);
