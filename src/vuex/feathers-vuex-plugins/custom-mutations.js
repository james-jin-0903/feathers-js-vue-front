import {getId} from "feathers-vuex/dist/utils";
import merge from "lodash/merge";

export const updateItems = function(state, items){

  if (!Array.isArray(items)) {
    throw new Error(
      'You must provide an array to the `updateItems` mutation.'
    )
  }

  const { idField, addOnUpsert } = state

  let newKeyedById = {...state.keyedById}

  for (let item of items) {
    const id = getId(item, idField);

    // Simply rewrite the record if the it's already in the `ids` list.
    if (state.ids.includes(id)) {
      merge(newKeyedById[id], item)
      continue
    }

    // if addOnUpsert then add the record into the state, else discard it.
    if (addOnUpsert) {
      state.ids.push(id)
      newKeyedById[id] = item
    }
  }
  state.keyedById = newKeyedById
}

export const clearList = function(state){
  let currentId = state.currentId
  let current = state.keyedById[currentId]

  if (currentId && current) {
    state.keyedById = {
      [currentId]: current
    }
    state.ids = [currentId]
  } else {
    state.keyedById = {}
    state.ids = []
  }
}
