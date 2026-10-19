#!/usr/bin/env python3
"""改版紀錄檢查：方法本體有改動時，VERSION 要升版、CHANGELOG 要有該版條目。

用法：python3 .github/scripts/check_version.py <base sha> <head sha>

方法本體＝SKILL.md、core/、platforms/、references/、scripts/、templates/。
只改 README、docs/、CHANGELOG、.github/ 這類說明或工具，不用升版。
"""
import re
import subprocess
import sys

METHOD_PREFIXES = ('core/', 'platforms/', 'references/', 'scripts/', 'templates/')
METHOD_FILES = ('SKILL.md',)


def git(*args):
    return subprocess.run(['git', *args], check=True, capture_output=True, text=True).stdout


def version_at(ref):
    try:
        return git('show', f'{ref}:VERSION').strip()
    except subprocess.CalledProcessError:
        return ''


def as_tuple(v):
    return tuple(int(x) for x in v.split('.')) if re.fullmatch(r'\d+\.\d+\.\d+', v) else None


def main():
    base, head = sys.argv[1], sys.argv[2]
    if set(base) == {'0'}:
        print('・新分支，沒有比較基準，略過')
        return 0
    changed = [f for f in git('diff', '--name-only', base, head).splitlines() if f]
    method = [f for f in changed if f.startswith(METHOD_PREFIXES) or f in METHOD_FILES]
    if not method:
        print(f'✓ 這次只改說明或工具（{len(changed)} 個檔），不用升版')
        return 0

    old, new = version_at(base), version_at(head)
    errors = []
    if not as_tuple(new):
        errors.append(f'VERSION 格式不對：{new!r}（要是 X.Y.Z）')
    elif old == new:
        errors.append(f'方法本體有改動，但 VERSION 還是 {new}，沒有升版')
    elif as_tuple(old) and as_tuple(new) <= as_tuple(old):
        errors.append(f'VERSION 從 {old} 改成 {new}，沒有往上升')
    changelog = git('show', f'{head}:CHANGELOG.md')
    if as_tuple(new) and not re.search(rf'^## {re.escape(new)} - ', changelog, re.M):
        errors.append(f'CHANGELOG.md 沒有「## {new} - <日期>」條目')

    print('方法本體改動：')
    for f in method:
        print('  ·', f)
    if errors:
        for e in errors:
            print('✕', e)
        print('\n修法：VERSION 升版，CHANGELOG 加該版條目（摘要／專案要不要跟著改／改動／已知未定），回流的話 docs/backflow/LOG.md 記一列。')
        return 1
    print(f'✓ VERSION {old} → {new}，CHANGELOG 有條目')
    return 0


if __name__ == '__main__':
    sys.exit(main())
