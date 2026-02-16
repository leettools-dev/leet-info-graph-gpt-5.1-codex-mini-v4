import io
import json
import zipfile
from datetime import datetime

from httpx import AsyncClient
from pathlib import Path
from pytest import mark
import sys

root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(root))

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
        names = archive.namelist()
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
    assert "## Confidence / uncertainty notes" in article_text
    assert job_data["article"]["confidence_note"] in article_text
    assert "## Sources" in article_text
    for source in sources:
        citation_marker = f"- [{source['citation_index']}]"
        assert citation_marker in article_text
    for citation_index in citation_indexes:
        assert f"[{citation_index}]" in article_text

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
        with archive.open("sources.json") as sources_file:
            sources_json = json.load(sources_file)
    assert isinstance(sources_json, list)
    assert len(sources_json) == len(sources)
    source_lookup = {source["citation_index"]: source for source in sources}
    for entry in sources_json:
        assert entry["citation_index"] in source_lookup
        reference = source_lookup[entry["citation_index"]]
        assert entry["title"] == reference["title"]
        assert entry["publisher"] == reference["publisher"]
        assert entry["url"] == reference["url"]
        assert entry["snippet"] == reference["snippet"]
        assert entry["publish_date"] == reference["publish_date"]
        assert entry["accessed_at"] == reference["accessed_at"]
        assert entry["reliability_score"] == reference["reliability_score"]
        assert entry["publish_date"]
        assert entry["accessed_at"]
        assert 0.0 <= entry["reliability_score"] <= 1.0

    trust = job_data["trust"]
    assert trust["confidence_note"] == job_data["article"]["confidence_note"]
    provenance_records = trust["provenance"]
    assert provenance_records
    source_ids_set = {source["id"] for source in sources}
    for record in provenance_records:
        assert record["source_ids"]
        assert set(record["source_ids"]).issubset(source_ids_set)

    buffer.seek(0)
    with zipfile.ZipFile(buffer) as archive:
        with archive.open("trust.json") as trust_file:
            trust_json = json.load(trust_file)
    assert trust_json == trust

    buffer.seek(0)
    with zipfile.ZipFile(buffer) as archive:
        with archive.open("article.md") as article_file:
            article_with_cached = article_file.read().decode("utf-8")
    assert job_data["article"]["title"] in article_with_cached

    async with AsyncClient(app=app, base_url="http://test") as client:
        infographic_response = await client.get(f"/research-jobs/{job_id}/infographic")
    assert infographic_response.status_code == 200
    assert infographic_response.headers["content-type"] == "image/png"
    assert infographic_response.content.startswith(b"\x89PNG\r\n\x1a\n")

    async with AsyncClient(app=app, base_url="http://test") as client:
        article_response = await client.get(f"/research-jobs/{job_id}/article")
    assert article_response.status_code == 200
    assert article_response.headers["content-type"].startswith("text/markdown")
    assert job_data["article"]["title"] in article_response.text


@mark.asyncio
async def test_refine_creates_new_version():
    JOB_STORE.clear()
    payload = {"prompt": "Future of renewable energy grid", "settings": {"audience": "Analysts"}}
    async with AsyncClient(app=app, base_url="http://test") as client:
        create_response = await client.post("/research-jobs", json=payload)
    assert create_response.status_code == 200
    original_job = create_response.json()
    job_id = original_job["job_id"]

    refined_payload = {"prompt": "Refined focus on storage+grid resilience", "settings": {"audience": "Leaders"}}
    async with AsyncClient(app=app, base_url="http://test") as client:
        refine_response = await client.post(f"/research-jobs/{job_id}/refine", json=refined_payload)
    assert refine_response.status_code == 200
    refined_job = refine_response.json()
    assert refined_job["parent_job_id"] == job_id
    assert refined_job["version"] == original_job["version"] + 1
    assert refined_job["prompt"] == refined_payload["prompt"]
    assert refined_job["settings"]["audience"] == refined_payload["settings"]["audience"]
    assert refined_job["user_id"] == original_job["user_id"]
    assert refined_job["article"]
    assert refined_job["infographic_spec"]
    assert refined_job["sources"]
    assert refined_job["shareable_package_ready"] is True
    assert refined_job["trust"]["confidence_note"] == refined_job["article"]["confidence_note"]
