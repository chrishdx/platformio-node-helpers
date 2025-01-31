/**
 * Copyright (c) 2017-present PlatformIO <contact@platformio.org>
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import { promises as fs } from 'fs';
import got from 'got';
import os from 'os';
import qs from 'querystringify';

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function loadJSON(filePath) {
  try {
    await fs.access(filePath);
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function arrayRemove(array, element) {
  return array.splice(array.indexOf(element), 1);
}

export function disposeSubscriptions(subscriptions) {
  while (subscriptions.length) {
    subscriptions.pop().dispose();
  }
}

export function PEPverToSemver(pepver) {
  return pepver.replace(/(\.\d+)\.?(dev|a|b|rc|post)/, '$1-$2.');
}

function uuid() {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}

export async function reportError(err) {
  const data = {
    v: 1,
    tid: 'UA-1768265-13',
    cid: uuid(),
    aid: 'node.helpers',
    av: PACKAGE_VERSION,
    an: `${os.type()}, ${os.release()}, ${os.arch()}`,
    t: 'exception',
    exd: err.toString(),
    exf: 1,
  };
  if (process.env.PLATFORMIO_CALLER) {
    data['cd1'] = process.env.PLATFORMIO_CALLER;
  }
  await got.post('https://www.google-analytics.com/collect', {
    body: qs.stringify(data),
    timeout: 2000,
  });
}

export function getErrorReportUrl(title, description) {
  const errorToUrls = [
    ['Multiple requests to rebuild the project', 'https://bit.ly/3mMTOgB'],
    ['WindowsError: [Error 5]', 'https://bit.ly/3GTAtlG'],
    ['Could not start PIO Home server: Error: timeout', 'https://bit.ly/2Yfl65C'],
    ['Could not find distutils module', 'https://bit.ly/3bK6zlH'],
    ['after connection broken by', 'https://bit.ly/3q6StTV'],
    ['subprocess.CalledProcessError', 'https://bit.ly/3EFlxWq'],
    ['Can not find Python Interpreter', 'https://bit.ly/3wkz0Qv'],
  ];
  for (const item of errorToUrls) {
    if (description.includes(item[0])) {
      return item[1];
    }
  }
  let repoName = `${process.env.PLATFORMIO_CALLER || 'vscode'}-ide`;
  if (title.includes('Installation Manager')) {
    repoName = 'core-installer';
  }
  return `https://github.com/platformio/platformio-${repoName}/issues/new?${qs.stringify(
    {
      title,
      body: description,
      labels: 'auto',
    }
  )}`;
}
