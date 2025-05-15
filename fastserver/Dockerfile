FROM python:3.10-slim-bookworm

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
RUN mkdir /app
WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -r requirements.txt
RUN pip3 install --no-cache-dir llama-index llama-index-llms-groq llama-index-embeddings-huggingface
RUN pip3 install --no-cache-dir uvicorn[standard]

COPY . .


# Copy application code

RUN chown -R appuser:appgroup /app
USER appuser


# Expose FastAPI port
EXPOSE 8000

# Command to run FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
