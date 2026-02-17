from flask import Flask, request, jsonify, send_file
import os
from dotenv import load_dotenv
import torch
from PIL import Image
import io
import base64
import time
import threading
from datetime import datetime

load_dotenv()

app = Flask(__name__)
PORT = int(os.getenv('PORT', 5001))

# Manual CORS handler
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"🎮 Using device: {device}")

# Model storage
models = {}
model_lock = threading.Lock()
models_loading = {}
models_loaded = {}

# Output directory
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'outputs')
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ==================== MODEL LOADING ====================

def load_stable_diffusion():
    """Load Stable Diffusion model"""
    if models.get('stable_diffusion'):
        return models['stable_diffusion']
    
    if models_loading.get('stable_diffusion'):
        return None
    
    models_loading['stable_diffusion'] = True
    
    try:
        from diffusers import StableDiffusionPipeline
        print("📥 Loading Stable Diffusion model... (this may take a few minutes first time)")
        
        pipe = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=torch.float32,
            safety_checker=None,
            requires_safety_checker=False
        )
        
        pipe = pipe.to(device)
        models['stable_diffusion'] = pipe
        models_loaded['stable_diffusion'] = datetime.now().isoformat()
        models_loading['stable_diffusion'] = False
        
        print("✅ Stable Diffusion model loaded!")
        return pipe
        
    except Exception as e:
        models_loading['stable_diffusion'] = False
        print(f"❌ Failed to load Stable Diffusion: {e}")
        return None

def load_tts_model():
    """Load TTS model"""
    if models.get('tts'):
        return models['tts']
    
    if models_loading.get('tts'):
        return None
    
    models_loading['tts'] = True
    
    try:
        from TTS.api import TTS
        print("📥 Loading TTS model... (this may take a few minutes first time)")
        
        tts = TTS(model_path=None, config_path=None, gpu=(device == "cuda"))
        tts.load_model.by_name("xtts_v2", gpu=(device == "cuda"))
        
        models['tts'] = tts
        models_loaded['tts'] = datetime.now().isoformat()
        models_loading['tts'] = False
        
        print("✅ TTS model loaded!")
        return tts
        
    except Exception as e:
        # Try alternative TTS
        try:
            from gTTS import gTTS
            models['tts'] = 'gtts'
            models_loaded['tts'] = datetime.now().isoformat()
            models_loading['tts'] = False
            print("✅ gTTS (Google TTS) available!")
            return 'gtts'
        except:
            models_loading['tts'] = False
            print(f"❌ Failed to load TTS: {e}")
            return None

# ==================== IMAGE GENERATION ====================

@app.route('/api/image/generate', methods=['POST'])
def generate_image():
    try:
        data = request.json
        prompt = data.get('prompt', '')
        negative_prompt = data.get('negative_prompt', 'blurry, ugly, distorted, low quality')
        num_inference_steps = int(data.get('steps', 25))
        guidance_scale = float(data.get('guidance_scale', 7.5))
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        # Load model if not loaded
        pipe = models.get('stable_diffusion')
        if not pipe and not models_loading.get('stable_diffusion'):
            pipe = load_stable_diffusion()
        
        if models_loading.get('stable_diffusion'):
            return jsonify({
                'success': True,
                'message': 'Model is loading, please try again in a moment',
                'status': 'loading'
            }), 202
        
        if not pipe:
            return jsonify({'error': 'Stable Diffusion model not available'}), 500
        
        # Generate image
        print(f"🖼️ Generating image: {prompt}")
        
        with torch.inference_mode():
            result = pipe(
                prompt=prompt,
                negative_prompt=negative_prompt,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale
            )
        
        image = result.images[0]
        
        # Save image
        job_id = f"img-{int(time.time())}"
        image_path = os.path.join(OUTPUT_DIR, f"{job_id}.png")
        image.save(image_path)
        
        # Convert to base64 for immediate display
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        print(f"✅ Image generated: {job_id}")
        
        return jsonify({
            'success': True,
            'message': 'Image generated successfully',
            'jobId': job_id,
            'imageUrl': f'/api/output/{job_id}.png',
            'imageBase64': f"data:image/png;base64,{img_base64}",
            'prompt': prompt,
            'device': device
        }), 200
        
    except Exception as e:
        print(f"❌ Image generation error: {e}")
        return jsonify({'error': str(e)}), 500

# ==================== VIDEO GENERATION ====================

@app.route('/api/video/generate', methods=['POST'])
def generate_video():
    try:
        data = request.json
        prompt = data.get('prompt', '')
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        # Video generation requires heavy GPU - provide info
        if device == "cpu":
            return jsonify({
                'success': False,
                'error': 'Video generation requires GPU. CPU mode not supported.',
                'message': 'This feature requires CUDA GPU for practical use.',
                'alternative': 'Try image generation instead!'
            }), 400
        
        # TODO: Integrate with Wan/HunyuanVideo when GPU available
        return jsonify({
            'success': True,
            'message': 'Video generation requires GPU',
            'status': 'requires_gpu',
            'device': device,
            'note': 'Video models (Wan, HunyuanVideo) require significant GPU memory'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== AUDIO GENERATION ====================

@app.route('/api/audio/generate', methods=['POST'])
def generate_audio():
    try:
        data = request.json
        text = data.get('text', '')
        voice = data.get('voice', 'en')
        
        if not text:
            return jsonify({'error': 'Text is required'}), 400
        
        # Use gTTS as fallback
        tts_model = models.get('tts')
        
        if not tts_model and not models_loading.get('tts'):
            tts_model = load_tts_model()
        
        if models_loading.get('tts'):
            return jsonify({
                'success': True,
                'message': 'TTS model is loading, please try again',
                'status': 'loading'
            }), 202
        
        job_id = f"aud-{int(time.time())}"
        audio_path = os.path.join(OUTPUT_DIR, f"{job_id}.mp3")
        
        print(f"🔊 Generating audio: {text[:50]}...")
        
        if tts_model == 'gtts' or not tts_model:
            # Use gTTS (Google TTS) - works without local model
            from gtts import gTTS
            tts = gTTS(text=text, lang=voice)
            tts.save(audio_path)
        else:
            # Use Coqui TTS
            tts_model.tts_to_file(text=text, file_path=audio_path)
        
        print(f"✅ Audio generated: {job_id}")
        
        return jsonify({
            'success': True,
            'message': 'Audio generated successfully',
            'jobId': job_id,
            'audioUrl': f'/api/output/{job_id}.mp3',
            'text': text,
            'voice': voice
        }), 200
        
    except Exception as e:
        print(f"❌ Audio generation error: {e}")
        return jsonify({'error': str(e)}), 500

# ==================== IMAGE TO IMAGE ====================

@app.route('/api/image/img2img', methods=['POST'])
def image_to_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        prompt = request.form.get('prompt', '')
        strength = float(request.form.get('strength', 0.8))
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        # Load model
        pipe = models.get('stable_diffusion')
        if not pipe and not models_loading.get('stable_diffusion'):
            pipe = load_stable_diffusion()
        
        if not pipe:
            return jsonify({'error': 'Stable Diffusion model not available'}), 500
        
        # Read input image
        image_file = request.files['image']
        input_image = Image.open(image_file).convert("RGB")
        input_image = input_image.resize((512, 512))
        
        # Generate
        with torch.inference_mode():
            result = pipe(
                prompt=prompt,
                image=input_image,
                strength=strength,
                num_inference_steps=20
            )
        
        image = result.images[0]
        
        job_id = f"img2img-{int(time.time())}"
        image_path = os.path.join(OUTPUT_DIR, f"{job_id}.png")
        image.save(image_path)
        
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        return jsonify({
            'success': True,
            'jobId': job_id,
            'imageUrl': f'/api/output/{job_id}.png',
            'imageBase64': f"data:image/png;base64,{img_base64}"
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== OUTPUT FILES ====================

@app.route('/api/output/<filename>', methods=['GET'])
def get_output(filename):
    try:
        filepath = os.path.join(OUTPUT_DIR, filename)
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        
        if filename.endswith('.png'):
            return send_file(filepath, mimetype='image/png')
        elif filename.endswith('.mp3'):
            return send_file(filepath, mimetype='audio/mpeg')
        else:
            return send_file(filepath)
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== MODEL STATUS ====================

@app.route('/api/models/status', methods=['GET'])
def model_status():
    return jsonify({
        'device': device,
        'torch_version': torch.__version__,
        'models_loaded': models_loaded,
        'models_loading': models_loading,
        'available_models': {
            'stable_diffusion': models.get('stable_diffusion') is not None,
            'tts': models.get('tts') is not None
        }
    }), 200

# ==================== HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ML Service is running!',
        'device': device,
        'torch_version': torch.__version__,
        'models_loaded': list(models_loaded.keys())
    }), 200

# ==================== ERROR HANDLING ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ==================== START SERVER ====================

if __name__ == '__main__':
    print(f"""
╔═══════════════════════════════════════════════════════════╗
║         🎨 AI Content Studio - ML Service                 ║
╠═══════════════════════════════════════════════════════════╣
║  Device: {device:<47} ║
║  Port: {PORT:<48} ║
║  Output: {OUTPUT_DIR[:47]} ║
╚═══════════════════════════════════════════════════════════╝
    """)
    print(f"✅ ML Service running at http://localhost:{PORT}")
    print("\n📌 Available endpoints:")
    print("   POST /api/image/generate - Generate image from text")
    print("   POST /api/image/img2img  - Image to image transformation")
    print("   POST /api/video/generate  - Generate video from text")
    print("   POST /api/audio/generate - Text to speech")
    print("   GET  /api/models/status   - Check loaded models")
    print("   GET  /api/health          - Health check")
    
    app.run(host='0.0.0.0', port=PORT, debug=True)
