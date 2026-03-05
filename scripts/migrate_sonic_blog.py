#!/usr/bin/env python3
import json
import os
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urlparse, unquote
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup
from markdownify import markdownify as to_markdown

ROOT = Path(__file__).resolve().parents[1]
CONTENT_DIR = ROOT / "content" / "blog"
IMAGE_DIR = ROOT / "public" / "blog" / "images"
BLOG_INDEX_URL = "https://www.soniclinker.com/blog"

DEFAULT_AUTHOR = "Neeraj Jain"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"


def fetch_text(url: str) -> str:
    last_err = None
    for _ in range(3):
        try:
            req = Request(url, headers={"User-Agent": UA})
            with urlopen(req, timeout=45) as resp:
                return resp.read().decode("utf-8", "ignore")
        except Exception as exc:  # noqa: BLE001
            last_err = exc
            continue
    raise RuntimeError(f"Failed to fetch {url}: {last_err}")


def fetch_bytes(url: str) -> bytes:
    req = Request(url, headers={"User-Agent": UA})
    with urlopen(req, timeout=60) as resp:
        return resp.read()


def parse_search_index_url(index_html: str) -> str:
    match = re.search(r'<meta name="framer-search-index" content="([^"]+)"', index_html)
    if not match:
        raise RuntimeError("Could not locate Framer search index URL on /blog")
    return match.group(1)


def to_iso_date(value: str) -> str:
    value = value.strip()
    formats = ["%b %d, %Y", "%B %d, %Y", "%Y-%m-%d", "%Y-%m-%dT%H:%M:%S.%fZ"]
    for fmt in formats:
        try:
            return datetime.strptime(value, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return datetime.utcnow().strftime("%Y-%m-%d")


def pick_author(entry: Dict) -> str:
    candidates = entry.get("h4", []) + entry.get("p", [])
    for item in candidates:
        text = (item or "").strip()
        if not text:
            continue
        if re.search(r"\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b", text):
            continue
        if text.upper() == text and len(text.split()) > 1:
            continue
        if text.lower() in {
            "products",
            "resources",
            "pricing",
            "contact",
            "start for free",
            "about",
            "blog",
            "features",
            "contact us",
            "coming soon",
            "legal",
            "sign up",
        }:
            continue
        if len(text.split()) <= 4 and re.match(r"^[A-Za-z .'-]+$", text):
            return text
    return DEFAULT_AUTHOR


def pick_date(entry: Dict) -> str:
    date_re = re.compile(r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}")
    for bucket in ("h4", "h5", "p"):
        for value in entry.get(bucket, []):
            if not value:
                continue
            match = date_re.search(value)
            if match:
                return to_iso_date(match.group(0))
    return datetime.utcnow().strftime("%Y-%m-%d")


def extract_byline_from_soup(soup: BeautifulSoup, title: str) -> Dict[str, str]:
    date_re = re.compile(r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s+\d{4}")
    elements = []
    for tag in soup.find_all(["h1", "h4", "h5", "p"]):
        text = tag.get_text(" ", strip=True)
        if text:
            elements.append((tag.name, text))

    start = None
    for i, (name, text) in enumerate(elements):
        if name == "h1" and text == title:
            start = i
            break
    if start is None:
        return {"author": "", "date": ""}

    byline = {"author": "", "date": ""}
    window = elements[start + 1 : start + 12]
    for name, text in window:
        if not byline["date"]:
            m = date_re.search(text)
            if m:
                byline["date"] = to_iso_date(m.group(0))
                continue
        if not byline["author"]:
            if date_re.search(text):
                continue
            if text.lower() in {"read more from our blog", "related articles"}:
                continue
            if len(text.split()) <= 4 and re.match(r"^[A-Za-z .'-]+$", text):
                byline["author"] = text
    return byline


def normalize_filename(url: str, slug: str, idx: int) -> str:
    parsed = urlparse(url)
    base = os.path.basename(unquote(parsed.path)) or f"{slug}-{idx}.jpg"
    base = re.sub(r"[^A-Za-z0-9._-]+", "-", base)
    stem, ext = os.path.splitext(base)
    if not ext or len(ext) > 5:
        ext = ".jpg"
    safe_slug = re.sub(r"[^A-Za-z0-9._-]+", "-", slug).strip("-") or "post"
    return f"{safe_slug}-{idx}{ext.lower()}"


def clean_markdown(md: str) -> str:
    md = re.sub(r"\n{3,}", "\n\n", md).strip()
    md = md.replace("\\\n", "\n")
    return md + "\n"


def find_article_container(soup: BeautifulSoup) -> Optional[BeautifulSoup]:
    # Preferred selectors seen across Framer templates
    for selector in (".framer-3zhdwo", ".framer-rich-text", "[data-framer-component-type='RichTextContainer']"):
        found = soup.select_one(selector)
        if found and len(found.find_all("p")) >= 8:
            return found

    best = None
    best_score = -1
    for div in soup.find_all("div"):
        p_count = len(div.find_all("p"))
        h_count = len(div.find_all(["h2", "h3", "h4"]))
        if p_count < 8 or h_count < 2:
            continue
        text = div.get_text(" ", strip=True).lower()
        if "read more from our blog" in text:
            text = text.split("read more from our blog")[0]
        score = p_count * 2 + h_count * 4 + min(len(text), 2000) // 200
        if score > best_score:
            best = div
            best_score = score
    return best


def main() -> int:
    print("Fetching blog index...")
    index_html = fetch_text(BLOG_INDEX_URL)
    search_index_url = parse_search_index_url(index_html)
    print("Search index:", search_index_url)

    search_index = json.loads(fetch_text(search_index_url))
    all_paths = sorted(
        path
        for path in search_index.keys()
        if isinstance(path, str) and path.startswith("/blog/") and path.count("/") == 2
    )
    slugs = [
        path.split("/blog/", 1)[1].rstrip("/")
        for path in all_paths
        if path not in {"/blog/images"} and path.split("/blog/", 1)[1].strip()
    ]
    print(f"Discovered {len(slugs)} blog slugs")

    CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    shutil.rmtree(CONTENT_DIR, ignore_errors=True)
    shutil.rmtree(IMAGE_DIR, ignore_errors=True)
    CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)

    for slug in slugs:
        entry = search_index.get(f"/blog/{slug}", {}) if isinstance(search_index, dict) else {}
        url = f"https://www.soniclinker.com/blog/{slug}"
        print("Migrating", slug)

        html = fetch_text(url)
        soup = BeautifulSoup(html, "html.parser")

        # Title
        h1s = [h.get_text(" ", strip=True) for h in soup.find_all("h1")]
        title = next((h for h in h1s if h and "Read more from our blog" not in h), None)
        if not title:
            raw_title = (entry.get("title") or "").strip()
            title = raw_title.replace(" - Soniclinker - Create Agent Optimized Websites", "").strip() or slug.replace("-", " ").title()

        # Article container
        article = find_article_container(soup)
        if not article:
            # Fallback to search index content for odd templates
            h2s = entry.get("h2", []) if isinstance(entry, dict) else []
            h3s = entry.get("h3", []) if isinstance(entry, dict) else []
            ps = entry.get("p", []) if isinstance(entry, dict) else []
            filtered_p = []
            for p in ps:
                text = (p or "").strip()
                if not text:
                    continue
                lower = text.lower()
                if lower in {
                    "products",
                    "resources",
                    "pricing",
                    "contact",
                    "start for free",
                    "about",
                    "blog",
                    "features",
                    "contact us",
                    "coming soon",
                    "legal",
                    "404",
                    "sign up",
                }:
                    continue
                filtered_p.append(text)

            body_lines: List[str] = []
            if filtered_p:
                body_lines.extend(filtered_p[:3])
            for h in h2s:
                body_lines.append(f"## {h}")
                if filtered_p:
                    body_lines.append(filtered_p[min(len(filtered_p) - 1, len(body_lines) % len(filtered_p))])
            for h in h3s[:6]:
                body_lines.append(f"### {h}")
            markdown = "\n\n".join(body_lines).strip() + "\n"
            image_map = {}
        else:
            # Clean nodes
            for tag in article.find_all(["script", "style", "noscript", "button", "svg"]):
                tag.decompose()
            for tag in article.find_all(True):
                for attr in list(tag.attrs.keys()):
                    if attr == "href":
                        href = tag.get("href", "")
                        if href.startswith("https://www.soniclinker.com/blog/"):
                            tag["href"] = href.replace("https://www.soniclinker.com", "")
                        elif href.startswith("https://soniclinker.com/blog/"):
                            tag["href"] = href.replace("https://soniclinker.com", "")
                        continue
                    if attr in {"src", "alt"}:
                        continue
                    if attr.startswith("data-") or attr in {"style", "class", "id", "loading", "decoding", "srcset", "sizes"}:
                        del tag.attrs[attr]

            # Download images + rewrite src
            image_map: Dict[str, str] = {}
            all_images = article.find_all("img")
            for i, img in enumerate(all_images, start=1):
                src = (img.get("src") or "").strip()
                if not src.startswith("http"):
                    continue
                local_name = normalize_filename(src, slug, i)
                local_path = IMAGE_DIR / local_name
                if not local_path.exists():
                    try:
                        local_path.write_bytes(fetch_bytes(src))
                    except Exception:
                        continue
                local_url = f"/blog/images/{local_name}"
                image_map[src] = local_url
                img["src"] = local_url

            markdown = to_markdown(str(article), heading_style="ATX")
        for remote, local in image_map.items():
            markdown = markdown.replace(remote, local)
            markdown = markdown.replace(remote.replace("&", "&amp;"), local)
        markdown = re.sub(r"\(https?://(?:www\.)?soniclinker\.com/blog/([a-z0-9\-._]+)\)", r"(/blog/\1)", markdown)
        markdown = re.sub(r"\]\((?:\.\./)+\)", "](/)", markdown)
        markdown = re.sub(r"\]\((?:\.\./)+([^)\s]+)\)", r"](/\1)", markdown)
        markdown = clean_markdown(markdown)

        # Metadata
        byline = extract_byline_from_soup(soup, title)
        author = byline["author"] or pick_author(entry if isinstance(entry, dict) else {})
        date = byline["date"] or pick_date(entry if isinstance(entry, dict) else {})
        description = (entry.get("description") if isinstance(entry, dict) else "") or ""
        if not description or "Track and Convert AI agents visiting your website" in description:
            paragraphs = [p.get_text(" ", strip=True) for p in (article.find_all("p") if article else [])]
            description = next((p for p in paragraphs if len(p) >= 80), title)
        description = re.sub(r"\s+", " ", description).strip()
        if len(description) > 180:
            description = description[:177].rstrip() + "..."

        featured_image = next(iter(image_map.values()), "")
        if not featured_image:
            og = soup.find("meta", attrs={"property": "og:image"})
            if og and og.get("content"):
                src = og["content"]
                local_name = normalize_filename(src, slug, 0)
                local_path = IMAGE_DIR / local_name
                try:
                    local_path.write_bytes(fetch_bytes(src))
                    featured_image = f"/blog/images/{local_name}"
                except Exception:
                    featured_image = ""

        frontmatter = [
            "---",
            f'title: "{title.replace(chr(34), chr(39))}"',
            f'description: "{description.replace(chr(34), chr(39))}"',
            f'date: "{date}"',
            f'author: "{author.replace(chr(34), chr(39))}"',
            f'slug: "{slug}"',
            f'image: "{featured_image}"',
            "---",
            "",
        ]
        mdx = "\n".join(frontmatter) + markdown
        (CONTENT_DIR / f"{slug}.mdx").write_text(mdx, encoding="utf-8")

    print(f"Migration complete. Wrote {len(slugs)} posts to {CONTENT_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
