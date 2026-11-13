"""
Management command to ingest agricultural documents into ChromaDB vector store.
"""

from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from apps.assistant.rag_engine import ingest_document


class Command(BaseCommand):
    help = "Ingest agricultural reference documents (PDF, Markdown, TXT) into ChromaDB."

    def add_arguments(self, parser):
        parser.add_argument(
            "path",
            nargs="?",
            type=str,
            default=None,
            help="Directory or file path to ingest (defaults to sample_docs).",
        )

    def handle(self, *args, **options):
        custom_path = options.get("path")
        if custom_path:
            target = Path(custom_path).resolve()
        else:
            target = settings.BASE_DIR / "apps" / "assistant" / "sample_docs"

        if not target.exists():
            self.stdout.write(self.style.ERROR(f"Path does not exist: {target}"))
            return

        files_to_process = []
        if target.is_file():
            files_to_process.append(target)
        else:
            for ext in ("*.md", "*.txt", "*.pdf"):
                files_to_process.extend(target.glob(ext))

        self.stdout.write(self.style.NOTICE(f"Found {len(files_to_process)} document(s) in {target}..."))
        total_chunks = 0

        for fpath in files_to_process:
            self.stdout.write(f"  Ingesting {fpath.name}...")
            try:
                count = ingest_document(fpath)
                total_chunks += count
                self.stdout.write(self.style.SUCCESS(f"    [OK] Ingested {count} chunks from {fpath.name}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"    [ERROR] Failed {fpath.name}: {e}"))

        self.stdout.write(self.style.SUCCESS(f"\n[+] Ingestion complete. Total indexed chunks: {total_chunks}"))
