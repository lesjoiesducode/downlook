/* Downlook : moteur de la boîte. 100 % statique, rien ne quitte le navigateur. */
(() => {
'use strict';

// ---------------------------------------------------------------- Réglages
const Q = new URLSearchParams(location.search);
const FAST = Q.has('fast');                       // debug : arrivées toutes les 2 s
const FORCE_RARE = Q.get('rare');                 // debug : ?rare=1 (un rare tout de suite) ou ?rare=<id>
const statusParam = Q.get('status');              // debug : ?status=status-test.json
const STATUS_URL = statusParam && /^[\w\-]+\.json$/.test(statusParam) ? statusParam : 'status.json';
const START_DEFAULT = Date.parse('2026-11-12T16:17:00Z');
const UTM = 'utm_source=downlook&utm_medium=parodie&utm_campaign=panne-outlook';
const JOBS_URL = 'https://lesjoiesducode.fr/jobs';
const PAGE_URL = 'https://lesjoiesducode.github.io/downlook/';
const CONTENT_FILES = ['content/lot-a-mails.json', 'content/lot-b-invitations-rares.json', 'content/lot-c-claude.json'];
const RARE_CHANCE = 1 / 5;
// Mails écartés du tirage : objets trop proches d'un vrai hameçonnage (mot de passe qui expire,
// VPN, identifiant) sur une page qui ressemble à un webmail. Drôles, mais pas le risque.
const EXCLUDE = new Set(['a-rh-015', 'a-dsi-001', 'a-dsi-002', 'a-dsi-007', 'b-sys-010']);                        // une visite sur 5 voit un rare, parmi ~19 : chacun ~1/95
const TZ = 'Europe/Paris';
const W = window;

// ---------------------------------------------------------------- Icônes maison
const P = {
  menu: '<path d="M3 6h14M3 10h14M3 14h14"/>',
  dots: '<g fill="currentColor" stroke="none"><circle cx="4" cy="4" r="1.6"/><circle cx="10" cy="4" r="1.6"/><circle cx="16" cy="4" r="1.6"/><circle cx="4" cy="10" r="1.6"/><circle cx="10" cy="10" r="1.6"/><circle cx="16" cy="10" r="1.6"/><circle cx="4" cy="16" r="1.6"/><circle cx="10" cy="16" r="1.6"/><circle cx="16" cy="16" r="1.6"/></g>',
  search: '<circle cx="8.5" cy="8.5" r="5"/><path d="M12.5 12.5 17 17"/>',
  bell: '<path d="M5 14V9a5 5 0 0 1 10 0v5l1.5 1.5h-13zM8 17.5a2 2 0 0 0 4 0"/>',
  gear: '<circle cx="10" cy="10" r="2.6"/><path d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M4.7 15.3l1.4-1.4M13.9 6.1l1.4-1.4"/>',
  help: '<circle cx="10" cy="10" r="7.5"/><path d="M7.8 7.8a2.3 2.3 0 1 1 3.2 2.1c-.6.3-1 .8-1 1.5v.4M10 14.3v.1"/>',
  mail: '<rect x="2.5" y="4.5" width="15" height="11" rx="1.5"/><path d="m3 5.5 7 5 7-5"/>',
  calendar: '<rect x="3" y="4" width="14" height="13" rx="1.5"/><path d="M3 8h14M7 2.5v3M13 2.5v3"/>',
  people: '<circle cx="7.5" cy="7" r="2.8"/><path d="M2.5 16c.5-2.8 2.5-4.2 5-4.2s4.5 1.4 5 4.2"/><circle cx="14" cy="7.8" r="2.2"/><path d="M13.5 11.9c2 .1 3.5 1.3 4 3.6"/>',
  chat: '<path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v6a2.5 2.5 0 0 1-2.5 2.5H9l-4 3v-3h0A2 2 0 0 1 3 12z"/>',
  file: '<path d="M5 2.5h6.5L15.5 6.5v11h-10.5z"/><path d="M11.5 2.5v4h4"/>',
  check: '<circle cx="10" cy="10" r="7.5"/><path d="m6.8 10.2 2.2 2.2 4.4-4.6"/>',
  compose: '<path d="M4 16h3l8.5-8.5-3-3L4 13z"/><path d="m11.5 5.5 3 3"/>',
  trash: '<path d="M3.5 5.5h13M8 5.5V4h4v1.5M5 5.5l.8 11h8.4l.8-11"/>',
  archive: '<rect x="2.5" y="3.5" width="15" height="4" rx="1"/><path d="M4 7.5v8.5h12V7.5M8 10.5h4"/>',
  shield: '<path d="M10 2.5 16 5v5c0 3.6-2.6 6.4-6 7.5-3.4-1.1-6-3.9-6-7.5V5z"/>',
  reply: '<path d="M8 5 3.5 9.5 8 14"/><path d="M3.5 9.5H12a4.5 4.5 0 0 1 4.5 4.5v1"/>',
  replyall: '<path d="M9 5 4.5 9.5 9 14"/><path d="M5.5 5 1 9.5 5.5 14"/><path d="M4.5 9.5H13a4.5 4.5 0 0 1 4.5 4.5v1"/>',
  forward: '<path d="M12 5l4.5 4.5L12 14"/><path d="M16.5 9.5H8A4.5 4.5 0 0 0 3.5 14v1"/>',
  envopen: '<path d="M2.5 8.5 10 3.5l7.5 5v8h-15z"/><path d="m3 9 7 4.5L17 9"/>',
  flag: '<path d="M4.5 17.5V3h10l-2 3.5 2 3.5h-10"/>',
  camera: '<rect x="2.5" y="5.5" width="15" height="11" rx="2"/><path d="M7 5.5 8.3 3.5h3.4L13 5.5"/><circle cx="10" cy="11" r="3"/>',
  chev: '<path d="m6 8 4 4 4-4"/>',
  star: '<path d="m10 2.8 2.2 4.6 5 .6-3.7 3.4 1 5-4.5-2.5-4.5 2.5 1-5L2.8 8l5-.6z"/>',
  filter: '<path d="M3 5h14M5.5 10h9M8 15h4"/>',
  inbox: '<path d="M2.5 11.5 5 4.5h10l2.5 7v4h-15z"/><path d="M2.5 11.5h4.5l1 2h4l1-2h4.5"/>',
  draft: '<path d="M5 2.5h7l3.5 3.5v11.5H5z"/><path d="m8 14 1-3 4.5-4.5 2 2L11 13z"/>',
  send: '<path d="M2.8 9.8 17.2 3l-4.6 14-3.1-5.7z"/><path d="m9.5 11.3 7.7-8.3"/>',
  outbox: '<path d="M2.5 11.5 5 4.5h10l2.5 7v4h-15z"/><path d="M10 13V7M7.5 9.5 10 7l2.5 2.5"/>',
  junk: '<circle cx="10" cy="10" r="7.5"/><path d="m4.7 4.7 10.6 10.6"/>',
  storm: '<path d="M5.5 13.5a3.5 3.5 0 0 1-.3-7A5 5 0 0 1 15 7.3a3 3 0 0 1 .5 6.2z"/><path d="m10.5 13.5-2 3.5h3l-1.5 2.5"/>',
  clip: '<path d="m15.5 9.5-5.8 5.8a3.5 3.5 0 0 1-5-5L11 4a2.3 2.3 0 0 1 3.3 3.3L8.2 13.4a1.2 1.2 0 0 1-1.7-1.7l5.6-5.6"/>',
  invite: '<rect x="3" y="4" width="14" height="13" rx="1.5"/><path d="M3 8h14M7 2.5v3M13 2.5v3M7 12h2"/>',
  accept: '<path d="m4.5 10.5 3.5 3.5 7.5-8"/>',
  tent: '<path d="M10 3.5v3M10 13.5v3M4 10h3M13 10h3"/>',
  decline: '<path d="m5 5 10 10M15 5 5 15"/>',
  back: '<path d="M12.5 4 6.5 10l6 6"/>',
  share: '<path d="M10 3v10M6.5 6.5 10 3l3.5 3.5"/><path d="M5 10H3.5v7h13v-7H15"/>',
  download: '<path d="M10 3v10M6.5 9.5 10 13l3.5-3.5"/><path d="M3.5 15.5h13"/>',
  sparkle: '<path d="M10 2.5 11.6 8.4 17.5 10l-5.9 1.6L10 17.5l-1.6-5.9L2.5 10l5.9-1.6z"/>',
  link: '<path d="M8.5 11.5a3 3 0 0 0 4.2 0l3-3a3 3 0 0 0-4.2-4.2l-1 1M11.5 8.5a3 3 0 0 0-4.2 0l-3 3a3 3 0 0 0 4.2 4.2l1-1"/>',
  image: '<rect x="2.5" y="3.5" width="15" height="13" rx="1.5"/><circle cx="7" cy="8" r="1.5"/><path d="m3 15 4.5-4.5 3.5 3.5 2.5-2.5L17 15"/>',
};
const icon = (n, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 20 20" aria-hidden="true">${P[n] || ''}</svg>`;
document.querySelectorAll('i[data-i]').forEach(el => { el.outerHTML = icon(el.dataset.i); });

// ---------------------------------------------------------------- Hasard
const rnd = Math.random;
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const pickR = (r, arr) => arr[Math.floor(r() * arr.length)];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const newSeed = () => Math.floor(rnd() * 2147483647);
const nbsp = s => String(s).replace(/ (?=[€%])/g, ' ');

// ---------------------------------------------------------------- Variables communes
const POOLS = {
  projet: ['Atlas', 'Phoenix', 'Refonte V3', 'Orion', 'Mercure', 'Hermès', 'Titan', 'Nexus', 'Apollo', 'Pégase', 'Migration Cloud', 'Portail Client', 'Kraken', 'Zeus 2.0'],
  client: ['Groupe Ravel', 'Transports Morin', 'Mutuelle Horizon', 'Assurances Lemaire', 'Cabinet Vasseur', 'Laboratoires Brunel', 'Optisol', 'Groupe Fontaine'],
  appli: ['l\'intranet', 'l\'appli RH', 'le portail client', 'l\'ERP', 'l\'outil de notes de frais', 'le CRM', 'l\'appli mobile', 'le back-office'],
  salle: ['Everest', 'Mont-Blanc', 'Jupiter', 'Ada Lovelace', 'Bocal 3', 'Aquarium', 'Kilimandjaro', 'Turing'],
  jour: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
  h: ['8 h 30', '9 h', '9 h 30', '10 h', '11 h 30', '13 h 30', '14 h', '16 h 45', '17 h 30', '18 h'],
  annee: ['2026'],
  service: ['la DSI', 'l\'équipe produit', 'tout le plateau', 'l\'agence', 'la direction technique'],
  duree: ['1 h', '1 h 30', '2 h'],
};
const GEN = {
  n: r => String(2 + Math.floor(r() * 8)),
  nb: r => String(4 + Math.floor(r() * 20)),
  nn: r => String(10 + Math.floor(r() * 51)),
  nnn: r => String(100 + Math.floor(r() * 301)),
  ticket: r => String(1000 + Math.floor(r() * 9000)),
  version: r => `v${1 + Math.floor(r() * 4)}.${Math.floor(r() * 13)}.${Math.floor(r() * 10)}`,
  montant: r => nbsp(pickR(r, ['1 500 €', '4 800 €', '12 000 €', '25 000 €', '80 000 €', '150 000 €'])),
};

// ---------------------------------------------------------------- État
const S = {
  status: { state: 'ongoing', start: START_DEFAULT, end: null },
  defs: { common: [], invites: [], flee: [], shift: [], flying: [], rares: [], systeme: [], lotc: [], ssStart: null },
  byId: new Map(),
  suiteTargets: new Set(),
  jobs: [], memes: [], bossMemes: [],
  mails: [],          // dossier principal, plus récent en premier
  folders: {},        // autres dossiers
  folder: 'panne',
  sel: null,
  used: new Set(),
  liveCount: 0,
  plan: new Map(),    // index d'arrivée -> fonction qui produit les mails
  pendingSuites: [],  // { at: index, id }
  timer: null,
  liveMails: 0, liveMeet: 0,
  session: 0,
  started: false,
  endShownFor: null,
  uid: 0,
};

// ---------------------------------------------------------------- Normalisation des contenus
const arr = v => v == null ? [] : Array.isArray(v) ? v : [v];
function norm(x, src) {
  // Accepte le format des lots (français) et le format interne (anglais).
  const inv = x.invitation || x.invite || null;
  const d = {
    id: x.id, src,
    fam: x.famille || x.fam || src,
    kind: ({ invitation: 'invite', systeme: 'notif', mail: 'mail' })[x.type] || x.kind || (inv ? 'invite' : 'mail'),
    rare: x.rarete === 'rare' || !!x.rare,
    from: arr(x.de || x.from).filter(Boolean),
    role: x.role || '',
    email: x.email || '',
    subject: arr(x.objet || x.subject),
    body: String(x.corps || x.body || ''),
    vars: x.variables || x.vars || {},
    cc: Array.isArray(x.cc) ? x.cc : null,
    att: arr(x.pj || x.att),
    important: x.importance === 'haute' || !!x.important,
    burst: !!(x.rafale || x.burst),
    suite: x.suite || null,
    tag: x.tag || x.note || '',
    pinned: !!x.pinned,
    behavior: 'normal',
    invite: null,
    meta: x.meta || null,
  };
  if (inv) {
    d.invite = {
      title: inv.titre || inv.title || '',
      when: inv.quand || inv.when || '',
      where: inv.lieu || inv.where || '',
      duration: inv.duree || inv.duration || '',
      people: inv.people || null,
    };
    d.behavior = inv.comportement || (x.flee ? 'fuit' : 'normal');
  }
  if (!d.from.length) d.from = ['Expéditeur inconnu'];
  if (!d.subject.length) d.subject = ['(Sans objet)'];
  return d;
}
function register(d) { S.byId.set(d.id, d); return d; }

// ---------------------------------------------------------------- Rendu d'un mail
const STOP = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'l', 'd', 'et', 'à', 'au', 'aux', 'ton', 'ta', 'votre', 'vous', 'service', 'équipe']);
const AV_COLORS = ['#a4373a', '#8764b8', '#038387', '#ca5010', '#498205', '#986f0b', '#0078a8', '#c239b3', '#4f6bed', '#5c2e91', '#8e562e', '#637cef', '#005b70', '#7a7574'];
function initials(name) {
  const words = name.replace(/[()\[\],.:]/g, ' ').split(/[\s'’\-]+/).filter(w => w && !STOP.has(w.toLowerCase()));
  const w = words.length ? words : name.split(/\s+/);
  const letters = w.slice(0, 2).map(x => (x.match(/[A-Za-zÀ-ÿ0-9]/) || ['?'])[0].toUpperCase()).join('');
  return letters || '?';
}
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '') || 'contact';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function withUtm(url) {
  if (!/^https:\/\/lesjoiesducode\.fr/.test(url)) return url;
  return url + (url.includes('?') ? '&' : '?') + UTM;
}
function linkify(text) {
  // [texte](url) -> lien ; échappe le reste.
  let out = '', last = 0;
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g; let m;
  while ((m = re.exec(text))) {
    out += esc(text.slice(last, m.index));
    out += `<a href="${esc(withUtm(m[2]))}" target="_blank" rel="noopener">${esc(m[1])}</a>`;
    last = re.lastIndex;
  }
  return out + esc(text.slice(last));
}
const plain = text => text.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '$1');

function instantiate(def, seed, ts, extra = {}) {
  const r = mulberry32(seed);
  const memo = {};
  const ctx = Object.assign({}, extra);
  if (def.meta === 'job' && S.jobs.length) {
    const j = S.jobs[seed % S.jobs.length];
    Object.assign(ctx, { job_titre: j.title, job_entreprise: j.company, job_ville: j.city || 'en télétravail', job_url: j.url });
  }
  if (def.meta === 'meme' || def.meta === 'boss' || def.meta === 'memethread') {
    const pool = def.meta === 'boss' && S.bossMemes.length ? S.bossMemes : S.memes;
    if (pool.length) ctx.meme = pool[seed % pool.length];
  }
  ctx.jobs_url = JOBS_URL;
  if (ctx.meme) ctx.meme_titre = ctx.meme.title;
  const val = k => {
    if (k in memo) return memo[k];
    let v;
    if (k in ctx && typeof ctx[k] === 'string') v = ctx[k];
    else if (def.vars && def.vars[k] != null) v = Array.isArray(def.vars[k]) ? pickR(r, def.vars[k]) : String(def.vars[k]);
    else if (POOLS[k]) v = pickR(r, POOLS[k]);
    else if (GEN[k]) v = GEN[k](r);
    if (v != null) v = fill(String(v));
    memo[k] = v; return v;
  };
  const fill = s => String(s).replace(/\{([^{}]+)\}/g, (m0, k) => {
    if (k.includes('|')) return pickR(r, k.split('|'));
    const v = val(k.trim());
    if (v == null) { (S.unknown = S.unknown || []).push(`${def.id}:${k}`); return k; }
    return v;
  });
  const from = fill(pickR(r, def.from));
  const subject = fill(pickR(r, def.subject));
  const body = fill(def.body);
  const role = def.role ? fill(def.role) : '';
  const m = {
    uid: ++S.uid, defId: def.id, seed, ts, def,
    from, role, subject, body,
    email: (def.email ? def.email : slug(from)) + '@entreprise.example',
    initials: initials(from), color: AV_COLORS[hash(from) % AV_COLORS.length],
    cc: def.cc ? Math.round(def.cc[0] + r() * (def.cc[1] - def.cc[0])) : 0,
    att: def.att.map(fill),
    tag: def.tag ? fill(def.tag) : '',
    important: def.important, kind: def.kind, rare: def.rare, behavior: def.behavior, pinned: def.pinned,
    invite: def.invite ? {
      title: fill(def.invite.title || subject), when: fill(def.invite.when), where: fill(def.invite.where),
      duration: fill(def.invite.duration || ''),
      people: def.invite.people ? Math.round(def.invite.people[0] + r() * (def.invite.people[1] - def.invite.people[0])) : 0,
    } : null,
    meme: ctx.meme || null,
    unread: true, flying: false, gone: false, shift: 0,
  };
  if (m.invite && !m.invite.people && m.cc) m.invite.people = m.cc + 1;
  m.preview = plain(m.body).replace(/\s+/g, ' ').trim().slice(0, 160);
  return m;
}

// ---------------------------------------------------------------- Dates
const fmtTime = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
const fmtDay = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, weekday: 'short' });
const fmtDayLong = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, weekday: 'long' });
const fmtFull = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const dayKey = t => new Intl.DateTimeFormat('fr-CA', { timeZone: TZ }).format(t);
function dayDiff(t) { return Math.round((Date.parse(dayKey(Date.now())) - Date.parse(dayKey(t))) / 864e5); }
function listTime(t) { return dayDiff(t) === 0 ? fmtTime.format(t) : `${fmtDay.format(t)} ${fmtTime.format(t)}`; }
function groupLabel(t) { const d = dayDiff(t); if (d === 0) return 'Aujourd\'hui'; if (d === 1) return 'Hier'; const s = fmtDayLong.format(t); return s.charAt(0).toUpperCase() + s.slice(1); }
function dur(ms) { const m = Math.max(0, Math.floor(ms / 60000)); return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`; }

// ---------------------------------------------------------------- Panne : compteur et état
const $ = id => document.getElementById(id);
function outageEnd() { return S.status.state === 'ended' && S.status.end ? S.status.end : null; }
function elapsed() { return (outageEnd() || Date.now()) - S.status.start; }
function updateOutage() {
  const ended = !!outageEnd();
  $('outage').classList.toggle('ended', ended);
  const d = dur(elapsed());
  $('outageText').innerHTML = ended ? `<span class="lg">Panne terminée après</span><span class="sm">Terminée après</span> ${d}` : `<span class="lg">Panne en cours depuis</span><span class="sm">Panne depuis</span> ${d}`;
  const em = elapsed() / 60000;
  const mails = Math.round(em * 0.31) + S.liveMails;
  const meet = Math.round(em * 0.012) + S.liveMeet;
  $('statMails').textContent = mails.toLocaleString('fr-FR');
  $('statMeet').textContent = meet.toLocaleString('fr-FR');
  $('lStats').textContent = `${ended ? 'Panne terminée après' : 'Panne depuis'} ${d} · ${mails.toLocaleString('fr-FR')} mails évités · ${meet} réunions esquivées`;
  const info = $('infoBar');
  if (ended) { info.classList.add('show'); $('infoText').textContent = `La panne est terminée après ${d}. Ceci est une rediffusion.`; }
  else info.classList.remove('show');
}
async function fetchStatus() {
  try {
    const r = await fetch(`${STATUS_URL}?t=${Date.now()}`, { cache: 'no-store' });
    if (!r.ok) return;
    const j = await r.json();
    const start = Date.parse(j.start) || START_DEFAULT;
    const end = j.state === 'ended' && j.end ? Date.parse(j.end) : null;
    S.status = { state: end ? 'ended' : 'ongoing', start, end };
  } catch (e) { /* on garde l'état connu */ }
}
async function pollStatus() {
  const wasEnded = !!outageEnd();
  await fetchStatus();
  updateOutage();
  if (!wasEnded && outageEnd() && S.started) showEnd();
}
function showEnd() {
  const d = dur(elapsed());
  $('endDur').textContent = d; $('endDur2').textContent = d;
  $('endModal').classList.add('show');
}

// ---------------------------------------------------------------- Chargement des données
async function getJSON(url) {
  try { const r = await fetch(`${url}?t=${Math.floor(Date.now() / 300000)}`, { cache: 'no-cache' }); return r.ok ? await r.json() : null; } catch (e) { return null; }
}
async function loadAll() {
  const [lots, jobs, memes, memesFallback] = await Promise.all([
    Promise.all(CONTENT_FILES.map(getJSON)),
    getJSON('jobs.json'), getJSON('memes.json'), getJSON('memes-secours.json'),
    fetchStatus(),
  ]);
  // Offres : snapshot de moins de 48 h, offres non expirées seulement.
  if (jobs && Array.isArray(jobs.jobs) && Date.now() - Date.parse(jobs.updated) < 48 * 3600e3) {
    S.jobs = jobs.jobs.filter(j => j && j.title && j.company && j.url && (!j.validThrough || Date.parse(j.validThrough) > Date.now()));
  }
  const mm = (memes && Array.isArray(memes.memes) && memes.memes.length) ? memes.memes : (memesFallback && memesFallback.memes) || [];
  S.memes = mm.filter(m => m && m.image && m.url);
  S.bossMemes = S.memes.filter(m => m.boss);

  const D = S.defs;
  lots.forEach((lot, i) => {
    if (!Array.isArray(lot)) return;
    const src = ['lota', 'lotb', 'lotc'][i];
    lot.forEach(x => {
      if (!x || !x.id || EXCLUDE.has(x.id)) return;
      const d = register(norm(x, src));
      if (d.suite) S.suiteTargets.add(d.suite);
    });
  });
  for (const d of S.byId.values()) {
    if (S.suiteTargets.has(d.id)) continue;           // n'arrive qu'en suite d'un autre
    if (d.fam === 'secret-santa' && d.suite) { D.ssStart = D.ssStart || d; continue; }
    if (d.rare) { D.rares.push(d); continue; }
    if (d.src === 'lotc') { D.lotc.push(d); continue; }
    if (d.kind === 'invite') {
      if (d.behavior === 'fuit') D.flee.push(d);
      else if (d.behavior === 'se-decale') D.shift.push(d);
      else if (d.behavior === 'oubliettes') D.flying.push(d);
      else D.invites.push(d);
      continue;
    }
    D.common.push(d);
  }
  // Compléments maison
  W.DL_RARES.forEach(x => D.rares.push(register(Object.assign(norm(x, 'maison'), { rare: true }))));
  W.DL_FLYING.forEach((f, i) => D.flying.push(register(norm({
    id: `vol-${i}`, fam: 'reunion', kind: 'invite', from: shuffle(['Chef de projet {projet}', 'PMO', 'Bureau de la transformation', 'Direction des opérations']).slice(0, 2),
    subject: f.subject, body: 'Ordre du jour : à définir pendant la réunion.',
    invite: { title: f.subject, when: '{jour} à {h}', where: 'Salle {salle}', duration: f.duration, people: f.people },
  }, 'maison'))));
  const meta = (list, m) => list.map(x => register(Object.assign(norm(x, 'maison'), { meta: m })));
  D.jobMails = meta(W.DL_JOB_MAILS, 'job');
  D.siteMails = meta(W.DL_SITE_MAILS, 'site');
  D.memeMails = meta(W.DL_MEME_MAILS, 'meme');
  D.bossMails = meta(W.DL_BOSS_MAILS, 'boss');
  D.memeThread = register(Object.assign(norm(W.DL_MEME_THREAD, 'maison'), { meta: 'memethread', burst: true, echoes: W.DL_MEME_THREAD.echoes }));
  D.welcome = register(norm(W.DL_WELCOME, 'maison'));
  if (Q.has('debug')) console.log('banque', { common: D.common.length, invites: D.invites.length, flee: D.flee.length, shift: D.shift.length, flying: D.flying.length, rares: D.rares.length, lotc: D.lotc.length, jobs: S.jobs.length, memes: S.memes.length, boss: S.bossMemes.length });
}

// ---------------------------------------------------------------- Tirages
function takeFrom(list) {
  const free = list.filter(d => !S.used.has(d.id));
  if (!free.length) return null;
  const d = free[Math.floor(rnd() * free.length)];
  S.used.add(d.id);
  return d;
}
function make(def, ts, extra) { return instantiate(def, newSeed(), ts, extra); }
function jobDef() { const hasJobs = S.jobs.length > 0; return (hasJobs && rnd() < 0.75 ? takeFrom(S.defs.jobMails) : null) || takeFrom(S.defs.siteMails) || (hasJobs ? takeFrom(S.defs.jobMails) : null); }
function memeDef() { return S.memes.length ? takeFrom(S.defs.memeMails) : null; }

// ---------------------------------------------------------------- Construction d'une session
function buildSession(deepLink) {
  S.session++;
  clearTimeout(S.timer);
  Object.assign(S, { mails: [], used: new Set(), liveCount: 0, plan: new Map(), pendingSuites: [], liveMails: 0, liveMeet: 0, sel: null });
  const D = S.defs;
  const end = outageEnd() || Date.now();
  const start = S.status.start;
  const span = end - start;
  const hours = span / 3600e3;
  const count = Math.max(14, Math.min(32, Math.round(hours * 1.4)));
  // Horodatages : entre jeudi 17 h 18 et maintenant, la nuit plus calme.
  const times = [];
  while (times.length < count) {
    const t = start + 60e3 + rnd() * (span - 120e3);
    const h = Number(new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: 'numeric', hour12: false }).format(t));
    if (h >= 0 && h < 7 && rnd() < 0.8) continue;
    times.push(t);
  }
  times.sort((a, b) => a - b);
  const defs = [];
  if (D.ssStart) defs.push(D.ssStart);                                  // Secret Santa : l'annonce
  const j = jobDef(); if (j) defs.push(j);                               // une offre ou le site
  const mm = memeDef(); if (mm) defs.push(mm);                           // un meme
  const f = takeFrom(D.flee); if (f) defs.push(f);                       // l'invitation qui fuit
  const sh = takeFrom(D.shift); if (sh) defs.push(sh);                   // celle qui se décale
  for (let i = 0; i < 2; i++) { const c = takeFrom(D.lotc); if (c) defs.push(c); }
  for (let i = 0; i < 3; i++) { const v = takeFrom(D.invites); if (v) defs.push(v); }
  defs.forEach(d => S.used.add(d.id));
  while (defs.length < count) { const c = takeFrom(D.common); if (!c) break; defs.push(c); }
  // L'annonce du Secret Santa reste en tête de soirée jeudi, le reste est mélangé.
  const ss = D.ssStart && defs[0] === D.ssStart ? defs.shift() : null;
  shuffle(defs);
  if (ss) defs.unshift(ss);
  defs.forEach((d, i) => {
    const m = make(d, times[i] || (start + 30 * 60e3));
    m.unread = i >= defs.length * 0.45;
    S.mails.push(m);
    if (d.suite && (d === D.ssStart || rnd() < 0.5)) S.pendingSuites.push({ at: d === D.ssStart ? ri(1, 2) : ri(2, 10), id: d.suite });
  });
  S.mails.sort((a, b) => b.ts - a.ts);
  // Mail d'accueil épinglé
  const w = make(D.welcome, start); w.unread = false; S.mails.unshift(w);
  // Lien partagé : le mail transféré arrive en tête et s'ouvre.
  let open = w;
  if (deepLink) {
    const [id, seed] = deepLink.split('~');
    const d = S.byId.get(id);
    if (d && /^\d+$/.test(seed || '')) {
      S.used.add(d.id);
      open = instantiate(d, Number(seed), Math.min(Date.now(), end) - 60e3);
      open.unread = false; open.shared = true;
      S.mails.splice(1, 0, open);
    }
  }
  planLive();
  S.sel = open.uid;
  return open;
}

// Plan des arrivées en direct : position -> mails garantis.
function planLive() {
  const P2 = S.plan, D = S.defs;
  const put = (i, fn) => { while (P2.has(i)) i++; P2.set(i, fn); };
  // Secret Santa et suites
  // Offres : une ou deux autres dans la session
  put(ri(3, 6), () => single(jobDef()));
  if (rnd() < 0.7) put(ri(9, 14), () => single(jobDef()));
  // Memes : 1 à 3 de plus, dont parfois le fil "mdr" et souvent le chef
  if (S.memes.length) {
    put(ri(1, 4), () => single(memeDef()));
    if (rnd() < 0.7 && S.bossMemes.length) put(ri(4, 9), () => single(takeFrom(D.bossMails)));
    if (rnd() < 0.5) put(ri(8, 16), () => burstOf(D.memeThread, true));
  }
  // Lot C : un ou deux de plus
  put(ri(5, 11), () => single(takeFrom(D.lotc)));
  if (rnd() < 0.5) put(ri(12, 20), () => single(takeFrom(D.lotc)));
  // Rare
  const forced = FORCE_RARE && (D.rares.find(d => d.id === FORCE_RARE) || D.rares[ri(0, D.rares.length - 1)]);
  if (forced) P2.set(0, () => single(forced));
  else if (rnd() < RARE_CHANCE) put(ri(2, 10), () => single(takeFrom(D.rares)));
}
function single(d) { if (!d) return null; S.used.add(d.id); return [make(d, Date.now())]; }
function burstOf(d, isMeme) {
  if (!d) return null;
  S.used.add(d.id);
  const first = make(d, Date.now());
  const out = [first];
  const pool = isMeme ? d.echoes : W.DL_REPLYALL_ECHOES;
  const senders = shuffle(W.DL_ECHO_SENDERS.slice());
  const used = new Set();
  for (let k = 0; k < 2; k++) {
    let txt; do { txt = pool[ri(0, pool.length - 1)]; } while (used.has(txt) && used.size < pool.length); used.add(txt);
    const subj = (first.subject.startsWith('RE:') ? 'RE: ' : 'RE: ') + first.subject;
    const echo = make(register(norm({ id: `${d.id}-echo-${S.uid}-${k}`, from: [senders[k]], subject: subj, body: txt, cc: first.cc ? [first.cc, first.cc] : [80, 300] }, 'echo')), Date.now());
    if (isMeme) echo.meme = first.meme;
    out.push(echo);
  }
  return out;
}

// ---------------------------------------------------------------- Arrivées en direct
function nextArrival() {
  const i = S.liveCount++;
  // Suites dues
  const due = S.pendingSuites.findIndex(s => s.at <= i);
  if (due >= 0 && !S.plan.has(i)) {
    const s = S.pendingSuites.splice(due, 1)[0];
    const d = S.byId.get(s.id);
    if (d && !S.used.has(d.id)) {
      S.used.add(d.id);
      if (d.suite) S.pendingSuites.push({ at: i + ri(2, 3), id: d.suite });
      return [make(d, Date.now())];
    }
  }
  if (S.plan.has(i)) { const r = S.plan.get(i)(); if (r && r.length) return r; }
  const D = S.defs;
  if (i % 5 === 3) { const fl = takeFrom(D.flying); if (fl) return [make(fl, Date.now())]; }
  if (rnd() < 0.15) { const b = takeFrom(D.common.filter(d => d.burst)); if (b) return burstOf(b, false); }
  if (rnd() < 0.18) { const v = takeFrom(D.invites); if (v) return [make(v, Date.now())]; }
  const c = takeFrom(D.common.filter(d => !d.burst)) || takeFrom(D.common) || takeFrom(D.invites) || takeFrom(D.flying) || takeFrom(D.lotc);
  if (c) { if (c.suite) S.pendingSuites.push({ at: i + ri(2, 4), id: c.suite }); return c.burst ? burstOf(c, false) : [make(c, Date.now())]; }
  return null;
}
function scheduleNext(first) {
  clearTimeout(S.timer);
  const sess = S.session;
  const delay = FAST ? ri(1500, 2500) : first ? ri(5000, 8000) : ri(15000, 45000);
  S.timer = setTimeout(() => {
    if (sess !== S.session) return;
    const batch = nextArrival();
    if (!batch) { outOfMail(); return; }
    deliver(batch, sess);
    scheduleNext(false);
  }, FORCE_RARE && S.liveCount === 0 ? 2500 : delay);
}
function deliver(batch, sess) {
  batch.forEach((m, k) => setTimeout(() => {
    if (sess !== S.session) return;
    m.ts = Math.min(Date.now(), outageEnd() || Date.now());
    if (outageEnd()) m.ts = Date.now();
    const pinnedCount = S.mails.filter(x => x.pinned || x.shared).length;
    S.mails.splice(pinnedCount, 0, m);
    S.liveMails++;
    if (m.kind === 'invite') S.liveMeet++;
    m.isNew = true;
    if (S.folder === 'panne') renderList();
    updateOutage(); updateCounts();
    notify(m);
    if (m.kind === 'invite' && m.behavior === 'oubliettes') setTimeout(() => flyAway(m, sess), ri(7000, 10000));
  }, k * ri(1400, 2600)));
}
function flyAway(m, sess) {
  if (sess !== S.session || m.gone) return;
  m.fate = W.DL_FATES[ri(0, W.DL_FATES.length - 1)];
  const el = document.querySelector(`.item[data-uid="${m.uid}"]`);
  if (el && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.querySelector('.fate').innerHTML = `${icon('storm')} ${esc(m.fate)}`;
    el.classList.add('leaving');
  }
  setTimeout(() => {
    m.gone = true;
    S.mails = S.mails.filter(x => x !== m);
    if (S.folder === 'panne') renderList();
    if (S.sel === m.uid) renderRead(m);
    updateCounts();
  }, 1500);
}
function outOfMail() {
  if (S.used.has('fin')) return;
  S.used.add('fin');
  deliver([instantiate(register(norm({ id: 'fin', from: ['Downlook'], email: 'ne-pas-repondre', subject: 'Vous avez lu tous les mails que vous n\'avez pas reçus',
    body: 'Bravo. Il n\'y a plus rien à ne pas recevoir.\n\nVous pouvez rejouer la panne depuis le début, ou aller prendre un café. Les deux sont acceptables.' }, 'maison')), 1, Date.now())], S.session);
}

// ---------------------------------------------------------------- Dossiers
const FOLDERS = [
  { id: 'panne', name: 'Non reçus grâce à la panne', ic: 'storm' },
  { id: 'inbox', name: 'Boîte de réception', ic: 'inbox' },
  { id: 'drafts', name: 'Brouillons', ic: 'draft' },
  { id: 'sent', name: 'Éléments envoyés', ic: 'send' },
  { id: 'outbox', name: 'Boîte d\'envoi', ic: 'outbox' },
  { id: 'junk', name: 'Courrier indésirable', ic: 'junk' },
  { id: 'deleted', name: 'Éléments supprimés', ic: 'trash' },
  { id: 'archive', name: 'Archive', ic: 'archive' },
];
function buildFolders() {
  const F = W.DL_FOLDERS;
  const mk = list => list.map((x, i) => { const m = instantiate(register(norm(x, 'maison')), 7 + i, S.status.start - (i + 1) * 3600e3 * 5); m.unread = false; return m; });
  S.folders = { drafts: mk(F.drafts), outbox: mk(F.outbox), junk: mk(F.junk), deleted: mk(F.deleted) };
  S.folders.outbox.forEach(m => { m.ts = S.status.start + 2 * 60e3; });
}
function folderCount(id) {
  if (id === 'panne') return { n: S.mails.filter(m => m.unread).length, blue: true };
  if (id === 'drafts' || id === 'outbox') return { n: (S.folders[id] || []).length, blue: false };
  if (id === 'junk') return { n: (S.folders[id] || []).length, blue: true };
  return { n: 0 };
}
function updateCounts() {
  const html = list => list.map(f => {
    const c = folderCount(f.id);
    return `<button class="folder${S.folder === f.id ? ' on' : ''}" data-folder="${f.id}">${icon(f.ic)}<span class="name">${esc(f.name)}</span>${c.n ? `<span class="count${c.blue ? '' : ' grey'}">${c.n}</span>` : ''}</button>`;
  }).join('');
  $('favs').innerHTML = html(FOLDERS.slice(0, 2));
  $('flist').innerHTML = html(FOLDERS);
  const unread = S.mails.filter(m => m.unread).length;
  document.title = `${unread ? `(${unread}) ` : ''}Courrier - Downlook`;
}
function currentList() { return S.folder === 'panne' ? S.mails : (S.folders[S.folder] || []); }

// ---------------------------------------------------------------- Liste
function itemHTML(m) {
  const marks = [];
  if (m.att.length || m.meme) marks.push(icon('clip'));
  if (m.kind === 'invite') marks.push(icon('invite'));
  const badges = [];
  if (m.pinned) badges.push('<span class="badge pin">Épinglé</span>');
  if (m.shared) badges.push('<span class="badge inv">Transféré</span>');
  if (m.rare) badges.push('<span class="badge rare">Mail rare</span>');
  return `<div class="item${m.unread ? ' unread' : ''}${S.sel === m.uid ? ' sel' : ''}${m.isNew ? ' arrive' : ''}" data-uid="${m.uid}" role="button" tabindex="0">
    <div class="av" style="background:${m.color}">${esc(m.initials)}</div>
    <div class="from">${esc(m.from)}</div><div class="time">${m.pinned ? '' : esc(listTime(m.ts))}</div>
    <div class="subj">${m.important ? '<span class="imp">!</span>' : ''}${badges.join('')}<span class="s">${esc(m.subject)}</span><span class="marks">${marks.join('')}</span></div>
    <div class="prev">${esc(m.kind === 'invite' && m.invite ? `${m.invite.when}${m.invite.where ? ' · ' + m.invite.where : ''}` : m.preview)}</div>
    <div class="fate"></div>
  </div>`;
}
function renderList() {
  const box = $('items');
  const list = currentList();
  const f = FOLDERS.find(x => x.id === S.folder);
  $('listTitle').textContent = f ? f.name : '';
  if (!list.length) {
    const e = W.DL_FOLDERS[S.folder] || { empty: 'Rien ici.', sub: '' };
    box.innerHTML = `<div class="empty">${emptyArt()}<div class="big">${esc(e.empty)}</div><div>${esc(e.sub || '')}</div></div>`;
    return;
  }
  let html = '', grp = null;
  list.forEach(m => {
    const g = (m.pinned || m.shared) ? 'Épinglé' : groupLabel(m.ts);
    if (g !== grp) { html += `<div class="grp">${esc(g)}</div>`; grp = g; }
    html += itemHTML(m);
    m.isNew = false;
  });
  const st = box.scrollTop;
  box.innerHTML = html;
  box.scrollTop = st;
}
function emptyArt() {
  return `<svg viewBox="0 0 96 96" aria-hidden="true"><rect x="14" y="26" width="68" height="48" rx="6" fill="#ebf3fc" stroke="#0f6cbd" stroke-width="2"/><path d="m16 30 32 22 32-22" fill="none" stroke="#0f6cbd" stroke-width="2"/><circle cx="74" cy="26" r="10" fill="#fff" stroke="#0f6cbd" stroke-width="2"/><path d="M70 26h8" stroke="#0f6cbd" stroke-width="2.4" stroke-linecap="round"/></svg>`;
}

// ---------------------------------------------------------------- Lecture
const STATUS_LINES = [
  'Ce message ne vous a jamais été remis. Personne n\'a été dérangé.',
  'Statut de remise : bloqué quelque part entre deux serveurs.',
  'Statut de remise : différé à une date inconnue.',
  'Jamais arrivé. Tant mieux.',
];
function findMail(uid) { return S.mails.find(m => m.uid === uid) || Object.values(S.folders).flat().find(m => m.uid === uid); }
function renderRead(m) {
  const box = $('read');
  const mob = `<div class="r-mobilebar"><button class="back" id="rBack" aria-label="Retour">${icon('back')}</button><span class="sp"></span><button data-act="reply" aria-label="Répondre">${icon('reply')}</button><button data-act="forward">${icon('forward')}Transférer</button></div>`;
  if (!m || m.gone) {
    const fate = m && m.fate ? m.fate : 'Partie aux oubliettes';
    box.innerHTML = `${mob}<div class="r-inner"><div class="empty">${emptyArt()}<div class="big">Cette invitation s'est envolée.</div><div>Statut : ${esc(fate)}. Une réunion de moins.</div></div></div>`;
    bindRead(null); return;
  }
  const date = fmtFull.format(m.ts);
  const to = `À : Vous${m.cc ? ` ; Cc : ${m.cc} ${m.cc > 1 ? 'personnes' : 'personne'}` : ''}`;
  let inner = `<div class="r-subject">${m.rare ? '<span class="badge rare">Mail rare</span>' : ''}<span>${esc(m.subject)}</span></div>
  <div class="r-from">
    <div class="av lg" style="background:${m.color}">${esc(m.initials)}</div>
    <div class="who"><div class="name">${esc(m.from)} <span class="addr">&lt;${esc(m.email)}&gt;</span></div>
      ${m.role ? `<div class="to">${esc(m.role)}</div>` : ''}<div class="to">${esc(to)}</div><div class="date">${esc(date)}</div></div>
    <div class="r-acts"><button data-act="reply" aria-label="Répondre">${icon('reply')}</button><button data-act="replyall" aria-label="Répondre à tous">${icon('replyall')}</button><button data-act="forward" aria-label="Transférer">${icon('forward')}</button></div>
  </div>`;
  if (m.rare) inner += `<div class="banner rare">${icon('sparkle')}<span>Mail rare : il n'apparaît qu'une visite sur 100 environ. Transférez-le avant qu'il ne reparte.</span></div>`;
  if (m.important) inner += `<div class="banner imp"><b>!</b><span>Ce message a été envoyé avec une importance haute.</span></div>`;
  if (m.invite) {
    const d = new Date(m.ts);
    inner += `<div class="invite" id="inv"><div class="i-top"><div class="cal"><div class="m">${esc(new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, month: 'short' }).format(d).replace('.', ''))}</div><div class="d">${esc(new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, day: 'numeric' }).format(d))}</div></div>
      <div><div class="i-title">${esc(m.invite.title || m.subject)}</div><div class="i-meta" id="invMeta">${inviteMeta(m)}</div></div></div>
      <div class="i-btns"><button class="btn accept${m.behavior === 'fuit' ? ' flee' : ''}" data-inv="accept">${icon('accept')}Accepter</button><button class="btn tent" data-inv="tent">${icon('tent')}Provisoire</button><button class="btn decline" data-inv="decline">${icon('decline')}Refuser</button></div></div>`;
  }
  const atts = m.att.map(a => `<div class="att">${icon('file')}<span>${esc(a)}</span></div>`);
  if (m.meme) atts.push(`<div class="att">${icon('image')}<span>${esc(memeFile(m.meme))}</span></div>`);
  if (atts.length) inner += `<div class="atts">${atts.join('')}</div>`;
  inner += `<div class="r-body">${m.body.split(/\n{2,}/).map(p => `<p>${linkify(p).replace(/\n/g, '<br>')}</p>`).join('')}`;
  if (m.meme) inner += `<figure class="meme"><a href="${esc(withUtm(m.meme.url))}" target="_blank" rel="noopener"><img src="${esc(m.meme.image)}" alt="${esc(m.meme.alt || m.meme.title)}" loading="lazy" referrerpolicy="no-referrer"></a><figcaption class="cap">"${esc(m.meme.title)}", vu sur <a href="${esc(withUtm(m.meme.url))}" target="_blank" rel="noopener">lesjoiesducode.fr</a></figcaption></figure>`;
  inner += `</div>`;
  if (m.tag) inner += `<div class="tag">${esc(m.tag)}</div>`;
  inner += `<div class="r-foot"><button class="btn" data-act="reply">${icon('reply')}Répondre</button><button class="btn" data-act="replyall">${icon('replyall')}Répondre à tous</button><button class="btn" data-act="forward">${icon('forward')}Transférer</button></div>`;
  if (!m.pinned) inner += `<div class="status-line">${esc(STATUS_LINES[m.uid % STATUS_LINES.length])}</div>`;
  box.innerHTML = `${mob}<div class="r-inner">${inner}</div>`;
  box.scrollTop = 0;
  bindRead(m);
}
function memeFile(meme) { const f = meme.image.split('/').pop(); return f.length > 42 ? f.slice(0, 38) + '….jpg' : f; }
function inviteMeta(m) {
  const i = m.invite, bits = [];
  bits.push(esc(i.when || 'Date à définir'));
  if (m.shift) bits.push(`<b>Décalée ${m.shift} fois. Nouvel horaire : ${m.shift * 15} min plus tard. Merci de confirmer à nouveau.</b>`);
  if (i.duration) bits.push(`Durée : ${esc(i.duration)}`);
  if (i.where) bits.push(esc(i.where));
  bits.push(`Organisateur : ${esc(m.from)}${i.people ? ` · ${i.people} participants` : ''}`);
  return bits.join('<br>');
}
function bindRead(m) {
  const back = $('rBack'); if (back) back.onclick = () => document.body.classList.remove('reading');
  if (!m || !m.invite) return;
  const inv = $('inv');
  inv.querySelectorAll('[data-inv]').forEach(b => {
    b.onclick = e => { e.preventDefault(); inviteAction(m, b.dataset.inv); };
  });
  const acc = inv.querySelector('.flee');
  if (acc) {
    let n = 0;
    const run = e => {
      n++;
      const zone = inv.querySelector('.i-btns').getBoundingClientRect();
      const bw = acc.offsetWidth, bh = acc.offsetHeight;
      const maxX = Math.max(40, zone.width - bw - 32), maxY = 40;
      const x = ri(-10, maxX) - acc.offsetLeft + 16, y = ri(-maxY, maxY);
      acc.style.transform = `translate(${x}px, ${y}px) rotate(${ri(-12, 12)}deg)`;
      if (n === 6) acc.lastChild.textContent = 'Toujours pas';
      if (n === 12) acc.lastChild.textContent = 'Non';
      if (e && e.type === 'pointerdown') { e.preventDefault(); e.stopPropagation(); }
    };
    acc.addEventListener('pointerenter', run);
    acc.addEventListener('pointerdown', run);
    acc.addEventListener('focus', run);
  }
}
function inviteAction(m, a) {
  if (m.behavior === 'fuit' && a === 'accept') { toast('Comment avez-vous fait ? La réunion est annulée quand même.'); return; }
  if (m.behavior === 'se-decale' && a !== 'decline') {
    m.shift++;
    $('invMeta').innerHTML = inviteMeta(m);
    toast('L\'organisateur a déplacé la réunion pendant que vous répondiez.');
    return;
  }
  const T = {
    accept: ['Accepté. L\'organisateur ne le saura jamais. La réunion non plus.', 'Réponse "Accepter" placée dans la boîte d\'envoi. Elle y restera.'],
    tent: ['Réponse provisoire enregistrée. Provisoire comme le correctif de 2019, toujours en prod.', 'Provisoire. C\'est-à-dire non.'],
    decline: ['Refus prêt à partir. Il ne partira pas. Vous êtes libre quand même.', 'Refusé. Personne n\'en saura rien, c\'est le principe.'],
  };
  toast(T[a][ri(0, 1)]);
  if (!m.answered) { m.answered = true; }
}

// ---------------------------------------------------------------- Sélection
function select(uid, fromClick) {
  const m = findMail(uid);
  if (!m) return;
  S.sel = uid;
  if (m.unread) { m.unread = false; updateCounts(); }
  document.querySelectorAll('.item.sel').forEach(e => e.classList.remove('sel'));
  const el = document.querySelector(`.item[data-uid="${uid}"]`);
  if (el) { el.classList.add('sel'); el.classList.remove('unread'); }
  renderRead(m);
  if (fromClick) document.body.classList.add('reading');
}
function selected() { const m = S.sel ? findMail(S.sel) : null; return m && !m.gone ? m : null; }

// ---------------------------------------------------------------- Notifications
function toast(text, opts = {}) {
  const box = $('toasts');
  const t = document.createElement('div');
  t.className = 'toast' + (opts.mail ? ' msg' : '');
  t.innerHTML = opts.mail
    ? `<div class="av" style="background:${opts.mail.color}">${esc(opts.mail.initials)}</div><div class="t-body"><div class="t-title">${esc(opts.mail.from)}${opts.mail.rare ? ' · Mail rare' : ''}</div><div class="t-text">${esc(opts.mail.subject)}</div></div>`
    : `<div class="t-body"><div class="t-text" style="color:#242424;-webkit-line-clamp:4">${esc(text)}</div></div>`;
  if (opts.mail) t.onclick = () => { if (!opts.mail.gone) { if (S.folder !== 'panne') openFolder('panne'); select(opts.mail.uid, true); } t.remove(); };
  box.prepend(t);
  while (box.children.length > 3) box.lastChild.remove();
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, opts.mail ? 5000 : 4200);
}
function notify(m) { toast(null, { mail: m }); }

const TOASTS = {
  apps: 'Toutes vos applications sont en pause. Celle-ci aussi, mais elle le cache bien.',
  search: 'La recherche est en panne. Ce que vous cherchez n\'est pas arrivé de toute façon.',
  bell: 'Aucune notification. Profitez-en.',
  settings: 'Paramètres indisponibles. Tout est déjà réglé sur "ne rien recevoir".',
  help: 'L\'aide a été envoyée par mail.',
  calendar: 'Agenda vide. Toutes vos réunions ont été esquivées.',
  people: 'Vos contacts sont injoignables. Ils vont très bien.',
  chat: 'La messagerie instantanée fait une pause aussi. Parlez à votre voisin de bureau.',
  files: 'Vos fichiers sont là. Personne ne vous demande de les modifier, c\'est nouveau.',
  todo: 'Liste de tâches : 0. Chiffre historique.',
  view: 'Affichage : "mode panne" déjà activé.',
  filter: 'Filtre appliqué : rien.',
};
const ACTS = {
  new: ['Rédaction impossible : personne ne le recevrait. Profitez-en.', 'Nouveau courrier ? Personne ne le lira avant lundi.'],
  delete: ['Impossible de supprimer un mail qui n\'est jamais arrivé.', 'Supprimé. Enfin, il n\'était pas vraiment là.'],
  archive: ['Archivé dans un datacenter qui ne répond pas.', 'Archivé. Vous le retrouverez en 2037.'],
  report: ['Signalé. Le signalement n\'est pas arrivé non plus.', 'Signalement envoyé à personne.'],
  reply: ['Votre réponse a été placée dans la boîte d\'envoi. Elle y restera.', 'Réponse prête. Le serveur, lui, ne l\'est pas.'],
  replyall: ['Non. Pas cette fois.', 'Répondre à tous : bloqué pour votre bien et celui de 214 personnes.'],
  read: ['Marqué comme lu. Vous ne l\'avez pourtant pas reçu.', 'Marqué comme non lu. Comme tous les autres, en fait.'],
  flag: ['Indicateur posé. Échéance : quand le serveur reviendra.', 'Suivi activé. Rien ne bougera.'],
};

// ---------------------------------------------------------------- Transférer (lien direct vers un mail)
const linkable = m => !(m.def.src === 'echo' || m.pinned || m.defId === 'fin' || m.def.src === 'maison' && !S.byId.has(m.defId));
async function copyLink(m) {
  const url = `${PAGE_URL}?m=${encodeURIComponent(m.defId)}~${m.seed}`;
  const text = `"${m.subject}" : tu ne l'as pas reçu non plus.`;
  if (navigator.share && matchMedia('(max-width: 860px)').matches) {
    try { await navigator.share({ title: 'Downlook', text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(url); toast('Lien copié. Transférez-le à un collègue qui ne l\'a pas reçu non plus.'); }
  catch (e) { toast(url); }
}

// ---------------------------------------------------------------- Capture du mail (canvas, sans dépendance)
const CF = '"Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif';
function wrap(ctx, text, maxW) {
  const out = [];
  text.split('\n').forEach(line => {
    const words = line.split(' '); let cur = '';
    words.forEach(w => {
      const t = cur ? cur + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t;
    });
    out.push(cur);
  });
  return out;
}
function drawMail(m, dry) {
  const Wd = 1200, pad = 64, inner = Wd - pad * 2;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  let y = 0;
  const ops = [];
  const op = f => ops.push(f);
  // Barre
  op(g => { g.fillStyle = '#0f6cbd'; g.fillRect(0, 0, Wd, 84); g.fillStyle = '#fff'; g.font = `600 34px ${CF}`; g.textBaseline = 'middle'; g.fillText('Downlook', pad, 43); g.font = `400 22px ${CF}`; g.textAlign = 'right'; g.fillText(m.rare ? 'Mail rare · non reçu grâce à la panne' : 'Non reçu grâce à la panne', Wd - pad, 44); g.textAlign = 'left'; });
  y = 84 + 52;
  // Objet
  ctx.font = `600 44px ${CF}`;
  const subj = wrap(ctx, (m.important ? '! ' : '') + m.subject, inner);
  const ys = y; op(g => { g.fillStyle = '#242424'; g.font = `600 44px ${CF}`; g.textBaseline = 'alphabetic'; subj.forEach((l, i) => g.fillText(l, pad, ys + 40 + i * 56)); });
  y += subj.length * 56 + 26;
  // Expéditeur
  const yf = y;
  op(g => {
    g.fillStyle = m.color; g.beginPath(); g.arc(pad + 34, yf + 34, 34, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.font = `600 26px ${CF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(m.initials, pad + 34, yf + 35); g.textAlign = 'left';
    g.textBaseline = 'alphabetic'; g.fillStyle = '#242424'; g.font = `600 28px ${CF}`;
    let name = m.from; while (g.measureText(name).width > inner - 380 && name.length > 8) name = name.slice(0, -2);
    g.fillText(name + (name !== m.from ? '…' : ''), pad + 90, yf + 26);
    g.fillStyle = '#616161'; g.font = `400 22px ${CF}`;
    g.fillText(`À : Vous${m.cc ? ` ; Cc : ${m.cc} personnes` : ''}`, pad + 90, yf + 62);
    g.textAlign = 'right'; g.fillText(fmtFull.format(m.ts), Wd - pad, yf + 26); g.textAlign = 'left';
  });
  y += 68 + 30;
  op(g => { g.fillStyle = '#e0e0e0'; g.fillRect(pad, y - 14, inner, 2); });
  const yAfterRule = y;
  y += 20;
  // Invitation
  if (m.invite) {
    ctx.font = `400 24px ${CF}`;
    const meta = wrap(ctx, [m.invite.when, m.invite.duration ? `Durée : ${m.invite.duration}` : '', m.invite.where, m.invite.people ? `${m.invite.people} participants` : ''].filter(Boolean).join(' · '), inner - 48);
    const h = 70 + meta.length * 34 + 80;
    const yi = y;
    op(g => {
      g.strokeStyle = '#d1d1d1'; g.lineWidth = 2; roundRect(g, pad, yi, inner, h, 12); g.stroke();
      g.fillStyle = '#242424'; g.font = `600 28px ${CF}`; g.fillText(m.invite.title || m.subject, pad + 24, yi + 46);
      g.fillStyle = '#616161'; g.font = `400 24px ${CF}`; meta.forEach((l, i) => g.fillText(l, pad + 24, yi + 84 + i * 34));
      let bx = pad + 24; const by = yi + h - 64;
      [['Accepter', '#107c10'], ['Provisoire', '#8a8886'], ['Refuser', '#c50f1f']].forEach(([t, col]) => {
        g.font = `600 22px ${CF}`; const w = g.measureText(t).width + 40;
        g.strokeStyle = '#d1d1d1'; roundRect(g, bx, by, w, 44, 6); g.stroke(); g.fillStyle = col; g.fillText(t, bx + 20, by + 30); bx += w + 14;
      });
    });
    y += h + 30;
  }
  // Corps
  ctx.font = `400 30px ${CF}`;
  const paras = plain(m.body).split(/\n{2,}/);
  const lines = [];
  paras.forEach((p, i) => { wrap(ctx, p, inner).forEach(l => lines.push(l)); if (i < paras.length - 1) lines.push(null); });
  const yb = y;
  op(g => { g.fillStyle = '#242424'; g.font = `400 30px ${CF}`; let yy = yb + 30; lines.forEach(l => { if (l === null) { yy += 22; return; } g.fillText(l, pad, yy); yy += 44; }); });
  y += lines.reduce((a, l) => a + (l === null ? 22 : 44), 0) + 14;
  if (m.meme) {
    const yy = y;
    ctx.font = `400 24px ${CF}`;
    const t = wrap(ctx, `Image jointe : "${m.meme.title}" (à voir sur lesjoiesducode.fr)`, inner - 40);
    op(g => { g.fillStyle = '#f5f5f5'; roundRect(g, pad, yy, inner, 30 + t.length * 34, 8); g.fill(); g.fillStyle = '#616161'; g.font = `400 24px ${CF}`; t.forEach((l, i) => g.fillText(l, pad + 20, yy + 40 + i * 34)); });
    y += 40 + t.length * 34 + 10;
  }
  if (m.tag) {
    ctx.font = `italic 400 24px ${CF}`;
    const t = wrap(ctx, m.tag, inner - 44);
    const yy = y + 6, h = 30 + t.length * 34;
    op(g => { g.fillStyle = '#f5f5f5'; g.fillRect(pad, yy, inner, h); g.fillStyle = '#c8c8c8'; g.fillRect(pad, yy, 5, h); g.fillStyle = '#616161'; g.font = `italic 400 24px ${CF}`; t.forEach((l, i) => g.fillText(l, pad + 26, yy + 40 + i * 34)); });
    y += h + 26;
  }
  y += 24;
  const H = Math.max(630, y + 80);
  op(g => { g.fillStyle = '#f0f0f0'; g.fillRect(0, H - 80, Wd, 80); g.fillStyle = '#616161'; g.font = `400 22px ${CF}`; g.textBaseline = 'middle'; g.fillText('Downlook · parodie par Les Joies du Code', pad, H - 40); g.textAlign = 'right'; g.fillStyle = '#0f6cbd'; g.font = `600 22px ${CF}`; g.fillText('lesjoiesducode.github.io/downlook', Wd - pad, H - 40); g.textAlign = 'left'; g.textBaseline = 'alphabetic'; });
  c.width = Wd; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, Wd, H);
  ops.forEach(f => f(g));
  void yAfterRule; void dry;
  return c;
}
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
// Fenêtre "Transférer" : l'image du mail et des boutons de partage, aucun champ de saisie.
function forward(m) {
  if (!m) { toast('Choisissez d\'abord un mail à transférer.'); return; }
  const c = drawMail(m);
  const url = c.toDataURL('image/png');
  $('fwdSubject').textContent = `TR: ${m.subject}`;
  $('capImg').src = url;
  const name = `downlook-${slug(m.subject).slice(0, 40)}.png`;
  $('capDl').href = url; $('capDl').download = name;
  $('fwdLink').hidden = !linkable(m);
  $('fwdLink').onclick = () => copyLink(m);
  const shareUrl = linkable(m) ? `${PAGE_URL}?m=${encodeURIComponent(m.defId)}~${m.seed}` : PAGE_URL;
  $('fwdLinkedin').href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  $('fwdX').href = `https://x.com/intent/post?text=${encodeURIComponent(`"${m.subject}" : pas reçu grâce à la panne.`)}&url=${encodeURIComponent(shareUrl)}`;
  $('capCopy').hidden = !(W.ClipboardItem && navigator.clipboard && navigator.clipboard.write);
  $('capShare').hidden = true;
  c.toBlob(b => {
    if (!b) return;
    const file = new File([b], name, { type: 'image/png' });
    $('capCopy').onclick = async () => {
      try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]); toast('Image copiée. Collez-la où vous voulez, sauf dans un mail.'); }
      catch (e) { toast('Copie impossible ici. Utilisez "Télécharger".'); }
    };
    $('capShare').hidden = !(navigator.canShare && navigator.canShare({ files: [file] }));
    $('capShare').onclick = async () => { try { await navigator.share({ files: [file], title: 'Downlook', text: `Pas reçu grâce à la panne. ${PAGE_URL}` }); } catch (e) { /* annulé */ } };
  }, 'image/png');
  $('capModal').classList.add('show');
}

// ---------------------------------------------------------------- Interactions
function openFolder(id) {
  S.folder = id;
  updateCounts(); renderList();
  const list = currentList();
  document.body.classList.remove('drawer');
  if (list.length && !matchMedia('(max-width: 860px)').matches) select(list[0].uid);
  else if (!list.length) $('read').innerHTML = `<div class="r-inner"><div class="empty">${emptyArt()}<div class="big">Sélectionnez un élément à lire</div><div>Rien n'est sélectionné.</div></div></div>`;
}
function bind() {
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-toast],[data-act],[data-folder],.item');
    if (!t) return;
    if (t.dataset.toast) { toast(TOASTS[t.dataset.toast] || 'Indisponible pendant la panne.'); return; }
    if (t.dataset.folder) { openFolder(t.dataset.folder); return; }
    if (t.classList.contains('item')) { select(Number(t.dataset.uid), true); return; }
    const a = t.dataset.act;
    if (a === 'forward') forward(selected());
    else if (ACTS[a]) toast(ACTS[a][ri(0, ACTS[a].length - 1)]);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { $('capModal').classList.remove('show'); document.body.classList.remove('drawer'); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('item')) { e.preventDefault(); select(Number(e.target.dataset.uid), true); }
  });
  $('menuBtn').onclick = () => document.body.classList.toggle('drawer');
  $('scrim').onclick = () => document.body.classList.remove('drawer');
  $('tabOther').onclick = () => toast('Les autres mails ne sont pas arrivés non plus.');
  $('capClose').onclick = () => $('capModal').classList.remove('show');
  $('capModal').onclick = e => { if (e.target.id === 'capModal') $('capModal').classList.remove('show'); };
  $('endClose').onclick = () => { $('endModal').classList.remove('show'); if (!S.started) start(); };
  $('endReplay').onclick = () => { $('endModal').classList.remove('show'); start(); };
  $('infoReplay').onclick = () => start();
}
function start(deepLink) {
  S.started = true;
  S.folder = 'panne';
  document.body.classList.remove('reading', 'drawer');
  const open = buildSession(deepLink);
  updateCounts(); renderList(); updateOutage();
  if (deepLink || !matchMedia('(max-width: 860px)').matches) select(open.uid, !!deepLink && matchMedia('(max-width: 860px)').matches);
  scheduleNext(true);
}

// ---------------------------------------------------------------- Démarrage
(async () => {
  bind();
  await loadAll();
  buildFolders();
  updateOutage();
  setInterval(updateOutage, 20000);
  setInterval(pollStatus, 3 * 60000);
  const deep = Q.get('m');
  if (outageEnd() && !deep) {
    // Panne finie : on montre la boîte figée et on propose de rejouer.
    start(); clearTimeout(S.timer); S.started = false;
    showEnd();
  } else start(deep);
  if (Q.has('debug')) {
    W.__dl = S;
    W.__dlcheck = () => { S.unknown = []; const bad = []; for (const d of S.byId.values()) { for (let k = 0; k < 6; k++) { const m = instantiate(d, 1000 + k * 7919, Date.now()); const txt = [m.from, m.subject, m.body, m.tag, m.att.join(' '), m.invite ? Object.values(m.invite).join(' ') : ''].join(' '); if (/[{}]/.test(txt)) bad.push(d.id); } } return { unknown: [...new Set(S.unknown)], braces: [...new Set(bad)], total: S.byId.size }; };
  }
})();
})();
