import { crc32 } from "crc";
import md5 from "md5";

export interface QRCodeConfig {
  qrCodeAutoRefresh?: number;
  checol?: string;
  timestamp?: number;
}

/**
 * Converts a hexadecimal string to a byte array
 */
export function hexToBin(hex: string | null): number[] | null {
  if (hex === null || hex === undefined) {
    return null;
  }

  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substring(i, i + 2), 16));
  }
  return bytes;
}

/**
 * Converts a byte array to a hexadecimal string
 */
export function binToHex(bytes: number[]): string {
  return bytes
    .map((byte) => (byte & 0xff).toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Returns the current Unix timestamp in seconds
 */
export function getUnixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Calculates QR code timestamp by subtracting offset and rounding down to nearest 5 seconds
 * @param offset - Offset to subtract from timestamp
 * @param timestamp - Optional timestamp override (if not provided, will use current time)
 */
export function getQRCodeTimestamp(offset: number, timestamp?: number): number {
  let actualTimestamp = timestamp ?? getUnixTimestamp();
  actualTimestamp -= offset;
  actualTimestamp -= actualTimestamp % 5;
  return actualTimestamp;
}

/**
 * Calculates QR code with XOR encryption and checksum
 * @param secretKey - Hexadecimal secret key
 * @param config - Configuration object with refresh interval, checol, and optional timestamp
 */
export function encode(secretKey: string, config: QRCodeConfig): string {
  // Get refresh interval, default to 14 seconds
  const refreshInterval = config.qrCodeAutoRefresh || 14;

  // Get checol value from config, default to empty string
  const checolValue = config.checol || "";

  // Get QR code timestamp rounded to 5-second intervals (or use provided timestamp)
  const actualTimestamp = getQRCodeTimestamp(refreshInterval, config.timestamp);

  // Convert timestamp to 8-character hex string (zero-padded)
  const timestampHex = actualTimestamp.toString(16).padStart(8, "0");

  // Generate MD5 hash and take first 16 characters
  const hash = md5(timestampHex);
  const hashPrefix = hash.substring(0, 16);

  // Convert hash and secret key to byte arrays
  const hashBytes = hexToBin(hashPrefix);
  const secretKeyBytes = hexToBin(secretKey);

  if (!hashBytes || !secretKeyBytes) {
    throw new Error("Invalid hex input");
  }

  // XOR each byte of the secret key with the hash
  const xorResult: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 0; i < secretKeyBytes.length; i++) {
    xorResult[i] = secretKeyBytes[i] ^ hashBytes[i];
  }

  // Build intermediate string: XOR result + checol + timestamp hex (for checksum)
  const intermediateString =
    binToHex(xorResult) + checolValue + actualTimestamp.toString(16);

  // Calculate CRC32 checksum
  const checksum = crc32(intermediateString);
  const checksumHex = (checksum >>> 0).toString(16).padStart(8, "0");

  // Combine XOR result with checksum bytes
  const checksumBytes = hexToBin(checksumHex);
  if (!checksumBytes) {
    throw new Error("Invalid checksum");
  }

  const finalBytes = xorResult.concat(checksumBytes);
  return binToHex(finalBytes);
}

/**
 * Generates the data for the QR code based on key, checol, and offset
 * @param key - The key parameter (hexadecimal secret key)
 * @param checol - The checol parameter
 * @param offset - The offset parameter (as string, will be parsed to number)
 * @returns The data string to encode in the QR code
 */
export const generateQRCodeData = (
  key: string,
  checol: string,
  offset: string
): string => {
  const config: QRCodeConfig = {
    qrCodeAutoRefresh: parseInt(offset, 10) || 14,
    checol: checol,
  };

  return encode(key, config);
};
