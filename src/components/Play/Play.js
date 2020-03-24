import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';

import rot13 from '../../lib/rot13';

let socket;

const Play = ({ location }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  // const [turn, setTurn] = useState('');

  const ENDPOINT = `http://localhost:4000`;
  

  useEffect(() => {
    const { nick, color, round, timer, language, create, inviteCode } = queryString.parse(rot13(decodeURI(location.search)));

    socket = io(ENDPOINT);
    
    if(create === "true"){
      setIsHost(true);
      socket.emit('create', { nick, color, round, timer, language }, ( {error, code} ) => {
        if(error){
          alert(error);
          window.history.go(-1);
        }
        if(code){
          setInviteCode(code);
        }
      });
    } else {
      if(inviteCode !== "random"){
        socket.emit('join', { nick, color, code: inviteCode}) 
      } else {
        socket.emit('join', { nick, color, code: 'random'}, () => {
          alert('랜덤입장은 아직 준비중입니다. 초대받은 주소로 접속 후 플레이를 눌러주세요')
          window.history.go(-1);
        });
      }
    }
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on('message', ( message ) => {
      setMessages([...messages, message])
    })

    socket.on('online', (update) => {
      console.log(update);
      setUsers(update);
    })

    return () => {
      socket.emit('disconnect');

      socket.off();
    }
  }, [messages, users])

  const sendMessage = ( event ) => {
    event.preventDefault();
    socket.emit('sendMessage', message, () => setMessage(''));
  }

  const startGame = () => {
    socket.emit('start');
  }

  return (
    <div>
      { isHost ? (`InviteCode ${inviteCode}`) : null }
      {users.map((user, i) => <div key={i}>{user.nick}, {user.color}</div>)}
      {messages.map((message, i) => <div key={i}>{message.user}: {message.text}</div>)}
      <input value={message} onChange={(event) => setMessage(event.target.value)} onKeyPress={(event) => (event.key === "Enter") ? sendMessage(event) : null}></input>
      { isHost ? <button onClick={startGame}>Start</button> : null }
    </div>
  )
}

export default Play;