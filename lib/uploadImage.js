import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';
import axios from 'axios';
import { randomBytes } from 'crypto';
import fakeUserAgent from 'fake-useragent';

const createFormData = (content, fieldName, ext) => {
  const formData = new FormData();
  formData.append(fieldName, content, `${randomBytes(4).toString('hex')}.${ext}`);
  return formData;
};

export default async function uploadImage(buffer) {
  try {
    const { ext } = await fileTypeFromBuffer(buffer) || {};
    const formData = createFormData(buffer, "fileToUpload", ext || 'dat');
    formData.append("reqtype", "fileupload");
    const response = await axios.post("https://catbox.moe/user/api.php", formData, {
      headers: {
        "User-Agent": fakeUserAgent(),
        ...formData.getHeaders(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error(String(error));
  }
};
