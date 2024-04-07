import OpenAI from 'openai';

// Initialize OpenAI instance with API key
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note the security implications of this setting
});

/**
 * Analyzes text using GPT and returns the response as JSON.
 *
 * @param {string} text - The text to analyze.
 * @returns {Promise<string>} The analyzed text response from GPT.
 */
export const analyzeTextWithGPT = async (text) => {
  try {
    const completionResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant designed to output JSON.' },
        { role: 'user', content: text },
      ],
    });

    // Debugging: Log the API response
    console.log('API Completion Response:', completionResponse);

    // Check for valid completion choices
    if (completionResponse?.choices?.length > 0) {
      const firstChoice = completionResponse.choices[0];

      // Extract the text response
      const responseText = firstChoice.message?.content || firstChoice.text;
      return responseText.toLowerCase();
    } else {
      console.error(
        'No completion choices found or unexpected response structure:',
        completionResponse,
      );
      throw new Error('No completion choices found or unexpected response structure.');
    }
  } catch (error) {
    console.error('Error in analyzeTextWithGPT:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
};
