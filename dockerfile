FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /code

# Instalar netcat para verificar conexión a PostgreSQL
RUN apt-get update && apt-get install -y gettext netcat-traditional && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Copiar script de entrada y hacerlo ejecutable
COPY entrypoint.sh /code/entrypoint.sh
RUN chmod +x /code/entrypoint.sh

WORKDIR /code/app

# Ejecutar mediante sh para evitar problemas de permisos en volúmenes montados (Windows)
CMD ["sh", "/code/entrypoint.sh"]