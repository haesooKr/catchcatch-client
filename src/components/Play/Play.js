import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";

import rot13 from "../../lib/rot13";
import Paint from "./Paint/Paint";
import ScrollToBottom from 'react-scroll-to-bottom';

import "./Play.scss";

let socket;

const Play = ({ location }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [inviteCode, setInviteCode] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [turn, setTurn] = useState(false);
  const [timer, setTimer] = useState(0);
  const [round, setRound] = useState(-1);
  const [answer, setAnswer] = useState("");
  const [words, setWords] = useState([]);
  const [privateChat, setPrivateChat] = useState(false);
  const [points, setPoints] = useState([]);
  const [int, setInt] = useState(() => {});
  const [paintData, setPaintData] = useState(null);
  const [paintedData, setPaintedData] = useState(null);
  const [canPaint, setCanPaint] = useState(false);

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
        socket.emit("join", { nick, color, code: inviteCode }, error => {
          if (error) {
            alert(error);
          } else {
            alert(
              "현재 게임이 진행중입니다. 다른 방에 입장하거나 기다려주십시오."
            );
          }
          window.history.go(-1);
        });
      } else {
        socket.emit("join", { nick, color, code: "random" }, error => {
          if (error) {
            alert(error);
          } else {
            alert(
              "랜덤입장은 아직 준비중입니다. 초대받은 주소로 접속 후 플레이를 눌러주세요"
            );
          }
          window.history.go(-1);
        });
      }
    }
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    const countDownStart = start => {
      const interval = setInterval(function() {
        const delta = Date.now() - start;

        setTimer(timer - Math.floor(delta / 1000));

        if (timer - Math.floor(delta / 1000) <= 0) {
          if (turn) {
            socket.emit("timeOver");
            setCanPaint(false);
          }
          clearInterval(interval);
        }
      }, 1000);

      return interval;
    };

    socket.on("message", message => {
      if (message.private) {
        if (privateChat) {
          setMessages([...messages, message]);
        }
      } else {
        setMessages([...messages, message]);
      }
    });

    socket.on("online", (update, reset) => {
      setUsers(update);
      if (reset && update && isHost === false) {
        resetRoom(update[0].id);
        socket.emit("turnReset");
      }
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
      setPaintedData(null);
      setAnswer(word);
      setInt(countDownStart(time));

      if (turn) {
        setCanPaint(true);
      } else {
        setCanPaint(false);
      }
    });

    socket.on("next", ({ timer, turn, points, words, roundTurn }) => {
      if (roundTurn) {
        setRound(round - 1);
      }
      clearInterval(int);
      setInt(() => {});
      //reset timer

      socket.id === turn ? setTurn(true) : setTurn(false);
      socket.id === turn ? setWords(words) : setWords([]);
      setAnswer("");
      setPrivateChat(false);
      setTimer(timer);
      setPoints(points);
    });

    socket.on("backData", data => {
      setPaintedData(data);
    });

    return () => {
      socket.emit("disconnect");

      socket.off();
    };
  }, [messages, users, timer, privateChat, answer, int, turn, round]);

  useEffect(() => {
    if (answer !== "") {
      document
        .querySelectorAll(".word")
        .forEach(word => (word.style.display = "none"));
    } else {
      document
        .querySelectorAll(".word")
        .forEach(word => (word.style.display = "inline-block"));
    }
  }, [answer]);

  useEffect(() => {
    console.log("Game Ends");
  }, [round]);

  useEffect(() => {
    const sendData = () => {
      if (paintData !== null) {
        const img = paintData;
        const binary = new Uint8Array(img.data.length);
        for (let i = 0; i < img.data.length; i++) {
          binary[i] = img.data[i];
        }
        socket.emit("sendData", binary.buffer);
      }
    };

    sendData();
  }, [paintData]);

  const chooseWord = word => {
    socket.emit("drawing", word);
  };

  const sendMessage = event => {
    event.preventDefault();
    if (message === answer && !turn && !privateChat) {
      socket.emit("correct", () => {
        setPrivateChat(true); // bug fixed #2020032606
        setMessage("");
      });
    } else if (message !== answer && !turn && !privateChat) {
      socket.emit("sendMessage", message, () => setMessage(""));
    } else {
      socket.emit("privateMessage", message, () => setMessage(""));
    }
  };

  const startGame = () => {
    socket.emit("start");
    const button = document.querySelector(".startButton");
    button.parentNode.removeChild(button);
  };

  const resetRoom = id => {
    setRound(-1);
    setTimer(0);
    setAnswer("");
    setTurn(false);
    setIsHost(true);
    setWords([]);
    setPrivateChat(false);
    setPoints([]);
    setCanPaint(false);
    setInviteCode("http://localhost:3000/join?code=" + rot13(id));
  };

  return (
    <div className="playContainer">
      {turn ? <h1>My turn</h1> : <h1>Guess the word</h1>}
      {isHost ? `InviteCode ${inviteCode}` : null}
      {users.map((user, i) => (
        <div key={i}>
          {user.nick}, {user.color}, {points[i]}
        </div>
      ))}
      <ScrollToBottom className="messages">
        {messages.map((message, i) => (
          <div key={i}>
            {message.user}: {message.text}
          </div>
        ))}
      </ScrollToBottom>
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
      <Paint
        canPaint={canPaint}
        paintedData={paintedData}
        setPaintData={setPaintData}
      ></Paint>
    </div>
  );
};

export default Play;
