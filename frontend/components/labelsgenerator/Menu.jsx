// components/labels/Menu.jsx

import React, { useState, useEffect } from 'react'
import {
  faShapes,
  faTextHeight,
  faImage,
  faQrcode,
  faFileCsv
} from '@fortawesome/free-solid-svg-icons'
import IconButton from '../ui/IconButton'
import ShapeMenu from './menus/ShapeMenu'
import TextMenu from './menus/TextMenu'
import ImageMenu from './menus/ImageMenu'
import QrMenu from './menus/QrMenu'
import CSVImporter from './CSVImporter'
import { useCanvas } from '../../context/CanvasContext'

const Menu = () => {
  const [activeMenu, setActiveMenu] = useState(null)
  const [selectedQrText, setSelectedQrText] = useState('')

  // Largeurs fixes pour chaque sous-menu
  const shapeMenuWidth = 89
  const textMenuWidth = 200
  const imageMenuWidth = 280
  const qrMenuWidth = 225
  const importMenuWidth = 300

  const {
    onAddCircle,
    onAddRectangle,
    onAddText,
    onAddImage,
    onAddQrCode,
    selectedObject,
    isQRCodeSelected,
    onUpdateQrCode
  } = useCanvas()

  useEffect(() => {
    const qrCodeSelected = isQRCodeSelected()

    if (selectedObject?.type === 'circle' || selectedObject?.type === 'rect') {
      setActiveMenu('shapes')
    } else if (selectedObject?.type === 'i-text' || selectedObject?.type === 'textbox') {
      setActiveMenu('text')
    } else if (selectedObject?.type === 'image') {
      if (qrCodeSelected) {
        setActiveMenu('qrcode')
        setSelectedQrText(selectedObject.qrText || '')
        console.log('Menu actif : qrcode', 'Texte QR sélectionné:', selectedObject.qrText)
      } else {
        setActiveMenu('images')
      }
    } else {
      setActiveMenu(null)
    }
  }, [selectedObject, isQRCodeSelected])

  const toggleMenu = (menu) => {
    if (activeMenu === menu) {
      setActiveMenu(null)
      setSelectedQrText('')
    } else {
      if (menu === 'qrcode' && !isQRCodeSelected()) {
        setSelectedQrText('')
      }
      setActiveMenu(menu)
    }
  }

  return (
    <div className="relative flex items-center gap-4 p-4">
      {/* Bouton et menu pour les formes */}
      <div className="relative">
        <IconButton
          onClick={() => toggleMenu('shapes')}
          icon={faShapes}
          title="Afficher les formes"
          className={`${activeMenu === 'shapes' ? 'bg-blue-300' : 'bg-blue-500'}`}
          size="w-12 h-12"
          iconSize="text-3xl"
        />
        {activeMenu === 'shapes' && (
          <div className="absolute left-full top-0 ml-2" style={{ width: `${shapeMenuWidth}px` }}>
            <ShapeMenu
              onAddCircle={onAddCircle}
              onAddRectangle={onAddRectangle}
              onUpdateQrCode={onUpdateQrCode}
            />
          </div>
        )}
      </div>

      {/* Bouton et menu pour le texte */}
      <div
        className="relative"
        style={{
          marginLeft: activeMenu === 'shapes' ? `${shapeMenuWidth}px` : '0px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <IconButton
          onClick={() => toggleMenu('text')}
          icon={faTextHeight}
          title="Afficher le texte"
          className={`${activeMenu === 'text' ? 'bg-blue-300' : 'bg-blue-500'}`}
          size="w-12 h-12"
          iconSize="text-3xl"
        />
        {activeMenu === 'text' && (
          <div className="absolute left-full top-0 ml-2" style={{ width: `${textMenuWidth}px` }}>
            <TextMenu onAddText={onAddText} selectedObject={selectedObject} />
          </div>
        )}
      </div>

      {/* Bouton et menu pour les images */}
      <div
        className="relative"
        style={{
          marginLeft: activeMenu === 'text' ? `${textMenuWidth}px` : '0px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <IconButton
          onClick={() => toggleMenu('images')}
          icon={faImage}
          title="Afficher les images"
          className={`${activeMenu === 'images' ? 'bg-blue-300' : 'bg-blue-500'}`}
          size="w-12 h-12"
          iconSize="text-3xl"
        />
        {activeMenu === 'images' && (
          <div className="absolute left-full top-0 ml-2" style={{ width: `${imageMenuWidth}px` }}>
            <ImageMenu onAddImage={onAddImage} />
          </div>
        )}
      </div>

      {/* Bouton et menu pour les QR codes */}
      <div
        className="relative"
        style={{
          marginLeft: activeMenu === 'images' ? `${imageMenuWidth}px` : '0px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <IconButton
          onClick={() => toggleMenu('qrcode')}
          icon={faQrcode}
          title="Ajouter un QR Code"
          className={`${activeMenu === 'qrcode' ? 'bg-blue-300' : 'bg-blue-500'}`}
          size="w-12 h-12"
          iconSize="text-3xl"
        />
        {activeMenu === 'qrcode' && (
          <div className="absolute left-full top-0 ml-2" style={{ width: `${qrMenuWidth}px` }}>
            <QrMenu
              onAddQrCode={onAddQrCode}
              selectedQrText={selectedQrText}
              onUpdateQrCode={onUpdateQrCode}
            />
          </div>
        )}
      </div>

      {/* Bouton et menu pour importer un fichier CSV */}
      <div
        className="relative"
        style={{
          marginLeft: activeMenu === 'qrcode' ? `${qrMenuWidth}px` : '0px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <IconButton
          onClick={() => toggleMenu('import')}
          icon={faFileCsv}
          title="Importer CSV"
          className={`${activeMenu === 'import' ? 'bg-blue-300' : 'bg-blue-500'}`}
          size="w-12 h-12"
          iconSize="text-3xl"
        />
        {activeMenu === 'import' && (
          <div className="absolute left-full top-0 ml-2" style={{ width: `${importMenuWidth}px` }}>
            <CSVImporter />
          </div>
        )}
      </div>
    </div>
  )
}

export default Menu
