export type SeoSubject = "matematika" | "informatika";
export type SeoExam = "oge" | "ege";

export type TaskTypeEntry = {
  number: number;
  label: string;
  note: string;
  path?: string;
};

export type ExamHubSection = {
  title: string;
  paragraphs?: readonly string[];
  bullets?: readonly string[];
};

export type ExamHub = {
  subject: SeoSubject;
  exam: SeoExam;
  path: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lead: string;
  eyebrow: string;
  facts: readonly { label: string; value: string }[];
  sections: readonly ExamHubSection[];
  taskTypes: readonly TaskTypeEntry[];
  relatedArticleSlugs: readonly string[];
  relatedTaskTopics: readonly string[];
};

export type SeoTaskTypePage = {
  slug: string;
  subject: SeoSubject;
  exam: SeoExam;
  number: number;
  path: string;
  navLabel: string;
  relatedArticleSlugs: readonly string[];
  relatedTaskTopics: readonly string[];
};

const MATH_OGE_TASKS: readonly TaskTypeEntry[] = [
  {
    number: 1,
    label: "Практическая задача",
    note: "Пять заданий по одному сюжету: план, таблица, расчёты.",
  },
  {
    number: 2,
    label: "Практическая задача",
    note: "Продолжение сюжета: выбрать оптимальный вариант.",
  },
  {
    number: 3,
    label: "Практическая задача",
    note: "Продолжение сюжета: оценить результат.",
  },
  {
    number: 4,
    label: "Практическая задача",
    note: "Продолжение сюжета: работа с единицами.",
  },
  {
    number: 5,
    label: "Практическая задача",
    note: "Продолжение сюжета: чтение таблицы или диаграммы.",
  },
  {
    number: 6,
    label: "Вычисления с числами",
    note: "Порядок действий, дроби, степени и корни, координатная прямая.",
    path: "/matematika/oge/zadanie-6",
  },
  {
    number: 7,
    label: "Сравнение чисел",
    note: "Координатная прямая, прикидка, сравнение дробей.",
  },
  {
    number: 8,
    label: "Формулы и преобразования",
    note: "Разность квадратов, квадрат суммы и разности, расчёты по формуле.",
  },
  {
    number: 9,
    label: "Уравнения",
    note: "Линейные, квадратные и дробно-рациональные уравнения.",
  },
  {
    number: 10,
    label: "Вероятность",
    note: "Классическое определение вероятности в опытах с равновозможными исходами.",
  },
  {
    number: 11,
    label: "Графики функций",
    note: "Соответствие формул и графиков, свойства линейной и квадратичной функций.",
    path: "/matematika/oge/zadanie-11",
  },
  {
    number: 12,
    label: "Формулы и выражения",
    note: "Вычисления по формуле и преобразование выражений.",
  },
  {
    number: 13,
    label: "Неравенства",
    note: "Линейные, квадратные и дробно-рациональные неравенства.",
  },
  {
    number: 14,
    label: "Последовательности",
    note: "Арифметическая и геометрическая прогрессии.",
  },
  {
    number: 15,
    label: "Геометрия: треугольники и площадь",
    note: "Площадь, периметр, теорема Пифагора, тригонометрические отношения.",
    path: "/matematika/oge/zadanie-15",
  },
  {
    number: 16,
    label: "Геометрия: окружность",
    note: "Углы, хорды, касательные, вписанные и описанные фигуры.",
  },
  {
    number: 17,
    label: "Геометрия: площади фигур",
    note: "Параллелограмм, трапеция, ромб, круг.",
  },
  {
    number: 18,
    label: "Геометрия: углы и тригонометрия",
    note: "Углы, подобие, синус, косинус и тангенс.",
  },
  {
    number: 19,
    label: "Геометрические утверждения",
    note: "Верные и неверные высказывания о фигурах.",
    path: "/matematika/oge/zadanie-19",
  },
  {
    number: 20,
    label: "Уравнения и неравенства",
    note: "Задание части 2 с развёрнутым решением.",
  },
  {
    number: 21,
    label: "Текстовая задача",
    note: "Задание части 2 с развёрнутым решением.",
  },
  {
    number: 22,
    label: "Графики функций",
    note: "Задание части 2 с развёрнутым решением.",
  },
  { number: 23, label: "Геометрия", note: "Задание части 2 с развёрнутым решением." },
  { number: 24, label: "Геометрия", note: "Задание части 2 с развёрнутым решением." },
  { number: 25, label: "Геометрия", note: "Задание части 2 с развёрнутым решением." },
];

const MATH_EGE_TASKS: readonly TaskTypeEntry[] = [
  { number: 1, label: "Планиметрия", note: "Базовая геометрия на плоскости." },
  { number: 2, label: "Векторы", note: "Координаты, скалярное произведение, угол." },
  { number: 3, label: "Стереометрия", note: "Углы, расстояния, объём." },
  { number: 4, label: "Вероятность", note: "Классическое определение вероятности." },
  { number: 5, label: "Вероятность", note: "Сложение и умножение вероятностей." },
  { number: 6, label: "Уравнения", note: "Разные приёмы решения уравнений и систем." },
  { number: 7, label: "Степени и логарифмы", note: "Преобразование выражений." },
  { number: 8, label: "Производная", note: "Касательная, исследование функции." },
  { number: 9, label: "Прикладная задача", note: "Моделирование реальной ситуации." },
  { number: 10, label: "Текстовая задача", note: "Движение, работа, проценты." },
  {
    number: 11,
    label: "Графики и формулы",
    note: "Свойства функций при решении уравнений.",
  },
  { number: 12, label: "Производная", note: "Экстремумы и наибольшие значения." },
  { number: 13, label: "Уравнения", note: "Задание части 2." },
  { number: 14, label: "Стереометрия", note: "Задание части 2." },
  { number: 15, label: "Неравенства", note: "Задание части 2." },
  { number: 16, label: "Экономическая задача", note: "Задание части 2." },
  { number: 17, label: "Планиметрия", note: "Задание части 2." },
  { number: 18, label: "Параметр", note: "Задание части 2." },
  { number: 19, label: "Числа и доказательства", note: "Задание части 2." },
];

const INF_EGE_TASKS: readonly TaskTypeEntry[] = [
  {
    number: 1,
    label: "Информационные модели",
    note: "Схемы, карты, таблицы, графики, формулы.",
  },
  {
    number: 2,
    label: "Логика",
    note: "Таблицы истинности и логические схемы.",
    path: "/informatika/ege/zadanie-2",
  },
  { number: 3, label: "Базы данных", note: "Поиск информации в реляционных базах." },
  {
    number: 4,
    label: "Кодирование",
    note: "Кодирование и декодирование, условие Фано.",
    path: "/informatika/ege/zadanie-4",
  },
  {
    number: 5,
    label: "Исполнитель",
    note: "Формальное исполнение простого алгоритма.",
    path: "/informatika/ege/zadanie-5",
  },
  {
    number: 6,
    label: "Анализ алгоритма",
    note: "Результаты работы простейших алгоритмов.",
  },
  { number: 7, label: "Объём памяти", note: "Графическая и звуковая информация." },
  {
    number: 8,
    label: "Измерение информации",
    note: "Количество информации, алфавитный подход.",
    path: "/informatika/ege/zadanie-8",
  },
  { number: 9, label: "Электронные таблицы", note: "Обработка числовой информации." },
  { number: 10, label: "Текстовый документ", note: "Информационный поиск." },
  { number: 11, label: "Объём сообщения", note: "Подсчёт информационного объёма." },
  {
    number: 12,
    label: "Исполнитель",
    note: "Алгоритм с фиксированным набором команд.",
  },
  { number: 13, label: "Маска подсети", note: "Адресация в IP-сетях." },
  { number: 14, label: "Системы счисления", note: "Позиционные системы." },
  { number: 15, label: "Логика", note: "Законы математической логики." },
  { number: 16, label: "Рекурсия", note: "Вычисление рекуррентных выражений." },
  {
    number: 17,
    label: "Программирование",
    note: "Обработка числовой последовательности.",
  },
  { number: 18, label: "Электронные таблицы", note: "Обработка целочисленных данных." },
  { number: 19, label: "Теория игр", note: "Анализ алгоритма логической игры." },
  { number: 20, label: "Теория игр", note: "Выигрышная стратегия." },
  { number: 21, label: "Теория игр", note: "Дерево игры." },
  { number: 22, label: "Архитектура", note: "Многопроцессорные системы." },
  { number: 23, label: "Анализ алгоритма", note: "Ход исполнения алгоритма." },
  { number: 24, label: "Программирование", note: "Обработка символьной информации." },
  {
    number: 25,
    label: "Программирование",
    note: "Обработка целочисленной информации.",
  },
  { number: 26, label: "Программирование", note: "Сортировка и обработка данных." },
  { number: 27, label: "Анализ данных", note: "Полный цикл анализа данных." },
];

const INF_OGE_TASKS: readonly TaskTypeEntry[] = [
  {
    number: 1,
    label: "Объём текстовых данных",
    note: "Оценка памяти для хранения текста.",
  },
  {
    number: 2,
    label: "Кодирование",
    note: "Декодирование кодовой последовательности.",
  },
  { number: 3, label: "Логика", note: "Истинность составного высказывания." },
  { number: 4, label: "Анализ моделей", note: "Простейшие информационные модели." },
  {
    number: 5,
    label: "Исполнитель",
    note: "Анализ простого алгоритма для исполнителя.",
    path: "/informatika/oge/zadanie-5",
  },
  { number: 6, label: "Анализ программы", note: "Формальное исполнение алгоритма." },
  { number: 7, label: "Адресация в интернете", note: "Принципы адресации в сети." },
  { number: 8, label: "Поисковые запросы", note: "Принципы поиска информации." },
  { number: 9, label: "Анализ схем", note: "Информация в виде схем." },
  { number: 10, label: "Системы счисления", note: "Запись чисел в разных системах." },
  { number: 11, label: "Файлы и каталоги", note: "Поиск информации в файлах." },
  { number: 12, label: "Объём файлов", note: "Количество и объём отобранных файлов." },
  {
    number: 13,
    label: "Презентация или текст",
    note: "Практическая работа на компьютере.",
  },
  {
    number: 14,
    label: "Электронные таблицы",
    note: "Обработка большого массива данных.",
  },
  {
    number: 15,
    label: "Программирование",
    note: "Программа для заданного исполнителя.",
  },
  { number: 16, label: "Программирование", note: "Программа на универсальном языке." },
];

export const SEO_TASK_TYPE_PAGES: readonly SeoTaskTypePage[] = [
  {
    slug: "seo-matematika-oge-zadanie-6",
    subject: "matematika",
    exam: "oge",
    number: 6,
    path: "/matematika/oge/zadanie-6",
    navLabel: "Задание 6",
    relatedArticleSlugs: [
      "stepeni-i-korni-svojstva",
      "formuly-sokrashchennogo-umenozheniya",
    ],
    relatedTaskTopics: [],
  },
  {
    slug: "seo-matematika-oge-zadanie-11",
    subject: "matematika",
    exam: "oge",
    number: 11,
    path: "/matematika/oge/zadanie-11",
    navLabel: "Задание 11",
    relatedArticleSlugs: ["proizvodnaya-smysl-grafik-kasatelnaya"],
    relatedTaskTopics: [],
  },
  {
    slug: "seo-matematika-oge-zadanie-15",
    subject: "matematika",
    exam: "oge",
    number: 15,
    path: "/matematika/oge/zadanie-15",
    navLabel: "Задание 15",
    relatedArticleSlugs: ["stepeni-i-korni-svojstva"],
    relatedTaskTopics: [],
  },
  {
    slug: "seo-matematika-oge-zadanie-19",
    subject: "matematika",
    exam: "oge",
    number: 19,
    path: "/matematika/oge/zadanie-19",
    navLabel: "Задание 19",
    relatedArticleSlugs: ["formuly-sokrashchennogo-umenozheniya"],
    relatedTaskTopics: [],
  },
  {
    slug: "seo-informatika-oge-zadanie-5",
    subject: "informatika",
    exam: "oge",
    number: 5,
    path: "/informatika/oge/zadanie-5",
    navLabel: "Задание 5",
    relatedArticleSlugs: ["sistemy-schisleniya-perevod-i-lovushki"],
    relatedTaskTopics: [],
  },
  {
    slug: "seo-informatika-ege-zadanie-2",
    subject: "informatika",
    exam: "ege",
    number: 2,
    path: "/informatika/ege/zadanie-2",
    navLabel: "Задание 2",
    relatedArticleSlugs: ["logicheskie-operacii-tablicy-istinnosti"],
    relatedTaskTopics: [],
  },
  {
    slug: "seo-informatika-ege-zadanie-4",
    subject: "informatika",
    exam: "ege",
    number: 4,
    path: "/informatika/ege/zadanie-4",
    navLabel: "Задание 4",
    relatedArticleSlugs: ["sistemy-schisleniya-perevod-i-lovushki"],
    relatedTaskTopics: [],
  },
  {
    slug: "seo-informatika-ege-zadanie-5",
    subject: "informatika",
    exam: "ege",
    number: 5,
    path: "/informatika/ege/zadanie-5",
    navLabel: "Задание 5",
    relatedArticleSlugs: ["sistemy-schisleniya-perevod-i-lovushki"],
    relatedTaskTopics: [],
  },
  {
    slug: "seo-informatika-ege-zadanie-8",
    subject: "informatika",
    exam: "ege",
    number: 8,
    path: "/informatika/ege/zadanie-8",
    navLabel: "Задание 8",
    relatedArticleSlugs: ["sistemy-schisleniya-perevod-i-lovushki"],
    relatedTaskTopics: [],
  },
];

const EXAM_HUBS: readonly ExamHub[] = [
  {
    subject: "matematika",
    exam: "oge",
    path: "/matematika/oge",
    eyebrow: "Математика · ОГЭ",
    metaTitle: "ОГЭ по математике: структура, темы и подготовка",
    metaDescription:
      "Сколько заданий в ОГЭ по математике, как устроены части и сколько баллов можно получить. Темы заданий, план подготовки и разборы с проверкой.",
    h1: "ОГЭ по математике: структура и подготовка",
    lead: "Разбираем экзамен по официальной спецификации 2026 года: 25 заданий, 31 первичный балл и 235 минут. Показываем, какие темы встречаются, где чаще теряют баллы и с чего начать подготовку.",
    facts: [
      { label: "Заданий", value: "25" },
      { label: "Первичных баллов", value: "31" },
      { label: "Время", value: "235 минут" },
      { label: "Краткий ответ", value: "19 заданий" },
    ],
    sections: [
      {
        title: "Из чего состоит экзамен",
        paragraphs: [
          "В работе 25 заданий: 19 с кратким ответом и 6 с развёрнутым решением. Первая часть проверяет базовые навыки, вторая требует записать ход решения и обосновать ответ.",
          "Задания 1–5 объединены одним практическим сюжетом: нужно прочитать план или таблицу, сделать расчёты и выбрать подходящий вариант. Это не отдельная тема, а проверка умения работать с информацией.",
        ],
      },
      {
        title: "Какие темы проверяют",
        paragraphs: [
          "Алгебраическая часть охватывает вычисления, уравнения, неравенства, последовательности, функции и вероятность. Геометрическая — треугольники, окружность, площади, углы и анализ утверждений.",
          "Во второй части встречаются уравнения и неравенства, текстовая задача, графики функций и геометрия с доказательством. Именно здесь важно не только получить ответ, но и показать каждый шаг.",
        ],
      },
      {
        title: "Как готовиться без хаоса",
        paragraphs: [
          "Сначала закройте базовые темы первой части: вычисления, уравнения, неравенства и простую геометрию. Затем переходите к задачам с развёрнутым ответом.",
          "После каждой ошибки выписывайте не «я не понял тему», а конкретный сбой: потерян знак, забыта формула, неверно выбрано правило. Так подготовка становится управляемой.",
        ],
        bullets: [
          "Решайте по 10–15 коротких заданий в день, а не один большой вариант раз в неделю.",
          "Проверяйте ответ независимым способом: подстановкой, оценкой или обратным действием.",
          "Раз в неделю возвращайтесь к темам, где были ошибки, и решайте похожие задачи.",
          "Тренируйте оформление части 2: условие, решение, ответ.",
        ],
      },
      {
        title: "Сколько баллов нужно",
        paragraphs: [
          "Максимум — 31 первичный балл. По рекомендациям 2026 года для оценки «5» нужно 22–31, для «4» — 15–21, для «3» — 8–14. При этом действуют ограничения по геометрии: без минимального геометрического балла оценка снижается.",
          "Итоговую шкалу устанавливает регион, поэтому перед экзаменом проверяйте местные документы. Подробный разбор шкалы и ограничений — в отдельной статье.",
        ],
      },
    ],
    taskTypes: MATH_OGE_TASKS,
    relatedArticleSlugs: [
      "bally-oge-matematika-perevod-v-ocenku",
      "stepeni-i-korni-svojstva",
      "formuly-sokrashchennogo-umenozheniya",
    ],
    relatedTaskTopics: ["Производная", "Логарифмы"],
  },
  {
    subject: "matematika",
    exam: "ege",
    path: "/matematika/ege",
    eyebrow: "Математика · ЕГЭ",
    metaTitle: "ЕГЭ по математике: база и профиль, структура и подготовка",
    metaDescription:
      "Чем отличаются база и профиль ЕГЭ по математике, сколько заданий и баллов, какие темы проверяют. План подготовки и разборы задач с решениями.",
    h1: "ЕГЭ по математике: база и профиль",
    lead: "На ЕГЭ по математике два уровня. Базовый сдают для аттестата, профильный — для поступления. Разбираем структуру 2026 года, различия и порядок подготовки.",
    facts: [
      { label: "База", value: "21 задание · 21 балл" },
      { label: "Профиль", value: "19 заданий · 32 балла" },
      { label: "Время профиля", value: "235 минут" },
      { label: "Время базы", value: "180 минут" },
    ],
    sections: [
      {
        title: "База и профиль: в чём разница",
        paragraphs: [
          "Базовый экзамен состоит из 21 задания с кратким ответом. Все задания базового уровня, а результат оценивается по пятибалльной шкале. Профильный экзамен содержит 12 заданий с кратким ответом и 7 с развёрнутым; результат переводится в 100-балльную шкалу.",
          "Профиль нужен для поступления на специальности, где математика входит в перечень вступительных испытаний. Если математика не нужна для поступления, обычно достаточно базы.",
        ],
      },
      {
        title: "Что проверяет профиль",
        paragraphs: [
          "В профиле есть планиметрия, стереометрия, векторы, вероятность, уравнения, преобразования, производная, текстовые и экономические задачи, параметр и задачи на числа.",
          "Первая часть проверяет базовую технику, вторая — умение строить рассуждение и оформлять решение. Поэтому подготовка только по коротким ответам не даёт высокого балла.",
        ],
      },
      {
        title: "Как построить подготовку",
        bullets: [
          "Определите целевой балл и список вузов: от этого зависит нужный уровень.",
          "Закройте первую часть до устойчивых 60–70 баллов, затем беритесь за вторую.",
          "Разбирайте не только правильные решения, но и типичные ошибки: знак, область допустимых значений, потеря корня.",
          "Тренируйте полные решения задач 13–19 на бумаге и проверяйте оформление.",
        ],
      },
      {
        title: "Что важно на экзамене",
        paragraphs: [
          "В профиле 235 минут. Это около 12 минут на задание, но распределение неравномерное: простые задания первой части должны занимать минуты, а не полчаса.",
          "Если решение затянулось, отметьте задачу и вернитесь позже. Потеря времени на одной задаче часто стоит нескольких баллов в конце.",
        ],
      },
    ],
    taskTypes: MATH_EGE_TASKS,
    relatedArticleSlugs: [
      "proizvodnaya-smysl-grafik-kasatelnaya",
      "logarifmy-opredelenie-svojstva-oshibki",
      "stepeni-i-korni-svojstva",
      "formuly-sokrashchennogo-umenozheniya",
    ],
    relatedTaskTopics: ["Производная", "Логарифмы"],
  },
  {
    subject: "informatika",
    exam: "ege",
    path: "/informatika/ege",
    eyebrow: "Информатика · ЕГЭ",
    metaTitle: "ЕГЭ по информатике: структура, задания и баллы",
    metaDescription:
      "Сколько заданий в ЕГЭ по информатике, какие темы проверяют, сколько первичных баллов и минут. Разборы заданий 2, 4, 5 и 8 с проверкой ответов.",
    h1: "ЕГЭ по информатике: структура и подготовка",
    lead: "В ЕГЭ по информатике 27 заданий, 29 первичных баллов и 235 минут. Разбираем карту экзамена, сложные темы и порядок подготовки без зубрёжки.",
    facts: [
      { label: "Заданий", value: "27" },
      { label: "Первичных баллов", value: "29" },
      { label: "Время", value: "235 минут" },
      { label: "Высокий уровень", value: "5 заданий" },
    ],
    sections: [
      {
        title: "Как устроен экзамен",
        paragraphs: [
          "Работа включает задания базового, повышенного и высокого уровня. Часть заданий выполняется с использованием специализированного программного обеспечения: электронных таблиц, среды программирования, текстового процессора.",
          "Проверяется не знание названий команд, а умение применить инструмент: найти данные, построить таблицу истинности, написать короткую программу, проанализировать алгоритм.",
        ],
      },
      {
        title: "Темы, которые дают больше всего баллов",
        paragraphs: [
          "Программирование, анализ алгоритмов и теория игр традиционно требуют больше времени, но именно они отделяют высокий балл от среднего. Начинать стоит с базовых заданий: логика, кодирование, системы счисления, измерение информации.",
          "Задания 19–21 посвящены теории игр, 24–27 — программированию и анализу данных. Это не темы «на один вечер»: им нужно выделить отдельные недели.",
        ],
      },
      {
        title: "Порядок подготовки",
        bullets: [
          "Сначала базовые задания 1–8: логика, кодирование, измерение информации.",
          "Затем алгоритмы и исполнители: задания 5, 6, 12, 23.",
          "После этого — электронные таблицы и базы данных: задания 3, 9, 18.",
          "Отдельным блоком — теория игр 19–21 и программирование 24–27.",
          "В конце — тренировка полного варианта с контролем времени.",
        ],
      },
      {
        title: "Что учитывать",
        paragraphs: [
          "На экзамене разрешено использовать программное обеспечение, но это не заменяет понимание. Если вы не можете объяснить, почему программа выдаёт ответ, ошибка повторится на другом задании.",
          "Структура ниже приведена по спецификации 2026 года. Перед подготовкой к 2027 году проверьте итоговые документы на сайте ФИПИ: проект изменений уже опубликован, но итоговая версия может отличаться.",
        ],
      },
    ],
    taskTypes: INF_EGE_TASKS,
    relatedArticleSlugs: [
      "struktura-ege-informatika",
      "sistemy-schisleniya-perevod-i-lovushki",
      "logicheskie-operacii-tablicy-istinnosti",
    ],
    relatedTaskTopics: ["Системы счисления"],
  },
  {
    subject: "informatika",
    exam: "oge",
    path: "/informatika/oge",
    eyebrow: "Информатика · ОГЭ",
    metaTitle: "ОГЭ по информатике: структура, задания и подготовка",
    metaDescription:
      "Сколько заданий в ОГЭ по информатике, какие темы проверяют и как готовиться. Разбор задания 5, алгоритмы, системы счисления и практические задачи.",
    h1: "ОГЭ по информатике: структура и подготовка",
    lead: "ОГЭ по информатике проверяет базовые темы и практические навыки работы за компьютером. Разбираем структуру экзамена, карту заданий и порядок подготовки.",
    facts: [
      { label: "Заданий", value: "16" },
      { label: "Первичных баллов", value: "21" },
      { label: "Время", value: "150 минут" },
      { label: "Развёрнутый ответ", value: "4 задания" },
    ],
    sections: [
      {
        title: "Как устроен экзамен",
        paragraphs: [
          "Работа состоит из заданий с кратким ответом и практических заданий, которые выполняются на компьютере. Практическая часть проверяет умение работать с файлами, электронными таблицами, текстом и программой.",
          "Теоретическая часть охватывает количество информации, кодирование, логику, файловую систему, алгоритмы и поиск информации.",
        ],
      },
      {
        title: "Какие темы важны",
        paragraphs: [
          "Самые частые темы — системы счисления, логические выражения, алгоритмы для исполнителя, электронные таблицы и программирование. Это не случайный набор: задания проверяют сквозные навыки, которые встречаются в разных формулировках.",
          "Практические задания требуют не только правильного ответа, но и умения сохранить файл в нужном формате и месте. Техническая ошибка может стоить балла.",
        ],
      },
      {
        title: "Как готовиться",
        bullets: [
          "Разберитесь с системами счисления и единицами измерения информации.",
          "Научитесь читать и составлять простые алгоритмы для исполнителя.",
          "Потренируйтесь в электронных таблицах и текстовом редакторе.",
          "Решайте практические задания с таймером, чтобы привыкнуть к формату.",
          "Проверяйте не только ответ, но и сохранение файла.",
        ],
      },
      {
        title: "Что проверить перед экзаменом",
        paragraphs: [
          "Структура и шкала могут уточняться. Перед подготовкой сверьтесь со спецификацией текущего года на сайте ФИПИ и региональными документами.",
        ],
      },
    ],
    taskTypes: INF_OGE_TASKS,
    relatedArticleSlugs: [
      "sistemy-schisleniya-perevod-i-lovushki",
      "logicheskie-operacii-tablicy-istinnosti",
    ],
    relatedTaskTopics: ["Системы счисления"],
  },
];

export const SEO_ARTICLE_LABELS: Readonly<Record<string, string>> = {
  "proizvodnaya-smysl-grafik-kasatelnaya": "Производная: смысл, график и касательная",
  "logarifmy-opredelenie-svojstva-oshibki":
    "Логарифмы: определение, свойства и типичные ошибки",
  "sistemy-schisleniya-perevod-i-lovushki":
    "Системы счисления: перевод, сложение и ловушки ЕГЭ",
  "formuly-sokrashchennogo-umenozheniya":
    "Формулы сокращённого умножения: таблица и примеры",
  "stepeni-i-korni-svojstva": "Степени и корни: свойства, формулы и ошибки",
  "logicheskie-operacii-tablicy-istinnosti": "Логические операции и таблицы истинности",
  "bally-oge-matematika-perevod-v-ocenku": "Баллы ОГЭ по математике: перевод в оценку",
  "struktura-ege-informatika": "Структура ЕГЭ по информатике: задания и баллы",
};

export function getArticleLabel(slug: string): string {
  return SEO_ARTICLE_LABELS[slug] ?? slug;
}

const TASK_TYPE_BY_PATH = new Map<string, SeoTaskTypePage>(
  SEO_TASK_TYPE_PAGES.map((page) => [page.path, page]),
);

const TASK_TYPE_BY_SLUG = new Map<string, SeoTaskTypePage>(
  SEO_TASK_TYPE_PAGES.map((page) => [page.slug, page]),
);

const EXAM_HUB_BY_PATH = new Map<string, ExamHub>(
  EXAM_HUBS.map((hub) => [hub.path, hub]),
);

export const SEO_EXAM_HUBS = EXAM_HUBS;

export function isSeoSubject(value: string): value is SeoSubject {
  return value === "matematika" || value === "informatika";
}

export function isSeoExam(value: string): value is SeoExam {
  return value === "oge" || value === "ege";
}

export function getExamHub(subject: string, exam: string): ExamHub | null {
  if (!isSeoSubject(subject) || !isSeoExam(exam)) return null;
  return EXAM_HUB_BY_PATH.get(`/${subject}/${exam}`) ?? null;
}

export function getTaskTypePages(
  subject: SeoSubject,
  exam: SeoExam,
): SeoTaskTypePage[] {
  return SEO_TASK_TYPE_PAGES.filter(
    (page) => page.subject === subject && page.exam === exam,
  );
}

export function getTaskTypePage(
  subject: string,
  exam: string,
  taskType: string,
): SeoTaskTypePage | null {
  if (!isSeoSubject(subject) || !isSeoExam(exam)) return null;
  const match = /^zadanie-(\d{1,2})$/.exec(taskType);
  if (!match) return null;
  const number = Number(match[1]);
  const page = TASK_TYPE_BY_PATH.get(`/${subject}/${exam}/zadanie-${number}`);
  return page ?? null;
}

export function getSeoTaskTypePageBySlug(slug: string): SeoTaskTypePage | null {
  return TASK_TYPE_BY_SLUG.get(slug) ?? null;
}

export function isSeoArticleSlug(slug: string): boolean {
  return TASK_TYPE_BY_SLUG.has(slug);
}

export function getSeoArticlePath(slug: string): string | null {
  return TASK_TYPE_BY_SLUG.get(slug)?.path ?? null;
}

export function getSeoTaskTypeStaticParams(subject: SeoSubject): {
  exam: SeoExam;
  taskType: string;
}[] {
  return SEO_TASK_TYPE_PAGES.filter((page) => page.subject === subject).map((page) => ({
    exam: page.exam,
    taskType: `zadanie-${page.number}`,
  }));
}

export function getExamStaticParams(subject: SeoSubject): { exam: SeoExam }[] {
  return subject === "matematika"
    ? [{ exam: "oge" }, { exam: "ege" }]
    : [{ exam: "ege" }, { exam: "oge" }];
}
