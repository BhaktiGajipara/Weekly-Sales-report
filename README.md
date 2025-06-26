# CSV File Uploader for n8n Integration

A beautiful, production-ready React application for uploading CSV files to n8n workflows.

## Features

- **Drag & Drop Upload**: Intuitive file upload with drag-and-drop support
- **n8n Integration**: Seamlessly sends CSV files to n8n webhooks
- **File Validation**: Ensures only CSV files are uploaded
- **Real-time Feedback**: Shows upload progress and status
- **Responsive Design**: Works perfectly on all devices
- **Production Ready**: Beautiful UI with proper error handling

## Setup

1. **Configure n8n Webhook**:
   - Create a webhook node in your n8n workflow
   - Copy the webhook URL
   - Set the `VITE_N8N_WEBHOOK_URL` environment variable

2. **Environment Variables**:
   - Copy `.env.example` to `.env`
   - Update the n8n webhook URL:
   ```
   VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.app.n8n.cloud/webhook/csv-upload
   ```

3. **n8n Workflow Setup**:
   - Create a new workflow in n8n
   - Add a Webhook node (HTTP Request trigger)
   - Set the webhook to accept POST requests
   - Add nodes to process the uploaded CSV data
   - Deploy your workflow

## CSV File Format

The application expects CSV files with the following columns:
- Sales Rep First/Last Name
- Order Number, Project Name, Client
- Order Date, In-Hands Date
- Subtotal, Taxes, Total
- Booked Margin Subtotal, Amount, and Percentage
- Project Billed information
- Shipping information

## API Integration

The service sends files to n8n in two possible formats:

1. **FormData Upload** (default):
   - Sends the file as multipart/form-data
   - Includes filename and timestamp
   - Best for file processing workflows

2. **JSON Upload**:
   - Parses CSV and sends as JSON
   - Includes headers, data rows, and metadata
   - Best for data transformation workflows

## Development

```bash
npm run dev
```

## Building for Production

```bash
npm run build
```

## Deployment

The application can be deployed to any static hosting service like Netlify, Vercel, or AWS S3.

Make sure to set the `VITE_N8N_WEBHOOK_URL` environment variable in your deployment environment.