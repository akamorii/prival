import type { InfoField } from '../types';
import { http } from './http';

export function fetchInfoFields(): Promise<InfoField[]> {
  return http.get<InfoField[]>('/api/info-fields');
}

export function saveInfoField(field: InfoField): Promise<InfoField> {
  return http.put<InfoField>(`/api/info-fields/${field.id}`, field);
}

export function deleteInfoField(fieldId: string): Promise<void> {
  return http.delete<void>(`/api/info-fields/${fieldId}`);
}
