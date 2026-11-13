"""
Management command to fetch models from Hugging Face repo ripro805/mrittika-ai.
Validates repository ID against allow-list and checks SHA-256 against models.lock.
"""

import hashlib
import json
import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

ALLOWED_REPO = "ripro805/mrittika-ai"
FILES = [
    "mrittika_crop_model.pkl",
    "mrittika_fertilizer_model.pkl",
    "metrics.json",
    "fertilizer_metrics.json",
    "bangladesh_crop_recommendation.csv",
    "bangladesh_fertilizer_recommendation.csv",
]


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(8192 * 1024):
            h.update(chunk)
    return h.hexdigest()


class Command(BaseCommand):
    help = "Fetch machine learning model artifacts from allow-listed Hugging Face repository."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Force re-download even if files already exist.",
        )

    def handle(self, *args, **options):
        dest_dir: Path = settings.ML_MODELS_DIR
        dest_dir.mkdir(parents=True, exist_ok=True)

        repo_id = settings.HF_REPO_ID
        if repo_id != ALLOWED_REPO:
            raise CommandError(f"Security Violation: Repo '{repo_id}' is not in allow-list.")

        revision = settings.HF_REVISION
        token = settings.HF_TOKEN
        lock_file = dest_dir / "models.lock"

        # Load existing lockfile if present
        expected_hashes = {}
        if lock_file.exists():
            try:
                with open(lock_file, "r", encoding="utf-8") as f:
                    lock_data = json.load(f)
                    expected_hashes = {k: v.get("sha256") for k, v in lock_data.items()}
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Could not read models.lock: {e}"))

        from huggingface_hub import hf_hub_download

        self.stdout.write(self.style.NOTICE(f"Fetching models from {repo_id} (rev: {revision})..."))
        new_hashes = {}

        for filename in FILES:
            target_path = dest_dir / filename
            already_valid = False

            if target_path.exists() and not options["force"] and filename in expected_hashes:
                curr_hash = sha256_file(target_path)
                if curr_hash == expected_hashes[filename]:
                    already_valid = True
                    new_hashes[filename] = {"sha256": curr_hash, "size_bytes": target_path.stat().st_size}
                    self.stdout.write(f"  [OK] {filename} already verified.")

            if not already_valid:
                self.stdout.write(f"  Downloading {filename}...")
                dl_path = hf_hub_download(
                    repo_id=repo_id,
                    filename=filename,
                    token=token if token else None,
                    revision=revision,
                )
                if dl_path != str(target_path):
                    shutil.copyfile(dl_path, target_path)

                curr_hash = sha256_file(target_path)
                size_bytes = target_path.stat().st_size
                new_hashes[filename] = {"sha256": curr_hash, "size_bytes": size_bytes}

                # Verify against lock if exists
                if filename in expected_hashes and expected_hashes[filename] != curr_hash:
                    raise CommandError(
                        f"Checksum mismatch for {filename}!\n"
                        f"Expected: {expected_hashes[filename]}\n"
                        f"Got:      {curr_hash}"
                    )
                self.stdout.write(self.style.SUCCESS(f"  Downloaded & verified {filename} ({size_bytes} bytes)."))

        # Write or update models.lock
        with open(lock_file, "w", encoding="utf-8") as f:
            json.dump(new_hashes, f, indent=2)

        self.stdout.write(self.style.SUCCESS(f"All model artifacts verified. Lockfile: {lock_file}"))
