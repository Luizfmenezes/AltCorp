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

@router.post("/inserir/notafiscal")
async def consulta_usuario(request: Request):
    data = await request.json()
    sistema = data.get("sistema")
    usuario = data.get("usuario")
    senha = data.get("senha")
    status = data.get("status")
    nf = data.get("nf")
    valorbruto = data.get("valorbruto")
    datacompra = data.get("datacompra")
    obs = data.get("obs")
    itens = data.get("itens")

    if not sistema or not usuario or not senha:
        raise HTTPException(status_code=400, detail="Campos 'sistema', 'usuario' e 'senha' são obrigatórios")

    try:
        conn = get_connection(1)
        cursor = conn.cursor()

        query = """
            SELECT [STATUS],[ID]
            FROM AUTH 
            WHERE SISTEMA = ? AND USUARIO = ? AND SENHA = ?
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

                query = """
                INSERT INTO NOTAFISCAL (STATUS,NF,VALORBRUTO,DATAENTRADA,DATACOMPRA,OBS,DATACRIACAO,USUARIOCRIACAO)
                OUTPUT INSERTED.NOTAFISCAL
                VALUES (?, ?, ?, getdate(), ?, ?, getdate(), ?)
                """

                cursor.execute(query, (1,nf, valorbruto, datacompra, obs, id_user))
                linha = cursor.fetchone()
                if linha is None:
                    raise HTTPException(status_code=500,detail="erro de insert")
                else:
                    id = linha[0]

            except pyodbc.Error as e:
                raise HTTPException(status_code=500, detail=f"Erro ao inserir nota no banco: {str(e)}")

            try:
                for n,item in enumerate(itens):
                    num = n + 1
                    item_id = item["item"]
                    status_item = item["status"]
                    qtd_item = item["qtd"]
                    tipofaturamento = item["tipofaturamento"]
                    if tipofaturamento == 1:
                        faturamento = "VALORUNITARIO"
                    else:
                        faturamento = "VALORCONJUNTO"
                    valorfaturamento = item["valorfaturamento"]
                    obs = item["obs"]

                    query = f"""
                        INSERT into ITENSNOTA (NOTAFISCAL,ITEM,NUM,STATUS,QUANTIDADE,TIPOFATURAMENTO, {faturamento},OBS)
                        VALUES (?,?,?,?,?,?,?,?)
                        """

                    cursor.execute(query,(id,item_id,num,status_item,qtd_item,tipofaturamento,valorfaturamento,obs))

                conn.commit()
                return {
                    "mensagem": "Nota inserida com sucesso",
                    "status": 1
                }

            except pyodbc.Error as e:
                raise HTTPException(status_code=500,detail=f"Erro ao inserir itens no banco: {str(e)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao consultar o banco: {str(row) + " " + str(e)}")
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass
