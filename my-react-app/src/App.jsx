import { useState } from 'react'
import React from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import StockData from './components/StockData';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>     
      <div>
        <h1>Stock Data</h1>
        <StockData />
      </div>
    </>
  )
}

export default App
