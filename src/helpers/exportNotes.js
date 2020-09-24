import parser from 'tsv';
import { saveAs } from 'file-saver';
import { TN_FILENAMES } from '../common/BooksOfTheBible';

export default function exportNotes(sourceNotes, targetNotes, bookId, languageId) {
  const linedUpNotes = [];

  for (let i = 0; i < sourceNotes.length; i++) {
    const sourceNote = sourceNotes[i];
    const targetNote = targetNotes[i];
    const finalNote = sourceNote;
    finalNote.GLQuote = targetNote.GLQuote;
    finalNote.OccurrenceNote = targetNote.OccurrenceNote.length > 95 ?
      targetNote.OccurrenceNote.replace(/\n/g, '<br>') : targetNote.OccurrenceNote.replace(/\n/g, ' ');
    linedUpNotes.push(finalNote);
  }

  const tsvFile = parser.TSV.stringify(linedUpNotes);
  const filename = `${languageId}${TN_FILENAMES[bookId]}.tsv`;
  const blob = new Blob([tsvFile], {type: "text/plain;charset=utf-8"});

  saveAs(blob, filename);
}
