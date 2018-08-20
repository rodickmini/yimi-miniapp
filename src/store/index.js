import { createStore, combineReducers, applyMiddleware } from 'redux'
import promiseMiddleware from 'redux-promise'
import circle from './circle/reducers'
import utils from './utils/reducers'

const rootReducer = combineReducers({
  circle,
  utils
})

export default function configStore () {
  return createStore(rootReducer, applyMiddleware(promiseMiddleware))
}
