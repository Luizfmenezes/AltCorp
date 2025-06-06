from fastapi import APIRouter, HTTPException, Request
import pyodbc
from pyodbc import Cursor
import json

from config import DATABASE_CONFIG,DATABASE_SISTEMA

router = APIRouter()

def get_connection(db):
    if db == 1:
        conn_str = (
            f"DRIVER={{{DATABASE_CONFIG['driver']}}};"
            f"SERVER={DATABASE_CONFIG['server']};"
            f"DATABASE={DATABASE_CONFIG['database']};"
            f"UID={DATABASE_CONFIG['username']};"
            f"PWD={DATABASE_CONFIG['password']}"
        )
    elif db == 2:
        conn_str = (
            f"DRIVER={{{DATABASE_SISTEMA['driver']}}};"
            f"SERVER={DATABASE_SISTEMA['server']};"
            f"DATABASE={DATABASE_SISTEMA['database']};"
            f"UID={DATABASE_SISTEMA['username']};"
            f"PWD={DATABASE_SISTEMA['password']};"
        )
    else:
        conn_str = None
    return pyodbc.connect(conn_str)

@router.post("/lista/estoque")
async def consulta_usuario(request: Request):
    data = await request.json()
    sistema = data.get("sistema")
    usuario = data.get("usuario")
    senha = data.get("senha")
    pagina = data.get("pagina")

    if not sistema or not usuario or not senha or not pagina:
        raise HTTPException(status_code=400, detail="Campos 'sistema', 'usuario', 'senha' e 'pagina' são obrigatórios")

    try:
        conn = get_connection(1)
        cursor = conn.cursor()

        query = """
            SELECT [STATUS],[ID]
            FROM AUTH 
            WHERE SISTEMA = ? AND USUARIO = ? AND SENHA COLLATE Latin1_General_CS_AI = ?
        """
        cursor.execute(query, (sistema, usuario, senha))
        row = cursor.fetchone()
        if row is None:
            auth = None
        else:
            auth = row[0]
            id_user = row[1]

        if auth is None:
            return {
                "mensagem": "Usuario ou senha incorretos",
                "status": 0
            }
        elif auth == 0:
            return {
                "mensagem": "Usuario bloqueado ou indisponivel",
                "status": 0
            }

        if auth == 1:
            try:
                conn.close()
                conn = get_connection(2)
                cursor = conn.cursor()
            except pyodbc.OperationalError:
                raise HTTPException(status_code=500,detail="Erro ao conectar no banco de sistema")

            try:
                qtd_por_pagina = 25
                offset = (pagina - 1) * qtd_por_pagina
                query = """SELECT [nome item], [nome subgrupo], [nome grupo], ITEM [id], ESTOQUE FROM ESTOQUE_V1
                    ORDER BY ITEM asc
                    OFFSET ? ROWS
                    FETCH NEXT ? ROWS ONLY;"""
                valores = (offset, qtd_por_pagina)

                cursor.execute(query, valores)
                dados = cursor.fetchall()
                if dados is None:
                    raise HTTPException(status_code=500,detail="erro ao consultar o banco de dados")
                else:
                    columns = [col[0] for col in cursor.description]
                    data = [dict(zip(columns, row)) for row in dados]
                    return data
            except pyodbc.Error as e:
                raise HTTPException(status_code=500, detail=f"Erro ao inserir subgrupo de item no banco: {str(e)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao consultar o banco: {str(row) + " " + str(e)}")
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass



