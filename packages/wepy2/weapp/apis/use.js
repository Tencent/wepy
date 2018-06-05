import { isFunc } from '../../shared/index';

export function use (plugin, ...args) {
  if (plugin.installed) {
    return this;
  }

  let install = plugin.install || plugin;

  if (isFunc(install)) {
    install.apply(plugin, args);
  }

  plugin.installed = 1;
}
