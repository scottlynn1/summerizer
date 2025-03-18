from ninja import NinjaAPI
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

GROQ_API_KEY = os.environ.get('groq_key')
os.environ["GROQ_API_KEY"] = GROQ_API_KEY

nest_asyncio.apply()

llm = Groq(model="llama-3.1-8b-instant")

Settings.llm = Groq(model="llama-3.1-8b-instant")
Settings.embed_model = HuggingFaceEmbedding()

@api.post("/")
def hello(request):
  print(request.headers['X-CSRFToken'])
  print('api called')
  nodes = []
  with connection.cursor() as cursor:
    cursor.execute("SELECT review FROM reviews WHERE rating=1 LIMIT 20;")
    print(cursor.fetchone()[0])
    for review in cursor:
      nodes.append(TextNode(text=review[0]))

    
  summary_index = SummaryIndex(nodes)

  summary_query_engine = summary_index.as_query_engine(
    response_mode="tree_summarize",
    use_async=True,
  )

  summary = summary_query_engine.query("Summarize the given reviews of Starbucks")
  print(summary)

  # print(Reviews.objects.get(pk=1))
  return JsonResponse({'db': str(summary)})
