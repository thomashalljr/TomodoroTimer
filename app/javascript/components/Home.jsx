import React from "react";
import { Link } from "react-router-dom";

var intervalWorker;

class TomodoroTimer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      timeCountingDown: this.props.initialTime * 60 * 1000,
      running: false,
      customTimer: null
    };

    this.handleCustomTimeChange = this.handleCustomTimeChange.bind(this);
  }

  handleCustomTimeChange(event) {
    // Only allow input up to two numbers
    event.target.value = event.target.value.slice(0,event.target.maxLength);
    this.setState({customTimer: event.target.value});
  }

  componentDidMount() {
    var self = this;
    intervalWorker = new Worker("javascripts/workers/intervalWorker.js");
    document.title = "Tomodoro Timer";

    document.getElementById("updateButton").addEventListener("click", function(evt) {
      evt.preventDefault();
      var initialTime = self.state.customTimer;

      if (initialTime != "" && initialTime > 0) {
        self.setState({ timeCountingDown: initialTime * 60 * 1000 });
      } else if (initialTime < 1) {
        alert("Please enter time of 1 or more minutes.");
      }
    });

    document.getElementById("playPauseButton").addEventListener("click", function(evt) {
      evt.preventDefault();
      document.getElementById("alarm").play();
      document.getElementById("alarm").pause();
      self.setPlayPauseButtonText();

      if (!self.state.running) {
        intervalWorker.postMessage("setInterval");
        self.setState({ running: true });
      } else {
        intervalWorker.postMessage("clearInterval");
        self.setState({ running: false });
      }
    });

    intervalWorker.addEventListener("message", function(event) {
      self.elapseTime();
    });
  }

  componentWillUnmount() {
    intervalWorker.postMessage("clearInterval");
  }

  elapseTime() {
    console.log("Elapse time every one second!");
    this.setState({ timeCountingDown: this.minusTime() });

    if (this.state.timeCountingDown == 0) {
      document.getElementById("alarm").play();
      intervalWorker.postMessage("clearInterval");
      this.setPlayPauseButtonText();

      var initialTime = this.state.customTimer;

      if (initialTime != "") {
        this.setState({ timeCountingDown: initialTime * 60 * 1000 });
      } else {
        this.setState({ timeCountingDown: this.props.initialTime * 60 * 1000 });
      }

      if (!this.state.running) {
        this.setState({ running: true });
      } else {
        this.setState({ running: false });
      }
    }
  }

  minusTime() {
    return this.state.timeCountingDown - 1000;
  }

  setPlayPauseButtonText() {
    var playPauseButton = document.getElementById("playPauseButton");
    var playPauseButtonText = playPauseButton.textContent;

    if (playPauseButtonText == "Play") {
      playPauseButton.textContent = "Pause";
    } else {
      playPauseButton.textContent = "Play";
    }
  }

  render() {
    return (
      <div id="container">
        <form name="customTimer">
          <div><label>How many minutes should timer be?</label></div>
          <div id="updateAndPlay">
            <input type="number" id="initialTime" min="1" maxLength="2" value={this.state.value} onChange={this.handleCustomTimeChange} />
            <button id="updateButton">Update</button>
            <button id="playPauseButton">Play</button>
          </div>
        </form>
        <div id="timeElapsed">{moment.utc(this.state.timeCountingDown).format("mm:ss")}</div>
        <audio id="alarm" src="./audio/alarm.mp3" preload="auto" type="audio/mpeg" />
      </div>
    );
  }
}

export default () => (
  <div className="app">
    { React.createElement(TomodoroTimer, { initialTime: 0.1, restingTime: 1 }) }
  </div>
);
