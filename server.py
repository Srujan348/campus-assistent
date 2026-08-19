"""
GM University CampusMind AI - Flask Backend API Server with MongoDB Atlas & RAG Pipeline
Provides full RESTful CRUD interactions and Retrieval-Augmented Generation (RAG) using google-generativeai SDK.
"""

from flask import Flask, request, jsonify, send_from_directory
import os
import json
import urllib.request
import urllib.error
import random
import datetime
import pymongo
from bson.objectid import ObjectId
import google.generativeai as genai

app = Flask(__name__, static_folder=".", static_url_path="")

# --- LOAD ENVIRONMENT VARIABLES FROM .env IF PRESENT ---
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ[k.strip()] = v.strip().strip("'\"")

load_env()

# --- MONGODB ATLAS / LOCAL CONFIGURATION ---
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("DB_NAME", "gmu_campus_db")

def get_mongo_client():
    """Returns a PyMongo MongoClient supporting both local MongoDB and MongoDB Atlas (mongodb+srv://)."""
    options = {
        "serverSelectionTimeoutMS": 5000,
        "connectTimeoutMS": 5000
    }
    if "mongodb+srv://" in MONGO_URI or "tls=true" in MONGO_URI.lower() or "ssl=true" in MONGO_URI.lower():
        options["tls"] = True
        options["tlsAllowInvalidCertificates"] = True

    return pymongo.MongoClient(MONGO_URI, **options)

def get_db():
    client = get_mongo_client()
    return client[DB_NAME]

def mask_uri(uri):
    """Masks MongoDB Atlas password in logs and API status responses for security."""
    if "@" in uri and ":" in uri:
        try:
            prefix, rest = uri.split("://", 1)
            creds, host = rest.split("@", 1)
            user = creds.split(":", 1)[0]
            return f"{prefix}://{user}:*****@{host}"
        except Exception:
            return "mongodb+srv://[masked]@cluster"
    return uri

def format_doc(doc):
    """Utility to convert MongoDB document BSON ObjectIds to string for clean JSON response."""
    if not doc:
        return doc
    doc = dict(doc)
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

def init_mongodb():
    """Initializes MongoDB database collections and seeds default campus datasets."""
    try:
        db = get_db()
        
        # 1. Seed Search Resources
        search_col = db["search_resources"]
        if search_col.count_documents({}) == 0:
            search_col.insert_many([
                {"title": "B.Tech Computer Science & Engineering (CSE)", "category": "academics", "content": "4-Year B.Tech program focused on AI, Cloud Computing, Full Stack Development. HOD: Dr. Sunil Kumar B.S."},
                {"title": "GMU Engineering Admission Fees 2026", "category": "admissions", "content": "Annual tuition fee: CSE ₹1.85L, AIML ₹1.80L, ECE ₹1.45L, MCA ₹1.20L. SSP and e-Pass scholarships."},
                {"title": "Srikanta Boy's Hostel Facilities", "category": "facilities", "content": "600-bed student residence with 24/7 solar hot water, WiFi, veg/non-veg mess, gym. Fee: ₹85,000/yr."},
                {"title": "Dr. Sunil Kumar B. S. (HOD CSE)", "category": "faculty", "content": "Professor & Head of CSE Department. Specialist in ML & Cloud Security. Email: hod.cse@gmu.ac.in."},
                {"title": "Internal Assessment (IA-2) Exam Circular", "category": "circulars", "content": "Official Circular #2026-04: IA-2 exams for 3rd & 5th sem B.Tech scheduled Sept 12 - Sept 15, 2026."}
            ])

        # 2. Seed Timetable Collection
        tt_col = db["timetable"]
        if tt_col.count_documents({}) == 0:
            tt_col.insert_many([
                {"day": "Tue", "branch": "CSE", "time_slot": "09:00 AM - 10:00 AM", "subject": "Software Engineering & SDLC (21CS51)", "faculty": "Prof. Sneha M.", "room": "FET-304", "status": "completed"},
                {"day": "Tue", "branch": "CSE", "time_slot": "10:00 AM - 11:00 AM", "subject": "Database Management Systems (21CS53)", "faculty": "Dr. Sunil Kumar", "room": "FET-304", "status": "ongoing"},
                {"day": "Tue", "branch": "CSE", "time_slot": "11:15 AM - 01:15 PM", "subject": "DBMS & Web Tech Lab (21CSL55)", "faculty": "Prof. Ramesh K.", "room": "FCIT Lab 3", "status": "upcoming"},
                {"day": "Tue", "branch": "CSE", "time_slot": "02:00 PM - 03:00 PM", "subject": "Computer Networks (21CS52)", "faculty": "Dr. Anitha P.", "room": "FET-304", "status": "upcoming"}
            ])

        # 3. Seed Sample Assignments
        assign_col = db["assignments"]
        if assign_col.count_documents({}) == 0:
            assign_col.insert_many([
                {"title": "DBMS Mini Project Submission", "subject": "21CS53", "status": "todo", "priority": "high", "due_date": "Aug 24, 2026"},
                {"title": "Computer Networks Lab Manual", "subject": "21CS52", "status": "todo", "priority": "medium", "due_date": "Aug 26, 2026"},
                {"title": "AIML IA-2 Question Solving", "subject": "21CS54", "status": "inprogress", "priority": "high", "due_date": "Aug 22, 2026"}
            ])

        # 4. Seed Faculty Collection (For RAG Pipeline)
        faculty_col = db["Faculty"]
        if faculty_col.count_documents({}) == 0:
            faculty_col.insert_many([
                {"name": "Dr. Sunil Kumar B. S.", "department": "Computer Science & Engineering (CSE)", "role": "HOD & Professor", "email": "hod.cse@gmu.ac.in", "phone": "+91 8192 233380", "office": "FET Block - 2nd Floor, Room 204", "specialization": "Machine Learning, Cloud Computing, Cybersecurity"},
                {"name": "Dr. Rajashekarappa", "department": "Electronics & Communication (ECE)", "role": "HOD & Professor", "email": "hod.ece@gmu.ac.in", "phone": "+91 8192 233382", "office": "FET Block - 1st Floor, Room 112", "specialization": "VLSI Design, Signal Processing"},
                {"name": "Prof. Tejasvi R.", "department": "Training & Placement Cell", "role": "Chief TPO Officer", "email": "tpo@gmu.ac.in", "phone": "+91 8192 233399", "office": "Admin Block - Ground Floor", "specialization": "Career Guidance & Technical Recruitment"},
                {"name": "Prof. Murugesh B.", "department": "Student Housing Directorate", "role": "Chief Hostel Warden", "email": "hostel@gmu.ac.in", "phone": "+91 8192 233366", "office": "Srikanta Hostel Office", "specialization": "Student Welfare & Hostel Administration"}
            ])

        # 5. Seed Notices Collection (For RAG Pipeline)
        notices_col = db["Notices"]
        if notices_col.count_documents({}) == 0:
            notices_col.insert_many([
                {"title": "Internal Assessment (IA-2) Timetable Circular", "category": "Exams", "content": "IA-2 examinations for 3rd and 5th semester B.Tech students will be held Sept 12 - Sept 15, 2026. Detailed schedule uploaded on portal.", "date": "2026-08-10"},
                {"title": "GMU National Hackathon 2026 Announcement", "category": "Events", "content": "36-hour National AI & Web Hackathon organized by CSE Dept. Cash prizes up to ₹1,50,000. Registration deadline: Aug 28, 2026.", "date": "2026-08-12"},
                {"title": "Srikanta & Saraswathi Hostel Fee Payment Reminder", "category": "Circular", "content": "All hostel residents are requested to pay term-2 mess and hostel fee balance by Sept 01, 2026 at administrative office.", "date": "2026-08-14"}
            ])

        print(f"MongoDB Connected & Seeded Successfully in '{DB_NAME}' via {mask_uri(MONGO_URI)}!")
    except Exception as e:
        print("Warning: MongoDB Setup Warning (Running with dynamic fallback):", e)

# Initialize MongoDB on server start
init_mongodb()

# --- STATIC FILES ---
@app.route("/")
def serve_index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(".", path)

# ==============================================================================
# RETRIEVAL-AUGMENTED GENERATION (RAG) FLASK ROUTE (/api/ask)
# ==============================================================================

@app.route("/api/ask", methods=["POST"])
def rag_ask():
    """
    POST /api/ask
    Retrieval-Augmented Generation (RAG) Workflow:
    1. Query MongoDB 'Faculty' and 'Notices' collections for relevant context.
    2. Format retrieved context into a prompt.
    3. Pass context and user query to Gemini API via google-generativeai SDK.
    4. Return conversational, accurate answer along with retrieved sources.
    """
    data = request.json or {}
    query = data.get("query", "").strip()
    api_key = data.get("apiKey", "") or os.getenv("GEMINI_API_KEY", "")

    if not query:
        return jsonify({"error": "Field 'query' is required"}), 400

    try:
        db = get_db()
        faculty_col = db["Faculty"]
        notices_col = db["Notices"]

        # Step 1: Query MongoDB 'Faculty' collection for matching context
        faculty_matches = []
        if query:
            faculty_cursor = faculty_col.find({
                "$or": [
                    {"name": {"$regex": query, "$options": "i"}},
                    {"department": {"$regex": query, "$options": "i"}},
                    {"role": {"$regex": query, "$options": "i"}},
                    {"specialization": {"$regex": query, "$options": "i"}},
                    {"email": {"$regex": query, "$options": "i"}}
                ]
            })
            faculty_matches = list(faculty_cursor)
        
        # If specific keyword match returned 0, fetch general faculty records as context
        if not faculty_matches:
            faculty_matches = list(faculty_col.find().limit(5))

        # Step 2: Query MongoDB 'Notices' collection for matching context
        notices_matches = []
        if query:
            notices_cursor = notices_col.find({
                "$or": [
                    {"title": {"$regex": query, "$options": "i"}},
                    {"content": {"$regex": query, "$options": "i"}},
                    {"category": {"$regex": query, "$options": "i"}}
                ]
            })
            notices_matches = list(notices_cursor)

        # If specific keyword match returned 0, fetch recent notices as context
        if not notices_matches:
            notices_matches = list(notices_col.find().limit(5))

        # Step 3: Format retrieved MongoDB context
        context_parts = []
        context_parts.append("--- RETRIEVED MONGODB 'Faculty' COLLECTION CONTEXT ---")
        for f in faculty_matches:
            context_parts.append(
                f"• Faculty: {f.get('name')} | Dept: {f.get('department')} | Role: {f.get('role')} | "
                f"Email: {f.get('email')} | Phone: {f.get('phone')} | Office: {f.get('office')} | "
                f"Specialization: {f.get('specialization')}"
            )

        context_parts.append("\n--- RETRIEVED MONGODB 'Notices' COLLECTION CONTEXT ---")
        for n in notices_matches:
            context_parts.append(
                f"• Notice: {n.get('title')} | Category: {n.get('category')} | Date: {n.get('date')} | "
                f"Details: {n.get('content')}"
            )

        context_str = "\n".join(context_parts)

        # Step 4: Call Gemini API using google-generativeai SDK
        answer_text = ""
        used_gemini_sdk = False

        if api_key:
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel("gemini-1.5-flash")

                system_prompt = (
                    "You are GMU CampusMind AI, an intelligent smart campus assistant for GM University, Davangere.\n"
                    "Use the following retrieved context from MongoDB collections ('Faculty' and 'Notices') to "
                    "answer the student's question accurately, concisely, and conversationally.\n\n"
                    f"[MONGODB RETRIEVED CONTEXT]\n{context_str}\n\n"
                    f"[STUDENT QUERY]\n{query}\n\n"
                    "Provide a clear, polite, and helpful answer. Format important details nicely using HTML tags like <strong> or <ul>."
                )

                response = model.generate_content(system_prompt)
                if response and hasattr(response, "text"):
                    answer_text = response.text
                    used_gemini_sdk = True
            except Exception as sdk_err:
                print("google-generativeai SDK Error, falling back to local RAG synthesis:", sdk_err)

        # Fallback local RAG synthesis if Gemini API Key not present or offline
        if not answer_text:
            answer_parts = []
            answer_parts.append(f"Here is the information from GM University records regarding <strong>'{query}'</strong>:<br>")
            
            if faculty_matches:
                answer_parts.append("<br><strong>👨‍🏫 Relevant Faculty Directory:</strong><ul>")
                for f in faculty_matches[:3]:
                    answer_parts.append(f"<li><strong>{f.get('name')}</strong> ({f.get('role')}, {f.get('department')}) &bull; Email: <em>{f.get('email')}</em> &bull; Office: {f.get('office')}</li>")
                answer_parts.append("</ul>")

            if notices_matches:
                answer_parts.append("<br><strong>📢 Related Notices & Circulars:</strong><ul>")
                for n in notices_matches[:3]:
                    answer_parts.append(f"<li><strong>{n.get('title')}</strong> ({n.get('category')}, {n.get('date')}): {n.get('content')}</li>")
                answer_parts.append("</ul>")

            answer_text = "".join(answer_parts)

        # Persist RAG interaction to MongoDB chat_history
        db["chat_history"].insert_one({
            "persona": "rag_query",
            "user_query": query,
            "bot_response": answer_text,
            "source": "RAG Pipeline (MongoDB 'Faculty' & 'Notices' + Gemini SDK)",
            "created_at": datetime.datetime.utcnow().isoformat()
        })

        return jsonify({
            "query": query,
            "answer": answer_text,
            "used_gemini_sdk": used_gemini_sdk,
            "rag_context_summary": {
                "faculty_records_retrieved": len(faculty_matches),
                "notices_records_retrieved": len(notices_matches)
            },
            "status": "SUCCESS"
        }), 200

    except Exception as e:
        return jsonify({"error": str(e), "status": "ERROR"}), 500


# ==============================================================================
# MONGODB DATABASE CRUD API ENDPOINTS
# ==============================================================================

# --- 1. MONGODB HEALTH & STATUS ROUTE ---
@app.route("/api/db/status", methods=["GET"])
def db_status():
    """Returns connection details and document counts for all MongoDB collections."""
    try:
        client = get_mongo_client()
        server_info = client.server_info()
        db = client[DB_NAME]

        collections = ["chat_history", "search_resources", "timetable", "assignments", "library_reservations", "Faculty", "Notices"]
        counts = {col: db[col].count_documents({}) for col in collections}

        return jsonify({
            "connection": "CONNECTED",
            "db_engine": "MongoDB (Atlas/Local)",
            "mongo_version": server_info.get("version", "Unknown"),
            "database_name": DB_NAME,
            "mongo_uri": mask_uri(MONGO_URI),
            "is_atlas": "mongodb+srv://" in MONGO_URI,
            "gemini_api_key_configured": bool(os.getenv("GEMINI_API_KEY")),
            "collection_counts": counts,
            "status": "SUCCESS"
        })
    except Exception as e:
        return jsonify({
            "connection": "FAILED",
            "error": str(e),
            "mongo_uri": mask_uri(MONGO_URI),
            "status": "ERROR"
        }), 500


# --- 2. CHAT HISTORY MONGODB ENDPOINTS ---
@app.route("/api/db/chat-history", methods=["GET"])
def get_chat_history():
    persona = request.args.get("persona")
    try:
        db = get_db()
        filter_q = {"persona": persona} if persona else {}
        docs = list(db["chat_history"].find(filter_q).sort("_id", -1).limit(50))
        return jsonify({"count": len(docs), "history": [format_doc(d) for d in docs]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/db/chat-history", methods=["POST"])
def add_chat_history():
    data = request.json or {}
    if not data.get("user_query") or not data.get("bot_response"):
        return jsonify({"error": "user_query and bot_response are required"}), 400

    doc = {
        "persona": data.get("persona", "cs_student"),
        "user_query": data.get("user_query"),
        "bot_response": data.get("bot_response"),
        "source": data.get("source", "CampusMind AI Engine"),
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    try:
        db = get_db()
        res = db["chat_history"].insert_one(doc)
        return jsonify({"message": "Chat logged to MongoDB", "chat": format_doc(doc)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/db/chat-history", methods=["DELETE"])
def clear_chat_history():
    try:
        db = get_db()
        res = db["chat_history"].delete_many({})
        return jsonify({"message": "Chat history cleared", "deleted_count": res.deleted_count})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- 3. SEARCH RESOURCES MONGODB ENDPOINTS ---
@app.route("/api/search", methods=["GET"])
def search_directory():
    """GET /api/search?q=query&category=all - Unified campus search API endpoint."""
    category = request.args.get("category", "all")
    query = request.args.get("q", "").strip()
    try:
        db = get_db()
        filter_q = {}
        if category != "all":
            filter_q["category"] = category
        if query:
            filter_q["$or"] = [
                {"title": {"$regex": query, "$options": "i"}},
                {"content": {"$regex": query, "$options": "i"}}
            ]

        docs = list(db["search_resources"].find(filter_q))
        results = []
        for d in docs:
            formatted = format_doc(d)
            formatted["text"] = formatted.get("content", "")
            results.append(formatted)
        return jsonify({"count": len(results), "results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/db/resources", methods=["GET"])
def get_resources():
    category = request.args.get("category", "all")
    query = request.args.get("q", "").strip()
    try:
        db = get_db()
        filter_q = {}
        if category != "all":
            filter_q["category"] = category
        if query:
            filter_q["$or"] = [
                {"title": {"$regex": query, "$options": "i"}},
                {"content": {"$regex": query, "$options": "i"}}
            ]

        docs = list(db["search_resources"].find(filter_q))
        return jsonify({"count": len(docs), "resources": [format_doc(d) for d in docs]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/db/resources", methods=["POST"])
def add_resource():
    data = request.json or {}
    title = data.get("title")
    category = data.get("category", "academics")
    content = data.get("content")

    if not title or not content:
        return jsonify({"error": "title and content are required"}), 400

    doc = {"title": title, "category": category, "content": content}
    try:
        db = get_db()
        res = db["search_resources"].insert_one(doc)
        return jsonify({"message": "Resource created in MongoDB", "resource": format_doc(doc)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/db/resources/<id>", methods=["DELETE"])
def delete_resource(id):
    try:
        db = get_db()
        res = db["search_resources"].delete_one({"_id": ObjectId(id)})
        if res.deleted_count > 0:
            return jsonify({"message": "Resource deleted successfully", "id": id})
        return jsonify({"error": "Resource not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- 4. TIMETABLE MONGODB ENDPOINTS ---
@app.route("/api/db/timetable", methods=["GET"])
def get_db_timetable():
    day = request.args.get("day", "Tue")
    branch = request.args.get("branch", "CSE")
    try:
        db = get_db()
        docs = list(db["timetable"].find({"day": day, "branch": branch}))
        return jsonify({"day": day, "branch": branch, "count": len(docs), "schedule": [format_doc(d) for d in docs]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/db/timetable", methods=["POST"])
def add_timetable_entry():
    data = request.json or {}
    required = ["day", "branch", "time_slot", "subject", "faculty", "room"]
    if not all(k in data for k in required):
        return jsonify({"error": f"Missing required fields: {required}"}), 400

    doc = {
        "day": data.get("day"),
        "branch": data.get("branch"),
        "time_slot": data.get("time_slot"),
        "subject": data.get("subject"),
        "faculty": data.get("faculty"),
        "room": data.get("room"),
        "status": data.get("status", "upcoming")
    }
    try:
        db = get_db()
        res = db["timetable"].insert_one(doc)
        return jsonify({"message": "Lecture added to MongoDB", "entry": format_doc(doc)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- 5. ASSIGNMENTS MONGODB ENDPOINTS ---
@app.route("/api/db/assignments", methods=["GET"])
def get_assignments():
    status = request.args.get("status")
    try:
        db = get_db()
        filter_q = {"status": status} if status else {}
        docs = list(db["assignments"].find(filter_q))
        return jsonify({"count": len(docs), "assignments": [format_doc(d) for d in docs]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/db/assignments", methods=["POST"])
def add_assignment():
    data = request.json or {}
    if not data.get("title") or not data.get("subject"):
        return jsonify({"error": "title and subject are required"}), 400

    doc = {
        "title": data.get("title"),
        "subject": data.get("subject"),
        "status": data.get("status", "todo"),
        "priority": data.get("priority", "medium"),
        "due_date": data.get("due_date", "TBD")
    }
    try:
        db = get_db()
        res = db["assignments"].insert_one(doc)
        return jsonify({"message": "Assignment created in MongoDB", "assignment": format_doc(doc)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/db/assignments/<id>", methods=["PUT"])
def update_assignment_status(id):
    data = request.json or {}
    new_status = data.get("status")
    if not new_status:
        return jsonify({"error": "status field is required"}), 400

    try:
        db = get_db()
        res = db["assignments"].update_one({"_id": ObjectId(id)}, {"$set": {"status": new_status}})
        if res.matched_count > 0:
            return jsonify({"message": "Assignment status updated", "id": id, "status": new_status})
        return jsonify({"error": "Assignment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- 6. LIBRARY RESERVATIONS MONGODB ENDPOINTS ---
@app.route("/api/db/reservations", methods=["GET"])
def get_reservations():
    try:
        db = get_db()
        docs = list(db["library_reservations"].find().sort("_id", -1))
        return jsonify({"count": len(docs), "reservations": [format_doc(d) for d in docs]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/db/reservations", methods=["POST"])
def create_reservation():
    data = request.json or {}
    book_title = data.get("book_title", "Academic Reference Volume")
    reserved_by = data.get("reserved_by", "Srujan S.")

    token = f"GMU-LIB-2026-{random.randint(1000, 9999)}"
    doc = {
        "token": token,
        "book_title": book_title,
        "reserved_by": reserved_by,
        "reserved_at": datetime.datetime.utcnow().isoformat()
    }
    try:
        db = get_db()
        res = db["library_reservations"].insert_one(doc)
        return jsonify({"message": "Book reserved in MongoDB", "reservation": format_doc(doc)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- CONVERSATIONAL CHAT & GEMINI FALLBACK ROUTE ---
@app.route("/api/chat", methods=["POST"])
def chat_ai():
    data = request.json or {}
    query = data.get("query", "").strip()
    persona = data.get("persona", "cs_student")
    api_key = data.get("apiKey", "") or os.getenv("GEMINI_API_KEY", "")

    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    bot_text = ""
    source = ""

    if api_key:
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(f"You are GMU CampusMind AI for GM University Davangere. Persona: {persona}.\nQuery: {query}")
            if response and hasattr(response, "text"):
                bot_text = response.text
                source = "Google Gemini 1.5 Live AI Model"
        except Exception as e:
            print("Gemini SDK Error, falling back to local NLP:", e)

    if not bot_text:
        q_lower = query.lower()
        if any(k in q_lower for k in ["fee", "admission", "cost", "seat", "apply", "eligibility"]):
            bot_text = "<strong>GM University Engineering Fees (2026):</strong><br><ul><li><strong>B.Tech CSE/AIML:</strong> ₹1,85,000/yr</li><li><strong>B.Tech ECE:</strong> ₹1,45,000/yr</li><li><strong>BCA/MCA:</strong> ₹75,000 - ₹1.20L/yr</li><li><strong>MBA:</strong> ₹1,60,000/yr</li></ul>Scholarships available via SSP Portal & e-Pass."
            source = "GMU Admissions Directorate"
        elif any(k in q_lower for k in ["hostel", "room", "stay", "mess", "srikanta", "saraswathi"]):
            bot_text = "<strong>GM University Hostels:</strong><br><ul><li><strong>Srikanta Boys Hostel:</strong> 600 beds with Wi-Fi & solar hot water</li><li><strong>Saraswathi Girls Hostel:</strong> Biometric security & resident lady warden</li><li><strong>Fee:</strong> ₹85,000 - ₹95,000/yr (Food & Laundry included)</li></ul>"
            source = "GMU Housing Directorate"
        elif any(k in q_lower for k in ["placement", "package", "salary", "tpo", "company"]):
            bot_text = "<strong>GM University Placement Cell:</strong><br><ul><li><strong>Highest Package:</strong> ₹24.5 LPA</li><li><strong>Average Package:</strong> ₹5.6 LPA</li><li><strong>Recruiters:</strong> TCS, Infosys, Wipro, Accenture, Cognizant, Amazon, Bosch</li></ul>"
            source = "GMU TPO Cell"
        else:
            bot_text = f"GM University (57-Acre Campus in Davangere) offers B.Tech, BCA, MCA, MBA, and Law degrees.<br><br>Regarding <em>'{query}'</em>: Feel free to search our <strong>Smart Search</strong> directory or check your <strong>Timetable</strong> tab!"
            source = "GMU CampusMind Knowledge Base"

    # Save to MongoDB
    try:
        db = get_db()
        db["chat_history"].insert_one({
            "persona": persona,
            "user_query": query,
            "bot_response": bot_text,
            "source": source,
            "created_at": datetime.datetime.utcnow().isoformat()
        })
    except Exception as e:
        print("Failed to save chat log to MongoDB:", e)

    return jsonify({
        "response": bot_text,
        "source": source,
        "persisted_to_mongodb": True
    })

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Launching GM University CampusMind AI Server (RAG & Gemini SDK Enabled) on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
