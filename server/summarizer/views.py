from django.middleware.csrf import get_token

from django.http import JsonResponse
from django.db import connection
from django.http import StreamingHttpResponse
import json
import os
import nest_asyncio
from llama_index.core.schema import TextNode
from llama_index.core import get_response_synthesizer
from llama_index.core import SummaryIndex
from llama_index.llms.groq import Groq
from llama_index.core import Settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from dotenv import load_dotenv
load_dotenv()

from django.views import View


def csrf(request):
    return JsonResponse({'csrfToken': get_token(request)})







GROQ_API_KEY = os.environ.get('groq_key')
os.environ["GROQ_API_KEY"] = GROQ_API_KEY

nest_asyncio.apply()

llm = Groq(model="llama-3.1-8b-instant")

Settings.llm = Groq(model="llama-3.1-8b-instant")
Settings.embed_model = HuggingFaceEmbedding()

def generate_response(request, data):
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
    LIMIT = 2000
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
            "BETWEEN %s AND %s AND address=%s AND review LIKE %s ORDER BY RONDOM() LIMIT %s;", [ratings, data['years']['start'], data['years']['end'], data['state'], '%'+data['product']+'%', LIMIT])
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
      
    summary_index = SummaryIndex(nodes)

    summary_query_engine = summary_index.as_query_engine(
      response_mode="simple_summarize",
      use_async=True,
    )
    if data['product']:
      summary = summary_query_engine.query(f"In 150 words or less, summarize these concatenated reviews from several starbucks locations about specifically the {data['product']}?")
    else:
      summary = summary_query_engine.query("In 150 words or less, summarize these cocatenated reviews from several starbucks locations")

    yield json.dumps({'db': str(summary)}) + '\n'
  except GeneratorExit:
    print("Client disconnected early.")
  except Exception as e:
    print("Streaming error:", e)
  except BrokenPipeError:
    print('client stopped the request')


from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
@method_decorator(csrf_exempt, name='dispatch')
class StreamingView(View):
    def post(self, request):
        body = json.loads(request.body)
        # schema = ParamsSchema(**body)
        return StreamingHttpResponse(generate_response(request, body), content_type='application/json')
