import axios from "axios";

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