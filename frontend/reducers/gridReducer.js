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
  cellContents: {
    default: [
      {
        text: 'Cliquez pour éditer',
        left: 10,
        top: 10,
        fontSize: 14,
        fill: '#333'
      }
    ] // Contenu par défaut pour toute cellule non définie
  },
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

      // Initialiser un nouvel objet pour les contenus des cellules
      const newCellContents = { ...state.cellContents }

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

          // Ajouter le contenu par défaut avec le drapeau isInitialContent
          if (!newCellContents[cellId]) {
            newCellContents[cellId] = [
              ...state.cellContents.default.map((item) => ({ ...item, isInitialContent: true }))
            ]
          }
        }
      }

      return {
        ...state,
        grid,
        cellContents: newCellContents,
        cellsPerPage
      }
    }

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

    case 'IMPORT_CSV': {
      const rows = action.payload
      const newCellContents = { ...state.cellContents }
      const newLinkedGroup = [] // Nouveau groupe pour les cellules liées par le CSV

      // Associer les données CSV aux cellules
      rows.forEach((row, index) => {
        const pageIndex = Math.floor(index / state.cellsPerPage)
        const cellIndexInPage = index % state.cellsPerPage

        // Calculer la position de la cellule dans la grille
        const columns = Math.floor(
          (state.config.pageWidth - 2 * state.config.offsetLeft + state.config.spacingHorizontal) /
            (state.config.cellWidth + state.config.spacingHorizontal)
        )
        const col = cellIndexInPage % columns
        const rowInPage = Math.floor(cellIndexInPage / columns)
        const cellId = `${pageIndex}-${rowInPage}-${col}`

        // Créer plusieurs objets IText pour chaque colonne de la ligne CSV
        const iTextObjects = Object.entries(row).map(([key, value], idx) => ({
          id: `${key}-${idx}`, // Identifiant unique pour chaque objet IText
          type: 'IText',
          text: value, // Texte depuis le CSV
          left: 10 + idx * 50, // Décalage horizontal
          top: 10, // Décalage vertical
          fontSize: 14, // Taille de police
          fill: '#333' // Couleur par défaut
        }))

        // Ajouter le contenu dans cellContents
        newCellContents[cellId] = iTextObjects

        // Ajouter la cellule au groupe lié
        newLinkedGroup.push(cellId)
      })

      // Marquer les cellules comme liées par le CSV
      const markedGrid = state.grid.map((cell) => ({
        ...cell,
        linkedByCsv: newLinkedGroup.includes(cell.id) // Marquer uniquement les cellules liées
      }))

      // Construire le nouvel état
      const newState = {
        ...state,
        cellContents: newCellContents,
        grid: markedGrid, // Mettre à jour la grille avec les marquages
        linkedGroups: [...state.linkedGroups, newLinkedGroup], // Ajouter le groupe lié
        totalPages: Math.max(1, Math.ceil(rows.length / state.cellsPerPage)) // Mettre à jour les pages
      }

      // Gérer Undo/Redo
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

      if (!content || (content.type === 'IText' && content.text.trim() === '')) {
        delete newCellContents[id]
      } else {
        newCellContents[id] = content
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

      // Récupérer le contenu actuel de la cellule à sauvegarder ou utiliser le contenu par défaut
      const cellContent = state.cellContents[cellId] || state.cellContents.default

      // Si aucun contenu n'est disponible (ni dans la cellule ni par défaut), ne rien faire
      if (!cellContent) return state

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

      const newCellContents = { ...state.cellContents }
      newCellContents[cellId] = [
        ...state.cellContents.default.map((item) => ({
          ...item,
          isInitialContent: true,
          linkedByCsv: false // Supprimer le flag lié au CSV
        }))
      ]

      const updatedGroups = state.linkedGroups
        .map((group) => group.filter((id) => id !== cellId)) // Retirer la cellule de chaque groupe
        .filter((group) => group.length > 1) // Supprimer les groupes devenus vides ou uniques

      const newState = {
        ...state,
        cellContents: newCellContents,
        linkedGroups: updatedGroups
      }

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
