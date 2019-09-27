import wepy from '../index';
import { WepyInstace } from '../wepy';
import { PluginObject, PluginFunction } from '../plugin';

let eventBus = new wepy();

eventBus.$on('test', function(a: any, b: any, c: any) {
  console.log(a, b, c)
});

eventBus.$emit('test', 1, 2, 3);

const installer: PluginFunction<Array<string>> = function (wepy, option) {
  if (option) {
    console.log(option.length);
  }
};

const plugin: PluginObject<Array<string>> = {
  install: installer,
  useDefinedMethod (): string {
    return '' + Math.random();
  }
}

wepy.mixin({
  data: {
    a: 1
  },
  methods: {
    commonFunc () {
      console.log(this);
    }
  }
});


wepy.nextTick().then(res => {
  console.log(res);
});

wepy.nextTick(function (): void {
  console.log(this);
})
wepy.nextTick(function (): void {
  console.log(this.ctx === 'efc');
}, { ctx: 'abc'})