const messagesElement = document.getElementById('messages');
const messageInput = document.getElementById('message-input');

const urlSearchParams = new URLSearchParams(window.location.search);

console.log(urlSearchParams);


const roomFromURL = urlSearchParams.get('room');
const nameFromURL = urlSearchParams.get('name');

console.log(roomFromURL, nameFromURL)

document.getElementById('room').value = roomFromURL;
document.getElementById('name').value = nameFromURL;

if (roomFromURL && nameFromURL) {
    openChat(roomFromURL, nameFromURL);
}


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
        bubbleColor: getRandomColor()
    }



    if (message.message.trim() !== '') {
        sendMessageSocket(message);
        messageInput.value = '';
    }
});

document.getElementById('join-button').addEventListener('click', () => {
    const room = document.getElementById('room').value;
    const name = document.getElementById('name').value;

    if (room.trim() !== '' && name.trim() !== '') {
        openChat(room, name);
    }
});

function openChat(room, name) {

    joinRoomSocket(room, name);

    addSystemMessage(`${name} entrou na sala.`);

    document.querySelector('.input-container').style.display = 'none';
    document.getElementById('chat').style.display = 'block';
    document.getElementById('current-room').textContent = room;
}



function addMessageToChat(user, text, timestamp, bubbleColor) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    const isOwnMessage = user.toLowerCase() === nameFromURL.toLowerCase();
    messageContainer.classList.add(isOwnMessage ? 'own' : 'other'); // Adiciona a classe 'own' ou 'other'

    if (!isOwnMessage) {
        const userNameElement = document.createElement('div');
        userNameElement.textContent = getInitials(user);
        userNameElement.classList.add('user-initials');
        userNameElement.setAttribute('title', user);
        userNameElement.style.backgroundColor = bubbleColor;
        messageContainer.appendChild(userNameElement);
    }

    const messageElement = document.createElement('div');
    messageElement.textContent = text;
    messageElement.classList.add('message');
    messageContainer.appendChild(messageElement);

    const timestampElement = document.createElement('div');
    timestampElement.textContent = timestamp;
    timestampElement.classList.add('timestamp');
    messageContainer.appendChild(timestampElement);

    messagesElement.appendChild(messageContainer);
    messagesElement.scrollTop = messagesElement.scrollHeight;
}

function addSystemMessage(message) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('user-name', 'system-message'); // Adiciona a classe 'system-message'

    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.classList.add('user-name', 'system-message-text'); // Adiciona a classe 'system-message-text'
    messageContainer.appendChild(messageElement);

    messagesElement.appendChild(messageContainer);
    messagesElement.scrollTop = messagesElement.scrollHeight;
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
    const colors = ['#33A0FF'];
    return colors[Math.floor(Math.random() * colors.length)];
}

