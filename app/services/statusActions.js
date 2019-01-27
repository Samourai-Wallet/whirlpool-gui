export const ACTION_APP_STATUS_ITEM_ADD = 'app/App/ACTION_APP_STATUS_ITEM_ADD'
export const ACTION_APP_STATUS_ITEM_SUCCESS =
  'app/App/ACTION_APP_STATUS_ITEM_SUCCESS'
export const ACTION_APP_STATUS_ITEM_ERROR =
  'app/App/ACTION_APP_STATUS_ITEM_ERROR'
export const ACTION_APP_STATUS_ITEM_CLEAR =
  'app/App/ACTION_APP_STATUS_ITEM_CLEAR'
export const ACTION_APP_STATUS_ITEM_RETRY =
  'app/App/ACTION_APP_STATUS_ITEM_RETRY'

export const statusActions = {
  add: (id, mainLabel, label, executor) => {
    return {
      type: ACTION_APP_STATUS_ITEM_ADD,
      payload: {
        id: id,
        mainLabel: mainLabel,
        label: label,
        executor: executor,
        success: false,
        error: false,
        errorMessage: undefined
      }
    }
  },
  success: id => {
    return {
      type: ACTION_APP_STATUS_ITEM_SUCCESS,
      payload: {
        id: id
      }
    }
  },
  error: (id, errorMessage) => {
    return {
      type: ACTION_APP_STATUS_ITEM_ERROR,
      payload: {
        id: id,
        errorMessage: errorMessage
      }
    }
  },
  clear: id => {
    return {
      type: ACTION_APP_STATUS_ITEM_CLEAR,
      payload: {
        id: id
      }
    }
  },
  retry: id => {
    return {
      type: ACTION_APP_STATUS_ITEM_RETRY,
      payload: {
        id: id
      }
    }
  }
}
