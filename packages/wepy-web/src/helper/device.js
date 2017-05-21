const MOBILE_DEVICE = ['android', 'iphone', 'symbianos', 'windows phone', 'ipad', 'ipod'];

export function system () {
    let ua = window.navigator.userAgent.toLowerCase();

    for (let i = 0; i < MOBILE_DEVICE.length; i++) {
        if (ua.indexOf(MOBILE_DEVICE[i]) !== -1) {
            switch (MOBILE_DEVICE[i]) {
                case 'iphone':
                    return 'mobile_iPhone';
                case 'symbianos':
                    return 'mobile_SymbianOS';
                case 'windows phone':
                    return 'mobile_WindowsPhone';
                case 'iPad':
                    return 'pad_iPad';
                case 'iPod':
                    return 'pad_iPod';
                case 'Android':
                    if (ua.indexOf('Mobile') !== -1) {
                        return 'mobile_Android';
                    } else {
                        return 'pad_Android';
                    }

            }
        }
    }

    let sys;

    if (ua.indexOf('nt 5.1') > -1) {
        sys = 'Windows xp';
    } else if (ua.indexOf('nt 6.1') > -1) {
        sys = 'Windows 7';
    } else if (ua.indexOf('nt 6.3') > -1) {
        sys = 'Windows 8';
    } else if (ua.indexOf('nt 10.0') > -1) {
        sys = 'Windows 10';
    } else if (ua.indexOf('nt 6.0') > -1) {
        sys = 'Windows Vista';
    } else if (ua.indexOf('nt 5.2') > -1) {
        sys = 'Windows 2003';
    } else if (ua.indexOf('nt 5.0') > -1) {
        sys = 'Windows 2000';
    } else if ((ua.indexOf('windows') !== -1 || ua.indexOf('win32') !== -1)) {
        sys = 'Windows';
    } else if ((ua.indexOf('macintosh') !== -1 || ua.indexOf('mac os x') !== -1)) {
        sys = 'Macintosh';
    } else if ((ua.indexOf('adobeair') !== -1)) {
        sys = 'Adobeair';
    } else {
        sys = 'Unknow';
    }

    return sys;
};

export function mobile () {
    let ua = window.navigator.userAgent.toLowerCase();
    return MOBILE_DEVICE.some(v => ua.indexOf(v) !== -1);
};

export function browser () {

};