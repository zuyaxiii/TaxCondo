import axios from 'axios';
import { Condo } from '../types';

const API_URL = 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const condoApi = {
  getAllCondos: async (): Promise<Condo[]> => {
    const response = await api.get<Condo[]>('/condos');
    return response.data;
  },

  getCondoById: async (id: string): Promise<Condo | null> => {
    const response = await api.get<Condo>(`/condos/${id}`);
    return response.data;
  },

  createCondo: async (condo: Condo): Promise<Condo> => {
    const response = await api.post<Condo>('/condos', condo);
    return response.data;
  },

  updateCondo: async (id: string, condo: Partial<Condo>): Promise<Condo | null> => {
    const response = await api.put<Condo>(`/condos/${id}`, condo);
    return response.data;
  },

  deleteCondo: async (id: string): Promise<Condo | null> => {
    const response = await api.delete<Condo>(`/condos/${id}`);
    return response.data;
  },

  searchCondosByName: async (name: string): Promise<Condo[]> => {
    const response = await api.get<Condo[]>(`/condos/search/name?name=${encodeURIComponent(name)}`);
    return response.data;
  }
};