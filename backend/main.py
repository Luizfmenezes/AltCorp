# main.py
import importlib.util
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Middleware para habilitar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ou ["*"] para liberar geral (não recomendado em produção)
    allow_credentials=True,
    allow_methods=["*"],  # Permite POST, GET, OPTIONS, etc.
    allow_headers=["*"],  # Permite todos os cabeçalhos
)

# Carrega endpoints da pasta "endpoints"
def load_endpoints():
    pasta = os.path.join(os.path.dirname(__file__), "endpoints")
    for nome_arquivo in os.listdir(pasta):
        if nome_arquivo.endswith(".py"):
            caminho = os.path.join(pasta, nome_arquivo)
            nome_modulo = f"endpoints.{nome_arquivo[:-3]}"
            spec = importlib.util.spec_from_file_location(nome_modulo, caminho)
            modulo = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(modulo)
            if hasattr(modulo, "router"):
                app.include_router(modulo.router)

load_endpoints()
