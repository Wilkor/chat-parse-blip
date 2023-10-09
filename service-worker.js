self.addEventListener('install', function(event) {
  // Executado na instalação do Service Worker
  event.waitUntil(
    caches.open('my-cache').then(function(cache) {
      return cache.addAll([
        '/',
      ]);
    })
  );
});


self.addEventListener('message', function(event) {
  if (event.data === 'reconnect') {

    const socket = io('https://pontoparse.herokuapp.com/');

    socket.addEventListener('open', function(event) {
      console.log('open', event);
    });

    socket.addEventListener('message', function(event) {
     console.log("event - message", event )
    });

    socket.addEventListener('close', function(event) {
      console.log('Conexão com o servidor WebSocket fechada. Tentando reconectar...');
      // Tentativa de reconexão após 5 segundos
      setTimeout(() => {
        self.clients.matchAll().then(clients => {
          clients.forEach(client => client.postMessage('reconnect'));
        });
      }, 5000);
    });


  }
});
