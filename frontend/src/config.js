export const BACKEND_URL =
    import.meta.env.VITE_ENV === 'production'
        ? `${import.meta.env.VITE_PROD_API_BASE_URL || ''}/api/v1`
        : 'http://localhost:3000/api/v1';
