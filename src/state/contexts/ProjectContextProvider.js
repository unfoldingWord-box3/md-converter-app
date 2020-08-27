import React from 'react';

export const ProjectContext = React.createContext({});

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
    default:
      return state;
  }
}

export default function ProjectContextProvider(props) {
  const [state, dispatch] = React.useReducer(projectReducer, initialState);

  const setBookId = (bookId) => dispatch({ type: 'SET_BOOK_ID', bookId })

  return <ProjectContext.Provider value={{ state, dispatch, setBookId }}>{props.children}</ProjectContext.Provider>;
}
