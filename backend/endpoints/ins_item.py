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

@router.post("/inserir/item")
async def consulta_usuario(request: Request):
    data = await request.json()
    sistema = data.get("sistema")
    usuario = data.get("usuario")
    senha = data.get("senha")
    status = data.get("status")
    descricao = data.get("descricao")
    grupo = data.get("grupo")
    grupoinfo = data.get("grupoinfo")
    subgrupo = data.get("subgrupo")
    subgrupoinfo = data.get("subgrupoinfo")
    tipo_validade = data.get("tipovalidade")
    validade = data.get("validade")
    tem_garantia = data.get("temgarantia")
    garantia = data.get("garantia")


    if not sistema or not usuario or not senha or not status or not descricao:
        raise HTTPException(status_code=400, detail="Campos 'sistema', 'usuario', 'senha', 'status' e 'descricao' são obrigatórios")

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
                query = "SELECT ITEM FROM ITEM WHERE DESCRICAO = ?"
                cursor.execute(query, (descricao,))
                row = cursor.fetchone()
                if row is not None:
                    return {
                        "mensagem": f"Item já cadastrado com id {row[0]}",
                        "status": 0,
                        "id": row[0]
                    }
            except pyodbc.Error as e:
                raise HTTPException(status_code=500, detail=f"Erro ao consultar item de item no banco: {str(e)}")

            if grupo == False:
                try:
                    query = "INSERT INTO GRUPOITEM (STATUS,DESCRICAO,EXIGEAPROVACAO,USUARIOCRIACAO) OUTPUT inserted.GRUPOITEM VALUES (?,?,?,?)"
                    valores = (
                        grupoinfo["status"],
                        grupoinfo["descricao"],
                        grupoinfo["exigeaprovacao"],
                        id_user
                    )

                    cursor.execute(query, valores)
                    linha = cursor.fetchone()
                    if linha is None:
                        raise HTTPException(status_code=500,detail="erro de insert")
                    else:
                        grupo = linha[0]

                except pyodbc.Error as e:
                    raise HTTPException(status_code=500, detail=f"Erro ao inserir grupo de item no banco: {str(e)}")

            if subgrupo == False:
                try:
                    query = "INSERT INTO SUBGRUPOITEM (STATUS,DESCRICAO,USUARIOCRIACAO,GRUPOITEM) OUTPUT inserted.SUBGRUPOITEM VALUES (?,?,?,?)"
                    valores = (
                        subgrupoinfo["status"],
                        subgrupoinfo["descricao"],
                        id_user,
                        grupo
                    )

                    cursor.execute(query, valores)
                    linha = cursor.fetchone()
                    if linha is None:
                        raise HTTPException(status_code=500,detail="erro de insert")
                    else:
                        subgrupo = linha[0]

                except pyodbc.Error as e:
                    raise HTTPException(status_code=500, detail=f"Erro ao inserir subgrupo de item no banco: {str(e)}")

            try:
                query = "INSERT INTO ITEM (DESCRICAO,GRUPOITEM,SUBGRUPOITEM,TIPOVALIDADE,VALIDADE,TEMGARANTIA,GARANTIA,USUARIOCRIACAO) OUTPUT INSERTED.ITEM VALUES (?,?,?,?,?,?,?,?)"
                valores = (descricao, grupo, subgrupo, tipo_validade, validade, tem_garantia, garantia, id_user)

                cursor.execute(query, valores)
                linha = cursor.fetchone()
                if linha is None:
                    raise HTTPException(status_code=500,detail="erro de insert")
                else:
                    id_item = linha[0]
                    conn.commit()
                    return {
                        "mensagem": f"Item registrado com sucesso no id {id_item}",
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



