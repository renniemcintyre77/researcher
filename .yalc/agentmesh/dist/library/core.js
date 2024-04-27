// src/sop.ts
import { EventEmitter } from "events";
var SOP = class _SOP {
  name;
  description;
  actions;
  outputs;
  data;
  key;
  eventEmitter;
  parallel;
  constructor(name, description, parallel = false) {
    this.name = name;
    this.key = `SOP:name`;
    this.description = description;
    this.actions = [];
    this.outputs = [];
    this.data = null;
    this.eventEmitter = new EventEmitter();
    this.parallel = parallel;
  }
  onActionComplete(listener) {
    this.eventEmitter.on("actionComplete", listener);
  }
  removeActionCompleteListener(listener) {
    this.eventEmitter.removeListener("actionComplete", listener);
  }
  addAction(runnable) {
    this.actions.push(runnable);
    if (runnable instanceof _SOP) {
      runnable.onActionComplete((eventData) => {
        this.eventEmitter.emit("actionComplete", eventData);
      });
    }
  }
  async invoke(data) {
    this.data = data;
    if (this.parallel) {
      const parallelResults = await Promise.all(this.actions.map((action) => action.invoke(this.data)));
      const consolidatedData = [];
      parallelResults.forEach((response, index) => {
        const action = this.actions[index];
        this.data[action.key] = response;
        consolidatedData.push({ key: action.key, data: response });
      });
      this.eventEmitter.emit(
        "actionComplete",
        consolidatedData
      );
    } else {
      for (let i = 0; i < this.actions.length; i++) {
        const response = await this.actions[i].invoke(this.data);
        if (!this.actions[i].key.includes("SOP")) {
          this.data[this.actions[i].key] = response;
          this.eventEmitter.emit(
            "actionComplete",
            [{ key: this.actions[i].key, data: response }]
          );
        }
      }
    }
    return this.data;
  }
};
var sop_default = SOP;
export {
  sop_default as StandardOperatingProcedure
};
