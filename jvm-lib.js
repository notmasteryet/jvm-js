var nextLockId = 0;

factories["java/lang/Object"] = {
  create: function() {
    var lockId = nextLockId++ | 0;
    return {
      "<init>": function() {},
      toString: function() { return "[object: " + lockId + "]"; },
      hashCode: function() { return lockId; },
      equals: function(other) { return this == other; }
    };
  }
};

var systemOut = {
  print: function(s) { log(s + "..."); }, 
  println : function(s) { log(s||""); } 
};

factories["java/lang/System"] = {
  statics: {
    "out": systemOut,
    "exit": function() {
      throw "Exit was called";
    }
  }
};

factories["java/lang/StringBuilder"] = {
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
  }
};

