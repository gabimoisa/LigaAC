export const generateSTYLES = () => {
   return`<style>   
  @import url(https://fonts.googleapis.com/css?family=Roboto:500);
  body {
    background: #ffffff;
    color: #000a12;
    font-family: "Roboto", sans-serif;
    margin: 0;
    padding: 0;
  }
  .header {
    background-color:  #111f42;
    min-height: 119px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 35px;
  }
  .header .logo img {
    display: block;
    width: 170px;
    height: 110px;
    margin-top: -5px;
  }
  .c {
    text-align: center;
    display: block;
    position: relative;
    width: 80%;
    margin: 100px auto;
  }
  ._1 {
    font-size: 36px;
    position: relative;
    display: inline-block;
    z-index: 2;
    height: 100px;
    letter-spacing: 2px;
    margin-top: 50px;
  }
  ._2 {
    text-align: center;
    display: block;
    position: relative;
    font-size: 20px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .button {
   border: none;
   color: #ffffff;
   padding: 16px 32px;
   text-align: center;
   text-decoration: none;
   display: inline-block;
   font-size: 16px;
   margin: 4px 2px;
   transition-duration: 0.4s;
   cursor: pointer;
  }
  .button1{
    background-color: #007bff;
    color: #ffffff;
    border: 2px solid #007bff;
  }
  .button1:hover {
  background-color: #0069d9;
  color: #ffffff;
}
   </style>`;
};

export const generateHTML=()=>{
   return`
  <div class='header'>
  <div class='logo'>
  <img src="https://lh3.googleusercontent.com/kgmeZcO0chRzB9sQ_CL4613e_C3OkwalErXoQEZngmpoflY7DUa7cKJXWSnZdbzUyG4pUd_C9auq5DJazmcbhWp91c8" alt='OPSWAT Logo'>
  </div>
  </div>
  <div class='c'>
    <div class='_1'>Access Denied!</div>
    <br>
    <button class='_3' onclick="window.location.href='https://www.google.com'">GO BACK</button>    
  </div>
   `;
};