/***
 * @input
 *  repo: '',
    branch: '',
    commit: '',
    state: ''
 */
export default function validateRequest(data) {

  const result = {
    repo: '',
    branch: '',
    commit: '',
    state: ''
  }

  if (!data.repo) {
    throw new Error('No repo provided')
  }

  result.repo = getStringAfterLastSlash(data.repo)

  if (!data.branch) {
    throw new Error('No branch provided')
  }

  result.branch = getStringAfterLastSlash(data.branch)

  if (!data.commit || data.commit.length !== 40) {
    throw new Error('Wrong commit format or commit not provided')
  }

  result.commit = data.commit

  if (!data.state) {
    throw new Error('No state provided')
  }

  result.state = data.state

  return result
}


function getStringAfterLastSlash(inputString) {
  const splittedArr = inputString.split('/')
  if (!splittedArr[1]) {
    throw new Error('Wrong format')
  }
  return splittedArr.pop()
}