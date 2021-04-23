$(document).ready(() => {

  $('.addr-wrapper').attr('display', 'flex');
  $('.prod-wrapper').attr('display', 'flex');


$('.logout').on('pointerdown', function(){
  $.ajax({
    url: "/logout",
    method: "POST",
  }).done((data)=>{
    location.reload(true);
  }).fail((err) => {
      console.log(err);
    })
    .catch((err) => {
      console.log(err);
    });
});

});
