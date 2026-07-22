import os
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, InternalServerError
from dotenv import load_dotenv

# 1. Local .env file se variables load karna (Local testing ke liye)
load_dotenv()

# 2. API key uthana (Local .env se ya Render server se)
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("CRITICAL ERROR: API Key nahi mili! Apni .env file check karo.")
else:
    # 3. Gemini ko configure karna
    genai.configure(api_key=api_key)

# 4. Tumhara models ka list
GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-8b",
    "gemini-1.5-flash-8b-latest",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
    "gemini-1.0-pro",
    "gemini-1.0-pro-latest",
    "gemini-pro",
    "gemini-1.0-pro-001",
    "gemini-1.5-flash-001",
    "gemini-1.5-pro-001"
]

def generate_with_fallback(prompt: str) -> str:
    """
    Loops through the GEMINI_MODELS array. If a model hits a token limit (429) 
    or server error (500), it automatically switches to the next one.
    """
    if not api_key:
         return "Error: API key is missing. Please check your .env file."

    for model_name in GEMINI_MODELS:
        try:
            print(f"🔄 Attempting generation with {model_name}...")
            
            # Initialize the current model
            model = genai.GenerativeModel(model_name)
            
            # Attempt to generate content
            response = model.generate_content(prompt)
            
            print(f"✅ Success using {model_name}!")
            return response.text
            
        except ResourceExhausted:
            print(f"⚠️ {model_name} ran out of tokens (Rate Limit). Switching to next...")
            continue 
            
        except InternalServerError:
            print(f"⚠️ {model_name} is down (Google Server Error). Switching to next...")
            continue
            
        except Exception as e:
            # If the model name is deprecated or completely invalid, skip it
            print(f"❌ Failed with {model_name}: {e}. Moving on...")
            continue

    # If it goes through the entire list and EVERY SINGLE ONE fails:
    return "Error: All Gemini API models are currently out of tokens or overloaded."