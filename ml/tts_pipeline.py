from dotenv import load_dotenv
load_dotenv()
import os
import requests

YARNGPT_KEY = os.getenv("YARNGPT_API_KEY")

def generate_voice_response(text: str, output_path: str = "/tmp/response.mp3") -> str:
    """
    Convert confirmation message to speech using YarnGPT TTS.
    Returns path to the saved audio file.
    """
    if not YARNGPT_KEY:
        raise ValueError("YARNGPT_API_KEY environment variable is not set")

    response = requests.post(
        "https://yarngpt.ai/api/v1/tts",
        headers={
            "Authorization": f"Bearer {YARNGPT_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "text": text,
            "voice": "Femi",
            "response_format": "mp3",
        },
        timeout=30,
        stream=True,
    )

    response.raise_for_status()

    with open(output_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)

    return output_path