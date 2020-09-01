import React, { useEffect } from 'react';
import ric from 'ric-shim'
import * as cacheLibrary from 'money-clip';

export const ProjectContext = React.createContext({});

const reducerName = 'projectReducer';
const initialState = {
  bookId: null,
};

function projectReducer(state, action) {
  switch (action.type) {
    case 'SET_BOOK_ID':
      return {
        ...state,
        bookId: action.bookId,
      };
    case 'SET_CACHED_REDUCER':
      return action.payload;
    default:
      return state;
  }
}

export default function ProjectContextProvider(props) {
  const [state, dispatch] = React.useReducer(projectReducer, initialState);

  useEffect(() => {
    cacheLibrary.getAll().then(cacheData => {
      const payload = cacheData[reducerName];

      if (cacheData[reducerName]) {
        dispatch({
          type: 'SET_CACHED_REDUCER',
          payload,
        })
      }
    });
  }, [])

  useEffect(() => {
    ric(() => cacheLibrary.set(reducerName, state))
  }, [state])

  const setBookId = (bookId) => dispatch({ type: 'SET_BOOK_ID', bookId })

  return <ProjectContext.Provider value={{ state, dispatch, setBookId }}>{props.children}</ProjectContext.Provider>;
}
