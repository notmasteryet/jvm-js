var nextLockId = 0;

function addFactory(description) {  
  factories[description.className] = description;
}

addFactory({
  className: "java/lang/Object",
  create: function() {
    return new JavaObject();
  },
  instanceMethods: ["toString", "hashCode", "equals"]
});

function JavaObject() {
  this.$lockId = nextLockId++ | 0;
}
JavaObject.prototype.$factory = factories["java/lang/Object"];
JavaObject.prototype.toString = function() { return "[object: " + this.$lockId + "]"; };
JavaObject.prototype.hashCode = function() { return this.$lockId; };
JavaObject.prototype.equals = function(other) { return this == normalizeObject(other, "java/lang/Object"); };
JavaObject.prototype["<init>"] = function() {};

var systemOut = {
  print: function(s) { log(s); }, 
  println : function(s) { log((s||"") + "\n"); } 
};

addFactory({
  className: "java/lang/System",
  statics: {
    "out": systemOut,
    "err": systemOut,
    "exit": function() {
      throw "Exit was called";
    }
  }
});

addFactory({
  className: "java/lang/StringBuilder",
  superFactory: factories["java/lang/Object"],
  create: function() {
    var buffer;
    return {
      "<init>": function() {
        buffer = "";
      },
      append: function(value) {
        if (typeof value === "object" && "value" in value) {
          buffer += value.value;
        } else if (value != null) {
          buffer += value.toString();
        }
        return this;
      },
      toString: function() {
        return buffer;
      }
    };
  },
  instanceMethods: ["toString", "append"]
});

addFactory({
  className: "java/lang/String",
  superFactory: factories["java/lang/Object"],
  create: function () {
    return new JavaString();
  },
  instanceMethods: ["toString", "hashCode", "equals"]  
});

function JavaString(s) {
  if (typeof s === "string") {
    this.s = s;
    this.$self = this;
    var super_= new JavaObject();
    this.$super = super_;
    super_.$self = this;
    super_.$upcast = this;
  }
};
JavaString.prototype.$factory = factories["java/lang/String"];
JavaString.prototype.toString = function() { return this.s; };
JavaString.prototype.hashCode = function() { return this.s.length; };
JavaString.prototype.equals = function(other) { return this.s == normalizeObject(other, "java/lang/String").s; };
JavaString.prototype["<init>"] = function(s) { this.s = s; };

addFactory({
  className: "java/lang/Throwable",
  superFactory: factories["java/lang/Object"],
  create: function () {
    return {
      "<init>" : function(message, cause) { 
        this.$super["<init>"](); 
        this.message = message || null;
        this.cause = cause || null;
      },
      getMessage: function() { return this.message; },
      getCause: function() { return this.cause; },
      toString: function() { 
        return this.$self.$factory.className.replace(/\//g, ".") + ": " + this.$self.getMessage(); 
      }
    };
  },
  instanceMethods: ["getMessage", "getCause", "toString"]
});

addFactory({
  className: "java/lang/Exception",
  superFactory: factories["java/lang/Throwable"],
  create: function() {
    return { "<init>" : function(message, cause) { this.$super["<init>"](message, cause); } };
  },
  instanceMethods: []  
});

addFactory({
  className: "java/lang/RuntimeException",
  superFactory: factories["java/lang/Exception"],
  create: function() {
    return { "<init>" : function(message, cause) { this.$super["<init>"](message, cause); } };
  },
  instanceMethods: []  
});

addFactory({
  className: "java/lang/ArithmeticException",
  superFactory: factories["java/lang/RuntimeException"],
  create: function() {
    return { "<init>" : function(message) { this.$super["<init>"](message); } };
  },
  instanceMethods: []  
});
