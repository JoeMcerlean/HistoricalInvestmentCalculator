import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const StockData = () => {
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState(null);
  const [finalValue, setFinalValue] = useState(null);
  const [intermediateValues, setIntermediateValues] = useState([]);
  const [ticker, setTicker] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [initialInvestment, setInitialInvestment] = useState('');
  const [recurringInvestment, setRecurringInvestment] = useState('');

  const handleTickerChange = (event) => {
    setTicker(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const handleInitialInvestmentChange = (event) => {
    setInitialInvestment(event.target.value);
  };

  const handleRecurringInvestmentChange = (event) => {
    setRecurringInvestment(event.target.value);
  };

  const fetchStockData = async (retryCount = 3) => {
    try {
      const response = await fetch(`http://localhost:8000/api/stock-data/?ticker=${ticker}&startdate=${startDate}&enddate=${endDate}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const jsonString = await response.json();
      const data = JSON.parse(jsonString); // Parse the JSON string
      setStockData(data);
      calculateFinalValue(data.close_prices, data.dates);
      setError(null);
    } catch (error) {
      if (retryCount > 0) {
        // Retry the API call
        console.log(`Retrying API call. Retries left: ${retryCount}`);
        setTimeout(() => fetchStockData(retryCount - 1), 1000); // Retry after 1 second
      } else {
        setError(error.message);
        setStockData(null);
        setFinalValue(null);
        setIntermediateValues([]);
      }
    }
  };

  const calculateFinalValue = (prices, dates) => {
    if (!prices || prices.length === 0 || !dates || dates.length === 0) {
      return;
    }
    const intermediateValues = [];
    let currentShares = initialInvestment / prices[0];
    let prevMonth = new Date(dates[0]).getMonth();

    prices.forEach((currentPrice, index) => {
      const currentDate = new Date(dates[index]);
      const currentMonth = currentDate.getMonth();
  
      if (currentMonth !== prevMonth) {
        const totalAmount = currentShares * currentPrice + parseFloat(recurringInvestment);
        currentShares = totalAmount / currentPrice;
        const intermediateValue = currentShares * currentPrice;
        intermediateValues.push({ date: dates[index], value: intermediateValue });
        prevMonth = currentMonth;
      }
    });

    const finalValue = currentShares * prices[prices.length - 1];
    setFinalValue(finalValue);
    setIntermediateValues(intermediateValues);
  };

  return (
    <div>
      <div>
        <div>
          <label htmlFor="ticker">Ticker:</label>
          <input
            type="text"
            id="ticker"
            value={ticker}
            onChange={handleTickerChange}
          />
        </div>
        <div>
          <label htmlFor="initialInvestment">Initial Investment:</label>
          <input
            type="number"
            id="initialInvestment"
            value={initialInvestment}
            onChange={handleInitialInvestmentChange}
          />
        </div>
        <div>
          <label htmlFor="recurringInvestment">Recurring Investment:</label>
          <input
            type="number"
            id="recurringInvestment"
            value={recurringInvestment}
            onChange={handleRecurringInvestmentChange}
          />
        </div>
        <div>
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={handleStartDateChange}
          />
        </div>
        <div>
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </div>
        <button onClick={fetchStockData}>Fetch Stock Data</button>
      </div>
      {error && <div>Error: {error}</div>}
      {stockData && (
        <div>
          {finalValue && (
            <div>
              <h2>Final Value: {finalValue.toFixed(2)}</h2>
              {intermediateValues.length > 0 && (
                <div>
                  <h3>Intermediate Values:</h3>
                  <LineChart width={800} height={400} data={intermediateValues}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                  <ul>
                  {intermediateValues.map((item, index) => (
                    <li key={index}>
                      Month {index}: {item.value.toFixed(2)}
                    </li>
                   ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockData;