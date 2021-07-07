import React, { useState, useCallback } from 'react';
import { customAlphabet } from 'nanoid/non-secure'
import fetchEnglishTsvsAction from '../actions/fetchEnglishTsvsAction';
import fetchTnMarkdownAction from '../actions/fetchTnMarkdownAction';
import getGlTsvContent from '../../helpers/getGlTsvContent';
import generateTimestamp from '../../helpers/generateTimestamp';
import useLoading from '../../hooks/useLoading';
import populateHeaders from '../../helpers/populateHeaders';
import useLocalStorage from '../../hooks/useLocalStorage'

export const TsvDataContext = React.createContext({});

export default function TsvDataContextProvider(props) {
  const [projects, setProjects] = useLocalStorage('projects', [])
  const [currentProject, setCurrentProject] = useLocalStorage('currentProject', null);
  const { isLoading, setIsLoading, setIsError, setLoadingMessage, loadingMessage } = useLoading();
  const [savedBackup, setSavedBackup] = useState(false);

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

      setIsLoading(false);
    } catch (error) {
      console.error(error)
    }
  }

  const setProject = useCallback((project) => {
    setSavedBackup(false);

    let newProjects = []
    const foundIndex = projects.findIndex(p => p.name === project.name)

    if (foundIndex >= 0) {
      newProjects = projects.map((p, index) => {
        if (foundIndex !== index) {
          return p;
        } else {
          return project;
        }
      })
    } else {
      newProjects = [...projects, project]
    }

    setProjects([...newProjects])
    setCurrentProject(project)
  }, [setSavedBackup, projects, setProjects, setCurrentProject])

  const updateProject = useCallback((project) => {
    console.info('updateProject()');

    setProject(project)
  }, [setProject])

  const removeProject = () => setCurrentProject(null)

  const saveProjectChanges = (targetRecords) => {
    console.info('Saving Project Changes...');
    const updatedProject = Object.assign({}, currentProject);
    updatedProject.targetNotes = targetRecords;
    updatedProject.timestamp = generateTimestamp();

    setProject(updatedProject)
  }

  const deleteProject = (projectName) => {
    const foundIndex = projects.findIndex(project => project.name === projectName)
    const newProjects = [...projects];
    newProjects.splice(foundIndex, 1);

    setProjects([...newProjects])
  }

  const toggleRecordView = (e, index) => {
    const nanoid = customAlphabet('123456789abcdefghijklmnopqrstuvwxyz', 4);
    const { targetNotes, sourceNotes, bookId } = currentProject || {}
    // Create a copy of the arrays to avoid mutation
    const newTargetNotes = Object.assign([], targetNotes)
    const newSourceNotes = Object.assign([], sourceNotes)

    newTargetNotes[index].Included = e.target.checked

    let emptySourceNote = populateHeaders({
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

    function shouldAddRow(newSourceNote, newTargetNote, emptySourceNote) {
      emptySourceNote.ID = emptySourceNote.id || emptySourceNote.ID
      if (emptySourceNote.id) delete emptySourceNote.id

      if (newSourceNote?.Question?.length && newTargetNote?.Question?.length) {
        // Remove unnecessary field on empty source note
        if (emptySourceNote.Book) delete emptySourceNote.Book

        return true;
      } else if (
        (newSourceNote?.GLQuote?.length || newSourceNote?.OccurrenceNote?.length) &&
        (newTargetNote?.OccurrenceNote?.length || newTargetNote?.OccurrenceNote?.length)
        ) {
        return true;
      }

      return false;
    }

    if (shouldAddRow(newSourceNotes[index], newTargetNotes[index], emptySourceNote) && !e.target.checked) {
      const temp = { ...newSourceNotes[index] }
      // Adding missing keys to temp
      Object.keys(newSourceNotes[index]).forEach(key => {
        if (!emptySourceNote[key]) {
          temp[key] = ''
        }
      })

      // Merging with temp to carry over missing keys in the order they should be displayed.
      emptySourceNote = { ...temp, ...emptySourceNote }

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
  //, [currentProject, updateProject])

  const value = {
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
    projects,
    currentProject,
   }

  return <TsvDataContext.Provider value={value}>{props.children}</TsvDataContext.Provider>;
}
