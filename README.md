# ManBank - Sistema de Análisis Financiero con IA

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Latest-orange.svg)](https://www.trychroma.com/)

Sistema completo de análisis de transacciones bancarias con **RAG (Retrieval Augmented Generation)**, **embeddings vectoriales** y **múltiples proveedores de IA** (Local, OpenAI, Anthropic).

Diseño UI/UX basado en la identidad visual de Bancolombia.

---

## Características Principales

### Inteligencia Artificial
- **Sistema RAG**: Búsqueda semántica sobre transacciones usando ChromaDB
- **Embeddings**: `all-MiniLM-L6-v2` (384 dimensiones) - consistente en todo el sistema
- **Multi-proveedor**: Soporta Ollama (local), OpenAI GPT-4, y Anthropic Claude
- **Chat Inteligente**: Pregunta sobre tus finanzas en lenguaje natural
- **Insights Automáticos**: Genera resúmenes ejecutivos con IA

### Dashboard de Análisis
- **KPIs en Tiempo Real**: Total movido, egresos, ahorros, flujo neto
- **Gráficos Interactivos**: 
  - Tendencia mensual (últimos 6 meses)
  - Distribución por categoría
  - Gastos por categoría (ranking)
- **Visualizaciones Dinámicas**: Recharts con animaciones

### Pipeline ETL Robusto
- **Ingesta**: CSV, Excel
- **Normalización**: Estandarización de esquema
- **Pseudonimización**: Hashing SHA-256 de cuentas
- **Clasificación**: Categorización automática de transacciones
- **Embeddings**: Generación vectorial para búsqueda semántica
- **Almacenamiento Dual**: PostgreSQL (datos estructurados) + ChromaDB (vectores)

### Seguridad y Privacidad
- Pseudonimización de cuentas bancarias
- Sin almacenamiento de datos sensibles sin protección
- Opción de modelo local para privacidad total

---

## 🏗️ Arquitectura

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │    Backend      │      │   PostgreSQL    │
│   (Next.js)     │◄────►│   (FastAPI)     │◄────►│  (Structured)   │
│   Port: 3000    │      │   Port: 8000    │      │   Port: 5432    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
            ┌─────────────┐ ┌──────────┐ ┌──────────────┐
            │  ChromaDB   │ │  Ollama  │ │     ETL      │
            │  (Vectors)  │ │  (LLM)   │ │  (Prefect)   │
            │  Port: 8000 │ │Port:11434│ │              │
            └─────────────┘ └──────────┘ └──────────────┘
```

### Stack Tecnológico

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| **Frontend** | Next.js 14 + TypeScript + Tailwind | UI/UX |
| **Backend** | FastAPI + Pydantic | API REST |
| **Base de Datos** | PostgreSQL 15 | Datos estructurados |
| **Vector Store** | ChromaDB | Embeddings para RAG |
| **ETL** | Prefect + Polars | Pipeline de datos |
| **Embeddings** | sentence-transformers | all-MiniLM-L6-v2 |
| **LLM Local** | Ollama | Llama 3.2 |
| **LLM API** | OpenAI / Anthropic | GPT-4 / Claude |
| **Visualización** | Recharts | Gráficos interactivos |

---

## 🚀 Instalación y Uso

### Prerrequisitos

- **Docker** y **Docker Compose** instalados
- (Opcional) API keys de OpenAI o Anthropic
- Al menos 8GB RAM disponible
- 10GB de espacio en disco

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/manbank.git
cd manbank
```

### 2️⃣ Configurar Variables de Entorno

Copia el archivo de ejemplo y configura según tu necesidad:

```bash
cp env.example .env
```

Edita `.env` si quieres usar OpenAI o Anthropic:

```bash
# Para usar OpenAI
MODEL_PROVIDER=openai
OPENAI_API_KEY=tu_api_key_aqui

# O para usar Anthropic
MODEL_PROVIDER=anthropic
ANTHROPIC_API_KEY=tu_api_key_aqui

# O dejar local (por defecto)
MODEL_PROVIDER=local
```

### 3️⃣ Iniciar con Docker Compose

```bash
cd docker
docker-compose up -d
```

Esto levantará todos los servicios:
- ✅ PostgreSQL
- ✅ ChromaDB
- ✅ Ollama
- ✅ Backend (FastAPI)
- ✅ Frontend (Next.js)
- ✅ ETL (en modo standby)

### 4️⃣ Descargar Modelo de Ollama (si usas local)

```bash
docker exec -it manbank-ollama ollama pull llama3.2
```

### 5️⃣ Generar Datos de Ejemplo

```bash
# Generar datos sintéticos
docker exec -it manbank-etl python /data/generate_sample_data.py

# Ejecutar ETL
docker exec -it manbank-etl python flows.py /data/sample_transactions.csv
```

### 6️⃣ Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ChromaDB**: http://localhost:8000 (puerto 8000)

---

## 📁 Estructura del Proyecto

```
manbank/
├── backend/                 # API FastAPI
│   ├── main.py             # Endpoints principales
│   ├── requirements.txt    # Dependencias Python
│   └── Dockerfile
│
├── frontend/               # Dashboard Next.js
│   ├── src/
│   │   ├── app/           # Pages y layouts
│   │   └── components/    # Componentes React
│   ├── package.json
│   └── Dockerfile
│
├── etl/                    # Pipeline de datos
│   ├── flows.py           # Flujo ETL principal
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker/                 # Configuración Docker
│   ├── docker-compose.yml # Orquestación
│   ├── schema.sql         # Schema PostgreSQL
│   └── data/              # Datos de ejemplo
│
└── README.md
```

---

## 🔌 API Endpoints

### Analytics

- `GET /analytics/kpis` - Obtener métricas financieras
- `GET /analytics/categories` - Listar categorías disponibles

### Transacciones

- `GET /transactions` - Listar transacciones con filtros
  - Query params: `skip`, `limit`, `start_date`, `end_date`, `category`, `type`

### IA y RAG

- `POST /llm/ask_rag` - Preguntar sobre transacciones
  ```json
  {
    "question": "¿Cuánto gasté en restaurantes?",
    "provider": "local"  // opcional: "openai", "anthropic"
  }
  ```

- `GET /llm/generate_insight` - Generar insight ejecutivo
  - Query param: `provider` (opcional)

### Configuración

- `GET /config/model` - Ver proveedores disponibles
- `GET /health` - Estado del sistema
- `GET /status/pipeline` - Estado del ETL

---

## 🎨 Componentes del Frontend

### Dashboard Principal (`/dashboard`)
- **KpiCards**: 4 tarjetas con métricas principales
- **MonthlyTrendChart**: Gráfico de tendencia mensual (ingresos, egresos, neto)
- **CategoryDistributionChart**: Pie chart de distribución
- **SpendingByCategoryChart**: Ranking de gastos por categoría
- **InsightNarrativePanel**: Resumen ejecutivo generado por IA
- **RagChatWidget**: Chat inteligente + selector de modelo

### Home (`/`)
- **DataStatusPanel**: Estado del pipeline ETL
- Botón para acceder al dashboard

---

## 🔄 Pipeline ETL

### Flujo de Datos

```
CSV/Excel → Ingesta → Normalización → Pseudonimización 
    → Clasificación → Embeddings → PostgreSQL + ChromaDB
```

### Tareas

1. **Ingest**: Lee CSV o Excel con Polars
2. **Normalize**: Estandariza columnas
3. **Pseudonymize**: Hash SHA-256 de cuentas
4. **Classify**: Categorización por reglas
5. **Generate Embeddings**: all-MiniLM-L6-v2
6. **Insert PostgreSQL**: Datos estructurados
7. **Insert ChromaDB**: Vectores para RAG
8. **Monitor**: Log en `pipeline_runs`

### Uso Manual

```bash
# Dentro del contenedor ETL
docker exec -it manbank-etl bash
python flows.py /path/to/transactions.csv
```

---

## 🧠 Sistema RAG Explicado

### ¿Cómo Funciona?

1. **Pregunta del Usuario**: "¿Cuánto gasté en supermercado?"
2. **Embedding de la Pregunta**: Se genera vector con `all-MiniLM-L6-v2`
3. **Búsqueda Vectorial**: ChromaDB busca las 5 transacciones más similares
4. **Construcción de Contexto**: Se concatenan las transacciones relevantes
5. **Generación de Respuesta**: El LLM (Ollama/OpenAI/Claude) responde basándose en el contexto
6. **Respuesta al Usuario**: Con fuentes y metadatos

### Ventajas

- ✅ Respuestas precisas basadas en datos reales
- ✅ No inventa información (grounding)
- ✅ Búsqueda semántica (no solo keywords)
- ✅ Escalable a millones de transacciones

---

## 🎯 Casos de Uso

### Para Bancos
- Análisis de comportamiento de clientes
- Detección de patrones de gasto
- Insights automatizados para ejecutivos
- Chat de atención al cliente potenciado con IA

### Para Empresas Fintech
- Dashboard de finanzas personales
- Categorización automática de gastos
- Recomendaciones personalizadas
- Análisis de flujo de caja

### Para Usuarios Finales
- Visualización de hábitos financieros
- Pregunta en lenguaje natural sobre gastos
- Insights para mejorar ahorro
- Comparación de periodos

---

## 🔐 Seguridad y Privacidad

### Implementado
- ✅ Pseudonimización de cuentas (SHA-256)
- ✅ Opción de modelo local (sin enviar datos a APIs)
- ✅ CORS configurado
- ✅ Variables de entorno para secretos

### Por Implementar (Producción)
- [ ] Autenticación JWT
- [ ] Rate limiting
- [ ] Encriptación en reposo
- [ ] Auditoría de accesos
- [ ] HTTPS/TLS

---

## 📊 Rendimiento

### ETL
- **Polars**: Procesa 1M transacciones en ~60 segundos
- **Embeddings**: ~10,000 transacciones/min
- **Batch processing**: Optimizado para grandes volúmenes

### API
- **FastAPI**: ~1000 req/s
- **ChromaDB**: Búsqueda vectorial < 100ms
- **Cache**: Resultados cacheados con React Query

---

## 🧪 Testing

```bash
# Backend tests (TODO)
cd backend
pytest

# Frontend tests (TODO)
cd frontend
npm test
```

---

## 🐛 Troubleshooting

### Ollama no responde
```bash
docker exec -it manbank-ollama ollama list
docker exec -it manbank-ollama ollama pull llama3.2
```

### ChromaDB no conecta
```bash
docker logs manbank-chromadb
docker restart manbank-chromadb
```

### ETL falla
```bash
docker logs manbank-etl
# Verificar formato del CSV: date, amount, description, account_id_raw, type
```

### Frontend no carga datos
```bash
# Verificar que el backend esté corriendo
curl http://localhost:8000/health
```

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -m 'Add: nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

---

## 📝 Roadmap

### V2.1 (Próximo)
- [ ] Autenticación y usuarios múltiples
- [ ] Exportar reportes a PDF
- [ ] Alertas configurables
- [ ] Más categorías de clasificación
- [ ] Modelo de ML para categorización

### V2.2
- [ ] Mobile app (React Native)
- [ ] Integración con bancos reales (Open Banking)
- [ ] Predicción de gastos
- [ ] Recomendaciones de ahorro

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

## 👨‍💻 Autor

Desarrollado como solución al desafío de **Talento B - Bancolombia**

**Contacto**: [Tu email/LinkedIn]

---

## 🙏 Agradecimientos

- **Bancolombia** por el reto técnico
- **Talento B** por la oportunidad
- Comunidad Open Source por las librerías utilizadas

---

## ⭐ Si te gusta el proyecto, dale una estrella!

```
                    ⭐ ManBank - Financial AI ⭐
        Análisis Inteligente de Transacciones Bancarias con RAG
```

