$(document).ready(function () {
  if (u == undefined || u == null) {
    window.location.href = "signin.html";
  }
  let endpoint = "dfd41b5aa6fe.ngrok.io";
  //let url = "file:///C:/Users/KhaiCQ/Desktop/websdk/";
  var id_topic = location.search.split('?id_room=')[1];
  $("#topic").html(id_topic); 

  var video = document.querySelector("#video_element");
  //navigator.getUserMedia = navigator.getUserMedia|| navigator.webkitGetUsermedia||navigator.mozGetUserMedia||navigator.msGetUserMedia||navigator.oGetUserMedia;
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch(function (err0r) {});
  }
  $("#submit-join").on('click', function(){
    let password = $("#password").val();
    $.ajax({
      type: "post",
      url:`https://${endpoint}/conferences/join?token=${u.access_token}`,
      contentType: "application/json",
      data: JSON.stringify({ password:password }),
      success: function(data){
        if(data.code == 200){
          //seccess 
        }
        else{
          $("#password_res").html("Incorrect password");
        }
      },
      error:function(er){
        console.log(er);
      }
    })
  })
  
  
});

