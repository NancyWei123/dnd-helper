const API_BASE_URL = 'http://localhost:8080/api'

export const uploadCover = async (file: File) => {
  const token = localStorage.getItem('token')

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/upload/cover`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Upload failed')
  }

  return data
}