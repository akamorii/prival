export const config = {
  // Пусто = относительные пути (/api/..., /uploads/...) — так и должно быть в docker-compose,
  // там nginx проксирует их на backend с того же origin. Задайте VITE_API_URL только для
  // локального `npm run dev`, когда фронтенд (5173) и бэкенд (8000) на разных портах напрямую.
  apiBaseUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? '',
  cafeName: 'ПРИВАЛ',
  cafeTagline: 'В походе | На месте | В поездке',
};
