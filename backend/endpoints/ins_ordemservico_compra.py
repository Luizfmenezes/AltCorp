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

@router.post("/inserir/ordemservico_compra")
async def consulta_usuario(request: Request):
    data = await request.json()
    sistema = data.get("sistema")
    usuario = data.get("usuario")
    senha = data.get("senha")
    status = data.get("status")
    tipo = data.get("tipo")
    obs = data.get("obs")
    solicitacaoservico = data.get("solicitacaoservico")
    status_ss = solicitacaoservico["status"]
    tipo_ss = solicitacaoservico["tipo"]
    cliente_ss = solicitacaoservico["cliente"]
    descricao_ss = solicitacaoservico["descricao"]
    margemlucro_ss = solicitacaoservico["margemlucro"] / 100
    itens_ss = solicitacaoservico["itens"]
    cliente_info = solicitacaoservico["cliente_info"]

    if not sistema or not usuario or not senha:
        raise HTTPException(status_code=400, detail="Campos 'sistema', 'usuario' e 'senha' são obrigatórios")

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
            if cliente_ss == False:
                try:
                    query = "INSERT INTO CLIENTE (NOME, TIPO, CPFCNPJ, CEP, TELEFONE, EMAIL, USUARIOCRIACAO) OUTPUT INSERTED.CLIENTE VALUES (?, ?, ?, ?, ?, ?, ?)"
                    valores = (
                        cliente_info["nome"],
                        cliente_info["tipo"],
                        cliente_info["cpfcnpj"] or None,
                        cliente_info["cep"] or None,
                        cliente_info["telefone"] or None,
                        cliente_info["email"] or None,
                        id_user
                    )
                    cursor.execute(query, valores)
                    linha = cursor.fetchone()
                    if linha is None:
                        raise HTTPException(status_code=500,detail="erro de insert")
                    else:
                        id_cliente = linha[0]
                except pyodbc.Error as e:
                    raise HTTPException(status_code=500, detail=f"Erro ao inserir cliente no banco: {str(e)}")
            else:
                id_cliente = cliente_ss

            try:
                query = "INSERT INTO SOLICITACAOSERVICO (TIPO, STATUS, ATENDENTE, CLIENTE, DESCRICAO, MARGEMLUCRO, USUARIOCRIACAO) OUTPUT INSERTED.SOLICITACAOSERVICO VALUES (?, ?, ?, ?, ?, ?, ?)"
                valores = (tipo_ss, status_ss, cliente_ss, id_cliente, descricao_ss, margemlucro_ss, id_user)

                cursor.execute(query, valores)
                linha = cursor.fetchone()
                if linha is None:
                    raise HTTPException(status_code=500,detail="erro de insert")
                else:
                    id_ss = linha[0]
            except pyodbc.Error as e:
                raise HTTPException(status_code=500, detail=f"Erro ao inserir solicitação de serviço no banco: {str(e)}")

            try:
                query = "INSERT INTO ITENSSS (SOLICITACAOSERVICO, ITEM, QUANTIDADE, TIPO) VALUES (?, ?, ?, ?)"
                for item in itens_ss:
                    valores = (id_ss, item["item"], item["quantidade"], item["tipo"])
                    cursor.execute(query, valores)
            except pyodbc.Error as e:
                raise HTTPException(status_code=500,detail=f"Erro ao inserir itens no banco: {str(e)}")
            
            try:
                valoritens = 0
                query = "SELECT TOP 1 VALOR FROM VALORITEM WHERE ITEM = ? ORDER BY DATACRIACAO DESC"
                for item in itens_ss:
                    cursor.execute(query, item["item"])
                    linha = cursor.fetchone()
                    if linha is None:
                        raise HTTPException(status_code=500,detail="erro de select")
                    else:
                        valoritens += linha[0] * item["quantidade"]

                valormaodeobra = valoritens * margemlucro_ss
                valoritens = round(valoritens, 2)
                valormaodeobra = round(valormaodeobra, 2)
                valortotal = valoritens + valormaodeobra
            except pyodbc.Error as e:
                raise HTTPException(status_code=500, detail=f"Erro ao consultar valor do item no banco: {str(e)}")

            try:
                query = """
                INSERT INTO ORDEMSERVICO (
                    SOLICITACAOSERVICO, STATUS, TIPO, OBS,
                    VALORMAODEOBRA, VALORITENS, VALORTOTAL,
                    USUARIOCRIACAO
                )
                OUTPUT INSERTED.ORDEMSERVICO
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)"""
                valores = (
                    id_ss,
                    status,
                    tipo,
                    obs,
                    valormaodeobra,
                    valoritens,
                    valortotal,
                    id_user
                )
                cursor.execute(query, valores)
                linha = cursor.fetchone()
                if linha is None:
                    raise HTTPException(status_code=500,detail="erro de insert")
                else:
                    conn.commit()
                    return {
                        "mensagem": f"venda registrada com sucesso no id {linha[0]}",
                        "status": 1,
                        "id": linha[0]
                    }
            except pyodbc.Error as e:
                raise HTTPException(status_code=500, detail=f"Erro ao inserir ordem de serviço no banco: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao consultar o banco: {str(row) + " " + str(e)}")
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass



