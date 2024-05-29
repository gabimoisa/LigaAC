
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideUp {
      from {
        transform: translateY(10px);
        opacity: 0;
      }
      to {
        transform: translateY(0px);
        opacity: 1;
      }
    }

    .popup-fullpage {
      position: fixed;
      z-index: 9999999;
      bottom: 0;
      background-color: black;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      left: 50%;
      transform: translateX(-50%);
      animation: fadeIn 1s forwards;
    }

    .popup-header {
      min-height: auto;
      display: flex;
      flex-direction: row;
      padding-bottom: 10px;
      border-bottom: 1px solid gray;
    }

    .content-popup {
      width: 550px;
      height: 230px;
      padding: 20px;
      background-color: black;
    }


    .header-logo {
      background-image: url('https://i.imgur.com/5C0PVt9.png');
      position: relative;
      margin-top: 0;
      background-size: contain;
      background-repeat: no-repeat;
      display: block;
      width: 117px;
      height: 53px;
    }

    .popup-messsage {
      padding-top: 20px;
      animation: slideUp 1s forwards;
    }

    .scan-message {
      font-size: 14px;
      color: white;
      display: flex;
      flex-direction: column;
    }

    .scan-message p {
      margin: 0;
    }

    .popup-input {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }

    .button-check {
      background-color: #2672fb;
      color: #ffffff;
      border: 1px solid #2672fb;
      padding: 4px 5px 3px 5px;
      display: block;
      border-radius: 4px;
      animation: slideUp 1s forwards;
    }
`;
document.head.appendChild(style);

const processInput = (input) => {
  try {
    input.addEventListener('change', function(event) {
      const lastDismissedTime = localStorage.getItem('popupDismissedTime');
      const now = new Date().getTime();
      const seventyTwoHours = 72 * 60 * 60 * 1000;

      if (lastDismissedTime && (now - lastDismissedTime) < seventyTwoHours) {
        return;
      }

      const wrapperDiv = document.createElement("div");
      wrapperDiv.classList.add("popup-fullpage");

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("content-popup");
      wrapperDiv.appendChild(contentDiv);

      const headerPopup = document.createElement("div");
      headerPopup.classList.add("popup-header");
      contentDiv.appendChild(headerPopup);

      const headerLogo = document.createElement("div");
      headerLogo.classList.add("header-logo");
      headerPopup.appendChild(headerLogo);

      const messagePopup = document.createElement("div");
      messagePopup.classList.add("popup-messsage");
      contentDiv.appendChild(messagePopup);

      const scanMessage = document.createElement("div");
      scanMessage.classList.add("scan-message");
      const paragraph1 = document.createElement("p");
      paragraph1.textContent = "Please wait until the file is scanned for sensitive info.";
      scanMessage.appendChild(paragraph1);
      const paragraph2 = document.createElement("p");
      paragraph2.textContent = "If no information appears, activate the \"Scan uploading files\" setting from the extension's settings page.";
      scanMessage.appendChild(paragraph2);
      messagePopup.appendChild(scanMessage);

      const inputPopup = document.createElement("div");
      inputPopup.classList.add("popup-input");
      contentDiv.appendChild(inputPopup);

      const buttonCheck = document.createElement('button');
      buttonCheck.classList.add("button-check");
      buttonCheck.textContent = 'I understand and wish to proceed';
      inputPopup.appendChild(buttonCheck);

      buttonCheck.addEventListener('click', function() {
        document.body.removeChild(wrapperDiv);
        localStorage.setItem('popupDismissedTime', now.toString());
    });

        const child = document.body.firstChild;
        document.body.insertBefore(wrapperDiv, child);
         });
    } catch (error) {
        console.error('Error processing file inputs normal:', error);
    }
}

// error if iframe does not meet same origin policy
document.querySelectorAll('iframe').forEach(frame => {
  try {
      const frameDocument = frame.contentDocument || frame.contentWindow.document;
      frameDocument.querySelectorAll('input[type="file"]').forEach(input => {
          processInput(input);
      });
  } catch (error) {
      console.error('Error processing file inputs in frame:', error);
  }
});

document.querySelectorAll('input[type="file"]').forEach(input => {
  processInput(input);
});