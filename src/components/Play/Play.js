import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";

import rot13 from "../../lib/rot13";
import Paint from "./Paint/Paint";

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
  const [privateChat, setPrivateChat] = useState(false);
  const [points, setPoints] = useState([]);
  const [int, setInt] = useState(() => {})
  const [paintData, setPaintData] = useState(null);
  const [paintedData, setPaintedData] = useState(null);

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
    const countDownStart = ( start ) => { 
      const interval = setInterval(function(){
        const delta = Date.now() - start;
        
        setTimer(timer - Math.floor(delta / 1000))
  
        if(timer - Math.floor(delta / 1000) <= 0){
          clearInterval(interval);
        }
      }, 1000);
  
      return interval;
    }

    socket.on("message", (message) => {
      if(message.private){
        if(privateChat){
          setMessages([...messages, message]);
        }
      } else {
        setMessages([...messages, message]);
      }
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
      setAnswer(word);
      
      setInt(countDownStart(time));
    });

    socket.on("next", ({ timer, turn, points, words }) => {
      clearInterval(int);
      setInt(() => {});
      //reset timer

      (socket.id === turn) ? setTurn(true) : setTurn(false);
      (socket.id === turn) ? setWords(words) : setWords([]);
      setAnswer("");
      setPrivateChat(false);
      setTimer(timer);
      setPoints(points);
    }) 

    socket.on('backData', (data) => {
      console.log('backData')
      setPaintedData(data);
    })

    return () => {
      socket.emit("disconnect");

      socket.off();
    };
  }, [messages, users, timer, privateChat, answer, int]);


  useEffect(() => {
    if(answer !== ""){
      document.querySelectorAll(".word").forEach(word => word.style.display = "none");
    } else {
      document.querySelectorAll(".word").forEach(word => word.style.display = "inline-block");
    }
  }, [answer]);

  useEffect(() => {
    const sendData = () => {
      console.log('send data')
      if(paintData !== null){
        console.log(paintData);
        const img = paintData;
        const binary = new Uint8Array(img.data.length);
        for(let i=0; i<img.data.length; i++){
          binary[i] = img.data[i];
        }
        socket.emit('sendData', binary.buffer);
      }
    }

    sendData();
  }, [paintData])

  const chooseWord = word => {
    socket.emit("drawing", word);
  };

  const sendMessage = event => {
    event.preventDefault();
    if(message === answer && !turn && !privateChat){ 
      socket.emit('correct', () => {
        setPrivateChat(true) // bug fixed #2020032606
        setMessage("");
      }) 
    } else if(message !== answer && !turn && !privateChat){
      socket.emit("sendMessage", message, () => setMessage(""));
    }
    else {
      socket.emit("privateMessage", message, () => setMessage(""));
    }
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
              className="word"
              value={word}
              onClick={event => chooseWord(event.target.value)}
            >
              {word}
            </button>
          ))
        : null}
        <Paint turn={turn} paintedData={paintedData} setPaintData={setPaintData}></Paint>;
    </div>
  );
};

export default Play;
