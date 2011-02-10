function parseJavaClass(classContent) {
  var readPosition = 0;
  var reader = {
    readU1: function() { return classContent[readPosition++]; },
    readBlock: function(size) { 
      var data = classContent.slice(readPosition, readPosition + size);  /* or subset() */
      readPosition += size;
      return data;
    },
    readU4: function() {
      var n = (classContent[readPosition] << 24) | 
        (classContent[readPosition + 1] << 16) | 
        (classContent[readPosition + 2] << 8) | 
        (classContent[readPosition + 3]);
      readPosition += 4;
      
      return n < 0 ? n + 0x100000000 : n;
    },
    readU2: function() {
      var n = (classContent[readPosition] << 8) | 
        (classContent[readPosition + 1]);
      readPosition += 2;
      return n;
    }
  };

  function read_cp_info() {
    var info = { tag: reader.readU1() };
    switch (info.tag) {
    case 7:
      info.type = "CONSTANT_Class";
      var name_index = reader.readU2();
      info.update = function(cp) {
        this.name = cp[name_index].value;
      };
      break;
    case 9:
      info.type = "CONSTANT_Fieldref";
      var class_index = reader.readU2();
      var name_and_type_index = reader.readU2();
      info.update = function(cp) {
        this.class_ = cp[class_index];
        this.name_and_type = cp[name_and_type_index];
      };
      break;
    case 10:
      info.type = "CONSTANT_Methodref";
      var class_index = reader.readU2();
      var name_and_type_index = reader.readU2();
      info.update = function(cp) {
        this.class_ = cp[class_index];
        this.name_and_type = cp[name_and_type_index];
      };
      break;
    case 11:
      info.type = "CONSTANT_InterfaceMethodref";
      var class_index = reader.readU2();
      var name_and_type_index = reader.readU2();
      info.update = function(cp) {
        this.class_ = cp[class_index];
        this.name_and_type = cp[name_and_type_index];
      };
      break;
    case 8:
      info.type = "CONSTANT_String";
      var string_index = reader.readU2();
      info.update = function(cp) {
        this.value = cp[string_index].value;
      };
      break;
    case 3:
      info.type = "CONSTANT_Integer";
      info.value_type = "I";
      info.value = reader.readU4() | 0; // add sign
      break;
    case 4:
      info.type = "CONSTANT_Float";
      info.value_type = "F";
      var bits = reader.readU4();
      var s = ((bits >>> 31) & 1 === 0) ? 1 : -1;
    	var e = ((bits >>> 23) & 0xff);
    	var m = (e === 0) ?
    			(bits & 0x7fffff) << 1 :
    			(bits & 0x7fffff) | 0x800000;
      info.value = s * m * Math.pow(2, e - 150);
      break;
    case 5:
      info.type = "CONSTANT_Long";
      info.value_type = "J";
      var bytes = reader.readBlock(8);
      info.value = new LongValue(bytes);
      info.is8ByteContant = true;
      break;
    case 6:
      info.type = "CONSTANT_Double";
      info.value_type = "D";
      var high_bits = reader.readU4();
      var low_bits = reader.readU4();
      var s = ((high_bits >>> 31) & 1 === 0) ? 1 : -1;
    	var e = (high_bits >>> 20) & 0x7ff;
    	var high_m = (e === 0) ?
    		(high_bits & 0xfffff) << 1 :
    		(high_bits & 0xfffff) | 0x100000;
      var low_m = (e === 0) ? low_bits * 2 : low_bits;
      info.value = s * (high_m * 0x100000000 + low_m) * Math.pow(2, e - 1075);
      info.is8ByteContant = true;
      break;
    case 12:
      info.type = "CONSTANT_NameAndType";
      var name_index = reader.readU2();
      var descriptor_index = reader.readU2();
      info.update = function(cp) {
        this.name = cp[name_index].value;
        this.descriptor = cp[descriptor_index].value;
      };
      break;
    case 1:
      info.type = "CONSTANT_Utf8";
      var bytesLength = reader.readU2();
      var bytes = reader.readBlock(bytesLength);
      var string = "";
      for (var j = 0; j < bytesLength; ++j) {
        var charCode = bytes[j];
        if ((charCode & 0x80) !== 0) { // UTF8
          var moreBytes = 0, mask = 0x40;
          while ((charCode & mask) !== 0) {
            moreBytes++;
            mask >>= 1;
          }
          charCode &= (mask - 1);
          for (; moreBytes > 0; --moreBytes) {
            var nextByte = bytes[++j]; // check for 10xxxxxx? or EOS
            charCode = (charCode << 6) | (0x3F & nextByte);
          }
        }
        string += String.fromCharCode(charCode);
      }
      info.value = string;
      break;
    default:
      throw ("Invalid constant " + info.tag + " @" + readPosition + " " +i);
    }
    return info;
  }

  function read_access_flags() {
    var access_flags = reader.readU2();
    var flags = {};
    if ((access_flags & 0x0001) !== 0) { flags.ACC_PUBLIC = true; }
    if ((access_flags & 0x0002) !== 0) { flags.ACC_PRIVATE = true; }
    if ((access_flags & 0x0004) !== 0) { flags.ACC_PROTECTED = true; }
    if ((access_flags & 0x0008) !== 0) { flags.ACC_STATIC = true; }
    if ((access_flags & 0x0010) !== 0) { flags.ACC_FINAL = true; }
    if ((access_flags & 0x0020) !== 0) { flags.ACC_SUPER = true; }
    if ((access_flags & 0x0020) !== 0) { flags.ACC_SYNCHRONIZED = true; }
    if ((access_flags & 0x0040) !== 0) { flags.ACC_VOLATILE = true; }
    if ((access_flags & 0x0080) !== 0) { flags.ACC_TRANSIENT = true; }
    if ((access_flags & 0x0100) !== 0) { flags.ACC_NATIVE = true; }
    if ((access_flags & 0x0200) !== 0) { flags.ACC_INTERFACE = true; }
    if ((access_flags & 0x0400) !== 0) { flags.ACC_ABSTRACT = true; }
    if ((access_flags & 0x0800) !== 0) { flags.ACC_STRICT = true; }
    return flags;
  }

  function find_attribute(name) {
    for (var i = 0, l = this.attributes.length; i < l; ++i) {
      if (this.attributes[i].attribute_name === name) {
        return this.attributes[i];
      }
    }
    return null;
  }

  function read_attribute_info(constant_pool) {
    var info = {};
    var attribute_name_index = reader.readU2();
    info.attribute_name = constant_pool[attribute_name_index].value;
    var attribute_length = reader.readU4();
    switch (info.attribute_name) {
    case "ConstantValue":
      var constantvalue_index = reader.readU2();
      info.constantvalue = constant_pool[constantvalue_index];
      break;
    case "Code":
      info.max_stack = reader.readU2();
      info.max_locals = reader.readU2();
      var code_length = reader.readU4();
      info.code = reader.readBlock(code_length);
      var exception_table_length = reader.readU2();
      var exception_table = [];
      for (var j = 0; j < exception_table_length; j++) {
        var exception = {};
        exception.start_pc = reader.readU2();
        exception.end_pc = reader.readU2();
        exception.handler_pc = reader.readU2();
        var catch_type = reader.readU2();
        if (catch_type > 0) {
          exception.catch_type = constant_pool[catch_type];
        }
        exception_table.push(exception);
      }
      info.exception_table = exception_table;
      var attributes_count = reader.readU2();
      var attributes = [];
      for (var j = 0; j < attributes_count; j++) {
        attributes.push(read_attribute_info(constant_pool));
      }
      info.find_attribute = find_attribute;
      info.attributes = attributes;
      break;
    case "Exceptions":
      var number_of_exceptions = reader.readU2();
      var exception_table = [];
      for (var j = 0; j < number_of_exceptions; j++) {
        var exception_index = reader.readU2();
        exception_table.push(constant_pool[exception_index]);
      }
      info.exception_table = exception_table;
      break;
    case "InnerClasses":
      var number_of_classes = reader.readU2();
      var classes = [];
      for (var j = 0; j < number_of_classes; j++) {
        var class_ = {};
        var inner_class_info_index = reader.readU2();
        if (inner_class_info_index > 0) {
          class_.inner_class_info = constant_pool[inner_class_info_index];
        }
        var outer_class_info_index = reader.readU2();
        if (outer_class_info_index > 0) {
          class_.outer_class_info = constant_pool[outer_class_info_index];
        }
        var inner_name_index = reader.readU2();
        if (inner_name_index > 0) {
          class_.inner_name = constant_pool[inner_name_index];
        }
        class_.inner_class_access_flags = read_access_flags();
        classes.push(class_);
      }
      info.classes = classes;
      break;
    case "SourceFile":
      var sourcefile_index = reader.readU2();
      info.sourcefile = constant_pool[sourcefile_index].value;
      break;
    case "LineNumberTable":
      var line_number_table_length = reader.readU2();
      var line_number_table = [];
      for (var j = 0; j < line_number_table_length; j++) {
        var line_number = {};
        line_number.start_pc = reader.readU2();
        line_number.line_number = reader.readU2();
        line_number_table.push(line_number);
      }
      info.line_number_table = line_number_table;
      break;
    case "LocalVariableTable":
      var local_variable_table_length = reader.readU2();
      var local_variable_table = [];
      for (var j = 0; j < local_variable_table_length; j++) {
        var local_variable = {};
        local_variable.start_pc = reader.readU2();
        local_variable.use_length = reader.readU2();
        var name_index = reader.readU2();
        local_variable.name = constant_pool[name_index].value;
        var descriptor_index = reader.readU2();
        local_variable.descriptor = constant_pool[descriptor_index].value;
        local_variable.index = reader.readU2();

        local_variable_table.push(local_variable);
        if (local_variable.descriptor === "D" || local_variable.descriptor === "J") {
          j++;
          local_variable_table.push(local_variable);
        }
      }
      info.local_variable_table = local_variable_table;
      break;
    case "Synthetic":
    case "Depricated":
    default:
      if (attribute_length > 0) {
        info.info = reader.readBlock(attribute_length);
      }
      break;
    }
    return info;
  }

  function read_field_info(constant_pool) {
    var info = {};
    info.access_flags = read_access_flags();
    var name_index = reader.readU2();
    info.name = constant_pool[name_index].value;
    var descriptor_index = reader.readU2();
    info.descriptor = constant_pool[descriptor_index].value;
    var attributes_count = reader.readU2(), attributes = [];
    for (var j = 0; j < attributes_count; j++) {
      attributes.push(read_attribute_info(constant_pool));
    }
    info.find_attribute = find_attribute;
    info.attributes = attributes;
    return info;
  }

  function read_method_info(constant_pool) {
    var info = {};
    info.access_flags = read_access_flags();
    var name_index = reader.readU2();
    info.name = constant_pool[name_index].value;
    var descriptor_index = reader.readU2();
    info.descriptor = constant_pool[descriptor_index].value;
    var attributes_count = reader.readU2(), attributes = [];
    for (var j = 0; j < attributes_count; j++) {
      attributes.push(read_attribute_info(constant_pool));
    }
    info.find_attribute = find_attribute;
    info.attributes = attributes;
    return info;
  }

  var magic = reader.readU4();
  if (magic !== 0xCAFEBABE) {
    throw "Invalid class file signature";
  }

  var classFile = {};
  var minor_version = reader.readU2();
  var major_version = reader.readU2();
  classFile.version = { major: major_version, minor: minor_version };

  var constant_pool_count = reader.readU2(), constant_pool = [null];
  for (var i = 1; i < constant_pool_count; ++i) {
    var constant = read_cp_info();
    constant_pool.push(constant);
    if (constant.is8ByteContant) {
      i++;
      constant_pool.push(constant);
    }
  }
  for (var i = 1; i < constant_pool_count; ++i) {
    if ("update" in constant_pool[i]) {
      constant_pool[i].update(constant_pool);
      delete constant_pool[i].update;
    }
  }
  classFile.constant_pool = constant_pool;

  classFile.access_flags = read_access_flags();

  var this_class = reader.readU2();
  classFile.this_class = constant_pool[this_class];

  var super_class = reader.readU2();
  if (super_class > 0) {
    classFile.super_class = constant_pool[super_class];
  }

  var interfaces_count = reader.readU2(), interfaces = [];
  for (var i = 0; i < interfaces_count; ++i) {
    interfaces.push(constant_pool[reader.readU2()]);
  }
  classFile.interfaces = interfaces;

  var fields_count = reader.readU2(), fields = [];
  for (var i = 0; i < fields_count; ++i) {
    fields.push(read_field_info(constant_pool));
  }
  classFile.fields = fields;

  var methods_count = reader.readU2(), methods = [];
  for (var i = 0; i < methods_count; ++i) {
    methods.push(read_method_info(constant_pool));
  }
  classFile.methods = methods;

  var attributes_count = reader.readU2(), attributes = [];
  for (var i = 0; i < attributes_count; ++i) {
    attributes.push(read_attribute_info(constant_pool));
  }
  classFile.find_attribute = find_attribute;
  classFile.attributes = attributes;

  return classFile;
}

function loadFileAsync(classUrl, callback) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if(request.readyState == 4) {
      if (request.status == 200 || request.status == 0) {
        var data = [];
        var s = request.responseText;
        for (var j = 0, l = s.length; j < l; ++j) {
          data.push(s.charCodeAt(j) & 0xFF);
        }
        callback(data);
      } else {
        callback(null);
      }
    }
  };
  request.open('GET', classUrl, true);
  request.overrideMimeType('text/plain; charset=x-user-defined');
  request.send();
}

function loadFile(classUrl) {
  var request = new XMLHttpRequest();
  request.open('GET', classUrl, false);
  request.overrideMimeType('text/plain; charset=x-user-defined');
  request.send();

  if (request.status != 200 && request.status != 0) {
    throw "File " + classUrl + " is not available: " + request.statusText;
  }

  var data = [];
  var s = request.responseText;
  for (var j = 0, l = s.length; j < l; ++j) {
    data.push(s.charCodeAt(j) & 0xFF);
  }
  return data;
}

function loadJarFile(url) {
  var data = loadFile(url);
  return readJarContent(data);
}
