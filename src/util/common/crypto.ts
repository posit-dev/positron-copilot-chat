/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export async function createRequestHMAC(hmacSecret: string | undefined): Promise<string | undefined> {
	// If we don't have the right env variables this could happen
	if (!hmacSecret) {
		return undefined;
	}

	// Check if we're in Node.js environment and use Node.js crypto if available
	if (typeof require !== 'undefined') {
		try {
			const { createHmac } = require('crypto');
			const current = Math.floor(Date.now() / 1000).toString();
			const hmac = createHmac('sha256', hmacSecret);
			hmac.update(current);
			const signatureHex = hmac.digest('hex');
			return `${current}.${signatureHex}`;
		} catch (e) {
			// Fall back to Web Crypto API if Node.js crypto fails
		}
	}

	// Web Crypto API fallback (for browser environments)
	const key = await (crypto as any).subtle.importKey(
		"raw",
		new TextEncoder().encode(hmacSecret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"]
	);

	const current = Math.floor(Date.now() / 1000).toString();
	const textEncoder = new TextEncoder();
	const data = textEncoder.encode(current);

	const signature = await (crypto as any).subtle.sign("HMAC", key, data);
	const signatureArray = Array.from(new Uint8Array(signature));
	const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

	return `${current}.${signatureHex}`;
}

export async function createSha256Hash(data: string | Uint8Array): Promise<string> {
	// Check if we're in Node.js environment and use Node.js crypto if available
	if (typeof require !== 'undefined') {
		try {
			const { createHash } = require('crypto');
			const dataBuffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : Buffer.from(data);
			const hash = createHash('sha256');
			hash.update(dataBuffer);
			return hash.digest('hex');
		} catch (e) {
			// Fall back to Web Crypto API if Node.js crypto fails
		}
	}

	// Web Crypto API fallback (for browser environments)
	const dataUint8 = typeof data === 'string' ? new TextEncoder().encode(data) : data;
	const hashBuffer = await (crypto as any).subtle.digest('SHA-256', dataUint8);
	const hashArray = new Uint8Array(hashBuffer);
	let hashHex = '';
	for (const byte of hashArray) {
		hashHex += byte.toString(16).padStart(2, '0');
	}

	return hashHex;
}
