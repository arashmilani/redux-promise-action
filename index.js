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

  
  if(Array.isArray(actionType[0])) {
    store.dispatch(Object.assign({type: actionType[0][0]},  actionType[0][1]))
  }
  else if(action.initPayload) {
    store.dispatch(Object.assign({type: actionType[0]},  action.initPayload))
  } else {
    store.dispatch({type: actionType[0]})
  }

  action.promise.then(payload => {
    store.dispatch({type: actionType[1], payload})
    if(action.done) action.done(payload)
  }).catch(error => {
    store.dispatch({type: actionType[2], error})
  })
}