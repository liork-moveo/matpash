/* ============================================================================
   מתפ״ש — Demo 1 (brand site)  ·  Single-Page App
   One index.html, three views (home / role / map). app.js shows/hides them
   based on the URL hash, so it feels like a seamless app with no page reloads.

   Routes:  #home (default) · #mosaic (home, pre-assembled) · #role/<slug> · #map

   ▸ ALL editable content lives in the CONFIG block below — tiles, menu, roles,
     and bases. Change copy / colours / media there; the logic beneath rarely
     needs touching.
   ============================================================================ */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════
     CONFIG  ·  edit content here
     ══════════════════════════════════════════════════════════════════════ */
  const PATH = { icons: 'assets/icons/', videos: 'assets/videos/', maps: 'assets/maps/', posters: 'assets/posters/' };
  const roleIcon = slug => PATH.icons + 'role-' + slug + '.svg';

  /* Home — mosaic tiles (order = visual tile-1…tile-8).
     `bg`/`fg` are CSS custom-property names from style.css :root. */
  const TILES = [
    { slug: 'tashtit',   title: 'תשתית',         bg: '#e0c895', fg: '#4a4847' },
    { slug: 'ezrahi',    title: 'תיאום אזרחי',   bg: '#a2a874', fg: '#ffffff' },
    { slug: 'dovrut',    title: 'דוברות והסברה', bg: '#e2d7d4', fg: '#4a4847' },
    { slug: 'mivtsaim',  title: 'מבצעים',        bg: '#4c5466', fg: '#ffffff' },
    { slug: 'kishrei',   title: 'קשרי חוץ',      bg: '#957970', fg: '#ffffff' },
    { slug: 'bitachoni', title: 'תיאום ביטחוני', bg: '#cad4d0', fg: '#4a4847' },
    { slug: 'pikud',     title: 'פיקוד והדרכה',  bg: '#5b573c', fg: '#ffffff' },
    { slug: 'meyda',     title: 'מידע ומחקר',    bg: '#59302b', fg: '#ffffff' },
  ];

  /* Per-tile radial fly-in vectors (reference frame 375×770); corners travel furthest. */
  const TILE_START = [[-220,-578],[149,-578],[-149,-231],[221,-160],[-220,159],[149,231],[-149,577],[221,577]];

  /* Home — hamburger menu links */
  const MENU = [
    { label: 'גיוס, הכשרה ומסלולי שירות', href: '#' },
    { label: 'על המתפ״ש',                href: '#' },
    { label: 'תשובות לשאלות שלכם',       href: '#' },
    { label: 'כתבו עלינו',               href: '#' },
  ];

  /* Role detail views (keyed by #role/<slug>). `placeholder:true` = stub content.
     `start` = seconds to seek the looping video to on load. */
  const ROLES = {
    tashtit:   { bg:'#e0c895', card:'#59302b', title:'תשתית',         tags:['תגית','לדוגמה'],          desc:'תיאור התפקיד — טקסט לדוגמה שימולא בהמשך.', poster:'', placeholder:true,  video:'ezrahi.mp4', start:0 },
    ezrahi:    { bg:'#a2a874', card:'#e2d7d4', title:'תיאום אזרחי',   tags:['מטה','רצועת עזה','איו״ש'], desc:'מייצרים ביטחון דרך פעילות אזרחית ויישום המדיניות של מדינת ישראל בגזרות השונות.', poster:'ezrahi.png', placeholder:false, video:'ezrahi.mp4', start:0 },
    dovrut:    { bg:'#e2d7d4', card:'#4c5466', title:'דוברות והסברה', tags:['סוריה','איו״ש'],          desc:'חוד החנית של עיצוב התדמית וחיזוק הלגיטימציה של מדינת ישראל מול העולם והאוכלוסייה הפלסטינית.', poster:'dovrut.png', placeholder:false, video:'dovrut.mp4', start:1 },
    mivtsaim:  { bg:'#4c5466', card:'#e2d7d4', title:'מבצעים',        tags:['תגית','לדוגמה'],          desc:'תיאור התפקיד — טקסט לדוגמה שימולא בהמשך.', poster:'', placeholder:true,  video:'dovrut.mp4', start:1 },
    kishrei:   { bg:'#957970', card:'#dce6e2', title:'קשרי חוץ',      tags:['תגית','לדוגמה'],          desc:'תיאור התפקיד — טקסט לדוגמה שימולא בהמשך.', poster:'', placeholder:true,  video:'meyda.mp4', start:0 },
    bitachoni: { bg:'#cad4d0', card:'#5b573c', title:'תיאום ביטחוני', tags:['תגית','לדוגמה'],          desc:'תיאור התפקיד — טקסט לדוגמה שימולא בהמשך.', poster:'', placeholder:true,  video:'ezrahi.mp4', start:0 },
    pikud:     { bg:'#5b573c', card:'#dce6e2', title:'פיקוד והדרכה',  tags:['תגית','לדוגמה'],          desc:'תיאור התפקיד — טקסט לדוגמה שימולא בהמשך.', poster:'', placeholder:true,  video:'dovrut.mp4', start:1 },
    meyda:     { bg:'#59302b', card:'#e0c895', title:'מידע ומחקר',    tags:['קריה'],                   desc:'התפקידים שמאחורי ההחלטות האסטרטגיות.<br>כאן מדברים ערבית, מפענחים מגמות, מנתחים<br>את הלכי הרוח בשטח ובונים תמונת המצב<br>מודיעינית-אזרחית.', poster:'meyda.png', placeholder:false, video:'meyda.mp4', start:0 },
  };

  /* Bases map view */
  const BASES = [
    { key:'sde-teiman', label:'רצועת עזה', img:'sde-teiman.png', activity:'פעילות: גזרת עזה',  desc:'מתפ״ש שדה תימן פועלים בגזרת רצועת עזה. שדה תימן הינו בסיס סגור, ממוקם רבע שעה מבאר שבע.' },
    { key:'aiosh',      label:'איו״ש',     img:'aiosh.png',      activity:'פעילות: גזרת איו״ש', desc:'מתפ״ש איו״ש מנהלים את ערוץ התיאום והקישור אל מול הרשות הפלסטינית.' },
    { key:'kirya',      label:'קריה',      img:'kirya.png',      activity:'פעילות: מטה',        desc:'המטה פועלים מרחבית על כל הגזרות, הם אלו שאחראים על להוציא לפועל את הכל כלפי שאר הבסיסים.' },
  ];
  const BASE_DEFAULT = 'sde-teiman';

  /* ══════════════════════════════════════════════════════════════════════
     DOM refs
     ══════════════════════════════════════════════════════════════════════ */
  const body  = document.body;
  const views = {
    home: document.getElementById('view-home'),
    role: document.getElementById('view-role'),
    map:  document.getElementById('view-map'),
  };

  /* ══════════════════════════════════════════════════════════════════════
     ROUTER  ·  hash → view
     ══════════════════════════════════════════════════════════════════════ */
  function parseHash() {
    const h = location.hash.replace(/^#/, '');
    if (h.indexOf('role/') === 0) return { view: 'role', slug: h.slice(5) };
    if (h === 'map')    return { view: 'map' };
    if (h === 'mosaic') return { view: 'home', mosaic: true };
    return { view: 'home' };
  }

  function showView(route) {
    // Leaving role → stop its video
    if (body.dataset.view === 'role' && route.view !== 'role') pauseRoleVideo();

    body.dataset.view = route.view;
    body.classList.remove('menu-open');
    document.documentElement.style.overflow = '';
    Object.keys(views).forEach(k => views[k].classList.toggle('active', k === route.view));

    if (route.view === 'home') enterHome(route.mosaic);
    else if (route.view === 'role') enterRole(route.slug);
    else if (route.view === 'map')  enterMap();
  }

  window.addEventListener('hashchange', () => showView(parseHash()));

  /* Tile → role transition: the clicked tile grows to fill the screen in its own
     colour, then the role page (same background colour) fades up underneath it. */
  function morphTileToRole(tileEl, slug, bg) {
    // make the back target the assembled mosaic (so browser-back returns there too)
    if (location.hash !== '#mosaic') history.replaceState(null, '', '#mosaic');
    const rect = tileEl.getBoundingClientRect();
    const ov = document.createElement('div');
    ov.style.cssText =
      'position:fixed;z-index:200;border-radius:12px;pointer-events:none;background:' + bg +
      ';left:' + rect.left + 'px;top:' + rect.top + 'px;width:' + rect.width + 'px;height:' + rect.height + 'px;' +
      'transition:left .42s cubic-bezier(.4,0,.2,1),top .42s cubic-bezier(.4,0,.2,1),' +
      'width .42s cubic-bezier(.4,0,.2,1),height .42s cubic-bezier(.4,0,.2,1),border-radius .42s cubic-bezier(.4,0,.2,1);';
    document.body.appendChild(ov);
    ov.getBoundingClientRect();   // force reflow so the transition runs
    ov.style.left = '0px'; ov.style.top = '0px';
    ov.style.width = '100vw'; ov.style.height = '100vh'; ov.style.borderRadius = '0';
    setTimeout(() => {
      location.hash = '#role/' + slug;   // role page (same bg colour) mounts under the overlay
      ov.style.transition = 'opacity .12s ease';   // reveal the page elements immediately after the expand
      ov.style.opacity = '0';
      setTimeout(() => ov.remove(), 140);
    }, 420);
  }

  /* ══════════════════════════════════════════════════════════════════════
     VIEW: home  ·  mosaic tiles + scroll convergence + hamburger
     ══════════════════════════════════════════════════════════════════════ */
  const intro   = views.home.querySelector('.intro');
  const flyLogo = views.home.querySelector('.flying-logo');
  const navContainer = views.home.querySelector('.nav-container');
  const mosaicCue = views.home.querySelector('.mosaic-cue');
  const mapScreen = views.home.querySelector('.mapscreen');
  const mapVideo  = mapScreen && mapScreen.querySelector('.mapscreen-video');
  const mapWorld  = mapScreen && mapScreen.querySelector('.mapworld');
  const segHero   = views.home.querySelector('.seg-hero');
  const segMosaic = views.home.querySelector('.seg-mosaic');
  const segMap    = views.home.querySelector('.seg-map');
  const segGiyus  = views.home.querySelector('.seg-giyus');
  const giyusScreen = views.home.querySelector('.giyus');
  const morphCard = views.home.querySelector('.morph-card');
  let mapCardRect = null, giyusCardRect = null;   // screen rects the morph card bridges (map info card → step-1 card)
  const REFW = 375, REFH = 770;
  let tiles = [];
  let homeBuilt = false;
  let homeOffset = 0;   // px height of the intro screen; mosaic convergence starts after it
  let logoStart = null, logoEnd = null, mapLogoTarget = null, giyusLogoTarget = null;   // logo stops: nav slot → mosaic → map pin → stepper nav
  let logoTouch = 0;   // raw1 at which the first converging tile reaches the nav logo; the logo only leaves the nav after this

  const clamp  = (v, a, b) => Math.min(Math.max(v, a), b);
  const easing = t => (3 * Math.pow(t, 6) - 2 * Math.pow(t, 9)) * 0.7 + 0.3 - 0.3 * Math.pow(1 - t, 2);
  const smoothstep = t => t * t * (3 - 2 * t);   // slow-in / slow-out ease for the camera pan

  /* ── Map screen: a scroll-driven camera panning a fixed map across the bases (movement-spec.md).
     Each base is a focal point (fx,fy) in the square map; the world layer translates so that point
     lands at (centre, anchorY). Pins live in the world and travel with the terrain. ── */
  const MAP_BASES = [
    { name: 'נפח',     desc: 'מתפ״ש נפח פועלים בגזרת סוריה. הבסיס סגור, ממוקם רבע שעה מצפת.', thumb: 'assets/thumbs/nafach.png', placesMap: 'assets/maps/places-nafach.png?v=6', fx: 0.82, fy: 0.43 },
    { name: 'קריה',    desc: 'המטה ממוקם בתל אביב. פועלים מרחבית על כל הגזרות, הם אלו שאחראים על להוציא לפועל את המדיניות.', thumb: 'assets/thumbs/kirya.png?v=8', placesMap: 'assets/maps/places-kirya.png?v=6', fx: 0.20, fy: 0.28 },
    { name: 'איו״ש',   desc: 'פועלים מרחבית על כלל התתי-גזרות והחטיבות המרחביות, והם אלו שאחראים על להוציא לפועל.', thumb: 'assets/thumbs/ayosh.png', placesMap: 'assets/maps/places-ayosh.png?v=6', fx: 0.55, fy: 0.49 },
    { name: 'שדה תימן', desc: 'מתפ״ש שדה תימן פועלים בגזרת רצועת עזה. שדה תימן הינו בסיס סגור, ממוקם רבע שעה מבאר שבע.', thumb: 'assets/thumbs/sde-teyman.png', placesMap: 'assets/maps/places-sde-teyman.png?v=6', fx: 0.28, fy: 0.53, zoom: 5.0 },
  ];
  const MAP_ZOOM = 4.0;        // map side = zoom · viewport width (≥ viewport so no edge gaps)
  const MAP_ANCHOR_Y = 0.62;   // vertical placement of the focused region + its pin (kept below the top card)
  const MAP_SMOOTH = 0.08;     // pan glide inertia (lower = slower point-to-point glide, ~0.6s to settle)
  let mapSide = 0, mapTargets = [], mapPins = [];
  let panTarget = { x: 0, y: 0, s: 1 }, panCur = { x: 0, y: 0, s: 1 };
  let activeBase = -1, mapLoopRunning = false;
  let carFrom = 0, carTo = 0;   // the two bases the scroll-driven camera is gliding between (for the pin cross-fade)
  let heroReturn = false;       // while the back-to-hero button scrolls up: hold the map on its first point (no horizontal cycling)

  // The exact Figma teardrop path (shared by the map pin and the thumbnail drops).
  const TEARDROP_D = 'M38.8311 0.993164C61.7977 0.993399 76.6679 19.3428 76.668 42.2646C76.668 55.3167 71.4122 64.2876 64.5977 71.2666C61.1782 74.7686 57.3649 77.7685 53.6084 80.5332C49.8791 83.2778 46.147 85.8311 43.0215 88.3574L42.9639 88.4043L42.9131 88.458C40.6764 90.8973 36.9847 90.8973 34.748 88.458L34.6982 88.4043L34.6406 88.3574L34.0215 87.8613C30.8942 85.3833 27.3309 82.9271 23.8066 80.3311C20.022 77.5432 16.2282 74.5581 12.8457 71.0869C6.10841 64.1729 0.993164 55.3227 0.993164 42.2646C0.993251 19.3427 15.8642 0.993164 38.8311 0.993164Z';
  // Drops printed into each thumbnail (CENTRE, as fractions of the 110×128 thumb). An animated black drop is
  // laid over each, centred on it and a touch larger (w, px) so it fully covers the baked one across the whole
  // up-and-down float — no doubling. They bob continuously like classic map markers (see CSS markerFloat).
  const MAP_DROPS = [
    { w: 26, pts: [ { x: 0.597, y: 0.258 } ] },                                                            // נפח
    { w: 26, pts: [ { x: 0.475, y: 0.402 } ] },                                                            // קריה
    { w: 15, pts: [ { x: 0.817, y: 0.086 }, { x: 0.707, y: 0.247 }, { x: 0.854, y: 0.356 },                // איו״ש
                    { x: 0.704, y: 0.507 }, { x: 0.919, y: 0.619 }, { x: 0.861, y: 0.817 },
                    { x: 0.669, y: 0.879 }, { x: 0.787, y: 0.922 } ] },
    { w: 26, pts: [ { x: 0.382, y: 0.383 } ] },                                                            // שדה תימן
  ];

  // Recruitment & training stepper (Figma 1109-8115). Clicking a step makes it the active (black) one.
  const GTRAIN = 'כ-6 שבועות במחנה גדעונים. במהלך הקורס רוכשים ידע מקצועי על פעילות היחידה, לומדים על הזירה הפלסטינית, מתחילים ללמוד ערבית מדוברת ומכירים את תחומי העשייה השונים אליהם ניתן להשתבץ לאחר הקורס.';
  const GIYUS_STEPS = [
    { t: 'שיבוץ למתפ״ש', d: 'קבלת השיבוץ ליחידה. ביום השיבוץ או קבלת הודעה מראש.', icon: 'assets/icons/steps/step-shibutz.svg', media: 'assets/posters/shibutz.jpg' },
    { t: 'טירונות',      d: GTRAIN, icon: 'assets/icons/steps/step-tironut.svg', media: ['assets/posters/tironut-1.jpg', 'assets/posters/tironut-2.jpg', 'assets/posters/tironut-3.jpg', 'assets/posters/tironut-4.jpg', 'assets/posters/tironut-5.jpg'] },
    { t: 'קורס',         d: GTRAIN, icon: 'assets/icons/steps/step-kurs.svg', media: ['assets/posters/kurs-1.jpg', 'assets/posters/kurs-2.jpg', 'assets/posters/kurs-3.jpg', 'assets/posters/kurs-4.jpg', 'assets/posters/kurs-5.jpg', 'assets/posters/kurs-6.jpg', 'assets/posters/kurs-7.jpg'] },
    { t: 'שיבוץ לתפקיד', d: GTRAIN, icon: 'assets/icons/steps/step-tafkid.svg', media: ['assets/posters/tafkid-1.jpg', 'assets/posters/tafkid-2.jpg', 'assets/posters/tafkid-3.jpg', 'assets/posters/tafkid-4.jpg', 'assets/posters/tafkid-5.jpg', 'assets/posters/tafkid-6.jpg', 'assets/posters/tafkid-7.jpg', 'assets/posters/tafkid-8.jpg', 'assets/posters/tafkid-9.jpg'] },
  ];
  let giyusSteps = [], giyusActive = 0;
  let giyusRevealEls = [];   // ordered top→bottom; each builds up in turn during the map→stepper scroll (see frame())

  function buildGiyus() {
    const stepper = document.getElementById('giyusStepper');
    if (!stepper) return;
    giyusSteps = GIYUS_STEPS.map((s, i) => {
      const step = document.createElement('div');
      step.className = 'gstep' + (i === 0 ? ' active' : '');
      // A step's media is either a single image or (for טירונות) a set that rotates within the same square.
      const mediaHtml = Array.isArray(s.media)
        ? '<div class="gstep-media gstep-media--slides">' +
            s.media.map((src, j) => '<img class="gstep-slide' + (j === 0 ? ' on' : '') + '" src="' + src + '" alt="">').join('') +
          '</div>'
        : '<div class="gstep-media"><img src="' + (s.media || 'assets/posters/matpash-try1.jpg') + '" alt=""></div>';
      step.innerHTML =
        '<button class="gstep-card" type="button">' +
          '<span class="gstep-t">' + s.t + '</span>' +
          '<p class="gstep-d"><span class="gstep-d-in">' + s.d + '</span></p>' +
          '<span class="gstep-node"><img src="' + s.icon + '" alt=""></span>' +
        '</button>' +
        mediaHtml;
      step.querySelector('.gstep-card').addEventListener('click', () => setGiyusActive(i));
      stepper.appendChild(step);
      return step;
    });
    // Cache the section's components in visual order (nav → title → tabs → the 4 steps → footer). frame()
    // reveals them one after another (rise + fade) as the section slides up over the map.
    giyusRevealEls = [
      giyusScreen && giyusScreen.querySelector('.giyus-nav'),
      giyusScreen && giyusScreen.querySelector('.giyus-title'),
      giyusScreen && giyusScreen.querySelector('.giyus-tabs'),
      ...giyusSteps,
      giyusScreen && giyusScreen.querySelector('.giyus-foot'),
    ].filter(Boolean);
    giyusRevealEls.forEach(el => { el.style.willChange = 'opacity, transform'; });
  }
  // Rotating media (טירונות): crossfade through the step's image set, but only while that step is the active one.
  let giyusRotTimer = 0;
  function stopGiyusRotation() { if (giyusRotTimer) { clearInterval(giyusRotTimer); giyusRotTimer = 0; } }
  function startGiyusRotation(stepEl) {
    stopGiyusRotation();
    const slides = stepEl ? Array.prototype.slice.call(stepEl.querySelectorAll('.gstep-slide')) : [];
    if (slides.length < 2) return;
    let idx = slides.findIndex(s => s.classList.contains('on'));
    if (idx < 0) idx = 0;
    giyusRotTimer = setInterval(() => {
      slides[idx].classList.remove('on');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('on');
    }, 2800);
  }
  let giyusSettling = false, giyusSettleUntil = 0;
  function setGiyusActive(i) {
    giyusActive = i;
    giyusSteps.forEach((s, k) => s.classList.toggle('active', k === i));
    const activeStep = giyusSteps[i];
    if (activeStep && activeStep.querySelector('.gstep-slide')) startGiyusRotation(activeStep);
    else stopGiyusRotation();
    layoutTimeline();
    // The nodes keep moving for the whole 0.6s accordion transition, so re-align the rail every frame until it
    // settles — otherwise it's left at a stale length and misses the last node (a gap, or an overshoot past it).
    giyusSettleUntil = performance.now() + 700;
    if (!giyusSettling) { giyusSettling = true; requestAnimationFrame(trackGiyusRail); }
  }
  function trackGiyusRail() {
    layoutTimeline();
    if (performance.now() < giyusSettleUntil) requestAnimationFrame(trackGiyusRail);
    else giyusSettling = false;
  }
  // Stretch the solid rail from the first node centre to the last; the nodes' cream discs cut the gaps.
  function layoutTimeline() {
    const stepper = document.getElementById('giyusStepper');
    if (!stepper || giyusSteps.length < 2) return;
    const rail = stepper.querySelector('.giyus-rail');
    const nodes = giyusSteps.map(s => s.querySelector('.gstep-node')).filter(Boolean);
    if (!rail || nodes.length < 2) return;
    const sTop = stepper.getBoundingClientRect().top;
    const cen = n => { const r = n.getBoundingClientRect(); return r.top + r.height / 2 - sTop; };
    const c1 = cen(nodes[0]), c2 = cen(nodes[nodes.length - 1]);
    rail.style.top = c1 + 'px';
    rail.style.height = Math.max(0, c2 - c1) + 'px';
  }

  // Locations map (Figma 1157-10229): each base has its own dedicated full-page map, connected by name.
  let placesPrevView = 'home', placesPrevScrollY = 0;
  // Smooth-scroll (visibly) to stop i, so the section transitions play as it moves — used by the hero cards and
  // the back-to-hero button. Self-contained (not snapTo) so it animates over any distance at a watchable pace.
  function smoothScrollToStop(i, holdFirstPoint) {
    cancelSnap();
    heroReturn = !!holdFirstPoint;   // hold the map on point 0 for this scroll (back-to-hero) — no horizontal cycling
    i = clamp(i, 0, NSTOPS - 1);
    const fromY = window.scrollY, toY = stopY(i);
    if (Math.abs(toY - fromY) < 1) { curStop = i; heroReturn = false; frame(); return; }
    const dur = clamp(Math.abs(toY - fromY) / window.innerHeight * 300, 900, 3000);   // ~300ms per viewport
    const start = performance.now();
    curStop = i;
    snapLocked = true;
    if (snapRAF) cancelAnimationFrame(snapRAF);
    const step = now => {
      const t = clamp((now - start) / dur, 0, 1);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;   // easeInOutCubic
      window.scrollTo(0, fromY + (toY - fromY) * e);                         // fires scroll → frame() → transitions
      if (t < 1) { snapRAF = requestAnimationFrame(step); }
      else { snapRAF = 0; snapCd = performance.now() + 130; snapLocked = false; heroReturn = false; }
    };
    snapRAF = requestAnimationFrame(step);
  }
  // Back to hero (from the stepper): snap the map to its first point (so there's no horizontal pan) then scroll up.
  function jumpToHero() {
    if (mapTargets[0]) {
      panCur.x = panTarget.x = mapTargets[0].x;
      panCur.y = panTarget.y = mapTargets[0].y;
      panCur.s = panTarget.s = mapTargets[0].s;
      setActiveBase(0);
    }
    smoothScrollToStop(0, true);
  }
  // Back to hero from the MAP section: scroll straight to the top from wherever you are — no hold on the first point.
  function jumpToHeroFromMap() { smoothScrollToStop(0, false); }
  // Hero cards jump straight to their section holding the map on its first point (נפח), so the camera doesn't
  // cycle through the other map points on the way down — the map is passed through at point 0 only.
  function jumpToStopHoldingFirst(target) {
    if (mapTargets[0]) {
      panCur.x = panTarget.x = mapTargets[0].x;
      panCur.y = panTarget.y = mapTargets[0].y;
      panCur.s = panTarget.s = mapTargets[0].s;
      setActiveBase(0);
    }
    smoothScrollToStop(target, true);
  }
  function openPlaces() {
    // show the dedicated map for the base whose thumbnail was tapped (connected by name)
    const b = MAP_BASES[clamp(activeBase, 0, MAP_BASES.length - 1)] || MAP_BASES[0];
    const img = document.getElementById('placesMap');
    if (img && b && b.placesMap) { img.src = b.placesMap; img.alt = b.name; }
    placesPrevView = body.dataset.view;
    placesPrevScrollY = window.scrollY;    // remember exactly where the map section was, to return to it
    body.dataset.view = 'places';          // pauses the home scroll-hijack + frame() while the overlay is up
    mapLoopRunning = false;
    body.classList.add('places-open');
  }
  function closePlaces() {
    body.classList.remove('places-open');
    body.dataset.view = placesPrevView || 'home';
    // Return to the exact map-section spot. While the overlay was up the hijack was off, so a stray drag can
    // native-scroll the page (snapping toward the mosaic) — restore the saved position and re-sync curStop so a
    // later resize can't jump elsewhere.
    cancelSnap();
    window.scrollTo(0, placesPrevScrollY);
    let best = curStop, bd = Infinity;
    for (let i = 0; i < NSTOPS; i++) { const d = Math.abs(stopY(i) - placesPrevScrollY); if (d < bd) { bd = d; best = i; } }
    curStop = best;
    frame();                                // restore the map section behind
  }

  function buildMapScreen() {
    if (!mapWorld) return;
    MAP_BASES.forEach(() => {
      const p = document.createElement('div');
      p.className = 'wpin';
      p.innerHTML =
        '<span class="wpin-mark"><i class="wpin-dot"></i></span>' +
        '<span class="wpin-pin">' +
          '<svg class="wpin-drop" viewBox="0 0 77.6612 91.2809" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<path d="M38.8311 0.993164C61.7977 0.993399 76.6679 19.3428 76.668 42.2646C76.668 55.3167 71.4122 64.2876 64.5977 71.2666C61.1782 74.7686 57.3649 77.7685 53.6084 80.5332C49.8791 83.2778 46.147 85.8311 43.0215 88.3574L42.9639 88.4043L42.9131 88.458C40.6764 90.8973 36.9847 90.8973 34.748 88.458L34.6982 88.4043L34.6406 88.3574L34.0215 87.8613C30.8942 85.3833 27.3309 82.9271 23.8066 80.3311C20.022 77.5432 16.2282 74.5581 12.8457 71.0869C6.10841 64.1729 0.993164 55.3227 0.993164 42.2646C0.993251 19.3427 15.8642 0.993164 38.8311 0.993164Z" fill="#fff"/>' +
          '</svg>' +
          '<img class="wpin-logo" src="assets/icons/logo.png" alt="">' +
        '</span>';
      mapWorld.appendChild(p);
    });
    mapPins = [].slice.call(mapWorld.querySelectorAll('.wpin'));
    setActiveBase(0);
  }
  function measureMap() {
    if (!mapWorld) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    mapSide = MAP_ZOOM * vw;                                  // reference world size; per-base zoom scales it
    mapWorld.style.width = mapSide + 'px';
    mapWorld.style.height = mapSide + 'px';
    mapTargets = MAP_BASES.map(b => {
      const z = b.zoom || MAP_ZOOM, sideK = z * vw;
      return { x: vw * 0.5 - b.fx * sideK, y: vh * MAP_ANCHOR_Y - b.fy * sideK, s: z / MAP_ZOOM };
    });
    mapPins.forEach((p, k) => { p.style.left = (MAP_BASES[k].fx * mapSide) + 'px'; p.style.top = (MAP_BASES[k].fy * mapSide) + 'px'; });
  }
  function setActiveBase(k) {
    if (k === activeBase || !MAP_BASES[k]) return;
    activeBase = k;
    const b = MAP_BASES[k];
    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    set('mapBaseName', b.name); set('mapBaseDesc', b.desc);
    const thumb = document.getElementById('mapThumb');
    if (thumb && b.thumb) thumb.src = b.thumb;
    buildThumbDrops(k);                                                 // rebuild the base's floating thumbnail drops
    updateMapBtnColor();                                               // recolour the corner map icon for the new thumbnail
  }
  // Give the top-left map icon a chip that matches the map's corner colour (so lines/elements don't show through
  // the icon), and colour the icon for contrast (white on a dark corner, black on a light one). Thumb box and
  // image share the same aspect ratio, so the image's top-left maps 1:1 to the displayed corner.
  function updateMapBtnColor() {
    const img = document.getElementById('mapThumb');
    const btn = mapScreen && mapScreen.querySelector('.mapcard-mapbtn');
    if (!img || !btn) return;
    const apply = () => {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      if (!iw || !ih) return;
      try {
        const S = 10, cv = document.createElement('canvas'); cv.width = S; cv.height = S;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, iw * 0.05, ih * 0.04, iw * 0.13, ih * 0.10, 0, 0, S, S);   // a clean patch of the corner
        const d = ctx.getImageData(0, 0, S, S).data;
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
        r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;                 // 0 (dark) … 255 (light)
        btn.style.background = 'rgb(' + r + ',' + g + ',' + b + ')';   // chip matches the map → hides lines under the icon
        btn.style.color = lum < 150 ? '#ffffff' : '#111111';          // icon contrasts with its chip
      } catch (e) { btn.style.background = 'transparent'; btn.style.color = '#ffffff'; }
    };
    if (img.complete && img.naturalWidth) apply();
    else img.addEventListener('load', apply, { once: true });
  }
  // The new per-base thumbnails (Figma 1160-10230) have their markers baked into the map art — dark pins for
  // נפח/קריה/שדה תימן and light dots for איו״ש — so no overlay is drawn; just clear any stale drops.
  function buildThumbDrops(k) {
    const box = document.getElementById('mapDrops');
    if (box) box.innerHTML = '';
  }
  function mapGlide() {
    if (!mapLoopRunning) return;
    panCur.x += (panTarget.x - panCur.x) * MAP_SMOOTH;
    panCur.y += (panTarget.y - panCur.y) * MAP_SMOOTH;
    panCur.s += (panTarget.s - panCur.s) * MAP_SMOOTH;
    mapWorld.style.transform = 'translate3d(' + panCur.x + 'px,' + panCur.y + 'px,0) scale(' + panCur.s + ')';
    const pinTf = 'translate(-50%,-50%) scale(' + (1 / panCur.s) + ')';   // dark dot centred on the point; constant screen size
    // Crossfade the source → destination pins as the camera glides between points (only those two show).
    let carP = 1;
    if (carFrom !== carTo && mapTargets[carFrom] && mapTargets[carTo]) {
      const a = mapTargets[carFrom], b = mapTargets[carTo];
      const dx = b.x - a.x, dy = b.y - a.y, len2 = dx * dx + dy * dy || 1;
      carP = clamp(((panCur.x - a.x) * dx + (panCur.y - a.y) * dy) / len2, 0, 1);
    }
    for (let k = 0; k < mapPins.length; k++) {
      mapPins[k].style.opacity = (carFrom === carTo)
        ? (k === carTo ? 1 : 0)
        : (k === carFrom ? (1 - carP) : (k === carTo ? carP : 0));
      mapPins[k].style.transform = pinTf;
    }
    requestAnimationFrame(mapGlide);
  }

  function buildHome() {
    if (homeBuilt) return;
    homeBuilt = true;

    const tilesWrap = document.getElementById('tiles');
    TILES.forEach((t, i) => {
      const a = document.createElement('a');
      a.className = 'tile tile-' + (i + 1);
      a.href = '#role/' + t.slug;
      a.dataset.slug = t.slug; a.dataset.bg = t.bg;
      a.style.setProperty('--bg', t.bg);
      a.style.setProperty('--fg', t.fg);
      a.innerHTML =
        '<div class="tile-title"><span class="tile-label">מש״ק תיאום וקישור</span><span class="tile-role">' + t.title + '</span></div>' +
        '<span class="tile-icon" style="-webkit-mask-image:url(' + roleIcon(t.slug) + ');mask-image:url(' + roleIcon(t.slug) + ')"></span>';
      tilesWrap.appendChild(a);
    });
    tiles = [].slice.call(tilesWrap.querySelectorAll('.tile'));

    // Tiles are pointer-events:none so a scroll started over any square passes through to the page
    // (exactly like the gaps). Taps are resolved here by hit-testing the tile rects — the browser only
    // fires 'click' for a tap, never for a drag, so scrolling from any point still works.
    window.addEventListener('click', e => {
      if (body.dataset.view !== 'home' || !body.classList.contains('tiles-ready')) return;
      for (let k = 0; k < tiles.length; k++) {
        const r = tiles[k].getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          e.preventDefault();
          morphTileToRole(tiles[k], tiles[k].dataset.slug, tiles[k].dataset.bg);
          return;
        }
      }
    });

    const menuWrap = document.getElementById('menuItems');
    MENU.forEach(m => {
      const a = document.createElement('a');
      a.className = 'menu-item'; a.href = m.href; a.textContent = m.label;
      menuWrap.appendChild(a);
    });

    // hamburger open/close (intro hero bar)
    views.home.querySelectorAll('.nav-burger').forEach(burger => {
      burger.addEventListener('click', e => {
        e.preventDefault();
        const open = !body.classList.contains('menu-open');
        body.classList.toggle('menu-open', open);
        document.documentElement.style.overflow = open ? 'hidden' : '';
        if (!open) frame();
      });
    });

    // hero cards scroll (visibly) to their section: roles→mosaic, base-locations→map (נפח), recruitment→stepper
    const cardTargets = [1, MAP_STOP_FIRST, NSTOPS - 1];
    views.home.querySelectorAll('.intro-card').forEach((el, i) => {
      el.addEventListener('click', e => {
        e.preventDefault();
        if (cardTargets[i] != null) jumpToStopHoldingFirst(cardTargets[i]);
      });
    });

    // "back to hero" buttons — jump to the top of the page. The map-section button goes straight up without
    // holding on the first point; the stepper button keeps snapping the map to its first point on the way.
    views.home.querySelectorAll('.tohero').forEach(btn => {
      btn.addEventListener('click', btn.classList.contains('mapscreen-tohero') ? jumpToHeroFromMap : jumpToHero);
    });
    menuWrap.querySelectorAll('.menu-item').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        body.classList.remove('menu-open'); document.documentElement.style.overflow = ''; frame();
      });
    });

    // (The map video autoplays/pauses with the scroll in frame(); no manual play/pause control.)

    buildMapScreen();
    buildGiyus();
    // Tapping the base-card thumbnail opens its dedicated locations map; the back button closes it.
    const thumb = views.home.querySelector('.mapcard-thumb');
    if (thumb) thumb.addEventListener('click', openPlaces);
    const up = document.getElementById('placesUp');
    if (up) up.addEventListener('click', closePlaces);
    // Hero video mute/unmute (starts muted for autoplay). Toggles video.muted and the button's icon state.
    const heroVideo = views.home.querySelector('.intro-video');
    const heroMute = document.getElementById('introMute');
    if (heroVideo && heroMute) {
      const syncMute = () => {
        const on = !heroVideo.muted;
        heroMute.classList.toggle('is-on', on);
        heroMute.setAttribute('aria-pressed', String(on));
        heroMute.setAttribute('aria-label', on ? 'השתקת קול' : 'הפעלת קול');
      };
      heroMute.addEventListener('click', () => {
        heroVideo.muted = !heroVideo.muted;
        if (!heroVideo.muted) heroVideo.play().catch(() => {});
        syncMute();
      });
      syncMute();
    }
    startHeroIconCycle();
  }

  /* Hero headline icon — cycles through the Streamline icon set "after delay"
     (Figma component 902:16386). One icon every 800ms, instant swap (no fade). */
  function startHeroIconCycle() {
    const img = views.home.querySelector('.monitor-ico');
    if (!img) return;
    const icons = [1, 2, 3, 4, 5, 6, 7, 8].map(n => 'assets/icons/hero/' + n + '.svg');
    icons.forEach(src => { const im = new Image(); im.src = src; });   // preload to avoid flash
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let i = 0;
    setInterval(() => {
      i = (i + 1) % icons.length;
      img.src = icons[i];
    }, 800);
  }

  function frame(rawOverride) {
    if (body.dataset.view !== 'home' || !tiles.length) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    // Two scroll phases (each 2 viewports):
    //   raw1  0→1  ASSEMBLY  — tiles converge from dispersed (scale 2) to the grid (scale 1); hero fades out
    //   raw2  0→1  EXIT      — tiles disperse again the exact same way (mirror), while the map screen rises from below
    // Vertical scroll journey (vh offsets):
    //   raw1  0→2   ASSEMBLY   — mosaic converges, hero fades
    //   raw2  2→4   EXIT       — mosaic disperses, map rises and lands on נפח (point 0)
    //   pf    4→4+(NPTS-1)     — camera traces the route through the map points (1 vh per leg)
    //   raw3  …→+2   HANDOFF   — last point (שדה תימן) → recruitment stepper
    const PAN_END = 4 + (NPTS - 1);   // vh where the last point is reached (map→stepper begins)
    let raw1, raw2, raw3, pf;
    if (typeof rawOverride === 'number') { raw1 = rawOverride; raw2 = 0; raw3 = 0; pf = 0; }   // pinned / forced-assembled state
    else {
      raw1 = clamp((window.scrollY - homeOffset) / (vh * 2), 0, 1);
      raw2 = clamp((window.scrollY - homeOffset - vh * 2) / (vh * 2), 0, 1);
      pf   = heroReturn ? 0 : clamp((window.scrollY - homeOffset - vh * 4) / vh, 0, NPTS - 1);   // held at 0 during back-to-hero; else 0→3
      raw3 = clamp((window.scrollY - homeOffset - vh * PAN_END) / (vh * 2), 0, 1);   // last point → recruitment stepper
    }
    const p1 = easing(raw1), p2 = easing(raw2), p3 = smoothstep(raw3);

    // tile transform = entry (2→1, START→0) composed with its mirror on exit (1→2, 0→START)
    const scale = (2 - p1) + p2;
    const disp  = (1 - p1) + p2;
    const sx = vw / REFW, sy = vh / REFH;
    for (let i = 0; i < tiles.length; i++) {
      tiles[i].style.transform =
        'scale(' + scale + ') translate(' + (TILE_START[i][0] * sx * disp) + 'px,' + (TILE_START[i][1] * sy * disp) + 'px)';
    }

    // pinned hero fades out over the assembly, fully gone at raw1 = 1
    const heroOp = clamp(1 - raw1, 0, 1);
    intro.style.opacity = heroOp; intro.style.pointerEvents = heroOp > 0.5 ? 'auto' : 'none';

    // tiles keep full opacity as they fly out — they exit the frame the same way they entered, no fade
    if (navContainer) navContainer.style.opacity = 1;

    // scroll cue on the mosaic frame — fades in as the mosaic finishes assembling, gone the instant the tiles start leaving
    if (mosaicCue) mosaicCue.style.opacity = String(clamp((raw1 - 0.9) / 0.1, 0, 1) * clamp(1 - raw2 / 0.15, 0, 1));

    // "settle" runs 0→1 over the last stretch of the exit — the moment the travelling logo lands in the pin.
    // The map pin keeps NO emblem of its own until then (var --emblem-op), so the white pin reads empty
    // while the mosaic logo descends into it; the two swap invisibly (same image, place, size) at the end.
    const settle = clamp((raw2 - 0.9) / 0.1, 0, 1);

    // Single logo travels nav-slot → mosaic centre (raw1) → map pin (raw2), then STOPS. On the map→stepper
    // handoff it does NOT fly to the stepper nav bar — the map (with its pin emblem) simply fades out and the
    // stepper shows its own nav logo.
    if (flyLogo && logoStart && logoEnd && mapLogoTarget && giyusLogoTarget) {
      let size, cx, cy;
      if (raw3 > 0) {                    // map → stepper: no flight; keep the logo hidden as the map fades out
        size = mapLogoTarget.size; cx = mapLogoTarget.cx; cy = mapLogoTarget.cy;
        flyLogo.style.opacity = '0';
      } else if (raw2 > 0) {             // mosaic centre → map pin
        size = logoEnd.size + (mapLogoTarget.size - logoEnd.size) * p2;
        cx = logoEnd.cx + (mapLogoTarget.cx - logoEnd.cx) * p2;
        cy = logoEnd.cy + (mapLogoTarget.cy - logoEnd.cy) * p2;
        flyLogo.style.opacity = String(1 - settle);
      } else {                           // nav slot → mosaic centre — parked until a tile touches the logo (logoTouch)
        const q = logoTouch >= 1 ? 0 : clamp((raw1 - logoTouch) / (1 - logoTouch), 0, 1);
        size = logoStart.size + (logoEnd.size - logoStart.size) * q;
        cx = logoStart.cx + (logoEnd.cx - logoStart.cx) * q;
        cy = logoStart.cy + (logoEnd.cy - logoStart.cy) * q;
        flyLogo.style.opacity = '1';
      }
      flyLogo.style.width = size + 'px';
      flyLogo.style.height = size + 'px';
      flyLogo.style.transform = 'translate(' + (cx - size / 2) + 'px,' + (cy - size / 2) + 'px)';
    }

    // map screen fades in as the tiles fly out (raw2), then fades out again as the stepper takes over (raw3)
    if (mapScreen) {
      mapScreen.style.transform = 'translateY(0)';
      mapScreen.style.opacity = String(p2 * (1 - p3));
      mapScreen.style.setProperty('--emblem-op', String(settle));   // pin emblem fades in as the logo lands, then fades out with the map
      mapScreen.style.visibility = (raw2 > 0 && raw3 < 1) ? 'visible' : 'hidden';
      if (mapVideo) {
        const play = raw2 > 0.05 && raw3 < 0.95;
        if (play && mapVideo.paused) { mapVideo.play().catch(function(){}); }
        else if (!play && !mapVideo.paused) { mapVideo.pause(); }
      }
    }

    // Recruitment stepper: the whole section slides up from below over the (fading) map, then its components
    // build up one after another from top to bottom — a staggered rise+fade inspired by the mosaic tiles' entry.
    if (giyusScreen) {
      const slide = smoothstep(clamp(raw3 / 0.4, 0, 1));            // section rises from below over the first 40%
      giyusScreen.style.transform = 'translateY(' + ((1 - slide) * 100).toFixed(2) + '%)';
      giyusScreen.style.opacity = String(clamp(raw3 / 0.06, 0, 1));  // opaque almost at once so it covers the fading map as it rises
      giyusScreen.style.visibility = raw3 > 0 ? 'visible' : 'hidden';
      giyusScreen.classList.toggle('on', raw3 > 0.99);
      giyusScreen.style.setProperty('--nav-logo-op', '1');          // stepper's own nav logo
      if (raw3 <= 0.01 && giyusActive !== 0) setGiyusActive(0);      // re-enter on frame 1
      // Staggered top→bottom reveal: each component rises 24px and fades in, one after the next.
      const els = giyusRevealEls, N = els.length;
      const START = 0.22, SPAN = 0.66, EACH = 0.40;   // starts spread over raw3 [0.22 .. 0.48]; each rises over 0.40
      for (let i = 0; i < N; i++) {
        const t0 = START + (SPAN - EACH) * (N > 1 ? i / (N - 1) : 0);
        const q = smoothstep(clamp((raw3 - t0) / EACH, 0, 1));
        els[i].style.opacity = String(q);
        els[i].style.transform = 'translateY(' + ((1 - q) * 24).toFixed(2) + 'px)';
      }
    }
    if (morphCard) morphCard.style.visibility = 'hidden';

    // Camera pan across the bases: the vertical scroll (pf) is a continuous point index 0→3; the world layer
    // glides toward the focal target interpolated between the two bracketing points, tracing the route in order.
    if (mapTargets.length) {
      const i0 = Math.floor(pf), i1 = Math.min(i0 + 1, NPTS - 1), leg = smoothstep(pf - i0);   // ease each leg
      const a = mapTargets[i0], b = mapTargets[i1];
      panTarget.x = a.x + (b.x - a.x) * leg;
      panTarget.y = a.y + (b.y - a.y) * leg;
      panTarget.s = a.s + (b.s - a.s) * leg;
      carFrom = i0; carTo = i1;                       // mapGlide cross-fades the source→destination pin along the way
      if (raw2 > 0) {
        setActiveBase(Math.round(pf));               // card + thumbnail follow the nearest point
        if (!mapLoopRunning) { panCur.x = panTarget.x; panCur.y = panTarget.y; panCur.s = panTarget.s; mapLoopRunning = true; requestAnimationFrame(mapGlide); }
      } else { mapLoopRunning = false; }
    }

    body.classList.toggle('scrolled', raw1 > 0.01);
    body.classList.toggle('tiles-ready', raw1 > 0.97 && raw2 < 0.02);   // tiles clickable only while fully assembled
  }

  function measureHome() {
    // One long vertical journey: hero → mosaic (2 vh) → map reveal at נפח (2 vh) → the four map points
    // traced one per vh (3 legs) → recruitment stepper (2 vh). Body height must reach the last stop + 1 vh.
    homeOffset = 0;
    const vh = window.innerHeight;
    if (segHero)   segHero.style.height   = (vh * 2) + 'px';
    if (segMosaic) segMosaic.style.height = (vh * 2) + 'px';
    if (segMap)    segMap.style.height    = (vh * (2 + (NPTS - 1))) + 'px';   // map reveal (2) + point legs (NPTS-1)
    if (segGiyus)  segGiyus.style.height  = (vh * 1) + 'px';
    measureMap();
    measureLogo();
    measureGiyus();
  }
  // Rects the morph card bridges: the map's black info card and the stepper's (default-active) step-1 card.
  // Both layers are laid out even while hidden, so their on-screen rects are measurable here.
  function measureGiyus() {
    const info = mapScreen && mapScreen.querySelector('.mapcard-info');
    // The map's black card morphs into the "גיוס ושירות" tab (the small black pill at the top of the stepper).
    const tab  = giyusScreen && giyusScreen.querySelector('.gtab.on');
    const rect = el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
    mapCardRect   = info ? rect(info) : null;
    giyusCardRect = tab ? rect(tab) : null;
    layoutTimeline();
  }
  // Travelling-logo endpoints: start = the nav-bar logo slot, end = the former
  // mosaic-centre position (viewport centre, sized to --emblem-size).
  function measureLogo() {
    const brand = views.home.querySelector('.intro-brand');
    if (!flyLogo || !brand) return;
    const b = brand.getBoundingClientRect();
    logoStart = { cx: b.left + b.width / 2, cy: b.top + b.height / 2, size: b.width };   // nav slot
    logoEnd   = { cx: window.innerWidth / 2, cy: window.innerHeight / 2, size: 67.62 };  // mosaic centre (Figma size)
    // The active pin always lands centred at (vw/2, vh·MAP_ANCHOR_Y). The emblem sits inside the 65.84px
    // teardrop, whose tip is at that point, its logo centred 37px above it at a constant 42px screen size.
    mapLogoTarget = { cx: window.innerWidth / 2, cy: window.innerHeight * MAP_ANCHOR_Y - 37, size: 42 };
    // Final leg: the stepper nav-bar logo slot (laid out even while the section is hidden).
    const gbrand = giyusScreen && giyusScreen.querySelector('.giyus-brand img');
    if (gbrand) { const g = gbrand.getBoundingClientRect(); giyusLogoTarget = { cx: g.left + g.width / 2, cy: g.top + g.height / 2, size: g.height }; }

    // Logo release point: as the tiles converge (raw1 0→1) each tile's screen rect is
    //   centre = baseCentre + scale·(TILE_START·sx,sy·disp),  size = baseSize·scale   (scale = 2-easing, disp = 1-easing).
    // Find the earliest raw1 at which any tile's rect first overlaps the parked nav-logo rect — that's when a
    // square "touches" the logo, and only then does the logo start travelling to the mosaic centre.
    logoTouch = 0;
    if (tiles.length) {
      const vw = window.innerWidth, vh = window.innerHeight, sx = vw / REFW, sy = vh / REFH;
      const half = logoStart.size / 2;
      const Ll = logoStart.cx - half, Lr = logoStart.cx + half, Lt = logoStart.cy - half, Lb = logoStart.cy + half;
      const bases = tiles.map(t => ({ cx: t.offsetLeft + t.offsetWidth / 2, cy: t.offsetTop + t.offsetHeight / 2, w: t.offsetWidth, h: t.offsetHeight }));
      for (let r = 0; r <= 1.0001; r += 0.01) {
        const p1 = easing(clamp(r, 0, 1)), scale = 2 - p1, disp = 1 - p1;
        let hit = false;
        for (let i = 0; i < bases.length; i++) {
          const b0 = bases[i];
          const cx = b0.cx + scale * (TILE_START[i][0] * sx * disp);
          const cy = b0.cy + scale * (TILE_START[i][1] * sy * disp);
          const hw = b0.w * scale / 2, hh = b0.h * scale / 2;
          if (cx - hw < Lr && cx + hw > Ll && cy - hh < Lb && cy + hh > Lt) { hit = true; break; }
        }
        if (hit) { logoTouch = clamp(r, 0, 0.98); break; }
      }
    }
  }

  function enterHome(mosaic) {
    buildHome();
    measureHome();
    cancelSnap();
    curStop = mosaic ? 1 : 0;                          // return-from-role lands on the assembled mosaic
    void body.offsetHeight;
    window.scrollTo(0, stopY(curStop));
    frame();
  }

  /* ── Single-axis navigation (fully hijacked on the home view): every vertical gesture (wheel-Y /
       vertical swipe / ↑↓) steps to the next stop. The map points are now stops on this one journey —
       hero · mosaic · נפח · קריה · איו״ש · שדה תימן · stepper — so scrolling traces the route in order,
       and scrolling back up reverses it. There is no horizontal carousel any more. ── */
  const NPTS = MAP_BASES.length;                        // number of map points (each is its own scroll stop)
  const MAP_STOP_FIRST = 2;                              // STOP_VH index of the first map base (נפח); base k → index 2+k
  // hero, mosaic, then one stop per map point (4→PAN_END, 1 vh apart), then the stepper 2 vh past the last point.
  const STOP_VH = [0, 2].concat(MAP_BASES.map((_, i) => 4 + i)).concat([4 + (NPTS - 1) + 2]);
  const NSTOPS = STOP_VH.length;
  let ticking = false, curStop = 0, snapRAF = 0, snapLocked = false, snapCd = 0;
  function stopY(i) { return homeOffset + STOP_VH[clamp(i, 0, NSTOPS - 1)] * window.innerHeight; }
  function cancelSnap() { if (snapRAF) cancelAnimationFrame(snapRAF); snapRAF = 0; snapLocked = false; }
  const canSnap = () => body.dataset.view === 'home' && !snapLocked && performance.now() >= snapCd;

  function snapTo(i) {                                  // glide the vertical scroll to a section
    i = clamp(i, 0, NSTOPS - 1);
    if (i === curStop) return;
    const fromY = window.scrollY, toY = stopY(i);
    curStop = i;
    const dist = Math.abs(toY - fromY) / window.innerHeight;
    const dur = clamp(560 + dist * 230, 520, 1150);
    const start = performance.now();
    snapLocked = true;
    if (snapRAF) cancelAnimationFrame(snapRAF);
    const step = now => {
      const t = clamp((now - start) / dur, 0, 1);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;          // easeInOutCubic
      window.scrollTo(0, fromY + (toY - fromY) * e);                               // fires scroll → frame()
      if (t < 1) { snapRAF = requestAnimationFrame(step); }
      else { snapRAF = 0; snapCd = performance.now() + 130; snapLocked = false; }
    };
    snapRAF = requestAnimationFrame(step);
  }

  window.addEventListener('scroll', () => {
    if (body.dataset.view !== 'home') return;
    if (!ticking) { requestAnimationFrame(() => { frame(); ticking = false; }); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', () => {
    if (body.dataset.view !== 'home') { frame(); return; }
    measureHome(); cancelSnap(); window.scrollTo(0, stopY(curStop)); frame();
  });

  // Full hijack of home-view input; every vertical gesture steps one stop along the single journey.
  window.addEventListener('wheel', e => {
    if (body.dataset.view !== 'home') return;
    e.preventDefault();
    if (Math.abs(e.deltaY) > 2 && canSnap()) snapTo(curStop + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });

  let touchY0 = 0, touchUsed = false;
  window.addEventListener('touchstart', e => { touchY0 = e.touches[0].clientY; touchUsed = false; }, { passive: true });
  window.addEventListener('touchmove', e => {
    if (body.dataset.view !== 'home') return;
    e.preventDefault();
    if (touchUsed) return;
    const dy = touchY0 - e.touches[0].clientY;          // >0 = swipe up (advance)
    if (Math.abs(dy) > 34 && canSnap()) { touchUsed = true; snapTo(curStop + (dy > 0 ? 1 : -1)); }
  }, { passive: false });

  window.addEventListener('keydown', e => {
    if (body.dataset.view !== 'home') return;
    const vy = ['ArrowDown', 'PageDown', ' ', 'Spacebar'].indexOf(e.key) >= 0 ? 1 : (['ArrowUp', 'PageUp'].indexOf(e.key) >= 0 ? -1 : 0);
    if (!vy) return;
    e.preventDefault();
    if (canSnap()) snapTo(curStop + vy);
  }, { passive: false });

  /* ══════════════════════════════════════════════════════════════════════
     VIEW: role  ·  recolour + tags + video
     ══════════════════════════════════════════════════════════════════════ */
  const roleVideo  = document.getElementById('roleVideo');
  const roleCard   = document.getElementById('videoCard');
  let roleWired = false;
  let currentRoleSlug = null;

  // prev/next pager — cycles through the roles in tile order
  function gotoAdjacentRole(dir) {
    const order = TILES.map(t => t.slug);
    let i = order.indexOf(currentRoleSlug);
    if (i < 0) i = 0;
    location.hash = '#role/' + order[(i + dir + order.length) % order.length];
  }

  const lum = hex => {
    const c = hex.replace('#', '');
    const r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };
  const tryPlayRole = () => { const p = roleVideo.play(); if (p && p.catch) p.catch(() => {}); };
  function pauseRoleVideo() { if (!roleVideo.paused) roleVideo.pause(); }

  function wireRoleOnce() {
    if (roleWired) return;
    roleWired = true;
    roleVideo.addEventListener('playing', () => roleCard.classList.add('is-playing'));
    roleVideo.addEventListener('pause',   () => roleCard.classList.remove('is-playing'));
    document.getElementById('videoToggle').addEventListener('click', () => {
      roleVideo.paused ? tryPlayRole() : roleVideo.pause();
    });
    const pv = document.querySelector('.pager-prev'), nx = document.querySelector('.pager-next');
    if (pv) pv.addEventListener('click', () => gotoAdjacentRole(1));   // RTL: "prev" arrow → next
    if (nx) nx.addEventListener('click', () => gotoAdjacentRole(-1));
  }

  const PIN = '<svg class="tag-pin" viewBox="0 0 9 13" fill="none"><path d="M4.5 0.65C2.3 0.65 0.55 2.4 0.55 4.6c0 2.68 3.95 7.75 3.95 7.75s3.95-5.07 3.95-7.75C8.45 2.4 6.7 0.65 4.5 0.65Z" stroke="currentColor" stroke-width="0.9"/><circle cx="4.5" cy="4.6" r="1.3" stroke="currentColor" stroke-width="0.9"/></svg>';

  function enterRole(slug) {
    wireRoleOnce();
    const r = ROLES[slug] || ROLES.ezrahi;
    const root = document.documentElement;
    root.style.setProperty('--role-bg', r.bg);
    root.style.setProperty('--card-bg', r.card);
    root.style.setProperty('--card-ink', lum(r.card) > 0.55 ? '#111' : '#ffffff');
    root.style.setProperty('--hud-ink', lum(r.bg) > 0.55 ? '#3a3a3a' : '#ffffff');
    document.title = r.title + ' — מתפ״ש';

    const _iconUrl = roleIcon(ROLES[slug] ? slug : 'ezrahi'), _ri = document.getElementById('roleIcon');
    _ri.style.webkitMaskImage = 'url(' + _iconUrl + ')';
    _ri.style.maskImage = 'url(' + _iconUrl + ')';
    document.getElementById('tags').innerHTML = r.tags.map(t => '<span class="tag">' + t + PIN + '</span>').join('');
    document.getElementById('descTitle').textContent = 'מש״ק תיאום וקישור | ' + r.title;
    currentRoleSlug = ROLES[slug] ? slug : 'ezrahi';
    document.getElementById('descText').innerHTML = r.desc;

    roleVideo.poster = r.poster ? (PATH.posters + r.poster) : '';
    roleVideo.muted = true;
    const nextSrc = PATH.videos + r.video;
    if (!roleVideo.src.endsWith(nextSrc)) {
      roleVideo.src = nextSrc;
      roleVideo.addEventListener('loadedmetadata', function once() {
        if (r.start) { try { roleVideo.currentTime = r.start; } catch (e) {} }
        roleVideo.removeEventListener('loadedmetadata', once);
      });
    }
    window.scrollTo(0, 0);
    tryPlayRole();
  }

  /* ══════════════════════════════════════════════════════════════════════
     VIEW: map  ·  area pills swap a static map + description
     ══════════════════════════════════════════════════════════════════════ */
  const byKey = {}; BASES.forEach(b => byKey[b.key] = b);
  let mapBuilt = false;

  function buildMap() {
    if (mapBuilt) return;
    mapBuilt = true;
    const pills = document.getElementById('bases');
    BASES.forEach(b => {
      const btn = document.createElement('button');
      btn.className = 'area-btn'; btn.type = 'button'; btn.dataset.key = b.key;
      btn.textContent = b.label;
      btn.addEventListener('click', () => showBase(b.key, true));
      pills.appendChild(btn);
    });
  }

  function showBase(key, scrollPill) {
    const b = byKey[key] || BASES[0]; if (!b) return;
    const pills = document.getElementById('bases');
    const card  = document.getElementById('mapCard');
    const img   = document.getElementById('mapImg');
    pills.querySelectorAll('.area-btn').forEach(el => el.classList.toggle('active', el.dataset.key === b.key));
    document.getElementById('baseActivity').textContent = b.activity;
    document.getElementById('baseDesc').textContent = b.desc;
    if (b.img) { card.classList.remove('is-empty'); img.src = PATH.maps + b.img; img.alt = b.label; }
    else { card.classList.add('is-empty'); img.removeAttribute('src'); img.alt = ''; }
    if (scrollPill) {
      const ab = pills.querySelector('.area-btn.active');
      if (ab && ab.scrollIntoView) ab.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
  }

  function enterMap() {
    buildMap();
    if (!document.querySelector('.area-btn.active')) showBase(BASE_DEFAULT, false);
    window.scrollTo(0, 0);
  }

  /* ══════════════════════════════════════════════════════════════════════
     BOOT
     ══════════════════════════════════════════════════════════════════════ */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  // On a fresh load/refresh, always start at the hero. #mosaic is only an in-session back-target (set when
  // opening a role tile), so reaching it via a reload should land on the hero, not the assembled mosaic.
  let bootRoute = parseHash();
  if (bootRoute.view === 'home' && bootRoute.mosaic) {
    history.replaceState(null, '', '#home');
    bootRoute = { view: 'home' };
  }
  showView(bootRoute);
})();
