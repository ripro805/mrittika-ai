"""
ASGI config for Mrittika AI project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mrittika.settings")
application = get_asgi_application()
