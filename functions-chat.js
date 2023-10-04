const messagesElement = document.getElementById('messages');

const messageInput = document.getElementById('message-input');

const urlSearchParams = new URLSearchParams(window.location.search);

let roomFromURL = ''
let nameFromURL = ''

window.addEventListener('message', (event) => {

  roomFromURL = event.data.room;
  nameFromURL = event.data.name;

  openChat(event.data.room, event.data.name, getRandomColor());

});

const typingIndicatorTimeout = 1000;

let isTyping = false;
let typingTimeout;


messageInput.addEventListener('input', () => {

  if (!isTyping) {
    isTyping = true;
    userTypingSocket(nameFromURL, true);
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isTyping = false;
    userTypingSocket(nameFromURL, false);
  }, typingIndicatorTimeout);
});


document.getElementById('submit-button').addEventListener('click', (event) => {
  event.preventDefault();

  const timestampOptions = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  };
  const timestamp = new Date().toLocaleString('pt-BR', timestampOptions);

  const message = {
    message: messageInput.value,
    timestamp,
    bubbleColor: getRandomColor(),
    image: false
  }



  if (message.message.trim() !== '') {
    sendMessageSocket(message);
    messageInput.value = '';
  }
});


function openChat(room, name, color) {

  joinRoomSocket(room, name, color);

  addSystemMessage(`${name} entrou na sala.`);

  document.querySelector('.input-container').style.display = 'none';
  document.getElementById('chat').style.display = 'block';
  document.getElementById('current-room').textContent = room;
}



function addMessageToChat(user, text, timestamp, bubbleColor,image) {

  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message-container');

  const isOwnMessage = user.toLowerCase() === nameFromURL.toLowerCase();
  messageContainer.classList.add(isOwnMessage ? 'own' : 'other'); 


  const messageElement = document.createElement('div');
  messageElement.textContent = text;
  messageElement.classList.add('message');
  messageContainer.appendChild(messageElement);


  if (image) {
    const imageElement = document.createElement('img');
    imageElement.src = text; 
    imageElement.classList.add('message');
    messageContainer.appendChild(imageElement);
} 


  if (!isOwnMessage) {
    const userNameElement = document.createElement('div');
    userNameElement.textContent = getInitials(user);
    userNameElement.classList.add('user-initials');
    userNameElement.setAttribute('title', user);
    userNameElement.style.backgroundColor = bubbleColor;
    messageContainer.appendChild(userNameElement);
  }


  const timestampElement = document.createElement('div');
  timestampElement.textContent = timestamp;
  timestampElement.classList.add('timestamp');

  const timestampClass = isOwnMessage ? 'own-timestamp' : 'other-timestamp';
  timestampElement.classList.add(timestampClass); // Adiciona a classe de carimbo de data/hora apropriada
  messageContainer.appendChild(timestampElement);

  messagesElement.appendChild(messageContainer);
  messagesElement.scrollTop = messagesElement.scrollHeight;
}


function addSystemMessage(message) {

  if (message.includes('📍')) {

    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.classList.add('user-name-center');

    messagesElement.appendChild(messageElement);
    messagesElement.scrollTop = messagesElement.scrollHeight;
  }
}



function getInitials(name) {
  const words = name.split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return '';
}

function getRandomColor() {
  const colors = ['#9a53ff', "#d50000", "#4dcb7b"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function sendAlert(message, color, delay) {

  Toastify({
    text: message,
    duration: delay,
    newWindow: true,
    close: true,
    gravity: "top",
    position: "center",
    stopOnFocus: true,
    style: {
      background: color,
    }
  }).showToast();

}

const userListButton = document.getElementById('user-list-button');
const userListPopup = document.getElementById('user-list-popup');
const closePopupButton = document.getElementById('close-popup-button');
const userList = document.getElementById('user-list');
const searchUserInput = document.getElementById('search-user'); // Campo de busca
const messageInputSearch = document.getElementById('message-input'); // Campo de mensagem

// Função para abrir o popup da lista de usuários
const openUserListPopup = () => {
  // Preencha a lista de usuários com os nomes dos usuários da sala
  console.log(roomListNames);
  userList.innerHTML = roomListNames.map((user, index) => {
    if (user.name !== nameFromURL.toLowerCase()) {

      return `
        <li class="user-item">
          <span class="user-initials-popup" style="background-color: ${user.color};width: 10px;height: 10px;"></span>
          <span class="user-name">${user.name}</span>
         
        </li>`;
    }
  }).join('');


  userListPopup.style.display = 'block';
};

userListButton.addEventListener('click', openUserListPopup);

closePopupButton.addEventListener('click', () => {
  userListPopup.style.display = 'none';
});

document.getElementById('chat-form').addEventListener('submit', (e) => {
  e.preventDefault();
});



// Adiciona evento de entrada de texto para filtrar a lista de usuários
searchUserInput.addEventListener('input', () => {
  const searchTerm = searchUserInput.value.toLowerCase();
  const filteredUsers = roomListNames.filter(user => user.name.toLowerCase().includes(searchTerm));
  userList.innerHTML = filteredUsers.map(user => {
    return `
        <li class="user-item">
        <span class="user-initials-popup" style="background-color: ${user.color};width: 10px;height: 10px;"></span>
          <span class="user-name">${user.name}</span>
        </li>`;
  }).join('');
});

// Delegação de eventos para tratar cliques nos nomes de usuários
userList.addEventListener('click', (event) => {
  const target = event.target;
  if (target.classList.contains('user-name')) {
    const userName = target.textContent;
    messageInputSearch.value = `${messageInputSearch.value.trim()} @${userName}, `;
    userListPopup.style.display = 'none';
  }
});


const imageInput = document.getElementById('image-input');
const imageButton = document.getElementById('image-button');
const chatForm = document.getElementById('chat-form');


// Evento acionado quando uma imagem é selecionada
imageInput.addEventListener('change', (event) => {

  event.preventDefault();

  const timestampOptions = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  };
  const timestamp = new Date().toLocaleString('pt-BR', timestampOptions);



  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      const imageData = loadEvent.target.result; // Dados da imagem como base64


      const message = {
        message: imageData,
        timestamp,
        bubbleColor: getRandomColor(),
        image: true
      }

      sendMessageSocket(message);
    };

    // Lê o arquivo como base64
    reader.readAsDataURL(file);
  }
});


