from ninja import NinjaAPI
from django.http import JsonResponse
from .models import Reviews
from django.db import connection


api = NinjaAPI()

@api.post("/")
def hello(request):
  print(request.headers['X-CSRFToken'])
  print('api called')
  with connection.cursor() as cursor:
    cursor.execute("SELECT review FROM reviews LIMIT 1;")
    print(cursor.fetchone()[0])
  # print(Reviews.objects.get(pk=1))
  return JsonResponse({'db': 'data'})
