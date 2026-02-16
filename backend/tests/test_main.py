from httpx import AsyncClient
from pathlib import Path
from pytest import mark
import sys

root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(root))

from backend.app.main import app


@mark.asyncio
async def test_healthcheck():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@mark.asyncio
async def test_research_summary():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/research-summary")
    assert response.status_code == 200
    data = response.json()
    assert "title" in data
    assert data["title"] == "Research Infographic Studio"
    assert "summary" in data
    assert data["sources"]
