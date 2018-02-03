"use strict";

var _electron = _interopRequireDefault(require("electron"));

var _events = _interopRequireDefault(require("events"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

var MainBroadcastObject =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(MainBroadcastObject, _EventEmitter);

  function MainBroadcastObject() {
    var _this;

    _classCallCheck(this, MainBroadcastObject);

    _this = _possibleConstructorReturn(this, (MainBroadcastObject.__proto__ || Object.getPrototypeOf(MainBroadcastObject)).call(this));

    _electron.default.ipcMain.on('zero:broadcast:main', function (event, _ref) {
      var channel = _ref.channel,
          args = _ref.args;

      _this.emit.apply(_assertThisInitialized(_this), [channel].concat(_toConsumableArray(args)));
    });

    return _this;
  }

  _createClass(MainBroadcastObject, [{
    key: "emit",
    value: function emit(channel) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      _events.default.prototype.emit.apply(this, [channel].concat(args));

      _electron.default.BrowserWindow.getAllWindows().forEach(function (win) {
        var invoke = function invoke() {
          return win.webContents.send('zero:broadcast:renderer', {
            channel: channel,
            args: args
          });
        };

        if (win.webContents.isLoading()) {
          win.webContents.once('did-finish-load', invoke);
        } else {
          invoke();
        }
      });
    }
  }]);

  return MainBroadcastObject;
}(_events.default);

var RendererBroadcastObject =
/*#__PURE__*/
function (_EventEmitter2) {
  _inherits(RendererBroadcastObject, _EventEmitter2);

  function RendererBroadcastObject() {
    var _this2;

    _classCallCheck(this, RendererBroadcastObject);

    _this2 = _possibleConstructorReturn(this, (RendererBroadcastObject.__proto__ || Object.getPrototypeOf(RendererBroadcastObject)).call(this));

    _electron.default.ipcRenderer.on('zero:broadcast:renderer', function (event, _ref2) {
      var channel = _ref2.channel,
          args = _ref2.args;

      _events.default.prototype.emit.apply(_assertThisInitialized(_this2), [channel].concat(_toConsumableArray(args)));
    });

    return _this2;
  }

  _createClass(RendererBroadcastObject, [{
    key: "emit",
    value: function emit(channel) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      _electron.default.ipcRenderer.send('zero:broadcast:main', {
        channel: channel,
        args: args
      });
    }
  }]);

  return RendererBroadcastObject;
}(_events.default);

if (process && process.type === 'renderer') {
  _electron.default.remote.require(__filename);

  module.exports = new RendererBroadcastObject();
} else {
  module.exports = new MainBroadcastObject();
}