#!/usr/bin/env python3
"""Snapshot des memes récents de lesjoiesducode.fr (catégorie Memes) -> memes.json.

Lecture seule de l'API REST WordPress publique. Sur erreur, aucun changement : le front
utilise memes.json s'il est lisible, sinon memes-secours.json (liste figée du dépôt).
Chaque meme porte boss=true quand il parle du chef, du manager ou du N+1 (titre, slug,
texte alternatif de l'image), pour le scénario du chef qui fait suivre un meme.
"""
import html, json, re, sys, urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = ("https://lesjoiesducode.fr/wp-json/wp/v2/posts?categories=2231&per_page=100"
       "&_fields=id,date,link,slug,title,content")
OUT = Path(__file__).resolve().parent.parent / "memes.json"
UA = "Mozilla/5.0 (compatible; downlook-snapshot/1.0)"
BOSS = re.compile(r"\b(chef|cheffe|manager|managers|n\+1|n-1|boss|patron|direction|directeur|manageur|hierarchie|hiérarchie|lead|cto|ceo|pdg|po|product-owner|chef-de-projet)\b", re.I)


def main():
    data = []
    for page in (1, 2, 3, 4):
        try:
            req = urllib.request.Request(f"{API}&page={page}", headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=25) as r:
                chunk = json.loads(r.read().decode("utf-8"))
            if not isinstance(chunk, list):
                raise ValueError("format inattendu")
            data += chunk
        except Exception as e:
            if page == 1:
                print(f"API illisible, aucun changement : {e}")
                return 0
            break
    memes = []
    for p in data:
        try:
            c = p["content"]["rendered"]
            m = re.search(r'<img[^>]+src="([^"]+)"', c)
            if not m:
                continue
            alt = re.search(r'<img[^>]+alt="([^"]*)"', c)
            alt = html.unescape(alt.group(1)) if alt else ""
            title = html.unescape(re.sub(r"<[^>]+>", "", p["title"]["rendered"])).strip()
            slug = p.get("slug", "").replace("-", " ")
            boss = bool(BOSS.search(title) or BOSS.search(slug) or BOSS.search(alt))
            memes.append({"title": title, "image": m.group(1), "url": p["link"], "alt": alt[:200], "boss": boss})
        except Exception:
            continue
    # Les 100 plus récents, plus tous les memes "chef" trouvés plus loin.
    memes = memes[:100] + [m for m in memes[100:] if m["boss"]]
    if len(memes) < 5:
        print(f"seulement {len(memes)} memes lus, aucun changement")
        return 0
    out = {"updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "memes": memes}
    if OUT.exists():
        try:
            if json.loads(OUT.read_text()).get("memes") == memes:
                print(f"{len(memes)} memes, inchangé")
                return 0
        except Exception:
            pass
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    print(f"{len(memes)} memes écrits, dont {sum(m['boss'] for m in memes)} sur les chefs")
    return 0


if __name__ == "__main__":
    sys.exit(main())
