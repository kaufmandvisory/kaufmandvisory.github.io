#!/usr/bin/env python3
"""Build Kaufman's daily public-source snapshot without external packages."""

from __future__ import annotations

import json
import re
import statistics
import xml.etree.ElementTree as ET
from datetime import date, datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "daily-data.js"
USER_AGENT = "Kaufman blockchain information platform contact@kaufmanadvisory.io"
KEYWORDS = re.compile(
    r"\b(?:cripto\w*|blockchain|bitcoin|ethereum|stablecoin\w*|web3|dlt)\b"
    r"|tokeniz\w*|activos? virtuales?|monedas? virtuales?"
    r"|registros? distribuidos?|distributed ledger",
    re.IGNORECASE,
)


def fetch_json(url: str) -> dict:
    request = Request(
        url,
        headers={"Accept": "application/json", "User-Agent": USER_AGENT},
    )
    with urlopen(request, timeout=25) as response:
        return json.load(response)


def fetch_text(url: str) -> str:
    request = Request(
        url,
        headers={"Accept": "application/rss+xml, application/xml, text/xml", "User-Agent": USER_AGENT},
    )
    with urlopen(request, timeout=25) as response:
        return response.read().decode("utf-8", errors="replace")


def translate_headline_es(title: str) -> dict | None:
    """Translate a headline at build time; never expose the translation service to browsers."""
    clean = re.sub(r"\s+", " ", title).strip()
    if not clean:
        return None
    params = urlencode(
        {"client": "gtx", "sl": "auto", "tl": "es", "dt": "t", "q": clean}
    )
    request = Request(
        f"https://translate.googleapis.com/translate_a/single?{params}",
        headers={"Accept": "application/json", "User-Agent": USER_AGENT},
    )
    try:
        with urlopen(request, timeout=15) as response:
            payload = json.load(response)
        translated = "".join(
            segment[0]
            for segment in (payload[0] if isinstance(payload, list) and payload else [])
            if isinstance(segment, list) and segment and isinstance(segment[0], str)
        ).strip()
    except (HTTPError, URLError, TimeoutError, ValueError, TypeError, IndexError):
        return None
    if not translated:
        return None
    translated = re.sub(r"\s+", " ", translated)
    translated = re.sub(r"\bEE\. UU\.\b", "EE. UU.", translated)
    translated = re.sub(r"^Solo Miner\b", "Un minero en solitario", translated, flags=re.IGNORECASE)
    translated = re.sub(r"\bobtiene un bloque de Bitcoin\b", "mina un bloque de Bitcoin", translated, flags=re.IGNORECASE)
    return {
        "title": translated,
        "original_title": clean,
        "translated": translated.casefold() != clean.casefold(),
        "language": "es-ES",
    }


def google_news_items(query: str, *, language="es", country="ES", edition="ES:es"):
    params = urlencode({"q": query, "hl": language, "gl": country, "ceid": edition})
    root = ET.fromstring(fetch_text(f"https://news.google.com/rss/search?{params}"))
    rows = []
    for item in root.findall("./channel/item"):
        source_node = item.find("source")
        source = (source_node.text or "").strip() if source_node is not None else ""
        title = (item.findtext("title") or "").strip()
        suffix = f" - {source}"
        if source and title.endswith(suffix):
            title = title[: -len(suffix)].strip()
        try:
            published = parsedate_to_datetime(item.findtext("pubDate") or "")
            if published.tzinfo is None:
                published = published.replace(tzinfo=timezone.utc)
            published = published.astimezone(timezone.utc)
        except (TypeError, ValueError):
            continue
        rows.append(
            {
                "title": title,
                "url": (item.findtext("link") or "").strip(),
                "publisher": source,
                "publisher_url": source_node.attrib.get("url", "") if source_node is not None else "",
                "published_at": published,
            }
        )
    return rows


def jurisdiction_from_title(title: str) -> str:
    rules = [
        (r"\bTaiwan\b", "Taiwán"),
        (r"\b(?:UK|Britain|British|Bank of England|FCA)\b", "Reino Unido"),
        (r"\b(?:EU|European Union|Europe|MiCA)\b", "Unión Europea"),
        (r"\b(?:US|U\.S\.|United States|SEC|CFTC|Congress|Wall Street|Texas)\b", "Estados Unidos"),
        (r"\bIndia\b", "India"),
        (r"\bRussia\b", "Rusia"),
        (r"\bPakistan\b", "Pakistán"),
        (r"\b(?:UAE|Dubai|Abu Dhabi|Emirates)\b", "Emiratos Árabes Unidos"),
        (r"\bHong Kong\b", "Hong Kong"),
        (r"\bSingapore\b", "Singapur"),
        (r"\bBrazil\b", "Brasil"),
        (r"\bJapan\b", "Japón"),
        (r"\bSouth Korea\b", "Corea del Sur"),
        (r"\bAustralia\b", "Australia"),
        (r"\bCanada\b", "Canadá"),
    ]
    for pattern, jurisdiction in rules:
        if re.search(pattern, title, re.IGNORECASE):
            return jurisdiction
    return "Internacional"


def global_regulation_news():
    trusted = {
        "Reuters": 8,
        "Bank of England": 8,
        "Financial Times": 7,
        "CoinDesk": 6,
        "The Guardian": 5,
        "The Texas Tribune": 5,
        "International Consortium of Investigative Journalists - ICIJ": 5,
        "Yahoo Finance": 4,
        "Fortune": 4,
        "TheBanker.com": 4,
    }
    action = re.compile(
        r"\b(?:passes?|passed|final|approves?|approved|adopts?|adopted|issues?|issued|"
        r"proposes?|proposed|launches?|launched|law|legislation|rulebook|regulation)\b",
        re.IGNORECASE,
    )
    material_action = re.compile(
        r"\b(?:passes?|passed|final|approves?|approved|adopts?|adopted|issues?|issued|law|legislation|rulebook)\b",
        re.IGNORECASE,
    )
    topic = re.compile(
        r"\b(?:crypto\w*|blockchain|stablecoin\w*|bitcoin|token\w*|digital assets?)\b",
        re.IGNORECASE,
    )
    try:
        rows = google_news_items(
            "(crypto OR blockchain OR stablecoin) (regulation OR law OR legislation OR regulator) when:30d",
            language="en-US",
            country="US",
            edition="US:en",
        )
    except (HTTPError, URLError, TimeoutError, ET.ParseError, ValueError):
        return []
    now = datetime.now(timezone.utc)
    candidates = []
    for row in rows:
        if (
            row["publisher"] not in trusted
            or now - row["published_at"] > timedelta(days=31)
            or not topic.search(row["title"])
        ):
            continue
        jurisdiction = jurisdiction_from_title(row["title"])
        score = trusted[row["publisher"]] + (4 if action.search(row["title"]) else 0)
        candidates.append((score, row["published_at"], jurisdiction, row))
    candidates.sort(key=lambda value: (value[0], value[1]), reverse=True)
    selected = []
    jurisdictions = set()
    for _, _, jurisdiction, row in candidates:
        if jurisdiction in jurisdictions:
            continue
        jurisdictions.add(jurisdiction)
        headline = translate_headline_es(row["title"])
        if not headline:
            continue
        selected.append(
            {
                **headline,
                "url": row["url"],
                "publisher": row["publisher"],
                "jurisdiction": jurisdiction,
                "published": row["published_at"].isoformat(timespec="seconds"),
                "category": "REGULACIÓN",
                "status": "sourcechecked",
                "verification_status": "SOURCE_METADATA_VERIFIED",
                "source_observed_at": now.isoformat(timespec="seconds"),
                "verification_method": "Fuente incluida en el registro editorial, titular original preservado, fecha RSS válida y enlace público observado.",
                "importance": "Alto" if material_action.search(row["title"]) else "Medio",
            }
        )
        if len(selected) == 3:
            break
    return selected


def mining_news():
    trusted = {
        "Reuters": 9,
        "TheMinerMag": 8,
        "Mining.com": 8,
        "CoinDesk": 7,
        "Decrypt": 6,
        "Bitcoin Magazine": 6,
        "Crypto Briefing": 5,
        "Bitcoin Foundation": 5,
        "Cointelegraph": 4,
    }
    try:
        rows = google_news_items(
            "(bitcoin mining OR crypto mining) (hardware OR ASIC OR profitability OR hashrate) when:1d",
            language="en-US",
            country="US",
            edition="US:en",
        )
    except (HTTPError, URLError, TimeoutError, ET.ParseError, ValueError):
        return []
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    mining_topic = re.compile(
        r"\b(?:bitcoin miner|mining|miner|Bitaxe|ASIC|hashrate|BitFuFu|Bitdeer|MARA|Riot Platforms|CleanSpark)\b",
        re.IGNORECASE,
    )
    candidates = [
        row
        for row in rows
        if row["published_at"] >= cutoff
        and row["publisher"] in trusted
        and mining_topic.search(row["title"])
    ]
    candidates.sort(
        key=lambda row: (row["published_at"], trusted[row["publisher"]]), reverse=True
    )
    selected = []
    seen = set()
    for row in candidates:
        fingerprint = re.sub(r"\W+", " ", row["title"].lower()).strip()
        if any(fingerprint[:48] in previous or previous[:48] in fingerprint for previous in seen):
            continue
        seen.add(fingerprint)
        headline = translate_headline_es(row["title"])
        if not headline:
            continue
        selected.append(
            {
                **headline,
                "url": row["url"],
                "publisher": row["publisher"],
                "published": row["published_at"].isoformat(timespec="seconds"),
                "category": "MINERÍA",
                "status": "sourcechecked",
                "verification_status": "SOURCE_METADATA_VERIFIED",
                "source_observed_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "verification_method": "Fuente incluida en el registro editorial, titular original preservado, fecha RSS dentro de 24 horas y enlace público observado.",
                "importance": "Info",
            }
        )
        if len(selected) == 2:
            break
    return selected


def mining_profitability():
    hardware = {
        "model": "Antminer S21 XP",
        "hashrate_th_s": 270.0,
        "power_w": 3645.0,
        "source": "BITMAIN Support",
        "source_url": "https://support.bitmain.com/hc/en-us/articles/35383015643673-S21-XP-Specifications",
    }
    try:
        network = fetch_json("https://mempool.space/api/v1/mining/hashrate/3d")
        height = int(fetch_text("https://mempool.space/api/blocks/tip/height").strip())
        observations = []
        coinbase = fetch_json("https://api.exchange.coinbase.com/products/BTC-USD/ticker")
        coinbase_price = float(coinbase["price"])
        if coinbase_price > 0:
            observations.append(("Coinbase BTC-USD", coinbase_price))
        kraken = fetch_json("https://api.kraken.com/0/public/Ticker?pair=XBTUSD")
        if kraken.get("error"):
            raise ValueError("Kraken ticker error")
        kraken_row = next(iter(kraken["result"].values()))
        kraken_price = float(kraken_row["c"][0])
        if kraken_price > 0:
            observations.append(("Kraken BTC/USD", kraken_price))
        if not observations:
            raise ValueError("No fresh public BTC/USD observation")
        network_hashrate = float(network["currentHashrate"])
        btc_usd = float(statistics.median(value for _, value in observations))
        subsidy = 50.0 / (2 ** (height // 210000))
        btc_day = hardware["hashrate_th_s"] * 1e12 / network_hashrate * 144 * subsidy
        gross_usd_day = btc_day * btc_usd
        energy_kwh_day = hardware["power_w"] / 1000 * 24
        break_even = gross_usd_day / energy_kwh_day
        return {
            "status": "auto",
            "hardware": hardware,
            "network_hashrate_eh_s": network_hashrate / 1e18,
            "block_height": height,
            "block_subsidy_btc": subsidy,
            "btc_price_usd": btc_usd,
            "gross_btc_day": btc_day,
            "gross_usd_day": gross_usd_day,
            "energy_kwh_day": energy_kwh_day,
            "break_even_usd_kwh": break_even,
            "network_source": "mempool.space",
            "network_source_url": "https://mempool.space/docs/api/rest",
            "price_source": "Kaufman Reference Price diario",
            "price_source_url": "/mercados/",
            "price_venues": [name for name, _ in observations],
            "price_methodology": "Mediana de observaciones públicas BTC/USD; CoinGecko excluido",
        }
    except (HTTPError, URLError, TimeoutError, ValueError, KeyError, ZeroDivisionError):
        return {"status": "offline", "hardware": hardware}


def collect_boe_items(value):
    if isinstance(value, dict):
        if value.get("titulo") and value.get("url_html"):
            yield value
        for child in value.values():
            yield from collect_boe_items(child)
    elif isinstance(value, list):
        for child in value:
            yield from collect_boe_items(child)


def kraken_fees():
    source = {
        "name": "Kraken AssetPairs API",
        "url": "https://docs.kraken.com/api/docs/rest-api/get-tradable-asset-pairs",
        "status": "offline",
    }
    try:
        data = fetch_json(
            "https://api.kraken.com/0/public/AssetPairs?pair=XBTUSD&info=fees"
        )
        if data.get("error"):
            raise ValueError(", ".join(data["error"]))
        pair = next(iter(data.get("result", {}).values()))
        item = {
            "exchange": "Kraken",
            "pair": "BTC/USD",
            "maker": float(pair["fees_maker"][0][1]),
            "taker": float(pair["fees"][0][1]),
            "tier": "Primer tramo de volumen de 30 días",
        }
        source["status"] = "auto"
        return {"source": source, "items": [item]}
    except (HTTPError, URLError, TimeoutError, ValueError, KeyError, StopIteration):
        return {"source": source, "items": []}


def regulation_snapshot():
    end = date.today()
    start = end - timedelta(days=6)
    items = []
    sources = []

    boe_ok = False
    for offset in range(7):
        publication = start + timedelta(days=offset)
        url = f"https://www.boe.es/datosabiertos/api/boe/sumario/{publication:%Y%m%d}"
        try:
            payload = fetch_json(url)
            boe_ok = True
        except HTTPError as error:
            if error.code == 404:
                continue
            continue
        except (URLError, TimeoutError, ValueError):
            continue
        for row in collect_boe_items(payload):
            title = str(row.get("titulo", "")).strip()
            if not KEYWORDS.search(title):
                continue
            items.append(
                {
                    "id": row.get("identificador", row["url_html"]),
                    "title": title,
                    "url": row["url_html"],
                    "published": publication.isoformat(),
                    "source": "BOE",
                    "jurisdiction": "España",
                }
            )
    sources.append(
        {
            "name": "BOE Datos Abiertos",
            "scope": "España",
            "url": "https://www.boe.es/datosabiertos/api/api.php",
            "status": "auto" if boe_ok else "offline",
        }
    )

    query = urlencode(
        [
            ("per_page", "100"),
            ("order", "newest"),
            ("conditions[publication_date][gte]", start.isoformat()),
            ("conditions[agencies][]", "securities-and-exchange-commission"),
            ("conditions[agencies][]", "commodity-futures-trading-commission"),
        ]
    )
    federal_ok = False
    try:
        payload = fetch_json(
            f"https://www.federalregister.gov/api/v1/documents.json?{query}"
        )
        federal_ok = True
        for row in payload.get("results", []):
            text = f"{row.get('title', '')} {row.get('abstract') or ''}"
            if not KEYWORDS.search(text):
                continue
            headline = translate_headline_es(str(row.get("title", "Documento sin título")))
            if not headline:
                continue
            items.append(
                {
                    "id": row.get("document_number", row.get("html_url")),
                    **headline,
                    "url": row.get("html_url"),
                    "published": row.get("publication_date", ""),
                    "source": "Federal Register",
                    "jurisdiction": "Estados Unidos",
                }
            )
    except (HTTPError, URLError, TimeoutError, ValueError):
        pass
    sources.append(
        {
            "name": "Federal Register · SEC y CFTC",
            "scope": "Estados Unidos",
            "url": "https://www.federalregister.gov/developers/documentation/api/v1",
            "status": "auto" if federal_ok else "offline",
        }
    )

    unique = {str(item["id"]): item for item in items}
    ordered = sorted(
        unique.values(), key=lambda item: (item["published"], item["title"]), reverse=True
    )[:12]
    return {"sources": sources, "items": ordered}


def main():
    snapshot = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "exchange_fees": kraken_fees(),
        "regulation": regulation_snapshot(),
        "home_regulation": global_regulation_news(),
        "mining_news": mining_news(),
        "mining_profitability": mining_profitability(),
    }
    payload = json.dumps(snapshot, ensure_ascii=False, separators=(",", ":"))
    OUTPUT.write_text(
        f"window.KAUFMAN_DAILY_DATA = {payload};\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()
