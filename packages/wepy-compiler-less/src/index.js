import less from 'less';

export default function (content, config, file) {
    return new Promise ((resolve, reject) => {
        config.paths = [file.dir];

        less.render(content, config).then(res => {
            resolve(res.css);
        }).catch(reject);
    });
};