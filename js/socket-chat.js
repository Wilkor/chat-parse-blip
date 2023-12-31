const socket = io('https://pontoparse.herokuapp.com/');
//const socket = io('http://localhost:3333');
const urlSearchParamsSocket = new URLSearchParams(window.location.search);
const contractSocket = urlSearchParamsSocket.get('contract').toLowerCase()


let roomUserNames = [];
let roomListNames = [];
let tokensOfRoom = [];

const objEquipe = {

    "id": "122333",
    "name": "Equipe",
    "room": contractSocket

}



function generateCombinations(names) {

    const combinations = [];
    for (let i = 0; i < names.length; i++) {
        for (let j = 0; j < names.length; j++) {
            if (i !== j) {
                const combination1 = `${names[i]}_${names[j]}`;
                const combination2 = `${names[j]}_${names[i]}`;
                const id = combination1 + ":" + combination2
                combinations.push({ combination: combination1, id, name: names[i]});
                combinations.push({ combination: combination2, id, name:names[i]  });
            }
        }
    }
    return combinations;
}



socket.on('user joined', (username) => {

    if (username) {

        addSystemMessage(`📍${username} entrou.`);
    }
});

socket.on('user left', (username) => {
    addSystemMessage(`📍${username} ficou ausente.`);
});

socket.on('roomData', (data) => {
    roomUserNames = data.users.map(user => user.name.toLowerCase().split('@')[0]);
    console.log(roomUserNames)
});

socket.on('roomData', (data) => {

    roomListNames = data.users;
    roomListNames.push(objEquipe)
    const names = roomListNames.map(item => item.name);
    tokensOfRoom = generateCombinations(names);

    console.log(tokensOfRoom)

});



setInterval(() => {
    console.log('Enviando ping para o servidor');
    socket.emit('ping');
}, 2000);


socket.on('pong', () => {
    console.log('Recebido pong do servidor');
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

    // const infoDataClient = JSON.parse(localStorage.getItem('info-client-chat'));
    // nameFromURL = infoDataClient.name

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    if (msg.user.toLowerCase() === nameFromURL.toLowerCase()) {
        messageContainer.classList.add('own');
    }

    const isOwnMessage = msg.user.toLowerCase() === nameFromURL.toLowerCase();


    if (msg.image) {
        const imageElement = document.createElement('img');
        imageElement.src = msg.text;
        imageElement.classList.add('message');
        messageContainer.appendChild(imageElement);
    } else if (msg.audio) {

        const base64String = msg.text
        const messageContainerAudio = document.createElement('div');
        const audioElement = document.createElement('audio');
        audioElement.controls = true;
        audioElement.src = "data:audio/wav;base64," + base64String;
        messageContainerAudio.classList.add('audio');
        messageContainerAudio.appendChild(audioElement);
        messageContainer.appendChild(messageContainerAudio);

    

    } else {
        const messageElement = document.createElement('div');
        const messageTextWithMentions = isOwnMessage ? msg.text : highlightMentions(msg.text, msg.user.toLowerCase(), roomUserNames, nameFromURL.toLowerCase());
        messageElement.innerHTML = `${messageTextWithMentions}`;
        messageElement.classList.add('message');
        messageContainer.appendChild(messageElement);
    }

    if (!isOwnMessage) {
        const userInitials = document.createElement('div');
        userInitials.textContent = getInitials(msg.user);
        userInitials.classList.add('user-initials');
        userInitials.style.backgroundColor = msg.bubbleColor;
        userInitials.setAttribute('title', msg.user);
        messageContainer.appendChild(userInitials);
    }

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

    const timestampClass = isOwnMessage ? 'own-timestamp' : 'other-timestamp';
    timestampElement.classList.add(timestampClass); // Adiciona a classe de carimbo de data/hora apropriada
    messageContainer.appendChild(timestampElement);

    messagesElement.appendChild(messageContainer);
    messagesElement.scrollTop = messagesElement.scrollHeight;
});


function highlightMentions(message, user, roomUserNames, nameFromURL) {
    const regexPattern = /@([\w\sÀ-ÖØ-öø-ÿ]+)/g;

    let highlightedMessage = message.replace(regexPattern, (match, username) => {
        const lowercaseUsername = username.toLowerCase();

        if (roomUserNames.includes(lowercaseUsername)) {
            console.log(`Mencionado: ${lowercaseUsername}`);

            if (lowercaseUsername === nameFromURL.toLowerCase().split('@')[0]) {
                const message = 'Olá, elemento pai!';
                window.parent.postMessage(message, '*');
            }
            return `<span class="mention">${match}</span>`;
        } else {
            return match;
        }
    });

    return highlightedMessage;
}



socket.on('cached messages', (cachedMessages) => {

    cachedMessages.forEach((msg) => {
        addMessageToChat(msg.user, msg.text, msg.timestamp, msg.bubbleColor, msg.image, msg.audio);
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

socket.on('disconnect', async () => {

    window.location.reload();
    
});

