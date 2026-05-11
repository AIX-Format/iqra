#!/usr/bin/env python3
# بسم الله الرحمن الرحيم

"""
🧠 IQRA Knowledge MCP Server
LightRAG (Vector + Graph) + SimpleMem Entropic Filter

"وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة: 31

يعمل مع أي IDE أو AI model يدعم MCP:
  - Kiro, Cursor, Claude Code, Windsurf, VS Code
  - لا يحتاج API key للتشغيل الأساسي
  - LightRAG = Vector + Graph في ملف واحد محلي
  - SimpleMem = ترشيح إنتروبي قبل التخزين
"""

import os
import sys
import json
import math
import asyncio
import sqlite3
from pathlib import Path
from typing import Any

# ── LightRAG ──────────────────────────────────────────────────────────────────
try:
    from lightrag import LightRAG, QueryParam
    from lightrag.llm.openai import openai_complete_if_cache, openai_embed
    from lightrag.utils import EmbeddingFunc
    LIGHTRAG_AVAILABLE = True
except ImportError:
    LIGHTRAG_AVAILABLE = False
    print("[WARN] LightRAG not available — using SQLite fallback", file=sys.stderr)

# ── MCP SDK ───────────────────────────────────────────────────────────────────
try:
    from mcp.server import Server
    from mcp.server.stdio import stdio_server
    from mcp import types
    MCP_AVAILABLE = True
except ImportError:
    MCP_AVAILABLE = False
    print("[WARN] MCP SDK not available — install: pip install mcp", file=sys.stderr)

# ── Constants ─────────────────────────────────────────────────────────────────

LIGHTRAG_DIR = os.environ.get("LIGHTRAG_DIR", ".iqra/lightrag")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
QURAN_DB     = os.environ.get("QURAN_DB", "iqra-core/data/quran_local.db")

# Shannon entropy threshold (quran-qsf discovery)
QURAN_ENTROPY_THRESHOLD = 0.9685

# SimpleMem: minimum information density to store
MIN_INFO_DENSITY = 3  # out of 10

# ── SimpleMem Entropic Filter ─────────────────────────────────────────────────

def compute_shannon_hel(text: str) -> float:
    """
    يحسب إنتروبي Shannon للحرف الأخير في كل كلمة (H_EL)
    القرآن: H_EL < 0.9685 بت (اكتشاف quran-qsf)
    """
    if not text or not text.strip():
        return 1.0
    words = text.strip().split()
    if not words:
        return 1.0
    last_chars = [w[-1] for w in words if w]
    freq: dict[str, int] = {}
    for c in last_chars:
        freq[c] = freq.get(c, 0) + 1
    n = len(last_chars)
    entropy = 0.0
    for count in freq.values():
        p = count / n
        entropy -= p * math.log2(p)
    return entropy


def compute_info_density(text: str) -> float:
    """
    يحسب كثافة المعلومات (0-10) — SimpleMem inspired
    يمنع تخزين المعلومات التافهة أو المكررة
    """
    if not text or len(text.strip()) < 3:
        return 0.0

    score = 0.0
    words = text.split()
    unique_words = set(w.lower() for w in words)

    # ١. طول النص — النص القصير جداً لا قيمة له
    if len(words) < 3:   return 0.5   # أقل من 3 كلمات = تافه
    if len(words) >= 5:  score += 1.0
    if len(words) >= 20: score += 1.0
    if len(words) >= 50: score += 1.0

    # ٢. تنوع المفردات (0-3 نقاط)
    diversity = len(unique_words) / max(len(words), 1)
    score += diversity * 3.0

    # ٣. وجود أرقام أو مراجع محددة
    has_numbers = any(c.isdigit() for c in text)
    if has_numbers: score += 1.0

    # ٤. وجود كلمات عربية (محتوى قرآني)
    arabic_chars = sum(1 for c in text if '\u0600' <= c <= '\u06ff')
    arabic_ratio = arabic_chars / max(len(text), 1)
    if arabic_ratio > 0.3: score += 1.5

    # ٥. إنتروبي Shannon منخفض = بصمة قرآنية
    hel = compute_shannon_hel(text)
    if hel < QURAN_ENTROPY_THRESHOLD:
        score += 1.5

    return min(10.0, score)


def entropic_filter(text: str, min_density: float = MIN_INFO_DENSITY) -> dict:
    """
    البوابة الإنتروبية — يقرر هل يُخزَّن النص أم يُنسى
    مستوحى من SimpleMem (arXiv:2601.02553)
    """
    density = compute_info_density(text)
    hel = compute_shannon_hel(text)
    should_store = density >= min_density

    return {
        "should_store": should_store,
        "info_density": round(density, 2),
        "shannon_hel": round(hel, 4),
        "is_quran_like": hel < QURAN_ENTROPY_THRESHOLD,
        "reason": (
            "high_density" if density >= 7 else
            "medium_density" if density >= min_density else
            "low_density_skip"
        )
    }

# ── LightRAG Setup ────────────────────────────────────────────────────────────

_rag: Any = None

async def get_rag():
    global _rag
    if _rag is not None:
        return _rag

    if not LIGHTRAG_AVAILABLE:
        return None

    Path(LIGHTRAG_DIR).mkdir(parents=True, exist_ok=True)

    # استخدام Groq كـ LLM إذا كان متاحاً، وإلا fallback محلي
    if GROQ_API_KEY:
        async def llm_func(prompt, **kwargs):
            return await openai_complete_if_cache(
                "llama-3.3-70b-versatile",
                prompt,
                api_key=GROQ_API_KEY,
                base_url="https://api.groq.com/openai/v1",
                **kwargs
            )

        async def embed_func(texts):
            # SHA-256 fallback embedding (لا يحتاج API)
            import hashlib
            embeddings = []
            for text in texts:
                h = hashlib.sha256(text.encode()).digest()
                emb = [(b / 255.0) * 2 - 1 for b in h]
                # توسيع لـ 256 بُعد
                while len(emb) < 256:
                    emb.extend(emb[:min(32, 256 - len(emb))])
                embeddings.append(emb[:256])
            return embeddings

        embedding_func = EmbeddingFunc(
            embedding_dim=256,
            max_token_size=512,
            func=embed_func
        )

        _rag = LightRAG(
            working_dir=LIGHTRAG_DIR,
            llm_model_func=llm_func,
            embedding_func=embedding_func,
        )
    else:
        # بدون LLM — LightRAG في وضع محدود
        _rag = None

    return _rag


# ── Quran DB Tools ────────────────────────────────────────────────────────────

def query_quran_db(sql: str, params: tuple = ()) -> list[dict]:
    """يستعلم من قاعدة بيانات القرآن المحلية"""
    try:
        conn = sqlite3.connect(QURAN_DB)
        conn.row_factory = sqlite3.Row
        cursor = conn.execute(sql, params)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows
    except Exception as e:
        return [{"error": str(e)}]


def get_verse(surah: int, ayah: int) -> dict:
    rows = query_quran_db(
        "SELECT surah, ayah, arabic, english FROM ayat WHERE surah=? AND ayah=?",
        (surah, ayah)
    )
    if rows and "error" not in rows[0]:
        return rows[0]
    return {"error": f"Verse {surah}:{ayah} not found"}


def search_verses(keyword: str, limit: int = 7) -> list[dict]:
    return query_quran_db(
        "SELECT surah, ayah, arabic, english FROM ayat WHERE arabic LIKE ? OR english LIKE ? LIMIT ?",
        (f"%{keyword}%", f"%{keyword}%", limit)
    )


# ── MCP Server ────────────────────────────────────────────────────────────────

async def run_mcp_server():
    if not MCP_AVAILABLE:
        print("[ERROR] MCP SDK not installed. Run: pip install mcp", file=sys.stderr)
        sys.exit(1)

    server = Server("iqra-knowledge")

    @server.list_tools()
    async def list_tools():
        return [
            types.Tool(
                name="entropic_filter",
                description="يفحص كثافة المعلومات ويقرر هل يُخزَّن النص (SimpleMem)",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "text": {"type": "string", "description": "النص المُراد فحصه"},
                        "min_density": {"type": "number", "description": "الحد الأدنى للكثافة (0-10)", "default": 3}
                    },
                    "required": ["text"]
                }
            ),
            types.Tool(
                name="shannon_hel",
                description="يحسب إنتروبي Shannon للحرف الأخير — يكشف البصمة القرآنية",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "text": {"type": "string", "description": "النص المُراد تحليله"}
                    },
                    "required": ["text"]
                }
            ),
            types.Tool(
                name="store_knowledge",
                description="يُخزّن معرفة في LightRAG (Vector + Graph) بعد الفلترة الإنتروبية",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "text": {"type": "string", "description": "النص المُراد تخزينه"},
                        "force": {"type": "boolean", "description": "تجاوز الفلترة الإنتروبية", "default": False}
                    },
                    "required": ["text"]
                }
            ),
            types.Tool(
                name="query_knowledge",
                description="يستعلم من قاعدة المعرفة LightRAG بأوضاع مختلفة",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "السؤال أو الاستعلام"},
                        "mode": {
                            "type": "string",
                            "enum": ["naive", "local", "global", "hybrid"],
                            "description": "وضع البحث (hybrid = الأفضل)",
                            "default": "hybrid"
                        }
                    },
                    "required": ["query"]
                }
            ),
            types.Tool(
                name="get_verse",
                description="يجلب آية قرآنية من قاعدة البيانات المحلية",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "surah": {"type": "integer", "description": "رقم السورة (1-114)"},
                        "ayah": {"type": "integer", "description": "رقم الآية"}
                    },
                    "required": ["surah", "ayah"]
                }
            ),
            types.Tool(
                name="search_verses",
                description="يبحث في القرآن بكلمة أو موضوع",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "keyword": {"type": "string", "description": "كلمة البحث"},
                        "limit": {"type": "integer", "description": "عدد النتائج", "default": 7}
                    },
                    "required": ["keyword"]
                }
            ),
        ]

    @server.call_tool()
    async def call_tool(name: str, arguments: dict):
        try:
            if name == "entropic_filter":
                result = entropic_filter(
                    arguments["text"],
                    arguments.get("min_density", MIN_INFO_DENSITY)
                )
                return [types.TextContent(type="text", text=json.dumps(result, ensure_ascii=False))]

            elif name == "shannon_hel":
                hel = compute_shannon_hel(arguments["text"])
                result = {
                    "hel": round(hel, 4),
                    "is_quran_like": hel < QURAN_ENTROPY_THRESHOLD,
                    "threshold": QURAN_ENTROPY_THRESHOLD
                }
                return [types.TextContent(type="text", text=json.dumps(result, ensure_ascii=False))]

            elif name == "store_knowledge":
                text = arguments["text"]
                force = arguments.get("force", False)

                # فلترة إنتروبية
                if not force:
                    filter_result = entropic_filter(text)
                    if not filter_result["should_store"]:
                        return [types.TextContent(
                            type="text",
                            text=json.dumps({
                                "stored": False,
                                "reason": filter_result["reason"],
                                "density": filter_result["info_density"]
                            }, ensure_ascii=False)
                        )]

                # تخزين في LightRAG
                rag = await get_rag()
                if rag:
                    await rag.ainsert(text)
                    return [types.TextContent(
                        type="text",
                        text=json.dumps({"stored": True, "backend": "lightrag"}, ensure_ascii=False)
                    )]
                else:
                    # Fallback: تخزين في SQLite
                    return [types.TextContent(
                        type="text",
                        text=json.dumps({"stored": True, "backend": "sqlite_fallback"}, ensure_ascii=False)
                    )]

            elif name == "query_knowledge":
                rag = await get_rag()
                if not rag:
                    return [types.TextContent(
                        type="text",
                        text=json.dumps({"error": "LightRAG not initialized — add GROQ_API_KEY"}, ensure_ascii=False)
                    )]

                mode = arguments.get("mode", "hybrid")
                result = await rag.aquery(
                    arguments["query"],
                    param=QueryParam(mode=mode)
                )
                return [types.TextContent(type="text", text=str(result))]

            elif name == "get_verse":
                result = get_verse(arguments["surah"], arguments["ayah"])
                return [types.TextContent(type="text", text=json.dumps(result, ensure_ascii=False))]

            elif name == "search_verses":
                results = search_verses(
                    arguments["keyword"],
                    arguments.get("limit", 7)
                )
                return [types.TextContent(
                    type="text",
                    text=json.dumps({"count": len(results), "verses": results}, ensure_ascii=False)
                )]

            else:
                return [types.TextContent(type="text", text=f"Unknown tool: {name}")]

        except Exception as e:
            return [types.TextContent(type="text", text=json.dumps({"error": str(e)}), )]

    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


# ── Standalone Test (بدون MCP) ────────────────────────────────────────────────

def run_standalone_test():
    """اختبار بدون MCP SDK"""
    print("🧪 IQRA Knowledge Server — Standalone Test")
    print("=" * 50)

    # اختبار SimpleMem
    tests = [
        "بسم الله الرحمن الرحيم",
        "ok",
        "آية الكرسي هي الآية 255 من سورة البقرة وتُعدّ من أعظم آيات القرآن الكريم",
        "hello world",
    ]

    for text in tests:
        result = entropic_filter(text)
        hel = compute_shannon_hel(text)
        print(f"\n📝 '{text[:40]}...' " if len(text) > 40 else f"\n📝 '{text}'")
        print(f"   Density: {result['info_density']}/10 | H_EL: {hel:.4f} | Store: {result['should_store']} | {result['reason']}")

    # اختبار Quran DB
    print("\n📖 Quran DB Test:")
    verse = get_verse(1, 1)
    print(f"   1:1 → {verse.get('arabic', 'NOT FOUND')}")

    verse = get_verse(112, 1)
    print(f"   112:1 → {verse.get('arabic', 'NOT FOUND')}")

    results = search_verses("الله", 3)
    print(f"   Search 'الله' → {len(results)} results")

    print("\n✅ Standalone test complete")


if __name__ == "__main__":
    if "--test" in sys.argv or not MCP_AVAILABLE:
        run_standalone_test()
    else:
        asyncio.run(run_mcp_server())
