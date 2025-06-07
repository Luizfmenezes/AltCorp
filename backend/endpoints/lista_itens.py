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

@router.post("/lista/itens")
async def consulta_usuario(request: Request):
    data = await request.json()
    sistema = data.get("sistema")
    usuario = data.get("usuario")
    senha = data.get("senha")
    pagina = data.get("pagina")
    filtrar = data.get("filtros") or {}
    f_nome = filtrar.get("nome") if "nome" in filtrar else None
    f_id = filtrar.get("id") if "id" in filtrar else None
    f_grupo = filtrar.get("grupo") if "grupo" in filtrar else None
    f_subgrupo = filtrar.get("subgrupo") if "subgrupo" in filtrar else None
    f_status = str(filtrar.get("status")) if "status" in filtrar and filtrar.get("status") in [0, 1] else None

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
                filtros = ""
                filtros += " AND [NOME] LIKE '%" + f_nome + "%'" if f_nome else ""
                filtros += " AND [ID] = " + str(f_id) if f_id else ""
                filtros += " AND [GRUPO] LIKE '%" + f_grupo + "%'" if f_grupo else ""
                filtros += " AND [SUBGRUPO] LIKE '%" + f_subgrupo + "%'" if f_subgrupo else ""
                filtros += " AND [STATUS] = '" + str(f_status) + "'" if f_status in ["0", "1"] else ""
                filtros = filtros if filtros and filtros != "" else None
                qtd_por_pagina = 30
                offset = (pagina - 1) * qtd_por_pagina

                query = f"""
                    SELECT
                    *
                    FROM [GET_ITENS]
                    WHERE 1 = 1
                        {filtros if filtros else ""}
                    ORDER BY [NOME] ASC
                    OFFSET ? ROWS
                    FETCH NEXT ? ROWS ONLY;
                """
                valores = (offset, qtd_por_pagina)

                cursor.execute(query, valores)
                dados = cursor.fetchall()
                if dados is None:
                    return {
                        "mensagem": "Nenhum item encontrado",
                        "status": 0
                        }
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



