//const socket = io('https://pontoparse.herokuapp.com/');
const socket = io('http://localhost:3333');

let roomListNamesSocket = [];

const urlSearchParams = new URLSearchParams(window.location.search);


const roomFromURL = urlSearchParams.get('room').toLowerCase();
const nameFromURL = urlSearchParams.get('name').toLowerCase();

const contractFromURL = urlSearchParams.get('contract').toLowerCase();

socket.emit('join room', { room: contractFromURL, name: nameFromURL, color: getRandomColor() });

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
let roomListNames = [];

const objEquipe = {

    "id": "122333",
    "name": "Equipe",
    "room": contractFromURL

}

socket.on('getRoomData', (data) => {
    roomListNames = data.users;


    roomListNames.push(objEquipe)


    const names = roomListNames.map(item => item.name);
    const combinations = generateCombinations(names);
    const idx = localStorage.getItem('last-room-index') || 0
    const team = localStorage.getItem('last-room-userName') || 'Equipe';

    setTimeout(() => {
        openIframe(idx, team);

    }, 1000)

    function openIframe(index, user) {
        iframes.forEach((iframe, i) => {
            if (i === index) {
                iframe.classList.add('show', 'active');
            } else {
                iframe.classList.remove('show', 'active');
            }
        });

        if (user === "Equipe") {
            roomByName = contractFromURL;
        } else {
            roomByName = combinations.find((x) => x.combination === `${user}_${nameFromURL}`)?.id || contractFromURL;
        }

        const iframeElement = document.createElement('iframe');
        //iframeElement.src = `https://wilkor.github.io/chat-parse-blip/chat.html?`;
        iframeElement.src = `/chat.html?`;
        iframeElement.classList.add('your-iframe-class');
        iframeElement.style.width = '100%';
        iframeElement.style.height = '700px';

        const iframeContainer = document.getElementById('iframe');
        iframeContainer.innerHTML = '';
        iframeContainer.appendChild(iframeElement);

        localStorage.setItem('info-client-chat', JSON.stringify({ name: nameFromURL, room: roomByName }))


        iframeElement.addEventListener('load', () => {
            iframeElement.contentWindow.postMessage({ name: nameFromURL, room: roomByName });
        });
    }



    userList.innerHTML = roomListNames.map((user, index) => {
        if (user.name !== nameFromURL.toLowerCase()) {
            return `
            <li class="user-item">
            <i class="fa-regular fa-comment-dots"></i>
                <span class="user-initials"></span>
                <span class="user-name" style="cursor:pointer" title="${user.name}">${user.name}</span>
                
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
              <i class="fa-regular fa-comment-dots"></i>
                <span class="user-initials" ></span>
                <span class="user-name" style="cursor:pointer" title="${user.name}">${user.name}</span>
                
              </li>`;
            }
        }).join('');
    });


    userList.addEventListener('click', (event) => {

        const target = event.target;

        if (target) {
            event.preventDefault();
            if (target.classList.contains('user-name')) {
                const userName = target.textContent;


                const userNames = document.querySelectorAll('.user-name');
                userNames.forEach(name => {
                    name.classList.remove('highlighted-user');
                });


                target.classList.add('highlighted-user');
                document.getElementById('open-sidebar').click()
                const index = Array.from(userList.children).indexOf(target.parentNode);
                localStorage.setItem('last-room-index', index)
                localStorage.setItem('last-room-userName', userName)
                openIframe(index, userName);
            }
        }


    });

});

function getRandomColor() {
    const colors = ['#9a53ff', "#d50000", "#4dcb7b"];
    return colors[Math.floor(Math.random() * colors.length)];
}
