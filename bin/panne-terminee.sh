#!/bin/bash
# Bascule manuelle de fin de panne : met à jour status.json, commit, push.
# Usage :
#   bin/panne-terminee.sh                 fin = maintenant
#   bin/panne-terminee.sh 18:40           fin = aujourd'hui 18 h 40 (heure de Paris)
#   bin/panne-terminee.sh "2026-11-14 09:05"
#   bin/panne-terminee.sh --annuler       remet la panne "en cours" (erreur de bascule)
#   ajouter --sans-push pour seulement écrire status.json (test local)
set -euo pipefail
cd "$(dirname "$0")/.."
PUSH=1; ARG=""
for a in "$@"; do
  case "$a" in
    --sans-push) PUSH=0 ;;
    *) ARG="$a" ;;
  esac
done
[ "$PUSH" = 1 ] && git pull --rebase --quiet
python3 - "$ARG" <<'PY'
import json, sys
from datetime import datetime
from zoneinfo import ZoneInfo
from pathlib import Path
arg = sys.argv[1].strip()
p = Path("status.json"); st = json.loads(p.read_text())
paris = ZoneInfo("Europe/Paris")
if arg == "--annuler":
    st.update({"state": "ongoing", "end": None, "source": None, "candidate_since": None})
else:
    now = datetime.now(paris)
    if not arg:
        d = now
    elif len(arg) <= 5:
        h, m = arg.replace("h", ":").split(":")
        d = now.replace(hour=int(h), minute=int(m or 0), second=0, microsecond=0)
    else:
        d = datetime.strptime(arg, "%Y-%m-%d %H:%M").replace(tzinfo=paris)
    end = d.astimezone(ZoneInfo("UTC"))
    start = datetime.fromisoformat(st["start"].replace("Z", "+00:00"))
    if end <= start:
        sys.exit("heure de fin antérieure au début de la panne")
    st.update({"state": "ended", "end": end.strftime("%Y-%m-%dT%H:%M:%SZ"), "source": "manuel", "candidate_since": None})
    mins = int((end - start).total_seconds() // 60)
    print(f"fin posée : {d.strftime('%d/%m %H:%M')} Paris, durée {mins // 60} h {mins % 60:02d} min")
p.write_text(json.dumps(st, indent=1) + "\n")
PY
if [ "$PUSH" = 1 ]; then
  git add status.json
  git commit -q -m "Update outage status"
  git push -q
  echo "publié (GitHub Pages met 1 à 2 min à se mettre à jour)"
fi
