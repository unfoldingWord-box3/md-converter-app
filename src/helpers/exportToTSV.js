import parser from 'tsv';
import { saveAs } from 'file-saver';

function cleanNote(note) {
  if (note) {
    note = note.length > 95 ? note.replace(/\n/g, '<br>') : note.replace(/\n/g, ' ');
  }

  // Removing quotation marks since they can brake the TSV on export.
  note = note?.replace(/"/g, '')

  return note?.trim()
}

export default function exportToTSV(sourceNotes, targetNotes, bookId, resourceId) {
  const linedUpNotes = [];

  for (let i = 0; i < sourceNotes.length; i++) {
    const sourceNote = sourceNotes[i];
    const targetNote = targetNotes[i];
    const finalNote = { ...sourceNote };
    let empty = false;

    if (targetNote?.Reference && ((targetNote?.Question && targetNote?.Response) || finalNote?.Question)) {
      finalNote.Question = targetNote?.Question ? targetNote?.Question?.trim() : finalNote?.Question?.trim()
      finalNote.Response = targetNote?.Response ? targetNote?.Response?.trim() : finalNote?.Response?.trim()
    } else if (targetNote?.Reference && targetNote?.Note && targetNote?.Quote) {
      finalNote.Note = cleanNote(targetNote?.Note)
    } else if (targetNote?.Reference && targetNote?.Annotation) {
      finalNote.Annotation = cleanNote(targetNote?.Annotation)
    } else if (targetNote?.OccurrenceNote || finalNote?.OccurrenceNote) {
      finalNote.GLQuote = targetNote?.GLQuote ? targetNote?.GLQuote?.trim() : finalNote?.GLQuote?.trim()
      finalNote.OccurrenceNote = targetNote?.OccurrenceNote ? cleanNote(targetNote?.OccurrenceNote) : cleanNote(finalNote?.OccurrenceNote)
    } else {
      empty = true
    }

    if (!finalNote.ID) finalNote.ID = targetNote?.id.toString().replace(/[^a-zA-Z0-9]/gi, '')

    if (finalNote.ID && !empty) {
      const { Included } = targetNote || {}

      if (typeof Included === 'undefined') {
        linedUpNotes.push(finalNote);
      } else if (Included === true) {
        linedUpNotes.push(finalNote);
      }
    }
  }

  const tsvFile = parser.TSV.stringify(linedUpNotes);
  const filename = `${resourceId?.toLowerCase() || 'tn'}_${bookId?.toUpperCase()}.tsv`;
  const blob = new Blob([tsvFile], {type: "text/plain;charset=utf-8"});

  saveAs(blob, filename);
}
