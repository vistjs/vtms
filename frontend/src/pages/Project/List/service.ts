import { request } from '@umijs/max';
import { ProjectPostData } from './types';

export async function getProjects() {
  return request<Record<string, any>>('/api/projects');
}

export async function editProject(seq: number, data: ProjectPostData) {
  return request<Record<string, any>>(`/api/projects/${seq}`, {
    method: 'PUT',
    data,
    requestType: 'form',
  });
}

export async function deleteProject(seq: number) {
  return request<Record<string, any>>(`/api/projects/${seq}`, {
    method: 'DELETE',
  });
}

export async function createProject(data: ProjectPostData) {
  return request<Record<string, any>>(`/api/projects/create`, {
    method: 'PUT',
    data,
    requestType: 'form',
  });
}

export async function getUsers() {
  return request<Record<string, any>>('/api/user/users');
}
