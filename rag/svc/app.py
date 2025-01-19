from flask import Flask, request, jsonify, session, send_from_directory, url_for
from flask_cors import CORS
from flask_migrate import Migrate
import os
import sys
import subprocess
#from langchain_community.vectorstores import Chroma
from langchain.prompts import ChatPromptTemplate
from langchain_community.llms.ollama import Ollama

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))    # e.g. /path/to/rag/svc
PARENT_DIR = os.path.dirname(CURRENT_DIR)                   # e.g. /path/to/rag
sys.path.append(PARENT_DIR)
from get_embedding_function import get_embedding_function

from model import db,User
from langchain_community.vectorstores import Chroma



app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure SQLAlchemy with the Flask app
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your_secret_key'

# Initialize SQLAlchemy with the app
db.init_app(app) 
migrate = Migrate(app, db)

CHROMA_PATH = "../chroma"
DATA_PATH = "../data"
THUMBNAILS_PATH = "../thumbnails"
UPLOAD_FOLDER = "../data"

PROMPT_TEMPLATE = """
Answer the question based only on the following context:

{context}

---
Answer the question based on the above context: {question}
"""

@app.route('/query', methods=['POST','OPTIONS'])
def query():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    data = request.get_json()
    query_text = data.get('query_text')
    if not query_text:
        return jsonify({"error": "No query_text provided"}), 400
    
    response = query_rag(query_text)
    return jsonify(response)

def query_rag(query_text: str):
    # Prepare the DB.
    embedding_function = get_embedding_function()
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

    # Search the DB.
    results = db.similarity_search_with_score(query_text, k=5)

    context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    prompt = prompt_template.format(context=context_text, question=query_text)

    model = Ollama(model="llama3")
    response_text = model.invoke(prompt)

    sources = []
    for doc, score in results:
        document_name = os.path.basename(doc.metadata.get("source", ""))
        source = {
            "id": doc.metadata.get("id", None),
            "score": score,
            "paragraph": doc.page_content,
            "document_name": document_name,
            "document_url": url_for('data', filename=document_name, _external=True),
            "thumbnail_url": url_for('thumbnails', filename=os.path.splitext(document_name)[0] + ".png", _external=True)
        }
        sources.append(source)

    formatted_response = {
        "response": response_text,
        "sources": sources
    }
    return formatted_response

@app.route('/data/<path:filename>', methods=['GET'])
def data(filename):
    print(f"Request for file: {filename} in directory: {DATA_PATH}")
    full_path = os.path.join(DATA_PATH, filename)
    if os.path.exists(full_path):
        print(f"Found file: {full_path}")
    else:
        print(f"File not found: {full_path}")
    return send_from_directory(DATA_PATH, filename)

@app.route('/thumbnails/<path:filename>', methods=['GET'])
def thumbnails(filename):
    print(f"Request for thumbnail: {filename} in directory: {THUMBNAILS_PATH}")
    full_path = os.path.join(THUMBNAILS_PATH, filename)
    if os.path.exists(full_path):
        print(f"Found thumbnail: {full_path}")
    else:
        print(f"Thumbnail not found: {full_path}")
    return send_from_directory(THUMBNAILS_PATH, filename)

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file:
        file.save(os.path.join(UPLOAD_FOLDER, file.filename))
        try:
            # Execute the script after a successful file upload
            subprocess.run(['python3', '../populate_database.py'], check=True)
            return jsonify({"success": True}), 200
        except subprocess.CalledProcessError as e:
            return jsonify({"error": "Failed to run script"}), 500

# ----------User managements------
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

@app.route('/signup', methods=['POST', 'OPTIONS'])
def signup():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
        return jsonify({"error": "User already exists"}), 400

    new_user = User(username=username, email=email, role='user')
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201

@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user is None or not user.check_password(password):
        return jsonify({"error": "Invalid username or password"}), 400

    session['user_id'] = user.id
    session['role'] = user.role
    session['isAuthenticated'] = True
    return jsonify({"message": "Login successful", "role": user.role}), 200

@app.route('/logout', methods=['POST', 'OPTIONS'])
def logout():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    session.clear()
    return jsonify({"message": "Logout successful"}), 200

def _build_cors_preflight_response():
    response = jsonify({"message": "CORS preflight"})
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response

if __name__ == "__main__":
    app.run(debug=True)
