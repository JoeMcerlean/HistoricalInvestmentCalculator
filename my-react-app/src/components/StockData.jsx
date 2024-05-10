import React, { useState } from 'react';

const StockData = () => {
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState(null);
  const [finalValue, setFinalValue] = useState(null);
  const [intermediateValues, setIntermediateValues] = useState([]);
  const [ticker, setTicker] = useState('');
  const [exchange, setExchange] = useState('');
  const [investmentType, setInvestmentType] = useState('');
  const [initialInvestment, setInitialInvestment] = useState('');
  const [recurringInvestment, setRecurringInvestment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleTickerChange = (event) => {
    setTicker(event.target.value);
  };

  const handleExchangeChange = (event) => {
    setExchange(event.target.value);
  };

  const handleInvestmentTypeChange = (event) => {
    setInvestmentType(event.target.value);
  };

  const handleInitialInvestmentChange = (event) => {
    setInitialInvestment(event.target.value);
  };

  const handleRecurringInvestmentChange = (event) => {
    setRecurringInvestment(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const fetchStockData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/stock-data/?ticker=${ticker}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setStockData(data);
      calculateFinalValue(data.close);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const calculateFinalValue = (prices) => {
    const initialAmount = parseFloat(initialInvestment);
    const additionalAmount = parseFloat(recurringInvestment);
  
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const timeDiff = Math.abs(endDateObj - startDateObj);
    const yearsDiff = Math.floor(timeDiff / (1000 * 3600 * 24 * 365));
  
    const intermediateValues = [];
    let currentShares = initialAmount / prices[0];
  
    prices.forEach((currentPrice, index) => {
      const totalAmount = currentShares * currentPrice + additionalAmount;
      currentShares = totalAmount / currentPrice;
  
      const currentDate = new Date(startDateObj);
      currentDate.setDate(currentDate.getDate() + index);
      const currentYear = currentDate.getFullYear();
      const startYear = startDateObj.getFullYear();
  
      if ((currentYear - startYear) % 1 === 0 || index === prices.length - 1) {
        const intermediateValue = currentShares * currentPrice;
        intermediateValues.push(intermediateValue);
      }
    });
  
    const finalValue = currentShares * prices[prices.length - 1];
    setFinalValue(finalValue);
    setIntermediateValues(intermediateValues);
  };

  return (
    <div>
      <div>
        <label htmlFor="ticker">Ticker:</label>
        <input
          type="text"
          id="ticker"
          value={ticker}
          onChange={handleTickerChange}
        />
        <div>
        <label htmlFor="exchange">Exchange (LONDON, NYSE, NASDAQ):</label>
        <input
          type="text"
          id="exchange"
          value={exchange}
          onChange={handleExchangeChange}
        />
        </div>
        <div>
        <label htmlFor="investmentType">Type (Stock, ETF):</label>
        <input
          type="text"
          id="investmentType"
          value={investmentType}
          onChange={handleInvestmentTypeChange}
        />
        </div>
        <div>
          <label htmlFor="initialInvestment">Initial Investment Amount:</label>
          <input
            type="number"
            id="initialInvestment"
            value={initialInvestment}
            onChange={handleInitialInvestmentChange}
          />
        </div>
        <div>
          <label htmlFor="recurringInvestment">Recurring Investment Amount:</label>
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
      {finalValue && (
        <div>
          <h2>Final Value: {finalValue.toFixed(2)}</h2>
          <h3>Intermediate Values:</h3>
          <ul>
            {intermediateValues.map((value, index) => (
              <li key={index}>
                Month {index}: {value.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StockData;