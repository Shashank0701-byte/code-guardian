console.log("🛡️ Code Guardian is watching...");

async function scanPage() {
    const lines = document.querySelectorAll('.react-file-line, .blob-code-inner');
    if (lines.length === 0) return;

    let packagesToSend = [];
    let lineMap = new Map();

    lines.forEach((lineElement) => {
        const text = lineElement.innerText.trim();
        const match = text.match(/^([a-zA-Z0-9-_]+)(?:[=<>]+([0-9.]+))?/);
        if (match) {
            const pkgName = match[1];
            const pkgVersion = match[2];
            const fullString = match[0]; // e.g., "celery" or "celery==5.0"
            lineMap.set(fullString, lineElement);

            if (pkgVersion) {
                packagesToSend.push(fullString);
            } else {
                console.log(`⚠️ Missing version for ${pkgName}`);
                paintRow(lineElement, "#fff8c5", "orange", `⚠️ Missing version for ${pkgName}. Cannot scan.`);
            }
        }
    });

    if (packagesToSend.length === 0) {
        console.log("No versioned packages found to scan.");
        return;
    }
    console.log("1. Sending these packages to Backend:", packagesToSend);
    try {
        const response = await fetch("http://127.0.0.1:8000/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ packages: packagesToSend })
        });
        const data = await response.json();
        highlightVulnerabilities(data.results, lineMap);
    } catch (error) {
        console.error("❌ ERROR talking to backend:", error);
    }
}
function paintRow(element, bgColor, borderColor, message) {
    const row = element.closest('.react-file-line') || element.closest('.blob-code-inner') || element;

    if (row.dataset.guardianActive) return;
    row.dataset.guardianActive = "true"; // Mark as painted

    row.style.setProperty("background-color", bgColor, "important");
    row.style.setProperty("border", `2px solid ${borderColor}`, "important");
    row.style.setProperty("display", "block", "important");

    const warning = document.createElement("b");
    warning.innerText = ` ${message}`;
    warning.style.color = borderColor; // Text color matches border
    warning.style.marginLeft = "10px";
    warning.style.fontSize = "12px";
    warning.style.backgroundColor = "white";
    warning.style.padding = "2px 5px";
    
    row.appendChild(warning);
}
function highlightVulnerabilities(results, lineMap) {
    results.forEach(result => {
        if (result.status === "VULNERABLE") {
            for (let [codeStr, element] of lineMap.entries()) {
                // Simple check
                if (codeStr.includes(result.package) && codeStr.includes(result.version)) {
                    paintRow(element, "#ffebe9", "red", `🚫 ${result.details.substring(0, 60)}...`);
                }
            }
        }
    });
}

setTimeout(scanPage, 3000);