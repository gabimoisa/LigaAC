
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
      background-image: url('data:image/png;base64,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');
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