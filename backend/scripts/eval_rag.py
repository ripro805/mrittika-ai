"""
RAG Evaluation Script for Mrittika AI Assistant.
Evaluates 20 benchmark questions from docs/eval_questions.jsonl and reports:
- Retrieval relevance
- Fallback rate
- Citation accuracy
"""

import json
import os
import sys
from pathlib import Path

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mrittika.settings")

import django

django.setup()

from apps.assistant.llm_providers import get_llm_provider
from apps.assistant.rag_engine import get_collection, ingest_document, query_knowledge_base

QUESTIONS_FILE = BASE_DIR.parent / "docs" / "eval_questions.jsonl"
SAMPLE_DOCS_DIR = BASE_DIR / "apps" / "assistant" / "sample_docs"


def run_evaluation():
    print("=" * 60)
    print("MRITTIKA AI - RAG EVALUATION BENCHMARK")
    print("NOTE: Benchmark runs over sample documents [SAMPLE - NOT VERIFIED].")
    print("In production, ingest verified BARC FRG / BRRI / BARI documents.")
    print("=" * 60)

    # 1. Check knowledge base collection
    collection = get_collection()
    if collection.count() == 0:
        print("[*] Ingesting sample documents into ChromaDB...")
        for doc in SAMPLE_DOCS_DIR.glob("*.*"):
            ingest_document(doc)
        print(f"[+] Total indexed chunks: {collection.count()}")

    if not QUESTIONS_FILE.exists():
        print(f"[!] Benchmark file not found at {QUESTIONS_FILE}")
        return

    questions = []
    with open(QUESTIONS_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                questions.append(json.loads(line))

    print(f"Loaded {len(questions)} evaluation questions from {QUESTIONS_FILE.name}.\n")

    provider = get_llm_provider()

    total = len(questions)
    fallback_count = 0
    correct_fallback_behavior = 0
    citation_count = 0
    in_domain_total = 0

    results = []

    for q in questions:
        qid = q["id"]
        qtext = q["question"]
        expected_fallback = q.get("expected_fallback", False)
        category = q.get("category", "in_domain")

        chunks, low_conf = query_knowledge_base(qtext, top_k=3)
        res = provider.generate(qtext, chunks)

        is_fallback = res.get("fallback", False)
        answer = res.get("answer", "")
        sources = res.get("sources", [])

        if is_fallback:
            fallback_count += 1

        # Check citation accuracy: in-domain non-fallback responses should cite sources
        has_citation = False
        if not is_fallback:
            in_domain_total += 1
            if ("[" in answer and "]" in answer) or len(sources) > 0:
                has_citation = True
                citation_count += 1

        behavior_match = (is_fallback == expected_fallback)
        if behavior_match:
            correct_fallback_behavior += 1

        results.append({
            "id": qid,
            "category": category,
            "question": qtext,
            "is_fallback": is_fallback,
            "expected_fallback": expected_fallback,
            "behavior_match": behavior_match,
            "has_citation": has_citation,
        })

        status_str = "[PASS]" if behavior_match else "[FAIL]"
        print(f"{status_str} Q{qid:02d} [{category}]: Fallback={is_fallback} (Exp={expected_fallback})")

    fallback_rate = (fallback_count / total) * 100
    behavior_acc = (correct_fallback_behavior / total) * 100
    citation_rate = (citation_count / max(1, in_domain_total)) * 100

    print("\n" + "=" * 60)
    print("EVALUATION METRICS SUMMARY")
    print("=" * 60)
    print(f"Total Benchmark Questions:   {total}")
    print(f"Safety/Fallback Accuracy:    {behavior_acc:.1f}% ({correct_fallback_behavior}/{total})")
    print(f"Fallback Trigger Rate:       {fallback_rate:.1f}% ({fallback_count}/{total})")
    print(f"Citation Grounding Rate:     {citation_rate:.1f}% ({citation_count}/{max(1, in_domain_total)})")
    print("=" * 60)

    return {
        "total": total,
        "behavior_accuracy": behavior_acc,
        "fallback_rate": fallback_rate,
        "citation_accuracy": citation_rate,
        "results": results,
    }


if __name__ == "__main__":
    run_evaluation()
