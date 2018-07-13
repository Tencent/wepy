import page from './page';
import app from './app';
import component from './component';
import $global from './global';
import { use } from './apis/index';

export default {
  component: component,
  page: page,
  app: app,
  global: $global,

  // global apis
  use: use
}
