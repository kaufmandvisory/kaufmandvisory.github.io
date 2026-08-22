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
REGULATION_OUTPUT = ROOT / "assets" / "regulation-data.js"
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
    # Google Translate is useful as a first pass, but its literal vocabulary is
    # not suitable for a Spanish financial publication. Keep a deterministic
    # editorial glossary so recurring blockchain terms render in es-ES.
    replacements = (
        (r"\breglas criptogr[aá]ficas\b", "normas sobre criptoactivos"),
        (r"\bregulaci[oó]n criptogr[aá]fica\b", "regulación de los criptoactivos"),
        (r"\bindustria criptogr[aá]fica\b", "industria de los criptoactivos"),
        (r"\bUtility GM\b", "El director general de la eléctrica"),
        (r"\btan esperadas\b", "largamente esperadas"),
    )
    for pattern, replacement in replacements:
        translated = re.sub(pattern, replacement, translated, flags=re.IGNORECASE)
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
    cutoff = now - timedelta(hours=24)
    candidates = []
    for row in rows:
        if (
            row["publisher"] not in trusted
            or row["published_at"] < cutoff
            or not topic.search(row["title"])
            or not action.search(row["title"])
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
                "date_verb": "publicado",
            }
        )
        if len(selected) == 3:
            break
    return selected


def read_assigned_json(path: Path, prefix: str) -> dict:
    raw = path.read_text(encoding="utf-8").strip()
    if not raw.startswith(prefix):
        raise ValueError(f"Asignación global no válida: {path.name}")
    payload = raw[len(prefix) :]
    if payload.endswith(";"):
        payload = payload[:-1]
    return json.loads(payload)


def official_regulation_updates(limit: int = 3) -> list[dict]:
    """Build today's monitored legal signals from connected primary sources.

    This is deliberately not presented as a new law. It reports that Kaufman
    re-observed the public official source today and preserves the previous
    legal-review date separately in the regulation intelligence contract.
    """
    try:
        data = read_assigned_json(
            REGULATION_OUTPUT, "window.KAUFMAN_REGULATION_DATA = "
        )
    except (OSError, ValueError, json.JSONDecodeError):
        return []
    now = datetime.now(timezone.utc)
    sources = {row.get("id"): row for row in data.get("sources", [])}
    selected = []
    jurisdictions = set()
    for regime in data.get("regimes", []):
        jurisdiction = str(regime.get("jurisdiction") or "").strip()
        if not jurisdiction or jurisdiction in jurisdictions:
            continue
        source = next(
            (
                sources.get(source_id)
                for source_id in regime.get("source_ids", [])
                if sources.get(source_id, {}).get("connection_status") == "CONNECTED"
            ),
            None,
        )
        if not source:
            continue
        checked_at = source.get("checked_at")
        try:
            checked = datetime.fromisoformat(str(checked_at).replace("Z", "+00:00"))
        except ValueError:
            continue
        if now - checked.astimezone(timezone.utc) > timedelta(hours=26):
            continue
        jurisdictions.add(jurisdiction)
        selected.append(
            {
                "title": f"{regime.get('name', jurisdiction)}: fuente oficial comprobada hoy",
                "original_title": source.get("title") or regime.get("name"),
                "translated": False,
                "language": "es-ES",
                "url": source.get("url"),
                "publisher": source.get("authority") or regime.get("authority"),
                "jurisdiction": jurisdiction,
                "published": checked.astimezone(timezone.utc).isoformat(timespec="seconds"),
                "category": "MONITOR OFICIAL",
                "status": "verified",
                "verification_status": "OFFICIAL_SOURCE_MONITORED",
                "source_observed_at": checked.astimezone(timezone.utc).isoformat(timespec="seconds"),
                "verification_method": "Fuente pública oficial descargada server-side, con respuesta válida y huella de contenido conservada. La comprobación técnica no sustituye una nueva revisión jurídica.",
                "importance": "Alto" if regime.get("state") == "TRANSITION_ENDED" else "Medio",
                "date_verb": "comprobada",
            }
        )
        if len(selected) == limit:
            break
    return selected


def complete_regulation_briefing(news: list[dict]) -> list[dict]:
    """Return three fresh signals without recycling old headlines."""
    selected = list(news[:3])
    used_jurisdictions = {row.get("jurisdiction") for row in selected}
    for row in official_regulation_updates(limit=6):
        if row.get("jurisdiction") in used_jurisdictions:
            continue
        selected.append(row)
        used_jurisdictions.add(row.get("jurisdiction"))
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
                "date_verb": "publicado",
            }
        )
        if len(selected) == 2:
            break
    return selected


def mining_data_update(metrics: dict) -> dict | None:
    """Turn the live profitability model into a current operational signal."""
    if metrics.get("status") != "auto":
        return None
    hardware = metrics.get("hardware") or {}
    break_even = metrics.get("break_even_usd_kwh")
    network = metrics.get("network_hashrate_eh_s")
    if not isinstance(break_even, (int, float)) or not isinstance(network, (int, float)):
        return None
    now = datetime.now(timezone.utc)
    value = f"{break_even:.3f}".replace(".", ",")
    hashrate = f"{network:.1f}".replace(".", ",")
    title = (
        f"{hardware.get('model', 'Equipo minero')}: electricidad de equilibrio de "
        f"{value} USD/kWh con la red en {hashrate} EH/s"
    )
    return {
        "title": title,
        "original_title": title,
        "translated": False,
        "language": "es-ES",
        "url": "https://mempool.space/mining",
        "publisher": "Kaufman · mempool.space + BITMAIN",
        "jurisdiction": "Global",
        "published": now.isoformat(timespec="seconds"),
        "category": "RENTABILIDAD MINERA",
        "status": "verified",
        "verification_status": "CALCULATED_FROM_PUBLIC_SOURCES",
        "source_observed_at": now.isoformat(timespec="seconds"),
        "verification_method": "Cálculo server-side con hashrate de red, subsidio y altura observados en mempool.space, especificación oficial de BITMAIN y mediana BTC/USD de Coinbase y Kraken.",
        "importance": "Info",
        "date_verb": "calculado",
    }


def complete_mining_briefing(news: list[dict], metrics: dict) -> list[dict]:
    selected = list(news[:2])
    if len(selected) < 2:
        signal = mining_data_update(metrics)
        if signal:
            selected.append(signal)
    return selected[:2]


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
    profitability = mining_profitability()
    snapshot = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "exchange_fees": kraken_fees(),
        "regulation": regulation_snapshot(),
        "home_regulation": complete_regulation_briefing(global_regulation_news()),
        "mining_news": complete_mining_briefing(mining_news(), profitability),
        "mining_profitability": profitability,
    }
    payload = json.dumps(snapshot, ensure_ascii=False, separators=(",", ":"))
    OUTPUT.write_text(
        f"window.KAUFMAN_DAILY_DATA = {payload};\n", encoding="utf-8"
    )


if __name__ == "__main__":
    main()
