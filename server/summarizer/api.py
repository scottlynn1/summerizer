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
  product: str


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

  ratings = []
  for rating in data.ratings:
    int_rating = int(rating)
    ratings.append(int_rating)
  chartdata = {}
  chartdata1 = {}
  nodes = []
  with connection.cursor() as cursor:
    if data.product:
      if data.state == 'all':
        cursor.execute("SELECT review, date, rating FROM reviews WHERE rating=ANY(%s) AND date BETWEEN %s AND %s AND review LIKE %s LIMIT 150;", [ratings, data.years['start'], data.years['end'], '%'+data.product+'%'])
        for review in cursor:
          nodes.append(TextNode(text=review[0]))
        if len(ratings) > 1:
          cursor.execute("SELECT AVG(rating) AS avg, EXTRACT(YEAR FROM date::date) AS year FROM reviews WHERE rating=ANY(%s) AND date BETWEEN %s AND %s AND review LIKE %s GROUP BY EXTRACT(YEAR from date::date) ORDER BY year;", [ratings, data.years['start'], data.years['end'], '%'+data.product+'%'])
          for average in cursor:
            chartdata[str(average[1])] = float(average[0])
        if len(ratings) > 1:
          cursor.execute("SELECT AVG(rating) AS avg, address FROM reviews WHERE rating=ANY(%s) AND date BETWEEN %s AND %s AND review LIKE %s GROUP BY address ORDER BY avg DESC;", [ratings, data.years['start'], data.years['end'], '%'+data.product+'%'])
          for average in cursor:
            chartdata1[str(average[1])] = float(average[0])
      else:
        cursor.execute(
          "SELECT review, address, date, rating FROM reviews "
          "WHERE rating=ANY(%s) AND date "
          "BETWEEN %s AND %s AND address=%s AND review LIKE %s LIMIT 150;", [ratings, data.years['start'], data.years['end'], data.state, '%'+data.product+'%'])
        for review in cursor:
          nodes.append(TextNode(text=review[0]))
        if len(ratings) > 1:
          cursor.execute("SELECT AVG(rating) AS avg, EXTRACT(YEAR FROM date::date) AS year FROM reviews WHERE rating=ANY(%s) AND date BETWEEN %s AND %s AND address=%s AND review LIKE %s GROUP BY EXTRACT(YEAR from date::date) ORDER BY year;", [ratings, data.years['start'], data.years['end'], data.state, '%'+data.product+'%'])
          for average in cursor:
            chartdata[str(average[1])] = float(average[0])
    else:
      if data.state == 'all':
        cursor.execute("SELECT review, date, rating FROM reviews WHERE rating=ANY(%s) AND date BETWEEN %s AND %s LIMIT 150;", [ratings, data.years['start'], data.years['end']])
        for review in cursor:
          nodes.append(TextNode(text=review[0]))
        if len(ratings) > 1:
          cursor.execute("SELECT AVG(rating) AS avg, EXTRACT(YEAR FROM date::date) AS year FROM reviews WHERE rating=ANY(%s) AND date BETWEEN %s AND %s GROUP BY EXTRACT(YEAR from date::date) ORDER BY year;", [ratings, data.years['start'], data.years['end']])
          for average in cursor:
            chartdata[str(average[1])] = float(average[0])
        if len(ratings) > 1:
          cursor.execute("SELECT AVG(rating) AS avg, address FROM reviews WHERE rating=ANY(%s) AND date BETWEEN %s AND %s GROUP BY address ORDER BY avg DESC;", [ratings, data.years['start'], data.years['end']])
          for average in cursor:
            chartdata1[str(average[1])] = float(average[0])
      else:
        cursor.execute(
          "SELECT review, address, date, rating FROM reviews "
          "WHERE rating=ANY(%s) AND date "
          "BETWEEN %s AND %s AND address=%s LIMIT 150;", [ratings, data.years['start'], data.years['end'], data.state])
        for review in cursor:
          nodes.append(TextNode(text=review[0]))
        if len(ratings) > 1:
          cursor.execute("SELECT AVG(rating) AS avg, EXTRACT(YEAR FROM date::date) AS year FROM reviews WHERE rating=ANY(%s) AND date BETWEEN %s AND %s AND address=%s GROUP BY EXTRACT(YEAR from date::date) ORDER BY year;", [ratings, data.years['start'], data.years['end'], data.state])
          for average in cursor:
            chartdata[str(average[1])] = float(average[0])

    
  summary_index = SummaryIndex(nodes)

  summary_query_engine = summary_index.as_query_engine(
    response_mode="simple_summarize",
    use_async=True,
  )
  print(data.product)
  if data.product:
    summary = summary_query_engine.query(f"What are the overall issues or things people like of the {data.product} from these reviews about a coffee chain?")
    print('product summary' + str(summary))
  else:
    summary = summary_query_engine.query("What are the overall issues or things people like of the coffee chain from these reviews are about?")
    print('store summary' + str(summary))

  return JsonResponse({'db': str(summary), 'chartdata': chartdata, 'chartdata1': chartdata1})
