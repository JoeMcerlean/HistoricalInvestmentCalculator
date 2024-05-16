import React from 'react';
import styles from './StockInputs.module.css';

const StockInputs = ({ id, ticker, initialInvestment, recurringInvestment, reinvestDividends, onTickerChange, onInitialInvestmentChange, onRecurringInvestmentChange, onReinvestDividendsChange, onRemove }) => {
  return (
    <div className={styles.stockInputBox}>
      <div>
        <label htmlFor={`ticker-${id}`}>Ticker:</label>
        <input
          type="text"
          id={`ticker-${id}`}
          value={ticker}
          onChange={onTickerChange}
        />
      </div>
      <div>
        <label htmlFor={`initialInvestment-${id}`}>Initial Investment:</label>
        <input
          type="number"
          id={`initialInvestment-${id}`}
          value={initialInvestment}
          onChange={onInitialInvestmentChange}
        />
      </div>
      <div>
        <label htmlFor={`recurringInvestment-${id}`}>Recurring Investment:</label>
        <input
          type="number"
          id={`recurringInvestment-${id}`}
          value={recurringInvestment}
          onChange={onRecurringInvestmentChange}
        />
      </div>
      <div>
        <input
          type="checkbox"
          id={`reinvestDividends-${id}`}
          checked={reinvestDividends}
          onChange={(event) => onReinvestDividendsChange(id, event.target.checked)}
        />
        <label htmlFor={`reinvestDividends-${id}`}>Reinvest Dividends</label>
      </div>
      <button 
        className={styles.removeButton}
        onClick={() => onRemove(id)}>Remove</button>
    </div>
  );
};

export default StockInputs;

