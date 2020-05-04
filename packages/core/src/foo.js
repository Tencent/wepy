import { bar } from './bar';

const foo = num => {
  return num + 1;
};

const foobar = num => {
  return foo(bar(num));
};

export { foo, foobar };
