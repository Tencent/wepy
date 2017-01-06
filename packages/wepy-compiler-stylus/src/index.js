import stylus from 'stylus';
import path from 'path';

export default function (content, config, file) {
    return new Promise ((resolve, reject) => {
        let opath = path.parse(file);
        config.paths = [opath.dir];
        config.filename = opath.base;

        stylus.render(content, config, function (err, css) {
            if (err) reject(err);
            else {
                resolve(css);
            }
        });
    });
};
