// Function to dynamically import mock data based on the provided filename
export const loadMockData = async (filename) => {
    try {
      const data = await import(`../mocks/${filename}.json`);
      return data.default;
    } catch (error) {
      console.error("Error loading mock data:", error);
      return [];
    }
  };
  