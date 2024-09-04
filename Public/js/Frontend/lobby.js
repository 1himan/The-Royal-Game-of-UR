var audioPlayer = document.getElementById("audioPlayer");
var playButton = document.getElementById("playButton");
var userPaused = false; // Flag to check if user paused the audio

function playAudio() {
  if (!userPaused) {
    audioPlayer.play();
  }
}

document.addEventListener("mousemove", playAudio);

playButton.addEventListener("click", function () {
  if (audioPlayer.paused) {
    audioPlayer.play();
    playButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
    userPaused = false;
  } else {
    audioPlayer.pause();
    playButton.innerHTML = '<i class="fa-solid fa-play"></i>';
    userPaused = true;
  }
});

function validateForm() {
  var x = document.forms["roomForm"]["joinRoomName"].value;
  if (x.length < 6 || x.length > 6) {
    // alert("Room name must be exactly 6 digits");
    // return false;
    Swal.fire({
      title: "Incorrect Room Code",
      customClass: {
        popup: "my-popup",
        icon: "my-icon",
        confirmButton: "my-confirm-button",
      },
      text: `Please Enter a valid Room Code`,
      icon: "warning",
      confirmButtonText: "OK",
      width: 600,
      padding: "2em",
    });
    return false;
  }
  //and if the if block wasn't executed at all, that means user has entered the right data
  //we are not returning any true value how does onsubmit will process that?
  //
  //
  // If the if block inside validateForm() isn’t executed,
  // that means the user has entered a valid room code. In this case, the function doesn’t explicitly
  // return anything. In JavaScript, if a function doesn’t have a return statement, it returns undefined
  // by default. However, for the onsubmit event handler, any return value that is not explicitly false
  // is treated as true. So, if the validateForm() function doesn’t hit the if block and doesn’t
  // explicitly return false, the form submission will proceed as usual.
}

//*to make sure the query parameter is included only once
//window.location.search: This property contains the query string of the URL.
// which starts with the ? character. For example, if the URL is
// http://example.com/?roomDoesNotExist=true,
// window.location.search would be ?roomDoesNotExist=true.
if (window.location.search.includes("roomDoesNotExist=true")) {
  console.log(window.location.search); //?roomDoesNotExist=true
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      container: "my-swal",
    },
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  Toast.fire({
    icon: "question",
    title: "This room doesn't exist",
    iconColor: "#FFFAB7",
    width:"20rem"
    
  });
  //
  // Remove the query parameter
  // By concatenating these parts, we are constructing a new URL that doesn’t
  // include the query parameter.
  //   console.log(window.location.protocol);
  //   console.log(window.location.host);
  //   console.log(window.location.pathname);
  let newURL =
    window.location.protocol + //this returns the protocol in my case "http:"
    "//" +
    window.location.host + //this returns "localhost:8000" in my case
    window.location.pathname; //this returns "/"
  //*update the browser’s address bar to reflect this new URL without reloading the page.
  // this line of code is used to replace the current URL in the browser’s history
  // with the new URL.This means that if the user clicks the back button
  // or refreshes the page, they won’t see the URL with the query parameter.
  // It’s a neat way to manipulate the browser history!
  // It’s a good practice to remove query parameters once they’ve been used,
  // to avoid confusion or unexpected behavior if the page is reloaded
  // \/ \/ \/ \/
  window.history.replaceState({}, document.title, newURL);
}
//explain is easy language
