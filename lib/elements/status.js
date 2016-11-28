var StatusItem = class {
  constructor() {
    this.element = document.createElement("a");
    this.element.textContent = "Kite";
    this.setState("status-unknown");
    this.tooltipText = "";
    this.tooltip = atom.tooltips.add(this.element, {
      title: () => { return this.tooltipText; },
    });
  }

  setState(cls, description) {
    this.tooltipText = description;
    this.element.className = "";  // clear the list of classes
    this.element.classList.add("inline-block");
    if (cls !== undefined) {
      this.element.classList.add(cls);
    }
  }

  onClick(func) {
    console.log(this.element);
    this.element.onclick = func;
  }
}

module.exports = StatusItem;
