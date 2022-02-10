let messages = null;
let idInterval = null;

const infoUser = {
  name: "todos"
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
      const privateMessageCondition = message.type === "private_message" && message.to.toLowerCase() === infoUser.name;

      if (message.type === "status") {
        classMessage = "message status-message";
        HTMLMessage = `<div class="${classMessage}">
        <p><span>${message.time}</span> <em>${message.from}</em> ${message.text}</p>
        </div>`;
      } else if (privateMessageCondition) {
        classMessage = "message reserved";
        HTMLMessage = `<div class="${classMessage}">
        <p><span>${message.time}</span> <em>${message.from}</em> reservadamente para <em>${message.to}</em>: ${message.text}</p>
        </div>`;
      } else {
        classMessage = "message";
        HTMLMessage = `<div class="${classMessage}">
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

idInterval = setInterval(getMessages, 3000);
