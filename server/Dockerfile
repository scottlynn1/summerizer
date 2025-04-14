FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
RUN mkdir /app
WORKDIR /app
COPY requirements.txt .

RUN pip3 install --no-cache-dir --upgrade pip
RUN pip3 install --no-cache-dir gunicorn
RUN pip3 install --no-cache-dir -r requirements.txt
RUN pip3 install --no-cache-dir llama-index llama-index-llms-groq llama-index-embeddings-huggingface
COPY . .

RUN chmod +x start.sh
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8000

CMD ["./start.sh"]