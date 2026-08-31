from fastapi import FastAPI

app = FastAPI(title="API SEDES Lab")

@app.get("/")
def leer_raiz():
    return {"mensaje": "¡El backend del SEDES está funcionando perfectamente!"}