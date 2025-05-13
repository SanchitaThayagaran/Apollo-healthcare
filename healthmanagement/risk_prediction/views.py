from django.shortcuts import render
import requests
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

# Create your views here.

class RiskPredictionView(APIView):
    def post(self, request):
        external_url = 'https://api.endeavourpredict.org/dev/epredict/Prediction'
        api_key = '90a3763f-4ffb-41eb-bee2-369ed972c1a0'
        payload = request.data
        headers = {
            'accept': 'application/json',
            'X-Gravitee-Api-Key': api_key,
            'Content-Type': 'application/json',
        }
        try:
            response = requests.post(external_url, json=payload, headers=headers, timeout=15)
            if response.status_code == 200:
                data = response.json()
                # Parse important fields
                result = {
                    'riskScore': None,
                    'heartAge': None,
                    'typicalScore': None,
                    'calculationMeta': None,
                    'message': None
                }
                try:
                    engine_results = data.get('engineResults', [])
                    if engine_results:
                        qrisk = engine_results[0]
                        # Find risk score and heart age
                        for r in qrisk.get('results', []):
                            if r.get('id', '').endswith('Qrisk3') or r.get('id', '').endswith('QDiabetes'):
                                result['riskScore'] = r.get('score')
                                result['typicalScore'] = r.get('typicalScore')
                            if r.get('id', '').endswith('Qrisk3HeartAge'):
                                result['heartAge'] = r.get('score')
                        # Calculation meta
                        meta = qrisk.get('calculationMeta', {})
                        result['calculationMeta'] = {
                            'engineResultStatus': meta.get('engineResultStatus'),
                            'engineResultStatusReason': meta.get('engineResultStatusReason')
                        }
                        # Message
                        if qrisk.get('results') and len(qrisk['results']) > 0:
                            result['message'] = qrisk['results'][0].get('message')
                except Exception as e:
                    result['message'] = f'Error parsing response: {str(e)}'
                return Response(result, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'External API error',
                    'status_code': response.status_code,
                    'details': response.text
                }, status=status.HTTP_502_BAD_GATEWAY)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
