import stylus from 'stylus';

export default function (content, config, file) {
    return new Promise ((resolve, reject) => {
        config.filename = file.name;
        config.paths = [file.dir];

        stylus.render(content, config, function (err, css) {
            if (err) reject(err);
            else {
                resolve(css);
            }
        });
    });
};
