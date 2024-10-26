export const initialDataState = {
  importedData: [], // Données CSV parsées
  mappedData: {}, // Données mappées par index pour un accès rapide
  importStatus: {
    isLoading: false,
    error: null,
    success: false
  },
  dataFields: {
    availableFields: [], // Champs disponibles dans le CSV
    mappingConfig: {
      Nom: 'text',
      Tarif: 'price',
      Gencode: 'qrcode'
    }
  },
  currentBatch: {
    startIndex: 0,
    batchSize: 100, // Nombre d'étiquettes à traiter par lot
    isProcessing: false
  }
}

export const dataReducer = (state, action) => {
  switch (action.type) {
    case 'IMPORT_START':
      return {
        ...state,
        importStatus: {
          isLoading: true,
          error: null,
          success: false
        }
      }

    case 'IMPORT_SUCCESS':
      return {
        ...state,
        importedData: action.payload.data,
        mappedData: action.payload.data.reduce((acc, item, index) => {
          acc[index] = item
          return acc
        }, {}),
        dataFields: {
          ...state.dataFields,
          availableFields: Object.keys(action.payload.data[0] || {})
        },
        importStatus: {
          isLoading: false,
          error: null,
          success: true
        }
      }

    case 'IMPORT_ERROR':
      return {
        ...state,
        importStatus: {
          isLoading: false,
          error: action.payload,
          success: false
        }
      }

    case 'UPDATE_MAPPING_CONFIG':
      return {
        ...state,
        dataFields: {
          ...state.dataFields,
          mappingConfig: {
            ...state.dataFields.mappingConfig,
            ...action.payload
          }
        }
      }

    case 'SET_BATCH_PROCESSING':
      return {
        ...state,
        currentBatch: {
          ...state.currentBatch,
          isProcessing: action.payload
        }
      }

    case 'UPDATE_BATCH_INDEX':
      return {
        ...state,
        currentBatch: {
          ...state.currentBatch,
          startIndex: action.payload
        }
      }

    case 'UPDATE_BATCH_SIZE':
      return {
        ...state,
        currentBatch: {
          ...state.currentBatch,
          batchSize: action.payload
        }
      }

    case 'UPDATE_DATA_ITEM':
      return {
        ...state,
        mappedData: {
          ...state.mappedData,
          [action.payload.index]: {
            ...state.mappedData[action.payload.index],
            ...action.payload.data
          }
        }
      }

    case 'CLEAR_IMPORT_DATA':
      return {
        ...initialDataState
      }

    default:
      return state
  }
}
