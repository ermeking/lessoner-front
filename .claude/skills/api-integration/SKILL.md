---
name: api-integration
description: "Работа с API в edu-web через сгенерированный Kubb клиент — серверные запросы, хуки TanStack Query, мутации с инвалидацией кеша, обработка ошибок по кодам и серверная валидация форм. Используй этот скилл всегда, когда нужно получить или изменить данные, подключить новый эндпоинт, обработать ошибку API или связать форму с сервером."
---

# Интеграция с API

Весь обмен с API идёт через код, сгенерированный Kubb из OpenAPI. Благодаря этому типы на фронте всегда совпадают с бэкендом. Ручной `fetch` разрушает эту гарантию, поэтому он запрещён.

## Шаг 1. Обнови клиент

```bash
pnpm api:gen      # API должен быть запущен локально
```

Найди в `src/gen` функцию и хук для нужного `operationId`. Имена строятся из `operationId`: например, `learning_getLessonState` превращается в функцию `learningGetLessonState` и хук `useLearningGetLessonState`. Точные сигнатуры смотри в сгенерированных файлах — они зависят от `kubb.config.ts`.

**Эндпоинта нет?** Не пиши запрос вручную. Опиши в PR, какой эндпоинт нужен (метод, путь, вход, выход), и сделай остальную часть задачи.

## Шаг 2. Выбери способ

| Ситуация | Способ |
|---|---|
| Данные для серверной страницы | Серверная обёртка в `features/<фича>/server.ts` |
| Данные в интерактивном компоненте | Query-хук Kubb |
| Любое изменение данных | Mutation-хук Kubb в браузере |

## Серверная обёртка

```ts
// features/catalog/server.ts
import 'server-only';
import { cache } from 'react';
import { isApiError } from '@/lib/api/errors';
import { catalogGetCourse } from '@/gen';           // путь по kubb.config.ts
import type { AppLocale } from '@/i18n/routing';

export const getCourseServer = cache(async (slug: string, locale: AppLocale) => {
  try {
    return await catalogGetCourse(slug, { locale }); // для динамических страниц клиент сам пробросит куку
  } catch (e) {
    if (isApiError(e) && e.status === 404) return null; // страница вызовет notFound()
    throw e; // остальное — в error.tsx
  }
});
```

## Мутация с инвалидацией

```tsx
'use client';
import { useQueryClient } from '@tanstack/react-query';
import {
  useLearningSubmit,
  learningGetLessonStateQueryKey,
  learningGetDashboardQueryKey,
} from '@/gen';

export function useSubmitExercise(lessonId: string) {
  const qc = useQueryClient();
  return useLearningSubmit({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: learningGetLessonStateQueryKey(lessonId) });
        qc.invalidateQueries({ queryKey: learningGetDashboardQueryKey() });
      },
    },
  });
}
```

Что инвалидировать — думай от пользователя: какие экраны после этого действия должны показать новое? Если изменились данные серверно отрендеренной страницы (например, оглавление урока), дополнительно вызови `router.refresh()`.

## Обработка ошибок

- Все ошибки — `ApiError { status, code, details? }`.
- Текст для пользователя — только перевод кода: `useApiErrorMessage(error)` из `lib/api/errors` возвращает `t('errors.<code>')` или общий текст для неизвестного кода.
- Коды, у которых есть особый сценарий, обрабатываются явно: `LESSON_LOCKED` — ссылка на урок, который нужно завершить; `COURSE_NOT_PURCHASED` — экран «доступно после покупки»; `UNAUTHORIZED` — предложение войти.

## Формы и серверная валидация

```tsx
const form = useForm<Values>({ resolver: zodResolver(schemaFromKubb) });

const onSubmit = form.handleSubmit(async (values) => {
  try {
    await mutation.mutateAsync({ data: values });
  } catch (e) {
    if (isApiError(e) && e.code === 'VALIDATION_ERROR') {
      e.details?.forEach((d) =>
        form.setError(d.field as keyof Values, { message: t(`errors.validation.${d.rule}`) }),
      );
      return;
    }
    toast.error(getApiErrorMessage(e, t));
  }
});
```

Клиентская zod-схема (от Kubb) ловит очевидные ошибки до запроса, серверная валидация остаётся источником истины.

## Частые ошибки

- Показать `error.message` с сервера пользователю — это текст для логов, он не переведён.
- Забыть инвалидацию: пользователь сдал задание, а оглавление всё ещё показывает замок.
- Вызвать серверную обёртку из клиентского компонента — `server-only` не даст собраться.
- Держать копию серверных данных в `useState` — источник истины — кеш TanStack Query.
