# Code Guardian

Code Guardian is a full-stack security tool designed to democratize vulnerability scanning. It functions as a browser extension that performs real-time security audits on GitHub repositories by parsing dependency files (such as `requirements.txt`) and cross-referencing them against the Open Source Vulnerabilities (OSV) database.

## Architecture

The system follows a distributed client-server architecture:

1.  **Client (Chrome Extension):**
    * Injects a content script into GitHub pages.
    * Parses the DOM to extract dependency specifications using Regex.
    * Performs initial validation (e.g., checking for missing version numbers).
    * Asynchronously dispatches valid dependencies to the backend API.
    * Modifies the DOM to render visual alerts (Red for critical vulnerabilities, Yellow for warnings).

2.  **Server (FastAPI/Python):**
    * Hosted on Render (Cloud Platform).
    * Receives batch requests from the client.
    * **Optimization:** Implements asynchronous parallel processing using `asyncio` and `httpx`. This allows the server to query the OSV database for multiple packages concurrently, significantly reducing latency compared to sequential processing.
    * Returns a structured JSON report detailing CVEs, severity, and summary.

## Key Features

* **Real-Time Auditing:** Instantly scans `requirements.txt` files upon page load.
* **Asynchronous Processing:** Utilizes non-blocking I/O to handle multiple dependency checks simultaneously.
* **Granular Feedback:** Distinguishes between known vulnerabilities (CVEs) and configuration warnings (e.g., unpinned versions).
* **Cross-Origin Resource Sharing (CORS):** configured to allow secure communication between the browser context and the cloud API.

## Tech Stack

* **Backend:** Python 3.10+, FastAPI, Uvicorn, HTTPX (Async Client).
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+), Chrome Extensions API (Manifest V3).
* **Infrastructure:** Render (Cloud Hosting), Git/GitHub (Version Control).
* **Data Source:** OSV.dev API (Open Source Vulnerabilities Database).

## Installation

### 1. The Browser Extension (Client)
1.  Clone this repository.
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Enable **Developer Mode** in the top right corner.
4.  Click **Load unpacked** and select the `extension/` directory from this project.
5.  The extension is now active globally on GitHub.

### 2. The Backend API (Optional - Local Development)
If you wish to run the server locally instead of using the cloud instance:

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload

Note: You must update content.js to point to http://127.0.0.1:8000/scan for local testing.

Usage
Navigate to any GitHub repository containing a requirements.txt file.

Wait for the scan to complete (approx. 1-2 seconds).

View the results directly in the code viewer:

Red Border: Indicates a known vulnerability. Hover or check the line end for CVE details.

Yellow Border: Indicates a best-practice violation (e.g., missing version constraint).

Future Roadmap
Support for package.json (Node.js) and go.mod (Go).

Caching layer (Redis) to store frequently scanned packages and reduce API latency.

CI/CD integration to automatically block pull requests with vulnerable dependencies.

License
MIT