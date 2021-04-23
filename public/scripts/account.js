$(document).ready(()=>{

  let cookies = document.cookie.split(";");

  for (cookie of cookies) {
    let cookiePair = cookie.split("=");
    if (cookiePair[0] === "addr" && cookiePair[1] === "true") {
      alert("Address was added.")
      document.cookie = "addr=" + ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
      break;
    }
  }


  var pinCodes;
  if($('#inputZip').val().length === 0)
$('#inputZip').prop('disabled',true);

  $("#inputState").on("change", function () {
    let code = $(this).val();
$('#inputZip').prop('disabled',true);
    if (code) {
      $.ajax({
        url: "/states",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ code: code }),
      })
        .done((pins) => {
          if (pins !== "404"){
            pinCodes = pins;
            $('#inputZip').prop('disabled',false);
          }
        })
        .fail((err) => {
          console.log(err);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });


$('#inputZip').on('input', function(){

let pinStart = $(this).val().split('').splice(0,2);
pinStart = Number(pinStart.join(''));

document.getElementById('inputZip').setCustomValidity($(this).val().length === 6 && pinStart >= pinCodes.sPin && pinStart <= pinCodes.ePin ? "" : "Please check pincode");

});


});
