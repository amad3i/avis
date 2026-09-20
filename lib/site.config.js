// ============================================================================
// ЕДИНАЯ ТОЧКА НАСТРОЙКИ БРЕНДА (white-label) — СТОМАТОЛОГИЯ.
// Всё, что нужно поменять под нового клиента, лежит ЗДЕСЬ, в одном файле:
//   brand      — название, логотип, иконки            (1 → шапка/футер/админка/кухня/PWA/SEO)
//   colors     — палитра                               (1 → цвета везде + иконки/фавикон)
//   t          — ВСЕ тексты интерфейса                 (1 → каждый текст на сайте/в админке)
//   menu*      — услуги, доп. услуги, промо-слайды     (1 → витрина и сид базы)
//   contacts   — адрес/телефон/часы                    (1 → витрина и сид базы)
//   contacts/socials/reviews/map/about — контент и фото
// Менеджмент: отредактировал конфиг → `npm run build` → коммит → на Vercel.
const BRAND_NAME = "Авис";

// Подстановка {плейсхолдеров} в строки из конфига: fmt("Заявка №{n}", { n: 12 }).
export function fmt(template = "", vars = {}) {
  return String(template).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

export const siteConfig = {
  // ---- Бренд ----------------------------------------------------------------
  brand: {
    // Название клиники (одна строка — используется повсюду).
    name: BRAND_NAME,
    // Полное название (для шапки, PWA, заголовков).
    shopName: BRAND_NAME,
    slogan: "Лечим зубы бережно и без боли",

    // Картинка-логотип (клади файл в public/). Если задан:
    //   .svg → инлайновый SVG, перекрашивается через text-primary (акцент)
    //   .png/.jpg → показывается как есть
    logoImage: "/logo.svg",

    // Текстовый логотип (две строки) — резерв, когда logoImage пуст.
    logoText: BRAND_NAME,
    logoSubText: "",

    // Фавикон (вкладка браузера). public/<файл> — иконка вкладки.
    favicon: "/logo.svg",
    // Цвет логотипа в фавиконе.
    faviconColor: "#14B8A6",
    // Подложка фавикона. Пусто = прозрачная.
    faviconBg: "",
    icon: "/icon-192.png",
    appleIcon: "/apple-touch-icon.png",
    manifestName: BRAND_NAME,
    manifestShortName: BRAND_NAME,

    // Генерация логотипа и иконок (1 → favicon/PNG/ICO/маск).
    logoZoom: 1.1,
    logoFill: "#14B8A6",
  },

  // ---- Палитра white-label (стоматологическая, неоморфизм) ------------------
  colors: {
    colorPrimary: "#14B8A6", // бирюзовый (акцент)
    colorPrimaryDark: "#0D9488",
    colorPrimaryLight: "#CCFBF1",
    colorInk: "#14393B", // тёмный текст
    colorBg: "#E9EFF5", // светлый холст для «мягких» теней
    secondaryColor: "#22D3EE", // циан (бейджи)
  },

  // ---- Технические параметры (язык, валюта, хранилище) ----------------------
  technical: {
    lang: "ru", // язык <html>, PWA-манифеста
    locale: "ru-RU", // формат дат/чисел
    currency: "₽", // символ валюты во всех ценах
    storagePrefix: "whitedent", // префикс localStorage (запись/заявки)
    pickNow: "Как можно скорее", // пункт «записаться сейчас» при оформлении
    hotDogCategory: "", // не используется (было для фастфуда)
    sizeWord: "", // не используется (было для фастфуда)
    phoneDigits: 11, // длина номера телефона при проверке формы
    phoneStartsWith: "78", // допустимые первые цифры номера
  },

  // ---- Все тексты интерфейса ------------------------------------------------
  t: {
    // Навигация (верхняя панель)
    nav: {
      home: "Главная",
      menu: "Услуги",
      reviews: "Отзывы",
      location: "Как добраться",
      cart: "Запись",
      hours: "Ежедневно 09:00–20:00",
      orderBadge: "Заявка",
      workingHours: "Приём пациентов",
      address: "Адрес",
      contacts: "Контакты",
      ariaBottom: "Нижняя навигация",
      slidesLabel: "Слайд {n}",
    },

    // Секция услуг на главной
    menuSection: {
      eyebrow: "Услуги",
      title: "Услуги и цены",
      viewAll: "Все услуги",
      all: "Все услуги",
      empty: "Здесь пока нет услуг",
    },

    // Футер
    footer: {
      tagline: "Работаем по записи — принимаем в назначенное время. Оплата в клинике после приёма.",
      sections: "Разделы",
      contacts: "Контакты",
      onMap: "Мы на карте",
    },

    // Блок «Как мы работаем»
    howWeWork: {
      eyebrow: "Как мы работаем",
      title: "Три шага до здоровой улыбки",
      steps: [
        { icon: "calendar", title: "Запись", text: "Выберите услугу и удобное время — заявка отправляется за минуту" },
        { icon: "phone", title: "Подтверждение", text: "Администратор перезвонит и подтвердит запись в удобное время" },
        { icon: "smile", title: "Приём", text: "Приходите в клинику — доктор осмотрит и проведёт лечение без боли" },
      ],
    },

    // Блок «Установи приложение»
    promo: {
      eyebrow: "{brand} - в телефоне",
      title: "Установите приложение — запись в два тапа",
      text: "Услуги и цены под рукой, заявки на приём без звонков и очередей. Работает как обычное приложение.",
      install: "Установить приложение",
    },

    // Отзывы
    reviews: {
      eyebrow: "Отзывы",
      title: "Что говорят пациенты",
      yandexCount: "{n} оценок · Яндекс",
      gisCount: "{n} оценок · 2ГИС",
      all: "Все отзывы",
    },

    // Контакты
    contacts: {
      eyebrow: "Как нас найти",
      yandexLine: "Яндекс Карты · {n} оценок",
      gisLine: "2ГИС · {n} оценок",
      address: "Адрес",
      hours: "Режим работы",
      phoneOrder: "Запись по телефону",
      route: "Построить маршрут",
    },

    // Карта
    map: {
      unavailable: "Карта временно недоступна — откройте в сервисе:",
      openYandex: "Открыть в Яндекс.Картах",
      route: "Маршрут",
      gis: "2ГИС",
    },

    // Запись на приём и оформление
    cart: {
      title: "Запись на приём",
      formTitle: "Оформление записи",
      successTitle: "Заявка отправлена",
      yourOrders: "Мои заявки",
      live: "статус в реальном времени",
      orderNumber: "Заявка №{n}",
      canceledByVenue: "Отменена клиникой",
      canceledByUser: "Отменена вами",
      canceled: "Отменена",
      accepted: "Принята",
      details: "Подробнее в отслеживании",
      empty: "В записи пока пусто",
      emptyHint: "Вернитесь к услугам и выберите процедуру — это займёт минуту",
      totalLabel: "Итого",
      checkout: "Записаться на приём",
      pickupLine: "Приём в клинике · оплата в день визита",
      nameLabel: "Ваше имя",
      namePlaceholder: "Иван",
      phoneLabel: "Телефон",
      phonePlaceholder: "+7 999 123-45-67",
      phoneError: "Введите корректный российский номер: 11 цифр, начинается с 7 или 8",
      pickupTimeLabel: "Удобное время приёма",
      commentLabel: "Жалобы и пожелания",
      commentPlaceholder: "Например: ноющая боль в нижнем зубе…",
      positions: "Услуг",
      payment: "Оплата",
      onReceive: "в клинике",
      submit: "Отправить заявку",
      sending: "Отправляем…",
      backToCart: "Вернуться к записи",
      success: "Заявка №{n} отправлена!",
      successText: "Наш администратор свяжется с вами, чтобы подтвердить время приёма.",
      eta: "Перезвоним в течение {min}-{max} минут",
      toTime: "- к {t}",
      track: "Отследить / отменить",
      done: "Отлично",
      add: "Записать",
    },

    // Страница отслеживания заявки
    orderPage: {
      noAccess: "Нет доступа",
      noAccessText: "Ссылка для просмотра этой заявки недействительна.",
      home: "На главную",
      back: "Назад",
      number: "Заявка №{n}",
      title: "Статус записи",
      units: "шт.",
      total: "Сумма",
    },

    // Статусы заявки (используются в записи, в трекере и в регистратуре)
    orderStatus: {
      new: "Заявка получена",
      cooking: "Подтверждаем запись",
      ready: "Ждём вас на приём",
      done: "Приём завершён",
      canceled: "Отменена",
    },

    // Админка: боковое меню и общие элементы
    admin: {
      panel: "Панель клиники",
      dashboard: "Дашборд",
      orders: "Заявки",
      products: "Услуги",
      categories: "Категории",
      options: "Доп. услуги",
      slides: "Слайды",
      settings: "Настройки",
      more: "Ещё",
      close: "Закрыть",
      openSite: "Открыть сайт",
      kitchen: "Регистратура",
      logout: "Выйти",
      ordersSubtitle: "Управление заявками и статусами",
      dashboardSubtitle: "Обновляется автоматически при изменениях в заявках",
      categoriesTitle: "Категории услуг",
      slidesTitle: "Слайды главной",
      optionsTitle: "Доп. услуги к приёму",
      productsTitle: "Услуги",
      upload: "Загрузка…",
      error: "Ошибка",
      save: "Сохранить",
      saving: "Сохраняем…",
      saveAll: "Сохранить все настройки",
      saved: "Настройки сохранены - обновите сайт, чтобы увидеть изменения",
      saveError: "Ошибка сохранения",
      loading: "Загрузка…",
      brandAndContacts: "Бренд и контакты",
      colorsTitle: "Цвета сайта (white-label)",
      aboutTitle: "Заголовок блока «О нас»",
      aboutText: "Текст блока «О нас»",
      reviewsJson: "Отзывы (JSON: [{name, text, stars}])",
      heroScrim: "Затемнение на промо-слайдере",
      heroScrimHint: "Выключите, чтобы вставить яркое фото без затемнения",
      settingsFields: {
        shopName: "Название клиники",
        slogan: "Слоган",
        phone: "Телефон (как показывать)",
        phoneHref: "Телефон (для звонка, без пробелов)",
        address: "Адрес клиники",
        hoursWeekday: "Часы работы (будни)",
        hoursWeekend: "Часы работы (выходные)",
        instagram: "Ссылка на Instagram",
        instagramHandle: "Instagram (@ник)",
        mapsUrl: "Ссылка на карту",
        gisUrl: "Ссылка на 2ГИС",
        rating: "Рейтинг на 2ГИС",
        reviewCount: "Кол-во отзывов на 2ГИС",
        yandexRating: "Рейтинг на Яндекс.Картах",
        yandexReviewCount: "Кол-во отзывов на Яндексе",
        readyMinutes: "Минут до подтверждения записи",
        vkLink: "Ссылка на ВКонтакте",
        seoTitle: "SEO - заголовок вкладки",
        seoDescription: "SEO - описание для поисковиков",
      },
      colorFields: {
        colorPrimary: "Основной акцент",
        colorPrimaryDark: "Акцент при нажатии",
        colorPrimaryLight: "Светлый акцент (плашки)",
        colorInk: "Тёмный (текст, футер)",
        colorBg: "Фон сайта",
        secondaryColor: "Акцент бейджей",
      },
      loginTitle: "Вход для администратора",
      loginSubtitle: "Управление клиникой",
      passwordPlaceholder: "Пароль администратора",
      login: "Войти",
      loggingIn: "Входим…",
      wrongPassword: "Неверный пароль",
    },

    // Регистратура (бывшая «кухня»)
    kitchen: {
      title: "Регистратура",
      currency: "₽",
      todayCount: "Заявок сегодня",
      inWork: "В работе",
      statusError: "Не удалось изменить статус — заявка уже изменена",
      cancelAria: "Отменить заявку",
      soundToggle: "Звук новых заявок",
      updated: "Обновлено",
      adminShort: "Админ",
      badgeShort: "Регистратура",
      columns: {
        new: "Новые",
        cooking: "Подтверждаются",
        ready: "Готовы к приёму",
        canceled: "Отменена",
      },
      buttons: {
        cooking: "Подтвердить запись",
        ready: "Пациент пришёл",
        done: "Завершить приём",
        reorder: "Вернуть в новые",
      },
    },

    // Офлайн-страница (PWA)
    offline: {
      title: "Нет подключения к интернету",
      text: "Проверьте связь — и вернитесь к записи. Ваша форма сохранена.",
      retry: "Повторить попытку",
      head: "Нет связи",
    },
  },

  // ---- Визуальные параметры интерфейса --------------------------------------
  design: {
    navBg: "#FFFFFF",
    toast: { bg: "#14393B", text: "#FFFFFF", radius: "16px" },
    hero: { height: "54svh", min: "380px", max: "560px", interval: 7000, transition: 1100 },
    skeleton: { from: "#d8e0e8", to: "#edf2f7" },
    mapTile: "saturate(0.85) brightness(1.05) contrast(0.95)",
    adminBg: "#14393B",
    kitchenBg: "#14393B",
  },

  // ---- PWA-манифест ----------------------------------------------------------
  pwa: {
    description: "Стоматологическая клиника: услуги и цены, запись на приём онлайн. {slogan}!",
    shortcuts: { menu: "Услуги", cart: "Запись" },
  },

  // ---- Витрина: контакты -----------------------------------------------------
  contacts: {
    shopName: BRAND_NAME,
    slogan: "Лечим зубы бережно и без боли",
    phone: "+78129873947",
    phoneHref: "78129873947",
    address: "Сестрорецк, ул. Всеволода Боброва, 39",
    hoursWeekday: "Пн-Сб 10:00-20:00",
    hoursWeekend: "Вс 10:00-18:00",
  },

  // ---- Соцсети и карты -------------------------------------------------------
  socials: {
    instagram: "https://www.instagram.com/whitedent.clinic",
    instagramHandle: "@whitedent.clinic",
    vkLink: "",
    tgLink: "",
    mapsUrl: "https://yandex.com/maps/org/avis/159727312795/",
    gisUrl: "https://2gis.ru/biysk/firm/70000001084079477",
  },

  // ---- Плашка рейтинга -------------------------------------------------------
  reviews: {
    rating: "5",
    reviewCount: "450",
    yandexRating: "5",
    yandexReviewCount: "450",
  },

  // ---- Блок «О нас» ----------------------------------------------------------
  about: {
    title: "Лечим зубы с заботой и современными технологиями",
    text: "Собственная лаборатория, микроскоп, безопасная анестезия и доктора, которые умеют слышать пациента. Лечим без боли, честно рассказываем о плане и даём гарантию на работу.",
    reviewsJson: "[]",
  },

  // ---- Карта (дефолтные координаты) -----------------------------------------
  map: {
    lat: "30.001749",
    lng: "60.051223",
    zoom: "16",
  },

  // ---- Разное ----------------------------------------------------------------
  readyMinutes: "15",
  heroScrim: "true",

  // Категория, которую не показываем отдельным разделом в «Наших услугах»
  sauceCategory: "",

  // ---- SEO -------------------------------------------------------------------
  seo: {
    title: "",
    description: "",
    // Фолбэки, если в конфиге выше пусто (шаблон подставит название/адрес/телефон):
    fallbackTitle: "{shop} - {slogan}",
    fallbackDescription:
      "{shop}: стоматологическая клиника в Бийске — лечение, диагностика, имплантация, гигиена и отбеливание. {address}. Запись на приём: {phone}",
  },

  // ============================================================================
  // ДЕФОЛТНОЕ МЕНЮ (mock-режим / первичный сид). В «боевом» режиме
  // услуги управляются из админки; здесь хранится «эталон» для редизайна.
  // ============================================================================

  // Категории услуг.
  menuCategories: [
    { name: "Консультация и диагностика", emoji: "🦷", icon: "stethoscope", sortOrder: 1, active: true },
    { name: "Лечение и реставрация", emoji: "🩺", icon: "tooth", sortOrder: 2, active: true },
    { name: "Хирургия и имплантация", emoji: "🧬", icon: "implant", sortOrder: 3, active: true },
    { name: "Гигиена и отбеливание", emoji: "✨", icon: "toothbrush", sortOrder: 4, active: true },
    { name: "Эстетика и исправление", emoji: "😁", icon: "smile", sortOrder: 5, active: true },
  ],

  // Услуги. categoryId указывает на порядок в menuCategories (1..N).
  // В витрине показываем услуги с иконками (без фото) — чисто и быстро.
  menuProducts: [
    // КОНСУЛЬТАЦИЯ И ДИАГНОСТИКА (1)
    { name: "Консультация стоматолога", categoryId: 1, icon: "stethoscope", hit: true, sortOrder: 1, description: "Полный осмотр полости рта, план лечения и честный расчёт стоимости", sizes: [{ label: "Осмотр", price: 1000 }] },
    { name: "Панорамный снимок (ОПТГ)", categoryId: 1, icon: "scan", sortOrder: 2, description: "Снимок всех зубов за одно посещение — основа диагностики", sizes: [{ label: "ОПТГ", price: 1500 }] },
    { name: "Компьютерная томография (3D)", categoryId: 1, icon: "scan", isNew: true, sortOrder: 3, description: "Точная 3D-модель челюсти для планирования лечения", sizes: [{ label: "3D-томография", price: 3500 }] },

    // ЛЕЧЕНИЕ И РЕСТАВРАЦИЯ (2)
    { name: "Лечение кариеса", categoryId: 2, icon: "tooth", hit: true, sortOrder: 1, description: "Лечим без боли: местная анестезия, современные материалы, гарантия на пломбу", sizes: [{ label: "Под ключ", price: 5500 }] },
    { name: "Лечение корневых каналов", categoryId: 2, icon: "tooth", sortOrder: 2, description: "Под микроскопом: чистка, дезинфекция и герметичное пломбирование канала", sizes: [{ label: "1 канал", price: 6500 }] },
    { name: "Художественная реставрация", categoryId: 2, icon: "tooth", sortOrder: 3, description: "Восстанавливаем форму и цвет зуба незаметно для окружающих", sizes: [{ label: "1 зуб", price: 7000 }] },
    { name: "Виниры", categoryId: 2, icon: "tooth", sortOrder: 4, description: "Тонкие керамические накладки — голливудская улыбка за несколько визитов", sizes: [{ label: "1 винир", price: 26000 }] },

    // ХИРУРГИЯ И ИМПЛАНТАЦИЯ (3)
    { name: "Удаление зуба", categoryId: 3, icon: "implant", hit: true, sortOrder: 1, description: "Аккуратное удаление с сохранением кости — под анестезией, без боли", sizes: [{ label: "Простое", price: 3000 }] },
    { name: "Имплантация под ключ", categoryId: 3, icon: "implant", sortOrder: 2, description: "Имплант + установка абатмента + коронка. Гарантия до 5 лет", sizes: [{ label: "1 имплант", price: 45000 }] },
    { name: "Костная пластика", categoryId: 3, icon: "implant", isNew: true, sortOrder: 3, description: "Восстановление объёма костной ткани перед имплантацией", sizes: [{ label: "1 участок", price: 28000 }] },

    // ГИГИЕНА И ОТБЕЛИВАНИЕ (4)
    { name: "Профессиональная гигиена AirFlow", categoryId: 4, icon: "toothbrush", hit: true, sortOrder: 1, description: "Ультразвук + AirFlow + полировка: чистота и свежесть за один визит", sizes: [{ label: "Полный курс", price: 4500 }] },
    { name: "Отбеливание Zoom 4", categoryId: 4, icon: "toothbrush", isNew: true, sortOrder: 2, description: "Осветление эмали на 6-8 тонов за сеанс — безопасно для зубов", sizes: [{ label: "1 сеанс", price: 18000 }] },
    { name: "Реминерализация эмали", categoryId: 4, icon: "toothbrush", sortOrder: 3, description: "Укрепляем эмаль кальцием и фтором, снимаем чувствительность", sizes: [{ label: "1 зубной ряд", price: 2500 }] },

    // ЭСТЕТИКА И ИСПРАВЛЕНИЕ (5)
    { name: "Брекет-система", categoryId: 5, icon: "smile", hit: true, sortOrder: 1, description: "Исправляем прикус в любом возрасте. Металлические и керамические брекеты", sizes: [{ label: "1 челюсть", price: 42000 }] },
    { name: "Элайнеры", categoryId: 5, icon: "smile", isNew: true, sortOrder: 2, description: "Прозрачные капы для выравнивания зубов — почти незаметны", sizes: [{ label: "1 комплект", price: 120000 }] },
  ],

  // Опции (дополнительные услуги к приёму).
  menuOptions: [
    { name: "Анестезия", price: 500, sortOrder: 1, group: "addon" },
    { name: "Седация (закись азота)", price: 4500, sortOrder: 2, group: "addon" },
    { name: "Лечение под микроскопом", price: 2000, sortOrder: 3, group: "addon" },
    { name: "Прицельный рентген-снимок", price: 500, sortOrder: 4, group: "addon" },
    { name: "Коффердам (изоляция)", price: 800, sortOrder: 5, group: "addon" },
    { name: "Временная коронка", price: 3000, sortOrder: 6, group: "addon" },
  ],

  // Промо-слайды на главной.
  menuSlides: [
    { chip: `${BRAND_NAME} • стоматология`, title: "Лечим зубы бережно и без боли", subtitle: "Современная стоматология под ключ: диагностика, лечение, имплантация и гигиена. Запишитесь онлайн за минуту.", ctaText: "Услуги и цены", ctaLink: "/#menu", cta2Text: "Как добраться", cta2Link: "/#contacts", active: true, sortOrder: 1 },
    { chip: "Хит", title: "Профессиональная гигиена за 60 минут", subtitle: "AirFlow + ультразвук + полировка: верните эмали белизну и блеск за один визит.", ctaText: "Записаться", ctaLink: "/#menu", cta2Text: "", cta2Link: "", active: true, sortOrder: 2 },
    { chip: "Собственная лаборатория", title: "Имплантация и протезирование под ключ", subtitle: "Восстанавливаем улыбку даже в сложных случаях — с гарантией до 5 лет.", ctaText: "Узнать стоимость", ctaLink: "/#menu", cta2Text: "Контакты", cta2Link: "/#contacts", active: true, sortOrder: 3 },
  ],
};

// Разворачивает конфиг в «плоскую» map настроек для /api/settings и mock-базы.
// Ключи совпадают с полями, которые понимает админка.
export function siteSettingsMap() {
  const { colors, contacts, socials, reviews, about, map, seo, brand } = siteConfig;
  return {
    // контакты
    shopName: contacts.shopName,
    slogan: contacts.slogan,
    phone: contacts.phone,
    phoneHref: contacts.phoneHref,
    address: contacts.address,
    hoursWeekday: contacts.hoursWeekday,
    hoursWeekend: contacts.hoursWeekend,
    // соцсети/карты
    instagram: socials.instagram,
    instagramHandle: socials.instagramHandle,
    vkLink: socials.vkLink,
    tgLink: socials.tgLink,
    mapsUrl: socials.mapsUrl,
    gisUrl: socials.gisUrl,
    // рейтинг
    rating: reviews.rating,
    reviewCount: reviews.reviewCount,
    yandexRating: reviews.yandexRating,
    yandexReviewCount: reviews.yandexReviewCount,
    // цвета
    ...colors,
    // «о нас»
    aboutTitle: about.title,
    aboutText: about.text,
    reviewsJson: about.reviewsJson,
    // карта
    mapLat: map.lat,
    mapLng: map.lng,
    mapZoom: map.zoom,
    // разное
    readyMinutes: siteConfig.readyMinutes,
    heroScrim: siteConfig.heroScrim,
    // seo
    seoTitle: seo.title,
    seoDescription: seo.description,
    logo: brand.logoImage || "",
  };
}