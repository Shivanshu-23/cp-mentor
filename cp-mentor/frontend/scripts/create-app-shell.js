// Angular's SSR/prerender build always server-renders the literal "/" route
// into dist/browser/index.html (in this app, "/" redirects to "/patterns",
// so that file has real Pattern Library content baked in). That's correct
// for a request to "/" itself, but vercel.json's SPA-fallback rewrite reuses
// this same file for every route that ISN'T one of the ~27 explicitly
// prerendered ones (see routes.txt) — which meant a fresh visit to /login,
// /home, /company-tracker etc. briefly flashed Pattern Library content
// before Angular's hydration-mismatch recovery re-rendered the right page.
//
// Fix: emit a second, genuinely neutral file (empty <app-root>, same script
// tags) for the fallback to target instead, leaving index.html itself
// untouched (it's still correct for literal "/" requests).
const fs = require('fs');
const path = require('path');

const browserDir = path.join(__dirname, '..', 'dist', 'cp-mentor-frontend', 'browser');
const indexPath = path.join(browserDir, 'index.html');
const shellPath = path.join(browserDir, 'app-shell.html');

const html = fs.readFileSync(indexPath, 'utf8');

const shell = html.replace(/<app-root\b[^>]*>[\s\S]*?<\/app-root>/, '<app-root></app-root>');

if (shell === html) {
  throw new Error('create-app-shell: did not find an <app-root> element to strip in ' + indexPath);
}

fs.writeFileSync(shellPath, shell);
console.log('Wrote neutral SPA-fallback shell to ' + shellPath);
