
function LongValue(bytes) {
  this.bytes = bytes;
}
LongValue.prototype = {
  sign: function() {    
    if (this.bytes[0] >= 0x80) {
      return -1;
    }
    var i = 0;
    while(i < 8 && this.bytes[i] === 0) {
      ++i;
    }
    return i < 8 ? 1 : 0;
  },
  add: function(other) {
    var c = 0, result = [];
    for (var i = 7; i >= 0; i--) {
      var n = c + this.bytes[i] + other.bytes[i];
      c = 0;
      while (n >= 0x100) {
        n -= 0x100;
        c++;
      }
      result[i] = n;
    }
    return new LongValue(result);
  },
  not: function() {
    var result = [];
    for (var i = 0; i < 8; i++) {
      result.push(0x100 - this.bytes[i]);
    }
    return new LongValue(result);
  },
  neg: function() {
    return this.not().add(LongValue.One);
  },
  sub: function(other) {
    return this.add(other.neg());
  },
  cmp: function(other) {
    return this.sub(other).sign();
  },
  mul: function(other) {
    var result = [], c = 0;
    for (var i = 7; i >= 0; --i) {      
      for (var j = 0; j <= i; --j) {
        c += this.bytes[j] * other.bytes[i - j];
      }
      var n = Math.floor(c / 256);
      result.push(c - n * 256);
      c = n;
    }
    return new LongValue(result);
  },
  div: function(other) {
    var signOfThis = this.sign(), signOfOther = other.sign();
    if (signOfOther === 0) { return; }
    if (signOfThis === 0) { return LongValue.Zero; }
    var dividend = signOfThis < 0 ? this.neg() : this;
    var divisor = signOfOther < 0 ? other.neg() : other;

    if (dividend.cmp(divisor) < 0) { return LongValue.Zero; }

    var multiplier = LongValue.One, iterations = [[divisor,multiplier]];
    while(divisor.bytes[0] < 0x40 && dividend.cmd(divisor.add(divisor)) >= 0) {
      multiplier = multiplier.add(multiplier); // x2
      divisor = divisor.add(divisor);
      iterations.push([divisor, multiplier]);
    }
    var result = LongValue.Zero;
    while (iterations.length > 0) {
      var i = iterations.pop();
      if(dividend.cmd(i[0]) >= 0) {
        result = result.add(i[1]);
        dividend = dividend.sub(i[0]);
      }      
    }
    return signOfThis === signOfOther ? result : result.neg();
  },
  rem: function(other) {
    return this.sub(this.div(other).mul(other));
  },
  shl: function(sh) {
    throw "not implemented";
  },
  shr: function(sh) {
    throw "not implemented";
  },
  ushr: function(sh) {
    throw "not implemented";
  },
  and: function(other) {
    var result = [];
    for (var i = 0; i < 8; ++i) {
      result[i] = this.bytes[i] & other.bytes[i];
    }
    return new LongValue(result);
  },
  or: function(other) {
    var result = [];
    for (var i = 0; i < 8; ++i) {
      result[i] = this.bytes[i] | other.bytes[i];
    }
    return new LongValue(result);
  },
  xor: function(other) {
    var result = [];
    for (var i = 0; i < 8; ++i) {
      result[i] = this.bytes[i] ^ other.bytes[i];
    }
    return new LongValue(result);
  },
  toNumeric: function() {
    var sign = 1, bytes = this.bytes;
    if (this.sign() < 0) {
      sign = -1;
      bytes = this.neg().bytes;
    }
    var resultValue = 0;
    for (var i = 0; i < bytes.length; ++i) {
      resultValue = resultValue * 256 + bytes[i];    
    }
    return resultValue * sign;
  }
};
LongValue.fromNumeric = function(value) {
  var sign = 1, bytes = [];
  if (value < 0) {
    sign = -1;
    value = -value;
  }
  var n = Math.floor(value);
  for (var i = 7; i >= 0; i--) {
    var m = Math.floor(n / 256);
    bytes[i] = 0 | (n - m * 256);
    n = m;
  }
  var resultValue = new LongValue(bytes);
  if (sign < 0) {
    resultValue = resultValue.neg();
  }
  return resultValue;
};
LongValue.Zero = new LongValue([0,0,0,0,0,0,0,0]);
LongValue.One = new LongValue([0,0,0,0,0,0,0,1]);
LongValue.Two = new LongValue([0,0,0,0,0,0,0,2]);
LongValue.MinusOne = new LongValue([255,255,255,255,255,255,255,255]);


