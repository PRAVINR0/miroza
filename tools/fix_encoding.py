"""Utility to clean mojibake sequences from HTML files using ftfy."""
from __future__ import annotations

from pathlib import Path

from ftfy import fix_text


def fix_html_files(root: Path) -> int:
    count = 0
    for path in root.rglob("*.html"):
        text = path.read_text(encoding="utf-8")
        fixed = fix_text(text)
        if fixed != text:
            path.write_text(fixed, encoding="utf-8")
            count += 1
            print(f"fixed: {path}")
    return count


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    total = fix_html_files(project_root)
    print(f"Total fixed files: {total}")


if __name__ == "__main__":
    main()
