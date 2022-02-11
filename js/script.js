let messages = null;

const userInfo = {
  name: "todos",
  temporaryUsername: "todos",
  idIntervalUpdate: null,
  idIntervalKeepLoggedIn: null,
};

function getMessages() {
  const URL = "https://mock-api.driven.com.br/api/v4/uol/messages";
  const req = axios.get(URL);

  req.then(requestWorked);
  req.catch(requestFailed);
}

function requestWorked(res) {
  let allMessagesToHTML = null;

  if (checkIfMessagesHaveChanged(res.data)) {
    allMessagesToHTML = createHTMLToMessages();
    messagesIntoHTML(allMessagesToHTML);    
  }
}

function requestFailed(error) {
  console.clear();
  console.log("Error: " + error.response.status);
  console.log("Message: " + error.response.data);
}

function createHTMLToMessages() {
  let allHTML = "";
  let HTMLMessage = null;
  let classMessage;
  
  if (messages) {
    messages.forEach((message) => {
      HTMLMessage = "";
      const privateMessageCondition = message.type === "private_message" && (message.to.toLowerCase() === userInfo.name.toLowerCase() || message.from.toLowerCase() === userInfo.name.toLowerCase());

      if (message.type === "status") {
        classMessage = "message status-message";
        HTMLMessage = `<div class="${classMessage}" data-identifier="message">
        <p><span>${message.time}</span> <em>${message.from}</em> ${message.text}</p>
        </div>`;
      } else if (privateMessageCondition) {
        classMessage = "message reserved";
        HTMLMessage = `<div class="${classMessage}" data-identifier="message">
        <p><span>${message.time}</span> <em>${message.from}</em> reservadamente para <em>${message.to}</em>: ${message.text}</p>
        </div>`;
      } else {
        classMessage = "message";
        HTMLMessage = `<div class="${classMessage}" data-identifier="message">
        <p><span>${message.time}</span> <em>${message.from}</em> para <em>${message.to}</em>: ${message.text}</p>
        </div>`;
      }
      
      allHTML += HTMLMessage;
    });
  }

  return allHTML;
}

function messagesIntoHTML(html) {
  let sectionMessages = document.querySelector(".messages");  
  sectionMessages.innerHTML = html;

  addKeyDownEvent();
  scrollToLastMessage();
}

function checkIfMessagesHaveChanged(data) {
  if (messages !== data && data.length > 0) {
    messages = data;
    return true;
  } else {
    return false;
  }
}

function scrollToLastMessage() {
  const allMessages = document.querySelectorAll(".message");
  const lastMessage = allMessages[allMessages.length - 1];
  
  lastMessage.scrollIntoView({ behavior: "smooth" });
}

function registerUser(username) {
  const URL = "https://mock-api.driven.com.br/api/v4/uol/participants ";
  const request = axios.post(URL, { name: username });

  userInfo.temporaryUsername = username;

  request.then(registerSuccess);
  request.catch(registerFailed);
}

function registerSuccess() {
  userInfo.name = userInfo.temporaryUsername;

  getMessages();
  keepUserLoggedIn();
  
  userInfo.idIntervalUpdate = setInterval(getMessages, 3000);
  userInfo.idIntervalKeepLoggedIn = setInterval(keepUserLoggedIn, 5000);
}

function registerFailed(error) {
  console.log("Error: " + error.response.status);
  console.log("Message: " + error.response.data);

  init();
}

function keepUserLoggedIn() {
  const URL = "https://mock-api.driven.com.br/api/v4/uol/status";
  axios.post(URL, { name: userInfo.name });
}

function addKeyDownEvent() {
  const input = document.querySelector(".input");

  input.addEventListener("keydown", (e) => {
    const keyPressed = e.key;

    if (keyPressed === "Enter") {
      sendMessage();
      return;
    } else {
      return;
    }
  });
}

function sendMessage() {
  const input = document.querySelector(".input");
  const inputText = input.value;
  const messageTo = "Weslen";
  const messageObj = {
    from: userInfo.name,
    to: messageTo,
    text: inputText,
    type: messageTo !== "todos" ? "private_message" : "message",
  };

  if (inputText) {
    const URL = "https://mock-api.driven.com.br/api/v4/uol/messages";
    const request = axios.post(URL, messageObj);

    input.value = "";
    request.then(() => getMessages());
    request.catch(() => window.location.reload());
  }
}

function focusInput() {
  document.querySelector(".input").focus();
}

function quit() {
  clearInterval(userInfo.idIntervalUpdate);
  clearInterval(userInfo.idIntervalKeepLoggedIn);
}

function init() {
  const name = prompt("Qual é o seu nome?");
  
  registerUser(name);
}

window.onload = init;
window.onbeforeunload = quit;
