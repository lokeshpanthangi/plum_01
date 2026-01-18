"""
Insurance Claim Intake Module
Handles processing of claim data from multiple input formats (text, images, PDFs)
"""

import base64
import mimetypes
import os
from typing import Union, Optional

from langchain_core.messages import HumanMessage
from pydantic import BaseModel

from config import llm
from state import IntakeResult, ExtractedClaimData


# ============================================================================
# STRUCTURED EXTRACTION MODEL
# ============================================================================

class ClaimExtraction(BaseModel):
    """Structured claim data for LLM extraction"""
    member_id: Optional[str] = None
    member_name: Optional[str] = None
    policy_number: Optional[str] = None
    treatment_date: Optional[str] = None
    claim_amount: Optional[float] = None
    diagnosis: Optional[str] = None
    doctor_name: Optional[str] = None
    hospital_name: Optional[str] = None
    claim_type: Optional[str] = None
    summary: Optional[str] = None


extraction_model = llm.with_structured_output(ClaimExtraction)


# ============================================================================
# INPUT TYPE DETECTION
# ============================================================================

def detect_input_type(input_path: str) -> str:
    """
    Determines input type: 'image', 'pdf', or 'text'
    """
    if not os.path.exists(input_path):
        return "text"
    
    mime_type, _ = mimetypes.guess_type(input_path)
    if mime_type:
        if mime_type.startswith("image/"):
            return "image"
        if mime_type == "application/pdf":
            return "pdf"
    
    ext = os.path.splitext(input_path)[1].lower()
    if ext in {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"}:
        return "image"
    if ext == ".pdf":
        return "pdf"
    
    return "text"


# ============================================================================
# IMAGE PROCESSING
# ============================================================================

def encode_image_to_base64(image_path: str) -> str:
    """Converts image file to base64 data URL"""
    with open(image_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")
    
    mime_type, _ = mimetypes.guess_type(image_path)
    mime_type = mime_type or "image/jpeg"
    
    return f"data:{mime_type};base64,{encoded}"


def extract_text_from_image(base64_image: str) -> str:
    """Uses vision LLM to extract claim information from image"""
    prompt = """Extract all insurance claim information from this image including:
    - Patient/Member details (name, ID)
    - Doctor information (name, registration number)
    - Diagnosis and medical conditions
    - Medicines prescribed
    - Bill amounts (consultation, tests, medicines)
    - Treatment dates
    - Any other relevant claim details
    
    Provide a detailed text description of all information found."""
    
    message = HumanMessage(content=[
        {"type": "text", "text": prompt},
        {"type": "image_url", "image_url": {"url": base64_image}}
    ])
    
    response = llm.invoke([message])
    content = response.content
    if isinstance(content, list):
        return " ".join(str(item) for item in content)
    return str(content)


# ============================================================================
# PDF PROCESSING
# ============================================================================

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts all text from PDF file"""
    try:
        import pypdf
    except ImportError:
        raise ImportError("pypdf is required. Install with: pip install pypdf")
    
    pages = []
    with open(pdf_path, "rb") as f:
        reader = pypdf.PdfReader(f)
        for page in reader.pages:
            pages.append(page.extract_text())
    
    return "\n".join(pages)


# ============================================================================
# STRUCTURED DATA EXTRACTION
# ============================================================================

def extract_structured_data(claim_text: str) -> ExtractedClaimData:
    """
    Uses LLM to extract structured claim data from text
    """
    extraction_prompt = f"""Extract the following information from this insurance claim text. 
If a field is not found, leave it as null.

Claim Text:
{claim_text}

Extract: member_id, member_name, policy_number, treatment_date, claim_amount (as number), 
diagnosis, doctor_name, hospital_name, claim_type (one of: consultation, diagnostic, pharmacy, dental, vision, alternative_medicine, general), 
and a brief summary of the claim."""

    try:
        result: ClaimExtraction = extraction_model.invoke(extraction_prompt)  # type: ignore
        return ExtractedClaimData(
            member_id=result.member_id,
            member_name=result.member_name,
            policy_number=result.policy_number,
            treatment_date=result.treatment_date,
            claim_amount=result.claim_amount,
            diagnosis=result.diagnosis,
            doctor_name=result.doctor_name,
            hospital_name=result.hospital_name,
            claim_type=result.claim_type,
            summary=result.summary
        )
    except Exception as e:
        print(f"[Intake] Error extracting structured data: {e}")
        return ExtractedClaimData(summary=claim_text[:200] + "..." if len(claim_text) > 200 else claim_text)


# ============================================================================
# INPUT PREPROCESSING
# ============================================================================

def preprocess_input(input_data: Union[str, bytes]) -> tuple[str, str]:
    """Processes various input formats into claim description text"""
    if isinstance(input_data, bytes):
        input_data = input_data.decode("utf-8")
    
    input_str: str = str(input_data)
    input_type = detect_input_type(input_str)
    
    if input_type == "image":
        print(f"[Intake] Processing image: {input_str}")
        base64_image = encode_image_to_base64(input_str)
        claim_description = extract_text_from_image(base64_image)
    elif input_type == "pdf":
        print(f"[Intake] Processing PDF: {input_str}")
        claim_description = extract_text_from_pdf(input_str)
    else:
        print("[Intake] Processing raw text")
        claim_description = input_str
    
    return claim_description, input_type


# ============================================================================
# PUBLIC API
# ============================================================================

def intake_node(input_data: Union[str, bytes]) -> IntakeResult:
    """
    Entry point for claim intake processing
    
    Args:
        input_data: Image path, PDF path, or raw text
        
    Returns:
        IntakeResult: Processed claim description, input type, and extracted data
    """
    claim_description, input_type = preprocess_input(input_data)
    print(f"[Intake] Claim description extracted ({input_type})")
    
    # Extract structured data from the claim
    extracted_data = extract_structured_data(claim_description)
    print(f"[Intake] Structured data extracted: {extracted_data.member_name or 'Unknown'}")
    
    return IntakeResult(
        claim_description=claim_description,
        input_type=input_type,
        extracted_data=extracted_data
    )