import parser from 'tsv';
import { saveAs } from 'file-saver';

function cleanNote(note) {
  if (note) {
    return note.length > 95 ? note.replace(/\n/g, '<br>') : note.replace(/\n/g, ' ');
  }
  return note?.trim()
}

export default function exportToTSV(sourceNotes, targetNotes, bookId, resourceId) {
  const linedUpNotes = [];

  for (let i = 0; i < sourceNotes.length; i++) {
    const sourceNote = sourceNotes[i];
    const targetNote = targetNotes[i];
    const finalNote = sourceNote;

    if (targetNote?.Reference && targetNote?.Question && targetNote?.Response) {
      finalNote.Question = targetNote?.Question?.trim()
      finalNote.Response = targetNote?.Response?.trim()
    } else if (targetNote?.Reference && targetNote?.Note && targetNote?.Quote) {
      finalNote.Note = cleanNote(targetNote?.Note)
    } else if (targetNote?.Reference && targetNote?.Annotation) {
      finalNote.Annotation = cleanNote(targetNote?.Annotation)
    } else {
      finalNote.GLQuote = targetNote?.GLQuote?.trim();
      finalNote.OccurrenceNote = cleanNote(targetNote?.OccurrenceNote)
    }

    linedUpNotes.push(finalNote);
  }

  const tsvFile = parser.TSV.stringify(linedUpNotes);
  const filename = `${resourceId?.toLowerCase() || 'tn'}_${bookId?.toUpperCase()}.tsv`;
  const blob = new Blob([tsvFile], {type: "text/plain;charset=utf-8"});

  saveAs(blob, filename);
}
