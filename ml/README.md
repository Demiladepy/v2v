# V2V ML Pipeline Service

Quick start guide for the ML pipeline service.

## Local Development

### Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Set environment variables
export AETHEX_KEY="your-aethex-api-key"
export GROQ_KEY="your-groq-api-key"

# Run Flask server
python app.py
```

Server starts on `http://localhost:5000`

### API Endpoints

#### 1. Health Check
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "ok": true,
  "data": {
    "status": "healthy",
    "service": "v2v-ml-pipeline"
  }
}
```

#### 2. Transcribe Audio (STT)
```bash
curl -X POST http://localhost:5000/transcribe \
  -F "audio=@/path/to/audio.webm"
```

Response:
```json
{
  "ok": true,
  "data": {
    "text": "Invoice Cafe One 150000 for coffee supplies",
    "duration_ms": 1200
  }
}
```

#### 3. Parse Intent (LLM)
```bash
curl -X POST http://localhost:5000/parse-intent \
  -H "Content-Type: application/json" \
  -d '{"transcript":"Invoice Cafe One 150000 for coffee supplies"}'
```

Response:
```json
{
  "ok": true,
  "data": {
    "intent": "CREATE_INVOICE",
    "parameters": {
      "intent": "CREATE_INVOICE",
      "client": "Cafe One",
      "amount": 150000,
      "memo": "for coffee supplies"
    },
    "confidence": 0.92
  }
}
```

#### 4. Full Pipeline (Audio → Intent)
```bash
curl -X POST http://localhost:5000/process-voice \
  -F "audio=@/path/to/audio.webm" \
  -F "merchant_id=demo_merchant"
```

Response:
```json
{
  "ok": true,
  "data": {
    "transcript": "Invoice Cafe One 150000 for coffee supplies",
    "intent": "CREATE_INVOICE",
    "parameters": {
      "intent": "CREATE_INVOICE",
      "client": "Cafe One",
      "amount": 150000,
      "memo": "for coffee supplies"
    },
    "confidence": 0.92
  }
}
```

---

## Docker Deployment

### Build Image
```bash
docker build -t v2v-ml-pipeline:latest ml/
```

### Run Container
```bash
docker run -it --rm \
  -p 5000:5000 \
  -e AETHEX_KEY="your-key" \
  -e GROQ_KEY="your-key" \
  v2v-ml-pipeline:latest
```

### Using Docker Compose
```bash
# Copy environment variables first
cp .env.example .env.local

# Start ML service
docker-compose up ml-pipeline

# Service available at http://localhost:5000
```

---

## Integration with Next.js App

To use this ML service from the Next.js backend:

1. **Start the ML service:**
   ```bash
   python ml/app.py
   ```

2. **Configure Next.js environment:**
   ```bash
   # .env.local
   INTENT_PARSER_MODE=ml
   ML_INTENT_PARSER_URL=http://localhost:5000/parse-intent
   ```

3. **Restart Next.js:**
   ```bash
   npm run dev
   ```


---

## Production Deployment

### Using Railway, Render, or Heroku:

1. Push the repo to GitHub
2. Create a new service from this repository
3. Set build context to `ml/`
4. Set environment variables:
   - `AETHEX_KEY`
   - `GROQ_KEY`
5. Deploy

The Flask app will start automatically on the platform's default port.

### Using AWS Lambda:

Use `zappa` or `serverless` framework to wrap the Flask app.

### Using Cloud Run (GCP):

```bash
gcloud run deploy v2v-ml-pipeline \
  --source ml/ \
  --platform managed \
  --region us-central1 \
  --set-env-vars AETHEX_KEY="...",GROQ_KEY="..."
```

---

## Architecture

```
Frontend (browser)
    ↓ (audio blob)
    ↓
Next.js /api/voice/process
    ↓
ML Service (Flask) ← 
    ├─ /transcribe → Aethex API (STT)
    └─ /parse-intent → Groq API (LLM)
    ↓
Next.js /api/financial/router 
    ↓
Supabase (ledger)
```

---

## Testing

```bash
# Run the pipeline with a test audio file
python ml/intent_pipeline.py

# Or test each endpoint individually (see above curl examples)
```

---

## Environment Variables

```bash
# Required
AETHEX_KEY=your-aethex-api-key        # From developers.aethexai.com
GROQ_KEY=your-groq-api-key            # From console.groq.com

# Optional
PORT=5000                              # Flask port (default: 5000)
FLASK_ENV=development                  # development or production
```

---

## Troubleshooting

**Service won't start:**
- Check Python version: `python --version` (should be 3.8+)
- Install dependencies: `pip install -r requirements.txt`
- Check environment variables are set

**Aethex API errors:**
- Verify `AETHEX_KEY` is correct
- Check audio file format (supports: webm, mp4, wav)

**Groq API errors:**
- Verify `GROQ_KEY` is correct
- Check rate limits at console.groq.com

**CORS issues:**
- Flask-CORS is configured; should allow all origins in dev
- For production, configure `CORS(app, origins=["https://yourdomain.com"])`

