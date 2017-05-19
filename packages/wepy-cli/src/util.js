
import colors from 'colors/safe';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import {exec} from 'child_process';
import hash from 'hash-sum';
import cache from './cache';

colors.enabled = true;

colors.setTheme({
    /*SILLY: 'rainbow',
    INPUT: 'grey',
    VERBOSE: 'cyan',
    PROMPT: 'grey',
    INFO: 'green',
    DATA: 'grey',
    HELP: 'cyan',
    WARN: 'yellow',
    DEBUG: 'blue',
    ERROR: 'red',*/
    'info': 'grey',
    '变更': 'bgYellow',
    '删除': 'bgMagenta',
    '执行': 'blue',
    '压缩': 'blue',
    '信息': 'grey',
    '完成': 'green',
    '创建': 'green',
    '监听': 'magenta',
    '错误': 'red',
    '测试': 'red',
    '拷贝': 'yellow',
    '编译': 'blue',
    '写入': 'green'
});

let ID_CACHE = {};
const utils = {

    seqPromise(promises) {
        return new Promise((resolve, reject) => {

            let count = 0;
            let results = [];

            const iterateeFunc = (previousPromise, currentPromise) => {
                return previousPromise
                    .then(function (result) {
                        if (count++ !== 0) results = results.concat(result);
                        return currentPromise(result, results, count);
                    })
                    .catch((err) => {
                        return reject(err);
                    });
            }

            promises = promises.concat(() => Promise.resolve());

            promises.reduce(iterateeFunc, Promise.resolve(false))
            .then(function (res) {
                resolve(results);
            });

        });
    },
    exec(cmd, quite) {
        return new Promise((resolve, reject) => {
            let fcmd = exec(cmd, (err, stdout, stderr) => {
                if (err) { reject(err); }
                else { resolve(stdout, stderr); }
            });
            fcmd.stdout.on('data', (chunk) => {
                !quite && process.stdout.write(chunk);
            });
            fcmd.stderr.on('data', (chunk) => {
                !quite && process.stdout.write(chunk);
            });
        });
    },
    timeoutExec(sec, cmd, quite) {
        let timeout = new Promise(function(resolve, reject) { 
            setTimeout(() => {
                reject('timeout');
            }, sec * 1000); 
        });
        let task = this.exec(cmd, quite);
        return Promise.race([timeout, task]);
    },
    elemToArray(elems) {
        let rst = [];
        for (let i = 0, len = elems.$$length; i < len; i++) {
            rst.push(elems[i]);
        }
        return rst;
    },
    getComId(elem) {
        let tagName = elem.nodeName;
        let path = elem.getAttribute('path');
        let id = elem.getAttribute('id');
        if (tagName !== 'component')
            return tagName;
        if (id)
            return id;
        if (path && !id)
            return path;
    },
    getComPath(elem) {
        return elem.getAttribute('path') || this.getComId(elem);
    },
    findComponentInTemplate (com, template) {
        if (typeof(com) !== 'string') {
            com = this.getComId(com);
        }
        let definePath = template.components[com];
        definePath = definePath.indexOf('.') === -1 ? definePath : path.resolve(template.src, '..' + path.sep + definePath)
        return this.findComponent(definePath, true);
    },
    findComponent(com) {
        let wpyExt = cache.getExt();

        let src = '';
        if (com.indexOf(path.sep) !== -1) {
            if (this.isFile(com + wpyExt)) {
                src = com + wpyExt;
            }
        } else {
            let comPath = path.join(this.currentDir, 'node_modules', com);
            if (this.isDir(comPath)) {
                let pkg = this.readFile(path.join(comPath, 'package.json'));
                try {
                    pkg = JSON.parse(pkg);
                } catch (e) {
                    pkg = null;
                }
                src = path.join(comPath, pkg.main);
            } else {
                let comPath = path.join(this.currentDir, cache.getSrc(), 'components', com);
                if (this.isFile(comPath + wpyExt)) {
                    src = comPath + wpyExt;
                } else if (this.isFile(comPath + '/index' + wpyExt)) {
                    src = comPath + '/index' + wpyExt;
                } else if (this.isFile(comPath + '/' + com + wpyExt)) {
                    src = comPath + '/' + com + wpyExt;
                }
            }
        }
        return src;
    },

    currentDir: process.cwd(),
    cliDir: __dirname,

    isFunction (fn) {
        return typeof(fn) === 'function';
    },
    isString (obj) {
        return toString.call(obj) === '[object String]';
    },
    isObject (obj) {
        return toString.call(obj) === '[object Object]';
    },
    isNumber (obj) {
        return toString.call(obj) === '[object Number]';
    },
    isBoolean (obj) {
        return toString.call(obj) === '[object Boolean]';
    },
    isArray (obj) {
        return Array.isArray(obj);
    },
    isFile (p) {
        p = (typeof(p) === 'object') ? path.join(p.dir, p.base) : p;
        if (!fs.existsSync(p)) {
            return false;
        }
        return fs.statSync(p).isFile();
    },
    isDir (p) {
        if (!fs.existsSync(p)) {
            return false;
        }
        return fs.statSync(p).isDirectory();
    },
    /**
     * xml dom 对 TEXT_NODE 和 ATTRIBUTE_NODE 进行转义。
     */
    decode (content) {
        let pmap = ['<', '&', '"'];
        let amap = ['&lt;', '&amp;', '&quot;'];
        let reg = new RegExp(`(${amap[0]}|${amap[1]}|${amap[2]})`, 'ig');
        return content.replace(reg, (match, m) => {
            return pmap[amap.indexOf(m)];
        });
    },
    encode (content, start, end) {
        start = start || 0;
        end = end || content.length;

        let buffer = [];
        let pmap = ['<', '&', '"'];
        let amap = ['&lt;', '&amp;', '&quot;'];

        let i = 0, c;
        for (let i = 0, len = content.length; i < len; i++) {
            if (i < start || i > end) {
                buffer.push(content[i]);
            } else {
                c = pmap.indexOf(content[i]);
                buffer.push(c === -1 ? content[i] : amap[c]);
            }
        }
        return buffer.join('');
    },
    /**
     * xml replace
     */
    attrReplace(content) {
        const config = utils.getConfig();
        const knownTags = [
            // 视图容器
            'view',
            'scroll-view',
            'swiper',
            'swiper-item',

            // 基础内容
            'icon',
            'text',
            'progress',

            // 表单组件
            'button',
            'checkbox-group',
            'checkbox',
            'form',
            'input',
            'label',
            'picker',
            'picker-view',
            'picker-view-column',
            'radio-group',
            'radio',
            'slider',
            'switch',
            'textarea',

            // 导航
            'navigator',

            // 媒体组件
            'audio',
            'image',
            'video',

            // 地图
            'map',
            
            // 画布
            'canvas',

            // 客服会话
            'contact-button'
        ];
        const configTags = config.knownTags;
        if (configTags && Array.isArray(configTags)) {
            // 增加可配置的 knownTags
            // 以防止由于小程序升级 上边的默认tag不完全导致的问题
            // 如果说小程序升级的话 在 wepy 没升级的情况下
            // 用户可以通过临时加入 knownTags 的方法兼容
            knownTags.push.apply(knownTags, configTags);
        }
        // Exp error when using this code: <input focus wx:if="{{test >   
        return content.replace(/<([\w-]+)\s*[\s\S]*?(\/|<\/[\w-]+)>/ig, (tag, tagName) => {
            tagName = tagName.toLowerCase();
            return tag.replace(/\s+:([\w-_]*)([\.\w]*)\s*=/ig, (attr, name, type) => { // replace :param.sync => v-bind:param.sync
                if (type === '.once' || type === '.sync') {
                }
                else
                    type = '.once';
                return ` v-bind:${name}${type}=`;
            }).replace(/\s+\@([\w-_]*)([\.\w]*)\s*=/ig, (attr, name, type) => { // replace @change => v-on:change
                const prefix = type !== '.user' ? (type === '.stop' ? 'catch' : 'bind') : 'v-on:';
                return ` ${prefix}${name}=`;
            });
        });
    },
    unique (arr) {
        let tmp = {}, out = [];
        arr.forEach((v) => {
            if (!tmp[v]) {
                tmp[v] = 1;
                out.push(v);
            }
        });
        return out;
    },
    unlink (p) {
        let rst = '';
        p = (typeof(p) === 'object') ? path.join(p.dir, p.base) : p;
        try {
            rst = fs.unlinkSync(p);
        } catch (e) {
            rst = null;
        }
        return rst;
    },
    readFile (p) {
        let rst = '';
        p = (typeof(p) === 'object') ? path.join(p.dir, p.base) : p;
        try {
            rst = fs.readFileSync(p, 'utf-8');
        } catch (e) {
            rst = null;
        }
        return rst;
    },
    mkdir (name) {
        let rst = true;
        try {
            fs.mkdirSync(name);
        } catch(e) {
            rst = e;
        }
        return rst;
    },
    writeFile (p, data) {
        let opath = (this.isString(p) ? path.parse(p) : p);
        if (!this.isDir(opath.dir)) {
            mkdirp.sync(opath.dir);
        }
        fs.writeFileSync(p, data);
    },
    copy(opath, ext, src, dist) {
        let target = this.getDistPath(opath, ext, src, dist);
        this.writeFile(target, this.readFile(path.join(opath.dir, opath.base)));
        let readable = fs.createReadStream(path.join(opath.dir, opath.base));
        let writable = fs.createWriteStream(target);
        readable.pipe(writable);
    },
    getRelative(opath) {
        return path.relative(this.currentDir, path.join(opath.dir, opath.base));
    },
    getDistPath(opath, ext, src, dist) {
        let relative;
        src = src || cache.getSrc();
        dist = dist || cache.getDist();
        if (typeof(opath) === 'string')
            opath = path.parse(opath);
        ext = (ext ? (ext[0] === '.' ? ext : ('.' + ext)) : opath.ext);
        // 第三组件
        if (opath.dir.indexOf(`${path.sep}${src}${path.sep}`) === -1 && opath.dir.indexOf('node_modules') > 1) {
            relative = path.relative(path.join(this.currentDir, 'node_modules'), opath.dir);
            relative = path.join('npm', relative);
        } else {
            relative = path.relative(path.join(this.currentDir, src), opath.dir);
        }
        return path.join(this.currentDir, dist, relative, opath.name + ext);
    },
    getModifiedTime (p) {
        return this.isFile(p) ? +fs.statSync(p).mtime : false;
    },
    getConfig () {
        let config = cache.getConfig();
        if (config)
            return config;

        let configFile = path.join(this.currentDir, path.sep, 'wepy.config.js');
        let configType = 'js';

        if (!this.isFile(configFile)) {
            configFile = path.join(this.currentDir, path.sep, '.wepyrc');

            config = this.readFile(configFile);
            try {
                config = JSON.parse(config);
            } catch(e) {
                config = null;
            }
        } else {
            config = require(configFile);
        }

        cache.setConfig(config);
        return config;
    },
    getIgnore () {
        let ignoreFile = path.join(this.currentDir, path.sep, '.wepyignore');
        return this.isFile(ignoreFile) ? this.readFile(ignoreFile) : '';
    },
    getFiles (dir = process.cwd(), prefix = '') {
        let cfiles = cache.getFileList(dir);
        if (cfiles)
            return cfiles;
        dir = path.normalize(dir);
        if (!fs.existsSync(dir)) {
            return [];
        }
        let files = fs.readdirSync(dir);
        let rst = [];
        files.forEach((item) => {
            let filepath = dir + path.sep + item;
            let stat = fs.statSync(filepath);
            if (stat.isFile()) {
                rst.push(prefix + item);
            } else if(stat.isDirectory()){
                rst = rst.concat(this.getFiles(path.normalize(dir + path.sep + item),  path.normalize(prefix + item + path.sep)));
            }
        });

        cache.setFileList(dir, rst);
        return rst;
    },
    getVersion () {
        let filepath = path.resolve(__dirname, '../package.json');
        let version = JSON.parse(this.readFile(filepath)).version;
        return version;
    },
    datetime (date = new Date(), format = 'HH:mm:ss') {
        let fn = (d) => {
            return ('0' + d).slice(-2);
        };
        if (date && this.isString(date)) {
            date = new Date(Date.parse(date));
        }
        const formats = {
            YYYY: date.getFullYear(),
            MM: fn(date.getMonth() + 1),
            DD: fn(date.getDate()),
            HH: fn(date.getHours()),
            mm: fn(date.getMinutes()),
            ss: fn(date.getSeconds())
        };
        return format.replace(/([a-z])\1+/ig, function (a) {
            return formats[a] || a;
        });
    },
    error (msg) {
        this.log(msg, 'error', false);
    },
    warning (msg) {
        this.log(msg, 'warning', false);
    },
    log (msg, type, showTime = true) {
        let dateTime = showTime ? colors.gray(`[${this.datetime()}] `) : '';
        if(this.isObject(msg) || this.isArray(msg)){
            msg = JSON.stringify(msg);
        }
        if(type && this.isString(type)) {
            type = type.toUpperCase();
            if(type === 'ERROR'){
                console.error(colors.red('[Error] ' + msg));
                //console.log();
            } else if(type === 'WARNING'){
                console.error(colors.yellow('[WARNING] ' + msg));
                //console.log();
            } else {
                let fn = colors[type] ? colors[type] : colors['info'];
                console.log(dateTime + fn(`[${type}]`) + ' ' + msg);
            }
        } else {
            console.log(dateTime + msg);
        }
    },
    output (type, file, flag) {
        if (!flag) {
            flag = file.substr(file.lastIndexOf('.') + 1).toUpperCase();
            if (flag.length < 4) {
                let i = 4 - flag.length;
                while (i--) {
                    flag += ' ';
                }
            }
        }
        this.log(flag + ': ' + path.relative(this.currentDir, file), type);
    },
    genId (filepath) {
        if (!ID_CACHE[filepath]) {
            ID_CACHE[filepath] = '_' + hash(filepath).slice(1, 8);
        }
        return ID_CACHE[filepath];
    }
}
export default utils



