import React, { useEffect, useState } from "react";
import { Router, navigate, Link, useLocation } from "@reach/router";
import socketIOClient from "socket.io-client";
import $ from "jquery";

import s from "./css/s.module.css";
import g from "./css/Generic.module.css";
import panelStyles from "./css/Panel.module.css";
import styles from "./css/App.module.css";

import LobbyPanel from "./LobbyPanel.jsx";
import ContactPage from "./ContactPage.jsx";
import RoomWrapper from "./RoomWrapper.jsx";
import Navbar from "./Navbar.jsx";
import InvitePanel from "./InvitePanel.jsx";
import OptionsPanel from "./OptionsPanel.jsx";
import Alert from "./Alert.jsx";

const roomUtils = require("./utils/roomUtils.js");
const browserUtils = require("./utils/browserUtils.js");
const displayUtils = require("./utils/displayUtils.js");
const gameUtils = require("./utils/gameUtils.js");

const production = true;
const ENDPOINT = production
  ? "https://chatcat-backend-server.herokuapp.com/"
  : "http://127.0.0.1:4002";

export default function App() {
  console.log("((App))");

  const [roomNameInput, setRoomNameInput] = useState(null);
  const [playerData, setPlayerData] = useState({});
  console.log("((So playerData is)))", playerData);
  const [
    successfullyEnteredRoomName,
    setSuccessfullyEnteredRoomName,
  ] = useState(null);
  const [socket, setSocket] = useState(null);
  const [socketNudge, setSocketNudge] = useState();
  const [showInvitePanel, setShowInvitePanel] = useState();
  const [showOptionsPanel, setShowOptionsPanel] = useState();
  const [showAlert, setShowAlert] = useState();
  const [connectErrorAlert, setConnectErrorAlert] = useState();
  const [showDevButtons, setShowDevButtons] = useState(false);

  // const refContainer = useRef(null);

  useEffect(() => {
    let socket = socketIOClient(ENDPOINT);
    // refContainer.current = socket;
    setSocket(socket);

    console.log(`~~App~~ socket.id:${socket.id}`);

    socket.on("connect", (data) => {
      setConnectErrorAlert(null);

      socket.emit("Load player", {
        truePlayerName: browserUtils.getCookie("truePlayerName"),
        playerName: browserUtils.getCookie("playerName"),
      });

      setSocketNudge(true);

      console.log(
        `Ø connect. I am ${socket.id.slice(
          0,
          5
        )} and I connected to server at ${new Date()
          .toUTCString()
          .slice(17, -4)}.`
      );
    });

    socket.on("Player loaded", function (data) {
      setPlayerData(data.player);

      if (data.msg) {
        setShowAlert(data.msg);
      }

      if (!data.player.playerName) {
        socket.emit("Update player data", {
          player: {
            playerName: roomUtils.makeDummyName(socket.id),
          },
        });
      }

      browserUtils.setCookie("playerName", data.player.playerName);
      browserUtils.setCookie("truePlayerName", data.player.truePlayerName);
    });

    socket.on("Entry granted", function (data) {
      console.log("Ø Entry granted");
      setPlayerData(data.player);
      setSuccessfullyEnteredRoomName(data.room.roomName);
      $("#transitionObscurus").removeClass(`${s.fadeOut}`);
      $("#transitionObscurus").addClass(`${s.fadeIn}`);

      setTimeout(() => {
        navigate(`/${data.room.roomName}`);
      }, 100);
    });

    socket.on("Room not created", function (data) {
      navigate("/");
      setShowAlert(data.msg);
    });

    socket.on("Dev queried", function (data) {
      console.log(data);
    });

    socket.on("Entry denied", function (data) {
      setShowAlert(data.msg);
    });

    socket.on("connect_error", function () {
      setConnectErrorAlert(true);
    });

    socket.on("You should refresh", function (data) {
      window.location.reload();
    });

    socket.on("disconnect", (data) => {
      setSuccessfullyEnteredRoomName(null);
      console.log(
        `Ø disconnect. I disconnected from server at ${new Date()
          .toUTCString()
          .slice(17, -4)}.`
      );
      navigate("/");
      setShowAlert("Your connection was reset.");
      setTimeout(() => {
        setShowAlert(null);
      }, 2500);
    });

    return function cleanup() {
      console.log("##App##");
      setSuccessfullyEnteredRoomName(null);
      socket.disconnect();
    };
  }, []);

  console.log(`pre-R ${Object.keys(playerData).length}`, playerData);

  return (
    <div className={`${styles.App}`}>
      <header></header>
      <div id="background" className={styles.background}></div>
      <div id="backgroundShroud" className={`${styles.backgroundShroud}`}></div>
      <div id="transitionObscurus" className={`${g.transitionObscurus}`}></div>

      <Navbar
        socket={socket}
        setShowInvitePanel={setShowInvitePanel}
        showInvitePanel={showInvitePanel}
        setShowOptionsPanel={setShowOptionsPanel}
        showOptionsPanel={showOptionsPanel}
        successfullyEnteredRoomName={successfullyEnteredRoomName}
        showDevButtons={showDevButtons}
        connectErrorAlert={connectErrorAlert}
      />

      {showInvitePanel && (
        <div className={`${g.obscurus} ${s.fadeIn}`}>
          <InvitePanel
            socket={socket}
            playerData={playerData}
            setShowInvitePanel={setShowInvitePanel}
            successfullyEnteredRoomName={successfullyEnteredRoomName}
          />
        </div>
      )}
      {showOptionsPanel && (
        <div className={`${g.obscurus} ${s.fadeIn}`}>
          <OptionsPanel setShowOptionsPanel={setShowOptionsPanel} />
        </div>
      )}
      {showAlert && (
        <div className={`${g.obscurus} ${s.fadeIn}`}>
          <Alert showAlert={showAlert} setShowAlert={setShowAlert} />
        </div>
      )}
      <Router>
        <LobbyPanel
          path="/"
          socket={socket}
          roomNameInput={roomNameInput}
          setRoomNameInput={setRoomNameInput}
          playerData={playerData}
          setShowDevButtons={setShowDevButtons}
        />
        <ContactPage path="/contact" />
        <RoomWrapper
          path="/*"
          socket={socket}
          socketNudge={socketNudge}
          successfullyEnteredRoomName={successfullyEnteredRoomName}
          setSuccessfullyEnteredRoomName={setSuccessfullyEnteredRoomName}
          playerData={playerData}
          setShowAlert={setShowAlert}
          setShowInvitePanel={setShowInvitePanel}
        />
      </Router>
    </div>
  );
}
