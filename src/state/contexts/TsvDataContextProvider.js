import React, { useEffect } from 'react';
import ric from 'ric-shim'
import * as cacheLibrary from 'money-clip';
import fetchEnglishTsvsAction from '../actions/fetchEnglishTsvsAction';
import fetchTnMarkdownAction from '../actions/fetchTnMarkdownAction';

export const TsvDataContext = React.createContext({});

const reducerName = 'tsvDataReducer';
const initialState = {
  tsvObjects: {},
  glTsvs: {},
};

function tsvDataReducer(state, action) {
  switch (action.type) {
    case 'SET_TSV_DATA':
      return action.payload;
    case 'STORE_TSV_OBJECTS_FOR_BOOK':
      return {
        ...state,
        tsvObjects: {
          ...state.tsvObjects,
          [action.bookId]: action.payload,
        }
      };
    case 'STORE_EN_TSVS':
      return {
        ...state,
        glTsvs: {
          ...state.glTsvs,
          en: action.payload || {},
        }
      };
    default:
      return state;
  }
}

export default function TsvDataContextProvider(props) {
  const [state, dispatch] = React.useReducer(tsvDataReducer, initialState );

  useEffect(() => {
    ric(() => cacheLibrary.set(reducerName, state))
  }, [state])

  const fetchEnglishTsvs = async () => {
    const enTsvs = await fetchEnglishTsvsAction(reducerName);

    dispatch({
      type: 'STORE_EN_TSVS',
      payload: enTsvs
    })
  }

  const fetchTnMarkdown = async (bookUrl, bookId) => {
    const tsvItems = await fetchTnMarkdownAction(bookUrl, bookId, reducerName);

    dispatch({
      type: 'STORE_TSV_OBJECTS_FOR_BOOK',
      payload: tsvItems,
      bookId,
    })
  }

  const value = {
    state,
    dispatch,
    fetchEnglishTsvs,
    fetchTnMarkdown,
   }

  return <TsvDataContext.Provider value={value}>{props.children}</TsvDataContext.Provider>;
}
