import less from 'less';
import path from 'path';

export default function (content, config, file) {
    return new Promise ((resolve, reject) => {
        let opath = path.parse(file);
        config.paths = [opath.dir];

        less.render(content, config).then(res => {
            resolve(res.css);
        }).catch(reject);
    });
};