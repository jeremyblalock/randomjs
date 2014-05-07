(function(window) {

  /* Define constants, to improve compression */
  var UNDEFINED = 'undefined',
      NUMBER = typeof 0,
      MAX_LENGTH = 4096;

  var bank = [],
      prevTime = +new Date(),
      prevNibble = 1;

  /* Push a nibble (4 bits) NIBBLE into the bank.
   * Multiplies by the previous nibble, to decrease guessability.
   * This is because a malicious script would then have to have started at the
   * exact same time, and be measuring Date()'s at exactly the same
   * microsecond time, which would be very difficult. */
  function push(nibbles) {
    var nibble, i;
    if (typeof nibbles === NUMBER) {
      nibble = nibbles & 15;
      bank.push(convolve(nibble));
    } else {
      for (i = 0; i < nibbles.length; i += 1) {
        nibble = nibbles[i] & 15;
        bank.push(convolve(nibble));
      }
    }
  }

  function convolve(nibble) {
    var result = (nibble * prevNibble) & 15;
    prevNibble = nibble & 15;
    return result;
  }

  /* Pop number SIZE bits in length, and return. */
  function pop(size) {
    var nibbles = Math.ceil(size / 4),
        bit = 0,
        buff = [],
        bitBuff = [],
        itm,
        i, j, result = 0;
    for (i = 0; i < nibbles; i += 1) {
      itm = bank.shift();
      if (typeof itm === UNDEFINED) {
        push(buff);
        return false;
      }
      buff.push(itm);
      for (j = 0; j < 4; j += 1) {
        bitBuff.push((itm & Math.pow(2, j)) && 1);
      }
    }
    for (i = 0; i < size; i += 1) {
      result += Math.pow(2, i) * bitBuff.shift();
    }
    return result;
  }

  function recordEvent(e) {
    var timestamp;
    if (bank.length > MAX_LENGTH) {
      return;
    }
    timestamp = +new Date();
    push(timestamp);
  }

  function maxLength(l) {
    if (l >= MAX_LENGTH) {
      MAX_LENGTH = l;
    }
    return MAX_LENGTH;
  }

  function available() {
    return bank.length * 4;
  }

  window.addEventListener('mousemove', recordEvent);
  window.addEventListener('mousedown', recordEvent);
  window.addEventListener('mouseup', recordEvent);

  window.addEventListener('keydown', recordEvent);
  window.addEventListener('keyup', recordEvent);

  window.Random = {
    get: pop,
    available: available,
    maxLength: maxLength
  };

})(window);
