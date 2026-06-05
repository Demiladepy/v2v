"""
Flask server wrapping the ML intent pipeline.

Exposes HTTP endpoints for:
- POST /transcribe — STT audio transcription
- POST /parse-intent — LLM intent parsing
- POST /process-voice — Full pipeline (audio → intent)
- POST /synthesize — Text to speech (TTS)
- GET /health — Liveness check
"""

import os
import json
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

from intent_pipeline import transcribe_audio, parse_intent
from tts_pipeline import generate_voice_response

app = Flask(__name__)
CORS(app)



# Health Check

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "ok": True,
        "data": {
            "status": "healthy",
            "service": "v2v-ml-pipeline"
        }
    }), 200

 
# Transcribe Audio

@app.route("/transcribe", methods=["POST"])
def transcribe_endpoint():
    try:
        if 'audio' not in request.files:
            return jsonify({"ok": False, "error": "Missing audio"}), 400

        audio_file = request.files['audio']

        if audio_file.filename == '':
            return jsonify({"ok": False, "error": "No file selected"}), 400

        temp_path = f"/tmp/{audio_file.filename}"
        audio_file.save(temp_path)

        transcript_text = transcribe_audio(temp_path)

        if os.path.exists(temp_path):
            os.remove(temp_path)

        return jsonify({
            "ok": True,
            "data": {
                "text": transcript_text,
                "duration_ms": 0
            }
        }), 200

    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


# Parse Intent

@app.route("/parse-intent", methods=["POST"])
def parse_intent_endpoint():
    try:
        body = request.get_json()

        if not body or 'transcript' not in body:
            return jsonify({"ok": False, "error": "Missing transcript"}), 400

        transcript_text = body['transcript']

        parsed = parse_intent(transcript_text)

        return jsonify({
            "ok": True,
            "data": {
                "intent": parsed.get("intent", "UNKNOWN"),
                "parameters": parsed,
                "confidence": 0.92
            }
        }), 200

    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


# Full Voice Pipeline

@app.route("/process-voice", methods=["POST"])
def process_voice_endpoint():
    try:
        if 'audio' not in request.files:
            return jsonify({"ok": False, "error": "Missing audio"}), 400

        audio_file = request.files['audio']

        temp_path = f"/tmp/{audio_file.filename}"
        audio_file.save(temp_path)

        transcript_text = transcribe_audio(temp_path)

        if os.path.exists(temp_path):
            os.remove(temp_path)

        parsed_intent = parse_intent(transcript_text)

        return jsonify({
            "ok": True,
            "data": {
                "transcript": transcript_text,
                "intent": parsed_intent.get("intent", "UNKNOWN"),
                "parameters": parsed_intent,
                "confidence": 0.92
            }
        }), 200

    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500



# TTS Endpoint

@app.route("/synthesize", methods=["POST"])
def synthesize_endpoint():
    try:
        body = request.get_json()

        if not body or "message" not in body:
            return jsonify({"ok": False, "error": "Missing message"}), 400

        message = body["message"]

        audio_path = generate_voice_response(message)

        return send_file(
            audio_path,
            mimetype="audio/mpeg",
            as_attachment=False,
            download_name="response.mp3"
        )

    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "production") == "development"

    print(f"🚀 Starting ML Pipeline Server on port {port}")
    print("POST /transcribe")
    print("POST /parse-intent")
    print("POST /process-voice")
    print("POST /synthesize")
    print("GET  /health")

    app.run(host="0.0.0.0", port=port, debug=debug)