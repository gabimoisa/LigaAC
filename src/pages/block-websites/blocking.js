import React, { useEffect } from 'react';
import './BlockWebsites-page.js';

const Blocker =  () => {
useEffect(() => {
function generateSTYLES() {
  return `<style>@import url(https://fonts.googleapis.com/css?family=Roboto:500);
    body {
      background:#ffffff;
      color: #000a12;
      font-family: "Roboto", sans-serif;
      max-height: 700px;
      overflow: hidden;
    }
    .c {
      text-align: center;
      display: block;
      position: relative;
      width: 80%;
      margin: 100px auto;
    }
    ._1 {
      font-size: 100px;
      position: relative;
      display: inline-block;
      z-index: 2;
      height: 100px;
      letter-spacing: 15px;
    }
    ._2 {
      text-align: center;
      display: block;
      position: relative;
      letter-spacing: 12px;
      font-size: 4em;
      line-height: 80%;
    }
    ._3 {
      text-align: center;
      display: block;
      position: relative;
      font-size: 20px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
  }
     </style>`;
}
  
const generateHTML = (blockedWebsites) => {
    return `
    <div class='c'>
        <div class='_1'>Acces denied!</div>
        <br>
        <div class='_2'>For>${blockedWebsites}</div>
        <br>
        <button class='_3' onclick="window.location.href='https://www.google.com'">GO BACK</button>    
        </div>
     `;
  };

  function blockWebsites() {
    chrome.storage.local.get(['blockedWebsites'], function(result) {
      const blockedSites = result.blockedWebsites || [];
      const currentUrl = window.location.href;

      blockedSites.forEach(site => {
        if (currentUrl.includes(site)) {
          document.head.innerHTML = generateSTYLES();
          document.body.innerHTML = generateHTML(site);
        }
      });
    });
  }
  
  blockWebsites();
  },[]);
  };

  export default Blocker;
