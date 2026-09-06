# Andrew Artemiev — Personal Site

Премиальный персональный сайт-визитка. Editorial · Minimal · Confident · Expensive.

## Стек

Чистый статический сайт: HTML + CSS + минимальный JS. Без сборщиков, без тяжёлых
библиотек. Разворачивается на любом статик-хостинге (GitHub Pages, Vercel,
Netlify, Cloudflare Pages).

```
.
├── index.html
├── styles.css
├── script.js
└── assets/
    ├── favicon.svg
    ├── og.svg            ← Open Graph превью (замените на JPG/PNG для лучшей совместимости соцсетей)
    ├── hero.jpg          ← добавьте свою фотографию (портрет, портретная ориентация)
    └── about.jpg         ← добавьте вторую фотографию (портрет, портретная ориентация)
```

## Как добавить свои фотографии

1. Положите фотографию на первый экран как `assets/hero.jpg`
   (рекомендуемое соотношение сторон 4:5, ширина ≥ 1200px).
2. Положите вторую фотографию как `assets/about.jpg`
   (соотношение 4:5, ширина ≥ 1200px).
3. Пока файлов нет, сайт автоматически показывает элегантные заглушки
   в стиле дизайна — сломать вёрстку невозможно.

## Локальный запуск

```bash
python3 -m http.server 8080
# затем откройте http://localhost:8080
```

## Что уже сделано

- 7 смысловых блоков: Hero → About → Numbers → Now → Approach → Socials → Contact
- Единственный CTA — Telegram `@andrewsmm1` (https://t.me/andrewsmm1)
- Editorial-типографика (Inter Tight), большой whitespace, тонкие линии
- Плавные fade-in анимации при скролле, лёгкий parallax на hero
- Sticky top-nav с blur при скролле, мобильное меню
- Полная адаптация (desktop / tablet / mobile)
- Semantic HTML, скип-линк, aria-атрибуты, keyboard-friendly
- SEO: title, meta description, Open Graph, Twitter Card
- Favicon (SVG)
- Уважает `prefers-reduced-motion`

## Чего сознательно нет

Кейсов, отзывов, форм, тарифов, "оставить заявку", таймеров, всплывающих окон,
скриншотов заработков, поп-апов, поп-ин пикселей и любой продающей воронки.
Сайт продаёт доверие к личности, а не услугу.
