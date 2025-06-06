from fastapi import APIRouter, HTTPException, Request
import pyodbc
from config import DATABASE_CONFIG

router = APIRouter()

def get_connection():
    conn_str = (
        f"DRIVER={{{DATABASE_CONFIG['driver']}}};"
        f"SERVER={DATABASE_CONFIG['server']};"
        f"DATABASE={DATABASE_CONFIG['database']};"
        f"UID={DATABASE_CONFIG['username']};"
        f"PWD={DATABASE_CONFIG['password']}"
    )
    return pyodbc.connect(conn_str)

@router.post("/autenticar")
async def consulta_usuario(request: Request):
    data = await request.json()
    sistema = data.get("sistema")
    usuario = data.get("usuario")
    senha = data.get("senha")

    if not sistema or not usuario or not senha:
        raise HTTPException(status_code=400, detail="Campos 'sistema', 'usuario' e 'senha' são obrigatórios")

    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
            SELECT [STATUS] 
            FROM AUTH 
            WHERE SISTEMA = ? AND USUARIO = ? AND SENHA = ?
        """
        cursor.execute(query, (sistema, usuario, senha))
        row = cursor.fetchone()

        if row is None:
            return {
                "mensagem": "Usuario ou senha incorretos",
                "status": 0
            }

        elif row[0] == 0:
            return {
                "mensagem": "Usuario bloqueado ou indisponivel",
                "status": 0
            }
        else:
            return {
                "mensagem": "Usuario logado com sucesso",
                "status": 1,
                "admin": 1
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao consultar o banco: {str(e)}")
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass
