from langchain.agents import tool
from rag.rag import query_index


@tool
def policy_rag(query: str) -> str:
    """This is a tool that takes a query and fetches the relevant policy information from the database or documents.
    Use this tool when you need to get policy details, coverage limits, exclusions, or any policy-related information."""
    docs = query_index(query)
    combined_content = "\n".join([doc.page_content for doc in docs])
    return combined_content


tools = [policy_rag]
