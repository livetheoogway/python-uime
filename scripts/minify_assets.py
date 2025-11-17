#!/usr/bin/env python3
"""
Utility to minify the bundled CSS and JavaScript prior to packaging/releases.
Implemented with lightweight pure-Python minifiers so we don't pull in extra tooling.
"""

from __future__ import annotations

import pathlib
import re
import sys
from typing import Callable

BASE_DIR = pathlib.Path(__file__).resolve().parents[1]
ASSETS = [
    (
        BASE_DIR / "uime" / "static" / "css" / "uime.css",
        BASE_DIR / "uime" / "static" / "css" / "uime.min.css",
        "css",
    ),
    (
        BASE_DIR / "uime" / "static" / "js" / "uime.js",
        BASE_DIR / "uime" / "static" / "js" / "uime.min.js",
        "js",
    ),
]


def css_minify(css: str) -> str:
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"\s+", " ", css)
    css = re.sub(r"\s*([{};:,>~+=\(\)])\s*", r"\1", css)
    css = css.replace(";}", "}")
    return css.strip()


def js_minify(js: str) -> str:
    # Adapted from python-jsmin (MIT License) to avoid external deps.
    from io import StringIO

    out = StringIO()
    last = "\n"
    i = 0
    length = len(js)

    def is_alphanum(char: str) -> bool:
        return char.isalnum() or char in ("_", "$", "\\") or ord(char) > 126

    while i < length:
        char = js[i]
        i += 1

        if char == "\n" and last in ("{", "}", ";", ",", "\n"):
            continue

        if char == " ":
            if last in (" ", "\n"):
                continue
            next_char = js[i] if i < length else ""
            if not is_alphanum(last) or not is_alphanum(next_char):
                continue

        if char == "/":
            next_char = js[i] if i < length else ""
            if next_char == "/":
                while i < length and js[i] not in ("\n", "\r"):
                    i += 1
                continue
            if next_char == "*":
                i += 1
                while i < length - 1 and js[i : i + 2] != "*/":
                    i += 1
                i += 2
                continue

        if char in ("'", '"'):
            quote = char
            out.write(char)
            while i < length:
                c = js[i]
                out.write(c)
                i += 1
                if c == "\\":
                    if i < length:
                        out.write(js[i])
                        i += 1
                    continue
                if c == quote:
                    break
            last = quote
            continue

        out.write(char)
        last = char

    return out.getvalue()


def run() -> int:
    minifiers: dict[str, Callable[[str], str]] = {"css": css_minify, "js": js_minify}

    for src, dest, kind in ASSETS:
        data = src.read_text(encoding="utf-8")
        minified = minifiers[kind](data)
        dest.write_text(minified, encoding="utf-8")
        print(f"Minified {src.relative_to(BASE_DIR)} -> {dest.relative_to(BASE_DIR)}")

    return 0


if __name__ == "__main__":
    sys.exit(run())
