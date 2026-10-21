#!/usr/bin/env python3
"""自動打 tag 與 GitHub Release：VERSION 每改一次，就在「改成這個版本的那個 commit」打 vX.Y.Z。

用法：python3 .github/scripts/release_tags.py [--dry-run]

- 從 git 歷史找出 VERSION 每一次的值與對應 commit；還沒有 tag 的補上（含過去漏打的）。
- 每個 tag 都建一個 GitHub Release，內文取 CHANGELOG.md 該版條目；目前的 VERSION 標成 Latest。
- 需要 git 完整歷史（fetch-depth: 0）；建 Release 需要 gh 與 GH_TOKEN。
"""
import re
import subprocess
import sys
import tempfile

DRY = '--dry-run' in sys.argv


def run(*args, check=True):
    return subprocess.run(args, check=check, capture_output=True, text=True)


def git(*args):
    return run('git', *args).stdout


def version_commits():
    seen = {}
    for c in git('log', '--reverse', '--format=%H', '--', 'VERSION').split():
        v = run('git', 'show', f'{c}:VERSION', check=False).stdout.strip()
        if re.fullmatch(r'\d+\.\d+\.\d+', v) and v not in seen:
            seen[v] = c
    return seen


def notes(v, changelog):
    m = re.search(rf'^## {re.escape(v)} - .*?(?=^## |\Z)', changelog, re.M | re.S)
    body = m.group(0).split('\n', 1)[1].strip() if m else ''
    return (body or '見 CHANGELOG.md。') + '\n\n完整紀錄：CHANGELOG.md；回流紀錄：docs/backflow/LOG.md'


def main():
    current = open('VERSION', encoding='utf-8').read().strip()
    changelog = open('CHANGELOG.md', encoding='utf-8').read()
    tags = set(git('tag', '-l').split())
    for v, c in version_commits().items():
        tag = f'v{v}'
        if tag not in tags:
            print(f'＋ tag {tag} → {c[:7]}')
            if not DRY:
                run('git', 'tag', '-a', tag, c, '-m', f'design-loop {v}')
                run('git', 'push', 'origin', tag)
        has_release = not DRY and run('gh', 'release', 'view', tag, check=False).returncode == 0
        if has_release:
            continue
        latest = '--latest' if v == current else '--latest=false'
        print(f'＋ release {tag}（{"Latest" if v == current else "舊版"}）')
        if DRY:
            continue
        with tempfile.NamedTemporaryFile('w', suffix='.md', delete=False, encoding='utf-8') as f:
            f.write(notes(v, changelog))
        run('gh', 'release', 'create', tag, '--title', f'design-loop {v}', '--notes-file', f.name, latest)
    print(f'✓ 目前版本 {current}')


if __name__ == '__main__':
    main()
