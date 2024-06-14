// deno-lint-ignore-file no-explicit-any no-unused-vars
import { SmartBuffer, SmartBufferOptions } from "./mod.ts";
import { BufferEncoding, checkEncoding, isFiniteInteger } from "./utils.ts";
import { Buffer } from "node:buffer";
import { beforeAll, describe, it } from "jsr:@std/testing/bdd";
import {
  assertAlmostEquals,
  assertEquals,
  assertNotStrictEquals,
  assertStrictEquals,
  assertThrows,
} from "jsr:@std/assert";

describe("Constructing a SmartBuffer", () => {
  describe("Constructing with an existing Buffer", () => {
    const buff = Buffer.from([
      0xaa,
      0xbb,
      0xcc,
      0xdd,
      0xff,
      0x00,
      0x11,
      0x22,
      0x33,
      0x44,
      0x55,
      0x66,
      0x77,
      0x88,
      0x99,
    ]);
    const reader = SmartBuffer.fromBuffer(buff);

    it("should have the exact same internal Buffer when constructed with a Buffer", () => {
      assertStrictEquals(reader.internalBuffer, buff);
    });

    it("should return a buffer with the same content", () => {
      assertEquals(reader.toBuffer(), buff);
    });
  });

  describe("Constructing with an existing Buffer and setting the encoding", () => {
    const buff = Buffer.from([
      0xaa,
      0xbb,
      0xcc,
      0xdd,
      0xff,
      0x00,
      0x11,
      0x22,
      0x33,
      0x44,
      0x55,
      0x66,
      0x77,
      0x88,
      0x99,
    ]);
    const reader = SmartBuffer.fromBuffer(buff, "ascii");

    it("should have the exact same internal Buffer", () => {
      assertStrictEquals(reader.internalBuffer, buff);
    });

    it("should have the same encoding that was set", () => {
      assertStrictEquals(reader.encoding, "ascii");
    });
  });

  describe("Constructing with a specified size", () => {
    const size = 128;
    const reader = SmartBuffer.fromSize(size);

    it("should have an internal Buffer with the same length as the size defined in the constructor", () => {
      assertStrictEquals(reader.internalBuffer.length, size);
    });
  });

  describe("Constructing with a specified encoding", () => {
    const encoding: BufferEncoding = "utf8";

    it("should have an internal encoding with the encoding given to the constructor (1st argument)", () => {
      const reader = SmartBuffer.fromOptions({
        encoding,
      });
      assertStrictEquals(reader.encoding, encoding);
    });

    it("should have an internal encoding with the encoding given to the constructor (2nd argument)", () => {
      const reader = SmartBuffer.fromSize(1024, encoding);
      assertStrictEquals(reader.encoding, encoding);
    });
  });

  describe("Constructing with SmartBufferOptions", () => {
    const validOptions1: SmartBufferOptions = {
      size: 1024,
      encoding: "ascii",
    };

    const validOptions2: SmartBufferOptions = {
      buff: Buffer.alloc(1024),
    };

    const validOptions3: SmartBufferOptions = {
      encoding: "utf8",
    };

    const invalidOptions1: any = {
      encoding: "invalid",
    };

    const invalidOptions2: any = {
      size: -1,
    };

    const invalidOptions3: any = {
      buff: "notabuffer",
    };

    it("should create a SmartBuffer with size 1024 and ascii encoding", () => {
      const sbuff = SmartBuffer.fromOptions(validOptions1);
      assertStrictEquals(sbuff.encoding, validOptions1.encoding);
      assertStrictEquals(sbuff.internalBuffer.length, validOptions1.size);
    });

    it("should create a SmartBuffer with the provided buffer as the initial value", () => {
      const sbuff = SmartBuffer.fromOptions(validOptions2);
      assertEquals(sbuff.internalBuffer, validOptions2.buff);
    });

    it("should create a SmartBuffer with the provided ascii encoding, and create a default buffer size", () => {
      const sbuff = SmartBuffer.fromOptions(validOptions3);
      assertStrictEquals(sbuff.encoding, validOptions3.encoding);
      assertStrictEquals(sbuff.internalBuffer.length, 4096);
    });

    it("should throw an error when given an options object with an invalid encoding", () => {
      assertThrows(() => {
        const sbuff = SmartBuffer.fromOptions(invalidOptions1);
      });
    });

    it("should throw an error when given an options object with an invalid size", () => {
      assertThrows(() => {
        const sbuff = SmartBuffer.fromOptions(invalidOptions2);
      });
    });

    it("should throw an error when given an options object with an invalid buffer", () => {
      assertThrows(() => {
        const sbuff = SmartBuffer.fromOptions(invalidOptions3);
      });
    });
  });

  describe("Constructing with invalid parameters", () => {
    it("should throw an exception when given an object that is not a valid SmartBufferOptions object", () => {
      assertThrows(() => {
        const invalidOptions: Record<string, unknown> = {};
        const reader = SmartBuffer.fromOptions(invalidOptions);
      });
    });

    it("should throw an exception when given an invalid number size", () => {
      assertThrows(() => {
        const reader = SmartBuffer.fromOptions({
          size: -100,
        });
      }, Error);
    });

    it("should throw an exception when give a invalid encoding", () => {
      assertThrows(() => {
        const invalidEncoding: any = "invalid";
        const reader = SmartBuffer.fromOptions({
          encoding: invalidEncoding,
        });
      }, Error);

      assertThrows(() => {
        const invalidEncoding: any = "invalid";
        const reader = SmartBuffer.fromSize(1024, invalidEncoding);
      }, Error);
    });

    it("should throw and exception when given an object that is not a SmartBufferOptions", () => {
      assertThrows(() => {
        // @ts-ignore: It existed in the original tests. SO..
        const reader = SmartBuffer.fromOptions(null);
      }, Error);
    });
  });

  describe("Constructing with factory methods", () => {
    const originalBuffer = Buffer.alloc(10);

    const sbuff1 = SmartBuffer.fromBuffer(originalBuffer);

    it("Should create a SmartBuffer with a provided internal Buffer as the initial value", () => {
      assertEquals(sbuff1.internalBuffer, originalBuffer);
    });

    const sbuff2 = SmartBuffer.fromSize(1024);

    it("Should create a SmartBuffer with a set provided initial Buffer size", () => {
      assertStrictEquals(sbuff2.internalBuffer.length, 1024);
    });

    const options: any = {
      size: 1024,
      encoding: "ascii",
    };

    const sbuff3 = SmartBuffer.fromOptions(options);

    it("Should create a SmartBuffer instance with a given SmartBufferOptions object", () => {
      assertStrictEquals(sbuff3.encoding, options.encoding);
      assertStrictEquals(sbuff3.internalBuffer.length, options.size);
    });
  });
});

describe("Reading/Writing To/From SmartBuffer", () => {
  /**
   * Technically, if one of these works, they all should. But they're all here anyways.
   */
  describe("Numeric Values", () => {
    const reader = new SmartBuffer();
    reader.writeInt8(0x44);
    reader.writeUInt8(0xff);
    reader.writeInt16BE(0x6699);
    reader.writeInt16LE(0x6699);
    reader.writeUInt16BE(0xffdd);
    reader.writeUInt16LE(0xffdd);
    reader.writeInt32BE(0x77889900);
    reader.writeInt32LE(0x77889900);
    reader.writeUInt32BE(0xffddccbb);
    reader.writeUInt32LE(0xffddccbb);
    reader.writeFloatBE(1.234);
    reader.writeFloatLE(1.234);
    reader.writeDoubleBE(1.23456789);
    reader.writeDoubleLE(1.23456789);
    reader.writeUInt8(0xc8, 0);
    reader.writeUInt16LE(0xc8, 4);
    reader.insertUInt16LE(0x6699, 6);
    reader.writeUInt16BE(0x6699);
    reader.insertUInt16BE(0x6699, reader.length - 1);

    const iReader = new SmartBuffer();

    iReader.insertInt8(0x44, 0);
    iReader.insertUInt8(0x44, 0);
    iReader.insertInt16BE(0x6699, 0);
    iReader.insertInt16LE(0x6699, 0);
    iReader.insertUInt16BE(0x6699, 0);
    iReader.insertUInt16LE(0x6699, 0);
    iReader.insertInt32BE(0x6699, 0);
    iReader.insertInt32LE(0x6699, 0);
    iReader.insertUInt32BE(0x6699, 0);
    iReader.insertUInt32LE(0x6699, 0);
    iReader.insertFloatBE(0x6699, 0);
    iReader.insertFloatLE(0x6699, 0);
    iReader.insertDoubleBE(0x6699, 0);
    iReader.insertDoubleLE(0x6699, 0);
    iReader.writeStringNT("h", 2);
    iReader.insertBuffer(Buffer.from("he"), 2);
    iReader.insertBufferNT(Buffer.from("he"), 2);
    iReader.readInt8(0);

    it("should equal the correct values that were written above", () => {
      assertStrictEquals(reader.readUInt8(), 0xc8);
      assertStrictEquals(reader.readUInt8(), 0xff);
      assertStrictEquals(reader.readInt16BE(), 0x6699);
      assertStrictEquals(reader.readInt16LE(), 0xc8);
      assertStrictEquals(reader.readInt16LE(), 0x6699);
      assertStrictEquals(reader.readUInt16BE(), 0xffdd);
      assertStrictEquals(reader.readUInt16LE(), 0xffdd);
      assertStrictEquals(reader.readInt32BE(), 0x77889900);
      assertStrictEquals(reader.readInt32LE(), 0x77889900);
      assertStrictEquals(reader.readUInt32BE(), 0xffddccbb);
      assertStrictEquals(reader.readUInt32LE(), 0xffddccbb);
      assertAlmostEquals(reader.readFloatBE(), 1.234, 0.001);
      assertAlmostEquals(reader.readFloatLE(), 1.234, 0.001);
      assertAlmostEquals(reader.readDoubleBE(), 1.23456789, 0.001);
      assertAlmostEquals(reader.readDoubleLE(), 1.23456789, 0.001);
      assertEquals(reader.readUInt8(0), 0xc8);
    });

    it("should throw an exception if attempting to read numeric values from a buffer with not enough data left", () => {
      assertThrows(() => {
        reader.readUInt32BE();
      });
    });

    it("should throw an exception if attempting to write numeric values to a negative offset.", () => {
      assertThrows(() => {
        reader.writeUInt16BE(20, -5);
      });
    });
  });

  describe("BigInt values", () => {
    describe("When BigInt is available and so are Buffer methods", () => {
      beforeAll(function () {
        if (
          typeof BigInt === "undefined" ||
          typeof Buffer.prototype.writeBigInt64BE === "undefined"
        ) { // @ts-ignore: n
          this.skip();
        }
      });

      it("Reading written-to buffer should read back the results of the insert", () => {
        const wBuffer = new SmartBuffer();
        wBuffer.writeBigInt64LE(BigInt(Number.MAX_SAFE_INTEGER) * BigInt(2));
        wBuffer.writeBigInt64BE(BigInt(Number.MAX_SAFE_INTEGER) * BigInt(3));
        wBuffer.writeBigUInt64LE(BigInt(Number.MAX_SAFE_INTEGER) * BigInt(4));
        wBuffer.writeBigUInt64BE(BigInt(Number.MAX_SAFE_INTEGER) * BigInt(5));

        assertEquals(
          wBuffer.readBigInt64LE(),
          BigInt(Number.MAX_SAFE_INTEGER) * BigInt(2),
        );
        assertEquals(
          wBuffer.readBigInt64BE(),
          BigInt(Number.MAX_SAFE_INTEGER) * BigInt(3),
        );
        assertEquals(
          wBuffer.readBigUInt64LE(),
          BigInt(Number.MAX_SAFE_INTEGER) * BigInt(4),
        );
        assertEquals(
          wBuffer.readBigUInt64BE(),
          BigInt(Number.MAX_SAFE_INTEGER) * BigInt(5),
        );
      });

      it("Reading inserted-into buffer should read back the results of the insert", () => {
        const iBuffer = new SmartBuffer();
        iBuffer.insertBigInt64LE(
          BigInt(Number.MAX_SAFE_INTEGER) * BigInt(6),
          0,
        );
        iBuffer.insertBigInt64BE(
          BigInt(Number.MAX_SAFE_INTEGER) * BigInt(7),
          0,
        );
        iBuffer.insertBigUInt64LE(
          BigInt(Number.MAX_SAFE_INTEGER) * BigInt(8),
          0,
        );
        iBuffer.insertBigUInt64BE(
          BigInt(Number.MAX_SAFE_INTEGER) * BigInt(9),
          0,
        );

        assertEquals(
          iBuffer.readBigInt64BE(),
          BigInt(Number.MAX_SAFE_INTEGER) * BigInt(9),
        );
        assertEquals(
          iBuffer.readBigInt64LE(),
          BigInt(Number.MAX_SAFE_INTEGER) * BigInt(8),
        );
        assertEquals(
          iBuffer.readBigUInt64BE(),
          BigInt(Number.MAX_SAFE_INTEGER) * BigInt(7),
        );
        assertEquals(
          iBuffer.readBigUInt64LE(),
          BigInt(Number.MAX_SAFE_INTEGER) * BigInt(6),
        );
      });
    });
  });

  describe("Basic String Values", () => {
    const reader = new SmartBuffer();
    reader.writeStringNT("hello");
    reader.writeString("world");
    reader.writeStringNT("✎✏✎✏✎✏");
    reader.insertStringNT("first", 0);
    reader.writeString("hello", "ascii");
    reader.writeString("hello");

    it("should equal the correct strings that were written prior", () => {
      assertStrictEquals(reader.readStringNT(), "first");
      assertStrictEquals(reader.readStringNT(), "hello");
      assertStrictEquals(reader.readString(5), "world");
      assertStrictEquals(reader.readStringNT(), "✎✏✎✏✎✏");
      assertStrictEquals(reader.readString(5, "ascii"), "hello");
    });

    it("should throw an exception if passing in an invalid string length to read (infinite)", () => {
      assertThrows(() => {
        reader.readString(NaN);
      });
    });

    it("should throw an exception if passing in an invalid string length to read (negative)", () => {
      assertThrows(() => {
        reader.readString(-5);
      });
    });

    it("should throw an exception if passing in an invalid string offset to insert (non number)", () => {
      assertThrows(() => {
        const invalidNumber: any = "sdfdf";
        reader.insertString("hello", invalidNumber);
      });
    });
  });

  describe("Mixed Encoding Strings", () => {
    const reader = SmartBuffer.fromOptions({
      encoding: "ascii",
    });
    reader.writeStringNT("some ascii text");
    reader.writeStringNT("ѕσмє υтƒ8 тєχт", "utf8");
    reader.insertStringNT("first", 0, "ascii");

    it("should equal the correct strings that were written above", () => {
      assertStrictEquals(reader.readStringNT(), "first");
      assertStrictEquals(reader.readStringNT(), "some ascii text");
      assertStrictEquals(reader.readStringNT("utf8"), "ѕσмє υтƒ8 тєχт");
    });

    it("should throw an error when an invalid encoding is provided", () => {
      assertThrows(() => {
        // tslint:disable-next-line
        const invalidBufferType: any = "invalid";
        reader.writeString("hello", invalidBufferType);
      });
    });

    it("should throw an error when an invalid encoding is provided along with a valid offset", () => {
      assertThrows(() => {
        const invalidBufferType: any = "invalid";
        reader.writeString("hellothere", 2, invalidBufferType);
      });
    });
  });

  describe("Null/non-null terminating strings", () => {
    const reader = new SmartBuffer();
    reader.writeString("hello\0test\0bleh");

    it("should equal hello", () => {
      assertStrictEquals(reader.readStringNT(), "hello");
    });

    it("should equal: test", () => {
      assertStrictEquals(reader.readString(4), "test");
    });

    it("should have a length of zero", () => {
      assertStrictEquals(reader.readStringNT().length, 0);
    });

    it("should return an empty string", () => {
      assertStrictEquals(reader.readString(0), "");
    });

    it("should equal: bleh", () => {
      assertStrictEquals(reader.readStringNT(), "bleh");
    });
  });

  describe("Reading string without specifying length", () => {
    const str = "hello123";
    const writer = new SmartBuffer();
    writer.writeString(str);

    const reader = SmartBuffer.fromBuffer(writer.toBuffer());

    assertStrictEquals(reader.readString(), str);
  });

  describe("Write string as specific position", () => {
    const str = "hello123";
    const writer = new SmartBuffer();
    writer.writeString(str, 10);

    const reader = SmartBuffer.fromBuffer(writer.toBuffer());

    reader.readOffset = 10;
    it("Should read the correct string from the original position it was written to.", () => {
      assertStrictEquals(reader.readString(), str);
    });
  });

  describe("Buffer Values", () => {
    describe("Writing buffer to position 0", () => {
      const buff = new SmartBuffer();
      const frontBuff = Buffer.from([1, 2, 3, 4, 5, 6]);
      buff.writeStringNT("hello");
      buff.writeBuffer(frontBuff, 0);

      it("should write the buffer to the front of the smart buffer instance", () => {
        const readBuff = buff.readBuffer(frontBuff.length);
        assertEquals(readBuff, frontBuff);
      });
    });

    describe("Writing null terminated buffer to position 0", () => {
      const buff = new SmartBuffer();
      const frontBuff = Buffer.from([1, 2, 3, 4, 5, 6]);
      buff.writeStringNT("hello");
      buff.writeBufferNT(frontBuff, 0);

      it("should write the buffer to the front of the smart buffer instance", () => {
        const readBuff = buff.readBufferNT();
        assertEquals(readBuff, frontBuff);
      });
    });

    describe("Explicit lengths", () => {
      const buff = Buffer.from([0x01, 0x02, 0x04, 0x08, 0x16, 0x32, 0x64]);
      const reader = new SmartBuffer();
      reader.writeBuffer(buff);

      it("should equal the buffer that was written above.", () => {
        assertEquals(reader.readBuffer(7), buff);
      });
    });

    describe("Implicit lengths", () => {
      const buff = Buffer.from([0x01, 0x02, 0x04, 0x08, 0x16, 0x32, 0x64]);
      const reader = new SmartBuffer();
      reader.writeBuffer(buff);

      it("should equal the buffer that was written above.", () => {
        assertEquals(reader.readBuffer(), buff);
      });
    });

    describe("Null Terminated Buffer Reading", () => {
      const buff = new SmartBuffer();
      buff.writeBuffer(
        Buffer.from([0x01, 0x02, 0x03, 0x04, 0x00, 0x01, 0x02, 0x03]),
      );

      const read1 = buff.readBufferNT();
      const read2 = buff.readBufferNT();

      it("Should return a length of 4 for the four bytes before the first null in the buffer.", () => {
        assertEquals(read1.length, 4);
      });

      it("Should return a length of 3 for the three bytes after the first null in the buffer after reading to end.", () => {
        assertEquals(read2.length, 3);
      });
    });

    describe("Null Terminated Buffer Writing", () => {
      const buff = new SmartBuffer();
      buff.writeBufferNT(Buffer.from([0x01, 0x02, 0x03, 0x04]));

      const read1 = buff.readBufferNT();

      it("Should read the correct null terminated buffer data.", () => {
        assertEquals(read1.length, 4);
      });
    });

    describe("Reading buffer from invalid offset", () => {
      const buff = new SmartBuffer();
      buff.writeBuffer(Buffer.from([1, 2, 3, 4, 5, 6]));

      it("Should throw an exception if attempting to read a Buffer from an invalid offset", () => {
        assertThrows(() => {
          const invalidOffset: any = "sfsdf";
          buff.readBuffer(invalidOffset);
        });
      });
    });

    describe("Inserting values into specific positions", () => {
      const reader = new SmartBuffer();

      reader.writeUInt16LE(0x0060);
      reader.writeStringNT("something");
      reader.writeUInt32LE(8485934);
      reader.writeUInt16LE(6699);
      reader.writeStringNT("else");
      reader.insertUInt16LE(reader.length - 2, 2);

      it("should equal the size of the remaining data in the buffer", () => {
        reader.readUInt16LE();
        const size = reader.readUInt16LE();
        assertStrictEquals(reader.remaining(), size);
      });
    });

    describe("Adding more data to the buffer than the internal buffer currently allows.", () => {
      it("Should automatically adjust internal buffer size when needed", () => {
        const writer = new SmartBuffer();
        const largeBuff = Buffer.alloc(10000);
        writer.writeBuffer(largeBuff);
        assertStrictEquals(writer.length, largeBuff.length);
      });
    });
  });
});

describe("Skipping around data", () => {
  const writer = new SmartBuffer();
  writer.writeStringNT("hello");
  writer.writeUInt16LE(6699);
  writer.writeStringNT("world!");

  it("Should equal the UInt16 that was written above", () => {
    const reader = SmartBuffer.fromBuffer(writer.toBuffer());
    reader.readOffset += 6;
    assertStrictEquals(reader.readUInt16LE(), 6699);
    reader.readOffset = 0;
    assertStrictEquals(reader.readStringNT(), "hello");
    reader.readOffset -= 6;
    assertStrictEquals(reader.readStringNT(), "hello");
  });

  it("Should throw an error when attempting to skip more bytes than actually exist.", () => {
    const reader = SmartBuffer.fromBuffer(writer.toBuffer());

    assertThrows(() => {
      reader.readOffset = 10000;
    });
  });
});

describe("Setting write and read offsets", () => {
  const writer = SmartBuffer.fromSize(100);
  writer.writeString("hellotheremynameisjosh");

  it("should set the write offset to 10", () => {
    writer.writeOffset = 10;
    assertStrictEquals(writer.writeOffset, 10);
  });

  it("should set the read offset to 10", () => {
    writer.readOffset = 10;
    assertStrictEquals(writer.readOffset, 10);
  });

  it("should throw an error when given an offset that is out of bounds", () => {
    assertThrows(() => {
      writer.readOffset = -1;
    });
  });

  it("should throw an error when given an offset that is out of bounds", () => {
    assertThrows(() => {
      writer.writeOffset = 1000;
    });
  });
});

describe("Setting encoding", () => {
  const writer = SmartBuffer.fromSize(100);
  it("should have utf8 encoding by default", () => {
    assertStrictEquals(writer.encoding, "utf8");
  });

  it("should have ascii encoding after being set", () => {
    writer.encoding = "ascii";
    assertStrictEquals(writer.encoding, "ascii");
  });
});

describe("Automatic internal buffer resizing", () => {
  let writer = new SmartBuffer();

  it("Should not throw an error when adding data that is larger than current buffer size (internal resize algo fails)", () => {
    const str = "String larger than one byte";
    writer = SmartBuffer.fromSize(1);
    writer.writeString(str);

    assertStrictEquals(writer.internalBuffer.length, str.length);
  });

  it("Should not throw an error when adding data that is larger than current buffer size (internal resize algo succeeds)", () => {
    writer = SmartBuffer.fromSize(100);
    const buff = Buffer.alloc(105);

    writer.writeBuffer(buff);

    // Test internal array growth algo.
    assertStrictEquals(writer.internalBuffer.length, 100 * 3 / 2 + 1);
  });
});

describe("Clearing the buffer", () => {
  const writer = new SmartBuffer();
  writer.writeString("somedata");

  it("Should contain some data.", () => {
    assertNotStrictEquals(writer.length, 0);
  });

  it("Should contain zero data after being cleared.", () => {
    writer.clear();
    assertStrictEquals(writer.length, 0);
  });
});

describe("Displaying the buffer as a string", () => {
  const buff = Buffer.from([1, 2, 3, 4]);
  const sbuff = SmartBuffer.fromBuffer(buff);

  const str = buff.toString();
  const str64 = buff.toString("binary");

  it("Should return a valid string representing the internal buffer", () => {
    assertStrictEquals(str, sbuff.toString());
  });

  it("Should return a valid base64 string representing the internal buffer", () => {
    assertStrictEquals(str64, sbuff.toString("binary"));
  });

  it("Should throw an error if an invalid encoding is provided", () => {
    assertThrows(() => {
      const invalidencoding: any = "invalid";
      const strError = sbuff.toString(invalidencoding);
    });
  });
});

describe("Destroying the buffer", () => {
  const writer = new SmartBuffer();
  writer.writeString("hello123");

  writer.destroy();

  it("Should have a length of zero when buffer is destroyed", () => {
    assertStrictEquals(0, writer.length);
  });
});

describe("ensureWritable()", () => {
  const sbuff: any = SmartBuffer.fromSize(10);

  it("should increase the internal buffer size to accomodate given size.", () => {
    sbuff._ensureWriteable(100);

    assertStrictEquals(sbuff.internalBuffer.length >= 100, true);
  });
});

describe("isSmartBufferOptions()", () => {
  it("should return true when encoding is defined", () => {
    assertStrictEquals(
      SmartBuffer.isSmartBufferOptions({
        encoding: "utf8",
      }),
      true,
    );
  });

  it("should return true when size is defined", () => {
    assertStrictEquals(
      SmartBuffer.isSmartBufferOptions({
        size: 1024,
      }),
      true,
    );
  });

  it("should return true when buff is defined", () => {
    assertStrictEquals(
      SmartBuffer.isSmartBufferOptions({
        buff: Buffer.alloc(4096),
      }),
      true,
    );
  });
});

describe("utils", () => {
  describe("isFiniteInteger", () => {
    it("should return true for a number that is finite and an integer", () => {
      assertEquals(isFiniteInteger(10), true);
    });

    it("should return false for a number that is infinite", () => {
      assertEquals(isFiniteInteger(NaN), false);
    });

    it("should return false for a number that is not an integer", () => {
      assertEquals(isFiniteInteger(10.1), false);
    });
  });

  describe("checkEncoding", () => {
    it("should throw an exception if a given string is not a valid BufferEncoding", () => {
      assertThrows(() => {
        const invalidEncoding: any = "sdfdf";
        checkEncoding(invalidEncoding);
      });
    });
  });
});
