from fastapi import FastAPI, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi_csrf_protect import CsrfProtect
from fastapi import HTTPException
from fastapi import Response
from fastapi import Request
from pydantic import BaseModel


import json
import os
import asyncio
import random
from llama_index.core.schema import TextNode
from llama_index.core import get_response_synthesizer
from llama_index.core import SummaryIndex
from llama_index.llms.groq import Groq
from llama_index.core import Settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from openai import RateLimitError


import psycopg2

from dotenv import load_dotenv
load_dotenv()
       
csrf_protect = CsrfProtect()

connection = psycopg2.connect(
  dbname=os.environ.get('db_name'),
  user = os.environ.get('db_user'),
  password = os.environ.get('db_password'),
  host = os.environ.get('db_host'),
  port = int(os.environ.get('db_port')),
)

GROQ_API_KEY = os.environ.get('groq_key')
os.environ["GROQ_API_KEY"] = GROQ_API_KEY

# nest_asyncio.apply()

llm = Groq(model="llama-3.1-8b-instant")

Settings.llm = Groq(model="llama-3.1-8b-instant")
# Settings.embed_model = HuggingFaceEmbedding()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get('cors_host_1'), os.environ.get('cors_host_2')],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)



async def async_generate_chunks(request: Request, data: dict):
  try:
    data['years']['start'] = data['years']['start'] + '-01-01'
    data['years']['end'] = data['years']['end'] + '-12-31'

    ratings = []
    for rating in data['ratings']:
      int_rating = int(rating)
      ratings.append(int_rating)
    chartdata = {}
    chartdata1 = {}
    nodes = []
    LIMIT = 20000
    SUBSET = 10
    with connection.cursor() as cursor:
      if data['product']:
        if data['state'] == 'all':
          cursor.execute("SELECT review, date, rating FROM reviews WHERE rating=ANY(%s) AND date BETWEEN %s AND %s AND review LIKE %s ORDER BY RANDOM() LIMIT %s;", [ratings, data['years']['start'], data['years']['end'], '%'+data['product']+'%', LIMIT])
          for review in cursor:
            nodes.append(TextNode(text=review[0]))
          if len(ratings) > 1:
            cursor.execute("SELECT AVG(rating) AS avg, EXTRACT(YEAR FROM date::date) AS year FROM reviews WHERE rating=ANY(%s) AND date BETWEEN %s AND %s AND review LIKE %s GROUP BY EXTRACT(YEAR from date::date) ORDER BY year;", [ratings, data['years']['start'], data['years']['end'], '%'+data['product']+'%'])
            for average in cursor:
              chartdata[str(average[1])] = float(average[0])
          if len(ratings) > 1:
            cursor.execute("SELECT AVG(rating) AS avg, address FROM reviews WHERE rating=ANY(%s) AND date BETWEEN %s AND %s AND review LIKE %s GROUP BY address ORDER BY avg DESC;", [ratings, data['years']['start'], data['years']['end'], '%'+data['product']+'%'])
            for average in cursor:
              chartdata1[str(average[1])] = float(average[0])
        else:
          cursor.execute(
            "SELECT review, address, date, rating FROM reviews "
            "WHERE rating=ANY(%s) AND date "
            "BETWEEN %s AND %s AND address=%s AND review LIKE %s ORDER BY RANDOM() LIMIT %s;", [ratings, data['years']['start'], data['years']['end'], data['state'], '%'+data['product']+'%', LIMIT])
          for review in cursor:
            nodes.append(TextNode(text=review[0]))
          if len(ratings) > 1:
            cursor.execute("SELECT AVG(rating) AS avg, EXTRACT(YEAR FROM date::date) AS year FROM reviews WHERE rating=ANY(%s) AND date BETWEEN %s AND %s AND address=%s AND review LIKE %s GROUP BY EXTRACT(YEAR from date::date) ORDER BY year;", [ratings, data['years']['start'], data['years']['end'], data['state'], '%'+data['product']+'%'])
            for average in cursor:
              chartdata[str(average[1])] = float(average[0])
      else:
        if data['state'] == 'all':
          cursor.execute("SELECT review, date, rating FROM reviews WHERE rating=ANY(%s) AND date BETWEEN %s AND %s ORDER BY RANDOM() LIMIT %s;", [ratings, data['years']['start'], data['years']['end'], LIMIT])
          for review in cursor:
            nodes.append(TextNode(text=review[0]))
          if len(ratings) > 1:
            cursor.execute("SELECT AVG(rating) AS avg, EXTRACT(YEAR FROM date::date) AS year FROM reviews WHERE rating=ANY(%s) AND date BETWEEN %s AND %s GROUP BY EXTRACT(YEAR from date::date) ORDER BY year;", [ratings, data['years']['start'], data['years']['end']])
            for average in cursor:
              chartdata[str(average[1])] = float(average[0])
          if len(ratings) > 1:
            cursor.execute("SELECT AVG(rating) AS avg, address FROM reviews WHERE rating=ANY(%s) AND date BETWEEN %s AND %s GROUP BY address ORDER BY avg DESC;", [ratings, data['years']['start'], data['years']['end']])
            for average in cursor:
              chartdata1[str(average[1])] = float(average[0])
        else:
          cursor.execute(
            "SELECT review, address, date, rating FROM reviews "
            "WHERE rating=ANY(%s) AND date "
            "BETWEEN %s AND %s AND address=%s ORDER BY RANDOM() LIMIT %s;", [ratings, data['years']['start'], data['years']['end'], data['state'], LIMIT])
          for review in cursor:
            nodes.append(TextNode(text=review[0]))
          if len(ratings) > 1:
            cursor.execute("SELECT AVG(rating) AS avg, EXTRACT(YEAR FROM date::date) AS year FROM reviews WHERE rating=ANY(%s) AND date BETWEEN %s AND %s AND address=%s GROUP BY EXTRACT(YEAR from date::date) ORDER BY year;", [ratings, data['years']['start'], data['years']['end'], data['state']])
            for average in cursor:
              chartdata[str(average[1])] = float(average[0])

    yield json.dumps({'chartdata': chartdata, 'chartdata1': chartdata1}) + '\n'
    await asyncio.sleep(0)  # ensures the yield is flushed

    # get subset of reviews for faster responses, increase subset size for more detailed/accurate responses
    review_subset = []
    n = SUBSET if len(nodes) >= 10 else len(nodes)
    random_indexes = random.sample(range(len(nodes)), n)
    for i in random_indexes:
      review_subset.append(nodes[i])
    summary_index = SummaryIndex(review_subset)
    if await request.is_disconnected():
      print("Client disconnected during chart generation")
      return
    summary_query_engine = summary_index.as_query_engine(
      response_mode="simple_summarize",
      use_async=True,
    )
    loop = asyncio.get_event_loop()
    if data['product']:
      summary = await loop.run_in_executor(None, lambda: summary_query_engine.query(f"In 150 words or less, summarize these concatenated reviews from several starbucks locations about specifically the {data['product']}?"))
    else:
      summary = await loop.run_in_executor(None, lambda: summary_query_engine.query("In 150 words or less, summarize these concatenated reviews from several starbucks locations"))
    yield json.dumps({'db': str(summary)}) + '\n'
    await asyncio.sleep(0)  # ensures the yield is flushed

    if await request.is_disconnected():
      print("Client disconnected before summary")
      return
  
  except RateLimitError:
    yield json.dumps({'db': 'Rate limit reached. Please try again after a minute.'})
  except Exception as e:
    print("Streaming error:", e)  


class Item(BaseModel):
  years: dict[str, str]
  state: str
  ratings: list[str]
  product: str

@app.post("/api/")
async def async_stream(request: Request, payload: Item):
  data = payload.model_dump()
  print(data, flush=True)
  return StreamingResponse(async_generate_chunks(request, data), media_type='test/event-stream')
