import React, {
  useEffect,
  useRef,
  useState
} from 'react'
import * as fabric from 'fabric'
import styles from './FabricDesigner.module.css'

export default function App() {
  const canvasRef = useRef(null)
  const [canvas, setCanvas] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [canvasSize] = useState({
    width: 600,
    height: 350
  })

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(
      canvasRef.current,
      {
        width: canvasSize.width,
        height: canvasSize.height
      }
    )
    setCanvas(fabricCanvas)

    return () => {
      fabricCanvas.dispose()
    }
  }, [canvasSize.width, canvasSize.height])

  useEffect(() => {
    if (canvas) {
      const restrictObjectMovement = (e) => {
        const obj = e.target
        obj.setCoords()
        const boundingRect = obj.getBoundingRect()

        const canvasWidth = canvas.getWidth()
        const canvasHeight = canvas.getHeight()

        // Limite gauche
        if (boundingRect.left < 0) {
          obj.left -= boundingRect.left
        }

        // Limite supérieure
        if (boundingRect.top < 0) {
          obj.top -= boundingRect.top
        }

        // Limite droite
        if (
          boundingRect.left + boundingRect.width >
          canvasWidth
        ) {
          obj.left -=
            boundingRect.left +
            boundingRect.width -
            canvasWidth
        }

        // Limite inférieure
        if (
          boundingRect.top + boundingRect.height >
          canvasHeight
        ) {
          obj.top -=
            boundingRect.top +
            boundingRect.height -
            canvasHeight
        }

        obj.setCoords()
      }

      canvas.on(
        'object:moving',
        restrictObjectMovement
      )
      canvas.on(
        'object:scaling',
        restrictObjectMovement
      )
    }
  }, [canvas])

  const handleZoomChange = (e) => {
    const newZoom = parseFloat(e.target.value)
    const scaleFactor = newZoom / zoomLevel // Calcul du facteur d'échelle
    setZoomLevel(newZoom)

    if (canvas) {
      // Ajuster la taille du canevas
      const newWidth = canvasSize.width * newZoom
      const newHeight =
        canvasSize.height * newZoom
      canvas.setWidth(newWidth)
      canvas.setHeight(newHeight)

      // Mettre à l'échelle tous les objets
      canvas.getObjects().forEach((obj) => {
        // Mettre à l'échelle l'objet
        obj.scaleX = obj.scaleX * scaleFactor
        obj.scaleY = obj.scaleY * scaleFactor

        // Ajuster la position
        obj.left = obj.left * scaleFactor
        obj.top = obj.top * scaleFactor

        obj.setCoords()
      })

      canvas.renderAll()
    }
  }

  const onAddCircle = () => {
    if (canvas) {
      const circle = new fabric.Circle({
        radius: 50,
        fill: 'blue',
        left: 100,
        stroke: '#aaf',
        strokeWidth: 5,
        strokeUniform: true,
        top: 100
      })
      canvas.add(circle)

      // Mettre à l'échelle et positionner l'objet selon le niveau de zoom actuel
      const scaleFactor = zoomLevel
      circle.scaleX = circle.scaleX * scaleFactor
      circle.scaleY = circle.scaleY * scaleFactor
      circle.left = circle.left * scaleFactor
      circle.top = circle.top * scaleFactor
      circle.setCoords()
      canvas.renderAll()
    }
  }

  const onAddRectangle = () => {
    if (canvas) {
      const rectangle = new fabric.Rect({
        width: 100,
        height: 50,
        fill: 'green',
        left: 200,
        top: 100
      })
      canvas.add(rectangle)

      // Mettre à l'échelle et positionner l'objet selon le niveau de zoom actuel
      const scaleFactor = zoomLevel
      rectangle.scaleX =
        rectangle.scaleX * scaleFactor
      rectangle.scaleY =
        rectangle.scaleY * scaleFactor
      rectangle.left =
        rectangle.left * scaleFactor
      rectangle.top = rectangle.top * scaleFactor
      rectangle.setCoords()
      canvas.renderAll()
    }
  }

  const onAddText = () => {
    if (canvas) {
      const itext = new fabric.IText(
        'Votre texte ici',
        {
          left: 150,
          top: 150,
          fontSize: 30,
          fill: 'black'
        }
      )
      canvas.add(itext)
      canvas.renderAll()
    }
  }

  return (
    <div className={styles.app}>
      <h1>
        FabricJS avec zoom et redimensionnement
      </h1>
      <button
        onClick={onAddCircle}
        className={styles.button}
      >
        Ajouter un cercle
      </button>
      <button
        onClick={onAddRectangle}
        className={styles.button}
      >
        Ajouter un rectangle
      </button>
      <button
        onClick={onAddText}
        className={styles.button}
      >
        Ajouter du texte
      </button>

      {/* Contrôle du zoom */}
      <div className={styles.zoomControl}>
        <label htmlFor="zoom">
          Zoom: {zoomLevel}x
        </label>
        <input
          type="range"
          id="zoom"
          min="0.5"
          max="3"
          step="0.1"
          value={zoomLevel}
          onChange={handleZoomChange}
        />
      </div>

      {/* Conteneur du canevas */}
      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          className={styles.sampleCanvas}
        />
      </div>
    </div>
  )
}
