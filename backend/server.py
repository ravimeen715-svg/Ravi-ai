import os
import asyncio
from fastapi import FastAPI, HTTPException, Request, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import edge_tts
from moviepy.editor import *
import cv2
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "output"))
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# ==========================================
# 1. VOICE GENERATION
# ==========================================
@app.post("/api/voice")
async def generate_voice(request: Request):
    data = await request.json()
    script = data.get("script", "")
    provider = data.get("provider", "google") # google (edge-tts), elevenlabs, openai
    voice_preset = data.get("voice", "en-US-ChristopherNeural")
    
    if not script:
        raise HTTPException(status_code=400, detail="Script is required")
        
    output_path = os.path.join(OUTPUT_DIR, "voice.mp3")
    
    try:
        if provider == "elevenlabs":
            api_key = data.get("api_key")
            voice_id = data.get("voice_id", "21m00Tcm4TlvDq8ikWAM")
            url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
            headers = {"xi-api-key": api_key, "Content-Type": "application/json"}
            payload = {"text": script, "model_id": "eleven_monolingual_v1"}
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code == 200:
                with open(output_path, "wb") as f:
                    f.write(response.content)
            else:
                raise Exception(f"ElevenLabs Error: {response.text}")
                
        else:
            # Default to Edge TTS (Free High Quality Microsoft/Google-like TTS)
            communicate = edge_tts.Communicate(script, voice_preset)
            await communicate.save(output_path)
            
        return {"status": "success", "file_url": "/api/download/voice.mp3"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 2. VIDEO EDITING
# ==========================================
@app.post("/api/video")
async def generate_video(request: Request):
    data = await request.json()
    # Expects an array of scenes: { "text": "...", "duration": 5.0, "image_url": "..." }
    scenes_data = data.get("scenes", [])
    
    voice_path = os.path.join(OUTPUT_DIR, "voice.mp3")
    output_video_path = os.path.join(OUTPUT_DIR, "final_video.mp4")
    
    if not os.path.exists(voice_path):
        raise HTTPException(status_code=400, detail="voice.mp3 not found. Generate voice first.")
        
    try:
        audio_clip = AudioFileClip(voice_path)
        clips = []
        
        current_time = 0
        for i, scene in enumerate(scenes_data):
            # Download image or Generate AI Image dynamically using a free, keyless AI provider
            img_path = os.path.join(OUTPUT_DIR, f"scene_{i}.jpg")
            if scene.get("image_url") and scene["image_url"].startswith("http"):
                img_data = requests.get(scene["image_url"]).content
                with open(img_path, "wb") as f:
                    f.write(img_data)
            else:
                # Provide a free fallback AI image generator instead of a black screen
                prompt = scene.get("text", f"cinematic scene {i}")
                encoded_prompt = requests.utils.quote(f"{prompt} vertical portrait high quality")
                fallback_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1080&height=1920&nologo=true"
                img_data = requests.get(fallback_url).content
                with open(img_path, "wb") as f:
                    f.write(img_data)

            duration = float(scene.get("duration", 3.0))
            
            # Create Image Clip (Vertical Shorts Format 1080x1920)
            img_clip = ImageClip(img_path).set_duration(duration)
            
            # Subtitle setup
            txt_clip = TextClip(scene.get("text", " "), fontsize=60, color='white', 
                              stroke_color='black', stroke_width=2, method='caption', 
                              size=(900, None), align='center')
            txt_clip = txt_clip.set_position(('center', 'center')).set_duration(duration)
            
            composite = CompositeVideoClip([img_clip, txt_clip])
            clips.append(composite)
            
        if clips:
            final_clip = concatenate_videoclips(clips, method="compose")
            final_clip = final_clip.set_audio(audio_clip)
            
            # Export video
            final_clip.write_videofile(
                output_video_path,
                fps=24,
                codec="libx264",
                audio_codec="aac",
                preset="ultrafast",
                threads=4
            )
            return {"status": "success", "file_url": "/api/download/final_video.mp4"}
        else:
            raise Exception("No scenes defined.")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# 3. YOUTUBE UPLOAD (Requires human approval OAuth)
# ==========================================
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

@app.post("/api/upload")
async def upload_youtube(request: Request):
    data = await request.json()
    title = data.get("title", "AI Generated Short")
    description = data.get("description", "#shorts")
    tags = data.get("tags", ["shorts", "ai"])
    
    video_path = os.path.join(OUTPUT_DIR, "final_video.mp4")
    
    if not os.path.exists(video_path):
        raise HTTPException(status_code=400, detail="final_video.mp4 not found.")
        
    client_secrets_file = os.path.join(os.path.dirname(__file__), "client_secrets.json")
    if not os.path.exists(client_secrets_file):
        raise HTTPException(status_code=400, detail="client_secrets.json missing. Required for YouTube API.")
        
    try:
        flow = InstalledAppFlow.from_client_secrets_file(client_secrets_file, SCOPES)
        # This will open a browser for the user to approve
        credentials = flow.run_local_server(port=0)
        
        youtube = build('youtube', 'v3', credentials=credentials)
        
        body = {
            'snippet': {
                'title': title,
                'description': description,
                'tags': tags,
                'categoryId': '22'
            },
            'status': {
                'privacyStatus': 'private', # Default private for safety
                'selfDeclaredMadeForKids': False
            }
        }
        
        media = MediaFileUpload(video_path, chunksize=-1, resumable=True)
        request_obj = youtube.videos().insert(
            part=','.join(body.keys()),
            body=body,
            media_body=media
        )
        
        response = None
        while response is None:
            status, response = request_obj.next_chunk()
            
        return {"status": "success", "video_id": response.get("id")}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9090)
