#!/usr/bin/env python3
"""Snapshot des offres d'emploi ACTIVES de lesjoiesducode.fr -> jobs.json (lecture seule).

Source : le sitemap public job_offer-sitemap.xml (les offres expirées en sont exclues
par le site), puis la page de chaque offre (JSON-LD JobPosting : titre, entreprise, ville,
validThrough). Double garde-fou : page en noindex ou validThrough passé = offre écartée.
Sur toute erreur de lecture du sitemap, on ne touche à rien (le front ignore de toute
façon un snapshot de plus de 48 h et retombe sur le mail qui partage le site entier).
"""
import json, re, sys, urllib.request
from datetime import datetime, timezone
from pathlib import Path

SITEMAP = "https://lesjoiesducode.fr/job_offer-sitemap.xml"
OUT = Path(__file__).resolve().parent.parent / "jobs.json"
MAX = 45
UA = "Mozilla/5.0 (compatible; downlook-snapshot/1.0)"


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        if r.status != 200:
            raise RuntimeError(f"HTTP {r.status}")
        return r.read().decode("utf-8", "replace")


def clean_title(t):
    t = re.sub(r"[\s\-]*[\(\[]?\s*[HFN](\s*/\s*[HFNX]){1,2}\s*[\)\]]?\s*$", "", t, flags=re.I)
    return re.sub(r"\s+", " ", t).strip(" -")


def parse_offer(url, now):
    html = get(url)
    m = re.search(r'<meta name="robots" content="([^"]*)"', html)
    if m and "noindex" in m.group(1):
        return None
    for s in re.finditer(r'<script[^>]*application/ld\+json[^>]*>(.*?)</script>', html, re.S):
        if "JobPosting" not in s.group(1):
            continue
        data = json.loads(s.group(1))
        items = data.get("@graph", [data]) if isinstance(data, dict) else data
        for it in items:
            if not isinstance(it, dict) or it.get("@type") != "JobPosting":
                continue
            vt = it.get("validThrough")
            if vt:
                d = datetime.fromisoformat(vt.replace("Z", "+00:00"))
                if d.tzinfo is None:
                    d = d.replace(tzinfo=timezone.utc)
                if d < now:
                    return None
            org = (it.get("hiringOrganization") or {}).get("name") or ""
            loc = it.get("jobLocation") or {}
            if isinstance(loc, list):
                loc = loc[0] if loc else {}
            city = ((loc.get("address") or {}).get("addressLocality") or "").strip()
            if it.get("jobLocationType") == "TELECOMMUTE" and not city:
                city = "Télétravail"
            title = clean_title(it.get("title") or "")
            if not title or not org:
                return None
            return {"title": title, "company": org.strip(), "city": city, "url": url, "validThrough": vt}
    return None


def main():
    now = datetime.now(timezone.utc)
    try:
        xml = get(SITEMAP)
    except Exception as e:  # réseau, Cloudflare... : on garde le snapshot précédent
        print(f"sitemap illisible, aucun changement : {e}")
        return 0
    entries = re.findall(r"<url>\s*<loc>([^<]+)</loc>(?:\s*<lastmod>([^<]+)</lastmod>)?", xml)
    entries = [(u, lm or "") for u, lm in entries if "/emploi/" in u]
    if not entries:
        print("sitemap sans offre (format inattendu ?), aucun changement")
        return 0
    entries.sort(key=lambda x: x[1], reverse=True)
    jobs = []
    for url, _ in entries[:MAX]:
        try:
            j = parse_offer(url, now)
        except Exception as e:
            print(f"offre ignorée {url} : {e}")
            continue
        if j:
            jobs.append(j)
    out = {"updated": now.strftime("%Y-%m-%dT%H:%M:%SZ"), "source": SITEMAP, "jobs": jobs}
    old = None
    if OUT.exists():
        try:
            old = json.loads(OUT.read_text())
        except Exception:
            pass
    if old and old.get("jobs") == jobs and old.get("updated", "")[:10] == out["updated"][:10]:
        print(f"{len(jobs)} offres, inchangé")
        return 0
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    print(f"{len(jobs)} offres actives écrites")
    return 0


if __name__ == "__main__":
    sys.exit(main())
