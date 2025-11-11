@echo off
REM Script para cargar datos de prueba en PostgreSQL (Windows)
REM Uso: load-sample-data.bat

echo.
echo ========================================
echo  MANBANK - Cargando Datos de Prueba
echo ========================================
echo.

REM Verificar que Docker este corriendo
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no esta corriendo.
    echo Por favor inicia Docker Desktop primero.
    pause
    exit /b 1
)

REM Verificar que el contenedor de Postgres exista
docker ps -a --format "{{.Names}}" | findstr /C:"manbank-postgres" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: El contenedor manbank-postgres no existe.
    echo Por favor ejecuta: docker compose up -d
    pause
    exit /b 1
)

REM Verificar que el contenedor este corriendo
docker ps --format "{{.Names}}" | findstr /C:"manbank-postgres" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: El contenedor manbank-postgres no esta corriendo.
    echo Por favor ejecuta: docker compose up -d
    pause
    exit /b 1
)

echo Cargando datos de prueba en PostgreSQL...
echo.

docker exec -i manbank-postgres psql -U user -d manbank < seed_data.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo  Datos cargados exitosamente!
    echo ========================================
    echo.
    echo Puedes verificar los datos con:
    echo   docker exec -it manbank-postgres psql -U user -d manbank
    echo.
    echo Luego ejecuta:
    echo   SELECT COUNT(*^) FROM transactions;
    echo.
) else (
    echo.
    echo ERROR: Hubo un problema al cargar los datos.
    echo.
)

pause

