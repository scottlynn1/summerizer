from ninja import NinjaAPI, Schema
from django.http import JsonResponse
from .models import Reviews
from django.db import connection

import os
import nest_asyncio
from llama_index.core.schema import TextNode
from llama_index.core import get_response_synthesizer
from llama_index.core import SummaryIndex
from llama_index.llms.groq import Groq
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core import Settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
import psycopg2
from dotenv import load_dotenv
load_dotenv()

api = NinjaAPI()

class ParamsSchema(Schema):
  years: dict[str, str]
  state: str
  ratings: list[str]


GROQ_API_KEY = os.environ.get('groq_key')
os.environ["GROQ_API_KEY"] = GROQ_API_KEY

nest_asyncio.apply()

llm = Groq(model="llama-3.1-8b-instant")

Settings.llm = Groq(model="llama-3.1-8b-instant")
Settings.embed_model = HuggingFaceEmbedding()

@api.post("/")
def hello(request, data: ParamsSchema):
  print(data.years)
  print(data.state)
  print(data.ratings)

  nodes = []
  with connection.cursor() as cursor:
    cursor.execute("SELECT review FROM reviews WHERE rating=%s AND address='AK' LIMIT 50;", [data.ratings[0]])
    for review in cursor:
      print(review[0])
      nodes.append(TextNode(text=review[0]))

    
  summary_index = SummaryIndex(nodes)

  summary_query_engine = summary_index.as_query_engine(
    response_mode="tree_summarize",
    use_async=True,
  )

  summary = summary_query_engine.query("What is the overall perception of the coffee chain from these reviews are about?")
  print(summary)

  # print(Reviews.objects.get(pk=1))
  return JsonResponse({'db': str(summary)})
