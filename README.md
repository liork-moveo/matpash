# מתפ״ש — קווי המותג (Demo 1)

Static, mobile-first prototype for the מתפ״ש brand site. Pure HTML/CSS/JS —
no build step, no external API keys. Built for a ~390px phone viewport.

**Live (GitHub Pages):** https://liork-moveo.github.io/matpash/

## Run locally
Must be served over HTTP (the `<video>` elements break under `file://`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000/  in a mobile viewport (~390×844)
```

## Structure
- `index.html` · `style.css` · `app.js` — the whole app
- `assets/` — videos, posters, maps, thumbnails, icons
