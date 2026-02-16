import io
import json
import zipfile
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
async def test_product_info_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/product-info")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Research Infographic Studio"
    assert data["tagline"]
    assert len(data["features"]) >= 3
    assert data["success_metrics"]
    assert data["system_architecture"]


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
    article = job_data["article"]
    sources = job_data["sources"]
    citation_indexes = [source["citation_index"] for source in sources]
    assert citation_indexes == sorted(citation_indexes)
    assert citation_indexes == list(range(1, len(sources) + 1))
    assert len(sources) >= 5
    for source in sources:
        assert source["publisher"]
        assert source["url"].startswith("https://")
        assert source["snippet"]
        assert source.get("publish_date")
        assert source.get("accessed_at")
        reliability = source.get("reliability_score")
        assert isinstance(reliability, float)
        assert 0.0 <= reliability <= 1.0
    assert article["detailed_explanation"]
    assert article["confidence_note"]
    assert article["implications"]
    assert job_data["trust"]["confidence_level"]
    assert job_data["trust"]["provenance"]
    expected_headings = {
        "Overview",
        "Key points",
        "Detailed explanation",
        "Implications / applications",
        "Confidence / uncertainty notes",
        "Limitations / uncertainties",
        "Sources",
    }
    headings = {section["heading"] for section in article["sections"]}
    assert expected_headings.issubset(headings)
    for section in article["sections"]:
        for citation in section["citations"]:
            assert citation in citation_indexes
            assert citation >= 1 and citation <= len(citation_indexes)
    for highlight in article["key_points"] + article["implications"]:
        for citation in highlight["citations"]:
            assert citation in citation_indexes

    async with AsyncClient(app=app, base_url="http://test") as client:
        list_response = await client.get("/research-jobs")
    assert list_response.status_code == 200
    assert list_response.json()
    job_id = job_data["job_id"]

    async with AsyncClient(app=app, base_url="http://test") as client:
        detail_response = await client.get(f"/research-jobs/{job_id}")
    assert detail_response.status_code == 200
    assert detail_response.json()["job_id"] == job_id

    async with AsyncClient(app=app, base_url="http://test") as client:
        package_response = await client.get(f"/research-jobs/{job_id}/package")
    assert package_response.status_code == 200
    assert package_response.headers["content-type"] == "application/zip"

    async with AsyncClient(app=app, base_url="http://test") as client:
        cached_response = await client.get(f"/research-jobs/{job_id}/package")
    assert cached_response.status_code == 200
    assert cached_response.headers["content-type"] == "application/zip"

    assert package_response.content == cached_response.content

    buffer = io.BytesIO(package_response.content)
    with zipfile.ZipFile(buffer) as archive:
    assert "article.md" in names
    assert "infographic.json" in names
    assert "infographic.png" in names
    assert "sources.json" in names
    assert "sources.csv" in names

    buffer.seek(0)
    with zipfile.ZipFile(buffer) as archive:
        with archive.open("article.md") as article_file:
            article_text = article_file.read().decode("utf-8")
    assert job_data["article"]["title"] in article_text

    buffer.seek(0)
    with zipfile.ZipFile(buffer) as archive:
        with archive.open("infographic.png") as png_file:
            png_bytes = png_file.read()
    assert png_bytes.startswith(b"\x89PNG\r\n\x1a\n")

    buffer.seek(0)
    with zipfile.ZipFile(buffer) as archive:
        with archive.open("sources.csv") as csv_file:
            csv_content = csv_file.read().decode("utf-8")
    assert "citation_index" in csv_content

    buffer.seek(0)
    with zipfile.ZipFile(buffer) as archive:
        with archive.open("article.md") as article_file:
            article_with_cached = article_file.read().decode("utf-8")
    assert job_data["article"]["title"] in article_with_cached
