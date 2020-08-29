import React, { useEffect } from 'react';
import ric from 'ric-shim'
import * as cacheLibrary from 'money-clip';
import fetchEnglishTsvsAction from '../actions/fetchEnglishTsvsAction';
import fetchTnMarkdownAction from '../actions/fetchTnMarkdownAction';
import getGlTsvContent from '../../helpers/getGlTsvContent';

export const TsvDataContext = React.createContext({});

const reducerName = 'tsvDataReducer';
const initialState = {
  targetNotes: {},
  sourceNotes: {},
  glTsvs: {},
};

function tsvDataReducer(state, action) {
  switch (action.type) {
    case 'SET_TSV_DATA':
      return action.payload;
    case 'STORE_TARGET_NOTES':
      return {
        ...state,
        targetNotes: {
          ...state.targetNotes,
          [action.bookId]: action.payload,
        }
      };
    case 'STORE_SOURCE_NOTES':
      return {
        ...state,
        sourceNotes: {
          ...state.sourceNotes,
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
    const targetNotes = await fetchTnMarkdownAction(bookUrl, bookId, reducerName);
    const enTsvUrl = state.glTsvs.en[bookId];
    const sourceNotes = await getGlTsvContent(enTsvUrl);

    dispatch({
      type: 'STORE_TARGET_NOTES',
      payload: targetNotes,
      bookId,
    })
    dispatch({
      type: 'STORE_SOURCE_NOTES',
      payload: sourceNotes,
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
