# 🚀 ManBank - Guía de Desarrollo Local

Esta guía te ayudará a configurar el entorno de desarrollo local donde:
- **Docker**: Corre la infraestructura (Postgres, ChromaDB, Backend)
- **Local**: Solo el Frontend corre con `npm run dev`
- **LLM**: Usa Gemini API (gratis, sin descarga de modelos)

## 📋 Prerequisitos

- Docker y Docker Compose
- Node.js 18+ y npm
- **Google Gemini API Key** (gratuita) → https://aistudio.google.com/apikey
- Git

## 🏗️ Setup Inicial

### 1. Configurar API Key de Gemini

Primero, obtén tu API key gratuita:
1. Ve a https://aistudio.google.com/apikey
2. Haz clic en "Create API Key"
3. Copia la key

Luego crea el archivo `.env` en `manbank/docker/`:

```bash
cd manbank/docker
echo "GOOGLE_API_KEY=tu-api-key-aqui" > .env
```

O en Windows PowerShell:
```powershell
cd manbank\docker
"GOOGLE_API_KEY=tu-api-key-aqui" | Out-File -FilePath .env -Encoding utf8
```

### 2. Levantar Infraestructura (Docker)

```bash
docker compose up -d --build
```

Esto levantará (tarda ~2-3 minutos):
- ✅ PostgreSQL en puerto `5432`
- ✅ ChromaDB en puerto `8000`
- ✅ Backend FastAPI en puerto `8001`

Verificar que estén corriendo:
```bash
docker compose ps
```

### 3. Cargar Datos de Prueba en PostgreSQL

Una vez los contenedores estén corriendo:

**Opción A - Desde tu terminal (recomendado):**
```bash
# Desde la carpeta manbank/docker
docker exec -i manbank-postgres psql -U user -d manbank < seed_data.sql
```

**Opción B - Entrando al contenedor:**
```bash
docker exec -it manbank-postgres psql -U user -d manbank
# Luego dentro de psql:
\i /docker-entrypoint-initdb.d/02-schema.sql
```

**Opción C - Usando el generador Python:**
```bash
cd manbank/docker/data
python generate_sample_data.py
# Esto genera un CSV que puedes cargar con el ETL
```

### 4. Configurar y Correr el Frontend (Local)

```bash
cd manbank/frontend

# Instalar dependencias (primera vez)
npm install

# Configurar variables de entorno
# Crear archivo .env.local:
NEXT_PUBLIC_API_URL=http://localhost:8001

# Correr el frontend
npm run dev
```

El frontend estará en: `http://localhost:3000`

## 🔧 Comandos Útiles

### Docker

```bash
# Ver logs de un servicio
docker compose logs -f postgres
docker compose logs -f chromadb

# Detener todo
docker compose down

# Detener y borrar volúmenes (limpieza completa)
docker compose down -v

# Reiniciar un servicio
docker compose restart postgres
```

### Base de Datos

```bash
# Conectarse a PostgreSQL
docker exec -it manbank-postgres psql -U user -d manbank

# Ver tablas
\dt

# Ver datos de transacciones
SELECT * FROM transactions LIMIT 10;

# Ver estadísticas
SELECT type, COUNT(*), SUM(amount) FROM transactions GROUP BY type;
```

### Backend (FastAPI)

```bash
# Ver logs del backend
docker compose logs -f fastapi

# Probar el backend
curl http://localhost:8001/health
```

## 📊 Verificar que Todo Funciona

1. **PostgreSQL**: `docker exec manbank-postgres psql -U user -d manbank -c "SELECT COUNT(*) FROM transactions;"`
2. **ChromaDB**: Abre `http://localhost:8000/api/v1/heartbeat`
3. **Backend**: Abre `http://localhost:8001/docs` (API docs FastAPI)
4. **Frontend**: Abre `http://localhost:3000`

## 🐛 Troubleshooting

### Puerto 5432 ya está en uso
Si tienes PostgreSQL instalado localmente, cámbialo en `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Usa 5433 en tu máquina
```

Y actualiza el `.env` del backend:
```
DATABASE_URL=postgresql://user:password@localhost:5433/manbank
```

### ChromaDB no responde
```bash
docker compose restart chromadb
docker compose logs -f chromadb
```

### El backend no conecta a la BD
Verifica que los contenedores estén healthy:
```bash
docker compose ps
```

## 🎯 Modo Completo (Opcional)

Si quieres correr TODO en Docker (no recomendado para desarrollo):

```bash
docker compose --profile full up -d
```

Esto levantará también el frontend, backend y ETL dockerizados.

## 📝 Notas

- El archivo `docker-compose.yml` usa **profiles** para distinguir entre modo dev y completo
- Los datos de prueba incluyen ~95 transacciones de ejemplo de 2024
- ChromaDB persiste datos en un volumen Docker
- Ollama requiere descarga de modelos la primera vez

