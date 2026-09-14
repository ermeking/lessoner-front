---
name: new-page
description: "Создание новой страницы или маршрута в edu-web (Next.js App Router с префиксом языка) — выбор режима рендера, загрузка данных, метаданные и hreflang, состояния загрузки и ошибок, мобильная вёрстка. Используй этот скилл всегда, когда задача добавляет страницу, меняет маршрут или переделывает структуру существующей страницы — публичной, кабинета или админки."
---

# Новая страница в edu-web

## Шаг 1. Определи параметры страницы

По таблице `docs/ARCHITECTURE-FRONTEND.md`, раздел 4, определи:

| Вопрос | Варианты |
|---|---|
| Группа маршрутов | `(public)`, `(auth)`, `(cabinet)` (нужен вход), `admin` (нужна роль) |
| Режим рендера | Кешируемая (`revalidate: 60`, данные без куки) или динамическая (данные с кукой) |
| Индексация | Публичные — да, с метаданными и hreflang; кабинет, админка, auth — `noindex` |
| Данные | Какие `operationId` нужны (`edu-api/docs/ARCHITECTURE-FRONTEND.md`, раздел 6, или `src/gen`) |

Если страницы нет в архитектуре — добавь её в таблицу раздела 4 в этом же PR.

## Шаг 2. Разложи файлы

```
src/app/[locale]/(public)/courses/[course]/
├─ page.tsx        тонкий: данные + метаданные + компонент фичи
├─ loading.tsx     скелетон (для динамических страниц)
src/features/catalog/
├─ server.ts       серверные обёртки над запросами (import 'server-only', cache())
├─ course-page.tsx компонент страницы
└─ …               мелкие компоненты фичи
```

`error.tsx` на уровне группы уже есть; добавляй свой, только если странице нужен особый экран ошибки.

## Шаг 3. Шаблон `page.tsx`

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { AppLocale } from '@/i18n/routing';
import { buildAlternates } from '@/shared/lib/seo';
import { getCourseServer } from '@/features/catalog/server';
import { CoursePage } from '@/features/catalog/course-page';

type Props = { params: Promise<{ locale: AppLocale; course: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, course } = await params;
  const data = await getCourseServer(course, locale); // cache() — запрос не повторится в Page
  if (!data) return {};
  return {
    title: data.title,
    description: data.shortDescription,
    alternates: buildAlternates(`/courses/${course}`, locale), // canonical + hreflang ru/ky/en
  };
}

export default async function Page({ params }: Props) {
  const { locale, course } = await params;
  setRequestLocale(locale);
  const data = await getCourseServer(course, locale);
  if (!data) notFound();
  return <CoursePage course={data} />;
}
```

Для кешируемой страницы добавь `export const revalidate = 60;` и запрашивай данные без куки. Для страницы кабинета проверка входа уже сделана в layout группы `(cabinet)` — повторять её не нужно.

## Шаг 4. Тексты и SEO

- Все тексты — через `getTranslations` / `useTranslations`, новые ключи по скиллу `i18n-keys`.
- Публичная страница: `title`, `description`, `alternates` через `buildAlternates`. Если страница должна быть в карте сайта — проверь `src/app/sitemap.ts`.
- Непубличная страница: `robots: { index: false }` в метаданных.

## Шаг 5. Состояния и вёрстка

- **Загрузка:** скелетон, повторяющий форму контента, а не спиннер на весь экран.
- **Ошибка:** текст по коду ошибки (`errors.<code>`), для 404 — `notFound()`.
- **Пусто:** понятное сообщение и действие («Начните с бесплатного курса»).
- **Проверка:** ширина 375 px, тёмная тема, навигация с клавиатуры.

## Частые ошибки

- `'use client'` на всю страницу из-за одной кнопки — вынеси кнопку в отдельный клиентский компонент.
- Двойной запрос в `generateMetadata` и `Page` без `cache()`.
- Ссылки через `next/link` вместо `Link` из `@/i18n/navigation` — теряется языковой префикс.
- Динамическая страница, которая могла быть кешируемой (или наоборот): режим берётся из архитектуры, а не на глаз.
