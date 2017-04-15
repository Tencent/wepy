import { INCREMENT, DECREMENT, ASYNC_INCREMENT } from '../types/counter'

function counter (state = {num: 0, asyncNum: 0}, action) {
  switch (action.type) {
    case INCREMENT:
      return {
        ...state,
        num: state.num + 1
      }
    case DECREMENT:
      return {
        ...state,
        num: state.num - 1
      }
    case ASYNC_INCREMENT:
      return {
        ...state,
        asyncNum: state.asyncNum + action.payload
      }
    default:
      return {
        ...state
      }
  }
}

export default counter
