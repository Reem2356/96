import { GRID_SIZE, TOTAL_TILES } from "./mosaicGrid";

export interface TileTargetColor {
  r: number;
  g: number;
  b: number;
  /** إضاءة نسبية 0 (داكن جدًا) إلى 1 (فاتح جدًا) — تُستخدم لتلوين القطعة */
  luminance: number;
}

/**
 * ==========================================================================
 * ⭐ ضع هنا الصورة المرجعية الرسمية والمصرَّح باستخدامها لخادم الحرمين
 *    الشريفين الملك سلمان بن عبدالعزيز آل سعود.
 *
 *    1) ضع ملف الصورة في: public/reference/king-salman.webp
 *       (jpg أو png أو webp، يُفضّل مقاس مربّع أو قريب منه، دقة 1000×1000 فأعلى)
 *    2) لا حاجة لتغيير أي كود آخر — سيتم تحميلها تلقائيًا من المسار أدناه.
 *    3) إن لم يوجد الملف بعد، سيستخدم الموقع نمطًا بديلاً تجريبيًا فقط
 *       (انظر buildPlaceholderTargetColors) حتى لا يتعطل التطوير أو العرض.
 *
 *    ملاحظة تقنية: نبني المسار عبر import.meta.env.BASE_URL بدل مسار
 *    مطلق ثابت "/reference/..."، لأن الموقع منشور تحت مسار فرعي
 *    (/96/) على GitHub Pages — مسار ثابت كان سيتجاهل هذا المسار الفرعي
 *    ويحاول التحميل من جذر النطاق فيفشل بصمت.
 * ==========================================================================
 */
export const REFERENCE_IMAGE_PATH = `${import.meta.env.BASE_URL}reference/king-salman.webp`;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** يحوّل الصورة المرجعية إلى متوسط لون لكل خلية في شبكة الفسيفساء */
async function computeTargetColorsFromImage(img: HTMLImageElement): Promise<TileTargetColor[]> {
  const canvas = document.createElement("canvas");
  canvas.width = GRID_SIZE;
  canvas.height = GRID_SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("تعذر إنشاء سياق الرسم");

  // نرسم الصورة مصغّرة إلى حجم الشبكة تمامًا، فيقوم المتصفح بحساب متوسط
  // كل خلية (Downsampling) تلقائيًا — طريقة بسيطة وسريعة لتلخيص الصورة.
  const size = Math.min(img.width, img.height);
  const sx = (img.width - size) / 2;
  const sy = (img.height - size) / 2;
  ctx.drawImage(img, sx, sy, size, size, 0, 0, GRID_SIZE, GRID_SIZE);

  const { data } = ctx.getImageData(0, 0, GRID_SIZE, GRID_SIZE);
  const rawLuminance: number[] = [];
  const colors: TileTargetColor[] = [];
  for (let i = 0; i < TOTAL_TILES; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    rawLuminance.push((0.299 * r + 0.587 * g + 0.114 * b) / 255);
    colors.push({ r, g, b, luminance: 0 });
  }

  // تمديد التباين (Contrast Stretch): معظم الصور الفوتوغرافية لا تغطي كامل
  // مدى الإضاءة من 0 إلى 1، فتتكدس كل القطع في منتصف تدرّج الألوان وتبدو
  // اللوحة باهتة وغير واضحة عند اكتمالها. هنا نعيد توزيع الإضاءة الفعلية
  // (من أغمق نقطة إلى أفتح نقطة في الصورة) لتغطي كامل المدى، فتصبح الفروق
  // بين الوجه والخلفية والملابس أوضح بكثير في اللوحة النهائية.
  const min = Math.min(...rawLuminance);
  const max = Math.max(...rawLuminance);
  const range = max - min || 1;
  for (let i = 0; i < TOTAL_TILES; i++) {
    const stretched = (rawLuminance[i] - min) / range;
    // انحناء بسيط (Gamma) يبرز الفروق في المناطق المتوسطة أكثر من طرفي التدرّج
    colors[i].luminance = Math.pow(Math.min(1, Math.max(0, stretched)), 0.85);
  }

  return colors;
}

/**
 * نمط بديل تجريبي (Placeholder) يُستخدم فقط عندما لا توجد الصورة المرجعية
 * بعد في public/reference/. يرسم شكلًا بيضاويًا فاتحًا في المنتصف (يشبه
 * موضع الوجه في صورة بورتريه رسمية) على خلفية داكنة، حتى تكون تجربة
 * "اكتمال اللوحة تدريجيًا" مفهومة أثناء التطوير قبل توفر الصورة الحقيقية.
 */
function buildPlaceholderTargetColors(): TileTargetColor[] {
  const colors: TileTargetColor[] = [];
  const cx = GRID_SIZE / 2;
  const cy = GRID_SIZE * 0.42;
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const dx = (col - cx) / (GRID_SIZE * 0.28);
      const dy = (row - cy) / (GRID_SIZE * 0.38);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const shoulderY = row / GRID_SIZE;
      const isShoulderArea = shoulderY > 0.66 && Math.abs(col - cx) < GRID_SIZE * 0.42;
      const luminance = isShoulderArea
        ? 0.32
        : dist < 1
          ? 0.78 - dist * 0.25
          : Math.max(0.08, 0.22 - dist * 0.05);
      const clamped = Math.min(1, Math.max(0, luminance));
      colors.push({
        r: Math.round(clamped * 255),
        g: Math.round(clamped * 255),
        b: Math.round(clamped * 255),
        luminance: clamped,
      });
    }
  }
  return colors;
}

let cachedColors: TileTargetColor[] | null = null;
let cachedPromise: Promise<TileTargetColor[]> | null = null;

/** يحمّل ألوان الشبكة الهدف مرة واحدة فقط ثم يخزّنها في الذاكرة */
export function getReferenceTileColors(): Promise<TileTargetColor[]> {
  if (cachedColors) return Promise.resolve(cachedColors);
  if (cachedPromise) return cachedPromise;

  cachedPromise = loadImage(REFERENCE_IMAGE_PATH)
    .then(computeTargetColorsFromImage)
    .catch(() => buildPlaceholderTargetColors())
    .then((colors) => {
      cachedColors = colors;
      return colors;
    });

  return cachedPromise;
}
