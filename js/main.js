let u = null;
function getUserLocalData() {
  let retrievedData = localStorage.getItem("user");
  if (retrievedData != undefined && retrievedData != null) {
    console.log("wtf");
    u = JSON.parse(retrievedData);
  }
}
getUserLocalData();

$(document).ajaxStart(function () {
  return NProgress.start();
});

$(document).ajaxStop(function () {
  return NProgress.done();
});

function start() {
  gapi.load("auth2", function () {
    auth2 = gapi.auth2.init({
      client_id:
        "44490805046-2t5kjoq5s5jqh6isvm958321fqkspc1j.apps.googleusercontent.com",
    });
  });
}

function logOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log("User signed out.");
    u = null;
    localStorage.removeItem("user");
    window.location.replace("http://" + document.location.host + "/login.html");
  });
}
