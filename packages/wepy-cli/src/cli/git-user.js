import { execSync } from 'child_process';

export default function getGitUser () {
    let name;
    let email;

    try {
        name = execSync('git config --get user.name');
        email = execSync('git config --get user.email');
    } catch (e) {}

    name = name && name.toString().trim();
    email = email && (' <' + email.toString().trim() + '>');
    return (name || '') + (email || '');
}