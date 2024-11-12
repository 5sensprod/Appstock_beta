// frontend/reducers/gridReducer.js

export const initialGridState = {
  cells: [], // Vide pour permettre une génération dynamique des cellules
  linkedCells: {}, // Vide pour permettre une liaison dynamique
  selectedCell: 0
}

export const gridReducer = (state, action) => {
  const { type, payload } = action

  switch (type) {
    case 'ADD_CELL':
      console.log('Action ADD_CELL déclenchée avec payload :', payload)
      return {
        ...state,
        cells: [...state.cells, payload]
      }

    case 'SELECT_CELL':
      console.log('Action SELECT_CELL déclenchée pour la cellule ID :', payload)
      return {
        ...state,
        selectedCell: payload
      }

    case 'LINK_CELLS_TO_CSV':
      console.log('Action LINK_CELLS_TO_CSV déclenchée pour dataIndex :', payload.dataIndex)
      return {
        ...state,
        linkedCells: {
          ...state.linkedCells,
          [payload.dataIndex]: payload.cellIds
        }
      }

    case 'UPDATE_CELL_DESIGN':
      console.log('Action UPDATE_CELL_DESIGN déclenchée avec payload :', payload)
      return {
        ...state,
        cells: state.cells.map((cell) =>
          cell.id === payload.cellId
            ? { ...cell, design: { ...cell.design, ...payload.design } }
            : cell
        )
      }

    case 'UPDATE_LINKED_CELLS':
      console.log('Action UPDATE_LINKED_CELLS pour dataIndex :', payload.dataIndex)
      const linkedCellIds = state.linkedCells[payload.dataIndex] || []
      return {
        ...state,
        cells: state.cells.map((cell) =>
          linkedCellIds.includes(cell.id)
            ? { ...cell, design: { ...cell.design, ...payload.design } }
            : cell
        )
      }

    case 'TOGGLE_CELL_LINK':
      console.log('Action TOGGLE_CELL_LINK déclenchée pour la cellule ID :', payload.cellId)
      return {
        ...state,
        cells: state.cells.map((cell) =>
          cell.id === payload.cellId
            ? {
                ...cell,
                linkedToCsv: !cell.linkedToCsv,
                dataIndex: cell.linkedToCsv ? null : payload.dataIndex
              }
            : cell
        )
      }

    case 'SAVE_GRID_STATE':
      console.log('Action SAVE_GRID_STATE déclenchée')
      // Ici, nous pouvons ajouter la logique pour sauvegarder l'état de la grille
      return state

    case 'LOAD_GRID_STATE':
      console.log('Action LOAD_GRID_STATE déclenchée avec payload :', payload)
      // Charger un état sauvegardé
      return {
        ...state,
        ...payload
      }
    case 'SYNC_CELLS_WITH_GRID':
      console.log('Synchronisation des cellules importées avec la grille.')
      return {
        ...state,
        cells: payload // Met à jour `gridState` avec les cellules importées
      }

    default:
      console.log('Action non reconnue :', type)
      return state
  }
}
