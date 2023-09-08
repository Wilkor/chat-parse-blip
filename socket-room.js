const socket = io('https://pontoparse.herokuapp.com/');
//const socket = io('http://localhost:3333');

let roomListNamesSocket = [];

const urlSearchParams = new URLSearchParams(window.location.search);

console.log(urlSearchParams);

const roomFromURL = urlSearchParams.get('room').toLowerCase();
const nameFromURL = urlSearchParams.get('name').toLowerCase();

const contractFromURL = urlSearchParams.get('contract').toLowerCase();

socket.emit('join room', { room: contractFromURL, name: nameFromURL, color: '' });

socket.emit('getRoomData', { status: true, room: contractFromURL });

function generateCombinations(names) {
    const combinations = [];
    for (let i = 0; i < names.length; i++) {
        for (let j = 0; j < names.length; j++) {
            if (i !== j) {
                const combination1 = `${names[i]}_${names[j]}`;
                const combination2 = `${names[j]}_${names[i]}`;
                const id = combination1 + ":" + combination2
                combinations.push({ combination: combination1, id });
                combinations.push({ combination: combination2, id });
            }
        }
    }
    return combinations;
}

const userListButton = document.getElementById('user-list-button');
const userListPopup = document.getElementById('user-list-popup');
const closePopupButton = document.getElementById('close-popup-button');
const userList = document.getElementById('user-list');
const searchUserInput = document.getElementById('search-user');
const messageInputSearch = document.getElementById('message-input');


let iframes = [];
let roomByName;

socket.on('getRoomData', (data) => {
    roomListNames = data.users;

    const objEquipe = {

        "id": "122333",
        "name": "Equipe",
        "room": "pontoparse"

    }
    roomListNames.push(objEquipe)


    const names = roomListNames.map(item => item.name);
    const combinations = generateCombinations(names);

    function openIframe(index, user) {

        iframes.forEach((iframe, i) => {
            if (i === index) {
                iframe.classList.add('show', 'active');
            } else {
                iframe.classList.remove('show', 'active');
            }
        });



        if (user === "Equipe") {
            roomByName = contractFromURL
        } else {
            roomByName = combinations.find((x) => x.combination === `${user}_${nameFromURL}`).id || [];
        }

        console.log(roomByName)

        const iframeElement = document.createElement('iframe');
        iframeElement.src = `http://127.0.0.1:5500/chat.html?name=${nameFromURL}&room=${roomByName}`;
        iframeElement.classList.add('your-iframe-class');
        iframeElement.style.width = '430px';
        iframeElement.style.height = '700px';


        const iframeContainer = document.getElementById('iframe');
        iframeContainer.innerHTML = '';
        iframeContainer.appendChild(iframeElement);
    }


    userList.innerHTML = roomListNames.map((user, index) => {
        if (user.name !== nameFromURL.toLowerCase()) {
            return `
            <li class="user-item">
                <span class="user-initials-popup" style="background-color: ${user.color};width: 10px;height: 10px;"></span>
                <span class="user-name" style="cursor:pointer">${user.name}</span>
                <i class="fa-regular fa-comment-dots"></i>
            </li>`;
        }
    }).join('');


    userListPopup.style.display = 'block';

    searchUserInput.addEventListener('input', () => {
        const searchTerm = searchUserInput.value.toLowerCase();
        const filteredUsers = roomListNames.filter(user => user.name.toLowerCase().includes(searchTerm));
        userList.innerHTML = filteredUsers.map(user => {
            if (user.name !== nameFromURL.toLowerCase()) {
                return `
              <li class="user-item">
                <span class="user-initials-popup" style="background-color: ${user.color};width: 10px;height: 10px;"></span>
                <span class="user-name" style="cursor:pointer">${user.name}</span>
                <i class="fa-regular fa-comment-dots"></i>
              </li>`;
            }
        }).join('');
    });


    userList.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('user-name')) {
            const userName = target.textContent;

            // Remova a classe .highlighted-user de todos os nomes de usuário
            const userNames = document.querySelectorAll('.user-name');
            userNames.forEach(name => {
                name.classList.remove('highlighted-user');
            });

            // Adicione a classe .highlighted-user ao nome do usuário clicado
            target.classList.add('highlighted-user');

            const index = Array.from(userList.children).indexOf(target.parentNode);
            openIframe(index, userName);
        }
    });


});





