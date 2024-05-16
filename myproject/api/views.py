from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime
import yfinance
import yfinance.scrapers
import yfinance.scrapers.history
import json

class StockDataView(APIView):
    def get(self, request, format=None):
        ticker = request.query_params.get('ticker')
        start_date = request.query_params.get('startdate')
        end_date = request.query_params.get('enddate')

        if not start_date or not end_date:
            return Response({'error': 'Both startdate and enddate parameters are required'}, status=400)

        try:
            # Download stock data using yfinance
            stock_data = yfinance.download(ticker, start=start_date, end=end_date)
            all_dividends = yfinance.Ticker(ticker=ticker).dividends
            print(all_dividends)
            filtered_dividends = all_dividends.loc[start_date:end_date]
            # Extract dates and close prices from the stock data
            dates = stock_data.index.strftime('%Y-%m-%d').tolist()  # Convert DatetimeIndex to list of date strings
            close_prices = stock_data['Close'].tolist()  # Convert close prices to list
            dividends_list = [(date.strftime('%Y-%m-%d'), dividend) for date, dividend in filtered_dividends.items()]

            # Create a dictionary with dates and close prices
            data_map = {'dates': dates, 'close_prices': close_prices, 'dividends': dividends_list}

            # Serialize the dictionary to JSON
            json_data = json.dumps(data_map)
            print("API Response:", json_data)
            # Return JSON response
            return Response(json_data)
        except Exception as e:
            return Response({'error': str(e)}, status=500)