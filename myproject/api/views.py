from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime
import investiny

def get_investing_id(ticker, stockExchange, investmentType):
    try:
        search_results = investiny.search_assets(
            query=ticker,
            limit=1,
            type=investmentType,
            exchange=stockExchange
        )
        if search_results:
            matches = [item for item in search_results]
            investing_id = int(matches[0]["ticker"])
            return investing_id
        else:
            raise ValueError(f"No results found for ticker: {ticker}")
    except Exception as e:
        raise ValueError(f"Error searching for ticker: {ticker}. {str(e)}")


class StockDataView(APIView):
    def get(self, request, format=None):
        ticker = request.query_params.get('ticker')
        stockExchange = request.query_params.get('exchange')
        investmentType = request.query_params.get('investmentType')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        start_obj = datetime.strptime(start_date, "%Y-%m-%d")
        start_formatted_date = start_obj.strftime("%m/%d/%Y")
        end_obj = datetime.strptime(end_date, "%Y-%m-%d")
        end_formatted_date = end_obj.strftime("%m/%d/%Y")
        
        try:
            stock_data = investiny.historical_data(
                investing_id=get_investing_id(ticker, stockExchange, investmentType),
                from_date=start_formatted_date,
                to_date=end_formatted_date,
                interval='M'
            )
            return Response(stock_data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)