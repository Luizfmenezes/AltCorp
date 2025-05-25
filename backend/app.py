from fastapi import FastAPI, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou especifique o domínio ex: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Usuário de exemplo (substitua depois por um banco)
USERS = {"admin": "123456"}

@app.post("/login")
async def login(username: str = Form(...), password: str = Form(...)):
    if username in USERS and USERS[username] == password:
        return {"success": True, "message": "Login bem-sucedido!"}
    else:
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos.")
