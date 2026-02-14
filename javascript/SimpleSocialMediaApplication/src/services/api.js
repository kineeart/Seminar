const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to handle API responses
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'UNKNOWN_ERROR',
      message: `HTTP ${response.status}: ${response.statusText}`
    }));
    throw new Error(error.message || 'An error occurred');
  }
  
  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
}

// Check if backend is available
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok || response.status === 404; // 404 is ok, means API is reachable
  } catch (error) {
    return false;
  }
}

// Posts API
export const postsAPI = {
  // GET /api/posts
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // GET /api/posts/{postId}
  getById: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // POST /api/posts
  create: async (username, content) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, content }),
    });
    return handleResponse(response);
  },

  // PATCH /api/posts/{postId}
  update: async (postId, username, content) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, content }),
    });
    return handleResponse(response);
  },

  // DELETE /api/posts/{postId}
  delete: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },
};

// Comments API
export const commentsAPI = {
  // GET /api/posts/{postId}/comments
  getByPostId: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // GET /api/posts/{postId}/comments/{commentId}
  getById: async (postId, commentId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // POST /api/posts/{postId}/comments
  create: async (postId, username, content) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, content }),
    });
    return handleResponse(response);
  },

  // PATCH /api/posts/{postId}/comments/{commentId}
  update: async (postId, commentId, username, content) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, content }),
    });
    return handleResponse(response);
  },

  // DELETE /api/posts/{postId}/comments/{commentId}
  delete: async (postId, commentId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },
};

// Likes API
export const likesAPI = {
  // POST /api/posts/{postId}/likes
  like: async (postId, username) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
    return handleResponse(response);
  },

  // DELETE /api/posts/{postId}/likes
  unlike: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/likes`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },
};
