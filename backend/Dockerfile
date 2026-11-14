# Multi-stage or optimized production build for Mrittika AI Backend
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . /app/

# Create unprivileged user for security
RUN useradd -u 1000 -m appuser && \
    mkdir -p /app/ml_models /app/chroma_db && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Health check against readiness endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/health/ || exit 1

# Default command
CMD ["gunicorn", "mrittika.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]
