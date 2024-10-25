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
import ImportMenu from './menus/ImportMenu'
import { useCanvas } from '../../context/CanvasContext'

const Menu = () => {
  const [activeMenu, setActiveMenu] = useState(null)
  const [selectedQrText, setSelectedQrText] = useState('') // État pour le texte QR code sélectionné

  // Largeurs fixes pour chaque sous-menu
  const shapeMenuWidth = 135
  const textMenuWidth = 250
  const imageMenuWidth = 300
  const qrMenuWidth = 300
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
    const qrCodeSelected = isQRCodeSelected() // Appel de la fonction mémorisée

    if (selectedObject?.type === 'circle' || selectedObject?.type === 'rect') {
      setActiveMenu('shapes')
    } else if (selectedObject?.type === 'i-text' || selectedObject?.type === 'textbox') {
      setActiveMenu('text')
    } else if (selectedObject?.type === 'image') {
      if (qrCodeSelected) {
        setActiveMenu('qrcode')
        setSelectedQrText(selectedObject.qrText || '') // Récupérer le texte associé au QR code
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
      setSelectedQrText('') // Réinitialiser le texte lorsque le menu se ferme
    } else {
      if (menu === 'qrcode' && !isQRCodeSelected()) {
        setSelectedQrText('') // Si vous ouvrez le menu QR pour un nouveau code, réinitialiser le texte
      }
      setActiveMenu(menu)
    }
  }

  return (
    <div className="relative flex items-start gap-4 p-4">
      {/* Bouton et menu pour les formes */}
      <div className="relative">
        <IconButton
          onClick={() => toggleMenu('shapes')}
          icon={faShapes}
          title="Afficher les formes"
          className={`${activeMenu === 'shapes' ? 'bg-blue-300' : 'bg-blue-500'}`}
          size="w-16 h-16"
          iconSize="text-3xl"
        />
        {activeMenu === 'shapes' && (
          <div className="absolute left-full top-0 ml-2" style={{ width: `${shapeMenuWidth}px` }}>
            <ShapeMenu onAddCircle={onAddCircle} onAddRectangle={onAddRectangle} />
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
          size="w-16 h-16"
          iconSize="text-3xl"
        />
        {activeMenu === 'text' && (
          <div className="absolute left-full top-0 ml-2" style={{ width: `${textMenuWidth}px` }}>
            <TextMenu onAddText={onAddText} />
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
          size="w-16 h-16"
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
          size="w-16 h-16"
          iconSize="text-3xl"
        />
        {activeMenu === 'qrcode' && (
          <div className="absolute left-full top-0 ml-2" style={{ width: `${qrMenuWidth}px` }}>
            <QrMenu
              onAddQrCode={onAddQrCode}
              selectedQrText={selectedQrText}
              onUpdateQrCode={onUpdateQrCode} // Passer la fonction de mise à jour
            />
          </div>
        )}
      </div>

      {/* Bouton et menu pour importer un fichier CSV */}
      <div
        className="relative"
        style={{
          marginLeft: activeMenu === 'qrcode' ? `${imageMenuWidth}px` : '0px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <IconButton
          onClick={() => toggleMenu('import')}
          icon={faFileCsv}
          title="Importer CSV"
          className={`${activeMenu === 'import' ? 'bg-blue-300' : 'bg-blue-500'}`}
          size="w-16 h-16"
          iconSize="text-3xl"
        />
        {activeMenu === 'import' && (
          <div className="absolute left-full top-0 ml-2" style={{ width: `${importMenuWidth}px` }}>
            <ImportMenu />
          </div>
        )}
      </div>
    </div>
  )
}

export default Menu
