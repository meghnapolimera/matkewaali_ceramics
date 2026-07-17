/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_IDENTITY_POOL_ID: string
  readonly VITE_AWS_REGION: string
  readonly VITE_SQUARE_APP_ID: string
  readonly VITE_SQUARE_LOCATION_ID: string
  readonly VITE_ASSETS_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}
