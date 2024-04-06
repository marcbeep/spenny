import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { analyzeTextWithGPT } from '../api'; // Adjust the path as necessary

const OCRUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [gptResult, setGptResult] = useState(''); // State to store GPT-3 analysis result

  const handleImageUpload = (event) => {
    const imageFile = event.target.files[0];
    if (!imageFile) {
      console.log("No file selected.");
      return;
    }

    setIsLoading(true);
    setOcrText(''); // Reset OCR text for new uploads
    setGptResult(''); // Reset GPT result for new uploads
    Tesseract.recognize(
      imageFile,
      'eng',
      {
        logger: m => console.log(m),
      }
    ).then(({ data: { text } }) => {
      console.log(text);
      setOcrText(text); // Update state with OCR text
      // Use text directly for GPT analysis
      const gptPrompt = `Given the following OCR text extracted from a receipt, give your best guess to fill out the following fields: success (either true or false), transaction_title, amount, category, type (credit or debit). If you can guess, return success: true followed by the rest of fields. If you cannot make an intelligent guess, return success:false in json only. You can generalise for the transaction_title. For example, "Paul's Italiano" might mean "Italian Food". Here is the text: ${text}`;
      analyzeTextWithGPT(gptPrompt)
        .then(result => {
          console.log(result);
          setGptResult(result); // Update state with GPT analysis result
          setIsLoading(false); // Update loading state
        })
        .catch(error => {
          console.error("Error analyzing text with GPT:", error);
          setIsLoading(false); // Ensure loading state is updated in case of error
        });
    });
  };

  return (
    <div className="card bg-base-100 shadow-xl p-8">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Upload a clear picture of your receipt</span>
        </label>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input file-input-bordered w-full max-w-xs" />
        {isLoading && (
          <div className="flex justify-left items-left mt-4">
            <progress className="progress w-56"></progress>
          </div>
        )}
        {ocrText && (
          <div className="mt-4">
            <div className="label">
              <span className="label-text">Extracted Text</span>
            </div>
            <p>{ocrText}</p>
          </div>
        )}
        {gptResult && (
          <div className="mt-4">
            <div className="label">
              <span className="label-text">GPT-3.5 Analysis</span>
            </div>
            <p>{gptResult}</p> {/* Display the GPT-3.5 analysis result */}
          </div>
        )}
      </div>
    </div>
  );
};

export default OCRUpload;
