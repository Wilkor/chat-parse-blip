const messagesElement = document.getElementById('messages');
const messageInput = document.getElementById('message-input');

const urlSearchParams = new URLSearchParams(window.location.search);
const roomFromURL = urlSearchParams.get('room').toLowerCase()
const nameFromURL = urlSearchParams.get('name').toLowerCase()
const contract = urlSearchParams.get('contract').toLowerCase()

openChat(roomFromURL, nameFromURL, getRandomColor());

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


const sendTyping = () => {
  if (!isTyping) {
    isTyping = true;
    userTypingSocket(nameFromURL, true);
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isTyping = false;
    userTypingSocket(nameFromURL, false);
  }, typingIndicatorTimeout);

}
const sendMessageInput = (messages) => {

  messageInput.value = messages;
  document.getElementById('submit-button').click();
}


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


  //document.querySelector('.form-container').style.display = 'none';
  document.getElementById('chat').style.display = 'block';
  document.getElementById('current-room').textContent = room;
}



function addMessageToChat(user, text, timestamp, bubbleColor, image, audio) {


  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message-container');

  const isOwnMessage = user.toLowerCase() === nameFromURL.toLowerCase();
  messageContainer.classList.add(isOwnMessage ? 'own' : 'other');


  if (image) {
    const imageElement = document.createElement('img');
    imageElement.src = text;
    imageElement.classList.add('message');
    messageContainer.appendChild(imageElement);
  } else if (audio) {

    const base64String = text
    const messageContainerAudio = document.createElement('div');
    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    audioElement.src = "data:audio/wav;base64," + base64String;
    messageContainerAudio.classList.add('audio');
    messageContainerAudio.appendChild(audioElement);
    messageContainer.appendChild(messageContainerAudio);

  } else {
    const messageElement = document.createElement('div');
    messageElement.textContent = text;
    messageElement.classList.add('message');
    messageContainer.appendChild(messageElement);

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
  timestampElement.classList.add(timestampClass);
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

const openUserListPopup = () => {
  const isMentionMode = localStorage.getItem("change-room") === 'mention';
  const filteredUsers = roomListNames.filter(user =>  user.name !== nameFromURL.toLowerCase());

  const userListHTML = filteredUsers.map(user => {
    return `
      <li class="user-item">
        <span class="user-initials-popup" style="background-color: ${user.color};width: 10px;height: 10px;"></span>
        <span class="user-name">${user.name}</span>
      </li>`;
  }).join('');

  userList.innerHTML = isMentionMode ? userListHTML : userListHTML;
  userListPopup.style.display = 'block';
};


userListButton.addEventListener('click', openUserListPopup);

closePopupButton.addEventListener('click', () => {
  userListPopup.style.display = 'none';
});

document.getElementById('chat-form').addEventListener('submit', (e) => {
  e.preventDefault();
});



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

userList.addEventListener('click', (event) => {

  const target = event.target;

  const changeRoom = localStorage.getItem("change-room");


  if (target.classList.contains('user-name')) {
    const userName = target.textContent;

    if (changeRoom === 'list-user') {
      const urlParams = new URLSearchParams(window.location.search);
      const nameValue = urlParams.get('name');

      let combinationText;

      if (userName === "Equipe") {
        combinationText = contract;
        urlParams.set('room', combinationText);
      } else {
        combinationText = `${userName}_${nameValue}`
        const resultFilterCombination = tokensOfRoom.filter((room) => room.combination.toLowerCase() === combinationText.toLowerCase());

        urlParams.set('room', resultFilterCombination[0].id);

      }

      window.history.replaceState({}, document.title, window.location.pathname + '?' + urlParams.toString());
      window.location.reload();
      return
    }



    const msg = `${messageInputSearch.value.trim()} @${userName}, `;

    window.postMessage({ message: msg, ref: 'front-mention-click' }, '*');

    const userPopup = document.getElementById('user-list-popup');
    userPopup.style.display = userPopup.style.display === 'block' ? 'none' : 'block';
  }
});





const imageInput = document.getElementById('image-input');
const imageButton = document.getElementById('image-button');
const chatForm = document.getElementById('chat-form');


imageInput.addEventListener('change', (event) => {
  event.preventDefault();

  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif']; // Tipos MIME de imagens permitidos

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

  // Verifica se um arquivo foi selecionado e se é uma imagem válida
  if (file && allowedImageTypes.includes(file.type)) {
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
  } else {
    // Se o arquivo não é uma imagem válida, exiba uma mensagem de erro ao usuário
    alert('Por favor, selecione uma imagem válida (JPEG, PNG ou GIF).');
  }
});


const recordBtn = document.getElementById('recordBtn');
const audioPlayer = document.getElementById('audioPlayer');
let mediaRecorder;
let chunks = [];

recordBtn.addEventListener('click', () => {

  if (recordBtn.textContent === 'Iniciar Gravação de Voz') {
    startRecording();
    recordBtn.textContent = 'Parar Gravação de Voz';
  } else {
    stopRecording();
    recordBtn.textContent = 'Iniciar Gravação de Voz';
  }
});

function startRecording() {

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

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function (stream) {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = function (event) {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        chunks = [];

        const message = {
          message: await blobToBase64(audioBlob),
          timestamp,
          bubbleColor: getRandomColor(),
          image: false,
          audio: true
        }

        sendMessageSocket(message);

      };

      mediaRecorder.start();
    })
    .catch(function (err) {
      const data = { audio: true, ref: 'front-audio-start' };
      window.parent.postMessage(data, '*');

      return
    });
}

function stopRecording() {
  console.log('parou ')
  if (mediaRecorder?.state === 'recording') {
    window.parent.postMessage({ message: 'stop', ref: 'front-audio-stop' }, '*');
    mediaRecorder.stop();
  } else {
    const data = { audio: false, ref: 'front-audio-stop' };
    window.parent.postMessage(data, '*');
  }
}




function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function () {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsDataURL(blob);
  });
}
