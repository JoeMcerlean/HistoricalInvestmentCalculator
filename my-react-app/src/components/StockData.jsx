import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import StockInputs from './StockInputs';
import VisxLineChart from './VisxLineChart';
import styles from './StockData.module.css';


const StockData = () => {
  const [stockInputs, setStockInputs] = useState([{ id: 1, ticker: '', initialInvestment: '', recurringInvestment: '' }]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stockDataList, setStockDataList] = useState([]);
  const [errors, setErrors] = useState([]);
  const [finalIntermediateValues, setFinalIntermediateValues] = useState([]);
  const [finalValue, setFinalValue] = useState([]);
  const [reinvestDividends, setReinvestDividends] = useState({});
  const [annualDepositIncrease, setAnnualDepositIncrease] = useState();

  const handleReinvestDividendsChange = (id, isChecked) => {
    setReinvestDividends(prevState => ({
      ...prevState,
      [id]: isChecked,
    }));
  };
  
  const handleAddStock = () => {
    const newId = stockInputs.length + 1;
    setStockInputs([...stockInputs, { id: newId, ticker: '', initialInvestment: '', recurringInvestment: '' }]);
  };

  const handleRemoveStock = (idToRemove) => {
    const updatedStocks = stockInputs.filter(stock => stock.id !== idToRemove);
    setStockInputs(updatedStocks);
  };

  const handleTickerChange = (id, event) => {
    const updatedStockInputs = stockInputs.map((input) => {
      if (input.id === id) {
        return { ...input, ticker: event.target.value };
      }
      return input;
    });
    setStockInputs(updatedStockInputs);
  };

  const handleInitialInvestmentChange = (id, event) => {
    const updatedStockInputs = stockInputs.map((input) => {
      if (input.id === id) {
        return { ...input, initialInvestment: event.target.value };
      }
      return input;
    });
    setStockInputs(updatedStockInputs);
  };

  const handleRecurringInvestmentChange = (id, event) => {
    const updatedStockInputs = stockInputs.map((input) => {
      if (input.id === id) {
        return { ...input, recurringInvestment: event.target.value };
      }
      return input;
    });
    setStockInputs(updatedStockInputs);
  };

  const handleAnnualDepositIncreaseChange = (event) => {
    setAnnualDepositIncrease(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const fetchStockData = async () => {
    const updatedStockDataList = [];
    const updatedErrors = [];

    for (const input of stockInputs) {
      try {
        const response = await fetch(`http://localhost:8000/api/stock-data/?ticker=${input.ticker}&startdate=${startDate}&enddate=${endDate}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonString = await response.json();
        const data = JSON.parse(jsonString);
        const finalValue = calculateFinalValue(data.close_prices, data.dates, data.dividends, input.initialInvestment, input.recurringInvestment, input.id);
        updatedStockDataList.push({ id: input.id, data, finalValue });
      } catch (error) {
        updatedErrors.push({ id: input.id, error: error.message });
      }
    }

    const maxLength = Math.max(...updatedStockDataList.map(item => item.finalValue.intermediateValues.length));
    const sumsArray = new Array(maxLength).fill(0);
    const dates = new Array(maxLength).fill(0);

    updatedStockDataList.forEach(item => {
      item.finalValue.intermediateValues.forEach((intermediateItem, index) => {
        sumsArray[index] += intermediateItem.value;
        dates[index] = intermediateItem.date;
      });
    });

    const data = dates.map((date, index) => ({
      date: date,
      value: sumsArray[index]
    }));

    const totalFinalValue = updatedStockDataList.reduce((sum, item) => {
      return sum + item.finalValue.finalValue;
    }, 0);

    setFinalValue(totalFinalValue);
    setFinalIntermediateValues(data);
    setStockDataList(updatedStockDataList);
    setErrors(updatedErrors);
  };

  const calculateFinalValue = (prices, dates, dividends, initialInvestment, recurringInvestment, id) => {
    if (!prices || prices.length === 0 || !dates || dates.length === 0) {
      console.log('Invalid prices or dates data');
      return null;
    }
    let totalAmount = 0;
    const intermediateValues = [];
    let currentShares = parseFloat(initialInvestment) / prices[0];
    let prevMonth = new Date(dates[0]).getMonth();
    let totalValue = parseFloat(initialInvestment);
    let recurringInvestmentValue = parseFloat(recurringInvestment);
    let prevYear = new Date(dates[0]).getFullYear();

    prices.forEach((currentPrice, index) => {
      const currentDate = new Date(dates[index]);
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      if (currentMonth !== prevMonth) {
        let dividendTotal = 0;
        dividends.forEach((dividend) => {
          const dividendDate = new Date(dividend[0]);
          if (dividendDate.getMonth() === prevMonth && dividendDate.getFullYear() === currentDate.getFullYear()) {
              dividendTotal += dividend[1] * currentShares; // Multiply dividend by currentShares
          }
        });
        
        if(currentYear !== prevYear && annualDepositIncrease != null) {
          recurringInvestmentValue = recurringInvestmentValue * (1+(annualDepositIncrease/100))
        }

        if(reinvestDividends[id]) {
          totalAmount = currentShares * currentPrice + parseFloat(recurringInvestmentValue) + parseFloat(dividendTotal);
        }
        else {
          totalAmount = currentShares * currentPrice + parseFloat(recurringInvestmentValue)
        }
        currentShares = totalAmount / currentPrice;
        const intermediateValue = totalAmount;
        intermediateValues.push({ date: dates[index], value: intermediateValue });
        prevMonth = currentMonth;
        prevYear = currentYear;
        totalValue = intermediateValue;
      }
    });

    const finalValue = totalValue;
    return { finalValue, intermediateValues };
  };

  return (
    <div>
      {stockInputs.map((input) => (
        <div key={input.id}>
          <StockInputs
            id={input.id}
            ticker={input.ticker}
            initialInvestment={input.initialInvestment}
            recurringInvestment={input.recurringInvestment}
            onTickerChange={(event) => handleTickerChange(input.id, event)}
            onInitialInvestmentChange={(event) => handleInitialInvestmentChange(input.id, event)}
            onRecurringInvestmentChange={(event) => handleRecurringInvestmentChange(input.id, event)}
            onReinvestDividendsChange={handleReinvestDividendsChange}
            onRemove={handleRemoveStock}
          />
        </div>
      ))}
      <button onClick={handleAddStock}>Add Stock</button>
      <div className={styles.stockDataBox}>
      <div>
        <label htmlFor="annualDepositIncrease">Annual Deposit % Increase:</label>
        <input
          type="number"
          id="annualDepositIncrease"
          value={annualDepositIncrease}
          onChange={handleAnnualDepositIncreaseChange}
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
      {stockDataList.length > 0 && (
      <div>
        <h2>
          Final Value:{' '}
          {finalValue.toFixed(2)}
        </h2>
        <LineChart width={800} height={400} data={finalIntermediateValues}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
        <VisxLineChart width={800} height={400} data={finalIntermediateValues}></VisxLineChart>
        <ul>
          {stockDataList.flatMap(stockData => stockData.finalValue.intermediateValues).map((item, index) => (
            <li key={index}>
              Month {index}: {item.value.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
      )}

      {errors.map((error) => (
        <div key={error.id}>
          <h2>Stock ID: {error.id}</h2>
          <div>Error: {error.error}</div>
        </div>
      ))}
    </div>
  );
};

export default StockData;