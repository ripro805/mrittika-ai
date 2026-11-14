"""
Management command to audit environment variables, security configurations,
LLM provider keys, and model artifact availability for Mrittika AI.
"""

import os
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

MODEL_FILES = [
    "mrittika_crop_model.pkl",
    "mrittika_fertilizer_model.pkl",
]


class Command(BaseCommand):
    help = "Audit Mrittika AI environment configuration, security posture, and model availability."

    def add_arguments(self, parser):
        parser.add_argument(
            "--strict",
            action="store_true",
            help="Exit with non-zero code if any warning or error is detected.",
        )

    def handle(self, *args, **options):
        strict = options.get("strict", False)
        errors = []
        warnings = []
        info = []

        self.stdout.write(self.style.MIGRATE_HEADING("=== Mrittika AI Environment & Configuration Audit ===\n"))

        # 1. Django & Security Settings
        debug_mode = getattr(settings, "DEBUG", False)
        secret_key = getattr(settings, "SECRET_KEY", "")
        allowed_hosts = getattr(settings, "ALLOWED_HOSTS", [])

        if debug_mode:
            info.append("DEBUG is ON (suitable for development only).")
        else:
            info.append("DEBUG is OFF (production mode).")

        if not secret_key:
            errors.append("SECRET_KEY is empty or missing.")
        elif any(s in secret_key.lower() for s in ["insecure", "secret", "change-in-production", "replace"]):
            if not debug_mode:
                errors.append("Production mode (DEBUG=False) is using an insecure or default SECRET_KEY!")
            else:
                warnings.append("Using default/insecure SECRET_KEY. Generate a random secret before production.")
        elif len(secret_key) < 32:
            warnings.append("SECRET_KEY is shorter than 32 characters; recommend 50+ random characters.")

        if not allowed_hosts:
            errors.append("ALLOWED_HOSTS is empty.")
        elif "*" in allowed_hosts and not debug_mode:
            errors.append("ALLOWED_HOSTS contains wildcard '*' in production mode.")

        cors_origins = getattr(settings, "CORS_ALLOWED_ORIGINS", [])
        if "*" in cors_origins:
            warnings.append("CORS_ALLOWED_ORIGINS contains wildcard '*'. Specify exact origins in production.")

        # 2. Database
        db_engine = settings.DATABASES["default"]["ENGINE"]
        if "postgresql" in db_engine:
            info.append(f"Database: PostgreSQL ({settings.DATABASES['default'].get('NAME')})")
        else:
            info.append("Database: SQLite (development default)")

        # 3. LLM Configuration
        groq_key = getattr(settings, "GROQ_API_KEY", "") or os.getenv("GROQ_API_KEY", "")
        gemini_key = getattr(settings, "GEMINI_API_KEY", "") or os.getenv("GEMINI_API_KEY", "")
        provider_order = getattr(settings, "LLM_PROVIDER_ORDER", "groq,gemini")

        configured_llms = []
        if groq_key:
            groq_model = getattr(settings, "GROQ_MODEL", "openai/gpt-oss-120b")
            configured_llms.append(f"Groq (Model: {groq_model}, Key: [SET - REDACTED])")
        else:
            configured_llms.append("Groq: Unconfigured (GROQ_API_KEY empty)")

        if gemini_key:
            gemini_model = getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash-lite")
            configured_llms.append(f"Gemini (Model: {gemini_model}, Key: [SET - REDACTED])")
        else:
            configured_llms.append("Gemini: Unconfigured (GEMINI_API_KEY empty)")

        if not groq_key and not gemini_key:
            warnings.append(
                "No live LLM API keys configured (GROQ_API_KEY and GEMINI_API_KEY are empty).\n"
                "   The assistant will operate in deterministic MOCK / RETRIEVAL-ONLY fallback mode.\n"
                "   To enable live free-tier LLM generation, set GROQ_API_KEY or GEMINI_API_KEY in .env."
            )
        else:
            info.append(f"Configured LLM providers (Order: {provider_order})")

        # 4. RAG & Vector Store
        embedding_provider = getattr(settings, "EMBEDDING_PROVIDER", "local")
        embedding_model = getattr(settings, "EMBEDDING_MODEL", "")
        chroma_dir = Path(getattr(settings, "CHROMA_PERSIST_DIR", settings.BASE_DIR / "chroma_db"))

        info.append(f"RAG Embedding: provider={embedding_provider}, model={embedding_model}")
        if not chroma_dir.exists():
            warnings.append(f"ChromaDB persist directory '{chroma_dir}' does not exist yet (will create on first ingestion).")
        else:
            info.append(f"ChromaDB directory: {chroma_dir} (exists)")

        # 5. Machine Learning Models
        ml_dir = Path(getattr(settings, "ML_MODELS_DIR", settings.BASE_DIR / "ml_models"))
        missing_models = []
        for mf in MODEL_FILES:
            if not (ml_dir / mf).exists():
                missing_models.append(mf)

        if missing_models:
            warnings.append(
                f"Missing ML model files in '{ml_dir}': {', '.join(missing_models)}.\n"
                f"   Run 'python manage.py fetch_models' to download from Hugging Face ({getattr(settings, 'HF_REPO_ID', '')})."
            )
        else:
            info.append(f"ML Models: All core artifacts present in '{ml_dir}'.")

        # Report Summary
        self.stdout.write(self.style.SUCCESS("[+] Active Configuration Details:"))
        for item in info:
            self.stdout.write(f"  * {item}")
        for llm_status in configured_llms:
            self.stdout.write(f"  * {llm_status}")

        if warnings:
            self.stdout.write(self.style.WARNING("\n[!] Warnings & Optimization Notices:"))
            for w in warnings:
                self.stdout.write(self.style.WARNING(f"  - {w}"))

        if errors:
            self.stdout.write(self.style.ERROR("\n[x] Critical Errors:"))
            for e in errors:
                self.stdout.write(self.style.ERROR(f"  - {e}"))

        if not errors and not warnings:
            self.stdout.write(self.style.SUCCESS("\n[+] Audit Passed: All environment variables and security settings are valid!\n"))
        elif not errors:
            self.stdout.write(self.style.SUCCESS("\n[+] Audit Completed: No blocking errors found.\n"))
        else:
            self.stdout.write(self.style.ERROR("\n[x] Audit Failed: Please resolve critical configuration errors.\n"))

        if strict and (errors or warnings):
            raise CommandError("Audit failed in strict mode due to warnings or errors.")
        elif errors:
            raise CommandError("Audit failed due to critical configuration errors.")
