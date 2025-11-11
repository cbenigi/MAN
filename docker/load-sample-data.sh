#!/bin/bash
# Script para cargar datos de prueba en PostgreSQL (Mac/Linux)
# Uso: ./load-sample-data.sh

echo ""
echo "========================================"
echo " MANBANK - Cargando Datos de Prueba"
echo "========================================"
echo ""

# Verificar que Docker esté corriendo
if ! docker ps &> /dev/null; then
    echo "❌ ERROR: Docker no está corriendo."
    echo "   Por favor inicia Docker primero."
    exit 1
fi

# Verificar que el contenedor exista y esté corriendo
if ! docker ps --format "{{.Names}}" | grep -q "manbank-postgres"; then
    echo "❌ ERROR: El contenedor manbank-postgres no está corriendo."
    echo "   Por favor ejecuta: docker compose up -d"
    exit 1
fi

echo "📦 Cargando datos de prueba en PostgreSQL..."
echo ""

# Cargar el archivo SQL
docker exec -i manbank-postgres psql -U user -d manbank < seed_data.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo " ✅ Datos cargados exitosamente!"
    echo "========================================"
    echo ""
    echo "Puedes verificar los datos con:"
    echo "  docker exec -it manbank-postgres psql -U user -d manbank"
    echo ""
    echo "Luego ejecuta:"
    echo "  SELECT COUNT(*) FROM transactions;"
    echo ""
else
    echo ""
    echo "❌ ERROR: Hubo un problema al cargar los datos."
    echo ""
    exit 1
fi

