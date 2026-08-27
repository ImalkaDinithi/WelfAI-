"""
WelfAI ML Service

Serves the lifestyle-improvement-plan prediction models trained in Colab
(WelfAI_ML.ipynb) over a REST API, so the Node/Express backend can call
this instead of the mock prediction in adminController.js.

Run locally:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

Then POST to http://localhost:8000/predict
"""

from contextlib import asynccontextmanager
from typing import Literal, Optional

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

MODEL_DIR = "welfai_models"

# Populated on startup by load_models()
models = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_models()
    yield


app = FastAPI(title="WelfAI ML Service", version="1.0.0", lifespan=lifespan)


def load_models():
    try:
        models["classifier"] = joblib.load(f"{MODEL_DIR}/lifestyle_success_model.pkl")
        models["regressor"] = joblib.load(f"{MODEL_DIR}/lifestyle_duration_model.pkl")
        metadata = joblib.load(f"{MODEL_DIR}/model_metadata.pkl")
        models["metadata"] = metadata
        models["expected_features"] = metadata["features"]
        print(f"Loaded models. Expected features: {models['expected_features']}")
    except FileNotFoundError as e:
        raise RuntimeError(
            f"Could not find model files in '{MODEL_DIR}/'. "
            f"Make sure lifestyle_success_model.pkl, lifestyle_duration_model.pkl, "
            f"and model_metadata.pkl are all present. Original error: {e}"
        )


class PredictionRequest(BaseModel):
    """
    Mirrors the exact feature columns the models were trained on
    (see model_metadata.pkl['features']). Field names and types must
    match what the training notebook used.
    """
    district: str
    householdSize: int = Field(ge=1, le=20)
    numberOfIncomeEarners: int = Field(ge=0, le=20)
    numberOfChildren: int = Field(ge=0, le=20)
    numberOfElderlyDependents: int = Field(ge=0, le=20)
    numberOfDisabledMembers: int = Field(ge=0, le=20)
    employmentType: Literal["Unemployed", "Daily-Wage", "Self-Employed", "Permanent"]
    yearsOfEmployment: int = Field(ge=0, le=60)
    highestEducationalQualification: Literal[
        "No Schooling", "Primary", "O-Level", "A-Level", "Vocational", "Degree"
    ]
    totalMonthlyHouseholdIncome: float = Field(ge=0)
    monthlyHouseholdExpenses: float = Field(ge=0)
    houseOwnership: Literal["Owned", "Rented", "Other"]
    accessToElectricity: bool
    accessToCleanWater: bool
    assetScore: int = Field(ge=0, le=3)
    numFocusAreas: int = Field(ge=1, le=7)
    focusAreas: str  # semicolon-joined, e.g. "Employment;Small Business"
    requestedDurationMonths: int = Field(ge=1, le=60)


class PredictionResponse(BaseModel):
    successProbability: float
    estimatedDurationMonths: float
    modelVersion: str


@app.get("/health")
def health():
    return {
        "status": "ok",
        "modelsLoaded": "classifier" in models and "regressor" in models,
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest):
    if "classifier" not in models or "regressor" not in models:
        raise HTTPException(status_code=503, detail="Models not loaded")

    row = payload.model_dump()
    X = pd.DataFrame([row])[models["expected_features"]]

    try:
        success_probability = float(models["classifier"].predict_proba(X)[:, 1][0]) * 100
        estimated_duration = float(models["regressor"].predict(X)[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    return PredictionResponse(
        successProbability=round(success_probability, 1),
        estimatedDurationMonths=round(estimated_duration, 1),
        modelVersion="gradient-boosting-v1",
    )
