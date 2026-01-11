import httpx # Swap requests for httpx
import re

# Notice "async" before def
async def check_vulnerability(package_line, client):
    match = re.search(r'([a-zA-Z0-9-_]+)[=<>]+([0-9.]+)', package_line)
    
    if not match:
        return {"package": package_line, "status": "Unknown Format"}
    
    name = match.group(1)
    version = match.group(2)
    
    url = "https://api.osv.dev/v1/query"
    payload = {
        "version": version,
        "package": {"name": name, "ecosystem": "PyPI"}
    }
    
    # Async request (doesn't block other checks)
    try:
        response = await client.post(url, json=payload)
        data = response.json()
        
        if "vulns" in data:
            return {
                "package": name,
                "version": version,
                "status": "VULNERABLE",
                "count": len(data["vulns"]),
                "details": data["vulns"][0]["summary"] 
            }
        
        return {"package": name, "version": version, "status": "SAFE"}
        
    except Exception as e:
        return {"package": name, "status": "ERROR", "details": str(e)}