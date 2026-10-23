# Static catalog and proxy guides

Build with `node scripts/build-site.cjs`. The generated site is in `public/`; its pages, assets and sitemap are committed with the build source. The root `index.html` is the existing application template, not the production document root. Legacy hosting files in the repository root do not configure the deployed origin.

The build generates the catalog, four existing service pages, the blog index and twelve approved articles. It preserves the template stylesheet verbatim. Additional styles are loaded only by blog and article pages. Content is rendered into HTML before delivery, with unique metadata, canonical URLs, social metadata and structured data. Article source content is in `content/expanded-articles.json` and the build script.

Run `node scripts/verify-site.cjs` after building. It checks the original stylesheet, metadata, canonical URLs, structured data, article source links, internal navigation and the production API/analytics integration. Local preview fixtures are not part of production.

The origin is served with `deploy/origin/compose.yaml` over the existing private network. Its canonical service uses `nginx-seo.conf` and the generated document root, while the existing web service retains its original configuration and template. The existing systemd unit starts both compose services on boot. The corresponding relay configuration is in `deploy/relay/mtproxytg.caddy`. Both entry domains retain their random redirects. Only allowlisted wildcard hosts serve the catalog and guides. Nginx replaces the build-time base URL with the requested hostname in HTML, robots and sitemap responses, so canonical and structured-data URLs remain on the current subdomain. The private allowlist remains outside this repository.

Before deploying, back up the origin checkout and service definition and the relay configuration. Validate nginx and Caddy configuration before switching traffic. Rollback restores the saved checkout and compose configuration on the origin and the saved relay configuration, then restarts the site container and reloads Caddy.

Production requests retain the existing encrypted API format, proxy placement ordering and analytics integration. No private subdomain pool, credentials, certificates or server backups belong in this repository.
