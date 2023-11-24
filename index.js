const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mysql = require('mysql2');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'mydb'
});

connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conexão bem-sucedida ao banco de dados.');
  }
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const userData = JSON.parse(message);

    const insertQuery = 'INSERT INTO usuarios(nome, telefone, username, idade, senha) VALUES(?,?,?,?,?)';
    const values = [userData.nome, userData.telefone, userData.username, userData.idade, userData.senha];
    connection.query(insertQuery, values, (error, results) => {
      if (error) {
        console.error('Erro ao inserir no banco de dados:', error);
        return;
      }
      const response = {
        greeting: `Olá, ${userData.username}, utilize seu usuário e senha para entrar no sistema.`,
        username: `Seu usuário é ${userData.username}.`,
        password: `Sua senha é ${userData.senha}.`
      };

      // Enviar a resposta para todos os clientes conectados
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(response));
        }
      });
    });
  });
});

server.listen(3000, () => {
  console.log('Servidor WebSocket está ouvindo na porta 3000');
});





