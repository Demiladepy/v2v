"""
Flask server wrapping the ML intent pipeline.

Exposes HTTP endpoints for:
- POST /transcribe — Aethex STT audio transcription
- POST /parse-intent — Groq LLM intent parsing
- POST /process-voice — Full pipeline (audio → intent)
- POST /synthesize — YarnGPT TTS text to speech
- GET /health — Liveness check

These endpoints are called by Next.js app when:
INTENT_PARSER_MODE=ml
ML_INTENT_PARSER_URL=http://localhost:5000
"""

import os
import time
import json
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from intent_pipeline import transcribe_audio, parse_intent
from tts_pipeline import generate_voice_response

app = Flask(__name__)
CORS(app)


# Health check
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "ok": True,
        "data": {
            "status": "healthy",
            "service": "v2v-ml-pipeline"
        }
    }), 200


@app.route("/transcribe", methods=["POST"])
def transcribe_endpoint():
    """
    POST /transcribe

    Accept audio file and return transcription.

    Request:
    - multipart/form-data with 'audio' file

    Response:
    {
      "ok": true,
      "data": {
        "text": "transcribed text",
        "duration_ms": 1200
      }
    }
    """
    try:
        if 'audio' not in request.files:
            return jsonify({
                "ok": False,
                "error": "Missing 'audio' file in request"
            }), 400

        audio_file = request.files['audio']

        if audio_file.filename == '':
            return jsonify({
                "ok": False,
                "error": "No audio file selected"
            }), 400

        temp_path = f"/tmp/{audio_file.filename}"
        audio_file.save(temp_path)

        start = time.perf_counter()
        transcript_text = transcribe_audio(temp_path)
        duration_ms = round((time.perf_counter() - start) * 1000)

        if os.path.exists(temp_path):
            os.remove(temp_path)

        return jsonify({
            "ok": True,
            "data": {
                "text": transcript_text,
                "duration_ms": duration_ms
            }
        }), 200

    except Exception as e:
        return jsonify({
            "ok": False,
            "error": str(e)
        }), 500


@app.route("/parse-intent", methods=["POST"])
def parse_intent_endpoint():
    """
    POST /parse-intent

    Parse plain text transcript into structured financial intent.

    Request:
    {
      "transcript": "Invoice Cafe One 150000 for coffee supplies"
    }

    Response:
    {
      "ok": true,
      "data": {
        "intent": "CREATE_INVOICE",
        "parameters": { ... },
        "confidence": 0.92,
        "duration_ms": 298
      }
    }
    """
    try:
        body = request.get_json()

        if not body or 'transcript' not in body:
            return jsonify({
                "ok": False,
                "error": "Missing 'transcript' field in request body"
            }), 400

        transcript_text = body['transcript']

        if not isinstance(transcript_text, str) or not transcript_text.strip():
            return jsonify({
                "ok": False,
                "error": "Transcript must be a non-empty string"
            }), 400

        start = time.perf_counter()
        parsed_intent = parse_intent(transcript_text)
        duration_ms = round((time.perf_counter() - start) * 1000)

        return jsonify({
            "ok": True,
            "data": {
                "intent": parsed_intent.get("intent", "UNKNOWN"),
                "parameters": parsed_intent,
                "confidence": 0.92,
                "duration_ms": duration_ms
            }
        }), 200

    except json.JSONDecodeError:
        return jsonify({
            "ok": False,
            "error": "Invalid JSON in request body"
        }), 400

    except Exception as e:
        return jsonify({
            "ok": False,
            "error": str(e)
        }), 500


@app.route("/process-voice", methods=["POST"])
def process_voice_endpoint():
    """
    POST /process-voice

    Full pipeline: audio → transcription → intent parsing

    Request:
    - multipart/form-data with 'audio' file + optional 'merchant_id'

    Response:
    {
      "ok": true,
      "data": {
        "transcript": "transcribed text",
        "intent": "CREATE_INVOICE",
        "parameters": { intent object },
        "confidence": 0.92,
        "duration_ms": 1703,
        "stt_ms": 1334,
        "intent_ms": 369
      }
    }
    """
    try:
        if 'audio' not in request.files:
            return jsonify({
                "ok": False,
                "error": "Missing 'audio' file in request"
            }), 400

        audio_file = request.files['audio']
        merchant_id = request.form.get('merchant_id', 'default_merchant')

        temp_path = f"/tmp/{audio_file.filename}"
        audio_file.save(temp_path)

        start = time.perf_counter()
        transcript_text = transcribe_audio(temp_path)
        stt_ms = round((time.perf_counter() - start) * 1000)

        if os.path.exists(temp_path):
            os.remove(temp_path)

        start = time.perf_counter()
        parsed_intent = parse_intent(transcript_text)
        intent_ms = round((time.perf_counter() - start) * 1000)

        return jsonify({
            "ok": True,
            "data": {
                "transcript": transcript_text,
                "intent": parsed_intent.get("intent", "UNKNOWN"),
                "parameters": parsed_intent,
                "confidence": 0.92,
                "duration_ms": stt_ms + intent_ms,
                "stt_ms": stt_ms,
                "intent_ms": intent_ms
            }
        }), 200

    except Exception as e:
        return jsonify({
            "ok": False,
            "error": str(e)
        }), 500


@app.route("/synthesize", methods=["POST"])
def synthesize_endpoint():
    """
    POST /synthesize

    Convert a confirmation message to speech using YarnGPT TTS.

    Request:
    {
      "message": "Invoice of ₦150,000 created for Cafe One."
    }

    Response:
    - audio/mpeg file (mp3)
    """
    try:
        body = request.get_json()

        if not body or 'message' not in body:
            return jsonify({
                "ok": False,
                "error": "Missing 'message' field in request body"
            }), 400

        message = body['message']

        if not isinstance(message, str) or not message.strip():
            return jsonify({
                "ok": False,
                "error": "Message must be a non-empty string"
            }), 400

        audio_path = generate_voice_response(message)

        return send_file(
            audio_path,
            mimetype="audio/mpeg",
            as_attachment=False,
            download_name="response.mp3"
        )

    except Exception as e:
        return jsonify({
            "ok": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "production") == "development"

    print(f"🚀 Starting V2V ML Pipeline Server on port {port}")
    print(f"   POST /transcribe     — STT audio to text")
    print(f"   POST /parse-intent   — Text to intent JSON")
    print(f"   POST /process-voice  — Full pipeline (audio → intent)")
    print(f"   POST /synthesize     — Text to speech (YarnGPT)")
    print(f"   GET  /health         — Liveness check")

    app.run(host="0.0.0.0", port=port, debug=debug)
