# Build stage
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies (needed for packages like asyncpg if wheels aren't available)
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Final stage
FROM python:3.11-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local

# Make sure the local bin is on the PATH for uvicorn
ENV PATH=/root/.local/bin:$PATH

# Copy application code
COPY app /app/app

# Expose the port InsForge expects
EXPOSE 8000

# Start FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
