$(document).ready(function () {
  function logInCallback(authResult) {
    if (authResult["code"]) {
      $.ajax({
        type: "POST",
        url: "http://" + document.location.host + "/auth",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
        contentType: "application/octet-stream; charset=utf-8",
        processData: false,
        data: authResult["code"],
        success: function ({ data }) {
          console.log("log in successfully");
          u = data;
          localStorage.setItem("user", JSON.stringify(data));
          var redirect = getParameterByName("redirect");
          if (!redirect) {
            window.location.replace(
              "http://" + document.location.host + "/add_meeting.html"
            );
          } else {
            window.location.replace(
              `http://${document.location.host}/${redirect}`
            );
          }
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
    } else {
      alert("Error occurred, please comeback later");
    }
  }

  $("#logInBtn").click(function () {
    auth2.grantOfflineAccess().then(logInCallback);
  });

  const aboutUsButton = document.getElementById("introBtn");
  const logInButton = document.getElementById("toggleLogInBtn");
  const container = document.getElementById("container");

  aboutUsButton.addEventListener("click", () => {
    container.classList.add("right-panel-active");
  });

  logInButton.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
  });
});
