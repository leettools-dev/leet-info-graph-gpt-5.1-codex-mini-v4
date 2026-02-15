from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(title="Research Infographic Studio Backend")


@app.get("/health")
async def healthcheck():
    return {"status": "ok"}


@app.get("/research-summary")
async def research_summary():
    return {
        "title": "Research Infographic Studio",
        "summary": "A placeholder summary designed to remind users of the Research Infographic Studio vision.",
        "sources": [
            {"id": 1, "title": "Placeholder Source", "url": "https://example.com"}
        ],
        "confidence": "high",
    }
