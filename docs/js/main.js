'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

{
  var config = {
    indis: {
      in: {
        base: {
          duration: 500,
          easing: 'easeOutQuint',
          translateY: [0, 240],
          opacity: {
            value: 1,
            duration: 50,
            easing: 'linear'
          }
        },
        shape: {
          duration: 350,
          easing: 'easeOutBack',
          scaleY: {
            value: [1.3, 1],
            duration: 1300,
            easing: 'easeOutElastic',
            elasticity: 500
          },
          scaleX: {
            value: [0.3, 1],
            duration: 1300,
            easing: 'easeOutElastic',
            elasticity: 500
          }
        },
        path: {
          duration: 450,
          easing: 'easeInOutQuad',
          d: 'M 44.5,24 C 148,24 252,24 356,24 367,24 376,32.9 376,44 L 376,256 C 376,267 367,276 356,276 252,276 148,276 44.5,276 33.4,276 24.5,267 24.5,256 L 24.5,44 C 24.5,32.9 33.4,24 44.5,24 Z'
        },
        content: {
          duration: 300,
          delay: 50,
          easing: 'easeOutQuad',
          translateY: [10, 0],
          opacity: {
            value: 1,
            easing: 'linear',
            duration: 100
          }
        },
        trigger: {
          translateY: [{ value: '-50%', duration: 100, easing: 'easeInQuad' }, { value: ['50%', '0%'], duration: 100, easing: 'easeOutQuad' }],
          opacity: [{ value: 0, duration: 100, easing: 'easeInQuad' }, { value: 1, duration: 100, easing: 'easeOutQuad' }],
          color: {
            value: '#6fbb95',
            duration: 1,
            delay: 100,
            easing: 'easeOutQuad'
          }
        }
      },
      out: {
        base: {
          duration: 320,
          delay: 50,
          easing: 'easeInOutQuint',
          scaleY: 1.5,
          scaleX: 0,
          translateY: -100,
          opacity: {
            value: 0,
            duration: 100,
            delay: 130,
            easing: 'linear'
          }
        },
        path: {
          duration: 300,
          delay: 50,
          easing: 'easeInOutQuint',
          d: 'M 44.5,24 C 138,4.47 246,-6.47 356,24 367,26.9 376,32.9 376,44 L 376,256 C 376,267 367,279 356,276 231,240 168,241 44.5,276 33.8,279 24.5,267 24.5,256 L 24.5,44 C 24.5,32.9 33.6,26.3 44.5,24 Z'
        },
        content: {
          duration: 300,
          easing: 'easeInOutQuad',
          translateY: -40,
          opacity: {
            value: 0,
            duration: 100,
            delay: 135,
            easing: 'linear'
          }
        },
        trigger: {
          translateY: [{ value: '-50%', duration: 100, easing: 'easeInQuad' }, { value: ['50%', '0%'], duration: 100, easing: 'easeOutQuad' }],
          opacity: [{ value: 0, duration: 100, easing: 'easeInQuad' }, { value: 1, duration: 100, easing: 'easeOutQuad' }],
          color: {
            value: '#666',
            duration: 1,
            delay: 100,
            easing: 'easeOutQuad'
          }
        }
      }
    }
  };

  var tooltips = Array.from(document.querySelectorAll('.tooltip'));

  var Tooltip = function () {
    function Tooltip(el) {
      _classCallCheck(this, Tooltip);

      this.DOM = {};
      this.DOM.el = el;
      this.type = this.DOM.el.getAttribute('data-type');
      this.DOM.trigger = this.DOM.el.querySelector('.tooltip__trigger');
      this.DOM.triggerSpan = this.DOM.el.querySelector('.tooltip__trigger-text');
      this.DOM.base = this.DOM.el.querySelector('.tooltip__base');
      this.DOM.shape = this.DOM.base.querySelector('.tooltip__shape');
      if (this.DOM.shape) {
        this.DOM.path = this.DOM.shape.childElementCount > 1 ? Array.from(this.DOM.shape.querySelectorAll('path')) : this.DOM.shape.querySelector('path');
      }
      this.DOM.deco = this.DOM.base.querySelector('.tooltip__deco');
      this.DOM.content = this.DOM.base.querySelector('.tooltip__content');

      this.DOM.letters = this.DOM.content.querySelector('.tooltip__letters');
      if (this.DOM.letters) {
        // Create spans for each letter.
        charming(this.DOM.letters);
        // Redefine content.
        this.DOM.content = this.DOM.letters.querySelectorAll('span');
      }
      this.initEvents();
    }

    _createClass(Tooltip, [{
      key: 'initEvents',
      value: function initEvents() {
        var _this = this;

        this.mouseenterFn = function () {
          _this.mouseTimeout = setTimeout(function () {
            _this.isShown = true;
            _this.show();
          }, 75);
        };
        this.mouseleaveFn = function () {
          clearTimeout(_this.mouseTimeout);
          if (_this.isShown) {
            _this.isShown = false;
            _this.hide();
          }
        };
        this.DOM.trigger.addEventListener('mouseenter', this.mouseenterFn);
        this.DOM.trigger.addEventListener('mouseleave', this.mouseleaveFn);
        this.DOM.trigger.addEventListener('touchstart', this.mouseenterFn);
        this.DOM.trigger.addEventListener('touchend', this.mouseleaveFn);
      }
    }, {
      key: 'show',
      value: function show() {
        this.animate('in');
      }
    }, {
      key: 'hide',
      value: function hide() {
        this.animate('out');
      }
    }, {
      key: 'animate',
      value: function animate(dir) {
        if (config[this.type][dir].base) {
          anime.remove(this.DOM.base);
          var baseAnimOpts = { targets: this.DOM.base };
          anime(Object.assign(baseAnimOpts, config[this.type][dir].base));
        }
        if (config[this.type][dir].shape) {
          anime.remove(this.DOM.shape);
          var shapeAnimOpts = { targets: this.DOM.shape };
          anime(Object.assign(shapeAnimOpts, config[this.type][dir].shape));
        }
        if (config[this.type][dir].path) {
          anime.remove(this.DOM.path);
          var _shapeAnimOpts = { targets: this.DOM.path };
          anime(Object.assign(_shapeAnimOpts, config[this.type][dir].path));
        }
        if (config[this.type][dir].content) {
          anime.remove(this.DOM.content);
          var contentAnimOpts = { targets: this.DOM.content };
          anime(Object.assign(contentAnimOpts, config[this.type][dir].content));
        }
        // if ( config[this.type][dir].trigger ) {
        // 	anime.remove(this.DOM.triggerSpan);
        // 	let triggerAnimOpts = {targets: this.DOM.triggerSpan};
        // 	anime(Object.assign(triggerAnimOpts, config[this.type][dir].trigger));
        // }
        if (config[this.type][dir].deco) {
          anime.remove(this.DOM.deco);
          var decoAnimOpts = { targets: this.DOM.deco };
          anime(Object.assign(decoAnimOpts, config[this.type][dir].deco));
        }
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        this.DOM.trigger.removeEventListener('mouseenter', this.mouseenterFn);
        this.DOM.trigger.removeEventListener('mouseleave', this.mouseleaveFn);
        this.DOM.trigger.removeEventListener('touchstart', this.mouseenterFn);
        this.DOM.trigger.removeEventListener('touchend', this.mouseleaveFn);
      }
    }]);

    return Tooltip;
  }();

  var init = function () {
    return tooltips.forEach(function (t) {
      return new Tooltip(t);
    });
  }();
};