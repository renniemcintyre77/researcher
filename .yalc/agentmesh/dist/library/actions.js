var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/zod/lib/index.mjs
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}
function addIssueToContext(ctx, issueData) {
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      ctx.schemaErrorMap,
      getErrorMap(),
      errorMap
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    if (typeof ctx.data === "undefined") {
      return { message: required_error !== null && required_error !== void 0 ? required_error : ctx.defaultError };
    }
    return { message: invalid_type_error !== null && invalid_type_error !== void 0 ? invalid_type_error : ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / Math.pow(10, decCount);
}
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var util, objectUtil, ZodParsedType, getParsedType, ZodIssueCode, quotelessJson, ZodError, errorMap, overrideErrorMap, makeIssue, EMPTY_PATH, ParseStatus, INVALID, DIRTY, OK, isAborted, isDirty, isValid, isAsync, errorUtil, ParseInputLazyPath, handleResult, ZodType, cuidRegex, cuid2Regex, ulidRegex, uuidRegex, emailRegex, _emojiRegex, emojiRegex, ipv4Regex, ipv6Regex, datetimeRegex, ZodString, ZodNumber, ZodBigInt, ZodBoolean, ZodDate, ZodSymbol, ZodUndefined, ZodNull, ZodAny, ZodUnknown, ZodNever, ZodVoid, ZodArray, ZodObject, ZodUnion, getDiscriminator, ZodDiscriminatedUnion, ZodIntersection, ZodTuple, ZodRecord, ZodMap, ZodSet, ZodFunction, ZodLazy, ZodLiteral, ZodEnum, ZodNativeEnum, ZodPromise, ZodEffects, ZodOptional, ZodNullable, ZodDefault, ZodCatch, ZodNaN, BRAND, ZodBranded, ZodPipeline, ZodReadonly, custom, late, ZodFirstPartyTypeKind, instanceOfType, stringType, numberType, nanType, bigIntType, booleanType, dateType, symbolType, undefinedType, nullType, anyType, unknownType, neverType, voidType, arrayType, objectType, strictObjectType, unionType, discriminatedUnionType, intersectionType, tupleType, recordType, mapType, setType, functionType, lazyType, literalType, enumType, nativeEnumType, promiseType, effectsType, optionalType, nullableType, preprocessType, pipelineType, ostring, onumber, oboolean, coerce, NEVER, z;
var init_lib = __esm({
  "node_modules/zod/lib/index.mjs"() {
    "use strict";
    (function(util2) {
      util2.assertEqual = (val) => val;
      function assertIs(_arg) {
      }
      util2.assertIs = assertIs;
      function assertNever(_x) {
        throw new Error();
      }
      util2.assertNever = assertNever;
      util2.arrayToEnum = (items) => {
        const obj = {};
        for (const item of items) {
          obj[item] = item;
        }
        return obj;
      };
      util2.getValidEnumValues = (obj) => {
        const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
        const filtered = {};
        for (const k of validKeys) {
          filtered[k] = obj[k];
        }
        return util2.objectValues(filtered);
      };
      util2.objectValues = (obj) => {
        return util2.objectKeys(obj).map(function(e) {
          return obj[e];
        });
      };
      util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
        const keys = [];
        for (const key in object) {
          if (Object.prototype.hasOwnProperty.call(object, key)) {
            keys.push(key);
          }
        }
        return keys;
      };
      util2.find = (arr, checker) => {
        for (const item of arr) {
          if (checker(item))
            return item;
        }
        return void 0;
      };
      util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && isFinite(val) && Math.floor(val) === val;
      function joinValues(array, separator = " | ") {
        return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
      }
      util2.joinValues = joinValues;
      util2.jsonStringifyReplacer = (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      };
    })(util || (util = {}));
    (function(objectUtil2) {
      objectUtil2.mergeShapes = (first, second) => {
        return {
          ...first,
          ...second
          // second overwrites first
        };
      };
    })(objectUtil || (objectUtil = {}));
    ZodParsedType = util.arrayToEnum([
      "string",
      "nan",
      "number",
      "integer",
      "float",
      "boolean",
      "date",
      "bigint",
      "symbol",
      "function",
      "undefined",
      "null",
      "array",
      "object",
      "unknown",
      "promise",
      "void",
      "never",
      "map",
      "set"
    ]);
    getParsedType = (data) => {
      const t = typeof data;
      switch (t) {
        case "undefined":
          return ZodParsedType.undefined;
        case "string":
          return ZodParsedType.string;
        case "number":
          return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
        case "boolean":
          return ZodParsedType.boolean;
        case "function":
          return ZodParsedType.function;
        case "bigint":
          return ZodParsedType.bigint;
        case "symbol":
          return ZodParsedType.symbol;
        case "object":
          if (Array.isArray(data)) {
            return ZodParsedType.array;
          }
          if (data === null) {
            return ZodParsedType.null;
          }
          if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
            return ZodParsedType.promise;
          }
          if (typeof Map !== "undefined" && data instanceof Map) {
            return ZodParsedType.map;
          }
          if (typeof Set !== "undefined" && data instanceof Set) {
            return ZodParsedType.set;
          }
          if (typeof Date !== "undefined" && data instanceof Date) {
            return ZodParsedType.date;
          }
          return ZodParsedType.object;
        default:
          return ZodParsedType.unknown;
      }
    };
    ZodIssueCode = util.arrayToEnum([
      "invalid_type",
      "invalid_literal",
      "custom",
      "invalid_union",
      "invalid_union_discriminator",
      "invalid_enum_value",
      "unrecognized_keys",
      "invalid_arguments",
      "invalid_return_type",
      "invalid_date",
      "invalid_string",
      "too_small",
      "too_big",
      "invalid_intersection_types",
      "not_multiple_of",
      "not_finite"
    ]);
    quotelessJson = (obj) => {
      const json = JSON.stringify(obj, null, 2);
      return json.replace(/"([^"]+)":/g, "$1:");
    };
    ZodError = class extends Error {
      constructor(issues) {
        super();
        this.issues = [];
        this.addIssue = (sub) => {
          this.issues = [...this.issues, sub];
        };
        this.addIssues = (subs = []) => {
          this.issues = [...this.issues, ...subs];
        };
        const actualProto = new.target.prototype;
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(this, actualProto);
        } else {
          this.__proto__ = actualProto;
        }
        this.name = "ZodError";
        this.issues = issues;
      }
      get errors() {
        return this.issues;
      }
      format(_mapper) {
        const mapper = _mapper || function(issue) {
          return issue.message;
        };
        const fieldErrors = { _errors: [] };
        const processError = (error) => {
          for (const issue of error.issues) {
            if (issue.code === "invalid_union") {
              issue.unionErrors.map(processError);
            } else if (issue.code === "invalid_return_type") {
              processError(issue.returnTypeError);
            } else if (issue.code === "invalid_arguments") {
              processError(issue.argumentsError);
            } else if (issue.path.length === 0) {
              fieldErrors._errors.push(mapper(issue));
            } else {
              let curr = fieldErrors;
              let i = 0;
              while (i < issue.path.length) {
                const el = issue.path[i];
                const terminal = i === issue.path.length - 1;
                if (!terminal) {
                  curr[el] = curr[el] || { _errors: [] };
                } else {
                  curr[el] = curr[el] || { _errors: [] };
                  curr[el]._errors.push(mapper(issue));
                }
                curr = curr[el];
                i++;
              }
            }
          }
        };
        processError(this);
        return fieldErrors;
      }
      toString() {
        return this.message;
      }
      get message() {
        return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
      }
      get isEmpty() {
        return this.issues.length === 0;
      }
      flatten(mapper = (issue) => issue.message) {
        const fieldErrors = {};
        const formErrors = [];
        for (const sub of this.issues) {
          if (sub.path.length > 0) {
            fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
            fieldErrors[sub.path[0]].push(mapper(sub));
          } else {
            formErrors.push(mapper(sub));
          }
        }
        return { formErrors, fieldErrors };
      }
      get formErrors() {
        return this.flatten();
      }
    };
    ZodError.create = (issues) => {
      const error = new ZodError(issues);
      return error;
    };
    errorMap = (issue, _ctx) => {
      let message;
      switch (issue.code) {
        case ZodIssueCode.invalid_type:
          if (issue.received === ZodParsedType.undefined) {
            message = "Required";
          } else {
            message = `Expected ${issue.expected}, received ${issue.received}`;
          }
          break;
        case ZodIssueCode.invalid_literal:
          message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
          break;
        case ZodIssueCode.unrecognized_keys:
          message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
          break;
        case ZodIssueCode.invalid_union:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_union_discriminator:
          message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
          break;
        case ZodIssueCode.invalid_enum_value:
          message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
          break;
        case ZodIssueCode.invalid_arguments:
          message = `Invalid function arguments`;
          break;
        case ZodIssueCode.invalid_return_type:
          message = `Invalid function return type`;
          break;
        case ZodIssueCode.invalid_date:
          message = `Invalid date`;
          break;
        case ZodIssueCode.invalid_string:
          if (typeof issue.validation === "object") {
            if ("includes" in issue.validation) {
              message = `Invalid input: must include "${issue.validation.includes}"`;
              if (typeof issue.validation.position === "number") {
                message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
              }
            } else if ("startsWith" in issue.validation) {
              message = `Invalid input: must start with "${issue.validation.startsWith}"`;
            } else if ("endsWith" in issue.validation) {
              message = `Invalid input: must end with "${issue.validation.endsWith}"`;
            } else {
              util.assertNever(issue.validation);
            }
          } else if (issue.validation !== "regex") {
            message = `Invalid ${issue.validation}`;
          } else {
            message = "Invalid";
          }
          break;
        case ZodIssueCode.too_small:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.too_big:
          if (issue.type === "array")
            message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
          else if (issue.type === "string")
            message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
          else if (issue.type === "number")
            message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "bigint")
            message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
          else if (issue.type === "date")
            message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
          else
            message = "Invalid input";
          break;
        case ZodIssueCode.custom:
          message = `Invalid input`;
          break;
        case ZodIssueCode.invalid_intersection_types:
          message = `Intersection results could not be merged`;
          break;
        case ZodIssueCode.not_multiple_of:
          message = `Number must be a multiple of ${issue.multipleOf}`;
          break;
        case ZodIssueCode.not_finite:
          message = "Number must be finite";
          break;
        default:
          message = _ctx.defaultError;
          util.assertNever(issue);
      }
      return { message };
    };
    overrideErrorMap = errorMap;
    makeIssue = (params) => {
      const { data, path, errorMaps, issueData } = params;
      const fullPath = [...path, ...issueData.path || []];
      const fullIssue = {
        ...issueData,
        path: fullPath
      };
      let errorMessage = "";
      const maps = errorMaps.filter((m) => !!m).slice().reverse();
      for (const map of maps) {
        errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
      }
      return {
        ...issueData,
        path: fullPath,
        message: issueData.message || errorMessage
      };
    };
    EMPTY_PATH = [];
    ParseStatus = class _ParseStatus {
      constructor() {
        this.value = "valid";
      }
      dirty() {
        if (this.value === "valid")
          this.value = "dirty";
      }
      abort() {
        if (this.value !== "aborted")
          this.value = "aborted";
      }
      static mergeArray(status, results) {
        const arrayValue = [];
        for (const s of results) {
          if (s.status === "aborted")
            return INVALID;
          if (s.status === "dirty")
            status.dirty();
          arrayValue.push(s.value);
        }
        return { status: status.value, value: arrayValue };
      }
      static async mergeObjectAsync(status, pairs) {
        const syncPairs = [];
        for (const pair of pairs) {
          syncPairs.push({
            key: await pair.key,
            value: await pair.value
          });
        }
        return _ParseStatus.mergeObjectSync(status, syncPairs);
      }
      static mergeObjectSync(status, pairs) {
        const finalObject = {};
        for (const pair of pairs) {
          const { key, value } = pair;
          if (key.status === "aborted")
            return INVALID;
          if (value.status === "aborted")
            return INVALID;
          if (key.status === "dirty")
            status.dirty();
          if (value.status === "dirty")
            status.dirty();
          if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
            finalObject[key.value] = value.value;
          }
        }
        return { status: status.value, value: finalObject };
      }
    };
    INVALID = Object.freeze({
      status: "aborted"
    });
    DIRTY = (value) => ({ status: "dirty", value });
    OK = (value) => ({ status: "valid", value });
    isAborted = (x) => x.status === "aborted";
    isDirty = (x) => x.status === "dirty";
    isValid = (x) => x.status === "valid";
    isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
    (function(errorUtil2) {
      errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
      errorUtil2.toString = (message) => typeof message === "string" ? message : message === null || message === void 0 ? void 0 : message.message;
    })(errorUtil || (errorUtil = {}));
    ParseInputLazyPath = class {
      constructor(parent, value, path, key) {
        this._cachedPath = [];
        this.parent = parent;
        this.data = value;
        this._path = path;
        this._key = key;
      }
      get path() {
        if (!this._cachedPath.length) {
          if (this._key instanceof Array) {
            this._cachedPath.push(...this._path, ...this._key);
          } else {
            this._cachedPath.push(...this._path, this._key);
          }
        }
        return this._cachedPath;
      }
    };
    handleResult = (ctx, result) => {
      if (isValid(result)) {
        return { success: true, data: result.value };
      } else {
        if (!ctx.common.issues.length) {
          throw new Error("Validation failed but no issues detected.");
        }
        return {
          success: false,
          get error() {
            if (this._error)
              return this._error;
            const error = new ZodError(ctx.common.issues);
            this._error = error;
            return this._error;
          }
        };
      }
    };
    ZodType = class {
      constructor(def) {
        this.spa = this.safeParseAsync;
        this._def = def;
        this.parse = this.parse.bind(this);
        this.safeParse = this.safeParse.bind(this);
        this.parseAsync = this.parseAsync.bind(this);
        this.safeParseAsync = this.safeParseAsync.bind(this);
        this.spa = this.spa.bind(this);
        this.refine = this.refine.bind(this);
        this.refinement = this.refinement.bind(this);
        this.superRefine = this.superRefine.bind(this);
        this.optional = this.optional.bind(this);
        this.nullable = this.nullable.bind(this);
        this.nullish = this.nullish.bind(this);
        this.array = this.array.bind(this);
        this.promise = this.promise.bind(this);
        this.or = this.or.bind(this);
        this.and = this.and.bind(this);
        this.transform = this.transform.bind(this);
        this.brand = this.brand.bind(this);
        this.default = this.default.bind(this);
        this.catch = this.catch.bind(this);
        this.describe = this.describe.bind(this);
        this.pipe = this.pipe.bind(this);
        this.readonly = this.readonly.bind(this);
        this.isNullable = this.isNullable.bind(this);
        this.isOptional = this.isOptional.bind(this);
      }
      get description() {
        return this._def.description;
      }
      _getType(input) {
        return getParsedType(input.data);
      }
      _getOrReturnCtx(input, ctx) {
        return ctx || {
          common: input.parent.common,
          data: input.data,
          parsedType: getParsedType(input.data),
          schemaErrorMap: this._def.errorMap,
          path: input.path,
          parent: input.parent
        };
      }
      _processInputParams(input) {
        return {
          status: new ParseStatus(),
          ctx: {
            common: input.parent.common,
            data: input.data,
            parsedType: getParsedType(input.data),
            schemaErrorMap: this._def.errorMap,
            path: input.path,
            parent: input.parent
          }
        };
      }
      _parseSync(input) {
        const result = this._parse(input);
        if (isAsync(result)) {
          throw new Error("Synchronous parse encountered promise.");
        }
        return result;
      }
      _parseAsync(input) {
        const result = this._parse(input);
        return Promise.resolve(result);
      }
      parse(data, params) {
        const result = this.safeParse(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      safeParse(data, params) {
        var _a;
        const ctx = {
          common: {
            issues: [],
            async: (_a = params === null || params === void 0 ? void 0 : params.async) !== null && _a !== void 0 ? _a : false,
            contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap
          },
          path: (params === null || params === void 0 ? void 0 : params.path) || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const result = this._parseSync({ data, path: ctx.path, parent: ctx });
        return handleResult(ctx, result);
      }
      async parseAsync(data, params) {
        const result = await this.safeParseAsync(data, params);
        if (result.success)
          return result.data;
        throw result.error;
      }
      async safeParseAsync(data, params) {
        const ctx = {
          common: {
            issues: [],
            contextualErrorMap: params === null || params === void 0 ? void 0 : params.errorMap,
            async: true
          },
          path: (params === null || params === void 0 ? void 0 : params.path) || [],
          schemaErrorMap: this._def.errorMap,
          parent: null,
          data,
          parsedType: getParsedType(data)
        };
        const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
        const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
        return handleResult(ctx, result);
      }
      refine(check, message) {
        const getIssueProperties = (val) => {
          if (typeof message === "string" || typeof message === "undefined") {
            return { message };
          } else if (typeof message === "function") {
            return message(val);
          } else {
            return message;
          }
        };
        return this._refinement((val, ctx) => {
          const result = check(val);
          const setError = () => ctx.addIssue({
            code: ZodIssueCode.custom,
            ...getIssueProperties(val)
          });
          if (typeof Promise !== "undefined" && result instanceof Promise) {
            return result.then((data) => {
              if (!data) {
                setError();
                return false;
              } else {
                return true;
              }
            });
          }
          if (!result) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      refinement(check, refinementData) {
        return this._refinement((val, ctx) => {
          if (!check(val)) {
            ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
            return false;
          } else {
            return true;
          }
        });
      }
      _refinement(refinement) {
        return new ZodEffects({
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "refinement", refinement }
        });
      }
      superRefine(refinement) {
        return this._refinement(refinement);
      }
      optional() {
        return ZodOptional.create(this, this._def);
      }
      nullable() {
        return ZodNullable.create(this, this._def);
      }
      nullish() {
        return this.nullable().optional();
      }
      array() {
        return ZodArray.create(this, this._def);
      }
      promise() {
        return ZodPromise.create(this, this._def);
      }
      or(option) {
        return ZodUnion.create([this, option], this._def);
      }
      and(incoming) {
        return ZodIntersection.create(this, incoming, this._def);
      }
      transform(transform) {
        return new ZodEffects({
          ...processCreateParams(this._def),
          schema: this,
          typeName: ZodFirstPartyTypeKind.ZodEffects,
          effect: { type: "transform", transform }
        });
      }
      default(def) {
        const defaultValueFunc = typeof def === "function" ? def : () => def;
        return new ZodDefault({
          ...processCreateParams(this._def),
          innerType: this,
          defaultValue: defaultValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodDefault
        });
      }
      brand() {
        return new ZodBranded({
          typeName: ZodFirstPartyTypeKind.ZodBranded,
          type: this,
          ...processCreateParams(this._def)
        });
      }
      catch(def) {
        const catchValueFunc = typeof def === "function" ? def : () => def;
        return new ZodCatch({
          ...processCreateParams(this._def),
          innerType: this,
          catchValue: catchValueFunc,
          typeName: ZodFirstPartyTypeKind.ZodCatch
        });
      }
      describe(description) {
        const This = this.constructor;
        return new This({
          ...this._def,
          description
        });
      }
      pipe(target) {
        return ZodPipeline.create(this, target);
      }
      readonly() {
        return ZodReadonly.create(this);
      }
      isOptional() {
        return this.safeParse(void 0).success;
      }
      isNullable() {
        return this.safeParse(null).success;
      }
    };
    cuidRegex = /^c[^\s-]{8,}$/i;
    cuid2Regex = /^[a-z][a-z0-9]*$/;
    ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/;
    uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
    emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_+-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
    _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
    ipv4Regex = /^(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))$/;
    ipv6Regex = /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/;
    datetimeRegex = (args) => {
      if (args.precision) {
        if (args.offset) {
          return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
        } else {
          return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{${args.precision}}Z$`);
        }
      } else if (args.precision === 0) {
        if (args.offset) {
          return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
        } else {
          return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$`);
        }
      } else {
        if (args.offset) {
          return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(([+-]\\d{2}(:?\\d{2})?)|Z)$`);
        } else {
          return new RegExp(`^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?Z$`);
        }
      }
    };
    ZodString = class _ZodString extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = String(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.string) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(
            ctx2,
            {
              code: ZodIssueCode.invalid_type,
              expected: ZodParsedType.string,
              received: ctx2.parsedType
            }
            //
          );
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.length < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.length > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "string",
                inclusive: true,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "length") {
            const tooBig = input.data.length > check.value;
            const tooSmall = input.data.length < check.value;
            if (tooBig || tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              if (tooBig) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_big,
                  maximum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              } else if (tooSmall) {
                addIssueToContext(ctx, {
                  code: ZodIssueCode.too_small,
                  minimum: check.value,
                  type: "string",
                  inclusive: true,
                  exact: true,
                  message: check.message
                });
              }
              status.dirty();
            }
          } else if (check.kind === "email") {
            if (!emailRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "email",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "emoji") {
            if (!emojiRegex) {
              emojiRegex = new RegExp(_emojiRegex, "u");
            }
            if (!emojiRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "emoji",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "uuid") {
            if (!uuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "uuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid") {
            if (!cuidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cuid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "cuid2") {
            if (!cuid2Regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "cuid2",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ulid") {
            if (!ulidRegex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "ulid",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "url") {
            try {
              new URL(input.data);
            } catch (_a) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "url",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "regex") {
            check.regex.lastIndex = 0;
            const testResult = check.regex.test(input.data);
            if (!testResult) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "regex",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "trim") {
            input.data = input.data.trim();
          } else if (check.kind === "includes") {
            if (!input.data.includes(check.value, check.position)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { includes: check.value, position: check.position },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "toLowerCase") {
            input.data = input.data.toLowerCase();
          } else if (check.kind === "toUpperCase") {
            input.data = input.data.toUpperCase();
          } else if (check.kind === "startsWith") {
            if (!input.data.startsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { startsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "endsWith") {
            if (!input.data.endsWith(check.value)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: { endsWith: check.value },
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "datetime") {
            const regex = datetimeRegex(check);
            if (!regex.test(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_string,
                validation: "datetime",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "ip") {
            if (!isValidIP(input.data, check.version)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                validation: "ip",
                code: ZodIssueCode.invalid_string,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      _regex(regex, validation, message) {
        return this.refinement((data) => regex.test(data), {
          validation,
          code: ZodIssueCode.invalid_string,
          ...errorUtil.errToObj(message)
        });
      }
      _addCheck(check) {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      email(message) {
        return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
      }
      url(message) {
        return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
      }
      emoji(message) {
        return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
      }
      uuid(message) {
        return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
      }
      cuid(message) {
        return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
      }
      cuid2(message) {
        return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
      }
      ulid(message) {
        return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
      }
      ip(options) {
        return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
      }
      datetime(options) {
        var _a;
        if (typeof options === "string") {
          return this._addCheck({
            kind: "datetime",
            precision: null,
            offset: false,
            message: options
          });
        }
        return this._addCheck({
          kind: "datetime",
          precision: typeof (options === null || options === void 0 ? void 0 : options.precision) === "undefined" ? null : options === null || options === void 0 ? void 0 : options.precision,
          offset: (_a = options === null || options === void 0 ? void 0 : options.offset) !== null && _a !== void 0 ? _a : false,
          ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
        });
      }
      regex(regex, message) {
        return this._addCheck({
          kind: "regex",
          regex,
          ...errorUtil.errToObj(message)
        });
      }
      includes(value, options) {
        return this._addCheck({
          kind: "includes",
          value,
          position: options === null || options === void 0 ? void 0 : options.position,
          ...errorUtil.errToObj(options === null || options === void 0 ? void 0 : options.message)
        });
      }
      startsWith(value, message) {
        return this._addCheck({
          kind: "startsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      endsWith(value, message) {
        return this._addCheck({
          kind: "endsWith",
          value,
          ...errorUtil.errToObj(message)
        });
      }
      min(minLength, message) {
        return this._addCheck({
          kind: "min",
          value: minLength,
          ...errorUtil.errToObj(message)
        });
      }
      max(maxLength, message) {
        return this._addCheck({
          kind: "max",
          value: maxLength,
          ...errorUtil.errToObj(message)
        });
      }
      length(len, message) {
        return this._addCheck({
          kind: "length",
          value: len,
          ...errorUtil.errToObj(message)
        });
      }
      /**
       * @deprecated Use z.string().min(1) instead.
       * @see {@link ZodString.min}
       */
      nonempty(message) {
        return this.min(1, errorUtil.errToObj(message));
      }
      trim() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "trim" }]
        });
      }
      toLowerCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toLowerCase" }]
        });
      }
      toUpperCase() {
        return new _ZodString({
          ...this._def,
          checks: [...this._def.checks, { kind: "toUpperCase" }]
        });
      }
      get isDatetime() {
        return !!this._def.checks.find((ch) => ch.kind === "datetime");
      }
      get isEmail() {
        return !!this._def.checks.find((ch) => ch.kind === "email");
      }
      get isURL() {
        return !!this._def.checks.find((ch) => ch.kind === "url");
      }
      get isEmoji() {
        return !!this._def.checks.find((ch) => ch.kind === "emoji");
      }
      get isUUID() {
        return !!this._def.checks.find((ch) => ch.kind === "uuid");
      }
      get isCUID() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid");
      }
      get isCUID2() {
        return !!this._def.checks.find((ch) => ch.kind === "cuid2");
      }
      get isULID() {
        return !!this._def.checks.find((ch) => ch.kind === "ulid");
      }
      get isIP() {
        return !!this._def.checks.find((ch) => ch.kind === "ip");
      }
      get minLength() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxLength() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodString.create = (params) => {
      var _a;
      return new ZodString({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodString,
        coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
        ...processCreateParams(params)
      });
    };
    ZodNumber = class _ZodNumber extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
        this.step = this.multipleOf;
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = Number(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.number) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.number,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "int") {
            if (!util.isInteger(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.invalid_type,
                expected: "integer",
                received: "float",
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "number",
                inclusive: check.inclusive,
                exact: false,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (floatSafeRemainder(input.data, check.value) !== 0) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "finite") {
            if (!Number.isFinite(input.data)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_finite,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodNumber({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodNumber({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      int(message) {
        return this._addCheck({
          kind: "int",
          message: errorUtil.toString(message)
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: 0,
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      finite(message) {
        return this._addCheck({
          kind: "finite",
          message: errorUtil.toString(message)
        });
      }
      safe(message) {
        return this._addCheck({
          kind: "min",
          inclusive: true,
          value: Number.MIN_SAFE_INTEGER,
          message: errorUtil.toString(message)
        })._addCheck({
          kind: "max",
          inclusive: true,
          value: Number.MAX_SAFE_INTEGER,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
      get isInt() {
        return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
      }
      get isFinite() {
        let max = null, min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
            return true;
          } else if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          } else if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return Number.isFinite(min) && Number.isFinite(max);
      }
    };
    ZodNumber.create = (params) => {
      return new ZodNumber({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodNumber,
        coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
        ...processCreateParams(params)
      });
    };
    ZodBigInt = class _ZodBigInt extends ZodType {
      constructor() {
        super(...arguments);
        this.min = this.gte;
        this.max = this.lte;
      }
      _parse(input) {
        if (this._def.coerce) {
          input.data = BigInt(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.bigint) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.bigint,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        let ctx = void 0;
        const status = new ParseStatus();
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
            if (tooSmall) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                type: "bigint",
                minimum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
            if (tooBig) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                type: "bigint",
                maximum: check.value,
                inclusive: check.inclusive,
                message: check.message
              });
              status.dirty();
            }
          } else if (check.kind === "multipleOf") {
            if (input.data % check.value !== BigInt(0)) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.not_multiple_of,
                multipleOf: check.value,
                message: check.message
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return { status: status.value, value: input.data };
      }
      gte(value, message) {
        return this.setLimit("min", value, true, errorUtil.toString(message));
      }
      gt(value, message) {
        return this.setLimit("min", value, false, errorUtil.toString(message));
      }
      lte(value, message) {
        return this.setLimit("max", value, true, errorUtil.toString(message));
      }
      lt(value, message) {
        return this.setLimit("max", value, false, errorUtil.toString(message));
      }
      setLimit(kind, value, inclusive, message) {
        return new _ZodBigInt({
          ...this._def,
          checks: [
            ...this._def.checks,
            {
              kind,
              value,
              inclusive,
              message: errorUtil.toString(message)
            }
          ]
        });
      }
      _addCheck(check) {
        return new _ZodBigInt({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      positive(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      negative(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: false,
          message: errorUtil.toString(message)
        });
      }
      nonpositive(message) {
        return this._addCheck({
          kind: "max",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      nonnegative(message) {
        return this._addCheck({
          kind: "min",
          value: BigInt(0),
          inclusive: true,
          message: errorUtil.toString(message)
        });
      }
      multipleOf(value, message) {
        return this._addCheck({
          kind: "multipleOf",
          value,
          message: errorUtil.toString(message)
        });
      }
      get minValue() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min;
      }
      get maxValue() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max;
      }
    };
    ZodBigInt.create = (params) => {
      var _a;
      return new ZodBigInt({
        checks: [],
        typeName: ZodFirstPartyTypeKind.ZodBigInt,
        coerce: (_a = params === null || params === void 0 ? void 0 : params.coerce) !== null && _a !== void 0 ? _a : false,
        ...processCreateParams(params)
      });
    };
    ZodBoolean = class extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = Boolean(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.boolean) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.boolean,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodBoolean.create = (params) => {
      return new ZodBoolean({
        typeName: ZodFirstPartyTypeKind.ZodBoolean,
        coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
        ...processCreateParams(params)
      });
    };
    ZodDate = class _ZodDate extends ZodType {
      _parse(input) {
        if (this._def.coerce) {
          input.data = new Date(input.data);
        }
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.date) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.date,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        if (isNaN(input.data.getTime())) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_date
          });
          return INVALID;
        }
        const status = new ParseStatus();
        let ctx = void 0;
        for (const check of this._def.checks) {
          if (check.kind === "min") {
            if (input.data.getTime() < check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                message: check.message,
                inclusive: true,
                exact: false,
                minimum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else if (check.kind === "max") {
            if (input.data.getTime() > check.value) {
              ctx = this._getOrReturnCtx(input, ctx);
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                message: check.message,
                inclusive: true,
                exact: false,
                maximum: check.value,
                type: "date"
              });
              status.dirty();
            }
          } else {
            util.assertNever(check);
          }
        }
        return {
          status: status.value,
          value: new Date(input.data.getTime())
        };
      }
      _addCheck(check) {
        return new _ZodDate({
          ...this._def,
          checks: [...this._def.checks, check]
        });
      }
      min(minDate, message) {
        return this._addCheck({
          kind: "min",
          value: minDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      max(maxDate, message) {
        return this._addCheck({
          kind: "max",
          value: maxDate.getTime(),
          message: errorUtil.toString(message)
        });
      }
      get minDate() {
        let min = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "min") {
            if (min === null || ch.value > min)
              min = ch.value;
          }
        }
        return min != null ? new Date(min) : null;
      }
      get maxDate() {
        let max = null;
        for (const ch of this._def.checks) {
          if (ch.kind === "max") {
            if (max === null || ch.value < max)
              max = ch.value;
          }
        }
        return max != null ? new Date(max) : null;
      }
    };
    ZodDate.create = (params) => {
      return new ZodDate({
        checks: [],
        coerce: (params === null || params === void 0 ? void 0 : params.coerce) || false,
        typeName: ZodFirstPartyTypeKind.ZodDate,
        ...processCreateParams(params)
      });
    };
    ZodSymbol = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.symbol) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.symbol,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodSymbol.create = (params) => {
      return new ZodSymbol({
        typeName: ZodFirstPartyTypeKind.ZodSymbol,
        ...processCreateParams(params)
      });
    };
    ZodUndefined = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.undefined,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodUndefined.create = (params) => {
      return new ZodUndefined({
        typeName: ZodFirstPartyTypeKind.ZodUndefined,
        ...processCreateParams(params)
      });
    };
    ZodNull = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.null) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.null,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodNull.create = (params) => {
      return new ZodNull({
        typeName: ZodFirstPartyTypeKind.ZodNull,
        ...processCreateParams(params)
      });
    };
    ZodAny = class extends ZodType {
      constructor() {
        super(...arguments);
        this._any = true;
      }
      _parse(input) {
        return OK(input.data);
      }
    };
    ZodAny.create = (params) => {
      return new ZodAny({
        typeName: ZodFirstPartyTypeKind.ZodAny,
        ...processCreateParams(params)
      });
    };
    ZodUnknown = class extends ZodType {
      constructor() {
        super(...arguments);
        this._unknown = true;
      }
      _parse(input) {
        return OK(input.data);
      }
    };
    ZodUnknown.create = (params) => {
      return new ZodUnknown({
        typeName: ZodFirstPartyTypeKind.ZodUnknown,
        ...processCreateParams(params)
      });
    };
    ZodNever = class extends ZodType {
      _parse(input) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.never,
          received: ctx.parsedType
        });
        return INVALID;
      }
    };
    ZodNever.create = (params) => {
      return new ZodNever({
        typeName: ZodFirstPartyTypeKind.ZodNever,
        ...processCreateParams(params)
      });
    };
    ZodVoid = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.undefined) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.void,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return OK(input.data);
      }
    };
    ZodVoid.create = (params) => {
      return new ZodVoid({
        typeName: ZodFirstPartyTypeKind.ZodVoid,
        ...processCreateParams(params)
      });
    };
    ZodArray = class _ZodArray extends ZodType {
      _parse(input) {
        const { ctx, status } = this._processInputParams(input);
        const def = this._def;
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (def.exactLength !== null) {
          const tooBig = ctx.data.length > def.exactLength.value;
          const tooSmall = ctx.data.length < def.exactLength.value;
          if (tooBig || tooSmall) {
            addIssueToContext(ctx, {
              code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
              minimum: tooSmall ? def.exactLength.value : void 0,
              maximum: tooBig ? def.exactLength.value : void 0,
              type: "array",
              inclusive: true,
              exact: true,
              message: def.exactLength.message
            });
            status.dirty();
          }
        }
        if (def.minLength !== null) {
          if (ctx.data.length < def.minLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.minLength.message
            });
            status.dirty();
          }
        }
        if (def.maxLength !== null) {
          if (ctx.data.length > def.maxLength.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxLength.value,
              type: "array",
              inclusive: true,
              exact: false,
              message: def.maxLength.message
            });
            status.dirty();
          }
        }
        if (ctx.common.async) {
          return Promise.all([...ctx.data].map((item, i) => {
            return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
          })).then((result2) => {
            return ParseStatus.mergeArray(status, result2);
          });
        }
        const result = [...ctx.data].map((item, i) => {
          return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        });
        return ParseStatus.mergeArray(status, result);
      }
      get element() {
        return this._def.type;
      }
      min(minLength, message) {
        return new _ZodArray({
          ...this._def,
          minLength: { value: minLength, message: errorUtil.toString(message) }
        });
      }
      max(maxLength, message) {
        return new _ZodArray({
          ...this._def,
          maxLength: { value: maxLength, message: errorUtil.toString(message) }
        });
      }
      length(len, message) {
        return new _ZodArray({
          ...this._def,
          exactLength: { value: len, message: errorUtil.toString(message) }
        });
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodArray.create = (schema, params) => {
      return new ZodArray({
        type: schema,
        minLength: null,
        maxLength: null,
        exactLength: null,
        typeName: ZodFirstPartyTypeKind.ZodArray,
        ...processCreateParams(params)
      });
    };
    ZodObject = class _ZodObject extends ZodType {
      constructor() {
        super(...arguments);
        this._cached = null;
        this.nonstrict = this.passthrough;
        this.augment = this.extend;
      }
      _getCached() {
        if (this._cached !== null)
          return this._cached;
        const shape = this._def.shape();
        const keys = util.objectKeys(shape);
        return this._cached = { shape, keys };
      }
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.object) {
          const ctx2 = this._getOrReturnCtx(input);
          addIssueToContext(ctx2, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx2.parsedType
          });
          return INVALID;
        }
        const { status, ctx } = this._processInputParams(input);
        const { shape, keys: shapeKeys } = this._getCached();
        const extraKeys = [];
        if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
          for (const key in ctx.data) {
            if (!shapeKeys.includes(key)) {
              extraKeys.push(key);
            }
          }
        }
        const pairs = [];
        for (const key of shapeKeys) {
          const keyValidator = shape[key];
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
            alwaysSet: key in ctx.data
          });
        }
        if (this._def.catchall instanceof ZodNever) {
          const unknownKeys = this._def.unknownKeys;
          if (unknownKeys === "passthrough") {
            for (const key of extraKeys) {
              pairs.push({
                key: { status: "valid", value: key },
                value: { status: "valid", value: ctx.data[key] }
              });
            }
          } else if (unknownKeys === "strict") {
            if (extraKeys.length > 0) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.unrecognized_keys,
                keys: extraKeys
              });
              status.dirty();
            }
          } else if (unknownKeys === "strip")
            ;
          else {
            throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
          }
        } else {
          const catchall = this._def.catchall;
          for (const key of extraKeys) {
            const value = ctx.data[key];
            pairs.push({
              key: { status: "valid", value: key },
              value: catchall._parse(
                new ParseInputLazyPath(ctx, value, ctx.path, key)
                //, ctx.child(key), value, getParsedType(value)
              ),
              alwaysSet: key in ctx.data
            });
          }
        }
        if (ctx.common.async) {
          return Promise.resolve().then(async () => {
            const syncPairs = [];
            for (const pair of pairs) {
              const key = await pair.key;
              syncPairs.push({
                key,
                value: await pair.value,
                alwaysSet: pair.alwaysSet
              });
            }
            return syncPairs;
          }).then((syncPairs) => {
            return ParseStatus.mergeObjectSync(status, syncPairs);
          });
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get shape() {
        return this._def.shape();
      }
      strict(message) {
        errorUtil.errToObj;
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strict",
          ...message !== void 0 ? {
            errorMap: (issue, ctx) => {
              var _a, _b, _c, _d;
              const defaultError = (_c = (_b = (_a = this._def).errorMap) === null || _b === void 0 ? void 0 : _b.call(_a, issue, ctx).message) !== null && _c !== void 0 ? _c : ctx.defaultError;
              if (issue.code === "unrecognized_keys")
                return {
                  message: (_d = errorUtil.errToObj(message).message) !== null && _d !== void 0 ? _d : defaultError
                };
              return {
                message: defaultError
              };
            }
          } : {}
        });
      }
      strip() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "strip"
        });
      }
      passthrough() {
        return new _ZodObject({
          ...this._def,
          unknownKeys: "passthrough"
        });
      }
      // const AugmentFactory =
      //   <Def extends ZodObjectDef>(def: Def) =>
      //   <Augmentation extends ZodRawShape>(
      //     augmentation: Augmentation
      //   ): ZodObject<
      //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
      //     Def["unknownKeys"],
      //     Def["catchall"]
      //   > => {
      //     return new ZodObject({
      //       ...def,
      //       shape: () => ({
      //         ...def.shape(),
      //         ...augmentation,
      //       }),
      //     }) as any;
      //   };
      extend(augmentation) {
        return new _ZodObject({
          ...this._def,
          shape: () => ({
            ...this._def.shape(),
            ...augmentation
          })
        });
      }
      /**
       * Prior to zod@1.0.12 there was a bug in the
       * inferred type of merged objects. Please
       * upgrade if you are experiencing issues.
       */
      merge(merging) {
        const merged = new _ZodObject({
          unknownKeys: merging._def.unknownKeys,
          catchall: merging._def.catchall,
          shape: () => ({
            ...this._def.shape(),
            ...merging._def.shape()
          }),
          typeName: ZodFirstPartyTypeKind.ZodObject
        });
        return merged;
      }
      // merge<
      //   Incoming extends AnyZodObject,
      //   Augmentation extends Incoming["shape"],
      //   NewOutput extends {
      //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
      //       ? Augmentation[k]["_output"]
      //       : k extends keyof Output
      //       ? Output[k]
      //       : never;
      //   },
      //   NewInput extends {
      //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
      //       ? Augmentation[k]["_input"]
      //       : k extends keyof Input
      //       ? Input[k]
      //       : never;
      //   }
      // >(
      //   merging: Incoming
      // ): ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"],
      //   NewOutput,
      //   NewInput
      // > {
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      setKey(key, schema) {
        return this.augment({ [key]: schema });
      }
      // merge<Incoming extends AnyZodObject>(
      //   merging: Incoming
      // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
      // ZodObject<
      //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
      //   Incoming["_def"]["unknownKeys"],
      //   Incoming["_def"]["catchall"]
      // > {
      //   // const mergedShape = objectUtil.mergeShapes(
      //   //   this._def.shape(),
      //   //   merging._def.shape()
      //   // );
      //   const merged: any = new ZodObject({
      //     unknownKeys: merging._def.unknownKeys,
      //     catchall: merging._def.catchall,
      //     shape: () =>
      //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
      //     typeName: ZodFirstPartyTypeKind.ZodObject,
      //   }) as any;
      //   return merged;
      // }
      catchall(index) {
        return new _ZodObject({
          ...this._def,
          catchall: index
        });
      }
      pick(mask) {
        const shape = {};
        util.objectKeys(mask).forEach((key) => {
          if (mask[key] && this.shape[key]) {
            shape[key] = this.shape[key];
          }
        });
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      omit(mask) {
        const shape = {};
        util.objectKeys(this.shape).forEach((key) => {
          if (!mask[key]) {
            shape[key] = this.shape[key];
          }
        });
        return new _ZodObject({
          ...this._def,
          shape: () => shape
        });
      }
      /**
       * @deprecated
       */
      deepPartial() {
        return deepPartialify(this);
      }
      partial(mask) {
        const newShape = {};
        util.objectKeys(this.shape).forEach((key) => {
          const fieldSchema = this.shape[key];
          if (mask && !mask[key]) {
            newShape[key] = fieldSchema;
          } else {
            newShape[key] = fieldSchema.optional();
          }
        });
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      required(mask) {
        const newShape = {};
        util.objectKeys(this.shape).forEach((key) => {
          if (mask && !mask[key]) {
            newShape[key] = this.shape[key];
          } else {
            const fieldSchema = this.shape[key];
            let newField = fieldSchema;
            while (newField instanceof ZodOptional) {
              newField = newField._def.innerType;
            }
            newShape[key] = newField;
          }
        });
        return new _ZodObject({
          ...this._def,
          shape: () => newShape
        });
      }
      keyof() {
        return createZodEnum(util.objectKeys(this.shape));
      }
    };
    ZodObject.create = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.strictCreate = (shape, params) => {
      return new ZodObject({
        shape: () => shape,
        unknownKeys: "strict",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodObject.lazycreate = (shape, params) => {
      return new ZodObject({
        shape,
        unknownKeys: "strip",
        catchall: ZodNever.create(),
        typeName: ZodFirstPartyTypeKind.ZodObject,
        ...processCreateParams(params)
      });
    };
    ZodUnion = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const options = this._def.options;
        function handleResults(results) {
          for (const result of results) {
            if (result.result.status === "valid") {
              return result.result;
            }
          }
          for (const result of results) {
            if (result.result.status === "dirty") {
              ctx.common.issues.push(...result.ctx.common.issues);
              return result.result;
            }
          }
          const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
        if (ctx.common.async) {
          return Promise.all(options.map(async (option) => {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            return {
              result: await option._parseAsync({
                data: ctx.data,
                path: ctx.path,
                parent: childCtx
              }),
              ctx: childCtx
            };
          })).then(handleResults);
        } else {
          let dirty = void 0;
          const issues = [];
          for (const option of options) {
            const childCtx = {
              ...ctx,
              common: {
                ...ctx.common,
                issues: []
              },
              parent: null
            };
            const result = option._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx
            });
            if (result.status === "valid") {
              return result;
            } else if (result.status === "dirty" && !dirty) {
              dirty = { result, ctx: childCtx };
            }
            if (childCtx.common.issues.length) {
              issues.push(childCtx.common.issues);
            }
          }
          if (dirty) {
            ctx.common.issues.push(...dirty.ctx.common.issues);
            return dirty.result;
          }
          const unionErrors = issues.map((issues2) => new ZodError(issues2));
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union,
            unionErrors
          });
          return INVALID;
        }
      }
      get options() {
        return this._def.options;
      }
    };
    ZodUnion.create = (types, params) => {
      return new ZodUnion({
        options: types,
        typeName: ZodFirstPartyTypeKind.ZodUnion,
        ...processCreateParams(params)
      });
    };
    getDiscriminator = (type) => {
      if (type instanceof ZodLazy) {
        return getDiscriminator(type.schema);
      } else if (type instanceof ZodEffects) {
        return getDiscriminator(type.innerType());
      } else if (type instanceof ZodLiteral) {
        return [type.value];
      } else if (type instanceof ZodEnum) {
        return type.options;
      } else if (type instanceof ZodNativeEnum) {
        return Object.keys(type.enum);
      } else if (type instanceof ZodDefault) {
        return getDiscriminator(type._def.innerType);
      } else if (type instanceof ZodUndefined) {
        return [void 0];
      } else if (type instanceof ZodNull) {
        return [null];
      } else {
        return null;
      }
    };
    ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const discriminator = this.discriminator;
        const discriminatorValue = ctx.data[discriminator];
        const option = this.optionsMap.get(discriminatorValue);
        if (!option) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_union_discriminator,
            options: Array.from(this.optionsMap.keys()),
            path: [discriminator]
          });
          return INVALID;
        }
        if (ctx.common.async) {
          return option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        } else {
          return option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
        }
      }
      get discriminator() {
        return this._def.discriminator;
      }
      get options() {
        return this._def.options;
      }
      get optionsMap() {
        return this._def.optionsMap;
      }
      /**
       * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
       * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
       * have a different value for each object in the union.
       * @param discriminator the name of the discriminator property
       * @param types an array of object schemas
       * @param params
       */
      static create(discriminator, options, params) {
        const optionsMap = /* @__PURE__ */ new Map();
        for (const type of options) {
          const discriminatorValues = getDiscriminator(type.shape[discriminator]);
          if (!discriminatorValues) {
            throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
          }
          for (const value of discriminatorValues) {
            if (optionsMap.has(value)) {
              throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
            }
            optionsMap.set(value, type);
          }
        }
        return new _ZodDiscriminatedUnion({
          typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
          discriminator,
          options,
          optionsMap,
          ...processCreateParams(params)
        });
      }
    };
    ZodIntersection = class extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const handleParsed = (parsedLeft, parsedRight) => {
          if (isAborted(parsedLeft) || isAborted(parsedRight)) {
            return INVALID;
          }
          const merged = mergeValues(parsedLeft.value, parsedRight.value);
          if (!merged.valid) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_intersection_types
            });
            return INVALID;
          }
          if (isDirty(parsedLeft) || isDirty(parsedRight)) {
            status.dirty();
          }
          return { status: status.value, value: merged.data };
        };
        if (ctx.common.async) {
          return Promise.all([
            this._def.left._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            }),
            this._def.right._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            })
          ]).then(([left, right]) => handleParsed(left, right));
        } else {
          return handleParsed(this._def.left._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }), this._def.right._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }));
        }
      }
    };
    ZodIntersection.create = (left, right, params) => {
      return new ZodIntersection({
        left,
        right,
        typeName: ZodFirstPartyTypeKind.ZodIntersection,
        ...processCreateParams(params)
      });
    };
    ZodTuple = class _ZodTuple extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.array) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.array,
            received: ctx.parsedType
          });
          return INVALID;
        }
        if (ctx.data.length < this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          return INVALID;
        }
        const rest = this._def.rest;
        if (!rest && ctx.data.length > this._def.items.length) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: this._def.items.length,
            inclusive: true,
            exact: false,
            type: "array"
          });
          status.dirty();
        }
        const items = [...ctx.data].map((item, itemIndex) => {
          const schema = this._def.items[itemIndex] || this._def.rest;
          if (!schema)
            return null;
          return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
        }).filter((x) => !!x);
        if (ctx.common.async) {
          return Promise.all(items).then((results) => {
            return ParseStatus.mergeArray(status, results);
          });
        } else {
          return ParseStatus.mergeArray(status, items);
        }
      }
      get items() {
        return this._def.items;
      }
      rest(rest) {
        return new _ZodTuple({
          ...this._def,
          rest
        });
      }
    };
    ZodTuple.create = (schemas, params) => {
      if (!Array.isArray(schemas)) {
        throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
      }
      return new ZodTuple({
        items: schemas,
        typeName: ZodFirstPartyTypeKind.ZodTuple,
        rest: null,
        ...processCreateParams(params)
      });
    };
    ZodRecord = class _ZodRecord extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.object) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.object,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const pairs = [];
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        for (const key in ctx.data) {
          pairs.push({
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
            value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key))
          });
        }
        if (ctx.common.async) {
          return ParseStatus.mergeObjectAsync(status, pairs);
        } else {
          return ParseStatus.mergeObjectSync(status, pairs);
        }
      }
      get element() {
        return this._def.valueType;
      }
      static create(first, second, third) {
        if (second instanceof ZodType) {
          return new _ZodRecord({
            keyType: first,
            valueType: second,
            typeName: ZodFirstPartyTypeKind.ZodRecord,
            ...processCreateParams(third)
          });
        }
        return new _ZodRecord({
          keyType: ZodString.create(),
          valueType: first,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams(second)
        });
      }
    };
    ZodMap = class extends ZodType {
      get keySchema() {
        return this._def.keyType;
      }
      get valueSchema() {
        return this._def.valueType;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.map) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.map,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const keyType = this._def.keyType;
        const valueType = this._def.valueType;
        const pairs = [...ctx.data.entries()].map(([key, value], index) => {
          return {
            key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
            value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
          };
        });
        if (ctx.common.async) {
          const finalMap = /* @__PURE__ */ new Map();
          return Promise.resolve().then(async () => {
            for (const pair of pairs) {
              const key = await pair.key;
              const value = await pair.value;
              if (key.status === "aborted" || value.status === "aborted") {
                return INVALID;
              }
              if (key.status === "dirty" || value.status === "dirty") {
                status.dirty();
              }
              finalMap.set(key.value, value.value);
            }
            return { status: status.value, value: finalMap };
          });
        } else {
          const finalMap = /* @__PURE__ */ new Map();
          for (const pair of pairs) {
            const key = pair.key;
            const value = pair.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
        }
      }
    };
    ZodMap.create = (keyType, valueType, params) => {
      return new ZodMap({
        valueType,
        keyType,
        typeName: ZodFirstPartyTypeKind.ZodMap,
        ...processCreateParams(params)
      });
    };
    ZodSet = class _ZodSet extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.set) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.set,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const def = this._def;
        if (def.minSize !== null) {
          if (ctx.data.size < def.minSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: def.minSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.minSize.message
            });
            status.dirty();
          }
        }
        if (def.maxSize !== null) {
          if (ctx.data.size > def.maxSize.value) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: def.maxSize.value,
              type: "set",
              inclusive: true,
              exact: false,
              message: def.maxSize.message
            });
            status.dirty();
          }
        }
        const valueType = this._def.valueType;
        function finalizeSet(elements2) {
          const parsedSet = /* @__PURE__ */ new Set();
          for (const element of elements2) {
            if (element.status === "aborted")
              return INVALID;
            if (element.status === "dirty")
              status.dirty();
            parsedSet.add(element.value);
          }
          return { status: status.value, value: parsedSet };
        }
        const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
        if (ctx.common.async) {
          return Promise.all(elements).then((elements2) => finalizeSet(elements2));
        } else {
          return finalizeSet(elements);
        }
      }
      min(minSize, message) {
        return new _ZodSet({
          ...this._def,
          minSize: { value: minSize, message: errorUtil.toString(message) }
        });
      }
      max(maxSize, message) {
        return new _ZodSet({
          ...this._def,
          maxSize: { value: maxSize, message: errorUtil.toString(message) }
        });
      }
      size(size, message) {
        return this.min(size, message).max(size, message);
      }
      nonempty(message) {
        return this.min(1, message);
      }
    };
    ZodSet.create = (valueType, params) => {
      return new ZodSet({
        valueType,
        minSize: null,
        maxSize: null,
        typeName: ZodFirstPartyTypeKind.ZodSet,
        ...processCreateParams(params)
      });
    };
    ZodFunction = class _ZodFunction extends ZodType {
      constructor() {
        super(...arguments);
        this.validate = this.implement;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.function) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.function,
            received: ctx.parsedType
          });
          return INVALID;
        }
        function makeArgsIssue(args, error) {
          return makeIssue({
            data: args,
            path: ctx.path,
            errorMaps: [
              ctx.common.contextualErrorMap,
              ctx.schemaErrorMap,
              getErrorMap(),
              errorMap
            ].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_arguments,
              argumentsError: error
            }
          });
        }
        function makeReturnsIssue(returns, error) {
          return makeIssue({
            data: returns,
            path: ctx.path,
            errorMaps: [
              ctx.common.contextualErrorMap,
              ctx.schemaErrorMap,
              getErrorMap(),
              errorMap
            ].filter((x) => !!x),
            issueData: {
              code: ZodIssueCode.invalid_return_type,
              returnTypeError: error
            }
          });
        }
        const params = { errorMap: ctx.common.contextualErrorMap };
        const fn = ctx.data;
        if (this._def.returns instanceof ZodPromise) {
          const me = this;
          return OK(async function(...args) {
            const error = new ZodError([]);
            const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
              error.addIssue(makeArgsIssue(args, e));
              throw error;
            });
            const result = await Reflect.apply(fn, this, parsedArgs);
            const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
              error.addIssue(makeReturnsIssue(result, e));
              throw error;
            });
            return parsedReturns;
          });
        } else {
          const me = this;
          return OK(function(...args) {
            const parsedArgs = me._def.args.safeParse(args, params);
            if (!parsedArgs.success) {
              throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
            }
            const result = Reflect.apply(fn, this, parsedArgs.data);
            const parsedReturns = me._def.returns.safeParse(result, params);
            if (!parsedReturns.success) {
              throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
            }
            return parsedReturns.data;
          });
        }
      }
      parameters() {
        return this._def.args;
      }
      returnType() {
        return this._def.returns;
      }
      args(...items) {
        return new _ZodFunction({
          ...this._def,
          args: ZodTuple.create(items).rest(ZodUnknown.create())
        });
      }
      returns(returnType) {
        return new _ZodFunction({
          ...this._def,
          returns: returnType
        });
      }
      implement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      strictImplement(func) {
        const validatedFunc = this.parse(func);
        return validatedFunc;
      }
      static create(args, returns, params) {
        return new _ZodFunction({
          args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
          returns: returns || ZodUnknown.create(),
          typeName: ZodFirstPartyTypeKind.ZodFunction,
          ...processCreateParams(params)
        });
      }
    };
    ZodLazy = class extends ZodType {
      get schema() {
        return this._def.getter();
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const lazySchema = this._def.getter();
        return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
      }
    };
    ZodLazy.create = (getter, params) => {
      return new ZodLazy({
        getter,
        typeName: ZodFirstPartyTypeKind.ZodLazy,
        ...processCreateParams(params)
      });
    };
    ZodLiteral = class extends ZodType {
      _parse(input) {
        if (input.data !== this._def.value) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_literal,
            expected: this._def.value
          });
          return INVALID;
        }
        return { status: "valid", value: input.data };
      }
      get value() {
        return this._def.value;
      }
    };
    ZodLiteral.create = (value, params) => {
      return new ZodLiteral({
        value,
        typeName: ZodFirstPartyTypeKind.ZodLiteral,
        ...processCreateParams(params)
      });
    };
    ZodEnum = class _ZodEnum extends ZodType {
      _parse(input) {
        if (typeof input.data !== "string") {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            expected: util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (this._def.values.indexOf(input.data) === -1) {
          const ctx = this._getOrReturnCtx(input);
          const expectedValues = this._def.values;
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input.data);
      }
      get options() {
        return this._def.values;
      }
      get enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Values() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      get Enum() {
        const enumValues = {};
        for (const val of this._def.values) {
          enumValues[val] = val;
        }
        return enumValues;
      }
      extract(values) {
        return _ZodEnum.create(values);
      }
      exclude(values) {
        return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)));
      }
    };
    ZodEnum.create = createZodEnum;
    ZodNativeEnum = class extends ZodType {
      _parse(input) {
        const nativeEnumValues = util.getValidEnumValues(this._def.values);
        const ctx = this._getOrReturnCtx(input);
        if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
          const expectedValues = util.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            expected: util.joinValues(expectedValues),
            received: ctx.parsedType,
            code: ZodIssueCode.invalid_type
          });
          return INVALID;
        }
        if (nativeEnumValues.indexOf(input.data) === -1) {
          const expectedValues = util.objectValues(nativeEnumValues);
          addIssueToContext(ctx, {
            received: ctx.data,
            code: ZodIssueCode.invalid_enum_value,
            options: expectedValues
          });
          return INVALID;
        }
        return OK(input.data);
      }
      get enum() {
        return this._def.values;
      }
    };
    ZodNativeEnum.create = (values, params) => {
      return new ZodNativeEnum({
        values,
        typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
        ...processCreateParams(params)
      });
    };
    ZodPromise = class extends ZodType {
      unwrap() {
        return this._def.type;
      }
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.promise,
            received: ctx.parsedType
          });
          return INVALID;
        }
        const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
        return OK(promisified.then((data) => {
          return this._def.type.parseAsync(data, {
            path: ctx.path,
            errorMap: ctx.common.contextualErrorMap
          });
        }));
      }
    };
    ZodPromise.create = (schema, params) => {
      return new ZodPromise({
        type: schema,
        typeName: ZodFirstPartyTypeKind.ZodPromise,
        ...processCreateParams(params)
      });
    };
    ZodEffects = class extends ZodType {
      innerType() {
        return this._def.schema;
      }
      sourceType() {
        return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
      }
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        const effect = this._def.effect || null;
        const checkCtx = {
          addIssue: (arg) => {
            addIssueToContext(ctx, arg);
            if (arg.fatal) {
              status.abort();
            } else {
              status.dirty();
            }
          },
          get path() {
            return ctx.path;
          }
        };
        checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
        if (effect.type === "preprocess") {
          const processed = effect.transform(ctx.data, checkCtx);
          if (ctx.common.issues.length) {
            return {
              status: "dirty",
              value: ctx.data
            };
          }
          if (ctx.common.async) {
            return Promise.resolve(processed).then((processed2) => {
              return this._def.schema._parseAsync({
                data: processed2,
                path: ctx.path,
                parent: ctx
              });
            });
          } else {
            return this._def.schema._parseSync({
              data: processed,
              path: ctx.path,
              parent: ctx
            });
          }
        }
        if (effect.type === "refinement") {
          const executeRefinement = (acc) => {
            const result = effect.refinement(acc, checkCtx);
            if (ctx.common.async) {
              return Promise.resolve(result);
            }
            if (result instanceof Promise) {
              throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
            }
            return acc;
          };
          if (ctx.common.async === false) {
            const inner = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inner.status === "aborted")
              return INVALID;
            if (inner.status === "dirty")
              status.dirty();
            executeRefinement(inner.value);
            return { status: status.value, value: inner.value };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
              if (inner.status === "aborted")
                return INVALID;
              if (inner.status === "dirty")
                status.dirty();
              return executeRefinement(inner.value).then(() => {
                return { status: status.value, value: inner.value };
              });
            });
          }
        }
        if (effect.type === "transform") {
          if (ctx.common.async === false) {
            const base = this._def.schema._parseSync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (!isValid(base))
              return base;
            const result = effect.transform(base.value, checkCtx);
            if (result instanceof Promise) {
              throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
            }
            return { status: status.value, value: result };
          } else {
            return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
              if (!isValid(base))
                return base;
              return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({ status: status.value, value: result }));
            });
          }
        }
        util.assertNever(effect);
      }
    };
    ZodEffects.create = (schema, effect, params) => {
      return new ZodEffects({
        schema,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect,
        ...processCreateParams(params)
      });
    };
    ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
      return new ZodEffects({
        schema,
        effect: { type: "preprocess", transform: preprocess },
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        ...processCreateParams(params)
      });
    };
    ZodOptional = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.undefined) {
          return OK(void 0);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodOptional.create = (type, params) => {
      return new ZodOptional({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodOptional,
        ...processCreateParams(params)
      });
    };
    ZodNullable = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType === ZodParsedType.null) {
          return OK(null);
        }
        return this._def.innerType._parse(input);
      }
      unwrap() {
        return this._def.innerType;
      }
    };
    ZodNullable.create = (type, params) => {
      return new ZodNullable({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodNullable,
        ...processCreateParams(params)
      });
    };
    ZodDefault = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        let data = ctx.data;
        if (ctx.parsedType === ZodParsedType.undefined) {
          data = this._def.defaultValue();
        }
        return this._def.innerType._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      removeDefault() {
        return this._def.innerType;
      }
    };
    ZodDefault.create = (type, params) => {
      return new ZodDefault({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodDefault,
        defaultValue: typeof params.default === "function" ? params.default : () => params.default,
        ...processCreateParams(params)
      });
    };
    ZodCatch = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const newCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          }
        };
        const result = this._def.innerType._parse({
          data: newCtx.data,
          path: newCtx.path,
          parent: {
            ...newCtx
          }
        });
        if (isAsync(result)) {
          return result.then((result2) => {
            return {
              status: "valid",
              value: result2.status === "valid" ? result2.value : this._def.catchValue({
                get error() {
                  return new ZodError(newCtx.common.issues);
                },
                input: newCtx.data
              })
            };
          });
        } else {
          return {
            status: "valid",
            value: result.status === "valid" ? result.value : this._def.catchValue({
              get error() {
                return new ZodError(newCtx.common.issues);
              },
              input: newCtx.data
            })
          };
        }
      }
      removeCatch() {
        return this._def.innerType;
      }
    };
    ZodCatch.create = (type, params) => {
      return new ZodCatch({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodCatch,
        catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
        ...processCreateParams(params)
      });
    };
    ZodNaN = class extends ZodType {
      _parse(input) {
        const parsedType = this._getType(input);
        if (parsedType !== ZodParsedType.nan) {
          const ctx = this._getOrReturnCtx(input);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: ZodParsedType.nan,
            received: ctx.parsedType
          });
          return INVALID;
        }
        return { status: "valid", value: input.data };
      }
    };
    ZodNaN.create = (params) => {
      return new ZodNaN({
        typeName: ZodFirstPartyTypeKind.ZodNaN,
        ...processCreateParams(params)
      });
    };
    BRAND = Symbol("zod_brand");
    ZodBranded = class extends ZodType {
      _parse(input) {
        const { ctx } = this._processInputParams(input);
        const data = ctx.data;
        return this._def.type._parse({
          data,
          path: ctx.path,
          parent: ctx
        });
      }
      unwrap() {
        return this._def.type;
      }
    };
    ZodPipeline = class _ZodPipeline extends ZodType {
      _parse(input) {
        const { status, ctx } = this._processInputParams(input);
        if (ctx.common.async) {
          const handleAsync = async () => {
            const inResult = await this._def.in._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: ctx
            });
            if (inResult.status === "aborted")
              return INVALID;
            if (inResult.status === "dirty") {
              status.dirty();
              return DIRTY(inResult.value);
            } else {
              return this._def.out._parseAsync({
                data: inResult.value,
                path: ctx.path,
                parent: ctx
              });
            }
          };
          return handleAsync();
        } else {
          const inResult = this._def.in._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inResult.status === "aborted")
            return INVALID;
          if (inResult.status === "dirty") {
            status.dirty();
            return {
              status: "dirty",
              value: inResult.value
            };
          } else {
            return this._def.out._parseSync({
              data: inResult.value,
              path: ctx.path,
              parent: ctx
            });
          }
        }
      }
      static create(a, b) {
        return new _ZodPipeline({
          in: a,
          out: b,
          typeName: ZodFirstPartyTypeKind.ZodPipeline
        });
      }
    };
    ZodReadonly = class extends ZodType {
      _parse(input) {
        const result = this._def.innerType._parse(input);
        if (isValid(result)) {
          result.value = Object.freeze(result.value);
        }
        return result;
      }
    };
    ZodReadonly.create = (type, params) => {
      return new ZodReadonly({
        innerType: type,
        typeName: ZodFirstPartyTypeKind.ZodReadonly,
        ...processCreateParams(params)
      });
    };
    custom = (check, params = {}, fatal) => {
      if (check)
        return ZodAny.create().superRefine((data, ctx) => {
          var _a, _b;
          if (!check(data)) {
            const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
            const _fatal = (_b = (_a = p.fatal) !== null && _a !== void 0 ? _a : fatal) !== null && _b !== void 0 ? _b : true;
            const p2 = typeof p === "string" ? { message: p } : p;
            ctx.addIssue({ code: "custom", ...p2, fatal: _fatal });
          }
        });
      return ZodAny.create();
    };
    late = {
      object: ZodObject.lazycreate
    };
    (function(ZodFirstPartyTypeKind2) {
      ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
      ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
      ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
      ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
      ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
      ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
      ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
      ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
      ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
      ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
      ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
      ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
      ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
      ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
      ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
      ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
      ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
      ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
      ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
      ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
      ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
      ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
      ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
      ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
      ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
      ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
      ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
      ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
      ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
      ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
      ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
      ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
      ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
      ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
      ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
      ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
    })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
    instanceOfType = (cls, params = {
      message: `Input not instance of ${cls.name}`
    }) => custom((data) => data instanceof cls, params);
    stringType = ZodString.create;
    numberType = ZodNumber.create;
    nanType = ZodNaN.create;
    bigIntType = ZodBigInt.create;
    booleanType = ZodBoolean.create;
    dateType = ZodDate.create;
    symbolType = ZodSymbol.create;
    undefinedType = ZodUndefined.create;
    nullType = ZodNull.create;
    anyType = ZodAny.create;
    unknownType = ZodUnknown.create;
    neverType = ZodNever.create;
    voidType = ZodVoid.create;
    arrayType = ZodArray.create;
    objectType = ZodObject.create;
    strictObjectType = ZodObject.strictCreate;
    unionType = ZodUnion.create;
    discriminatedUnionType = ZodDiscriminatedUnion.create;
    intersectionType = ZodIntersection.create;
    tupleType = ZodTuple.create;
    recordType = ZodRecord.create;
    mapType = ZodMap.create;
    setType = ZodSet.create;
    functionType = ZodFunction.create;
    lazyType = ZodLazy.create;
    literalType = ZodLiteral.create;
    enumType = ZodEnum.create;
    nativeEnumType = ZodNativeEnum.create;
    promiseType = ZodPromise.create;
    effectsType = ZodEffects.create;
    optionalType = ZodOptional.create;
    nullableType = ZodNullable.create;
    preprocessType = ZodEffects.createWithPreprocess;
    pipelineType = ZodPipeline.create;
    ostring = () => stringType().optional();
    onumber = () => numberType().optional();
    oboolean = () => booleanType().optional();
    coerce = {
      string: (arg) => ZodString.create({ ...arg, coerce: true }),
      number: (arg) => ZodNumber.create({ ...arg, coerce: true }),
      boolean: (arg) => ZodBoolean.create({
        ...arg,
        coerce: true
      }),
      bigint: (arg) => ZodBigInt.create({ ...arg, coerce: true }),
      date: (arg) => ZodDate.create({ ...arg, coerce: true })
    };
    NEVER = INVALID;
    z = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      defaultErrorMap: errorMap,
      setErrorMap,
      getErrorMap,
      makeIssue,
      EMPTY_PATH,
      addIssueToContext,
      ParseStatus,
      INVALID,
      DIRTY,
      OK,
      isAborted,
      isDirty,
      isValid,
      isAsync,
      get util() {
        return util;
      },
      get objectUtil() {
        return objectUtil;
      },
      ZodParsedType,
      getParsedType,
      ZodType,
      ZodString,
      ZodNumber,
      ZodBigInt,
      ZodBoolean,
      ZodDate,
      ZodSymbol,
      ZodUndefined,
      ZodNull,
      ZodAny,
      ZodUnknown,
      ZodNever,
      ZodVoid,
      ZodArray,
      ZodObject,
      ZodUnion,
      ZodDiscriminatedUnion,
      ZodIntersection,
      ZodTuple,
      ZodRecord,
      ZodMap,
      ZodSet,
      ZodFunction,
      ZodLazy,
      ZodLiteral,
      ZodEnum,
      ZodNativeEnum,
      ZodPromise,
      ZodEffects,
      ZodTransformer: ZodEffects,
      ZodOptional,
      ZodNullable,
      ZodDefault,
      ZodCatch,
      ZodNaN,
      BRAND,
      ZodBranded,
      ZodPipeline,
      ZodReadonly,
      custom,
      Schema: ZodType,
      ZodSchema: ZodType,
      late,
      get ZodFirstPartyTypeKind() {
        return ZodFirstPartyTypeKind;
      },
      coerce,
      any: anyType,
      array: arrayType,
      bigint: bigIntType,
      boolean: booleanType,
      date: dateType,
      discriminatedUnion: discriminatedUnionType,
      effect: effectsType,
      "enum": enumType,
      "function": functionType,
      "instanceof": instanceOfType,
      intersection: intersectionType,
      lazy: lazyType,
      literal: literalType,
      map: mapType,
      nan: nanType,
      nativeEnum: nativeEnumType,
      never: neverType,
      "null": nullType,
      nullable: nullableType,
      number: numberType,
      object: objectType,
      oboolean,
      onumber,
      optional: optionalType,
      ostring,
      pipeline: pipelineType,
      preprocess: preprocessType,
      promise: promiseType,
      record: recordType,
      set: setType,
      strictObject: strictObjectType,
      string: stringType,
      symbol: symbolType,
      transformer: effectsType,
      tuple: tupleType,
      "undefined": undefinedType,
      union: unionType,
      unknown: unknownType,
      "void": voidType,
      NEVER,
      ZodIssueCode,
      quotelessJson,
      ZodError
    });
  }
});

// node_modules/retry/lib/retry_operation.js
var require_retry_operation = __commonJS({
  "node_modules/retry/lib/retry_operation.js"(exports, module) {
    "use strict";
    function RetryOperation(timeouts, options) {
      if (typeof options === "boolean") {
        options = { forever: options };
      }
      this._originalTimeouts = JSON.parse(JSON.stringify(timeouts));
      this._timeouts = timeouts;
      this._options = options || {};
      this._maxRetryTime = options && options.maxRetryTime || Infinity;
      this._fn = null;
      this._errors = [];
      this._attempts = 1;
      this._operationTimeout = null;
      this._operationTimeoutCb = null;
      this._timeout = null;
      this._operationStart = null;
      this._timer = null;
      if (this._options.forever) {
        this._cachedTimeouts = this._timeouts.slice(0);
      }
    }
    module.exports = RetryOperation;
    RetryOperation.prototype.reset = function() {
      this._attempts = 1;
      this._timeouts = this._originalTimeouts.slice(0);
    };
    RetryOperation.prototype.stop = function() {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      if (this._timer) {
        clearTimeout(this._timer);
      }
      this._timeouts = [];
      this._cachedTimeouts = null;
    };
    RetryOperation.prototype.retry = function(err) {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      if (!err) {
        return false;
      }
      var currentTime = (/* @__PURE__ */ new Date()).getTime();
      if (err && currentTime - this._operationStart >= this._maxRetryTime) {
        this._errors.push(err);
        this._errors.unshift(new Error("RetryOperation timeout occurred"));
        return false;
      }
      this._errors.push(err);
      var timeout = this._timeouts.shift();
      if (timeout === void 0) {
        if (this._cachedTimeouts) {
          this._errors.splice(0, this._errors.length - 1);
          timeout = this._cachedTimeouts.slice(-1);
        } else {
          return false;
        }
      }
      var self = this;
      this._timer = setTimeout(function() {
        self._attempts++;
        if (self._operationTimeoutCb) {
          self._timeout = setTimeout(function() {
            self._operationTimeoutCb(self._attempts);
          }, self._operationTimeout);
          if (self._options.unref) {
            self._timeout.unref();
          }
        }
        self._fn(self._attempts);
      }, timeout);
      if (this._options.unref) {
        this._timer.unref();
      }
      return true;
    };
    RetryOperation.prototype.attempt = function(fn, timeoutOps) {
      this._fn = fn;
      if (timeoutOps) {
        if (timeoutOps.timeout) {
          this._operationTimeout = timeoutOps.timeout;
        }
        if (timeoutOps.cb) {
          this._operationTimeoutCb = timeoutOps.cb;
        }
      }
      var self = this;
      if (this._operationTimeoutCb) {
        this._timeout = setTimeout(function() {
          self._operationTimeoutCb();
        }, self._operationTimeout);
      }
      this._operationStart = (/* @__PURE__ */ new Date()).getTime();
      this._fn(this._attempts);
    };
    RetryOperation.prototype.try = function(fn) {
      console.log("Using RetryOperation.try() is deprecated");
      this.attempt(fn);
    };
    RetryOperation.prototype.start = function(fn) {
      console.log("Using RetryOperation.start() is deprecated");
      this.attempt(fn);
    };
    RetryOperation.prototype.start = RetryOperation.prototype.try;
    RetryOperation.prototype.errors = function() {
      return this._errors;
    };
    RetryOperation.prototype.attempts = function() {
      return this._attempts;
    };
    RetryOperation.prototype.mainError = function() {
      if (this._errors.length === 0) {
        return null;
      }
      var counts = {};
      var mainError = null;
      var mainErrorCount = 0;
      for (var i = 0; i < this._errors.length; i++) {
        var error = this._errors[i];
        var message = error.message;
        var count = (counts[message] || 0) + 1;
        counts[message] = count;
        if (count >= mainErrorCount) {
          mainError = error;
          mainErrorCount = count;
        }
      }
      return mainError;
    };
  }
});

// node_modules/retry/lib/retry.js
var require_retry = __commonJS({
  "node_modules/retry/lib/retry.js"(exports) {
    "use strict";
    var RetryOperation = require_retry_operation();
    exports.operation = function(options) {
      var timeouts = exports.timeouts(options);
      return new RetryOperation(timeouts, {
        forever: options && (options.forever || options.retries === Infinity),
        unref: options && options.unref,
        maxRetryTime: options && options.maxRetryTime
      });
    };
    exports.timeouts = function(options) {
      if (options instanceof Array) {
        return [].concat(options);
      }
      var opts = {
        retries: 10,
        factor: 2,
        minTimeout: 1 * 1e3,
        maxTimeout: Infinity,
        randomize: false
      };
      for (var key in options) {
        opts[key] = options[key];
      }
      if (opts.minTimeout > opts.maxTimeout) {
        throw new Error("minTimeout is greater than maxTimeout");
      }
      var timeouts = [];
      for (var i = 0; i < opts.retries; i++) {
        timeouts.push(this.createTimeout(i, opts));
      }
      if (options && options.forever && !timeouts.length) {
        timeouts.push(this.createTimeout(i, opts));
      }
      timeouts.sort(function(a, b) {
        return a - b;
      });
      return timeouts;
    };
    exports.createTimeout = function(attempt, opts) {
      var random = opts.randomize ? Math.random() + 1 : 1;
      var timeout = Math.round(random * Math.max(opts.minTimeout, 1) * Math.pow(opts.factor, attempt));
      timeout = Math.min(timeout, opts.maxTimeout);
      return timeout;
    };
    exports.wrap = function(obj, options, methods) {
      if (options instanceof Array) {
        methods = options;
        options = null;
      }
      if (!methods) {
        methods = [];
        for (var key in obj) {
          if (typeof obj[key] === "function") {
            methods.push(key);
          }
        }
      }
      for (var i = 0; i < methods.length; i++) {
        var method = methods[i];
        var original = obj[method];
        obj[method] = function retryWrapper(original2) {
          var op = exports.operation(options);
          var args = Array.prototype.slice.call(arguments, 1);
          var callback = args.pop();
          args.push(function(err) {
            if (op.retry(err)) {
              return;
            }
            if (err) {
              arguments[0] = op.mainError();
            }
            callback.apply(this, arguments);
          });
          op.attempt(function() {
            original2.apply(obj, args);
          });
        }.bind(obj, original);
        obj[method].options = options;
      }
    };
  }
});

// node_modules/retry/index.js
var require_retry2 = __commonJS({
  "node_modules/retry/index.js"(exports, module) {
    "use strict";
    module.exports = require_retry();
  }
});

// node_modules/p-retry/index.js
var require_p_retry = __commonJS({
  "node_modules/p-retry/index.js"(exports, module) {
    "use strict";
    var retry = require_retry2();
    var networkErrorMsgs = [
      "Failed to fetch",
      // Chrome
      "NetworkError when attempting to fetch resource.",
      // Firefox
      "The Internet connection appears to be offline.",
      // Safari
      "Network request failed"
      // `cross-fetch`
    ];
    var AbortError = class extends Error {
      constructor(message) {
        super();
        if (message instanceof Error) {
          this.originalError = message;
          ({ message } = message);
        } else {
          this.originalError = new Error(message);
          this.originalError.stack = this.stack;
        }
        this.name = "AbortError";
        this.message = message;
      }
    };
    var decorateErrorWithCounts = (error, attemptNumber, options) => {
      const retriesLeft = options.retries - (attemptNumber - 1);
      error.attemptNumber = attemptNumber;
      error.retriesLeft = retriesLeft;
      return error;
    };
    var isNetworkError = (errorMessage) => networkErrorMsgs.includes(errorMessage);
    var pRetry4 = (input, options) => new Promise((resolve, reject) => {
      options = {
        onFailedAttempt: () => {
        },
        retries: 10,
        ...options
      };
      const operation = retry.operation(options);
      operation.attempt(async (attemptNumber) => {
        try {
          resolve(await input(attemptNumber));
        } catch (error) {
          if (!(error instanceof Error)) {
            reject(new TypeError(`Non-error was thrown: "${error}". You should only throw errors.`));
            return;
          }
          if (error instanceof AbortError) {
            operation.stop();
            reject(error.originalError);
          } else if (error instanceof TypeError && !isNetworkError(error.message)) {
            operation.stop();
            reject(error);
          } else {
            decorateErrorWithCounts(error, attemptNumber, options);
            try {
              await options.onFailedAttempt(error);
            } catch (error2) {
              reject(error2);
              return;
            }
            if (!operation.retry(error)) {
              reject(operation.mainError());
            }
          }
        }
      });
    });
    module.exports = pRetry4;
    module.exports.default = pRetry4;
    module.exports.AbortError = AbortError;
  }
});

// node_modules/uuid/dist/esm-node/rng.js
import crypto from "crypto";
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    crypto.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
var rnds8Pool, poolPtr;
var init_rng = __esm({
  "node_modules/uuid/dist/esm-node/rng.js"() {
    "use strict";
    rnds8Pool = new Uint8Array(256);
    poolPtr = rnds8Pool.length;
  }
});

// node_modules/uuid/dist/esm-node/regex.js
var regex_default;
var init_regex = __esm({
  "node_modules/uuid/dist/esm-node/regex.js"() {
    "use strict";
    regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
  }
});

// node_modules/uuid/dist/esm-node/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default;
var init_validate = __esm({
  "node_modules/uuid/dist/esm-node/validate.js"() {
    "use strict";
    init_regex();
    validate_default = validate;
  }
});

// node_modules/uuid/dist/esm-node/stringify.js
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}
var byteToHex;
var init_stringify = __esm({
  "node_modules/uuid/dist/esm-node/stringify.js"() {
    "use strict";
    byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).slice(1));
    }
  }
});

// node_modules/uuid/dist/esm-node/native.js
import crypto2 from "crypto";
var native_default;
var init_native = __esm({
  "node_modules/uuid/dist/esm-node/native.js"() {
    "use strict";
    native_default = {
      randomUUID: crypto2.randomUUID
    };
  }
});

// node_modules/uuid/dist/esm-node/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default;
var init_v4 = __esm({
  "node_modules/uuid/dist/esm-node/v4.js"() {
    "use strict";
    init_native();
    init_rng();
    init_stringify();
    v4_default = v4;
  }
});

// node_modules/uuid/dist/esm-node/index.js
var init_esm_node = __esm({
  "node_modules/uuid/dist/esm-node/index.js"() {
    "use strict";
    init_v4();
    init_validate();
  }
});

// node_modules/decamelize/index.js
var require_decamelize = __commonJS({
  "node_modules/decamelize/index.js"(exports, module) {
    "use strict";
    module.exports = function(str, sep) {
      if (typeof str !== "string") {
        throw new TypeError("Expected a string");
      }
      sep = typeof sep === "undefined" ? "_" : sep;
      return str.replace(/([a-z\d])([A-Z])/g, "$1" + sep + "$2").replace(/([A-Z]+)([A-Z][a-z\d]+)/g, "$1" + sep + "$2").toLowerCase();
    };
  }
});

// node_modules/@langchain/core/node_modules/camelcase/index.js
var require_camelcase = __commonJS({
  "node_modules/@langchain/core/node_modules/camelcase/index.js"(exports, module) {
    "use strict";
    var UPPERCASE = /[\p{Lu}]/u;
    var LOWERCASE = /[\p{Ll}]/u;
    var LEADING_CAPITAL = /^[\p{Lu}](?![\p{Lu}])/gu;
    var IDENTIFIER = /([\p{Alpha}\p{N}_]|$)/u;
    var SEPARATORS = /[_.\- ]+/;
    var LEADING_SEPARATORS = new RegExp("^" + SEPARATORS.source);
    var SEPARATORS_AND_IDENTIFIER = new RegExp(SEPARATORS.source + IDENTIFIER.source, "gu");
    var NUMBERS_AND_IDENTIFIER = new RegExp("\\d+" + IDENTIFIER.source, "gu");
    var preserveCamelCase = (string, toLowerCase, toUpperCase) => {
      let isLastCharLower = false;
      let isLastCharUpper = false;
      let isLastLastCharUpper = false;
      for (let i = 0; i < string.length; i++) {
        const character = string[i];
        if (isLastCharLower && UPPERCASE.test(character)) {
          string = string.slice(0, i) + "-" + string.slice(i);
          isLastCharLower = false;
          isLastLastCharUpper = isLastCharUpper;
          isLastCharUpper = true;
          i++;
        } else if (isLastCharUpper && isLastLastCharUpper && LOWERCASE.test(character)) {
          string = string.slice(0, i - 1) + "-" + string.slice(i - 1);
          isLastLastCharUpper = isLastCharUpper;
          isLastCharUpper = false;
          isLastCharLower = true;
        } else {
          isLastCharLower = toLowerCase(character) === character && toUpperCase(character) !== character;
          isLastLastCharUpper = isLastCharUpper;
          isLastCharUpper = toUpperCase(character) === character && toLowerCase(character) !== character;
        }
      }
      return string;
    };
    var preserveConsecutiveUppercase = (input, toLowerCase) => {
      LEADING_CAPITAL.lastIndex = 0;
      return input.replace(LEADING_CAPITAL, (m1) => toLowerCase(m1));
    };
    var postProcess = (input, toUpperCase) => {
      SEPARATORS_AND_IDENTIFIER.lastIndex = 0;
      NUMBERS_AND_IDENTIFIER.lastIndex = 0;
      return input.replace(SEPARATORS_AND_IDENTIFIER, (_, identifier) => toUpperCase(identifier)).replace(NUMBERS_AND_IDENTIFIER, (m) => toUpperCase(m));
    };
    var camelCase2 = (input, options) => {
      if (!(typeof input === "string" || Array.isArray(input))) {
        throw new TypeError("Expected the input to be `string | string[]`");
      }
      options = {
        pascalCase: false,
        preserveConsecutiveUppercase: false,
        ...options
      };
      if (Array.isArray(input)) {
        input = input.map((x) => x.trim()).filter((x) => x.length).join("-");
      } else {
        input = input.trim();
      }
      if (input.length === 0) {
        return "";
      }
      const toLowerCase = options.locale === false ? (string) => string.toLowerCase() : (string) => string.toLocaleLowerCase(options.locale);
      const toUpperCase = options.locale === false ? (string) => string.toUpperCase() : (string) => string.toLocaleUpperCase(options.locale);
      if (input.length === 1) {
        return options.pascalCase ? toUpperCase(input) : toLowerCase(input);
      }
      const hasUpperCase = input !== toLowerCase(input);
      if (hasUpperCase) {
        input = preserveCamelCase(input, toLowerCase, toUpperCase);
      }
      input = input.replace(LEADING_SEPARATORS, "");
      if (options.preserveConsecutiveUppercase) {
        input = preserveConsecutiveUppercase(input, toLowerCase);
      } else {
        input = toLowerCase(input);
      }
      if (options.pascalCase) {
        input = toUpperCase(input.charAt(0)) + input.slice(1);
      }
      return postProcess(input, toUpperCase);
    };
    module.exports = camelCase2;
    module.exports.default = camelCase2;
  }
});

// node_modules/@langchain/core/dist/load/map_keys.js
function keyToJson(key, map) {
  return (map == null ? void 0 : map[key]) || (0, import_decamelize.default)(key);
}
function mapKeys(fields, mapper, map) {
  const mapped = {};
  for (const key in fields) {
    if (Object.hasOwn(fields, key)) {
      mapped[mapper(key, map)] = fields[key];
    }
  }
  return mapped;
}
var import_decamelize, import_camelcase;
var init_map_keys = __esm({
  "node_modules/@langchain/core/dist/load/map_keys.js"() {
    "use strict";
    import_decamelize = __toESM(require_decamelize(), 1);
    import_camelcase = __toESM(require_camelcase(), 1);
  }
});

// node_modules/@langchain/core/dist/load/serializable.js
function shallowCopy(obj) {
  return Array.isArray(obj) ? [...obj] : { ...obj };
}
function replaceSecrets(root, secretsMap) {
  const result = shallowCopy(root);
  for (const [path, secretId] of Object.entries(secretsMap)) {
    const [last, ...partsReverse] = path.split(".").reverse();
    let current = result;
    for (const part of partsReverse.reverse()) {
      if (current[part] === void 0) {
        break;
      }
      current[part] = shallowCopy(current[part]);
      current = current[part];
    }
    if (current[last] !== void 0) {
      current[last] = {
        lc: 1,
        type: "secret",
        id: [secretId]
      };
    }
  }
  return result;
}
function get_lc_unique_name(serializableClass) {
  const parentClass = Object.getPrototypeOf(serializableClass);
  const lcNameIsSubclassed = typeof serializableClass.lc_name === "function" && (typeof parentClass.lc_name !== "function" || serializableClass.lc_name() !== parentClass.lc_name());
  if (lcNameIsSubclassed) {
    return serializableClass.lc_name();
  } else {
    return serializableClass.name;
  }
}
var Serializable;
var init_serializable = __esm({
  "node_modules/@langchain/core/dist/load/serializable.js"() {
    "use strict";
    init_map_keys();
    Serializable = class _Serializable {
      /**
       * The name of the serializable. Override to provide an alias or
       * to preserve the serialized module name in minified environments.
       *
       * Implemented as a static method to support loading logic.
       */
      static lc_name() {
        return this.name;
      }
      /**
       * The final serialized identifier for the module.
       */
      get lc_id() {
        return [
          ...this.lc_namespace,
          get_lc_unique_name(this.constructor)
        ];
      }
      /**
       * A map of secrets, which will be omitted from serialization.
       * Keys are paths to the secret in constructor args, e.g. "foo.bar.baz".
       * Values are the secret ids, which will be used when deserializing.
       */
      get lc_secrets() {
        return void 0;
      }
      /**
       * A map of additional attributes to merge with constructor args.
       * Keys are the attribute names, e.g. "foo".
       * Values are the attribute values, which will be serialized.
       * These attributes need to be accepted by the constructor as arguments.
       */
      get lc_attributes() {
        return void 0;
      }
      /**
       * A map of aliases for constructor args.
       * Keys are the attribute names, e.g. "foo".
       * Values are the alias that will replace the key in serialization.
       * This is used to eg. make argument names match Python.
       */
      get lc_aliases() {
        return void 0;
      }
      constructor(kwargs, ..._args) {
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "lc_kwargs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.lc_kwargs = kwargs || {};
      }
      toJSON() {
        if (!this.lc_serializable) {
          return this.toJSONNotImplemented();
        }
        if (
          // eslint-disable-next-line no-instanceof/no-instanceof
          this.lc_kwargs instanceof _Serializable || typeof this.lc_kwargs !== "object" || Array.isArray(this.lc_kwargs)
        ) {
          return this.toJSONNotImplemented();
        }
        const aliases = {};
        const secrets = {};
        const kwargs = Object.keys(this.lc_kwargs).reduce((acc, key) => {
          acc[key] = key in this ? this[key] : this.lc_kwargs[key];
          return acc;
        }, {});
        for (let current = Object.getPrototypeOf(this); current; current = Object.getPrototypeOf(current)) {
          Object.assign(aliases, Reflect.get(current, "lc_aliases", this));
          Object.assign(secrets, Reflect.get(current, "lc_secrets", this));
          Object.assign(kwargs, Reflect.get(current, "lc_attributes", this));
        }
        Object.keys(secrets).forEach((keyPath) => {
          let read = this;
          let write = kwargs;
          const [last, ...partsReverse] = keyPath.split(".").reverse();
          for (const key of partsReverse.reverse()) {
            if (!(key in read) || read[key] === void 0)
              return;
            if (!(key in write) || write[key] === void 0) {
              if (typeof read[key] === "object" && read[key] != null) {
                write[key] = {};
              } else if (Array.isArray(read[key])) {
                write[key] = [];
              }
            }
            read = read[key];
            write = write[key];
          }
          if (last in read && read[last] !== void 0) {
            write[last] = write[last] || read[last];
          }
        });
        return {
          lc: 1,
          type: "constructor",
          id: this.lc_id,
          kwargs: mapKeys(Object.keys(secrets).length ? replaceSecrets(kwargs, secrets) : kwargs, keyToJson, aliases)
        };
      }
      toJSONNotImplemented() {
        return {
          lc: 1,
          type: "not_implemented",
          id: this.lc_id
        };
      }
    };
  }
});

// node_modules/@langchain/core/dist/utils/env.js
async function getRuntimeEnvironment() {
  if (runtimeEnvironment === void 0) {
    const env = getEnv();
    runtimeEnvironment = {
      library: "langchain-js",
      runtime: env
    };
  }
  return runtimeEnvironment;
}
function getEnvironmentVariable(name) {
  var _a;
  try {
    return typeof process !== "undefined" ? (
      // eslint-disable-next-line no-process-env
      (_a = process.env) == null ? void 0 : _a[name]
    ) : void 0;
  } catch (e) {
    return void 0;
  }
}
var isBrowser, isWebWorker, isJsDom, isDeno, isNode, getEnv, runtimeEnvironment;
var init_env = __esm({
  "node_modules/@langchain/core/dist/utils/env.js"() {
    "use strict";
    isBrowser = () => typeof window !== "undefined" && typeof window.document !== "undefined";
    isWebWorker = () => typeof globalThis === "object" && globalThis.constructor && globalThis.constructor.name === "DedicatedWorkerGlobalScope";
    isJsDom = () => typeof window !== "undefined" && window.name === "nodejs" || typeof navigator !== "undefined" && (navigator.userAgent.includes("Node.js") || navigator.userAgent.includes("jsdom"));
    isDeno = () => typeof Deno !== "undefined";
    isNode = () => typeof process !== "undefined" && typeof process.versions !== "undefined" && typeof process.versions.node !== "undefined" && !isDeno();
    getEnv = () => {
      let env;
      if (isBrowser()) {
        env = "browser";
      } else if (isNode()) {
        env = "node";
      } else if (isWebWorker()) {
        env = "webworker";
      } else if (isJsDom()) {
        env = "jsdom";
      } else if (isDeno()) {
        env = "deno";
      } else {
        env = "other";
      }
      return env;
    };
  }
});

// node_modules/@langchain/core/dist/callbacks/base.js
var BaseCallbackHandlerMethodsClass, BaseCallbackHandler;
var init_base = __esm({
  "node_modules/@langchain/core/dist/callbacks/base.js"() {
    "use strict";
    init_esm_node();
    init_serializable();
    init_env();
    BaseCallbackHandlerMethodsClass = class {
    };
    BaseCallbackHandler = class _BaseCallbackHandler extends BaseCallbackHandlerMethodsClass {
      get lc_namespace() {
        return ["langchain_core", "callbacks", this.name];
      }
      get lc_secrets() {
        return void 0;
      }
      get lc_attributes() {
        return void 0;
      }
      get lc_aliases() {
        return void 0;
      }
      /**
       * The name of the serializable. Override to provide an alias or
       * to preserve the serialized module name in minified environments.
       *
       * Implemented as a static method to support loading logic.
       */
      static lc_name() {
        return this.name;
      }
      /**
       * The final serialized identifier for the module.
       */
      get lc_id() {
        return [
          ...this.lc_namespace,
          get_lc_unique_name(this.constructor)
        ];
      }
      constructor(input) {
        super();
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "lc_kwargs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "ignoreLLM", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "ignoreChain", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "ignoreAgent", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "ignoreRetriever", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "awaitHandlers", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: getEnvironmentVariable("LANGCHAIN_CALLBACKS_BACKGROUND") !== "true"
        });
        this.lc_kwargs = input || {};
        if (input) {
          this.ignoreLLM = input.ignoreLLM ?? this.ignoreLLM;
          this.ignoreChain = input.ignoreChain ?? this.ignoreChain;
          this.ignoreAgent = input.ignoreAgent ?? this.ignoreAgent;
          this.ignoreRetriever = input.ignoreRetriever ?? this.ignoreRetriever;
          this.awaitHandlers = input._awaitHandler ?? this.awaitHandlers;
        }
      }
      copy() {
        return new this.constructor(this);
      }
      toJSON() {
        return Serializable.prototype.toJSON.call(this);
      }
      toJSONNotImplemented() {
        return Serializable.prototype.toJSONNotImplemented.call(this);
      }
      static fromMethods(methods) {
        class Handler extends _BaseCallbackHandler {
          constructor() {
            super();
            Object.defineProperty(this, "name", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: v4_default()
            });
            Object.assign(this, methods);
          }
        }
        return new Handler();
      }
    };
  }
});

// node_modules/@langchain/core/node_modules/ansi-styles/index.js
var require_ansi_styles = __commonJS({
  "node_modules/@langchain/core/node_modules/ansi-styles/index.js"(exports, module) {
    "use strict";
    var ANSI_BACKGROUND_OFFSET = 10;
    var wrapAnsi256 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
    var wrapAnsi16m = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`;
    function assembleStyles() {
      const codes = /* @__PURE__ */ new Map();
      const styles2 = {
        modifier: {
          reset: [0, 0],
          // 21 isn't widely supported and 22 does the same thing
          bold: [1, 22],
          dim: [2, 22],
          italic: [3, 23],
          underline: [4, 24],
          overline: [53, 55],
          inverse: [7, 27],
          hidden: [8, 28],
          strikethrough: [9, 29]
        },
        color: {
          black: [30, 39],
          red: [31, 39],
          green: [32, 39],
          yellow: [33, 39],
          blue: [34, 39],
          magenta: [35, 39],
          cyan: [36, 39],
          white: [37, 39],
          // Bright color
          blackBright: [90, 39],
          redBright: [91, 39],
          greenBright: [92, 39],
          yellowBright: [93, 39],
          blueBright: [94, 39],
          magentaBright: [95, 39],
          cyanBright: [96, 39],
          whiteBright: [97, 39]
        },
        bgColor: {
          bgBlack: [40, 49],
          bgRed: [41, 49],
          bgGreen: [42, 49],
          bgYellow: [43, 49],
          bgBlue: [44, 49],
          bgMagenta: [45, 49],
          bgCyan: [46, 49],
          bgWhite: [47, 49],
          // Bright color
          bgBlackBright: [100, 49],
          bgRedBright: [101, 49],
          bgGreenBright: [102, 49],
          bgYellowBright: [103, 49],
          bgBlueBright: [104, 49],
          bgMagentaBright: [105, 49],
          bgCyanBright: [106, 49],
          bgWhiteBright: [107, 49]
        }
      };
      styles2.color.gray = styles2.color.blackBright;
      styles2.bgColor.bgGray = styles2.bgColor.bgBlackBright;
      styles2.color.grey = styles2.color.blackBright;
      styles2.bgColor.bgGrey = styles2.bgColor.bgBlackBright;
      for (const [groupName, group] of Object.entries(styles2)) {
        for (const [styleName, style] of Object.entries(group)) {
          styles2[styleName] = {
            open: `\x1B[${style[0]}m`,
            close: `\x1B[${style[1]}m`
          };
          group[styleName] = styles2[styleName];
          codes.set(style[0], style[1]);
        }
        Object.defineProperty(styles2, groupName, {
          value: group,
          enumerable: false
        });
      }
      Object.defineProperty(styles2, "codes", {
        value: codes,
        enumerable: false
      });
      styles2.color.close = "\x1B[39m";
      styles2.bgColor.close = "\x1B[49m";
      styles2.color.ansi256 = wrapAnsi256();
      styles2.color.ansi16m = wrapAnsi16m();
      styles2.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
      styles2.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
      Object.defineProperties(styles2, {
        rgbToAnsi256: {
          value: (red, green, blue) => {
            if (red === green && green === blue) {
              if (red < 8) {
                return 16;
              }
              if (red > 248) {
                return 231;
              }
              return Math.round((red - 8) / 247 * 24) + 232;
            }
            return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
          },
          enumerable: false
        },
        hexToRgb: {
          value: (hex) => {
            const matches = /(?<colorString>[a-f\d]{6}|[a-f\d]{3})/i.exec(hex.toString(16));
            if (!matches) {
              return [0, 0, 0];
            }
            let { colorString } = matches.groups;
            if (colorString.length === 3) {
              colorString = colorString.split("").map((character) => character + character).join("");
            }
            const integer = Number.parseInt(colorString, 16);
            return [
              integer >> 16 & 255,
              integer >> 8 & 255,
              integer & 255
            ];
          },
          enumerable: false
        },
        hexToAnsi256: {
          value: (hex) => styles2.rgbToAnsi256(...styles2.hexToRgb(hex)),
          enumerable: false
        }
      });
      return styles2;
    }
    Object.defineProperty(module, "exports", {
      enumerable: true,
      get: assembleStyles
    });
  }
});

// node_modules/@langchain/core/dist/tracers/base.js
function _coerceToDict(value, defaultKey) {
  return value && !Array.isArray(value) && typeof value === "object" ? value : { [defaultKey]: value };
}
function stripNonAlphanumeric(input) {
  return input.replace(/[-:.]/g, "");
}
function convertToDottedOrderFormat(epoch, runId) {
  return stripNonAlphanumeric(`${new Date(epoch).toISOString().slice(0, -1)}000Z`) + runId;
}
var BaseTracer;
var init_base2 = __esm({
  "node_modules/@langchain/core/dist/tracers/base.js"() {
    "use strict";
    init_base();
    BaseTracer = class extends BaseCallbackHandler {
      constructor(_fields) {
        super(...arguments);
        Object.defineProperty(this, "runMap", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: /* @__PURE__ */ new Map()
        });
      }
      copy() {
        return this;
      }
      stringifyError(error) {
        if (error instanceof Error) {
          return error.message + ((error == null ? void 0 : error.stack) ? `

${error.stack}` : "");
        }
        if (typeof error === "string") {
          return error;
        }
        return `${error}`;
      }
      _addChildRun(parentRun, childRun) {
        parentRun.child_runs.push(childRun);
      }
      async _startTrace(run) {
        var _a;
        const currentDottedOrder = convertToDottedOrderFormat(run.start_time, run.id);
        const storedRun = { ...run };
        if (storedRun.parent_run_id !== void 0) {
          const parentRun = this.runMap.get(storedRun.parent_run_id);
          if (parentRun) {
            this._addChildRun(parentRun, storedRun);
            parentRun.child_execution_order = Math.max(parentRun.child_execution_order, storedRun.child_execution_order);
            storedRun.trace_id = parentRun.trace_id;
            if (parentRun.dotted_order !== void 0) {
              storedRun.dotted_order = [
                parentRun.dotted_order,
                currentDottedOrder
              ].join(".");
            } else {
            }
          } else {
          }
        } else {
          storedRun.trace_id = storedRun.id;
          storedRun.dotted_order = currentDottedOrder;
        }
        this.runMap.set(storedRun.id, storedRun);
        await ((_a = this.onRunCreate) == null ? void 0 : _a.call(this, storedRun));
      }
      async _endTrace(run) {
        var _a;
        const parentRun = run.parent_run_id !== void 0 && this.runMap.get(run.parent_run_id);
        if (parentRun) {
          parentRun.child_execution_order = Math.max(parentRun.child_execution_order, run.child_execution_order);
        } else {
          await this.persistRun(run);
        }
        this.runMap.delete(run.id);
        await ((_a = this.onRunUpdate) == null ? void 0 : _a.call(this, run));
      }
      _getExecutionOrder(parentRunId) {
        const parentRun = parentRunId !== void 0 && this.runMap.get(parentRunId);
        if (!parentRun) {
          return 1;
        }
        return parentRun.child_execution_order + 1;
      }
      async handleLLMStart(llm, prompts, runId, parentRunId, extraParams, tags, metadata, name) {
        var _a;
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const finalExtraParams = metadata ? { ...extraParams, metadata } : extraParams;
        const run = {
          id: runId,
          name: name ?? llm.id[llm.id.length - 1],
          parent_run_id: parentRunId,
          start_time,
          serialized: llm,
          events: [
            {
              name: "start",
              time: new Date(start_time).toISOString()
            }
          ],
          inputs: { prompts },
          execution_order,
          child_runs: [],
          child_execution_order: execution_order,
          run_type: "llm",
          extra: finalExtraParams ?? {},
          tags: tags || []
        };
        await this._startTrace(run);
        await ((_a = this.onLLMStart) == null ? void 0 : _a.call(this, run));
        return run;
      }
      async handleChatModelStart(llm, messages, runId, parentRunId, extraParams, tags, metadata, name) {
        var _a;
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const finalExtraParams = metadata ? { ...extraParams, metadata } : extraParams;
        const run = {
          id: runId,
          name: name ?? llm.id[llm.id.length - 1],
          parent_run_id: parentRunId,
          start_time,
          serialized: llm,
          events: [
            {
              name: "start",
              time: new Date(start_time).toISOString()
            }
          ],
          inputs: { messages },
          execution_order,
          child_runs: [],
          child_execution_order: execution_order,
          run_type: "llm",
          extra: finalExtraParams ?? {},
          tags: tags || []
        };
        await this._startTrace(run);
        await ((_a = this.onLLMStart) == null ? void 0 : _a.call(this, run));
        return run;
      }
      async handleLLMEnd(output, runId) {
        var _a;
        const run = this.runMap.get(runId);
        if (!run || (run == null ? void 0 : run.run_type) !== "llm") {
          throw new Error("No LLM run to end.");
        }
        run.end_time = Date.now();
        run.outputs = output;
        run.events.push({
          name: "end",
          time: new Date(run.end_time).toISOString()
        });
        await ((_a = this.onLLMEnd) == null ? void 0 : _a.call(this, run));
        await this._endTrace(run);
        return run;
      }
      async handleLLMError(error, runId) {
        var _a;
        const run = this.runMap.get(runId);
        if (!run || (run == null ? void 0 : run.run_type) !== "llm") {
          throw new Error("No LLM run to end.");
        }
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
          name: "error",
          time: new Date(run.end_time).toISOString()
        });
        await ((_a = this.onLLMError) == null ? void 0 : _a.call(this, run));
        await this._endTrace(run);
        return run;
      }
      async handleChainStart(chain, inputs, runId, parentRunId, tags, metadata, runType, name) {
        var _a;
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const run = {
          id: runId,
          name: name ?? chain.id[chain.id.length - 1],
          parent_run_id: parentRunId,
          start_time,
          serialized: chain,
          events: [
            {
              name: "start",
              time: new Date(start_time).toISOString()
            }
          ],
          inputs,
          execution_order,
          child_execution_order: execution_order,
          run_type: runType ?? "chain",
          child_runs: [],
          extra: metadata ? { metadata } : {},
          tags: tags || []
        };
        await this._startTrace(run);
        await ((_a = this.onChainStart) == null ? void 0 : _a.call(this, run));
        return run;
      }
      async handleChainEnd(outputs, runId, _parentRunId, _tags, kwargs) {
        var _a;
        const run = this.runMap.get(runId);
        if (!run) {
          throw new Error("No chain run to end.");
        }
        run.end_time = Date.now();
        run.outputs = _coerceToDict(outputs, "output");
        run.events.push({
          name: "end",
          time: new Date(run.end_time).toISOString()
        });
        if ((kwargs == null ? void 0 : kwargs.inputs) !== void 0) {
          run.inputs = _coerceToDict(kwargs.inputs, "input");
        }
        await ((_a = this.onChainEnd) == null ? void 0 : _a.call(this, run));
        await this._endTrace(run);
        return run;
      }
      async handleChainError(error, runId, _parentRunId, _tags, kwargs) {
        var _a;
        const run = this.runMap.get(runId);
        if (!run) {
          throw new Error("No chain run to end.");
        }
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
          name: "error",
          time: new Date(run.end_time).toISOString()
        });
        if ((kwargs == null ? void 0 : kwargs.inputs) !== void 0) {
          run.inputs = _coerceToDict(kwargs.inputs, "input");
        }
        await ((_a = this.onChainError) == null ? void 0 : _a.call(this, run));
        await this._endTrace(run);
        return run;
      }
      async handleToolStart(tool, input, runId, parentRunId, tags, metadata, name) {
        var _a;
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const run = {
          id: runId,
          name: name ?? tool.id[tool.id.length - 1],
          parent_run_id: parentRunId,
          start_time,
          serialized: tool,
          events: [
            {
              name: "start",
              time: new Date(start_time).toISOString()
            }
          ],
          inputs: { input },
          execution_order,
          child_execution_order: execution_order,
          run_type: "tool",
          child_runs: [],
          extra: metadata ? { metadata } : {},
          tags: tags || []
        };
        await this._startTrace(run);
        await ((_a = this.onToolStart) == null ? void 0 : _a.call(this, run));
        return run;
      }
      async handleToolEnd(output, runId) {
        var _a;
        const run = this.runMap.get(runId);
        if (!run || (run == null ? void 0 : run.run_type) !== "tool") {
          throw new Error("No tool run to end");
        }
        run.end_time = Date.now();
        run.outputs = { output };
        run.events.push({
          name: "end",
          time: new Date(run.end_time).toISOString()
        });
        await ((_a = this.onToolEnd) == null ? void 0 : _a.call(this, run));
        await this._endTrace(run);
        return run;
      }
      async handleToolError(error, runId) {
        var _a;
        const run = this.runMap.get(runId);
        if (!run || (run == null ? void 0 : run.run_type) !== "tool") {
          throw new Error("No tool run to end");
        }
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
          name: "error",
          time: new Date(run.end_time).toISOString()
        });
        await ((_a = this.onToolError) == null ? void 0 : _a.call(this, run));
        await this._endTrace(run);
        return run;
      }
      async handleAgentAction(action, runId) {
        var _a;
        const run = this.runMap.get(runId);
        if (!run || (run == null ? void 0 : run.run_type) !== "chain") {
          return;
        }
        const agentRun = run;
        agentRun.actions = agentRun.actions || [];
        agentRun.actions.push(action);
        agentRun.events.push({
          name: "agent_action",
          time: (/* @__PURE__ */ new Date()).toISOString(),
          kwargs: { action }
        });
        await ((_a = this.onAgentAction) == null ? void 0 : _a.call(this, run));
      }
      async handleAgentEnd(action, runId) {
        var _a;
        const run = this.runMap.get(runId);
        if (!run || (run == null ? void 0 : run.run_type) !== "chain") {
          return;
        }
        run.events.push({
          name: "agent_end",
          time: (/* @__PURE__ */ new Date()).toISOString(),
          kwargs: { action }
        });
        await ((_a = this.onAgentEnd) == null ? void 0 : _a.call(this, run));
      }
      async handleRetrieverStart(retriever, query, runId, parentRunId, tags, metadata, name) {
        var _a;
        const execution_order = this._getExecutionOrder(parentRunId);
        const start_time = Date.now();
        const run = {
          id: runId,
          name: name ?? retriever.id[retriever.id.length - 1],
          parent_run_id: parentRunId,
          start_time,
          serialized: retriever,
          events: [
            {
              name: "start",
              time: new Date(start_time).toISOString()
            }
          ],
          inputs: { query },
          execution_order,
          child_execution_order: execution_order,
          run_type: "retriever",
          child_runs: [],
          extra: metadata ? { metadata } : {},
          tags: tags || []
        };
        await this._startTrace(run);
        await ((_a = this.onRetrieverStart) == null ? void 0 : _a.call(this, run));
        return run;
      }
      async handleRetrieverEnd(documents, runId) {
        var _a;
        const run = this.runMap.get(runId);
        if (!run || (run == null ? void 0 : run.run_type) !== "retriever") {
          throw new Error("No retriever run to end");
        }
        run.end_time = Date.now();
        run.outputs = { documents };
        run.events.push({
          name: "end",
          time: new Date(run.end_time).toISOString()
        });
        await ((_a = this.onRetrieverEnd) == null ? void 0 : _a.call(this, run));
        await this._endTrace(run);
        return run;
      }
      async handleRetrieverError(error, runId) {
        var _a;
        const run = this.runMap.get(runId);
        if (!run || (run == null ? void 0 : run.run_type) !== "retriever") {
          throw new Error("No retriever run to end");
        }
        run.end_time = Date.now();
        run.error = this.stringifyError(error);
        run.events.push({
          name: "error",
          time: new Date(run.end_time).toISOString()
        });
        await ((_a = this.onRetrieverError) == null ? void 0 : _a.call(this, run));
        await this._endTrace(run);
        return run;
      }
      async handleText(text, runId) {
        var _a;
        const run = this.runMap.get(runId);
        if (!run || (run == null ? void 0 : run.run_type) !== "chain") {
          return;
        }
        run.events.push({
          name: "text",
          time: (/* @__PURE__ */ new Date()).toISOString(),
          kwargs: { text }
        });
        await ((_a = this.onText) == null ? void 0 : _a.call(this, run));
      }
      async handleLLMNewToken(token, idx, runId, _parentRunId, _tags, fields) {
        var _a;
        const run = this.runMap.get(runId);
        if (!run || (run == null ? void 0 : run.run_type) !== "llm") {
          throw new Error(`Invalid "runId" provided to "handleLLMNewToken" callback.`);
        }
        run.events.push({
          name: "new_token",
          time: (/* @__PURE__ */ new Date()).toISOString(),
          kwargs: { token, idx, chunk: fields == null ? void 0 : fields.chunk }
        });
        await ((_a = this.onLLMNewToken) == null ? void 0 : _a.call(this, run, token, { chunk: fields == null ? void 0 : fields.chunk }));
        return run;
      }
    };
  }
});

// node_modules/@langchain/core/dist/tracers/console.js
function wrap(style, text) {
  return `${style.open}${text}${style.close}`;
}
function tryJsonStringify(obj, fallback) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (err) {
    return fallback;
  }
}
function elapsed(run) {
  if (!run.end_time)
    return "";
  const elapsed2 = run.end_time - run.start_time;
  if (elapsed2 < 1e3) {
    return `${elapsed2}ms`;
  }
  return `${(elapsed2 / 1e3).toFixed(2)}s`;
}
var import_ansi_styles, color, ConsoleCallbackHandler;
var init_console = __esm({
  "node_modules/@langchain/core/dist/tracers/console.js"() {
    "use strict";
    import_ansi_styles = __toESM(require_ansi_styles(), 1);
    init_base2();
    ({ color } = import_ansi_styles.default);
    ConsoleCallbackHandler = class extends BaseTracer {
      constructor() {
        super(...arguments);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "console_callback_handler"
        });
      }
      /**
       * Method used to persist the run. In this case, it simply returns a
       * resolved promise as there's no persistence logic.
       * @param _run The run to persist.
       * @returns A resolved promise.
       */
      persistRun(_run) {
        return Promise.resolve();
      }
      // utility methods
      /**
       * Method used to get all the parent runs of a given run.
       * @param run The run whose parents are to be retrieved.
       * @returns An array of parent runs.
       */
      getParents(run) {
        const parents = [];
        let currentRun = run;
        while (currentRun.parent_run_id) {
          const parent = this.runMap.get(currentRun.parent_run_id);
          if (parent) {
            parents.push(parent);
            currentRun = parent;
          } else {
            break;
          }
        }
        return parents;
      }
      /**
       * Method used to get a string representation of the run's lineage, which
       * is used in logging.
       * @param run The run whose lineage is to be retrieved.
       * @returns A string representation of the run's lineage.
       */
      getBreadcrumbs(run) {
        const parents = this.getParents(run).reverse();
        const string = [...parents, run].map((parent, i, arr) => {
          const name = `${parent.execution_order}:${parent.run_type}:${parent.name}`;
          return i === arr.length - 1 ? wrap(import_ansi_styles.default.bold, name) : name;
        }).join(" > ");
        return wrap(color.grey, string);
      }
      // logging methods
      /**
       * Method used to log the start of a chain run.
       * @param run The chain run that has started.
       * @returns void
       */
      onChainStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.green, "[chain/start]")} [${crumbs}] Entering Chain run with input: ${tryJsonStringify(run.inputs, "[inputs]")}`);
      }
      /**
       * Method used to log the end of a chain run.
       * @param run The chain run that has ended.
       * @returns void
       */
      onChainEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.cyan, "[chain/end]")} [${crumbs}] [${elapsed(run)}] Exiting Chain run with output: ${tryJsonStringify(run.outputs, "[outputs]")}`);
      }
      /**
       * Method used to log any errors of a chain run.
       * @param run The chain run that has errored.
       * @returns void
       */
      onChainError(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.red, "[chain/error]")} [${crumbs}] [${elapsed(run)}] Chain run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
      }
      /**
       * Method used to log the start of an LLM run.
       * @param run The LLM run that has started.
       * @returns void
       */
      onLLMStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        const inputs = "prompts" in run.inputs ? { prompts: run.inputs.prompts.map((p) => p.trim()) } : run.inputs;
        console.log(`${wrap(color.green, "[llm/start]")} [${crumbs}] Entering LLM run with input: ${tryJsonStringify(inputs, "[inputs]")}`);
      }
      /**
       * Method used to log the end of an LLM run.
       * @param run The LLM run that has ended.
       * @returns void
       */
      onLLMEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.cyan, "[llm/end]")} [${crumbs}] [${elapsed(run)}] Exiting LLM run with output: ${tryJsonStringify(run.outputs, "[response]")}`);
      }
      /**
       * Method used to log any errors of an LLM run.
       * @param run The LLM run that has errored.
       * @returns void
       */
      onLLMError(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.red, "[llm/error]")} [${crumbs}] [${elapsed(run)}] LLM run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
      }
      /**
       * Method used to log the start of a tool run.
       * @param run The tool run that has started.
       * @returns void
       */
      onToolStart(run) {
        var _a;
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.green, "[tool/start]")} [${crumbs}] Entering Tool run with input: "${(_a = run.inputs.input) == null ? void 0 : _a.trim()}"`);
      }
      /**
       * Method used to log the end of a tool run.
       * @param run The tool run that has ended.
       * @returns void
       */
      onToolEnd(run) {
        var _a, _b;
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.cyan, "[tool/end]")} [${crumbs}] [${elapsed(run)}] Exiting Tool run with output: "${(_b = (_a = run.outputs) == null ? void 0 : _a.output) == null ? void 0 : _b.trim()}"`);
      }
      /**
       * Method used to log any errors of a tool run.
       * @param run The tool run that has errored.
       * @returns void
       */
      onToolError(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.red, "[tool/error]")} [${crumbs}] [${elapsed(run)}] Tool run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
      }
      /**
       * Method used to log the start of a retriever run.
       * @param run The retriever run that has started.
       * @returns void
       */
      onRetrieverStart(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.green, "[retriever/start]")} [${crumbs}] Entering Retriever run with input: ${tryJsonStringify(run.inputs, "[inputs]")}`);
      }
      /**
       * Method used to log the end of a retriever run.
       * @param run The retriever run that has ended.
       * @returns void
       */
      onRetrieverEnd(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.cyan, "[retriever/end]")} [${crumbs}] [${elapsed(run)}] Exiting Retriever run with output: ${tryJsonStringify(run.outputs, "[outputs]")}`);
      }
      /**
       * Method used to log any errors of a retriever run.
       * @param run The retriever run that has errored.
       * @returns void
       */
      onRetrieverError(run) {
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.red, "[retriever/error]")} [${crumbs}] [${elapsed(run)}] Retriever run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
      }
      /**
       * Method used to log the action selected by the agent.
       * @param run The run in which the agent action occurred.
       * @returns void
       */
      onAgentAction(run) {
        const agentRun = run;
        const crumbs = this.getBreadcrumbs(run);
        console.log(`${wrap(color.blue, "[agent/action]")} [${crumbs}] Agent selected action: ${tryJsonStringify(agentRun.actions[agentRun.actions.length - 1], "[action]")}`);
      }
    };
  }
});

// node_modules/eventemitter3/index.js
var require_eventemitter3 = __commonJS({
  "node_modules/eventemitter3/index.js"(exports, module) {
    "use strict";
    var has = Object.prototype.hasOwnProperty;
    var prefix = "~";
    function Events() {
    }
    if (Object.create) {
      Events.prototype = /* @__PURE__ */ Object.create(null);
      if (!new Events().__proto__)
        prefix = false;
    }
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }
    function addListener(emitter, event, fn, context, once) {
      if (typeof fn !== "function") {
        throw new TypeError("The listener must be a function");
      }
      var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
      if (!emitter._events[evt])
        emitter._events[evt] = listener, emitter._eventsCount++;
      else if (!emitter._events[evt].fn)
        emitter._events[evt].push(listener);
      else
        emitter._events[evt] = [emitter._events[evt], listener];
      return emitter;
    }
    function clearEvent(emitter, evt) {
      if (--emitter._eventsCount === 0)
        emitter._events = new Events();
      else
        delete emitter._events[evt];
    }
    function EventEmitter() {
      this._events = new Events();
      this._eventsCount = 0;
    }
    EventEmitter.prototype.eventNames = function eventNames() {
      var names = [], events, name;
      if (this._eventsCount === 0)
        return names;
      for (name in events = this._events) {
        if (has.call(events, name))
          names.push(prefix ? name.slice(1) : name);
      }
      if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
      }
      return names;
    };
    EventEmitter.prototype.listeners = function listeners(event) {
      var evt = prefix ? prefix + event : event, handlers = this._events[evt];
      if (!handlers)
        return [];
      if (handlers.fn)
        return [handlers.fn];
      for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
        ee[i] = handlers[i].fn;
      }
      return ee;
    };
    EventEmitter.prototype.listenerCount = function listenerCount(event) {
      var evt = prefix ? prefix + event : event, listeners = this._events[evt];
      if (!listeners)
        return 0;
      if (listeners.fn)
        return 1;
      return listeners.length;
    };
    EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt])
        return false;
      var listeners = this._events[evt], len = arguments.length, args, i;
      if (listeners.fn) {
        if (listeners.once)
          this.removeListener(event, listeners.fn, void 0, true);
        switch (len) {
          case 1:
            return listeners.fn.call(listeners.context), true;
          case 2:
            return listeners.fn.call(listeners.context, a1), true;
          case 3:
            return listeners.fn.call(listeners.context, a1, a2), true;
          case 4:
            return listeners.fn.call(listeners.context, a1, a2, a3), true;
          case 5:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
          case 6:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }
        for (i = 1, args = new Array(len - 1); i < len; i++) {
          args[i - 1] = arguments[i];
        }
        listeners.fn.apply(listeners.context, args);
      } else {
        var length = listeners.length, j;
        for (i = 0; i < length; i++) {
          if (listeners[i].once)
            this.removeListener(event, listeners[i].fn, void 0, true);
          switch (len) {
            case 1:
              listeners[i].fn.call(listeners[i].context);
              break;
            case 2:
              listeners[i].fn.call(listeners[i].context, a1);
              break;
            case 3:
              listeners[i].fn.call(listeners[i].context, a1, a2);
              break;
            case 4:
              listeners[i].fn.call(listeners[i].context, a1, a2, a3);
              break;
            default:
              if (!args)
                for (j = 1, args = new Array(len - 1); j < len; j++) {
                  args[j - 1] = arguments[j];
                }
              listeners[i].fn.apply(listeners[i].context, args);
          }
        }
      }
      return true;
    };
    EventEmitter.prototype.on = function on(event, fn, context) {
      return addListener(this, event, fn, context, false);
    };
    EventEmitter.prototype.once = function once(event, fn, context) {
      return addListener(this, event, fn, context, true);
    };
    EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt])
        return this;
      if (!fn) {
        clearEvent(this, evt);
        return this;
      }
      var listeners = this._events[evt];
      if (listeners.fn) {
        if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
          clearEvent(this, evt);
        }
      } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
          if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
            events.push(listeners[i]);
          }
        }
        if (events.length)
          this._events[evt] = events.length === 1 ? events[0] : events;
        else
          clearEvent(this, evt);
      }
      return this;
    };
    EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
      var evt;
      if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt])
          clearEvent(this, evt);
      } else {
        this._events = new Events();
        this._eventsCount = 0;
      }
      return this;
    };
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.addListener = EventEmitter.prototype.on;
    EventEmitter.prefixed = prefix;
    EventEmitter.EventEmitter = EventEmitter;
    if ("undefined" !== typeof module) {
      module.exports = EventEmitter;
    }
  }
});

// node_modules/p-finally/index.js
var require_p_finally = __commonJS({
  "node_modules/p-finally/index.js"(exports, module) {
    "use strict";
    module.exports = (promise, onFinally) => {
      onFinally = onFinally || (() => {
      });
      return promise.then(
        (val) => new Promise((resolve) => {
          resolve(onFinally());
        }).then(() => val),
        (err) => new Promise((resolve) => {
          resolve(onFinally());
        }).then(() => {
          throw err;
        })
      );
    };
  }
});

// node_modules/p-timeout/index.js
var require_p_timeout = __commonJS({
  "node_modules/p-timeout/index.js"(exports, module) {
    "use strict";
    var pFinally = require_p_finally();
    var TimeoutError = class extends Error {
      constructor(message) {
        super(message);
        this.name = "TimeoutError";
      }
    };
    var pTimeout = (promise, milliseconds, fallback) => new Promise((resolve, reject) => {
      if (typeof milliseconds !== "number" || milliseconds < 0) {
        throw new TypeError("Expected `milliseconds` to be a positive number");
      }
      if (milliseconds === Infinity) {
        resolve(promise);
        return;
      }
      const timer = setTimeout(() => {
        if (typeof fallback === "function") {
          try {
            resolve(fallback());
          } catch (error) {
            reject(error);
          }
          return;
        }
        const message = typeof fallback === "string" ? fallback : `Promise timed out after ${milliseconds} milliseconds`;
        const timeoutError = fallback instanceof Error ? fallback : new TimeoutError(message);
        if (typeof promise.cancel === "function") {
          promise.cancel();
        }
        reject(timeoutError);
      }, milliseconds);
      pFinally(
        // eslint-disable-next-line promise/prefer-await-to-then
        promise.then(resolve, reject),
        () => {
          clearTimeout(timer);
        }
      );
    });
    module.exports = pTimeout;
    module.exports.default = pTimeout;
    module.exports.TimeoutError = TimeoutError;
  }
});

// node_modules/p-queue/dist/lower-bound.js
var require_lower_bound = __commonJS({
  "node_modules/p-queue/dist/lower-bound.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function lowerBound(array, value, comparator) {
      let first = 0;
      let count = array.length;
      while (count > 0) {
        const step = count / 2 | 0;
        let it = first + step;
        if (comparator(array[it], value) <= 0) {
          first = ++it;
          count -= step + 1;
        } else {
          count = step;
        }
      }
      return first;
    }
    exports.default = lowerBound;
  }
});

// node_modules/p-queue/dist/priority-queue.js
var require_priority_queue = __commonJS({
  "node_modules/p-queue/dist/priority-queue.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var lower_bound_1 = require_lower_bound();
    var PriorityQueue = class {
      constructor() {
        this._queue = [];
      }
      enqueue(run, options) {
        options = Object.assign({ priority: 0 }, options);
        const element = {
          priority: options.priority,
          run
        };
        if (this.size && this._queue[this.size - 1].priority >= options.priority) {
          this._queue.push(element);
          return;
        }
        const index = lower_bound_1.default(this._queue, element, (a, b) => b.priority - a.priority);
        this._queue.splice(index, 0, element);
      }
      dequeue() {
        const item = this._queue.shift();
        return item === null || item === void 0 ? void 0 : item.run;
      }
      filter(options) {
        return this._queue.filter((element) => element.priority === options.priority).map((element) => element.run);
      }
      get size() {
        return this._queue.length;
      }
    };
    exports.default = PriorityQueue;
  }
});

// node_modules/p-queue/dist/index.js
var require_dist = __commonJS({
  "node_modules/p-queue/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EventEmitter = require_eventemitter3();
    var p_timeout_1 = require_p_timeout();
    var priority_queue_1 = require_priority_queue();
    var empty = () => {
    };
    var timeoutError = new p_timeout_1.TimeoutError();
    var PQueue = class extends EventEmitter {
      constructor(options) {
        var _a, _b, _c, _d;
        super();
        this._intervalCount = 0;
        this._intervalEnd = 0;
        this._pendingCount = 0;
        this._resolveEmpty = empty;
        this._resolveIdle = empty;
        options = Object.assign({ carryoverConcurrencyCount: false, intervalCap: Infinity, interval: 0, concurrency: Infinity, autoStart: true, queueClass: priority_queue_1.default }, options);
        if (!(typeof options.intervalCap === "number" && options.intervalCap >= 1)) {
          throw new TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${(_b = (_a = options.intervalCap) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ""}\` (${typeof options.intervalCap})`);
        }
        if (options.interval === void 0 || !(Number.isFinite(options.interval) && options.interval >= 0)) {
          throw new TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${(_d = (_c = options.interval) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ""}\` (${typeof options.interval})`);
        }
        this._carryoverConcurrencyCount = options.carryoverConcurrencyCount;
        this._isIntervalIgnored = options.intervalCap === Infinity || options.interval === 0;
        this._intervalCap = options.intervalCap;
        this._interval = options.interval;
        this._queue = new options.queueClass();
        this._queueClass = options.queueClass;
        this.concurrency = options.concurrency;
        this._timeout = options.timeout;
        this._throwOnTimeout = options.throwOnTimeout === true;
        this._isPaused = options.autoStart === false;
      }
      get _doesIntervalAllowAnother() {
        return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
      }
      get _doesConcurrentAllowAnother() {
        return this._pendingCount < this._concurrency;
      }
      _next() {
        this._pendingCount--;
        this._tryToStartAnother();
        this.emit("next");
      }
      _resolvePromises() {
        this._resolveEmpty();
        this._resolveEmpty = empty;
        if (this._pendingCount === 0) {
          this._resolveIdle();
          this._resolveIdle = empty;
          this.emit("idle");
        }
      }
      _onResumeInterval() {
        this._onInterval();
        this._initializeIntervalIfNeeded();
        this._timeoutId = void 0;
      }
      _isIntervalPaused() {
        const now = Date.now();
        if (this._intervalId === void 0) {
          const delay = this._intervalEnd - now;
          if (delay < 0) {
            this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
          } else {
            if (this._timeoutId === void 0) {
              this._timeoutId = setTimeout(() => {
                this._onResumeInterval();
              }, delay);
            }
            return true;
          }
        }
        return false;
      }
      _tryToStartAnother() {
        if (this._queue.size === 0) {
          if (this._intervalId) {
            clearInterval(this._intervalId);
          }
          this._intervalId = void 0;
          this._resolvePromises();
          return false;
        }
        if (!this._isPaused) {
          const canInitializeInterval = !this._isIntervalPaused();
          if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
            const job = this._queue.dequeue();
            if (!job) {
              return false;
            }
            this.emit("active");
            job();
            if (canInitializeInterval) {
              this._initializeIntervalIfNeeded();
            }
            return true;
          }
        }
        return false;
      }
      _initializeIntervalIfNeeded() {
        if (this._isIntervalIgnored || this._intervalId !== void 0) {
          return;
        }
        this._intervalId = setInterval(() => {
          this._onInterval();
        }, this._interval);
        this._intervalEnd = Date.now() + this._interval;
      }
      _onInterval() {
        if (this._intervalCount === 0 && this._pendingCount === 0 && this._intervalId) {
          clearInterval(this._intervalId);
          this._intervalId = void 0;
        }
        this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
        this._processQueue();
      }
      /**
      Executes all queued functions until it reaches the limit.
      */
      _processQueue() {
        while (this._tryToStartAnother()) {
        }
      }
      get concurrency() {
        return this._concurrency;
      }
      set concurrency(newConcurrency) {
        if (!(typeof newConcurrency === "number" && newConcurrency >= 1)) {
          throw new TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${newConcurrency}\` (${typeof newConcurrency})`);
        }
        this._concurrency = newConcurrency;
        this._processQueue();
      }
      /**
      Adds a sync or async task to the queue. Always returns a promise.
      */
      async add(fn, options = {}) {
        return new Promise((resolve, reject) => {
          const run = async () => {
            this._pendingCount++;
            this._intervalCount++;
            try {
              const operation = this._timeout === void 0 && options.timeout === void 0 ? fn() : p_timeout_1.default(Promise.resolve(fn()), options.timeout === void 0 ? this._timeout : options.timeout, () => {
                if (options.throwOnTimeout === void 0 ? this._throwOnTimeout : options.throwOnTimeout) {
                  reject(timeoutError);
                }
                return void 0;
              });
              resolve(await operation);
            } catch (error) {
              reject(error);
            }
            this._next();
          };
          this._queue.enqueue(run, options);
          this._tryToStartAnother();
          this.emit("add");
        });
      }
      /**
          Same as `.add()`, but accepts an array of sync or async functions.
      
          @returns A promise that resolves when all functions are resolved.
          */
      async addAll(functions, options) {
        return Promise.all(functions.map(async (function_) => this.add(function_, options)));
      }
      /**
      Start (or resume) executing enqueued tasks within concurrency limit. No need to call this if queue is not paused (via `options.autoStart = false` or by `.pause()` method.)
      */
      start() {
        if (!this._isPaused) {
          return this;
        }
        this._isPaused = false;
        this._processQueue();
        return this;
      }
      /**
      Put queue execution on hold.
      */
      pause() {
        this._isPaused = true;
      }
      /**
      Clear the queue.
      */
      clear() {
        this._queue = new this._queueClass();
      }
      /**
          Can be called multiple times. Useful if you for example add additional items at a later time.
      
          @returns A promise that settles when the queue becomes empty.
          */
      async onEmpty() {
        if (this._queue.size === 0) {
          return;
        }
        return new Promise((resolve) => {
          const existingResolve = this._resolveEmpty;
          this._resolveEmpty = () => {
            existingResolve();
            resolve();
          };
        });
      }
      /**
          The difference with `.onEmpty` is that `.onIdle` guarantees that all work from the queue has finished. `.onEmpty` merely signals that the queue is empty, but it could mean that some promises haven't completed yet.
      
          @returns A promise that settles when the queue becomes empty, and all promises have completed; `queue.size === 0 && queue.pending === 0`.
          */
      async onIdle() {
        if (this._pendingCount === 0 && this._queue.size === 0) {
          return;
        }
        return new Promise((resolve) => {
          const existingResolve = this._resolveIdle;
          this._resolveIdle = () => {
            existingResolve();
            resolve();
          };
        });
      }
      /**
      Size of the queue.
      */
      get size() {
        return this._queue.size;
      }
      /**
          Size of the queue, filtered by the given options.
      
          For example, this can be used to find the number of items remaining in the queue with a specific priority level.
          */
      sizeBy(options) {
        return this._queue.filter(options).length;
      }
      /**
      Number of pending promises.
      */
      get pending() {
        return this._pendingCount;
      }
      /**
      Whether the queue is currently paused.
      */
      get isPaused() {
        return this._isPaused;
      }
      get timeout() {
        return this._timeout;
      }
      /**
      Set the timeout for future operations.
      */
      set timeout(milliseconds) {
        this._timeout = milliseconds;
      }
    };
    exports.default = PQueue;
  }
});

// node_modules/langsmith/dist/utils/async_caller.js
var import_p_retry, import_p_queue, STATUS_NO_RETRY, STATUS_IGNORE, AsyncCaller;
var init_async_caller = __esm({
  "node_modules/langsmith/dist/utils/async_caller.js"() {
    "use strict";
    import_p_retry = __toESM(require_p_retry(), 1);
    import_p_queue = __toESM(require_dist(), 1);
    STATUS_NO_RETRY = [
      400,
      401,
      403,
      404,
      405,
      406,
      407,
      408
      // Request Timeout
    ];
    STATUS_IGNORE = [
      409
      // Conflict
    ];
    AsyncCaller = class {
      constructor(params) {
        Object.defineProperty(this, "maxConcurrency", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "maxRetries", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "queue", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "onFailedResponseHook", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.maxConcurrency = params.maxConcurrency ?? Infinity;
        this.maxRetries = params.maxRetries ?? 6;
        const PQueue = "default" in import_p_queue.default ? import_p_queue.default.default : import_p_queue.default;
        this.queue = new PQueue({ concurrency: this.maxConcurrency });
        this.onFailedResponseHook = params == null ? void 0 : params.onFailedResponseHook;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      call(callable, ...args) {
        const onFailedResponseHook = this.onFailedResponseHook;
        return this.queue.add(() => (0, import_p_retry.default)(() => callable(...args).catch((error) => {
          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error(error);
          }
        }), {
          async onFailedAttempt(error) {
            if (error.message.startsWith("Cancel") || error.message.startsWith("TimeoutError") || error.message.startsWith("AbortError")) {
              throw error;
            }
            if ((error == null ? void 0 : error.code) === "ECONNABORTED") {
              throw error;
            }
            const response = error == null ? void 0 : error.response;
            const status = response == null ? void 0 : response.status;
            if (status) {
              if (STATUS_NO_RETRY.includes(+status)) {
                throw error;
              } else if (STATUS_IGNORE.includes(+status)) {
                return;
              }
              if (onFailedResponseHook) {
                await onFailedResponseHook(response);
              }
            }
          },
          // If needed we can change some of the defaults here,
          // but they're quite sensible.
          retries: this.maxRetries,
          randomize: true
        }), { throwOnTimeout: true });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callWithOptions(options, callable, ...args) {
        if (options.signal) {
          return Promise.race([
            this.call(callable, ...args),
            new Promise((_, reject) => {
              var _a;
              (_a = options.signal) == null ? void 0 : _a.addEventListener("abort", () => {
                reject(new Error("AbortError"));
              });
            })
          ]);
        }
        return this.call(callable, ...args);
      }
      fetch(...args) {
        return this.call(() => fetch(...args).then((res) => res.ok ? res : Promise.reject(res)));
      }
    };
  }
});

// node_modules/langsmith/dist/utils/messages.js
function isLangChainMessage(message) {
  return typeof (message == null ? void 0 : message._getType) === "function";
}
function convertLangChainMessageToExample(message) {
  const converted = {
    type: message._getType(),
    data: { content: message.content }
  };
  if ((message == null ? void 0 : message.additional_kwargs) && Object.keys(message.additional_kwargs).length > 0) {
    converted.data.additional_kwargs = { ...message.additional_kwargs };
  }
  return converted;
}
var init_messages = __esm({
  "node_modules/langsmith/dist/utils/messages.js"() {
    "use strict";
  }
});

// node_modules/langsmith/dist/utils/env.js
async function getRuntimeEnvironment2() {
  if (runtimeEnvironment2 === void 0) {
    const env = getEnv2();
    const releaseEnv = getShas();
    runtimeEnvironment2 = {
      library: "langsmith",
      runtime: env,
      sdk: "langsmith-js",
      sdk_version: __version__,
      ...releaseEnv
    };
  }
  return runtimeEnvironment2;
}
function getLangChainEnvVarsMetadata() {
  const allEnvVars = getEnvironmentVariables() || {};
  const envVars = {};
  const excluded = [
    "LANGCHAIN_API_KEY",
    "LANGCHAIN_ENDPOINT",
    "LANGCHAIN_TRACING_V2",
    "LANGCHAIN_PROJECT",
    "LANGCHAIN_SESSION"
  ];
  for (const [key, value] of Object.entries(allEnvVars)) {
    if (key.startsWith("LANGCHAIN_") && typeof value === "string" && !excluded.includes(key) && !key.toLowerCase().includes("key") && !key.toLowerCase().includes("secret") && !key.toLowerCase().includes("token")) {
      if (key === "LANGCHAIN_REVISION_ID") {
        envVars["revision_id"] = value;
      } else {
        envVars[key] = value;
      }
    }
  }
  return envVars;
}
function getEnvironmentVariables() {
  try {
    if (typeof process !== "undefined" && process.env) {
      return Object.entries(process.env).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {});
    }
    return void 0;
  } catch (e) {
    return void 0;
  }
}
function getEnvironmentVariable2(name) {
  var _a;
  try {
    return typeof process !== "undefined" ? (
      // eslint-disable-next-line no-process-env
      (_a = process.env) == null ? void 0 : _a[name]
    ) : void 0;
  } catch (e) {
    return void 0;
  }
}
function getShas() {
  if (cachedCommitSHAs !== void 0) {
    return cachedCommitSHAs;
  }
  const common_release_envs = [
    "VERCEL_GIT_COMMIT_SHA",
    "NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA",
    "COMMIT_REF",
    "RENDER_GIT_COMMIT",
    "CI_COMMIT_SHA",
    "CIRCLE_SHA1",
    "CF_PAGES_COMMIT_SHA",
    "REACT_APP_GIT_SHA",
    "SOURCE_VERSION",
    "GITHUB_SHA",
    "TRAVIS_COMMIT",
    "GIT_COMMIT",
    "BUILD_VCS_NUMBER",
    "bamboo_planRepository_revision",
    "Build.SourceVersion",
    "BITBUCKET_COMMIT",
    "DRONE_COMMIT_SHA",
    "SEMAPHORE_GIT_SHA",
    "BUILDKITE_COMMIT"
  ];
  const shas = {};
  for (const env of common_release_envs) {
    const envVar = getEnvironmentVariable2(env);
    if (envVar !== void 0) {
      shas[env] = envVar;
    }
  }
  cachedCommitSHAs = shas;
  return shas;
}
var globalEnv, isBrowser2, isWebWorker2, isJsDom2, isDeno2, isNode2, getEnv2, runtimeEnvironment2, cachedCommitSHAs;
var init_env2 = __esm({
  "node_modules/langsmith/dist/utils/env.js"() {
    "use strict";
    init_dist();
    isBrowser2 = () => typeof window !== "undefined" && typeof window.document !== "undefined";
    isWebWorker2 = () => typeof globalThis === "object" && globalThis.constructor && globalThis.constructor.name === "DedicatedWorkerGlobalScope";
    isJsDom2 = () => typeof window !== "undefined" && window.name === "nodejs" || typeof navigator !== "undefined" && (navigator.userAgent.includes("Node.js") || navigator.userAgent.includes("jsdom"));
    isDeno2 = () => typeof Deno !== "undefined";
    isNode2 = () => typeof process !== "undefined" && typeof process.versions !== "undefined" && typeof process.versions.node !== "undefined" && !isDeno2();
    getEnv2 = () => {
      if (globalEnv) {
        return globalEnv;
      }
      if (isBrowser2()) {
        globalEnv = "browser";
      } else if (isNode2()) {
        globalEnv = "node";
      } else if (isWebWorker2()) {
        globalEnv = "webworker";
      } else if (isJsDom2()) {
        globalEnv = "jsdom";
      } else if (isDeno2()) {
        globalEnv = "deno";
      } else {
        globalEnv = "other";
      }
      return globalEnv;
    };
  }
});

// node_modules/langsmith/dist/client.js
async function mergeRuntimeEnvIntoRunCreates(runs) {
  const runtimeEnv = await getRuntimeEnvironment2();
  const envVars = getLangChainEnvVarsMetadata();
  return runs.map((run) => {
    const extra = run.extra ?? {};
    const metadata = extra.metadata;
    run.extra = {
      ...extra,
      runtime: {
        ...runtimeEnv,
        ...extra == null ? void 0 : extra.runtime
      },
      metadata: {
        ...envVars,
        ...envVars.revision_id || run.revision_id ? { revision_id: run.revision_id ?? envVars.revision_id } : {},
        ...metadata
      }
    };
    return run;
  });
}
async function toArray(iterable) {
  const result = [];
  for await (const item of iterable) {
    result.push(item);
  }
  return result;
}
function trimQuotes(str) {
  if (str === void 0) {
    return void 0;
  }
  return str.trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}
function assertUuid(str) {
  if (!validate_default(str)) {
    throw new Error(`Invalid UUID: ${str}`);
  }
}
var getTracingSamplingRate, isLocalhost, raiseForStatus, handle429, Queue, DEFAULT_BATCH_SIZE_LIMIT_BYTES, Client;
var init_client = __esm({
  "node_modules/langsmith/dist/client.js"() {
    "use strict";
    init_esm_node();
    init_async_caller();
    init_messages();
    init_env2();
    init_dist();
    getTracingSamplingRate = () => {
      const samplingRateStr = getEnvironmentVariable2("LANGCHAIN_TRACING_SAMPLING_RATE");
      if (samplingRateStr === void 0) {
        return void 0;
      }
      const samplingRate = parseFloat(samplingRateStr);
      if (samplingRate < 0 || samplingRate > 1) {
        throw new Error(`LANGCHAIN_TRACING_SAMPLING_RATE must be between 0 and 1 if set. Got: ${samplingRate}`);
      }
      return samplingRate;
    };
    isLocalhost = (url) => {
      const strippedUrl = url.replace("http://", "").replace("https://", "");
      const hostname = strippedUrl.split("/")[0].split(":")[0];
      return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
    };
    raiseForStatus = async (response, operation) => {
      const body = await response.text();
      if (!response.ok) {
        throw new Error(`Failed to ${operation}: ${response.status} ${response.statusText} ${body}`);
      }
    };
    handle429 = async (response) => {
      if ((response == null ? void 0 : response.status) === 429) {
        const retryAfter = parseInt(response.headers.get("retry-after") ?? "30", 10) * 1e3;
        if (retryAfter > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryAfter));
          return true;
        }
      }
      return false;
    };
    Queue = class {
      constructor() {
        Object.defineProperty(this, "items", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
      }
      get size() {
        return this.items.length;
      }
      push(item) {
        return new Promise((resolve) => {
          this.items.push([item, resolve]);
        });
      }
      pop(upToN) {
        if (upToN < 1) {
          throw new Error("Number of items to pop off may not be less than 1.");
        }
        const popped = [];
        while (popped.length < upToN && this.items.length) {
          const item = this.items.shift();
          if (item) {
            popped.push(item);
          } else {
            break;
          }
        }
        return [popped.map((it) => it[0]), () => popped.forEach((it) => it[1]())];
      }
    };
    DEFAULT_BATCH_SIZE_LIMIT_BYTES = 20971520;
    Client = class _Client {
      constructor(config = {}) {
        Object.defineProperty(this, "apiKey", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "apiUrl", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "webUrl", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "caller", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "batchIngestCaller", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "timeout_ms", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "_tenantId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: null
        });
        Object.defineProperty(this, "hideInputs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "hideOutputs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "tracingSampleRate", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "sampledPostUuids", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: /* @__PURE__ */ new Set()
        });
        Object.defineProperty(this, "autoBatchTracing", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "batchEndpointSupported", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "autoBatchQueue", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: new Queue()
        });
        Object.defineProperty(this, "pendingAutoBatchedRunLimit", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: 100
        });
        Object.defineProperty(this, "autoBatchTimeout", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "autoBatchInitialDelayMs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: 250
        });
        Object.defineProperty(this, "autoBatchAggregationDelayMs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: 50
        });
        Object.defineProperty(this, "serverInfo", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "fetchOptions", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        const defaultConfig = _Client.getDefaultClientConfig();
        this.tracingSampleRate = getTracingSamplingRate();
        this.apiUrl = trimQuotes(config.apiUrl ?? defaultConfig.apiUrl) ?? "";
        this.apiKey = trimQuotes(config.apiKey ?? defaultConfig.apiKey);
        this.webUrl = trimQuotes(config.webUrl ?? defaultConfig.webUrl);
        this.timeout_ms = config.timeout_ms ?? 12e3;
        this.caller = new AsyncCaller(config.callerOptions ?? {});
        this.batchIngestCaller = new AsyncCaller({
          ...config.callerOptions ?? {},
          onFailedResponseHook: handle429
        });
        this.hideInputs = config.hideInputs ?? defaultConfig.hideInputs;
        this.hideOutputs = config.hideOutputs ?? defaultConfig.hideOutputs;
        this.autoBatchTracing = config.autoBatchTracing ?? this.autoBatchTracing;
        this.pendingAutoBatchedRunLimit = config.pendingAutoBatchedRunLimit ?? this.pendingAutoBatchedRunLimit;
        this.fetchOptions = config.fetchOptions || {};
      }
      static getDefaultClientConfig() {
        const apiKey = getEnvironmentVariable2("LANGCHAIN_API_KEY");
        const apiUrl = getEnvironmentVariable2("LANGCHAIN_ENDPOINT") ?? "https://api.smith.langchain.com";
        const hideInputs = getEnvironmentVariable2("LANGCHAIN_HIDE_INPUTS") === "true";
        const hideOutputs = getEnvironmentVariable2("LANGCHAIN_HIDE_OUTPUTS") === "true";
        return {
          apiUrl,
          apiKey,
          webUrl: void 0,
          hideInputs,
          hideOutputs
        };
      }
      getHostUrl() {
        if (this.webUrl) {
          return this.webUrl;
        } else if (isLocalhost(this.apiUrl)) {
          this.webUrl = "http://localhost";
          return "http://localhost";
        } else if (this.apiUrl.includes("/api") && !this.apiUrl.split(".", 1)[0].endsWith("api")) {
          this.webUrl = this.apiUrl.replace("/api", "");
          return this.webUrl;
        } else if (this.apiUrl.split(".", 1)[0].includes("dev")) {
          this.webUrl = "https://dev.smith.langchain.com";
          return "https://dev.smith.langchain.com";
        } else {
          this.webUrl = "https://smith.langchain.com";
          return "https://smith.langchain.com";
        }
      }
      get headers() {
        const headers = {
          "User-Agent": `langsmith-js/${__version__}`
        };
        if (this.apiKey) {
          headers["x-api-key"] = `${this.apiKey}`;
        }
        return headers;
      }
      processInputs(inputs) {
        if (this.hideInputs === false) {
          return inputs;
        }
        if (this.hideInputs === true) {
          return {};
        }
        if (typeof this.hideInputs === "function") {
          return this.hideInputs(inputs);
        }
        return inputs;
      }
      processOutputs(outputs) {
        if (this.hideOutputs === false) {
          return outputs;
        }
        if (this.hideOutputs === true) {
          return {};
        }
        if (typeof this.hideOutputs === "function") {
          return this.hideOutputs(outputs);
        }
        return outputs;
      }
      prepareRunCreateOrUpdateInputs(run) {
        const runParams = { ...run };
        if (runParams.inputs !== void 0) {
          runParams.inputs = this.processInputs(runParams.inputs);
        }
        if (runParams.outputs !== void 0) {
          runParams.outputs = this.processOutputs(runParams.outputs);
        }
        return runParams;
      }
      async _getResponse(path, queryParams) {
        const paramsString = (queryParams == null ? void 0 : queryParams.toString()) ?? "";
        const url = `${this.apiUrl}${path}?${paramsString}`;
        const response = await this.caller.call(fetch, url, {
          method: "GET",
          headers: this.headers,
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
        }
        return response;
      }
      async _get(path, queryParams) {
        const response = await this._getResponse(path, queryParams);
        return response.json();
      }
      async *_getPaginated(path, queryParams = new URLSearchParams()) {
        let offset = Number(queryParams.get("offset")) || 0;
        const limit = Number(queryParams.get("limit")) || 100;
        while (true) {
          queryParams.set("offset", String(offset));
          queryParams.set("limit", String(limit));
          const url = `${this.apiUrl}${path}?${queryParams}`;
          const response = await this.caller.call(fetch, url, {
            method: "GET",
            headers: this.headers,
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions
          });
          if (!response.ok) {
            throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
          }
          const items = await response.json();
          if (items.length === 0) {
            break;
          }
          yield items;
          if (items.length < limit) {
            break;
          }
          offset += items.length;
        }
      }
      async *_getCursorPaginatedList(path, body = null, requestMethod = "POST", dataKey = "runs") {
        const bodyParams = body ? { ...body } : {};
        while (true) {
          const response = await this.caller.call(fetch, `${this.apiUrl}${path}`, {
            method: requestMethod,
            headers: { ...this.headers, "Content-Type": "application/json" },
            signal: AbortSignal.timeout(this.timeout_ms),
            ...this.fetchOptions,
            body: JSON.stringify(bodyParams)
          });
          const responseBody = await response.json();
          if (!responseBody) {
            break;
          }
          if (!responseBody[dataKey]) {
            break;
          }
          yield responseBody[dataKey];
          const cursors = responseBody.cursors;
          if (!cursors) {
            break;
          }
          if (!cursors.next) {
            break;
          }
          bodyParams.cursor = cursors.next;
        }
      }
      _filterForSampling(runs, patch = false) {
        if (this.tracingSampleRate === void 0) {
          return runs;
        }
        if (patch) {
          const sampled = [];
          for (const run of runs) {
            if (this.sampledPostUuids.has(run.id)) {
              sampled.push(run);
              this.sampledPostUuids.delete(run.id);
            }
          }
          return sampled;
        } else {
          const sampled = [];
          for (const run of runs) {
            if (Math.random() < this.tracingSampleRate) {
              sampled.push(run);
              this.sampledPostUuids.add(run.id);
            }
          }
          return sampled;
        }
      }
      async drainAutoBatchQueue() {
        while (this.autoBatchQueue.size >= 0) {
          const [batch, done] = this.autoBatchQueue.pop(this.pendingAutoBatchedRunLimit);
          if (!batch.length) {
            done();
            return;
          }
          try {
            await this.batchIngestRuns({
              runCreates: batch.filter((item) => item.action === "create").map((item) => item.item),
              runUpdates: batch.filter((item) => item.action === "update").map((item) => item.item)
            });
          } finally {
            done();
          }
        }
      }
      async processRunOperation(item, immediatelyTriggerBatch) {
        const oldTimeout = this.autoBatchTimeout;
        clearTimeout(this.autoBatchTimeout);
        this.autoBatchTimeout = void 0;
        const itemPromise = this.autoBatchQueue.push(item);
        if (immediatelyTriggerBatch || this.autoBatchQueue.size > this.pendingAutoBatchedRunLimit) {
          await this.drainAutoBatchQueue();
        }
        if (this.autoBatchQueue.size > 0) {
          this.autoBatchTimeout = setTimeout(() => {
            this.autoBatchTimeout = void 0;
            void this.drainAutoBatchQueue().catch(console.error);
          }, oldTimeout ? this.autoBatchAggregationDelayMs : this.autoBatchInitialDelayMs);
        }
        return itemPromise;
      }
      async _getServerInfo() {
        const response = await fetch(`${this.apiUrl}/info`, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        if (!response.ok) {
          await response.text();
          throw new Error("Failed to retrieve server info.");
        }
        return response.json();
      }
      async batchEndpointIsSupported() {
        try {
          this.serverInfo = await this._getServerInfo();
        } catch (e) {
          return false;
        }
        return true;
      }
      async createRun(run) {
        if (!this._filterForSampling([run]).length) {
          return;
        }
        const headers = { ...this.headers, "Content-Type": "application/json" };
        const session_name = run.project_name;
        delete run.project_name;
        const runCreate = this.prepareRunCreateOrUpdateInputs({
          session_name,
          ...run,
          start_time: run.start_time ?? Date.now()
        });
        if (this.autoBatchTracing && runCreate.trace_id !== void 0 && runCreate.dotted_order !== void 0) {
          void this.processRunOperation({
            action: "create",
            item: runCreate
          }).catch(console.error);
          return;
        }
        const mergedRunCreateParams = await mergeRuntimeEnvIntoRunCreates([
          runCreate
        ]);
        const response = await this.caller.call(fetch, `${this.apiUrl}/runs`, {
          method: "POST",
          headers,
          body: JSON.stringify(mergedRunCreateParams[0]),
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        await raiseForStatus(response, "create run");
      }
      /**
       * Batch ingest/upsert multiple runs in the Langsmith system.
       * @param runs
       */
      async batchIngestRuns({ runCreates, runUpdates }) {
        var _a, _b;
        if (runCreates === void 0 && runUpdates === void 0) {
          return;
        }
        let preparedCreateParams = (runCreates == null ? void 0 : runCreates.map((create) => this.prepareRunCreateOrUpdateInputs(create))) ?? [];
        let preparedUpdateParams = (runUpdates == null ? void 0 : runUpdates.map((update) => this.prepareRunCreateOrUpdateInputs(update))) ?? [];
        if (preparedCreateParams.length > 0 && preparedUpdateParams.length > 0) {
          const createById = preparedCreateParams.reduce((params, run) => {
            if (!run.id) {
              return params;
            }
            params[run.id] = run;
            return params;
          }, {});
          const standaloneUpdates = [];
          for (const updateParam of preparedUpdateParams) {
            if (updateParam.id !== void 0 && createById[updateParam.id]) {
              createById[updateParam.id] = {
                ...createById[updateParam.id],
                ...updateParam
              };
            } else {
              standaloneUpdates.push(updateParam);
            }
          }
          preparedCreateParams = Object.values(createById);
          preparedUpdateParams = standaloneUpdates;
        }
        const rawBatch = {
          post: this._filterForSampling(preparedCreateParams),
          patch: this._filterForSampling(preparedUpdateParams, true)
        };
        if (!rawBatch.post.length && !rawBatch.patch.length) {
          return;
        }
        preparedCreateParams = await mergeRuntimeEnvIntoRunCreates(preparedCreateParams);
        if (this.batchEndpointSupported === void 0) {
          this.batchEndpointSupported = await this.batchEndpointIsSupported();
        }
        if (!this.batchEndpointSupported) {
          this.autoBatchTracing = false;
          for (const preparedCreateParam of rawBatch.post) {
            await this.createRun(preparedCreateParam);
          }
          for (const preparedUpdateParam of rawBatch.patch) {
            if (preparedUpdateParam.id !== void 0) {
              await this.updateRun(preparedUpdateParam.id, preparedUpdateParam);
            }
          }
          return;
        }
        const sizeLimitBytes = ((_b = (_a = this.serverInfo) == null ? void 0 : _a.batch_ingest_config) == null ? void 0 : _b.size_limit_bytes) ?? DEFAULT_BATCH_SIZE_LIMIT_BYTES;
        const batchChunks = {
          post: [],
          patch: []
        };
        let currentBatchSizeBytes = 0;
        for (const k of ["post", "patch"]) {
          const key = k;
          const batchItems = rawBatch[key].reverse();
          let batchItem = batchItems.pop();
          while (batchItem !== void 0) {
            const stringifiedBatchItem = JSON.stringify(batchItem);
            if (currentBatchSizeBytes > 0 && currentBatchSizeBytes + stringifiedBatchItem.length > sizeLimitBytes) {
              await this._postBatchIngestRuns(JSON.stringify(batchChunks));
              currentBatchSizeBytes = 0;
              batchChunks.post = [];
              batchChunks.patch = [];
            }
            currentBatchSizeBytes += stringifiedBatchItem.length;
            batchChunks[key].push(batchItem);
            batchItem = batchItems.pop();
          }
        }
        if (batchChunks.post.length > 0 || batchChunks.patch.length > 0) {
          await this._postBatchIngestRuns(JSON.stringify(batchChunks));
        }
      }
      async _postBatchIngestRuns(body) {
        const headers = {
          ...this.headers,
          "Content-Type": "application/json",
          Accept: "application/json"
        };
        const response = await this.batchIngestCaller.call(fetch, `${this.apiUrl}/runs/batch`, {
          method: "POST",
          headers,
          body,
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        await raiseForStatus(response, "batch create run");
      }
      async updateRun(runId, run) {
        assertUuid(runId);
        if (run.inputs) {
          run.inputs = this.processInputs(run.inputs);
        }
        if (run.outputs) {
          run.outputs = this.processOutputs(run.outputs);
        }
        const data = { ...run, id: runId };
        if (!this._filterForSampling([data], true).length) {
          return;
        }
        if (this.autoBatchTracing && data.trace_id !== void 0 && data.dotted_order !== void 0) {
          if (run.end_time !== void 0 && data.parent_run_id === void 0) {
            await this.processRunOperation({ action: "update", item: data }, true);
            return;
          } else {
            void this.processRunOperation({ action: "update", item: data }).catch(console.error);
          }
          return;
        }
        const headers = { ...this.headers, "Content-Type": "application/json" };
        const response = await this.caller.call(fetch, `${this.apiUrl}/runs/${runId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(run),
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        await raiseForStatus(response, "update run");
      }
      async readRun(runId, { loadChildRuns } = { loadChildRuns: false }) {
        assertUuid(runId);
        let run = await this._get(`/runs/${runId}`);
        if (loadChildRuns && run.child_run_ids) {
          run = await this._loadChildRuns(run);
        }
        return run;
      }
      async getRunUrl({ runId, run, projectOpts }) {
        if (run !== void 0) {
          let sessionId;
          if (run.session_id) {
            sessionId = run.session_id;
          } else if (projectOpts == null ? void 0 : projectOpts.projectName) {
            sessionId = (await this.readProject({ projectName: projectOpts == null ? void 0 : projectOpts.projectName })).id;
          } else if (projectOpts == null ? void 0 : projectOpts.projectId) {
            sessionId = projectOpts == null ? void 0 : projectOpts.projectId;
          } else {
            const project = await this.readProject({
              projectName: getEnvironmentVariable2("LANGCHAIN_PROJECT") || "default"
            });
            sessionId = project.id;
          }
          const tenantId = await this._getTenantId();
          return `${this.getHostUrl()}/o/${tenantId}/projects/p/${sessionId}/r/${run.id}?poll=true`;
        } else if (runId !== void 0) {
          const run_ = await this.readRun(runId);
          if (!run_.app_path) {
            throw new Error(`Run ${runId} has no app_path`);
          }
          const baseUrl = this.getHostUrl();
          return `${baseUrl}${run_.app_path}`;
        } else {
          throw new Error("Must provide either runId or run");
        }
      }
      async _loadChildRuns(run) {
        const childRuns = await toArray(this.listRuns({ id: run.child_run_ids }));
        const treemap = {};
        const runs = {};
        childRuns.sort((a, b) => ((a == null ? void 0 : a.dotted_order) ?? "").localeCompare((b == null ? void 0 : b.dotted_order) ?? ""));
        for (const childRun of childRuns) {
          if (childRun.parent_run_id === null || childRun.parent_run_id === void 0) {
            throw new Error(`Child run ${childRun.id} has no parent`);
          }
          if (!(childRun.parent_run_id in treemap)) {
            treemap[childRun.parent_run_id] = [];
          }
          treemap[childRun.parent_run_id].push(childRun);
          runs[childRun.id] = childRun;
        }
        run.child_runs = treemap[run.id] || [];
        for (const runId in treemap) {
          if (runId !== run.id) {
            runs[runId].child_runs = treemap[runId];
          }
        }
        return run;
      }
      /**
       * List runs from the LangSmith server.
       * @param projectId - The ID of the project to filter by.
       * @param projectName - The name of the project to filter by.
       * @param parentRunId - The ID of the parent run to filter by.
       * @param traceId - The ID of the trace to filter by.
       * @param referenceExampleId - The ID of the reference example to filter by.
       * @param startTime - The start time to filter by.
       * @param executionOrder - The execution order to filter by.
       * @param runType - The run type to filter by.
       * @param error - Indicates whether to filter by error runs.
       * @param id - The ID of the run to filter by.
       * @param query - The query string to filter by.
       * @param filter - The filter string to apply to the run spans.
       * @param traceFilter - The filter string to apply on the root run of the trace.
       * @param limit - The maximum number of runs to retrieve.
       * @returns {AsyncIterable<Run>} - The runs.
       *
       * @example
       * // List all runs in a project
       * const projectRuns = client.listRuns({ projectName: "<your_project>" });
       *
       * @example
       * // List LLM and Chat runs in the last 24 hours
       * const todaysLLMRuns = client.listRuns({
       *   projectName: "<your_project>",
       *   start_time: new Date(Date.now() - 24 * 60 * 60 * 1000),
       *   run_type: "llm",
       * });
       *
       * @example
       * // List traces in a project
       * const rootRuns = client.listRuns({
       *   projectName: "<your_project>",
       *   execution_order: 1,
       * });
       *
       * @example
       * // List runs without errors
       * const correctRuns = client.listRuns({
       *   projectName: "<your_project>",
       *   error: false,
       * });
       *
       * @example
       * // List runs by run ID
       * const runIds = [
       *   "a36092d2-4ad5-4fb4-9c0d-0dba9a2ed836",
       *   "9398e6be-964f-4aa4-8ae9-ad78cd4b7074",
       * ];
       * const selectedRuns = client.listRuns({ run_ids: runIds });
       *
       * @example
       * // List all "chain" type runs that took more than 10 seconds and had `total_tokens` greater than 5000
       * const chainRuns = client.listRuns({
       *   projectName: "<your_project>",
       *   filter: 'and(eq(run_type, "chain"), gt(latency, 10), gt(total_tokens, 5000))',
       * });
       *
       * @example
       * // List all runs called "extractor" whose root of the trace was assigned feedback "user_score" score of 1
       * const goodExtractorRuns = client.listRuns({
       *   projectName: "<your_project>",
       *   filter: 'eq(name, "extractor")',
       *   traceFilter: 'and(eq(feedback_key, "user_score"), eq(feedback_score, 1))',
       * });
       *
       * @example
       * // List all runs that started after a specific timestamp and either have "error" not equal to null or a "Correctness" feedback score equal to 0
       * const complexRuns = client.listRuns({
       *   projectName: "<your_project>",
       *   filter: 'and(gt(start_time, "2023-07-15T12:34:56Z"), or(neq(error, null), and(eq(feedback_key, "Correctness"), eq(feedback_score, 0.0))))',
       * });
       *
       * @example
       * // List all runs where `tags` include "experimental" or "beta" and `latency` is greater than 2 seconds
       * const taggedRuns = client.listRuns({
       *   projectName: "<your_project>",
       *   filter: 'and(or(has(tags, "experimental"), has(tags, "beta")), gt(latency, 2))',
       * });
       */
      async *listRuns(props) {
        const { projectId, projectName, parentRunId, traceId, referenceExampleId, startTime, executionOrder, runType, error, id, query, filter, traceFilter, treeFilter, limit } = props;
        let projectIds = [];
        if (projectId) {
          projectIds = Array.isArray(projectId) ? projectId : [projectId];
        }
        if (projectName) {
          const projectNames = Array.isArray(projectName) ? projectName : [projectName];
          const projectIds_ = await Promise.all(projectNames.map((name) => this.readProject({ projectName: name }).then((project) => project.id)));
          projectIds.push(...projectIds_);
        }
        const body = {
          session: projectIds.length ? projectIds : null,
          run_type: runType,
          reference_example: referenceExampleId,
          query,
          filter,
          trace_filter: traceFilter,
          tree_filter: treeFilter,
          execution_order: executionOrder,
          parent_run: parentRunId,
          start_time: startTime ? startTime.toISOString() : null,
          error,
          id,
          limit,
          trace: traceId
        };
        for await (const runs of this._getCursorPaginatedList("/runs/query", body)) {
          yield* runs;
        }
      }
      async shareRun(runId, { shareId } = {}) {
        const data = {
          run_id: runId,
          share_token: shareId || v4_default()
        };
        assertUuid(runId);
        const response = await this.caller.call(fetch, `${this.apiUrl}/runs/${runId}/share`, {
          method: "PUT",
          headers: this.headers,
          body: JSON.stringify(data),
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        const result = await response.json();
        if (result === null || !("share_token" in result)) {
          throw new Error("Invalid response from server");
        }
        return `${this.getHostUrl()}/public/${result["share_token"]}/r`;
      }
      async unshareRun(runId) {
        assertUuid(runId);
        const response = await this.caller.call(fetch, `${this.apiUrl}/runs/${runId}/share`, {
          method: "DELETE",
          headers: this.headers,
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        await raiseForStatus(response, "unshare run");
      }
      async readRunSharedLink(runId) {
        assertUuid(runId);
        const response = await this.caller.call(fetch, `${this.apiUrl}/runs/${runId}/share`, {
          method: "GET",
          headers: this.headers,
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        const result = await response.json();
        if (result === null || !("share_token" in result)) {
          return void 0;
        }
        return `${this.getHostUrl()}/public/${result["share_token"]}/r`;
      }
      async listSharedRuns(shareToken, { runIds } = {}) {
        const queryParams = new URLSearchParams({
          share_token: shareToken
        });
        if (runIds !== void 0) {
          for (const runId of runIds) {
            queryParams.append("id", runId);
          }
        }
        assertUuid(shareToken);
        const response = await this.caller.call(fetch, `${this.apiUrl}/public/${shareToken}/runs${queryParams}`, {
          method: "GET",
          headers: this.headers,
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        const runs = await response.json();
        return runs;
      }
      async readDatasetSharedSchema(datasetId, datasetName) {
        if (!datasetId && !datasetName) {
          throw new Error("Either datasetId or datasetName must be given");
        }
        if (!datasetId) {
          const dataset = await this.readDataset({ datasetName });
          datasetId = dataset.id;
        }
        assertUuid(datasetId);
        const response = await this.caller.call(fetch, `${this.apiUrl}/datasets/${datasetId}/share`, {
          method: "GET",
          headers: this.headers,
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        const shareSchema = await response.json();
        shareSchema.url = `${this.getHostUrl()}/public/${shareSchema.share_token}/d`;
        return shareSchema;
      }
      async shareDataset(datasetId, datasetName) {
        if (!datasetId && !datasetName) {
          throw new Error("Either datasetId or datasetName must be given");
        }
        if (!datasetId) {
          const dataset = await this.readDataset({ datasetName });
          datasetId = dataset.id;
        }
        const data = {
          dataset_id: datasetId
        };
        assertUuid(datasetId);
        const response = await this.caller.call(fetch, `${this.apiUrl}/datasets/${datasetId}/share`, {
          method: "PUT",
          headers: this.headers,
          body: JSON.stringify(data),
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        const shareSchema = await response.json();
        shareSchema.url = `${this.getHostUrl()}/public/${shareSchema.share_token}/d`;
        return shareSchema;
      }
      async unshareDataset(datasetId) {
        assertUuid(datasetId);
        const response = await this.caller.call(fetch, `${this.apiUrl}/datasets/${datasetId}/share`, {
          method: "DELETE",
          headers: this.headers,
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        await raiseForStatus(response, "unshare dataset");
      }
      async readSharedDataset(shareToken) {
        assertUuid(shareToken);
        const response = await this.caller.call(fetch, `${this.apiUrl}/public/${shareToken}/datasets`, {
          method: "GET",
          headers: this.headers,
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        const dataset = await response.json();
        return dataset;
      }
      async createProject({ projectName, description = null, metadata = null, upsert = false, projectExtra = null, referenceDatasetId = null }) {
        const upsert_ = upsert ? `?upsert=true` : "";
        const endpoint = `${this.apiUrl}/sessions${upsert_}`;
        const extra = projectExtra || {};
        if (metadata) {
          extra["metadata"] = metadata;
        }
        const body = {
          name: projectName,
          extra,
          description
        };
        if (referenceDatasetId !== null) {
          body["reference_dataset_id"] = referenceDatasetId;
        }
        const response = await this.caller.call(fetch, endpoint, {
          method: "POST",
          headers: { ...this.headers, "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(`Failed to create session ${projectName}: ${response.status} ${response.statusText}`);
        }
        return result;
      }
      async updateProject(projectId, { name = null, description = null, metadata = null, projectExtra = null, endTime = null }) {
        const endpoint = `${this.apiUrl}/sessions/${projectId}`;
        let extra = projectExtra;
        if (metadata) {
          extra = { ...extra || {}, metadata };
        }
        const body = {
          name,
          extra,
          description,
          end_time: endTime ? new Date(endTime).toISOString() : null
        };
        const response = await this.caller.call(fetch, endpoint, {
          method: "PATCH",
          headers: { ...this.headers, "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(`Failed to update project ${projectId}: ${response.status} ${response.statusText}`);
        }
        return result;
      }
      async hasProject({ projectId, projectName }) {
        let path = "/sessions";
        const params = new URLSearchParams();
        if (projectId !== void 0 && projectName !== void 0) {
          throw new Error("Must provide either projectName or projectId, not both");
        } else if (projectId !== void 0) {
          assertUuid(projectId);
          path += `/${projectId}`;
        } else if (projectName !== void 0) {
          params.append("name", projectName);
        } else {
          throw new Error("Must provide projectName or projectId");
        }
        const response = await this.caller.call(fetch, `${this.apiUrl}${path}?${params}`, {
          method: "GET",
          headers: this.headers,
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        try {
          const result = await response.json();
          if (!response.ok) {
            return false;
          }
          if (Array.isArray(result)) {
            return result.length > 0;
          }
          return true;
        } catch (e) {
          return false;
        }
      }
      async readProject({ projectId, projectName, includeStats }) {
        let path = "/sessions";
        const params = new URLSearchParams();
        if (projectId !== void 0 && projectName !== void 0) {
          throw new Error("Must provide either projectName or projectId, not both");
        } else if (projectId !== void 0) {
          assertUuid(projectId);
          path += `/${projectId}`;
        } else if (projectName !== void 0) {
          params.append("name", projectName);
        } else {
          throw new Error("Must provide projectName or projectId");
        }
        if (includeStats !== void 0) {
          params.append("include_stats", includeStats.toString());
        }
        const response = await this._get(path, params);
        let result;
        if (Array.isArray(response)) {
          if (response.length === 0) {
            throw new Error(`Project[id=${projectId}, name=${projectName}] not found`);
          }
          result = response[0];
        } else {
          result = response;
        }
        return result;
      }
      async _getTenantId() {
        if (this._tenantId !== null) {
          return this._tenantId;
        }
        const queryParams = new URLSearchParams({ limit: "1" });
        for await (const projects of this._getPaginated("/sessions", queryParams)) {
          this._tenantId = projects[0].tenant_id;
          return projects[0].tenant_id;
        }
        throw new Error("No projects found to resolve tenant.");
      }
      async *listProjects({ projectIds, name, nameContains, referenceDatasetId, referenceDatasetName, referenceFree } = {}) {
        const params = new URLSearchParams();
        if (projectIds !== void 0) {
          for (const projectId of projectIds) {
            params.append("id", projectId);
          }
        }
        if (name !== void 0) {
          params.append("name", name);
        }
        if (nameContains !== void 0) {
          params.append("name_contains", nameContains);
        }
        if (referenceDatasetId !== void 0) {
          params.append("reference_dataset", referenceDatasetId);
        } else if (referenceDatasetName !== void 0) {
          const dataset = await this.readDataset({
            datasetName: referenceDatasetName
          });
          params.append("reference_dataset", dataset.id);
        }
        if (referenceFree !== void 0) {
          params.append("reference_free", referenceFree.toString());
        }
        for await (const projects of this._getPaginated("/sessions", params)) {
          yield* projects;
        }
      }
      async deleteProject({ projectId, projectName }) {
        let projectId_;
        if (projectId === void 0 && projectName === void 0) {
          throw new Error("Must provide projectName or projectId");
        } else if (projectId !== void 0 && projectName !== void 0) {
          throw new Error("Must provide either projectName or projectId, not both");
        } else if (projectId === void 0) {
          projectId_ = (await this.readProject({ projectName })).id;
        } else {
          projectId_ = projectId;
        }
        assertUuid(projectId_);
        const response = await this.caller.call(fetch, `${this.apiUrl}/sessions/${projectId_}`, {
          method: "DELETE",
          headers: this.headers,
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        await raiseForStatus(response, `delete session ${projectId_} (${projectName})`);
      }
      async uploadCsv({ csvFile, fileName, inputKeys, outputKeys, description, dataType, name }) {
        const url = `${this.apiUrl}/datasets/upload`;
        const formData = new FormData();
        formData.append("file", csvFile, fileName);
        inputKeys.forEach((key) => {
          formData.append("input_keys", key);
        });
        outputKeys.forEach((key) => {
          formData.append("output_keys", key);
        });
        if (description) {
          formData.append("description", description);
        }
        if (dataType) {
          formData.append("data_type", dataType);
        }
        if (name) {
          formData.append("name", name);
        }
        const response = await this.caller.call(fetch, url, {
          method: "POST",
          headers: this.headers,
          body: formData,
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        if (!response.ok) {
          const result2 = await response.json();
          if (result2.detail && result2.detail.includes("already exists")) {
            throw new Error(`Dataset ${fileName} already exists`);
          }
          throw new Error(`Failed to upload CSV: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        return result;
      }
      async createDataset(name, { description, dataType } = {}) {
        const body = {
          name,
          description
        };
        if (dataType) {
          body.data_type = dataType;
        }
        const response = await this.caller.call(fetch, `${this.apiUrl}/datasets`, {
          method: "POST",
          headers: { ...this.headers, "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        if (!response.ok) {
          const result2 = await response.json();
          if (result2.detail && result2.detail.includes("already exists")) {
            throw new Error(`Dataset ${name} already exists`);
          }
          throw new Error(`Failed to create dataset ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        return result;
      }
      async readDataset({ datasetId, datasetName }) {
        let path = "/datasets";
        const params = new URLSearchParams({ limit: "1" });
        if (datasetId !== void 0 && datasetName !== void 0) {
          throw new Error("Must provide either datasetName or datasetId, not both");
        } else if (datasetId !== void 0) {
          assertUuid(datasetId);
          path += `/${datasetId}`;
        } else if (datasetName !== void 0) {
          params.append("name", datasetName);
        } else {
          throw new Error("Must provide datasetName or datasetId");
        }
        const response = await this._get(path, params);
        let result;
        if (Array.isArray(response)) {
          if (response.length === 0) {
            throw new Error(`Dataset[id=${datasetId}, name=${datasetName}] not found`);
          }
          result = response[0];
        } else {
          result = response;
        }
        return result;
      }
      async diffDatasetVersions({ datasetId, datasetName, fromVersion, toVersion }) {
        let datasetId_ = datasetId;
        if (datasetId_ === void 0 && datasetName === void 0) {
          throw new Error("Must provide either datasetName or datasetId");
        } else if (datasetId_ !== void 0 && datasetName !== void 0) {
          throw new Error("Must provide either datasetName or datasetId, not both");
        } else if (datasetId_ === void 0) {
          const dataset = await this.readDataset({ datasetName });
          datasetId_ = dataset.id;
        }
        const urlParams = new URLSearchParams({
          from_version: typeof fromVersion === "string" ? fromVersion : fromVersion.toISOString(),
          to_version: typeof toVersion === "string" ? toVersion : toVersion.toISOString()
        });
        const response = await this._get(`/datasets/${datasetId_}/versions/diff`, urlParams);
        return response;
      }
      async readDatasetOpenaiFinetuning({ datasetId, datasetName }) {
        const path = "/datasets";
        if (datasetId !== void 0) {
        } else if (datasetName !== void 0) {
          datasetId = (await this.readDataset({ datasetName })).id;
        } else {
          throw new Error("Must provide datasetName or datasetId");
        }
        const response = await this._getResponse(`${path}/${datasetId}/openai_ft`);
        const datasetText = await response.text();
        const dataset = datasetText.trim().split("\n").map((line) => JSON.parse(line));
        return dataset;
      }
      async *listDatasets({ limit = 100, offset = 0, datasetIds, datasetName, datasetNameContains } = {}) {
        const path = "/datasets";
        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: offset.toString()
        });
        if (datasetIds !== void 0) {
          for (const id_ of datasetIds) {
            params.append("id", id_);
          }
        }
        if (datasetName !== void 0) {
          params.append("name", datasetName);
        }
        if (datasetNameContains !== void 0) {
          params.append("name_contains", datasetNameContains);
        }
        for await (const datasets of this._getPaginated(path, params)) {
          yield* datasets;
        }
      }
      async deleteDataset({ datasetId, datasetName }) {
        let path = "/datasets";
        let datasetId_ = datasetId;
        if (datasetId !== void 0 && datasetName !== void 0) {
          throw new Error("Must provide either datasetName or datasetId, not both");
        } else if (datasetName !== void 0) {
          const dataset = await this.readDataset({ datasetName });
          datasetId_ = dataset.id;
        }
        if (datasetId_ !== void 0) {
          assertUuid(datasetId_);
          path += `/${datasetId_}`;
        } else {
          throw new Error("Must provide datasetName or datasetId");
        }
        const response = await this.caller.call(fetch, this.apiUrl + path, {
          method: "DELETE",
          headers: this.headers,
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        if (!response.ok) {
          throw new Error(`Failed to delete ${path}: ${response.status} ${response.statusText}`);
        }
        await response.json();
      }
      async createExample(inputs, outputs, { datasetId, datasetName, createdAt, exampleId }) {
        let datasetId_ = datasetId;
        if (datasetId_ === void 0 && datasetName === void 0) {
          throw new Error("Must provide either datasetName or datasetId");
        } else if (datasetId_ !== void 0 && datasetName !== void 0) {
          throw new Error("Must provide either datasetName or datasetId, not both");
        } else if (datasetId_ === void 0) {
          const dataset = await this.readDataset({ datasetName });
          datasetId_ = dataset.id;
        }
        const createdAt_ = createdAt || /* @__PURE__ */ new Date();
        const data = {
          dataset_id: datasetId_,
          inputs,
          outputs,
          created_at: createdAt_ == null ? void 0 : createdAt_.toISOString(),
          id: exampleId
        };
        const response = await this.caller.call(fetch, `${this.apiUrl}/examples`, {
          method: "POST",
          headers: { ...this.headers, "Content-Type": "application/json" },
          body: JSON.stringify(data),
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        if (!response.ok) {
          throw new Error(`Failed to create example: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        return result;
      }
      async createExamples(props) {
        const { inputs, outputs, sourceRunIds, exampleIds, datasetId, datasetName } = props;
        let datasetId_ = datasetId;
        if (datasetId_ === void 0 && datasetName === void 0) {
          throw new Error("Must provide either datasetName or datasetId");
        } else if (datasetId_ !== void 0 && datasetName !== void 0) {
          throw new Error("Must provide either datasetName or datasetId, not both");
        } else if (datasetId_ === void 0) {
          const dataset = await this.readDataset({ datasetName });
          datasetId_ = dataset.id;
        }
        const formattedExamples = inputs.map((input, idx) => {
          return {
            dataset_id: datasetId_,
            inputs: input,
            outputs: outputs ? outputs[idx] : void 0,
            id: exampleIds ? exampleIds[idx] : void 0,
            source_run_id: sourceRunIds ? sourceRunIds[idx] : void 0
          };
        });
        const response = await this.caller.call(fetch, `${this.apiUrl}/examples/bulk`, {
          method: "POST",
          headers: { ...this.headers, "Content-Type": "application/json" },
          body: JSON.stringify(formattedExamples),
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        if (!response.ok) {
          throw new Error(`Failed to create examples: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        return result;
      }
      async createLLMExample(input, generation, options) {
        return this.createExample({ input }, { output: generation }, options);
      }
      async createChatExample(input, generations, options) {
        const finalInput = input.map((message) => {
          if (isLangChainMessage(message)) {
            return convertLangChainMessageToExample(message);
          }
          return message;
        });
        const finalOutput = isLangChainMessage(generations) ? convertLangChainMessageToExample(generations) : generations;
        return this.createExample({ input: finalInput }, { output: finalOutput }, options);
      }
      async readExample(exampleId) {
        assertUuid(exampleId);
        const path = `/examples/${exampleId}`;
        return await this._get(path);
      }
      async *listExamples({ datasetId, datasetName, exampleIds, asOf, inlineS3Urls } = {}) {
        let datasetId_;
        if (datasetId !== void 0 && datasetName !== void 0) {
          throw new Error("Must provide either datasetName or datasetId, not both");
        } else if (datasetId !== void 0) {
          datasetId_ = datasetId;
        } else if (datasetName !== void 0) {
          const dataset = await this.readDataset({ datasetName });
          datasetId_ = dataset.id;
        } else {
          throw new Error("Must provide a datasetName or datasetId");
        }
        const params = new URLSearchParams({ dataset: datasetId_ });
        const dataset_version = asOf ? typeof asOf === "string" ? asOf : asOf == null ? void 0 : asOf.toISOString() : void 0;
        if (dataset_version) {
          params.append("as_of", dataset_version);
        }
        const inlineS3Urls_ = inlineS3Urls ?? true;
        params.append("inline_s3_urls", inlineS3Urls_.toString());
        if (exampleIds !== void 0) {
          for (const id_ of exampleIds) {
            params.append("id", id_);
          }
        }
        for await (const examples of this._getPaginated("/examples", params)) {
          yield* examples;
        }
      }
      async deleteExample(exampleId) {
        assertUuid(exampleId);
        const path = `/examples/${exampleId}`;
        const response = await this.caller.call(fetch, this.apiUrl + path, {
          method: "DELETE",
          headers: this.headers,
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        if (!response.ok) {
          throw new Error(`Failed to delete ${path}: ${response.status} ${response.statusText}`);
        }
        await response.json();
      }
      async updateExample(exampleId, update) {
        assertUuid(exampleId);
        const response = await this.caller.call(fetch, `${this.apiUrl}/examples/${exampleId}`, {
          method: "PATCH",
          headers: { ...this.headers, "Content-Type": "application/json" },
          body: JSON.stringify(update),
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        if (!response.ok) {
          throw new Error(`Failed to update example ${exampleId}: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        return result;
      }
      async evaluateRun(run, evaluator, { sourceInfo, loadChildRuns, referenceExample } = { loadChildRuns: false }) {
        let run_;
        if (typeof run === "string") {
          run_ = await this.readRun(run, { loadChildRuns });
        } else if (typeof run === "object" && "id" in run) {
          run_ = run;
        } else {
          throw new Error(`Invalid run type: ${typeof run}`);
        }
        if (run_.reference_example_id !== null && run_.reference_example_id !== void 0) {
          referenceExample = await this.readExample(run_.reference_example_id);
        }
        const feedbackResult = await evaluator.evaluateRun(run_, referenceExample);
        let sourceInfo_ = sourceInfo ?? {};
        if (feedbackResult.evaluatorInfo) {
          sourceInfo_ = { ...sourceInfo_, ...feedbackResult.evaluatorInfo };
        }
        const runId = feedbackResult.targetRunId ?? run_.id;
        return await this.createFeedback(runId, feedbackResult.key, {
          score: feedbackResult == null ? void 0 : feedbackResult.score,
          value: feedbackResult == null ? void 0 : feedbackResult.value,
          comment: feedbackResult == null ? void 0 : feedbackResult.comment,
          correction: feedbackResult == null ? void 0 : feedbackResult.correction,
          sourceInfo: sourceInfo_,
          feedbackSourceType: "model",
          sourceRunId: feedbackResult == null ? void 0 : feedbackResult.sourceRunId
        });
      }
      async createFeedback(runId, key, { score, value, correction, comment, sourceInfo, feedbackSourceType = "api", sourceRunId, feedbackId, feedbackConfig }) {
        var _a;
        const feedback_source = {
          type: feedbackSourceType ?? "api",
          metadata: sourceInfo ?? {}
        };
        if (sourceRunId !== void 0 && (feedback_source == null ? void 0 : feedback_source.metadata) !== void 0 && !feedback_source.metadata["__run"]) {
          feedback_source.metadata["__run"] = { run_id: sourceRunId };
        }
        if ((feedback_source == null ? void 0 : feedback_source.metadata) !== void 0 && ((_a = feedback_source.metadata["__run"]) == null ? void 0 : _a.run_id) !== void 0) {
          assertUuid(feedback_source.metadata["__run"].run_id);
        }
        const feedback = {
          id: feedbackId ?? v4_default(),
          run_id: runId,
          key,
          score,
          value,
          correction,
          comment,
          feedback_source,
          feedbackConfig
        };
        const url = `${this.apiUrl}/feedback`;
        const response = await this.caller.call(fetch, url, {
          method: "POST",
          headers: { ...this.headers, "Content-Type": "application/json" },
          body: JSON.stringify(feedback),
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        await raiseForStatus(response, "create feedback");
        return feedback;
      }
      async updateFeedback(feedbackId, { score, value, correction, comment }) {
        const feedbackUpdate = {};
        if (score !== void 0 && score !== null) {
          feedbackUpdate["score"] = score;
        }
        if (value !== void 0 && value !== null) {
          feedbackUpdate["value"] = value;
        }
        if (correction !== void 0 && correction !== null) {
          feedbackUpdate["correction"] = correction;
        }
        if (comment !== void 0 && comment !== null) {
          feedbackUpdate["comment"] = comment;
        }
        assertUuid(feedbackId);
        const response = await this.caller.call(fetch, `${this.apiUrl}/feedback/${feedbackId}`, {
          method: "PATCH",
          headers: { ...this.headers, "Content-Type": "application/json" },
          body: JSON.stringify(feedbackUpdate),
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        await raiseForStatus(response, "update feedback");
      }
      async readFeedback(feedbackId) {
        assertUuid(feedbackId);
        const path = `/feedback/${feedbackId}`;
        const response = await this._get(path);
        return response;
      }
      async deleteFeedback(feedbackId) {
        assertUuid(feedbackId);
        const path = `/feedback/${feedbackId}`;
        const response = await this.caller.call(fetch, this.apiUrl + path, {
          method: "DELETE",
          headers: this.headers,
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        if (!response.ok) {
          throw new Error(`Failed to delete ${path}: ${response.status} ${response.statusText}`);
        }
        await response.json();
      }
      async *listFeedback({ runIds, feedbackKeys, feedbackSourceTypes } = {}) {
        const queryParams = new URLSearchParams();
        if (runIds) {
          queryParams.append("run", runIds.join(","));
        }
        if (feedbackKeys) {
          for (const key of feedbackKeys) {
            queryParams.append("key", key);
          }
        }
        if (feedbackSourceTypes) {
          for (const type of feedbackSourceTypes) {
            queryParams.append("source", type);
          }
        }
        for await (const feedbacks of this._getPaginated("/feedback", queryParams)) {
          yield* feedbacks;
        }
      }
      /**
       * Creates a presigned feedback token and URL.
       *
       * The token can be used to authorize feedback metrics without
       * needing an API key. This is useful for giving browser-based
       * applications the ability to submit feedback without needing
       * to expose an API key.
       *
       * @param runId - The ID of the run.
       * @param feedbackKey - The feedback key.
       * @param options - Additional options for the token.
       * @param options.expiration - The expiration time for the token.
       *
       * @returns A promise that resolves to a FeedbackIngestToken.
       */
      async createPresignedFeedbackToken(runId, feedbackKey, { expiration, feedbackConfig } = {}) {
        const body = {
          run_id: runId,
          feedback_key: feedbackKey,
          feedback_config: feedbackConfig
        };
        if (expiration) {
          if (typeof expiration === "string") {
            body["expires_at"] = expiration;
          } else if ((expiration == null ? void 0 : expiration.hours) || (expiration == null ? void 0 : expiration.minutes) || (expiration == null ? void 0 : expiration.days)) {
            body["expires_in"] = expiration;
          }
        } else {
          body["expires_in"] = {
            hours: 3
          };
        }
        const response = await this.caller.call(fetch, `${this.apiUrl}/feedback/tokens`, {
          method: "POST",
          headers: { ...this.headers, "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(this.timeout_ms),
          ...this.fetchOptions
        });
        const result = await response.json();
        return result;
      }
      /**
       * Retrieves a list of presigned feedback tokens for a given run ID.
       * @param runId The ID of the run.
       * @returns An async iterable of FeedbackIngestToken objects.
       */
      async *listPresignedFeedbackTokens(runId) {
        assertUuid(runId);
        const params = new URLSearchParams({ run_id: runId });
        for await (const tokens of this._getPaginated("/feedback/tokens", params)) {
          yield* tokens;
        }
      }
    };
  }
});

// node_modules/langsmith/dist/run_trees.js
var init_run_trees = __esm({
  "node_modules/langsmith/dist/run_trees.js"() {
    "use strict";
    init_env2();
    init_client();
  }
});

// node_modules/langsmith/dist/index.js
var __version__;
var init_dist = __esm({
  "node_modules/langsmith/dist/index.js"() {
    "use strict";
    init_client();
    init_run_trees();
    __version__ = "0.1.14";
  }
});

// node_modules/langsmith/index.js
var init_langsmith = __esm({
  "node_modules/langsmith/index.js"() {
    "use strict";
    init_dist();
  }
});

// node_modules/@langchain/core/dist/tracers/tracer_langchain.js
var LangChainTracer;
var init_tracer_langchain = __esm({
  "node_modules/@langchain/core/dist/tracers/tracer_langchain.js"() {
    "use strict";
    init_langsmith();
    init_env();
    init_base2();
    LangChainTracer = class extends BaseTracer {
      constructor(fields = {}) {
        super(fields);
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "langchain_tracer"
        });
        Object.defineProperty(this, "projectName", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "exampleId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "client", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        const { exampleId, projectName, client } = fields;
        this.projectName = projectName ?? getEnvironmentVariable("LANGCHAIN_PROJECT") ?? getEnvironmentVariable("LANGCHAIN_SESSION");
        this.exampleId = exampleId;
        this.client = client ?? new Client({});
      }
      async _convertToCreate(run, example_id = void 0) {
        return {
          ...run,
          extra: {
            ...run.extra,
            runtime: await getRuntimeEnvironment()
          },
          child_runs: void 0,
          session_name: this.projectName,
          reference_example_id: run.parent_run_id ? void 0 : example_id
        };
      }
      async persistRun(_run) {
      }
      async onRunCreate(run) {
        const persistedRun = await this._convertToCreate(run, this.exampleId);
        await this.client.createRun(persistedRun);
      }
      async onRunUpdate(run) {
        const runUpdate = {
          end_time: run.end_time,
          error: run.error,
          outputs: run.outputs,
          events: run.events,
          inputs: run.inputs,
          trace_id: run.trace_id,
          dotted_order: run.dotted_order,
          parent_run_id: run.parent_run_id
        };
        await this.client.updateRun(run.id, runUpdate);
      }
      getRun(id) {
        return this.runMap.get(id);
      }
    };
  }
});

// node_modules/@langchain/core/dist/utils/json.js
function parsePartialJson(s) {
  if (typeof s === "undefined") {
    return null;
  }
  try {
    return JSON.parse(s);
  } catch (error) {
  }
  let new_s = "";
  const stack = [];
  let isInsideString = false;
  let escaped = false;
  for (let char of s) {
    if (isInsideString) {
      if (char === '"' && !escaped) {
        isInsideString = false;
      } else if (char === "\n" && !escaped) {
        char = "\\n";
      } else if (char === "\\") {
        escaped = !escaped;
      } else {
        escaped = false;
      }
    } else {
      if (char === '"') {
        isInsideString = true;
        escaped = false;
      } else if (char === "{") {
        stack.push("}");
      } else if (char === "[") {
        stack.push("]");
      } else if (char === "}" || char === "]") {
        if (stack && stack[stack.length - 1] === char) {
          stack.pop();
        } else {
          return null;
        }
      }
    }
    new_s += char;
  }
  if (isInsideString) {
    new_s += '"';
  }
  for (let i = stack.length - 1; i >= 0; i -= 1) {
    new_s += stack[i];
  }
  try {
    return JSON.parse(new_s);
  } catch (error) {
    return null;
  }
}
var init_json = __esm({
  "node_modules/@langchain/core/dist/utils/json.js"() {
    "use strict";
  }
});

// node_modules/@langchain/core/dist/messages/base.js
function mergeContent(firstContent, secondContent) {
  if (typeof firstContent === "string") {
    if (typeof secondContent === "string") {
      return firstContent + secondContent;
    } else {
      return [{ type: "text", text: firstContent }, ...secondContent];
    }
  } else if (Array.isArray(secondContent)) {
    return [...firstContent, ...secondContent];
  } else {
    return [...firstContent, { type: "text", text: secondContent }];
  }
}
function _mergeDicts(left, right) {
  const merged = { ...left };
  for (const [key, value] of Object.entries(right)) {
    if (merged[key] == null) {
      merged[key] = value;
    } else if (value == null) {
      continue;
    } else if (typeof merged[key] !== typeof value || Array.isArray(merged[key]) !== Array.isArray(value)) {
      throw new Error(`field[${key}] already exists in the message chunk, but with a different type.`);
    } else if (typeof merged[key] === "string") {
      merged[key] = merged[key] + value;
    } else if (!Array.isArray(merged[key]) && typeof merged[key] === "object") {
      merged[key] = _mergeDicts(merged[key], value);
    } else if (Array.isArray(merged[key])) {
      merged[key] = _mergeLists(merged[key], value);
    } else if (merged[key] === value) {
      continue;
    } else {
      console.warn(`field[${key}] already exists in this message chunk and value has unsupported type.`);
    }
  }
  return merged;
}
function _mergeLists(left, right) {
  if (left === void 0 && right === void 0) {
    return void 0;
  } else if (left === void 0 || right === void 0) {
    return left || right;
  } else {
    const merged = [...left];
    for (const item of right) {
      if (typeof item === "object" && "index" in item && typeof item.index === "number") {
        const toMerge = merged.findIndex((leftItem) => leftItem.index === item.index);
        if (toMerge !== -1) {
          merged[toMerge] = _mergeDicts(merged[toMerge], item);
        } else {
          merged.push(item);
        }
      } else {
        merged.push(item);
      }
    }
    return merged;
  }
}
var BaseMessage, BaseMessageChunk;
var init_base3 = __esm({
  "node_modules/@langchain/core/dist/messages/base.js"() {
    "use strict";
    init_serializable();
    BaseMessage = class extends Serializable {
      get lc_aliases() {
        return {
          additional_kwargs: "additional_kwargs",
          response_metadata: "response_metadata"
        };
      }
      /**
       * @deprecated
       * Use {@link BaseMessage.content} instead.
       */
      get text() {
        return typeof this.content === "string" ? this.content : "";
      }
      constructor(fields, kwargs) {
        if (typeof fields === "string") {
          fields = {
            content: fields,
            additional_kwargs: kwargs,
            response_metadata: {}
          };
        }
        if (!fields.additional_kwargs) {
          fields.additional_kwargs = {};
        }
        if (!fields.response_metadata) {
          fields.response_metadata = {};
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "messages"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "content", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "additional_kwargs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "response_metadata", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.name = fields.name;
        this.content = fields.content;
        this.additional_kwargs = fields.additional_kwargs;
        this.response_metadata = fields.response_metadata;
      }
      toDict() {
        return {
          type: this._getType(),
          data: this.toJSON().kwargs
        };
      }
    };
    BaseMessageChunk = class extends BaseMessage {
    };
  }
});

// node_modules/@langchain/core/dist/messages/tool.js
var init_tool = __esm({
  "node_modules/@langchain/core/dist/messages/tool.js"() {
    "use strict";
    init_base3();
  }
});

// node_modules/@langchain/core/dist/messages/ai.js
var AIMessageChunk;
var init_ai = __esm({
  "node_modules/@langchain/core/dist/messages/ai.js"() {
    "use strict";
    init_json();
    init_base3();
    init_tool();
    AIMessageChunk = class _AIMessageChunk extends BaseMessageChunk {
      constructor(fields) {
        let initParams;
        if (typeof fields === "string") {
          initParams = {
            content: fields,
            tool_calls: [],
            invalid_tool_calls: [],
            tool_call_chunks: []
          };
        } else if (fields.tool_call_chunks === void 0) {
          initParams = {
            ...fields,
            tool_calls: [],
            invalid_tool_calls: [],
            tool_call_chunks: []
          };
        } else {
          const toolCalls = [];
          const invalidToolCalls = [];
          for (const toolCallChunk of fields.tool_call_chunks) {
            let parsedArgs = {};
            try {
              parsedArgs = parsePartialJson(toolCallChunk.args ?? "{}") ?? {};
              if (typeof parsedArgs !== "object" || Array.isArray(parsedArgs)) {
                throw new Error("Malformed tool call chunk args.");
              }
              toolCalls.push({
                name: toolCallChunk.name ?? "",
                args: parsedArgs,
                id: toolCallChunk.id
              });
            } catch (e) {
              invalidToolCalls.push({
                name: toolCallChunk.name,
                args: toolCallChunk.args,
                id: toolCallChunk.id,
                error: "Malformed args."
              });
            }
          }
          initParams = {
            ...fields,
            tool_calls: toolCalls,
            invalid_tool_calls: invalidToolCalls
          };
        }
        super(initParams);
        Object.defineProperty(this, "tool_calls", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "invalid_tool_calls", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "tool_call_chunks", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        this.tool_call_chunks = (initParams == null ? void 0 : initParams.tool_call_chunks) ?? this.tool_call_chunks;
        this.tool_calls = (initParams == null ? void 0 : initParams.tool_calls) ?? this.tool_calls;
        this.invalid_tool_calls = (initParams == null ? void 0 : initParams.invalid_tool_calls) ?? this.invalid_tool_calls;
      }
      get lc_aliases() {
        return {
          ...super.lc_aliases,
          tool_calls: "tool_calls",
          invalid_tool_calls: "invalid_tool_calls",
          tool_call_chunks: "tool_call_chunks"
        };
      }
      static lc_name() {
        return "AIMessageChunk";
      }
      _getType() {
        return "ai";
      }
      concat(chunk) {
        const combinedFields = {
          content: mergeContent(this.content, chunk.content),
          additional_kwargs: _mergeDicts(this.additional_kwargs, chunk.additional_kwargs),
          response_metadata: _mergeDicts(this.response_metadata, chunk.response_metadata),
          tool_call_chunks: []
        };
        if (this.tool_call_chunks !== void 0 || chunk.tool_call_chunks !== void 0) {
          const rawToolCalls = _mergeLists(this.tool_call_chunks, chunk.tool_call_chunks);
          if (rawToolCalls !== void 0 && rawToolCalls.length > 0) {
            combinedFields.tool_call_chunks = rawToolCalls;
          }
        }
        return new _AIMessageChunk(combinedFields);
      }
    };
  }
});

// node_modules/@langchain/core/dist/messages/chat.js
var init_chat = __esm({
  "node_modules/@langchain/core/dist/messages/chat.js"() {
    "use strict";
    init_base3();
  }
});

// node_modules/@langchain/core/dist/messages/function.js
var init_function = __esm({
  "node_modules/@langchain/core/dist/messages/function.js"() {
    "use strict";
    init_base3();
  }
});

// node_modules/@langchain/core/dist/messages/human.js
var HumanMessage;
var init_human = __esm({
  "node_modules/@langchain/core/dist/messages/human.js"() {
    "use strict";
    init_base3();
    HumanMessage = class extends BaseMessage {
      static lc_name() {
        return "HumanMessage";
      }
      _getType() {
        return "human";
      }
    };
  }
});

// node_modules/@langchain/core/dist/messages/system.js
var SystemMessage;
var init_system = __esm({
  "node_modules/@langchain/core/dist/messages/system.js"() {
    "use strict";
    init_base3();
    SystemMessage = class extends BaseMessage {
      static lc_name() {
        return "SystemMessage";
      }
      _getType() {
        return "system";
      }
    };
  }
});

// node_modules/@langchain/core/dist/messages/utils.js
function getBufferString(messages, humanPrefix = "Human", aiPrefix = "AI") {
  const string_messages = [];
  for (const m of messages) {
    let role;
    if (m._getType() === "human") {
      role = humanPrefix;
    } else if (m._getType() === "ai") {
      role = aiPrefix;
    } else if (m._getType() === "system") {
      role = "System";
    } else if (m._getType() === "function") {
      role = "Function";
    } else if (m._getType() === "tool") {
      role = "Tool";
    } else if (m._getType() === "generic") {
      role = m.role;
    } else {
      throw new Error(`Got unsupported message type: ${m._getType()}`);
    }
    const nameStr = m.name ? `${m.name}, ` : "";
    string_messages.push(`${role}: ${nameStr}${m.content}`);
  }
  return string_messages.join("\n");
}
var init_utils = __esm({
  "node_modules/@langchain/core/dist/messages/utils.js"() {
    "use strict";
    init_base3();
    init_human();
    init_ai();
    init_system();
    init_chat();
    init_function();
    init_tool();
  }
});

// node_modules/@langchain/core/dist/messages/index.js
var init_messages2 = __esm({
  "node_modules/@langchain/core/dist/messages/index.js"() {
    "use strict";
    init_ai();
    init_base3();
    init_chat();
    init_function();
    init_human();
    init_system();
    init_utils();
    init_tool();
  }
});

// node_modules/@langchain/core/dist/tracers/tracer_langchain_v1.js
var init_tracer_langchain_v1 = __esm({
  "node_modules/@langchain/core/dist/tracers/tracer_langchain_v1.js"() {
    "use strict";
    init_messages2();
    init_env();
    init_base2();
  }
});

// node_modules/@langchain/core/dist/tracers/initialize.js
async function getTracingV2CallbackHandler() {
  return new LangChainTracer();
}
var init_initialize = __esm({
  "node_modules/@langchain/core/dist/tracers/initialize.js"() {
    "use strict";
    init_tracer_langchain();
    init_tracer_langchain_v1();
  }
});

// node_modules/@langchain/core/dist/callbacks/promises.js
function createQueue() {
  const PQueue = "default" in import_p_queue2.default ? import_p_queue2.default.default : import_p_queue2.default;
  return new PQueue({
    autoStart: true,
    concurrency: 1
  });
}
async function consumeCallback(promiseFn, wait) {
  if (wait === true) {
    await promiseFn();
  } else {
    if (typeof queue === "undefined") {
      queue = createQueue();
    }
    void queue.add(promiseFn);
  }
}
var import_p_queue2, queue;
var init_promises = __esm({
  "node_modules/@langchain/core/dist/callbacks/promises.js"() {
    "use strict";
    import_p_queue2 = __toESM(require_dist(), 1);
  }
});

// node_modules/@langchain/core/dist/callbacks/manager.js
function ensureHandler(handler) {
  if ("name" in handler) {
    return handler;
  }
  return BaseCallbackHandler.fromMethods(handler);
}
var BaseCallbackManager, BaseRunManager, CallbackManagerForRetrieverRun, CallbackManagerForLLMRun, CallbackManagerForChainRun, CallbackManagerForToolRun, CallbackManager;
var init_manager = __esm({
  "node_modules/@langchain/core/dist/callbacks/manager.js"() {
    "use strict";
    init_esm_node();
    init_base();
    init_console();
    init_initialize();
    init_messages2();
    init_env();
    init_tracer_langchain();
    init_promises();
    if (/* @__PURE__ */ getEnvironmentVariable("LANGCHAIN_TRACING_V2") === "true" && /* @__PURE__ */ getEnvironmentVariable("LANGCHAIN_CALLBACKS_BACKGROUND") !== "true") {
      /* @__PURE__ */ console.warn([
        "[WARN]: You have enabled LangSmith tracing without backgrounding callbacks.",
        "[WARN]: If you are not using a serverless environment where you must wait for tracing calls to finish,",
        `[WARN]: we suggest setting "process.env.LANGCHAIN_CALLBACKS_BACKGROUND=true" to avoid additional latency.`
      ].join("\n"));
    }
    BaseCallbackManager = class {
      setHandler(handler) {
        return this.setHandlers([handler]);
      }
    };
    BaseRunManager = class {
      constructor(runId, handlers, inheritableHandlers, tags, inheritableTags, metadata, inheritableMetadata, _parentRunId) {
        Object.defineProperty(this, "runId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: runId
        });
        Object.defineProperty(this, "handlers", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: handlers
        });
        Object.defineProperty(this, "inheritableHandlers", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: inheritableHandlers
        });
        Object.defineProperty(this, "tags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: tags
        });
        Object.defineProperty(this, "inheritableTags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: inheritableTags
        });
        Object.defineProperty(this, "metadata", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: metadata
        });
        Object.defineProperty(this, "inheritableMetadata", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: inheritableMetadata
        });
        Object.defineProperty(this, "_parentRunId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _parentRunId
        });
      }
      async handleText(text) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          var _a;
          try {
            await ((_a = handler.handleText) == null ? void 0 : _a.call(handler, text, this.runId, this._parentRunId, this.tags));
          } catch (err) {
            console.error(`Error in handler ${handler.constructor.name}, handleText: ${err}`);
          }
        }, handler.awaitHandlers)));
      }
    };
    CallbackManagerForRetrieverRun = class extends BaseRunManager {
      getChild(tag) {
        const manager = new CallbackManager(this.runId);
        manager.setHandlers(this.inheritableHandlers);
        manager.addTags(this.inheritableTags);
        manager.addMetadata(this.inheritableMetadata);
        if (tag) {
          manager.addTags([tag], false);
        }
        return manager;
      }
      async handleRetrieverEnd(documents) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          var _a;
          if (!handler.ignoreRetriever) {
            try {
              await ((_a = handler.handleRetrieverEnd) == null ? void 0 : _a.call(handler, documents, this.runId, this._parentRunId, this.tags));
            } catch (err) {
              console.error(`Error in handler ${handler.constructor.name}, handleRetriever`);
            }
          }
        }, handler.awaitHandlers)));
      }
      async handleRetrieverError(err) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          var _a;
          if (!handler.ignoreRetriever) {
            try {
              await ((_a = handler.handleRetrieverError) == null ? void 0 : _a.call(handler, err, this.runId, this._parentRunId, this.tags));
            } catch (error) {
              console.error(`Error in handler ${handler.constructor.name}, handleRetrieverError: ${error}`);
            }
          }
        }, handler.awaitHandlers)));
      }
    };
    CallbackManagerForLLMRun = class extends BaseRunManager {
      async handleLLMNewToken(token, idx, _runId, _parentRunId, _tags, fields) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          var _a;
          if (!handler.ignoreLLM) {
            try {
              await ((_a = handler.handleLLMNewToken) == null ? void 0 : _a.call(handler, token, idx ?? { prompt: 0, completion: 0 }, this.runId, this._parentRunId, this.tags, fields));
            } catch (err) {
              console.error(`Error in handler ${handler.constructor.name}, handleLLMNewToken: ${err}`);
            }
          }
        }, handler.awaitHandlers)));
      }
      async handleLLMError(err) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          var _a;
          if (!handler.ignoreLLM) {
            try {
              await ((_a = handler.handleLLMError) == null ? void 0 : _a.call(handler, err, this.runId, this._parentRunId, this.tags));
            } catch (err2) {
              console.error(`Error in handler ${handler.constructor.name}, handleLLMError: ${err2}`);
            }
          }
        }, handler.awaitHandlers)));
      }
      async handleLLMEnd(output) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          var _a;
          if (!handler.ignoreLLM) {
            try {
              await ((_a = handler.handleLLMEnd) == null ? void 0 : _a.call(handler, output, this.runId, this._parentRunId, this.tags));
            } catch (err) {
              console.error(`Error in handler ${handler.constructor.name}, handleLLMEnd: ${err}`);
            }
          }
        }, handler.awaitHandlers)));
      }
    };
    CallbackManagerForChainRun = class extends BaseRunManager {
      getChild(tag) {
        const manager = new CallbackManager(this.runId);
        manager.setHandlers(this.inheritableHandlers);
        manager.addTags(this.inheritableTags);
        manager.addMetadata(this.inheritableMetadata);
        if (tag) {
          manager.addTags([tag], false);
        }
        return manager;
      }
      async handleChainError(err, _runId, _parentRunId, _tags, kwargs) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          var _a;
          if (!handler.ignoreChain) {
            try {
              await ((_a = handler.handleChainError) == null ? void 0 : _a.call(handler, err, this.runId, this._parentRunId, this.tags, kwargs));
            } catch (err2) {
              console.error(`Error in handler ${handler.constructor.name}, handleChainError: ${err2}`);
            }
          }
        }, handler.awaitHandlers)));
      }
      async handleChainEnd(output, _runId, _parentRunId, _tags, kwargs) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          var _a;
          if (!handler.ignoreChain) {
            try {
              await ((_a = handler.handleChainEnd) == null ? void 0 : _a.call(handler, output, this.runId, this._parentRunId, this.tags, kwargs));
            } catch (err) {
              console.error(`Error in handler ${handler.constructor.name}, handleChainEnd: ${err}`);
            }
          }
        }, handler.awaitHandlers)));
      }
      async handleAgentAction(action) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          var _a;
          if (!handler.ignoreAgent) {
            try {
              await ((_a = handler.handleAgentAction) == null ? void 0 : _a.call(handler, action, this.runId, this._parentRunId, this.tags));
            } catch (err) {
              console.error(`Error in handler ${handler.constructor.name}, handleAgentAction: ${err}`);
            }
          }
        }, handler.awaitHandlers)));
      }
      async handleAgentEnd(action) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          var _a;
          if (!handler.ignoreAgent) {
            try {
              await ((_a = handler.handleAgentEnd) == null ? void 0 : _a.call(handler, action, this.runId, this._parentRunId, this.tags));
            } catch (err) {
              console.error(`Error in handler ${handler.constructor.name}, handleAgentEnd: ${err}`);
            }
          }
        }, handler.awaitHandlers)));
      }
    };
    CallbackManagerForToolRun = class extends BaseRunManager {
      getChild(tag) {
        const manager = new CallbackManager(this.runId);
        manager.setHandlers(this.inheritableHandlers);
        manager.addTags(this.inheritableTags);
        manager.addMetadata(this.inheritableMetadata);
        if (tag) {
          manager.addTags([tag], false);
        }
        return manager;
      }
      async handleToolError(err) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          var _a;
          if (!handler.ignoreAgent) {
            try {
              await ((_a = handler.handleToolError) == null ? void 0 : _a.call(handler, err, this.runId, this._parentRunId, this.tags));
            } catch (err2) {
              console.error(`Error in handler ${handler.constructor.name}, handleToolError: ${err2}`);
            }
          }
        }, handler.awaitHandlers)));
      }
      async handleToolEnd(output) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          var _a;
          if (!handler.ignoreAgent) {
            try {
              await ((_a = handler.handleToolEnd) == null ? void 0 : _a.call(handler, output, this.runId, this._parentRunId, this.tags));
            } catch (err) {
              console.error(`Error in handler ${handler.constructor.name}, handleToolEnd: ${err}`);
            }
          }
        }, handler.awaitHandlers)));
      }
    };
    CallbackManager = class _CallbackManager extends BaseCallbackManager {
      constructor(parentRunId, options) {
        super();
        Object.defineProperty(this, "handlers", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "inheritableHandlers", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "tags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "inheritableTags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "metadata", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: {}
        });
        Object.defineProperty(this, "inheritableMetadata", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: {}
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "callback_manager"
        });
        Object.defineProperty(this, "_parentRunId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.handlers = (options == null ? void 0 : options.handlers) ?? this.handlers;
        this.inheritableHandlers = (options == null ? void 0 : options.inheritableHandlers) ?? this.inheritableHandlers;
        this.tags = (options == null ? void 0 : options.tags) ?? this.tags;
        this.inheritableTags = (options == null ? void 0 : options.inheritableTags) ?? this.inheritableTags;
        this.metadata = (options == null ? void 0 : options.metadata) ?? this.metadata;
        this.inheritableMetadata = (options == null ? void 0 : options.inheritableMetadata) ?? this.inheritableMetadata;
        this._parentRunId = parentRunId;
      }
      /**
       * Gets the parent run ID, if any.
       *
       * @returns The parent run ID.
       */
      getParentRunId() {
        return this._parentRunId;
      }
      async handleLLMStart(llm, prompts, runId = void 0, _parentRunId = void 0, extraParams = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        return Promise.all(prompts.map(async (prompt, idx) => {
          const runId_ = idx === 0 && runId ? runId : v4_default();
          await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
            var _a;
            if (!handler.ignoreLLM) {
              try {
                await ((_a = handler.handleLLMStart) == null ? void 0 : _a.call(handler, llm, [prompt], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName));
              } catch (err) {
                console.error(`Error in handler ${handler.constructor.name}, handleLLMStart: ${err}`);
              }
            }
          }, handler.awaitHandlers)));
          return new CallbackManagerForLLMRun(runId_, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
        }));
      }
      async handleChatModelStart(llm, messages, runId = void 0, _parentRunId = void 0, extraParams = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        return Promise.all(messages.map(async (messageGroup, idx) => {
          const runId_ = idx === 0 && runId ? runId : v4_default();
          await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
            var _a, _b;
            if (!handler.ignoreLLM) {
              try {
                if (handler.handleChatModelStart) {
                  await ((_a = handler.handleChatModelStart) == null ? void 0 : _a.call(handler, llm, [messageGroup], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName));
                } else if (handler.handleLLMStart) {
                  const messageString = getBufferString(messageGroup);
                  await ((_b = handler.handleLLMStart) == null ? void 0 : _b.call(handler, llm, [messageString], runId_, this._parentRunId, extraParams, this.tags, this.metadata, runName));
                }
              } catch (err) {
                console.error(`Error in handler ${handler.constructor.name}, handleLLMStart: ${err}`);
              }
            }
          }, handler.awaitHandlers)));
          return new CallbackManagerForLLMRun(runId_, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
        }));
      }
      async handleChainStart(chain, inputs, runId = v4_default(), runType = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          var _a;
          if (!handler.ignoreChain) {
            try {
              await ((_a = handler.handleChainStart) == null ? void 0 : _a.call(handler, chain, inputs, runId, this._parentRunId, this.tags, this.metadata, runType, runName));
            } catch (err) {
              console.error(`Error in handler ${handler.constructor.name}, handleChainStart: ${err}`);
            }
          }
        }, handler.awaitHandlers)));
        return new CallbackManagerForChainRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
      }
      async handleToolStart(tool, input, runId = v4_default(), _parentRunId = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          var _a;
          if (!handler.ignoreAgent) {
            try {
              await ((_a = handler.handleToolStart) == null ? void 0 : _a.call(handler, tool, input, runId, this._parentRunId, this.tags, this.metadata, runName));
            } catch (err) {
              console.error(`Error in handler ${handler.constructor.name}, handleToolStart: ${err}`);
            }
          }
        }, handler.awaitHandlers)));
        return new CallbackManagerForToolRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
      }
      async handleRetrieverStart(retriever, query, runId = v4_default(), _parentRunId = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
        await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
          var _a;
          if (!handler.ignoreRetriever) {
            try {
              await ((_a = handler.handleRetrieverStart) == null ? void 0 : _a.call(handler, retriever, query, runId, this._parentRunId, this.tags, this.metadata, runName));
            } catch (err) {
              console.error(`Error in handler ${handler.constructor.name}, handleRetrieverStart: ${err}`);
            }
          }
        }, handler.awaitHandlers)));
        return new CallbackManagerForRetrieverRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
      }
      addHandler(handler, inherit = true) {
        this.handlers.push(handler);
        if (inherit) {
          this.inheritableHandlers.push(handler);
        }
      }
      removeHandler(handler) {
        this.handlers = this.handlers.filter((_handler) => _handler !== handler);
        this.inheritableHandlers = this.inheritableHandlers.filter((_handler) => _handler !== handler);
      }
      setHandlers(handlers, inherit = true) {
        this.handlers = [];
        this.inheritableHandlers = [];
        for (const handler of handlers) {
          this.addHandler(handler, inherit);
        }
      }
      addTags(tags, inherit = true) {
        this.removeTags(tags);
        this.tags.push(...tags);
        if (inherit) {
          this.inheritableTags.push(...tags);
        }
      }
      removeTags(tags) {
        this.tags = this.tags.filter((tag) => !tags.includes(tag));
        this.inheritableTags = this.inheritableTags.filter((tag) => !tags.includes(tag));
      }
      addMetadata(metadata, inherit = true) {
        this.metadata = { ...this.metadata, ...metadata };
        if (inherit) {
          this.inheritableMetadata = { ...this.inheritableMetadata, ...metadata };
        }
      }
      removeMetadata(metadata) {
        for (const key of Object.keys(metadata)) {
          delete this.metadata[key];
          delete this.inheritableMetadata[key];
        }
      }
      copy(additionalHandlers = [], inherit = true) {
        const manager = new _CallbackManager(this._parentRunId);
        for (const handler of this.handlers) {
          const inheritable = this.inheritableHandlers.includes(handler);
          manager.addHandler(handler, inheritable);
        }
        for (const tag of this.tags) {
          const inheritable = this.inheritableTags.includes(tag);
          manager.addTags([tag], inheritable);
        }
        for (const key of Object.keys(this.metadata)) {
          const inheritable = Object.keys(this.inheritableMetadata).includes(key);
          manager.addMetadata({ [key]: this.metadata[key] }, inheritable);
        }
        for (const handler of additionalHandlers) {
          if (
            // Prevent multiple copies of console_callback_handler
            manager.handlers.filter((h) => h.name === "console_callback_handler").some((h) => h.name === handler.name)
          ) {
            continue;
          }
          manager.addHandler(handler, inherit);
        }
        return manager;
      }
      static fromHandlers(handlers) {
        class Handler extends BaseCallbackHandler {
          constructor() {
            super();
            Object.defineProperty(this, "name", {
              enumerable: true,
              configurable: true,
              writable: true,
              value: v4_default()
            });
            Object.assign(this, handlers);
          }
        }
        const manager = new this();
        manager.addHandler(new Handler());
        return manager;
      }
      static async configure(inheritableHandlers, localHandlers, inheritableTags, localTags, inheritableMetadata, localMetadata, options) {
        let callbackManager;
        if (inheritableHandlers || localHandlers) {
          if (Array.isArray(inheritableHandlers) || !inheritableHandlers) {
            callbackManager = new _CallbackManager();
            callbackManager.setHandlers((inheritableHandlers == null ? void 0 : inheritableHandlers.map(ensureHandler)) ?? [], true);
          } else {
            callbackManager = inheritableHandlers;
          }
          callbackManager = callbackManager.copy(Array.isArray(localHandlers) ? localHandlers.map(ensureHandler) : localHandlers == null ? void 0 : localHandlers.handlers, false);
        }
        const verboseEnabled = getEnvironmentVariable("LANGCHAIN_VERBOSE") === "true" || (options == null ? void 0 : options.verbose);
        const tracingV2Enabled = getEnvironmentVariable("LANGCHAIN_TRACING_V2") === "true";
        const tracingEnabled = tracingV2Enabled || (getEnvironmentVariable("LANGCHAIN_TRACING") ?? false);
        if (verboseEnabled || tracingEnabled) {
          if (!callbackManager) {
            callbackManager = new _CallbackManager();
          }
          if (verboseEnabled && !callbackManager.handlers.some((handler) => handler.name === ConsoleCallbackHandler.prototype.name)) {
            const consoleHandler = new ConsoleCallbackHandler();
            callbackManager.addHandler(consoleHandler, true);
          }
          if (tracingEnabled && !callbackManager.handlers.some((handler) => handler.name === "langchain_tracer")) {
            if (tracingV2Enabled) {
              callbackManager.addHandler(await getTracingV2CallbackHandler(), true);
            }
          }
        }
        if (inheritableTags || localTags) {
          if (callbackManager) {
            callbackManager.addTags(inheritableTags ?? []);
            callbackManager.addTags(localTags ?? [], false);
          }
        }
        if (inheritableMetadata || localMetadata) {
          if (callbackManager) {
            callbackManager.addMetadata(inheritableMetadata ?? {});
            callbackManager.addMetadata(localMetadata ?? {}, false);
          }
        }
        return callbackManager;
      }
    };
  }
});

// node_modules/@langchain/core/dist/utils/fast-json-patch/src/helpers.js
function hasOwnProperty(obj, key) {
  return _hasOwnProperty.call(obj, key);
}
function _objectKeys(obj) {
  if (Array.isArray(obj)) {
    const keys2 = new Array(obj.length);
    for (let k = 0; k < keys2.length; k++) {
      keys2[k] = "" + k;
    }
    return keys2;
  }
  if (Object.keys) {
    return Object.keys(obj);
  }
  let keys = [];
  for (let i in obj) {
    if (hasOwnProperty(obj, i)) {
      keys.push(i);
    }
  }
  return keys;
}
function _deepClone(obj) {
  switch (typeof obj) {
    case "object":
      return JSON.parse(JSON.stringify(obj));
    case "undefined":
      return null;
    default:
      return obj;
  }
}
function isInteger(str) {
  let i = 0;
  const len = str.length;
  let charCode;
  while (i < len) {
    charCode = str.charCodeAt(i);
    if (charCode >= 48 && charCode <= 57) {
      i++;
      continue;
    }
    return false;
  }
  return true;
}
function escapePathComponent(path) {
  if (path.indexOf("/") === -1 && path.indexOf("~") === -1)
    return path;
  return path.replace(/~/g, "~0").replace(/\//g, "~1");
}
function unescapePathComponent(path) {
  return path.replace(/~1/g, "/").replace(/~0/g, "~");
}
function hasUndefined(obj) {
  if (obj === void 0) {
    return true;
  }
  if (obj) {
    if (Array.isArray(obj)) {
      for (let i2 = 0, len = obj.length; i2 < len; i2++) {
        if (hasUndefined(obj[i2])) {
          return true;
        }
      }
    } else if (typeof obj === "object") {
      const objKeys = _objectKeys(obj);
      const objKeysLength = objKeys.length;
      for (var i = 0; i < objKeysLength; i++) {
        if (hasUndefined(obj[objKeys[i]])) {
          return true;
        }
      }
    }
  }
  return false;
}
function patchErrorMessageFormatter(message, args) {
  const messageParts = [message];
  for (const key in args) {
    const value = typeof args[key] === "object" ? JSON.stringify(args[key], null, 2) : args[key];
    if (typeof value !== "undefined") {
      messageParts.push(`${key}: ${value}`);
    }
  }
  return messageParts.join("\n");
}
var _hasOwnProperty, PatchError;
var init_helpers = __esm({
  "node_modules/@langchain/core/dist/utils/fast-json-patch/src/helpers.js"() {
    "use strict";
    _hasOwnProperty = Object.prototype.hasOwnProperty;
    PatchError = class extends Error {
      constructor(message, name, index, operation, tree) {
        super(patchErrorMessageFormatter(message, { name, index, operation, tree }));
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: name
        });
        Object.defineProperty(this, "index", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: index
        });
        Object.defineProperty(this, "operation", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: operation
        });
        Object.defineProperty(this, "tree", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: tree
        });
        Object.setPrototypeOf(this, new.target.prototype);
        this.message = patchErrorMessageFormatter(message, {
          name,
          index,
          operation,
          tree
        });
      }
    };
  }
});

// node_modules/@langchain/core/dist/utils/fast-json-patch/src/core.js
var core_exports = {};
__export(core_exports, {
  JsonPatchError: () => JsonPatchError,
  _areEquals: () => _areEquals,
  applyOperation: () => applyOperation,
  applyPatch: () => applyPatch,
  applyReducer: () => applyReducer,
  deepClone: () => deepClone,
  getValueByPointer: () => getValueByPointer,
  validate: () => validate2,
  validator: () => validator
});
function getValueByPointer(document, pointer) {
  if (pointer == "") {
    return document;
  }
  var getOriginalDestination = { op: "_get", path: pointer };
  applyOperation(document, getOriginalDestination);
  return getOriginalDestination.value;
}
function applyOperation(document, operation, validateOperation = false, mutateDocument = true, banPrototypeModifications = true, index = 0) {
  if (validateOperation) {
    if (typeof validateOperation == "function") {
      validateOperation(operation, 0, document, operation.path);
    } else {
      validator(operation, 0);
    }
  }
  if (operation.path === "") {
    let returnValue = { newDocument: document };
    if (operation.op === "add") {
      returnValue.newDocument = operation.value;
      return returnValue;
    } else if (operation.op === "replace") {
      returnValue.newDocument = operation.value;
      returnValue.removed = document;
      return returnValue;
    } else if (operation.op === "move" || operation.op === "copy") {
      returnValue.newDocument = getValueByPointer(document, operation.from);
      if (operation.op === "move") {
        returnValue.removed = document;
      }
      return returnValue;
    } else if (operation.op === "test") {
      returnValue.test = _areEquals(document, operation.value);
      if (returnValue.test === false) {
        throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
      }
      returnValue.newDocument = document;
      return returnValue;
    } else if (operation.op === "remove") {
      returnValue.removed = document;
      returnValue.newDocument = null;
      return returnValue;
    } else if (operation.op === "_get") {
      operation.value = document;
      return returnValue;
    } else {
      if (validateOperation) {
        throw new JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902", "OPERATION_OP_INVALID", index, operation, document);
      } else {
        return returnValue;
      }
    }
  } else {
    if (!mutateDocument) {
      document = _deepClone(document);
    }
    const path = operation.path || "";
    const keys = path.split("/");
    let obj = document;
    let t = 1;
    let len = keys.length;
    let existingPathFragment = void 0;
    let key;
    let validateFunction;
    if (typeof validateOperation == "function") {
      validateFunction = validateOperation;
    } else {
      validateFunction = validator;
    }
    while (true) {
      key = keys[t];
      if (key && key.indexOf("~") != -1) {
        key = unescapePathComponent(key);
      }
      if (banPrototypeModifications && (key == "__proto__" || key == "prototype" && t > 0 && keys[t - 1] == "constructor")) {
        throw new TypeError("JSON-Patch: modifying `__proto__` or `constructor/prototype` prop is banned for security reasons, if this was on purpose, please set `banPrototypeModifications` flag false and pass it to this function. More info in fast-json-patch README");
      }
      if (validateOperation) {
        if (existingPathFragment === void 0) {
          if (obj[key] === void 0) {
            existingPathFragment = keys.slice(0, t).join("/");
          } else if (t == len - 1) {
            existingPathFragment = operation.path;
          }
          if (existingPathFragment !== void 0) {
            validateFunction(operation, 0, document, existingPathFragment);
          }
        }
      }
      t++;
      if (Array.isArray(obj)) {
        if (key === "-") {
          key = obj.length;
        } else {
          if (validateOperation && !isInteger(key)) {
            throw new JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index", "OPERATION_PATH_ILLEGAL_ARRAY_INDEX", index, operation, document);
          } else if (isInteger(key)) {
            key = ~~key;
          }
        }
        if (t >= len) {
          if (validateOperation && operation.op === "add" && key > obj.length) {
            throw new JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array", "OPERATION_VALUE_OUT_OF_BOUNDS", index, operation, document);
          }
          const returnValue = arrOps[operation.op].call(operation, obj, key, document);
          if (returnValue.test === false) {
            throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
          }
          return returnValue;
        }
      } else {
        if (t >= len) {
          const returnValue = objOps[operation.op].call(operation, obj, key, document);
          if (returnValue.test === false) {
            throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
          }
          return returnValue;
        }
      }
      obj = obj[key];
      if (validateOperation && t < len && (!obj || typeof obj !== "object")) {
        throw new JsonPatchError("Cannot perform operation at the desired path", "OPERATION_PATH_UNRESOLVABLE", index, operation, document);
      }
    }
  }
}
function applyPatch(document, patch, validateOperation, mutateDocument = true, banPrototypeModifications = true) {
  if (validateOperation) {
    if (!Array.isArray(patch)) {
      throw new JsonPatchError("Patch sequence must be an array", "SEQUENCE_NOT_AN_ARRAY");
    }
  }
  if (!mutateDocument) {
    document = _deepClone(document);
  }
  const results = new Array(patch.length);
  for (let i = 0, length = patch.length; i < length; i++) {
    results[i] = applyOperation(document, patch[i], validateOperation, true, banPrototypeModifications, i);
    document = results[i].newDocument;
  }
  results.newDocument = document;
  return results;
}
function applyReducer(document, operation, index) {
  const operationResult = applyOperation(document, operation);
  if (operationResult.test === false) {
    throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
  }
  return operationResult.newDocument;
}
function validator(operation, index, document, existingPathFragment) {
  if (typeof operation !== "object" || operation === null || Array.isArray(operation)) {
    throw new JsonPatchError("Operation is not an object", "OPERATION_NOT_AN_OBJECT", index, operation, document);
  } else if (!objOps[operation.op]) {
    throw new JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902", "OPERATION_OP_INVALID", index, operation, document);
  } else if (typeof operation.path !== "string") {
    throw new JsonPatchError("Operation `path` property is not a string", "OPERATION_PATH_INVALID", index, operation, document);
  } else if (operation.path.indexOf("/") !== 0 && operation.path.length > 0) {
    throw new JsonPatchError('Operation `path` property must start with "/"', "OPERATION_PATH_INVALID", index, operation, document);
  } else if ((operation.op === "move" || operation.op === "copy") && typeof operation.from !== "string") {
    throw new JsonPatchError("Operation `from` property is not present (applicable in `move` and `copy` operations)", "OPERATION_FROM_REQUIRED", index, operation, document);
  } else if ((operation.op === "add" || operation.op === "replace" || operation.op === "test") && operation.value === void 0) {
    throw new JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)", "OPERATION_VALUE_REQUIRED", index, operation, document);
  } else if ((operation.op === "add" || operation.op === "replace" || operation.op === "test") && hasUndefined(operation.value)) {
    throw new JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)", "OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED", index, operation, document);
  } else if (document) {
    if (operation.op == "add") {
      var pathLen = operation.path.split("/").length;
      var existingPathLen = existingPathFragment.split("/").length;
      if (pathLen !== existingPathLen + 1 && pathLen !== existingPathLen) {
        throw new JsonPatchError("Cannot perform an `add` operation at the desired path", "OPERATION_PATH_CANNOT_ADD", index, operation, document);
      }
    } else if (operation.op === "replace" || operation.op === "remove" || operation.op === "_get") {
      if (operation.path !== existingPathFragment) {
        throw new JsonPatchError("Cannot perform the operation at a path that does not exist", "OPERATION_PATH_UNRESOLVABLE", index, operation, document);
      }
    } else if (operation.op === "move" || operation.op === "copy") {
      var existingValue = {
        op: "_get",
        path: operation.from,
        value: void 0
      };
      var error = validate2([existingValue], document);
      if (error && error.name === "OPERATION_PATH_UNRESOLVABLE") {
        throw new JsonPatchError("Cannot perform the operation from a path that does not exist", "OPERATION_FROM_UNRESOLVABLE", index, operation, document);
      }
    }
  }
}
function validate2(sequence, document, externalValidator) {
  try {
    if (!Array.isArray(sequence)) {
      throw new JsonPatchError("Patch sequence must be an array", "SEQUENCE_NOT_AN_ARRAY");
    }
    if (document) {
      applyPatch(_deepClone(document), _deepClone(sequence), externalValidator || true);
    } else {
      externalValidator = externalValidator || validator;
      for (var i = 0; i < sequence.length; i++) {
        externalValidator(sequence[i], i, document, void 0);
      }
    }
  } catch (e) {
    if (e instanceof JsonPatchError) {
      return e;
    } else {
      throw e;
    }
  }
}
function _areEquals(a, b) {
  if (a === b)
    return true;
  if (a && b && typeof a == "object" && typeof b == "object") {
    var arrA = Array.isArray(a), arrB = Array.isArray(b), i, length, key;
    if (arrA && arrB) {
      length = a.length;
      if (length != b.length)
        return false;
      for (i = length; i-- !== 0; )
        if (!_areEquals(a[i], b[i]))
          return false;
      return true;
    }
    if (arrA != arrB)
      return false;
    var keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length)
      return false;
    for (i = length; i-- !== 0; )
      if (!b.hasOwnProperty(keys[i]))
        return false;
    for (i = length; i-- !== 0; ) {
      key = keys[i];
      if (!_areEquals(a[key], b[key]))
        return false;
    }
    return true;
  }
  return a !== a && b !== b;
}
var JsonPatchError, deepClone, objOps, arrOps;
var init_core = __esm({
  "node_modules/@langchain/core/dist/utils/fast-json-patch/src/core.js"() {
    "use strict";
    init_helpers();
    JsonPatchError = PatchError;
    deepClone = _deepClone;
    objOps = {
      add: function(obj, key, document) {
        obj[key] = this.value;
        return { newDocument: document };
      },
      remove: function(obj, key, document) {
        var removed = obj[key];
        delete obj[key];
        return { newDocument: document, removed };
      },
      replace: function(obj, key, document) {
        var removed = obj[key];
        obj[key] = this.value;
        return { newDocument: document, removed };
      },
      move: function(obj, key, document) {
        let removed = getValueByPointer(document, this.path);
        if (removed) {
          removed = _deepClone(removed);
        }
        const originalValue = applyOperation(document, {
          op: "remove",
          path: this.from
        }).removed;
        applyOperation(document, {
          op: "add",
          path: this.path,
          value: originalValue
        });
        return { newDocument: document, removed };
      },
      copy: function(obj, key, document) {
        const valueToCopy = getValueByPointer(document, this.from);
        applyOperation(document, {
          op: "add",
          path: this.path,
          value: _deepClone(valueToCopy)
        });
        return { newDocument: document };
      },
      test: function(obj, key, document) {
        return { newDocument: document, test: _areEquals(obj[key], this.value) };
      },
      _get: function(obj, key, document) {
        this.value = obj[key];
        return { newDocument: document };
      }
    };
    arrOps = {
      add: function(arr, i, document) {
        if (isInteger(i)) {
          arr.splice(i, 0, this.value);
        } else {
          arr[i] = this.value;
        }
        return { newDocument: document, index: i };
      },
      remove: function(arr, i, document) {
        var removedList = arr.splice(i, 1);
        return { newDocument: document, removed: removedList[0] };
      },
      replace: function(arr, i, document) {
        var removed = arr[i];
        arr[i] = this.value;
        return { newDocument: document, removed };
      },
      move: objOps.move,
      copy: objOps.copy,
      test: objOps.test,
      _get: objOps._get
    };
  }
});

// node_modules/@langchain/core/dist/utils/fast-json-patch/src/duplex.js
var init_duplex = __esm({
  "node_modules/@langchain/core/dist/utils/fast-json-patch/src/duplex.js"() {
    "use strict";
    init_helpers();
    init_core();
  }
});

// node_modules/@langchain/core/dist/utils/fast-json-patch/index.js
var fast_json_patch_default;
var init_fast_json_patch = __esm({
  "node_modules/@langchain/core/dist/utils/fast-json-patch/index.js"() {
    "use strict";
    init_core();
    init_duplex();
    init_helpers();
    init_core();
    init_helpers();
    fast_json_patch_default = {
      ...core_exports,
      // ...duplex,
      JsonPatchError: PatchError,
      deepClone: _deepClone,
      escapePathComponent,
      unescapePathComponent
    };
  }
});

// node_modules/@langchain/core/dist/utils/stream.js
function atee(iter, length = 2) {
  const buffers = Array.from({ length }, () => []);
  return buffers.map(async function* makeIter(buffer) {
    while (true) {
      if (buffer.length === 0) {
        const result = await iter.next();
        for (const buffer2 of buffers) {
          buffer2.push(result);
        }
      } else if (buffer[0].done) {
        return;
      } else {
        yield buffer.shift().value;
      }
    }
  });
}
function concat(first, second) {
  if (Array.isArray(first) && Array.isArray(second)) {
    return first.concat(second);
  } else if (typeof first === "string" && typeof second === "string") {
    return first + second;
  } else if (typeof first === "number" && typeof second === "number") {
    return first + second;
  } else if (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "concat" in first && // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof first.concat === "function"
  ) {
    return first.concat(second);
  } else if (typeof first === "object" && typeof second === "object") {
    const chunk = { ...first };
    for (const [key, value] of Object.entries(second)) {
      if (key in chunk && !Array.isArray(chunk[key])) {
        chunk[key] = concat(chunk[key], value);
      } else {
        chunk[key] = value;
      }
    }
    return chunk;
  } else {
    throw new Error(`Cannot concat ${typeof first} and ${typeof second}`);
  }
}
async function pipeGeneratorWithSetup(to, generator, startSetup, ...args) {
  const gen = new AsyncGeneratorWithSetup(generator, startSetup);
  const setup = await gen.setup;
  return { output: to(gen, setup, ...args), setup };
}
var IterableReadableStream, AsyncGeneratorWithSetup;
var init_stream = __esm({
  "node_modules/@langchain/core/dist/utils/stream.js"() {
    "use strict";
    IterableReadableStream = class _IterableReadableStream extends ReadableStream {
      constructor() {
        super(...arguments);
        Object.defineProperty(this, "reader", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
      }
      ensureReader() {
        if (!this.reader) {
          this.reader = this.getReader();
        }
      }
      async next() {
        this.ensureReader();
        try {
          const result = await this.reader.read();
          if (result.done) {
            this.reader.releaseLock();
            return {
              done: true,
              value: void 0
            };
          } else {
            return {
              done: false,
              value: result.value
            };
          }
        } catch (e) {
          this.reader.releaseLock();
          throw e;
        }
      }
      async return() {
        this.ensureReader();
        if (this.locked) {
          const cancelPromise = this.reader.cancel();
          this.reader.releaseLock();
          await cancelPromise;
        }
        return { done: true, value: void 0 };
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async throw(e) {
        this.ensureReader();
        if (this.locked) {
          const cancelPromise = this.reader.cancel();
          this.reader.releaseLock();
          await cancelPromise;
        }
        throw e;
      }
      [Symbol.asyncIterator]() {
        return this;
      }
      static fromReadableStream(stream) {
        const reader = stream.getReader();
        return new _IterableReadableStream({
          start(controller) {
            return pump();
            function pump() {
              return reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                controller.enqueue(value);
                return pump();
              });
            }
          },
          cancel() {
            reader.releaseLock();
          }
        });
      }
      static fromAsyncGenerator(generator) {
        return new _IterableReadableStream({
          async pull(controller) {
            const { value, done } = await generator.next();
            if (done) {
              controller.close();
            }
            controller.enqueue(value);
          },
          async cancel(reason) {
            await generator.return(reason);
          }
        });
      }
    };
    AsyncGeneratorWithSetup = class {
      constructor(generator, startSetup) {
        Object.defineProperty(this, "generator", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "setup", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "firstResult", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "firstResultUsed", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        this.generator = generator;
        this.setup = new Promise((resolve, reject) => {
          this.firstResult = generator.next();
          if (startSetup) {
            this.firstResult.then(startSetup).then(resolve, reject);
          } else {
            this.firstResult.then((_result) => resolve(void 0), reject);
          }
        });
      }
      async next(...args) {
        if (!this.firstResultUsed) {
          this.firstResultUsed = true;
          return this.firstResult;
        }
        return this.generator.next(...args);
      }
      async return(value) {
        return this.generator.return(value);
      }
      async throw(e) {
        return this.generator.throw(e);
      }
      [Symbol.asyncIterator]() {
        return this;
      }
    };
  }
});

// node_modules/@langchain/core/dist/tracers/log_stream.js
async function _getStandardizedInputs(run, schemaFormat) {
  if (schemaFormat === "original") {
    throw new Error("Do not assign inputs with original schema drop the key for now. When inputs are added to streamLog they should be added with standardized schema for streaming events.");
  }
  const { inputs } = run;
  if (["retriever", "llm", "prompt"].includes(run.run_type)) {
    return inputs;
  }
  if (Object.keys(inputs).length === 1 && (inputs == null ? void 0 : inputs.input) === "") {
    return void 0;
  }
  return inputs.input;
}
async function _getStandardizedOutputs(run, schemaFormat) {
  const { outputs } = run;
  if (schemaFormat === "original") {
    return outputs;
  }
  if (["retriever", "llm", "prompt"].includes(run.run_type)) {
    return outputs;
  }
  if (outputs !== void 0 && Object.keys(outputs).length === 1 && (outputs == null ? void 0 : outputs.output) !== void 0) {
    return outputs.output;
  }
  return outputs;
}
function isChatGenerationChunk(x) {
  return x !== void 0 && x.message !== void 0;
}
var RunLogPatch, RunLog, LogStreamCallbackHandler;
var init_log_stream = __esm({
  "node_modules/@langchain/core/dist/tracers/log_stream.js"() {
    "use strict";
    init_fast_json_patch();
    init_base2();
    init_stream();
    init_messages2();
    RunLogPatch = class {
      constructor(fields) {
        Object.defineProperty(this, "ops", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.ops = fields.ops ?? [];
      }
      concat(other) {
        const ops = this.ops.concat(other.ops);
        const states = applyPatch({}, ops);
        return new RunLog({
          ops,
          state: states[states.length - 1].newDocument
        });
      }
    };
    RunLog = class _RunLog extends RunLogPatch {
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "state", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.state = fields.state;
      }
      concat(other) {
        const ops = this.ops.concat(other.ops);
        const states = applyPatch(this.state, other.ops);
        return new _RunLog({ ops, state: states[states.length - 1].newDocument });
      }
      static fromRunLogPatch(patch) {
        const states = applyPatch({}, patch.ops);
        return new _RunLog({
          ops: patch.ops,
          state: states[states.length - 1].newDocument
        });
      }
    };
    LogStreamCallbackHandler = class extends BaseTracer {
      constructor(fields) {
        super({ _awaitHandler: true, ...fields });
        Object.defineProperty(this, "autoClose", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "includeNames", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "includeTypes", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "includeTags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "excludeNames", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "excludeTypes", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "excludeTags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "_schemaFormat", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "original"
        });
        Object.defineProperty(this, "rootId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "keyMapByRunId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: {}
        });
        Object.defineProperty(this, "counterMapByRunName", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: {}
        });
        Object.defineProperty(this, "transformStream", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "writer", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "receiveStream", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "log_stream_tracer"
        });
        this.autoClose = (fields == null ? void 0 : fields.autoClose) ?? true;
        this.includeNames = fields == null ? void 0 : fields.includeNames;
        this.includeTypes = fields == null ? void 0 : fields.includeTypes;
        this.includeTags = fields == null ? void 0 : fields.includeTags;
        this.excludeNames = fields == null ? void 0 : fields.excludeNames;
        this.excludeTypes = fields == null ? void 0 : fields.excludeTypes;
        this.excludeTags = fields == null ? void 0 : fields.excludeTags;
        this._schemaFormat = (fields == null ? void 0 : fields._schemaFormat) ?? this._schemaFormat;
        this.transformStream = new TransformStream();
        this.writer = this.transformStream.writable.getWriter();
        this.receiveStream = IterableReadableStream.fromReadableStream(this.transformStream.readable);
      }
      [Symbol.asyncIterator]() {
        return this.receiveStream;
      }
      async persistRun(_run) {
      }
      _includeRun(run) {
        if (run.id === this.rootId) {
          return false;
        }
        const runTags = run.tags ?? [];
        let include = this.includeNames === void 0 && this.includeTags === void 0 && this.includeTypes === void 0;
        if (this.includeNames !== void 0) {
          include = include || this.includeNames.includes(run.name);
        }
        if (this.includeTypes !== void 0) {
          include = include || this.includeTypes.includes(run.run_type);
        }
        if (this.includeTags !== void 0) {
          include = include || runTags.find((tag) => {
            var _a;
            return (_a = this.includeTags) == null ? void 0 : _a.includes(tag);
          }) !== void 0;
        }
        if (this.excludeNames !== void 0) {
          include = include && !this.excludeNames.includes(run.name);
        }
        if (this.excludeTypes !== void 0) {
          include = include && !this.excludeTypes.includes(run.run_type);
        }
        if (this.excludeTags !== void 0) {
          include = include && runTags.every((tag) => {
            var _a;
            return !((_a = this.excludeTags) == null ? void 0 : _a.includes(tag));
          });
        }
        return include;
      }
      async *tapOutputIterable(runId, output) {
        for await (const chunk of output) {
          if (runId !== this.rootId) {
            const key = this.keyMapByRunId[runId];
            if (key) {
              await this.writer.write(new RunLogPatch({
                ops: [
                  {
                    op: "add",
                    path: `/logs/${key}/streamed_output/-`,
                    value: chunk
                  }
                ]
              }));
            }
          }
          yield chunk;
        }
      }
      async onRunCreate(run) {
        var _a;
        if (this.rootId === void 0) {
          this.rootId = run.id;
          await this.writer.write(new RunLogPatch({
            ops: [
              {
                op: "replace",
                path: "",
                value: {
                  id: run.id,
                  name: run.name,
                  type: run.run_type,
                  streamed_output: [],
                  final_output: void 0,
                  logs: {}
                }
              }
            ]
          }));
        }
        if (!this._includeRun(run)) {
          return;
        }
        if (this.counterMapByRunName[run.name] === void 0) {
          this.counterMapByRunName[run.name] = 0;
        }
        this.counterMapByRunName[run.name] += 1;
        const count = this.counterMapByRunName[run.name];
        this.keyMapByRunId[run.id] = count === 1 ? run.name : `${run.name}:${count}`;
        const logEntry = {
          id: run.id,
          name: run.name,
          type: run.run_type,
          tags: run.tags ?? [],
          metadata: ((_a = run.extra) == null ? void 0 : _a.metadata) ?? {},
          start_time: new Date(run.start_time).toISOString(),
          streamed_output: [],
          streamed_output_str: [],
          final_output: void 0,
          end_time: void 0
        };
        if (this._schemaFormat === "streaming_events") {
          logEntry.inputs = await _getStandardizedInputs(run, this._schemaFormat);
        }
        await this.writer.write(new RunLogPatch({
          ops: [
            {
              op: "add",
              path: `/logs/${this.keyMapByRunId[run.id]}`,
              value: logEntry
            }
          ]
        }));
      }
      async onRunUpdate(run) {
        try {
          const runName = this.keyMapByRunId[run.id];
          if (runName === void 0) {
            return;
          }
          const ops = [];
          if (this._schemaFormat === "streaming_events") {
            ops.push({
              op: "replace",
              path: `/logs/${runName}/inputs`,
              value: await _getStandardizedInputs(run, this._schemaFormat)
            });
          }
          ops.push({
            op: "add",
            path: `/logs/${runName}/final_output`,
            value: await _getStandardizedOutputs(run, this._schemaFormat)
          });
          if (run.end_time !== void 0) {
            ops.push({
              op: "add",
              path: `/logs/${runName}/end_time`,
              value: new Date(run.end_time).toISOString()
            });
          }
          const patch = new RunLogPatch({ ops });
          await this.writer.write(patch);
        } finally {
          if (run.id === this.rootId) {
            const patch = new RunLogPatch({
              ops: [
                {
                  op: "replace",
                  path: "/final_output",
                  value: await _getStandardizedOutputs(run, this._schemaFormat)
                }
              ]
            });
            await this.writer.write(patch);
            if (this.autoClose) {
              await this.writer.close();
            }
          }
        }
      }
      async onLLMNewToken(run, token, kwargs) {
        const runName = this.keyMapByRunId[run.id];
        if (runName === void 0) {
          return;
        }
        const isChatModel = run.inputs.messages !== void 0;
        let streamedOutputValue;
        if (isChatModel) {
          if (isChatGenerationChunk(kwargs == null ? void 0 : kwargs.chunk)) {
            streamedOutputValue = kwargs == null ? void 0 : kwargs.chunk;
          } else {
            streamedOutputValue = new AIMessageChunk(token);
          }
        } else {
          streamedOutputValue = token;
        }
        const patch = new RunLogPatch({
          ops: [
            {
              op: "add",
              path: `/logs/${runName}/streamed_output_str/-`,
              value: token
            },
            {
              op: "add",
              path: `/logs/${runName}/streamed_output/-`,
              value: streamedOutputValue
            }
          ]
        });
        await this.writer.write(patch);
      }
    };
  }
});

// node_modules/@langchain/core/dist/singletons/index.js
var MockAsyncLocalStorage, AsyncLocalStorageProvider, AsyncLocalStorageProviderSingleton;
var init_singletons = __esm({
  "node_modules/@langchain/core/dist/singletons/index.js"() {
    "use strict";
    MockAsyncLocalStorage = class {
      getStore() {
        return void 0;
      }
      run(_store, callback) {
        callback();
      }
    };
    AsyncLocalStorageProvider = class {
      constructor() {
        Object.defineProperty(this, "asyncLocalStorage", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: new MockAsyncLocalStorage()
        });
        Object.defineProperty(this, "hasBeenInitialized", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
      }
      getInstance() {
        return this.asyncLocalStorage;
      }
      initializeGlobalInstance(instance) {
        if (!this.hasBeenInitialized) {
          this.hasBeenInitialized = true;
          this.asyncLocalStorage = instance;
        }
      }
    };
    AsyncLocalStorageProviderSingleton = new AsyncLocalStorageProvider();
  }
});

// node_modules/@langchain/core/dist/runnables/config.js
async function getCallbackManagerForConfig(config) {
  return CallbackManager.configure(config == null ? void 0 : config.callbacks, void 0, config == null ? void 0 : config.tags, void 0, config == null ? void 0 : config.metadata);
}
function mergeConfigs(...configs) {
  const copy = {};
  for (const options of configs.filter((c) => !!c)) {
    for (const key of Object.keys(options)) {
      if (key === "metadata") {
        copy[key] = { ...copy[key], ...options[key] };
      } else if (key === "tags") {
        const baseKeys = copy[key] ?? [];
        copy[key] = [...new Set(baseKeys.concat(options[key] ?? []))];
      } else if (key === "configurable") {
        copy[key] = { ...copy[key], ...options[key] };
      } else if (key === "callbacks") {
        const baseCallbacks = copy.callbacks;
        const providedCallbacks = options.callbacks;
        if (Array.isArray(providedCallbacks)) {
          if (!baseCallbacks) {
            copy.callbacks = providedCallbacks;
          } else if (Array.isArray(baseCallbacks)) {
            copy.callbacks = baseCallbacks.concat(providedCallbacks);
          } else {
            const manager = baseCallbacks.copy();
            for (const callback of providedCallbacks) {
              manager.addHandler(ensureHandler(callback), true);
            }
            copy.callbacks = manager;
          }
        } else if (providedCallbacks) {
          if (!baseCallbacks) {
            copy.callbacks = providedCallbacks;
          } else if (Array.isArray(baseCallbacks)) {
            const manager = providedCallbacks.copy();
            for (const callback of baseCallbacks) {
              manager.addHandler(ensureHandler(callback), true);
            }
            copy.callbacks = manager;
          } else {
            copy.callbacks = new CallbackManager(providedCallbacks._parentRunId, {
              handlers: baseCallbacks.handlers.concat(providedCallbacks.handlers),
              inheritableHandlers: baseCallbacks.inheritableHandlers.concat(providedCallbacks.inheritableHandlers),
              tags: Array.from(new Set(baseCallbacks.tags.concat(providedCallbacks.tags))),
              inheritableTags: Array.from(new Set(baseCallbacks.inheritableTags.concat(providedCallbacks.inheritableTags))),
              metadata: {
                ...baseCallbacks.metadata,
                ...providedCallbacks.metadata
              }
            });
          }
        }
      } else {
        const typedKey = key;
        copy[typedKey] = options[typedKey] ?? copy[typedKey];
      }
    }
  }
  return copy;
}
function ensureConfig(config) {
  var _a;
  const loadedConfig = config ?? AsyncLocalStorageProviderSingleton.getInstance().getStore();
  let empty = {
    tags: [],
    metadata: {},
    callbacks: void 0,
    recursionLimit: 25,
    runId: void 0
  };
  if (loadedConfig) {
    empty = { ...empty, ...loadedConfig };
  }
  if (loadedConfig == null ? void 0 : loadedConfig.configurable) {
    for (const key of Object.keys(loadedConfig.configurable)) {
      if (PRIMITIVES.has(typeof loadedConfig.configurable[key]) && !((_a = empty.metadata) == null ? void 0 : _a[key])) {
        if (!empty.metadata) {
          empty.metadata = {};
        }
        empty.metadata[key] = loadedConfig.configurable[key];
      }
    }
  }
  return empty;
}
function patchConfig(config = {}, { callbacks, maxConcurrency, recursionLimit, runName, configurable, runId } = {}) {
  const newConfig = ensureConfig(config);
  if (callbacks !== void 0) {
    delete newConfig.runName;
    newConfig.callbacks = callbacks;
  }
  if (recursionLimit !== void 0) {
    newConfig.recursionLimit = recursionLimit;
  }
  if (maxConcurrency !== void 0) {
    newConfig.maxConcurrency = maxConcurrency;
  }
  if (runName !== void 0) {
    newConfig.runName = runName;
  }
  if (configurable !== void 0) {
    newConfig.configurable = { ...newConfig.configurable, ...configurable };
  }
  if (runId !== void 0) {
    delete newConfig.runId;
  }
  return newConfig;
}
var DEFAULT_RECURSION_LIMIT, PRIMITIVES;
var init_config = __esm({
  "node_modules/@langchain/core/dist/runnables/config.js"() {
    "use strict";
    init_manager();
    init_singletons();
    DEFAULT_RECURSION_LIMIT = 25;
    PRIMITIVES = /* @__PURE__ */ new Set(["string", "number", "boolean"]);
  }
});

// node_modules/@langchain/core/dist/utils/async_caller.js
var import_p_retry2, import_p_queue3, STATUS_NO_RETRY2, defaultFailedAttemptHandler, AsyncCaller2;
var init_async_caller2 = __esm({
  "node_modules/@langchain/core/dist/utils/async_caller.js"() {
    "use strict";
    import_p_retry2 = __toESM(require_p_retry(), 1);
    import_p_queue3 = __toESM(require_dist(), 1);
    STATUS_NO_RETRY2 = [
      400,
      401,
      402,
      403,
      404,
      405,
      406,
      407,
      409
      // Conflict
    ];
    defaultFailedAttemptHandler = (error) => {
      var _a, _b;
      if (error.message.startsWith("Cancel") || error.message.startsWith("AbortError") || error.name === "AbortError") {
        throw error;
      }
      if ((error == null ? void 0 : error.code) === "ECONNABORTED") {
        throw error;
      }
      const status = (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((_a = error == null ? void 0 : error.response) == null ? void 0 : _a.status) ?? (error == null ? void 0 : error.status)
      );
      if (status && STATUS_NO_RETRY2.includes(+status)) {
        throw error;
      }
      if (((_b = error == null ? void 0 : error.error) == null ? void 0 : _b.code) === "insufficient_quota") {
        const err = new Error(error == null ? void 0 : error.message);
        err.name = "InsufficientQuotaError";
        throw err;
      }
    };
    AsyncCaller2 = class {
      constructor(params) {
        Object.defineProperty(this, "maxConcurrency", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "maxRetries", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "onFailedAttempt", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "queue", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.maxConcurrency = params.maxConcurrency ?? Infinity;
        this.maxRetries = params.maxRetries ?? 6;
        this.onFailedAttempt = params.onFailedAttempt ?? defaultFailedAttemptHandler;
        const PQueue = "default" in import_p_queue3.default ? import_p_queue3.default.default : import_p_queue3.default;
        this.queue = new PQueue({ concurrency: this.maxConcurrency });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      call(callable, ...args) {
        return this.queue.add(() => (0, import_p_retry2.default)(() => callable(...args).catch((error) => {
          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error(error);
          }
        }), {
          onFailedAttempt: this.onFailedAttempt,
          retries: this.maxRetries,
          randomize: true
          // If needed we can change some of the defaults here,
          // but they're quite sensible.
        }), { throwOnTimeout: true });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callWithOptions(options, callable, ...args) {
        if (options.signal) {
          return Promise.race([
            this.call(callable, ...args),
            new Promise((_, reject) => {
              var _a;
              (_a = options.signal) == null ? void 0 : _a.addEventListener("abort", () => {
                reject(new Error("AbortError"));
              });
            })
          ]);
        }
        return this.call(callable, ...args);
      }
      fetch(...args) {
        return this.call(() => fetch(...args).then((res) => res.ok ? res : Promise.reject(res)));
      }
    };
  }
});

// node_modules/@langchain/core/dist/tracers/root_listener.js
var RootListenersTracer;
var init_root_listener = __esm({
  "node_modules/@langchain/core/dist/tracers/root_listener.js"() {
    "use strict";
    init_base2();
    RootListenersTracer = class extends BaseTracer {
      constructor({ config, onStart, onEnd, onError }) {
        super({ _awaitHandler: true });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "RootListenersTracer"
        });
        Object.defineProperty(this, "rootId", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "config", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "argOnStart", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "argOnEnd", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "argOnError", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.config = config;
        this.argOnStart = onStart;
        this.argOnEnd = onEnd;
        this.argOnError = onError;
      }
      /**
       * This is a legacy method only called once for an entire run tree
       * therefore not useful here
       * @param {Run} _ Not used
       */
      persistRun(_) {
        return Promise.resolve();
      }
      async onRunCreate(run) {
        if (this.rootId) {
          return;
        }
        this.rootId = run.id;
        if (this.argOnStart) {
          if (this.argOnStart.length === 1) {
            await this.argOnStart(run);
          } else if (this.argOnStart.length === 2) {
            await this.argOnStart(run, this.config);
          }
        }
      }
      async onRunUpdate(run) {
        if (run.id !== this.rootId) {
          return;
        }
        if (!run.error) {
          if (this.argOnEnd) {
            if (this.argOnEnd.length === 1) {
              await this.argOnEnd(run);
            } else if (this.argOnEnd.length === 2) {
              await this.argOnEnd(run, this.config);
            }
          }
        } else if (this.argOnError) {
          if (this.argOnError.length === 1) {
            await this.argOnError(run);
          } else if (this.argOnError.length === 2) {
            await this.argOnError(run, this.config);
          }
        }
      }
    };
  }
});

// node_modules/@langchain/core/dist/runnables/utils.js
function isRunnableInterface(thing) {
  return thing ? thing.lc_runnable : false;
}
var _RootEventFilter;
var init_utils2 = __esm({
  "node_modules/@langchain/core/dist/runnables/utils.js"() {
    "use strict";
    _RootEventFilter = class {
      constructor(fields) {
        Object.defineProperty(this, "includeNames", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "includeTypes", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "includeTags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "excludeNames", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "excludeTypes", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "excludeTags", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.includeNames = fields.includeNames;
        this.includeTypes = fields.includeTypes;
        this.includeTags = fields.includeTags;
        this.excludeNames = fields.excludeNames;
        this.excludeTypes = fields.excludeTypes;
        this.excludeTags = fields.excludeTags;
      }
      includeEvent(event, rootType) {
        let include = this.includeNames === void 0 && this.includeTypes === void 0 && this.includeTags === void 0;
        const eventTags = event.tags ?? [];
        if (this.includeNames !== void 0) {
          include = include || this.includeNames.includes(event.name);
        }
        if (this.includeTypes !== void 0) {
          include = include || this.includeTypes.includes(rootType);
        }
        if (this.includeTags !== void 0) {
          include = include || eventTags.some((tag) => {
            var _a;
            return (_a = this.includeTags) == null ? void 0 : _a.includes(tag);
          });
        }
        if (this.excludeNames !== void 0) {
          include = include && !this.excludeNames.includes(event.name);
        }
        if (this.excludeTypes !== void 0) {
          include = include && !this.excludeTypes.includes(rootType);
        }
        if (this.excludeTags !== void 0) {
          include = include && eventTags.every((tag) => {
            var _a;
            return !((_a = this.excludeTags) == null ? void 0 : _a.includes(tag));
          });
        }
        return include;
      }
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/errorMessages.js
function addErrorMessage(res, key, errorMessage, refs) {
  if (!(refs == null ? void 0 : refs.errorMessages))
    return;
  if (errorMessage) {
    res.errorMessage = {
      ...res.errorMessage,
      [key]: errorMessage
    };
  }
}
function setResponseValueAndErrors(res, key, value, errorMessage, refs) {
  res[key] = value;
  addErrorMessage(res, key, errorMessage, refs);
}
var init_errorMessages = __esm({
  "node_modules/zod-to-json-schema/dist/esm/errorMessages.js"() {
    "use strict";
  }
});

// node_modules/zod-to-json-schema/dist/esm/Options.js
var ignoreOverride, defaultOptions, getDefaultOptions;
var init_Options = __esm({
  "node_modules/zod-to-json-schema/dist/esm/Options.js"() {
    "use strict";
    ignoreOverride = Symbol("Let zodToJsonSchema decide on which parser to use");
    defaultOptions = {
      name: void 0,
      $refStrategy: "root",
      basePath: ["#"],
      effectStrategy: "input",
      pipeStrategy: "all",
      dateStrategy: "format:date-time",
      mapStrategy: "entries",
      removeAdditionalStrategy: "passthrough",
      definitionPath: "definitions",
      target: "jsonSchema7",
      strictUnions: false,
      definitions: {},
      errorMessages: false,
      markdownDescription: false,
      patternStrategy: "escape",
      emailStrategy: "format:email"
    };
    getDefaultOptions = (options) => typeof options === "string" ? {
      ...defaultOptions,
      name: options
    } : {
      ...defaultOptions,
      ...options
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/any.js
function parseAnyDef() {
  return {};
}
var init_any = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/any.js"() {
    "use strict";
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/array.js
function parseArrayDef(def, refs) {
  var _a, _b;
  const res = {
    type: "array"
  };
  if (((_b = (_a = def.type) == null ? void 0 : _a._def) == null ? void 0 : _b.typeName) !== ZodFirstPartyTypeKind.ZodAny) {
    res.items = parseDef(def.type._def, {
      ...refs,
      currentPath: [...refs.currentPath, "items"]
    });
  }
  if (def.minLength) {
    setResponseValueAndErrors(res, "minItems", def.minLength.value, def.minLength.message, refs);
  }
  if (def.maxLength) {
    setResponseValueAndErrors(res, "maxItems", def.maxLength.value, def.maxLength.message, refs);
  }
  if (def.exactLength) {
    setResponseValueAndErrors(res, "minItems", def.exactLength.value, def.exactLength.message, refs);
    setResponseValueAndErrors(res, "maxItems", def.exactLength.value, def.exactLength.message, refs);
  }
  return res;
}
var init_array = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/array.js"() {
    "use strict";
    init_lib();
    init_errorMessages();
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/bigint.js
function parseBigintDef(def, refs) {
  const res = {
    type: "integer",
    format: "int64"
  };
  if (!def.checks)
    return res;
  for (const check of def.checks) {
    switch (check.kind) {
      case "min":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
          } else {
            setResponseValueAndErrors(res, "exclusiveMinimum", check.value, check.message, refs);
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMinimum = true;
          }
          setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
        }
        break;
      case "max":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
          } else {
            setResponseValueAndErrors(res, "exclusiveMaximum", check.value, check.message, refs);
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMaximum = true;
          }
          setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
        }
        break;
      case "multipleOf":
        setResponseValueAndErrors(res, "multipleOf", check.value, check.message, refs);
        break;
    }
  }
  return res;
}
var init_bigint = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/bigint.js"() {
    "use strict";
    init_errorMessages();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/boolean.js
function parseBooleanDef() {
  return {
    type: "boolean"
  };
}
var init_boolean = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/boolean.js"() {
    "use strict";
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/branded.js
function parseBrandedDef(_def, refs) {
  return parseDef(_def.type._def, refs);
}
var init_branded = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/branded.js"() {
    "use strict";
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/catch.js
var parseCatchDef;
var init_catch = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/catch.js"() {
    "use strict";
    init_parseDef();
    parseCatchDef = (def, refs) => {
      return parseDef(def.innerType._def, refs);
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/date.js
function parseDateDef(def, refs, overrideDateStrategy) {
  const strategy = overrideDateStrategy ?? refs.dateStrategy;
  if (Array.isArray(strategy)) {
    return {
      anyOf: strategy.map((item, i) => parseDateDef(def, refs, item))
    };
  }
  switch (strategy) {
    case "string":
    case "format:date-time":
      return {
        type: "string",
        format: "date-time"
      };
    case "format:date":
      return {
        type: "string",
        format: "date"
      };
    case "integer":
      return integerDateParser(def, refs);
  }
}
var integerDateParser;
var init_date = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/date.js"() {
    "use strict";
    init_errorMessages();
    integerDateParser = (def, refs) => {
      const res = {
        type: "integer",
        format: "unix-time"
      };
      if (refs.target === "openApi3") {
        return res;
      }
      for (const check of def.checks) {
        switch (check.kind) {
          case "min":
            setResponseValueAndErrors(
              res,
              "minimum",
              check.value,
              // This is in milliseconds
              check.message,
              refs
            );
            break;
          case "max":
            setResponseValueAndErrors(
              res,
              "maximum",
              check.value,
              // This is in milliseconds
              check.message,
              refs
            );
            break;
        }
      }
      return res;
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/default.js
function parseDefaultDef(_def, refs) {
  return {
    ...parseDef(_def.innerType._def, refs),
    default: _def.defaultValue()
  };
}
var init_default = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/default.js"() {
    "use strict";
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/effects.js
function parseEffectsDef(_def, refs) {
  return refs.effectStrategy === "input" ? parseDef(_def.schema._def, refs) : {};
}
var init_effects = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/effects.js"() {
    "use strict";
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/enum.js
function parseEnumDef(def) {
  return {
    type: "string",
    enum: def.values
  };
}
var init_enum = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/enum.js"() {
    "use strict";
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/intersection.js
function parseIntersectionDef(def, refs) {
  const allOf = [
    parseDef(def.left._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", "0"]
    }),
    parseDef(def.right._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", "1"]
    })
  ].filter((x) => !!x);
  let unevaluatedProperties = refs.target === "jsonSchema2019-09" ? { unevaluatedProperties: false } : void 0;
  const mergedAllOf = [];
  allOf.forEach((schema) => {
    if (isJsonSchema7AllOfType(schema)) {
      mergedAllOf.push(...schema.allOf);
      if (schema.unevaluatedProperties === void 0) {
        unevaluatedProperties = void 0;
      }
    } else {
      let nestedSchema = schema;
      if ("additionalProperties" in schema && schema.additionalProperties === false) {
        const { additionalProperties, ...rest } = schema;
        nestedSchema = rest;
      } else {
        unevaluatedProperties = void 0;
      }
      mergedAllOf.push(nestedSchema);
    }
  });
  return mergedAllOf.length ? {
    allOf: mergedAllOf,
    ...unevaluatedProperties
  } : void 0;
}
var isJsonSchema7AllOfType;
var init_intersection = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/intersection.js"() {
    "use strict";
    init_parseDef();
    isJsonSchema7AllOfType = (type) => {
      if ("type" in type && type.type === "string")
        return false;
      return "allOf" in type;
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/literal.js
function parseLiteralDef(def, refs) {
  const parsedType = typeof def.value;
  if (parsedType !== "bigint" && parsedType !== "number" && parsedType !== "boolean" && parsedType !== "string") {
    return {
      type: Array.isArray(def.value) ? "array" : "object"
    };
  }
  if (refs.target === "openApi3") {
    return {
      type: parsedType === "bigint" ? "integer" : parsedType,
      enum: [def.value]
    };
  }
  return {
    type: parsedType === "bigint" ? "integer" : parsedType,
    const: def.value
  };
}
var init_literal = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/literal.js"() {
    "use strict";
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/string.js
function parseStringDef(def, refs) {
  const res = {
    type: "string"
  };
  function processPattern(value) {
    return refs.patternStrategy === "escape" ? escapeNonAlphaNumeric(value) : value;
  }
  if (def.checks) {
    for (const check of def.checks) {
      switch (check.kind) {
        case "min":
          setResponseValueAndErrors(res, "minLength", typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value, check.message, refs);
          break;
        case "max":
          setResponseValueAndErrors(res, "maxLength", typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value, check.message, refs);
          break;
        case "email":
          switch (refs.emailStrategy) {
            case "format:email":
              addFormat(res, "email", check.message, refs);
              break;
            case "format:idn-email":
              addFormat(res, "idn-email", check.message, refs);
              break;
            case "pattern:zod":
              addPattern(res, zodPatterns.email, check.message, refs);
              break;
          }
          break;
        case "url":
          addFormat(res, "uri", check.message, refs);
          break;
        case "uuid":
          addFormat(res, "uuid", check.message, refs);
          break;
        case "regex":
          addPattern(res, check.regex.source, check.message, refs);
          break;
        case "cuid":
          addPattern(res, zodPatterns.cuid, check.message, refs);
          break;
        case "cuid2":
          addPattern(res, zodPatterns.cuid2, check.message, refs);
          break;
        case "startsWith":
          addPattern(res, "^" + processPattern(check.value), check.message, refs);
          break;
        case "endsWith":
          addPattern(res, processPattern(check.value) + "$", check.message, refs);
          break;
        case "datetime":
          addFormat(res, "date-time", check.message, refs);
          break;
        case "length":
          setResponseValueAndErrors(res, "minLength", typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value, check.message, refs);
          setResponseValueAndErrors(res, "maxLength", typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value, check.message, refs);
          break;
        case "includes": {
          addPattern(res, processPattern(check.value), check.message, refs);
          break;
        }
        case "ip": {
          if (check.version !== "v6") {
            addFormat(res, "ipv4", check.message, refs);
          }
          if (check.version !== "v4") {
            addFormat(res, "ipv6", check.message, refs);
          }
          break;
        }
        case "emoji":
          addPattern(res, zodPatterns.emoji, check.message, refs);
          break;
        case "ulid": {
          addPattern(res, zodPatterns.ulid, check.message, refs);
          break;
        }
        case "toLowerCase":
        case "toUpperCase":
        case "trim":
          break;
        default:
          /* @__PURE__ */ ((_) => {
          })(check);
      }
    }
  }
  return res;
}
var zodPatterns, escapeNonAlphaNumeric, addFormat, addPattern;
var init_string = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/string.js"() {
    "use strict";
    init_errorMessages();
    zodPatterns = {
      /**
       * `c` was changed to `[cC]` to replicate /i flag
       */
      cuid: "^[cC][^\\s-]{8,}$",
      cuid2: "^[a-z][a-z0-9]*$",
      ulid: "^[0-9A-HJKMNP-TV-Z]{26}$",
      /**
       * `a-z` was added to replicate /i flag
       */
      email: "^(?!\\.)(?!.*\\.\\.)([a-zA-Z0-9_+-\\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\\-]*\\.)+[a-zA-Z]{2,}$",
      emoji: "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",
      /**
       * Unused
       */
      uuid: "^[0-9a-fA-F]{8}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{12}$",
      /**
       * Unused
       */
      ipv4: "^(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))$",
      /**
       * Unused
       */
      ipv6: "^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$"
    };
    escapeNonAlphaNumeric = (value) => Array.from(value).map((c) => /[a-zA-Z0-9]/.test(c) ? c : `\\${c}`).join("");
    addFormat = (schema, value, message, refs) => {
      var _a;
      if (schema.format || ((_a = schema.anyOf) == null ? void 0 : _a.some((x) => x.format))) {
        if (!schema.anyOf) {
          schema.anyOf = [];
        }
        if (schema.format) {
          schema.anyOf.push({
            format: schema.format,
            ...schema.errorMessage && refs.errorMessages && {
              errorMessage: { format: schema.errorMessage.format }
            }
          });
          delete schema.format;
          if (schema.errorMessage) {
            delete schema.errorMessage.format;
            if (Object.keys(schema.errorMessage).length === 0) {
              delete schema.errorMessage;
            }
          }
        }
        schema.anyOf.push({
          format: value,
          ...message && refs.errorMessages && { errorMessage: { format: message } }
        });
      } else {
        setResponseValueAndErrors(schema, "format", value, message, refs);
      }
    };
    addPattern = (schema, value, message, refs) => {
      var _a;
      if (schema.pattern || ((_a = schema.allOf) == null ? void 0 : _a.some((x) => x.pattern))) {
        if (!schema.allOf) {
          schema.allOf = [];
        }
        if (schema.pattern) {
          schema.allOf.push({
            pattern: schema.pattern,
            ...schema.errorMessage && refs.errorMessages && {
              errorMessage: { pattern: schema.errorMessage.pattern }
            }
          });
          delete schema.pattern;
          if (schema.errorMessage) {
            delete schema.errorMessage.pattern;
            if (Object.keys(schema.errorMessage).length === 0) {
              delete schema.errorMessage;
            }
          }
        }
        schema.allOf.push({
          pattern: value,
          ...message && refs.errorMessages && { errorMessage: { pattern: message } }
        });
      } else {
        setResponseValueAndErrors(schema, "pattern", value, message, refs);
      }
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/record.js
function parseRecordDef(def, refs) {
  var _a, _b, _c, _d;
  if (refs.target === "openApi3" && ((_a = def.keyType) == null ? void 0 : _a._def.typeName) === ZodFirstPartyTypeKind.ZodEnum) {
    return {
      type: "object",
      required: def.keyType._def.values,
      properties: def.keyType._def.values.reduce((acc, key) => ({
        ...acc,
        [key]: parseDef(def.valueType._def, {
          ...refs,
          currentPath: [...refs.currentPath, "properties", key]
        }) ?? {}
      }), {}),
      additionalProperties: false
    };
  }
  const schema = {
    type: "object",
    additionalProperties: parseDef(def.valueType._def, {
      ...refs,
      currentPath: [...refs.currentPath, "additionalProperties"]
    }) ?? {}
  };
  if (refs.target === "openApi3") {
    return schema;
  }
  if (((_b = def.keyType) == null ? void 0 : _b._def.typeName) === ZodFirstPartyTypeKind.ZodString && ((_c = def.keyType._def.checks) == null ? void 0 : _c.length)) {
    const keyType = Object.entries(parseStringDef(def.keyType._def, refs)).reduce((acc, [key, value]) => key === "type" ? acc : { ...acc, [key]: value }, {});
    return {
      ...schema,
      propertyNames: keyType
    };
  } else if (((_d = def.keyType) == null ? void 0 : _d._def.typeName) === ZodFirstPartyTypeKind.ZodEnum) {
    return {
      ...schema,
      propertyNames: {
        enum: def.keyType._def.values
      }
    };
  }
  return schema;
}
var init_record = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/record.js"() {
    "use strict";
    init_lib();
    init_parseDef();
    init_string();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/map.js
function parseMapDef(def, refs) {
  if (refs.mapStrategy === "record") {
    return parseRecordDef(def, refs);
  }
  const keys = parseDef(def.keyType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items", "items", "0"]
  }) || {};
  const values = parseDef(def.valueType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items", "items", "1"]
  }) || {};
  return {
    type: "array",
    maxItems: 125,
    items: {
      type: "array",
      items: [keys, values],
      minItems: 2,
      maxItems: 2
    }
  };
}
var init_map = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/map.js"() {
    "use strict";
    init_parseDef();
    init_record();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/nativeEnum.js
function parseNativeEnumDef(def) {
  const object = def.values;
  const actualKeys = Object.keys(def.values).filter((key) => {
    return typeof object[object[key]] !== "number";
  });
  const actualValues = actualKeys.map((key) => object[key]);
  const parsedTypes = Array.from(new Set(actualValues.map((values) => typeof values)));
  return {
    type: parsedTypes.length === 1 ? parsedTypes[0] === "string" ? "string" : "number" : ["string", "number"],
    enum: actualValues
  };
}
var init_nativeEnum = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/nativeEnum.js"() {
    "use strict";
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/never.js
function parseNeverDef() {
  return {
    not: {}
  };
}
var init_never = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/never.js"() {
    "use strict";
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/null.js
function parseNullDef(refs) {
  return refs.target === "openApi3" ? {
    enum: ["null"],
    nullable: true
  } : {
    type: "null"
  };
}
var init_null = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/null.js"() {
    "use strict";
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/union.js
function parseUnionDef(def, refs) {
  if (refs.target === "openApi3")
    return asAnyOf(def, refs);
  const options = def.options instanceof Map ? Array.from(def.options.values()) : def.options;
  if (options.every((x) => x._def.typeName in primitiveMappings && (!x._def.checks || !x._def.checks.length))) {
    const types = options.reduce((types2, x) => {
      const type = primitiveMappings[x._def.typeName];
      return type && !types2.includes(type) ? [...types2, type] : types2;
    }, []);
    return {
      type: types.length > 1 ? types : types[0]
    };
  } else if (options.every((x) => x._def.typeName === "ZodLiteral" && !x.description)) {
    const types = options.reduce((acc, x) => {
      const type = typeof x._def.value;
      switch (type) {
        case "string":
        case "number":
        case "boolean":
          return [...acc, type];
        case "bigint":
          return [...acc, "integer"];
        case "object":
          if (x._def.value === null)
            return [...acc, "null"];
        case "symbol":
        case "undefined":
        case "function":
        default:
          return acc;
      }
    }, []);
    if (types.length === options.length) {
      const uniqueTypes = types.filter((x, i, a) => a.indexOf(x) === i);
      return {
        type: uniqueTypes.length > 1 ? uniqueTypes : uniqueTypes[0],
        enum: options.reduce((acc, x) => {
          return acc.includes(x._def.value) ? acc : [...acc, x._def.value];
        }, [])
      };
    }
  } else if (options.every((x) => x._def.typeName === "ZodEnum")) {
    return {
      type: "string",
      enum: options.reduce((acc, x) => [
        ...acc,
        ...x._def.values.filter((x2) => !acc.includes(x2))
      ], [])
    };
  }
  return asAnyOf(def, refs);
}
var primitiveMappings, asAnyOf;
var init_union = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/union.js"() {
    "use strict";
    init_parseDef();
    primitiveMappings = {
      ZodString: "string",
      ZodNumber: "number",
      ZodBigInt: "integer",
      ZodBoolean: "boolean",
      ZodNull: "null"
    };
    asAnyOf = (def, refs) => {
      const anyOf = (def.options instanceof Map ? Array.from(def.options.values()) : def.options).map((x, i) => parseDef(x._def, {
        ...refs,
        currentPath: [...refs.currentPath, "anyOf", `${i}`]
      })).filter((x) => !!x && (!refs.strictUnions || typeof x === "object" && Object.keys(x).length > 0));
      return anyOf.length ? { anyOf } : void 0;
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/nullable.js
function parseNullableDef(def, refs) {
  if (["ZodString", "ZodNumber", "ZodBigInt", "ZodBoolean", "ZodNull"].includes(def.innerType._def.typeName) && (!def.innerType._def.checks || !def.innerType._def.checks.length)) {
    if (refs.target === "openApi3") {
      return {
        type: primitiveMappings[def.innerType._def.typeName],
        nullable: true
      };
    }
    return {
      type: [
        primitiveMappings[def.innerType._def.typeName],
        "null"
      ]
    };
  }
  if (refs.target === "openApi3") {
    const base2 = parseDef(def.innerType._def, {
      ...refs,
      currentPath: [...refs.currentPath]
    });
    if (base2 && "$ref" in base2)
      return { allOf: [base2], nullable: true };
    return base2 && { ...base2, nullable: true };
  }
  const base = parseDef(def.innerType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "anyOf", "0"]
  });
  return base && { anyOf: [base, { type: "null" }] };
}
var init_nullable = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/nullable.js"() {
    "use strict";
    init_parseDef();
    init_union();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/number.js
function parseNumberDef(def, refs) {
  const res = {
    type: "number"
  };
  if (!def.checks)
    return res;
  for (const check of def.checks) {
    switch (check.kind) {
      case "int":
        res.type = "integer";
        addErrorMessage(res, "type", check.message, refs);
        break;
      case "min":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
          } else {
            setResponseValueAndErrors(res, "exclusiveMinimum", check.value, check.message, refs);
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMinimum = true;
          }
          setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
        }
        break;
      case "max":
        if (refs.target === "jsonSchema7") {
          if (check.inclusive) {
            setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
          } else {
            setResponseValueAndErrors(res, "exclusiveMaximum", check.value, check.message, refs);
          }
        } else {
          if (!check.inclusive) {
            res.exclusiveMaximum = true;
          }
          setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
        }
        break;
      case "multipleOf":
        setResponseValueAndErrors(res, "multipleOf", check.value, check.message, refs);
        break;
    }
  }
  return res;
}
var init_number = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/number.js"() {
    "use strict";
    init_errorMessages();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/object.js
function decideAdditionalProperties(def, refs) {
  if (refs.removeAdditionalStrategy === "strict") {
    return def.catchall._def.typeName === "ZodNever" ? def.unknownKeys !== "strict" : parseDef(def.catchall._def, {
      ...refs,
      currentPath: [...refs.currentPath, "additionalProperties"]
    }) ?? true;
  } else {
    return def.catchall._def.typeName === "ZodNever" ? def.unknownKeys === "passthrough" : parseDef(def.catchall._def, {
      ...refs,
      currentPath: [...refs.currentPath, "additionalProperties"]
    }) ?? true;
  }
}
function parseObjectDef(def, refs) {
  const result = {
    type: "object",
    ...Object.entries(def.shape()).reduce((acc, [propName, propDef]) => {
      if (propDef === void 0 || propDef._def === void 0)
        return acc;
      const parsedDef = parseDef(propDef._def, {
        ...refs,
        currentPath: [...refs.currentPath, "properties", propName],
        propertyPath: [...refs.currentPath, "properties", propName]
      });
      if (parsedDef === void 0)
        return acc;
      return {
        properties: { ...acc.properties, [propName]: parsedDef },
        required: propDef.isOptional() ? acc.required : [...acc.required, propName]
      };
    }, { properties: {}, required: [] }),
    additionalProperties: decideAdditionalProperties(def, refs)
  };
  if (!result.required.length)
    delete result.required;
  return result;
}
var init_object = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/object.js"() {
    "use strict";
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/optional.js
var parseOptionalDef;
var init_optional = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/optional.js"() {
    "use strict";
    init_parseDef();
    parseOptionalDef = (def, refs) => {
      var _a;
      if (refs.currentPath.toString() === ((_a = refs.propertyPath) == null ? void 0 : _a.toString())) {
        return parseDef(def.innerType._def, refs);
      }
      const innerSchema = parseDef(def.innerType._def, {
        ...refs,
        currentPath: [...refs.currentPath, "anyOf", "1"]
      });
      return innerSchema ? {
        anyOf: [
          {
            not: {}
          },
          innerSchema
        ]
      } : {};
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/pipeline.js
var parsePipelineDef;
var init_pipeline = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/pipeline.js"() {
    "use strict";
    init_parseDef();
    parsePipelineDef = (def, refs) => {
      if (refs.pipeStrategy === "input") {
        return parseDef(def.in._def, refs);
      } else if (refs.pipeStrategy === "output") {
        return parseDef(def.out._def, refs);
      }
      const a = parseDef(def.in._def, {
        ...refs,
        currentPath: [...refs.currentPath, "allOf", "0"]
      });
      const b = parseDef(def.out._def, {
        ...refs,
        currentPath: [...refs.currentPath, "allOf", a ? "1" : "0"]
      });
      return {
        allOf: [a, b].filter((x) => x !== void 0)
      };
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/promise.js
function parsePromiseDef(def, refs) {
  return parseDef(def.type._def, refs);
}
var init_promise = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/promise.js"() {
    "use strict";
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/set.js
function parseSetDef(def, refs) {
  const items = parseDef(def.valueType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items"]
  });
  const schema = {
    type: "array",
    uniqueItems: true,
    items
  };
  if (def.minSize) {
    setResponseValueAndErrors(schema, "minItems", def.minSize.value, def.minSize.message, refs);
  }
  if (def.maxSize) {
    setResponseValueAndErrors(schema, "maxItems", def.maxSize.value, def.maxSize.message, refs);
  }
  return schema;
}
var init_set = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/set.js"() {
    "use strict";
    init_errorMessages();
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/tuple.js
function parseTupleDef(def, refs) {
  if (def.rest) {
    return {
      type: "array",
      minItems: def.items.length,
      items: def.items.map((x, i) => parseDef(x._def, {
        ...refs,
        currentPath: [...refs.currentPath, "items", `${i}`]
      })).reduce((acc, x) => x === void 0 ? acc : [...acc, x], []),
      additionalItems: parseDef(def.rest._def, {
        ...refs,
        currentPath: [...refs.currentPath, "additionalItems"]
      })
    };
  } else {
    return {
      type: "array",
      minItems: def.items.length,
      maxItems: def.items.length,
      items: def.items.map((x, i) => parseDef(x._def, {
        ...refs,
        currentPath: [...refs.currentPath, "items", `${i}`]
      })).reduce((acc, x) => x === void 0 ? acc : [...acc, x], [])
    };
  }
}
var init_tuple = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/tuple.js"() {
    "use strict";
    init_parseDef();
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/undefined.js
function parseUndefinedDef() {
  return {
    not: {}
  };
}
var init_undefined = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/undefined.js"() {
    "use strict";
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/unknown.js
function parseUnknownDef() {
  return {};
}
var init_unknown = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/unknown.js"() {
    "use strict";
  }
});

// node_modules/zod-to-json-schema/dist/esm/parsers/readonly.js
var parseReadonlyDef;
var init_readonly = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parsers/readonly.js"() {
    "use strict";
    init_parseDef();
    parseReadonlyDef = (def, refs) => {
      return parseDef(def.innerType._def, refs);
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/parseDef.js
function parseDef(def, refs, forceResolution = false) {
  var _a;
  const seenItem = refs.seen.get(def);
  if (refs.override) {
    const overrideResult = (_a = refs.override) == null ? void 0 : _a.call(refs, def, refs, seenItem, forceResolution);
    if (overrideResult !== ignoreOverride) {
      return overrideResult;
    }
  }
  if (seenItem && !forceResolution) {
    const seenSchema = get$ref(seenItem, refs);
    if (seenSchema !== void 0) {
      return seenSchema;
    }
  }
  const newItem = { def, path: refs.currentPath, jsonSchema: void 0 };
  refs.seen.set(def, newItem);
  const jsonSchema = selectParser(def, def.typeName, refs);
  if (jsonSchema) {
    addMeta(def, refs, jsonSchema);
  }
  newItem.jsonSchema = jsonSchema;
  return jsonSchema;
}
var get$ref, getRelativePath, selectParser, addMeta;
var init_parseDef = __esm({
  "node_modules/zod-to-json-schema/dist/esm/parseDef.js"() {
    "use strict";
    init_lib();
    init_any();
    init_array();
    init_bigint();
    init_boolean();
    init_branded();
    init_catch();
    init_date();
    init_default();
    init_effects();
    init_enum();
    init_intersection();
    init_literal();
    init_map();
    init_nativeEnum();
    init_never();
    init_null();
    init_nullable();
    init_number();
    init_object();
    init_optional();
    init_pipeline();
    init_promise();
    init_record();
    init_set();
    init_string();
    init_tuple();
    init_undefined();
    init_union();
    init_unknown();
    init_readonly();
    init_Options();
    get$ref = (item, refs) => {
      switch (refs.$refStrategy) {
        case "root":
          return { $ref: item.path.join("/") };
        case "relative":
          return { $ref: getRelativePath(refs.currentPath, item.path) };
        case "none":
        case "seen": {
          if (item.path.length < refs.currentPath.length && item.path.every((value, index) => refs.currentPath[index] === value)) {
            console.warn(`Recursive reference detected at ${refs.currentPath.join("/")}! Defaulting to any`);
            return {};
          }
          return refs.$refStrategy === "seen" ? {} : void 0;
        }
      }
    };
    getRelativePath = (pathA, pathB) => {
      let i = 0;
      for (; i < pathA.length && i < pathB.length; i++) {
        if (pathA[i] !== pathB[i])
          break;
      }
      return [(pathA.length - i).toString(), ...pathB.slice(i)].join("/");
    };
    selectParser = (def, typeName, refs) => {
      switch (typeName) {
        case ZodFirstPartyTypeKind.ZodString:
          return parseStringDef(def, refs);
        case ZodFirstPartyTypeKind.ZodNumber:
          return parseNumberDef(def, refs);
        case ZodFirstPartyTypeKind.ZodObject:
          return parseObjectDef(def, refs);
        case ZodFirstPartyTypeKind.ZodBigInt:
          return parseBigintDef(def, refs);
        case ZodFirstPartyTypeKind.ZodBoolean:
          return parseBooleanDef();
        case ZodFirstPartyTypeKind.ZodDate:
          return parseDateDef(def, refs);
        case ZodFirstPartyTypeKind.ZodUndefined:
          return parseUndefinedDef();
        case ZodFirstPartyTypeKind.ZodNull:
          return parseNullDef(refs);
        case ZodFirstPartyTypeKind.ZodArray:
          return parseArrayDef(def, refs);
        case ZodFirstPartyTypeKind.ZodUnion:
        case ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
          return parseUnionDef(def, refs);
        case ZodFirstPartyTypeKind.ZodIntersection:
          return parseIntersectionDef(def, refs);
        case ZodFirstPartyTypeKind.ZodTuple:
          return parseTupleDef(def, refs);
        case ZodFirstPartyTypeKind.ZodRecord:
          return parseRecordDef(def, refs);
        case ZodFirstPartyTypeKind.ZodLiteral:
          return parseLiteralDef(def, refs);
        case ZodFirstPartyTypeKind.ZodEnum:
          return parseEnumDef(def);
        case ZodFirstPartyTypeKind.ZodNativeEnum:
          return parseNativeEnumDef(def);
        case ZodFirstPartyTypeKind.ZodNullable:
          return parseNullableDef(def, refs);
        case ZodFirstPartyTypeKind.ZodOptional:
          return parseOptionalDef(def, refs);
        case ZodFirstPartyTypeKind.ZodMap:
          return parseMapDef(def, refs);
        case ZodFirstPartyTypeKind.ZodSet:
          return parseSetDef(def, refs);
        case ZodFirstPartyTypeKind.ZodLazy:
          return parseDef(def.getter()._def, refs);
        case ZodFirstPartyTypeKind.ZodPromise:
          return parsePromiseDef(def, refs);
        case ZodFirstPartyTypeKind.ZodNaN:
        case ZodFirstPartyTypeKind.ZodNever:
          return parseNeverDef();
        case ZodFirstPartyTypeKind.ZodEffects:
          return parseEffectsDef(def, refs);
        case ZodFirstPartyTypeKind.ZodAny:
          return parseAnyDef();
        case ZodFirstPartyTypeKind.ZodUnknown:
          return parseUnknownDef();
        case ZodFirstPartyTypeKind.ZodDefault:
          return parseDefaultDef(def, refs);
        case ZodFirstPartyTypeKind.ZodBranded:
          return parseBrandedDef(def, refs);
        case ZodFirstPartyTypeKind.ZodReadonly:
          return parseReadonlyDef(def, refs);
        case ZodFirstPartyTypeKind.ZodCatch:
          return parseCatchDef(def, refs);
        case ZodFirstPartyTypeKind.ZodPipeline:
          return parsePipelineDef(def, refs);
        case ZodFirstPartyTypeKind.ZodFunction:
        case ZodFirstPartyTypeKind.ZodVoid:
        case ZodFirstPartyTypeKind.ZodSymbol:
          return void 0;
        default:
          return ((_) => void 0)(typeName);
      }
    };
    addMeta = (def, refs, jsonSchema) => {
      if (def.description) {
        jsonSchema.description = def.description;
        if (refs.markdownDescription) {
          jsonSchema.markdownDescription = def.description;
        }
      }
      return jsonSchema;
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/Refs.js
var getRefs;
var init_Refs = __esm({
  "node_modules/zod-to-json-schema/dist/esm/Refs.js"() {
    "use strict";
    init_Options();
    getRefs = (options) => {
      const _options = getDefaultOptions(options);
      const currentPath = _options.name !== void 0 ? [..._options.basePath, _options.definitionPath, _options.name] : _options.basePath;
      return {
        ..._options,
        currentPath,
        propertyPath: void 0,
        seen: new Map(Object.entries(_options.definitions).map(([name, def]) => [
          def._def,
          {
            def: def._def,
            path: [..._options.basePath, _options.definitionPath, name],
            // Resolution of references will be forced even though seen, so it's ok that the schema is undefined here for now.
            jsonSchema: void 0
          }
        ]))
      };
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/zodToJsonSchema.js
var zodToJsonSchema;
var init_zodToJsonSchema = __esm({
  "node_modules/zod-to-json-schema/dist/esm/zodToJsonSchema.js"() {
    "use strict";
    init_parseDef();
    init_Refs();
    zodToJsonSchema = (schema, options) => {
      const refs = getRefs(options);
      const definitions = typeof options === "object" && options.definitions ? Object.entries(options.definitions).reduce((acc, [name2, schema2]) => ({
        ...acc,
        [name2]: parseDef(schema2._def, {
          ...refs,
          currentPath: [...refs.basePath, refs.definitionPath, name2]
        }, true) ?? {}
      }), {}) : void 0;
      const name = typeof options === "string" ? options : options == null ? void 0 : options.name;
      const main = parseDef(schema._def, name === void 0 ? refs : {
        ...refs,
        currentPath: [...refs.basePath, refs.definitionPath, name]
      }, false) ?? {};
      const combined = name === void 0 ? definitions ? {
        ...main,
        [refs.definitionPath]: definitions
      } : main : {
        $ref: [
          ...refs.$refStrategy === "relative" ? [] : refs.basePath,
          refs.definitionPath,
          name
        ].join("/"),
        [refs.definitionPath]: {
          ...definitions,
          [name]: main
        }
      };
      if (refs.target === "jsonSchema7") {
        combined.$schema = "http://json-schema.org/draft-07/schema#";
      } else if (refs.target === "jsonSchema2019-09") {
        combined.$schema = "https://json-schema.org/draft/2019-09/schema#";
      }
      return combined;
    };
  }
});

// node_modules/zod-to-json-schema/dist/esm/index.js
var init_esm = __esm({
  "node_modules/zod-to-json-schema/dist/esm/index.js"() {
    "use strict";
    init_errorMessages();
    init_Options();
    init_parseDef();
    init_any();
    init_array();
    init_bigint();
    init_boolean();
    init_branded();
    init_catch();
    init_date();
    init_default();
    init_effects();
    init_enum();
    init_intersection();
    init_literal();
    init_map();
    init_nativeEnum();
    init_never();
    init_null();
    init_nullable();
    init_number();
    init_object();
    init_optional();
    init_pipeline();
    init_promise();
    init_readonly();
    init_record();
    init_set();
    init_string();
    init_tuple();
    init_undefined();
    init_union();
    init_unknown();
    init_Refs();
    init_zodToJsonSchema();
    init_zodToJsonSchema();
  }
});

// node_modules/@langchain/core/dist/runnables/graph.js
function nodeDataJson(node) {
  if (isRunnableInterface(node.data)) {
    return {
      type: "runnable",
      data: {
        id: node.data.lc_id,
        name: node.data.getName()
      }
    };
  } else {
    return {
      type: "schema",
      data: { ...zodToJsonSchema(node.data.schema), title: node.data.name }
    };
  }
}
var Graph;
var init_graph = __esm({
  "node_modules/@langchain/core/dist/runnables/graph.js"() {
    "use strict";
    init_esm();
    init_esm_node();
    init_utils2();
    Graph = class {
      constructor() {
        Object.defineProperty(this, "nodes", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: {}
        });
        Object.defineProperty(this, "edges", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
      }
      // Convert the graph to a JSON-serializable format.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toJSON() {
        const stableNodeIds = {};
        Object.values(this.nodes).forEach((node, i) => {
          stableNodeIds[node.id] = validate_default(node.id) ? i : node.id;
        });
        return {
          nodes: Object.values(this.nodes).map((node) => ({
            id: stableNodeIds[node.id],
            ...nodeDataJson(node)
          })),
          edges: this.edges.map((edge) => edge.data ? {
            source: stableNodeIds[edge.source],
            target: stableNodeIds[edge.target],
            data: edge.data
          } : {
            source: stableNodeIds[edge.source],
            target: stableNodeIds[edge.target]
          })
        };
      }
      addNode(data, id) {
        if (id !== void 0 && this.nodes[id] !== void 0) {
          throw new Error(`Node with id ${id} already exists`);
        }
        const nodeId = id || v4_default();
        const node = { id: nodeId, data };
        this.nodes[nodeId] = node;
        return node;
      }
      removeNode(node) {
        delete this.nodes[node.id];
        this.edges = this.edges.filter((edge) => edge.source !== node.id && edge.target !== node.id);
      }
      addEdge(source, target, data) {
        if (this.nodes[source.id] === void 0) {
          throw new Error(`Source node ${source.id} not in graph`);
        }
        if (this.nodes[target.id] === void 0) {
          throw new Error(`Target node ${target.id} not in graph`);
        }
        const edge = { source: source.id, target: target.id, data };
        this.edges.push(edge);
        return edge;
      }
      firstNode() {
        const targets = new Set(this.edges.map((edge) => edge.target));
        const found = [];
        Object.values(this.nodes).forEach((node) => {
          if (!targets.has(node.id)) {
            found.push(node);
          }
        });
        return found[0];
      }
      lastNode() {
        const sources = new Set(this.edges.map((edge) => edge.source));
        const found = [];
        Object.values(this.nodes).forEach((node) => {
          if (!sources.has(node.id)) {
            found.push(node);
          }
        });
        return found[0];
      }
      extend(graph) {
        Object.entries(graph.nodes).forEach(([key, value]) => {
          this.nodes[key] = value;
        });
        this.edges = [...this.edges, ...graph.edges];
      }
      trimFirstNode() {
        const firstNode = this.firstNode();
        if (firstNode) {
          const outgoingEdges = this.edges.filter((edge) => edge.source === firstNode.id);
          if (Object.keys(this.nodes).length === 1 || outgoingEdges.length === 1) {
            this.removeNode(firstNode);
          }
        }
      }
      trimLastNode() {
        const lastNode = this.lastNode();
        if (lastNode) {
          const incomingEdges = this.edges.filter((edge) => edge.target === lastNode.id);
          if (Object.keys(this.nodes).length === 1 || incomingEdges.length === 1) {
            this.removeNode(lastNode);
          }
        }
      }
    };
  }
});

// node_modules/@langchain/core/dist/runnables/base.js
function _coerceToDict2(value, defaultKey) {
  return value && !Array.isArray(value) && // eslint-disable-next-line no-instanceof/no-instanceof
  !(value instanceof Date) && typeof value === "object" ? value : { [defaultKey]: value };
}
function _coerceToRunnable(coerceable) {
  if (typeof coerceable === "function") {
    return new RunnableLambda({ func: coerceable });
  } else if (Runnable.isRunnable(coerceable)) {
    return coerceable;
  } else if (!Array.isArray(coerceable) && typeof coerceable === "object") {
    const runnables = {};
    for (const [key, value] of Object.entries(coerceable)) {
      runnables[key] = _coerceToRunnable(value);
    }
    return new RunnableMap({
      steps: runnables
    });
  } else {
    throw new Error(`Expected a Runnable, function or object.
Instead got an unsupported type.`);
  }
}
var import_p_retry3, Runnable, RunnableBinding, RunnableEach, RunnableRetry, RunnableSequence, RunnableMap, RunnableLambda, RunnableWithFallbacks, RunnableAssign, RunnablePick;
var init_base4 = __esm({
  "node_modules/@langchain/core/dist/runnables/base.js"() {
    "use strict";
    init_lib();
    import_p_retry3 = __toESM(require_p_retry(), 1);
    init_manager();
    init_log_stream();
    init_serializable();
    init_stream();
    init_config();
    init_async_caller2();
    init_root_listener();
    init_utils2();
    init_singletons();
    init_graph();
    Runnable = class extends Serializable {
      constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_runnable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
      }
      getName(suffix) {
        const name = (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.name ?? this.constructor.lc_name() ?? this.constructor.name
        );
        return suffix ? `${name}${suffix}` : name;
      }
      /**
       * Bind arguments to a Runnable, returning a new Runnable.
       * @param kwargs
       * @returns A new RunnableBinding that, when invoked, will apply the bound args.
       */
      bind(kwargs) {
        return new RunnableBinding({ bound: this, kwargs, config: {} });
      }
      /**
       * Return a new Runnable that maps a list of inputs to a list of outputs,
       * by calling invoke() with each input.
       */
      map() {
        return new RunnableEach({ bound: this });
      }
      /**
       * Add retry logic to an existing runnable.
       * @param kwargs
       * @returns A new RunnableRetry that, when invoked, will retry according to the parameters.
       */
      withRetry(fields) {
        return new RunnableRetry({
          bound: this,
          kwargs: {},
          config: {},
          maxAttemptNumber: fields == null ? void 0 : fields.stopAfterAttempt,
          ...fields
        });
      }
      /**
       * Bind config to a Runnable, returning a new Runnable.
       * @param config New configuration parameters to attach to the new runnable.
       * @returns A new RunnableBinding with a config matching what's passed.
       */
      withConfig(config) {
        return new RunnableBinding({
          bound: this,
          config,
          kwargs: {}
        });
      }
      /**
       * Create a new runnable from the current one that will try invoking
       * other passed fallback runnables if the initial invocation fails.
       * @param fields.fallbacks Other runnables to call if the runnable errors.
       * @returns A new RunnableWithFallbacks.
       */
      withFallbacks(fields) {
        return new RunnableWithFallbacks({
          runnable: this,
          fallbacks: fields.fallbacks
        });
      }
      _getOptionsList(options, length = 0) {
        if (Array.isArray(options) && options.length !== length) {
          throw new Error(`Passed "options" must be an array with the same length as the inputs, but got ${options.length} options for ${length} inputs`);
        }
        if (Array.isArray(options)) {
          return options.map(ensureConfig);
        }
        if (length > 1 && !Array.isArray(options) && options.runId) {
          console.warn("Provided runId will be used only for the first element of the batch.");
          const subsequent = Object.fromEntries(Object.entries(options).filter(([key]) => key !== "runId"));
          return Array.from({ length }, (_, i) => ensureConfig(i === 0 ? options : subsequent));
        }
        return Array.from({ length }, () => ensureConfig(options));
      }
      async batch(inputs, options, batchOptions) {
        var _a;
        const configList = this._getOptionsList(options ?? {}, inputs.length);
        const maxConcurrency = ((_a = configList[0]) == null ? void 0 : _a.maxConcurrency) ?? (batchOptions == null ? void 0 : batchOptions.maxConcurrency);
        const caller = new AsyncCaller2({
          maxConcurrency,
          onFailedAttempt: (e) => {
            throw e;
          }
        });
        const batchCalls = inputs.map((input, i) => caller.call(async () => {
          try {
            const result = await this.invoke(input, configList[i]);
            return result;
          } catch (e) {
            if (batchOptions == null ? void 0 : batchOptions.returnExceptions) {
              return e;
            }
            throw e;
          }
        }));
        return Promise.all(batchCalls);
      }
      /**
       * Default streaming implementation.
       * Subclasses should override this method if they support streaming output.
       * @param input
       * @param options
       */
      async *_streamIterator(input, options) {
        yield this.invoke(input, options);
      }
      /**
       * Stream output in chunks.
       * @param input
       * @param options
       * @returns A readable stream that is also an iterable.
       */
      async stream(input, options) {
        const wrappedGenerator = new AsyncGeneratorWithSetup(this._streamIterator(input, ensureConfig(options)));
        await wrappedGenerator.setup;
        return IterableReadableStream.fromAsyncGenerator(wrappedGenerator);
      }
      _separateRunnableConfigFromCallOptions(options) {
        let runnableConfig;
        if (options === void 0) {
          runnableConfig = ensureConfig(options);
        } else {
          runnableConfig = ensureConfig({
            callbacks: options.callbacks,
            tags: options.tags,
            metadata: options.metadata,
            runName: options.runName,
            configurable: options.configurable,
            recursionLimit: options.recursionLimit,
            maxConcurrency: options.maxConcurrency,
            runId: options.runId
          });
        }
        const callOptions = { ...options };
        delete callOptions.callbacks;
        delete callOptions.tags;
        delete callOptions.metadata;
        delete callOptions.runName;
        delete callOptions.configurable;
        delete callOptions.recursionLimit;
        delete callOptions.maxConcurrency;
        delete callOptions.runId;
        return [runnableConfig, callOptions];
      }
      async _callWithConfig(func, input, options) {
        const config = ensureConfig(options);
        const callbackManager_ = await getCallbackManagerForConfig(config);
        const runManager = await (callbackManager_ == null ? void 0 : callbackManager_.handleChainStart(this.toJSON(), _coerceToDict2(input, "input"), config.runId, config == null ? void 0 : config.runType, void 0, void 0, (config == null ? void 0 : config.runName) ?? this.getName()));
        delete config.runId;
        let output;
        try {
          output = await func.call(this, input, config, runManager);
        } catch (e) {
          await (runManager == null ? void 0 : runManager.handleChainError(e));
          throw e;
        }
        await (runManager == null ? void 0 : runManager.handleChainEnd(_coerceToDict2(output, "output")));
        return output;
      }
      /**
       * Internal method that handles batching and configuration for a runnable
       * It takes a function, input values, and optional configuration, and
       * returns a promise that resolves to the output values.
       * @param func The function to be executed for each input value.
       * @param input The input values to be processed.
       * @param config Optional configuration for the function execution.
       * @returns A promise that resolves to the output values.
       */
      async _batchWithConfig(func, inputs, options, batchOptions) {
        const optionsList = this._getOptionsList(options ?? {}, inputs.length);
        const callbackManagers = await Promise.all(optionsList.map(getCallbackManagerForConfig));
        const runManagers = await Promise.all(callbackManagers.map(async (callbackManager, i) => {
          const handleStartRes = await (callbackManager == null ? void 0 : callbackManager.handleChainStart(this.toJSON(), _coerceToDict2(inputs[i], "input"), optionsList[i].runId, optionsList[i].runType, void 0, void 0, optionsList[i].runName ?? this.getName()));
          delete optionsList[i].runId;
          return handleStartRes;
        }));
        let outputs;
        try {
          outputs = await func.call(this, inputs, optionsList, runManagers, batchOptions);
        } catch (e) {
          await Promise.all(runManagers.map((runManager) => runManager == null ? void 0 : runManager.handleChainError(e)));
          throw e;
        }
        await Promise.all(runManagers.map((runManager) => runManager == null ? void 0 : runManager.handleChainEnd(_coerceToDict2(outputs, "output"))));
        return outputs;
      }
      /**
       * Helper method to transform an Iterator of Input values into an Iterator of
       * Output values, with callbacks.
       * Use this to implement `stream()` or `transform()` in Runnable subclasses.
       */
      async *_transformStreamWithConfig(inputGenerator, transformer, options) {
        let finalInput;
        let finalInputSupported = true;
        let finalOutput;
        let finalOutputSupported = true;
        const config = ensureConfig(options);
        const callbackManager_ = await getCallbackManagerForConfig(config);
        async function* wrapInputForTracing() {
          for await (const chunk of inputGenerator) {
            if (finalInputSupported) {
              if (finalInput === void 0) {
                finalInput = chunk;
              } else {
                try {
                  finalInput = concat(finalInput, chunk);
                } catch {
                  finalInput = void 0;
                  finalInputSupported = false;
                }
              }
            }
            yield chunk;
          }
        }
        let runManager;
        try {
          const pipe = await pipeGeneratorWithSetup(transformer.bind(this), wrapInputForTracing(), async () => callbackManager_ == null ? void 0 : callbackManager_.handleChainStart(this.toJSON(), { input: "" }, config.runId, config.runType, void 0, void 0, config.runName ?? this.getName()), config);
          delete config.runId;
          runManager = pipe.setup;
          const isLogStreamHandler = (handler) => handler.name === "log_stream_tracer";
          const streamLogHandler = runManager == null ? void 0 : runManager.handlers.find(isLogStreamHandler);
          let iterator = pipe.output;
          if (streamLogHandler !== void 0 && runManager !== void 0) {
            iterator = await streamLogHandler.tapOutputIterable(runManager.runId, pipe.output);
          }
          for await (const chunk of iterator) {
            yield chunk;
            if (finalOutputSupported) {
              if (finalOutput === void 0) {
                finalOutput = chunk;
              } else {
                try {
                  finalOutput = concat(finalOutput, chunk);
                } catch {
                  finalOutput = void 0;
                  finalOutputSupported = false;
                }
              }
            }
          }
        } catch (e) {
          await (runManager == null ? void 0 : runManager.handleChainError(e, void 0, void 0, void 0, {
            inputs: _coerceToDict2(finalInput, "input")
          }));
          throw e;
        }
        await (runManager == null ? void 0 : runManager.handleChainEnd(finalOutput ?? {}, void 0, void 0, void 0, { inputs: _coerceToDict2(finalInput, "input") }));
      }
      getGraph(_) {
        const graph = new Graph();
        const inputNode = graph.addNode({
          name: `${this.getName()}Input`,
          schema: z.any()
        });
        const runnableNode = graph.addNode(this);
        const outputNode = graph.addNode({
          name: `${this.getName()}Output`,
          schema: z.any()
        });
        graph.addEdge(inputNode, runnableNode);
        graph.addEdge(runnableNode, outputNode);
        return graph;
      }
      /**
       * Create a new runnable sequence that runs each individual runnable in series,
       * piping the output of one runnable into another runnable or runnable-like.
       * @param coerceable A runnable, function, or object whose values are functions or runnables.
       * @returns A new runnable sequence.
       */
      pipe(coerceable) {
        return new RunnableSequence({
          first: this,
          last: _coerceToRunnable(coerceable)
        });
      }
      /**
       * Pick keys from the dict output of this runnable. Returns a new runnable.
       */
      pick(keys) {
        return this.pipe(new RunnablePick(keys));
      }
      /**
       * Assigns new fields to the dict output of this runnable. Returns a new runnable.
       */
      assign(mapping) {
        return this.pipe(
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          new RunnableAssign(
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            new RunnableMap({ steps: mapping })
          )
        );
      }
      /**
       * Default implementation of transform, which buffers input and then calls stream.
       * Subclasses should override this method if they can start producing output while
       * input is still being generated.
       * @param generator
       * @param options
       */
      async *transform(generator, options) {
        let finalChunk;
        for await (const chunk of generator) {
          if (finalChunk === void 0) {
            finalChunk = chunk;
          } else {
            finalChunk = concat(finalChunk, chunk);
          }
        }
        yield* this._streamIterator(finalChunk, ensureConfig(options));
      }
      /**
       * Stream all output from a runnable, as reported to the callback system.
       * This includes all inner runs of LLMs, Retrievers, Tools, etc.
       * Output is streamed as Log objects, which include a list of
       * jsonpatch ops that describe how the state of the run has changed in each
       * step, and the final state of the run.
       * The jsonpatch ops can be applied in order to construct state.
       * @param input
       * @param options
       * @param streamOptions
       */
      async *streamLog(input, options, streamOptions) {
        const logStreamCallbackHandler = new LogStreamCallbackHandler({
          ...streamOptions,
          autoClose: false,
          _schemaFormat: "original"
        });
        const config = ensureConfig(options);
        yield* this._streamLog(input, logStreamCallbackHandler, config);
      }
      async *_streamLog(input, logStreamCallbackHandler, config) {
        const { callbacks } = config;
        if (callbacks === void 0) {
          config.callbacks = [logStreamCallbackHandler];
        } else if (Array.isArray(callbacks)) {
          config.callbacks = callbacks.concat([logStreamCallbackHandler]);
        } else {
          const copiedCallbacks = callbacks.copy();
          copiedCallbacks.inheritableHandlers.push(logStreamCallbackHandler);
          config.callbacks = copiedCallbacks;
        }
        const runnableStreamPromise = this.stream(input, config);
        async function consumeRunnableStream() {
          try {
            const runnableStream = await runnableStreamPromise;
            for await (const chunk of runnableStream) {
              const patch = new RunLogPatch({
                ops: [
                  {
                    op: "add",
                    path: "/streamed_output/-",
                    value: chunk
                  }
                ]
              });
              await logStreamCallbackHandler.writer.write(patch);
            }
          } finally {
            await logStreamCallbackHandler.writer.close();
          }
        }
        const runnableStreamConsumePromise = consumeRunnableStream();
        try {
          for await (const log of logStreamCallbackHandler) {
            yield log;
          }
        } finally {
          await runnableStreamConsumePromise;
        }
      }
      /**
       * Generate a stream of events emitted by the internal steps of the runnable.
       *
       * Use to create an iterator over StreamEvents that provide real-time information
       * about the progress of the runnable, including StreamEvents from intermediate
       * results.
       *
       * A StreamEvent is a dictionary with the following schema:
       *
       * - `event`: string - Event names are of the format: on_[runnable_type]_(start|stream|end).
       * - `name`: string - The name of the runnable that generated the event.
       * - `run_id`: string - Randomly generated ID associated with the given execution of
       *   the runnable that emitted the event. A child runnable that gets invoked as part of the execution of a
       *   parent runnable is assigned its own unique ID.
       * - `tags`: string[] - The tags of the runnable that generated the event.
       * - `metadata`: Record<string, any> - The metadata of the runnable that generated the event.
       * - `data`: Record<string, any>
       *
       * Below is a table that illustrates some events that might be emitted by various
       * chains. Metadata fields have been omitted from the table for brevity.
       * Chain definitions have been included after the table.
       *
       * | event                | name             | chunk                              | input                                         | output                                          |
       * |----------------------|------------------|------------------------------------|-----------------------------------------------|-------------------------------------------------|
       * | on_llm_start         | [model name]     |                                    | {'input': 'hello'}                            |                                                 |
       * | on_llm_stream        | [model name]     | 'Hello' OR AIMessageChunk("hello") |                                               |                                                 |
       * | on_llm_end           | [model name]     |                                    | 'Hello human!'                                |
       * | on_chain_start       | format_docs      |                                    |                                               |                                                 |
       * | on_chain_stream      | format_docs      | "hello world!, goodbye world!"     |                                               |                                                 |
       * | on_chain_end         | format_docs      |                                    | [Document(...)]                               | "hello world!, goodbye world!"                  |
       * | on_tool_start        | some_tool        |                                    | {"x": 1, "y": "2"}                            |                                                 |
       * | on_tool_stream       | some_tool        |   {"x": 1, "y": "2"}               |                                               |                                                 |
       * | on_tool_end          | some_tool        |                                    |                                               | {"x": 1, "y": "2"}                              |
       * | on_retriever_start   | [retriever name] |                                    | {"query": "hello"}                            |                                                 |
       * | on_retriever_chunk   | [retriever name] |  {documents: [...]}                |                                               |                                                 |
       * | on_retriever_end     | [retriever name] |                                    | {"query": "hello"}                            | {documents: [...]}                              |
       * | on_prompt_start      | [template_name]  |                                    | {"question": "hello"}                         |                                                 |
       * | on_prompt_end        | [template_name]  |                                    | {"question": "hello"}                         | ChatPromptValue(messages: [SystemMessage, ...]) |
       */
      async *streamEvents(input, options, streamOptions) {
        if (options.version !== "v1") {
          throw new Error(`Only version "v1" of the events schema is currently supported.`);
        }
        let runLog;
        let hasEncounteredStartEvent = false;
        const config = ensureConfig(options);
        const rootTags = config.tags ?? [];
        const rootMetadata = config.metadata ?? {};
        const rootName = config.runName ?? this.getName();
        const logStreamCallbackHandler = new LogStreamCallbackHandler({
          ...streamOptions,
          autoClose: false,
          _schemaFormat: "streaming_events"
        });
        const rootEventFilter = new _RootEventFilter({
          ...streamOptions
        });
        const logStream = this._streamLog(input, logStreamCallbackHandler, config);
        for await (const log of logStream) {
          if (!runLog) {
            runLog = RunLog.fromRunLogPatch(log);
          } else {
            runLog = runLog.concat(log);
          }
          if (runLog.state === void 0) {
            throw new Error(`Internal error: "streamEvents" state is missing. Please open a bug report.`);
          }
          if (!hasEncounteredStartEvent) {
            hasEncounteredStartEvent = true;
            const state3 = { ...runLog.state };
            const event = {
              run_id: state3.id,
              event: `on_${state3.type}_start`,
              name: rootName,
              tags: rootTags,
              metadata: rootMetadata,
              data: {
                input
              }
            };
            if (rootEventFilter.includeEvent(event, state3.type)) {
              yield event;
            }
          }
          const paths = log.ops.filter((op) => op.path.startsWith("/logs/")).map((op) => op.path.split("/")[2]);
          const dedupedPaths = [...new Set(paths)];
          for (const path of dedupedPaths) {
            let eventType;
            let data = {};
            const logEntry = runLog.state.logs[path];
            if (logEntry.end_time === void 0) {
              if (logEntry.streamed_output.length > 0) {
                eventType = "stream";
              } else {
                eventType = "start";
              }
            } else {
              eventType = "end";
            }
            if (eventType === "start") {
              if (logEntry.inputs !== void 0) {
                data.input = logEntry.inputs;
              }
            } else if (eventType === "end") {
              if (logEntry.inputs !== void 0) {
                data.input = logEntry.inputs;
              }
              data.output = logEntry.final_output;
            } else if (eventType === "stream") {
              const chunkCount = logEntry.streamed_output.length;
              if (chunkCount !== 1) {
                throw new Error(`Expected exactly one chunk of streamed output, got ${chunkCount} instead. Encountered in: "${logEntry.name}"`);
              }
              data = { chunk: logEntry.streamed_output[0] };
              logEntry.streamed_output = [];
            }
            yield {
              event: `on_${logEntry.type}_${eventType}`,
              name: logEntry.name,
              run_id: logEntry.id,
              tags: logEntry.tags,
              metadata: logEntry.metadata,
              data
            };
          }
          const { state: state2 } = runLog;
          if (state2.streamed_output.length > 0) {
            const chunkCount = state2.streamed_output.length;
            if (chunkCount !== 1) {
              throw new Error(`Expected exactly one chunk of streamed output, got ${chunkCount} instead. Encountered in: "${state2.name}"`);
            }
            const data = { chunk: state2.streamed_output[0] };
            state2.streamed_output = [];
            const event = {
              event: `on_${state2.type}_stream`,
              run_id: state2.id,
              tags: rootTags,
              metadata: rootMetadata,
              name: rootName,
              data
            };
            if (rootEventFilter.includeEvent(event, state2.type)) {
              yield event;
            }
          }
        }
        const state = runLog == null ? void 0 : runLog.state;
        if (state !== void 0) {
          const event = {
            event: `on_${state.type}_end`,
            name: rootName,
            run_id: state.id,
            tags: rootTags,
            metadata: rootMetadata,
            data: {
              output: state.final_output
            }
          };
          if (rootEventFilter.includeEvent(event, state.type))
            yield event;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      static isRunnable(thing) {
        return isRunnableInterface(thing);
      }
      /**
       * Bind lifecycle listeners to a Runnable, returning a new Runnable.
       * The Run object contains information about the run, including its id,
       * type, input, output, error, startTime, endTime, and any tags or metadata
       * added to the run.
       *
       * @param {Object} params - The object containing the callback functions.
       * @param {(run: Run) => void} params.onStart - Called before the runnable starts running, with the Run object.
       * @param {(run: Run) => void} params.onEnd - Called after the runnable finishes running, with the Run object.
       * @param {(run: Run) => void} params.onError - Called if the runnable throws an error, with the Run object.
       */
      withListeners({ onStart, onEnd, onError }) {
        return new RunnableBinding({
          bound: this,
          config: {},
          configFactories: [
            (config) => ({
              callbacks: [
                new RootListenersTracer({
                  config,
                  onStart,
                  onEnd,
                  onError
                })
              ]
            })
          ]
        });
      }
    };
    RunnableBinding = class _RunnableBinding extends Runnable {
      static lc_name() {
        return "RunnableBinding";
      }
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "bound", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "config", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "kwargs", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "configFactories", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.bound = fields.bound;
        this.kwargs = fields.kwargs;
        this.config = fields.config;
        this.configFactories = fields.configFactories;
      }
      getName(suffix) {
        return this.bound.getName(suffix);
      }
      async _mergeConfig(...options) {
        const config = mergeConfigs(this.config, ...options);
        return mergeConfigs(config, ...this.configFactories ? await Promise.all(this.configFactories.map(async (configFactory) => await configFactory(config))) : []);
      }
      bind(kwargs) {
        return new this.constructor({
          bound: this.bound,
          kwargs: { ...this.kwargs, ...kwargs },
          config: this.config
        });
      }
      withConfig(config) {
        return new this.constructor({
          bound: this.bound,
          kwargs: this.kwargs,
          config: { ...this.config, ...config }
        });
      }
      withRetry(fields) {
        return new this.constructor({
          bound: this.bound.withRetry(fields),
          kwargs: this.kwargs,
          config: this.config
        });
      }
      async invoke(input, options) {
        return this.bound.invoke(input, await this._mergeConfig(ensureConfig(options), this.kwargs));
      }
      async batch(inputs, options, batchOptions) {
        const mergedOptions = Array.isArray(options) ? await Promise.all(options.map(async (individualOption) => this._mergeConfig(ensureConfig(individualOption), this.kwargs))) : await this._mergeConfig(ensureConfig(options), this.kwargs);
        return this.bound.batch(inputs, mergedOptions, batchOptions);
      }
      async *_streamIterator(input, options) {
        yield* this.bound._streamIterator(input, await this._mergeConfig(ensureConfig(options), this.kwargs));
      }
      async stream(input, options) {
        return this.bound.stream(input, await this._mergeConfig(ensureConfig(options), this.kwargs));
      }
      async *transform(generator, options) {
        yield* this.bound.transform(generator, await this._mergeConfig(ensureConfig(options), this.kwargs));
      }
      async *streamEvents(input, options, streamOptions) {
        yield* this.bound.streamEvents(input, {
          ...await this._mergeConfig(ensureConfig(options), this.kwargs),
          version: options.version
        }, streamOptions);
      }
      static isRunnableBinding(thing) {
        return thing.bound && Runnable.isRunnable(thing.bound);
      }
      /**
       * Bind lifecycle listeners to a Runnable, returning a new Runnable.
       * The Run object contains information about the run, including its id,
       * type, input, output, error, startTime, endTime, and any tags or metadata
       * added to the run.
       *
       * @param {Object} params - The object containing the callback functions.
       * @param {(run: Run) => void} params.onStart - Called before the runnable starts running, with the Run object.
       * @param {(run: Run) => void} params.onEnd - Called after the runnable finishes running, with the Run object.
       * @param {(run: Run) => void} params.onError - Called if the runnable throws an error, with the Run object.
       */
      withListeners({ onStart, onEnd, onError }) {
        return new _RunnableBinding({
          bound: this.bound,
          kwargs: this.kwargs,
          config: this.config,
          configFactories: [
            (config) => ({
              callbacks: [
                new RootListenersTracer({
                  config,
                  onStart,
                  onEnd,
                  onError
                })
              ]
            })
          ]
        });
      }
    };
    RunnableEach = class _RunnableEach extends Runnable {
      static lc_name() {
        return "RunnableEach";
      }
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "bound", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.bound = fields.bound;
      }
      /**
       * Binds the runnable with the specified arguments.
       * @param kwargs The arguments to bind the runnable with.
       * @returns A new instance of the `RunnableEach` class that is bound with the specified arguments.
       */
      bind(kwargs) {
        return new _RunnableEach({
          bound: this.bound.bind(kwargs)
        });
      }
      /**
       * Invokes the runnable with the specified input and configuration.
       * @param input The input to invoke the runnable with.
       * @param config The configuration to invoke the runnable with.
       * @returns A promise that resolves to the output of the runnable.
       */
      async invoke(inputs, config) {
        return this._callWithConfig(this._invoke, inputs, config);
      }
      /**
       * A helper method that is used to invoke the runnable with the specified input and configuration.
       * @param input The input to invoke the runnable with.
       * @param config The configuration to invoke the runnable with.
       * @returns A promise that resolves to the output of the runnable.
       */
      async _invoke(inputs, config, runManager) {
        return this.bound.batch(inputs, patchConfig(config, { callbacks: runManager == null ? void 0 : runManager.getChild() }));
      }
      /**
       * Bind lifecycle listeners to a Runnable, returning a new Runnable.
       * The Run object contains information about the run, including its id,
       * type, input, output, error, startTime, endTime, and any tags or metadata
       * added to the run.
       *
       * @param {Object} params - The object containing the callback functions.
       * @param {(run: Run) => void} params.onStart - Called before the runnable starts running, with the Run object.
       * @param {(run: Run) => void} params.onEnd - Called after the runnable finishes running, with the Run object.
       * @param {(run: Run) => void} params.onError - Called if the runnable throws an error, with the Run object.
       */
      withListeners({ onStart, onEnd, onError }) {
        return new _RunnableEach({
          bound: this.bound.withListeners({ onStart, onEnd, onError })
        });
      }
    };
    RunnableRetry = class extends RunnableBinding {
      static lc_name() {
        return "RunnableRetry";
      }
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "maxAttemptNumber", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: 3
        });
        Object.defineProperty(this, "onFailedAttempt", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: () => {
          }
        });
        this.maxAttemptNumber = fields.maxAttemptNumber ?? this.maxAttemptNumber;
        this.onFailedAttempt = fields.onFailedAttempt ?? this.onFailedAttempt;
      }
      _patchConfigForRetry(attempt, config, runManager) {
        const tag = attempt > 1 ? `retry:attempt:${attempt}` : void 0;
        return patchConfig(config, { callbacks: runManager == null ? void 0 : runManager.getChild(tag) });
      }
      async _invoke(input, config, runManager) {
        return (0, import_p_retry3.default)((attemptNumber) => super.invoke(input, this._patchConfigForRetry(attemptNumber, config, runManager)), {
          onFailedAttempt: this.onFailedAttempt,
          retries: Math.max(this.maxAttemptNumber - 1, 0),
          randomize: true
        });
      }
      /**
       * Method that invokes the runnable with the specified input, run manager,
       * and config. It handles the retry logic by catching any errors and
       * recursively invoking itself with the updated config for the next retry
       * attempt.
       * @param input The input for the runnable.
       * @param runManager The run manager for the runnable.
       * @param config The config for the runnable.
       * @returns A promise that resolves to the output of the runnable.
       */
      async invoke(input, config) {
        return this._callWithConfig(this._invoke, input, config);
      }
      async _batch(inputs, configs, runManagers, batchOptions) {
        const resultsMap = {};
        try {
          await (0, import_p_retry3.default)(async (attemptNumber) => {
            const remainingIndexes = inputs.map((_, i) => i).filter((i) => resultsMap[i.toString()] === void 0 || // eslint-disable-next-line no-instanceof/no-instanceof
            resultsMap[i.toString()] instanceof Error);
            const remainingInputs = remainingIndexes.map((i) => inputs[i]);
            const patchedConfigs = remainingIndexes.map((i) => this._patchConfigForRetry(attemptNumber, configs == null ? void 0 : configs[i], runManagers == null ? void 0 : runManagers[i]));
            const results = await super.batch(remainingInputs, patchedConfigs, {
              ...batchOptions,
              returnExceptions: true
            });
            let firstException;
            for (let i = 0; i < results.length; i += 1) {
              const result = results[i];
              const resultMapIndex = remainingIndexes[i];
              if (result instanceof Error) {
                if (firstException === void 0) {
                  firstException = result;
                }
              }
              resultsMap[resultMapIndex.toString()] = result;
            }
            if (firstException) {
              throw firstException;
            }
            return results;
          }, {
            onFailedAttempt: this.onFailedAttempt,
            retries: Math.max(this.maxAttemptNumber - 1, 0),
            randomize: true
          });
        } catch (e) {
          if ((batchOptions == null ? void 0 : batchOptions.returnExceptions) !== true) {
            throw e;
          }
        }
        return Object.keys(resultsMap).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)).map((key) => resultsMap[parseInt(key, 10)]);
      }
      async batch(inputs, options, batchOptions) {
        return this._batchWithConfig(this._batch.bind(this), inputs, options, batchOptions);
      }
    };
    RunnableSequence = class _RunnableSequence extends Runnable {
      static lc_name() {
        return "RunnableSequence";
      }
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "first", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "middle", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "last", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        this.first = fields.first;
        this.middle = fields.middle ?? this.middle;
        this.last = fields.last;
        this.name = fields.name;
      }
      get steps() {
        return [this.first, ...this.middle, this.last];
      }
      async invoke(input, options) {
        const config = ensureConfig(options);
        const callbackManager_ = await getCallbackManagerForConfig(config);
        const runManager = await (callbackManager_ == null ? void 0 : callbackManager_.handleChainStart(this.toJSON(), _coerceToDict2(input, "input"), config.runId, void 0, void 0, void 0, config == null ? void 0 : config.runName));
        delete config.runId;
        let nextStepInput = input;
        let finalOutput;
        try {
          const initialSteps = [this.first, ...this.middle];
          for (let i = 0; i < initialSteps.length; i += 1) {
            const step = initialSteps[i];
            nextStepInput = await step.invoke(nextStepInput, patchConfig(config, {
              callbacks: runManager == null ? void 0 : runManager.getChild(`seq:step:${i + 1}`)
            }));
          }
          finalOutput = await this.last.invoke(nextStepInput, patchConfig(config, {
            callbacks: runManager == null ? void 0 : runManager.getChild(`seq:step:${this.steps.length}`)
          }));
        } catch (e) {
          await (runManager == null ? void 0 : runManager.handleChainError(e));
          throw e;
        }
        await (runManager == null ? void 0 : runManager.handleChainEnd(_coerceToDict2(finalOutput, "output")));
        return finalOutput;
      }
      async batch(inputs, options, batchOptions) {
        const configList = this._getOptionsList(options ?? {}, inputs.length);
        const callbackManagers = await Promise.all(configList.map(getCallbackManagerForConfig));
        const runManagers = await Promise.all(callbackManagers.map(async (callbackManager, i) => {
          const handleStartRes = await (callbackManager == null ? void 0 : callbackManager.handleChainStart(this.toJSON(), _coerceToDict2(inputs[i], "input"), configList[i].runId, void 0, void 0, void 0, configList[i].runName));
          delete configList[i].runId;
          return handleStartRes;
        }));
        let nextStepInputs = inputs;
        try {
          for (let i = 0; i < this.steps.length; i += 1) {
            const step = this.steps[i];
            nextStepInputs = await step.batch(nextStepInputs, runManagers.map((runManager, j) => {
              const childRunManager = runManager == null ? void 0 : runManager.getChild(`seq:step:${i + 1}`);
              return patchConfig(configList[j], { callbacks: childRunManager });
            }), batchOptions);
          }
        } catch (e) {
          await Promise.all(runManagers.map((runManager) => runManager == null ? void 0 : runManager.handleChainError(e)));
          throw e;
        }
        await Promise.all(runManagers.map((runManager) => runManager == null ? void 0 : runManager.handleChainEnd(_coerceToDict2(nextStepInputs, "output"))));
        return nextStepInputs;
      }
      async *_streamIterator(input, options) {
        const callbackManager_ = await getCallbackManagerForConfig(options);
        const { runId, ...otherOptions } = options ?? {};
        const runManager = await (callbackManager_ == null ? void 0 : callbackManager_.handleChainStart(this.toJSON(), _coerceToDict2(input, "input"), runId, void 0, void 0, void 0, otherOptions == null ? void 0 : otherOptions.runName));
        const steps = [this.first, ...this.middle, this.last];
        let concatSupported = true;
        let finalOutput;
        async function* inputGenerator() {
          yield input;
        }
        try {
          let finalGenerator = steps[0].transform(inputGenerator(), patchConfig(otherOptions, {
            callbacks: runManager == null ? void 0 : runManager.getChild(`seq:step:1`)
          }));
          for (let i = 1; i < steps.length; i += 1) {
            const step = steps[i];
            finalGenerator = await step.transform(finalGenerator, patchConfig(otherOptions, {
              callbacks: runManager == null ? void 0 : runManager.getChild(`seq:step:${i + 1}`)
            }));
          }
          for await (const chunk of finalGenerator) {
            yield chunk;
            if (concatSupported) {
              if (finalOutput === void 0) {
                finalOutput = chunk;
              } else {
                try {
                  finalOutput = concat(finalOutput, chunk);
                } catch (e) {
                  finalOutput = void 0;
                  concatSupported = false;
                }
              }
            }
          }
        } catch (e) {
          await (runManager == null ? void 0 : runManager.handleChainError(e));
          throw e;
        }
        await (runManager == null ? void 0 : runManager.handleChainEnd(_coerceToDict2(finalOutput, "output")));
      }
      getGraph(config) {
        const graph = new Graph();
        let currentLastNode = null;
        this.steps.forEach((step, index) => {
          const stepGraph = step.getGraph(config);
          if (index !== 0) {
            stepGraph.trimFirstNode();
          }
          if (index !== this.steps.length - 1) {
            stepGraph.trimLastNode();
          }
          graph.extend(stepGraph);
          const stepFirstNode = stepGraph.firstNode();
          if (!stepFirstNode) {
            throw new Error(`Runnable ${step} has no first node`);
          }
          if (currentLastNode) {
            graph.addEdge(currentLastNode, stepFirstNode);
          }
          currentLastNode = stepGraph.lastNode();
        });
        return graph;
      }
      pipe(coerceable) {
        if (_RunnableSequence.isRunnableSequence(coerceable)) {
          return new _RunnableSequence({
            first: this.first,
            middle: this.middle.concat([
              this.last,
              coerceable.first,
              ...coerceable.middle
            ]),
            last: coerceable.last,
            name: this.name ?? coerceable.name
          });
        } else {
          return new _RunnableSequence({
            first: this.first,
            middle: [...this.middle, this.last],
            last: _coerceToRunnable(coerceable),
            name: this.name
          });
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      static isRunnableSequence(thing) {
        return Array.isArray(thing.middle) && Runnable.isRunnable(thing);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      static from([first, ...runnables], name) {
        return new _RunnableSequence({
          first: _coerceToRunnable(first),
          middle: runnables.slice(0, -1).map(_coerceToRunnable),
          last: _coerceToRunnable(runnables[runnables.length - 1]),
          name
        });
      }
    };
    RunnableMap = class _RunnableMap extends Runnable {
      static lc_name() {
        return "RunnableMap";
      }
      getStepsKeys() {
        return Object.keys(this.steps);
      }
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "steps", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.steps = {};
        for (const [key, value] of Object.entries(fields.steps)) {
          this.steps[key] = _coerceToRunnable(value);
        }
      }
      static from(steps) {
        return new _RunnableMap({ steps });
      }
      async invoke(input, options) {
        const config = ensureConfig(options);
        const callbackManager_ = await getCallbackManagerForConfig(config);
        const runManager = await (callbackManager_ == null ? void 0 : callbackManager_.handleChainStart(this.toJSON(), {
          input
        }, config.runId, void 0, void 0, void 0, config == null ? void 0 : config.runName));
        delete config.runId;
        const output = {};
        try {
          await Promise.all(Object.entries(this.steps).map(async ([key, runnable]) => {
            output[key] = await runnable.invoke(input, patchConfig(config, {
              callbacks: runManager == null ? void 0 : runManager.getChild(`map:key:${key}`)
            }));
          }));
        } catch (e) {
          await (runManager == null ? void 0 : runManager.handleChainError(e));
          throw e;
        }
        await (runManager == null ? void 0 : runManager.handleChainEnd(output));
        return output;
      }
      async *_transform(generator, runManager, options) {
        const steps = { ...this.steps };
        const inputCopies = atee(generator, Object.keys(steps).length);
        const tasks = new Map(Object.entries(steps).map(([key, runnable], i) => {
          const gen = runnable.transform(inputCopies[i], patchConfig(options, {
            callbacks: runManager == null ? void 0 : runManager.getChild(`map:key:${key}`)
          }));
          return [key, gen.next().then((result) => ({ key, gen, result }))];
        }));
        while (tasks.size) {
          const { key, result, gen } = await Promise.race(tasks.values());
          tasks.delete(key);
          if (!result.done) {
            yield { [key]: result.value };
            tasks.set(key, gen.next().then((result2) => ({ key, gen, result: result2 })));
          }
        }
      }
      transform(generator, options) {
        return this._transformStreamWithConfig(generator, this._transform.bind(this), options);
      }
      async stream(input, options) {
        async function* generator() {
          yield input;
        }
        const wrappedGenerator = new AsyncGeneratorWithSetup(this.transform(generator(), options));
        await wrappedGenerator.setup;
        return IterableReadableStream.fromAsyncGenerator(wrappedGenerator);
      }
    };
    RunnableLambda = class _RunnableLambda extends Runnable {
      static lc_name() {
        return "RunnableLambda";
      }
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "func", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.func = fields.func;
      }
      static from(func) {
        return new _RunnableLambda({
          func
        });
      }
      async _invoke(input, config, runManager) {
        return new Promise((resolve, reject) => {
          const childConfig = patchConfig(config, {
            callbacks: runManager == null ? void 0 : runManager.getChild(),
            recursionLimit: ((config == null ? void 0 : config.recursionLimit) ?? DEFAULT_RECURSION_LIMIT) - 1
          });
          void AsyncLocalStorageProviderSingleton.getInstance().run(childConfig, async () => {
            try {
              let output = await this.func(input, {
                ...childConfig,
                config: childConfig
              });
              if (output && Runnable.isRunnable(output)) {
                if ((config == null ? void 0 : config.recursionLimit) === 0) {
                  throw new Error("Recursion limit reached.");
                }
                output = await output.invoke(input, {
                  ...childConfig,
                  recursionLimit: (childConfig.recursionLimit ?? DEFAULT_RECURSION_LIMIT) - 1
                });
              }
              resolve(output);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
      async invoke(input, options) {
        return this._callWithConfig(this._invoke, input, options);
      }
      async *_transform(generator, runManager, config) {
        let finalChunk;
        for await (const chunk of generator) {
          if (finalChunk === void 0) {
            finalChunk = chunk;
          } else {
            try {
              finalChunk = concat(finalChunk, chunk);
            } catch (e) {
              finalChunk = chunk;
            }
          }
        }
        const output = await new Promise((resolve, reject) => {
          void AsyncLocalStorageProviderSingleton.getInstance().run(config, async () => {
            try {
              const res = await this.func(finalChunk, {
                ...config,
                config
              });
              resolve(res);
            } catch (e) {
              reject(e);
            }
          });
        });
        if (output && Runnable.isRunnable(output)) {
          if ((config == null ? void 0 : config.recursionLimit) === 0) {
            throw new Error("Recursion limit reached.");
          }
          const stream = await output.stream(finalChunk, patchConfig(config, {
            callbacks: runManager == null ? void 0 : runManager.getChild(),
            recursionLimit: ((config == null ? void 0 : config.recursionLimit) ?? DEFAULT_RECURSION_LIMIT) - 1
          }));
          for await (const chunk of stream) {
            yield chunk;
          }
        } else {
          yield output;
        }
      }
      transform(generator, options) {
        return this._transformStreamWithConfig(generator, this._transform.bind(this), options);
      }
      async stream(input, options) {
        async function* generator() {
          yield input;
        }
        const wrappedGenerator = new AsyncGeneratorWithSetup(this.transform(generator(), options));
        await wrappedGenerator.setup;
        return IterableReadableStream.fromAsyncGenerator(wrappedGenerator);
      }
    };
    RunnableWithFallbacks = class extends Runnable {
      static lc_name() {
        return "RunnableWithFallbacks";
      }
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "runnable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "fallbacks", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.runnable = fields.runnable;
        this.fallbacks = fields.fallbacks;
      }
      *runnables() {
        yield this.runnable;
        for (const fallback of this.fallbacks) {
          yield fallback;
        }
      }
      async invoke(input, options) {
        const callbackManager_ = await CallbackManager.configure(options == null ? void 0 : options.callbacks, void 0, options == null ? void 0 : options.tags, void 0, options == null ? void 0 : options.metadata);
        const { runId, ...otherOptions } = options ?? {};
        const runManager = await (callbackManager_ == null ? void 0 : callbackManager_.handleChainStart(this.toJSON(), _coerceToDict2(input, "input"), runId, void 0, void 0, void 0, otherOptions == null ? void 0 : otherOptions.runName));
        let firstError;
        for (const runnable of this.runnables()) {
          try {
            const output = await runnable.invoke(input, patchConfig(otherOptions, { callbacks: runManager == null ? void 0 : runManager.getChild() }));
            await (runManager == null ? void 0 : runManager.handleChainEnd(_coerceToDict2(output, "output")));
            return output;
          } catch (e) {
            if (firstError === void 0) {
              firstError = e;
            }
          }
        }
        if (firstError === void 0) {
          throw new Error("No error stored at end of fallback.");
        }
        await (runManager == null ? void 0 : runManager.handleChainError(firstError));
        throw firstError;
      }
      async batch(inputs, options, batchOptions) {
        if (batchOptions == null ? void 0 : batchOptions.returnExceptions) {
          throw new Error("Not implemented.");
        }
        const configList = this._getOptionsList(options ?? {}, inputs.length);
        const callbackManagers = await Promise.all(configList.map((config) => CallbackManager.configure(config == null ? void 0 : config.callbacks, void 0, config == null ? void 0 : config.tags, void 0, config == null ? void 0 : config.metadata)));
        const runManagers = await Promise.all(callbackManagers.map(async (callbackManager, i) => {
          const handleStartRes = await (callbackManager == null ? void 0 : callbackManager.handleChainStart(this.toJSON(), _coerceToDict2(inputs[i], "input"), configList[i].runId, void 0, void 0, void 0, configList[i].runName));
          delete configList[i].runId;
          return handleStartRes;
        }));
        let firstError;
        for (const runnable of this.runnables()) {
          try {
            const outputs = await runnable.batch(inputs, runManagers.map((runManager, j) => patchConfig(configList[j], {
              callbacks: runManager == null ? void 0 : runManager.getChild()
            })), batchOptions);
            await Promise.all(runManagers.map((runManager, i) => runManager == null ? void 0 : runManager.handleChainEnd(_coerceToDict2(outputs[i], "output"))));
            return outputs;
          } catch (e) {
            if (firstError === void 0) {
              firstError = e;
            }
          }
        }
        if (!firstError) {
          throw new Error("No error stored at end of fallbacks.");
        }
        await Promise.all(runManagers.map((runManager) => runManager == null ? void 0 : runManager.handleChainError(firstError)));
        throw firstError;
      }
    };
    RunnableAssign = class extends Runnable {
      static lc_name() {
        return "RunnableAssign";
      }
      constructor(fields) {
        if (fields instanceof RunnableMap) {
          fields = { mapper: fields };
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "mapper", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.mapper = fields.mapper;
      }
      async invoke(input, options) {
        const mapperResult = await this.mapper.invoke(input, options);
        return {
          ...input,
          ...mapperResult
        };
      }
      async *_transform(generator, runManager, options) {
        const mapperKeys = this.mapper.getStepsKeys();
        const [forPassthrough, forMapper] = atee(generator);
        const mapperOutput = this.mapper.transform(forMapper, patchConfig(options, { callbacks: runManager == null ? void 0 : runManager.getChild() }));
        const firstMapperChunkPromise = mapperOutput.next();
        for await (const chunk of forPassthrough) {
          if (typeof chunk !== "object" || Array.isArray(chunk)) {
            throw new Error(`RunnableAssign can only be used with objects as input, got ${typeof chunk}`);
          }
          const filtered = Object.fromEntries(Object.entries(chunk).filter(([key]) => !mapperKeys.includes(key)));
          if (Object.keys(filtered).length > 0) {
            yield filtered;
          }
        }
        yield (await firstMapperChunkPromise).value;
        for await (const chunk of mapperOutput) {
          yield chunk;
        }
      }
      transform(generator, options) {
        return this._transformStreamWithConfig(generator, this._transform.bind(this), options);
      }
      async stream(input, options) {
        async function* generator() {
          yield input;
        }
        const wrappedGenerator = new AsyncGeneratorWithSetup(this.transform(generator(), options));
        await wrappedGenerator.setup;
        return IterableReadableStream.fromAsyncGenerator(wrappedGenerator);
      }
    };
    RunnablePick = class extends Runnable {
      static lc_name() {
        return "RunnablePick";
      }
      constructor(fields) {
        if (typeof fields === "string" || Array.isArray(fields)) {
          fields = { keys: fields };
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "runnables"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "keys", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.keys = fields.keys;
      }
      async _pick(input) {
        if (typeof this.keys === "string") {
          return input[this.keys];
        } else {
          const picked = this.keys.map((key) => [key, input[key]]).filter((v) => v[1] !== void 0);
          return picked.length === 0 ? void 0 : Object.fromEntries(picked);
        }
      }
      async invoke(input, options) {
        return this._callWithConfig(this._pick.bind(this), input, options);
      }
      async *_transform(generator) {
        for await (const chunk of generator) {
          const picked = await this._pick(chunk);
          if (picked !== void 0) {
            yield picked;
          }
        }
      }
      transform(generator, options) {
        return this._transformStreamWithConfig(generator, this._transform.bind(this), options);
      }
      async stream(input, options) {
        async function* generator() {
          yield input;
        }
        const wrappedGenerator = new AsyncGeneratorWithSetup(this.transform(generator(), options));
        await wrappedGenerator.setup;
        return IterableReadableStream.fromAsyncGenerator(wrappedGenerator);
      }
    };
  }
});

// node_modules/@langchain/core/dist/prompt_values.js
var BasePromptValue, StringPromptValue, ChatPromptValue, ImagePromptValue;
var init_prompt_values = __esm({
  "node_modules/@langchain/core/dist/prompt_values.js"() {
    "use strict";
    init_serializable();
    init_messages2();
    BasePromptValue = class extends Serializable {
    };
    StringPromptValue = class extends BasePromptValue {
      static lc_name() {
        return "StringPromptValue";
      }
      constructor(value) {
        super({ value });
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "prompt_values"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "value", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.value = value;
      }
      toString() {
        return this.value;
      }
      toChatMessages() {
        return [new HumanMessage(this.value)];
      }
    };
    ChatPromptValue = class extends BasePromptValue {
      static lc_name() {
        return "ChatPromptValue";
      }
      constructor(fields) {
        if (Array.isArray(fields)) {
          fields = { messages: fields };
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "prompt_values"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "messages", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.messages = fields.messages;
      }
      toString() {
        return getBufferString(this.messages);
      }
      toChatMessages() {
        return this.messages;
      }
    };
    ImagePromptValue = class extends BasePromptValue {
      static lc_name() {
        return "ImagePromptValue";
      }
      constructor(fields) {
        if (!("imageUrl" in fields)) {
          fields = { imageUrl: fields };
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "prompt_values"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "imageUrl", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "value", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.imageUrl = fields.imageUrl;
      }
      toString() {
        return this.imageUrl.url;
      }
      toChatMessages() {
        return [
          new HumanMessage({
            content: [
              {
                type: "image_url",
                image_url: {
                  detail: this.imageUrl.detail,
                  url: this.imageUrl.url
                }
              }
            ]
          })
        ];
      }
    };
  }
});

// node_modules/@langchain/core/dist/prompts/string.js
var BaseStringPromptTemplate;
var init_string2 = __esm({
  "node_modules/@langchain/core/dist/prompts/string.js"() {
    "use strict";
    init_prompt_values();
    init_base5();
    BaseStringPromptTemplate = class extends BasePromptTemplate {
      /**
       * Formats the prompt given the input values and returns a formatted
       * prompt value.
       * @param values The input values to format the prompt.
       * @returns A Promise that resolves to a formatted prompt value.
       */
      async formatPromptValue(values) {
        const formattedPrompt = await this.format(values);
        return new StringPromptValue(formattedPrompt);
      }
    };
  }
});

// node_modules/mustache/mustache.mjs
function isFunction(object) {
  return typeof object === "function";
}
function typeStr(obj) {
  return isArray(obj) ? "array" : typeof obj;
}
function escapeRegExp(string) {
  return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}
function hasProperty(obj, propName) {
  return obj != null && typeof obj === "object" && propName in obj;
}
function primitiveHasOwnProperty(primitive, propName) {
  return primitive != null && typeof primitive !== "object" && primitive.hasOwnProperty && primitive.hasOwnProperty(propName);
}
function testRegExp(re, string) {
  return regExpTest.call(re, string);
}
function isWhitespace(string) {
  return !testRegExp(nonSpaceRe, string);
}
function escapeHtml(string) {
  return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
    return entityMap[s];
  });
}
function parseTemplate(template, tags) {
  if (!template)
    return [];
  var lineHasNonSpace = false;
  var sections = [];
  var tokens = [];
  var spaces = [];
  var hasTag = false;
  var nonSpace = false;
  var indentation = "";
  var tagIndex = 0;
  function stripSpace() {
    if (hasTag && !nonSpace) {
      while (spaces.length)
        delete tokens[spaces.pop()];
    } else {
      spaces = [];
    }
    hasTag = false;
    nonSpace = false;
  }
  var openingTagRe, closingTagRe, closingCurlyRe;
  function compileTags(tagsToCompile) {
    if (typeof tagsToCompile === "string")
      tagsToCompile = tagsToCompile.split(spaceRe, 2);
    if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
      throw new Error("Invalid tags: " + tagsToCompile);
    openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + "\\s*");
    closingTagRe = new RegExp("\\s*" + escapeRegExp(tagsToCompile[1]));
    closingCurlyRe = new RegExp("\\s*" + escapeRegExp("}" + tagsToCompile[1]));
  }
  compileTags(tags || mustache.tags);
  var scanner = new Scanner(template);
  var start, type, value, chr, token, openSection;
  while (!scanner.eos()) {
    start = scanner.pos;
    value = scanner.scanUntil(openingTagRe);
    if (value) {
      for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
        chr = value.charAt(i);
        if (isWhitespace(chr)) {
          spaces.push(tokens.length);
          indentation += chr;
        } else {
          nonSpace = true;
          lineHasNonSpace = true;
          indentation += " ";
        }
        tokens.push(["text", chr, start, start + 1]);
        start += 1;
        if (chr === "\n") {
          stripSpace();
          indentation = "";
          tagIndex = 0;
          lineHasNonSpace = false;
        }
      }
    }
    if (!scanner.scan(openingTagRe))
      break;
    hasTag = true;
    type = scanner.scan(tagRe) || "name";
    scanner.scan(whiteRe);
    if (type === "=") {
      value = scanner.scanUntil(equalsRe);
      scanner.scan(equalsRe);
      scanner.scanUntil(closingTagRe);
    } else if (type === "{") {
      value = scanner.scanUntil(closingCurlyRe);
      scanner.scan(curlyRe);
      scanner.scanUntil(closingTagRe);
      type = "&";
    } else {
      value = scanner.scanUntil(closingTagRe);
    }
    if (!scanner.scan(closingTagRe))
      throw new Error("Unclosed tag at " + scanner.pos);
    if (type == ">") {
      token = [type, value, start, scanner.pos, indentation, tagIndex, lineHasNonSpace];
    } else {
      token = [type, value, start, scanner.pos];
    }
    tagIndex++;
    tokens.push(token);
    if (type === "#" || type === "^") {
      sections.push(token);
    } else if (type === "/") {
      openSection = sections.pop();
      if (!openSection)
        throw new Error('Unopened section "' + value + '" at ' + start);
      if (openSection[1] !== value)
        throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
    } else if (type === "name" || type === "{" || type === "&") {
      nonSpace = true;
    } else if (type === "=") {
      compileTags(value);
    }
  }
  stripSpace();
  openSection = sections.pop();
  if (openSection)
    throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
  return nestTokens(squashTokens(tokens));
}
function squashTokens(tokens) {
  var squashedTokens = [];
  var token, lastToken;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    token = tokens[i];
    if (token) {
      if (token[0] === "text" && lastToken && lastToken[0] === "text") {
        lastToken[1] += token[1];
        lastToken[3] = token[3];
      } else {
        squashedTokens.push(token);
        lastToken = token;
      }
    }
  }
  return squashedTokens;
}
function nestTokens(tokens) {
  var nestedTokens = [];
  var collector = nestedTokens;
  var sections = [];
  var token, section;
  for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
    token = tokens[i];
    switch (token[0]) {
      case "#":
      case "^":
        collector.push(token);
        sections.push(token);
        collector = token[4] = [];
        break;
      case "/":
        section = sections.pop();
        section[5] = token[2];
        collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
        break;
      default:
        collector.push(token);
    }
  }
  return nestedTokens;
}
function Scanner(string) {
  this.string = string;
  this.tail = string;
  this.pos = 0;
}
function Context(view, parentContext) {
  this.view = view;
  this.cache = { ".": this.view };
  this.parent = parentContext;
}
function Writer() {
  this.templateCache = {
    _cache: {},
    set: function set(key, value) {
      this._cache[key] = value;
    },
    get: function get(key) {
      return this._cache[key];
    },
    clear: function clear() {
      this._cache = {};
    }
  };
}
var objectToString, isArray, regExpTest, nonSpaceRe, entityMap, whiteRe, spaceRe, equalsRe, curlyRe, tagRe, mustache, defaultWriter, mustache_default;
var init_mustache = __esm({
  "node_modules/mustache/mustache.mjs"() {
    "use strict";
    objectToString = Object.prototype.toString;
    isArray = Array.isArray || function isArrayPolyfill(object) {
      return objectToString.call(object) === "[object Array]";
    };
    regExpTest = RegExp.prototype.test;
    nonSpaceRe = /\S/;
    entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#x2F;",
      "`": "&#x60;",
      "=": "&#x3D;"
    };
    whiteRe = /\s*/;
    spaceRe = /\s+/;
    equalsRe = /\s*=/;
    curlyRe = /\s*\}/;
    tagRe = /#|\^|\/|>|\{|&|=|!/;
    Scanner.prototype.eos = function eos() {
      return this.tail === "";
    };
    Scanner.prototype.scan = function scan(re) {
      var match = this.tail.match(re);
      if (!match || match.index !== 0)
        return "";
      var string = match[0];
      this.tail = this.tail.substring(string.length);
      this.pos += string.length;
      return string;
    };
    Scanner.prototype.scanUntil = function scanUntil(re) {
      var index = this.tail.search(re), match;
      switch (index) {
        case -1:
          match = this.tail;
          this.tail = "";
          break;
        case 0:
          match = "";
          break;
        default:
          match = this.tail.substring(0, index);
          this.tail = this.tail.substring(index);
      }
      this.pos += match.length;
      return match;
    };
    Context.prototype.push = function push2(view) {
      return new Context(view, this);
    };
    Context.prototype.lookup = function lookup(name) {
      var cache = this.cache;
      var value;
      if (cache.hasOwnProperty(name)) {
        value = cache[name];
      } else {
        var context = this, intermediateValue, names, index, lookupHit = false;
        while (context) {
          if (name.indexOf(".") > 0) {
            intermediateValue = context.view;
            names = name.split(".");
            index = 0;
            while (intermediateValue != null && index < names.length) {
              if (index === names.length - 1)
                lookupHit = hasProperty(intermediateValue, names[index]) || primitiveHasOwnProperty(intermediateValue, names[index]);
              intermediateValue = intermediateValue[names[index++]];
            }
          } else {
            intermediateValue = context.view[name];
            lookupHit = hasProperty(context.view, name);
          }
          if (lookupHit) {
            value = intermediateValue;
            break;
          }
          context = context.parent;
        }
        cache[name] = value;
      }
      if (isFunction(value))
        value = value.call(this.view);
      return value;
    };
    Writer.prototype.clearCache = function clearCache() {
      if (typeof this.templateCache !== "undefined") {
        this.templateCache.clear();
      }
    };
    Writer.prototype.parse = function parse(template, tags) {
      var cache = this.templateCache;
      var cacheKey = template + ":" + (tags || mustache.tags).join(":");
      var isCacheEnabled = typeof cache !== "undefined";
      var tokens = isCacheEnabled ? cache.get(cacheKey) : void 0;
      if (tokens == void 0) {
        tokens = parseTemplate(template, tags);
        isCacheEnabled && cache.set(cacheKey, tokens);
      }
      return tokens;
    };
    Writer.prototype.render = function render(template, view, partials, config) {
      var tags = this.getConfigTags(config);
      var tokens = this.parse(template, tags);
      var context = view instanceof Context ? view : new Context(view, void 0);
      return this.renderTokens(tokens, context, partials, template, config);
    };
    Writer.prototype.renderTokens = function renderTokens(tokens, context, partials, originalTemplate, config) {
      var buffer = "";
      var token, symbol, value;
      for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
        value = void 0;
        token = tokens[i];
        symbol = token[0];
        if (symbol === "#")
          value = this.renderSection(token, context, partials, originalTemplate, config);
        else if (symbol === "^")
          value = this.renderInverted(token, context, partials, originalTemplate, config);
        else if (symbol === ">")
          value = this.renderPartial(token, context, partials, config);
        else if (symbol === "&")
          value = this.unescapedValue(token, context);
        else if (symbol === "name")
          value = this.escapedValue(token, context, config);
        else if (symbol === "text")
          value = this.rawValue(token);
        if (value !== void 0)
          buffer += value;
      }
      return buffer;
    };
    Writer.prototype.renderSection = function renderSection(token, context, partials, originalTemplate, config) {
      var self = this;
      var buffer = "";
      var value = context.lookup(token[1]);
      function subRender(template) {
        return self.render(template, context, partials, config);
      }
      if (!value)
        return;
      if (isArray(value)) {
        for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
          buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate, config);
        }
      } else if (typeof value === "object" || typeof value === "string" || typeof value === "number") {
        buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate, config);
      } else if (isFunction(value)) {
        if (typeof originalTemplate !== "string")
          throw new Error("Cannot use higher-order sections without the original template");
        value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);
        if (value != null)
          buffer += value;
      } else {
        buffer += this.renderTokens(token[4], context, partials, originalTemplate, config);
      }
      return buffer;
    };
    Writer.prototype.renderInverted = function renderInverted(token, context, partials, originalTemplate, config) {
      var value = context.lookup(token[1]);
      if (!value || isArray(value) && value.length === 0)
        return this.renderTokens(token[4], context, partials, originalTemplate, config);
    };
    Writer.prototype.indentPartial = function indentPartial(partial, indentation, lineHasNonSpace) {
      var filteredIndentation = indentation.replace(/[^ \t]/g, "");
      var partialByNl = partial.split("\n");
      for (var i = 0; i < partialByNl.length; i++) {
        if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) {
          partialByNl[i] = filteredIndentation + partialByNl[i];
        }
      }
      return partialByNl.join("\n");
    };
    Writer.prototype.renderPartial = function renderPartial(token, context, partials, config) {
      if (!partials)
        return;
      var tags = this.getConfigTags(config);
      var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
      if (value != null) {
        var lineHasNonSpace = token[6];
        var tagIndex = token[5];
        var indentation = token[4];
        var indentedValue = value;
        if (tagIndex == 0 && indentation) {
          indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
        }
        var tokens = this.parse(indentedValue, tags);
        return this.renderTokens(tokens, context, partials, indentedValue, config);
      }
    };
    Writer.prototype.unescapedValue = function unescapedValue(token, context) {
      var value = context.lookup(token[1]);
      if (value != null)
        return value;
    };
    Writer.prototype.escapedValue = function escapedValue(token, context, config) {
      var escape = this.getConfigEscape(config) || mustache.escape;
      var value = context.lookup(token[1]);
      if (value != null)
        return typeof value === "number" && escape === mustache.escape ? String(value) : escape(value);
    };
    Writer.prototype.rawValue = function rawValue(token) {
      return token[1];
    };
    Writer.prototype.getConfigTags = function getConfigTags(config) {
      if (isArray(config)) {
        return config;
      } else if (config && typeof config === "object") {
        return config.tags;
      } else {
        return void 0;
      }
    };
    Writer.prototype.getConfigEscape = function getConfigEscape(config) {
      if (config && typeof config === "object" && !isArray(config)) {
        return config.escape;
      } else {
        return void 0;
      }
    };
    mustache = {
      name: "mustache.js",
      version: "4.2.0",
      tags: ["{{", "}}"],
      clearCache: void 0,
      escape: void 0,
      parse: void 0,
      render: void 0,
      Scanner: void 0,
      Context: void 0,
      Writer: void 0,
      /**
       * Allows a user to override the default caching strategy, by providing an
       * object with set, get and clear methods. This can also be used to disable
       * the cache by setting it to the literal `undefined`.
       */
      set templateCache(cache) {
        defaultWriter.templateCache = cache;
      },
      /**
       * Gets the default or overridden caching object from the default writer.
       */
      get templateCache() {
        return defaultWriter.templateCache;
      }
    };
    defaultWriter = new Writer();
    mustache.clearCache = function clearCache2() {
      return defaultWriter.clearCache();
    };
    mustache.parse = function parse2(template, tags) {
      return defaultWriter.parse(template, tags);
    };
    mustache.render = function render2(template, view, partials, config) {
      if (typeof template !== "string") {
        throw new TypeError('Invalid template! Template should be a "string" but "' + typeStr(template) + '" was given as the first argument for mustache#render(template, view, partials)');
      }
      return defaultWriter.render(template, view, partials, config);
    };
    mustache.escape = escapeHtml;
    mustache.Scanner = Scanner;
    mustache.Context = Context;
    mustache.Writer = Writer;
    mustache_default = mustache;
  }
});

// node_modules/@langchain/core/dist/prompts/template.js
var parseFString, mustacheTemplateToNodes, parseMustache, interpolateFString, interpolateMustache, DEFAULT_FORMATTER_MAPPING, DEFAULT_PARSER_MAPPING, renderTemplate, parseTemplate2, checkValidTemplate;
var init_template = __esm({
  "node_modules/@langchain/core/dist/prompts/template.js"() {
    "use strict";
    init_mustache();
    parseFString = (template) => {
      const chars = template.split("");
      const nodes = [];
      const nextBracket = (bracket, start) => {
        for (let i2 = start; i2 < chars.length; i2 += 1) {
          if (bracket.includes(chars[i2])) {
            return i2;
          }
        }
        return -1;
      };
      let i = 0;
      while (i < chars.length) {
        if (chars[i] === "{" && i + 1 < chars.length && chars[i + 1] === "{") {
          nodes.push({ type: "literal", text: "{" });
          i += 2;
        } else if (chars[i] === "}" && i + 1 < chars.length && chars[i + 1] === "}") {
          nodes.push({ type: "literal", text: "}" });
          i += 2;
        } else if (chars[i] === "{") {
          const j = nextBracket("}", i);
          if (j < 0) {
            throw new Error("Unclosed '{' in template.");
          }
          nodes.push({
            type: "variable",
            name: chars.slice(i + 1, j).join("")
          });
          i = j + 1;
        } else if (chars[i] === "}") {
          throw new Error("Single '}' in template.");
        } else {
          const next = nextBracket("{}", i);
          const text = (next < 0 ? chars.slice(i) : chars.slice(i, next)).join("");
          nodes.push({ type: "literal", text });
          i = next < 0 ? chars.length : next;
        }
      }
      return nodes;
    };
    mustacheTemplateToNodes = (template) => template.map((temp) => {
      if (temp[0] === "name") {
        const name = temp[1].includes(".") ? temp[1].split(".")[0] : temp[1];
        return { type: "variable", name };
      } else if (temp[0] === "#") {
        return { type: "variable", name: temp[1] };
      } else {
        return { type: "literal", text: temp[1] };
      }
    });
    parseMustache = (template) => {
      const parsed = mustache_default.parse(template);
      return mustacheTemplateToNodes(parsed);
    };
    interpolateFString = (template, values) => parseFString(template).reduce((res, node) => {
      if (node.type === "variable") {
        if (node.name in values) {
          return res + values[node.name];
        }
        throw new Error(`(f-string) Missing value for input ${node.name}`);
      }
      return res + node.text;
    }, "");
    interpolateMustache = (template, values) => mustache_default.render(template, values);
    DEFAULT_FORMATTER_MAPPING = {
      "f-string": interpolateFString,
      mustache: interpolateMustache
    };
    DEFAULT_PARSER_MAPPING = {
      "f-string": parseFString,
      mustache: parseMustache
    };
    renderTemplate = (template, templateFormat, inputValues) => DEFAULT_FORMATTER_MAPPING[templateFormat](template, inputValues);
    parseTemplate2 = (template, templateFormat) => DEFAULT_PARSER_MAPPING[templateFormat](template);
    checkValidTemplate = (template, templateFormat, inputVariables) => {
      if (!(templateFormat in DEFAULT_FORMATTER_MAPPING)) {
        const validFormats = Object.keys(DEFAULT_FORMATTER_MAPPING);
        throw new Error(`Invalid template format. Got \`${templateFormat}\`;
                         should be one of ${validFormats}`);
      }
      try {
        const dummyInputs = inputVariables.reduce((acc, v) => {
          acc[v] = "foo";
          return acc;
        }, {});
        if (Array.isArray(template)) {
          template.forEach((message) => {
            if (message.type === "text") {
              renderTemplate(message.text, templateFormat, dummyInputs);
            } else if (message.type === "image_url") {
              if (typeof message.image_url === "string") {
                renderTemplate(message.image_url, templateFormat, dummyInputs);
              } else {
                const imageUrl = message.image_url.url;
                renderTemplate(imageUrl, templateFormat, dummyInputs);
              }
            } else {
              throw new Error(`Invalid message template received. ${JSON.stringify(message, null, 2)}`);
            }
          });
        } else {
          renderTemplate(template, templateFormat, dummyInputs);
        }
      } catch (e) {
        throw new Error(`Invalid prompt schema: ${e.message}`);
      }
    };
  }
});

// node_modules/@langchain/core/dist/prompts/prompt.js
var prompt_exports = {};
__export(prompt_exports, {
  PromptTemplate: () => PromptTemplate
});
var PromptTemplate;
var init_prompt = __esm({
  "node_modules/@langchain/core/dist/prompts/prompt.js"() {
    "use strict";
    init_string2();
    init_template();
    PromptTemplate = class _PromptTemplate extends BaseStringPromptTemplate {
      static lc_name() {
        return "PromptTemplate";
      }
      constructor(input) {
        super(input);
        Object.defineProperty(this, "template", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "templateFormat", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "f-string"
        });
        Object.defineProperty(this, "validateTemplate", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        if (input.templateFormat === "mustache" && input.validateTemplate === void 0) {
          this.validateTemplate = false;
        }
        Object.assign(this, input);
        if (this.validateTemplate) {
          if (this.templateFormat === "mustache") {
            throw new Error("Mustache templates cannot be validated.");
          }
          let totalInputVariables = this.inputVariables;
          if (this.partialVariables) {
            totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
          }
          checkValidTemplate(this.template, this.templateFormat, totalInputVariables);
        }
      }
      _getPromptType() {
        return "prompt";
      }
      /**
       * Formats the prompt template with the provided values.
       * @param values The values to be used to format the prompt template.
       * @returns A promise that resolves to a string which is the formatted prompt.
       */
      async format(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        return renderTemplate(this.template, this.templateFormat, allValues);
      }
      /**
       * Take examples in list format with prefix and suffix to create a prompt.
       *
       * Intended to be used a a way to dynamically create a prompt from examples.
       *
       * @param examples - List of examples to use in the prompt.
       * @param suffix - String to go after the list of examples. Should generally set up the user's input.
       * @param inputVariables - A list of variable names the final prompt template will expect
       * @param exampleSeparator - The separator to use in between examples
       * @param prefix - String that should go before any examples. Generally includes examples.
       *
       * @returns The final prompt template generated.
       */
      static fromExamples(examples, suffix, inputVariables, exampleSeparator = "\n\n", prefix = "") {
        const template = [prefix, ...examples, suffix].join(exampleSeparator);
        return new _PromptTemplate({
          inputVariables,
          template
        });
      }
      static fromTemplate(template, options) {
        const { templateFormat = "f-string", ...rest } = options ?? {};
        const names = /* @__PURE__ */ new Set();
        parseTemplate2(template, templateFormat).forEach((node) => {
          if (node.type === "variable") {
            names.add(node.name);
          }
        });
        return new _PromptTemplate({
          // Rely on extracted types
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          inputVariables: [...names],
          templateFormat,
          template,
          ...rest
        });
      }
      /**
       * Partially applies values to the prompt template.
       * @param values The values to be partially applied to the prompt template.
       * @returns A new instance of PromptTemplate with the partially applied values.
       */
      async partial(values) {
        const newInputVariables = this.inputVariables.filter((iv) => !(iv in values));
        const newPartialVariables = {
          ...this.partialVariables ?? {},
          ...values
        };
        const promptDict = {
          ...this,
          inputVariables: newInputVariables,
          partialVariables: newPartialVariables
        };
        return new _PromptTemplate(promptDict);
      }
      serialize() {
        if (this.outputParser !== void 0) {
          throw new Error("Cannot serialize a prompt template with an output parser");
        }
        return {
          _type: this._getPromptType(),
          input_variables: this.inputVariables,
          template: this.template,
          template_format: this.templateFormat
        };
      }
      static async deserialize(data) {
        if (!data.template) {
          throw new Error("Prompt template must have a template");
        }
        const res = new _PromptTemplate({
          inputVariables: data.input_variables,
          template: data.template,
          templateFormat: data.template_format
        });
        return res;
      }
    };
  }
});

// node_modules/@langchain/core/dist/prompts/image.js
var ImagePromptTemplate;
var init_image = __esm({
  "node_modules/@langchain/core/dist/prompts/image.js"() {
    "use strict";
    init_prompt_values();
    init_base5();
    init_template();
    ImagePromptTemplate = class _ImagePromptTemplate extends BasePromptTemplate {
      static lc_name() {
        return "ImagePromptTemplate";
      }
      constructor(input) {
        super(input);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "prompts", "image"]
        });
        Object.defineProperty(this, "template", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "templateFormat", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "f-string"
        });
        Object.defineProperty(this, "validateTemplate", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        this.template = input.template;
        this.templateFormat = input.templateFormat ?? this.templateFormat;
        this.validateTemplate = input.validateTemplate ?? this.validateTemplate;
        if (this.validateTemplate) {
          let totalInputVariables = this.inputVariables;
          if (this.partialVariables) {
            totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
          }
          checkValidTemplate([
            { type: "image_url", image_url: this.template }
          ], this.templateFormat, totalInputVariables);
        }
      }
      _getPromptType() {
        return "prompt";
      }
      /**
       * Partially applies values to the prompt template.
       * @param values The values to be partially applied to the prompt template.
       * @returns A new instance of ImagePromptTemplate with the partially applied values.
       */
      async partial(values) {
        const newInputVariables = this.inputVariables.filter((iv) => !(iv in values));
        const newPartialVariables = {
          ...this.partialVariables ?? {},
          ...values
        };
        const promptDict = {
          ...this,
          inputVariables: newInputVariables,
          partialVariables: newPartialVariables
        };
        return new _ImagePromptTemplate(promptDict);
      }
      /**
       * Formats the prompt template with the provided values.
       * @param values The values to be used to format the prompt template.
       * @returns A promise that resolves to a string which is the formatted prompt.
       */
      async format(values) {
        const formatted = {};
        for (const [key, value] of Object.entries(this.template)) {
          if (typeof value === "string") {
            formatted[key] = value.replace(/{([^{}]*)}/g, (match, group) => {
              const replacement = values[group];
              return typeof replacement === "string" || typeof replacement === "number" ? String(replacement) : match;
            });
          } else {
            formatted[key] = value;
          }
        }
        const url = values.url || formatted.url;
        const detail = values.detail || formatted.detail;
        if (!url) {
          throw new Error("Must provide either an image URL.");
        }
        if (typeof url !== "string") {
          throw new Error("url must be a string.");
        }
        const output = { url };
        if (detail) {
          output.detail = detail;
        }
        return output;
      }
      /**
       * Formats the prompt given the input values and returns a formatted
       * prompt value.
       * @param values The input values to format the prompt.
       * @returns A Promise that resolves to a formatted prompt value.
       */
      async formatPromptValue(values) {
        const formattedPrompt = await this.format(values);
        return new ImagePromptValue(formattedPrompt);
      }
    };
  }
});

// node_modules/@langchain/core/dist/prompts/chat.js
var BaseMessagePromptTemplate, BaseChatPromptTemplate, _StringImageMessagePromptTemplate, SystemMessagePromptTemplate;
var init_chat2 = __esm({
  "node_modules/@langchain/core/dist/prompts/chat.js"() {
    "use strict";
    init_messages2();
    init_prompt_values();
    init_base4();
    init_string2();
    init_base5();
    init_prompt();
    init_image();
    init_template();
    BaseMessagePromptTemplate = class extends Runnable {
      constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "prompts", "chat"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
      }
      /**
       * Calls the formatMessages method with the provided input and options.
       * @param input Input for the formatMessages method
       * @param options Optional BaseCallbackConfig
       * @returns Formatted output messages
       */
      async invoke(input, options) {
        return this._callWithConfig((input2) => this.formatMessages(input2), input, { ...options, runType: "prompt" });
      }
    };
    BaseChatPromptTemplate = class extends BasePromptTemplate {
      constructor(input) {
        super(input);
      }
      async format(values) {
        return (await this.formatPromptValue(values)).toString();
      }
      async formatPromptValue(values) {
        const resultMessages = await this.formatMessages(values);
        return new ChatPromptValue(resultMessages);
      }
    };
    _StringImageMessagePromptTemplate = class extends BaseMessagePromptTemplate {
      static _messageClass() {
        throw new Error("Can not invoke _messageClass from inside _StringImageMessagePromptTemplate");
      }
      constructor(fields, additionalOptions) {
        if (!("prompt" in fields)) {
          fields = { prompt: fields };
        }
        super(fields);
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "prompts", "chat"]
        });
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "inputVariables", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: []
        });
        Object.defineProperty(this, "additionalOptions", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: {}
        });
        Object.defineProperty(this, "prompt", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "messageClass", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "chatMessageClass", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        this.prompt = fields.prompt;
        if (Array.isArray(this.prompt)) {
          let inputVariables = [];
          this.prompt.forEach((prompt) => {
            if ("inputVariables" in prompt) {
              inputVariables = inputVariables.concat(prompt.inputVariables);
            }
          });
          this.inputVariables = inputVariables;
        } else {
          this.inputVariables = this.prompt.inputVariables;
        }
        this.additionalOptions = additionalOptions ?? this.additionalOptions;
      }
      createMessage(content) {
        const constructor = this.constructor;
        if (constructor._messageClass()) {
          const MsgClass = constructor._messageClass();
          return new MsgClass({ content });
        } else if (constructor.chatMessageClass) {
          const MsgClass = constructor.chatMessageClass();
          return new MsgClass({
            content,
            role: this.getRoleFromMessageClass(MsgClass.lc_name())
          });
        } else {
          throw new Error("No message class defined");
        }
      }
      getRoleFromMessageClass(name) {
        switch (name) {
          case "HumanMessage":
            return "human";
          case "AIMessage":
            return "ai";
          case "SystemMessage":
            return "system";
          case "ChatMessage":
            return "chat";
          default:
            throw new Error("Invalid message class name");
        }
      }
      static fromTemplate(template, additionalOptions) {
        if (typeof template === "string") {
          return new this(PromptTemplate.fromTemplate(template, additionalOptions));
        }
        const prompt = [];
        for (const item of template) {
          if (typeof item === "string" || typeof item === "object" && "text" in item) {
            let text = "";
            if (typeof item === "string") {
              text = item;
            } else if (typeof item.text === "string") {
              text = item.text ?? "";
            }
            prompt.push(PromptTemplate.fromTemplate(text));
          } else if (typeof item === "object" && "image_url" in item) {
            let imgTemplate = item.image_url ?? "";
            let imgTemplateObject;
            let inputVariables = [];
            if (typeof imgTemplate === "string") {
              const parsedTemplate = parseFString(imgTemplate);
              const variables = parsedTemplate.flatMap((item2) => item2.type === "variable" ? [item2.name] : []);
              if (((variables == null ? void 0 : variables.length) ?? 0) > 0) {
                if (variables.length > 1) {
                  throw new Error(`Only one format variable allowed per image template.
Got: ${variables}
From: ${imgTemplate}`);
                }
                inputVariables = [variables[0]];
              } else {
                inputVariables = [];
              }
              imgTemplate = { url: imgTemplate };
              imgTemplateObject = new ImagePromptTemplate({
                template: imgTemplate,
                inputVariables
              });
            } else if (typeof imgTemplate === "object") {
              if ("url" in imgTemplate) {
                const parsedTemplate = parseFString(imgTemplate.url);
                inputVariables = parsedTemplate.flatMap((item2) => item2.type === "variable" ? [item2.name] : []);
              } else {
                inputVariables = [];
              }
              imgTemplateObject = new ImagePromptTemplate({
                template: imgTemplate,
                inputVariables
              });
            } else {
              throw new Error("Invalid image template");
            }
            prompt.push(imgTemplateObject);
          }
        }
        return new this({ prompt, additionalOptions });
      }
      async format(input) {
        if (this.prompt instanceof BaseStringPromptTemplate) {
          const text = await this.prompt.format(input);
          return this.createMessage(text);
        } else {
          const content = [];
          for (const prompt of this.prompt) {
            let inputs = {};
            if (!("inputVariables" in prompt)) {
              throw new Error(`Prompt ${prompt} does not have inputVariables defined.`);
            }
            for (const item of prompt.inputVariables) {
              if (!inputs) {
                inputs = { [item]: input[item] };
              }
              inputs = { ...inputs, [item]: input[item] };
            }
            if (prompt instanceof BaseStringPromptTemplate) {
              const formatted = await prompt.format(inputs);
              content.push({ type: "text", text: formatted });
            } else if (prompt instanceof ImagePromptTemplate) {
              const formatted = await prompt.format(inputs);
              content.push({ type: "image_url", image_url: formatted });
            }
          }
          return this.createMessage(content);
        }
      }
      async formatMessages(values) {
        return [await this.format(values)];
      }
    };
    SystemMessagePromptTemplate = class extends _StringImageMessagePromptTemplate {
      static _messageClass() {
        return SystemMessage;
      }
      static lc_name() {
        return "SystemMessagePromptTemplate";
      }
    };
  }
});

// node_modules/@langchain/core/dist/prompts/few_shot.js
var few_shot_exports = {};
__export(few_shot_exports, {
  FewShotChatMessagePromptTemplate: () => FewShotChatMessagePromptTemplate,
  FewShotPromptTemplate: () => FewShotPromptTemplate
});
var FewShotPromptTemplate, FewShotChatMessagePromptTemplate;
var init_few_shot = __esm({
  "node_modules/@langchain/core/dist/prompts/few_shot.js"() {
    "use strict";
    init_string2();
    init_template();
    init_prompt();
    init_chat2();
    FewShotPromptTemplate = class _FewShotPromptTemplate extends BaseStringPromptTemplate {
      constructor(input) {
        super(input);
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        Object.defineProperty(this, "examples", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "exampleSelector", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "examplePrompt", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "suffix", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ""
        });
        Object.defineProperty(this, "exampleSeparator", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "\n\n"
        });
        Object.defineProperty(this, "prefix", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ""
        });
        Object.defineProperty(this, "templateFormat", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "f-string"
        });
        Object.defineProperty(this, "validateTemplate", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.assign(this, input);
        if (this.examples !== void 0 && this.exampleSelector !== void 0) {
          throw new Error("Only one of 'examples' and 'example_selector' should be provided");
        }
        if (this.examples === void 0 && this.exampleSelector === void 0) {
          throw new Error("One of 'examples' and 'example_selector' should be provided");
        }
        if (this.validateTemplate) {
          let totalInputVariables = this.inputVariables;
          if (this.partialVariables) {
            totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
          }
          checkValidTemplate(this.prefix + this.suffix, this.templateFormat, totalInputVariables);
        }
      }
      _getPromptType() {
        return "few_shot";
      }
      static lc_name() {
        return "FewShotPromptTemplate";
      }
      async getExamples(inputVariables) {
        if (this.examples !== void 0) {
          return this.examples;
        }
        if (this.exampleSelector !== void 0) {
          return this.exampleSelector.selectExamples(inputVariables);
        }
        throw new Error("One of 'examples' and 'example_selector' should be provided");
      }
      async partial(values) {
        const newInputVariables = this.inputVariables.filter((iv) => !(iv in values));
        const newPartialVariables = {
          ...this.partialVariables ?? {},
          ...values
        };
        const promptDict = {
          ...this,
          inputVariables: newInputVariables,
          partialVariables: newPartialVariables
        };
        return new _FewShotPromptTemplate(promptDict);
      }
      /**
       * Formats the prompt with the given values.
       * @param values The values to format the prompt with.
       * @returns A promise that resolves to a string representing the formatted prompt.
       */
      async format(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        const examples = await this.getExamples(allValues);
        const exampleStrings = await Promise.all(examples.map((example) => this.examplePrompt.format(example)));
        const template = [this.prefix, ...exampleStrings, this.suffix].join(this.exampleSeparator);
        return renderTemplate(template, this.templateFormat, allValues);
      }
      serialize() {
        if (this.exampleSelector || !this.examples) {
          throw new Error("Serializing an example selector is not currently supported");
        }
        if (this.outputParser !== void 0) {
          throw new Error("Serializing an output parser is not currently supported");
        }
        return {
          _type: this._getPromptType(),
          input_variables: this.inputVariables,
          example_prompt: this.examplePrompt.serialize(),
          example_separator: this.exampleSeparator,
          suffix: this.suffix,
          prefix: this.prefix,
          template_format: this.templateFormat,
          examples: this.examples
        };
      }
      static async deserialize(data) {
        const { example_prompt } = data;
        if (!example_prompt) {
          throw new Error("Missing example prompt");
        }
        const examplePrompt = await PromptTemplate.deserialize(example_prompt);
        let examples;
        if (Array.isArray(data.examples)) {
          examples = data.examples;
        } else {
          throw new Error("Invalid examples format. Only list or string are supported.");
        }
        return new _FewShotPromptTemplate({
          inputVariables: data.input_variables,
          examplePrompt,
          examples,
          exampleSeparator: data.example_separator,
          prefix: data.prefix,
          suffix: data.suffix,
          templateFormat: data.template_format
        });
      }
    };
    FewShotChatMessagePromptTemplate = class _FewShotChatMessagePromptTemplate extends BaseChatPromptTemplate {
      _getPromptType() {
        return "few_shot_chat";
      }
      static lc_name() {
        return "FewShotChatMessagePromptTemplate";
      }
      constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "examples", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "exampleSelector", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "examplePrompt", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "suffix", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ""
        });
        Object.defineProperty(this, "exampleSeparator", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "\n\n"
        });
        Object.defineProperty(this, "prefix", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ""
        });
        Object.defineProperty(this, "templateFormat", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: "f-string"
        });
        Object.defineProperty(this, "validateTemplate", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        this.examples = fields.examples;
        this.examplePrompt = fields.examplePrompt;
        this.exampleSeparator = fields.exampleSeparator ?? "\n\n";
        this.exampleSelector = fields.exampleSelector;
        this.prefix = fields.prefix ?? "";
        this.suffix = fields.suffix ?? "";
        this.templateFormat = fields.templateFormat ?? "f-string";
        this.validateTemplate = fields.validateTemplate ?? true;
        if (this.examples !== void 0 && this.exampleSelector !== void 0) {
          throw new Error("Only one of 'examples' and 'example_selector' should be provided");
        }
        if (this.examples === void 0 && this.exampleSelector === void 0) {
          throw new Error("One of 'examples' and 'example_selector' should be provided");
        }
        if (this.validateTemplate) {
          let totalInputVariables = this.inputVariables;
          if (this.partialVariables) {
            totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
          }
          checkValidTemplate(this.prefix + this.suffix, this.templateFormat, totalInputVariables);
        }
      }
      async getExamples(inputVariables) {
        if (this.examples !== void 0) {
          return this.examples;
        }
        if (this.exampleSelector !== void 0) {
          return this.exampleSelector.selectExamples(inputVariables);
        }
        throw new Error("One of 'examples' and 'example_selector' should be provided");
      }
      /**
       * Formats the list of values and returns a list of formatted messages.
       * @param values The values to format the prompt with.
       * @returns A promise that resolves to a string representing the formatted prompt.
       */
      async formatMessages(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        let examples = await this.getExamples(allValues);
        examples = examples.map((example) => {
          const result = {};
          this.examplePrompt.inputVariables.forEach((inputVariable) => {
            result[inputVariable] = example[inputVariable];
          });
          return result;
        });
        const messages = [];
        for (const example of examples) {
          const exampleMessages = await this.examplePrompt.formatMessages(example);
          messages.push(...exampleMessages);
        }
        return messages;
      }
      /**
       * Formats the prompt with the given values.
       * @param values The values to format the prompt with.
       * @returns A promise that resolves to a string representing the formatted prompt.
       */
      async format(values) {
        const allValues = await this.mergePartialAndUserVariables(values);
        const examples = await this.getExamples(allValues);
        const exampleMessages = await Promise.all(examples.map((example) => this.examplePrompt.formatMessages(example)));
        const exampleStrings = exampleMessages.flat().map((message) => message.content);
        const template = [this.prefix, ...exampleStrings, this.suffix].join(this.exampleSeparator);
        return renderTemplate(template, this.templateFormat, allValues);
      }
      /**
       * Partially formats the prompt with the given values.
       * @param values The values to partially format the prompt with.
       * @returns A promise that resolves to an instance of `FewShotChatMessagePromptTemplate` with the given values partially formatted.
       */
      async partial(values) {
        const newInputVariables = this.inputVariables.filter((variable) => !(variable in values));
        const newPartialVariables = {
          ...this.partialVariables ?? {},
          ...values
        };
        const promptDict = {
          ...this,
          inputVariables: newInputVariables,
          partialVariables: newPartialVariables
        };
        return new _FewShotChatMessagePromptTemplate(promptDict);
      }
    };
  }
});

// node_modules/@langchain/core/dist/prompts/base.js
var BasePromptTemplate;
var init_base5 = __esm({
  "node_modules/@langchain/core/dist/prompts/base.js"() {
    "use strict";
    init_base4();
    BasePromptTemplate = class extends Runnable {
      get lc_attributes() {
        return {
          partialVariables: void 0
          // python doesn't support this yet
        };
      }
      constructor(input) {
        super(input);
        Object.defineProperty(this, "lc_serializable", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: true
        });
        Object.defineProperty(this, "lc_namespace", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: ["langchain_core", "prompts", this._getPromptType()]
        });
        Object.defineProperty(this, "inputVariables", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "outputParser", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        Object.defineProperty(this, "partialVariables", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: void 0
        });
        const { inputVariables } = input;
        if (inputVariables.includes("stop")) {
          throw new Error("Cannot have an input variable named 'stop', as it is used internally, please rename.");
        }
        Object.assign(this, input);
      }
      /**
       * Merges partial variables and user variables.
       * @param userVariables The user variables to merge with the partial variables.
       * @returns A Promise that resolves to an object containing the merged variables.
       */
      async mergePartialAndUserVariables(userVariables) {
        const partialVariables = this.partialVariables ?? {};
        const partialValues = {};
        for (const [key, value] of Object.entries(partialVariables)) {
          if (typeof value === "string") {
            partialValues[key] = value;
          } else {
            partialValues[key] = await value();
          }
        }
        const allKwargs = {
          ...partialValues,
          ...userVariables
        };
        return allKwargs;
      }
      /**
       * Invokes the prompt template with the given input and options.
       * @param input The input to invoke the prompt template with.
       * @param options Optional configuration for the callback.
       * @returns A Promise that resolves to the output of the prompt template.
       */
      async invoke(input, options) {
        return this._callWithConfig((input2) => this.formatPromptValue(input2), input, { ...options, runType: "prompt" });
      }
      /**
       * Return a json-like object representing this prompt template.
       * @deprecated
       */
      serialize() {
        throw new Error("Use .toJSON() instead");
      }
      /**
       * @deprecated
       * Load a prompt template from a json-like object describing it.
       *
       * @remarks
       * Deserializing needs to be async because templates (e.g. {@link FewShotPromptTemplate}) can
       * reference remote resources that we read asynchronously with a web
       * request.
       */
      static async deserialize(data) {
        switch (data._type) {
          case "prompt": {
            const { PromptTemplate: PromptTemplate2 } = await Promise.resolve().then(() => (init_prompt(), prompt_exports));
            return PromptTemplate2.deserialize(data);
          }
          case void 0: {
            const { PromptTemplate: PromptTemplate2 } = await Promise.resolve().then(() => (init_prompt(), prompt_exports));
            return PromptTemplate2.deserialize({ ...data, _type: "prompt" });
          }
          case "few_shot": {
            const { FewShotPromptTemplate: FewShotPromptTemplate2 } = await Promise.resolve().then(() => (init_few_shot(), few_shot_exports));
            return FewShotPromptTemplate2.deserialize(data);
          }
          default:
            throw new Error(`Invalid prompt type in config: ${data._type}`);
        }
      }
    };
  }
});

// node_modules/jsonpath-plus/dist/index-node-esm.js
import vm from "vm";
var {
  hasOwnProperty: hasOwnProp
} = Object.prototype;
function push(arr, item) {
  arr = arr.slice();
  arr.push(item);
  return arr;
}
function unshift(item, arr) {
  arr = arr.slice();
  arr.unshift(item);
  return arr;
}
var NewError = class extends Error {
  /**
   * @param {AnyResult} value The evaluated scalar value
   */
  constructor(value) {
    super('JSONPath should not be called with "new" (it prevents return of (unwrapped) scalar values)');
    this.avoidNew = true;
    this.value = value;
    this.name = "NewError";
  }
};
function JSONPath(opts, expr, obj, callback, otherTypeCallback) {
  if (!(this instanceof JSONPath)) {
    try {
      return new JSONPath(opts, expr, obj, callback, otherTypeCallback);
    } catch (e) {
      if (!e.avoidNew) {
        throw e;
      }
      return e.value;
    }
  }
  if (typeof opts === "string") {
    otherTypeCallback = callback;
    callback = obj;
    obj = expr;
    expr = opts;
    opts = null;
  }
  const optObj = opts && typeof opts === "object";
  opts = opts || {};
  this.json = opts.json || obj;
  this.path = opts.path || expr;
  this.resultType = opts.resultType || "value";
  this.flatten = opts.flatten || false;
  this.wrap = hasOwnProp.call(opts, "wrap") ? opts.wrap : true;
  this.sandbox = opts.sandbox || {};
  this.preventEval = opts.preventEval || false;
  this.parent = opts.parent || null;
  this.parentProperty = opts.parentProperty || null;
  this.callback = opts.callback || callback || null;
  this.otherTypeCallback = opts.otherTypeCallback || otherTypeCallback || function() {
    throw new TypeError("You must supply an otherTypeCallback callback option with the @other() operator.");
  };
  if (opts.autostart !== false) {
    const args = {
      path: optObj ? opts.path : expr
    };
    if (!optObj) {
      args.json = obj;
    } else if ("json" in opts) {
      args.json = opts.json;
    }
    const ret = this.evaluate(args);
    if (!ret || typeof ret !== "object") {
      throw new NewError(ret);
    }
    return ret;
  }
}
JSONPath.prototype.evaluate = function(expr, json, callback, otherTypeCallback) {
  let currParent = this.parent, currParentProperty = this.parentProperty;
  let {
    flatten,
    wrap: wrap2
  } = this;
  this.currResultType = this.resultType;
  this.currPreventEval = this.preventEval;
  this.currSandbox = this.sandbox;
  callback = callback || this.callback;
  this.currOtherTypeCallback = otherTypeCallback || this.otherTypeCallback;
  json = json || this.json;
  expr = expr || this.path;
  if (expr && typeof expr === "object" && !Array.isArray(expr)) {
    if (!expr.path && expr.path !== "") {
      throw new TypeError('You must supply a "path" property when providing an object argument to JSONPath.evaluate().');
    }
    if (!hasOwnProp.call(expr, "json")) {
      throw new TypeError('You must supply a "json" property when providing an object argument to JSONPath.evaluate().');
    }
    ({
      json
    } = expr);
    flatten = hasOwnProp.call(expr, "flatten") ? expr.flatten : flatten;
    this.currResultType = hasOwnProp.call(expr, "resultType") ? expr.resultType : this.currResultType;
    this.currSandbox = hasOwnProp.call(expr, "sandbox") ? expr.sandbox : this.currSandbox;
    wrap2 = hasOwnProp.call(expr, "wrap") ? expr.wrap : wrap2;
    this.currPreventEval = hasOwnProp.call(expr, "preventEval") ? expr.preventEval : this.currPreventEval;
    callback = hasOwnProp.call(expr, "callback") ? expr.callback : callback;
    this.currOtherTypeCallback = hasOwnProp.call(expr, "otherTypeCallback") ? expr.otherTypeCallback : this.currOtherTypeCallback;
    currParent = hasOwnProp.call(expr, "parent") ? expr.parent : currParent;
    currParentProperty = hasOwnProp.call(expr, "parentProperty") ? expr.parentProperty : currParentProperty;
    expr = expr.path;
  }
  currParent = currParent || null;
  currParentProperty = currParentProperty || null;
  if (Array.isArray(expr)) {
    expr = JSONPath.toPathString(expr);
  }
  if (!expr && expr !== "" || !json) {
    return void 0;
  }
  const exprList = JSONPath.toPathArray(expr);
  if (exprList[0] === "$" && exprList.length > 1) {
    exprList.shift();
  }
  this._hasParentSelector = null;
  const result = this._trace(exprList, json, ["$"], currParent, currParentProperty, callback).filter(function(ea) {
    return ea && !ea.isParentSelector;
  });
  if (!result.length) {
    return wrap2 ? [] : void 0;
  }
  if (!wrap2 && result.length === 1 && !result[0].hasArrExpr) {
    return this._getPreferredOutput(result[0]);
  }
  return result.reduce((rslt, ea) => {
    const valOrPath = this._getPreferredOutput(ea);
    if (flatten && Array.isArray(valOrPath)) {
      rslt = rslt.concat(valOrPath);
    } else {
      rslt.push(valOrPath);
    }
    return rslt;
  }, []);
};
JSONPath.prototype._getPreferredOutput = function(ea) {
  const resultType = this.currResultType;
  switch (resultType) {
    case "all": {
      const path = Array.isArray(ea.path) ? ea.path : JSONPath.toPathArray(ea.path);
      ea.pointer = JSONPath.toPointer(path);
      ea.path = typeof ea.path === "string" ? ea.path : JSONPath.toPathString(ea.path);
      return ea;
    }
    case "value":
    case "parent":
    case "parentProperty":
      return ea[resultType];
    case "path":
      return JSONPath.toPathString(ea[resultType]);
    case "pointer":
      return JSONPath.toPointer(ea.path);
    default:
      throw new TypeError("Unknown result type");
  }
};
JSONPath.prototype._handleCallback = function(fullRetObj, callback, type) {
  if (callback) {
    const preferredOutput = this._getPreferredOutput(fullRetObj);
    fullRetObj.path = typeof fullRetObj.path === "string" ? fullRetObj.path : JSONPath.toPathString(fullRetObj.path);
    callback(preferredOutput, type, fullRetObj);
  }
};
JSONPath.prototype._trace = function(expr, val, path, parent, parentPropName, callback, hasArrExpr, literalPriority) {
  let retObj;
  if (!expr.length) {
    retObj = {
      path,
      value: val,
      parent,
      parentProperty: parentPropName,
      hasArrExpr
    };
    this._handleCallback(retObj, callback, "value");
    return retObj;
  }
  const loc = expr[0], x = expr.slice(1);
  const ret = [];
  function addRet(elems) {
    if (Array.isArray(elems)) {
      elems.forEach((t) => {
        ret.push(t);
      });
    } else {
      ret.push(elems);
    }
  }
  if ((typeof loc !== "string" || literalPriority) && val && hasOwnProp.call(val, loc)) {
    addRet(this._trace(x, val[loc], push(path, loc), val, loc, callback, hasArrExpr));
  } else if (loc === "*") {
    this._walk(val, (m) => {
      addRet(this._trace(x, val[m], push(path, m), val, m, callback, true, true));
    });
  } else if (loc === "..") {
    addRet(this._trace(x, val, path, parent, parentPropName, callback, hasArrExpr));
    this._walk(val, (m) => {
      if (typeof val[m] === "object") {
        addRet(this._trace(expr.slice(), val[m], push(path, m), val, m, callback, true));
      }
    });
  } else if (loc === "^") {
    this._hasParentSelector = true;
    return {
      path: path.slice(0, -1),
      expr: x,
      isParentSelector: true
    };
  } else if (loc === "~") {
    retObj = {
      path: push(path, loc),
      value: parentPropName,
      parent,
      parentProperty: null
    };
    this._handleCallback(retObj, callback, "property");
    return retObj;
  } else if (loc === "$") {
    addRet(this._trace(x, val, path, null, null, callback, hasArrExpr));
  } else if (/^(-?\d*):(-?\d*):?(\d*)$/u.test(loc)) {
    addRet(this._slice(loc, x, val, path, parent, parentPropName, callback));
  } else if (loc.indexOf("?(") === 0) {
    if (this.currPreventEval) {
      throw new Error("Eval [?(expr)] prevented in JSONPath expression.");
    }
    const safeLoc = loc.replace(/^\?\((.*?)\)$/u, "$1");
    const nested = /@.?([^?]*)[['](\??\(.*?\))(?!.\)\])[\]']/gu.exec(safeLoc);
    if (nested) {
      this._walk(val, (m) => {
        const npath = [nested[2]];
        const nvalue = nested[1] ? val[m][nested[1]] : val[m];
        const filterResults = this._trace(npath, nvalue, path, parent, parentPropName, callback, true);
        if (filterResults.length > 0) {
          addRet(this._trace(x, val[m], push(path, m), val, m, callback, true));
        }
      });
    } else {
      this._walk(val, (m) => {
        if (this._eval(safeLoc, val[m], m, path, parent, parentPropName)) {
          addRet(this._trace(x, val[m], push(path, m), val, m, callback, true));
        }
      });
    }
  } else if (loc[0] === "(") {
    if (this.currPreventEval) {
      throw new Error("Eval [(expr)] prevented in JSONPath expression.");
    }
    addRet(this._trace(unshift(this._eval(loc, val, path[path.length - 1], path.slice(0, -1), parent, parentPropName), x), val, path, parent, parentPropName, callback, hasArrExpr));
  } else if (loc[0] === "@") {
    let addType = false;
    const valueType = loc.slice(1, -2);
    switch (valueType) {
      case "scalar":
        if (!val || !["object", "function"].includes(typeof val)) {
          addType = true;
        }
        break;
      case "boolean":
      case "string":
      case "undefined":
      case "function":
        if (typeof val === valueType) {
          addType = true;
        }
        break;
      case "integer":
        if (Number.isFinite(val) && !(val % 1)) {
          addType = true;
        }
        break;
      case "number":
        if (Number.isFinite(val)) {
          addType = true;
        }
        break;
      case "nonFinite":
        if (typeof val === "number" && !Number.isFinite(val)) {
          addType = true;
        }
        break;
      case "object":
        if (val && typeof val === valueType) {
          addType = true;
        }
        break;
      case "array":
        if (Array.isArray(val)) {
          addType = true;
        }
        break;
      case "other":
        addType = this.currOtherTypeCallback(val, path, parent, parentPropName);
        break;
      case "null":
        if (val === null) {
          addType = true;
        }
        break;
      default:
        throw new TypeError("Unknown value type " + valueType);
    }
    if (addType) {
      retObj = {
        path,
        value: val,
        parent,
        parentProperty: parentPropName
      };
      this._handleCallback(retObj, callback, "value");
      return retObj;
    }
  } else if (loc[0] === "`" && val && hasOwnProp.call(val, loc.slice(1))) {
    const locProp = loc.slice(1);
    addRet(this._trace(x, val[locProp], push(path, locProp), val, locProp, callback, hasArrExpr, true));
  } else if (loc.includes(",")) {
    const parts = loc.split(",");
    for (const part of parts) {
      addRet(this._trace(unshift(part, x), val, path, parent, parentPropName, callback, true));
    }
  } else if (!literalPriority && val && hasOwnProp.call(val, loc)) {
    addRet(this._trace(x, val[loc], push(path, loc), val, loc, callback, hasArrExpr, true));
  }
  if (this._hasParentSelector) {
    for (let t = 0; t < ret.length; t++) {
      const rett = ret[t];
      if (rett && rett.isParentSelector) {
        const tmp = this._trace(rett.expr, val, rett.path, parent, parentPropName, callback, hasArrExpr);
        if (Array.isArray(tmp)) {
          ret[t] = tmp[0];
          const tl = tmp.length;
          for (let tt = 1; tt < tl; tt++) {
            t++;
            ret.splice(t, 0, tmp[tt]);
          }
        } else {
          ret[t] = tmp;
        }
      }
    }
  }
  return ret;
};
JSONPath.prototype._walk = function(val, f) {
  if (Array.isArray(val)) {
    const n = val.length;
    for (let i = 0; i < n; i++) {
      f(i);
    }
  } else if (val && typeof val === "object") {
    Object.keys(val).forEach((m) => {
      f(m);
    });
  }
};
JSONPath.prototype._slice = function(loc, expr, val, path, parent, parentPropName, callback) {
  if (!Array.isArray(val)) {
    return void 0;
  }
  const len = val.length, parts = loc.split(":"), step = parts[2] && Number.parseInt(parts[2]) || 1;
  let start = parts[0] && Number.parseInt(parts[0]) || 0, end = parts[1] && Number.parseInt(parts[1]) || len;
  start = start < 0 ? Math.max(0, start + len) : Math.min(len, start);
  end = end < 0 ? Math.max(0, end + len) : Math.min(len, end);
  const ret = [];
  for (let i = start; i < end; i += step) {
    const tmp = this._trace(unshift(i, expr), val, path, parent, parentPropName, callback, true);
    tmp.forEach((t) => {
      ret.push(t);
    });
  }
  return ret;
};
JSONPath.prototype._eval = function(code, _v, _vname, path, parent, parentPropName) {
  this.currSandbox._$_parentProperty = parentPropName;
  this.currSandbox._$_parent = parent;
  this.currSandbox._$_property = _vname;
  this.currSandbox._$_root = this.json;
  this.currSandbox._$_v = _v;
  const containsPath = code.includes("@path");
  if (containsPath) {
    this.currSandbox._$_path = JSONPath.toPathString(path.concat([_vname]));
  }
  const scriptCacheKey = "script:" + code;
  if (!JSONPath.cache[scriptCacheKey]) {
    let script = code.replace(/@parentProperty/gu, "_$_parentProperty").replace(/@parent/gu, "_$_parent").replace(/@property/gu, "_$_property").replace(/@root/gu, "_$_root").replace(/@([.\s)[])/gu, "_$_v$1");
    if (containsPath) {
      script = script.replace(/@path/gu, "_$_path");
    }
    JSONPath.cache[scriptCacheKey] = new this.vm.Script(script);
  }
  try {
    return JSONPath.cache[scriptCacheKey].runInNewContext(this.currSandbox);
  } catch (e) {
    throw new Error("jsonPath: " + e.message + ": " + code);
  }
};
JSONPath.cache = {};
JSONPath.toPathString = function(pathArr) {
  const x = pathArr, n = x.length;
  let p = "$";
  for (let i = 1; i < n; i++) {
    if (!/^(~|\^|@.*?\(\))$/u.test(x[i])) {
      p += /^[0-9*]+$/u.test(x[i]) ? "[" + x[i] + "]" : "['" + x[i] + "']";
    }
  }
  return p;
};
JSONPath.toPointer = function(pointer) {
  const x = pointer, n = x.length;
  let p = "";
  for (let i = 1; i < n; i++) {
    if (!/^(~|\^|@.*?\(\))$/u.test(x[i])) {
      p += "/" + x[i].toString().replace(/~/gu, "~0").replace(/\//gu, "~1");
    }
  }
  return p;
};
JSONPath.toPathArray = function(expr) {
  const {
    cache
  } = JSONPath;
  if (cache[expr]) {
    return cache[expr].concat();
  }
  const subx = [];
  const normalized = expr.replace(/@(?:null|boolean|number|string|integer|undefined|nonFinite|scalar|array|object|function|other)\(\)/gu, ";$&;").replace(/[['](\??\(.*?\))[\]'](?!.\])/gu, function($0, $1) {
    return "[#" + (subx.push($1) - 1) + "]";
  }).replace(/\[['"]([^'\]]*)['"]\]/gu, function($0, prop) {
    return "['" + prop.replace(/\./gu, "%@%").replace(/~/gu, "%%@@%%") + "']";
  }).replace(/~/gu, ";~;").replace(/['"]?\.['"]?(?![^[]*\])|\[['"]?/gu, ";").replace(/%@%/gu, ".").replace(/%%@@%%/gu, "~").replace(/(?:;)?(\^+)(?:;)?/gu, function($0, ups) {
    return ";" + ups.split("").join(";") + ";";
  }).replace(/;;;|;;/gu, ";..;").replace(/;$|'?\]|'$/gu, "");
  const exprList = normalized.split(";").map(function(exp) {
    const match = exp.match(/#(\d+)/u);
    return !match || !match[1] ? exp : subx[match[1]];
  });
  cache[expr] = exprList;
  return cache[expr].concat();
};
JSONPath.prototype.vm = vm;

// src/action.ts
var Action = class {
  key;
  dataPaths;
  id;
  constructor(outputKey, dataPaths = []) {
    this.key = outputKey;
    this.dataPaths = dataPaths;
    this.id = "";
  }
  getActionData(workingData) {
    let data = {};
    if (this.dataPaths.length > 0) {
      for (let dataPath of this.dataPaths) {
        let selection = JSONPath({ path: dataPath.path, json: workingData });
        if (selection.length === 1) {
          data[dataPath.targetProperty] = selection[0];
        } else {
          if (selection.length > 1) {
            data[dataPath.targetProperty] = selection;
          } else {
            throw Error(`An Error Occured.
${dataPath.path} could not be found in the dataset.`);
          }
        }
      }
    } else {
      throw Error("No data paths provided");
    }
    return data;
  }
  invoke(input) {
    if (input.completedActions.includes(this.id)) {
      console.log(`Action ${this.key} with the id #${this.id}# is already complete.`);
      return input[this.key];
    }
    return this.runAction(input);
  }
};

// node_modules/@langchain/core/dist/prompts/index.js
init_base5();
init_chat2();
init_few_shot();

// node_modules/@langchain/core/dist/prompts/pipeline.js
init_base5();
init_chat2();

// node_modules/@langchain/core/dist/prompts/index.js
init_prompt();
init_string2();
init_template();
init_image();

// node_modules/@langchain/core/dist/prompts/structured.js
init_chat2();

// src/agentaction.ts
var AgentAction = class extends Action {
  agent;
  llm;
  constructor(agent, llm, outputKey, dataPaths = []) {
    super(outputKey, dataPaths);
    this.agent = agent;
    this.llm = llm;
  }
  getSystemPrompt() {
    return SystemMessagePromptTemplate.fromTemplate(`
        You are a helpful AI Agent who takes on the role of {{role}}.

        For context, your backstory is: {{backstory}}

        Your focus is always on helping users achieve their goals.
        Your current goal is {{goal}}
        `, { templateFormat: "mustache" });
  }
};
var agentaction_default = AgentAction;

// src/toolaction.ts
var ToolAction = class extends Action {
  constructor(outputKey, dataPaths = []) {
    super(outputKey, dataPaths);
  }
};
var toolaction_default = ToolAction;

// src/conditionalaction.ts
var Operator = /* @__PURE__ */ ((Operator2) => {
  Operator2["EQUALS"] = "==";
  Operator2["NOT_EQUALS"] = "!=";
  Operator2["GREATER_THAN"] = ">";
  Operator2["LESS_THAN"] = "<";
  Operator2["GREATER_THAN_OR_EQUALS"] = ">=";
  Operator2["LESS_THAN_OR_EQUALS"] = "<=";
  return Operator2;
})(Operator || {});
var ConditionalAction = class {
  key;
  condition;
  ifAction;
  elseAction;
  constructor(key, condition, ifAction, elseAction) {
    this.key = "CONDITIONAL:" + key;
    this.condition = condition;
    this.ifAction = ifAction;
    this.elseAction = elseAction;
  }
  getActionData(workingData) {
    let data = {};
    if (this.condition.dataPath) {
      let selection = JSONPath({ path: this.condition.dataPath.path, json: workingData });
      if (selection.length === 1) {
        return selection[0];
      } else {
        throw Error(`An Error Occured.
${this.condition.dataPath.path} could not be found in the dataset.`);
      }
    } else {
      throw Error("No data paths provided");
    }
  }
  async invoke(data) {
    const value = this.getActionData(data);
    const operator = this.condition.operator;
    const conditionValue = this.condition.value;
    switch (operator) {
      case "==" /* EQUALS */:
        if (value === conditionValue) {
          return await this.ifAction.invoke(data);
        }
        break;
      case "!=" /* NOT_EQUALS */:
        if (value !== conditionValue) {
          return await this.ifAction.invoke(data);
        }
        break;
      case ">" /* GREATER_THAN */:
        if (value > conditionValue) {
          return await this.ifAction.invoke(data);
        }
        break;
      case "<" /* LESS_THAN */:
        if (value < conditionValue) {
          return await this.ifAction.invoke(data);
        }
        break;
      case ">=" /* GREATER_THAN_OR_EQUALS */:
        if (value >= conditionValue) {
          return await this.ifAction.invoke(data);
        }
        break;
      case "<=" /* LESS_THAN_OR_EQUALS */:
        if (value <= conditionValue) {
          return await this.ifAction.invoke(data);
        }
        break;
    }
    return await this.elseAction.invoke(data);
  }
};
var conditionalaction_default = ConditionalAction;
export {
  agentaction_default as AgentAction,
  conditionalaction_default as ConditionalAction,
  Operator,
  toolaction_default as ToolAction
};
/*! Bundled license information:

@langchain/core/dist/utils/fast-json-patch/src/helpers.js:
  (*!
   * https://github.com/Starcounter-Jack/JSON-Patch
   * (c) 2017-2022 Joachim Wester
   * MIT licensed
   *)

@langchain/core/dist/utils/fast-json-patch/src/duplex.js:
  (*!
   * https://github.com/Starcounter-Jack/JSON-Patch
   * (c) 2013-2021 Joachim Wester
   * MIT license
   *)

mustache/mustache.mjs:
  (*!
   * mustache.js - Logic-less {{mustache}} templates with JavaScript
   * http://github.com/janl/mustache.js
   *)
*/
