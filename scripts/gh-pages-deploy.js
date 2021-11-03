const {execSync} = require("child_process");
const fs         = require("fs");
const chalk      = require("chalk");

const PAGES_BRANCH_NAME = 'gh-pages';
const MAIN_BRANCH_NAME  = 'main';

const runCommand = command => {
    console.log(command);
    execSync(command);
};

try {
    console.log(chalk.cyan('Deploy started'));

    console.log('\n' + chalk.cyan('Committing uncommitted changes'));
    runCommand('git add .');
    runCommand('git commit -m "Develop"');
    runCommand('git pull');
    runCommand('git push');

    console.log('\n' + chalk.cyan('Build project'));
    runCommand(`git checkout --orphan ${PAGES_BRANCH_NAME}`);
    runCommand('npm run build');

    const folderName = fs.existsSync('dist') ? 'dist' : 'build';
    console.log('\n' + chalk.cyan(`Commit ${folderName} directory`));
    runCommand(`git --work-tree ${folderName} add --all`);
    runCommand(`git --work-tree ${folderName} commit -m "GitHub pages deploy"`);

    console.log('\n' + chalk.cyan(`Pushing to ${PAGES_BRANCH_NAME}`));
    runCommand(`git push origin HEAD:${PAGES_BRANCH_NAME} --force`);

    console.log('\n' + chalk.cyan(`Return to ${MAIN_BRANCH_NAME} branch`));
    runCommand(`rm -rf ${folderName}`);
    runCommand(`git checkout -f ${MAIN_BRANCH_NAME}`);
    runCommand(`git branch -D ${PAGES_BRANCH_NAME}`);

    console.log('\n' + chalk.green('SUCCESSFULLY DEPLOYED'));
} catch (err) {
    console.log(chalk.red(err.message));
    process.exit(1);
}
