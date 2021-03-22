import parser from 'tsv';
import { saveAs } from 'file-saver';

function cleanNote(note) {
  if (note) {
    return note.length > 95 ? note.replace(/\n/g, '<br>') : note.replace(/\n/g, ' ');
  }
  return note.trim()
}

export default function exportToTSV(sourceNotes, targetNotes, bookId, resourceId) {
  const linedUpNotes = [];

  console.log({ sourceNotes, targetNotes })

  for (let i = 0; i < sourceNotes.length; i++) {
    const sourceNote = sourceNotes[i];
    const targetNote = targetNotes[i];
    const finalNote = sourceNote;

    if (targetNote?.Reference && targetNote?.Question && targetNote?.Response) {
      finalNote.Question = targetNote?.Question.trim()
      finalNote.Response = targetNote?.Response.trim()
      console.log('targetNote?.Response.trim', targetNote?.Response.trim() + '___')
      console.log('targetNote?.Response.split', targetNote?.Response.trim().split("\u21b5").join('') + '___')
      console.log('targetNote?.Response.replace', targetNote?.Response.trim().replace(/\u21b5/g,'') + '___')
    } else if (targetNote?.Reference && targetNote?.Note && targetNote?.Quote) {
      finalNote.Note = cleanNote(targetNote?.Note)
    } else if (targetNote?.Reference && targetNote?.Annotation) {
      finalNote.Annotation = cleanNote(targetNote?.Annotation)
    } else {
      finalNote.GLQuote = targetNote?.GLQuote.trim();
      finalNote.OccurrenceNote = cleanNote(targetNote?.OccurrenceNote)
    }




    linedUpNotes.push(finalNote);
  }

  console.log({ linedUpNotes })

  const tsvFile = parser.TSV.stringify(linedUpNotes);
  console.log({tsvFile})
  const filename = `${resourceId?.toLowerCase() || 'tn'}_${bookId?.toUpperCase()}.tsv`;
  const blob = new Blob([tsvFile], {type: "text/plain;charset=utf-8"});

  saveAs(blob, filename);
}
