"""
Script para generar datos sintéticos de transacciones bancarias
Uso: python generate_sample_data.py
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Configuración
NUM_TRANSACTIONS = 5000
START_DATE = datetime(2024, 1, 1)
END_DATE = datetime(2024, 12, 31)
NUM_ACCOUNTS = 50

# Categorías y descripciones típicas
TRANSACTION_TEMPLATES = {
    'Nómina': {
        'descriptions': [
            'Pago de nómina',
            'Salario mensual',
            'Pago quincenal',
            'Salary payment',
        ],
        'type': 'inflow',
        'amount_range': (2500000, 8000000),
        'frequency': 'monthly'
    },
    'Supermercado': {
        'descriptions': [
            'Compra en Éxito',
            'Supermercado Carulla',
            'Olimpica Supermarket',
            'Compra en Jumbo',
            'Mercado semanal',
        ],
        'type': 'outflow',
        'amount_range': (50000, 400000),
        'frequency': 'weekly'
    },
    'Restaurantes': {
        'descriptions': [
            'Restaurante El Corral',
            'Comida Frisby',
            'Almuerzo ejecutivo',
            'Dominos Pizza',
            'Restaurante Juan Valdez',
        ],
        'type': 'outflow',
        'amount_range': (20000, 150000),
        'frequency': 'high'
    },
    'Transporte': {
        'descriptions': [
            'Uber viaje',
            'Taxi',
            'Gasolina Terpel',
            'Estación de servicio',
            'Peaje',
            'Transporte público',
        ],
        'type': 'outflow',
        'amount_range': (5000, 80000),
        'frequency': 'high'
    },
    'Servicios': {
        'descriptions': [
            'Pago servicios públicos',
            'Factura de luz',
            'Pago de agua',
            'Servicio de internet',
            'Telefonía móvil',
        ],
        'type': 'outflow',
        'amount_range': (50000, 300000),
        'frequency': 'monthly'
    },
    'Transferencia': {
        'descriptions': [
            'Transferencia a terceros',
            'Envío de dinero',
            'Transferencia PSE',
            'Pago a proveedor',
        ],
        'type': 'outflow',
        'amount_range': (100000, 2000000),
        'frequency': 'medium'
    },
    'savings': {
        'descriptions': [
            'Ahorro programado',
            'Transferencia a cuenta de ahorros',
            'Inversión CDT',
            'Ahorro mensual',
        ],
        'type': 'inflow',
        'amount_range': (200000, 1500000),
        'frequency': 'monthly'
    },
    'Otros': {
        'descriptions': [
            'Compra en línea',
            'Pago tarjeta de crédito',
            'Retiro cajero',
            'Comisión bancaria',
            'Seguro',
        ],
        'type': 'outflow',
        'amount_range': (10000, 500000),
        'frequency': 'medium'
    }
}

def generate_date(start, end, frequency):
    """Genera fechas según la frecuencia"""
    days_between = (end - start).days
    
    if frequency == 'monthly':
        # 1-2 veces por mes
        num_transactions = random.randint(8, 12)
    elif frequency == 'weekly':
        # 1-2 veces por semana
        num_transactions = random.randint(40, 80)
    elif frequency == 'high':
        # Varias veces por semana
        num_transactions = random.randint(80, 150)
    else:  # medium
        num_transactions = random.randint(20, 50)
    
    dates = []
    for _ in range(num_transactions):
        random_days = random.randint(0, days_between)
        random_date = start + timedelta(days=random_days)
        dates.append(random_date)
    
    return dates

def generate_transactions():
    """Genera el dataset completo de transacciones"""
    transactions = []
    
    # Generar IDs de cuentas
    account_ids = [f"ACC{str(i).zfill(5)}" for i in range(1, NUM_ACCOUNTS + 1)]
    
    for category, config in TRANSACTION_TEMPLATES.items():
        dates = generate_date(START_DATE, END_DATE, config['frequency'])
        
        for date in dates:
            account_id = random.choice(account_ids)
            description = random.choice(config['descriptions'])
            
            # Generar monto con distribución realista
            min_amount, max_amount = config['amount_range']
            
            # Usar distribución log-normal para montos más realistas
            mu = np.log(min_amount + (max_amount - min_amount) / 2)
            sigma = 0.5
            amount = np.random.lognormal(mu, sigma)
            amount = max(min_amount, min(max_amount, amount))
            
            # Redondear a miles
            amount = round(amount / 1000) * 1000
            
            # Para outflows, hacer el monto negativo
            if config['type'] == 'outflow':
                amount = -abs(amount)
            else:
                amount = abs(amount)
            
            transactions.append({
                'date': date.strftime('%Y-%m-%d'),
                'amount': amount,
                'description': description,
                'account_id_raw': account_id,
                'type': config['type']
            })
    
    # Crear DataFrame y ordenar por fecha
    df = pd.DataFrame(transactions)
    df = df.sort_values('date').reset_index(drop=True)
    
    # Limitar al número deseado de transacciones
    if len(df) > NUM_TRANSACTIONS:
        df = df.sample(n=NUM_TRANSACTIONS).sort_values('date').reset_index(drop=True)
    
    return df

def main():
    print("🚀 Generando datos sintéticos de transacciones bancarias...")
    print(f"   Número de transacciones: {NUM_TRANSACTIONS}")
    print(f"   Período: {START_DATE.date()} a {END_DATE.date()}")
    print(f"   Número de cuentas: {NUM_ACCOUNTS}")
    
    # Generar datos
    df = generate_transactions()
    
    # Guardar CSV
    output_file = 'sample_transactions.csv'
    df.to_csv(output_file, index=False, encoding='utf-8')
    
    print(f"\n✅ Datos generados exitosamente!")
    print(f"   Archivo: {output_file}")
    print(f"   Total de registros: {len(df)}")
    
    # Estadísticas
    print("\n📊 Estadísticas:")
    print(f"   Ingresos: {len(df[df['type'] == 'inflow'])} transacciones")
    print(f"   Egresos: {len(df[df['type'] == 'outflow'])} transacciones")
    print(f"   Total ingresos: ${df[df['amount'] > 0]['amount'].sum():,.0f}")
    print(f"   Total egresos: ${abs(df[df['amount'] < 0]['amount'].sum()):,.0f}")
    print(f"   Balance neto: ${df['amount'].sum():,.0f}")
    
    print("\n   Categorías:")
    for category, config in TRANSACTION_TEMPLATES.items():
        count = len([t for t in df['description'] if any(desc in t for desc in config['descriptions'])])
        print(f"   - {category}: {count} transacciones")
    
    print("\n🎉 ¡Listo! Puedes usar este archivo en el ETL pipeline.")

if __name__ == "__main__":
    main()

