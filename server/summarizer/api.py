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
  data.years['start'] = data.years['start'] + '-01-01'
  data.years['end'] = data.years['end'] + '-12-31'
  print(data.years)
  print(data.state)
  ratings = []
  for rating in data.ratings:
    int_rating = int(rating)
    ratings.append(int_rating)

  nodes = []
  with connection.cursor() as cursor:
    if data.state == 'all':
      cursor.execute("SELECT review, date, rating FROM reviews WHERE rating=ANY(%s) AND date BETWEEN %s AND %s LIMIT 50;", [ratings, data.years['start'], data.years['end']])
      for review in cursor:
        print(review)
        nodes.append(TextNode(text=review[0]))
    else:
      cursor.execute(
        "SELECT review, address, date, rating FROM reviews "
        "WHERE rating=ANY(%s) AND date "
        "BETWEEN %s AND %s AND address=%s LIMIT 50;", [ratings, data.years['start'], data.years['end'], data.state])
      for review in cursor:
        print(review)
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
