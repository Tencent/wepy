import postcss from 'postcss';
import scopeId from './scope-id';

export default function scopedHandler (id, content, cb) {
  return postcss([scopeId(id)])
    .process(content)
    .then(function (result) {
      cb(null, result.css)
    })
    .catch(function (e) {
      cb(e)
    })
}