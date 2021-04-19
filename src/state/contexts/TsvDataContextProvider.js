import React, { useState, useEffect, useReducer } from 'react';
import ric from 'ric-shim'
import equal from 'deep-equal';
import * as cacheLibrary from 'money-clip';
import { customAlphabet } from 'nanoid/non-secure'
import useDeepCompareEffect from 'use-deep-compare-effect'
import fetchEnglishTsvsAction from '../actions/fetchEnglishTsvsAction';
import fetchTnMarkdownAction from '../actions/fetchTnMarkdownAction';
import getGlTsvContent from '../../helpers/getGlTsvContent';
import generateTimestamp from '../../helpers/generateTimestamp';
import useLoading from '../../hooks/useLoading';
import populateHeaders from '../../helpers/populateHeaders';

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
  const [state, dispatch] = useReducer(tsvDataReducer, initialState);
  const { isLoading, setIsLoading, setIsError, setLoadingMessage, loadingMessage } = useLoading();
  const [savedBackup, setSavedBackup] = useState(false);

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

  useDeepCompareEffect(() => {
    if (!equal(state, initialState)) {
      console.log('ric')
      ric(() => cacheLibrary.set(reducerName, state))
    }
  }, [state])

  const fetchTnMarkdown = async (bookUrl, bookId, targetManifest, resourceId) => {
    try {
      removeProject()
      console.info(`Fetching ${bookId} Markdown files and converting to JSON format`)
      setIsLoading(true);
      const resourceContentUrls = await fetchEnglishTsvsAction(resourceId);
      const bookContentUrl = resourceContentUrls[bookId];
      const sourceNotes = await getGlTsvContent(bookContentUrl);
      setLoadingMessage(null);
      const targetNotes = await fetchTnMarkdownAction(bookUrl, bookId, sourceNotes, setLoadingMessage)
        .catch(() => setIsError(true));
      const { dublin_core: { language } } = targetManifest;

      setProject({
        name: `${language?.identifier}_${bookId}_${resourceId}`,
        bookId,
        resourceId,
        sourceNotes,
        targetNotes,
        sourceManifest: resourceContentUrls['manifest'] || {},
        targetManifest,
        languageId: language?.identifier,
        timestamp: generateTimestamp(),
      })

      setBookId(bookId);
      setIsLoading(false);
    } catch (error) {
      console.error(error)
    }
  }

  const setBookId = (bookId) => dispatch({ type: 'SET_BOOK_ID', bookId })

  const setProject = (project) => {
    setSavedBackup(false);
    console.info('setProject()');

    dispatch({ type: 'SET_CURRENT_PROJECT', project })
  }

  const updateProject = (project) => {
    setSavedBackup(false);
    console.info('updateProject()');

    dispatch({ type: 'UPDATE_CURRENT_PROJECT', project })
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

  const toggleRecordView = (e, index) => {
    const nanoid = customAlphabet('123456789abcdefghijklmnopqrstuvwxyz', 4);
    const { currentProject } = state
    const { targetNotes, sourceNotes, bookId } = currentProject
    // Create a copy of the arrays to avoid mutation
    const newTargetNotes = [ ...targetNotes ]
    const newSourceNotes = [ ...sourceNotes ]

    newTargetNotes[index].Included = e.target.checked

    const emptySourceNote = populateHeaders({
      bookId,
      nanoid,
      raw: '',
      heading: '',
      noIncludedField: true,
      item: newTargetNotes[index],
      sourceVerse: newTargetNotes[index]?.Verse,
      sourceChapter: newTargetNotes[index]?.Chapter,
    })

    const emptyTargetNote = populateHeaders({
      bookId,
      nanoid,
      raw: '',
      heading: '',
      Included: true,
      item: newSourceNotes[index],
      sourceVerse: newSourceNotes[index]?.Verse,
      sourceChapter: newSourceNotes[index]?.Chapter,
    })

    if (newSourceNotes[index]?.Question?.length && newTargetNotes[index]?.Question?.length && !e.target.checked) {
      newSourceNotes.splice(index, 0, emptySourceNote)
      newTargetNotes.splice(index + 1, 0, emptyTargetNote)
    }

    updateProject({
      ...currentProject,
      sourceNotes: newSourceNotes,
      targetNotes: newTargetNotes,
      timestamp: generateTimestamp(),
    })
  }

  const value = {
    state,
    dispatch,
    setBookId,
    setProject,
    isLoading,
    setIsError,
    savedBackup,
    setIsLoading,
    removeProject,
    deleteProject,
    setSavedBackup,
    loadingMessage,
    fetchTnMarkdown,
    toggleRecordView,
    saveProjectChanges,
   }

  return <TsvDataContext.Provider value={value}>{props.children}</TsvDataContext.Provider>;
}
