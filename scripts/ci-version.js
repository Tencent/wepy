/* eslint no-console: 0 */

const execa = require('execa');

const ALLOW_VERSION = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'];
const ALLOW_TAG = ['alpha', 'beta', 'next'];

// release: major release
// release: patch release on alpha
// release: prepatch release on beta

function parseMsg(msg) {
  if (!msg.startsWith('release:')) {
    throw Error('This is not a release message');
  }
  const words = msg.replace('release: ', '').split(' ');
  const version = words[0];
  const tag = words[3];

  if (ALLOW_VERSION.indexOf(version) === -1) {
    throw new Error(`Invalid version: ${version}`);
  }

  if (tag && ALLOW_TAG.indexOf(tag) === -1) {
    throw new Error(`Invalid tag: ${tag}`);
  }

  return {
    version,
    tag
  };
}

function release(version, tag) {
  console.log(`Ready to release a ${version} version${tag ? ' on ' + tag : ''}.`);

  const cmds = ['lerna', 'version', version, '--yes', '--conventional-commits', '--create-release', 'github'];
  if (tag) {
    // cmds.push('--dist-tag', tag);
  }
  console.log('EXEC: ' + cmds.join(' '));

  execa('npx', cmds)
    .then(res => {
      console.log(res.stdout);
    })
    .catch(e => {
      console.log(e);
    });
}

const { version, tag } = parseMsg(process.argv[2]);

release(version, tag);
