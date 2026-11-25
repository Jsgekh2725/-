// أمثلة جاهزة تظهر في القائمة الجانبية
// كل مثال: icon, title, desc, code
window.PYLAB_EXAMPLES = [
  {
    icon: "👋",
    title: "مرحبا بايثون",
    desc: "أول أداة: تسأل عن اسمك",
    code: String.raw`# أول أداة: اكتب اسمك واضغط تشغيل
name = input("ما اسمك؟ ")
print(f"أهلاً يا {name}! 👋")
print("أنت الآن تشغّل بايثون داخل المتصفح 🐍")
`
  },
  {
    icon: "🧮",
    title: "آلة حاسبة",
    desc: "عمليات حسابية بين رقمين",
    code: String.raw`# آلة حاسبة بسيطة
a = float(input("الرقم الأول: "))
op = input("العملية (+ - * / ** %): ").strip()
b = float(input("الرقم الثاني: "))

operations = {
    "+": lambda x, y: x + y,
    "-": lambda x, y: x - y,
    "*": lambda x, y: x * y,
    "/": lambda x, y: x / y,
    "**": lambda x, y: x ** y,
    "%": lambda x, y: x % y,
}

if op not in operations:
    print("❌ عملية غير معروفة")
elif op in "/%" and b == 0:
    print("❌ لا يمكن القسمة على صفر")
else:
    result = operations[op](a, b)
    print(f"✅ {a:g} {op} {b:g} = {result:g}")
`
  },
  {
    icon: "🔐",
    title: "مولّد كلمات مرور",
    desc: "كلمات مرور قوية وعشوائية",
    code: String.raw`# مولّد كلمات مرور قوية
import secrets
import string

length = input("طول كلمة المرور (افتراضي 16): ").strip()
length = int(length) if length.isdigit() else 16
count = 5

chars = string.ascii_letters + string.digits + "!@#$%^&*()-_=+"

def make_password(n):
    while True:
        pwd = "".join(secrets.choice(chars) for _ in range(n))
        # تأكد أن فيها حرف كبير وصغير ورقم ورمز
        if (any(c.islower() for c in pwd) and any(c.isupper() for c in pwd)
                and any(c.isdigit() for c in pwd)
                and any(c in "!@#$%^&*()-_=+" for c in pwd)):
            return pwd

print(f"🔐 {count} كلمات مرور بطول {length}:")
for i in range(1, count + 1):
    print(f"  {i}. {make_password(length)}")
`
  },
  {
    icon: "📝",
    title: "محلّل النصوص",
    desc: "عدد الكلمات والحروف والأكثر تكراراً",
    code: String.raw`# محلّل النصوص
from collections import Counter
import re

text = input("الصق النص هنا: ")

words = re.findall(r"\w+", text)
chars_no_space = len(text.replace(" ", ""))

print("📊 نتائج التحليل")
print("-" * 30)
print(f"عدد الحروف (مع المسافات): {len(text)}")
print(f"عدد الحروف (بدون مسافات): {chars_no_space}")
print(f"عدد الكلمات: {len(words)}")
print(f"عدد الكلمات المختلفة: {len(set(w.lower() for w in words))}")

if words:
    print("\nأكثر الكلمات تكراراً:")
    for word, n in Counter(w.lower() for w in words).most_common(5):
        print(f"  {word:<15} {'█' * n} {n}")
`
  },
  {
    icon: "🔢",
    title: "الأعداد الأولية",
    desc: "فحص عدد وإيجاد الأعداد الأولية",
    code: String.raw`# أداة الأعداد الأولية
def is_prime(n):
    if n < 2:
        return False
    if n % 2 == 0:
        return n == 2
    i = 3
    while i * i <= n:
        if n % i == 0:
            return False
        i += 2
    return True

n = int(input("اكتب رقماً: "))

if is_prime(n):
    print(f"✅ {n} عدد أولي")
else:
    factors = [d for d in range(2, n) if n % d == 0][:10] if n > 1 else []
    print(f"❌ {n} ليس عدداً أولياً", f"— من قواسمه: {factors}" if factors else "")

primes = [x for x in range(2, max(n, 2) + 1) if is_prime(x)]
print(f"\nعدد الأعداد الأولية حتى {n}: {len(primes)}")
print("آخرها:", primes[-15:])
`
  },
  {
    icon: "🌡️",
    title: "محوّل الوحدات",
    desc: "حرارة، أطوال، أوزان",
    code: String.raw`# محوّل الوحدات
print("اختر نوع التحويل:")
print("  1) مئوي ← فهرنهايت")
print("  2) فهرنهايت ← مئوي")
print("  3) كيلومتر ← ميل")
print("  4) كيلوغرام ← باوند")

choice = input("رقم الاختيار: ").strip()
value = float(input("القيمة: "))

conversions = {
    "1": ("°C", "°F", lambda v: v * 9 / 5 + 32),
    "2": ("°F", "°C", lambda v: (v - 32) * 5 / 9),
    "3": ("km", "mi", lambda v: v * 0.621371),
    "4": ("kg", "lb", lambda v: v * 2.20462),
}

if choice in conversions:
    src, dst, fn = conversions[choice]
    print(f"\n✅ {value:g} {src} = {fn(value):.2f} {dst}")
else:
    print("❌ اختيار غير صحيح")
`
  },
  {
    icon: "📈",
    title: "رسم بياني",
    desc: "numpy + matplotlib",
    code: String.raw`# رسم بياني باستخدام numpy و matplotlib
# (المكتبات تُحمَّل تلقائياً أول مرة — قد يستغرق ذلك ثوانٍ)
import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 4 * np.pi, 400)

plt.figure(figsize=(8, 4))
plt.plot(x, np.sin(x), label="sin(x)", linewidth=2)
plt.plot(x, np.cos(x), label="cos(x)", linewidth=2, linestyle="--")
plt.title("Sine & Cosine")
plt.xlabel("x")
plt.grid(alpha=0.3)
plt.legend()
plt.show()

print("✅ تم الرسم")
`
  },
  {
    icon: "🐼",
    title: "جدول بيانات",
    desc: "تحليل بيانات بـ pandas",
    code: String.raw`# تحليل بيانات بسيط باستخدام pandas
import pandas as pd

data = {
    "المنتج": ["قهوة", "شاي", "عصير", "ماء", "كيك"],
    "السعر": [12, 8, 15, 3, 20],
    "الكمية": [40, 65, 22, 120, 18],
}

df = pd.DataFrame(data)
df["الإجمالي"] = df["السعر"] * df["الكمية"]

print(df.to_string(index=False))
print("\nإجمالي المبيعات:", df["الإجمالي"].sum())
print("الأكثر مبيعاً:", df.loc[df["الكمية"].idxmax(), "المنتج"])
`
  },
  {
    icon: "🌐",
    title: "طلب من الإنترنت",
    desc: "جلب بيانات من API",
    code: String.raw`# جلب بيانات من الإنترنت (يعمل داخل المتصفح)
from pyodide.http import pyfetch

response = await pyfetch("https://api.github.com/repos/python/cpython")
repo = await response.json()

print("📦 المستودع:", repo["full_name"])
print("⭐ النجوم:", f"{repo['stargazers_count']:,}")
print("🍴 النسخ:", f"{repo['forks_count']:,}")
print("📝 الوصف:", repo["description"])
`
  },
  {
    icon: "✖️",
    title: "جدول الضرب",
    desc: "يطبع جدول ضرب لأي رقم",
    code: String.raw`# جدول الضرب
n = int(input("جدول ضرب أي رقم؟ "))
limit = 12

print(f"📘 جدول ضرب {n}")
print("=" * 22)
for i in range(1, limit + 1):
    print(f"{n:>4} × {i:>2} = {n * i:>6}")
`
  }
];
