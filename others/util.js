const Id = id => document.getElementById(id);

let last_rid = 100;
const uniqueId = () => ++last_rid;

const chance = float => Math.random() <= float;
const randomInt = (min, max) => Math.floor(Math.random() * (max - min) + min);
const randomElement = array => array[randomInt(0, array.length)];

const sprite = src => {
  var image = new Image();
  image.src = src;

  return image;
};

const Hints = {
  virtual: [],
  container: Id("interactive-hint"),

  removeHint(index = 0) {
    let outdatedHint = this.virtual[index];
    this.container.removeChild(outdatedHint);

    this.virtual.splice(index, 1);
  },

  insertHint(text, color) {
    if (!this.container) return;

    const hint = document.createElement("div");

    hint.style.color = color;
    hint.innerHTML = `<span>${text}</span>`;
    hint.classList.add("hint");

    this.container.appendChild(hint);

    if (this.virtual.length > 1) this.removeHint();

    this.virtual.forEach(element => element.classList.add("closed"));
    this.virtual.push(hint);
  }
};

const debounce = (fn, ms, shouldRunFirst, shouldRunLast) => {
  let waitingTimeout;

  return (...args) => {
    if (waitingTimeout) {
      clearTimeout(waitingTimeout);
      waitingTimeout = undefined;
    } else if (shouldRunFirst) {
      fn(...args);
    }

    waitingTimeout = window.setTimeout(() => {
      if (shouldRunLast) {
        fn(...args);
      }

      waitingTimeout = undefined;
    }, ms);
  };
};
