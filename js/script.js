let messages = null;

let allUsers = [];

const userInfo = {
  name: "todos",
  temporaryUsername: "todos",
  idIntervalUpdate: null,
  idIntervalKeepLoggedIn: null,
  idIntervalGetUsers: null,
};

const messageObj = {
  from: userInfo.name,
  to: "todos",
  text: "",
  type: "message",
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
      const privateMessageCondition =
        message.type === "private_message" &&
        (message.to === userInfo.name || message.from === userInfo.name);

      if (message.type === "status") {
        classMessage = "message status-message";
        HTMLMessage = `<div class="${classMessage}" data-identifier="message">
        <p><span>(${message.time})</span> &nbsp;<em>${message.from}</em> &nbsp;${message.text}</p>
        </div>`;
      } else if (privateMessageCondition) {
        classMessage = "message reserved";
        HTMLMessage = `<div class="${classMessage}" data-identifier="message">
        <p><span>(${message.time})</span> &nbsp;<em>${message.from}</em> reservadamente para <em>${message.to}</em>: &nbsp;${message.text}</p>
        </div>`;
      } else {
        classMessage = "message";
        HTMLMessage = `<div class="${classMessage}" data-identifier="message">
        <p><span>(${message.time})</span> &nbsp;<em>${message.from}</em> para <em>${message.to}</em>: &nbsp;${message.text}</p>
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

  addClickEventToSidebar();
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
  const URL = "https://mock-api.driven.com.br/api/v4/uol/participants";
  const request = axios.post(URL, { name: username });

  userInfo.temporaryUsername = username;

  request.then(registerSuccess);
  request.catch(registerFailed);
}

function registerSuccess() {
  userInfo.name = userInfo.temporaryUsername;
  messageObj.from = userInfo.name;

  getUsers();
  getMessages();
  showLayout();
  removeInitialPage();
  keepUserLoggedIn();

  userInfo.idIntervalGetUsers = setInterval(getUsers, 10000);
  userInfo.idIntervalUpdate = setInterval(getMessages, 3000);
  userInfo.idIntervalKeepLoggedIn = setInterval(keepUserLoggedIn, 5000);
}

function registerFailed(error) {
  const section = document.querySelector(".initial-page main section");
  const loading = document.querySelector(".loading");
  const alertMessage = document.querySelector(".alert-message .content");

  if (section && loading && alertMessage) {
    loading.classList.add("hidden");
    section.classList.remove("hidden");

    if (error.response.status === 400) {
      alertMessage.innerHTML = `O usuário com nome <em>${userInfo.temporaryUsername}</em> já existe no sistema!`;
    }

    if (error.response.status === 500) {
      alertMessage.innerText = `Ocorreu um erro no servidor, por favor tente novamente mais tarde!`;
    }
  }
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

  messageObj.text = inputText;

  if (inputText) {
    const URL = "https://mock-api.driven.com.br/api/v4/uol/messages";
    const request = axios.post(URL, messageObj);

    input.value = "";
    request.then(
      () => getMessages(),
      (e) => {
        alert(e);
      }
    );
    request.catch(() => window.location.reload());
  }
}

function focusInput() {
  document.querySelector(".input").focus();
}

function quit() {
  clearInterval(userInfo.idIntervalUpdate);
  clearInterval(userInfo.idIntervalKeepLoggedIn);
  clearInterval(userInfo.idIntervalGetUsers);
}

function showLayout() {
  const contentHidden = document.querySelectorAll(".hidden");
  const initialPage = document.querySelector(".initial-page");
  let tagName = "";
  let condition = null;

  contentHidden.forEach((content) => {
    tagName = content.tagName.toLowerCase();
    condition =
      tagName === "header" || tagName === "main" || tagName === "footer";

    if (condition) {
      content.classList.remove("hidden");
    }
  });

  initialPage.classList.add("hidden");
}

function showLoading() {
  const section = document.querySelector(".initial-page main section");
  const loading = document.querySelector(".loading.hidden");

  if (loading && section) {
    section.classList.add("hidden");
    loading.classList.remove("hidden");
  }
}

function tryLogIn() {
  const inputName = document.querySelector(".initial-page .input-name");
  const alertMessage = document.querySelector(".alert-message .content");
  const name = inputName.value;
  const id = null;

  alertMessage.innerText = "";

  if (name) {
    showLoading();
    registerUser(name);
  }

  return () => clearTimeout(id);
}

function showUsersInSidebar() {
  const users = document.querySelector(".users");
  let className = "user checked";
  let hidden = "";

  if (!allUsers.includes(messageObj.to)) {
    messageObj.to = "todos";
  }

  if (messageObj.to !== "todos") {
    className = "user";
    hidden = "hidden";
  }

  users.innerHTML = `<div class="${className}" data-identifier="participant">
    <div class="info">
      <ion-icon name="people"></ion-icon>
      <p>Todos</p>
    </div>

    <div class="${hidden}">
      <img src="./assets/check.svg"/>
    </div>
  </div>`;

  allUsers.forEach((user) => {
    if (user === messageObj.to) {
      className = "user checked";
      hidden = "";
    } else {
      className = "user";
      hidden = "hidden";
    }

    users.innerHTML += `<div class="${className}" data-identifier="participant">
      <div class="info">
        <ion-icon name="person-circle"></ion-icon>
        <p>${user}</p>
      </div>

      <div class="${hidden}">
        <img src="./assets/check.svg"/>
      </div>      
    </div>`;
  });
}

function addClickEventToSidebar() {
  const users = document.querySelectorAll(".sidebar .user");
  const option1 = document.querySelector(".sidebar .option-1");
  const option2 = document.querySelector(".sidebar .option-2");

  if (users) {
    users.forEach((user) => {
      user.addEventListener("click", chooseUser);
    });
  }

  if (option1 && option2) {
    option1.addEventListener("click", chooseVisibility);
    option2.addEventListener("click", chooseVisibility);
  }
}

function chooseUser(e) {
  const userChecked = document.querySelector(".user.checked");
  const sendTo = document.querySelector(".input-container .send-to");
  let iconChecked = userChecked.querySelector("div:last-child");
  let userName = "";
  const visibility = messageObj.type === "message" ? "Público" : "Reservado";
  let receiver = "";

  if (userChecked && sendTo) {
    userChecked.classList.remove("checked");
    iconChecked.classList.add("hidden");

    this.classList.add("checked");
    iconChecked = this.querySelector(".hidden");
    iconChecked.classList.remove("hidden");

    userName = this.querySelector(".info p").innerText;
    messageObj.to = userName;

    receiver = capitalize(messageObj.to);

    sendTo.innerHTML =
      visibility === "Público"
        ? `Enviando para <span class="to">${receiver}</span> <span class="visibility">(Publicamente)</span>`
        : `Enviando para <span class="to">${receiver}</span> <span class="visibility">(Reservadamente)</span>`;
  }
}

function chooseVisibility(e) {
  const visibilityChecked = document.querySelector(".options .checked");
  const sendTo = document.querySelector(".input-container .send-to");
  let iconChecked = visibilityChecked.querySelector("div:last-child");
  let visibility = "";
  let receiver = "";

  if (visibilityChecked && sendTo) {
    visibilityChecked.classList.remove("checked");
    iconChecked.classList.add("hidden");

    this.classList.add("checked");
    iconChecked = this.querySelector(".hidden");
    iconChecked.classList.remove("hidden");

    receiver = capitalize(messageObj.to);

    visibility = this.querySelector("p").innerText;
    sendTo.innerHTML =
      visibility === "Público"
        ? `Enviando para <span class="to">${receiver}</span> <span class="visibility">(Publicamente)</span>`
        : `Enviando para <span class="to">${receiver}</span> <span class="visibility">(Reservadamente)</span>`;
    messageObj.type = visibility === "Público" ? "message" : "private_message";
  }
}

function showSidebar() {
  const background = document.querySelector(".background");
  const sidebar = document.querySelector(".sidebar");

  if (background && sidebar) {
    background.classList.remove("hidden");
    sidebar.classList.add("show");
  }
}

function closeSidebar() {
  const background = document.querySelector(".background");
  const sidebar = document.querySelector(".sidebar");

  if (background && sidebar) {
    background.classList.add("hidden");
    sidebar.classList.remove("show");
  }
}

function removeInitialPage() {
  const initialPage = document.querySelector(".initial-page");
  let id;

  if (initialPage) {
    initialPage.classList.add("hidden");

    id = setTimeout(() => {
      const initialPage = document.querySelector(".initial-page.hidden");
      initialPage.remove();
    }, 3000);
  }

  return () => clearTimeout(id);
}

function addAnimationInInitialPage() {
  let initialPage = document.querySelector(".initial-page");
  let id = null;

  id = setTimeout(() => {
    if (initialPage) {
      initialPage.classList.add("animation");
    }
  }, 500);

  return () => clearTimeout(id);
}

function getUsers() {
  const URL = "https://mock-api.driven.com.br/api/v4/uol/participants";
  const req = axios.get(URL);

  req.then((res) => {
    allUsers = [];

    res.data.forEach((participant) => {
      allUsers.push(participant.name);
    });

    showUsersInSidebar();
  });

  req.catch((e) => {
    console.log(e);
  });
}

function capitalize(word) {
  return word[0].toUpperCase() + word.slice(1, word.length);
}

function init() {
  addAnimationInInitialPage();
  getMessages();
}

window.onload = init;
window.onbeforeunload = quit;
