import React, { useEffect } from 'react';
import ric from 'ric-shim'
import equal from 'deep-equal';
import * as cacheLibrary from 'money-clip';
import fetchEnglishTsvsAction from '../actions/fetchEnglishTsvsAction';
import fetchTnMarkdownAction from '../actions/fetchTnMarkdownAction';
import getGlTsvContent from '../../helpers/getGlTsvContent';
import generateTimestamp from '../../helpers/generateTimestamp';
import useLoading from '../../hooks/useLoading';

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
          [action.bookId]: action.targetNotes,
        }
      };
    case 'STORE_SOURCE_NOTES':
      return {
        ...state,
        sourceNotes: {
          ...state.sourceNotes,
          [action.bookId]: action.sourceNotes,
          manifest: action.manifest,
        }
      };
    case 'SET_SOURCE_NOTES_MANIFEST':
      return {
        ...state,
        sourceNotes: {
          ...state.sourceNotes,
          manifest: action.manifest,
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
      return {
        ...initialState,
        ...action.payload,
      };
    default:
      return state;
  }
}

export default function TsvDataContextProvider(props) {
  const [state, dispatch] = React.useReducer(tsvDataReducer, initialState );
  const { isLoading, setIsLoading, setIsError, setLoadingMessage, loadingMessage } = useLoading();

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

  const fetchTnMarkdown = async (bookUrl, bookId, manifest) => {
    console.info(`Fetching ${bookId} Markdown files and converting to JSON format`)
    setIsLoading(true);
    const enTsvUrl = state.glTsvs.en[bookId];
    const { manifest: sourceManifest } = state.glTsvs.en;
    const sourceNotes = await getGlTsvContent(enTsvUrl);
    const targetNotes = await fetchTnMarkdownAction(bookUrl, bookId, reducerName, sourceNotes, setLoadingMessage)
      .catch(() => setIsError(true));
    const { dublin_core: { language } } = manifest;

    dispatch({
      type: 'STORE_SOURCE_NOTES',
      bookId,
      sourceNotes,
      manifest: sourceManifest,
    })

    dispatch({
      type: 'STORE_TARGET_NOTES',
      targetNotes,
      bookId,
    })

    setProject({
      name: `${language.identifier}_${bookId}`,
      bookId,
      sourceNotes,
      targetNotes,
      languageId: language.identifier,
      timestamp: generateTimestamp(),
    })

    setBookId(bookId);
    setIsLoading(false);
  }

  const setBookId = (bookId) => dispatch({ type: 'SET_BOOK_ID', bookId })

  const setProject = (project) => {
    console.info('setProject()');
    const { manifest } = state.glTsvs.en;

    if (manifest) {
      dispatch({ type: 'SET_SOURCE_NOTES_MANIFEST', manifest })
    }

    dispatch({ type: 'SET_CURRENT_PROJECT', project })
  }

  const removeProject = () => dispatch({ type: 'REMOVE_CURRENT_PROJECT' })

  const saveProjectChanges = (targetRecords) => {
    console.info('Saving Project Changes...');
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

  const deleteProject = (projectName) => {
    const { projects } = state;
    const foundIndex = projects.findIndex(project => project.name === projectName)
    const newProjects = [...projects];
    newProjects.splice(foundIndex, 1);

    dispatch({ type: 'SET_PROJECTS', projects: newProjects })
  }

  const value = {
    state,
    dispatch,
    setBookId,
    setProject,
    isLoading,
    setIsError,
    setIsLoading,
    removeProject,
    deleteProject,
    loadingMessage,
    fetchTnMarkdown,
    fetchEnglishTsvs,
    saveProjectChanges,
   }

  return <TsvDataContext.Provider value={value}>{props.children}</TsvDataContext.Provider>;
}
