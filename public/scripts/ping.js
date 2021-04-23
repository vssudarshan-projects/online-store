$(document).ready(()=>{
var ping = setInterval(function () {
  callAjax("/ping", "POST")
    .done((res) => {
      if (res === "406") {
        clearInterval(ping);
      }
    })
    .fail(() => {
      clearInterval(ping);
    });
}, 10*60*1000);

//Ajax function to send data
function callAjax(url, method) {
  return $.ajax({
    url: url,
    method: method,
    responseContent: "text",
  });
}
});
