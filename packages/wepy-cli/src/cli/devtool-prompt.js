import util from '../util'

export const open = {
    path: {
        type: 'string',
        required: false,
        message: 'Project path',
        default: ''
    }
}

export const login = {
    format: {
        type: 'list',
        message: 'Pick a format way',
        choices: [
            {
              name: 'terminal (命令行输出)',
              value: 'terminal',
              short: 'terminal',
            },
            {
              name: 'base64',
              value: 'base64',
              short: 'base64',
            },
            {
              name: 'image',
              value: 'image',
              short: 'image',
            }
        ]
    },
    target: {
        type: 'string',
        required: false,
        message: 'Login qrcode output path',
        default: ''
    }
}

export const preview = {
    path: {
        type: 'string',
        required: false,
        message: 'Project path',
        default: ''
    },
    format: {
        type: 'list',
        message: 'Pick a format way',
        choices: [
            {
              name: 'terminal (命令行输出)',
              value: 'terminal',
              short: 'Terminal',
            },
            {
              name: 'base64',
              value: 'base64',
              short: 'Base64',
            },
            {
              name: 'image',
              value: 'image',
              short: 'Image',
            }
        ]
    },
    target: {
        type: 'string',
        required: false,
        message: 'Preview qrcode output path',
        default: ''
    }
}

export const upload = {
    version: {
        type: 'string',
        required: false,
        message: 'Upload Version',
        default: util.getProjectVersion() || '1.0.0'
    },
    path: {
        type: 'string',
        required: true,
        message: 'Project Path',
        default: util.currentDir
    },
    desc: {
        type: 'string',
        required: false,
        message: 'Upload Description ',
        default: 'release'
    }
}

export const test = {
    path: {
        type: 'string',
        required: true,
        message: 'Project Path',
        default: util.currentDir
    }
}
