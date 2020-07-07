let id_room = getParameterByName("id_room");
if (!id_room) {
  window.location.replace(`http://${window.location.host}`);
  throw "";
}

if (u == undefined || u == null) {
  var url = `http://${document.location.host}/login.html?redirect=join_meeting.html?id_room=${id_room}`;
  window.location.href = encodeURI(url);
  throw "";
}

$(document).ready(function () {
  $.ajax({
    type: "get",
    url: `http://${document.location.host}/conferences/${id_room}?token=${u.access_token}`,
    contentType: "application/json",
    success: function ({ data }) {
      if (!data.is_active) {
        alert("The conference has ended!");
        window.location.replace(`http://${window.location.host}`);
        return;
      }
      document.getElementById("con_topic").innerHTML = data.topic;
      document.getElementById("con_desc").innerHTML = data.description;
      document.getElementById("con_status").innerHTML =
        "The conference is ready";
      if (data.have_password) {
        document.getElementById("password").style.display = "block";
      }
    },
    error: function (er) {
      console.log(er);
      throw "";
    },
  });

  var video = document.querySelector("#video_element");
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch(function (err) {
        console.log(err);
        throw "";
      });
  }
  $("#submit-join").on("click", function () {
    let password = $("#password").val();
    $.ajax({
      type: "post",
      url: `http://${document.location.host}/conferences/join/${id_room}?token=${u.access_token}`,
      contentType: "application/json",
      data: JSON.stringify({ password: password }),
      success: function ({ data }) {
        var url = `http://${window.location.host}/conference.html?id_room=${id_room}`;
        window.location.replace(encodeURI(url));
      },
      error: function (resp) {
        var err;
        if (!resp.responseJSON) {
          err = resp.statusText;
        } else {
          err = resp.responseJSON.error.error;
        }
        $("#errTxt").html(err);
      },
    });
  });
});
