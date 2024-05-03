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
  redis;
  constructor(name, description, parallel = false, redis = null) {
    var _a;
    this.name = name;
    this.key = `SOP:${name}`;
    this.description = description;
    this.actions = [];
    this.outputs = [];
    this.data = null;
    this.eventEmitter = new EventEmitter();
    this.parallel = parallel;
    this.redis = redis;
    (_a = this.redis) == null ? void 0 : _a.get(this.key, (err, reply) => {
      if (reply) {
        this.data = JSON.parse(reply);
      }
    });
  }
  updateCache() {
    if (this.redis) {
      this.redis.set(this.key, JSON.stringify(this.data));
    }
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
    } else if (runnable.key.includes("CONDITIONAL")) {
      const conditionalAction = runnable;
      if (conditionalAction.ifAction instanceof _SOP) {
        conditionalAction.ifAction.onActionComplete((eventData) => {
          this.eventEmitter.emit("actionComplete", eventData);
        });
      }
      if (conditionalAction.elseAction instanceof _SOP) {
        conditionalAction.elseAction.onActionComplete((eventData) => {
          this.eventEmitter.emit("actionComplete", eventData);
        });
      }
    } else {
      runnable.id = `${this.key}:${runnable.key}:${this.actions.length + 1}`;
    }
    this.updateCache();
  }
  async invoke(data) {
    if (this.data === null) {
      this.data = data;
      this.data.completedActions = [];
    }
    if (this.parallel) {
      const parallelResults = await Promise.all(this.actions.map((action) => action.invoke(this.data)));
      const consolidatedData = [];
      parallelResults.forEach((response, index) => {
        const action = this.actions[index];
        this.data[action.key] = response;
        consolidatedData.push({ key: action.key, data: response });
        this.updateCache();
      });
      this.eventEmitter.emit(
        "actionComplete",
        consolidatedData
      );
    } else {
      for (let i = 0; i < this.actions.length; i++) {
        const response = await this.actions[i].invoke(this.data);
        if (!this.actions[i].key.includes("SOP") && !this.actions[i].key.includes("CONDITIONAL")) {
          this.data[this.actions[i].key] = response;
          this.data.completedActions.push(this.actions[i].id);
          this.updateCache();
          this.eventEmitter.emit(
            "actionComplete",
            [{ key: this.actions[i].key, data: response }]
          );
        } else {
          this.data = response;
          this.updateCache();
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
