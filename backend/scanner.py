import requests
import re  # Import Regex library

def check_vulnerability(package_line):
    # 1. Parsing with Regex
    # Look for: (Package Name) followed by (Operator like ==, >=) followed by (Version Number)
    match = re.search(r'([a-zA-Z0-9-_]+)[=<>]+([0-9.]+)', package_line)
    
    if not match:
        return {"package": package_line, "status": "Unknown Format"}
    
    name = match.group(1)
    version = match.group(2)
    
    # 2. Ask OSV API
    url = "https://api.osv.dev/v1/query"
    payload = {
        "version": version,
        "package": {
            "name": name,
            "ecosystem": "PyPI"
        }
    }
    
    response = requests.post(url, json=payload).json()
    
    if "vulns" in response:
        return {
            "package": name,
            "version": version,
            "status": "VULNERABLE",
            "count": len(response["vulns"]),
            "details": response["vulns"][0]["summary"] 
        }
    
    return {
        "package": name, 
        "version": version, 
        "status": "SAFE"
    }