const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(bodyParser.json());

let data = null;

// Utility function to safely stringify objects with circular references
const safeStringify = (obj, indent = 2) => {
  let cache = [];
  const retVal = JSON.stringify(
    obj,
    (key, value) =>
      typeof value === 'object' && value !== null
        ? cache.includes(value)
          ? undefined // Duplicate reference found, discard key
          : cache.push(value) && value // Store value in our collection
        : value,
    indent
  );
  cache = null;
  return retVal;
};

app.post('/saveData', async (req, res) => {
  const { projectId, namespace, stage } = req.body;

  if (!projectId || !namespace || !stage) {
    return res.status(400).json({ error: 'no reqs' });
  }

  data = { projectId, namespace, stage };

  setTimeout(() => {
    data = null;
  }, 60000);

  res.status(200).json({ message: 'Data saved' });
});

app.post('/checkData', async (req, res) => {
  const { projectId, namespace, stage } = req.body;

  if (!projectId || !namespace || !stage) {
    return res.status(400).json({ error: 'no data' });
  }

  if (!data) {
    return res.status(404).json({ error: 'no data' });
  }

  if (data.projectId === projectId && data.namespace === namespace && data.stage === stage) {
    try {
      // Make a POST request to the external URL
      const externalResponse = await axios.post(process.env.SAFE_URL, {
        projectId: data.projectId,
        namespace: data.namespace,
        stage: data.stage
      });

      // Return the response from the external URL
      return res.status(200).json(externalResponse.data);
    } catch (error) {
      // Handle errors from the external request
      if (error.response) {
        // The request was made and the server responded with a status code
        return res.status(error.response.status).json({
          error: 'External server error',
          details: error.response.data
        });
      } else if (error.request) {
        return res.status(500).json({
          error: 'No response from external server',
          raw: error,
          details: {
            method: error.request.method,
            url: error.request.path,
            headers: error.request.headers
          }
        });
      } else {
        return res.status(500).json({
          error: 'Error setting up external request',
          details: safeStringify(error.message)
        });
      }
    }
  } else {
    return res.status(400).json({ error: 'data diff' });
  }
});

const PORT = process.env.PORT || 3034;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});