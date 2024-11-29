import { execSync } from 'child_process';
import fs from 'fs';
import fsp from 'fs/promises';

import env from './utils/env.js';
import getAuth from './utils/get-auth.js';
import getStorefrontCatalogKeychain from './utils/get-storefront-catalog-keychain.js';
import getStorefrontKeychain from './utils/get-storefront-keychain.js';
import getTimelineKeychain from './utils/get-timeline-keychain.ts.js';
import killToken from './utils/kill-token.js';

const outputFolder = 'output';
const aesFile = `${outputFolder}/aes.json`;

interface KeyInfo {
  guid: string;
  key: string;
  cosmeticIds: string[];
}

const main = async () => {
  if (!fs.existsSync(outputFolder)) {
    await fsp.mkdir(outputFolder, { recursive: true });
  }

  let keyCache: KeyInfo[] = [];

  try {
    if (fs.existsSync(aesFile)) {
      keyCache = JSON.parse(await fsp.readFile(aesFile, 'utf-8'));
    }
  } catch (err) {
    console.error(err);

    keyCache = [];
  }

  const auth = await getAuth();
  const storefrontKeychain = await getStorefrontKeychain(auth);
  const storefrontCatalogKeychain = await getStorefrontCatalogKeychain(auth);
  const timelineKeychain = await getTimelineKeychain(auth);

  await killToken(auth);

  const currentKeychains = Array.from(new Set([
    ...storefrontKeychain.data || [],
    ...storefrontCatalogKeychain.data || [],
    ...timelineKeychain.data || [],
  ]));

  const addedKeys: KeyInfo[] = [];
  const addedCosmetics: string[] = [];

  currentKeychains.forEach((x) => {
    const [guid, b64Key, cosmeticId] = x.split(':');
    const key = Buffer.from(b64Key, 'base64').toString('hex');
    let group = keyCache.find((p) => p.guid === guid);

    if (!group) {
      group = {
        guid,
        key,
        cosmeticIds: [],
      };

      keyCache.push(group);
      addedKeys.push(group);
    }

    if (cosmeticId && !group.cosmeticIds.includes(cosmeticId)) {
      group.cosmeticIds.push(cosmeticId);
      addedCosmetics.push(cosmeticId);
    }
  });

  if (!addedCosmetics.length && !addedKeys.length) {
    return;
  }

  keyCache.sort((a, b) => a.guid.localeCompare(b.guid));
  keyCache.forEach((x) => x.cosmeticIds.sort());

  addedKeys.sort((a, b) => a.guid.localeCompare(b.guid));
  addedCosmetics.sort();

  await fsp.writeFile(aesFile, JSON.stringify(keyCache, null, 3));

  const commitMessage = addedKeys.length
    ? `Added ${addedKeys.length} Keys\n${addedKeys.map((x) => `- ${x.guid} - ${x.key}`).join('\n')}`
    : `Added ${addedCosmetics.length} Cosmetic(s)\n${addedCosmetics.map((x) => `- ${x}`).join('\n')}`;

  console.log(commitMessage);

  if (env.GIT_DO_NOT_COMMIT?.toLowerCase() === 'true') {
    return;
  }

  execSync('git add output');
  execSync('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
  execSync('git config user.name "github-actions[bot]"');
  execSync('git config commit.gpgsign false');
  execSync(`git commit -m "${commitMessage}"`);

  if (env.GIT_DO_NOT_PUSH?.toLowerCase() === 'true') {
    return;
  }

  execSync('git push');
};

setInterval(() => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  main();
}, 1000 * 60 * 5);
