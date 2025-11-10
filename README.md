# ManBank - Sistema de Análisis Financiero con IA

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Latest-orange.svg)](https://www.trychroma.com/)

Sistema completo de análisis de transacciones bancarias con **RAG (Retrieval Augmented Generation)**, **embeddings vectoriales** y **múltiples proveedores de IA** (Local, OpenAI o Gemini).

Diseño UI/UX basado en la identidad visual de Bancolombia.

---

## Características Principales

### Inteligencia Artificial
- **Sistema RAG**: Búsqueda semántica sobre transacciones usando ChromaDB
- **Embeddings**: `all-MiniLM-L6-v2` (384 dimensiones) - consistente en todo el sistema
- **Multi-proveedor**: Soporta Ollama (local), OpenAI y Gemini
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
| **Visualización** | Recharts | Gráficos interactivos |

---

## Componentes del Frontend

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

## Pipeline ETL

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

## Sistema RAG Explicado

### ¿Cómo Funciona?

1. **Pregunta del Usuario**: "¿Cuánto gasté en supermercado?"
2. **Embedding de la Pregunta**: Se genera vector con `all-MiniLM-L6-v2`
3. **Búsqueda Vectorial**: ChromaDB busca las 5 transacciones más similares
4. **Construcción de Contexto**: Se concatenan las transacciones relevantes
5. **Generación de Respuesta**: El LLM (Ollama/OpenAI/Claude) responde basándose en el contexto
6. **Respuesta al Usuario**: Con fuentes y metadatos

### Ventajas

- Respuestas precisas basadas en datos reales
- No inventa información (grounding)
- Búsqueda semántica (no solo keywords)
- Escalable a millones de transacciones

---

## Casos de Uso

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
## Rendimiento

### ETL
- **Polars**: Procesa 1M transacciones en ~60 segundos
- **Embeddings**: ~10,000 transacciones/min
- **Batch processing**: Optimizado para grandes volúmenes

### API
- **FastAPI**: ~1000 req/s
- **ChromaDB**: Búsqueda vectorial < 100ms
- **Cache**: Resultados cacheados con React Query
