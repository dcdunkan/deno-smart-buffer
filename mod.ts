import { Buffer } from "node:buffer";
import {
  bigIntAndBufferInt64Check,
  BufferEncoding,
  checkEncoding,
  checkLengthValue,
  checkOffsetValue,
  checkTargetOffset,
  ERRORS,
  isFiniteInteger,
} from "./utils.ts";

/**
 * Object interface for constructing new SmartBuffer instances.
 */
export interface SmartBufferOptions {
  // Buffer Encoding to use for reading/writing strings if one is not provided.
  encoding?: BufferEncoding;
  // The initial size of the internal Buffer.
  size?: number;
  // If a Buffer is provided, this Buffer's value will be used as the internal Buffer.
  buff?: Buffer;
}

// The default Buffer size if one is not provided.
const DEFAULT_SMARTBUFFER_SIZE = 4096;

// The default string encoding to use for reading/writing strings.
const DEFAULT_SMARTBUFFER_ENCODING: BufferEncoding = "utf8";

export class SmartBuffer {
  public length = 0;

  private _encoding: BufferEncoding = DEFAULT_SMARTBUFFER_ENCODING;
  private _buff: Buffer;
  private _writeOffset = 0;
  private _readOffset = 0;

  /**
   * Creates a new SmartBuffer instance.
   *
   * @param options The SmartBufferOptions to apply to this instance.
   */
  constructor(options?: SmartBufferOptions) {
    if (SmartBuffer.isSmartBufferOptions(options)) {
      // Checks for encoding
      if (options.encoding) {
        checkEncoding(options.encoding);
        this._encoding = options.encoding;
      }

      // Checks for initial size length
      if (options.size) {
        if (isFiniteInteger(options.size) && options.size > 0) {
          this._buff = Buffer.allocUnsafe(options.size);
        } else {
          throw new Error(ERRORS.INVALID_SMARTBUFFER_SIZE);
        }
        // Check for initial Buffer
      } else if (options.buff) {
        if (Buffer.isBuffer(options.buff)) {
          this._buff = options.buff;
          this.length = options.buff.length;
        } else {
          throw new Error(ERRORS.INVALID_SMARTBUFFER_BUFFER);
        }
      } else {
        this._buff = Buffer.allocUnsafe(DEFAULT_SMARTBUFFER_SIZE);
      }
    } else {
      // If something was passed but it's not a SmartBufferOptions object
      if (typeof options !== "undefined") {
        throw new Error(ERRORS.INVALID_SMARTBUFFER_OBJECT);
      }

      // Otherwise default to sane options
      this._buff = Buffer.allocUnsafe(DEFAULT_SMARTBUFFER_SIZE);
    }
  }

  /**
   * Creates a new SmartBuffer instance with the provided internal Buffer size and optional encoding.
   *
   * @param size The size of the internal Buffer.
   * @param encoding The BufferEncoding to use for strings.
   */
  public static fromSize(size: number, encoding?: BufferEncoding): SmartBuffer {
    return new this({
      size: size,
      encoding: encoding,
    });
  }

  /**
   * Creates a new SmartBuffer instance with the provided Buffer and optional encoding.
   *
   * @param buff The Buffer to use as the internal Buffer value.
   * @param encoding The BufferEncoding to use for strings.
   */
  public static fromBuffer(
    buff: Buffer,
    encoding?: BufferEncoding,
  ): SmartBuffer {
    return new this({
      buff: buff,
      encoding: encoding,
    });
  }

  /**
   * Creates a new SmartBuffer instance with the provided SmartBufferOptions options.
   *
   * @param options The options to use when creating the SmartBuffer instance.
   */
  public static fromOptions(options: SmartBufferOptions): SmartBuffer {
    return new this(options);
  }

  /**
   * Type checking function that determines if an object is a SmartBufferOptions object.
   */
  static isSmartBufferOptions(
    options?: SmartBufferOptions,
  ): options is SmartBufferOptions {
    const castOptions: SmartBufferOptions = options!;

    return (
      castOptions &&
      (castOptions.encoding !== undefined || castOptions.size !== undefined ||
        castOptions.buff !== undefined)
    );
  }

  // Signed integers

  /**
   * Reads an Int8 value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readInt8(offset?: number): number {
    return this._readNumberValue(Buffer.prototype.readInt8, 1, offset);
  }

  /**
   * Reads an Int16BE value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readInt16BE(offset?: number): number {
    return this._readNumberValue(Buffer.prototype.readInt16BE, 2, offset);
  }

  /**
   * Reads an Int16LE value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readInt16LE(offset?: number): number {
    return this._readNumberValue(Buffer.prototype.readInt16LE, 2, offset);
  }

  /**
   * Reads an Int32BE value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readInt32BE(offset?: number): number {
    return this._readNumberValue(Buffer.prototype.readInt32BE, 4, offset);
  }

  /**
   * Reads an Int32LE value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readInt32LE(offset?: number): number {
    return this._readNumberValue(Buffer.prototype.readInt32LE, 4, offset);
  }

  /**
   * Reads a BigInt64BE value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readBigInt64BE(offset?: number): bigint {
    bigIntAndBufferInt64Check("readBigInt64BE");
    return this._readNumberValue(Buffer.prototype.readBigInt64BE, 8, offset);
  }

  /**
   * Reads a BigInt64LE value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readBigInt64LE(offset?: number): bigint {
    bigIntAndBufferInt64Check("readBigInt64LE");
    return this._readNumberValue(Buffer.prototype.readBigInt64LE, 8, offset);
  }

  /**
   * Writes an Int8 value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeInt8(value: number, offset?: number): SmartBuffer {
    this._writeNumberValue(Buffer.prototype.writeInt8, 1, value, offset);
    return this;
  }

  /**
   * Inserts an Int8 value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertInt8(value: number, offset: number): SmartBuffer {
    return this._insertNumberValue(
      Buffer.prototype.writeInt8,
      1,
      value,
      offset,
    );
  }

  /**
   * Writes an Int16BE value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeInt16BE(value: number, offset?: number): SmartBuffer {
    return this._writeNumberValue(
      Buffer.prototype.writeInt16BE,
      2,
      value,
      offset,
    );
  }

  /**
   * Inserts an Int16BE value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertInt16BE(value: number, offset: number): SmartBuffer {
    return this._insertNumberValue(
      Buffer.prototype.writeInt16BE,
      2,
      value,
      offset,
    );
  }

  /**
   * Writes an Int16LE value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeInt16LE(value: number, offset?: number): SmartBuffer {
    return this._writeNumberValue(
      Buffer.prototype.writeInt16LE,
      2,
      value,
      offset,
    );
  }

  /**
   * Inserts an Int16LE value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertInt16LE(value: number, offset: number): SmartBuffer {
    return this._insertNumberValue(
      Buffer.prototype.writeInt16LE,
      2,
      value,
      offset,
    );
  }

  /**
   * Writes an Int32BE value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeInt32BE(value: number, offset?: number): SmartBuffer {
    return this._writeNumberValue(
      Buffer.prototype.writeInt32BE,
      4,
      value,
      offset,
    );
  }

  /**
   * Inserts an Int32BE value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertInt32BE(value: number, offset: number): SmartBuffer {
    return this._insertNumberValue(
      Buffer.prototype.writeInt32BE,
      4,
      value,
      offset,
    );
  }

  /**
   * Writes an Int32LE value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeInt32LE(value: number, offset?: number): SmartBuffer {
    return this._writeNumberValue(
      Buffer.prototype.writeInt32LE,
      4,
      value,
      offset,
    );
  }

  /**
   * Inserts an Int32LE value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertInt32LE(value: number, offset: number): SmartBuffer {
    return this._insertNumberValue(
      Buffer.prototype.writeInt32LE,
      4,
      value,
      offset,
    );
  }

  /**
   * Writes a BigInt64BE value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeBigInt64BE(value: bigint, offset?: number): SmartBuffer {
    bigIntAndBufferInt64Check("writeBigInt64BE");
    return this._writeNumberValue(
      Buffer.prototype.writeBigInt64BE,
      8,
      value,
      offset,
    );
  }

  /**
   * Inserts a BigInt64BE value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertBigInt64BE(value: bigint, offset: number): SmartBuffer {
    bigIntAndBufferInt64Check("writeBigInt64BE");
    return this._insertNumberValue(
      Buffer.prototype.writeBigInt64BE,
      8,
      value,
      offset,
    );
  }

  /**
   * Writes a BigInt64LE value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeBigInt64LE(value: bigint, offset?: number): SmartBuffer {
    bigIntAndBufferInt64Check("writeBigInt64LE");
    return this._writeNumberValue(
      Buffer.prototype.writeBigInt64LE,
      8,
      value,
      offset,
    );
  }

  /**
   * Inserts a Int64LE value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertBigInt64LE(value: bigint, offset: number): SmartBuffer {
    bigIntAndBufferInt64Check("writeBigInt64LE");
    return this._insertNumberValue(
      Buffer.prototype.writeBigInt64LE,
      8,
      value,
      offset,
    );
  }

  // Unsigned Integers

  /**
   * Reads an UInt8 value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readUInt8(offset?: number): number {
    return this._readNumberValue(Buffer.prototype.readUInt8, 1, offset);
  }

  /**
   * Reads an UInt16BE value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readUInt16BE(offset?: number): number {
    return this._readNumberValue(Buffer.prototype.readUInt16BE, 2, offset);
  }

  /**
   * Reads an UInt16LE value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readUInt16LE(offset?: number): number {
    return this._readNumberValue(Buffer.prototype.readUInt16LE, 2, offset);
  }

  /**
   * Reads an UInt32BE value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readUInt32BE(offset?: number): number {
    return this._readNumberValue(Buffer.prototype.readUInt32BE, 4, offset);
  }

  /**
   * Reads an UInt32LE value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readUInt32LE(offset?: number): number {
    return this._readNumberValue(Buffer.prototype.readUInt32LE, 4, offset);
  }

  /**
   * Reads a BigUInt64BE value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readBigUInt64BE(offset?: number): bigint {
    bigIntAndBufferInt64Check("readBigUInt64BE");
    return this._readNumberValue(Buffer.prototype.readBigUInt64BE, 8, offset);
  }

  /**
   * Reads a BigUInt64LE value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readBigUInt64LE(offset?: number): bigint {
    bigIntAndBufferInt64Check("readBigUInt64LE");
    return this._readNumberValue(Buffer.prototype.readBigUInt64LE, 8, offset);
  }

  /**
   * Writes an UInt8 value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeUInt8(value: number, offset?: number): SmartBuffer {
    return this._writeNumberValue(
      Buffer.prototype.writeUInt8,
      1,
      value,
      offset,
    );
  }

  /**
   * Inserts an UInt8 value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertUInt8(value: number, offset: number): SmartBuffer {
    return this._insertNumberValue(
      Buffer.prototype.writeUInt8,
      1,
      value,
      offset,
    );
  }

  /**
   * Writes an UInt16BE value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeUInt16BE(value: number, offset?: number): SmartBuffer {
    return this._writeNumberValue(
      Buffer.prototype.writeUInt16BE,
      2,
      value,
      offset,
    );
  }

  /**
   * Inserts an UInt16BE value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertUInt16BE(value: number, offset: number): SmartBuffer {
    return this._insertNumberValue(
      Buffer.prototype.writeUInt16BE,
      2,
      value,
      offset,
    );
  }

  /**
   * Writes an UInt16LE value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeUInt16LE(value: number, offset?: number): SmartBuffer {
    return this._writeNumberValue(
      Buffer.prototype.writeUInt16LE,
      2,
      value,
      offset,
    );
  }

  /**
   * Inserts an UInt16LE value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertUInt16LE(value: number, offset: number): SmartBuffer {
    return this._insertNumberValue(
      Buffer.prototype.writeUInt16LE,
      2,
      value,
      offset,
    );
  }

  /**
   * Writes an UInt32BE value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeUInt32BE(value: number, offset?: number): SmartBuffer {
    return this._writeNumberValue(
      Buffer.prototype.writeUInt32BE,
      4,
      value,
      offset,
    );
  }

  /**
   * Inserts an UInt32BE value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertUInt32BE(value: number, offset: number): SmartBuffer {
    return this._insertNumberValue(
      Buffer.prototype.writeUInt32BE,
      4,
      value,
      offset,
    );
  }

  /**
   * Writes an UInt32LE value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeUInt32LE(value: number, offset?: number): SmartBuffer {
    return this._writeNumberValue(
      Buffer.prototype.writeUInt32LE,
      4,
      value,
      offset,
    );
  }

  /**
   * Inserts an UInt32LE value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertUInt32LE(value: number, offset: number): SmartBuffer {
    return this._insertNumberValue(
      Buffer.prototype.writeUInt32LE,
      4,
      value,
      offset,
    );
  }

  /**
   * Writes a BigUInt64BE value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeBigUInt64BE(value: bigint, offset?: number): SmartBuffer {
    bigIntAndBufferInt64Check("writeBigUInt64BE");
    return this._writeNumberValue(
      Buffer.prototype.writeBigUInt64BE,
      8,
      value,
      offset,
    );
  }

  /**
   * Inserts a BigUInt64BE value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertBigUInt64BE(value: bigint, offset: number): SmartBuffer {
    bigIntAndBufferInt64Check("writeBigUInt64BE");
    return this._insertNumberValue(
      Buffer.prototype.writeBigUInt64BE,
      8,
      value,
      offset,
    );
  }

  /**
   * Writes a BigUInt64LE value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeBigUInt64LE(value: bigint, offset?: number): SmartBuffer {
    bigIntAndBufferInt64Check("writeBigUInt64LE");
    return this._writeNumberValue(
      Buffer.prototype.writeBigUInt64LE,
      8,
      value,
      offset,
    );
  }

  /**
   * Inserts a BigUInt64LE value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertBigUInt64LE(value: bigint, offset: number): SmartBuffer {
    bigIntAndBufferInt64Check("writeBigUInt64LE");
    return this._insertNumberValue(
      Buffer.prototype.writeBigUInt64LE,
      8,
      value,
      offset,
    );
  }

  // Floating Point

  /**
   * Reads an FloatBE value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readFloatBE(offset?: number): number {
    return this._readNumberValue(Buffer.prototype.readFloatBE, 4, offset);
  }

  /**
   * Reads an FloatLE value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readFloatLE(offset?: number): number {
    return this._readNumberValue(Buffer.prototype.readFloatLE, 4, offset);
  }

  /**
   * Writes a FloatBE value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeFloatBE(value: number, offset?: number): SmartBuffer {
    return this._writeNumberValue(
      Buffer.prototype.writeFloatBE,
      4,
      value,
      offset,
    );
  }

  /**
   * Inserts a FloatBE value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertFloatBE(value: number, offset: number): SmartBuffer {
    return this._insertNumberValue(
      Buffer.prototype.writeFloatBE,
      4,
      value,
      offset,
    );
  }

  /**
   * Writes a FloatLE value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeFloatLE(value: number, offset?: number): SmartBuffer {
    return this._writeNumberValue(
      Buffer.prototype.writeFloatLE,
      4,
      value,
      offset,
    );
  }

  /**
   * Inserts a FloatLE value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertFloatLE(value: number, offset: number): SmartBuffer {
    return this._insertNumberValue(
      Buffer.prototype.writeFloatLE,
      4,
      value,
      offset,
    );
  }

  // Double Floating Point

  /**
   * Reads an DoublEBE value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readDoubleBE(offset?: number): number {
    return this._readNumberValue(Buffer.prototype.readDoubleBE, 8, offset);
  }

  /**
   * Reads an DoubleLE value from the current read position or an optionally provided offset.
   *
   * @param offset The offset to read data from (optional)
   */
  readDoubleLE(offset?: number): number {
    return this._readNumberValue(Buffer.prototype.readDoubleLE, 8, offset);
  }

  /**
   * Writes a DoubleBE value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeDoubleBE(value: number, offset?: number): SmartBuffer {
    return this._writeNumberValue(
      Buffer.prototype.writeDoubleBE,
      8,
      value,
      offset,
    );
  }

  /**
   * Inserts a DoubleBE value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertDoubleBE(value: number, offset: number): SmartBuffer {
    return this._insertNumberValue(
      Buffer.prototype.writeDoubleBE,
      8,
      value,
      offset,
    );
  }

  /**
   * Writes a DoubleLE value to the current write position (or at optional offset).
   *
   * @param value The value to write.
   * @param offset The offset to write the value at.
   */
  writeDoubleLE(value: number, offset?: number): SmartBuffer {
    return this._writeNumberValue(
      Buffer.prototype.writeDoubleLE,
      8,
      value,
      offset,
    );
  }

  /**
   * Inserts a DoubleLE value at the given offset value.
   *
   * @param value The value to insert.
   * @param offset The offset to insert the value at.
   */
  insertDoubleLE(value: number, offset: number): SmartBuffer {
    return this._insertNumberValue(
      Buffer.prototype.writeDoubleLE,
      8,
      value,
      offset,
    );
  }

  // Strings

  /**
   * Reads a String from the current read position.
   *
   * @param arg1 The number of bytes to read as a String, or the BufferEncoding to use for
   *             the string (Defaults to instance level encoding).
   * @param encoding The BufferEncoding to use for the string (Defaults to instance level encoding).
   */
  readString(
    arg1?: number | BufferEncoding,
    encoding?: BufferEncoding,
  ): string {
    let lengthVal;

    // Length provided
    if (typeof arg1 === "number") {
      checkLengthValue(arg1);
      lengthVal = Math.min(arg1, this.length - this._readOffset);
    } else {
      encoding = arg1;
      lengthVal = this.length - this._readOffset;
    }

    // Check encoding
    if (typeof encoding !== "undefined") {
      checkEncoding(encoding);
    }

    const value = this._buff.slice(
      this._readOffset,
      this._readOffset + lengthVal,
    ).toString(encoding || this._encoding);

    this._readOffset += lengthVal;
    return value;
  }

  /**
   * Inserts a String
   *
   * @param value The String value to insert.
   * @param offset The offset to insert the string at.
   * @param encoding The BufferEncoding to use for writing strings (defaults to instance encoding).
   */
  insertString(
    value: string,
    offset: number,
    encoding?: BufferEncoding,
  ): SmartBuffer {
    checkOffsetValue(offset);

    return this._handleString(value, true, offset, encoding);
  }

  /**
   * Writes a String
   *
   * @param value The String value to write.
   * @param arg2 The offset to write the string at, or the BufferEncoding to use.
   * @param encoding The BufferEncoding to use for writing strings (defaults to instance encoding).
   */
  writeString(
    value: string,
    arg2?: number | BufferEncoding,
    encoding?: BufferEncoding,
  ): SmartBuffer {
    return this._handleString(value, false, arg2, encoding);
  }

  /**
   * Reads a null-terminated String from the current read position.
   *
   * @param encoding The BufferEncoding to use for the string (Defaults to instance level encoding).
   */
  readStringNT(encoding?: BufferEncoding): string {
    if (typeof encoding !== "undefined") {
      checkEncoding(encoding);
    }

    // Set null character position to the end SmartBuffer instance.
    let nullPos = this.length;

    // Find next null character (if one is not found, default from above is used)
    for (let i = this._readOffset; i < this.length; i++) {
      if (this._buff[i] === 0x00) {
        nullPos = i;
        break;
      }
    }

    // Read string value
    const value = this._buff.slice(this._readOffset, nullPos);

    // Increment internal Buffer read offset
    this._readOffset = nullPos + 1;

    return value.toString(encoding || this._encoding);
  }

  /**
   * Inserts a null-terminated String.
   *
   * @param value The String value to write.
   * @param offset The offset to write the string to, or the BufferEncoding to use.
   * @param encoding The BufferEncoding to use for writing strings (defaults to instance encoding).
   */
  insertStringNT(
    value: string,
    offset: number,
    encoding?: BufferEncoding,
  ): SmartBuffer {
    checkOffsetValue(offset);

    // Write Values
    this.insertString(value, offset, encoding);
    this.insertUInt8(0x00, offset + value.length);
    return this;
  }

  /**
   * Writes a null-terminated String.
   *
   * @param value The String value to write.
   * @param arg2 The offset to write the string to, or the BufferEncoding to use.
   * @param encoding The BufferEncoding to use for writing strings (defaults to instance encoding).
   */
  writeStringNT(
    value: string,
    arg2?: number | BufferEncoding,
    encoding?: BufferEncoding,
  ): SmartBuffer {
    // Write Values
    this.writeString(value, arg2, encoding);
    this.writeUInt8(
      0x00,
      typeof arg2 === "number" ? arg2 + value.length : this.writeOffset,
    );
    return this;
  }

  // Buffers

  /**
   * Reads a Buffer from the internal read position.
   *
   * @param length The length of data to read as a Buffer.
   */
  readBuffer(length?: number): Buffer {
    if (typeof length !== "undefined") {
      checkLengthValue(length);
    }

    const lengthVal = typeof length === "number" ? length : this.length;
    const endPoint = Math.min(this.length, this._readOffset + lengthVal);

    // Read buffer value
    const value = this._buff.slice(this._readOffset, endPoint);

    // Increment internal Buffer read offset
    this._readOffset = endPoint;
    return value;
  }

  /**
   * Writes a Buffer to the current write position.
   *
   * @param value The Buffer to write.
   * @param offset The offset to write the Buffer to.
   */
  insertBuffer(value: Buffer, offset: number): SmartBuffer {
    checkOffsetValue(offset);

    return this._handleBuffer(value, true, offset);
  }

  /**
   * Writes a Buffer to the current write position.
   *
   * @param value The Buffer to write.
   * @param offset The offset to write the Buffer to.
   */
  writeBuffer(value: Buffer, offset?: number): SmartBuffer {
    return this._handleBuffer(value, false, offset);
  }

  /**
   * Reads a null-terminated Buffer from the current read poisiton.
   */
  readBufferNT(): Buffer {
    // Set null character position to the end SmartBuffer instance.
    let nullPos = this.length;

    // Find next null character (if one is not found, default from above is used)
    for (let i = this._readOffset; i < this.length; i++) {
      if (this._buff[i] === 0x00) {
        nullPos = i;
        break;
      }
    }

    // Read value
    const value = this._buff.slice(this._readOffset, nullPos);

    // Increment internal Buffer read offset
    this._readOffset = nullPos + 1;
    return value;
  }

  /**
   * Inserts a null-terminated Buffer.
   *
   * @param value The Buffer to write.
   * @param offset The offset to write the Buffer to.
   */
  insertBufferNT(value: Buffer, offset: number): SmartBuffer {
    checkOffsetValue(offset);

    // Write Values
    this.insertBuffer(value, offset);
    this.insertUInt8(0x00, offset + value.length);

    return this;
  }

  /**
   * Writes a null-terminated Buffer.
   *
   * @param value The Buffer to write.
   * @param offset The offset to write the Buffer to.
   */
  writeBufferNT(value: Buffer, offset?: number): SmartBuffer {
    // Checks for valid numberic value;
    if (typeof offset !== "undefined") {
      checkOffsetValue(offset);
    }

    // Write Values
    this.writeBuffer(value, offset);
    this.writeUInt8(
      0x00,
      typeof offset === "number" ? offset + value.length : this._writeOffset,
    );

    return this;
  }

  /**
   * Clears the SmartBuffer instance to its original empty state.
   */
  clear(): SmartBuffer {
    this._writeOffset = 0;
    this._readOffset = 0;
    this.length = 0;
    return this;
  }

  /**
   * Gets the remaining data left to be read from the SmartBuffer instance.
   */
  remaining(): number {
    return this.length - this._readOffset;
  }

  /**
   * Gets the current read offset value of the SmartBuffer instance.
   */
  get readOffset(): number {
    return this._readOffset;
  }

  /**
   * Sets the read offset value of the SmartBuffer instance.
   *
   * @param offset - The offset value to set.
   */
  set readOffset(offset: number) {
    checkOffsetValue(offset);

    // Check for bounds.
    checkTargetOffset(offset, this);

    this._readOffset = offset;
  }

  /**
   * Gets the current write offset value of the SmartBuffer instance.
   */
  get writeOffset(): number {
    return this._writeOffset;
  }

  /**
   * Sets the write offset value of the SmartBuffer instance.
   *
   * @param offset - The offset value to set.
   */
  set writeOffset(offset: number) {
    checkOffsetValue(offset);

    // Check for bounds.
    checkTargetOffset(offset, this);

    this._writeOffset = offset;
  }

  /**
   * Gets the currently set string encoding of the SmartBuffer instance.
   */
  get encoding() {
    return this._encoding;
  }

  /**
   * Sets the string encoding of the SmartBuffer instance.
   *
   * @param encoding The string Buffer encoding to set.
   */
  set encoding(encoding: BufferEncoding) {
    checkEncoding(encoding);

    this._encoding = encoding;
  }

  /**
   * Gets the underlying internal Buffer. (This includes unmanaged data in the Buffer)
   */
  get internalBuffer(): Buffer {
    return this._buff;
  }

  /**
   * Gets the value of the internal managed Buffer (Includes managed data only)
   *
   * @param { Buffer }
   */
  toBuffer(): Buffer {
    return this._buff.slice(0, this.length);
  }

  /**
   * Gets the String value of the internal managed Buffer
   *
   * @param encoding The BufferEncoding to display the Buffer as (defaults to instance level encoding).
   */
  toString(encoding?: BufferEncoding): string {
    const encodingVal = typeof encoding === "string"
      ? encoding
      : this._encoding;

    // Check for invalid encoding.
    checkEncoding(encodingVal);

    return this._buff.toString(encodingVal, 0, this.length);
  }

  /**
   * Destroys the SmartBuffer instance.
   */
  destroy(): SmartBuffer {
    this.clear();
    return this;
  }

  /**
   * Handles inserting and writing strings.
   *
   * @param value The String value to insert.
   * @param isInsert True if inserting a string, false if writing.
   * @param arg3 The offset to insert the string at, or the BufferEncoding to use.
   * @param encoding The BufferEncoding to use for writing strings (defaults to instance encoding).
   */
  private _handleString(
    value: string,
    isInsert: boolean,
    arg3?: number | BufferEncoding,
    encoding?: BufferEncoding,
  ): SmartBuffer {
    let offsetVal = this._writeOffset;
    let encodingVal = this._encoding;

    // Check for offset
    if (typeof arg3 === "number") {
      offsetVal = arg3;
      // Check for encoding
    } else if (typeof arg3 === "string") {
      checkEncoding(arg3);
      encodingVal = arg3;
    }

    // Check for encoding (third param)
    if (typeof encoding === "string") {
      checkEncoding(encoding);
      encodingVal = encoding;
    }

    // Calculate bytelength of string.
    const byteLength = Buffer.byteLength(value, encodingVal);

    // Ensure there is enough internal Buffer capacity.
    if (isInsert) {
      this.ensureInsertable(byteLength, offsetVal);
    } else {
      this._ensureWriteable(byteLength, offsetVal);
    }

    // Write value
    this._buff.write(value, offsetVal, byteLength, encodingVal);

    // Increment internal Buffer write offset;
    if (isInsert) {
      this._writeOffset += byteLength;
    } else {
      // If an offset was given, check to see if we wrote beyond the current writeOffset.
      if (typeof arg3 === "number") {
        this._writeOffset = Math.max(this._writeOffset, offsetVal + byteLength);
      } else {
        // If no offset was given, we wrote to the end of the SmartBuffer so increment writeOffset.
        this._writeOffset += byteLength;
      }
    }

    return this;
  }

  /**
   * Handles writing or insert of a Buffer.
   *
   * @param value The Buffer to write.
   * @param offset The offset to write the Buffer to.
   */
  private _handleBuffer(
    value: Buffer,
    isInsert: boolean,
    offset?: number,
  ): SmartBuffer {
    const offsetVal = typeof offset === "number" ? offset : this._writeOffset;

    // Ensure there is enough internal Buffer capacity.
    if (isInsert) {
      this.ensureInsertable(value.length, offsetVal);
    } else {
      this._ensureWriteable(value.length, offsetVal);
    }

    // Write buffer value
    value.copy(this._buff, offsetVal);

    // Increment internal Buffer write offset;
    if (isInsert) {
      this._writeOffset += value.length;
    } else {
      // If an offset was given, check to see if we wrote beyond the current writeOffset.
      if (typeof offset === "number") {
        this._writeOffset = Math.max(
          this._writeOffset,
          offsetVal + value.length,
        );
      } else {
        // If no offset was given, we wrote to the end of the SmartBuffer so increment writeOffset.
        this._writeOffset += value.length;
      }
    }

    return this;
  }

  /**
   * Ensures that the internal Buffer is large enough to read data.
   *
   * @param length The length of the data that needs to be read.
   * @param offset The offset of the data that needs to be read.
   */
  private ensureReadable(length: number, offset?: number) {
    // Offset value defaults to managed read offset.
    let offsetVal = this._readOffset;

    // If an offset was provided, use it.
    if (typeof offset !== "undefined") {
      // Checks for valid numberic value;
      checkOffsetValue(offset);

      // Overide with custom offset.
      offsetVal = offset;
    }

    // Checks if offset is below zero, or the offset+length offset is beyond the total length of the managed data.
    if (offsetVal < 0 || offsetVal + length > this.length) {
      throw new Error(ERRORS.INVALID_READ_BEYOND_BOUNDS);
    }
  }

  /**
   * Ensures that the internal Buffer is large enough to insert data.
   *
   * @param dataLength The length of the data that needs to be written.
   * @param offset The offset of the data to be written.
   */
  private ensureInsertable(dataLength: number, offset: number) {
    // Checks for valid numberic value;
    checkOffsetValue(offset);

    // Ensure there is enough internal Buffer capacity.
    this._ensureCapacity(this.length + dataLength);

    // If an offset was provided and its not the very end of the buffer, copy data into appropriate location in regards to the offset.
    if (offset < this.length) {
      this._buff.copy(
        this._buff,
        offset + dataLength,
        offset,
        this._buff.length,
      );
    }

    // Adjust tracked smart buffer length
    if (offset + dataLength > this.length) {
      this.length = offset + dataLength;
    } else {
      this.length += dataLength;
    }
  }

  /**
   * Ensures that the internal Buffer is large enough to write data.
   *
   * @param dataLength The length of the data that needs to be written.
   * @param offset The offset of the data to be written (defaults to writeOffset).
   */
  private _ensureWriteable(dataLength: number, offset?: number) {
    const offsetVal = typeof offset === "number" ? offset : this._writeOffset;

    // Ensure enough capacity to write data.
    this._ensureCapacity(offsetVal + dataLength);

    // Adjust SmartBuffer length (if offset + length is larger than managed length, adjust length)
    if (offsetVal + dataLength > this.length) {
      this.length = offsetVal + dataLength;
    }
  }

  /**
   * Ensures that the internal Buffer is large enough to write at least the given amount of data.
   *
   * @param minLength The minimum length of the data needs to be written.
   */
  private _ensureCapacity(minLength: number) {
    const oldLength = this._buff.length;

    if (minLength > oldLength) {
      const data = this._buff;
      let newLength = (oldLength * 3) / 2 + 1;
      if (newLength < minLength) {
        newLength = minLength;
      }
      this._buff = Buffer.allocUnsafe(newLength);

      data.copy(this._buff, 0, 0, oldLength);
    }
  }

  /**
   * Reads a numeric number value using the provided function.
   *
   * @typeparam T { number | bigint } The type of the value to be read
   *
   * @param func { Function(offset: number) => number } The function to read data on the internal Buffer with.
   * @param byteSize The number of bytes read.
   * @param offset The offset to read from (optional). When this is not provided, the managed readOffset is used instead.
   *
   * @returns { T } the number value
   */
  private _readNumberValue<T>(
    func: (offset: number) => T,
    byteSize: number,
    offset?: number,
  ): T {
    this.ensureReadable(byteSize, offset);

    // Call Buffer.readXXXX();
    const value = func.call(
      this._buff,
      typeof offset === "number" ? offset : this._readOffset,
    );

    // Adjust internal read offset if an optional read offset was not provided.
    if (typeof offset === "undefined") {
      this._readOffset += byteSize;
    }

    return value;
  }

  /**
   * Inserts a numeric number value based on the given offset and value.
   *
   * @typeparam T { number | bigint } The type of the value to be written
   *
   * @param func { Function(offset: T, offset?) => number} The function to write data on the internal Buffer with.
   * @param byteSize The number of bytes written.
   * @param value { T } The number value to write.
   * @param offset the offset to write the number at (REQUIRED).
   *
   * @returns SmartBuffer this buffer
   */
  private _insertNumberValue<T extends number | bigint>(
    func: (value: T, offset?: number) => number,
    byteSize: number,
    value: T,
    offset: number,
  ): SmartBuffer {
    // Check for invalid offset values.
    checkOffsetValue(offset);

    // Ensure there is enough internal Buffer capacity. (raw offset is passed)
    this.ensureInsertable(byteSize, offset);

    // Call buffer.writeXXXX();
    func.call(this._buff, value, offset);

    // Adjusts internally managed write offset.
    this._writeOffset += byteSize;
    return this;
  }

  /**
   * Writes a numeric number value based on the given offset and value.
   *
   * @typeparam T { number | bigint } The type of the value to be written
   *
   * @param func { Function(offset: T, offset?) => number} The function to write data on the internal Buffer with.
   * @param byteSize The number of bytes written.
   * @param value { T } The number value to write.
   * @param offset the offset to write the number at (REQUIRED).
   *
   * @returns SmartBuffer this buffer
   */
  private _writeNumberValue<T extends number | bigint>(
    func: (value: T, offset?: number) => number,
    byteSize: number,
    value: T,
    offset?: number,
  ): SmartBuffer {
    // If an offset was provided, validate it.
    if (typeof offset === "number") {
      // Check if we're writing beyond the bounds of the managed data.
      if (offset < 0) {
        throw new Error(ERRORS.INVALID_WRITE_BEYOND_BOUNDS);
      }

      checkOffsetValue(offset);
    }

    // Default to writeOffset if no offset value was given.
    const offsetVal = typeof offset === "number" ? offset : this._writeOffset;

    // Ensure there is enough internal Buffer capacity. (raw offset is passed)
    this._ensureWriteable(byteSize, offsetVal);

    func.call(this._buff, value, offsetVal);

    // If an offset was given, check to see if we wrote beyond the current writeOffset.
    if (typeof offset === "number") {
      this._writeOffset = Math.max(this._writeOffset, offsetVal + byteSize);
    } else {
      // If no numeric offset was given, we wrote to the end of the SmartBuffer so increment writeOffset.
      this._writeOffset += byteSize;
    }

    return this;
  }
}
