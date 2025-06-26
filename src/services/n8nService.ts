// Configure your n8n webhook URL here
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/csv-upload';

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const uploadToN8n = async (file: File): Promise<UploadResponse> => {
  try {
    // Check if webhook URL is configured
    if (!N8N_WEBHOOK_URL || N8N_WEBHOOK_URL === 'http://localhost:5678/webhook/csv-upload') {
      return {
        success: false,
        message: 'Please configure your n8n webhook URL in the .env file. Copy .env.example to .env and update VITE_N8N_WEBHOOK_URL with your actual n8n webhook URL.'
      };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);
    formData.append('timestamp', new Date().toISOString());

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type header when using FormData
        // Let the browser set it automatically with boundary
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      message: 'File uploaded successfully to n8n',
      data: result
    };
  } catch (error) {
    console.error('Error uploading to n8n:', error);
    
    let errorMessage = 'Upload failed';
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Cannot connect to n8n webhook. Please ensure:\n1. Your n8n instance is running\n2. The webhook workflow is activated\n3. The webhook URL in .env is correct\n4. CORS is configured in n8n to allow requests from this domain';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

// Alternative method for sending CSV data as JSON
export const uploadCsvDataAsJson = async (file: File): Promise<UploadResponse> => {
  try {
    // Check if webhook URL is configured
    if (!N8N_WEBHOOK_URL || N8N_WEBHOOK_URL === 'http://localhost:5678/webhook/csv-upload') {
      return {
        success: false,
        message: 'Please configure your n8n webhook URL in the .env file.'
      };
    }

    const csvText = await file.text();
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const data = lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    const payload = {
      filename: file.name,
      timestamp: new Date().toISOString(),
      headers,
      data,
      rowCount: data.length
    };

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      message: 'CSV data uploaded successfully to n8n',
      data: result
    };
  } catch (error) {
    console.error('Error uploading CSV data to n8n:', error);
    
    let errorMessage = 'Upload failed';
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Cannot connect to n8n webhook. Please ensure your n8n instance is running and the webhook URL is correct.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
};