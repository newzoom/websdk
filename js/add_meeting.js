if (u == undefined || u == null) {
  window.location.href = "http://" + document.location.host + "/login.html";
  throw "";
}

$(document).ready(function () {
  $("#submit-save").on("click", function () {
    let name = $("#name").val();
    let password = $("#password").val();
    let description = $("#description").val();
    $.ajax({
      type: "post",
      url: `http://${location.host}/conferences?token=${u.access_token}`,
      contentType: "application/json",
      data: JSON.stringify({
        topic: name,
        description: description,
        password: password,
      }),
      success: function ({ data }) {
        location.replace(
          `http://${location.host}/join_meeting.html?id_room=${data.id}`
        );
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
