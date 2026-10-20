#!/usr/bin/env bash
# Rebuild the pages, then upload only the files whose content differs from the VPS (checksum comparison,
# so unchanged videos are never re-sent). Nothing is deleted on the server; files removed locally are only listed.
#
#   bash deploy/publish.sh            upload what changed
#   DRY=1 bash deploy/publish.sh      show what would be uploaded, change nothing
#
# Server access (HOST, KEY, optional DEST) comes from deploy/publish.env, which is not committed;
# copy deploy/publish.env.example to start. The same names can also be set in the environment.
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f deploy/publish.env ] && . deploy/publish.env
: "${HOST:?Set HOST (user@server) in deploy/publish.env, see deploy/publish.env.example}"
: "${KEY:?Set KEY (path to the SSH private key) in deploy/publish.env}"
DEST="${DEST:-/var/www/fri-dev.cloud}"
PATHS="index.html 404.html mahasiswa dosen bantuan assets videos"
ssh_run() { ssh -i "$KEY" -o BatchMode=yes "$HOST" "$@"; }
norm() { awk '{p=$2; sub(/^\*/, "", p); print $1, p}' | LC_ALL=C sort; }
paths_of() { awk 'NF {print $2}' | LC_ALL=C sort; }

node tools/build.cjs > /dev/null

local_sums=$(find $PATHS -type f | LC_ALL=C sort | xargs sha256sum | norm)
remote_sums=$(ssh_run "cd '$DEST' 2>/dev/null && find $PATHS -type f 2>/dev/null | LC_ALL=C sort | xargs -r sha256sum" | norm || true)

changed=$(comm -23 <(printf '%s\n' "$local_sums") <(printf '%s\n' "$remote_sums") | awk '{print $2}')
orphans=$(comm -13 <(printf '%s\n' "$local_sums" | paths_of) <(printf '%s\n' "$remote_sums" | paths_of) || true)

[ -n "$orphans" ] && { echo "Only on the server (not deleted):"; echo "$orphans" | sed 's/^/  /'; }
if [ -z "$changed" ]; then echo "Nothing to upload: the server is up to date."; exit 0; fi

echo "To upload ($(echo "$changed" | wc -l) files):"; echo "$changed" | sed 's/^/  /'
[ "${DRY:-0}" = "1" ] && { echo "(dry run, nothing sent)"; exit 0; }

echo "$changed" | tar -c -T - | ssh_run "mkdir -p '$DEST' && tar -x --no-same-owner --no-same-permissions -C '$DEST'"
echo "Done. https://fri-dev.cloud/"
