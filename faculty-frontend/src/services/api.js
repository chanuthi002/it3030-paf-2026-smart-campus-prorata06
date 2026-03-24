import axios from "axios";

const BASE_URL = "http://localhost:8080/api/resources";

export const getAllResources = () => axios.get(BASE_URL);

export const createResource = (data) => axios.post(BASE_URL, data);

export const deleteResource = (id) => axios.delete(`${BASE_URL}/${id}`);

export const updateResource = (id, data) =>
  axios.put(`${BASE_URL}/${id}`, data);

export const searchResources = (type, location) =>
  axios.get(`${BASE_URL}/search?type=${type}&location=${location}`);