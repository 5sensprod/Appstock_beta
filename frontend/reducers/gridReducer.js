//frontend\reducers\gridReducer.js
import {
  validateConfig,
  generateGrid,
  calculateGridDimensions,
  withUndoRedo
} from '../utils/gridUtils'

export const initialGridState = {
  config: {
    cellWidth: 48.5,
    cellHeight: 25,
    offsetTop: 22,
    offsetLeft: 8,
    spacingHorizontal: 0,
    spacingVertical: 0,
    pageWidth: 210,
    pageHeight: 297,
    backgroundColor: 'white'
  },
  grid: [],
  selectedCellId: null,
  cellContents: {},
  clipboard: null,
  linkedGroups: [],
  currentPage: 0,
  totalPages: 1,
  undoStack: [],
  redoStack: []
}

export function gridReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE_GRID':
      return {
        ...state,
        grid: action.payload.grid,
        cellsPerPage: action.payload.cellsPerPage,
        selectedCellId: action.payload.grid.length > 0 ? action.payload.grid[0].id : null
      }
    case 'UPDATE_CONFIG': {
      const updatedConfig = validateConfig({ ...state.config, ...action.payload })

      const dimensionsChanged = [
        'cellWidth',
        'cellHeight',
        'spacingHorizontal',
        'spacingVertical',
        'pageWidth',
        'pageHeight'
      ].some((prop) => action.payload[prop] !== undefined)

      if (dimensionsChanged) {
        const { cellsPerPage } = calculateGridDimensions(updatedConfig)
        return {
          ...state,
          config: updatedConfig,
          cellsPerPage
        }
      }

      return {
        ...state,
        config: updatedConfig
      }
    }
    case 'SET_PAGE': {
      const { page } = action.payload
      return {
        ...state,
        currentPage: Math.min(Math.max(0, page), state.totalPages - 1)
      }
    }

    case 'SELECT_CELL':
      return {
        ...state,
        selectedCellId: action.payload
      }

    case 'IMPORT_CSV': {
      const importedData = importCsvData(state, action.payload)
      return withUndoRedo(state, {
        ...state,
        ...importedData
      })
    }

    case 'UPDATE_CELL_CONTENT': {
      const { id, content } = action.payload

      // Fonction utilitaire pour fusionner les propriétés
      const mergeItemProperties = (existingItem, newItem) => ({
        ...newItem,
        type: newItem.type,
        linkedByCsv: existingItem?.linkedByCsv || false
      })

      const newCellContents = { ...state.cellContents }
      const existingContent = state.cellContents[id] || []

      // Mise à jour simplifiée du contenu
      const updatedContent = content.map((item) =>
        mergeItemProperties(
          existingContent.find((oldItem) => oldItem.id === item.id),
          item
        )
      )

      // Gestion de la suppression de cellule
      if (!updatedContent.some((obj) => obj.type !== 'text' || obj.text?.trim())) {
        delete newCellContents[id]
      } else {
        newCellContents[id] = updatedContent
      }

      return withUndoRedo(state, { ...state, cellContents: newCellContents })
    }

    case 'SYNC_CELL_LAYOUT': {
      const { sourceId, layout } = action.payload

      // Trouver le groupe lié
      const linkedGroup = state.linkedGroups.find((group) => group.includes(sourceId))
      if (!linkedGroup) return state

      // Tableau des propriétés partagées par plusieurs types
      const commonProperties = [
        'left',
        'top',
        'scaleX',
        'scaleY',
        'fill',
        'fontFamily',
        'fontSize',
        'angle'
      ]

      // Fonction générique de mise à jour des propriétés
      const updateItemProperties = (item, layoutItem) => {
        const updatedItem = { ...item }

        // Mise à jour des propriétés communes
        commonProperties.forEach((prop) => {
          if (layoutItem[prop] !== undefined) {
            updatedItem[prop] = layoutItem[prop]
          }
        })

        // Propriétés spécifiques par type
        const typeSpecificProps = {
          textbox: ['width'],
          rect: ['width', 'height'],
          circle: ['radius']
        }

        const specificProps = typeSpecificProps[item.type] || []
        specificProps.forEach((prop) => {
          if (layoutItem[prop] !== undefined) {
            updatedItem[prop] = layoutItem[prop]
          }
        })

        return updatedItem
      }

      const updatedCellContents = { ...state.cellContents }

      linkedGroup.forEach((cellId) => {
        if (updatedCellContents[cellId]) {
          updatedCellContents[cellId] = updatedCellContents[cellId].map((item) => {
            const layoutItem = layout[item.id] || {}
            return updateItemProperties(item, layoutItem)
          })
        }
      })

      return {
        ...state,
        cellContents: updatedCellContents
      }
    }
    case 'COPY_CELL': {
      const { cellId } = action.payload

      // Récupérer le contenu actuel de la cellule ou considérer comme vide
      const cellContent = state.cellContents[cellId] || []

      // Si la cellule est vide, ne rien faire
      if (cellContent.length === 0) return state

      // Sauvegarde automatique avant de copier
      const updatedCellContents = {
        ...state.cellContents,
        [cellId]: [...cellContent] // Cloner le contenu pour éviter les mutations
      }

      // Vérifier si la cellule appartient déjà à un groupe lié
      const existingGroupIndex = state.linkedGroups.findIndex((group) => group.includes(cellId))

      if (existingGroupIndex === -1) {
        // Si la cellule copiée n'est pas encore dans un groupe lié, créer un nouveau groupe
        return {
          ...state,
          clipboard: { cellId }, // Ajouter la cellule au presse-papiers
          cellContents: updatedCellContents, // Mettre à jour les contenus après sauvegarde
          linkedGroups: [...state.linkedGroups, [cellId]] // Ajouter un nouveau groupe lié
        }
      }

      // Si la cellule appartient déjà à un groupe lié
      return {
        ...state,
        clipboard: { cellId }, // Ajouter la cellule au presse-papiers
        cellContents: updatedCellContents // Mettre à jour les contenus après sauvegarde
      }
    }

    case 'PASTE_CELL': {
      const { cellId } = action.payload // ID de la cellule où coller
      const clipboardContent = state.cellContents[state.clipboard.cellId]

      // Vérifier si le contenu du presse-papiers est valide
      if (!clipboardContent) return state

      // Créer une copie propre du contenu pour la cellule cible
      const newCellContents = {
        ...state.cellContents,
        [cellId]: Array.isArray(clipboardContent)
          ? clipboardContent.map((item) => ({ ...item })) // Cloner chaque objet du tableau
          : [{ ...clipboardContent }] // Gérer le cas d'un objet ou d'une chaîne unique
      }

      // Construire le nouvel état
      const newState = {
        ...state,
        cellContents: newCellContents
      }

      // Gérer Undo/Redo
      return withUndoRedo(state, newState)
    }

    case 'LINK_CELLS': {
      const { source, destination } = action.payload
      const existingGroupIndex = state.linkedGroups.findIndex((group) => group.includes(source))

      let updatedGroups
      if (existingGroupIndex > -1) {
        const updatedGroup = [...state.linkedGroups[existingGroupIndex], destination]
        updatedGroups = [...state.linkedGroups]
        updatedGroups[existingGroupIndex] = updatedGroup
      } else {
        updatedGroups = [...state.linkedGroups, [source, destination]]
      }

      const newState = {
        ...state,
        linkedGroups: updatedGroups
      }

      return withUndoRedo(state, newState)
    }

    case 'UNLINK_CELL': {
      const { cellId } = action.payload

      // Trouver le groupe auquel appartient la cellule
      const groupIndex = state.linkedGroups.findIndex((group) => group.includes(cellId))
      if (groupIndex === -1) return state // Si la cellule n'est pas liée, ne rien faire

      // Retirer la cellule du groupe lié
      const updatedGroups = [...state.linkedGroups]
      const updatedGroup = updatedGroups[groupIndex].filter((id) => id !== cellId)

      if (updatedGroup.length > 1) {
        // Si le groupe contient encore plus d'une cellule, le conserver
        updatedGroups[groupIndex] = updatedGroup
      } else {
        // Sinon, supprimer complètement le groupe
        updatedGroups.splice(groupIndex, 1)
      }

      // Mettre à jour le contenu de la cellule pour supprimer le flag `linkedByCsv`
      const newCellContents = { ...state.cellContents }
      if (newCellContents[cellId]) {
        newCellContents[cellId] = newCellContents[cellId].map((item) => ({
          ...item,
          linkedByCsv: false // Réinitialiser ce flag
        }))
      }

      // Construire le nouvel état
      const newState = {
        ...state,
        linkedGroups: updatedGroups,
        cellContents: newCellContents
      }

      // Gérer Undo/Redo
      return withUndoRedo(state, newState)
    }

    case 'RESET_CELL': {
      const { cellId } = action.payload

      // Créer un contenu vide pour la cellule
      const newCellContents = { ...state.cellContents }
      newCellContents[cellId] = [] // Une cellule réinitialisée est désormais vide

      // Mettre à jour les groupes liés
      const updatedGroups = state.linkedGroups
        .map((group) => group.filter((id) => id !== cellId)) // Retirer la cellule des groupes liés
        .filter((group) => group.length > 1) // Conserver uniquement les groupes valides (2 cellules ou plus)

      // Construire le nouvel état
      const newState = {
        ...state,
        cellContents: newCellContents,
        linkedGroups: updatedGroups
      }

      // Appliquer la gestion de undo/redo
      return withUndoRedo(state, newState)
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state // Rien à annuler
      const previousState = state.undoStack[state.undoStack.length - 1]
      const newUndoStack = state.undoStack.slice(0, -1)
      const newRedoStack = [state, ...state.redoStack] // Ajouter l'état actuel à redoStack
      return {
        ...previousState,
        undoStack: newUndoStack,
        redoStack: newRedoStack
      }
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state // Rien à refaire
      const nextState = state.redoStack[0]
      const newRedoStack = state.redoStack.slice(1)
      const newUndoStack = [...state.undoStack, state] // Ajouter l'état actuel à undoStack
      return {
        ...nextState,
        undoStack: newUndoStack,
        redoStack: newRedoStack
      }
    }
    default:
      return state
  }
}

// Fonction pour importer des données CSV
const importCsvData = (state, rows) => {
  const { config, cellsPerPage } = state
  const { columns } = calculateGridDimensions(config)
  const newCellContents = { ...state.cellContents }
  const newLinkedGroup = []

  // Calculer le nombre de pages nécessaires
  const requiredPages = Math.ceil(rows.length / cellsPerPage)
  const totalPages = Math.max(state.totalPages, requiredPages)

  // Générer une nouvelle grille
  const { grid } = generateGrid(config, totalPages)

  // Associer les données du CSV aux cellules
  rows.forEach((row, index) => {
    const pageIndex = Math.floor(index / cellsPerPage)
    const cellIndexInPage = index % cellsPerPage
    const col = cellIndexInPage % columns
    const rowInPage = Math.floor(cellIndexInPage / columns)
    const cellId = `${pageIndex}-${rowInPage}-${col}`

    // Générer le contenu de la cellule
    const cellContent = Object.entries(row).map(([key, value], idx) => {
      const type = key.includes('shape') ? 'rect' : 'i-text'

      const baseItem = {
        id: `${key}-${idx}`,
        linkedByCsv: true,
        left: 10 + idx * 50,
        top: 10
      }

      return type === 'i-text'
        ? {
            ...baseItem,
            type: 'i-text',
            text: value,
            fontSize: 14,
            fill: '#333'
          }
        : {
            ...baseItem,
            type: 'rect',
            width: 50,
            height: 30,
            fill: '#ccc'
          }
    })

    newCellContents[cellId] = cellContent
    newLinkedGroup.push(cellId)
  })

  // Nettoyer les contenus des cellules
  const cleanedCellContents = Object.fromEntries(
    Object.entries(newCellContents).filter(([key]) => grid.some((cell) => cell.id === key))
  )

  return {
    cellContents: cleanedCellContents,
    totalPages,
    grid,
    linkedGroups: [...state.linkedGroups, newLinkedGroup],
    cellsPerPage
  }
}
