$(document).ready(function () {
  if (u == undefined || u == null) {
    window.location.href = "signin.html";
  }
  let endpoint = "dfd41b5aa6fe.ngrok.io";
  let url = "file:///C:/Users/KhaiCQ/Desktop/websdk/"
  $("#submit-save").on('click', function(){
    let name = $("#name").val();
    let password = $("#password").val();
    let description = $("#description").val();
    $.ajax({
      type: "post",
      url:`https://${endpoint}/conferences?token=${u.access_token}`,
      contentType: "application/json",
      data: JSON.stringify({topic:name, description: description, password:password}),
      success: function({data}){
        location.replace(url+"/joinMeeting.html?id_room="+data.id)
      },
      error:function(er){
        console.log(er);
      }
    })
  })  
});
