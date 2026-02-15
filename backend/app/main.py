import os
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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


class ArticleSection(BaseModel):
    heading: str
    body: str
    citations: List[str]


class ResearchArticle(BaseModel):
    title: str
    overview: str
    key_points: List[str]
    sections: List[ArticleSection]
    confidence: str
    limitations: str


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


class ProgressStep(BaseModel):
    name: str
    completed: bool
    timestamp: datetime


class ResearchJob(BaseModel):
    job_id: str
    prompt: str
    summary: str
    status: str
    version: int
    settings: ResearchJobSettings
    created_at: datetime
    updated_at: datetime
    started_at: datetime
    completed_at: datetime
    infographic_spec: InfographicSpec
    article: ResearchArticle
    sources: List[ResearchSource]
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


class ResearchSummary(BaseModel):
    title: str
    highlight: str
    key_takeaways: List[str]
    sources: List[ResearchSource]
    confidence: str


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

    def create_job(self, prompt: str, settings: ResearchJobSettings) -> ResearchJob:
        job_id = uuid4().hex
        timestamp = datetime.utcnow()
        sources = _generate_sources(prompt)
        article = _generate_article(prompt, sources, settings)
        spec = _generate_infographic_spec(prompt, sources)
        progress = _generate_progress(timestamp)

        job = ResearchJob(
            job_id=job_id,
            prompt=prompt,
            summary=article.overview,
            status="completed",
            version=1,
            settings=settings,
            created_at=timestamp,
            updated_at=timestamp,
            started_at=timestamp,
            completed_at=timestamp,
            infographic_spec=spec,
            article=article,
            sources=sources,
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
            url=HttpUrl(f"https://example.com/{topic.lower()}-insight-{idx}", scheme="https"),
            publish_date=publish_date,
            accessed_at=now,
            snippet=template["snippet"],
            reliability_score=round(0.65 + idx * 0.1, 2),
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
        f"Top insight from {sources[0].publisher} [{sources[0].id}]: {sources[0].snippet}",
        f"Context from {sources[1].publisher} [{sources[1].id}] helps explain adoption cadence.",
        f"Benchmarking data from {sources[2].publisher} [{sources[2].id}] surfaces measurable impact."
    ]
    sections = [
        ArticleSection(
            heading="Overview",
            body=f"{overview} The prompt emphasized {prompt.lower()} and the need for shareable visuals.",
            citations=[sources[0].id],
        ),
        ArticleSection(
            heading="Key insights",
            body="""
Analyzed sources reveal a pattern of accelerated adoption when teams pair AI planning with strong change management.
""",
            citations=[sources[1].id, sources[2].id],
        ),
        ArticleSection(
            heading="Confidence & limitations",
            body="""
Confidence is high for macro trends because multiple publishers align, but the timeline depends on emerging regulations.
""",
            citations=[sources[0].id, sources[2].id],
        ),
    ]
    limitations = (
        "Forecasts rely on published sources and may not reflect the very latest announcements or proprietary datasets."
    )
    confidence = "High confidence based on corroborated reports and expert summaries."
    return ResearchArticle(
        title=title,
        overview=overview,
        key_points=key_points,
        sections=sections,
        confidence=confidence,
        limitations=limitations,
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


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/research-summary", response_model=ResearchSummary)
async def research_summary() -> ResearchSummary:
    summary = JOB_STORE.latest_summary()
    if summary:
        return summary

    placeholder_source = ResearchSource(
        id="src-placeholder",
        title="Research Infographic Studio placeholder",
        publisher="Research Lab",
        url=HttpUrl("https://example.com/research-summary", scheme="https"),
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
    )


@app.post("/research-jobs", response_model=ResearchJob)
async def create_research_job(payload: ResearchJobCreate) -> ResearchJob:
    if not payload.prompt.strip():
        raise HTTPException(status_code=422, detail="Prompt cannot be empty")
    settings = payload.settings or ResearchJobSettings()
    job = JOB_STORE.create_job(payload.prompt.strip(), settings)
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
