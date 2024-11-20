export const initialGridState = {
  config: {
    cellWidth: 48.5,
    cellHeight: 25,
    offsetTop: 22,
    offsetLeft: 8,
    spacingHorizontal: 0,
    spacingVertical: 0,
    pageWidth: 210, // A4 dimensions
    pageHeight: 297
  },
  grid: [], // Grille vide générée dynamiquement
  selectedCellId: null, // Aucun ID sélectionné au départ
  cellContents: {},
  clipboard: null, // Contenu temporaire pour le copier-coller
  linkedGroups: [],
  currentPage: 0, // Page active
  totalPages: 1,
  undoStack: [], // Historique des états précédents
  redoStack: [] // Historique des états annulés
}

function withUndoRedo(state, newState) {
  return {
    ...newState,
    undoStack: [...state.undoStack, state], // Ajouter l'état actuel à undoStack
    redoStack: [] // Réinitialiser redoStack après une nouvelle action
  }
}

export function gridReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_CONFIG': {
      const { pageWidth, pageHeight } = state.config
      const updatedConfig = { ...state.config, ...action.payload }

      // Validation des offsets
      if (updatedConfig.offsetTop >= pageHeight) {
        updatedConfig.offsetTop = pageHeight - 1
      }
      if (updatedConfig.offsetLeft >= pageWidth) {
        updatedConfig.offsetLeft = pageWidth - 1
      }
      // Validation des dimensions
      if (updatedConfig.cellWidth <= 0) {
        updatedConfig.cellWidth = 1
      }
      if (updatedConfig.cellHeight <= 0) {
        updatedConfig.cellHeight = 1
      }

      // Calcul du nombre de cellules seulement si les dimensions changent
      const dimensionsChanged =
        action.payload.cellWidth !== undefined ||
        action.payload.cellHeight !== undefined ||
        action.payload.spacingHorizontal !== undefined ||
        action.payload.spacingVertical !== undefined ||
        action.payload.pageWidth !== undefined ||
        action.payload.pageHeight !== undefined

      if (dimensionsChanged) {
        // Calculer le nombre de cellules par page avec la nouvelle configuration
        const availableWidth = pageWidth - 2 * updatedConfig.offsetLeft
        const availableHeight = pageHeight - 2 * updatedConfig.offsetTop
        const columns = Math.floor(
          (availableWidth + updatedConfig.spacingHorizontal) /
            (updatedConfig.cellWidth + updatedConfig.spacingHorizontal)
        )
        const rows = Math.floor(
          (availableHeight + updatedConfig.spacingVertical) /
            (updatedConfig.cellHeight + updatedConfig.spacingVertical)
        )
        const cellsPerPage = columns * rows

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

    case 'GENERATE_GRID': {
      const {
        cellWidth,
        cellHeight,
        offsetTop,
        offsetLeft,
        spacingHorizontal,
        spacingVertical,
        pageWidth,
        pageHeight
      } = state.config

      const columns = Math.floor(
        (pageWidth - 2 * offsetLeft + spacingHorizontal) / (cellWidth + spacingHorizontal)
      )
      const rowsPerPage = Math.floor(
        (pageHeight - 2 * offsetTop + spacingVertical) / (cellHeight + spacingVertical)
      )

      const cellsPerPage = columns * rowsPerPage
      const grid = []

      for (let pageIndex = 0; pageIndex < state.totalPages; pageIndex++) {
        for (let i = 0; i < cellsPerPage; i++) {
          const row = Math.floor(i / columns)
          const col = i % columns
          const cellId = `${pageIndex}-${row}-${col}`

          grid.push({
            id: cellId,
            pageIndex,
            row,
            col,
            width: (cellWidth / pageWidth) * 100,
            height: (cellHeight / pageHeight) * 100,
            left: ((offsetLeft + col * (cellWidth + spacingHorizontal)) / pageWidth) * 100,
            top: ((offsetTop + row * (cellHeight + spacingVertical)) / pageHeight) * 100
          })
        }
      }

      return {
        ...state,
        grid,
        cellsPerPage
      }
    }

    case 'IMPORT_CSV': {
      const rows = action.payload
      const newCellContents = { ...state.cellContents }

      const newLinkedGroup = []

      // Calculer le nombre de pages nécessaires en fonction des cellules par page
      const requiredPages = Math.ceil(rows.length / state.cellsPerPage)
      const totalPages = Math.max(state.totalPages, requiredPages)

      // Mettre à jour le totalPages et générer une nouvelle grille
      const updatedState = gridReducer({ ...state, totalPages }, { type: 'GENERATE_GRID' })

      // Associer les données du CSV aux cellules
      rows.forEach((row, index) => {
        const pageIndex = Math.floor(index / updatedState.cellsPerPage)
        const cellIndexInPage = index % updatedState.cellsPerPage

        const columns = Math.floor(
          (state.config.pageWidth - 2 * state.config.offsetLeft + state.config.spacingHorizontal) /
            (state.config.cellWidth + state.config.spacingHorizontal)
        )
        const col = cellIndexInPage % columns
        const rowInPage = Math.floor(cellIndexInPage / columns)
        const cellId = `${pageIndex}-${rowInPage}-${col}`

        // Générer le contenu de la cellule à partir des données du CSV
        const cellContent = Object.entries(row).map(([key, value], idx) => ({
          id: `${key}-${idx}`,
          type: 'IText',
          text: value,
          left: 10 + idx * 50,
          top: 10,
          fontSize: 14,
          fill: '#333',
          linkedByCsv: true // Indiquer que cette cellule est liée au CSV
        }))

        // Ajouter le contenu au cellContents
        newCellContents[cellId] = cellContent
        newLinkedGroup.push(cellId)
      })

      console.log('cellContents après IMPORT_CSV :', newCellContents)

      // Nettoyer les contenus des cellules pour correspondre aux cellules existantes dans la grille
      const cleanedCellContents = Object.keys(newCellContents)
        .filter((key) => updatedState.grid.some((cell) => cell.id === key))
        .reduce((acc, key) => {
          acc[key] = newCellContents[key]
          return acc
        }, {})

      const newState = {
        ...updatedState,
        cellContents: cleanedCellContents,
        linkedGroups: [...state.linkedGroups, newLinkedGroup]
      }

      // Appliquer la gestion d'undo/redo
      return withUndoRedo(state, newState)
    }

    case 'SELECT_FIRST_CELL': {
      if (state.grid.length > 0) {
        return {
          ...state,
          selectedCellId: state.grid[0].id // Sélectionne la première cellule par défaut
        }
      }
      return state
    }

    case 'SELECT_CELL':
      return {
        ...state,
        selectedCellId: action.payload // Met à jour l'ID de la cellule sélectionnée
      }

    case 'UPDATE_CELL_CONTENT': {
      const { id, content } = action.payload
      const newCellContents = { ...state.cellContents }

      // Si la cellule existe, conserver ses anciens flags
      const existingContent = state.cellContents[id] || []

      // Préserver les flags, notamment `linkedByCsv`, et garantir que `type` est défini
      const updatedContent = content.map((item) => {
        const existingItem = existingContent.find((oldItem) => oldItem.id === item.id)
        return {
          ...item,
          type: item.type || existingItem?.type || 'IText', // Définit le type par défaut
          linkedByCsv: existingItem?.linkedByCsv || false
        }
      })

      // Validation pour les objets non textuels
      const isObjectEmpty = (obj) => {
        if (obj.type === 'IText') return !obj.text?.trim()
        return false // Les autres types d'objets ne sont jamais "vides"
      }

      // Si le nouveau contenu est vide, supprimez la cellule
      if (!content || (content.length === 0 && updatedContent.every(isObjectEmpty))) {
        delete newCellContents[id]
      } else {
        newCellContents[id] = updatedContent
      }

      const newState = {
        ...state,
        cellContents: newCellContents
      }

      return withUndoRedo(state, newState)
    }

    case 'SET_PAGE': {
      const { page } = action.payload
      return {
        ...state,
        currentPage: Math.min(Math.max(0, page), state.totalPages - 1)
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

    case 'SYNC_CELL_LAYOUT': {
      const { sourceId, layout } = action.payload

      // Trouver le groupe lié auquel appartient la cellule source
      const linkedGroup = state.linkedGroups.find((group) => group.includes(sourceId))

      if (!linkedGroup) return state // Si aucun groupe lié, ne rien faire

      const updatedCellContents = { ...state.cellContents }

      linkedGroup.forEach((cellId) => {
        if (updatedCellContents[cellId]) {
          // Synchroniser chaque objet IText basé sur son identifiant unique (id)
          updatedCellContents[cellId] = updatedCellContents[cellId].map((item) => ({
            ...item,
            left: layout[item.id]?.left ?? item.left, // Synchronise la position `left`
            top: layout[item.id]?.top ?? item.top // Synchronise la position `top`
          }))
        }
      })

      return {
        ...state,
        cellContents: updatedCellContents
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
