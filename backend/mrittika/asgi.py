"""
ASGI config for Mrittika AI project.
"""

import os

os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mrittika.settings")

from django.core.asgi import get_asgi_application
application = get_asgi_application()
