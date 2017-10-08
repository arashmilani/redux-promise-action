module.exports = store => next => action => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState)
  }

  if(!action.promise || typeof action.promise.then !== 'function') {
    return next(action)
  }

  let actionType = []

  if(typeof action.type === 'string') {
    actionType = [action.type + '_INIT', action.type + '_SUCCESS', action.type + '_ERROR']
  } else if(Array.isArray(action.type)) {
    if(action.type.length !== 3) {
      throw new Error('Length of action type for async actions should be three.')
    }
    actionType = [...action.type]
  } else {
    throw new Error('Action type should be either a string or an array.')
  }

  let ref = action.ref || undefined
  store.dispatch({type: actionType[0], ref } )
 
  action.promise.then(payload => {
    store.dispatch({type: actionType[1], payload, ref})
    if(action.done) action.done(payload)
  }).catch(error => {
    error = {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack,
      list: error.list,
    }
    store.dispatch({type: actionType[2], error, ref})
  })
}