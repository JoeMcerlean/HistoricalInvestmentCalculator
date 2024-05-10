import React, { useState, useEffect } from 'react';

const StockData = () => {
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState(null);
  const [finalValue, setFinalValue] = useState(null);
  const [intermediateValues, setIntermediateValues] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/stock-data/?ticker=NVDA');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setStockData(data);
        calculateFinalValue(data.close);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  const calculateFinalValue = (prices) => {
    const initialAmount = 10000;
    const additionalAmount = 1000;
    const intervalMonths = 12;

    const intermediateValues = [];
    let currentShares = initialAmount / prices[0];

    prices.forEach((currentPrice, index) => {
      const totalAmount = currentShares * currentPrice + additionalAmount;
      currentShares = totalAmount / currentPrice;

      if ((index + 1) % intervalMonths === 0 || index === prices.length - 1) {
        const intermediateValue = currentShares * currentPrice;
        intermediateValues.push(intermediateValue);
      }
    });

    const finalValue = currentShares * prices[prices.length - 1];
    setFinalValue(finalValue);
    setIntermediateValues(intermediateValues);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!stockData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Stock Data:</h2>
      <p>Date: {stockData.date.join(', ')}</p>
      {finalValue && (
        <div>
          <h2>Final Value: {finalValue.toFixed(2)}</h2>
          <h3>Intermediate Values:</h3>
          <ul>
            {intermediateValues.map((value, index) => (
              <li key={index}>
                Year {index}: {value.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StockData;