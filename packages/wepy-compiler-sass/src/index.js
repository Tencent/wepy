import sass from 'node-sass';

export default function (content, config, file) {
    return new Promise ((resolve, reject) => {
        config.data = content;
        config.file = file;
        sass.render(config, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res.css);
            }
        });
    });
};