from fastapi import APIRouter, HTTPException, Request
import pyodbc
from pyodbc import Cursor

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

@router.put("/alterar/item")
async def alterar_item(request: Request):
    data = await request.json()
    sistema = data.get("sistema")
    usuario = data.get("usuario")
    senha = data.get("senha")
    id_item = data.get("id")
    status = str(data.get("status"))
    descricao = data.get("descricao")
    grupo = data.get("grupo")
    subgrupo = data.get("subgrupo")
    tipo_validade = data.get("tipovalidade")
    validade = data.get("validade")
    tem_garantia = data.get("temgarantia")
    garantia = data.get("garantia")

    if tipo_validade is None or tipo_validade == 0:
        validade = 0
    if tem_garantia is None or tem_garantia == 0:
        garantia = 0


    if not sistema or not usuario or not senha or not id_item:
        raise HTTPException(status_code=400, detail="Campos 'sistema', 'usuario', 'senha', 'id_item' são obrigatórios")

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
                query = f"""
                    UPDATE ITEM
                    SET
                    DATAALTERACAO = GETDATE(),
                    USUARIOALTERACAO = {id_user}
                    """
                query += f", DESCRICAO = '{descricao}'" if descricao else ""
                query += f", GRUPO = {grupo}" if grupo else ""
                query += f", SUBGRUPO = {subgrupo}" if subgrupo else ""
                query += f", TIPOVALIDADE = {tipo_validade}" if tipo_validade else ""
                query += f", VALIDADE = {validade}" if validade else ""
                query += f", TEMGARANTIA = {tem_garantia}" if tem_garantia else ""
                query += f", GARANTIA = {garantia}" if garantia else ""
                query += f", SITUACAO = {status}" if status in ["0", "1"] else ""
                query += f" WHERE ITEM = {id_item};"
                cursor.execute(query)
                conn.commit()
                return {
                    "mensagem": f"Item alterado com sucesso no id {id_item}",
                    "status": 1,
                    "id": id_item
                }
            except pyodbc.Error as e:
                raise HTTPException(status_code=500, detail=f"Erro ao inserir item no banco: {str(e)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao consultar o banco: {str(row) + " " + str(e)}")
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass



