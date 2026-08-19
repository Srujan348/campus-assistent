/* ==========================================================================
   CampusMind AI - GM University Smart Campus Assistant Application Logic
   ========================================================================== */

// --- 1. GM UNIVERSITY EXTENSIVE DOMAIN KNOWLEDGE BASE ---
const GMU_KNOWLEDGE_BASE = {
  universityInfo: {
    name: "GM University (GMU)",
    location: "Poona-Bangalore Highway (NH-48), PB Road, Davanagere, Karnataka 577006",
    campusArea: "57 Acres Eco-Friendly Smart Campus",
    established: "Act No. 19 of 2023 (Legacy of GMIT established in 2001)",
    chancellor: "Sri G.M. Lingaraju",
    viceChancellor: "Dr. S. R. Shankapal",
    registrar: "Dr. B. S. Karabasappa",
    contactEmail: "info@gmu.ac.in",
    contactPhone: "+91 8192 233377 / +91 8192 252560",
    website: "https://gmu.ac.in"
  },

  faculties: [
    {
      name: "Faculty of Engineering & Technology (FET)",
      depts: ["Computer Science & Engineering (CSE)", "Artificial Intelligence & Machine Learning (AIML)", "Information Science & Engineering (ISE)", "Electronics & Communication (ECE)", "Electrical & Electronics (EEE)", "Mechanical Engineering (ME)", "Civil Engineering (CE)", "Robotics & Automation (RA)", "Biotechnology (BT)"]
    },
    {
      name: "Faculty of Computing & IT (FCIT)",
      depts: ["BCA (Bachelor of Computer Applications)", "MCA (Master of Computer Applications)", "B.Sc Data Science & Cyber Security"]
    },
    {
      name: "Faculty of Commerce & Management (FCM) / GM Business School",
      depts: ["BBA (Digital Marketing, Analytics, Logistics)", "B.Com (Taxation, Banking, Finance)", "MBA (Marketing, Finance, HR, Agri-Business, Innovation)", "M.Com"]
    },
    {
      name: "GM School of Law (GMSL)",
      depts: ["BA LLB (5-Year Integrated)", "B.Com LLB (5-Year Integrated)", "LLB (3-Year Degree)"]
    },
    {
      name: "Faculty of Allied Health Sciences & Nursing",
      depts: ["B.Sc Nursing", "B.Sc Medical Laboratory Technology (MLT)", "B.Sc Imaging Technology"]
    }
  ],

  admissionsAndFees: {
    btechCSE: { fee: "₹1,85,000 per year (Quota / CET: As per KEA Govt norms)", eligibility: "10+2 with Physics, Mathematics & Chem/CS (Min 45% aggregate, 40% for SC/ST)" },
    btechAIML: { fee: "₹1,80,000 per year", eligibility: "10+2 with Physics & Math (Min 45%)" },
    btechECE: { fee: "₹1,45,000 per year", eligibility: "10+2 with Physics & Math" },
    btechRobotics: { fee: "₹1,50,000 per year", eligibility: "10+2 with Physics & Math" },
    bca: { fee: "₹75,000 per year", eligibility: "10+2 any stream with Mathematics or Computer Science" },
    mba: { fee: "₹1,60,000 per year", eligibility: "Any Graduation with 50% aggregate + PGCET/KMAT score" },
    law: { fee: "₹95,000 per year", eligibility: "10+2 with 45% aggregate for 5-Year Integrated Law" },
    scholarships: "GMU Merit Scholarships for top entrance rankers, SSP (State Scholarship Portal), e-Pass SC/ST fee waiver, and Defense personnel concessions."
  },

  hostels: {
    boysHostel: "Srikanta Boy's Hostel (Capacity 600+ students, 2/3 sharing rooms, 24/7 solar hot water, high-speed Wi-Fi, study hall, indoor gym)",
    girlsHostel: "Saraswathi Girl's Hostel (Capacity 500+ students, 24/7 security with biometric access, resident lady warden, power backup, hygienic veg/non-veg mess)",
    hostelFee: "₹85,000 - ₹95,000 per academic year (Includes room rent, food, mess, water, electricity, and laundry service)"
  },

  placements: {
    cellName: "GMU Training & Placement Cell (TPO Cell)",
    highestPackage: "₹24.5 LPA (Offered by Multinational Tech Giant)",
    averagePackage: "₹5.6 LPA",
    placementPercentage: "92.4% placed in 2024-2025 batch",
    topRecruiters: ["TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "Amazon", "Tech Mahindra", "Mindtree", "Bosch", "Toyota Kirloskar", "Capgemini", "SLK Software"]
  },

  library: {
    name: "GM Central Library & Learning Resource Center",
    volumes: "45,000+ Printed Books & Reference Volumes",
    digitalResources: "IEEE Xplore Digital Library, ScienceDirect, DELNET, NPTEL Video Lectures",
    timings: "Monday to Saturday: 8:00 AM – 8:00 PM | Sunday: 9:00 AM – 4:00 PM",
    borrowLimit: "4 Books per Student for 14 Days (Renewable online)"
  },

  contactsAndHODs: [
    { dept: "Computer Science & Engineering", hod: "Dr. Sunil Kumar B. S.", email: "hod.cse@gmu.ac.in", phone: "+91 8192 233380", office: "FET Block - 2nd Floor, Room 204" },
    { dept: "Electronics & Communication", hod: "Dr. Rajashekarappa", email: "hod.ece@gmu.ac.in", phone: "+91 8192 233382", office: "FET Block - 1st Floor, Room 112" },
    { dept: "Training & Placement Officer", officer: "Prof. Tejasvi R.", email: "tpo@gmu.ac.in", phone: "+91 8192 233399", office: "Admin Block - Ground Floor" },
    { dept: "Chief Hostel Warden", warden: "Prof. Murugesh B.", email: "hostel@gmu.ac.in", phone: "+91 8192 233366", office: "Srikanta Hostel Office" }
  ]
};

// --- 2. APPLICATION STATE MANAGEMENT ---
const AppState = {
  currentPersona: "cs_student",
  activeTab: "dashboard",
  voiceActive: false,
  isSpeaking: false,
  theme: "dark",
  geminiApiKey: localStorage.getItem("gmu_gemini_api_key") || "",

  // Student Assistance Data
  attendance: {
    total: 120,
    attended: 106,
    target: 85
  },

  gpaSubjects: [
    { code: "21CS51", title: "Software Engineering & SDLC", credits: 4, grade: "O", points: 10 },
    { code: "21CS52", title: "Computer Networks", credits: 4, grade: "A+", points: 9 },
    { code: "21CS53", title: "Database Management Systems", credits: 4, grade: "A+", points: 9 },
    { code: "21CS54", title: "Artificial Intelligence & ML", credits: 3, grade: "O", points: 10 },
    { code: "21CSL55", title: "DBMS & Web Technology Lab", credits: 2, grade: "O", points: 10 },
    { code: "21CIV57", title: "Environmental Studies", credits: 1, grade: "A", points: 8 }
  ],

  assignments: [
    { id: 1, title: "DBMS Project Submission", subject: "21CS53", status: "todo", priority: "high", dueDate: "Aug 24, 2026" },
    { id: 2, title: "Computer Networks Lab Manual", subject: "21CS52", status: "todo", priority: "medium", dueDate: "Aug 26, 2026" },
    { id: 3, title: "AIML IA-2 Question Solving", subject: "21CS54", status: "inprogress", priority: "high", dueDate: "Aug 22, 2026" },
    { id: 4, title: "Software Engg Case Study", subject: "21CS51", status: "done", priority: "low", dueDate: "Aug 15, 2026" },
    { id: 5, title: "Mini Project Proposal", subject: "21CS55", status: "done", priority: "high", dueDate: "Aug 18, 2026" }
  ],

  reservedBooks: [
    { token: "GMU-LIB-2026-8841", title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell & Peter Norvig", date: "Aug 18, 2026", returnDate: "Sep 01, 2026" }
  ]
};

// --- 3. SPEECH RECOGNITION & VOICE SYNTHESIS ---
class VoiceController {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.initRecognition();
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-IN";

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Voice Transcript:", transcript);
        this.handleTranscript(transcript);
      };

      this.recognition.onend = () => {
        this.setMicUIState(false);
      };

      this.recognition.onerror = (err) => {
        console.error("Speech Recognition Error:", err);
        this.setMicUIState(false);
      };
    }
  }

  startListening(inputTargetId) {
    if (!this.recognition) {
      alert("Speech recognition is not supported in your browser. Please type your question!");
      return;
    }
    this.currentTargetId = inputTargetId;
    this.setMicUIState(true);
    try {
      this.recognition.start();
    } catch (e) {
      this.recognition.stop();
      this.setMicUIState(false);
    }
  }

  setMicUIState(listening) {
    const micBtns = document.querySelectorAll(".btn-mic");
    micBtns.forEach(btn => {
      if (listening) {
        btn.classList.add("active");
        btn.style.background = "rgba(239, 68, 68, 0.3)";
        btn.style.color = "#EF4444";
      } else {
        btn.classList.remove("active");
        btn.style.background = "";
        btn.style.color = "";
      }
    });
  }

  handleTranscript(text) {
    if (this.currentTargetId === "dashboardSearchInput") {
      const input = document.getElementById("dashboardSearchInput");
      input.value = text;
      document.getElementById("dashboardSearchBtn").click();
    } else {
      const input = document.getElementById("chatInput");
      input.value = text;
      document.getElementById("sendMessageBtn").click();
    }
  }

  speak(text) {
    if (!AppState.voiceActive || !this.synthesis) return;
    this.synthesis.cancel(); // Stop ongoing speech

    // Strip HTML tags for clean spoken output
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Pick natural female or male English voice if available
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes("en-IN") || v.lang.includes("en-US") || v.name.includes("Google"));
    if (preferredVoice) utterance.voice = preferredVoice;

    const waveContainer = document.getElementById("voiceWaveContainer");
    if (waveContainer) waveContainer.classList.add("active");

    utterance.onend = () => {
      if (waveContainer) waveContainer.classList.remove("active");
    };

    this.synthesis.speak(utterance);
  }
}

const voiceController = new VoiceController();

// --- 4. NATURAL LANGUAGE AI INTENT GENERATOR ---
function processNaturalLanguageQuery(query) {
  const q = query.toLowerCase();

  // Fee & Admission Intent
  if (q.includes("fee") || q.includes("admission") || q.includes("cost") || q.includes("seat") || q.includes("apply") || q.includes("eligibility")) {
    return {
      text: `Here is the detailed fee structure and admission information for <strong>GM University</strong>:<br>
      <ul>
        <li><strong>B.Tech CSE / AIML:</strong> ₹1,80,000 – ₹1,85,000/yr (Eligibility: 10+2 Physics & Math min 45% aggregate).</li>
        <li><strong>B.Tech ECE / Robotics:</strong> ₹1,45,000 – ₹1,50,000/yr.</li>
        <li><strong>BCA / MCA:</strong> ₹75,000/yr (BCA) | ₹1,20,000/yr (MCA).</li>
        <li><strong>MBA (GM Business School):</strong> ₹1,60,000/yr (PGCET / KMAT / MAT accepted).</li>
        <li><strong>GM School of Law (BA LLB / B.Com LLB):</strong> ₹95,000/yr.</li>
      </ul>
      <strong>Scholarships:</strong> Karnataka State SSP Portal, e-Pass SC/ST concessions, and GMU Merit Concessions for KCET rankers under 15,000.`,
      source: "GMU Official Admissions Portal 2026"
    };
  }

  // Hostel Intent
  if (q.includes("hostel") || q.includes("stay") || q.includes("room") || q.includes("mess") || q.includes("srikanta") || q.includes("saraswathi")) {
    return {
      text: `<strong>GM University Campus Hostels:</strong><br>
      <ul>
        <li><strong>Srikanta Boy's Hostel:</strong> Located on east campus. Features 2/3-seater rooms, attached study desks, 24/7 hot water, high-speed WiFi, and indoor gym.</li>
        <li><strong>Saraswathi Girl's Hostel:</strong> Located adjacent to central library with biometric security, resident lady warden, and power backup.</li>
        <li><strong>Annual Hostel Fee:</strong> ₹85,000 – ₹95,000 inclusive of four-time nutritious vegetarian/non-vegetarian mess meals & laundry services.</li>
      </ul>
      Contact Chief Warden Office at Srikanta Hostel Block or call <strong>+91 8192 233366</strong> to reserve a room.`,
      source: "GMU Student Housing Directorate"
    };
  }

  // Timetable & Schedule Intent
  if (q.includes("schedule") || q.includes("timetable") || q.includes("class") || q.includes("today") || q.includes("lecture")) {
    return {
      text: `<strong>Today's Academic Schedule (5th Sem B.Tech CSE):</strong><br>
      <ul>
        <li>⏰ <strong>09:00 AM - 10:00 AM:</strong> Software Engineering (21CS51) &bull; Prof. Sneha M. &bull; <em>FET-304</em></li>
        <li>⏰ <strong>10:00 AM - 11:00 AM:</strong> Database Management Systems (21CS53) &bull; Dr. Sunil Kumar &bull; <em>FET-304</em></li>
        <li>⏰ <strong>11:15 AM - 01:15 PM:</strong> DBMS & Web Tech Lab (21CSL55) &bull; Lab 3 (FCIT Block)</li>
        <li>⏰ 02:00 PM - 03:00 PM: Computer Networks (21CS52) &bull; Dr. Anitha P. &bull; <em>FET-304</em></li>
      </ul>
      You can also open the <strong>Student Suite &rarr; Timetable</strong> tab to switch days!`,
      source: "GMU Academic Affairs Desk"
    };
  }

  // Placement & Career Intent
  if (q.includes("placement") || q.includes("package") || q.includes("salary") || q.includes("tpo") || q.includes("company") || q.includes("job") || q.includes("recruit")) {
    return {
      text: `<strong>GM University Placement Cell Highlights (2024-2025):</strong><br>
      <ul>
        <li><strong>Highest Salary Package:</strong> ₹24.5 LPA</li>
        <li><strong>Average Package:</strong> ₹5.6 LPA</li>
        <li><strong>Overall Placement Rate:</strong> 92.4%</li>
        <li><strong>Top Campus Recruiters:</strong> TCS, Infosys, Wipro, Accenture, Cognizant, Amazon, Bosch, Toyota Kirloskar, Capgemini.</li>
      </ul>
      The TPO Cell conducts 200+ hours of mandatory Aptitude, Soft Skills, and Full-Stack Coding Bootcamps starting from 3rd semester!`,
      source: "GMU Training & Placement Cell Report"
    };
  }

  // Library Intent
  if (q.includes("library") || q.includes("book") || q.includes("ieee") || q.includes("journal") || q.includes("borrow")) {
    return {
      text: `<strong>GM Central Library & Learning Resource Center:</strong><br>
      <ul>
        <li><strong>Collection:</strong> 45,000+ Physical Books, IEEE Xplore Digital Access, ScienceDirect, DELNET.</li>
        <li><strong>Operating Hours:</strong> Mon – Sat: 8:00 AM to 8:00 PM | Sun: 9:00 AM to 4:00 PM.</li>
        <li><strong>Borrowing Rules:</strong> Students can borrow up to 4 books for 14 days.</li>
      </ul>
      Use the <strong>Student Suite &rarr; Library Reservation</strong> tool to reserve your books online!`,
      source: "GM Central Library Portal"
    };
  }

  // Exam Intent
  if (q.includes("exam") || q.includes("ia") || q.includes("internal") || q.includes("result") || q.includes("marks") || q.includes("see")) {
    return {
      text: `<strong>GM University Examination Schedule (Odd Semester 2026):</strong><br>
      <ul>
        <li><strong>Internal Assessment 1 (IA-1):</strong> Completed</li>
        <li><strong>Internal Assessment 2 (IA-2):</strong> September 12 – September 15, 2026</li>
        <li><strong>Internal Assessment 3 (IA-3):</strong> October 18 – October 21, 2026</li>
        <li><strong>Semester End Examinations (SEE):</strong> Starts November 10, 2026</li>
      </ul>
      Make sure to maintain a minimum of <strong>85% attendance</strong> in all theory & lab subjects to be eligible for hall tickets!`,
      source: "GMU Office of Controller of Examinations"
    };
  }

  // Contact / HOD Intent
  if (q.includes("contact") || q.includes("hod") || q.includes("professor") || q.includes("dean") || q.includes("phone") || q.includes("email")) {
    return {
      text: `<strong>Key GM University Department Contacts:</strong><br>
      <ul>
        <li><strong>CSE HOD:</strong> Dr. Sunil Kumar B. S. &bull; ✉️ hod.cse@gmu.ac.in &bull; 📞 +91 8192 233380 (FET 2nd Floor, R-204)</li>
        <li><strong>ECE HOD:</strong> Dr. Rajashekarappa &bull; ✉️ hod.ece@gmu.ac.in &bull; 📞 +91 8192 233382 (FET 1st Floor, R-112)</li>
        <li><strong>TPO Officer:</strong> Prof. Tejasvi R. &bull; ✉️ tpo@gmu.ac.in &bull; 📞 +91 8192 233399 (Admin Block)</li>
        <li><strong>General Admissions Helpdesk:</strong> 📞 +91 8192 252560</li>
      </ul>`,
      source: "GMU Directory 2026"
    };
  }

  // General Fallback Conversational AI Response
  return {
    text: `GM University (Davanagere) offers world-class education spanning 57 acres with state-of-the-art engineering labs, law school, management institutes, and allied health sciences.<br><br>Regarding <em>"${query}"</em>: You can find official documents in our <strong>Smart Search</strong> or click one of the suggested prompt chips above for instant detailed guides on Fees, Hostels, Timetables, or Placements!`,
    source: "CampusMind AI Knowledge Engine"
  };
}

// --- 5. DOM & UI CONTROLLER FUNCTIONS ---

function initTabs() {
  const navLinks = document.querySelectorAll(".nav-link");
  const tabPages = document.querySelectorAll(".tab-page");

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      const tabId = link.getAttribute("data-tab");
      navLinks.forEach(n => n.classList.remove("active"));
      tabPages.forEach(p => p.classList.remove("active"));

      link.classList.add("active");
      const activePage = document.getElementById(`tab-${tabId}`);
      if (activePage) activePage.classList.add("active");
      AppState.activeTab = tabId;
    });
  });
}

function initPersonaSelector() {
  const personaSelect = document.getElementById("personaSelect");
  personaSelect.value = AppState.currentPersona;

  personaSelect.addEventListener("change", (e) => {
    AppState.currentPersona = e.target.value;
    updatePersonaView();
  });
}

function updatePersonaView() {
  const badge = document.getElementById("userPersonaBadge");
  const title = document.getElementById("greetingTitle");
  const subtitle = document.getElementById("greetingSubtitle");
  const scheduleLabel = document.getElementById("schedulePersonaLabel");

  if (AppState.currentPersona === "cs_student") {
    if (badge) badge.innerText = "B.Tech Computer Science & Engineering";
    if (title) title.innerText = "Welcome back, Srujan 👋";
    if (subtitle) subtitle.innerText = "Your 5th Sem CSE dashboard is synchronized. Check your upcoming DBMS lecture and assignment deadlines.";
    if (scheduleLabel) scheduleLabel.innerText = "5th Semester B.Tech Computer Science & Engineering (Section A)";
  } else if (AppState.currentPersona === "ece_student") {
    if (badge) badge.innerText = "B.Tech Electronics & Communication";
    if (title) title.innerText = "Welcome back, ECE Student ⚡";
    if (subtitle) subtitle.innerText = "3rd Sem Electronics schedule active. Signal Processing lab starts at 11:15 AM in FET-108.";
    if (scheduleLabel) scheduleLabel.innerText = "3rd Semester B.Tech Electronics & Communication";
  } else if (AppState.currentPersona === "mba_student") {
    if (badge) badge.innerText = "GM Business School (MBA)";
    if (title) title.innerText = "Welcome back, MBA Scholar 💼";
    if (subtitle) subtitle.innerText = "1st Sem MBA schedule active. Financial Accounting guest lecture at 2:00 PM.";
    if (scheduleLabel) scheduleLabel.innerText = "1st Semester Master of Business Administration";
  } else if (AppState.currentPersona === "aspirant") {
    if (badge) badge.innerText = "GMU Admissions Aspirant / Parent";
    if (title) title.innerText = "Explore GM University Davangere 🏫";
    if (subtitle) subtitle.innerText = "Ask questions about KCET/COMEDK cutoffs, campus hostel facilities, fee waivers, or book a 57-acre campus tour!";
  } else if (AppState.currentPersona === "faculty") {
    if (badge) badge.innerText = "Faculty / HOD Portal";
    if (title) title.innerText = "Welcome, Professor 👨‍🏫";
    if (subtitle) subtitle.innerText = "Publish circulars, monitor student attendance thresholds, and upload IA assessment marks.";
  }

  renderRecommendations();
  renderTimetable("Tue");
}

function initVoiceControls() {
  const globalVoiceBtn = document.getElementById("voiceGlobalBtn");
  globalVoiceBtn.addEventListener("click", () => {
    AppState.voiceActive = !AppState.voiceActive;
    if (AppState.voiceActive) {
      globalVoiceBtn.classList.add("active");
      globalVoiceBtn.querySelector(".voice-status").innerText = "Voice On";
      voiceController.speak("Voice interaction enabled. You can ask me questions using speech!");
    } else {
      globalVoiceBtn.classList.remove("active");
      globalVoiceBtn.querySelector(".voice-status").innerText = "Voice Off";
      window.speechSynthesis.cancel();
    }
  });

  const micBtns = document.querySelectorAll(".btn-mic");
  micBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.id === "heroMicBtn" ? "dashboardSearchInput" : "chatInput";
      voiceController.startListening(targetId);
    });
  });

  const speakLastBtn = document.getElementById("speakLastResponseBtn");
  if (speakLastBtn) {
    speakLastBtn.addEventListener("click", () => {
      const botMsgs = document.querySelectorAll(".chat-message.bot .msg-text");
      if (botMsgs.length > 0) {
        const lastMsg = botMsgs[botMsgs.length - 1].innerHTML;
        AppState.voiceActive = true;
        globalVoiceBtn.classList.add("active");
        voiceController.speak(lastMsg);
      }
    });
  }
}

function initChatEngine() {
  const sendBtn = document.getElementById("sendMessageBtn");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");
  const clearBtn = document.getElementById("clearChatBtn");

  async function handleSend() {
    const query = chatInput.value.trim();
    if (!query) return;

    // Append User Message
    appendMessage("user", query);
    chatInput.value = "";

    // Send async request to Python Flask REST API (/api/chat)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query,
          persona: AppState.currentPersona,
          apiKey: AppState.geminiApiKey
        })
      });

      if (res.ok) {
        const data = await res.json();
        appendMessage("bot", data.response, data.source);
        voiceController.speak(data.response);
        return;
      }
    } catch (err) {
      console.warn("Backend server API offline, using client-side fallback:", err);
    }

    // Client-side fallback if backend API is unreachable
    setTimeout(() => {
      const response = processNaturalLanguageQuery(query);
      appendMessage("bot", response.text, response.source);
      voiceController.speak(response.text);
    }, 300);
  }

  sendBtn.addEventListener("click", handleSend);
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  clearBtn.addEventListener("click", () => {
    chatMessages.innerHTML = "";
    appendMessage("bot", "Chat history cleared. How else can I assist you with GM University?", "GMU CampusMind AI");
  });

  // Prompt Chips Listener
  document.querySelectorAll(".chip-btn, .suggest-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const query = chip.getAttribute("data-query");
      if (query) {
        // Switch to Chat Tab if on Dashboard
        document.querySelector('.nav-link[data-tab="chat"]').click();
        chatInput.value = query;
        handleSend();
      }
    });
  });

  // Hero Search Input
  const dashSearchBtn = document.getElementById("dashboardSearchBtn");
  const dashSearchInput = document.getElementById("dashboardSearchInput");
  dashSearchBtn.addEventListener("click", () => {
    const q = dashSearchInput.value.trim();
    if (q) {
      document.querySelector('.nav-link[data-tab="chat"]').click();
      chatInput.value = q;
      handleSend();
    }
  });
}

function appendMessage(sender, text, source = null) {
  const chatMessages = document.getElementById("chatMessages");
  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-message ${sender}`;

  const avatarIcon = sender === "bot" ? '<i class="fa-solid fa-robot"></i>' : '<i class="fa-solid fa-user-graduate"></i>';
  const name = sender === "bot" ? "CampusMind AI" : "You";
  const sourceTag = source ? `<div class="source-badge"><i class="fa-solid fa-shield-halved"></i> Source: ${source}</div>` : "";

  msgDiv.innerHTML = `
    <div class="msg-avatar">${avatarIcon}</div>
    <div class="msg-body">
      <div class="msg-header">
        <span class="sender-name">${name}</span>
        <span class="msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div class="msg-text">${text}</div>
      ${sourceTag}
    </div>
  `;

  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --- 6. SMART SEARCH & DIRECTORY ENGINE ---
const SEARCH_DATABASE = [
  { id: 1, title: "B.Tech Computer Science & Engineering (CSE)", category: "academics", text: "4-Year B.Tech program focused on AI, Cloud Computing, Full Stack Development, and Data Structures. HOD: Dr. Sunil Kumar B.S." },
  { id: 2, title: "GMU Engineering Admission Fees 2026", category: "admissions", text: "Annual tuition fee: CSE ₹1.85L, AIML ₹1.80L, ECE ₹1.45L, Robotics ₹1.50L. SSP and e-Pass scholarships applicable." },
  { id: 3, title: "Srikanta Boy's Hostel Facilities", category: "facilities", text: "On-campus 600-bed hostel with 24/7 hot water, high-speed WiFi, veg/non-veg mess, gym, and security. Fee: ₹85,000/yr." },
  { id: 4, title: "Dr. Sunil Kumar B. S. (HOD CSE)", category: "faculty", text: "Professor & Head of CSE Department. Expertise in Machine Learning & Cloud Security. Email: hod.cse@gmu.ac.in." },
  { id: 5, title: "IA-2 Exam Time Table Notification", category: "circulars", text: "Official Circular #GMU/EXAM/2026/04: 2nd Internal Assessment for all 3rd & 5th semester B.Tech students starts Sept 12." },
  { id: 6, title: "GM Central Library & IEEE Xplore Access", category: "facilities", text: "Over 45,000 physical volumes and digital access to IEEE journals, ScienceDirect, and NPTEL courseware. Timings: 8 AM - 8 PM." },
  { id: 7, title: "GMU Training & Placement Officer (Prof. Tejasvi R.)", category: "faculty", text: "Training & Placement Cell Coordinator. Organizes campus placement drives with TCS, Infosys, Wipro, and Amazon. TPO Office." },
  { id: 8, title: "GM Business School - MBA Program", category: "academics", text: "2-Year MBA with specializations in Digital Marketing, Business Analytics, HR, and Agri-Business. Fee: ₹1.60L/yr." }
];

function initSmartSearch() {
  const queryInput = document.getElementById("smartSearchQuery");
  const filterBtns = document.querySelectorAll("#searchFilterTabs .filter-btn");

  let activeFilter = "all";

  async function renderSearchResults() {
    const q = queryInput.value.toLowerCase().trim();
    const grid = document.getElementById("searchResultsGrid");
    grid.innerHTML = "";

    let filtered = [];

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&category=${encodeURIComponent(activeFilter)}`);
      if (res.ok) {
        const data = await res.json();
        filtered = data.results || [];
      }
    } catch (err) {
      console.warn("Backend API search offline, using local dataset fallback:", err);
      filtered = SEARCH_DATABASE.filter(item => {
        const matchesCategory = activeFilter === "all" || item.category === activeFilter;
        const matchesQuery = !q || item.title.toLowerCase().includes(q) || item.text.toLowerCase().includes(q);
        return matchesCategory && matchesQuery;
      });
    }

    document.getElementById("resultsCount").innerText = `Showing ${filtered.length} matching resources`;

    filtered.forEach(item => {
      const card = document.createElement("div");
      card.className = "search-result-card glass-card";
      card.innerHTML = `
        <div>
          <span class="card-category-badge cat-${item.category}">${item.category}</span>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </div>
        <div class="card-action-bar">
          <button class="btn-secondary btn-ask-item" data-title="${item.title}"><i class="fa-solid fa-robot"></i> Ask AI</button>
          <button class="btn-text"><i class="fa-solid fa-arrow-up-right-from-square"></i> Details</button>
        </div>
      `;
      grid.appendChild(card);
    });

    // Ask AI Action Listener
    document.querySelectorAll(".btn-ask-item").forEach(b => {
      b.addEventListener("click", () => {
        const title = b.getAttribute("data-title");
        document.querySelector('.nav-link[data-tab="chat"]').click();
        const chatInput = document.getElementById("chatInput");
        chatInput.value = `Tell me more details about: ${title}`;
        document.getElementById("sendMessageBtn").click();
      });
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(f => f.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.getAttribute("data-filter");
      renderSearchResults();
    });
  });

  queryInput.addEventListener("input", renderSearchResults);
  document.getElementById("clearSearchBtn").addEventListener("click", () => {
    queryInput.value = "";
    renderSearchResults();
  });

  renderSearchResults();
}

// --- 7. STUDENT ASSISTANCE SUITE IMPLEMENTATION ---

function initStudentSuite() {
  const suiteBtns = document.querySelectorAll(".suite-tab-btn");
  const suitePanels = document.querySelectorAll(".suite-panel");

  suiteBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-suite");
      suiteBtns.forEach(b => b.classList.remove("active"));
      suitePanels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const activePanel = document.getElementById(`suite-panel-${target}`);
      if (activePanel) activePanel.classList.add("active");
    });
  });

  renderTimetable("Tue");
  renderGpaCalculator();
  initAttendancePredictor();
  renderKanban();
  renderLibrary();
}

// Sub-Feature: Dynamic Timetable
const TIMETABLE_DATA = {
  Tue: [
    { time: "09:00 AM - 10:00 AM", title: "Software Engineering & SDLC (21CS51)", faculty: "Prof. Sneha M.", room: "FET-304", status: "completed" },
    { time: "10:00 AM - 11:00 AM", title: "Database Management Systems (21CS53)", faculty: "Dr. Sunil Kumar", room: "FET-304", status: "ongoing" },
    { time: "11:15 AM - 01:15 PM", title: "DBMS & Web Technology Laboratory (21CSL55)", faculty: "Prof. Ramesh K. & Team", room: "FCIT Lab 3", status: "upcoming" },
    { time: "02:00 PM - 03:00 PM", title: "Computer Networks (21CS52)", faculty: "Dr. Anitha P.", room: "FET-304", status: "upcoming" },
    { time: "03:00 PM - 04:00 PM", title: "Artificial Intelligence & ML (21CS54)", faculty: "Prof. Vinay B.", room: "FET-304", status: "upcoming" }
  ],
  Mon: [
    { time: "09:00 AM - 10:00 AM", title: "Computer Networks (21CS52)", faculty: "Dr. Anitha P.", room: "FET-304", status: "completed" },
    { time: "10:00 AM - 11:00 AM", title: "Artificial Intelligence & ML (21CS54)", faculty: "Prof. Vinay B.", room: "FET-304", status: "completed" },
    { time: "11:15 AM - 01:15 PM", title: "Python Full Stack Lab (21CSL56)", faculty: "Prof. Sneha M.", room: "FCIT Lab 1", status: "completed" }
  ],
  Wed: [
    { time: "09:00 AM - 10:00 AM", title: "Environmental Studies (21CIV57)", faculty: "Prof. Kavitha", room: "FET-304", status: "upcoming" },
    { time: "10:00 AM - 11:00 AM", title: "Database Management Systems (21CS53)", faculty: "Dr. Sunil Kumar", room: "FET-304", status: "upcoming" }
  ]
};

function renderTimetable(day) {
  const container = document.getElementById("timetableList");
  if (!container) return;

  const dayBtns = document.querySelectorAll(".day-btn");
  dayBtns.forEach(b => {
    if (b.getAttribute("data-day") === day) b.classList.add("active");
    else b.classList.remove("active");
    b.onclick = () => renderTimetable(b.getAttribute("data-day"));
  });

  const lectures = TIMETABLE_DATA[day] || TIMETABLE_DATA["Tue"];
  container.innerHTML = "";

  lectures.forEach(lec => {
    const card = document.createElement("div");
    card.className = `lecture-card ${lec.status === "ongoing" ? "ongoing" : ""}`;
    card.innerHTML = `
      <div class="lecture-time"><i class="fa-regular fa-clock"></i> ${lec.time}</div>
      <div class="lecture-details">
        <h4>${lec.title}</h4>
        <p><i class="fa-solid fa-user-tie"></i> ${lec.faculty}</p>
      </div>
      <div class="room-badge"><i class="fa-solid fa-location-dot"></i> ${lec.room}</div>
    `;
    container.appendChild(card);
  });
}

// Sub-Feature: SGPA Calculator
function renderGpaCalculator() {
  const tbody = document.getElementById("gpaSubjectsBody");
  if (!tbody) return;

  function calculate() {
    let totalCredits = 0;
    let totalPoints = 0;

    AppState.gpaSubjects.forEach(s => {
      totalCredits += s.credits;
      totalPoints += (s.credits * s.points);
    });

    const sgpa = (totalPoints / totalCredits).toFixed(2);
    document.getElementById("calcSgpaValue").innerText = sgpa;
    document.getElementById("dashSgpa").innerText = sgpa;
  }

  tbody.innerHTML = "";
  AppState.gpaSubjects.forEach((sub, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${sub.code}</strong></td>
      <td>${sub.title}</td>
      <td>${sub.credits}</td>
      <td>
        <select class="styled-select grade-sel" data-index="${idx}">
          <option value="10" ${sub.points === 10 ? "selected" : ""}>O (Outstanding - 10)</option>
          <option value="9" ${sub.points === 9 ? "selected" : ""}>A+ (Excellent - 9)</option>
          <option value="8" ${sub.points === 8 ? "selected" : ""}>A (Very Good - 8)</option>
          <option value="7" ${sub.points === 7 ? "selected" : ""}>B+ (Good - 7)</option>
          <option value="6" ${sub.points === 6 ? "selected" : ""}>B (Above Avg - 6)</option>
        </select>
      </td>
      <td><strong>${sub.points * sub.credits} pts</strong></td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".grade-sel").forEach(sel => {
    sel.addEventListener("change", (e) => {
      const idx = parseInt(e.target.getAttribute("data-index"));
      const pts = parseInt(e.target.value);
      AppState.gpaSubjects[idx].points = pts;
      renderGpaCalculator();
    });
  });

  document.getElementById("recalculateGpaBtn").onclick = calculate;
  calculate();
}

// Sub-Feature: Attendance Predictor
function initAttendancePredictor() {
  const totalInput = document.getElementById("attTotalClasses");
  const attendedInput = document.getElementById("attAttendedClasses");
  const targetInput = document.getElementById("attTargetMin");

  function updateAttendance() {
    const total = parseInt(totalInput.value) || 1;
    const attended = parseInt(attendedInput.value) || 0;
    const target = parseFloat(targetInput.value) || 85;

    const currentPct = ((attended / total) * 100).toFixed(1);
    document.getElementById("attPercentVal").innerText = `${currentPct}%`;
    document.getElementById("dashAttendance").innerText = `${currentPct}%`;

    const textEl = document.getElementById("attPredictionText");

    if (currentPct >= target) {
      // Calculate how many classes can be skipped
      // (attended) / (total + x) >= target/100  =>  x <= (100*attended - target*total) / target
      const safeSkips = Math.floor((100 * attended - target * total) / target);
      textEl.innerHTML = `You are currently in <strong>Good Standing (${currentPct}%)</strong>! You can safely skip <strong>${Math.max(0, safeSkips)} upcoming lectures</strong> and stay above ${target}%.`;
    } else {
      // Calculate how many consecutive classes must be attended
      // (attended + y) / (total + y) >= target/100 => y >= (target*total - 100*attended) / (100 - target)
      const needed = Math.ceil((target * total - 100 * attended) / (100 - target));
      textEl.innerHTML = `<span class="text-rose">⚠️ Attendance Low (${currentPct}%)!</span> You must attend the next <strong>${needed} consecutive lectures</strong> without missing any to reach ${target}%.`;
    }
  }

  totalInput.addEventListener("input", updateAttendance);
  attendedInput.addEventListener("input", updateAttendance);
  targetInput.addEventListener("input", updateAttendance);

  updateAttendance();
}

// Sub-Feature: Assignment Kanban
function renderKanban() {
  const todoCol = document.getElementById("kanbanTodo");
  const inprogressCol = document.getElementById("kanbanInprogress");
  const doneCol = document.getElementById("kanbanDone");

  if (!todoCol) return;

  todoCol.innerHTML = "";
  inprogressCol.innerHTML = "";
  doneCol.innerHTML = "";

  let todoC = 0, inprogC = 0, doneC = 0;

  AppState.assignments.forEach(task => {
    const card = document.createElement("div");
    card.className = "task-card";
    card.innerHTML = `
      <h5>${task.title}</h5>
      <p>Course: ${task.subject}</p>
      <div class="task-meta">
        <span class="priority-${task.priority}">● ${task.priority.toUpperCase()}</span>
        <span>Due: ${task.dueDate}</span>
      </div>
    `;

    if (task.status === "todo") {
      todoCol.appendChild(card);
      todoC++;
    } else if (task.status === "inprogress") {
      inprogressCol.appendChild(card);
      inprogC++;
    } else {
      doneCol.appendChild(card);
      doneC++;
    }
  });

  document.getElementById("todoCount").innerText = todoC;
  document.getElementById("inprogressCount").innerText = inprogC;
  document.getElementById("doneCount").innerText = doneC;
  document.getElementById("dashTasks").innerText = `${todoC} Pending`;
}

// Sub-Feature: Library Reservation
const LIBRARY_CATALOG = [
  { id: 101, title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell & Peter Norvig", isbn: "978-0134610993", available: true },
  { id: 102, title: "Operating System Concepts (10th Ed)", author: "Silberschatz, Galvin & Gagne", isbn: "978-1118063330", available: true },
  { id: 103, title: "Database System Concepts", author: "Abraham Silberschatz", isbn: "978-0078022159", available: false },
  { id: 104, title: "Computer Networks: A Systems Approach", author: "Larry Peterson", isbn: "978-0123850591", available: true }
];

function renderLibrary() {
  const grid = document.getElementById("libraryBooksGrid");
  if (!grid) return;

  grid.innerHTML = "";
  LIBRARY_CATALOG.forEach(book => {
    const card = document.createElement("div");
    card.className = "book-card glass-card";
    card.innerHTML = `
      <div>
        <h4>${book.title}</h4>
        <p>Author: ${book.author} &bull; ISBN: ${book.isbn}</p>
      </div>
      <div class="card-action-bar">
        <span class="${book.available ? 'text-success' : 'text-rose'}" style="font-size: 0.8rem; font-weight: 600;">
          ${book.available ? 'Available in Library' : 'Issued Out'}
        </span>
        <button class="btn-primary btn-reserve-book" data-id="${book.id}" ${!book.available ? 'disabled' : ''}>
          ${book.available ? 'Reserve Copy' : 'Reserved'}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  document.querySelectorAll(".btn-reserve-book").forEach(b => {
    b.addEventListener("click", () => {
      const bookId = parseInt(b.getAttribute("data-id"));
      const book = LIBRARY_CATALOG.find(x => x.id === bookId);
      if (book) {
        const token = `GMU-LIB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        alert(`🎉 Book Reserved Successfully!\n\nTitle: ${book.title}\nReservation Token: ${token}\n\nPlease present this token at GM Central Library counter within 24 hours.`);
        book.available = false;
        renderLibrary();
      }
    });
  });
}

// --- 8. AI RECOMMENDATIONS & EVENTS ENGINE ---
function renderRecommendations() {
  const container = document.getElementById("recommendationsList");
  if (!container) return;

  container.innerHTML = `
    <div class="rec-card glass-card">
      <div class="rec-info">
        <div class="rec-badge-icon"><i class="fa-solid fa-code"></i></div>
        <div class="rec-text">
          <h4>Recommended Elective: Generative AI & LLMs Architecture</h4>
          <p>4-Credit Professional Elective aligned with GMU AI Research Cell.</p>
        </div>
      </div>
      <button class="btn-secondary"><i class="fa-solid fa-plus"></i> Enroll</button>
    </div>

    <div class="rec-card glass-card">
      <div class="rec-info">
        <div class="rec-badge-icon"><i class="fa-solid fa-trophy"></i></div>
        <div class="rec-text">
          <h4>Hackathon: GMU TechSpark 2026 (24-Hour Codefest)</h4>
          <p>Prizes worth ₹1,50,000 &bull; Registration closes Sept 05.</p>
        </div>
      </div>
      <button class="btn-primary"><i class="fa-solid fa-rocket"></i> Register</button>
    </div>

    <div class="rec-card glass-card">
      <div class="rec-info">
        <div class="rec-badge-icon"><i class="fa-solid fa-microchip"></i></div>
        <div class="rec-text">
          <h4>Student Club: IEEE GMU Student Branch & Robotics Society</h4>
          <p>Join weekly workshops on ROS, Edge AI, and IoT sensors.</p>
        </div>
      </div>
      <button class="btn-secondary"><i class="fa-solid fa-user-plus"></i> Join Club</button>
    </div>
  `;
}

function renderEventsAndNotices() {
  const eventsGrid = document.getElementById("eventsGrid");
  const dashNotices = document.getElementById("dashboardNoticesList");
  const circularsList = document.getElementById("officialCircularsList");

  if (eventsGrid) {
    eventsGrid.innerHTML = `
      <div class="event-card glass-card">
        <span class="event-date-pill">SEP 15 - SEP 17, 2026</span>
        <h4>GMU TechSpark 2026 Annual Symposium</h4>
        <p>National level hackathon, paper presentations, and robotics arena at GM Auditorium.</p>
        <button class="btn-primary"><i class="fa-solid fa-ticket"></i> Get Free Pass</button>
      </div>

      <div class="event-card glass-card">
        <span class="event-date-pill">OCT 02, 2026</span>
        <h4>TCS & Infosys Mega Placement Drive 2026</h4>
        <p>On-campus interviews for 7th Semester B.Tech & MCA students.</p>
        <button class="btn-secondary"><i class="fa-solid fa-file-arrow-up"></i> Upload Resume</button>
      </div>

      <div class="event-card glass-card">
        <span class="event-date-pill">OCT 24, 2026</span>
        <h4>Inter-College Sports Tournament "GM Champions League"</h4>
        <p>Cricket, Basketball, Volleyball, and Badminton competitions at GM Sports Arena.</p>
        <button class="btn-secondary"><i class="fa-solid fa-volleyball"></i> Register Team</button>
      </div>
    `;
  }

  if (dashNotices) {
    dashNotices.innerHTML = `
      <div class="notice-item-mini glass-card">
        <span class="date-badge">AUG 18</span>
        <div>
          <h4>IA-2 Assessment Dates Announced</h4>
          <p>Internal Assessment 2 scheduled from Sept 12 to Sept 15 for all engineering branches.</p>
        </div>
      </div>

      <div class="notice-item-mini glass-card">
        <span class="date-badge">AUG 12</span>
        <div>
          <h4>SSP Scholarship Verification Portal Open</h4>
          <p>Submit income certificates at Admin Block Desk 4 for fee concessions.</p>
        </div>
      </div>
    `;
  }

  if (circularsList) {
    circularsList.innerHTML = `
      <div class="circular-doc-item">
        <div class="doc-info">
          <i class="fa-solid fa-file-pdf"></i>
          <div>
            <h5>IA2_Exam_TimeTable_2026.pdf</h5>
            <span>Downloaded 450 times &bull; 1.2 MB</span>
          </div>
        </div>
        <button class="btn-icon" title="Download Document"><i class="fa-solid fa-download"></i></button>
      </div>

      <div class="circular-doc-item">
        <div class="doc-info">
          <i class="fa-solid fa-file-pdf"></i>
          <div>
            <h5>Hostel_Rules_FeeStructure_2026.pdf</h5>
            <span>Official Warden Directive &bull; 850 KB</span>
          </div>
        </div>
        <button class="btn-icon" title="Download Document"><i class="fa-solid fa-download"></i></button>
      </div>
    `;
  }
}

// --- 9. INTERACTIVE CAMPUS MAP HOTSPOT CONTROLLER ---
const LOCATION_DATA = {
  fet_block: {
    title: "FET Engineering Block",
    badge: "Academic Building",
    desc: "Houses Computer Science, AIML, Electronics, Electrical, and Mechanical engineering departments, state-of-the-art AI research labs, and HOD suites.",
    hours: "8:30 AM - 5:30 PM (Mon-Sat)",
    depts: "CSE, ISE, ECE, EEE, Mechanical, Civil, Biotech",
    floors: "Ground: Deans Office &bull; 1st Floor: ECE & EEE &bull; 2nd Floor: CSE & AIML Labs"
  },
  fcit_block: {
    title: "FCIT & Computer Labs Block",
    badge: "IT & Computing Center",
    desc: "Dedicated computing wing with high-speed fiber internet, Linux labs, Cloud Computing server rooms, BCA and MCA lecture halls.",
    hours: "8:00 AM - 7:00 PM",
    depts: "BCA, MCA, Data Science Labs",
    floors: "Ground: Server Room &bull; 1st Floor: High-Perf Computing Lab 1 & 2"
  },
  central_library: {
    title: "GM Central Library",
    badge: "Resource Center",
    desc: "Spacious multi-floor library containing 45,000+ volumes, quiet reading zones, digital IEEE workstations, and photocopy center.",
    hours: "8:00 AM - 8:00 PM",
    depts: "Central Reference & IEEE Digital Section",
    floors: "1st Floor: Textbook Circulation &bull; 2nd Floor: Digital IEEE & Journals"
  },
  admin_block: {
    title: "Admin & Registrar Block",
    badge: "Administrative Headquarters",
    desc: "Houses Chancellor's Secretariat, Vice-Chancellor Office, Registrar Desk, Admission Counter, Fees Counter, and TPO Placement Cell.",
    hours: "9:00 AM - 5:00 PM",
    depts: "Admissions, Accounts, Registrar, TPO Cell",
    floors: "Ground Floor: Fee Payment Counters & Placement Office"
  },
  srikanta_hostel: {
    title: "Srikanta Boy's Hostel",
    badge: "Residential Hostel",
    desc: "Modern 600-bed student residence featuring 2/3 sharing rooms, solar hot water, study lounges, indoor sports room, and dining mess.",
    hours: "24 Hours Access (Entry by 9:30 PM)",
    depts: "Warden Office, Dining Hall, Gymnasium",
    floors: "4 Storey Residential Complex"
  },
  saraswathi_hostel: {
    title: "Saraswathi Girl's Hostel",
    badge: "Residential Hostel",
    desc: "Secure 500-bed residence with 24/7 CCTV surveillance, biometric entrance gate, lady warden, medical dispensary, and dining facility.",
    hours: "24 Hours Access (Entry by 8:30 PM)",
    depts: "Resident Lady Warden & Health Clinic",
    floors: "4 Storey Residential Complex"
  },
  food_court: {
    title: "GM Food Court & Cafeteria",
    badge: "Dining & Hangout",
    desc: "Multi-cuisine food court serving hygienic South & North Indian meals, fresh juices, coffee counters, and bakery items.",
    hours: "7:30 AM - 8:30 PM",
    depts: "Catering & Snack Lounges",
    floors: "Ground Floor Indoor & Outdoor seating"
  },
  sports_arena: {
    title: "GM Sports Complex & Arena",
    badge: "Recreation & Athletics",
    desc: "5-acre sports complex featuring cricket pitch, football ground, basketball court, volleyball court, and indoor badminton stadium.",
    hours: "6:00 AM - 7:30 PM",
    depts: "Physical Education Directorate",
    floors: "Outdoor Grounds & Indoor Stadium"
  }
};

function initCampusMap() {
  const hotspots = document.querySelectorAll(".map-hotspot");
  const panel = document.getElementById("locationDetailPanel");
  const askAiBtn = document.getElementById("locAskAiBtn");

  hotspots.forEach(spot => {
    spot.addEventListener("click", () => {
      const locKey = spot.getAttribute("data-location");
      const loc = LOCATION_DATA[locKey];
      if (loc) {
        document.getElementById("locTitle").innerText = loc.title;
        document.getElementById("locBadge").innerText = loc.badge;
        document.getElementById("locDescription").innerText = loc.desc;
        document.getElementById("locHours").innerText = loc.hours;
        document.getElementById("locDepts").innerText = loc.depts;
        document.getElementById("locFloors").innerHTML = loc.floors;

        askAiBtn.onclick = () => {
          document.querySelector('.nav-link[data-tab="chat"]').click();
          const chatInput = document.getElementById("chatInput");
          chatInput.value = `Tell me more about ${loc.title} and its facilities`;
          document.getElementById("sendMessageBtn").click();
        };
      }
    });
  });
}

// --- 10. MODAL & THEME CONTROLS ---
function initModalAndTheme() {
  const modal = document.getElementById("apiKeyModal");
  const openBtn = document.getElementById("apiKeyBtn");
  const closeBtn = document.getElementById("closeModalBtn");
  const saveBtn = document.getElementById("saveApiKeyBtn");
  const input = document.getElementById("geminiApiKeyInput");
  const themeBtn = document.getElementById("themeToggleBtn");

  input.value = AppState.geminiApiKey;

  openBtn.onclick = () => modal.classList.add("active");
  closeBtn.onclick = () => modal.classList.remove("active");
  saveBtn.onclick = () => {
    AppState.geminiApiKey = input.value.trim();
    localStorage.setItem("gmu_gemini_api_key", AppState.geminiApiKey);
    modal.classList.remove("active");
    alert("AI Key settings saved!");
  };

  themeBtn.onclick = () => {
    AppState.theme = AppState.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", AppState.theme);
    themeBtn.querySelector("i").className = AppState.theme === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
  };
}

// --- INITIALIZE ALL MODULES UPON DOM LOAD ---
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initPersonaSelector();
  initVoiceControls();
  initChatEngine();
  initSmartSearch();
  initStudentSuite();
  renderRecommendations();
  renderEventsAndNotices();
  initCampusMap();
  initModalAndTheme();

  console.log("🚀 GMU CampusMind AI Engine initialized successfully!");
});
