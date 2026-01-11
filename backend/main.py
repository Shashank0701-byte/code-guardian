from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from scanner import check_vulnerability
from fastapi.middleware.cors import CORSMiddleware
import asyncio 
import httpx 

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
async def scan_packages(request: PackageCheckRequest):
    async with httpx.AsyncClient() as client:
        tasks = []
        for pkg in request.packages:
            # Instead of waiting, we add the job to a list
            tasks.append(check_vulnerability(pkg, client))
        results = await asyncio.gather(*tasks)
        
    return {"results": results}