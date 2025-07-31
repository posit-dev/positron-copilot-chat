/*---------------------------------------------------------------------------------------------
 *  Copyright (C) 2025 Posit Software, PBC. All rights reserved.
 *  Licensed under the Elastic License 2.0. See LICENSE.txt for license information.
 *--------------------------------------------------------------------------------------------*/

import { createHmac, createHash } from 'crypto';

export async function createRequestHMAC(hmacSecret: string | undefined): Promise<string | undefined> {
	// If we don't have the right env variables this could happen
	if (!hmacSecret) {
		return undefined;
	}

	const current = Math.floor(Date.now() / 1000).toString();
	const hmac = createHmac('sha256', hmacSecret);
	hmac.update(current);
	const signatureHex = hmac.digest('hex');
	return `${current}.${signatureHex}`;
}

export async function createSha256Hash(data: string | Uint8Array): Promise<string> {
	const dataBuffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : Buffer.from(data);
	const hash = createHash('sha256');
	hash.update(dataBuffer);
	return hash.digest('hex');
}
