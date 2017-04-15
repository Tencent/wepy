import { ASYNC_INCREMENT } from '../types/counter'
import { createAction } from 'redux-actions'

export const asyncInc = createAction(ASYNC_INCREMENT, () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(1)
    }, 1000)
  })
})
