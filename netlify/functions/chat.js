/* ==========================================
   JARVIS CORE 2.0
   Standalone assistant - no API key required
========================================== */

const STORAGE = {
    tasks: "jarvisTasks",
    history: "jarvisHistory",
    notes: "jarvisNotes"
};

let lastResponse = "Systems online. How can I help?";
let recognition = null;
let listening = false;

/* ---------- ELEMENTS ---------- */

const clockElement = document.getElementById("clock");
const dateElement = document.getElementById("date");
const statusElement = document.getElementById("systemMessage");
const visualizer = document.getElementById("visualizer");

const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

const chatBox = document.getElementById("chatBox");
const chatInput = document.getElementById("chatInput");


/* ---------- STORAGE ---------- */

function loadData(key, fallback = []) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
        return fallback;
    }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}


/* ---------- CLOCK ---------- */

function updateClock() {
    const now = new Date();

    if (clockElement) {
        clockElement.textContent = now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    }

    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString([], {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    }
}

updateClock();
setInterval(updateClock, 1000);


/* ---------- SYSTEM STATUS ---------- */

function setStatus(message) {
    if (statusElement) {
        statusElement.textContent = message;
    }
}


/* ---------- CHAT ---------- */

function addMessage(text, sender) {
    if (!chatBox) return;

    const message = document.createElement("div");
    message.className = sender === "user"
        ? "message user"
        : "message jarvis";

    message.textContent = text;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;

    const history = loadData(STORAGE.history);
    history.push({
        text,
        sender,
        time: Date.now()
    });

    // Keep the latest 100 messages.
    saveData(STORAGE.history, history.slice(-100));
}

function loadChatHistory() {
    if (!chatBox) return;

    const history = loadData(STORAGE.history);

    history.forEach(item => {
        const message = document.createElement("div");
        message.className = item.sender === "user"
            ? "message user"
            : "message jarvis";

        message.textContent = item.text;
        chatBox.appendChild(message);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
}

function clearChat() {
    if (!chatBox) return;

    chatBox.innerHTML = "";
    localStorage.removeItem(STORAGE.history);

    lastResponse = "Conversation history cleared.";
    addMessage(lastResponse, "jarvis");
}

function sendMessage(message) {
    const text = (message || chatInput?.value || "").trim();

    if (!text) return;

    addMessage(text, "user");

    if (chatInput) {
        chatInput.value = "";
    }

    setStatus("PROCESSING COMMAND...");

    const response = processCommand(text);

    lastResponse = response;
    addMessage(response, "jarvis");

    setStatus("ALL SYSTEMS OPERATIONAL");
}


/* ---------- COMMAND ENGINE ---------- */

function processCommand(input) {
    const text = input.toLowerCase().trim();

    // Greeting
    if (
        text.includes("hello") ||
        text.includes("hey jarvis") ||
        text === "hi"
    ) {
        return "Hello. All systems are operational. What do you need?";
    }

    // Identity
    if (
        text.includes("who are you") ||
        text.includes("your name")
    ) {
        return "I am JARVIS, your personal digital assistant. My local command systems are online.";
    }

    // Capabilities
    if (
        text.includes("what can you do") ||
        text.includes("help")
    ) {
        return [
            "My current systems include:",
            "",
            "• Tell you the time and date",
            "• Add and manage tasks",
            "• Save and recall notes",
            "• Open selected websites",
            "• Maintain local conversation history",
            "• Respond to voice commands",
            "",
            "Try saying: 'Add task finish homework.'"
        ].join("\n");
    }

    // Time
    if (text.includes("what time") || text === "time") {
        return "The current time is " +
            new Date().toLocaleTimeString();
    }

    // Date
    if (text.includes("what is the date") || text === "date") {
        return "Today is " +
            new Date().toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            });
    }

    // Add task
    if (
        text.startsWith("add task ") ||
        text.startsWith("create task ") ||
        text.startsWith("remind me to ")
    ) {
        const task = input
            .replace(/^add task /i, "")
            .replace(/^create task /i, "")
            .replace(/^remind me to /i, "")
            .trim();

        if (!task) return "Please specify the task.";

        addTask(task);
        return "Task added to your system: " + task;
    }

    // Show tasks
    if (
        text.includes("show tasks") ||
        text.includes("list tasks") ||
        text.includes("my tasks")
    ) {
        const tasks = loadData(STORAGE.tasks);

        if (!tasks.length) {
            return "Your task list is currently empty.";
        }

        return "Your current tasks:\n" +
            tasks.map((task, index) =>
                `${index + 1}. ${task.text} ${task.done ? "(Completed)" : "(Pending)"}`
            ).join("\n");
    }

    // Clear tasks
    if (text === "clear tasks") {
        localStorage.removeItem(STORAGE.tasks);
        renderTasks();
        return "Task database cleared.";
    }

    // Save a note
    if (text.startsWith("remember ")) {
        const note = input.substring(9).trim();

        if (!note) return "Please tell me what to remember.";

        const notes = loadData(STORAGE.notes);
        notes.push(note);
        saveData(STORAGE.notes, notes);

        return "Information saved to local memory.";
    }

    // Recall notes
    if (
        text.includes("what do you remember") ||
        text.includes("show memories")
    ) {
        const notes = loadData(STORAGE.notes);

        if (!notes.length) {
            return "No saved notes found.";
        }

        return "Here is what I have stored:\n" +
            notes.map((note, index) =>
                `${index + 1}. ${note}`
            ).join("\n");
    }

    // Clear notes
    if (text === "clear memories") {
        localStorage.removeItem(STORAGE.notes);
        return "Saved notes cleared.";
    }

    // Website commands
    const websites = {
        "google": "https://www.google.com",
        "youtube": "https://www.youtube.com",
        "wikipedia": "https://www.wikipedia.org",
        "github": "https://github.com",
        "netlify": "https://www.netlify.com"
    };

    for (const [name, url] of Object.entries(websites)) {
        if (text === `open ${name}`) {
            window.open(url, "_blank", "noopener");
            return `Opening ${name}.`;
        }
    }

    // Search command
    if (text.startsWith("search for ")) {
        const query = input.substring(11).trim();

        if (!query) return "What would you like me to search for?";

        window.open(
            "https://www.google.com/search?q=" + encodeURIComponent(query),
            "_blank",
            "noopener"
        );

        return "Searching the web for " + query + ".";
    }

    // System status
    if (
        text.includes("system status") ||
        text.includes("systems check")
    ) {
        return [
            "JARVIS SYSTEM REPORT",
            "",
            "Core: ONLINE",
            "Local storage: AVAILABLE",
            "Task manager: ONLINE",
            "Voice interface: " +
                (window.speechSynthesis ? "AVAILABLE" : "UNAVAILABLE"),
            "Network AI: NOT CONNECTED",
            "",
            "All local systems operational."
        ].join("\n");
    }

    return "I don't have a local command for that yet. Try saying 'help' to see my current capabilities.";
}


/* ---------- TASK MANAGER ---------- */

function addTask(taskText) {
    const text = (taskText || taskInput?.value || "").trim();

    if (!text) return;

    const tasks = loadData(STORAGE.tasks);

    tasks.push({
        id: Date.now() + Math.random(),
        text,
        done: false
    });

    saveData(STORAGE.tasks, tasks);

    if (taskInput) {
        taskInput.value = "";
    }

    renderTasks();
}

function toggleTask(id) {
    const tasks = loadData(STORAGE.tasks);

    const updated = tasks.map(task => {
        if (String(task.id) === String(id)) {
            task.done = !task.done;
        }

        return task;
    });

    saveData(STORAGE.tasks, updated);
    renderTasks();
}

function deleteTask(id) {
    const tasks = loadData(STORAGE.tasks)
        .filter(task => String(task.id) !== String(id));

    saveData(STORAGE.tasks, tasks);
    renderTasks();
}

function renderTasks() {
    if (!taskList) return;

    const tasks = loadData(STORAGE.tasks);
    taskList.innerHTML = "";

    tasks.forEach(task => {
        const row = document.createElement("div");
        row.className = task.done ? "task done" : "task";

        const label = document.createElement("span");
        label.textContent = task.text;

        const completeButton = document.createElement("button");
        completeButton.textContent = task.done ? "Undo" : "Complete";
        completeButton.addEventListener("click", () => {
            toggleTask(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            deleteTask(task.id);
        });

        row.append(label, completeButton, deleteButton);
        taskList.appendChild(row);
    });
}


/* ---------- VOICE OUTPUT ---------- */

function speak(text) {
    if (!("speechSynthesis" in window)) {
        setStatus("VOICE OUTPUT UNAVAILABLE");
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 1;
    speech.pitch = 0.85;
    speech.volume = 1;

    speech.onstart = () => {
        if (visualizer) visualizer.classList.add("active");
        setStatus("VOICE OUTPUT ACTIVE");
    };

    speech.onend = () => {
        if (visualizer) visualizer.classList.remove("active");
        setStatus("ALL SYSTEMS OPERATIONAL");
    };

    window.speechSynthesis.speak(speech);
}

function repeatResponse() {
    speak(lastResponse);
}


/* ---------- VOICE INPUT ---------- */

function startListening() {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        setStatus("VOICE INPUT NOT SUPPORTED BY THIS BROWSER");
        return;
    }

    if (listening) return;

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        listening = true;

        if (visualizer) {
            visualizer.classList.add("active");
        }

        setStatus("LISTENING...");
    };

    recognition.onresult = event => {
        const transcript =
            event.results[0][0].transcript;

        if (chatInput) {
            chatInput.value = transcript;
        }

        sendMessage(transcript);
    };

    recognition.onerror = () => {
        setStatus("VOICE INPUT ERROR");
    };

    recognition.onend = () => {
        listening = false;

        if (visualizer) {
            visualizer.classList.remove("active");
        }

        setStatus("ALL SYSTEMS OPERATIONAL");
    };

    recognition.start();
}

function stopListening() {
    if (recognition && listening) {
        recognition.stop();
    }
}


/* ---------- KEYBOARD INPUT ---------- */

if (chatInput) {
    chatInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
}

if (taskInput) {
    taskInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            addTask();
        }
    });
}


/* ---------- STARTUP ---------- */

renderTasks();
loadChatHistory();

setStatus("JARVIS CORE 2.0 ONLINE");

if (chatBox && chatBox.children.length === 0) {
    addMessage(
        "JARVIS Core 2.0 online. Local command systems ready. Say 'help' to see what I can do.",
        "jarvis"
    );
}

console.log("JARVIS CORE 2.0 INITIALIZED");
