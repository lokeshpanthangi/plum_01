from typing import Optional
from pydantic import BaseModel


class ClaimInput(BaseModel):
    """Input data from frontend - can be text, image path, or PDF path"""
    input_data: str  # Raw text, image path, or PDF path
    input_type: Optional[str] = None  # 'text', 'image', 'pdf' - auto-detected if not provided


class ExtractedClaimData(BaseModel):
    """Structured claim data extracted by intake node"""
    member_id: Optional[str] = None
    member_name: Optional[str] = None
    policy_number: Optional[str] = None
    treatment_date: Optional[str] = None
    claim_amount: Optional[float] = None
    diagnosis: Optional[str] = None
    doctor_name: Optional[str] = None
    hospital_name: Optional[str] = None
    claim_type: Optional[str] = None  # consultation, diagnostic, pharmacy, dental, etc.
    summary: Optional[str] = None


class IntakeResult(BaseModel):
    """Output from intake node - processed claim description"""
    claim_description: str
    input_type: str  # What type of input was processed
    extracted_data: Optional[ExtractedClaimData] = None


class AgentResult(BaseModel):
    """Final result from the agent executor"""
    decision: str  # APPROVED, REJECTED, PARTIAL
    approved_amount: Optional[float] = None
    reasoning: list[str]
    policy_references: list[str]
    confidence_score: Optional[int] = None  # 0-100 confidence percentage
    raw_response: str  # Full agent response


class ClaimResponse(BaseModel):
    """Complete response sent back to frontend"""
    intake: IntakeResult
    result: AgentResult