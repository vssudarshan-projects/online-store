$(document).ready(()=>{

  let cookies = document.cookie.split(";");

  for (cookie of cookies) {
    let cookiePair = cookie.split("=");
    if (cookiePair[0] === "login" && cookiePair[1] === "false") {
      let options = {
        content: "Username and Password do not match.",
        trigger: "hover",
      };
      $(".form-login").popover(options);
      document.cookie = "login=" + ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
      break;
    }
  }


  $(".form-signup").on("input", (event) => {
//native JS method
    document
      .querySelector("#cpwd")
      .setCustomValidity(
        document.querySelector("#ipwd").value !=
          document.querySelector("#cpwd").value
          ? "Passwords do not match."
          : ""
      );
  });



});
