import re
from typing import Optional

import httpx
from bs4 import BeautifulSoup

_REMOVE_TAGS = {"script", "style", "nav", "footer", "header", "aside", "noscript", "iframe", "form", "button"}
_USEFUL_TAGS = {"p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "td", "th", "blockquote", "pre", "article", "section", "main"}


class WebScraperService:
    async def fetch_and_extract(self, url: str) -> tuple[str, str]:
        """Fetch URL and extract (title, clean_text). Raises httpx.HTTPError on failure."""
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=30.0,
            headers={"User-Agent": "Mozilla/5.0 (compatible; RAG-Bot/1.0)"},
        ) as client:
            response = await client.get(url)
            response.raise_for_status()

        soup = BeautifulSoup(response.text, "lxml")

        title = self._extract_title(soup)
        text = self._extract_text(soup)
        return title, text

    def _extract_title(self, soup: BeautifulSoup) -> str:
        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            return og_title["content"].strip()
        if soup.title and soup.title.string:
            return soup.title.string.strip()
        h1 = soup.find("h1")
        if h1:
            return h1.get_text(strip=True)
        return "Без названия"

    def _extract_text(self, soup: BeautifulSoup) -> str:
        for tag in soup.find_all(_REMOVE_TAGS):
            tag.decompose()

        # Prefer main content containers
        main = soup.find("main") or soup.find("article") or soup.find(id=re.compile(r"content|main|article", re.I))
        root = main if main else soup.body or soup

        parts: list[str] = []
        for tag in root.find_all(_USEFUL_TAGS):
            text = tag.get_text(separator=" ", strip=True)
            if len(text) > 30:
                parts.append(text)

        if not parts:
            raw = root.get_text(separator="\n", strip=True)
            parts = [line for line in raw.splitlines() if len(line.strip()) > 30]

        text = "\n\n".join(parts)
        # Collapse excessive whitespace
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()
