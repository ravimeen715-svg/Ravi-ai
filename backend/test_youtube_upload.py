import os
import sys

# Attempt to load google api clients
try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
except ImportError:
    print("❌ ERROR: Missing google-api-python-client. Run: pip install google-api-python-client google-auth-oauthlib google-auth-httplib2")
    sys.exit(1)

SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

def test_youtube_upload():
    print("\n============================================")
    print("🚀 INIT: DIRECT YOUTUBE UPLOAD TEST")
    print("============================================")
    
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    OUTPUT_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "output"))
    
    video_path = os.path.join(OUTPUT_DIR, "final_video.mp4")
    client_secrets_file = os.path.join(BASE_DIR, "client_secrets.json")
    
    if not os.path.exists(video_path):
        print(f"❌ ERROR: Video file not found: {video_path}")
        print("Please run 'run_e2e_test.py' first to generate 'final_video.mp4'")
        sys.exit(1)
        
    print(f"[✓] Found Video File: {video_path}")
    print(f"    Size: {os.path.getsize(video_path) / (1024*1024):.2f} MB")
    
    if not os.path.exists(client_secrets_file):
        print(f"\n❌ FATAL BLOCKER: 'client_secrets.json' is missing.")
        print("   Required Location: " + client_secrets_file)
        print("\n   [ACTION REQUIRED]")
        print("   1. Go to Google Cloud Console (console.cloud.google.com)")
        print("   2. Enable YouTube Data API v3")
        print("   3. Create Credentials -> OAuth Client ID -> Type: Desktop App")
        print("   4. Download JSON and place it in the path shown above.")
        print("   5. Re-run this test script.")
        sys.exit(1)
        
    print("\n⏳ Initating Google OAuth Flow...")
    try:
        flow = InstalledAppFlow.from_client_secrets_file(client_secrets_file, SCOPES)
        # Run local server to catch the redirect callback
        credentials = flow.run_local_server(port=0)
        
        youtube = build('youtube', 'v3', credentials=credentials)
        print("\n[✓] User Authenticated via OAuth Successfully.")
        
        print("\n⏳ Uploading video to YouTube (Private status)...")
        body = {
            'snippet': {
                'title': 'AI in Hospitals: The 2026 Shift #shorts',
                'description': 'AI is changing the world. #shorts #ai #technology',
                'tags': ['shorts', 'ai', 'hospital', 'technology'],
                'categoryId': '22'
            },
            'status': {
                'privacyStatus': 'private', # Private so user can safely review before publishing
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
            if status:
                print(f"   Upload Progress: {int(status.progress() * 100)}%")
                
        print("\n============================================")
        print(f"✅ YOUTUBE PUBLISH SUCCESSFUL: Video ID {response.get('id')}")
        print(f"🎬 LINK: https://studio.youtube.com/video/{response.get('id')}/edit")
        print("============================================")
        
    except Exception as e:
        print(f"\n❌ YOUTUBE UPLOAD FAILED: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    test_youtube_upload()
