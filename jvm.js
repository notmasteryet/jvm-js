/*
BaseType Character 	Type 	Interpretation
B 	byte 	signed byte
C 	char 	Unicode character
D 	double 	double-precision floating-point value
F 	float 	single-precision floating-point value
I 	int 	integer
J 	long 	long integer
L<classname>; 	reference 	an instance of class <classname>
S 	short 	signed short
Z 	boolean 	true or false
[ 	reference 	one array dimension 
*/
function JVMjs(method, constant_pool, obj, args) {
  function getValueCategory(value) {
    return value.type === "D" || value.type === "J" ? 2 : 1;
  }

  function getArgumentsFromDescriptor(descriptor) {
    var i = descriptor.indexOf("("), j = descriptor.indexOf(")");
    var regexp = /\[+(L[^;]*;|[BCDFIJSZ])/g;
    var args = [], m, argsString = descriptor.substring(i + 1, j);
    while ((m = regexp.exec(argsString)) !== null) {
      args.push(m[0]);
    }
    return args;
  }

  function getArgumentsCountFromDescriptor(descriptor) {
    return getArgumentsFromDescriptor(descriptor).length;
  }

  var methodCode = method.find_attribute("Code");
  var isStatic = "ACC_STATIC" in method.access_flags;
  var argumentDescriptions = getArgumentsFromDescriptor(method.descriptor);

  var bytecode = methodCode.code;
  var stack = [];
  var locals = [];
  if (isStatic) {
    locals.push(obj);
  }
  for (var i = 0; i < argumentDescriptions.length; i++) {
    locals.push(args[i]);
  }

  var cp = 0;
  var state = null;
  var wideFound = false;

  this.execute = function() {
var u = 300;
    this.stopState = null;
    while(this.step() && u-- > 0);
    this.stopState = state;
uneval(state);
  };


  this.step = function() {
    state = null;

    function validateArrayref(arrayref) {
      if (arrayref === null) {
        raiseException("Ljava/lang/NullPointerException;");
      }
    }

    function validateArrayrefAndIndex(arrayref, index) {
      validateArrayref(arrayref);
      if (!(index.value >= 0 || index.value < arrayref.length)) {
        raiseException("Ljava/lang/????;");
      }
    }

    function raiseException(typeName) {
    }

    function validateNonNull(objectref) {
      if (objectref === null) {
        raiseException("Ljava/lang/NullPointerException;");
      }
    }

    function convertForStore(value, oldValue) {
      if (!oldValue || !value || !("type" in value) || !("value" in value)) { 
        return value;
      }
      if (value.type === oldValue.type) {
        return value;
      } else if (value.type === "J") {
        return {value:value.value.toNumeric(), type:oldValue.type};
      } else if (oldValue.type === "J") {
        return {value:LongValue.fromNumeric(value.value), type:oldValue.type};
      } else {
        return {value:value.value, type:oldValue.type};
      }
    }

    function getDefaultValue(atype) {
      switch (atype) {
      case 4: // T_BOOLEAN
        return { value: 0, type: "Z" };
      case 5: // T_CHAR
        return { value: 0, type: "C" };
      case 6: // T_FLOAT
        return { value: 0, type: "F" };
      case 7: // T_DOUBLE
        return { value: 0, type: "D" };
      case 8: // T_BYTE
        return { value: 0, type: "B" };
      case 9: // T_SHORT
        return { value: 0, type: "S" };
      case 10: // T_INT
        return { value: 0, type: "I" };
      case 11: // T_LONG
        return { value: LongValue.Zero, type: "J" };
      }
      return null;
    }

    function createAArray(counts, class_) {
      var ar = [];
      for (var i = 0, l = counts[0]; i < l; ++i) {
        ar.push( counts.length <= 1 ? null :
         createAArray(counts.slice(1, counts.length), class_) );
      }
      return ar;
    }

    function createArray(count, atype) {
      var ar = [], defaultValue = getDefaultValue(atype);
      for (var i = 0, l = count.value; i < l; ++i) {
        ar.push(defaultValue);
      }
      return ar;
    }

    function checkCast(objectref, type) {
    }

    function instanceOf(objectref, type) {
      return 1;
    }

    var op = bytecode[cp++];
    var jumpToAddress = null;
log("OP="+ op + ";CP=" + (cp-1));
    switch (op) {
case 0: // (0x00) nop
  break;
case 1: // (0x01) aconst_null
  stack.push(null);
  break;
case 2: // (0x02) iconst_m1
case 3: // (0x03) iconst_0
case 4: // (0x04) iconst_1
case 5: // (0x05) iconst_2
case 6: // (0x06) iconst_3
case 7: // (0x07) iconst_4
case 8: // (0x08) iconst_5
  var n = op - 3;
  stack.push({value: n, type: "I"});
  break;
case 9: // (0x09) lconst_0
case 10: // (0x0a) lconst_1
  var n = op - 9;
  stack.push({value: new LongValue([0,0,0,0,0,0,0,n]), type: "J"});
  break;
case 11: // (0x0b) fconst_0
case 12: // (0x0c) fconst_1
case 13: // (0x0d) fconst_2
  var n = op - 11;
  stack.push({value: n, type: "F"});
  break;
case 14: // (0x0e) dconst_0
case 15: // (0x0f) dconst_1
  var n = op - 14;
  stack.push({value: n, type: "D"});
  break;
case 16: // (0x10) bipush
  var n = bytecode[cp++];
  stack.push({value: n > 0x80 ? n - 0x100 : n, type: "I"});
  break;
case 17: // (0x11) sipush
  var n = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  stack.push({value: n > 0x8000 ? n - 0x10000 : n, type: "I"});
  break;
case 18: // (0x12) ldc
  var index = bytecode[cp++];
  stack.push({
    value: constant_pool[index].value, 
    type: constant_pool[index].type_value
  });
  break;
case 19: // (0x13) ldc_w
case 20: // (0x14) ldc2_w
  var index = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  stack.push({
    value: constant_pool[index].value, 
    type: constant_pool[index].type_value
  });
  break;
case 21: // (0x15) iload
case 22: // (0x16) lload
case 23: // (0x17) fload
case 24: // (0x18) dload
case 25: // (0x19) aload
  var index;
  if (wideFound) {
    wideFound = false;
    index = (bytecode[cp] << 8) | bytecode[cp + 1];
    cp += 2;
  } else {
    index = bytecode[cp++];
  }
  stack.push(locals[index]);
  break;
case 26: // (0x1a) iload_0
case 30: // (0x1e) lload_0
case 34: // (0x22) fload_0
case 38: // (0x26) dload_0
case 42: // (0x2a) aload_0
  stack.push(locals[0]);
  break;
case 27: // (0x1b) iload_1
case 31: // (0x1f) lload_1
case 35: // (0x23) fload_1
case 39: // (0x27) dload_1
case 43: // (0x2b) aload_1
  stack.push(locals[1]);
  break;
case 32: // (0x20) lload_2
case 28: // (0x1c) iload_2
case 36: // (0x24) fload_2
case 40: // (0x28) dload_2
case 44: // (0x2c) aload_2
  stack.push(locals[2]);
  break;
case 29: // (0x1d) iload_3
case 33: // (0x21) lload_3
case 37: // (0x25) fload_3
case 41: // (0x29) dload_3
case 45: // (0x2d) aload_3
  stack.push(locals[3]);
  break;
case 46: // (0x2e) iaload
case 47: // (0x2f) laload
case 48: // (0x30) faload
case 49: // (0x31) daload
case 50: // (0x32) aaload
case 51: // (0x33) baload
case 52: // (0x34) caload
case 53: // (0x35) saload
  var index = stack.pop();
  var arrayref = stack.pop();
  validateArrayrefAndIndex(arrayref, index);
  stack.push(arrayref.value[index.value]);
  break;
case 54: // (0x36) istore
case 55: // (0x37) lstore
case 56: // (0x38) fstore
case 57: // (0x39) dstore
case 58: // (0x3a) astore
  var index;
  if (wideFound) {
    wideFound = false;
    index = (bytecode[cp] << 8) | bytecode[cp + 1];
    cp += 2;
  } else {
    index = bytecode[cp++];
  }
  locals[index] = convertForStore(stack.pop(), locals[index]);
  break;
case 59: // (0x3b) istore_0
case 63: // (0x3f) lstore_0
case 67: // (0x43) fstore_0
case 71: // (0x47) dstore_0
case 75: // (0x4b) astore_0
  locals[0] = convertForStore(stack.pop(), locals[0]);
  break;
case 60: // (0x3c) istore_1
case 64: // (0x40) lstore_1
case 68: // (0x44) fstore_1
case 72: // (0x48) dstore_1
case 76: // (0x4c) astore_1
  locals[1] = convertForStore(stack.pop(), locals[1]);
  break;
case 61: // (0x3d) istore_2
case 65: // (0x41) lstore_2
case 69: // (0x45) fstore_2
case 73: // (0x49) dstore_2
case 77: // (0x4d) astore_2
  locals[2] = convertForStore(stack.pop(), locals[2]);
  break;
case 62: // (0x3e) istore_3
case 66: // (0x42) lstore_3
case 70: // (0x46) fstore_3
case 74: // (0x4a) dstore_3
case 78: // (0x4e) astore_3
  locals[3] = convertForStore(stack.pop(), locals[3]);
  break;
case 79: // (0x4f) iastore
case 80: // (0x50) lastore
case 81: // (0x51) fastore
case 82: // (0x52) dastore
case 83: // (0x53) aastore
case 84: // (0x54) bastore
case 85: // (0x55) castore
case 86: // (0x56) sastore
  var value = stack.pop();
  var index = stack.pop();
  var arrayref = stack.pop();
  validateArrayrefAndIndex(arrayref, index);
  arrayref.value[index.value] = convertForStore(value, arrayref.value[index.value]);
  break;
case 87: // (0x57) pop
  stack.pop();
  break;
case 88: // (0x58) pop2
  if (getValueCategory(stack.pop()) === 1) {
    stack.pop();
  }
  break;
case 89: // (0x59) dup
  var value = stack.pop();
  stack.push(value);
  stack.push(value);
  break;
case 90: // (0x5a) dup_x1
  var value1 = stack.pop();
  var value2 = stack.pop();
  stack.push(value1);
  stack.push(value2);
  stack.push(value1);
  break;
case 91: // (0x5b) dup_x2
  var value1 = stack.pop();
  var value2 = stack.pop();
  if (getValueCategory(value1) === 1) {
    var value3 = stack.pop();
    stack.push(value1);
    stack.push(value3);
    stack.push(value2);
    stack.push(value1);
  } else {
    stack.push(value1);
    stack.push(value2);
    stack.push(value1);
  }
  break;
case 92: // (0x5c) dup2
  var value1 = stack.pop();
  if (getValueCategory(value1) === 1) {
    var value2 = stack.pop();
    stack.push(value2);
    stack.push(value1);
    stack.push(value2);
    stack.push(value1);
  } else {
    stack.push(value1);
    stack.push(value1);
  }
  break;
case 93: // (0x5d) dup2_x1
  var value1 = stack.pop();
  var value2 = stack.pop();
  if (getValueCategory(value1) === 1) {
    var value3 = stack.pop();
    stack.push(value2);
    stack.push(value1);
    stack.push(value3);
    stack.push(value2);
    stack.push(value1);
  } else {
    stack.push(value1);
    stack.push(value2);
    stack.push(value1);
  }
  break;
case 94: // (0x5e) dup2_x2
  var value1 = stack.pop();
  var value2 = stack.pop();
  if (getValueCategory(value1) === 1) {
    var value3 = stack.pop();
    if(getValueCategory(value3) === 1) {
      var value4 = stack.pop();
      // form 1
      stack.push(value2);
      stack.push(value1);
      stack.push(value4);
      stack.push(value3);
      stack.push(value2);
      stack.push(value1);
    } else  {
      // form 3
      stack.push(value2);
      stack.push(value1);
      stack.push(value3);
      stack.push(value2);
      stack.push(value1);
    }
  } else {
    if(getValueCategory(value2) === 1) {
      var value3 = stack.pop();
      // form 2
      stack.push(value1);
      stack.push(value3);
      stack.push(value2);
      stack.push(value1);
    } else  {
      // form 4
      stack.push(value1);
      stack.push(value2);
      stack.push(value1);
    }
  }
  break;
case 95: // (0x5f) swap
  var value1 = stack.pop();
  var value2 = stack.pop();
  stack.push(value1);
  stack.push(value2);
  break;
case 96: // (0x60) iadd
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = (value1.value + value2.value) | 0;
  stack.push({value: resultValue, type: "I"});
  break;  
case 97: // (0x61) ladd
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value.add(value2.value);
  stack.push({value: resultValue, type: "J"});
  break;  
case 98: // (0x62) fadd
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value + value2.value;
  stack.push({value: resultValue, type: "F"});
  break;  
case 99: // (0x63) dadd
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value + value2.value;
  stack.push({value: resultValue, type: "D"});
  break;  
case 100: // (0x64) isub
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = (value1.value - value2.value) | 0;
  stack.push({value: resultValue, type: "I"});
  break;  
case 101: // (0x65) lsub
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value.sub(value2.value);
  stack.push({value: resultValue, type: "J"});
  break;  
case 102: // (0x66) fsub
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value - value2.value;
  stack.push({value: resultValue, type: "F"});
  break;  
case 103: // (0x67) dsub
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value - value2.value;
  stack.push({value: resultValue, type: "D"});
  break;  
case 104: // (0x68) imul
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = (value1.value * value2.value) | 0;
  stack.push({value: resultValue, type: "I"});
  break;  
case 105: // (0x69) lmul
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value.mul(value2.value);
  stack.push({value: resultValue, type: "J"});
  break;  
case 106: // (0x6a) fmul
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value * value2.value;
  stack.push({value: resultValue, type: "F"});
  break;  
case 107: // (0x6b) dmul
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value * value2.value;
  stack.push({value: resultValue, type: "D"});
  break;  
case 108: // (0x6c) idiv
  var value2 = stack.pop();
  var value1 = stack.pop();
  if (value2.value === 0) raiseException("Ljava/lang/ArithmeticException;");
  var resultValue = (value1.value / value2.value) | 0;
  stack.push({value: resultValue, type: "I"});
  break;  
case 109: // (0x6d) ldiv
  var value2 = stack.pop();
  var value1 = stack.pop();
  if (value2.value.cmp(LongValue.Zero) === 0) raiseException("Ljava/lang/ArithmeticException;");
  var resultValue = value1.value.div(value2.value);
  stack.push({value: resultValue, type: "J"});
  break;  
case 110: // (0x6e) fdiv
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value / value2.value;
  stack.push({value: resultValue, type: "F"});
  break;  
case 111: // (0x6f) ddiv
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value / value2.value;
  stack.push({value: resultValue, type: "D"});
  break;  
case 112: // (0x70) irem
  var value2 = stack.pop();
  var value1 = stack.pop();
  if (value2.value === 0) raiseException("Ljava/lang/ArithmeticException;");
  var resultValue = value1.value - ((value1.value / value2.value) | 0) * value2.value;
  stack.push({value: resultValue, type: "I"});
  break;  
case 113: // (0x71) lrem
  var value2 = stack.pop();
  var value1 = stack.pop();
  if (value2.value.cmp(LongValue.Zero) === 0) raiseException("Ljava/lang/ArithmeticException;");
  var resultValue = value1.value.rem(value2.value);
  stack.push({value: resultValue, type: "J"});
  break;  
case 114: // (0x72) frem
  var value2 = stack.pop();
  var value1 = stack.pop();
  if (value2.value === 0 || isNaN(value2.value)) {
    stack.push({value: NaN, type: "F"});
  } else {
    var resultValue = value1.value - Math.floor(value1.value / value2.value) * value2.value;
    stack.push({value: resultValue, type: "F"});
  }
  break;  
case 115: // (0x73) drem
  var value2 = stack.pop();
  var value1 = stack.pop();
  if (value2.value === 0 || isNaN(value2.value)) {
    stack.push({value: NaN, type: "D"});
  } else {
    var resultValue = value1.value - Math.floor(value1.value / value2.value) * value2.value;
    stack.push({value: resultValue, type: "D"});
  }
  break;  
case 116: // (0x74) ineg
  var value = stack.pop();
  var resultValue = (-value2.value) | 0;
  stack.push({value: resultValue, type: "I"});
  break;  
case 117: // (0x75) lneg
  var value = stack.pop();
  var resultValue = value2.value.neg();
  stack.push({value: resultValue, type: "J"});
  break;  
case 118: // (0x76) fneg
  var value = stack.pop();
  var resultValue = -value2.value;
  stack.push({value: resultValue, type: "F"});
  break;  
case 119: // (0x77) dneg
  var value = stack.pop();
  var resultValue = -value2.value;
  stack.push({value: resultValue, type: "D"});
  break;  
case 120: // (0x78) ishl
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = (value1.value << (value2.value & 0x3F));
  stack.push({value: resultValue, type: "I"});
  break;  
case 121: // (0x79) lshl
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value.shl(value2.value & 0x3F);
  stack.push({value: resultValue, type: "J"});
  break;  
case 122: // (0x7a) ishr
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = (value1.value >> (value2.value & 0x3F));
  stack.push({value: resultValue, type: "I"});
  break;  
case 123: // (0x7b) lshr
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value.shr(value2.value & 0x3F);
  stack.push({value: resultValue, type: "J"});
  break;  
case 124: // (0x7c) iushr
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = (value1.value >>> (value2.value & 0x3F));
  stack.push({value: resultValue, type: "I"});
  break;  
case 125: // (0x7d) lushr
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value.ushr(value2.value & 0x3F);
  stack.push({value: resultValue, type: "J"});
  break;  
case 126: // (0x7e) iand
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = (value1.value & value2.value);
  stack.push({value: resultValue, type: "I"});
  break;  
case 127: // (0x7f) land
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value.and(value2.value);
  stack.push({value: resultValue, type: "J"});
  break;  
case 128: // (0x80) ior
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = (value1.value | value2.value);
  stack.push({value: resultValue, type: "I"});
  break;  
case 129: // (0x81) lor
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value.or(value2.value);
  stack.push({value: resultValue, type: "J"});
  break;  
case 130: // (0x82) ixor
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = (value1.value ^ value2.value);
  stack.push({value: resultValue, type: "I"});
  break;  
case 131: // (0x83) lxor
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value.xor(value2.value);
  stack.push({value: resultValue, type: "J"});
  break;  
case 132: // (0x84) iinc
  var index, const_;
  if (wideFound) {
    wideFound = false;
    index = (bytecode[cp] << 8) | bytecode[cp + 1];
    const_ = (bytecode[cp + 2] << 8) | bytecode[cp + 3];
    cp += 4;
    if (const_ >= 0x8000) { const_ -= 0x10000; }
  } else {
    index = bytecode[cp++];
    const_ = bytecode[op++];
    if (const_ >= 0x80) { const_ -= 0x100; }
  }
  locals[index].value = (locals[index].value + const_) | 0;
  break;
case 133: // (0x85) i2l
  var value = stack.pop();
  var sign = ((value.value >> 31) & 1) === 0 ? 0 : 0xFF;
  var resultValue = new LongValue([sign,sign,sign,sign, 
    (value.value >> 24) & 0xFF, (value.value >> 16) & 0xFF,
    (value.value >> 8) & 0xFF, value.value & 0xFF]);
  stack.push({value: resultValue, type: "J"});
  break;  
case 134: // (0x86) i2f
case 144: // (0x90) d2f
  var value = stack.pop();
  stack.push({value: value, type: "F"});
  break;  
case 135: // (0x87) i2d
case 141: // (0x8d) f2d
  var value = stack.pop();
  stack.push({value: value, type: "D"});
  break;  
case 136: // (0x88) l2i
  var value = stack.pop(), bytes = value.value.bytes;
  var resultValue = (bytes[4] << 24) | (bytes[5] << 16) | (bytes[6] << 8) | bytes[7];
  stack.push({value: resultValue, type: "I"});
  break; 
case 139: // (0x8b) f2i
case 142: // (0x8e) d2i
  var value = stack.pop();
  var resultValue = (value.value | 0);
  stack.push({value: resultValue, type: "I"});
  break;
case 137: // (0x89) l2f
case 138: // (0x8a) l2d
  var value = stack.pop(); 
  var resultValue = value.value.toNumeric();
  stack.push({value: resultValue, type: op === 137 ? "F" : "D" });
  break;
case 140: // (0x8c) f2l
case 143: // (0x8f) d2l
  var value = stack.pop();
  var resultValue = LongValue.fromNumeric(value.value);
  stack.push({value: resultValue, type: "J" });
  break;  
case 145: // (0x91) i2b
  var value = stack.pop();
  var resultValue = value.value & 0xFF;
  stack.push({value: resultValue, type: "B" });
  break;  
case 146: // (0x92) i2c
  var value = stack.pop();
  var resultValue = value.value & 0xFFFF;
  stack.push({value: resultValue, type: "C" });
  break;  
case 147: // (0x93) i2s
  var value = stack.pop();
  var resultValue = value.value & 0xFFFF;
  if ((resultValue & 0x8000) !== 0) { resultValue -= 0x10000; }
  stack.push({value: resultValue, type: "S" });
  break;  
case 148: // (0x94) lcmp
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = value1.value.cmp(value2.value);
  stack.push({value: resultValue, type: "I" });
  break;
case 149: // (0x95) fcmpl
case 150: // (0x96) fcmpg
case 151: // (0x97) dcmpl
case 152: // (0x98) dcmpg
  var value2 = stack.pop();
  var value1 = stack.pop();
  var resultValue = isNaN(value1.value) || isNaN(value2.value) ?
    ((op === 149 || op === 151) ? -1 : 1) :
    value1.value == value2.value ? 0 :
    value1.value < value2.value ? -1 : 1;
  stack.push({value: resultValue, type: "I" });
  break;
case 153: // (0x99) ifeq
case 154: // (0x9a) ifne
case 155: // (0x9b) iflt
case 156: // (0x9c) ifge
case 157: // (0x9d) ifgt
case 158: // (0x9e) ifle
  var value = stack.pop();
  var branch = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  if (
    (op === 153 && value.value == 0) ||
    (op === 154 && value.value != 0) ||
    (op === 155 && value.value < 0) ||
    (op === 156 && value.value <= 0) ||
    (op === 157 && value.value > 0) ||
    (op === 158 && value.value >= 0)) {
    if (branch >= 0x8000) {
      jumpToAddress = cp + branch - 0x10003;
    } else {
      jumpToAddress = cp + branch - 3;
    }
  }
  break;
case 159: // (0x9f) if_icmpeq
case 160: // (0xa0) if_icmpne
case 161: // (0xa1) if_icmplt
case 162: // (0xa2) if_icmpge
case 163: // (0xa3) if_icmpgt
case 164: // (0xa4) if_icmple
  var value2 = stack.pop();
  var value1 = stack.pop();
  var branch = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  if (
    (op === 159 && value1.value == value2.value) ||
    (op === 160 && value1.value != value2.value) ||
    (op === 161 && value1.value < value2.value) ||
    (op === 162 && value1.value <= value2.value) ||
    (op === 163 && value1.value > value2.value) ||
    (op === 164 && value1.value >= value2.value)) {
    if (branch >= 0x8000) {
      jumpToAddress = cp + branch - 0x10003;
    } else {
      jumpToAddress = cp + branch - 3;
    }
  }
  break;
case 165: // (0xa5) if_acmpeq
case 166: // (0xa6) if_acmpne
  var value2 = stack.pop();
  var value1 = stack.pop();
  var branch = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  if (
    (op === 165 && value1 === value2) ||
    (op === 166 && value1 !== value2)) {
    if (branch >= 0x8000) {
      jumpToAddress = cp + branch - 0x10003;
    } else {
      jumpToAddress = cp + branch - 3;
    }
  }
  break;
case 167: // (0xa7) goto
  var branch = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  if (branch >= 0x8000) {
    jumpToAddress = cp + branch - 0x10003;
  } else {
    jumpToAddress = cp + branch - 3;
  }
  break;
case 168: // (0xa8) jsr
  var branch = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  var returnAddress;
  if (branch >= 0x8000) {
    returnAddress = cp + branch - 0x10003;
  } else {
    returnAddress = cp + branch - 3;
  }
  stack.push({returnAddress: returnAddress});
  break;
case 169: // (0xa9) ret
  var index;
  if (wideFound) {
    wideFound = false;
    index = (bytecode[cp] << 8) | bytecode[cp + 1];
    cp += 2;
  } else {
    index = bytecode[cp++];
  }
  jumpToAddress = locals[index].returnAddress;
  break;
case 170: // (0xaa) tableswitch
  var padding = cp % 4, tableswitchAddress = cp - 1;
  cp += padding;
  var index = stack.pop();
  var defaultOffset = (bytecode[cp] << 24) | (bytecode[cp + 1] << 16) | (bytecode[cp + 2] << 8) | bytecode[cp + 3];
  var lowValue = (bytecode[cp + 4] << 24) | (bytecode[cp + 5] << 16) | (bytecode[cp + 6] << 8) | bytecode[cp + 7];
  var highValue = (bytecode[cp + 8] << 24) | (bytecode[cp + 9] << 16) | (bytecode[cp + 10] << 8) | bytecode[cp + 11];
  if (index.value < lowValue || index.value > highValue) {
    jumpToAddress = tableswitchAddress + defaultOffset;
  } else {
    var i = (index.value - lowValue) << 2 + cp + 12;
    var offset = (bytecode[i] << 24) | (bytecode[i + 1] << 16) | (bytecode[i + 2] << 8) | bytecode[i + 3];
    jumpToAddress = tableswitchAddress + offset;    
  }
  break;
case 171: // (0xab) lookupswitch
  var padding = cp % 4, lookupswitchAddress = cp - 1;
  cp += padding;
  var key = stack.pop();
  var defaultOffset = (bytecode[cp] << 24) | (bytecode[cp + 1] << 16) | (bytecode[cp + 2] << 8) | bytecode[cp + 3];
  var npairs = (bytecode[cp + 4] << 24) | (bytecode[cp + 5] << 16) | (bytecode[cp + 6] << 8) | bytecode[cp + 7];
  cp += 8;
  var offset = defaultOffset;
  for (var i = 0; i < npairs; ++i) {    
    var pairKey = (bytecode[cp] << 24) | (bytecode[cp + 1] << 16) | (bytecode[cp + 2] << 8) | bytecode[cp + 3];
    if (pairKey == key.value) {
      offset = (bytecode[cp + 4] << 24) | (bytecode[cp + 5] << 16) | (bytecode[cp + 6] << 8) | bytecode[cp + 7];
      break;
    }
    cp += 8;
  }
  jumpToAddress = tableswitchAddress + offset;
  break;
case 172: // (0xac) ireturn
case 173: // (0xad) lreturn
case 174: // (0xae) freturn
case 175: // (0xaf) dreturn
case 176: // (0xb0) areturn
case 177: // (0xb1) return
  state = { name: "return" };
  break;
case 178: // (0xb2) getstatic
  var index = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  state = { name: "getstatic", field: constant_pool[index] };
  break;
case 179: // (0xb3) putstatic
  var index = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  var value = stack.pop();
  state = { name: "putstatic", field: constant_pool[index], value: value };
  break;
case 180: // (0xb4) getfield
  var index = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  var objectref = stack.pop();
  validateNonNull(objectref);
  state = { name: "getfield", object: objectref, field: constant_pool[index] };
  break;
case 181: // (0xb5) putfield
  var index = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  var value = stack.pop();
  var objectref = stack.pop();
  validateNonNull(objectref);
  state = { name: "putfield", object: objectref, field: constant_pool[index], value: value };
  break;
case 182: // (0xb6) invokevirtual
  var index = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  var args = [], args_count = getArgumentsCountFromDescriptor(constant_pool[index].name_and_type.descriptor);
  for (var i = 0; i < args_count; ++i) {
    args.unshift(stack.pop());
  }
  var objectref = stack.pop();
  validateNonNull(objectref);
  state = { name: "invokevirtual", object: objectref, method: constant_pool[index], args: args };
  break;
case 183: // (0xb7) invokespecial
  var index = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  var args = [], args_count = getArgumentsCountFromDescriptor(constant_pool[index].name_and_type.descriptor);
  for (var i = 0; i < args_count; ++i) {
    args.unshift(stack.pop());
  }
  var objectref = stack.pop();
  validateNonNull(objectref);
  state = { name: "invokespecial", object: objectref, method: constant_pool[index], args: args };
  break;
case 184: // (0xb8) invokestatic
  var index = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  var args = [], args_count = getArgumentsCountFromDescriptor(constant_pool[index].name_and_type.descriptor);
  for (var i = 0; i < args_count; ++i) {
    args.unshift(stack.pop());
  }
  state = { name: "invokestatic", method: constant_pool[index], args: args };
  break;
case 185: // (0xb9) invokeinterface
  var index = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 4;
  var args = [], args_count = getArgumentsCountFromDescriptor(constant_pool[index].name_and_type.descriptor);
  for (var i = 0; i < args_count; ++i) {
    args.unshift(stack.pop());
  }
  var objectref = stack.pop();
  validateNonNull(objectref);
  state = { name: "invokeinterface", object: objectref, method: constant_pool[index], args: args };
  break;
case 187: // (0xbb) new
  var index = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  state = { name: "new", class_: constant_pool[index] };
  break;
case 188: // (0xbc) newarray
  var atype = bytecode[cp++];
  var count = stack.pop();
  stack.push(createArray(count, atype));
  break;
case 189: // (0xbd) anewarray
  var index = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  var count = stack.pop();
  stack.push(createAArray([count], constant_pool[index]));
  break;
case 190: // (0xbe) arraylength
  var arrayref = stack.pop();
  validateArrayref(arrayref);
  stack.push({value: arrayref.length, type: "I" });
  break;
case 191: // (0xbf) athrow
  var objectref = stack.pop();
  validateNotNull(objectref);
  state = { name: "throw", object: objectref };
  break;
case 192: // (0xc0) checkcast
  var index = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  var objectref = stack.pop();
  checkCast(objectref, constant_pool[index]);
  stack.push(objectref);
  break;
case 193: // (0xc1) instanceof
  var index = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  var objectref = stack.pop();
  var resultValue = instanceOf(objectref, constant_pool[index]);
  stack.push({value: resultValue, type: "I"});
  break;
case 194: // (0xc2) monitorenter
  var objectref = stack.pop();
  validateNotNull(objectref);
  monitorEnter(objectref);
  break;
case 195: // (0xc3) monitorexit
  var objectref = stack.pop();
  validateNotNull(objectref);
  monitorExit(objectref);
  break;
case 196: // (0xc4) wide
  wideFound = true;
  break;
case 197: // (0xc5) multianewarray
  var index = (bytecode[cp] << 8) | bytecode[cp + 1];
  var dimensions = bytecode[cp + 3];
  cp += 3;
  var counts = [];
  for (var i = 0; i < dimensions; ++i) {
    counts.unshift(stack.pop());
  }
  stack.push(createAArray(counts, constant_pool[index]));
  break;
case 198: // (0xc6) ifnull
case 199: // (0xc7) ifnonnull
  var value = stack.pop();
  var branch = (bytecode[cp] << 8) | bytecode[cp + 1];
  cp += 2;
  if ( (op === 198) === (value == null) ) {
    if (branch >= 0x8000) {
      jumpToAddress = cp + branch - 0x10003;
    } else {
      jumpToAddress = cp + branch - 3;
    }
  }
  break;
case 200: // (0xc8) goto_w
  var branch = (bytecode[cp] << 24) | (bytecode[cp + 1] << 16) | (bytecode[cp + 2] << 8) | bytecode[cp + 3];
  jumpToAddress = cp - 3 + branch;
  break;
case 201: // (0xc9) jsr_w
  var branch = (bytecode[cp] << 24) | (bytecode[cp + 1] << 16) | (bytecode[cp + 2] << 8) | bytecode[cp + 3];
  var returnAddress = cp - 3 + branch;
  stack.push({returnAddress: returnAddress});
  break;

case 186: // (0xba) xxxunusedxxx1
case 202: // (0xca) breakpoint
case 254: // (0xfe) impdep1
case 255: // (0xff) impdep2
default:
  state = {name:"error", message: "invalid operation " + op + " @" + cp };
  break;
    }

if (jumpToAddress !== null) {
  cp = jumpToAddress;
}

    return state === null;
  };
}

function createFactory(classFile) {
  function create() {
    var obj = {};
    for (var i = 0, l = classFile.fields.length; i < l; ++i) {
      obj[classFile.fields[i].name] = 0;
    }
    for (var i = 0, l = classFile.methods.length; i < l; ++i) {
      (function(method) {
        obj[method.name] = function() {
          var vm = new JVMjs(method, classFile.constant_pool, obj, arguments);
          return vm.execute();
        };
      })(classFile.methods[i]);
    }
    return obj;
  }  
  return { create: create };
}

