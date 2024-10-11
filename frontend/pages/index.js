// pages/index.js
import React from 'react'
import Header from '../components/Header'
import PrintManager from '../components/PrintManager'
import ProductList from '../components/Products/ProductList'
import { ProductProvider } from '../context/ProductContext'

export default function Home() {
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
