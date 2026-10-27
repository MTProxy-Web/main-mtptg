# Static catalog and proxy guides

GitHub Pages serves the repository root from `simple-html`, using the custom domain in `CNAME`. The root `index.html` is the catalog application and the build template. Both proxy lists use their dedicated HTTPS API origins because GitHub Pages does not serve `/v1/` endpoints.

Build with `node scripts/build-site.cjs` to generate the separate origin site in `public/`; its pages, assets and sitemap are committed with the build source. Hosting files in the repository root do not configure that origin.

The build generates the catalog, four existing service pages, the blog index and twelve approved articles. It preserves the template stylesheet verbatim. Additional styles are loaded only by blog and article pages. Content is rendered into HTML before delivery, with unique metadata, canonical URLs, social metadata and structured data. Article source content is in `content/expanded-articles.json` and the build script.

Run `node scripts/verify-site.cjs` after building. It checks the original stylesheet, metadata, canonical URLs, structured data, article source links, internal navigation and the production API/analytics integration. Local preview fixtures are not part of production.

An optional origin deployment uses `deploy/origin/compose.yaml` over the existing private network. Its canonical service uses `nginx-seo.conf` and the generated document root; the web service uses the root application template. Nginx replaces the build-time base URL with the requested hostname in HTML, robots and sitemap responses. Relay hostnames and entry redirects are configured separately from GitHub Pages. Private host allowlists remain outside this repository.

Before deploying, back up the origin checkout and service definition and the relay configuration. Validate nginx and Caddy configuration before switching traffic. Rollback restores the saved checkout and compose configuration on the origin and the saved relay configuration, then restarts the site container and reloads Caddy.

Production requests retain the existing encrypted API format, proxy placement ordering and analytics integration. No private subdomain pool, credentials, certificates or server backups belong in this repository.
