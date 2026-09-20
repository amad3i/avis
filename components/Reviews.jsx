import React from "react";
import Icon from "./icons";
import ReviewRotator from "./ReviewRotator";
import { getSettings } from "@/lib/data";
import { parseGallery } from "@/lib/format";
import { siteConfig, fmt } from "@/lib/site.config";

const DEFAULT_REVIEWS = [
  {
    name: "Ксения И.",
    stars: 5,
    text: "Боялась лечить зубы всю жизнь. Здесь всё прошло на удивление спокойно: анестезия даже не почувствовалась, доктор всё время объяснял, что делает.",
  },
  {
    name: "Денис Я.",
    stars: 5,
    text: "Лечил кариес на верхней пятёрке. Удобно, что записался онлайн и не ждал в очереди: пришёл — и сразу к врачу.",
  },
  {
    name: "Антон Г.",
    stars: 5,
    text: "Поставил имплант под ключ. Понравилось, что заранее назвали точную стоимость и не добавили ничего по пути. Гарантия 5 лет — спокойно на душе.",
  },
  {
    name: "Александр С.",
    stars: 5,
    text: "Делал профессиональную чистку AirFlow. Зубы после неё как после похода к стоматологу в детстве — гладкие и чистые. Всем советую!",
  },
  {
    name: "Глеб К.",
    stars: 5,
    text: "Клиника без страха и паники. Приходил на удаление — всё быстро и аккуратно, потом перезвонили, спросили как самочувствие.",
  },
  {
    name: "Иван К.",
    stars: 5,
    text: "Реставрировал передний зуб после скола. Незаметно вообще, цвет подобрали идеально. Спасибо врачу за аккуратность!",
  },
  {
    name: "Анастасия Г.",
    stars: 5,
    text: "Отбеливала зубы Zoom 4 — эффект уже после первого сеанса. Доктор подробно рассказала, как ухаживать, чтобы результат держался дольше.",
  },
  {
    name: "Матвей Ф.",
    stars: 5,
    text: "Начал носить элайнеры полгода назад. Никто из знакомых даже не заметил, а зубы уже заметно выровнялись.",
  },
  {
    name: "Денис Р.",
    stars: 5,
    text: "Возили сына на лечение кариеса: посмотрел мультик, не плакал и не боялся. Огромное спасибо, что умеете работать с детьми.",
  },
  {
    name: "Дмитрий Е.",
    stars: 5,
    text: "Сделали 3D-томографию и ОПТГ за один визит, всё подробно объяснили и нарисовали план лечения на экране. Видно, что люди искренне любят своё дело.",
  },
  {
    name: "Nikita M.",
    stars: 5,
    text: "Остался очень доволен приёмом: современное оборудование, микроскоп, всё стерильно. Лечение каналов прошло без боли.",
  },
  {
    name: "Екатерина В.",
    stars: 5,
    text: "Ставлю коронки в этой клинике второй раз. Первая уже три года — как новая. Цены честные, качество на высоте.",
  },
  {
    name: "Максим К.",
    stars: 5,
    text: "Понравилось, что администратор сама перезвонила и напомнила о приёме. Пришёл вовремя — и меня уже ждали. Сервис топ.",
  },
  {
    name: "Денис З.",
    stars: 5,
    text: "Удалили зуб мудрости без осложнений. Через день уже забыл о нём. Спасибо хирургу за бережность.",
  },
  {
    name: "Эльвира В.",
    stars: 5,
    text: "Подлечила передние зубы винирами — улыбка стала любимой! Доктор помог выбрать оттенок так, чтобы всё выглядело естественно.",
  },
  {
    name: "Павел Б.",
    stars: 5,
    text: "Лечу зуб здесь, а раньше трясся в кресле. Врачи реально умеют делать так, чтобы было не больно и даже расслабляюще.",
  },
];

const Stars = ({ n = 5, className = "text-primary" }) => (
  <div className={`flex gap-0.5 ${className}`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} viewBox="0 0 24 24" className="w-4 h-4" fill={i < n ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
        <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.9L12 3.5Z" strokeLinejoin="round" />
      </svg>
    ))}
  </div>
);

const RatingCard = ({ href, rating, stars, caption }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 bg-cream neu-xs rounded-2xl px-5 py-3 hover:text-primary transition"
  >
    <p className="text-2xl font-extrabold text-primary">{rating}</p>
    <div>
      {stars}
      <p className="text-[11px] text-subtle font-medium mt-0.5">{caption}</p>
    </div>
  </a>
);

const Reviews = async () => {
  const s = await getSettings();
  const fromSettings = parseGallery(s.reviewsJson);
  const reviews = fromSettings.length ? fromSettings : DEFAULT_REVIEWS;
  const L = siteConfig.t.reviews;

  return (
    <section id="reviews" className="mt-16 md:mt-24 scroll-mt-20">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-primary flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {L.eyebrow}
          </p>
          <h2 className="h2 text-ink mt-2">{L.title}</h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <RatingCard
            href={s.mapsUrl}
            rating={s.yandexRating}
            stars={<Stars n={Math.round(Number(s.yandexRating.replace(",", ".")) || 0)} />}
            caption={fmt(L.yandexCount, { n: s.yandexReviewCount })}
          />
          <RatingCard
            href={s.gisUrl}
            rating={s.rating}
            stars={<Stars n={Math.round(Number(s.rating.replace(",", ".")) || 0)} />}
            caption={fmt(L.gisCount, { n: s.reviewCount })}
          />
        </div>
      </div>

      <ReviewRotator reviews={reviews} />

      <div className="text-center mt-8">
        <a
          href={s.gisUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold text-ink hover:text-primary transition"
        >
          {L.all}
          <Icon name="arrowRight" className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
};

export default Reviews;
