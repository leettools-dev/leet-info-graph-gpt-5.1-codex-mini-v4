from datetime import datetime

from httpx import AsyncClient
from pytest import mark

from backend.app.main import app, JOB_STORE


@mark.asyncio
async def test_healthcheck():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@mark.asyncio
async def test_research_summary_placeholder():
    JOB_STORE.clear()
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/research-summary")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Research Infographic Studio"
    assert data["confidence"] == "Medium"
    assert data["sources"][0]["publisher"] == "Research Lab"


@mark.asyncio
async def test_research_job_flow():
    JOB_STORE.clear()
    payload = {"prompt": "Future of renewable energy grid", "settings": {"audience": "Analysts"}}
    async with AsyncClient(app=app, base_url="http://test") as client:
        create_response = await client.post("/research-jobs", json=payload)
    assert create_response.status_code == 200
    job_data = create_response.json()
    assert job_data["prompt"].startswith("Future")
    assert job_data["infographic_spec"]["layout"] in ("timeline", "comparison")
    assert job_data["article"]["sections"]

    async with AsyncClient(app=app, base_url="http://test") as client:
        list_response = await client.get("/research-jobs")
    assert list_response.status_code == 200
    assert list_response.json()
    job_id = job_data["job_id"]

    async with AsyncClient(app=app, base_url="http://test") as client:
        detail_response = await client.get(f"/research-jobs/{job_id}")
    assert detail_response.status_code == 200
    assert detail_response.json()["job_id"] == job_id
