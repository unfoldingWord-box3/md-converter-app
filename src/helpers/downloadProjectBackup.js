import { saveAs } from 'file-saver';

export default async function downloadProjectBackup(project) {
  return new Promise((resolve, reject) => {
    try {
      const json = JSON.stringify({...project})
      const filename = `${project.name}.json`;
      const blob = new Blob([json], {type: "text/plain;charset=utf-8"});

      saveAs(blob, filename);
      resolve();
    } catch (error) {
      console.error(error)
      reject();
    }
  })
}
