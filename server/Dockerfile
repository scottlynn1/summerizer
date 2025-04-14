FROM python:3.14.0a4-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
RUN mkdir /app
WORKDIR /app
COPY requirements.txt .
RUN pip3 install --no-cache-dir --upgrade pip
RUN pip3 install gunicorn
RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x start.sh
RUN chown -R appuser:appgroup /app /app/entrypoint.sh
USER appuser

EXPOSE 8000

CMD ["./start.sh"]