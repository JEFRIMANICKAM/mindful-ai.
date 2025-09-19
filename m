import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
# Enable CORS for the front-end to be able to make requests
CORS(app)

# Get API key from .env
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    # Exit if the API key is not found
    print("❌ GEMINI_API_KEY not found. Please set it in your .env file.")
    exit()

# Configure the Gemini client with your API key
genai.configure(api_key=api_key)

# ------------------ Routes ------------------

@app.route('/')
def home():
    """
    Serves the main HTML page for the application.
    """
    return render_template('index.html')

@app.route('/reflect', methods=['POST'])
def reflect():
    """
    Receives a mood entry from the frontend, processes it with Gemini,
    and returns a personalized reflection question.
    """
    try:
        data = request.json
        mood_entry = data.get('mood_entry')

        if not mood_entry or len(mood_entry) < 5:
            return jsonify({"error": "Please provide a more detailed entry."}), 400

        # Define the model to use
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Create a single, concise prompt for the AI
        prompt = f"""
        You are a gentle and supportive mood reflection assistant. Your purpose is to help users 
        gain emotional awareness by asking insightful questions.

        Based on this mood entry: "{mood_entry}"
        
        Generate a single, personalized reflection question that encourages self-discovery. 
        The question should be concise and end with a question mark.
        """

        # Generate content from the model
        response = model.generate_content(prompt)
        reflection_question = response.text.strip()

    except Exception as e:
        print(f"❌ Error calling Gemini API: {e}")
        return jsonify({"error": "An error occurred. Please try again later."}), 500

    # Return the AI's question to the frontend
    return jsonify({
        "success": True,
        "reflection_question": reflection_question,
    })

# ------------------ Run App ------------------

if __name__ == '__main__':
    print("✅ App is running! Open your browser and navigate to http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
