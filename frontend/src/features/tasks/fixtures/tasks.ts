import type { Task } from "@/features/tasks/types";

/**
 * DEMO DATASET — not production content.
 *
 * These tasks exist only so the catalogue, filters, pagination and the task
 * page have something real to render before the FastAPI content API exists.
 * Every answer was verified by hand:
 *
 *   #1042  f(x)=x³−4x²+7x → f′(2) = 12 − 16 + 7 = 3
 *   #2107  101ₓ = x²+1 = 26 → x² = 25 → x = 5
 *   #1318  x²−2ax+9, D = 4a²−36 < 0 → |a| < 3 → наибольшее целое a = 2
 *   #1043  (a²−16)/(a−4) = a+4 → 7+4 = 11
 *   #2108  91 = 1011011₂ → пять единиц
 *   #2109  104 = 1101000₂ — первое число больше 100 с тремя единицами
 *
 * Replace this module with the real API (`getTasks` in `features/tasks/api.ts`
 * switches over automatically as soon as API_BASE_URL is configured).
 */
export const demoTasks: readonly Task[] = [
  {
    id: "1042",
    title: "Производная",
    subject: "matematika",
    examLabel: "ЕГЭ · Профиль",
    level: "medium",
    minutes: 3,
    summary: "Найдите значение производной функции в заданной точке.",
    statement: [
      {
        type: "paragraph",
        text: "Найдите значение $f'(2)$, если $f(x)=x^{3}-4x^{2}+7x$.",
      },
    ],
    answer: {
      value: "3",
      kind: "number",
      explanation:
        "Производная в точке — это угловой коэффициент касательной к графику в этой точке.",
    },
    steps: [
      {
        note: "Находим производную каждого слагаемого.",
        tex: "f'(x)=3x^{2}-8x+7",
      },
      {
        note: "Подставляем $x=2$.",
        tex: "f'(2)=3\\cdot 2^{2}-8\\cdot 2+7",
      },
      {
        note: "Считаем.",
        tex: "f'(2)=12-16+7=3",
      },
    ],
    topics: ["Производная", "Касательная"],
    featured: true,
    isDemo: true,
  },
  {
    id: "2107",
    title: "Системы счисления",
    subject: "informatika",
    examLabel: "ЕГЭ · Информатика",
    level: "easy",
    minutes: 2,
    summary: "Переведите число между системами и определите основание.",
    statement: [
      {
        type: "paragraph",
        text: "Найдите основание $x$ системы счисления, если $101_{x}=26_{10}$.",
      },
    ],
    answer: {
      value: "5",
      kind: "number",
      explanation:
        "Основание системы счисления — натуральное число, поэтому из $x^{2}=25$ подходит только положительный корень.",
    },
    steps: [
      {
        note: "Раскладываем запись по разрядам.",
        tex: "101_{x}=1\\cdot x^{2}+0\\cdot x+1",
      },
      {
        note: "Приравниваем к десятичному значению.",
        tex: "x^{2}+1=26",
      },
      {
        note: "Решаем.",
        tex: "x^{2}=25,\\quad x=5",
      },
    ],
    topics: ["Системы счисления"],
    featured: true,
    isDemo: true,
  },
  {
    id: "1318",
    title: "Уравнение с параметром",
    subject: "matematika",
    examLabel: "ЕГЭ · Профиль",
    level: "hard",
    minutes: 12,
    summary: "Найдите значения параметра, при которых уравнение не имеет корней.",
    statement: [
      {
        type: "paragraph",
        text: "Найдите наибольшее целое значение параметра $a$, при котором уравнение $x^{2}-2ax+9=0$ не имеет действительных корней.",
      },
    ],
    answer: {
      value: "2",
      kind: "number",
      explanation:
        "Условие «нет действительных корней» для квадратного уравнения равносильно $D<0$; при $a=3$ получается полный квадрат, поэтому это значение не подходит.",
    },
    steps: [
      {
        note: "Считаем дискриминант.",
        tex: "D=(-2a)^{2}-4\\cdot 9=4a^{2}-36",
      },
      {
        note: "Нет действительных корней, когда $D<0$.",
        tex: "4a^{2}-36<0",
      },
      {
        note: "Решаем неравенство.",
        tex: "a^{2}<9\\iff -3<a<3",
      },
      {
        note: "Наибольшее целое значение.",
        tex: "a=2",
      },
    ],
    topics: ["Параметр", "Квадратное уравнение"],
    featured: true,
    isDemo: true,
  },
  {
    id: "1043",
    title: "Алгебраическая дробь",
    subject: "matematika",
    examLabel: "ОГЭ · Математика",
    level: "easy",
    minutes: 3,
    summary: "Упростите выражение и вычислите его значение в заданной точке.",
    statement: [
      {
        type: "paragraph",
        text: "Найдите значение выражения $\\dfrac{a^{2}-16}{a-4}$ при $a=7$.",
      },
    ],
    answer: {
      value: "11",
      kind: "number",
      explanation:
        "Сначала упрощаем дробь, потом подставляем значение: так меньше вычислений и меньше поводов ошибиться.",
    },
    steps: [
      {
        note: "Числитель — разность квадратов.",
        tex: "a^{2}-16=(a-4)(a+4)",
      },
      {
        note: "Сокращаем на общий множитель $a-4$.",
        tex: "\\dfrac{(a-4)(a+4)}{a-4}=a+4",
      },
      {
        note: "Подставляем $a=7$.",
        tex: "7+4=11",
      },
    ],
    topics: ["Дроби", "Формулы сокращённого умножения"],
    isDemo: true,
  },
  {
    id: "2108",
    title: "Двоичная запись числа",
    subject: "informatika",
    examLabel: "ЕГЭ · Информатика",
    level: "medium",
    minutes: 4,
    summary: "Переведите число в двоичную систему и посчитайте единицы.",
    statement: [
      {
        type: "paragraph",
        text: "Сколько единиц содержит двоичная запись числа $91$?",
      },
    ],
    answer: {
      value: "5",
      kind: "number",
      explanation:
        "Чтобы посчитать единицы, достаточно представить число суммой степеней двойки — каждая использованная степень даёт одну единицу.",
    },
    steps: [
      {
        note: "Раскладываем по степеням двойки.",
        tex: "91=64+16+8+2+1",
      },
      {
        note: "Записываем двоичное представление.",
        tex: "91=1011011_{2}",
      },
      {
        note: "Считаем единицы — их пять.",
        tex: "1011011_{2}\\ \\Rightarrow\\ 5",
      },
    ],
    topics: ["Системы счисления", "Двоичная запись"],
    isDemo: true,
  },
  {
    id: "2109",
    title: "Число с тремя единицами",
    subject: "informatika",
    examLabel: "ЕГЭ · Информатика",
    level: "hard",
    minutes: 8,
    summary: "Найдите число с заданным количеством единиц в двоичной записи.",
    statement: [
      {
        type: "paragraph",
        text: "Найдите наименьшее натуральное число, большее $100$, двоичная запись которого содержит ровно три единицы.",
      },
    ],
    answer: {
      value: "104",
      kind: "number",
      explanation:
        "Перебор идёт по возрастанию, поэтому первое подходящее число и будет наименьшим.",
    },
    steps: [
      {
        note: "Проверяем числа по порядку.",
        tex: "101=1100101_{2}",
      },
      {
        note: "Здесь четыре единицы — не подходит.",
        tex: "102=1100110_{2},\\quad 103=1100111_{2}",
      },
      {
        note: "Первое подходящее число.",
        tex: "104=1101000_{2}",
      },
    ],
    topics: ["Двоичная запись", "Перебор"],
    isDemo: true,
  },
];
