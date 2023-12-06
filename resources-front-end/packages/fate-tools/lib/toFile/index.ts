import { saveAs } from 'file-saver';

export default function toFile(
  data: string | string[] | Blob,
  filename: string
) {
  if (Array.isArray(data)) {
    data = new Blob(data, {type: "text/plain;charset=utf-8"});
  }
  saveAs(data, filename);
}
