// src/Api/book.ts
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export interface CreateBookRequest {
  title: string;
  description: string;
  coverUrl: string;
  status?: string;
}

export interface UpdateBookRequest {
  title: string;
  description: string;
  coverUrl: string;
  status?: string;
}

export interface BookResponse {
  id: number;
  userId: number;
  title: string;
  description: string;
  coverUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function authHeaders() {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/**
 * POST /api/books
 * Create a book for current logged-in user
 */
export async function createBook(
  data: CreateBookRequest
): Promise<BookResponse> {
  const response = await axios.post<BookResponse>(
    `${BASE_URL}/books`,
    data,
    {
      headers: authHeaders(),
    }
  );

  return response.data;
}

/**
 * GET /api/books/all
 * Get all books from all users
 */
export async function getAllBooks(): Promise<BookResponse[]> {
  const response = await axios.get<BookResponse[]>(
    `${BASE_URL}/books/all`,
    {
      headers: authHeaders(),
    }
  );

  return response.data;
}

/**
 * GET /api/books
 * Get current user's books
 */
export async function getMyBooks(): Promise<BookResponse[]> {
  const response = await axios.get<BookResponse[]>(
    `${BASE_URL}/books`,
    {
      headers: authHeaders(),
    }
  );

  return response.data;
}

/**
 * GET /api/books/{bookId}
 * Get one book by id
 */
export async function getBookById(
  bookId: number | string
): Promise<BookResponse> {
  const response = await axios.get<BookResponse>(
    `${BASE_URL}/books/${bookId}`,
    {
      headers: authHeaders(),
    }
  );

  return response.data;
}

/**
 * PUT /api/books/{bookId}
 * Update one book
 */
export async function updateBook(
  bookId: number | string,
  data: UpdateBookRequest
): Promise<BookResponse> {
  const response = await axios.put<BookResponse>(
    `${BASE_URL}/books/${bookId}`,
    data,
    {
      headers: authHeaders(),
    }
  );

  return response.data;
}

/**
 * DELETE /api/books/{bookId}
 * Delete one book
 */
export async function deleteBook(
  bookId: number | string
): Promise<string> {
  const response = await axios.delete<string>(
    `${BASE_URL}/books/${bookId}`,
    {
      headers: authHeaders(),
    }
  );

  return response.data;
}