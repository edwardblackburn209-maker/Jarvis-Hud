// =================================
// J.A.R.V.I.S. MAIN SYSTEM
// =================================

let lastResponse = "";


// CLOCK
function updateClock() {
    const now = new Date();

    document.getElementById("clock").textContent =
        now.toLocaleTimeString();

    document.getElementById("date").textContent =
        now.toDateString();
}

setInterval(updateClock, 1000);
updateClock();


// CHAT SYSTEM
function addMessage(text, type) {
    const chat = document.getElementById("chatBox");

    const message = document.createElement("div");

    message.className = "message " + type;

    message.textContent =
        (type === "user" ? "YOU: " : "J.A.R.V.I.S.: ") + text;

    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;
}


// SEND MESSAGE
async function sendMessage() {

    const input = document.getElementById("chatInput");

    const text = input.value.trim();

    if (!text) return;

    addMessage(text, "user");

    input.value = "";

    document.getElementById("systemMessage").textContent =
        "Processing your request...";

    try {

        const response = await fetch(
            "/.netlify/functions/chat",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: text
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Communication error.");
        }

        lastResponse = data.reply;

        addMessage(data.reply, "jarvis");

        document.getElementById("systemMessage").textContent =
            "Command processed.";

        speak(data.reply);

    } catch (error) {

        addMessage(
            "I am unable to establish communication with my AI system. " +
            error.message,
            "jarvis"
        );

        document.getElementById("systemMessage").textContent =
            "Communication interrupted.";

    }
}


// VOICE OUTPUT
function speak(text) {

    if (!("speechSynthesis" in window)) return;

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = 1;
    speech.pitch = 0.85;
    speech.volume = 1;

    speech.onstart = () => {
        document.getElementById("visualizer")
            .classList.add("active");
    };

    speech.onend = () => {
        document.getElementById("visualizer")
            .classList.remove("active");
    };

    speechSynthesis.speak(speech);
}


// REPEAT
function repeatResponse() {

    if (lastResponse) {
        speak(lastResponse);
    }

}


// VOICE INPUT
let recognition;

function startListening() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert("Voice recognition is not supported by this browser.");

        return;
    }

    recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.onstart = () => {

        document.getElementById("systemMessage").textContent =
            "Listening...";

        document.getElementById("visualizer")
            .classList.add("active");

    };

    recognition.onresult = (event) => {

        const transcript =
            event.results[0][0].transcript;

        document.getElementById("chatInput").value =
            transcript;

        sendMessage();

    };

    recognition.onerror = () => {

        document.getElementById("systemMessage").textContent =
            "Voice recognition unavailable.";

        document.getElementById("visualizer")
            .classList.remove("active");

    };

    recognition.onend = () => {

        document.getElementById("visualizer")
            .classList.remove("active");

    };

    recognition.start();

}


// STOP VOICE
function stopListening() {

    if (recognition) {
        recognition.stop();
    }

    speechSynthesis.cancel();

    document.getElementById("visualizer")
        .classList.remove("active");

    document.getElementById("systemMessage").textContent =
        "Awaiting your command.";

}


// CLEAR CHAT
function clearChat() {

    document.getElementById("chatBox").innerHTML = "";

}


// =================================
// TASK MANAGEMENT
// =================================

let tasks = JSON.parse(
    localStorage.getItem("jarvisTasks") || "[]"
);


function saveTasks() {

    localStorage.setItem(
        "jarvisTasks",
        JSON.stringify(tasks)
    );

}


function renderTasks() {

    const list = document.getElementById("taskList");

    list.innerHTML = "";

    tasks.forEach((task, index) => {

        const item = document.createElement("div");

        item.className = "task";

        const label = document.createElement("span");

        label.textContent = task.text;

        if (task.completed) {
            label.classList.add("completed");
        }

        label.onclick = () => toggleTask(index);

        const remove = document.createElement("button");

        remove.textContent = "X";

        remove.onclick = () => deleteTask(index);

        item.appendChild(label);

        item.appendChild(remove);

        list.appendChild(item);

    });

}


function addTask() {

    const input = document.getElementById("taskInput");

    const text = input.value.trim();

    if (!text) return;

    tasks.push({
        text: text,
        completed: false
    });

    input.value = "";

    saveTasks();

    renderTasks();

}


function toggleTask(index) {

    tasks[index].completed =
        !tasks[index].completed;

    saveTasks();

    renderTasks();

}


function deleteTask(index) {

    tasks.splice(index, 1);

    saveTasks();

    renderTasks();

}


renderTasks();


// INITIALIZATION
console.log("J.A.R.V.I.S. SYSTEM INITIALIZED.");
