from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import re

app = FastAPI(
    title="City Life AI & NLP Service",
    description="Microservice for urban complaint classification, automated incident triage, and semantic text extraction.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ComplaintRequest(BaseModel):
    title: str
    description: str

class ComplaintClassificationResponse(BaseModel):
    predictedCategory: str
    confidence: float
    processingStatus: str
    extractedEntities: List[str]

CATEGORY_RULES = {
    'Road accident': ['accident', 'crash', 'collision', 'hit and run', 'injury', 'skid', 'ambulance', 'overturned'],
    'Dangerous road': ['pothole', 'open manhole', 'broken road', 'cave in', 'crater', 'ditch', 'damaged asphalt'],
    'Poor street lighting': ['dark', 'street light', 'streetlight', 'no light', 'pitch black', 'bulb', 'dim', 'lamp off'],
    'Harassment or public disturbance': ['harassment', 'eve teasing', 'catcalling', 'loud noise', 'brawl', 'fight', 'drunk', 'stalking'],
    'Flooding': ['flood', 'water level', 'river overflow', 'submerged', 'inundated', 'deluge'],
    'Waterlogging': ['waterlogged', 'water puddles', 'clogged drain', 'rain water', 'blocked gutter'],
    'Suspicious activity': ['theft', 'burglary', 'vandalism', 'suspicious person', 'loitering', 'drug'],
    'Infrastructure hazard': ['fallen tree', 'hanging wire', 'electric pole', 'transformer spark', 'broken bridge', 'wall collapse']
}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "City Life FastAPI NLP Classifier",
        "engine": "Pydantic + Rule/Corpus NLP Classifier v1.0",
        "version": "1.0.0"
    }

@app.post("/classify", response_model=ComplaintClassificationResponse)
def classify_complaint(req: ComplaintRequest):
    text = f"{req.title} {req.description}".lower()
    best_cat = "Other public safety concern"
    max_hits = 0

    entities = []
    for match in re.finditer(r'\b(pothole|accident|light|wire|flood|tree|drain)\w*\b', text):
        entities.append(match.group(0))

    for category, keywords in CATEGORY_RULES.items():
        hits = sum(1 for kw in keywords if kw in text)
        if hits > max_hits:
            max_hits = hits
            best_cat = category

    confidence = 0.95 if max_hits >= 3 else 0.82 if max_hits == 2 else 0.65 if max_hits == 1 else 0.40
    status = "marked_for_manual_review" if confidence < 0.70 else "automated_high_confidence"

    return ComplaintClassificationResponse(
        predictedCategory=best_cat,
        confidence=confidence,
        processingStatus=status,
        extractedEntities=list(set(entities))
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
