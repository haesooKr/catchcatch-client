import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";

import rot13 from "../../lib/rot13";

let socket;

const Play = ({ location }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [inviteCode, setInviteCode] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [turn, setTurn] = useState(false);
  const [timer, setTimer] = useState(0);
  const [round, setRound] = useState(0);
  const [answer, setAnswer] = useState("");
  const [words, setWords] = useState([]);

  const ENDPOINT = `http://localhost:4000`;

  useEffect(() => {
    const {
      nick,
      color,
      round,
      timer,
      language,
      create,
      inviteCode
    } = queryString.parse(rot13(decodeURI(location.search)));

    socket = io(ENDPOINT);

    if (create === "true") {
      setIsHost(true);
      socket.emit(
        "create",
        { nick, color, round, timer, language },
        ({ error, code }) => {
          if (error) {
            alert(error);
            window.history.go(-1);
          }
          if (code) {
            setInviteCode(code);
          }
        }
      );
    } else {
      if (inviteCode !== "random") {
        socket.emit("join", { nick, color, code: inviteCode });
      } else {
        socket.emit("join", { nick, color, code: "random" }, () => {
          alert(
            "랜덤입장은 아직 준비중입니다. 초대받은 주소로 접속 후 플레이를 눌러주세요"
          );
          window.history.go(-1);
        });
      }
    }
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on("message", message => {
      setMessages([...messages, message]);
    });

    socket.on("online", update => {
      setUsers(update);
    });

    socket.on("start", ({ round, timer, turn, words }) => {
      setRound(round);
      setTimer(timer);

      if (turn === socket.id) {
        setTurn(true);
        setWords(words);
      }
    });

    socket.on("drawing2", ({ time, word }) => {
      console.log("드로잉 전달받음", word);

      console.log("타이머 시작");
      const start = time;
      const countDown = setInterval(function() {
        const delta = Date.now() - start;
        setTimer(timer - Math.floor(delta / 1000));
        if (timer - Math.floor(delta / 1000) <= 0) {
          clearInterval(countDown);
        }
      }, 1000);
    });

    return () => {
      socket.emit("disconnect");

      socket.off();
    };
  }, [messages, users]);

  useEffect(() => {
    
  }, [turn, words]);

  const chooseWord = word => {
    socket.emit("drawing", word);
  };

  const sendMessage = event => {
    event.preventDefault();
    socket.emit("sendMessage", message, () => setMessage(""));
  };

  const startGame = () => {
    socket.emit("start");
    const button = document.querySelector(".startButton");
    button.parentNode.removeChild(button);
  };

  return (
    <div>
      {turn ? <h1>My turn</h1> : <h1>Guess the word</h1>}
      {isHost ? `InviteCode ${inviteCode}` : null}
      {users.map((user, i) => (
        <div key={i}>
          {user.nick}, {user.color}
        </div>
      ))}
      {messages.map((message, i) => (
        <div key={i}>
          {message.user}: {message.text}
        </div>
      ))}
      <input
        value={message}
        onChange={event => setMessage(event.target.value)}
        onKeyPress={event =>
          event.key === "Enter" ? sendMessage(event) : null
        }
      ></input>
      {isHost ? (
        <button className="startButton" onClick={startGame}>
          Start
        </button>
      ) : null}
      {round && timer ? (
        <div>
          Round: {round} Timer: {timer}
        </div>
      ) : null}
      {words
        ? words.map((word, i) => (
            <button
              key={i}
              value={word}
              onClick={event => chooseWord(event.target.value)}
            >
              {word}
            </button>
          ))
        : null}
    </div>
  );
};

export default Play;
