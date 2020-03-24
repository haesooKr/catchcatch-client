import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';

import rot13 from '../../lib/rot13';

let socket;

const Play = ({ location }) => {
  const [nick, setNick] = useState('');
  const [color, setColor] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [isHost, setIsHost] = useState(false);

  const ENDPOINT = `http://localhost:4000`;
  

  useEffect(() => {
    const { nick, color, round, timer, language, create, inviteCode } = queryString.parse(rot13(decodeURI(location.search)));

    socket = io(ENDPOINT);

    setNick(nick);
    setColor(color);
    
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
      if(inviteCode != "random"){
        socket.emit('join', { nick, color, code: inviteCode}) 
      } else {
        console.log('enter random room')
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

  return (
    <div>
      { isHost ? (`InviteCode ${inviteCode}`) : null }
      {users.map((user, i) => <div key={i}>{user.nick}</div>)}
      {messages.map((message, i) => <div key={i}>{message.user}: {message.text}</div>)}
    </div>
  )
}

export default Play;