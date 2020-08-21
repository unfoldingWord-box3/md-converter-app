import React from 'react';

export const TnDataContext = React.createContext({});

const initialState = {};

function tnDataReducer(state, action) {
  switch (action.type) {
    case 'FETCH_TN_DATA':
      return {
        ...state,
        [action.bookId]: action.payload,
      };
    default:
      return state;
  }
}

export default function TnDataContextProvider(props) {
  const [state, dispatch] = React.useReducer(tnDataReducer, initialState);
  return <TnDataContext.Provider value={{ state, dispatch }}>{props.children}</TnDataContext.Provider>;
}
