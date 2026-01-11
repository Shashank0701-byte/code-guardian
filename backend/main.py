from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from scanner import check_vulnerability
from fastapi.middleware.cors import CORSMiddleware 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PackageCheckRequest(BaseModel):
    packages: List[str]

@app.post("/scan")
def scan_packages(request: PackageCheckRequest):
    results = []
    for pkg in request.packages:
        report = check_vulnerability(pkg)
        results.append(report)
    return {"results": results}