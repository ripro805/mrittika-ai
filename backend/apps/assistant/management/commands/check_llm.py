"""
Management command to check LLM API keys, model availability, and ping status.
Usage: python manage.py check_llm
"""

import os

import requests
from django.core.management.base import BaseCommand

from apps.assistant.llm.base import redact_secrets


class Command(BaseCommand):
    help = "Validates Groq and Gemini API keys, checks model availability, and executes a 1-token diagnostic ping."

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("=== Mrittika AI LLM Diagnostics ==="))

        groq_key = os.getenv("GROQ_API_KEY", "").strip()
        gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
        groq_model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b").strip()
        gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite").strip()

        # 1. Groq Diagnostic
        self.stdout.write("\nChecking Groq API Configuration...")
        if not groq_key:
            self.stdout.write(self.style.WARNING("  [SKIP] GROQ_API_KEY is not set. Get a free key at https://console.groq.com"))
        else:
            self._check_groq(groq_key, groq_model)

        # 2. Gemini Diagnostic
        self.stdout.write("\nChecking Google Gemini API Configuration...")
        if not gemini_key:
            self.stdout.write(self.style.WARNING("  [SKIP] GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/app/apikey"))
        else:
            self._check_gemini(gemini_key, gemini_model)

        self.stdout.write(self.style.SUCCESS("\nLLM Diagnostic check completed."))

    def _check_groq(self, api_key: str, configured_model: str):
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        # 1. List models
        try:
            r = requests.get("https://api.groq.com/openai/v1/models", headers=headers, timeout=10)
            if r.status_code == 200:
                data = r.json()
                model_ids = [m.get("id") for m in data.get("data", [])]
                self.stdout.write(self.style.SUCCESS(f"  [OK] Successfully authenticated with Groq. Found {len(model_ids)} available models."))
                if configured_model in model_ids:
                    self.stdout.write(self.style.SUCCESS(f"  [OK] Configured model '{configured_model}' is active."))
                else:
                    self.stdout.write(self.style.WARNING(f"  [WARN] Configured model '{configured_model}' not found in active list. Top models: {model_ids[:5]}"))

                # 2. Tiny live call
                self.stdout.write("  Testing minimal completion ping...")
                ping_payload = {
                    "model": configured_model if configured_model in model_ids else (model_ids[0] if model_ids else configured_model),
                    "messages": [{"role": "user", "content": "hi"}],
                    "max_tokens": 2,
                }
                ping_r = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=ping_payload, timeout=10)
                if ping_r.status_code == 200:
                    self.stdout.write(self.style.SUCCESS("  [OK] Live test call succeeded!"))
                else:
                    self.stdout.write(self.style.ERROR(f"  [FAIL] Test call returned {ping_r.status_code}: {redact_secrets(ping_r.text[:150])}"))
            else:
                self.stdout.write(self.style.ERROR(f"  [FAIL] Groq authentication failed (HTTP {r.status_code}): {redact_secrets(r.text[:150])}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  [ERROR] Could not connect to Groq: {redact_secrets(str(e))}"))

    def _check_gemini(self, api_key: str, configured_model: str):
        headers = {
            "x-goog-api-key": api_key,
            "Content-Type": "application/json",
        }
        # 1. List models
        try:
            r = requests.get("https://generativelanguage.googleapis.com/v1beta/models", headers=headers, timeout=10)
            if r.status_code == 200:
                data = r.json()
                models = data.get("models", [])
                model_names = [m.get("name", "").replace("models/", "") for m in models]
                self.stdout.write(self.style.SUCCESS(f"  [OK] Successfully authenticated with Gemini. Found {len(model_names)} models."))
                if configured_model in model_names:
                    self.stdout.write(self.style.SUCCESS(f"  [OK] Configured model '{configured_model}' is active."))
                else:
                    self.stdout.write(self.style.WARNING(f"  [WARN] Configured model '{configured_model}' not directly matched. Sample available: {model_names[:5]}"))

                # 2. Tiny live call
                self.stdout.write("  Testing minimal completion ping...")
                ping_payload = {
                    "contents": [{"role": "user", "parts": [{"text": "hi"}]}],
                    "generationConfig": {"maxOutputTokens": 2},
                }
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{configured_model}:generateContent"
                ping_r = requests.post(url, headers=headers, json=ping_payload, timeout=10)
                if ping_r.status_code == 200:
                    self.stdout.write(self.style.SUCCESS("  [OK] Live test call succeeded!"))
                else:
                    self.stdout.write(self.style.ERROR(f"  [FAIL] Test call returned {ping_r.status_code}: {redact_secrets(ping_r.text[:150])}"))
            else:
                self.stdout.write(self.style.ERROR(f"  [FAIL] Gemini authentication failed (HTTP {r.status_code}): {redact_secrets(r.text[:150])}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"  [ERROR] Could not connect to Gemini: {redact_secrets(str(e))}"))
