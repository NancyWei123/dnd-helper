// src/Api/chapter.ts
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export interface CreateChapterRequest {
  title: string;
  contentMd: string;
  chapterOrder: number;
  musicUrl?: string;
}

export interface UpdateChapterRequest {
  title: string;
  contentMd: string;
  chapterOrder: number;
  musicUrl?: string;
}

export interface ChapterResponse {
  id: number;
  bookId: number;
  title: string;
  contentMd: string;
  chapterOrder: number;
  musicUrl?: string;
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
 * POST /api/books/{bookId}/chapters
 */
export async function createChapter(
  bookId: number | string,
  data: CreateChapterRequest
): Promise<ChapterResponse> {
  const response = await axios.post<ChapterResponse>(
    `${BASE_URL}/books/${bookId}/chapters`,
    data,
    {
      headers: authHeaders(),
    }
  );

  return response.data;
}

/**
 * GET /api/books/{bookId}/chapters
 */
export async function getChaptersByBook(
  bookId: number | string
): Promise<ChapterResponse[]> {
  const response = await axios.get<ChapterResponse[]>(
    `${BASE_URL}/books/${bookId}/chapters`,
    {
      headers: authHeaders(),
    }
  );

  return response.data;
}

/**
 * GET /api/books/{bookId}/chapters/{chapterId}
 */
export async function getChapterById(
  bookId: number | string,
  chapterId: number | string
): Promise<ChapterResponse> {
  const response = await axios.get<ChapterResponse>(
    `${BASE_URL}/books/${bookId}/chapters/${chapterId}`,
    {
      headers: authHeaders(),
    }
  );

  return response.data;
}

/**
 * PUT /api/books/{bookId}/chapters/{chapterId}
 */
export async function updateChapter(
  bookId: number | string,
  chapterId: number | string,
  data: UpdateChapterRequest
): Promise<ChapterResponse> {
  const response = await axios.put<ChapterResponse>(
    `${BASE_URL}/books/${bookId}/chapters/${chapterId}`,
    data,
    {
      headers: authHeaders(),
    }
  );

  return response.data;
}

/**
 * DELETE /api/books/{bookId}/chapters/{chapterId}
 */
export const deleteChapter = async (bookId: string, chapterId: number) => {
  const token = localStorage.getItem('token')

  const response = await fetch(
    `http://localhost:8080/api/books/${bookId}/chapters/${chapterId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to delete chapter')
  }

  return true
}