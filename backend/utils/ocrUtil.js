import Tesseract from 'tesseract.js';
import path from 'path';

/**
 * Perform OCR on a document and check if values exist in the text
 * @param {string} imagePath - Path or URL to the image
 * @param {Object} fieldsToVerify - Object with field names as keys and values as values { name: 'John Doe', dob: '2000-01-01' }
 * @returns {Promise<Object>} - { verifiedFields: ['name', 'dob'], ocrText: '...' }
 */
export const performOCRVerification = async (imagePath, fieldsToVerify) => {
    try {
        console.log(`Starting OCR on: ${imagePath}`);
        
        // Ensure imagePath is a full URL or absolute path
        // Tesseract.js handles URLs directly
        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'eng',
            { 
                // logger: m => console.log(m) 
            }
        );

        console.log('OCR Text Extracted:', text);

        // Helper function to remove ALL punctuation and ALL spaces for extremely robust matching
        const cleanText = (str) => {
            if (!str) return '';
            return String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
        };

        const normalizedText = cleanText(text);

        const verifiedFields = [];

        for (const [field, value] of Object.entries(fieldsToVerify)) {
            if (!value) continue;

            const originalValue = String(value).toLowerCase().trim();
            const normalizedValue = cleanText(value);
            
            if (!normalizedValue) continue;

            // Basic substring check on the cleaned text
            if (normalizedText.includes(normalizedValue)) {
                verifiedFields.push(field);
            } else if (field === 'dob') {
                // Try alternate date formats
                const dateParts = originalValue.split('-'); // assuming YYYY-MM-DD
                if (dateParts.length === 3) {
                    const formats = [
                        `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`, // DD/MM/YYYY
                        `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`, // DD-MM-YYYY
                        `${dateParts[2]} ${dateParts[1]} ${dateParts[0]}`, 
                    ];
                    // Strip and test the formats against the cleaned text
                    if (formats.some(fmt => normalizedText.includes(cleanText(fmt)))) {
                        verifiedFields.push(field);
                    }
                }
            }
        }

        return {
            verifiedFields,
            ocrText: text
        };
    } catch (error) {
        console.error('OCR Verification error:', error);
        return {
            verifiedFields: [],
            ocrText: '',
            error: error.message
        };
    }
};
