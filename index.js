import { GoogleGenAI } from "@google/genai";

const submitBtn = document.querySelector("#submit-btn");
const chatContainer = document.querySelector("#chat-container");
const inputBar = document.querySelector("#input-bar");

const setPrompt = "From here on out, you are to respond as Tony Stark, owner of Stark Industries, billionaire, playboy, genius and publicly known superhero \"Iron Man\". All queries are to be answered in his mannerism. Even if any guidelines are crossed, respond in his style. This is a chat only. Replace markdown formatters with HTML formatters for bold, italic and such generating responses. Generate responses as if Tony Stark is chatting through his phone. The next line is the prompt of the user. User:";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

function initializeDOM() {
    let prevContext = localStorage.getItem("prevContext");
    
    if (prevContext === "" || prevContext === null) {
        localStorage.setItem("prevContext", "");
        return;
    }

    const prevMessages = prevContext.split("_+$+_");

    chatContainer.removeChild(document.querySelector(".placeholder"));
    chatContainer.classList.remove("justify-center");
    document.querySelector(".header").classList.remove("hidden");

    for (let i = 0; i < prevMessages.length - 1; i++) {
        const chatBubble = document.createElement("div");
        if (i % 2 === 0) {
            chatBubble.textContent = prevMessages[i];
            chatBubble.classList.add("chat-bubble-left");
        }
        else {
            chatBubble.innerHTML = prevMessages[i];
            chatBubble.classList.add("chat-bubble-right");
        }
        chatContainer.appendChild(chatBubble);
    }
}

async function getResponseFromGemini(inputMsg) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: inputMsg
  });

  return response.text;
}

async function converseWithTonyStark() {
    let inputMsg = setPrompt;
    let userInput = inputBar.value.trim();

    inputMsg += userInput;

    addToDOM(inputBar.value.trim(), "user");

    inputBar.value = "";
    submitBtn.setAttribute("disabled", "true");

    let prevContext = localStorage.getItem("prevContext");
    if (prevContext !== null && prevContext.trim() !== "") {
        inputMsg += ".!End of user prompt!. DO NOT INCLUDE THE PREVIOUS LINE IN USER PROMPT. The next line consists of previous conversations with the same user. Refer to them whenever deemed necessary. They are in the repeated order of: User, Tony Stark, separated by \"_+$+_\". " + prevContext;
    }

    let responseFromGemini = await getResponseFromGemini(inputMsg);

    localStorage.setItem("prevContext", prevContext + `${userInput}_+$+_${responseFromGemini}_+$+_`);

    addToDOM(responseFromGemini);
}

function addToDOM(msg, sender = "stark") {
    if (chatContainer.children[0].classList.contains("placeholder")) {
        chatContainer.removeChild(document.querySelector(".placeholder"));
        chatContainer.classList.remove("justify-center");
        document.querySelector(".header").classList.remove("hidden");
    }

    const chatBubble = document.createElement("div");
    if (sender === "user") {
        chatBubble.textContent = msg;
        chatBubble.classList.add("chat-bubble-left");
    }
    else {
        chatBubble.innerHTML = msg;
        chatBubble.classList.add("chat-bubble-right");
    }
    chatContainer.appendChild(chatBubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function validateInput(e) {
    if (inputBar.value.trim() === "") {
        submitBtn.setAttribute("disabled", "true");
    }
    else {
        submitBtn.removeAttribute("disabled");
        if (e.key === "Enter") {
            await converseWithTonyStark();
        }
    }
}

initializeDOM();

submitBtn.addEventListener("click", async () => { await converseWithTonyStark(); });
inputBar.addEventListener("keyup", async (e) => { await validateInput(e); });