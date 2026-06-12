
export const getPlayableMusicUrl = (url: string) => {
  if (!url) return ''

  const trimmedUrl = url.trim()

  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl
  }

  if (trimmedUrl.startsWith('/uploads')) {
    return `http://localhost:8080${trimmedUrl}`
  }

  if (trimmedUrl.startsWith('/music')) {
    return `${window.location.origin}${trimmedUrl}`
  }

  return trimmedUrl
}

export const getCoverUrl = (url: string) => {
  if (!url) return ''

  if (url.startsWith('blob:')) return ''

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  if (url.startsWith('/uploads')) {
    return `http://localhost:8080${url}`
  }

  return url
}
