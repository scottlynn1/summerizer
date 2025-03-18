from ninja import NinjaAPI
from django.http import HttpResponse, HttpResponseRedirect
import json
from django.http import JsonResponse


api = NinjaAPI()

@api.post("/")
def hello(request):
  print('api called')
  return JsonResponse(json.dumps({'db': 'data'}))
