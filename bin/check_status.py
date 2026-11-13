#!/usr/bin/env python3
"""Détection prudente de la fin de panne -> status.json.

Sources publiques (sans clé) de la page https://status.cloud.microsoft :
  - /api/posts/mac          : incident Microsoft 365 entreprise (champ Status)
  - /api/posts/m365Consumer : services grand public (entrée M365Consumer, champ Status)
Règles :
  - n'agit que si status.json est "ongoing" (une fin posée à la main n'est jamais défaite) ;
  - "rétabli" seulement si LES DEUX sources disent un statut sain connu ;
  - erreur réseau, JSON inattendu, statut inconnu = aucun changement ;
  - la fin n'est déclarée qu'après 25 min de constats sains consécutifs
    (candidate_since), et l'heure de fin retenue est le premier constat sain.
"""
import json, sys, urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

BASE = "https://status.cloud.microsoft/api/posts/"
OUT = Path(__file__).resolve().parent.parent / "status.json"
HEALTHY = {"available", "operational", "service restored", "resolved", "normal service"}
CONFIRM = timedelta(minutes=25)
UA = "Mozilla/5.0 (compatible; downlook-status/1.0)"


def get_json(name):
    req = urllib.request.Request(BASE + name, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=20) as r:
        if r.status != 200:
            raise RuntimeError(f"HTTP {r.status}")
        return json.loads(r.read().decode("utf-8"))


def iso(d):
    return d.strftime("%Y-%m-%dT%H:%M:%SZ")


def main():
    st = json.loads(OUT.read_text())
    if st.get("state") != "ongoing":
        print(f"état {st.get('state')} : rien à faire")
        return 0
    try:
        mac = get_json("mac")
        cons = get_json("m365Consumer")
        if not isinstance(mac, dict) or "Status" not in mac:
            raise ValueError("mac : format inattendu")
        if not isinstance(cons, list):
            raise ValueError("m365Consumer : format inattendu")
        m365 = [x for x in cons if isinstance(x, dict) and x.get("ServiceWorkloadName") == "M365Consumer"]
        if len(m365) != 1 or "Status" not in m365[0]:
            raise ValueError("m365Consumer : entrée M365Consumer introuvable")
        s_mac = str(mac["Status"]).strip()
        s_cons = str(m365[0]["Status"]).strip()
    except Exception as e:
        print(f"source illisible, aucun changement : {e}")
        return 0
    healthy = s_mac.lower() in HEALTHY and s_cons.lower() in HEALTHY
    now = datetime.now(timezone.utc)
    print(f"mac={s_mac!r} m365Consumer={s_cons!r} -> {'sain' if healthy else 'panne'}")
    if not healthy:
        if st.get("candidate_since"):
            st["candidate_since"] = None
            OUT.write_text(json.dumps(st, indent=1) + "\n")
            print("constat sain précédent annulé")
        return 0
    cand = st.get("candidate_since")
    if not cand:
        st["candidate_since"] = iso(now)
        OUT.write_text(json.dumps(st, indent=1) + "\n")
        print("premier constat sain, confirmation au prochain passage (25 min)")
        return 0
    first = datetime.fromisoformat(cand.replace("Z", "+00:00"))
    if now - first < CONFIRM:
        print("constat sain en cours de confirmation")
        return 0
    st.update({"state": "ended", "end": cand, "source": "auto (status.cloud.microsoft)", "candidate_since": None})
    OUT.write_text(json.dumps(st, indent=1) + "\n")
    print(f"PANNE TERMINÉE, fin retenue {cand}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
