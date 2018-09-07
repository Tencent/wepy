import Base from './class/Base';
import page from './page';
import app from './app';
import component from './component';
import $global from './global';
import { use } from './apis/index';


let wepy = Base;

Object.assign(wepy, {
  component,
  page,
  app,
  global: $global,

  // global apis
  use
});


export default wepy;
