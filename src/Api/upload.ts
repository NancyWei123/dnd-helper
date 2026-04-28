const API_BASE_URL = 'http://localhost:8080/api'

export const uploadImage = async (file: File) => {
  const token = localStorage.getItem('token')

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('http://localhost:8080/api/upload/image', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Image upload failed')
  }

  return data
}

export const uploadMusic = async (file: File) => {
  const token = localStorage.getItem('token')

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('http://localhost:8080/api/upload/music', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Music upload failed')
  }

  return data
}

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