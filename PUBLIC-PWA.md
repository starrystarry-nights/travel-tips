# Public offline PWA

The public build reuses the existing React application and all seven days. It has no ChatGPT sign-in, Worker, database, or server requirement. The original Sites build remains available.

```sh
npm ci
npm run build:public
npm run test:offline
```

`dist-public/` is deployable to any HTTPS static host. The default URL is `https://starrystarry-nights.github.io/travel-tips/`. For a different host, set `PUBLIC_BASE_PATH=/` and `PUBLIC_SITE_URL=https://your-domain/` before building.

## Publishing

The `Publish public offline PWA` Actions workflow builds, verifies, uploads and deploys the site after each main-branch push. If GitHub disallows automatic Pages enablement, the repository owner must open Settings → Pages → Build and deployment → Source → GitHub Actions once, then rerun the workflow. This is a repository hosting setting; visitors never need GitHub or ChatGPT accounts.

## Offline behavior

The application shell, bundled JavaScript, CSS and PNG install icons are installed first. On the home screen, choose 下载离线包 to cache all bundled photos and attempt the existing external image URLs. Interrupted downloads preserve completed resources and can be retried. A download is not reported complete while required resources are absent. Avoid downloading over a limited mobile connection (approximately 27 MB plus external photos).

Weather and map tiles remain online services. Offline pages explicitly explain these limits; route points and written location details remain available. No map tiles are bulk-downloaded. External image availability depends on the original image host. Browser storage can be evicted; checking the offline package before travel is recommended.

A new build changes the worker's content hash. The user can apply the waiting update without deleting personal records. Cache cleanup is scoped to this PWA's path and keeps the previous generation for open tabs. Non-HTML requests never receive the application HTML as a fallback.

## Personal data

Checklist progress and place notes use the existing localStorage keys. Uploaded inspiration images stay in IndexedDB. Sharing sends only the public application link, never notes, checklists or personal images. Origin changes isolate storage: records on the old chatgpt.site URL do not automatically migrate to github.io. Do not clear browser data if those records are needed.
