import axios from "axios";
import { ElMessage } from "element-plus";

const BASE_URL = import.meta.env.VITE_API_URL;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  email: string;
  username: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  userId: number;
  email: string;
  username: string;
}
export interface SentNotificationRequest {
  bookId: number;
  chapterId: number;
  userIds: number[];
}
export const changeEmail = async (newEmail: string) => {
  const token = localStorage.getItem('token')

  const response = await fetch(`${BASE_URL}/email`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ newEmail })
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Failed to change email')
  }

  return data
}

export const changePassword = async (
  oldPassword: string,
  newPassword: string
) => {
  const token = localStorage.getItem('token')

  const response = await fetch(`${BASE_URL}/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      oldPassword,
      newPassword
    })
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Failed to change password')
  }

  return data
}

export const getUser = async () => {
  const token = localStorage.getItem('token')

  const response = await fetch(`${BASE_URL}/users`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to get user')
  }

  return await response.json()
}

export const fetchUsers = async () => {
  const token = localStorage.getItem('token')
  const response = await fetch(`${BASE_URL}/users/all`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to get user')
  }
  
  return await response.json()
}


export const sendVerificationCode = async (email: string) => {
  const response = await fetch(`${BASE_URL}/users/send-code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  })

  const data = await response.json().catch(() => ({}))

  return {
    ok: response.ok,
    ...data
  }
}
export async function sendNotifications (data: SentNotificationRequest) {
  const token = localStorage.getItem('token')
  console.log('Sending notifications with data:', data)
  const response = await axios.post(`${BASE_URL}/users/notifications`, data,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
  return response.data;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await axios.post<LoginResponse>(
    `${BASE_URL}/users/login`,
    data
  );

  return response.data;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await axios.post<RegisterResponse>(
    `${BASE_URL}/users/register`,
    data
  );
  return response.data;
}