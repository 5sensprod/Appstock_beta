import React from 'react'
import Header from '../components/Header' // Import du composant Header
import PrintManager from '../components/PrintManager' // Import du PrintManager
import ProductList from '../components/Products/ProductList' // Import du ProductList
import { ProductProvider } from '../context/ProductContext' // Import du ProductProvider
import UpdateNotification from '../components/UpdateNotification' // Import du UpdateNotification

export default function Home() {
  return (
    <ProductProvider>
      <div>
        <Header /> {/* Réintégration du Header */}
        <h1 className="py-6 text-center text-4xl">
          Bienvenue sur la page d'accueil
        </h1>
        <PrintManager />{' '}
        {/* Réintégration du PrintManager */}
        <main>
          <ProductList />{' '}
          {/* Réintégration du ProductList */}
        </main>
        <UpdateNotification />{' '}
        {/* Réintégration du UpdateNotification */}
      </div>
    </ProductProvider>
  )
}
