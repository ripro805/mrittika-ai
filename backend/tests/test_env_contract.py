"""
Environment Contract & check_env Management Command Tests.
Ensures that all environment variables accessed in application code are
documented in .env.example, and that check_env flags insecure configurations.
"""

import os
import re
from io import StringIO
from pathlib import Path

import pytest
from django.conf import settings
from django.core.management import call_command
from django.core.management.base import CommandError


def test_all_env_vars_in_backend_env_example():
    """Verify that every os.getenv / os.environ.get variable in settings and apps is in backend/.env.example."""
    backend_dir = Path(settings.BASE_DIR)
    example_path = backend_dir / ".env.example"
    assert example_path.exists(), "backend/.env.example must exist"

    example_content = example_path.read_text(encoding="utf-8")
    example_vars = set(re.findall(r"^([A-Z0-9_]+)=", example_content, re.MULTILINE))

    # Scan python files in backend/mrittika and backend/apps
    code_vars = set()
    pattern = re.compile(r'(?:os\.environ\.get|os\.getenv|os\.environ\[)\s*[\(\'\"]([A-Z0-9_]+)[\'\"]')

    for search_dir in [backend_dir / "mrittika", backend_dir / "apps"]:
        for root, _, files in os.walk(search_dir):
            if "__pycache__" in root:
                continue
            for f in files:
                if f.endswith(".py"):
                    file_text = (Path(root) / f).read_text(encoding="utf-8", errors="ignore")
                    matches = pattern.findall(file_text)
                    for m in matches:
                        code_vars.add(m)

    # Standard system or runtime env vars that don't need user configuration in .env.example
    allowed_system_vars = {"PATH", "HOME", "PYTHONPATH"}
    required_vars = code_vars - allowed_system_vars

    missing = required_vars - example_vars
    assert not missing, f"The following environment variables are read in code but missing from backend/.env.example: {missing}"


def test_check_env_command_runs_successfully(settings):
    """Test check_env execution with valid debug or safe secret key."""
    settings.DEBUG = True
    settings.SECRET_KEY = "django-insecure-test-key-for-dev-environment"
    out = StringIO()
    call_command("check_env", stdout=out)
    output = out.getvalue()

    assert "Mrittika AI Environment & Configuration Audit" in output
    assert "Active Configuration Details" in output


def test_check_env_detects_insecure_production_secret(settings):
    """Test check_env flags critical error when DEBUG=False with default/insecure key."""
    settings.DEBUG = False
    settings.SECRET_KEY = "django-insecure-test-key"

    out = StringIO()
    with pytest.raises(CommandError, match="Audit failed due to critical configuration errors"):
        call_command("check_env", stdout=out)

    output = out.getvalue()
    assert "Critical Errors" in output
    assert "insecure or default SECRET_KEY" in output


def test_check_env_warns_when_llm_keys_empty(settings):
    """Test check_env outputs prominent warning when no LLM keys are configured."""
    settings.DEBUG = True
    settings.GROQ_API_KEY = ""
    settings.GEMINI_API_KEY = ""

    out = StringIO()
    call_command("check_env", stdout=out)
    output = out.getvalue()

    assert "No live LLM API keys configured" in output
    assert "MOCK / RETRIEVAL-ONLY fallback" in output
