from dotenv import load_dotenv
load_dotenv()
import os
import json
import requests
from groq import Groq

# Environment Variables
AETHEX_KEY = os.getenv("AETHANA_API_KEY")
GROQ_KEY = os.getenv("GROQ_API_KEY")

BASE_URL = "https://api.aethexai.com/api/v1"

if not AETHEX_KEY:
    raise ValueError("AETHEX_API_KEY environment variable is not set")

if not GROQ_KEY:
    raise ValueError("GROQ_API_KEY environment variable is not set")

groq_client = Groq(api_key=GROQ_KEY)


def transcribe_audio(file_path: str) -> str:
    """
    Convert speech audio to text using Aethex STT.
    Falls back to Groq Whisper if Aethex fails.
    """
    # Primary: Aethex STT
    try:
        with open(file_path, "rb") as audio_file:
            response = requests.post(
                f"{BASE_URL}/transcribe",
                headers={"X-API-Key": AETHEX_KEY},
                files={"file": audio_file},
                data={"language": "english"},
                timeout=30,
            )
        response.raise_for_status()
        result = response.json()
        return result["text"]

    except Exception as aethex_error:
        print(f"[WARNING] Aethex STT failed: {aethex_error}. Falling back to Groq Whisper.")

    # Fallback: Groq Whisper
    with open(file_path, "rb") as audio_file:
        transcription = groq_client.audio.transcriptions.create(
            file=(file_path, audio_file.read()),
            model="whisper-large-v3-turbo",
            language="en",
        )

    return transcription.text


def parse_intent(transcript_text: str) -> dict:
    """
    Convert transcript into structured financial intent.
    """

    llm_response = groq_client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": """
You are a financial intent parser for Nigerian merchants.

Given a voice transcript, return ONLY valid JSON matching one of these:

{"intent": "CREATE_INVOICE", "client": "name", "amount": 150000, "memo": "reason"}

{"intent": "CHECK_BALANCE", "account_type": "high_yield_sub_account"}

{"intent": "RUN_NEGOTIATION", "counterparty": "name", "requested_amount": 50000}

Rules:
- amount must be a number
- ₦150,000 = 150000
- "fifty thousand" = 50000
- Return ONLY JSON
- No explanation
- No markdown
- "wan collect", "dey ask", "wan charge" = negotiation signals → RUN_NEGOTIATION
- "oga [name]" = counterparty name, strip "oga" prefix
""",
            },
            {
                "role": "user",
                "content": transcript_text,
            },
        ],
    )

    return json.loads(llm_response.choices[0].message.content)


def run_pipeline(audio_path: str) -> dict:
    """
    Full pipeline:
    Audio -> Transcript -> Intent
    """

    transcript = transcribe_audio(audio_path)
    intent = parse_intent(transcript)

    return {
        "transcript": transcript,
        "intent": intent,
    }


if __name__ == "__main__":
    AUDIO_FILE = "your_audio_here.wav"

    result = run_pipeline(AUDIO_FILE)

    print(json.dumps(result, indent=2))
