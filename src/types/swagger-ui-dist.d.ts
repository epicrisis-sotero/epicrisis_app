// swagger-ui-dist no trae tipos. Solo declaramos lo que usamos.
declare module 'swagger-ui-dist/swagger-ui-bundle.js' {
  interface SwaggerUIOptions {
    spec?: Record<string, unknown>
    domNode?: HTMLElement | null
    syntaxHighlight?: boolean | { activated: boolean }
    defaultModelExpandDepth?: number
    defaultModelRendering?: string
    persistAuthorization?: boolean
    tryItOutEnabled?: boolean
    requestInterceptor?: (req: { headers: Record<string, string> }) => unknown
  }
  const SwaggerUIBundle: (options: SwaggerUIOptions) => unknown
  export default SwaggerUIBundle
}
declare module 'swagger-ui-dist/swagger-ui.css'
