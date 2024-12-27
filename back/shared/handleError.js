export default function handleError (res, e) {
  res.status(500).json(
    { 
      message: e instanceof Error ? e.message : String(e),
      error: true
    }
  )
}

// module.exports = handleError