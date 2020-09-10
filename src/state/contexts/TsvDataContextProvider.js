import React, { useEffect } from 'react';
import ric from 'ric-shim'
import equal from 'deep-equal';
import * as cacheLibrary from 'money-clip';
import fetchEnglishTsvsAction from '../actions/fetchEnglishTsvsAction';
import fetchTnMarkdownAction from '../actions/fetchTnMarkdownAction';
import getGlTsvContent from '../../helpers/getGlTsvContent';
import generateTimestamp from '../../helpers/generateTimestamp';

export const TsvDataContext = React.createContext({});

const reducerName = 'tsvDataReducer';
const initialState = {
  targetNotes: {},
  sourceNotes: {},
  glTsvs: {},
  bookId: null,
  projects: [],
  currentProject: null,
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
    case 'SET_BOOK_ID':
      return {
        ...state,
        bookId: action.bookId,
      };
    case 'SET_CURRENT_PROJECT':
      const found = state.projects.find(project => project.name === action.project.name)
      const projects = found ? state.projects : [...state.projects, action.project];
      return {
        ...state,
        projects,
        currentProject: action.project,
      };
    case 'UPDATE_CURRENT_PROJECT':
      return {
        ...state,
        currentProject: action.project,
      };
    case 'REMOVE_CURRENT_PROJECT':
      return {
        ...state,
        currentProject: null,
      };
    case 'SET_PROJECTS':
      return {
        ...state,
        projects: action.projects,
      };
    case 'SET_CACHED_REDUCER':
      return action.payload;
    default:
      return state;
  }
}

export default function TsvDataContextProvider(props) {
  const [state, dispatch] = React.useReducer(tsvDataReducer, initialState );

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
  }, []);

  useEffect(() => {
    if (!equal(state, initialState)) {
      ric(() => cacheLibrary.set(reducerName, state))
    }
  }, [state])

  const fetchEnglishTsvs = async () => {
    const enTsvs = await fetchEnglishTsvsAction(reducerName);

    dispatch({
      type: 'STORE_EN_TSVS',
      payload: enTsvs
    })
  }

  const fetchTnMarkdown = async (bookUrl, bookId) => {
    const enTsvUrl = state.glTsvs.en[bookId];
    const sourceNotes = await getGlTsvContent(enTsvUrl);
    const targetNotes = await fetchTnMarkdownAction(bookUrl, bookId, reducerName, sourceNotes);

    dispatch({
      type: 'STORE_SOURCE_NOTES',
      payload: sourceNotes,
      bookId,
    })
    dispatch({
      type: 'STORE_TARGET_NOTES',
      payload: targetNotes,
      bookId,
    })

    setProject({
      name: `ru_${bookId}`,
      languageId: 'ru',
      sourceNotes,
      targetNotes,
      bookId,
      timestamp: generateTimestamp(),
    })
  }

  const setBookId = (bookId) => dispatch({ type: 'SET_BOOK_ID', bookId })

  const setProject = (project) => dispatch({ type: 'SET_CURRENT_PROJECT', project })

  const removeProject = () => dispatch({ type: 'REMOVE_CURRENT_PROJECT' })

  const saveProjectChanges = (targetRecords) => {
    const { currentProject, projects } = state;
    const updatedProject = Object.assign({}, currentProject);
    updatedProject.targetNotes = targetRecords;
    updatedProject.timestamp = generateTimestamp();
    const foundIndex = projects.findIndex(project => project.name === updatedProject.name)
    const newProjects = projects.map((project, index) => {
      if (foundIndex !== index) {
        return project;
      } else {
        return updatedProject;
      }
    })

    dispatch({ type: 'UPDATE_CURRENT_PROJECT', project: updatedProject })
    dispatch({ type: 'SET_PROJECTS', projects: newProjects })
  }

  const value = {
    state,
    dispatch,
    setBookId,
    setProject,
    removeProject,
    fetchTnMarkdown,
    fetchEnglishTsvs,
    saveProjectChanges,
   }

  return <TsvDataContext.Provider value={value}>{props.children}</TsvDataContext.Provider>;
}
