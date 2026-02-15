import csv
import io
import json
import os
import textwrap
import zipfile
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import uuid4
from enum import Enum

from fastapi import FastAPI, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response, StreamingResponse
from PIL import Image, ImageDraw, ImageFont
from pydantic import BaseModel, Field, HttpUrl


def _build_default_origins() -> List[str]:
    candidates = os.getenv("ALLOWED_ORIGINS")
    defaults = ["http://localhost:3000", "http://127.0.0.1:3000"]
    if not candidates:
        return defaults
    parsed = [origin.strip() for origin in candidates.split(",") if origin.strip()]
    return parsed or defaults


app = FastAPI(title="Research Infographic Studio Backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_build_default_origins(),
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


class ResearchJobSettings(BaseModel):
    audience: Optional[str] = Field(None, description="Target audience (e.g., educators)")
    tone: Optional[str] = Field(None, description="Tone preference (e.g., conversational)")
    length: Optional[str] = Field(None, description="Length hint (e.g., short, in-depth)")
    citation_style: Optional[str] = Field(None, description="Desired citation style, e.g., APA")
    time_range: Optional[str] = Field(None, description="Time range filter for sources")
    region: Optional[str] = Field(None, description="Geographic preference")
    include_counterpoints: bool = Field(False, description="Toggle to include counterpoints")


class ResearchSource(BaseModel):
    id: str
    title: str
    publisher: str
    url: HttpUrl
    publish_date: Optional[datetime]
    accessed_at: datetime
    snippet: str
    reliability_score: float = Field(..., ge=0.0, le=1.0)
    citation_index: int = Field(..., ge=1, description="1-based citation index used throughout the article")


class ArticleSection(BaseModel):
    heading: str
    body: str
    citations: List[int]


class ArticleHighlight(BaseModel):
    text: str
    citations: List[int]


class ResearchArticle(BaseModel):
    title: str
    overview: str
    key_points: List[ArticleHighlight]
    sections: List[ArticleSection]
    confidence: str
    limitations: str
    confidence_note: str
    implications: List[ArticleHighlight]
    detailed_explanation: str


class InfographicBlock(BaseModel):
    id: str
    block_type: str
    headline: str
    description: str
    citation_ids: List[str]
    metric: Optional[str] = None


class InfographicSpec(BaseModel):
    title: str
    layout: str
    generated_at: datetime
    blocks: List[InfographicBlock]
    citation_markers: List[str]
    visual_focus: str
    callouts: List[str]


class ProvenanceRecord(BaseModel):
    id: str
    phase: str
    summary: str
    detail: Optional[str] = None
    source_ids: List[str]
    timestamp: datetime


class TrustMetadata(BaseModel):
    confidence_level: str
    confidence_note: str
    reliability_summary: str
    average_reliability_score: float = Field(..., ge=0.0, le=1.0)
    last_verified_at: datetime
    provenance: List[ProvenanceRecord]


class ProgressStep(BaseModel):
    name: str
    completed: bool
    timestamp: datetime


class SourceExportFormat(str, Enum):
    json = "json"
    csv = "csv"


class ResearchJob(BaseModel):
    job_id: str
    prompt: str
    summary: str
    status: str
    version: int
    parent_job_id: Optional[str] = None
    settings: ResearchJobSettings
    created_at: datetime
    updated_at: datetime
    started_at: datetime
    completed_at: datetime
    infographic_spec: InfographicSpec
    article: ResearchArticle
    sources: List[ResearchSource]
    trust: TrustMetadata
    progress: List[ProgressStep]


class ResearchJobSummary(BaseModel):
    job_id: str
    title: str
    status: str
    created_at: datetime
    updated_at: datetime
    prompt_snippet: str
    version: int


class ResearchJobCreate(BaseModel):
    prompt: str = Field(..., min_length=10, description="User prompt describing the research request")
    settings: Optional[ResearchJobSettings] = None
    trust_targets: Optional[List[str]] = Field(None, description="Optional target signals to highlight in trust metadata. Example: ['confidence', 'provenance']")


class ResearchJobRefine(BaseModel):
    prompt: Optional[str] = Field(None, min_length=10, description="Optional override prompt for refinements")
    settings: Optional[ResearchJobSettings] = None
    trust_targets: Optional[List[str]] = Field(None, description="Optional target signals to highlight in trust metadata. Example: ['confidence', 'provenance']")


class ResearchSummary(BaseModel):
    title: str
    highlight: str
    key_takeaways: List[str]
    sources: List[ResearchSource]
    confidence: str
    trust: TrustMetadata | None = None


class JobStore:
    def __init__(self) -> None:
        self._jobs: List[ResearchJob] = []

    def list_jobs(self) -> List[ResearchJob]:
        return sorted(self._jobs, key=lambda job: job.created_at, reverse=True)

    def list_job_summaries(self) -> List[ResearchJobSummary]:
        return [
            ResearchJobSummary(
                job_id=job.job_id,
                title=job.article.title,
                status=job.status,
                created_at=job.created_at,
                updated_at=job.updated_at,
                prompt_snippet=job.prompt[:80].strip(),
                version=job.version,
            )
            for job in self.list_jobs()
        ]

    def get_job(self, job_id: str) -> ResearchJob:
        for job in self._jobs:
            if job.job_id == job_id:
                return job
        raise KeyError(f"Job {job_id} not found")

    def clear(self) -> None:
        self._jobs.clear()

    def create_job(
        self,
        prompt: str,
        settings: ResearchJobSettings,
        trust_targets: Optional[List[str]] = None,
        parent_job: Optional[ResearchJob] = None,
    ) -> ResearchJob:
        job_id = uuid4().hex
        timestamp = datetime.utcnow()
        sources = _generate_sources(prompt)
        article = _generate_article(prompt, sources, settings)
        spec = _generate_infographic_spec(prompt, sources)
        progress = _generate_progress(timestamp)
        trust_metadata = _generate_trust_metadata(article, sources, trust_targets)
        version = parent_job.version + 1 if parent_job else 1
        parent_job_id = parent_job.job_id if parent_job else None

        job = ResearchJob(
            job_id=job_id,
            prompt=prompt,
            summary=article.overview,
            status="completed",
            version=version,
            parent_job_id=parent_job_id,
            settings=settings,
            created_at=timestamp,
            updated_at=timestamp,
            started_at=timestamp,
            completed_at=timestamp,
            infographic_spec=spec,
            article=article,
            sources=sources,
            trust=trust_metadata,
            progress=progress,
        )
        self._jobs.append(job)
        return job

    def latest_summary(self) -> Optional[ResearchSummary]:
        if not self._jobs:
            return None
        latest = self.list_jobs()[0]
        return ResearchSummary(
            title=latest.article.title,
            highlight=latest.article.overview,
            key_takeaways=latest.article.key_points[:3],
            sources=latest.sources[:3],
            confidence=latest.article.confidence,
            trust=latest.trust,
        )


JOB_STORE = JobStore()


def _topic_from_prompt(prompt: str) -> str:
    candidate = (prompt or "Research").strip()
    words = candidate.split()
    return words[0].capitalize() if words else "Research"


def _generate_sources(prompt: str) -> List[ResearchSource]:
    topic = _topic_from_prompt(prompt)
    now = datetime.utcnow()
    templates = [
        {
            "title": f"{topic}: Emerging data trends in sustainability",
            "publisher": "Global Insights",
            "snippet": f"An in-depth look at how {topic.lower()} is shaping the current sustainability conversation.",
        },
        {
            "title": f"What practitioners are saying about {topic}",
            "publisher": "Field Notes"
            ,
            "snippet": f"Practitioners provide use cases and counterpoints for {topic.lower()} implementations.",
        },
        {
            "title": f"Benchmarking {topic} across industries",
            "publisher": "Benchmark Review",
            "snippet": f"Benchmark data highlights where {topic.lower()} adoption is accelerating.",
        },
    ]

    sources: List[ResearchSource] = []
    for idx, template in enumerate(templates, start=1):
        publish_date = now - timedelta(days=idx * 3)
        source = ResearchSource(
            id=f"src-{idx}",
            title=template["title"],
            publisher=template["publisher"],
            url=HttpUrl(f"https://example.com/{topic.lower()}-insight-{idx}"),
            publish_date=publish_date,
            accessed_at=now,
            snippet=template["snippet"],
            reliability_score=round(0.65 + idx * 0.1, 2),
            citation_index=idx,
        )
        sources.append(source)
    return sources


def _generate_article(prompt: str, sources: List[ResearchSource], settings: ResearchJobSettings) -> ResearchArticle:
    topic = _topic_from_prompt(prompt)
    title = f"{topic} Intelligence"
    overview = (
        f"A concise summary of {topic.lower()} research generated for {settings.audience or 'general'} readers."
    )
    key_points = [
        ArticleHighlight(
            text=f"{sources[0].publisher} highlights that {topic.lower()} maturity is accelerating in sustainability programs.",
            citations=[sources[0].citation_index],
        ),
        ArticleHighlight(
            text=f"{sources[1].publisher} emphasizes people + process adaptations when teams pair AI insights with change management.",
            citations=[sources[1].citation_index],
        ),
        ArticleHighlight(
            text=f"{sources[2].publisher} provides benchmark data that quantifies {topic.lower()} adoption impact across industries.",
            citations=[sources[2].citation_index],
        ),
    ]
    detailed_explanation = (
        f"The research synthesizes practitioner stories, benchmark data, and expert analysis to explain why {topic.lower()} momentum is higher where adoption is paired with governance and executive sponsorship."
    )
    confidence = "High confidence based on corroborated reports and expert summaries."
    limitations = (
        "Forecasts rely on published sources and may not reflect the very latest announcements or proprietary datasets."
    )
    confidence_note = (
        "Confidence stays high because multiple independent publishers report the same macro trends, but the timeline and impact estimates remain tentative until more public data is released."
    )
    implications = [
        ArticleHighlight(
            text=f"Research and strategy teams can reuse the shared article + infographic to brief stakeholders on {topic.lower()} progress with citations ready for export.",
            citations=[sources[1].citation_index],
        ),
        ArticleHighlight(
            text=f"Benchmarking outcomes from {sources[2].publisher} justify experimenting with lightweight pilots before scaling to portfolio-wide programs.",
            citations=[sources[2].citation_index],
        ),
    ]
    source_indices = [source.citation_index for source in sources]
    sections = [
        ArticleSection(
            heading="Overview",
            body=overview,
            citations=[sources[0].citation_index],
        ),
        ArticleSection(
            heading="Key points",
            body=f"The key takeaways above capture how practitioners, change leaders, and benchmark data describe the path to {topic.lower()}.",
            citations=source_indices[:3],
        ),
        ArticleSection(
            heading="Detailed explanation",
            body=detailed_explanation,
            citations=source_indices[:3],
        ),
        ArticleSection(
            heading="Implications / applications",
            body="Teams can adopt the proactive planning, governance checkpoints, and measurement routines documented in the sources list.",
            citations=source_indices[1:3],
        ),
        ArticleSection(
            heading="Limitations / uncertainties",
            body=limitations,
            citations=[sources[2].citation_index],
        ),
        ArticleSection(
            heading="Sources",
            body="Consult the enumerated sources below for URLs, snippets, and publishing context.",
            citations=source_indices,
        ),
    ]
    return ResearchArticle(
        title=title,
        overview=overview,
        key_points=key_points,
        sections=sections,
        confidence=confidence,
        limitations=limitations,
        confidence_note=confidence_note,
        implications=implications,
        detailed_explanation=detailed_explanation,
    )


def _generate_infographic_spec(prompt: str, sources: List[ResearchSource]) -> InfographicSpec:
    topic = _topic_from_prompt(prompt)
    layout = "timeline" if len(prompt) % 2 == 0 else "comparison"
    now = datetime.utcnow()
    blocks = []
    for idx, source in enumerate(sources, start=1):
        blocks.append(
            InfographicBlock(
                id=f"block-{idx}",
                block_type="stat_card" if idx % 2 else "callout",
                headline=f"{source.publisher} takeaway",
                description=source.snippet,
                citation_ids=[source.id],
                metric=f"{70 + idx * 5}%" if idx % 2 else None,
            )
        )
    callouts = [
        f"{sources[0].snippet[:50]}... [{sources[0].id}]",
        f"{sources[1].snippet[:50]}... [{sources[1].id}]",
    ]
    citation_markers = [f"[{idx}]" for idx in range(1, len(sources) + 1)]
    return InfographicSpec(
        title=f"{topic} Snapshot",
        layout=layout,
        generated_at=now,
        blocks=blocks,
        citation_markers=citation_markers,
        visual_focus=f"Visualizing {topic.lower()} momentum",
        callouts=callouts,
    )


def _confidence_label(average_score: float) -> str:
    if average_score >= 0.9:
        return "Very high confidence"
    if average_score >= 0.75:
        return "High confidence"
    if average_score >= 0.6:
        return "Moderate confidence"
    return "Cautious confidence"


def _generate_provenance_records(
    sources: List[ResearchSource],
    trust_targets: Optional[List[str]],
) -> List[ProvenanceRecord]:
    now = datetime.utcnow()
    source_ids = [source.id for source in sources]
    summary_suffix = (
        f" Priority signals: {', '.join(trust_targets)}."
        if trust_targets
        else ""
    )
    steps = [
        (
            "Source acquisition",
            "Gathered initial source set aligned with the prompt.",
            source_ids,
        ),
        (
            "Article synthesis",
            "Linked the most reliable claims to the narrative and citations.",
            source_ids[:2] or source_ids,
        ),
        (
            "Infographic generation",
            "Mapped insights and citations into the infographic layout.",
            source_ids[1:] or source_ids,
        ),
    ]
    records: List[ProvenanceRecord] = []
    for index, (phase, summary, ids) in enumerate(steps, start=1):
        records.append(
            ProvenanceRecord(
                id=f"prov-{index}",
                phase=phase,
                summary=f"{summary}{summary_suffix}",
                detail=(
                    "Source metadata was validated for reliability signals."
                    if phase == "Source acquisition"
                    else None
                ),
                source_ids=ids or source_ids,
                timestamp=now + timedelta(seconds=index * 3),
            )
        )
    return records


def _generate_trust_metadata(
    article: ResearchArticle,
    sources: List[ResearchSource],
    trust_targets: Optional[List[str]],
) -> TrustMetadata:
    now = datetime.utcnow()
    average_score = (
        sum(source.reliability_score for source in sources) / len(sources)
        if sources
        else 0.0
    )
    rounded_average = max(0.0, min(round(average_score, 2), 1.0))
    reliability_summary = (
        f"Average reliability score across {len(sources)} sources: {average_score:.2f}."
    )
    if trust_targets:
        reliability_summary += f" Highlighted signals: {', '.join(trust_targets)}."
    return TrustMetadata(
        confidence_level=_confidence_label(average_score),
        confidence_note=article.confidence_note,
        reliability_summary=reliability_summary,
        average_reliability_score=rounded_average,
        last_verified_at=now,
        provenance=_generate_provenance_records(sources, trust_targets),
    )


def _generate_progress(start: datetime) -> List[ProgressStep]:
    stages = ["Queued", "Researching", "Writing", "Rendering", "Completed"]
    steps = []
    for index, stage in enumerate(stages):
        steps.append(
            ProgressStep(
                name=stage,
                completed=True,
                timestamp=start + timedelta(seconds=index * 5),
            )
        )
    return steps


def _format_citation_tags(citations: List[int]) -> str:
    return " ".join(f"[{citation}]" for citation in citations) if citations else ""


def _build_article_markdown(article: ResearchArticle, sources: List[ResearchSource]) -> str:
    lines: List[str] = []
    lines.append(f"# {article.title}")
    lines.append("")
    lines.append(f"**Confidence:** {article.confidence}")
    lines.append("")
    lines.append(article.overview)
    lines.append("")

    lines.append("## Key points")
    for point in article.key_points:
        citation_text = _format_citation_tags(point.citations)
        lines.append(f"- {point.text} {citation_text}".strip())
    lines.append("")

    lines.append("## Detailed explanation")
    lines.append(article.detailed_explanation)
    lines.append(_format_citation_tags(article.sections[2].citations) if len(article.sections) > 2 else "")
    lines.append("")

    lines.append("## Implications / applications")
    for implication in article.implications:
        citation_text = _format_citation_tags(implication.citations)
        lines.append(f"- {implication.text} {citation_text}".strip())
    lines.append("")

    lines.append("## Confidence / uncertainty notes")
    lines.append(article.confidence_note)
    lines.append("")

    lines.append("## Limitations / uncertainties")
    lines.append(article.limitations)
    lines.append("")

    lines.append("## Structured narrative")
    for section in article.sections:
        lines.append(f"### {section.heading}")
        lines.append(section.body)
        citations_text = _format_citation_tags(section.citations)
        if citations_text:
            lines.append(f"Citations: {citations_text}")
        lines.append("")

    lines.append("## Sources")
    for source in sources:
        publish_date = source.publish_date.isoformat() if source.publish_date else "Unknown"
        lines.append(
            f"- [{source.citation_index}] {source.title} ({source.publisher})"
        )
        lines.append(
            f"  * URL: {source.url} | Published: {publish_date} | Accessed: {source.accessed_at.isoformat()} | Reliability: {source.reliability_score}"
        )
        lines.append(f"  * {source.snippet}")
        lines.append("")

    return "\n".join(line for line in lines if line is not None).strip()


def _build_sources_csv(sources: List[ResearchSource]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "citation_index",
        "id",
        "title",
        "publisher",
        "url",
        "publish_date",
        "accessed_at",
        "snippet",
        "reliability_score",
    ])
    for source in sources:
        writer.writerow([
            source.citation_index,
            source.id,
            source.title,
            source.publisher,
            source.url,
            source.publish_date.isoformat() if source.publish_date else "",
            source.accessed_at.isoformat(),
            source.snippet,
            source.reliability_score,
        ])
    return output.getvalue()


def _build_shareable_package(job: ResearchJob) -> io.BytesIO:
    buffer = io.BytesIO()
    article_markdown = _build_article_markdown(job.article, job.sources)
    infographic_json = json.dumps(jsonable_encoder(job.infographic_spec), ensure_ascii=False, indent=2)
    sources_json = json.dumps(jsonable_encoder(job.sources), ensure_ascii=False, indent=2)
    trust_json = json.dumps(jsonable_encoder(job.trust), ensure_ascii=False, indent=2)
    sources_csv = _build_sources_csv(job.sources)

    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("article.md", article_markdown)
        archive.writestr("infographic.json", infographic_json)
        archive.writestr("sources.json", sources_json)
        archive.writestr("sources.csv", sources_csv)
        archive.writestr("trust.json", trust_json)

    buffer.seek(0)
    return buffer


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


def _build_placeholder_trust(source_id: str = "src-placeholder") -> TrustMetadata:
    now = datetime.utcnow()
    return TrustMetadata(
        confidence_level="Medium confidence",
        confidence_note="No jobs have shipped yet; trust metadata will populate once a research job runs.",
        reliability_summary="Waiting for user submissions to generate live sources and citations.",
        average_reliability_score=0.5,
        last_verified_at=now,
        provenance=[
            ProvenanceRecord(
                id="prov-placeholder",
                phase="Placeholder",
                summary="No research jobs have run yet.",
                detail="Submit a prompt to see provenance from source acquisition, synthesis, and rendering.",
                source_ids=[source_id],
                timestamp=now,
            )
        ],
    )


@app.get("/research-summary", response_model=ResearchSummary)
async def research_summary() -> ResearchSummary:
    summary = JOB_STORE.latest_summary()
    if summary:
        return summary

    placeholder_source = ResearchSource(
        citation_index=1,
        id="src-placeholder",
        title="Research Infographic Studio placeholder",
        publisher="Research Lab",
        url=HttpUrl("https://example.com/research-summary"),
        publish_date=datetime.utcnow() - timedelta(days=10),
        accessed_at=datetime.utcnow(),
        snippet="A placeholder source reminding users about the Research Infographic Studio vision.",
        reliability_score=0.5,
    )
    return ResearchSummary(
        title="Research Infographic Studio",
        highlight="A placeholder summary designed to remind users of the Research Infographic Studio vision.",
        key_takeaways=["Infographics + articles + sources delivered as one job."],
        sources=[placeholder_source],
        confidence="Medium",
        trust=_build_placeholder_trust(placeholder_source.id),
    )


@app.post("/research-jobs", response_model=ResearchJob)
async def create_research_job(payload: ResearchJobCreate) -> ResearchJob:
    if not payload.prompt.strip():
        raise HTTPException(status_code=422, detail="Prompt cannot be empty")
    settings = payload.settings or ResearchJobSettings()
    job = JOB_STORE.create_job(
        payload.prompt.strip(),
        settings,
        trust_targets=payload.trust_targets,
        parent_job=None,
    )
    return job


@app.get("/research-jobs", response_model=List[ResearchJobSummary])
async def list_research_jobs() -> List[ResearchJobSummary]:
    return JOB_STORE.list_job_summaries()


@app.get("/research-jobs/{job_id}", response_model=ResearchJob)
async def get_research_job(job_id: str) -> ResearchJob:
    try:
        return JOB_STORE.get_job(job_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.get("/research-jobs/{job_id}/package")
async def download_shareable_package(job_id: str) -> StreamingResponse:
    try:
        job = JOB_STORE.get_job(job_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    buffer = _build_shareable_package(job)
    filename = f"research-{job.job_id}-package.zip"
    headers = {"Content-Disposition": f"attachment; filename=\"{filename}\""}
    return StreamingResponse(buffer, media_type="application/zip", headers=headers)
