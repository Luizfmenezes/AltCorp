from fastapi import APIRouter, HTTPException, Request
import pyodbc
from pyodbc import Cursor
import json

DATABASE_SISTEMA = {
    'driver': 'ODBC Driver 17 for SQL Server',
    'server': 'SRVSQL',
    'database': 'ERP_HOMOLOG',
    'username': 'erp.api',
    'password': '3Rp4p!069'
}

router = APIRouter()


conn_str = (
    f"DRIVER={{{DATABASE_SISTEMA['driver']}}};"
    f"SERVER={DATABASE_SISTEMA['server']};"
    f"DATABASE={DATABASE_SISTEMA['database']};"
    f"UID={DATABASE_SISTEMA['username']};"
    f"PWD={DATABASE_SISTEMA['password']};"
)

if __name__ == "__main__":
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    cursor.execute("SELECT DESCRICAO AS GRUPO FROM GRUPOITEM;")
    result = cursor.fetchall()
    grupos = []
    for grupo in result:
        grupos.append(grupo[0])
    print(grupos)
    cursor.close()
    conn.close()