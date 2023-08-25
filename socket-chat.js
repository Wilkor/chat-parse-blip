const socket = io('https://pontoparse.herokuapp.com/');
//const socket = io('http://localhost:3333');

socket.on('user joined', (username) => {
    addSystemMessage(`📍${username} entrou.`);
});

socket.on('user left', (username) => {
    addSystemMessage(`📍${username} saiu.`);
});

socket.on('user typing', ({ username, isTyping }) => {
    const typingIndicator = document.getElementById('typing-indicator');

    if (isTyping) {
        typingIndicator.textContent = nameFromURL.toLowerCase() === username.toLowerCase() ? '' : `${username} está digitando...`;
    } else {
        typingIndicator.textContent = '';
    }
});

socket.on('chat message', (msg) => {

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    if (msg.user.toLowerCase() === nameFromURL.toLowerCase()) {
        messageContainer.classList.add('own');
    }

    const isOwnMessage = msg.user.toLowerCase() === nameFromURL.toLowerCase();

    if (!isOwnMessage) {

        const userInitials = document.createElement('div');
        userInitials.textContent = getInitials(msg.user);
        userInitials.classList.add('user-initials');
        userInitials.style.backgroundColor = msg.bubbleColor;
        userInitials.setAttribute('title', msg.user);
        messageContainer.appendChild(userInitials);
    }

    const userNameElement = document.createElement('div');
    userNameElement.textContent = msg.user === nameFromURL.toLowerCase() ? '' : msg.user;
    userNameElement.classList.add('user-name');
    messageContainer.appendChild(userNameElement);

    const messageElement = document.createElement('div');
    messageElement.textContent = msg.text;
    messageElement.classList.add('message');
    messageContainer.appendChild(messageElement);

    const timestampElement = document.createElement('div');

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
    timestampElement.textContent = timestamp;
    timestampElement.classList.add('timestamp');
    messageContainer.appendChild(timestampElement);


    messagesElement.appendChild(messageContainer);
    messagesElement.scrollTop = messagesElement.scrollHeight;
});

socket.on('cached messages', (cachedMessages) => {

    cachedMessages.forEach((msg) => {
        addMessageToChat(msg.user, msg.text, msg.timestamp, msg.bubbleColor);
    });
});

const sendMessageSocket = (message) => {
    socket.emit('chat message', message);
}

const joinRoomSocket = (room, name, color) => {

    socket.emit('join room', { room, name, color });
}

const userTypingSocket = (nameFromURL, bool) => {

    socket.emit('user typing', nameFromURL, bool);
}
