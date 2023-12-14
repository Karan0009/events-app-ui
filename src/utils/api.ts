/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { BASE_URL } from './constants';

export const getEvents = async () => {
  const response = await axios.get(`${BASE_URL}/event/get-events`);
  return response.data;
};

export const createEvent = async (data: any, files: File[]) => {
  const formData = new FormData();
  Object.keys(data).forEach((key: string) => {
    formData.append(key, data[key]);
  });
  for (let i = 0; i < files.length; ++i) {
    formData.append('files', files[i]);
  }
  const response = await axios.post(`${BASE_URL}/event`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log(response.data);
};
