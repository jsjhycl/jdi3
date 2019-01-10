import fs from 'fs';
import path from 'path';

let config = {
    profileDir: path.join(__dirname, '../data/profiles')
}

function getProfile(fileName: string) {
    return JSON.parse(fs.readFileSync(path.join(config.profileDir, fileName)).toString())
}

export {getProfile}