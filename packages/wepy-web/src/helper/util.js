/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


export const uuid = () => {
    const random = () => {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);  
    }
    return (random() + random() + '-' + random() + '-' + random() + '-' + random() + '-' + random() + random() + random());
}

export const numberValidator = (min, max) =>{
    return (v) => {
        let valid = true, num = Number(v);
        if (isNaN(num)) {
            valid = false;
        }
        if (min !== undefined) {
            valid = valid && num >= min;
        }
        if (max !== undefined) {
            valid = valid && num <= max;
        }
        return valid;
    };
};

export const stringToBoolean = () =>{
    return (v) => {
        if (typeof v === 'string' && (v === '0' || v === 'false'))
            return false;
        return !!v;
    };
};

    /**
     * Merge options from element
     * @param  {Element} elem           Dom element
     * @param  {Object} defaultOptions weapp component options
     * @return {Object}                Merged options
     */
    
export const merge = (elem, defaultOptions) =>{
    let o = {};
    for (let k in defaultOptions) {
        let val = elem.getAttribute(k);
        switch (defaultOptions[k].type) {
            case Boolean:
                val = !!val;
                break;
            case String:
                val = !val ? '' : (typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val));
                break;
            case Number:
                let n = parseFloat(val);
                val = isNaN(n) ? val : n;
        }
        o[k] = val ? val : defaultOptions[k].default;
    }
    return o;
}
export const wxCallback = (type, name, options, data) => {
    if (typeof options[type] === 'function') {
        setTimeout(() => {
            if (name === 'login') {
                options[type].call(window.wx, {errMsg: name + ':' + (type === 'fail' ? 'fail' : 'ok'), code: data.code, data: data});
            } else if (name === 'scanCode') {
                options[type].call(window.wx, {errMsg: name + ':' + (type === 'fail' ? 'fail' : 'ok'), result: data.result, charSet: 'utf-8', scanType: data.scanType});
            } else {
                options[type].call(window.wx, {errMsg: name + ':' + (type === 'fail' ? 'fail' : 'ok'), data: data});
            }
        }, 0);
    }
};
export const wxSuccess = (name, options, data) => {
    wxCallback('success', name, options, data);
    wxCallback('complete', name, options, data);
};
export const wxFail = (name, options, data) => {
    wxCallback('fail', name, options, data);
    wxCallback('complete', name, options, data);
}