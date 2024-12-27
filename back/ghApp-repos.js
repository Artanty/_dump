
import dotenv from 'dotenv';
import express from 'express';
import { App } from 'octokit';
import handleError from './shared/handleError.js'
import getLast24HoursTime from './shared/getLast24HoursTime.js'
import validateRequest from './shared/validateRequest.js'

dotenv.config();
const app = express();
app.use(express.json());

const secretRepo = 'shared-secrets'
const secretName = 'WIRE_URL'
const appId = process.env.APP_ID;
const privateKey = process.env.PRIVATE_KEY//.replace(/\\n/g, '\n');
const PORT = process.env.PORT || 3000;
let found

app.get('/', (req, res) => {
  res.send("you shouldn't be here");
});
/**
 * @input
 * repo
 * branch.ref
 * commit-sha
 * state
 */
app.post('/get', async (req, res) => {
  found = false
  try {
    const { repo, branch, commit, state } = validateRequest(req.body)
    const app2 = new App({ appId, privateKey });
    
    for await (const { octokit, repository } of app2.eachRepository.iterator()) {
      if (found) {
        break;
      }
      if (repository.name === repo) {
        const last24hours = getLast24HoursTime();
        const commitsForLast24hours = await octokit.rest.repos.listCommits({
          since: last24hours,
          owner: repository.owner.login,
          repo: repository.name,
          sha: branch
        })
        if (!commitsForLast24hours.data.length){
          throw new Error('No commits for last 24 hours. You are liar, my dear!')
        }
        if (!commitsForLast24hours.data[0].sha) {
          throw new Error('Last commit has no sha. It\'s not good(')
        }
        if (commitsForLast24hours.data[0].sha !== commit) {
          throw new Error('Commits SHA doesn\'t match')
        }
        
        const fileResponse = await octokit.rest.repos.getContent({
          owner: repository.owner.login, // others not allowed
          repo: secretRepo,
          path: `${state}/${secretName}`
        });

        if (fileResponse.data.type === 'file' && fileResponse.data.content) {
          const content = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8');
          console.log(content);
          res.send(content);
        } else {
          res.status(404).send('File not found or content is empty');
        }
        found = true
      }
    }
    if (!found) {
      res.status(404).send('Repository not found');
    }
  } catch (error) {
    console.error('Error fetching file:', error);
    handleError(res, error)
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



