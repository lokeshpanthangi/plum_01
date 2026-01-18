import re
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv

from tools import tools
from state import AgentResult

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)


# Create a proper agent prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an insurance claim adjudication agent. Your job: analyze medical claims, check policy terms, and approve or reject with clear reasoning.
## Process
1. **Extract claim data**: member ID, treatment date, diagnosis, medications, tests, amounts
2. **Query RAG system** using the policy_rag tool for relevant policies based on diagnosis, treatments, and member plan
3. **Validate claim** against policy:
   - Is treatment covered?
   - Policy active on treatment date?
   - Within coverage limits?
   - Any exclusions apply?
   - Required documents present?
   - Waiting periods satisfied?
4. **Make decision**: APPROVED / REJECTED / PARTIAL
5. **Assess confidence**: How confident are you in this decision (0-100%)
## Output Format
```
DECISION: [APPROVED/REJECTED/PARTIAL]
APPROVED AMOUNT: $X (if applicable)
CONFIDENCE: [0-100]%
REASONING:
- [Specific policy clause or reason 1]
- [Specific policy clause or reason 2]
- [Continue as needed]
POLICY REFERENCES: [Section numbers from RAG]
```
## Rules
- Base decisions ONLY on retrieved policy terms
- Reference specific policy sections
- If info is missing, state what's needed
- If uncertain, flag for human review
- Be precise and factual
- Confidence should reflect how well the claim matches policy terms"""),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

# Create the agent
agent = create_tool_calling_agent(llm, tools, prompt)

# Create agent executor
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)


def parse_agent_response(response: str) -> AgentResult:
    """Parse the agent's response into structured AgentResult"""
    
    # Extract decision
    decision_match = re.search(r"DECISION:\s*(APPROVED|REJECTED|PARTIAL)", response, re.IGNORECASE)
    decision = decision_match.group(1).upper() if decision_match else "NEEDS_REVIEW"
    
    # Extract approved amount
    amount_match = re.search(r"APPROVED AMOUNT:\s*\$?([\d,]+(?:\.\d{2})?)", response, re.IGNORECASE)
    approved_amount = float(amount_match.group(1).replace(",", "")) if amount_match else None
    
    # Extract confidence score
    confidence_match = re.search(r"CONFIDENCE:\s*(\d+)", response, re.IGNORECASE)
    confidence_score = int(confidence_match.group(1)) if confidence_match else None
    
    # If no explicit confidence, derive from decision clarity
    if confidence_score is None:
        if decision == "APPROVED":
            confidence_score = 85
        elif decision == "REJECTED":
            confidence_score = 80
        elif decision == "PARTIAL":
            confidence_score = 70
        else:
            confidence_score = 50
    
    # Extract reasoning
    reasoning = []
    reasoning_match = re.search(r"REASONING:\s*(.*?)(?:POLICY REFERENCES:|CONFIDENCE:|$)", response, re.DOTALL | re.IGNORECASE)
    if reasoning_match:
        reasoning_text = reasoning_match.group(1)
        reasoning = [line.strip().lstrip("- ") for line in reasoning_text.strip().split("\n") if line.strip() and line.strip() != "-"]
    
    # Extract policy references
    policy_refs = []
    refs_match = re.search(r"POLICY REFERENCES:\s*(.*?)$", response, re.DOTALL | re.IGNORECASE)
    if refs_match:
        refs_text = refs_match.group(1)
        policy_refs = [ref.strip() for ref in refs_text.strip().split(",") if ref.strip()]
    
    return AgentResult(
        decision=decision,
        approved_amount=approved_amount,
        confidence_score=confidence_score,
        reasoning=reasoning if reasoning else ["No detailed reasoning provided"],
        policy_references=policy_refs if policy_refs else ["No specific references"],
        raw_response=response
    )


def run_agent(claim_description: str) -> AgentResult:
    """
    Run the insurance claim adjudication agent with the claim description.
    """
    response = agent_executor.invoke({"input": claim_description})
    output = response.get("output", "")
    
    return parse_agent_response(output)