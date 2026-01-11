console.log("🛡️ Code Guardian is watching...");

async function scanPage() {
    const lines = document.querySelectorAll('.react-file-line, .blob-code-inner');
    if (lines.length === 0) return;

    let packages = [];
    let lineMap = new Map();

    lines.forEach((lineElement) => {
        const text = lineElement.innerText.trim();
        const match = text.match(/^([a-zA-Z0-9-_]+)[=<>]+([0-9.]+)/);
        if (match) {
            packages.push(match[0]);
            lineMap.set(match[0], lineElement); 
        }
    });

    if (packages.length === 0) return;

    console.log("1. Sending these packages to Backend:", packages);

    try {
        const response = await fetch("http://127.0.0.1:8000/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ packages: packages })
        });

        const data = await response.json();
        console.log("2. Backend Replied:", data); // <--- CRITICAL CHECK
        
        highlightVulnerabilities(data.results, lineMap);

    } catch (error) {
        console.error("❌ ERROR talking to backend:", error);
    }
}

// HELPER: Nuclear Option for Painting
function highlightVulnerabilities(results, lineMap) {
    console.log("3. Starting to highlight...");
    
    results.forEach(result => {
        if (result.status === "VULNERABLE") {
            console.log(`---> Found VULNERABLE package: ${result.package}`);
            
            for (let [codeStr, element] of lineMap.entries()) {
                const matchName = codeStr.includes(result.package);
                const matchVer = codeStr.includes(result.version);
                
                if (matchName && matchVer) {
                    console.log(`✅ MATCH! Painting RED on: ${codeStr}`);
                    
                    // 1. Target the Container (The Row)
                    // If 'element' is just a span, find the main row div
                    const row = element.closest('.react-file-line') || element.closest('.blob-code-inner') || element;
                    
                    // 2. THE NUCLEAR STYLE (Overwrites everything)
                    row.style.setProperty("background-color", "#ffebe9", "important");
                    row.style.setProperty("border", "3px solid red", "important");
                    row.style.setProperty("display", "block", "important"); // Ensures it takes up space
                    
                    // 3. Add the Warning Text
                    // Check if we already added a warning to avoid duplicates
                    if (!row.querySelector(".guardian-warning")) {
                        const warning = document.createElement("b");
                        warning.className = "guardian-warning"; // Tag it so we don't add it twice
                        warning.innerText = ` 🚫 ${result.details.substring(0, 50)}...`; // Shorten text
                        warning.style.color = "red";
                        warning.style.marginLeft = "10px";
                        warning.style.fontSize = "14px";
                        warning.style.backgroundColor = "white";
                        warning.style.padding = "2px 5px";
                        
                        row.appendChild(warning);
                    }
                }
            }
        }
    });
}

setTimeout(scanPage, 3000);