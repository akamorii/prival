export const config = {
  apiBaseUrl: import.meta.env.VITE_API_URL as string | undefined,
  adminPasscode: (import.meta.env.VITE_ADMIN_PASSCODE as string | undefined) ?? 'privaladmin',
  cafeName: 'ПРИВАЛ',
  cafeTagline: 'В походе | На месте | В поездке',
};
