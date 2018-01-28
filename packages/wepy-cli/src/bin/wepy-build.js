import compile from '../compile';

exports = module.exports = (program) => {

	if (compile.init(program)) {
	    compile.build(program);
	}

}