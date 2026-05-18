async function fetchLesson(lessonId) {
  const baseUrl = process.env.CONTENT_SERVICE_URL;
  if (!baseUrl || !lessonId) {
    return null;
  }

  try {
    const response = await fetch(`${baseUrl}/lessons/${lessonId}`);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.lesson || null;
  } catch (err) {
    return null;
  }
}

module.exports = {
  fetchLesson,
};
