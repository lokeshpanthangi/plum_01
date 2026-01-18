"""
Insurance Claim Processing API
FastAPI backend that connects: Frontend -> Intake Node -> Agent Executor -> Frontend
"""

import os
import sys
import json
from typing import Optional, AsyncGenerator
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import tempfile
from rag.rag import ingest_document

# Add agents directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "agents"))

from agents.intake_node import intake_node
from agents.simple_agent import run_agent
from agents.state import ClaimResponse, IntakeResult, AgentResult


app = FastAPI(
    title="Insurance Claim Processor",
    description="AI-powered insurance claim adjudication system",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ClaimRequest(BaseModel):
    """Request model for claims"""
    claim_description: str


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Insurance Claim Processor API is running"}


async def process_claim_stream(claim_text: str) -> AsyncGenerator[str, None]:
    """
    Process claim and yield results as NDJSON stream.
    Yields results for each processing node.
    """
    try:
        # Step 1: Intake Node - Process the text input
        intake_result: IntakeResult = intake_node(claim_text)
        
        # Build extracted data for frontend
        extracted = intake_result.extracted_data
        intake_data = {
            "node": "Intake Node",
            "data": {
                "claim_description": intake_result.claim_description,
                "input_type": intake_result.input_type,
                "member_id": extracted.member_id if extracted else None,
                "member_name": extracted.member_name if extracted else None,
                "policy_number": extracted.policy_number if extracted else None,
                "treatment_date": extracted.treatment_date if extracted else None,
                "claim_amount": extracted.claim_amount if extracted else None,
                "diagnosis": extracted.diagnosis if extracted else None,
                "doctor_name": extracted.doctor_name if extracted else None,
                "hospital_name": extracted.hospital_name if extracted else None,
                "claim_type": extracted.claim_type if extracted else None,
                "summary": extracted.summary if extracted else None
            }
        }
        yield json.dumps(intake_data) + "\n"
        
        # Step 2: Agent Executor - Analyze and make decision
        agent_result: AgentResult = run_agent(intake_result.claim_description)
        
        # Yield policy/decision result
        policy_data = {
            "node": "Policy Node",
            "data": {
                "decision": agent_result.decision,
                "approved_amount": agent_result.approved_amount,
                "reasoning": agent_result.reasoning,
                "policy_references": agent_result.policy_references,
                "confidence_score": agent_result.confidence_score
            }
        }
        yield json.dumps(policy_data) + "\n"
        
        # Yield risk assessment with confidence
        risk_category = "Low" if agent_result.decision == "APPROVED" else "High" if agent_result.decision == "REJECTED" else "Medium"
        risk_score = 2 if agent_result.decision == "APPROVED" else 8 if agent_result.decision == "REJECTED" else 5
        
        # Confidence reasoning based on decision
        confidence_reasons = []
        if agent_result.decision == "APPROVED":
            confidence_reasons = [
                "All required documents verified",
                "Treatment covered under policy terms",
                "Claim amount within coverage limits"
            ]
        elif agent_result.decision == "REJECTED":
            confidence_reasons = [
                "Policy terms not met",
                "Potential exclusions identified",
                "Manual review recommended"
            ]
        else:
            confidence_reasons = [
                "Partial coverage identified",
                "Some conditions need verification",
                "Further documentation may be required"
            ]
        
        risk_data = {
            "node": "Risk Analyze Node",
            "data": {
                "risk_score": risk_score,
                "category": risk_category,
                "confidence_score": agent_result.confidence_score,
                "confidence_reasons": confidence_reasons,
                "reasons": agent_result.reasoning[:3] if agent_result.reasoning else []
            }
        }
        yield json.dumps(risk_data) + "\n"
        
        # Yield routing decision with confidence
        processing_path = "Fast-Track" if agent_result.decision == "APPROVED" else "Manual Review" if agent_result.decision == "REJECTED" else "Standard Processing"
        adjuster_tier = "Tier 1 - Auto Approval" if agent_result.decision == "APPROVED" else "Tier 3 - Senior Adjuster" if agent_result.decision == "REJECTED" else "Tier 2 - Standard Review"
        
        routing_confidence = agent_result.confidence_score or 75
        routing_reasons = [
            f"Decision confidence: {routing_confidence}%",
            f"Risk category: {risk_category}",
            f"Processing path: {processing_path}"
        ]
        
        routing_data = {
            "node": "Routing Node",
            "data": {
                "processing_path": processing_path,
                "priority": "High" if agent_result.decision == "REJECTED" else "Normal" if agent_result.decision == "APPROVED" else "Medium",
                "adjuster_tier": adjuster_tier,
                "confidence_score": routing_confidence,
                "confidence_reasons": routing_reasons,
                "rationale": "; ".join(agent_result.reasoning[:2]) if agent_result.reasoning else "Standard processing"
            }
        }
        yield json.dumps(routing_data) + "\n"
        
    except Exception as e:
        error_data = {
            "node": "Error",
            "data": {"error": str(e)}
        }
        yield json.dumps(error_data) + "\n"


@app.post("/process-claim-stream/")
async def process_claim_streaming(request: ClaimRequest):
    """
    Process a claim and stream results as NDJSON.
    This is the main endpoint the frontend uses.
    """
    return StreamingResponse(
        process_claim_stream(request.claim_description),
        media_type="application/x-ndjson"
    )


@app.post("/process-claim-file-stream/")
async def process_file_claim_streaming(file: UploadFile = File(...)):
    """
    Process an image or PDF claim and stream results as NDJSON.
    """
    allowed_types = {
        "image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp",
        "application/pdf"
    }
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {file.content_type}. Allowed: images and PDFs"
        )
    
    # Save file temporarily
    suffix = os.path.splitext(file.filename)[1] if file.filename else ".tmp"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    async def stream_file_processing():
        try:
            # Process using the file path - use async for since process_claim_stream is async
            async for chunk in process_claim_stream(tmp_path):
                yield chunk
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    
    return StreamingResponse(
        stream_file_processing(),
        media_type="application/x-ndjson"
    )


@app.post("/api/process-claim/text", response_model=ClaimResponse)
async def process_text_claim(request: ClaimRequest):
    """
    Process a text-based insurance claim (non-streaming).
    """
    try:
        intake_result: IntakeResult = intake_node(request.claim_description)
        agent_result: AgentResult = run_agent(intake_result.claim_description)
        
        return ClaimResponse(
            intake=intake_result,
            result=agent_result
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing claim: {str(e)}")



@app.post("/api/ingest-document/", status_code=200)
async def ingest_document_endpoint():
    ingest_document()
    return {"status": "success", "message": "Documents ingested successfully"}


@app.post("/api/process-claim/file", response_model=ClaimResponse)
async def process_file_claim(file: UploadFile = File(...)):
    """
    Process an image or PDF insurance claim.
    """
    try:
        allowed_types = {
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp",
            "application/pdf"
        }
        
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type: {file.content_type}"
            )
        
        suffix = os.path.splitext(file.filename)[1] if file.filename else ".tmp"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        try:
            intake_result: IntakeResult = intake_node(tmp_path)
            agent_result: AgentResult = run_agent(intake_result.claim_description)
            
            return ClaimResponse(
                intake=intake_result,
                result=agent_result
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing claim: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
