var interval;

this.addEventListener("message", function(event) {
  switch (event.data) {
    case "setInterval":
      interval = setInterval( function() {
                 this.postMessage('tick');
                 }, 1000);
      break;
    case "clearInterval":
      clearInterval(interval);
      break;
  }
});
