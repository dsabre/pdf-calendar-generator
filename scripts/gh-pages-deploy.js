const {execSync} = require("child_process");
const fs         = require("fs");
const chalk      = require("chalk");

const PAGES_BRANCH_NAME = 'gh-pages';
const MAIN_BRANCH_NAME = 'main';

const runCommand = command => {
    console.log(command);
    execSync(command);
};

try {
    console.log(chalk.cyan('Building started...'));

    runCommand(`git checkout --orphan ${PAGES_BRANCH_NAME}`);
    runCommand('npm run build');

    const folderName = fs.existsSync("dist") ? "dist" : "build";

    runCommand(`git --work-tree ${folderName} add --all`);
    runCommand(`git --work-tree ${folderName} commit -m "GitHub pages deploy"`);

    console.log(chalk.cyan(`Pushing to ${PAGES_BRANCH_NAME}...`));

    runCommand(`git push origin HEAD: ${PAGES_BRANCH_NAME} --force`);
    runCommand(`rm -rf ${folderName}`);
    runCommand(`git checkout -f ${MAIN_BRANCH_NAME}`);
    runCommand(`git branch -D  ${PAGES_BRANCH_NAME}`);

    console.log(chalk.green('Successfully deployed, check your settings'));
} catch (err) {
    console.log(err.message);
    process.exit(1);
}
