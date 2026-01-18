from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from dotenv import load_dotenv
load_dotenv()

json_parser = JsonOutputParser()


llm = ChatOpenAI(model="gpt-4o",temperature=0.3)