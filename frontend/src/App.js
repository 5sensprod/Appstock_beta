import React from 'react'
import Header from './components/Header'
import PrintManager from './components/PrintManager'
import ProductList from './components/Products/ProductList'
import { ProductProvider } from './context/ProductContext'
import './App.css'

function App() {
  return (
    <ProductProvider>
      <div className="App">
        <div className="App-header">
          <Header />
          <PrintManager />
        </div>
        <main>
          <ProductList />
        </main>
      </div>
    </ProductProvider>
  )
}

export default App
