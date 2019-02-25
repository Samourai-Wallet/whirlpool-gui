import uniqueId from 'lodash/uniqueId';
import { statusActions } from './statusActions';

const STATUS_SUCCESS_CLEAR = 10000

class Status {
  constructor () {
  }

  executeWithStatus (mainLabel, label, executor, dispatch, itemId) {
    if (itemId === undefined) {
      itemId = uniqueId()
    }
    dispatch(statusActions.add(itemId, mainLabel, label, executor))

    const promise = executor()
    // important: keep promise variable unchanged to return initial promise
    promise
      .then(() => {
        dispatch(statusActions.success(itemId))
        setTimeout(() => dispatch(statusActions.clear(itemId)),
          STATUS_SUCCESS_CLEAR
        )
      })
      .catch(error => {
        console.error(`failed: ${label}`, error)
        dispatch(statusActions.error(itemId, error.message))
      })
    return promise
  }
}

const status = new Status()
export default status
