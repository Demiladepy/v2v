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