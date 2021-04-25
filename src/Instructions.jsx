import genStyles from "./css/Generic.module.css";
import styles from "./css/PlayerList.module.css";
import React, { useEffect, useState } from "react";
import { navigate, useLocation } from "@reach/router";

export default function Instructions(props) {
  return (
    <div className={`${genStyles.minipanel1} ${genStyles.overflowHidden} `}>
      <h2>Instructions</h2>
      <div
        className={`${styles.innerBox} ${genStyles.overflowScroll} ${genStyles.paddedBox1}`}
      >
        <p>
          This is chat app where you can converse with your friends.
          <br />
          <br /> You simply enter your text in the box below and send.
          <br /> <br /> Then your friends will see and hopefully read it.
          <br /> <br /> This is accomplished with SocketIO 4.
        </p>
      </div>
    </div>
  );
}
